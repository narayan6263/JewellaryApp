import React, { useState } from "react";
import { View, TouchableOpacity, Alert, ScrollView, SafeAreaView } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { Text } from "react-native";
import { WebView } from 'react-native-webview';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { ApiRequest } from "@/src/utils/api";
import { OR_INVOICE_API } from "@/src/utils/api/endpoints";
import { setInvoiceList } from "@/src/redux/reducers/invoice.reducer";
import ShowToast from "@/src/components/common/ShowToast";
import ORHeader from "./ORHeader";
import { MANAGE_LOGS_API } from "@/src/utils/api/endpoints";

const ORPreview = ({ navigation, route }) => {
  const { formValue } = route.params;
  const { profileData } = useSelector((state) => state.userSlices);
  const [pdfUri, setPdfUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const generateItemDetails = (item) => {
    return [
      { label: 'Item', value: item.name || "Not Specified" },
      { label: 'HUID', value: item.huid || "-" },
      { label: 'HSN', value: item.hsn_id || "-" },
      { label: 'GW', value: `${parseFloat(item.sale?.gross_weight || 0).toFixed(2)}g` },
      { label: 'NW', value: `${parseFloat(item.sale?.net_weight || 0).toFixed(2)}g` },
      { label: 'T+W', value: `${parseFloat(item.sale?.tounch || 0).toFixed(1)}+${parseFloat(item.sale?.wastage || 0).toFixed(1)}%` },
      { label: 'FW', value: `${parseFloat(item.sale?.fine_weight || 0).toFixed(2)}g` },
      { label: 'Rate', value: `₹${parseFloat(item.sale?.rate || 0).toFixed(0)}` },
      { label: 'MV', value: `₹${parseFloat(item.sale?.metal_value || 0).toFixed(0)}` },
      { label: 'MC', value: `₹${parseFloat(item.sale?.making_charge || 0).toFixed(0)}` },
      { label: 'MA', value: `₹${parseFloat(item.sale?.making_amount || 0).toFixed(0)}` },
      { label: 'POL', value: `₹${parseFloat(item.sale?.polishing || 0).toFixed(0)}` },
      { label: 'ST', value: `₹${parseFloat(item.sale?.stone_setting || 0).toFixed(0)}` },
      { label: 'SUB', value: `₹${parseFloat(item.sale?.subtotal || 0).toFixed(0)}` },
      { label: 'TAX', value: `${parseFloat(item.sale?.tax || 0).toFixed(1)}%` },
      { label: 'T.AMT', value: `₹${parseFloat(item.sale?.tax_amount || 0).toFixed(0)}` },
      { label: 'TOTAL', value: `₹${parseFloat(item.sale?.net_price || 0).toFixed(0)}` }
    ];
  };

  const generateHTMLContent = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bill Preview</title>
          <style>
            body { 
              font-family: Arial, sans-serif;
              padding: 8px;
              margin: 0;
              color: #333;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 8px;
              padding-bottom: 8px;
              border-bottom: 1px solid #333;
            }
            .company-name { 
              font-size: 16px; 
              font-weight: bold;
              margin-bottom: 2px;
            }
            .company-details { 
              font-size: 10px;
              color: #666;
              line-height: 1.2;
            }
            .customer-info {
              display: flex;
              justify-content: space-between;
              border-bottom: 1px solid #ddd;
              padding: 4px 0;
              margin-bottom: 8px;
              font-size: 10px;
            }
            .items-container {
              display: flex;
              flex-direction: column;
              gap: 8px;
              margin-bottom: 8px;
            }
            .item-row {
              padding: 4px;
              border: 1px solid #ddd;
              border-radius: 4px;
            }
            .item-number {
              font-size: 9px;
              color: #666;
              margin-bottom: 4px;
              padding-bottom: 2px;
              border-bottom: 1px dashed #eee;
            }
            .details-container {
              display: flex;
              flex-wrap: wrap;
              gap: 4px;
            }
            .detail-cell {
              display: inline-flex;
              align-items: center;
              border: 1px solid #ddd;
              padding: 2px 4px;
              min-height: 24px;
            }
            .detail-content {
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .detail-label {
              font-size: 8px;
              color: #666;
              text-transform: uppercase;
            }
            .detail-value {
              font-size: 11px;
              font-weight: 500;
            }
            .totals {
              display: flex;
              justify-content: flex-end;
              gap: 12px;
              border-top: 1px solid #333;
              padding-top: 4px;
              margin-top: 8px;
            }
            .total-item {
              text-align: right;
            }
            .total-label {
              font-size: 9px;
              color: #666;
            }
            .total-value {
              font-size: 11px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">TANISHQ JEWELLERS</div>
            <div class="company-details">
              <div>Sector-19, Dwarka | Contact: +91 98XXXXXXXX</div>
              <div>GSTIN: 29XXXXX9792Q1Z4</div>
            </div>
          </div>

          <div class="customer-info">
            <div><b>Name:</b> ${formValue?.client?.label || "Not Specified"}</div>
            <div><b>Ph:</b> ${formValue?.client?.phone || "N/A"}</div>
            <div><b>Date:</b> ${new Date().toLocaleDateString()}</div>
          </div>

          <div class="items-container">
            ${(formValue.selectedProduct || []).map((product, index) => `
              <div class="item-row">
                <div class="item-number">Item ${index + 1}</div>
                <div class="details-container">
                  ${generateItemDetails(product).map(item => `
                    <div class="detail-cell">
                      <div class="detail-content">
                        <div class="detail-label">${item.label}</div>
                        <div class="detail-value">${item.value}</div>
          </div>
          </div>
                  `).join('')}
          </div>
          </div>
            `).join('')}
          </div>

          ${formValue.remark ? `
            <div style="font-size: 9px; color: #666; margin: 4px 0;">
              <b>Note:</b> ${formValue.remark}
            </div>
          ` : ''}

          <div class="totals">
            <div class="total-item">
              <div class="total-label">Amount</div>
              <div class="total-value">₹${parseFloat(formValue.totalPrice || 0).toFixed(2)}</div>
            </div>
            <div class="total-item">
              <div class="total-label">Paid</div>
              <div class="total-value">₹${parseFloat(formValue.amount_paid || 0).toFixed(2)}</div>
            </div>
            <div class="total-item">
              <div class="total-label">Balance</div>
              <div class="total-value">₹${(parseFloat(formValue.totalPrice || 0) - parseFloat(formValue.amount_paid || 0)).toFixed(2)}</div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    try {
      setLoading(true);
      await Print.printAsync({
        html: generateHTMLContent()
      });
      ShowToast("Print job sent successfully");
    } catch (error) {
      console.error("Print error:", error);
      Alert.alert("Error", "Failed to print bill. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      setLoading(true);
      const { uri } = await Print.printToFileAsync({
        html: generateHTMLContent()
      });
      setPdfUri(uri);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
        ShowToast('Bill shared successfully');
      } else {
        Alert.alert("Error", "Sharing is not available on this device");
      }
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("Error", "Failed to share bill. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!formValue?.client?.id) {
        throw new Error("Client information is required");
      }

      if (!formValue?.selectedProduct?.length) {
        throw new Error("At least one product is required");
      }

      if (!formValue?.totalPrice) {
        throw new Error("Total price is required");
      }

      // Prepare client data
      const clientData = {
        id: formValue?.client?.id,
        name: formValue?.client?.name,
        role_id: formValue?.client?.role_id,
        phone: formValue?.client?.phone || "",
        email: formValue?.client?.email || "",
        address: formValue?.client?.address || "",
        gstin: formValue?.client?.gstin || "",
        contact_person: formValue?.client?.contact_person || "",
        company_name: formValue?.client?.company_name || "",
        state: formValue?.client?.state || "",
        pincode: formValue?.client?.pincode || "",
        pan: formValue?.client?.pan || ""
      };

      // Prepare invoice data
      const invoiceData = {
        invoiceType: formValue?.invoiceType || "order",
        user_contact_id: clientData.id,
        totalPrice: formValue?.totalPrice,
        huid: formValue?.huid || "",
        hsn_id: formValue?.hsn_id || "",
        remark: formValue?.remark || "",
        user_id: profileData?.id || "13",
        status: formValue?.status || "in_progress",
        payment_mode: formValue?.payment_mode || "cash",
        amount_paid: formValue?.amount_paid || "0",
        bill_display_settings: JSON.stringify(formValue?.bill_display_settings || {
          showSizeInBill: true,
          showWeightInBill: true,
          showRateInBill: true,
          showMakingInBill: true,
          showTaxInBill: true,
          showCommentInBill: false
        }),
        payment_date: new Date().toISOString().split('T')[0],
        bill_total: formValue?.totalPrice,
        tax: formValue?.selectedProduct?.[0]?.tax || "0",
        additional_charges: "0",
        total: formValue?.totalPrice,
        invoice_type: "1",
        client: clientData
      };

      // Prepare details data
      const detailsData = formValue?.selectedProduct?.map(product => ({
        product_id: product?.product_id || "",
        name: product?.name || "",
        size: product?.size || "",
        gross_weight: product?.gross_weight || "0",
        less_weight: product?.less_weight || "0",
        net_weight: product?.net_weight || "0",
        tounch: product?.tounch || "0",
        wastage: product?.wastage || "0",
        fine_weight: product?.fine_weight || "0",
        rate: product?.rate || "0",
        metal_value: product?.metal_value || "0",
        making_type: product?.making_type?.value || "per_gram",
        making_charge: product?.making_charge || "0",
        making_amount: product?.making_amount || "0",
        polishing: product?.polishing || "0",
        stone_setting: product?.stone_setting || "0",
        additional_charges: product?.additional_charges || "0",
        subtotal: product?.subtotal || "0",
        tax: product?.tax || "0",
        tax_amount: product?.tax_amount || "0",
        final_amount: product?.final_amount || "0"
      }));

      // Make API request
      const response = await ApiRequest({
        url: OR_INVOICE_API.create,
        method: "POST",
        body: {
          invoice: invoiceData,
          details: detailsData
        }
      });

      if (response.success) {
        // Create activity log data
        const logData = {
          userName: profileData?.name || "Unknown User",
          productName: detailsData[0]?.name || "Multiple Items",
          id: response.data.invoice.id,
          type: invoiceData.invoiceType.toLowerCase(),
          amount: invoiceData.totalPrice,
          invoiceId: response.data.invoice.id,
          action: "CREATE",
          entityType: "INVOICE",
          timestamp: new Date().toISOString(),
          metadata: JSON.stringify({
            customerName: clientData.name || "",
            items: detailsData.map(item => ({
              name: item?.name || "",
              quantity: 1,
              price: item?.final_amount || "0"
            }))
          })
        };

        // Update Redux store with the new invoice
        dispatch(setInvoiceList([{
          ...invoiceData,
          id: response.data.invoice.id,
          client: clientData,
          selectedProduct: detailsData
        }]));
        
        ShowToast(response.message || "Invoice created successfully!");
        
        // Navigate to OrderDetails
        navigation.navigate('OrderDetails', { 
          id: response.data.invoice.id,
          refresh: true 
        });
      } else {
        throw new Error(response.message || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Submit error:", error);
      Alert.alert(
        "Error", 
        error.message || "Failed to create invoice. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ORHeader 
        title="Bill Preview" 
        navigation={navigation}
        showNext={false}
      />
      
      <ScrollView className="flex-1">
        <WebView
          source={{ html: generateHTMLContent() }}
          style={{ flex: 1, height: 800 }}
        />
      </ScrollView>
      
      {/* Action Buttons */}
      <View className="flex-row justify-end p-4 bg-white border-t border-gray-200">
        <TouchableOpacity 
          onPress={handleSubmit}
          className="bg-red-600 px-4 py-2 rounded-lg mr-4 flex-row items-center"
          disabled={loading}
        >
          <FontAwesome6 name="check" size={16} color="white" />
          <Text className="text-white ml-2">Submit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleShare}
          className="bg-primary px-4 py-2 rounded-lg mr-4 flex-row items-center"
          disabled={loading}
        >
          <FontAwesome6 name="share" size={16} color="white" />
          <Text className="text-white ml-2">Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handlePrint}
          className="bg-primary px-4 py-2 rounded-lg flex-row items-center"
          disabled={loading}
        >
          <FontAwesome6 name="print" size={16} color="white" />
          <Text className="text-white ml-2">Print</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ORPreview; 