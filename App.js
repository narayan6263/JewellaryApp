import React, { useCallback, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import Navigations from './src/Navigations';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { useFonts } from 'expo-font';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const App = () => {
  const [fontsLoaded] = useFonts({
    // Add any custom fonts here if needed
  });

  useEffect(() => {
    // Prepare app resources here if needed
    async function prepare() {
      try {
        // Pre-load any data or resources here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Minimum splash screen time
      } catch (e) {
        console.warn(e);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Provider store={store}>
        <Navigations />
      </Provider>
    </View>
  );
};

export default App; 