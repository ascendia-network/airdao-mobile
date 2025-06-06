import { StyleSheet } from 'react-native';
import { contentBox } from '@components/styles';
import { COLORS } from '@constants/colors';
import { scale } from '@utils';

export const styles = StyleSheet.create({
  container: {
    ...contentBox,
    backgroundColor: COLORS.neutral0
  },
  textStyle: {
    color: COLORS.neutral900,
    fontSize: scale(14)
  }
});
