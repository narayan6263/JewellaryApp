import React, { useState } from "react";
import { currency } from "@/src/contants";
import AntDesign from "@expo/vector-icons/AntDesign";
import PaymentModal from "@/src/components/invoice/PaymentModal";
import AdditionalModal from "@/src/components/invoice/AdditionalModal";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { handleDigitsFix } from "@/src/utils";

const Extras = ({ formValue, setFormValue }) => {
  const [modalState, setModalState] = useState({
    datePicker: false,
    payment: false,
  });

  // handle modal states
  const handleModalState = (name, value) => {
    setModalState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleTaxInput = (tax) => {
    setFormValue((prev) => {
      const totalPrice = Number(prev.totalPrice) || 0; // Ensure totalPrice is a valid number
      const taxAmount = Number(tax) || 0; // Ensure tax is a valid number

      // Calculate the tax percentage
      const taxPercentage = tax ? (taxAmount / totalPrice) * 100 : 0;
      // Update the totalPrice by adding the tax amount
      const updatedTotalPrice = (totalPrice + taxPercentage);

      return {
        ...prev,
        // totalPrice: updatedTotalPrice,
        tax,
      };
    });
  };

  return (
    <View className="p-4 space-y-3">
      {/* payments and date */}
      <View className="border-b divide-x divide-gray-4 border-gray-4 items-start flex flex-row justify-between">
        {/* payments */}
        <View className="flex-row justify-between items-start w-full">
          {/* list */}
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

          {/* new payment */}
          <TouchableOpacity
            onPress={() => handleModalState("payment", true)}
            activeOpacity={0.6}
            className="pr-3"
          >
            <AntDesign name="pluscircleo" size={20} className="text-primary" />
          </TouchableOpacity>
        </View>

        {/* pay date */}
        {/* <View className="space-y-0.5 w-[30%] pb-1 pl-3">
          <Text className="tracking-wide">Payment Date</Text>
          <TouchableOpacity
            onPress={() => handleModalState("datePicker", true)}
            className="items-center flex flex-row justify-between"
          >
            <DatePickerComponent
              maxDate={new Date()}
              name="payment_date"
              value={formValue?.payment_date}
              open={modalState.datePicker}
              handleClose={() => handleModalState("datePicker", false)}
            />
          </TouchableOpacity>
        </View> */}
      </View>

      {/* tax */}
      <View className="border-b border-gray-4">
        <Text className="tracking-wide">Tax</Text>
        <TextInput
          className="w-full"
          value={formValue?.tax}
          onChangeText={(value) => handleTaxInput(value)}
          keyboardType="numeric"
          placeholder="0.00%"
        />
      </View>

      {/* additional charges */}
      <AdditionalModal
        formValue={formValue}
        setFormValue={setFormValue}
        open={modalState.additional}
        onClose={() => handleModalState("additional", false)}
      />

      {/* totals */}
      <View className="flex border-t border-gray-300 pt-2 items-end">
        {/* total */}
        <View className="flex flex-row items-center gap-1">
          <Text className="text-lg tracking-wider">Total : </Text>
          <Text className="text-lg text-center tracking-wider">
            {currency}
            {handleDigitsFix(formValue?.totalPrice || 0)}
          </Text>
        </View>

        {/* paid */}
        <View className="flex flex-row items-center gap-1">
          <Text className="text-gray-6 text-sm">Total Paid : </Text>
          <Text className="text-gray-6 text-sm">
            {currency}
            {formValue?.amount_paid || 0}
          </Text>
        </View>

        {/* balance */}
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

      {/* ------------------- Modals ----------------- */}
      <PaymentModal
        setFormValue={setFormValue}
        formValue={formValue}
        open={modalState.payment}
        onClose={() => handleModalState("payment", false)}
      />
    </View>
  );
};

export default Extras;
