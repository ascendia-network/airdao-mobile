import { useRef, useState } from 'react';
import {
  NavigationContainer,
  NavigationContainerRef
} from '@react-navigation/native';
import { RootStackParamsList } from '@appTypes';
import { StatusBar } from '@components/templates';
import { navTheme } from '@constants/navTheme';
import { NavigationProvider } from '@contexts/Navigation';
import { CriticalErrorHandler } from '@features/critical-error';
import { RootStack } from './stacks/RootStack';

const Navigation = () => {
  const [currentRoute, setCurrentRoute] = useState('AppInit');
  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamsList>>(null);
  const routeNameRef = useRef('');
  const onNavigationReady = () => {
    const currentRoute = navigationRef.current?.getCurrentRoute();
    if (currentRoute) {
      routeNameRef.current = currentRoute.name;
    }
  };

  const onStateChange = () => {
    const currentRoute = navigationRef.current?.getCurrentRoute();
    if (currentRoute) {
      const currentRouteName = currentRoute.name;
      // Save the current route name for later comparison
      routeNameRef.current = currentRouteName;
      setCurrentRoute(currentRouteName);
    }
  };

  return (
    <NavigationContainer
      theme={navTheme}
      ref={navigationRef}
      onReady={onNavigationReady}
      onStateChange={onStateChange}
    >
      {/* @ts-ignore */}
      <NavigationProvider currentRoute={currentRoute}>
        <StatusBar />
        <RootStack />
        <CriticalErrorHandler />
      </NavigationProvider>
    </NavigationContainer>
  );
};

export default Navigation;
