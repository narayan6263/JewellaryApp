import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import Avatar from "../../../components/common/Avatar";
import { currency } from "@/src/contants";

const RepairCard = ({ navigation, data }) => {
  const { navigate } = navigation;
  
  const clientName = data?.client?.name || "Unknown";
  const clientPhone = data?.client?.phone || "N/A";
  
  const formattedAmount = data?.totalPrice ? 
    `${currency} ${parseFloat(data.totalPrice).toLocaleString('en-IN')}` : 
    `${currency} 0`;

  const formattedPaidAmount = data?.amount_paid ? 
    `${currency} ${parseFloat(data.amount_paid).toLocaleString('en-IN')}` : 
    `${currency} 0`;

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress':
        return 'text-yellow-600';
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short'
    });
  };

  const getRepairType = () => {
    if (!data?.selectedProduct?.length) return "General Repair";
    const product = data.selectedProduct[0];
    if (product?.making_type?.label) return product.making_type.label;
    return "General Repair";
  };

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => navigate("RepairDetails", { id: data.id })}
    >
      <View className="py-2 px-3 border-b bg-white border-gray-200">
        <View className="flex flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <Avatar title={clientName[0] || "O"} size="sm" />
            <View className="ml-2 flex-1">
              <Text className="text-sm capitalize text-gray-800 font-medium">
                {clientName}
              </Text>
              <Text className="text-xs text-gray-500">{clientPhone}</Text>
              <Text className="text-xs text-gray-600 mt-0.5">
                Type: {getRepairType()}
              </Text>
            </View>
          </View>

          <View className="items-end">
            <Text className={`text-xs font-medium mb-1 ${getStatusColor(data?.status)}`}>
              {data?.status?.replace('_', ' ').toUpperCase()}
            </Text>
            <Text className="text-xs text-gray-600">
              Total: {formattedAmount}
            </Text>
            <Text className="text-xs text-gray-500">
              {formatDate(data?.created_at)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RepairCard;
