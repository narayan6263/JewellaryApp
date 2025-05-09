import React from "react";
import { View, Text } from "react-native";

const Avatar = ({ title }) => {
  return (
    <View className="w-[50px] h-[50px] rounded-full bg-primary flex justify-center items-center">
      <Text className="text-white uppercase text-xl font-medium">{title}</Text>
    </View>
  );
};

export default Avatar;
