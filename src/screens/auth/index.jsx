import React, { useCallback, useEffect, useState } from "react";
import LoginForm from "./forms/LogIn";
import SignUpForm from "./forms/SignUp";
import MPINScreen from "./forms/MPIN";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  BackHandler,
} from "react-native";
import { getToken } from "@/src/utils/api";
import { useFocusEffect } from "expo-router";
import KeyboardHanlder from "@/src/components/common/KeyboardHanlder";

const AuthScreen = ({ navigation }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // If use wants to exist from app then ask
  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        Alert.alert("Hold on!", "Are you sure you want to exit the app?", [
          {
            text: "Cancel",
            onPress: () => null,
            style: "cancel",
          },
          { text: "YES", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      // Add event listener for back button press on Android
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      // Clean up the event listener when the component is unfocused
      return () => backHandler.remove();
    }, [])
  );

  // Fetch token when component mounts
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await getToken();
        setIsLoggedIn(token?.is_mpin); // Set isLoggedIn to true if token exists
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardHanlder>
        <View className="flex px-4 pt-[110px]">
          {/* logo */}
          <View>
            <View className="bg-primary/90 w-24 mb-2 h-24 mx-auto p-1 justify-center rounded-full">
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

          {/* forms */}
          {isLoggedIn ? (
            <View className="w-full px-4">
              <Text className="text-lg font-semibold mb-4 tracking-widest text-gray-5">
                Enter MPIN
              </Text>
              <MPINScreen navigation={navigation} />
            </View>
          ) : (
            <View className="w-full px-4">
              <Text className="text-lg font-semibold mb-4 tracking-widest text-gray-5">
                {isLogin ? "Login to your Account" : "Create your Account"}
              </Text>
              {isLogin ? (
                <LoginForm navigation={navigation} />
              ) : (
                <SignUpForm navigation={navigation} />
              )}

              {/* Switch Form */}
              <TouchableOpacity
                className="mt-6"
                onPress={() => setIsLogin(!isLogin)}
                activeOpacity={0.6}
              >
                <Text className="text-primary text-center">
                  {isLogin
                    ? "Don't have an account? Sign Up"
                    : "Already have an account? Log In"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardHanlder>
    </SafeAreaView>
  );
};

export default AuthScreen;
