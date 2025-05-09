import React from "react";
import { View } from "react-native";
import GroupForm from "./GroupForm";
import SectionHeader from "@/src/components/common/SectionHeader";

const GroupFormScreen = ({ navigation, route }) => {
  const updateData = route.params;

  return (
    <View className="bg-white min-h-screen">
      <SectionHeader
        title={`${updateData ? "Update" : "Add"} Product Metal`}
        navigation={navigation}
      />
      <View className="px-4 py-5">
        <GroupForm navigation={navigation} route={route} />
      </View>
    </View>
  );
};

export default GroupFormScreen;
