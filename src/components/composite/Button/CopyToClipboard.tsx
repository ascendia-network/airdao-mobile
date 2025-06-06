import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { Button, Row, Spacer, Text } from '@components/base';
import { BaseButtonProps } from '@components/base/Button';
import { TextProps } from '@components/base/Text/Text.types';
import {
  Toast,
  ToastOptions,
  ToastPosition,
  ToastType
} from '@components/modular/Toast';
import { IconProps } from '@components/svg/icons';
import {
  CheckboxCircleFill,
  ClipboardFillIcon
} from '@components/svg/icons/v2';
import { CopyIconV2 } from '@components/svg/icons/v2/settings';
import { COLORS } from '@constants/colors';
import { scale } from '@utils';

export interface CopyToClipboardButtonProps
  extends Omit<BaseButtonProps, 'onPress'> {
  textToDisplay: string;
  textToCopy?: string;
  textProps?: TextProps;
  successText?: string;
  successTextProps?: TextProps;
  successContainerStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  iconProps?: IconProps;
  iconContainerStyle?: ViewStyle;
  toastProps?: Pick<ToastOptions, 'position'>;
  showToast?: boolean;
  copiedTextWrapperStyle?: ViewStyle;
  pressableText?: boolean;
  disableWhenCopied?: boolean;
}

export const CopyToClipboardButton = (
  props: CopyToClipboardButtonProps
): JSX.Element => {
  const {
    textToDisplay,
    textToCopy,
    textProps,
    iconContainerStyle,
    iconProps,
    toastProps,
    showToast = false,
    successText,
    successTextProps,
    successContainerStyle,
    containerStyle,
    pressableText = false,
    disableWhenCopied = false,
    copiedTextWrapperStyle,
    ...buttonProps
  } = props;
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const timeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  const onPress = async () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    setCopied(true);
    if (showToast) {
      Toast.show({
        text: t('common.copied'),
        position: ToastPosition.Top,
        type: ToastType.Success,
        ...toastProps
      });
    }
    await Clipboard.setStringAsync(textToCopy || textToDisplay);
    timeout.current = setTimeout(() => {
      setCopied(false);
    }, 2500);
  };

  const buttonMainStyle: StyleProp<ViewStyle> = useMemo(() => {
    return copied ? { ...successContainerStyle } : { ...containerStyle };
  }, [containerStyle, copied, successContainerStyle]);

  if (pressableText) {
    return (
      <Button
        {...buttonProps}
        disabled={disableWhenCopied && copied}
        style={{
          padding: 4,
          alignItems: 'center',
          ...buttonMainStyle
        }}
        onPress={onPress}
      >
        <Row alignItems="center" style={{ minHeight: 20 }}>
          <View style={{ ...iconContainerStyle, marginRight: scale(5) }}>
            {copied ? (
              <CheckboxCircleFill />
            ) : (
              <CopyIconV2 color={COLORS.brand500} />
            )}
          </View>
          {copied ? (
            <Text {...successTextProps}>
              {t(successText || t('common.copied'))}
            </Text>
          ) : (
            <Text {...textProps}>{textToDisplay}</Text>
          )}
        </Row>
      </Button>
    );
  }

  return (
    <Row alignItems="center" style={{ minHeight: 20 }}>
      <Text {...textProps}>{textToDisplay}</Text>
      <Spacer horizontal value={scale(16)} />
      <Button {...buttonProps} onPress={onPress}>
        {showToast || !copied ? (
          <ClipboardFillIcon {...iconProps} />
        ) : (
          <View style={copiedTextWrapperStyle}>
            <Text {...successTextProps}>
              {t(successText || t('common.copied'))}
            </Text>
          </View>
        )}
      </Button>
    </Row>
  );
};
