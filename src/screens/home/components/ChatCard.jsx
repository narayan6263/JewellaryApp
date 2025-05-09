import React from "react";
import { Text, View } from "react-native";
import { TouchableOpacity } from "react-native";
import Avatar from "../../../components/common/Avatar";
import { currency } from "@/src/contants";

const ChatCard = ({ navigation, data }) => {
  const { navigate } = navigation;
  const getAmount =
    Number(data?.total_invoice_amount || 0) - Number(data?.total_paid || 0);
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => navigate("ChatDetails", data)}
    >
      <View className="p-3 border-b bg-white border-gray-4 flex flex-row items-center">
        <Avatar title={data?.user_contact_data?.name[0] || "U"} />
        <View className="px-3">
          <Text className="text-lg capitalize text-gray-6 tracking-wide font-medium">
            {data?.user_contact_data?.name || "Unknown"}
          </Text>
          {getAmount > 0 && (
            <Text className="text-red-700 font-medium tracking-wide">
              You will get {currency} {getAmount}
            </Text>
          )}
          <Text className="text-gray-500 tracking-wide">
            Total invoices : {data?.invoice_count || 0}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ChatCard;
