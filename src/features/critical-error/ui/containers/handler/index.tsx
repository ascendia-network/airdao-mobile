import { useCallback, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { BottomSheetRef } from '@components/composite';
import { delay } from '@utils';
import { ANIMATION_TIMINGS } from '../../../constants';
import { useErrorStore } from '../../../model/store';
import { CriticalErrorBottomSheet } from '../../components/bottom-sheet';

export const CriticalErrorHandler: React.FC = () => {
  const localRef = useRef<BottomSheetRef>(null);
  const isClosingRef = useRef(false);
  const isMountedRef = useRef(true);
  const navigation = useNavigation();
  const { error, clearError } = useErrorStore();

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const handleError = async () => {
      if (error && isMountedRef.current) {
        if (localRef.current) {
          localRef.current.show();
        }
        await delay(ANIMATION_TIMINGS.ERROR_DISPLAY_DURATION);

        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'HomeScreen' }]
            })
          );
        }
      }
    };
    handleError();
  }, [error, navigation]);

  const executeCloseSequence = useCallback(async () => {
    if (isClosingRef.current) {
      return;
    }

    isClosingRef.current = true;

    if (localRef.current) {
      localRef.current.dismiss();
    }

    await delay(ANIMATION_TIMINGS.BOTTOM_SHEET_DISMISS);
    clearError();

    isClosingRef.current = false;
  }, [clearError]);

  const handleClose = useCallback(() => {
    if (!error) {
      return;
    }

    executeCloseSequence();
  }, [error, executeCloseSequence]);

  const handleBackPress = useCallback(() => {
    if (error) {
      handleClose();
      return true;
    }
    return false;
  }, [error, handleClose]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );
    return () => backHandler.remove();
  }, [handleBackPress]);

  if (!error) {
    return null;
  }

  return (
    <CriticalErrorBottomSheet
      title={error.title}
      message={error.message}
      ref={localRef}
      onClose={handleClose}
    />
  );
};
