import React, { Fragment, useState } from "react";
import { Text, View } from "react-native";
import ImagePicker from "@/src/components/common/ImagePicker";
import SectionHeader from "@/src/components/common/SectionHeader";
import CommonButton from "@/src/components/common/buttons/CommonButton";
import { useDispatch, useSelector } from "react-redux";
import { updateProfileSetting } from "@/src/redux/actions/user.action";

const InvoiceConfigScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [logo, setLogo] = useState(null);
  const { loading } = useSelector((state) => state.userSlices);

  const handleSubmit = () => {
    const payload = new FormData();
    payload.append("logo", logo);
    dispatch(
      updateProfileSetting({ payload, callback: () => navigation.goBack() })
    );
  };
  return (
    <Fragment>
      <SectionHeader title="Invoice Configuration" navigation={navigation} />
      <View className="px-5 py-4">
        <View className="mb-3">
          <ImagePicker
            value={logo}
            name="logo"
            onChange={(e) => setLogo(e.value)}
          />
        </View>
        <CommonButton onPress={handleSubmit} loading={loading} title="Save" />
      </View>
    </Fragment>
  );
};

export default InvoiceConfigScreen;
