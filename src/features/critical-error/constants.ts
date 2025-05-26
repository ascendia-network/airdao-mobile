import { Platform } from 'react-native';

export const ANIMATION_TIMINGS = {
  ERROR_DISPLAY_DURATION: 500,
  BOTTOM_SHEET_DISMISS: Platform.OS === 'ios' ? 300 : 200
} as const;
