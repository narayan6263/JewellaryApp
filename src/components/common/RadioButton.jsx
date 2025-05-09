import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Fontisto from "@expo/vector-icons/Fontisto";

const RadioButton = ({ checked, label, onChange }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={onChange}
      className="flex-row items-center gap-1.5"
    >
      <Fontisto
        name={checked ? "radio-btn-active" : "radio-btn-passive"}
        className="text-primary"
        size={17}
      />
      <Text className="text-base">{label}</Text>
    </TouchableOpacity>
  );
};

export default RadioButton;
