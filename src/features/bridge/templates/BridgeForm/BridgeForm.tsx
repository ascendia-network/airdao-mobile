import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, LayoutChangeEvent, View, ViewStyle } from 'react-native';
import { BigNumber, BigNumberish, ethers } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useTranslation } from 'react-i18next';

import { Spacer, Spinner, Text } from '@components/base';
import { BottomSheetRef } from '@components/composite';
import { PrimaryButton } from '@components/modular';
import { InputWithTokenSelect } from '@components/templates';
import { COLORS } from '@constants/colors';
import { AccountDBModel } from '@database';
import { useWalletStore } from '@entities/wallet';
import {
  BRIDGE_ERROR_CODES,
  DEFAULT_TRANSACTION,
  EMPTY_FEE_DATA
} from '@features/bridge/constants';
import { useBridgeContextData } from '@features/bridge/context';
import { BottomSheetBridgePreview } from '@features/bridge/templates/BottomSheetBridgePreview/BottomSheetBridgePreview';
import { TokenSelectData } from '@features/bridge/templates/BridgeForm/components/TokenSelectData/TokenSelectData';
import { getAllBridgeTokenBalance } from '@lib';
import { getAllBridgeFees } from '@lib/bridgeSDK/bridgeFunctions/getAllBridgeFees';
import { Config, FeeData } from '@lib/bridgeSDK/models/types';

import {
  CustomAppEvents,
  sendFirebaseEvent
} from '@lib/firebaseEventAnalytics';
import { PreviewDataWithFeeModel, Tokens } from '@models/Bridge';
import { isAndroid, NumberUtils, verticalScale } from '@utils';
import { styles } from './styles';

export const BridgeForm = () => {
  const { wallet: selectedWallet } = useWalletStore();

  const [previewLoader, setPreviewLoader] = useState(false);
  const [isNullInput, setIsNullInput] = useState(true);
  const [disabledComponentStyle, setDisabledComponentStyle] =
    useState<ViewStyle>({
      width: 0,
      height: 0
    });
  const previewRef = useRef<BottomSheetRef>(null);
  const tokenSelectRef = useRef<BottomSheetRef>(null);
  const { t } = useTranslation();

  const { variables, methods } = useBridgeContextData();
  const {
    selectedTokenFrom,
    selectedTokenDestination,
    selectedTokenPairs,
    templateDataLoader,
    amountToBridge,
    bridgeConfig,
    networkNativeToken,
    bridgePreviewData,
    fromData,
    destinationData,
    selectedBridgeData,
    processBridge,
    transactionsOnLoop
  } = variables;
  const {
    setBridgePreviewData,
    setTemplateDataLoader,
    setAmountToBridge,
    setSelectedTokenPairs,
    setProcessingTransaction,
    setSelectedBridgeData,
    setTransactionsOnLoop,
    bridgeErrorHandler
  } = methods;

  const error = useMemo(() => {
    if (!selectedTokenPairs || amountToBridge.trim() === '') return false;

    const bnInputBalance = selectedTokenFrom.balance;
    const bnAmount = parseUnits(amountToBridge, selectedTokenFrom.decimals);

    return bnAmount.gt(bnInputBalance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTokenPairs, amountToBridge]);

  const disabledButton = useMemo(() => {
    return !amountToBridge || error || templateDataLoader || isNullInput;
  }, [amountToBridge, error, isNullInput, templateDataLoader]);

  const onTokenSelect = (tokenPair: Tokens[]) => {
    // @ts-ignore
    setSelectedTokenPairs(tokenPair);
    tokenSelectRef?.current?.dismiss();
  };

  const decimals = useMemo(
    () =>
      fromData.value.id === 'amb'
        ? selectedTokenDestination.decimals
        : selectedTokenFrom.decimals,
    [
      fromData.value.id,
      selectedTokenDestination.decimals,
      selectedTokenFrom.decimals
    ]
  );

  const parseBridgePreviewData = useCallback(
    (feeData: FeeData, gasFee: BigNumberish) => {
      return [
        {
          name: t('bridge.preview.receive'),
          crypto: {
            amount: feeData?.amount ?? BigNumber.from(0),
            decimals
          },
          symbol: selectedTokenFrom.symbol
        },
        {
          name: t('bridge.preview.bridge.fee'),
          crypto: {
            amount: feeData.bridgeFee,
            decimals: networkNativeToken?.decimals || 18
          },
          symbol: networkNativeToken.symbol
        },
        {
          name: t('bridge.preview.network.fee'),
          crypto: {
            amount: feeData?.transferFee ?? BigNumber.from(0),
            decimals: networkNativeToken?.decimals || 18
          },
          symbol: networkNativeToken.symbol
        },
        {
          name: t('bridge.preview.gas.fee'),
          crypto: {
            amount: gasFee,
            decimals: networkNativeToken?.decimals || 18
          },
          symbol: networkNativeToken.symbol
        }
      ];
    },
    [
      decimals,
      networkNativeToken?.decimals,
      networkNativeToken.symbol,
      selectedTokenFrom.symbol,
      t
    ]
  );
  const defaultSetter = useCallback(() => {
    setPreviewLoader(false);
    setProcessingTransaction(null);
  }, [setProcessingTransaction]);
  const setDefaultOptions = useCallback(() => {
    setTimeout(() => {
      defaultSetter();
    }, 200);
  }, [defaultSetter]);

  const goToPreview = useCallback(async () => {
    Keyboard.dismiss();
    setDefaultOptions();

    const isMax =
      amountToBridge ===
        NumberUtils.limitDecimalCount(
          ethers.utils.formatUnits(
            // @ts-ignore
            selectedTokenFrom?.balance?._hex,
            selectedTokenFrom.decimals
          ),
          selectedTokenFrom.decimals ?? 18
          // @ts-ignore
        ) && selectedTokenPairs[0]?.isNativeCoin;
    try {
      setTemplateDataLoader(true);

      if (
        transactionsOnLoop.some(
          (transaction) => transaction.address === selectedWallet?.address
        )
      ) {
        throw new Error(BRIDGE_ERROR_CODES.TRANSACTION_ON_PROCESS);
      }

      const { gasFee, feeData } = await getAllBridgeFees({
        isMax,
        bridgeConfig: bridgeConfig as Config,
        fromNetwork: fromData.value.id,
        selectedTokenFrom,
        amountToBridge,
        selectedTokenDestination,
        selectedWallet: selectedWallet as AccountDBModel
      });

      if (feeData && gasFee) {
        // @ts-ignore
        const dataToPreview = parseBridgePreviewData(feeData, gasFee);
        const data = {
          value: {
            feeData,
            gasFee
          },
          dataToPreview
        };
        // @ts-ignore
        setBridgePreviewData(data);
        previewRef?.current?.show();
      }
    } catch (e) {
      bridgeErrorHandler(e);
    } finally {
      setTimeout(() => setTemplateDataLoader(false), 500);
    }
  }, [
    amountToBridge,
    bridgeConfig,
    bridgeErrorHandler,
    fromData.value.id,
    parseBridgePreviewData,
    selectedTokenDestination,
    selectedTokenFrom,
    selectedTokenPairs,
    selectedWallet,
    setBridgePreviewData,
    setDefaultOptions,
    setTemplateDataLoader,
    transactionsOnLoop
  ]);

  const onClose = useCallback(async () => {
    if (previewLoader) return;
    if (selectedBridgeData && selectedWallet?.address) {
      getAllBridgeTokenBalance(
        selectedBridgeData?.pairs,
        fromData.value.id,
        selectedWallet?.address
      ).then((pairs) => {
        setSelectedBridgeData({
          // @ts-ignore
          ...selectedBridgeData,
          ...pairs
        });
      });
    }

    setDefaultOptions();
    previewRef?.current?.dismiss();
  }, [
    fromData.value.id,
    previewLoader,
    selectedBridgeData,
    selectedWallet?.address,
    setDefaultOptions,
    setSelectedBridgeData
  ]);

  // @ts-ignore
  const bridgePreviewDataRef = useRef<PreviewDataWithFeeModel>(EMPTY_FEE_DATA);

  useEffect(() => {
    if (bridgePreviewData) {
      bridgePreviewDataRef.current = bridgePreviewData;
    }
  }, [bridgePreviewData]);

  const onAcceptPress = useCallback(async () => {
    if (!bridgePreviewDataRef.current?.value) return;
    setPreviewLoader(true);
    if (
      !transactionsOnLoop.some(
        (item) => item.address === selectedWallet?.address
      )
    ) {
      setTransactionsOnLoop((prevState) => [
        ...prevState,
        {
          address: selectedWallet?.address as string,
          timestamp: Date.now(),
          feeData: bridgePreviewDataRef.current?.value.feeData
        }
      ]);
      processBridge(bridgePreviewDataRef.current.value.feeData)
        .then((transaction) => {
          if (transaction) {
            sendFirebaseEvent(CustomAppEvents.bridge_finish);
            const transactionWaitingInfo = {
              ...DEFAULT_TRANSACTION,
              networkFrom: fromData.value.name,
              networkTo: destinationData.value.name,
              tokenFrom: selectedTokenFrom,
              tokenTo: selectedTokenDestination,
              amount: +ethers.utils.formatUnits(
                bridgePreviewDataRef.current?.value.feeData.transferFee,
                selectedTokenFrom.decimals
              ),
              decimalAmount: amountToBridge,
              denominatedAmount: amountToBridge,
              fee: ethers.utils.formatUnits(
                bridgePreviewDataRef.current?.value.feeData.transferFee,
                selectedTokenFrom.decimals
              ),
              wait: transaction?.wait
            };
            if (transaction.from === selectedWallet?.address) {
              setProcessingTransaction(transactionWaitingInfo);
            }
          } else {
            throw new Error('unknown bridge response');
          }
        })
        .catch((e) => {
          setTransactionsOnLoop((prevState) =>
            prevState.filter(
              (transaction) => transaction.address !== selectedWallet?.address
            )
          );

          onClose().then();
          bridgeErrorHandler(e);
        })
        .finally(() => {
          setPreviewLoader(false);
          setAmountToBridge('');
        });
    }
  }, [
    amountToBridge,
    bridgeErrorHandler,
    destinationData.value.name,
    fromData.value.name,
    onClose,
    processBridge,
    selectedTokenDestination,
    selectedTokenFrom,
    selectedWallet?.address,
    setAmountToBridge,
    setProcessingTransaction,
    setTransactionsOnLoop,
    transactionsOnLoop
  ]);

  const onInputWrapperLayout = (event: LayoutChangeEvent) => {
    const { width, height: _height } = event.nativeEvent.layout;
    setDisabledComponentStyle({
      width,
      height: _height * 0.9
    });
  };

  const onChangeText = (value: string) => {
    setIsNullInput(+value <= 0);
    setAmountToBridge(value);
  };

  return (
    <View style={styles.container}>
      <View
        onLayout={onInputWrapperLayout}
        style={styles.inputContainerWitHeading}
      >
        {templateDataLoader && (
          <View
            style={{
              ...styles.disabledInputContainer,
              ...disabledComponentStyle
            }}
          />
        )}
        <InputWithTokenSelect
          ref={tokenSelectRef}
          title={t('bridge.select.assets')}
          value={amountToBridge}
          label={t('bridge.set.amount')}
          // @ts-ignore
          token={selectedTokenFrom}
          tokenDecimal={selectedTokenFrom.decimals}
          bottomSheetNode={<TokenSelectData onPressItem={onTokenSelect} />}
          onChangeText={onChangeText}
          onPressMaxAmount={() => {
            // do nothing
          }}
        />
      </View>

      <PrimaryButton
        style={styles.button}
        onPress={goToPreview}
        disabled={disabledButton}
      >
        {templateDataLoader ? (
          <Spinner />
        ) : (
          <Text color={disabledButton ? COLORS.brand300 : COLORS.neutral0}>
            {error
              ? t('bridge.insufficient.funds')
              : t(isNullInput ? 'button.enter.amount' : 'common.review')}
          </Text>
        )}
      </PrimaryButton>
      <Spacer value={verticalScale(isAndroid ? 30 : 0)} />
      <BottomSheetBridgePreview
        ref={previewRef}
        onClose={onClose}
        onAcceptPress={onAcceptPress}
        previewLoader={previewLoader}
        bridgePreviewData={bridgePreviewData}
      />
    </View>
  );
};
