import { StyleSheet } from 'react-native';
import { DEVICE_HEIGHT } from '@constants/variables';
import { scale } from '@utils';

export const styles = StyleSheet.create({
  bottomSheet: {
    paddingHorizontal: scale(12),
    paddingTop: DEVICE_HEIGHT * 0.2,
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
    borderRadius: scale(24)
  }
});
