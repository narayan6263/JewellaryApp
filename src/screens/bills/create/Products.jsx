import React from "react";
import { SafeAreaView, View } from "react-native";
import ProductForm from "../../products/components/ProductForm";

const Products = ({
  navigation,
  route,
  formValue,
  setFormValue,
  handleInputChange,
}) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ProductForm
        route={route}
        navigation={navigation}
        isFromInvoice={true}
        invoiceHandler={{ formValue, setFormValue, handleInputChange }}
      />
    </SafeAreaView>
  );
};

export default Products;
