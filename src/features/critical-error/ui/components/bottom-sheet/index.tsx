import { ForwardedRef, forwardRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BottomSheet,
  BottomSheetProps,
  BottomSheetRef
} from '@components/composite';
import { AlertModalTemplate } from '@components/templates';
import { useForwardedRef } from '@hooks';
import { delay } from '@utils';
import { styles } from './styles';

interface CriticalErrorProps {
  visible?: boolean;
  title: string;
  message?: string;
  onClose?: () => void;
}

export const CriticalErrorBottomSheet = forwardRef<
  BottomSheetRef,
  BottomSheetProps & CriticalErrorProps
>((props, ref) => {
  const { visible, title, message, onClose, ...restProps } = props;
  const localRef: ForwardedRef<BottomSheetRef> = useForwardedRef(ref);
  const { t } = useTranslation();

  useEffect(() => {
    if (visible && localRef.current) {
      localRef.current.show();
    }
  }, [localRef, visible]);

  const onButtonPress = async () => {
    localRef.current?.dismiss();
    await delay(200);
    if (onClose) {
      onClose();
    }
  };

  return (
    <BottomSheet
      onClose={onClose}
      ref={localRef}
      onCustomCrossPress={onClose}
      containerStyle={styles.bottomSheet}
      swiperIconVisible={false}
      swipingEnabled={false}
      height={'100%'}
      {...restProps}
    >
      <AlertModalTemplate
        title={title || t('common.error')}
        subTitle={message || t('common.error.critical')}
        buttonsLabels={[t('wallet.connect.button.approve'), '']}
        onApprove={onButtonPress}
        onReject={onButtonPress}
      />
    </BottomSheet>
  );
});
