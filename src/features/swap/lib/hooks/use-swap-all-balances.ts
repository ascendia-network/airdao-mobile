import { useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import Config from '@constants/config';
import { useRodeoTokensListQuery } from '@entities/amb-rodeo-tokens/lib';
import { useWalletStore } from '@entities/wallet';
import { useSwapContextSelector } from '@features/swap/context';
import { initialBalances, transformTokensObject } from '@features/swap/utils';
import { batchFetchTokenBalances } from '../contracts';

export function useSwapAllBalances() {
  const { wallet } = useWalletStore();
  const { balances, setBalances, setBalancesLoading } =
    useSwapContextSelector();

  const { tokens } = useRodeoTokensListQuery();
  const fetchInProgress = useRef(false);

  const fetchAllBalances = useCallback(async () => {
    if (!wallet?.address || fetchInProgress.current) return;

    fetchInProgress.current = true;
    const isInitialBalance =
      JSON.stringify(balances) === JSON.stringify(initialBalances);

    try {
      setBalancesLoading(isInitialBalance);

      // Split tokens into priority tokens (common tokens) and other tokens
      // This ensures users see their most important balances first
      const commonTokenSymbols = ['AMB', 'SAMB', 'USDT', 'USDC'];

      const allTokens = transformTokensObject(tokens);
      const priorityTokens = allTokens.filter((token) =>
        commonTokenSymbols.includes(token.symbol)
      );

      const otherTokens = Config.SWAP_TOKENS.filter(
        (token) => !commonTokenSymbols.includes(token.symbol)
      );

      let nonNullBalances: Record<string, ethers.BigNumber>[] = [];

      // Process priority tokens first to show important balances quickly
      if (priorityTokens.length > 0) {
        const priorityBalances = await batchFetchTokenBalances(
          priorityTokens,
          wallet.address
        );

        const priorityResults = Object.entries(priorityBalances).map(
          ([address, balance]) => ({ [address]: balance })
        );

        nonNullBalances = [...nonNullBalances, ...priorityResults];
        setBalances(nonNullBalances);
      }

      // Process remaining tokens in a single batch with multicall
      if (otherTokens.length > 0) {
        const otherBalances = await batchFetchTokenBalances(
          otherTokens,
          wallet.address
        );

        const otherResults = Object.entries(otherBalances).map(
          ([address, balance]) => ({ [address]: balance })
        );

        nonNullBalances = [...nonNullBalances, ...otherResults];
        setBalances(nonNullBalances);
      }
    } catch (error) {
      console.error('Error in fetchAllBalances:', error);
    } finally {
      setBalancesLoading(false);
      fetchInProgress.current = false;
    }
  }, [balances, setBalances, setBalancesLoading, tokens, wallet?.address]);

  return { balances, fetchAllBalances };
}
