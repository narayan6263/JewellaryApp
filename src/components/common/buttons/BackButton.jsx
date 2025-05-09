import React from "react";
import { TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

const BackButton = ({ onPress, color }) => {
  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
      <AntDesign name="arrowleft" color={color || ""} size={25} />
    </TouchableOpacity>
  );
};

export default BackButton;
