import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';
import { moderateScale, scale, verticalScale } from '@utils';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral0
  },
  header: {
    shadowColor: 'transparent'
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: '10%'
  },
  body: {
    backgroundColor: COLORS.neutral0,
    borderRadius: moderateScale(24),
    paddingHorizontal: scale(24),
    marginTop: verticalScale(25)
  }
});
