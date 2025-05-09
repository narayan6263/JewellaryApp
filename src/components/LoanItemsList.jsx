import React, { useState, useEffect } from "react";
import { currency } from "@/src/contants";
import AntDesign from "@expo/vector-icons/AntDesign";
import CommonButton from "@/src/components/common/buttons/CommonButton";
import { SafeAreaView, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { handleDigitsFix } from "@/src/utils";

const LoanItemsList = ({ navigation, route }) => {
  // Initialize state from route params
  const [localFormValue, setLocalFormValue] = useState(route.params?.formValue || {
    selectedProduct: [],
    totalPrice: "0",
    valuation: "0"
  });

  // Update local state when route params change
  useEffect(() => {
    console.log("Route params received:", route.params);
    if (route.params?.formValue) {
      setLocalFormValue(route.params.formValue);
    }
  }, [route.params]);

  // Remove selected product
  const removeProduct = (index) => {
    const newProducts = localFormValue.selectedProduct.filter((_, i) => i !== index);
    
    const updatedFormValue = {
      ...localFormValue,
      selectedProduct: newProducts,
      totalPrice: handleDigitsFix(
        newProducts.reduce((sum, item) => sum + Number(item.net_price || 0), 0)
      ),
      valuation: handleDigitsFix(
        newProducts.reduce((sum, item) => sum + Number(item.valuation || 0), 0)
      )
    };
    
    setLocalFormValue(updatedFormValue);
    // Update parent form value through route params
    if (route.params?.setFormValue) {
      route.params.setFormValue(updatedFormValue);
    }
  };

  // Handle adding new item
  const handleAddNewItem = () => {
    navigation.navigate("InvoiceForm", {
      formValue: localFormValue,
      setFormValue: route.params?.setFormValue,
      isFromItemsList: true
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 bg-primary">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">Loan Items</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView className="flex-1">
        {/* Products Table */}
        <View className="flex-1">
          {/* Table Header */}
          <View className="flex-row border-l border-y border-gray-300 bg-gray-200">
            {["Name", "HSN", "Fine", "Rate", "Amount"].map((item) => (
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
          {localFormValue?.selectedProduct?.length > 0 ? (
            <View>
              {localFormValue.selectedProduct.map((item, index) => (
                <View
                  key={item.product_id || index}
                  className="flex flex-row border-b items-center justify-between border-gray-300"
                >
                  <Text className="flex-1 border-r border-gray-300 text-[10px] tracking-wider py-2 text-center text-gray-600">
                    {item.name || "Unknown Product"}
                  </Text>
                  <Text className="flex-1 border-r border-gray-300 text-[10px] tracking-wider py-2 text-center text-gray-600">
                    {item.hsn_id?.label || "-"}
                  </Text>
                  <Text className="flex-1 border-r border-gray-300 text-[10px] tracking-wider py-2 text-center text-gray-600">
                    {handleDigitsFix(item.fine_weight) || "0"} g
                  </Text>
                  <Text className="flex-1 border-r border-gray-300 text-[10px] tracking-wider py-2 text-center text-gray-600">
                    {currency} {handleDigitsFix(typeof item.rate === 'object' 
                      ? (item.rate?.price || 0) 
                      : (item.rate || 0))}
                  </Text>
                  <Text className="flex-1 border-r border-gray-300 text-[10px] tracking-wider py-2 text-center text-gray-600">
                    {currency} {handleDigitsFix(item.net_price) || "0"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeProduct(index)}
                    activeOpacity={0.6}
                    className="px-2.5"
                  >
                    <AntDesign name="close" size={21} color="gray" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View className="py-3 border-b border-gray-200 items-center">
              <Text className="text-sm font-medium text-gray-500">
                No Items Added
              </Text>
            </View>
          )}

          {/* Table Footer - Totals */}
          <View className="py-2.5 px-3 border-b border-gray-200">
            <View className="flex flex-row items-center justify-end">
              <Text className="text-sm pr-2 tracking-wider text-gray-700">
                Total Amount:
              </Text>
              <Text className="text-sm text-center tracking-wider text-gray-700">
                {currency} {handleDigitsFix(localFormValue?.totalPrice) || "0"}
              </Text>
            </View>
            <View className="flex flex-row items-center justify-end mt-1">
              <Text className="text-sm pr-2 tracking-wider text-gray-700">
                Total Valuation:
              </Text>
              <Text className="text-sm text-center tracking-wider text-gray-700">
                {currency} {handleDigitsFix(localFormValue?.valuation) || "0"}
              </Text>
            </View>
          </View>
        </View>

        {/* Add Item Button */}
        <View className="p-4">
          <CommonButton
            isFilled={false}
            onPress={handleAddNewItem}
            title="Add Item"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoanItemsList; 