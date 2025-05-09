import CommonButton from "@/src/components/common/buttons/CommonButton";
import InputBox from "@/src/components/common/InputBox";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import SimpleReactValidator from "simple-react-validator";
import Entypo from "@expo/vector-icons/Entypo";
import { manageAuth } from "@/src/redux/actions/auth.action";
import { useDispatch, useSelector } from "react-redux";

const LogIn = ({ navigation }) => {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const validator = new SimpleReactValidator();
  const [formValue, setFormValue] = useState({});
  const [initialState, setInitialState] = useState({ showPass: false });
  const { loading } = useSelector((state) => state.authSlices);

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
        manageAuth({
          payload: formValue,
          isSignIn: true,
          callback: () => {
            setFormValue({});
            navigation.navigate("Main");
          },
        })
      );
    } else {
      setErrors(validator.errorMessages);
    }
  };

  return (
    <View className="space-y-4">
      {/* email */}
      <View>
        <InputBox
          name="email"
          placeholder="Email"
          value={formValue?.email}
          onChange={handleChange}
          error={errors?.email}
        />
        {validator.message("email", formValue?.email, "required|email")}
      </View>

      {/* password */}
      <View>
        <InputBox
          name="password"
          placeholder="Password"
          value={formValue?.password}
          onChange={handleChange}
          error={errors?.password}
          secureTextEntry={!initialState.showPass}
          icon={
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                handleInitialState({ showPass: !initialState.showPass })
              }
            >
              <Entypo
                name={initialState.showPass ? "eye-with-line" : "eye"}
                color="gray"
                size={20}
              />
            </TouchableOpacity>
          }
        />
        {validator.message("password", formValue?.password, "required")}
      </View>

      {/* Submit BUtton */}
      <View>
        <CommonButton title="LogIn" loading={loading} onPress={handleSubmit} />
      </View>
    </View>
  );
};

export default LogIn;
