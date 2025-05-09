import React from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import Invoice from "@/src/components/common/Invoice";
import { FontAwesome6 } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { printInvoice, generateInvoicePDF } from "@/src/components/GeneratePDF";

const Preview = ({ isPurchase, formValue }) => {
  const { profileData } = useSelector((state) => state.userSlices);

  // Handle printing the preview bill
  const handlePrint = async () => {
    try {
      // Show loading indicator
      Alert.alert("Preparing Print", "Please wait while we prepare your bill for printing...");
      
      // Print the bill
      const result = await printInvoice(
        formValue,
        profileData,
        isPurchase
      );
      
      if (!result.success) {
        Alert.alert("Error", "Failed to print bill. Please try again.");
      }
    } catch (error) {
      console.error("Printing error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  // Handle saving as PDF
  const handleSaveAsPDF = async () => {
    try {
      // Show loading indicator
      Alert.alert("Generating PDF", "Please wait while we generate your bill...");
      
      // Generate PDF
      const result = await generateInvoicePDF(
        formValue,
        profileData,
        isPurchase,
        `${isPurchase ? 'purchase' : 'sale'}_bill_preview`
      );
      
      if (!result.success) {
        Alert.alert("Error", "Failed to generate PDF. Please try again.");
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <View className="h-full p-3">
      <Invoice isPreview={true} formValue={formValue} isPurchase={isPurchase} />
      
      {/* Print and Save buttons */}
      <View className="flex-row justify-end mt-4 space-x-4 pr-2">
        <TouchableOpacity 
          onPress={handlePrint}
          className="bg-primary px-4 py-2 rounded-md flex-row items-center"
        >
          <FontAwesome6 name="print" size={16} color="white" />
          <View style={{ width: 8 }} />
          <FontAwesome6 name="play" size={10} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleSaveAsPDF}
          className="bg-primary px-4 py-2 rounded-md flex-row items-center"
        >
          <FontAwesome6 name="file-pdf" size={16} color="white" />
          <View style={{ width: 8 }} />
          <FontAwesome6 name="download" size={10} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Preview;
