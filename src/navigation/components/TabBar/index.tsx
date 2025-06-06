import { useLayoutEffect, useMemo, useState } from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCurrentRoute } from '@contexts/Navigation/Navigation.context';
import {
  CustomAppEvents,
  sendFirebaseEvent
} from '@lib/firebaseEventAnalytics';
import { MAIN_TABS } from '@navigation/constants';
import { scale, verticalScale, NavigationUtils } from '@utils';
import { styles } from './styles';

type LabelType =
  | 'Settings'
  | 'Products'
  | 'Wallets'
  | 'StakeAMB'
  | 'StakeHBR'
  | 'BorrowHarbor';

interface TabBarModel extends BottomTabBarProps {
  isHarbor?: boolean;
}

interface TabBarMethodModel {
  tabs: Record<
    string,
    { activeIcon: React.ReactNode; inactiveIcon: React.ReactNode }
  >;
  visibility: (tab: string) => boolean;
}

const MainMethods: TabBarMethodModel = {
  tabs: MAIN_TABS,
  visibility: NavigationUtils.getTabBarVisibility
};

const TabBar = ({ state, navigation, isHarbor = false }: TabBarModel) => {
  const bottomSafeArea = useSafeAreaInsets().bottom;
  const tabsMethods = useMemo(() => MainMethods, []);

  const currentRoute = useCurrentRoute();
  const tabBarVisible = tabsMethods.visibility(currentRoute);
  const [isReady, setIsReady] = useState(false);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = tabBarVisible ? 1 : 0;
    return {
      opacity: withTiming(opacity, { duration: 200 })
    };
  });

  useLayoutEffect(() => {
    setIsReady(true);
  }, []);

  useFocusEffect(() => {
    // Reset the tab bar animation when it gains focus
    animatedStyle.opacity = withTiming(1, { duration: 200 });
  });

  const bottomContainerStyle: StyleProp<ViewStyle> = useMemo(() => {
    if (bottomSafeArea === 0) {
      return { ...styles.mainItemContainer, marginTop: 8, marginBottom: 16 };
    }

    return {
      ...styles.mainItemContainer,
      marginVertical: 8
    };
  }, [bottomSafeArea]);

  if (!isReady || !tabBarVisible) return <></>;

  return (
    <Animated.View
      style={[
        styles.mainContainer,
        {
          paddingBottom: bottomSafeArea
        },
        animatedStyle
      ]}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const icon =
          tabsMethods.tabs[route.name as LabelType][
            isFocused ? 'activeIcon' : 'inactiveIcon'
          ];

        const onPress = () => {
          // @ts-ignore
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key
          });

          if (!isFocused && !event.defaultPrevented) {
            if (route.name === 'Portfolio') {
              sendFirebaseEvent(CustomAppEvents.watchlist_page);
            }
            if (route.name === 'Search') {
              sendFirebaseEvent(CustomAppEvents.explorer_page);
            }
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={index}
            hitSlop={scale(24)}
            style={[
              bottomContainerStyle,
              {
                paddingTop: isHarbor ? 8 : verticalScale(index === 1 ? 8 : 17)
              }
            ]}
            onPress={onPress}
          >
            {icon}
          </Pressable>
        );
      })}
    </Animated.View>
  );
};

export default TabBar;
