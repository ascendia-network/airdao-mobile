import { StyleSheet } from 'react-native';
import { scale, verticalScale } from '@utils';

export const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  list: {
    flexGrow: 1,
    paddingTop: verticalScale(16),
    paddingBottom: '20%',
    paddingHorizontal: scale(15.5)
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loader: {
    flex: 0.9,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottomSheetHeader: {
    shadowColor: 'transparent',
    zIndex: 1000
  }
});
