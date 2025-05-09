import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import SectionHeader from "@/src/components/common/SectionHeader";
import SimpleReactValidator from "simple-react-validator";
import CommonButton from "@/src/components/common/buttons/CommonButton";
import InputBox from "@/src/components/common/InputBox";
import Entypo from "@expo/vector-icons/Entypo";
import { useDispatch, useSelector } from "react-redux";
import { manageMPIN } from "@/src/redux/actions/auth.action";
import ToggleSwitch from "@/src/components/common/ToggleSwicth";
import { getToken } from "@/src/utils/api";

const MPINScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [isRequired, setIsRequired] = useState(true);
  const [formValue, setFormValue] = useState({ is_mpin: false });
  const validator = new SimpleReactValidator({
    validators: {
      mpinMatch: {
        message: "MPIN do not match.",
        rule: (val, params) => val == formValue?.mpin,
      },
    },
  });
  const { loading } = useSelector((state) => state.authSlices);
  const [initialState, setInitialState] = useState({
    showMPIN: false,
    showCMPIN: false,
  });

  const handleChange = ({ name, value }) => {
    setErrors({ ...errors, [name]: "" });
    setFormValue({ ...formValue, [name]: value });
  };

  const handleInitialState = (value) => {
    setInitialState({ ...initialState, ...value });
  };

  const handleSubmit = () => {
    if (validator.allValid()) {
      dispatch(
        manageMPIN({
          payload: { ...formValue, is_mpin: formValue?.is_mpin ? 1 : 0 },
          callback: () => navigation.goBack(),
        })
      );
    } else {
      setErrors(validator.errorMessages);
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await getToken();
      setFormValue({
        is_mpin: token?.is_mpin == 1,
        mpin: token.mpin,
        mpin_confirmation: token.mpin,
      });
      setIsRequired(token?.is_mpin == null);
    };

    checkLoginStatus();
  }, []);

  return (
    <View>
      <SectionHeader title="Manage MPIN" navigation={navigation} />
      {/* is_mpin */}
      <View className="flex px-5 pt-3 pb-1 flex-row items-center justify-between">
        <Text className="tracking-wider text-base">Verify with MPIN</Text>
        <ToggleSwitch
          value={formValue?.is_mpin}
          name="is_mpin"
          onChange={(name, value) => handleChange({ name, value })}
        />
      </View>

      <View className="space-y-5 px-4">
        {/* mpin */}
        <View>
          <InputBox
            name="mpin"
            placeholder="MPIN"
            value={formValue?.mpin}
            onChange={handleChange}
            error={errors?.mpin}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry={!initialState.showMPIN}
            icon={
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  handleInitialState({ showMPIN: !initialState.showMPIN })
                }
              >
                <Entypo
                  name={initialState.showMPIN ? "eye-with-line" : "eye"}
                  color="gray"
                  size={20}
                />
              </TouchableOpacity>
            }
          />
          {validator.message(
            "mpin",
            formValue?.mpin,
            isRequired ? "required" : "integer" // else value is normal
          )}
        </View>

        {/* confirm mpin */}
        <View>
          <InputBox
            name="mpin_confirmation"
            placeholder="Confirm MPIN"
            value={formValue?.mpin_confirmation}
            onChange={handleChange}
            error={errors?.mpin_confirmation}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry={!initialState.showCMPIN}
            icon={
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  handleInitialState({ showCMPIN: !initialState.showCMPIN })
                }
              >
                <Entypo
                  name={initialState.showCMPIN ? "eye-with-line" : "eye"}
                  color="gray"
                  size={20}
                />
              </TouchableOpacity>
            }
          />
          {validator.message(
            "mpin_confirmation",
            formValue?.mpin_confirmation,
            isRequired ? "required|mpinMatch" : "mpinMatch"
          )}
        </View>

        {/* Submit button */}
        <View>
          <CommonButton
            loading={loading}
            title="Submit"
            onPress={handleSubmit}
          />
        </View>
      </View>
    </View>
  );
};

export default MPINScreen;
