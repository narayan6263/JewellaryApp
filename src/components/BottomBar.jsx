import React from "react";
import Entypo from "@expo/vector-icons/Entypo";
import { Text, TouchableOpacity, View } from "react-native";

const BottomBar = ({ navigation }) => {
  const { navigate } = navigation;

  const buttons = [
    { label: "Sale", abbr: "SI", screen: "SaleInvoice" },
    { label: "Purchase", abbr: "PI", screen: "PurchaseInvoice" },
    { label: "Order", abbr: "OI", screen: "OrderInvoice" },
    { label: "Repairing", abbr: "RI", screen: "RepairingInvoice" },
    { label: "Loan", abbr: "LI", screen: "LoanInvoice" },
    {
      label: "Products",
      icon: <Entypo name="list" color="white" size={30} />,
      screen: "Products",
    },
  ];

  return (
    <View className="bg-primary p-2.5 pb-1.5 border-t border-gray-2 absolute bottom-0 w-full">
      <View className="rounded-full flex items-center justify-around flex-row inset-x-0 px-1 pb-[12px]">
        {buttons.map(({ label, abbr, icon, screen }) => (
          <TouchableOpacity
            key={label}
            onPress={() => navigate(screen)}
            activeOpacity={0.3}
            className="flex items-center"
          >
            {icon || (
              <Text className="text-white tracking-wider font-bold text-2xl">
                {abbr}
              </Text>
            )}
            <Text className="text-white pt-0.5 text-sm">{label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default BottomBar;
