import { StyleSheet } from 'react-native';
import { COLORS } from '@constants/colors';
import { moderateScale, scale, verticalScale } from '@utils';

export const styles = StyleSheet.create({
  main: { flex: 1 },
  mnemonicRandom: {
    backgroundColor: COLORS.neutral100,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(8),
    borderWidth: 1,
    borderColor: COLORS.neutral200,
    borderRadius: 1000
  },
  mnemoicRandomPhrase: { width: scale(100) },
  header: {
    shadowColor: COLORS.transparent,
    borderBottomWidth: 1,
    borderColor: COLORS.neutral900Alpha['5']
  },
  container: {
    flex: 1,
    justifyContent: 'space-between'
  },
  selectedMnemonicContainer: {
    paddingVertical: 16,
    backgroundColor: COLORS.alphaBlack5,
    borderColor: COLORS.neutral200,
    borderWidth: 1,
    marginHorizontal: scale(16),
    borderRadius: moderateScale(16)
  },
  mnemoicContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 20,
    width: scale(342),
    height: 142,
    alignSelf: 'center',
    alignItems: 'center',
    columnGap: scale(14)
  },
  createText: { paddingHorizontal: 30 },
  button: {
    position: 'relative',
    flexDirection: 'row',
    height: verticalScale(50),
    width: '90%',
    alignSelf: 'center',
    paddingVertical: verticalScale(12)
  },
  mnemonicSelected: {
    paddingHorizontal: scale(16),
    height: 20,
    flexDirection: 'row',
    alignItems: 'center'
  }
});
