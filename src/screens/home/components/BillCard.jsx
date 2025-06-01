// import React, { useState } from "react";
// import { currency } from "@/src/contants";
// import { FontAwesome6 } from "@expo/vector-icons";
// import { Text, View, TouchableOpacity, Alert, FlatList, Modal, ActivityIndicator } from "react-native";
// import { useDispatch, useSelector } from "react-redux";
// import { handleDigitsFix } from "@/src/utils";
// import moment from "moment";
// import ProductBillPreview from "@/src/components/ProductBillPreview";
// import { ApiRequest } from "@/src/utils/api";
// import { MANAGE_BILL_API, BASE_URL } from "@/src/utils/api/endpoints";
// import PDFViewer from "@/src/components/PDFViewer";

// const BillCard = ({ item, navigation }) => {
//   const { navigate } = navigation;
//   const isSale = item.invoice_type == "1";
//   const dispatch = useDispatch();
//   const { profileData } = useSelector((state) => state.userSlices);
//   const [showInvoice, setShowInvoice] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editStatus, setEditStatus] = useState(null);
//   const [editError, setEditError] = useState(null);
//   const [billDetails, setBillDetails] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [fetchError, setFetchError] = useState(null);
//   const [pdfUrl, setPdfUrl] = useState(null);



//   // Modify the canEdit check to be more lenient initially
//   // const canEdit = profileData?.id === item.created_by;
//   const canEdit = profileData?.id === item.user_id;

//   const handleEdit = async () => {
//     try {
//       setIsEditing(true);
//       setEditError(null);

//       // Bill detail endpoint
//       const response = await ApiRequest({
//         url: MANAGE_BILL_API.billbyid,  // /bill-detail-by-id
//         method: 'POST',
//         body: {
//           id: item.id,
//           type: isSale ? 'sale' : 'purchase'
//         }
//       });

//       if (response.success) {
//         navigate('ProductForm', { 
//           updateData: response.data,
//           isBillEdit: true,     // Flag to indicate bill edit
//           billType: isSale ? 'sale' : 'purchase'
//         });
//       }
//     } catch (error) {
//       const errorMessage = error.message || "Failed to edit bill";
//       setEditError(errorMessage);
//       console.error('Edit Error:', {
//         message: errorMessage,
//         error
//       });
//     } finally {
//       setIsEditing(false);
//     }
//   };

//   // Handle invoice display
//   const handlePDFGeneration = async () => {
//     try {
//       // Get the full PDF URL by combining BASE_URL and the endpoint
//       const pdfUrl = `${BASE_URL}${MANAGE_BILL_API.pdf(item.id)}`;
//       setBillDetails({ pdfUrl });
//       setShowInvoice(true);
//     } catch (error) {
//       console.error('PDF Generation Error:', error);
//       Alert.alert('Error', 'Failed to open PDF. Please try again.');
//     }
//   };

//   // Updated renderBillItem with all jewelry details
//   const renderBillItem = ({ item: product }) => (
//     <View className="flex-row justify-between py-2 border-b border-gray-200">
//       <View className="flex-1">
//         <Text className="text-sm font-medium">
//           {product.product?.name || 'Unnamed Product'}
//         </Text>
//         <Text className="text-xs text-gray-500">
//           HUID: {product.product?.huid || 'N/A'}
//         </Text>
//         <Text className="text-xs text-gray-500">
//           HSN: {product.product?.hsn_id || 'N/A'}
//         </Text>
//         {product.product?.size && (
//           <Text className="text-xs text-gray-500">
//             Size: {product.product.size}
//           </Text>
//         )}
//         <Text className="text-xs text-gray-500">
//           Wastage: {product.wastage || '0'}%
//         </Text>
//       </View>
      
//       <View className="items-end">
//         <Text className="text-sm">
//           {handleDigitsFix(product.gross_weight)}g (Gross)
//         </Text>
//         <Text className="text-xs text-gray-500">
//           Net: {handleDigitsFix(product.net_weight)}g
//         </Text>
//         <Text className="text-xs text-gray-500">
//           Fine: {handleDigitsFix(product.fine_weight)}g
//         </Text>
//         <Text className="text-xs text-gray-500">
//           Touch: {product.tounch || '916'}
//         </Text>
//         <Text className="text-sm font-medium text-primary">
//           {currency} {handleDigitsFix(product.net_price)}
//         </Text>
//         <Text className="text-xs text-gray-500">
//           Making: {product.making_type} - {currency}{handleDigitsFix(product.making_charge)}
//         </Text>
//         {product.rate && (
//           <Text className="text-xs text-gray-500">
//             Rate: {currency}{handleDigitsFix(product.rate.price)}
//           </Text>
//         )}
//       </View>
//     </View>
//   );

//   // Prepare data for the ProductBillPreview component
//   const prepareInvoiceData = () => {
//     return {
//       ...item,
//       customer_name: item.name,
//       invoice_number: item.id,
//       items: item.items || [],
//       total: item.total,
//       amount_paid: item.amount_paid,
//       totalPrice: item.total,
//       selectedProduct: item.items?.map(product => {
//         // Format each product for the ProductBillPreview
//         const itemType = isSale ? "sale" : "purchase";
//         return {
//           name: product.product?.name || "Product",
//           size: product.product?.size,
//           interest_type: product.interest_type,
//           interest_rate: product.interest_rate || "0",
//           [itemType]: {
//             tounch: product.tounch || "916",
//             wastage: product.wastage || "0",
//             gross_weight: product.gross_weight,
//             net_weight: product.net_weight,
//             fine_weight: product.fine_weight,
//             rate: product.rate || { price: "0" },
//             making_type: product.making_type || "PG",
//             making_charge: product.making_charge,
//             net_price: product.net_price
//           }
//         };
//       }) || []
//     };
//   };

//   const mockProductData = {
//     id: "123",
//     type: "sale",
//     name: "Gold Necklace",
//     huid: "HUID123",
//     hsn_id: {
//       value: "HSN001",
//       label: "Jewelry",
//       variation: [
//         { id: "var1", name: "Variation 1", price: 100 }
//       ]
//     },
//     size: "Medium",
//     remark: "Special design",
//     comment: "Handle with care",
//     image: null,
//     additional_image: null,
//     gross_weight: "10.000",
//     less_weight: "0.500",
//     net_weight: "9.500",
//     wastage: "5",
//     tounch: "22",
//     fine_weight: "9.000",
//     rate: {
//       label: "Base Rate",
//       value: "base",
//       price: "5000"
//     },
//     making_type: {
//       label: "Per Gram",
//       value: "PG"
//     },
//     making_charge: "200.00",
//     metal_value: "4500.00",
//     cutting_enabled: true,
//     interest_enabled: true,
//     interest_type: {
//       label: "Flat",
//       value: "1"
//     },
//     interest_rate: "5",
//     interest_amount: "50.00",
//     bill_date: "2024-03-20T10:00:00Z",
//     payment_date: "2024-03-21T10:00:00Z",
//     interest_start_date: "2024-03-22T10:00:00Z",
//     grace_period_enabled: true,
//     grace_period_days: "10",
//     interest_notes: "Interest applicable",
//     charges_json: [
//       { name: "Service Charge", amount: "100.00" }
//     ],
//     tax_json: [
//       { name: "GST", amount: "18" }
//     ],
//     custom_fields: [
//       {
//         label: "Custom Field 1",
//         value: "Value 1",
//         unit: { label: "Unit 1", value: "U1" },
//         showInBill: true
//       }
//     ],
//     bill_display_settings: {
//       showSizeInBill: true,
//       showGrossWeightInBill: true,
//       showLessWeightInBill: true,
//       showNetWeightInBill: true,
//       showWastageInBill: true,
//       showTounchInBill: true,
//       showFineWeightInBill: true,
//       showRateInBill: true,
//       showMakingChargeInBill: true,
//       showHuidInBill: true,
//       showHsnInBill: true,
//       showPriceInBill: true,
//       showTaxInBill: true,
//       showChargesInBill: true,
//       showCommentInBill: true
//     },
//     payment_history: [
//       {
//         amount: "1000.00",
//         date: "2024-03-23T10:00:00Z",
//         interest_paid: "50.00",
//         remaining_balance: "950.00"
//       }
//     ]
//   };

//   return (
//     <>
//       <View
//         className={`rounded-md border border-gray-3 my-2 ${
//           isSale ? "bg-gray-2 ml-auto" : "bg-gray-3"
//         }  shadow-xl w-[300px]`}
//       >
//         {/* Status Banner - Show when editing */}
//         {isEditing && (
//           <View className="bg-blue-100 p-2">
//             <Text className="text-blue-800 text-center">Editing in progress...</Text>
//           </View>
//         )}

//         {/* Error Banner - Show when there's an error */}
//         {editError && (
//           <View className="bg-red-100 p-2">
//             <Text className="text-red-800 text-center">{editError}</Text>
//             <TouchableOpacity 
//               onPress={() => setEditError(null)}
//               className="absolute right-2 top-2"
//             >
//               <FontAwesome6 name="times" size={16} color="#991B1B" />
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Success Banner - Show after successful edit */}
//         {editStatus === 'success' && (
//           <View className="bg-green-100 p-2">
//             <Text className="text-green-800 text-center">Successfully updated!</Text>
//             <TouchableOpacity 
//               onPress={() => setEditStatus(null)}
//               className="absolute right-2 top-2"
//             >
//               <FontAwesome6 name="times" size={16} color="#166534" />
//             </TouchableOpacity>
//           </View>
//         )}

//         {/* Title & Actions */}
//         <View className="border-b p-3 pb-2 flex flex-row items-center justify-between border-gray-4">
//           <View className="flex-row items-center">
//             <Text className="font-bold">{isSale ? "Sale" : "Purchase"} Bill</Text>
//             {/* Add debug info */}
//             <Text className="text-xs text-gray-500 ml-2">
//               ID: {profileData?.id}, Creator: {item.created_by}
//             </Text>
//           </View>

//           <View className="flex-row items-center space-x-3">
//             {/* Edit Button - Always show for now */}
//             <TouchableOpacity 
//               activeOpacity={0.6} 
//               onPress={handleEdit}
//               disabled={isEditing}
//               style={{ padding: 10 }}
//             >
//               {isEditing ? (
//                 <ActivityIndicator size="small" color="#4F46E5" />
//               ) : (
//                 <FontAwesome6 
//                   name="pen-to-square" 
//                   color={isEditing ? "#9CA3AF" : "#4F46E5"} 
//                   size={18} 
//                 />
//               )}
//             </TouchableOpacity>

//             {/* PDF Button */}
//             <TouchableOpacity 
//               activeOpacity={0.6} 
//               onPress={handlePDFGeneration}
//               disabled={isLoading}
//               style={{ padding: 10 }}
//             >
//               {isLoading ? (
//                 <ActivityIndicator size="small" color="#000" />
//               ) : (
//                 <FontAwesome6 name="file-pdf" color="black" size={18} />
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Last Updated Info */}
//         {item.updated_at && (
//           <View className="px-3 py-1 bg-gray-50">
//             <Text className="text-xs text-gray-500">
//               Last updated: {new Date(item.updated_at).toLocaleString()}
//             </Text>
//           </View>
//         )}

//         {/* Bill Items Section */}
//         <View className="p-3">
//           <Text className="font-medium text-gray-700 mb-2">Items:</Text>
//           <FlatList
//             data={item.items || []}
//             renderItem={renderBillItem}
//             keyExtractor={(item, index) => index.toString()}
//             ListEmptyComponent={
//               <Text className="text-gray-500 text-center py-2">
//                 No items in this bill
//               </Text>
//             }
//           />
//         </View>

//         {/* Payment Summary */}
//         <View className="p-3 bg-gray-50 border-t border-gray-200">
//           <View className="flex-row justify-between mb-1">
//             <Text className="font-medium">Total Amount:</Text>
//             <Text className="font-medium">
//               {currency} {handleDigitsFix(item.total)}
//             </Text>
//           </View>
//           <View className="flex-row justify-between mb-1">
//             <Text>Amount Paid:</Text>
//             <Text>{currency} {handleDigitsFix(item.amount_paid)}</Text>
//           </View>
//           <View className="flex-row justify-between">
//             <Text className="font-semibold">Balance:</Text>
//             <Text className="font-semibold text-primary">
//               {currency} {handleDigitsFix(item.total - item.amount_paid)}
//             </Text>
//           </View>
//         </View>

//         {/* Payment Details */}
//         <View className="p-3">
//           <Text className="text-sm text-gray-600">
//             Payment Mode: {item.payment_mode}
//           </Text>
//           <Text className="text-sm text-gray-600">
//             Date: {moment(item.payment_date).format('DD MMM YYYY, hh:mm A')}
//           </Text>
//         </View>
//       </View>

//       {/* PDF Viewer Modal */}
//       <Modal
//         visible={showInvoice}
//         animationType="slide"
//         onRequestClose={() => setShowInvoice(false)}
//       >
//         {billDetails?.pdfUrl && (
//           <PDFViewer 
//             pdfUrl={billDetails.pdfUrl}
//             onClose={() => setShowInvoice(false)}
//             title={`${isSale ? "Sale" : "Purchase"} Bill #${item.id}`}
//           />
//         )}
//       </Modal>
//     </>
//   );
// };

// export default BillCard;
import React, { useState } from "react";
import { currency } from "@/src/contants";
import { FontAwesome6 } from "@expo/vector-icons";
import { Text, View, TouchableOpacity, Alert, FlatList, Modal, ActivityIndicator } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { handleDigitsFix } from "@/src/utils";
import moment from "moment";
import ProductBillPreview from "@/src/components/ProductBillPreview";
import { ApiRequest } from "@/src/utils/api";
import { MANAGE_BILL_API, BASE_URL } from "@/src/utils/api/endpoints";
import PDFViewer from "@/src/components/PDFViewer";

const BillCard = ({ item, navigation }) => {
  const { navigate } = navigation;
  const isSale = item.invoice_type === "1";
  const dispatch = useDispatch();
  const { profileData } = useSelector((state) => state.userSlices);

  // Debug logs
  console.log("profileData:", profileData);
  console.log("item.created_by:", item.created_by);
  console.log("item.user_id:", item.user_id); // Check if user_id exists
  console.log("item.id:", item.id); // Verify bill ID
  console.log("canEdit:", item.created_by === undefined || profileData?.id === item.created_by);

  const [showInvoice, setShowInvoice] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState(null);
  const [billDetails, setBillDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Allow edit if created_by is undefined or matches user ID
  const canEdit = item.created_by === undefined || profileData?.id === item.created_by;

  const handleEdit = async () => {
  if (!canEdit) {
    Alert.alert(
      "Permission Denied",
      "Only the bill creator can edit this bill.",
      [{ text: "OK" }]
    );
    return;
  }

  try {
    setIsEditing(true);
    setEditError(null);
    console.log("Fetching bill details for ID:", item.id);
    console.log("API endpoint:", MANAGE_BILL_API.billbyid);
    console.log("Request body:", { id: String(item.id), type: isSale ? "sale" : "purchase", user_id: profileData?.id });

    const response = await ApiRequest({
      url: MANAGE_BILL_API.billbyid,
      method: "POST",
      body: {
        id: String(item.id), // Convert ID to string
        type: isSale ? "sale" : "purchase",
        user_id: profileData?.id, // Include user_id if required
      },
    });

    console.log("API response:", response);
    if (response.success) {
      navigate("ProductForm", {
        updateData: response.data,
        isBillEdit: true,
        billType: isSale ? "sale" : "purchase",
        billId: item.id,
      });
    } else {
      throw new Error(response.message || "Failed to fetch bill details");
    }
  } catch (error) {
    const errorMessage = error.message || "Failed to initiate bill editing";
    setEditError(errorMessage);
    Alert.alert("Error", errorMessage);
    console.error("Edit Error:", { message: errorMessage, error, response: error.response });
  } finally {
    setIsEditing(false);
    console.log("Edit operation completed, isEditing:", false);
  }
};

  const handlePDFGeneration = async () => {
    try {
      setIsLoading(true);
      const pdfUrl = `${BASE_URL}${MANAGE_BILL_API.pdf(item.id)}`;
      console.log("Generating PDF for URL:", pdfUrl);
      setBillDetails({ pdfUrl });
      setShowInvoice(true);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      Alert.alert("Error", "Failed to open PDF. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderBillItem = ({ item: product }) => (
    <View className="flex-row justify-between py-2 border-b border-gray-200">
      <View className="flex-1">
        <Text className="text-sm font-medium">
          {product.product?.name || "Unnamed Product"}
        </Text>
        <Text className="text-xs text-gray-500">
          HUID: {product.product?.huid || "N/A"}
        </Text>
        <Text className="text-xs text-gray-500">
          HSN: {product.product?.hsn_id || "N/A"}
        </Text>
        {product.product?.size && (
          <Text className="text-xs text-gray-500">
            Size: {product.product.size}
          </Text>
        )}
        <Text className="text-xs text-gray-500">
          Wastage: {product.wastage || "0"}%
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-sm">
          {handleDigitsFix(product.gross_weight)}g (Gross)
        </Text>
        <Text className="text-xs text-gray-500">
          Net: {handleDigitsFix(product.net_weight)}g
        </Text>
        <Text className="text-xs text-gray-500">
          Fine: {handleDigitsFix(product.fine_weight)}g
        </Text>
        <Text className="text-xs text-gray-500">
          Touch: {product.tounch || "916"}
        </Text>
        <Text className="text-sm font-medium text-primary">
          {currency} {handleDigitsFix(product.net_price)}
        </Text>
        <Text className="text-xs text-gray-500">
          Making: {product.making_type} - {currency}
          {handleDigitsFix(product.making_charge)}
        </Text>
        {product.rate && (
          <Text className="text-xs text-gray-500">
            Rate: {currency}
            {handleDigitsFix(product.rate.price)}
          </Text>
        )}
      </View>
    </View>
  );

  const prepareInvoiceData = () => ({
    ...item,
    customer_name: item.name,
    invoice_number: item.id,
    items: item.items || [],
    total: item.total,
    amount_paid: item.amount_paid,
    totalPrice: item.total,
    selectedProduct:
      item.items?.map((product) => {
        const itemType = isSale ? "sale" : "purchase";
        return {
          name: product.product?.name || "Product",
          size: product.product?.size,
          interest_type: product.interest_type,
          interest_rate: product.interest_rate || "0",
          [itemType]: {
            tounch: product.tounch || "916",
            wastage: product.wastage || "0",
            gross_weight: product.gross_weight,
            net_weight: product.net_weight,
            fine_weight: product.fine_weight,
            rate: product.rate || { price: "0" },
            making_type: product.making_type || "PG",
            making_charge: product.making_charge,
            net_price: product.net_price,
          },
        };
      }) || [],
  });

  return (
    <>
      <View
        className={`rounded-md border border-gray-3 my-2 ${
          isSale ? "bg-gray-2 ml-auto" : "bg-gray-3"
        } shadow-xl w-[300px]`}
      >
        {editError && (
          <View className="bg-red-100 p-2">
            <Text className="text-red-800 text-center">{editError}</Text>
            <TouchableOpacity
              onPress={() => setEditError(null)}
              className="absolute right-2 top-2"
            >
              <FontAwesome6 name="times" size={16} color="#991B1B" />
            </TouchableOpacity>
          </View>
        )}

        <View className="border-b p-3 pb-2 flex flex-row items-center justify-between border-gray-4">
          <View className="flex-row items-center">
            <Text className="font-bold">{isSale ? "Sale" : "Purchase"} Bill</Text>
            <Text className="text-xs text-gray-500 ml-2">
              ID: {profileData?.id}, Creator: {item.created_by ?? "Unknown"}
            </Text>
          </View>
          <View className="flex-row items-center space-x-3">
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={handleEdit}
              disabled={isEditing || !canEdit}
              style={{ padding: 10 }}
            >
              {isEditing ? (
                <ActivityIndicator size="small" color="#4F46E5" />
              ) : (
                <FontAwesome6
                  name="pen-to-square"
                  color={canEdit && !isEditing ? "#4F46E5" : "#9CA3AF"}
                  size={18}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={handlePDFGeneration}
              disabled={isLoading}
              style={{ padding: 10 }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <FontAwesome6 name="file-pdf" color="black" size={18} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {item.updated_at && (
          <View className="px-3 py-1 bg-gray-50">
            <Text className="text-xs text-gray-500">
              Last updated: {new Date(item.updated_at).toLocaleString()}
            </Text>
          </View>
        )}

        <View className="p-3">
          <Text className="font-medium text-gray-700 mb-2">Items:</Text>
          <FlatList
            data={item.items || []}
            renderItem={renderBillItem}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={
              <Text className="text-gray-500 text-center py-2">
                No items in this bill
              </Text>
            }
          />
        </View>

        <View className="p-3 bg-gray-50 border-t border-gray-200">
          <View className="flex-row justify-between mb-1">
            <Text className="font-medium">Total Amount:</Text>
            <Text className="font-medium">
              {currency} {handleDigitsFix(item.total)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text>Amount Paid:</Text>
            <Text>
              {currency} {handleDigitsFix(item.amount_paid)}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="font-semibold">Balance:</Text>
            <Text className="font-semibold text-primary">
              {currency} {handleDigitsFix(item.total - item.amount_paid)}
            </Text>
          </View>
        </View>

        <View className="p-3">
          <Text className="text-sm text-gray-600">
            Payment Mode: {item.payment_mode}
          </Text>
          <Text className="text-sm text-gray-600">
            Date: {moment(item.payment_date).format("DD MMM YYYY, hh:mm A")}
          </Text>
        </View>
      </View>

      <Modal
        visible={showInvoice}
        animationType="slide"
        onRequestClose={() => setShowInvoice(false)}
      >
        {billDetails?.pdfUrl && (
          <PDFViewer
            pdfUrl={billDetails.pdfUrl}
            onClose={() => setShowInvoice(false)}
            title={`${isSale ? "Sale" : "Purchase"} Bill #${item.id}`}
          />
        )}
      </Modal>
    </>
  );
};

export default BillCard;