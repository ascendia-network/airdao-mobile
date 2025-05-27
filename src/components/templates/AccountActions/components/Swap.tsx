import { useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { HomeNavigationProp } from '@appTypes';
import { BottomSheetRef } from '@components/composite';
import { SwapAccountActionIcon } from '@components/svg/icons/v2/actions';
import { useBrowserStore } from '@entities/browser/model';
import { BottomSheetBrowserModal } from '@features/browser/components/templates';
import { ProductSequence } from '@features/products/utils';
import {
  CustomAppEvents,
  sendFirebaseEvent
} from '@lib/firebaseEventAnalytics';
import { isIos } from '@utils';
import { AccountActionButton } from './ActionButton';

interface SwapActionProps {
  readonly disabled: () => boolean;
}

export const Swap = ({ disabled }: SwapActionProps) => {
  const { t } = useTranslation();
  const { browserConfig } = useBrowserStore();
  const navigation = useNavigation<HomeNavigationProp>();
  const disclaimerModalRef = useRef<BottomSheetRef>(null);

  const navigateToSwap = () => {
    if (isIos) {
      const swapItem = browserConfig.products.find(
        (item) => (item.id = ProductSequence.Astra)
      );
      const navigateToAstra = (uri: string) => {
        navigation.navigate('BrowserScreen', { uri });
      };

      if (swapItem && swapItem?.uri) {
        disclaimerModalRef?.current?.show({
          title: t('browser.disclaimer.header'),
          subTitle: t('browser.disclaimer.description'),
          buttonsLabels: [t('button.cancel'), t('button.processed')],
          onApprove: () => navigateToAstra(swapItem.uri)
        });
      }
    } else {
      sendFirebaseEvent(CustomAppEvents.main_swap);
      navigation.navigate('SwapScreen');
    }
  };

  return (
    <>
      <AccountActionButton
        Icon={({ color }) => <SwapAccountActionIcon color={color} />}
        onPress={navigateToSwap}
        text={t('token.actions.swap')}
        isActive={disabled()}
      />

      <BottomSheetBrowserModal ref={disclaimerModalRef} />
    </>
  );
};
