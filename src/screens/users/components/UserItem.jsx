import React from "react";
import { Text, View } from "react-native";
import { TouchableOpacity } from "react-native";
import Avatar from "@/src/components/common/Avatar";
import Feather from "@expo/vector-icons/Feather";

const UserItem = ({ navigation, item, onDelete }) => {
  const { navigate } = navigation;
  return (
    <View className="p-3 border-gray-3 border-b flex flex-row items-center">
      <Avatar title={item?.name[0]} />
      <View className="flex-row items-center justify-between w-5/6">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigate("ChatDetails", item)}
          className="pl-3"
        >
          <Text
            className="text-lg text-gray-6 capitalize tracking-wide font-medium w-[190px]"
            numberOfLines={1}
          >
            {item?.name}
          </Text>
          <Text className="text-gray-5">{item?.phone}</Text>
        </TouchableOpacity>

        {/* Actions */}
        <View className="flex-row gap-1.5">
          <TouchableOpacity className="bg-gray-1 p-2.5 rounded-full">
            <Feather
              name="edit"
              onPress={() => navigation.navigate("NewContact", item)}
              size={17}
              color="#5750F1"
            />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={onDelete}
            className="bg-gray-1 p-2.5 rounded-full"
          >
            <Feather name="trash-2" color="red" size={17} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default UserItem;
