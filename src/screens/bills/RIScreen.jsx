import { View, TouchableOpacity, Text } from "react-native";
import React, { Fragment, useState } from "react";
import ORInvoiceForm from "@/src/components/ORInvoiceForm";
import ORcreateContactForm from "@/src/screens/users/components/ORcreateContactForm";

const RepairingInvoice = ({ navigation, route }) => {
  const [localFormValue, setLocalFormValue] = useState(route?.params?.formValue || {});
  
  const isPurchase = route?.params?.isPurchase;
  const isFromProductList = route?.params?.isFromProductList;

  const handleFormValueChange = (value) => {
    if (route?.params?.setFormValue) {
      route.params.setFormValue(value);
    }
    setLocalFormValue(value);
  };

  const handleInputChange = ({ name, value }) => {
    handleFormValueChange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactSelect = (contactData) => {
    console.log("Selected contact:", contactData);
    navigation.navigate("ORInvoiceForm", {
      contact: contactData,
      formValue: localFormValue,
      setFormValue: handleFormValueChange,
      isPurchase,
      isFromProductList,
      isRepair: true // Added to identify repair flow
    });
  };

  const handleNext = () => {
    if (!localFormValue.costumer_name) {
      alert("Please select a customer first");
      return;
    }
    navigation.navigate("ORInvoiceForm", {
      contact: localFormValue,
      formValue: localFormValue,
      setFormValue: handleFormValueChange,
      isPurchase,
      isFromProductList,
      isRepair: true // Added to identify repair flow
    });
  };

  return (
    <Fragment>
      <View className="flex-row items-center justify-between bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <Text className="text-gray-600">Back</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Repair Invoice</Text>
        </View>
        <TouchableOpacity 
          onPress={handleNext}
          className="bg-primary px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Next</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-white flex-1">
        <ORcreateContactForm 
          navigation={navigation}
          isFromInvoice={true}
          invoiceHandler={{
            formValue: localFormValue,
            setFormValue: handleFormValueChange,
            handleInputChange,
            isPurchase,
            isFromProductList,
            onSelect: handleContactSelect,
            invoiceType: "repair" // Changed to repair
          }}
        />
      </View>
    </Fragment>
  );
};

export default RepairingInvoice;
