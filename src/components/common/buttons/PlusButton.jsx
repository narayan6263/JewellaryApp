import React from "react";
import { TouchableOpacity } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const PlusButton = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-primary w-[60px] h-[60px] flex justify-center items-center rounded-full absolute bottom-[45px] right-8 shadow-xl z-50"
    >
      <FontAwesome6 name="plus" size={25} color="white" />
    </TouchableOpacity>
  );
};

export default PlusButton;
