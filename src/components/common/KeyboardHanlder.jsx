import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

const KeyboardHanlder = ({ children }) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="pb-[65px]">{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default KeyboardHanlder;
