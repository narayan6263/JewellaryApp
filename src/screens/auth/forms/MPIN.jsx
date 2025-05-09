import CommonButton from "@/src/components/common/buttons/CommonButton";
import InputBox from "@/src/components/common/InputBox";
import { manageMPIN } from "@/src/redux/actions/auth.action";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import { useDispatch, useSelector } from "react-redux";

const MPIN = ({ navigation }) => {
  const dispatch = useDispatch();
  const [formValue, setFormValue] = useState({});
  const [showMPIN, setShowMPIN] = useState(false);
  const { loading } = useSelector((state) => state.authSlices);

  const handleChange = ({ name, value }) => {
    setFormValue({ ...formValue, [name]: value });
  };

  const handleSubmit = () => {
    dispatch(
      manageMPIN({
        payload: formValue,
        isVerify: true,
        callback: () => {
          setFormValue({});
          navigation.navigate("Main");
        },
      })
    );
  };

  return (
    <View className="space-y-5">
      <View>
        <InputBox
          name="mpin"
          placeholder="MPIN"
          value={formValue?.mpin}
          onChange={handleChange}
          secureTextEntry={!showMPIN}
          keyboardType="numeric"
          maxLength={4}
          icon={
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowMPIN(!showMPIN)}
            >
              <Entypo
                name={showMPIN ? "eye-with-line" : "eye"}
                color="gray"
                size={20}
              />
            </TouchableOpacity>
          }
        />
      </View>
      <View>
        <CommonButton onPress={handleSubmit} loading={loading} title="Submit" />
      </View>
    </View>
  );
};

export default MPIN;
