import React from "react";
import { SafeAreaView } from "react-native";
import CreateContactForm from "../../users/components/CreateContactForm";

const Header = ({
  navigation,
  invoiceType,
  formValue,
  setFormValue,
  handleInputChange,
}) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <CreateContactForm
        navigation={navigation}
        isFromInvoice={true}
        invoiceHandler={{
          formValue,
          invoiceType,
          setFormValue,
          handleInputChange,
        }}
      />
    </SafeAreaView>
  );
};

export default Header;
