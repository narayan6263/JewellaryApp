import React, { Fragment } from "react";
import { TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const AddUser = ({ navigation }) => {
  const { navigate } = navigation;
  return (
    <Fragment>
      <TouchableOpacity
        activeOpacity={0.6}
        onPress={() => navigate("UserList")}
        className="bg-primary w-[58px] h-[58px] flex justify-center items-center rounded-full absolute bottom-[95px] shadow-xl z-50 right-4"
      >
        <MaterialCommunityIcons name="contacts" color="white" size={30} />
      </TouchableOpacity>
    </Fragment>
  );
};

export default AddUser;
