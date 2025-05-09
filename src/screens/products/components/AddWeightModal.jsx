import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import OverlayModal from "@/src/components/common/OverlayModal";
import InputBox from "@/src/components/common/InputBox";
import CommonButton from "@/src/components/common/buttons/CommonButton";
import { useDispatch, useSelector } from "react-redux";
import {
  addWeightList,
  fetchProductList,
} from "@/src/redux/actions/product.action";
import OutlineInput from "@/src/components/common/OutlineInput";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import SelectInput from "@/src/components/common/SelectInput";

const AddWeightModal = ({ product, ...props }) => {
  const dispatch = useDispatch();
  const [formValue, setFormValue] = useState({ charges: [{}] });
  const { weightLoading, products = {} } = useSelector(
    (state) => state.productSlices
  );

  const handleInputChange = ({ name, value, index, field }) => {
    setFormValue((prev) => {
      const updatedForm = {
        ...prev,
        [name]:
          name === "charges" && typeof index === "number" && field
            ? prev.charges.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
              )
            : value,
      };

      // Calculate weights when relevant fields change
      if (["gross_weight", "less_weight", "tounch", "wastage", "rate", "making_charge", "making_type"].includes(name)) {
        // Calculate Net Weight
        const netWeight = Number(updatedForm.gross_weight || 0) - Number(updatedForm.less_weight || 0);
        updatedForm.net_weight = netWeight;

        // Calculate Fine Weight
        const grossWeight = Number(updatedForm.gross_weight || 1);
        const tounch = Number(updatedForm.tounch || 0);
        const wastage = Number(updatedForm.wastage || 0);
        updatedForm.fine_weight = grossWeight * ((tounch + wastage) / 100);

        // Calculate Metal Value
        const metalValue = Number(updatedForm.fine_weight || 0) * Number(updatedForm.rate || 0);

        // Calculate Making Charges
        const isPerGram = updatedForm.making_type?.value === "PG";
        const isPerPiece = updatedForm.making_type?.value === "PP";
        
        let makingChargeAmount = 0;
        if (isPerGram) {
          makingChargeAmount = netWeight * Number(updatedForm.making_charge || 0);
        } else if (isPerPiece) {
          makingChargeAmount = Number(updatedForm.making_charge || 0);
        }

        // Calculate Additional Charges
        const totalCharges = (updatedForm.charges || []).reduce(
          (sum, charge) => sum + Number(charge.amount || 0),
          0
        );

        // Calculate Base Price
        const basePrice = metalValue + makingChargeAmount + totalCharges;

        // Calculate Tax
        const totalTaxPercentage = Number(updatedForm.tax_percentage || 0);
        const taxAmount = basePrice * (totalTaxPercentage / 100);

        // Calculate Final Price
        updatedForm.net_price = basePrice + taxAmount;
      }

      return updatedForm;
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

  const removeChargeInput = (key, index) => {
    setFormValue((prev) => ({
      ...prev,
      [key]: prev[key].filter((item, i) => i !== index),
    }));
  };

  // handle charges & taxes field -- end
  const handleSubmit = () => {
    dispatch(
      addWeightList({
        payload: {
          ...formValue,
          charges: JSON.stringify(formValue.charges),
          type: product.type == "sale" ? "1" : "2",
          product_id: product.id,
          product_id_by: formValue?.product_id_by?.value || null,
          stock_entry: formValue?.stock_entry?.value,
        },
        callback: () => props.onClose(),
      })
    );
  };

  const stockEntries = [
    {
      label: "By purchase",
      value: "1",
    },
    {
      label: "By manually",
      value: "2",
    },
    {
      label: "By Item",
      value: "3",
    },
  ];

  useEffect(() => {
    dispatch(fetchProductList());
  }, [dispatch]);

  return (
    <OverlayModal {...props} heading={`Add Weight`}>
      <View className="px-2">
        {/* stock_entry */}
        <View className="w-full mb-4">
          <SelectInput
            label="Stock Entry By"
            name="stock_entry"
            value={formValue?.stock_entry}
            placeholder="Select stock by"
            data={stockEntries}
            onSelect={(value) =>
              handleInputChange({ name: "stock_entry", value })
            }
          />
        </View>

        {/* product list */}
        {formValue?.stock_entry?.value == "3" && (
          <View className="w-full mb-4">
            <SelectInput
              label="Product"
              name="product_id_by"
              value={formValue?.product_id_by}
              placeholder="Select product"
              data={products?.data.map((item) => {
                return {
                  label: item.name,
                  value: item.id,
                };
              })}
              onSelect={(value) =>
                handleInputChange({ name: "product_id_by", value })
              }
            />
          </View>
        )}

        {/* gross,  tounch */}
        <View className="mb-4 flex flex-row ">
          {/* gross weight */}
          <View className="w-1/2 pr-1">
            <InputBox
              name="gross_weight"
              placeholder="0"
              label="Gross Wt"
              value={formValue?.gross_weight}
              onChange={handleInputChange}
              keyboardType="numeric"
            />
          </View>

          {/* tounch */}
          <View className={`w-1/2 pl-1 `}>
            <InputBox
              name="tounch"
              placeholder="0 %"
              label="Tounch"
              value={formValue?.tounch}
              onChange={handleInputChange}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* wastage &  fine_weight*/}
        <View className="mb-4 flex flex-row">
          {/* wastage */}
          <View className={`w-1/2 pr-0.5`}>
            <InputBox
              name="wastage"
              placeholder="0 %"
              label="Wastage"
              value={formValue?.wastage}
              onChange={handleInputChange}
              keyboardType="numeric"
            />
          </View>

          {/* fine_weight */}
          <View className="w-1/2 pl-1">
            <InputBox
              name="fine_weight"
              label="Fine Weight"
              placeholder="0"
              readOnly={true}
              value={formValue?.fine_weight}
            />
          </View>
        </View>

        {/* Charges */}
        <View className="mb-4">
          <View className="flex flex-row items-center justify-between">
            <Text className="tracking-wider text-base">Charges</Text>
            <TouchableOpacity
              onPress={() => addItem("charges")}
              activeOpacity={0.7}
              className="bg-primary w-6 h-6 flex justify-center items-center rounded-full shadow-xl"
            >
              <FontAwesome6 name="plus" size={17} color="white" />
            </TouchableOpacity>
          </View>
          {/* Input fields */}
          {formValue?.charges?.map((charge, index) => {
            return (
              <View key={index} className="flex pt-2 pl-1 items-end flex-row">
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
                    <FontAwesome6 name="trash" size={15} color="red" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* comment */}
        <View className="mb-4">
          <InputBox
            multiLine={true}
            name="comment"
            label="Comment"
            value={formValue?.comment}
            onChange={handleInputChange}
          />
        </View>

        <CommonButton
          onPress={handleSubmit}
          loading={weightLoading}
          title="add"
        />
      </View>
    </OverlayModal>
  );
};

export default AddWeightModal;
