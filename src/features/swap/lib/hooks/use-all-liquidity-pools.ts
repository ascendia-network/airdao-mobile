import { useCallback } from 'react';
import { Alert } from 'react-native';
import { ethers } from 'ethers';
import { useSwapContextSelector } from '@features/swap/context';
import { PAIR } from '@features/swap/lib/abi';
import { SelectedTokensState } from '@features/swap/types';
import { wrapNativeAddress } from '@features/swap/utils';
import {
  createAMBProvider,
  createFactoryContract
} from '@features/swap/utils/contracts/instances';

export function useAllLiquidityPools() {
  const { setPairs, allPairsRef, setIsPoolsLoading } = useSwapContextSelector();

  const getAllPoolsCount = useCallback(async () => {
    setIsPoolsLoading(true);
    const results = [];
    try {
      const contract = createFactoryContract();
      const pairCount = await contract.allPairsLength();
      const totalPairs = Number(pairCount);

      const batchSize = 50;
      let allPairs: Array<{
        pairAddress: string;
        token0: string;
        token1: string;
      }> = [];

      for (
        let batchStart = 0;
        batchStart < totalPairs;
        batchStart += batchSize
      ) {
        const batchEnd = Math.min(batchStart + batchSize, totalPairs);

        const batchPromises = Array.from(
          { length: batchEnd - batchStart },
          async (_, index) => {
            const i = batchStart + index;
            try {
              const pairAddress = await contract.allPairs(i);
              const pairContract = new ethers.Contract(
                pairAddress,
                PAIR,
                createAMBProvider()
              );

              const [token0, token1] = await Promise.all([
                pairContract.token0(),
                pairContract.token1()
              ]);

              return {
                pairAddress,
                token0: token0.toLowerCase(),
                token1: token1.toLowerCase()
              };
            } catch (error) {
              if (__DEV__) {
                Alert.alert(
                  `Error fetching pair at index ${i}:`,
                  JSON.stringify(error)
                );
              }

              return null;
            }
          }
        );

        const batchResults = await Promise.all(batchPromises);

        const validResults = batchResults.filter(
          (
            result
          ): result is {
            pairAddress: string;
            token0: string;
            token1: string;
          } => result !== null
        );

        allPairs = [...allPairs, ...validResults];
        results.push(...validResults);

        setPairs(allPairs);
      }

      if (__DEV__) {
        Alert.alert(
          'Successfully loaded liquidity pools',
          `Successfully loaded ${allPairs.length} of ${totalPairs} pairs`
        );
      }

      return allPairs;
    } catch (error) {
      if (__DEV__) {
        Alert.alert(
          'Error fetching liquidity pools count:',
          JSON.stringify(error)
        );
      }

      if (results.length > 0) {
        return results;
      }

      return allPairsRef.current;
    } finally {
      setIsPoolsLoading(false);
    }
  }, [setPairs, setIsPoolsLoading, allPairsRef]);

  const getPairAddress = useCallback(
    (selectedTokens: SelectedTokensState) => {
      const { TOKEN_A, TOKEN_B } = selectedTokens;
      if (TOKEN_A && TOKEN_B) {
        const [addressFrom, addressTo] = wrapNativeAddress([
          TOKEN_A?.address ?? '',
          TOKEN_B?.address ?? ''
        ]);

        const targetSet = new Set([
          addressFrom.toLowerCase(),
          addressTo.toLowerCase()
        ]);

        return allPairsRef.current.find((pair) => {
          const pairSet = new Set([
            pair.token0.toLowerCase(),
            pair.token1.toLowerCase()
          ]);
          return (
            targetSet.size === pairSet.size &&
            [...targetSet].every((value) => pairSet.has(value))
          );
        });
      }
    },
    [allPairsRef]
  );

  const getReserves = useCallback(
    async (pairAddress: string, selectedTokens: SelectedTokensState) => {
      const mapper = getPairAddress(selectedTokens);
      const pair = new ethers.Contract(pairAddress, PAIR, createAMBProvider());
      const reserves = await pair.getReserves();

      const { TOKEN_A, TOKEN_B } = selectedTokens;

      const [addressFrom, addressTo] = wrapNativeAddress([
        TOKEN_A?.address ?? '',
        TOKEN_B?.address ?? ''
      ]);

      const isTokenAFirst =
        mapper?.token0 === addressFrom && mapper?.token1 === addressTo;

      const reserveIn = isTokenAFirst ? reserves[0] : reserves[1];
      const reserveOut = isTokenAFirst ? reserves[1] : reserves[0];

      return { reserveIn, reserveOut };
    },
    [getPairAddress]
  );

  return {
    getAllPoolsCount,
    getPairAddress,
    getReserves
  };
}
