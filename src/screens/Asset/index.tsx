import { useCallback, useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ethers } from 'ethers';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CryptoCurrencyCode, HomeParamsList } from '@appTypes';
import { Button, Row, Spacer, Text } from '@components/base';
import { Header } from '@components/composite';
import { TokenLogo } from '@components/modular';
import { ChartIcon } from '@components/svg/icons/v2';
import { AccountTransactions } from '@components/templates';
import { COLORS } from '@constants/colors';
import { AssetsAccountActionsList } from '@features/wallet-assets/components/modular';
import {
  useAMBPrice,
  useERC20Balance,
  useTokensAndTransactions,
  useUSDPrice
} from '@hooks';
import { useTransactionsOfToken } from '@hooks/query/useTransactionsOfToken';
import { Token } from '@models';
import {
  StringUtils,
  StringValidators,
  NumberUtils,
  scale,
  verticalScale,
  getTokenNameFromDatabase
} from '@utils';
import { styles } from './styles';

type Props = NativeStackScreenProps<HomeParamsList, 'AssetScreen'>;

export const AssetScreen = ({ route, navigation }: Props) => {
  const {
    params: { tokenInfo, walletAccount }
  } = route;

  const { data: ambPriceData } = useAMBPrice();

  const { balance: bnTokenBalance, refetch: refetchTokenBalance } =
    useERC20Balance(
      tokenInfo.address === walletAccount
        ? ethers.constants.AddressZero
        : tokenInfo.address,
      walletAccount
    );

  const {
    data: tokensAndTransactions,
    fetchNextPage: fetchNextPageAddress,
    loading: tokensAndTransactionsLoading,
    refetch: refetchTokensAndTransactions,
    hasNextPage: hasNextPageOfAddress
  } = useTokensAndTransactions(
    walletAccount,
    1,
    20,
    !!walletAccount && walletAccount === tokenInfo.address
  );

  const {
    data: transactions,
    loading: transactionsLoading,
    fetchNextPage: fetchNextPageToken,
    hasNextPage: hasNextPageOfToken,
    refetch: refetchTransactions
  } = useTransactionsOfToken(
    walletAccount,
    tokenInfo.address,
    1,
    20,
    !!walletAccount &&
      !!tokenInfo.address &&
      walletAccount !== tokenInfo.address
  );

  const percentChange24H = ambPriceData?.percentChange24H || 0;
  const usdPrice = useUSDPrice(tokenInfo.balance.ether || 0, tokenInfo.symbol);
  const isAMBToken = walletAccount === tokenInfo.address;
  const hasNextPage = isAMBToken ? hasNextPageOfAddress : hasNextPageOfToken;
  const fetchNextPage = isAMBToken ? fetchNextPageAddress : fetchNextPageToken;

  const navigateToAMBScreen = useCallback(
    () => navigation.navigate('AMBMarketScreen'),
    [navigation]
  );

  const tokenNameOrAddress = useMemo(() => {
    const { symbol, address } = tokenInfo;
    const isAddress = StringValidators.isStringAddress(symbol);

    if (symbol && !isAddress) {
      return symbol;
    }

    return StringUtils.formatAddress(address, 5, 6);
  }, [tokenInfo]);

  const tokenLogoHref = useMemo(() => {
    if (tokenInfo.symbol === CryptoCurrencyCode.AMB) {
      return 'AirDAO';
    }

    return getTokenNameFromDatabase(tokenInfo.address) !== 'unknown'
      ? tokenInfo.symbol
      : tokenInfo.address;
  }, [tokenInfo.address, tokenInfo.symbol]);

  const renderHeaderTitleComponent = useMemo(() => {
    return (
      <Row alignItems="center">
        <View>
          <TokenLogo scale={0.7} token={tokenLogoHref} />
        </View>
        <Spacer horizontal value={scale(4)} />
        <Text
          fontSize={20}
          fontFamily="Inter_600SemiBold"
          color={COLORS.neutral800}
        >
          {tokenNameOrAddress}
        </Text>
      </Row>
    );
  }, [tokenLogoHref, tokenNameOrAddress]);

  const renderHeaderRightComponent = useMemo(
    () =>
      tokenInfo.name === 'AirDAO' && (
        <Button onPress={navigateToAMBScreen}>
          <ChartIcon color={COLORS.neutral500} />
        </Button>
      ),
    [navigateToAMBScreen, tokenInfo.name]
  );

  const isTransactionsLoading = useMemo(
    () => transactionsLoading || tokensAndTransactionsLoading,
    [tokensAndTransactionsLoading, transactionsLoading]
  );

  const txs = useMemo(
    () =>
      walletAccount === tokenInfo.address
        ? tokensAndTransactions.transactions
        : transactions,
    [
      tokenInfo.address,
      tokensAndTransactions.transactions,
      transactions,
      walletAccount
    ]
  );

  const updateTokenBalance = useCallback(
    (balance: ethers.BigNumber) => {
      const parsedBalance = ethers.utils.formatUnits(
        balance,
        tokenInfo.decimals
      );
      const formattedNumber = +parsedBalance;

      if (formattedNumber !== +tokenInfo.balance.formattedBalance) {
        const updatedTokenInfo = {
          ...(tokenInfo as Omit<Token, 'deriveNameAndSymbolFromDto'>),
          balance: {
            wei: balance.toString(),
            formattedBalance: parsedBalance,
            ether: formattedNumber
          }
        };
        navigation.setParams({ tokenInfo: updatedTokenInfo as Token });
      }
    },
    [navigation, tokenInfo]
  );

  useEffect(() => {
    if (bnTokenBalance) {
      updateTokenBalance(bnTokenBalance);
    }
  }, [bnTokenBalance, updateTokenBalance]);

  const onRefresh = useCallback(() => {
    typeof refetchTokenBalance === 'function' && refetchTokenBalance();

    if (walletAccount === tokenInfo.address) {
      typeof refetchTokensAndTransactions === 'function' &&
        refetchTokensAndTransactions();
    } else {
      typeof refetchTransactions === 'function' && refetchTransactions();
    }
  }, [
    refetchTokenBalance,
    refetchTokensAndTransactions,
    refetchTransactions,
    tokenInfo.address,
    walletAccount
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        bottomBorder
        style={styles.headerContentRightContainer}
        title={renderHeaderTitleComponent}
        contentRight={renderHeaderRightComponent}
      />
      <Spacer value={verticalScale(16)} />
      <View style={styles.innerContainer}>
        <View style={styles.accountDetails}>
          <Text
            fontSize={15}
            fontFamily="Inter_600SemiBold"
            color={COLORS.neutral500}
          >
            {StringUtils.formatAddress(walletAccount, 5, 5)}
          </Text>

          <Text
            fontSize={22}
            fontFamily="Inter_700Bold"
            color={COLORS.neutral800}
            letterSpacing={-0.31}
          >
            {NumberUtils.numberToTransformedLocale(
              tokenInfo.balance.formattedBalance
            )}{' '}
            {tokenInfo.symbol}
          </Text>

          <Row style={styles.accountDetailsFooter} alignItems="center">
            {!Number.isNaN(usdPrice) && (
              <Text
                fontSize={16}
                fontFamily="Inter_500Medium"
                color={COLORS.neutral800}
              >
                ${NumberUtils.numberToTransformedLocale(usdPrice)}
              </Text>
            )}
            <Text
              fontSize={14}
              fontFamily="Inter_500Medium"
              color={percentChange24H > 0 ? COLORS.success400 : COLORS.error400}
            >
              {NumberUtils.addSignToNumber(percentChange24H)}% (24hr)
            </Text>
          </Row>
        </View>
        <View style={styles.actionsContainer}>
          <AssetsAccountActionsList address={walletAccount} token={tokenInfo} />
        </View>

        <View style={styles.transactions}>
          <AccountTransactions
            transactions={txs}
            listStyle={styles.transactionsList}
            onRefresh={onRefresh}
            containerStyle={styles.transactionsContainer}
            loading={isTransactionsLoading}
            onEndReached={() => hasNextPage && fetchNextPage()}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
