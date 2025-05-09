import React, { memo } from "react";
import { Text, TextInput, View } from "react-native";

const OutlineInput = ({
  name,
  label,
  icon,
  readOnly,
  multiLine = false,
  value,
  error,
  placeholder,
  required,
  onChange,
  ...other
}) => {
  return (
    <View>
      {/* label */}
      {label && (
        <Text className="text-gray-6 tracking-wide font-medium">{label}</Text>
      )}

      {/* input field */}
      <View
        className={`border-b ${
          error
            ? "border-red-600"
            : readOnly
            ? "border-gray-3"
            : "border-gray-5"
        } items-center flex flex-row justify-between ${icon && "pr-4"}`}
      >
        <TextInput
          className={`text-black ${icon ? "w-[85%] pr-0" : ""}`}
          readOnly={readOnly}
          multiline={multiLine}
          placeholder={placeholder || label}
          value={typeof value == "number" ? String(value) : value}
          onChangeText={(value) => onChange({ value, name })}
          {...other}
        />
        {icon}
      </View>
    </View>
  );
};

export default memo(OutlineInput);
