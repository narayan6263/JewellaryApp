import PlusButton from "@/src/components/common/buttons/PlusButton";
import NoData from "@/src/components/common/NoData";
import OverlayModal from "@/src/components/common/OverlayModal";
import SectionHeader from "@/src/components/common/SectionHeader";
import {
  deleteProductGroups,
  fetchProductGroups,
} from "@/src/redux/actions/product.action";
import React, { useEffect, useState } from "react";
import { Fragment } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useDispatch, useSelector } from "react-redux";

const ManageGroupScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { navigate } = navigation;
  const [deleteMetal, setDeleteMetal] = useState(null);
  const { productGroups } = useSelector((state) => state.productSlices);

  const handleRemoveMetal = () => {
    dispatch(
      deleteProductGroups({
        productId: deleteMetal,
        callback: () => setDeleteMetal(null),
      })
    );
  };

  useEffect(() => {
    dispatch(fetchProductGroups());
  }, [dispatch]);
  return (
    <View className="bg-white min-h-screen">
      <SectionHeader title="Manage Product Metals" navigation={navigation} />

      {/* Groups List */}
      <View className="p-4">
        <FlatList
          data={productGroups}
          renderItem={({ item }) => (
            <View className="pb-2">
              <TouchableOpacity
                activeOpacity={0.8}
                className="flex bg-primary/10 flex-row justify-between rounded-md p-4 items-center"
              >
                <View className="flex flex-row items-center gap-2">
                  <View className="bg-white rounded-full w-12 h-12 flex justify-center items-center">
                    <Text className="text-primary tracking-wider text-center font-bold text-lg">
                      {item.name[0]}M
                    </Text>
                  </View>
                  <Text className="text-primary tracking-wider text-center">
                    {item.name} Metal
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity className="bg-white p-2.5 rounded-full">
                    <Feather
                      name="edit"
                      onPress={() => navigate("NewGroupScreen", item)}
                      size={20}
                      color="#5750F1"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={() => setDeleteMetal(item?.id)}
                    className="bg-white p-2.5 rounded-full"
                  >
                    <Feather name="trash-2" color="red" size={20} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<NoData title="Groups" />}
        />
      </View>

      {/* New Group Button */}
      <PlusButton onPress={() => navigate("NewGroupScreen")} />

      {/* Delete Metal Modal */}
      <OverlayModal
        heading="Delete Metal"
        open={deleteMetal ? true : false}
        onClose={() => setDeleteMetal(null)}
        onSubmit={handleRemoveMetal}
      >
        <Text className="text-base tracking-wider">
          Are you sure want to delete metal ? This action will not undo.
        </Text>
      </OverlayModal>
    </View>
  );
};

export default ManageGroupScreen;
