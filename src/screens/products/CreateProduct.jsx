import React from "react";
import { SafeAreaView } from "react-native";
import ProductForm from "./components/ProductForm";
import SectionHeader from "@/src/components/common/SectionHeader";

const CreateProduct = ({ navigation, route }) => {
  const updateData = route.params;
  return (
    <SafeAreaView className="flex-1 bg-white">
      <SectionHeader
        title={`${updateData ? "Update" : "Create"} Product`}
        navigation={navigation}
      />
      <ProductForm navigation={navigation} route={route} />
    </SafeAreaView>
  );
};

export default CreateProduct;
