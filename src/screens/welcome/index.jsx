import React, { useEffect } from 'react';
import { Text, View, Image } from 'react-native';

// Set delay for splash screen (in seconds)
const SPLASH_DELAY = 1.5;

const WalkthroughScreen = ({ navigation }) => {
  useEffect(() => {
    let timer = setTimeout(() => {
      // Always navigate to AuthDecisionScreen which will handle all auth logic
      navigation.replace('AuthDecisionScreen');
    }, SPLASH_DELAY * 1000);

    // Clean up timer
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <View className="bg-primary/90 w-32 mb-3 h-32 mx-auto p-1 justify-center rounded-full">
        <Image
          source={require("@/assets/images/icon.png")} // Add your logo path
          className="w-full h-full"
          resizeMode="contain"
        />
      </View>
      <Text className="text-xl font-bold tracking-widest uppercase mb-12 text-center text-gray-6">
        <Text className="text-primary/90">Tanishq</Text> Jwellers
      </Text>
    </View>
  );
};

export default WalkthroughScreen;
