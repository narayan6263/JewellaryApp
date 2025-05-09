import React, { useState } from "react";
import BarCodeScan from "./BarCodeScan";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { TouchableOpacity, Text, TextInput, View } from "react-native";
import SearchBtn from "@/src/components/common/buttons/SearchBtn";

const TopBar = ({ navigation }) => {
  const [initialState, setInitialState] = useState({ isSearch: false });
  const handleInitialState = (value) =>
    setInitialState({ ...initialState, ...value });

  return (
    <View className="bg-primary shadow-lg p-4 py-6">
      {/* Icons & Search Box */}
      {initialState.isSearch ? (
        <View className="flew border-b pb-[6px] border-white bg-transprent flex-row items-center">
          <TextInput
            placeholder="Search Barcode ..."
            placeholderTextColor="lightgray"
            className="max-w-[340px] w-full text-lg pl-3 text-white placeholder:text-white"
          />
          <TouchableOpacity activeOpacity={0.6} className="px-2.5">
            <AntDesign
              name="close"
              color="white"
              size={24}
              onPress={() => handleInitialState({ isSearch: false })}
            />
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex flex-row justify-between items-center">
          <TouchableOpacity
            onPress={() => navigation.navigate("MetalRates")}
            className="rounded-full flex-row flex"
          >
            <Text
              style={{ backgroundColor: "gold" }}
              className="px-4 rounded-tl-3xl rounded-bl-3xl py-1.5 uppercase font-medium tracking-wider"
            >
              GOLD
            </Text>
            <Text
              style={{ backgroundColor: "whitesmoke" }}
              className="px-4 py-1.5 rounded-tr-3xl rounded-br-3xl uppercase font-medium tracking-wider"
            >
              Silver
            </Text>
          </TouchableOpacity>
          {/* add metal */}
          <TouchableOpacity
            onPress={() => navigation.navigate("NewGroupScreen")}
            className="ml-1.5"
          >
            <AntDesign name="plus" color="white" size={20} />
          </TouchableOpacity>
          <View className="flew ml-auto flex-row items-center">
            {/* Order/Repair Icon */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Inventory")}
              activeOpacity={0.7}
              className="ml-5 items-center"
            >
              <MaterialCommunityIcons name="clipboard-text-clock" color="white" size={28} />
              <Text className="text-white text-[10px] mt-0.5 font-medium">O/R Inventory</Text>
            </TouchableOpacity>
            {/* Groups Icon */}
            <TouchableOpacity
              onPress={() => navigation.navigate("GroupsScreen")}
              activeOpacity={0.7}
              className="ml-5 items-center"
            >
              <MaterialIcons name="groups" color="white" size={28} />
              <Text className="text-white text-[10px] mt-0.5 font-medium">Groups</Text>
            </TouchableOpacity>
            {/* Settings Icon */}
            <TouchableOpacity
              onPress={() => navigation.navigate("Setting")}
              activeOpacity={0.6}
              className="ml-5"
            >
              <FontAwesome name="gear" color="white" size={25} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default TopBar;
