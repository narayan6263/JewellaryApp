import React from "react";
import { Text, TouchableOpacity, ActivityIndicator, View } from "react-native";

const CommonButton = (props) => {
  const { onPress, title, loading, isFilled = true } = props;
  return (
    <TouchableOpacity
      disabled={loading}
      activeOpacity={0.6}
      onPress={loading ? null : onPress}
    >
      <View
        className={`${
          isFilled
            ? loading
              ? "bg-primary/80"
              : "bg-primary"
            : "bg-transparent"
        } border border-primary rounded-lg py-2.5 px-3`}
      >
        {loading ? (
          <ActivityIndicator color="white" size={20} className="text-center" />
        ) : (
          <Text
            className={`${
              isFilled ? "text-white" : "text-primary"
            } uppercase  text-center tracking-wider font-medium`}
          >
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CommonButton;
