import React from "react";
import { SafeAreaView } from "react-native";
import ShopInfo from "../components/ShopInfo";
import SectionHeader from "@/src/components/common/SectionHeader";

const BussinessInfoScreen = ({ navigation }) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <SectionHeader title="Bussiness Profile" navigation={navigation} />
      <ShopInfo btnTitle="Update" navigation={navigation} />
    </SafeAreaView>
  );
};

export default BussinessInfoScreen;
