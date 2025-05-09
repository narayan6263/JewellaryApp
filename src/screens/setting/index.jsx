import React, { Fragment, useCallback } from "react";
import { BackHandler, Alert, Text, TouchableOpacity, View } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import SectionHeader from "@/src/components/common/SectionHeader";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "expo-router";
import { handleLogout } from "@/src/utils";

const SettingScreen = ({ navigation }) => {
  const { navigate } = navigation;

  // Confirmation alert for logout
  const confirmLogout = () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        onPress: () => null,
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => handleLogout(navigate("Auth")), // Call the logout function
        style: "destructive",
      },
    ]);
  };

  // Handle the back button press
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

  return (
    <Fragment>
      <SectionHeader title="App Setting" navigation={navigation} />
      {/* General Setting */}
      <View className="border-b border-gray-4 p-6">
        <Text className="text-primary mb-5 px-12 font-semibold tracking-wider">
          General
        </Text>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => navigate("BussinessInfoScreen")}
          className="flex flex-row items-center gap-6"
        >
          <MaterialCommunityIcons
            name="card-account-details"
            size={26}
            color="#5750F1"
          />
          <Text className="text-base tracking-wider">Bussiness Address</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => navigate("ManageGroupsScreen")}
          className="flex flex-row pt-4 items-center gap-6"
        >
          <FontAwesome5 name="layer-group" size={25} color="#5750F1" />
          <Text className="text-base tracking-wider">Product Metals</Text>
        </TouchableOpacity>
      </View>

      {/* Security Setting */}
      <View className="border-b border-gray-4 p-6">
        <Text className="text-primary mb-5 px-12 font-semibold tracking-wider">
          Security
        </Text>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => navigate("ManageMPINScreen")}
          className="flex flex-row mb-4 items-center gap-5"
        >
          <MaterialIcons name="password" size={28} color="#5750F1" />
          <Text className="text-base tracking-wider">MPIN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={confirmLogout} // Trigger the logout confirmation alert
          className="flex flex-row items-center gap-5"
        >
          <MaterialIcons name="logout" size={26} color="#f44336" />
          <Text className="text-base tracking-wider">Logout</Text>
        </TouchableOpacity>
      </View>
    </Fragment>
  );
};

export default SettingScreen;
