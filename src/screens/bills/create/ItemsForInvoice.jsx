import React, { useState, useEffect } from "react";
import { currency } from "@/src/contants";
import AntDesign from "@expo/vector-icons/AntDesign";
import CommonButton from "@/src/components/common/buttons/CommonButton";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { handleDigitsFix } from "@/src/utils";
import ORHeader from "./ORHeader";

const ItemsForInvoice = ({
  navigation,
  route,
  onFormValueChange,
  onProductRemove,
}) => {
  const [localFormValue, setLocalFormValue] = useState(route.params?.formValue || {
    selectedProduct: [],
    totalPrice: "0"
  });
  const { isPurchase, handleInputChange } = route.params;

  // Update local form value when route params change
  useEffect(() => {
    if (route.params?.formValue) {
      console.log("New form value received:", route.params.formValue);
      setLocalFormValue(prev => ({
        ...prev,
        ...route.params.formValue,
        selectedProduct: route.params.formValue.selectedProduct || []
      }));
    }
  }, [route.params?.formValue]);

  // Remove selected product
  const removeProduct = (id) => {
    console.log("Removing product with id:", id);

    // Filter out the product with matching id
    const newProducts = localFormValue?.selectedProduct?.filter(
      (product) => product.product_id !== id && product.id !== id
    );

    // Recalculate total price after removing product
    const totalPrice = newProducts.reduce(
      (acc, product) => {
        const typeData = product[isPurchase ? "purchase" : "sale"] || {};
        return Number(acc) + Number(typeData.net_price || 0);
      },
      0
    );

    // Update both local and parent form values
    const updatedFormValue = {
      ...localFormValue,
      selectedProduct: newProducts,
      totalPrice: totalPrice.toString()
    };

    setLocalFormValue(updatedFormValue);
    if (onFormValueChange) {
      onFormValueChange(updatedFormValue);
    }
  };

  // Handle next button click
  const handleNext = () => {
    if (!localFormValue?.selectedProduct?.length) {
      alert("Please add at least one product");
      return;
    }

    navigation.navigate("ORExtras", {
      formValue: localFormValue,
      setFormValue: route.params?.setFormValue,
      isPurchase,
      handleInputChange
    });
  };

  // Check if there are products in the form value
  const isProducts = localFormValue?.selectedProduct && localFormValue.selectedProduct.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ORHeader
        title="Items"
        navigation={navigation}
        onNext={handleNext}
      />

      <View className="flex-1">
        {/* Products Table */}
        <View className="flex-1">
          {/* Table Header */}
          <View className="flex-row border-l border-y border-gray-300 bg-gray-200">
            {["Name", "Size", "Rate", "Weight", "Amount"].map((item) => (
              <View
                key={item}
                className="flex-1 py-2 px-1 border-r border-gray-300"
              >
                <Text className="text-[10px] font-medium text-center">
                  {item}
                </Text>
              </View>
            ))}
            <View className="border-r py-2 px-5 border-gray-300"></View>
          </View>

          {/* Table Body */}
          {isProducts ? (
            <View>
              {localFormValue.selectedProduct.map((item, index) => {
                const typeData = item[isPurchase ? "purchase" : "sale"] || {};

                return (
                  <View
                    key={item.product_id || item.id || index}
                    className="flex flex-row border-b items-center justify-between border-gray-300"
                  >
                    <Text className="flex-1 border-r border-gray-300 text-[10px] tracking-wider py-2 text-center text-gray-600">
                      {item.name || "Unknown Product"}
                    </Text>
                    <Text className="flex-1 border-r border-gray-300 text-[10px] tracking-wider py-2 text-center text-gray-600">
                      {item.size || "-"}
                    </Text>
                    <Text className="flex-1 border-r border-gray-300 text-[10px] tracking-wider py-2 text-center text-gray-600">
                      {currency} {typeof typeData.rate === 'object'
                        ? (typeData.rate?.price || 0)
                        : (typeData.rate || 0)}
                    </Text>
                    <Text className="flex-1 border-r border-gray-300 text-[10px] tracking-wider py-2 text-center text-gray-600">
                      {typeData.gross_weight || 0} g
                    </Text>
                    <Text className="flex-1 border-r border-gray-300 text-[10px] tracking-wider py-2 text-center text-gray-600">
                      {currency} {handleDigitsFix(typeData.net_price) || 0}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeProduct(item.product_id || item.id)}
                      activeOpacity={0.6}
                      className="px-2.5"
                    >
                      <AntDesign name="close" size={21} color="gray" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="py-3 border-b border-gray-200 items-center">
              <Text className="text-sm font-medium text-gray-500">
                No Products Selected
              </Text>
            </View>
          )}

          {/* Table Footer - Total */}
          <View className="flex flex-row items-center py-2.5 px-3 justify-end border-b border-gray-200">
            <Text className="text-sm pr-2 tracking-wider text-gray-700">
              Total:
            </Text>
            <Text className="text-sm text-center tracking-wider text-gray-700">
              {currency} {handleDigitsFix(localFormValue?.totalPrice) || 0}
            </Text>
          </View>
        </View>

        {/* Add Item Button */}
        <View className="p-4">
          <CommonButton
            isFilled={false}
            onPress={() => navigation.goBack()}
            title="Add Item"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ItemsForInvoice;
