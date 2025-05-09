import React from "react";
import { Switch } from "react-native";

const ToggleSwitch = ({ onChange, value = false, name }) => {
  const toggleSwitch = () => onChange(name, !value);

  return (
    <Switch
      trackColor={{ false: "#767577", true: "#c6c6ff" }}
      thumbColor={value ? "#5750F1" : "#f4f3f4"}
      ios_backgroundColor="#3e3e3e"
      onValueChange={toggleSwitch}
      value={value}
    />
  );
};

export default ToggleSwitch;
