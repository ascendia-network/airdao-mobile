import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';
import { scale, verticalScale } from '@utils';

export const styles = StyleSheet.create({
  bottomSheetContainer: { paddingBottom: verticalScale(24) },
  icon: {
    alignSelf: 'center',
    paddingTop: 16
  },
  text: {
    marginTop: verticalScale(24),
    marginHorizontal: scale(24),
    textAlign: 'center'
  },
  removeButton: {
    backgroundColor: COLORS.error100,
    marginHorizontal: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center'
  },
  bottomSheetCancelButton: {
    backgroundColor: COLORS.alphaBlack5,
    borderRadius: 25,
    marginHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center'
  }
});
