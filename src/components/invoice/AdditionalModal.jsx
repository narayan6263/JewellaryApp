import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import OutlineInput from "@/src/components/common/OutlineInput";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const AdditionalChargesModal = ({ formValue, setFormValue }) => {
  // handle input charges
  const handleInputChange = ({ name, value, index, field }) => {
    setFormValue((prev) => {
      const updatedCharges =
        name === "charges" && typeof index === "number" && field
          ? prev.charges.map((item, i) =>
              i === index ? { ...item, [field]: value } : item
            )
          : prev.charges;

      // Calculate the total charges
      const totalCharges = updatedCharges?.reduce((sum, charge) => {
        return Number(sum) + Number(charge.amount || 0);
      }, 0);

      return {
        ...prev,
        [name]: name === "charges" ? updatedCharges : value,
        totalCharges,
        totalPrice: Number(formValue?.totalPrice || 0) + Number(totalCharges),
      };
    });
  };

  // handle charges & texes field -- start
  const addItem = (key) => {
    setFormValue((prev) => ({
      ...prev,
      [key]: [
        ...prev[key],
        key === "charges" ? { name: "", amount: "" } : { name: "", amount: "" },
      ],
    }));
  };

  // handle remove charge
  const removeChargeInput = (key, index) => {
    setFormValue((prev) => {
      const updatedCharges = prev[key].filter((item, i) => i !== index);
      const totalCharges = updatedCharges.reduce((sum, charge) => {
        return Number(sum) + Number(charge.amount || 0);
      }, 0);

      return {
        ...prev,
        [key]: updatedCharges,
        totalPrice: Number(formValue?.totalPrice || 0) + Number(totalCharges),
      };
    });
  };

  return (
    <View className="pt-3">
      <View className="flex w-full flex-row items-center justify-between">
        <Text className="tracking-wide">Additional Charges</Text>
        <TouchableOpacity
          onPress={() => addItem("charges")}
          activeOpacity={0.7}
          className="bg-primary w-6 h-6 flex justify-center items-center rounded-full shadow-xl"
        >
          <FontAwesome6 name="plus" size={15} color="white" />
        </TouchableOpacity>
      </View>

      {/* Input fields */}
      <View className="space-y-2 pt-1">
        {formValue?.charges?.map((charge, index) => {
          return (
            <View key={index} className="flex items-end flex-row">
              {/* charge name */}
              <View className="w-[45%] pr-2">
                <OutlineInput
                  placeholder="e.g. Labour Charge"
                  value={charge.name}
                  onChangeText={(value) =>
                    handleInputChange({
                      field: "name",
                      value,
                      name: "charges",
                      index,
                    })
                  }
                />
              </View>

              {/* amount */}
              <View className="w-[45%] px-2">
                <OutlineInput
                  placeholder="e.g. 500"
                  value={charge.amount}
                  keyboardType="numeric"
                  onChangeText={(value) =>
                    handleInputChange({
                      field: "amount",
                      value,
                      name: "charges",
                      index,
                    })
                  }
                />
              </View>

              {/* trash icon */}
              {formValue?.charges?.length > 1 && (
                <TouchableOpacity
                  onPress={() => removeChargeInput("charges", index)}
                  activeOpacity={0.7}
                  className="w-[10%] flex justify-center pl-3"
                >
                  <AntDesign name="close" size={15} />
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default AdditionalChargesModal;
