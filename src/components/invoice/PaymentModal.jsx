import React, { useState } from "react";
import { allPaymentMethod, handleDigitsFix } from "@/src/utils";
import OutlineInput from "@/src/components/common/OutlineInput";
import OverlayModal from "@/src/components/common/OverlayModal";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

const PaymentModal = ({ onSubmit, formValue, setFormValue, ...props }) => {
  const [modalState, setModalState] = useState({
    datePicker: false,
    dropdown: false,
  });

  const handleChange = ({ value, name }) => {
    setFormValue({ ...formValue, [name]: value });
  };

  // handle modal states
  const handleModalState = (name, value) => {
    setModalState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = () => props.onClose();

  return (
    <OverlayModal {...props} onSubmit={handleSubmit}>
      {/* Payment Type */}
      <View className="w-full relative">
        <View className="space-y-0.5 border-b border-gray-5 pb-1">
          <Text className="pb-0.5  tracking-wider">Payment Date</Text>
          <TouchableOpacity
            onPress={() => handleModalState("dropdown", true)}
            className="items-center flex flex-row justify-between"
          >
            <Text>{formValue?.payment_mode}</Text>
          </TouchableOpacity>
        </View>
        {modalState.dropdown && (
          <View className="shadow-md absolute px-1 w-full z-50 top-[49px] bg-gray-2 max-h-[400px]">
            <FlatList
              data={allPaymentMethod}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    handleChange({ name: "payment_mode", value: item.name });
                    handleModalState("dropdown", false);
                  }}
                  className={`${
                    item.name == formValue?.payment_mode && "bg-white"
                  } w-full py-1.5 px-2 rounded-md`}
                >
                  <Text className="tracking-wider">{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* Bill & Balance */}
      <View className="flex my-5 justify-between flex-row">
        <View className="w-[46%]">
          <OutlineInput
            label="Bill Total"
            value={handleDigitsFix(formValue?.totalPrice) || 0}
            name="bill"
            readOnly={true}
            keyboardType="numeric"
          />
        </View>
        <View className="w-[46%]">
          <OutlineInput
            label="Balance"
            placeholder="0.00"
            value={handleDigitsFix(
              Number(formValue?.totalPrice) -
                Number(formValue?.amount_paid || 0)
            )}
            name="balance"
            readOnly={true}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Amount Paid */}
      <View className="w-full">
        <OutlineInput
          label="Amount Paid"
          placeholder="0.00"
          value={formValue?.amount_paid}
          onChange={handleChange}
          name="amount_paid"
          keyboardType="numeric"
        />
      </View>
    </OverlayModal>
  );
};

export default PaymentModal;
