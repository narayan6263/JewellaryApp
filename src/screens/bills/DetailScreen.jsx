import React from 'react'
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native'
import SectionHeader from "../../components/common/SectionHeader"
import { FontAwesome6 } from "@expo/vector-icons";
import { useSelector } from 'react-redux';
import { printInvoice } from '../../components/GeneratePDF';

const BillDetailScreen = ({ navigation, route }) => {
    const { billData } = route.params || {};
    const { profileData } = useSelector((state) => state.userSlices);
    const isSale = billData?.invoice_type == "1";

    // Handle printing the bill
    const handlePrintBill = async () => {
        try {
            // Show loading indicator
            Alert.alert("Preparing Print", "Please wait while we prepare your bill for printing...");
            
            // Print the bill
            const result = await printInvoice(
                billData,
                profileData,
                !isSale // isPurchase is the opposite of isSale
            );
            
            if (!result.success) {
                Alert.alert("Error", "Failed to print bill. Please try again.");
            }
        } catch (error) {
            console.error("Printing error:", error);
            Alert.alert("Error", "Something went wrong. Please try again.");
        }
    };

    return (
        <View>
            <SectionHeader 
                title="Bill Detail" 
                navigation={navigation} 
                rightComponent={
                    <TouchableOpacity onPress={handlePrintBill} className="mr-4">
                        <FontAwesome6 name="print" size={20} color="#1a237e" />
                    </TouchableOpacity>
                }
            />

            {/* Shop Details */}
            <View className="py-5 px-4 flex flex-row items-center justify-between">
                {/* Info */}
                <View>
                    {/* Address */}
                    <Text className="font-semibold uppercase text-base pb-1 tracking-wider">Tanishq Jwellers</Text>
                    <Text className="tracking-wider text-gray-6 pb-1">Ganpati Chowk</Text>
                    <Text className="tracking-wider text-gray-6 pb-1">since(1999)</Text>
                    <Text className="tracking-wider text-gray-6 pb-1 uppercase">Petlawad-457773</Text>

                    {/* EMail */}
                    <View className="flex flex-row pb-1">
                        <Text className="tracking-wider font-semibold">Email : </Text>
                        <Text className="tracking-wider text-gray-6">man@gmail.com</Text>
                    </View>

                    {/* GSTIN */}
                    <View className="flex flex-row pb-3">
                        <Text className="tracking-wider font-semibold">GSTIN : </Text>
                        <Text className="tracking-wider text-gray-6">30AAAAP0267H1Z1</Text>
                    </View>

                    {/* Date */}
                    <View className="flex flex-row pb-1">
                        <Text className="tracking-wider font-semibold">Date : </Text>
                        <Text className="tracking-wider text-gray-6">11-04-2024</Text>
                    </View>

                    {/* Invoice No */}
                    <View className="flex flex-row">
                        <Text className="tracking-wider font-semibold">Invoice Number : </Text>
                        <Text className="tracking-wider text-gray-6">0045</Text>
                    </View>

                </View>
                {/* Logo */}
                <View>
                    <Image src='../../assets/images/splash.png' className="w-20 h-20" />
                </View>
            </View>

            {/* Costumer */}
            <View className="py-5 px-4">
                {/* Address */}
                <Text className="font-semibold text-base pb-1 tracking-wider">To,</Text>
                <Text className="tracking-wider text-gray-6 pb-1">virendra ji devda, mohanpura</Text>

                {/* EMail */}
                <View className="flex flex-row pb-1">
                    <Text className="tracking-wider font-semibold">Contact : </Text>
                    <Text className="tracking-wider text-gray-6">+91975363009</Text>
                </View>


            </View>

            <View className="border-y flex flex-row justify-end bg-gray-3 border-gray-4">
            </View>
        </View>
    )
}

export default BillDetailScreen
