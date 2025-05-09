import React, { useState } from "react";
import { currency } from "@/src/contants";
import AntDesign from "@expo/vector-icons/AntDesign";
import ProductForm from "../../products/components/ProductForm";
import CommonButton from "@/src/components/common/buttons/CommonButton";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { handleDigitsFix } from "@/src/utils";

const Items = ({
  formValue,
  setFormValue,
  navigation,
  route,
  isPurchase,
  handleInputChange,
}) => {
  const [isAddItem, setIsAddItem] = useState(
    (formValue?.selectedProduct || [])?.length == 0
  );

  // remove selected product
  const removeProduct = (id) => {
    const newProducts = formValue?.selectedProduct?.filter(
      (product) => product.product_id !== id && product.id !== id
    );
    
    // Recalculate total price after removing product
    const totalPrice = newProducts.reduce(
      (acc, product) => Number(acc) + Number(product[isPurchase ? "purchase" : "sale"]?.net_price || 0),
      0
    );
    
    setFormValue({ ...formValue, selectedProduct: newProducts, totalPrice });
  };

  // Check if there are products in the form value
  const isProducts =
    formValue?.selectedProduct && formValue.selectedProduct.length > 0;

  // Debug logging for development
  console.log("Selected Products:", formValue?.selectedProduct);

  return isAddItem ? (
    <SafeAreaView className="flex-1 bg-white">
      <ProductForm
        route={route}
        navigation={navigation}
        handleCancel={isProducts ? () => setIsAddItem(!isAddItem) : false}
        isFromInvoice={true}
        invoiceHandler={{
          formValue,
          setFormValue,
          handleInputChange,
          isPurchase,
          onSubmit: () => setIsAddItem(!isAddItem),
        }}
      />
    </SafeAreaView>
  ) : (
    <View className="space-y-4 pb-5 rounded bg-white">
      {/* table */}
      <View>
        {/* thead */}
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

        {/* tbody */}
        {isProducts ? (
          formValue.selectedProduct.map((item, index) => {
            // Get the appropriate data based on whether it's purchase or sale
            const typeData = item[isPurchase ? "purchase" : "sale"] || {};
            
            return (
              <View
                key={item.product_id || item.id || index}
                className="flex flex-row border-b items-center justify-between border-gray-300"
              >
                <Text className="flex-1 border-r border-gray-300 last:border-r-0 text-[10px] tracking-wider py-2 text-center text-gray-600">
                  {item.name || "Unknown Product"}
                </Text>
                <Text className="flex-1 border-r border-gray-300 last:border-r-0 text-[10px] tracking-wider py-2 text-center text-gray-600">
                  {item.size || "-"}
                </Text>
                <Text className="flex-1 border-r border-gray-300 last:border-r-0 text-[10px] tracking-wider py-2 text-center text-gray-600">
                  {currency} {typeof typeData.rate === 'object' 
                    ? (typeData.rate?.price || 0) 
                    : (typeData.rate || 0)}
                </Text>
                <Text className="flex-1 border-r border-gray-300 last:border-r-0 text-[10px] tracking-wider py-2 text-center text-gray-600">
                  {typeData.gross_weight || 0} g
                </Text>
                <Text className="flex-1 border-r border-gray-300 last:border-r-0 text-[10px] tracking-wider py-2 text-center text-gray-600">
                  {currency}{" "}
                  {handleDigitsFix(typeData.net_price) || 0}
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
          })
        ) : (
          // No Products Message
          <View className="py-3 border-b border-gray-200 items-center">
            <Text className="text-sm font-medium text-gray-500">
              No Products Selected.
            </Text>
          </View>
        )}

        {/* tfooter */}
        <View className="flex flex-row items-center py-2.5 px-3 justify-end border-b border-gray-200">
          <Text className="text-sm pr-2 tracking-wider text-gray-700">
            Total :
          </Text>
          <Text className="text-sm text-center tracking-wider text-gray-700">
            {currency}
            {handleDigitsFix(formValue?.totalPrice) || 0}
          </Text>
        </View>
      </View>

      {/* buttons */}
      <View className="flex w-full flex-row justify-center">
        <CommonButton
          isFilled={false}
          onPress={() => setIsAddItem(!isAddItem)}
          title="Add item"
        />
      </View>
    </View>
  );
};

export default Items;
