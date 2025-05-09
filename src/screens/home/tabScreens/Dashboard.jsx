import React from "react";
import { ScrollView, Text, TouchableOpacity, View, Alert } from "react-native";
import { useSelector } from "react-redux";
import { generateInvoicePDF, printInvoice } from "@/src/components/GeneratePDF";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const Dashboard = ({ navigation }) => {
  const { profileData } = useSelector((state) => state.userSlices);

  return (
    <View className="px-4 bg-white h-full py-3">
      <View className="w-full pt-2 flex flex-row justify-between rounded-md">
        <View className="w-1/3 pr-2">
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex bg-primary/10 border border-gray-1 rounded-md py-4 items-center"
          >
            <Text className="text-primary tracking-wider font-bold text-2xl">
              SR
            </Text>
            <Text className="text-primary pt-1 text-center text-xs">
              Sale Reports
            </Text>
          </TouchableOpacity>
        </View>

        <View className="w-1/3">
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex bg-primary/10 border border-gray-1 rounded-md py-4 items-center"
          >
            <Text className="text-primary tracking-wider font-bold text-2xl">
              RR
            </Text>
            <Text className="text-primary pt-1 text-center text-xs">
              Repairing Reports
            </Text>
          </TouchableOpacity>
        </View>

        <View className="w-1/3 pl-2">
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex bg-primary/10 border border-gray-1 rounded-md py-4 items-center"
          >
            <Text className="text-primary tracking-wider font-bold text-2xl">
              PR
            </Text>
            <Text className="text-primary pt-1 text-center text-xs">
              Purchase Reports
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-6">
        <TouchableOpacity
          onPress={() => navigation.navigate('AdminAuth')}
          activeOpacity={0.8}
          className="flex-row items-center justify-between bg-primary/5 border border-primary/20 rounded-xl p-4"
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mr-4">
              <FontAwesome6 name="clipboard-list" size={20} color="#5750F1" />
            </View>
            <View>
              <Text className="text-lg font-semibold text-gray-800">System Logs</Text>
              <Text className="text-sm text-gray-500">View detailed system activity</Text>
            </View>
          </View>
          <FontAwesome6 name="chevron-right" size={16} color="#5750F1" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Dashboard;
