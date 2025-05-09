import React, { useEffect, useState } from "react";
import { View } from "react-native";
import InputBox from "@/src/components/common/InputBox";
import CommonButton from "@/src/components/common/buttons/CommonButton";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCitiesList,
  fetcheProfileDetails,
  fetchStatesList,
  updateProfileSetting,
} from "@/src/redux/actions/user.action";
import SelectInput from "@/src/components/common/SelectInput";
import KeyboardHanlder from "@/src/components/common/KeyboardHanlder";

const ShopInfo = ({ btnTitle, navigation }) => {
  const { goBack } = navigation;
  const dispatch = useDispatch();
  const [info, setInfo] = useState({});
  const { loading, profileData, statesList, cityList } = useSelector(
    (state) => state.userSlices
  );
  const handleInfoChange = ({ name, value }) =>
    setInfo({ ...info, [name]: value });

  const handleSubmit = () => {
    const payload = {
      ...info,
      city_id: info.city.value,
      state_id: info.state.value,
    };
    delete payload.state;
    delete payload.city;
    dispatch(updateProfileSetting({ payload, callback: () => goBack() }));
  };

  useEffect(() => {
    if (profileData) {
      const {
        business_name,
        address,
        city_data,
        state_data,
        business_phone,
        business_email,
        gstin,
        pincode,
      } = profileData;
      setInfo({
        business_name,
        address,
        business_phone,
        business_email,
        gstin,
        pincode,
        city: city_data ? { label: city_data.city, value: city_data.id } : {},
        state: state_data
          ? { label: state_data.state, value: state_data.id }
          : {},
      });
    }
  }, [profileData]);

  useEffect(() => {
    if (info?.state) {
      dispatch(fetchCitiesList(info?.state?.value));
    } else {
      dispatch(fetchStatesList());
      dispatch(fetcheProfileDetails());
    }
  }, [dispatch, info?.state]);

  return (
    <KeyboardHanlder>
      <View className="px-5 pt-4">
        {/* name & contact */}
        <View className="flex flex-row mb-4">
          <View className="w-1/2 pr-1">
            <InputBox
              name="business_name"
              label="Name"
              value={info?.business_name}
              onChange={handleInfoChange}
            />
          </View>
          <View className="w-1/2 pl-1">
            <InputBox
              name="business_phone"
              label="Phone"
              value={info?.business_phone}
              onChange={handleInfoChange}
            />
          </View>
        </View>

        {/* email */}
        <View className="mb-4">
          <InputBox
            name="business_email"
            label="Email"
            value={info?.business_email}
            onChange={handleInfoChange}
          />
        </View>

        {/* gst */}
        <View className="mb-4">
          <InputBox
            name="gstin"
            label="GSTIN"
            value={info?.gstin}
            onChange={handleInfoChange}
          />
        </View>

        {/* address */}
        <View className="mb-3">
          <InputBox
            name="address"
            label="Address"
            value={info?.address}
            onChange={handleInfoChange}
          />
        </View>

        {/* State */}
        <View className="flex mb-3 flex-row">
          <View className="w-1/2 pr-1">
            <SelectInput
              label="State"
              value={info?.state}
              placeholder="Select State"
              data={statesList}
              onSelect={(value) => handleInfoChange({ name: "state", value })}
            />
          </View>
          <View className="w-1/2 pl-1">
            <SelectInput
              label="City"
              value={info?.city}
              placeholder="Select City"
              data={cityList}
              onSelect={(value) => handleInfoChange({ name: "city", value })}
            />
          </View>
        </View>

        {/* pincode */}
        <View className="mb-3">
          <InputBox
            name="pincode"
            label="Postal Code"
            value={info?.pincode}
            onChange={handleInfoChange}
            keyboardType="numeric"
          />
        </View>

        <CommonButton
          loading={loading}
          onPress={handleSubmit}
          title={btnTitle || "Submit"}
        />
      </View>
    </KeyboardHanlder>
  );
};

export default ShopInfo;
