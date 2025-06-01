import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import KeyboardHanlder from "@/src/components/common/KeyboardHanlder";
import InputBox from "@/src/components/common/InputBox";
import CommonButton from "@/src/components/common/buttons/CommonButton";
import SimpleReactValidator from "simple-react-validator";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCitiesList,
  fetchContactGroupsList,
  fetchStatesList,
  manageContactList,
} from "@/src/redux/actions/user.action";
import SelectInput from "@/src/components/common/SelectInput";
import SelectContact from "./components/SelectContact";

const CreateContactForm = ({
  navigation,
  isFromInvoice = false,
  invoiceHandler,
  updateData = null,
}) => {
  const { goBack } = navigation;
  const dispatch = useDispatch();
  const [info, setInfo] = useState({});
  const [errors, setErrors] = useState({});

  
 const validator = new SimpleReactValidator({
  validators: {
    role: {
      message: 'Role is required.',
      rule: (val) => val?.value !== undefined && val?.value !== null,
    },
  },
});
  const { groups, statesList, cityList, loading } = useSelector(
    (state) => state.userSlices
  );

  // handle input change
  const handleInfoChange = ({ name, value }) => {
    setErrors({ ...errors, [name]: "" });
    setInfo({ ...info, [name]: value });
    validator.showMessageFor(name);
  };

  // handle submit
  const handleSubmit = () => {
    if (!info?.role?.value) {
      setErrors({ ...errors, role: "Role is required" });
      return;
    }

    if (validator.allValid()) {
      const roleId = parseInt(info?.role?.value);
      if (!roleId) {
        setErrors({ ...errors, role: "Invalid role selected" });
        return;
      }

      const payload = {
        name: info?.name?.trim(),
        phone: info?.phone?.trim(),
        email: info?.email?.trim(),
        address: info?.address?.trim(),
        pincode: info?.pincode?.trim(),
        role_id: roleId,
        group_id: roleId,
        city_id: info?.city?.value,
        state_id: info?.state?.value,
        gold_fine: "0",
        silver_fine: "0",
        amount: "0"
      };

      // Clean up any undefined/null/empty values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
          delete payload[key];
        }
      });

      dispatch(
        manageContactList({
          payload: updateData ? { ...payload, id: updateData.id } : payload,
          callback: () => {
            ShowToast(updateData ? 'Contact updated successfully' : 'Contact created successfully');
            goBack();
          },
          isUpdate: !!updateData,
        })
      );
    } else {
      validator.showMessages();
      setErrors(validator.errorMessages);
    }
  };

  // update contact info on select contact
  const updateContactInfo = (updateValue) => {
    setInfo((prev) => {
      let updateInfo = { ...prev };

      if (updateValue) {
        updateInfo = { ...updateInfo, ...updateValue };

        const targetState = statesList.find(
          (state) => updateValue.state_id == state.value
        );
        const targetCity = cityList.find(
          (customer) => updateValue.city_id == customer.value
        );

        updateInfo.state = targetState;
        updateInfo.city = targetCity;
      }

      return updateInfo;
    });
  };

  // set default value on update
  useEffect(() => {
    setInfo((prev) => {
      let updateInfo = { ...prev };
      // update role if not coming from invoice
      if (!isFromInvoice && groups?.length > 0) {
        // find role
        const defaultRole = groups.find(
          (group) => updateData?.role_id === group.id || group.name === "Customer"
        );
        
        if (defaultRole) {
          updateInfo.role = {
            label: defaultRole.name,
            value: defaultRole.id,
          };
        }
      }

      if (updateData) {
        updateInfo = { ...updateData, ...updateInfo };

        const targetState = statesList.find(
          (state) => updateData.state_id == state.value
        );
        const targetCity = cityList.find(
          (customer) => updateData.city_id == customer.value
        );

        if (!updateInfo.state) {
          updateInfo.state = targetState;
        }

        if (!updateInfo.city) {
          updateInfo.city = targetCity;
        }
      }

      return updateInfo;
    });
  }, [groups, statesList, cityList, updateData, isFromInvoice]);

  // fetch cities only when state changes
  useEffect(() => {
    if (info?.state?.value) {
      dispatch(fetchCitiesList(info.state.value));
    }
  }, [dispatch, info?.state?.value]);

  // fetch states and groups when no state is selected or when updateData is missing
  useEffect(() => {
    if (!info?.state) {
      dispatch(fetchStatesList());
      dispatch(fetchContactGroupsList());
    }
  }, [dispatch, info?.state]);

  return (
    <KeyboardHanlder>
      <View className="px-4 pt-4">
        {/* Personal Information */}
        <View>
          {!isFromInvoice && (
            <Text className="text-primary mb-3 font-semibold uppercase tracking-wider">
              Personal Information
            </Text>
          )}
          {isFromInvoice ? (
            <SelectContact
              info={info}
              invoiceHandler={invoiceHandler}
              updateContactInfo={updateContactInfo}
            />
          ) : (
            <View className="mb-3">
              <InputBox
                name="name"
                label="Full Name *"
                value={info?.name}
                onChange={handleInfoChange}
                error={errors?.name}
              />
              {validator.message("name", info?.name, "required")}
            </View>
          )}
          <View className="flex mb-3 flex-row">
            <View className="w-1/2 pr-1">
              {isFromInvoice ? (
                <>
                  <InputBox
                    name="email"
                    label="Email"
                    readOnly={isFromInvoice}
                    value={info?.email}
                    onChange={handleInfoChange}
                    error={errors?.email}
                  />
                  {validator.message("email", info?.email, "email")}
                </>
              ) : (
                <>
                  <SelectInput
                    label="Role *"
                    value={info?.role}
                    disabled={isFromInvoice}
                    placeholder="Select Role"
                    data={groups?.map((item) => ({
                      label: item.name,
                      value: item.id,
                    })) || []}
                    error={errors?.role}
                    onSelect={(value) =>
                      handleInfoChange({ name: "role", value })
                    }
                  />
                  {validator.message("role", info?.role, "role")}
                </>
              )}
            </View>
            <View className="w-1/2 pl-1">
              <InputBox
                name="phone"
                label="Phone *"
                readOnly={isFromInvoice || updateData}
                value={info?.phone}
                onChange={handleInfoChange}
                error={errors?.phone}
                keyboardType="numeric"
              />
              {validator.message(
                "phone",
                info?.phone,
                [
                  "required",
                  "min:10",
                  {
                    regex:
                      /^\+?(\d{1,4})?[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/,
                  },
                ],
                {
                  messages: { regex: "Please enter a valid phone number." },
                }
              )}
            </View>
          </View>
          {!isFromInvoice && (
            <View className="mb-3">
              <InputBox
                name="email"
                label="Email"
                readOnly={isFromInvoice}
                value={info?.email}
                onChange={handleInfoChange}
                error={errors?.email}
              />
              {validator.message("email", info?.email, "email")}
            </View>
          )}
        </View>

        {/* Address Information */}
        <View className="my-2.5">
          {!isFromInvoice && (
            <Text className="text-primary mb-3 font-semibold uppercase tracking-wider">
              Contact Information
            </Text>
          )}

          {/* address and postal code */}
          <View className="flex mb-3 flex-row">
            <View className="w-1/2 pr-1">
              <InputBox
                name="address"
                label="Address"
                readOnly={isFromInvoice}
                value={info?.address}
                onChange={handleInfoChange}
                error={errors?.address}
              />
            </View>

            <View className="w-1/2 pl-1">
              <InputBox
                name="pincode"
                label="Postal Code"
                readOnly={isFromInvoice}
                value={info?.pincode}
                onChange={handleInfoChange}
                error={errors?.pincode}
                keyboardType="numeric"
              />
              {validator.message(
                "pincode",
                info?.pincode,
                "min:6|max:6|integer"
              )}
            </View>
          </View>

          {/* state & city */}
          <View className="flex mb-3 flex-row">
            <View className="w-1/2 pr-1">
              <SelectInput
                label="State"
                value={info?.state}
                placeholder="Select State"
                data={statesList}
                disabled={isFromInvoice}
                error={errors?.state}
                onSelect={(value) => handleInfoChange({ name: "state", value })}
              />
            </View>
            <View className="w-1/2 pl-1">
              <SelectInput
                label="City"
                value={info?.city}
                placeholder="Select City"
                data={cityList}
                disabled={isFromInvoice}
                error={errors?.city}
                onSelect={(value) => handleInfoChange({ name: "city", value })}
              />
            </View>
          </View>
        </View>

        {/* Submit */}
        {!isFromInvoice && (
          <CommonButton
            loading={loading}
            title={updateData ? "Update" : "Submit"}
            onPress={handleSubmit}
          />
        )}
      </View>
    </KeyboardHanlder>
  );
};

export default CreateContactForm;
