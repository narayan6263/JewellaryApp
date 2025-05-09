import React from "react";
import { View } from "react-native";
import OverlayModal from "@/src/components/common/OverlayModal";
import GroupForm from "@/src/screens/setting/manage-groups/GroupForm";

const CreateMetalModal = ({ navigation, route, ...props }) => {
  return (
    <OverlayModal {...props} heading="Create Metal">
      <View className="px-2 pt-1">
        <GroupForm
          navigation={navigation}
          onClose={props.onClose}
          route={route}
        />
      </View>
    </OverlayModal>
  );
};

export default CreateMetalModal;
