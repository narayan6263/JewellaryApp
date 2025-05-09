import React, { useState } from "react";
import { currency } from "@/src/contants";
import AntDesign from "@expo/vector-icons/AntDesign";
import PaymentModal from "@/src/components/invoice/PaymentModal";
import AdditionalModal from "@/src/components/invoice/AdditionalModal";
import { Text, TextInput, TouchableOpacity, View, SafeAreaView } from "react-native";
import { handleDigitsFix } from "@/src/utils";
import ORHeader from "./ORHeader";
import ShowToast from "@/src/components/common/ShowToast";

const ORExtras = ({ navigation, route }) => {
  const { formValue, setFormValue } = route.params;
  const [modalState, setModalState] = useState({
    datePicker: false,
    payment: false,
    additional: false
  });
  const [loading, setLoading] = useState(false);
 
  const handleSubmit = () => {
    try {
      setLoading(true);
      console.log("Starting form submission...");

      // Validate formValue exists
      if (!formValue) {
        console.log("Form value is missing");
        ShowToast("Form data is missing");
        return;
      }

      // Enhanced validation with detailed logging
      if (!formValue?.client) {
        console.log("Client data is missing:", formValue?.client);
        ShowToast("Please select a client");
        return;
      }

      if (!formValue?.selectedProduct || !Array.isArray(formValue?.selectedProduct) || formValue?.selectedProduct?.length === 0) {
        console.log("No products selected");
        ShowToast("Please add at least one product");
        return;
      }

      if (!formValue?.totalPrice || formValue?.totalPrice === "0") {
        console.log("Invalid total price:", formValue?.totalPrice);
        ShowToast("Please calculate the total price");
        return;
      }

      // Navigate to next screen
      navigation.navigate('OrderDetails', { 
        formValue,
        refresh: true 
      });

    } catch (error) {
      console.error("Error in handleSubmit:", error);
      ShowToast(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Handle modal states
  const handleModalState = (name, value) => {
    setModalState((prevState) => ({ ...prevState, [name]: value }));
  };

  // Handle tax input
  const handleTaxInput = (tax) => {
    setFormValue((prev) => {
      const totalPrice = Number(prev.totalPrice) || 0;
      const taxAmount = Number(tax) || 0;

      const taxPercentage = tax ? (taxAmount / totalPrice) * 100 : 0;
      
      return {
        ...prev,
        tax,
      };
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ORHeader 
        title="Payment & Tax" 
        navigation={navigation}
        showNext={false}
      />
      
      <View className="p-4 space-y-3">
        {/* Payments and Date */}
        <View className="border-b divide-x divide-gray-4 border-gray-4 items-start flex flex-row justify-between">
          {/* Payments */}
          <View className="flex-row justify-between items-start w-full">
            {/* List */}
            <View className="space-y-0.5">
              <Text className="tracking-wide">Payments</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-6 text-xs tracking-wider">
                  {currency} {formValue?.amount_paid || 0}
                </Text>
                <Text className="text-gray-6 pl-3 text-xs tracking-wider">
                  {formValue.payment_mode}
                </Text>
              </View>
            </View>

            {/* New Payment */}
            <TouchableOpacity
              onPress={() => handleModalState("payment", true)}
              activeOpacity={0.6}
              className="pr-3"
            >
              <AntDesign name="pluscircleo" size={20} color="#4F46E5" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tax */}
        <View className="border-b border-gray-4">
          <Text className="tracking-wide">Tax</Text>
          <TextInput
            className="w-full"
            value={formValue?.tax}
            onChangeText={handleTaxInput}
            keyboardType="numeric"
            placeholder="0.00%"
          />
        </View>

        {/* Additional Charges */}
        <AdditionalModal
          formValue={formValue}
          setFormValue={setFormValue}
          open={modalState.additional}
          onClose={() => handleModalState("additional", false)}
        />

        {/* Totals */}
        <View className="flex border-t border-gray-300 pt-2 items-end">
          {/* Total */}
          <View className="flex flex-row items-center gap-1">
            <Text className="text-lg tracking-wider">Total : </Text>
            <Text className="text-lg text-center tracking-wider">
              {currency}
              {handleDigitsFix(formValue?.totalPrice || 0)}
            </Text>
          </View>

          {/* Paid */}
          <View className="flex flex-row items-center gap-1">
            <Text className="text-gray-6 text-sm">Total Paid : </Text>
            <Text className="text-gray-6 text-sm">
              {currency}
              {formValue?.amount_paid || 0}
            </Text>
          </View>

          {/* Balance */}
          <View className="flex flex-row items-center gap-1">
            <Text className="text-gray-6 text-sm">Balance : </Text>
            <Text className="text-gray-6 text-sm">
              {currency}
              {handleDigitsFix(
                Number(formValue?.totalPrice || 0) -
                Number(formValue?.amount_paid || 0)
              )}
            </Text>
          </View>
        </View>

        {/* Payment Modal */}
        <PaymentModal
          setFormValue={setFormValue}
          formValue={formValue}
          open={modalState.payment}
          onClose={() => handleModalState("payment", false)}
        />

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className="bg-primary p-4 rounded-lg mt-4"
        >
          <Text className="text-white text-center font-semibold">
            {loading ? "Submitting..." : "Submit"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ORExtras; 