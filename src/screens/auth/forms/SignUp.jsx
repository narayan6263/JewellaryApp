import CommonButton from "@/src/components/common/buttons/CommonButton";
import InputBox from "@/src/components/common/InputBox";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import SimpleReactValidator from "simple-react-validator";
import Entypo from "@expo/vector-icons/Entypo";
import { useDispatch, useSelector } from "react-redux";
import { manageAuth } from "@/src/redux/actions/auth.action";

const SignUp = ({ navigation }) => {
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
      {/* name */}
      <View>
        <InputBox
          name="name"
          placeholder="Full Name"
          value={formValue?.name}
          onChange={handleChange}
          error={errors?.name}
        />
        {validator.message("name", formValue?.name, "required")}
      </View>

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
        <CommonButton title="SignUp" loading={loading} onPress={handleSubmit} />
      </View>
    </View>
  );
};

export default SignUp;
