import React from "react";
import { Text, View } from "react-native";
import { currency } from "@/src/contants";
import { TouchableOpacity } from "react-native";
import Avatar from "../../../components/common/Avatar";

const LoanCard = ({ navigation, data }) => {
  const { navigate } = navigation;
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => navigate("ChatDetails", data)}
    >
      <View className="p-3 border-b bg-white border-gray-4 flex flex-row items-start">
        <Avatar title={data?.user_contacts_data?.name[0]} />
        <View className="px-3 w-[90%]">
          <Text className="text-lg capitalize text-gray-6 tracking-wide font-medium">
            {data?.user_contacts_data?.name}
          </Text>
          {/* valuation_amount, interest_type */}
          <View className="flex flex-row justify-between w-full">
            {/* total_valuation_amount */}
            <View className="flex items-center">
              <Text className="text-xs flex-col tracking-wide">Valuation</Text>
              <Text className=" text-xs font-medium flex-col tracking-wide">
                {currency}
                {data?.total_valuation_amount || 0}
              </Text>
            </View>

            {/* loan_count */}
            <View className="flex items-center">
              <Text className="text-gray-500 text-xs flex-col tracking-wide">
                Total Loan
              </Text>
              <Text className="font-medium text-xs flex-col tracking-wide">
                {data?.loan_count}
              </Text>
            </View>

            {/* total_loan_amount */}
            <View className="flex items-center">
              <Text className="text-gray-500 text-xs flex-col tracking-wide">
                Total Loan Amount
              </Text>
              <Text className="font-medium text-xs flex-col tracking-wide">
                {currency} {data?.total_loan_amount}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default LoanCard;
