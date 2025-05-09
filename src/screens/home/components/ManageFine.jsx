import React, { useCallback, useEffect, useState } from "react";
import OverlayModal from "../../../components/common/OverlayModal";
import SimpleReactValidator from "simple-react-validator";
import { View } from "react-native";
import InputBox from "@/src/components/common/InputBox";
import SelectInput from "@/src/components/common/SelectInput";
import { fetchProductGroups } from "@/src/redux/actions/product.action";
import { useDispatch, useSelector } from "react-redux";
import {
  convertToMetal,
  rateCutting,
} from "@/src/redux/actions/invoice.action";

const ManageFine = ({ title, open, onClose, userData, isRateCut = false }) => {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const validator = new SimpleReactValidator();
  const [formValue, setFormValue] = useState({});
  const { loading } = useSelector((state) => state.invoiceSlices);
  const { productGroups } = useSelector((state) => state.productSlices);

  // handle input change
  const handleInputChange = useCallback((name, value) => {
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormValue((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = () => {
    if (validator.allValid()) {
      const formData = new FormData();
      formData.append("user_contact_id", userData.id);
      formData.append("metal_id", formValue?.metal_id?.value);
      formData.append("fine_weight", formValue?.fine_weight);
      formData.append("balance", userData.balance);
      const data = { payload: formData, callback: onClose };
      dispatch(isRateCut ? rateCutting(data) : convertToMetal(data));
    } else {
      setErrors(validator.errorMessages);
    }
  };

  // Fetch product groups on mount
  useEffect(() => {
    dispatch(fetchProductGroups());
  }, [dispatch]);
  return (
    <OverlayModal
      heading={title}
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      {/* fine_weight */}
      <View className="mb-3">
        <InputBox
          name="fine_weight"
          placeholder="0"
          label="Fine Weight"
          value={formValue?.fine_weight}
          onChange={({ value }) => handleInputChange("fine_weight", value)}
          error={errors?.fine_weight}
          keyboardType="numeric"
        />
        {validator.message("fine_weight", formValue?.fine_weight, "required")}
      </View>

      {/* metal_id  */}
      <View className="">
        <SelectInput
          label="Metal"
          name="metal_id"
          placeholder="Select"
          value={formValue?.metal_id}
          data={productGroups.map((item) => ({
            label: item.name,
            value: item.id,
            variation: item.variation_data,
          }))}
          onSelect={(value) => handleInputChange("metal_id", value)}
          error={errors?.metal_id}
        />
        {validator.message("metal_id", formValue?.metal_id, "required")}
      </View>
    </OverlayModal>
  );
};

export default ManageFine;
