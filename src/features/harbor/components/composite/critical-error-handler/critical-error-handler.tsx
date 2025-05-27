import { useCallback, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { BottomSheetRef } from '@components/composite';
import { useGlobalErrorStore } from '@entities/global-error/global-error-store';
import { BottomSheetCriticalError } from '@features/harbor/components/templates/bottom-sheet-critical-error';
import { delay } from '@utils';

export const CriticalErrorHandler: React.FC = () => {
  const localRef = useRef<BottomSheetRef>(null);
  const isClosingRef = useRef(false);
  const navigation = useNavigation();
  const { error, clearError } = useGlobalErrorStore();

  useEffect(() => {
    if (error && localRef.current) {
      localRef.current.show();
    }
  }, [error]);

  const handleClose = useCallback(async () => {
    // Prevent multiple close attempts
    if (isClosingRef.current) {
      return;
    }
    if (!error) {
      return;
    }
    try {
      isClosingRef.current = true;
      if (localRef.current) {
        localRef.current.dismiss();
      }
      // Wait for animation
      await delay(200);
      clearError();
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
    } finally {
      // Reset the closing state
      isClosingRef.current = false;
    }
  }, [clearError, navigation, error]);

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
    <BottomSheetCriticalError
      title={error.title || ''}
      message={error.message || ''}
      ref={localRef}
      onClose={handleClose}
    />
  );
};
