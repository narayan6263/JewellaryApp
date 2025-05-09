import React from "react";
import { Text, View } from "react-native";

const NoData = ({ title }) => {
  return (
    <View className="p-5 flex justify-center items-center">
      <Text className="text-center lowercase text-gray-6 tracking-wider text-xl">
        No {title} found
      </Text>
    </View>
  );
};

export default NoData;
