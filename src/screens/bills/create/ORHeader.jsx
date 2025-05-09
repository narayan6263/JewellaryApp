import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";

const ORHeader = ({ title, navigation, onNext, showBack = true, showNext = true }) => {
  return (
    <View className="flex-row items-center justify-between bg-white px-4 py-3 border-b border-gray-200">
      <View className="flex-row items-center">
        {showBack && (
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <FontAwesome6 name="arrow-left" size={18} color="#666" />
          </TouchableOpacity>
        )}
        <Text className="text-lg font-semibold">{title}</Text>
      </View>
      
      {showNext && (
        <TouchableOpacity 
          onPress={onNext}
          className="bg-primary px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Next</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ORHeader; 