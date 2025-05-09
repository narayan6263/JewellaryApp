import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import InputBox from "@/src/components/common/InputBox";
import SimpleReactValidator from "simple-react-validator";
import CommonButton from "@/src/components/common/buttons/CommonButton";
import { manageProductGroups } from "@/src/redux/actions/product.action";

const GroupFormScreen = ({ navigation, route, onClose = null }) => {
  const updateData = route.params;
  const dispatch = useDispatch();
  const [info, setInfo] = useState(updateData || {});
  const [errors, setErrors] = useState({});
  const validator = new SimpleReactValidator();
  const { loading } = useSelector((state) => state.productSlices);

  const handleInfoChange = ({ name, value }) => {
    setErrors({ ...errors, [name]: "" });
    setInfo({ ...info, [name]: value });
  };

  const handleSubmit = () => {
    if (validator.allValid()) {
      const payload = {
        ...info,
        ...(updateData && { metal_id: updateData.id }),
      };
      dispatch(
        manageProductGroups({
          payload,
          isUpdate: updateData ? true : false,
          callback: () => (onClose ? onClose() : navigation.goBack()),
        })
      );
    } else {
      setErrors(validator.errorMessages);
    }
  };

  useEffect(() => {
    if (updateData) {
      setInfo({ name: updateData.name, price: updateData.price });
    }
  }, [updateData]);

  return (
    <View>
      <View className="mb-5">
        <InputBox
          name="name"
          required={true}
          label="Metal Name"
          value={info?.name}
          onChange={handleInfoChange}
          error={errors?.name}
        />
        {validator.message("name", info?.name, "required")}
      </View>
      <View className="mb-5">
        <InputBox
          name="price"
          required={true}
          label="Price"
          value={info?.price}
          onChange={handleInfoChange}
          error={errors?.price}
          keyboardType="numeric"
        />
        {validator.message("price", info?.price, "required|integer")}
      </View>
      <CommonButton
        loading={loading}
        title={updateData ? "Update" : "Submit"}
        onPress={handleSubmit}
      />
    </View>
  );
};

export default GroupFormScreen;
