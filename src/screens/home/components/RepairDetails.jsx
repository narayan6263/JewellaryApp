// // import React, { useState, useEffect } from "react";
// // import { Text, View, TouchableOpacity, FlatList, ScrollView, ActivityIndicator, Alert } from "react-native";
// // import { FontAwesome6 } from "@expo/vector-icons";
// // import { currency } from "@/src/contants";
// // import { handleDigitsFix } from "@/src/utils";
// // import moment from "moment";
// // import { ApiRequest } from "@/src/utils/api";
// // import { OR_INVOICE_API, MANAGE_LOGS_API, MANAGE_INVENTORY_API } from "@/src/utils/api/endpoints";
// // import ShowToast from "@/src/components/common/ShowToast";
// // import { useSelector, useDispatch } from "react-redux";
// // import { setInvoiceList, deleteInvoice, updateInvoice } from "@/src/redux/slices/invoiceSlice";
// // import OrViewer from './OrViewer';

// // const RepairDetails = ({ route, navigation }) => {
// //   const [showInvoice, setShowInvoice] = useState(false);
// //   const [loading, setLoading] = useState(true);
// //   const [repairData, setRepairData] = useState(null);
// //   const [isEditing, setIsEditing] = useState(false);
// //   const [editStatus, setEditStatus] = useState(null);
// //   const [editError, setEditError] = useState(null);
// //   const [statusLoading, setStatusLoading] = useState(false);
// //   const repairId = route?.params?.id;
// //   const shouldRefresh = route?.params?.refresh;
// //   const dispatch = useDispatch();
  
// //   // Get profile data for edit permission check
// //   const { profileData } = useSelector((state) => state.userSlices);
// //   const canEdit = true;

// //   const fetchRepairDetails = async () => {
// //     try {
// //       setLoading(true);
// //       const response = await ApiRequest({
// //         url: OR_INVOICE_API.list(repairId),
// //         method: "GET"
// //       });

// //       if (!response?.success) {
// //         throw new Error(response?.message || "Failed to fetch repair details");
// //       }

// //       const data = response?.data || null;
// //       if (data) {
// //         data.type = data.type || "repair";
// //       }
// //       setRepairData(data);

// //       // If refresh flag is true, also fetch updated invoice list
// //       if (shouldRefresh) {
// //         const listResponse = await ApiRequest({
// //           url: OR_INVOICE_API.listAll,
// //           method: "GET"
// //         });

// //         if (listResponse?.success) {
// //           dispatch(setInvoiceList(listResponse?.data || []));
// //         }
// //       }
// //     } catch (error) {
// //       console.error("Error fetching repair details:", error);
// //       ShowToast(error?.message || "Error fetching repair details");
// //       navigation.goBack();
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Handle delete action
// //   const handleDelete = async () => {
// //     try {
// //       Alert.alert(
// //         "Delete Invoice",
// //         "Are you sure you want to delete this repair invoice?",
// //         [
// //           {
// //             text: "Cancel",
// //             style: "cancel"
// //           },
// //           {
// //             text: "Delete",
// //             style: "destructive",
// //             onPress: async () => {
// //               try {
// //                 setLoading(true);
// //                 const response = await ApiRequest({
// //                   url: OR_INVOICE_API.delete(repairId),
// //                   method: "DELETE"
// //                 });

// //                 if (response.success) {
// //                   ShowToast("Repair invoice deleted successfully");
// //                   dispatch(deleteInvoice(repairId));
// //                   navigation.goBack();
// //                 } else {
// //                   throw new Error(response.message || "Failed to delete repair invoice");
// //                 }
// //               } catch (error) {
// //                 console.error("Delete Error:", error);
// //                 ShowToast(error.message || "Error deleting repair invoice");
// //               } finally {
// //                 setLoading(false);
// //               }
// //             }
// //           }
// //         ]
// //       );
// //     } catch (error) {
// //       console.error("Delete Error:", error);
// //       ShowToast(error.message || "Error deleting repair invoice");
// //     }
// //   };

// //   // Add handleStatusChange function
// //   const handleStatusChange = async (newStatus) => {
// //     try {
// //       setStatusLoading(true);
      
// //       const response = await ApiRequest({
// //         url: MANAGE_INVENTORY_API.updateStatus,
// //         method: "PUT",
// //         body: {
// //           id: repairId,
// //           status: newStatus
// //         }
// //       });

// //       if (!response.success) {
// //         throw new Error(response.message || "Failed to update status");
// //       }

// //       // Update local state
// //       setRepairData(prev => ({
// //         ...prev,
// //         status: newStatus
// //       }));

// //       // Format timestamp to MySQL format (YYYY-MM-DD HH:mm:ss)
// //       const now = new Date();
// //       const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');

// //       // Create log entry for status change
// //       await ApiRequest({
// //         url: MANAGE_LOGS_API.create,
// //         method: "POST",
// //         body: {
// //           userName: profileData?.name || "Unknown User",
// //           action: "STATUS_CHANGE",
// //           entityType: "REPAIR",
// //           id: repairId,
// //           type: "repair",
// //           amount: repairData?.totalPrice || "0",
// //           timestamp: timestamp,
// //           metadata: JSON.stringify({
// //             oldStatus: repairData?.status,
// //             newStatus: newStatus,
// //             items: repairData?.selectedProduct || []
// //           })
// //         }
// //       });

// //       ShowToast("Status updated successfully");
// //     } catch (error) {
// //       console.error("Status update error:", error);
// //       ShowToast(error.message || "Failed to update status");
// //     } finally {
// //       setStatusLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     if (repairId) {
// //       fetchRepairDetails();
// //     } else {
// //       ShowToast("Invalid repair ID");
// //       navigation.goBack();
// //     }
// //   }, [repairId, shouldRefresh]);

// //   const renderRepairItem = ({ item }) => {
// //     if (!item) return null;

// //     const getStatusColor = (status) => {
// //       switch (status) {
// //         case 'available':
// //           return 'bg-green-100 text-green-800';
// //         case 'sold':
// //           return 'bg-red-100 text-red-800';
// //         case 'reserved':
// //           return 'bg-yellow-100 text-yellow-800';
// //         default:
// //           return 'bg-gray-100 text-gray-800';
// //       }
// //     };

// //     return (
// //     <View className="flex-row justify-between py-2 border-b border-gray-200">
// //       <View className="flex-1">
// //           <View className="flex-row items-center justify-between">
// //         <Text className="text-sm font-medium">
// //               {item?.name || 'Unnamed Product'}
// //         </Text>
// //             <View className={`px-2 py-1 rounded-full ${getStatusColor(item?.inventory_status)}`}>
// //               <Text className="text-xs capitalize">
// //                 {item?.inventory_status || 'unknown'}
// //         </Text>
// //             </View>
// //           </View>
// //         <Text className="text-xs text-gray-500">
// //             HUID: {repairData?.huid || 'N/A'}
// //         </Text>
// //           <Text className="text-xs text-gray-500">
// //             HSN: {repairData?.hsn_id || 'N/A'}
// //           </Text>
// //           {item?.size && (
// //             <Text className="text-xs text-gray-500">
// //               Size: {item.size}
// //           </Text>
// //         )}
// //         <Text className="text-xs text-gray-500">
// //             Repair Type: {item?.repair_type || 'Standard'}
// //         </Text>
// //         <Text className="text-xs text-gray-500">
// //             Less Weight: {handleDigitsFix(item?.less_weight || 0)}g
// //         </Text>
// //       </View>
      
// //       <View className="items-end">
// //         <Text className="text-sm">
// //             {handleDigitsFix(item?.gross_weight || 0)}g (Gross)
// //         </Text>
// //         <Text className="text-xs text-gray-500">
// //             Net: {handleDigitsFix(item?.net_weight || 0)}g
// //         </Text>
// //         <Text className="text-xs text-gray-500">
// //             Fine: {handleDigitsFix(item?.fine_weight || 0)}g
// //         </Text>
// //         <Text className="text-sm font-medium text-primary">
// //             {currency} {handleDigitsFix(item?.final_amount || 0)}
// //         </Text>
// //         <Text className="text-xs text-gray-500">
// //             Metal Value: {currency}{handleDigitsFix(item?.metal_value || 0)}
// //         </Text>
// //         <Text className="text-xs text-gray-500">
// //             Making: {item?.making_type?.label || 'Per Gram'} - {currency}{handleDigitsFix(item?.making_amount || 0)}
// //         </Text>
// //         <Text className="text-xs text-gray-500">
// //             Polishing: {currency}{handleDigitsFix(item?.polishing || 0)}
// //         </Text>
// //         <Text className="text-xs text-gray-500">
// //             Stone Setting: {currency}{handleDigitsFix(item?.stone_setting || 0)}
// //         </Text>
// //         <Text className="text-xs text-gray-500">
// //             Tax ({item?.tax || '0'}%): {currency}{handleDigitsFix(item?.tax_amount || 0)}
// //         </Text>
// //       </View>
// //     </View>
// //   );
// //   };

// //   if (loading) {
// //     return (
// //       <View className="flex-1 bg-gray-50 justify-center items-center">
// //         <ActivityIndicator size="large" color="#0000ff" />
// //       </View>
// //     );
// //   }

// //   if (!repairData) {
// //     return (
// //       <View className="flex-1 bg-gray-50 justify-center items-center">
// //         <Text>No repair data found</Text>
// //       </View>
// //     );
// //   }

// //   return (
// //     <ScrollView className="flex-1 bg-gray-50 p-4">
// //       <View className="rounded-md border border-gray-3 bg-white shadow-xl">
// //         {/* Status Banner - Show when editing */}
// //         {isEditing && (
// //           <View className="bg-blue-100 p-2">
// //             <Text className="text-blue-800 text-center">Editing in progress...</Text>
// //           </View>
// //         )}

// //         {/* Error Banner - Show when there's an error */}
// //         {editError && (
// //           <View className="bg-red-100 p-2">
// //             <Text className="text-red-800 text-center">{editError}</Text>
// //             <TouchableOpacity 
// //               onPress={() => setEditError(null)}
// //               className="absolute right-2 top-2"
// //             >
// //               <FontAwesome6 name="times" size={16} color="#991B1B" />
// //             </TouchableOpacity>
// //           </View>
// //         )}

// //         {/* Success Banner - Show after successful edit */}
// //         {editStatus === 'success' && (
// //           <View className="bg-green-100 p-2">
// //             <Text className="text-green-800 text-center">Successfully updated!</Text>
// //             <TouchableOpacity 
// //               onPress={() => setEditStatus(null)}
// //               className="absolute right-2 top-2"
// //             >
// //               <FontAwesome6 name="times" size={16} color="#166534" />
// //             </TouchableOpacity>
// //           </View>
// //         )}

// //         {/* Header */}
// //         <View className="border-b p-3 pb-2 flex flex-row items-center justify-between border-gray-4">
// //           <View className="flex-row items-center">
// //             <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
// //               <FontAwesome6 name="arrow-left" size={18} color="black" />
// //             </TouchableOpacity>
// //             <Text className="font-bold">Repair Details</Text>
// //           </View>

// //           <View className="flex-row items-center space-x-3">
// //             {/* Edit Button */}
// //             <TouchableOpacity 
// //               activeOpacity={0.6} 
// //               onPress={() => {
// //                 if (!repairData) return;
                
// //                 // Transform the repair data to match ORInvoiceForm's expected structure
// //                 const formData = {
// //                   ...repairData,
// //                   invoiceType: "repair",
// //                   client: repairData?.client ? {
// //                     value: repairData.client.id,
// //                     label: repairData.client.name,
// //                     phone: repairData.client.phone,
// //                     email: repairData.client.email,
// //                     address: repairData.client.address,
// //                     city: repairData.client.city_id,
// //                     pin: repairData.client.pincode,
// //                     role_id: repairData.client.role_id
// //                   } : null,
// //                   selectedProduct: (repairData?.selectedProduct || []).map(item => ({
// //                     name: item?.name || "Product",
// //                     product_id: item?.product_id,
// //                     size: item?.size,
// //                     sale: {
// //                       gross_weight: item?.gross_weight || "0",
// //                       less_weight: item?.less_weight || "0",
// //                       net_weight: item?.net_weight || "0",
// //                       tounch: item?.tounch || "0",
// //                       wastage: item?.wastage || "0",
// //                       fine_weight: item?.fine_weight || "0",
// //                       rate: item?.rate || "0",
// //                       metal_value: item?.metal_value || "0",
// //                       making_type: item?.making_type || { value: "PG", label: "Per Gram" },
// //                       making_charge: item?.making_charge || "0",
// //                       making_amount: item?.making_amount || "0",
// //                       polishing: item?.polishing || "0",
// //                       stone_setting: item?.stone_setting || "0",
// //                       additional_charges: item?.additional_charges || "0",
// //                       subtotal: item?.subtotal || "0",
// //                       tax: item?.tax || "3",
// //                       tax_amount: item?.tax_amount || "0",
// //                       net_price: item?.final_amount || "0"
// //                     }
// //                   })),
// //                   totalPrice: repairData?.totalPrice || "0",
// //                   amount_paid: repairData?.amount_paid || "0",
// //                   payment_mode: repairData?.payment_mode || "Cash",
// //                   payment_date: repairData?.updated_at ? new Date(repairData.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
// //                   bill_date: repairData?.created_at ? new Date(repairData.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
// //                   remark: repairData?.remark || "",
// //                   comment: repairData?.comment || "",
// //                   huid: repairData?.huid || "",
// //                   hsn_id: repairData?.hsn_id ? {
// //                     value: repairData.hsn_id,
// //                     label: 'Select HSN'
// //                   } : null
// //                 };

// //                 navigation.navigate('ORInvoiceForm', {
// //                   editData: formData,
// //                   isEditing: true,
// //                   onUpdate: (updatedData) => {
// //                     setRepairData(updatedData);
// //                     setEditStatus('success');
// //                   }
// //                 });
// //               }}
// //               disabled={isEditing || !canEdit}
// //               style={{ padding: 10 }}
// //             >
// //               {isEditing ? (
// //                 <ActivityIndicator size="small" color="#4F46E5" />
// //               ) : (
// //                 <FontAwesome6 
// //                   name="pen-to-square" 
// //                   color={!canEdit ? "#9CA3AF" : "#4F46E5"} 
// //                   size={18} 
// //                 />
// //               )}
// //             </TouchableOpacity>

// //             {/* Delete Button */}
// //             <TouchableOpacity 
// //               activeOpacity={0.6} 
// //               onPress={handleDelete}
// //               disabled={loading || !canEdit}
// //               style={{ padding: 10 }}
// //             >
// //               <FontAwesome6 
// //                 name="trash" 
// //                 color={!canEdit ? "#9CA3AF" : "#EF4444"} 
// //                 size={18} 
// //               />
// //             </TouchableOpacity>

// //             {/* PDF Button */}
// //           <TouchableOpacity 
// //             activeOpacity={0.6} 
// //             onPress={() => setShowInvoice(true)}
// //               disabled={loading}
// //           >
// //             <FontAwesome6 name="file-pdf" color="black" size={18} />
// //           </TouchableOpacity>
// //         </View>
// //         </View>

// //         {/* Last Updated Info */}
// //         {repairData?.updated_at && (
// //           <View className="px-3 py-1 bg-gray-50">
// //             <Text className="text-xs text-gray-500">
// //               Last updated: {new Date(repairData.updated_at).toLocaleString()}
// //             </Text>
// //           </View>
// //         )}

// //         {/* Customer Info */}
// //         <View className="p-3 border-b border-gray-200">
// //           <Text className="text-lg font-semibold">{repairData?.client?.name || 'Unknown Customer'}</Text>
// //           <Text className="text-sm text-gray-500">
// //             Email: {repairData?.client?.email || 'N/A'}
// //           </Text>
// //           <Text className="text-sm text-gray-500">
// //             Phone: {repairData?.client?.phone || 'N/A'}
// //           </Text>
// //           <Text className="text-sm text-gray-500">
// //             Address: {repairData?.client?.address || 'N/A'}
// //           </Text>
// //           <Text className="text-sm text-gray-500">
// //             Date: {moment(repairData?.created_at).format('DD MMM YYYY, hh:mm A')}
// //           </Text>
// //           <View className="mt-2 flex-row justify-between items-center">
// //             <TouchableOpacity 
// //               onPress={() => {
// //                 if (statusLoading) return;
// //                 Alert.alert(
// //                   "Change Status",
// //                   "Select new status",
// //                   [
// //                     {
// //                       text: "Cancel",
// //                       style: "cancel"
// //                     },
// //                     {
// //                       text: "In Progress",
// //                       onPress: () => handleStatusChange("in_progress")
// //                     },
// //                     {
// //                       text: "Completed",
// //                       onPress: () => handleStatusChange("completed")
// //                     },
// //                     {
// //                       text: "Cancelled",
// //                       onPress: () => handleStatusChange("cancelled")
// //                     }
// //                   ]
// //                 );
// //               }}
// //               disabled={statusLoading}
// //               className={`px-3 py-1 rounded-full ${
// //                 repairData?.status === 'completed' ? 'bg-green-100' : 
// //                 repairData?.status === 'in_progress' ? 'bg-yellow-100' : 'bg-red-100'
// //               }`}
// //             >
// //               {statusLoading ? (
// //                 <ActivityIndicator size="small" color="#666" />
// //               ) : (
// //                 <Text className={`text-sm capitalize ${
// //                   repairData?.status === 'completed' ? 'text-green-800' : 
// //                   repairData?.status === 'in_progress' ? 'text-yellow-800' : 'text-red-800'
// //                 }`}>
// //                   {repairData?.status?.replace('_', ' ') || 'unknown'}
// //                 </Text>
// //               )}
// //             </TouchableOpacity>
// //           </View>
// //         </View>

// //         {/* Items Section */}
// //         <View className="p-3">
// //           <Text className="font-medium text-gray-700 mb-2">Repair Items:</Text>
// //           <FlatList
// //             data={repairData?.selectedProduct || []}
// //             renderItem={renderRepairItem}
// //             keyExtractor={(item, index) => index.toString()}
// //             scrollEnabled={false}
// //             ListEmptyComponent={
// //               <Text className="text-gray-500 text-center py-2">
// //                 No items for repair
// //               </Text>
// //             }
// //           />
// //         </View>

// //         {/* Payment Summary */}
// //         <View className="p-3 bg-gray-50 border-t border-gray-200">
// //           <View className="flex-row justify-between mb-1">
// //             <Text className="font-medium">Total Amount:</Text>
// //             <Text className="font-medium">
// //               {currency} {handleDigitsFix(repairData?.totalPrice || 0)}
// //             </Text>
// //           </View>
// //           {repairData?.amount_paid > 0 && (
// //             <>
// //               <View className="flex-row justify-between mb-1">
// //                 <Text>Amount Paid:</Text>
// //                 <Text>{currency} {handleDigitsFix(repairData?.amount_paid || 0)}</Text>
// //               </View>
// //               <View className="flex-row justify-between">
// //                 <Text className="font-semibold">Balance:</Text>
// //                 <Text className="font-semibold text-primary">
// //                   {currency} {handleDigitsFix((repairData?.totalPrice || 0) - (repairData?.amount_paid || 0))}
// //                 </Text>
// //               </View>
// //             </>
// //           )}
// //         </View>

// //         {/* Payment Details */}
// //         {repairData?.payment_mode && (
// //           <View className="p-3 border-t border-gray-200">
// //             <Text className="text-sm text-gray-600">
// //               Payment Mode: {repairData?.payment_mode}
// //             </Text>
// //             {repairData?.payment_date && (
// //               <Text className="text-sm text-gray-600">
// //                 Payment Date: {moment(repairData?.payment_date).format('DD MMM YYYY, hh:mm A')}
// //               </Text>
// //             )}
// //           </View>
// //         )}
// //       </View>

// //       {/* OrViewer Modal */}
// //       <OrViewer
// //         visible={showInvoice}
// //         onClose={() => setShowInvoice(false)}
// //         orderId={repairId}
// //         type="repair"
// //       />
// //     </ScrollView>
// //   );
// // };

// // export default RepairDetails;
// import React, { useState, useEffect } from "react";
// import {
//   Text,
//   View,
//   TouchableOpacity,
//   FlatList,
//   ScrollView,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { FontAwesome6 } from "@expo/vector-icons";
// import { currency } from "@/src/contants";
// import { handleDigitsFix } from "@/src/utils";
// import moment from "moment";
// import { ApiRequest } from "@/src/utils/api";
// import {
//   OR_INVOICE_API,
//   MANAGE_LOGS_API,
//   MANAGE_INVENTORY_API,
// } from "@/src/utils/api/endpoints";
// import ShowToast from "@/src/components/common/ShowToast";
// import { useSelector, useDispatch } from "react-redux";
// import {
//   setInvoiceList,
//   deleteInvoice,
//   updateInvoice,
// } from "@/src/redux/slices/invoiceSlice";
// import OrViewer from "./OrViewer";

// const RepairDetails = ({ route, navigation }) => {
//   const [showInvoice, setShowInvoice] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [repairData, setRepairData] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editStatus, setEditStatus] = useState(null);
//   const [editError, setEditError] = useState(null);
//   const [statusLoading, setStatusLoading] = useState(false);
//   const repairId = route?.params?.id;
//   const shouldRefresh = route?.params?.refresh;
//   const dispatch = useDispatch();

//   // Get profile data for edit permission check
//   const { profileData } = useSelector((state) => state.userSlices);
//   const canEdit = true;

//   const fetchRepairDetails = async () => {
//     try {
//       setLoading(true);
//       const response = await ApiRequest({
//         url: OR_INVOICE_API.list(repairId),
//         method: "GET",
//       });

//       if (!response?.success) {
//         throw new Error(response?.message || "Failed to fetch repair details");
//       }

//       const data = response?.data || null;
//       if (data) {
//         data.type = data.type || "repair";
//       }
//       setRepairData(data);

//       if (shouldRefresh) {
//         const listResponse = await ApiRequest({
//           url: OR_INVOICE_API.listAll,
//           method: "GET",
//         });

//         if (listResponse?.success) {
//           dispatch(setInvoiceList(listResponse?.data || []));
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching repair details:", error);
//       ShowToast(error?.message || "Error fetching repair details");
//       navigation.goBack();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async () => {
//     try {
//       Alert.alert(
//         "Delete Invoice",
//         "Are you sure you want to delete this repair invoice?",
//         [
//           {
//             text: "Cancel",
//             style: "cancel",
//           },
//           {
//             text: "Delete",
//             style: "destructive",
//             onPress: async () => {
//               try {
//                 setLoading(true);
//                 const response = await ApiRequest({
//                   url: OR_INVOICE_API.delete(repairId),
//                   method: "DELETE",
//                 });

//                 if (response.success) {
//                   ShowToast("Repair invoice deleted successfully");
//                   dispatch(deleteInvoice(repairId));
//                   navigation.goBack();
//                 } else {
//                   throw new Error(
//                     response.message || "Failed to delete repair invoice"
//                   );
//                 }
//               } catch (error) {
//                 console.error("Delete Error:", error);
//                 ShowToast(error.message || "Error deleting repair invoice");
//               } finally {
//                 setLoading(false);
//               }
//             },
//           },
//         ]
//       );
//     } catch (error) {
//       console.error("Delete Error:", error);
//       ShowToast(error.message || "Error deleting repair invoice");
//     }
//   };

//   const handleStatusChange = async (newStatus) => {
//     try {
//       setStatusLoading(true);

//       const response = await ApiRequest({
//         url: MANAGE_INVENTORY_API.updateStatus,
//         method: "PUT",
//         body: {
//           id: repairId,
//           status: newStatus,
//         },
//       });

//       if (!response.success) {
//         throw new Error(response.message || "Failed to update status");
//       }

//       setRepairData((prev) => ({
//         ...prev,
//         status: newStatus,
//       }));

//       const now = new Date();
//       const timestamp = now.toISOString().slice(0, 19).replace("T", " ");

//       await ApiRequest({
//         url: MANAGE_LOGS_API.create,
//         method: "POST",
//         body: {
//           userName: profileData?.name || "Unknown User",
//           action: "STATUS_CHANGE",
//           entityType: "REPAIR",
//           id: repairId,
//           type: "repair",
//           amount: repairData?.totalPrice || "0",
//           timestamp: timestamp,
//           metadata: JSON.stringify({
//             oldStatus: repairData?.status,
//             newStatus: newStatus,
//             items: repairData?.selectedProduct || [],
//           }),
//         },
//       });

//       ShowToast("Status updated successfully");
//     } catch (error) {
//       console.error("Status update error:", error);
//       ShowToast(error.message || "Failed to update status");
//     } finally {
//       setStatusLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (repairId) {
//       fetchRepairDetails();
//     } else {
//       ShowToast("Invalid repair ID");
//       navigation.goBack();
//     }
//   }, [repairId, shouldRefresh]);

//   const renderRepairItem = ({ item }) => {
//     if (!item) return null;

//     const getStatusColor = (status) => {
//       switch (status) {
//         case "available":
//           return "bg-green-100 text-green-800";
//         case "sold":
//           return "bg-red-100 text-red-800";
//         case "reserved":
//           return "bg-yellow-100 text-yellow-800";
//         default:
//           return "bg-gray-100 text-gray-800";
//       }
//     };

//     return (
//       <View className="flex-row justify-between py-2 border-b border-gray-200">
//         <View className="flex-1">
//           <View className="flex-row items-center justify-between">
//             <Text className="text-sm font-medium">
//               {item?.name || "Unnamed Product"}
//             </Text>
//             <View className={`px-2 py-1 rounded-full ${getStatusColor(item?.inventory_status)}`}>
//               <Text className="text-xs capitalize">
//                 {item?.inventory_status || "unknown"}
//               </Text>
//             </View>
//           </View>
//           <Text className="text-xs text-gray-500">
//             HUID: {repairData?.huid || "N/A"}
//           </Text>
//           <Text className="text-xs text-gray-500">
//             HSN: {repairData?.hsn_id || "N/A"}
//           </Text>
//           {item?.size && (
//             <Text className="text-xs text-gray-500">Size: {item.size}</Text>
//           )}
//           <Text className="text-xs text-gray-500">
//             Repair Type: {item?.repair_type || "Standard"}
//           </Text>
//           <Text className="text-xs text-gray-500">
//             Less Weight: {handleDigitsFix(item?.less_weight || 0)}g
//           </Text>
//         </View>

//         <View className="items-end">
//           <Text className="text-sm">
//             {handleDigitsFix(item?.gross_weight || 0)}g (Gross)
//           </Text>
//           <Text className="text-xs text-gray-500">
//             Net: {handleDigitsFix(item?.net_weight || 0)}g
//           </Text>
//           <Text className="text-xs text-gray-500">
//             Fine: {handleDigitsFix(item?.fine_weight || 0)}g
//           </Text>
//           <Text className="text-sm font-medium text-primary">
//             {currency} {handleDigitsFix(item?.final_amount || 0)}
//           </Text>
//           <Text className="text-xs text-gray-500">
//             Metal Value: {currency}
//             {handleDigitsFix(item?.metal_value || 0)}
//           </Text>
//           <Text className="text-xs text-gray-500">
//             Making: {item?.making_type?.label || "Per Gram"} - {currency}
//             {handleDigitsFix(item?.making_amount || 0)}
//           </Text>
//           <Text className="text-xs text-gray-500">
//             Polishing: {currency}
//             {handleDigitsFix(item?.polishing || 0)}
//           </Text>
//           <Text className="text-xs text-gray-500">
//             Stone Setting: {currency}
//             {handleDigitsFix(item?.stone_setting || 0)}
//           </Text>
//           <Text className="text-xs text-gray-500">
//             Tax ({item?.tax || "0"}%): {currency}
//             {handleDigitsFix(item?.tax_amount || 0)}
//           </Text>
//         </View>
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <View className="flex-1 bg-gray-50 justify-center items-center">
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   if (!repairData) {
//     return (
//       <View className="flex-1 bg-gray-50 justify-center items-center">
//         <Text>No repair data found</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView className="flex-1 bg-gray-50 p-4">
//       <View className="rounded-md border border-gray-3 bg-white shadow-xl">
//         {isEditing && (
//           <View className="bg-blue-100 p-2">
//             <Text className="text-blue-800 text-center">
//               Editing in progress...
//             </Text>
//           </View>
//         )}

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

//         {editStatus === "success" && (
//           <View className="bg-green-100 p-2">
//             <Text className="text-green-800 text-center">
//               Successfully updated!
//             </Text>
//             <TouchableOpacity
//               onPress={() => setEditStatus(null)}
//               className="absolute right-2 top-2"
//             >
//               <FontAwesome6 name="times" size={16} color="#166534" />
//             </TouchableOpacity>
//           </View>
//         )}

//         <View className="border-b p-3 pb-2 flex flex-row items-center justify-between border-gray-4">
//           <View className="flex-row items-center">
//             <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
//               <FontAwesome6 name="arrow-left" size={18} color="black" />
//             </TouchableOpacity>
//             <Text className="font-bold">Repair Details</Text>
//           </View>

//           <View className="flex-row items-center space-x-3">
//             <TouchableOpacity
//               activeOpacity={0.6}
//               onPress={() => {
//                 if (!repairData) {
//                   ShowToast("No repair data available");
//                   return;
//                 }

//                 const formData = {
//                   ...repairData,
//                   invoiceType: "repair",
//                   client: repairData?.client
//                     ? {
//                         value: repairData.client.id,
//                         label: repairData.client.name,
//                         phone: repairData.client.phone,
//                         email: repairData.client.email,
//                         address: repairData.client.address,
//                         city: repairData.client.city_id,
//                         pin: repairData.client.pincode,
//                         role_id: repairData.client.role_id,
//                       }
//                     : null,
//                   selectedProduct: (repairData?.selectedProduct || []).map(
//                     (item) => ({
//                       name: item?.name || "Product",
//                       product_id: item?.product_id,
//                       size: item?.size,
//                       repair_type: item?.repair_type || "Standard",
//                       sale: {
//                         gross_weight: item?.gross_weight?.toString() || "0",
//                         less_weight: item?.less_weight?.toString() || "0",
//                         net_weight: item?.net_weight?.toString() || "0",
//                         tounch: item?.tounch?.toString() || "0",
//                         wastage: item?.wastage?.toString() || "0",
//                         fine_weight: item?.fine_weight?.toString() || "0",
//                         rate: item?.rate?.toString() || "0",
//                         metal_value: item?.metal_value?.toString() || "0",
//                         making_type:
//                           item?.making_type || {
//                             value: "PG",
//                             label: "Per Gram",
//                           },
//                         making_charge: item?.making_charge?.toString() || "0",
//                         making_amount: item?.making_amount?.toString() || "0",
//                         polishing: item?.polishing?.toString() || "0",
//                         stone_setting: item?.stone_setting?.toString() || "0",
//                         additional_charges:
//                           item?.additional_charges?.toString() || "0",
//                         subtotal: item?.subtotal?.toString() || "0",
//                         tax: item?.tax?.toString() || "3",
//                         tax_amount: item?.tax_amount?.toString() || "0",
//                         net_price: item?.final_amount?.toString() || "0",
//                       },
//                     })
//                   ),
//                   totalPrice: repairData?.totalPrice?.toString() || "0",
//                   amount_paid: repairData?.amount_paid?.toString() || "0",
//                   payment_mode: repairData?.payment_mode || "Cash",
//                   payment_date: repairData?.updated_at
//                     ? new Date(repairData.updated_at)
//                         .toISOString()
//                         .split("T")[0]
//                     : new Date().toISOString().split("T")[0],
//                   bill_date: repairData?.created_at
//                     ? new Date(repairData.created_at)
//                         .toISOString()
//                         .split("T")[0]
//                     : new Date().toISOString().split("T")[0],
//                   remark: repairData?.remark || "",
//                   comment: repairData?.comment

//  || "",
//                   huid: repairData?.huid || "",
//                   hsn_id: repairData?.hsn_id
//                     ? { value: repairData.hsn_id, label: "Select HMIL" }
//                     : null,
//                 };

//                 console.log(
//                   "Navigating with formData:",
//                   JSON.stringify(formData, null, 2)
//                 );

//                 navigation.navigate("ORInvoiceForm", {
//                   editData: formData,
//                   isEditing: true,
//                   onUpdate: (updatedData) => {
//                     setRepairData(updatedData);
//                     setEditStatus("success");
//                     dispatch(updateInvoice(updatedData)); // Update Redux store
//                   },
//                 });
//               }}
//               disabled={isEditing || !canEdit}
//               style={{ padding: 10 }}
//             >
//               {isEditing ? (
//                 <ActivityIndicator size="small" color="#4F46E5" />
//               ) : (
//                 <FontAwesome6
//                   name="pen-to-square"
//                   color={!canEdit ? "#9CA3AF" : "#4F46E5"}
//                   size={18}
//                 />
//               )}
//             </TouchableOpacity>

//             <TouchableOpacity
//               activeOpacity={0.6}
//               onPress={handleDelete}
//               disabled={loading || !canEdit}
//               style={{ padding: 10 }}
//             >
//               <FontAwesome6
//                 name="trash"
//                 color={!canEdit ? "#9CA3AF" : "#EF4444"}
//                 size={18}
//               />
//             </TouchableOpacity>

//             <TouchableOpacity
//               activeOpacity={0.6}
//               onPress={() => setShowInvoice(true)}
//               disabled={loading}
//             >
//               <FontAwesome6 name="file-pdf" color="black" size={18} />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {repairData?.updated_at && (
//           <View className="px-3 py-1 bg-gray-50">
//             <Text className="text-xs text-gray-500">
//               Last updated: {new Date(repairData.updated_at).toLocaleString()}
//             </Text>
//           </View>
//         )}

//         <View className="p-3 border-b border-gray-200">
//           <Text className="text-lg font-semibold">
//             {repairData?.client?.name || "Unknown Customer"}
//           </Text>
//           <Text className="text-sm text-gray-500">
//             Email: {repairData?.client?.email || "N/A"}
//           </Text>
//           <Text className="text-sm text-gray-500">
//             Phone: {repairData?.client?.phone || "N/A"}
//           </Text>
//           <Text className="text-sm text-gray-500">
//             Address: {repairData?.client?.address || "N/A"}
//           </Text>
//           <Text className="text-sm text-gray-500">
//             Date: {moment(repairData?.created_at).format("DD MMM YYYY, hh:mm A")}
//           </Text>
//           <View className="mt-2 flex-row justify-between items-center">
//             <TouchableOpacity
//               onPress={() => {
//                 if (statusLoading) return;
//                 Alert.alert("Change Status", "Select new status", [
//                   {
//                     text: "Cancel",
//                     style: "cancel",
//                   },
//                   {
//                     text: "In Progress",
//                     onPress: () => handleStatusChange("in_progress"),
//                   },
//                   {
//                     text: "Completed",
//                     onPress: () => handleStatusChange("completed"),
//                   },
//                   {
//                     text: "Cancelled",
//                     onPress: () => handleStatusChange("cancelled"),
//                   },
//                 ]);
//               }}
//               disabled={statusLoading}
//               className={`px-3 py-1 rounded-full ${
//                 repairData?.status === "completed"
//                   ? "bg-green-100"
//                   : repairData?.status === "in_progress"
//                   ? "bg-yellow-100"
//                   : "bg-red-100"
//               }`}
//             >
//               {statusLoading ? (
//                 <ActivityIndicator size="small" color="#666" />
//               ) : (
//                 <Text
//                   className={`text-sm capitalize ${
//                     repairData?.status === "completed"
//                       ? "text-green-800"
//                       : repairData?.status === "in_progress"
//                       ? "text-yellow-800"
//                       : "text-red-800"
//                   }`}
//                 >
//                   {repairData?.status?.replace("_", " ") || "unknown"}
//                 </Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>

//         <View className="p-3">
//           <Text className="font-medium text-gray-700 mb-2">Repair Items:</Text>
//           <FlatList
//             data={repairData?.selectedProduct || []}
//             renderItem={renderRepairItem}
//             keyExtractor={(item, index) => index.toString()}
//             scrollEnabled={false}
//             ListEmptyComponent={
//               <Text className="text-gray-500 text-center py-2">
//                 No items for repair
//               </Text>
//             }
//           />
//         </View>

//         <View className="p-3 bg-gray-50 border-t border-gray-200">
//           <View className="flex-row justify-between mb-1">
//             <Text className="font-medium">Total Amount:</Text>
//             <Text className="font-medium">
//               {currency} {handleDigitsFix(repairData?.totalPrice || 0)}
//             </Text>
//           </View>
//           {repairData?.amount_paid > 0 && (
//             <>
//               <View className="flex-row justify-between mb-1">
//                 <Text>Amount Paid:</Text>
//                 <Text>
//                   {currency} {handleDigitsFix(repairData?.amount_paid || 0)}
//                 </Text>
//               </View>
//               <View className="flex-row justify-between">
//                 <Text className="font-semibold">Balance:</Text>
//                 <Text className="font-semibold text-primary">
//                   {currency}{" "}
//                   {handleDigitsFix(
//                     (repairData?.totalPrice || 0) -
//                       (repairData?.amount_paid || 0)
//                   )}
//                 </Text>
//               </View>
//             </>
//           )}
//         </View>

//         {repairData?.payment_mode && (
//           <View className="p-3 border-t border-gray-200">
//             <Text className="text-sm text-gray-600">
//               Payment Mode: {repairData?.payment_mode}
//             </Text>
//             {repairData?.payment_date && (
//               <Text className="text-sm text-gray-600">
//                 Payment Date:{" "}
//                 {moment(repairData?.payment_date).format("DD MMM YYYY, hh:mm A")}
//               </Text>
//             )}
//           </View>
//         )}
//       </View>

//       <OrViewer
//         visible={showInvoice}
//         onClose={() => setShowInvoice(false)}
//         orderId={repairId}
//         type="repair"
//       />
//     </ScrollView>
//   );
// };

// export default RepairDetails;
import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share, // Import Share from react-native
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { currency } from "@/src/contants";
import { handleDigitsFix } from "@/src/utils";
import moment from "moment";
import { ApiRequest } from "@/src/utils/api";
import {
  OR_INVOICE_API,
  MANAGE_LOGS_API,
  MANAGE_INVENTORY_API,
} from "@/src/utils/api/endpoints";
import ShowToast from "@/src/components/common/ShowToast";
import { useSelector, useDispatch } from "react-redux";
import {
  setInvoiceList,
  deleteInvoice,
  updateInvoice,
} from "@/src/redux/slices/invoiceSlice";
import OrViewer from "./OrViewer";

const RepairDetails = ({ route, navigation }) => {
  const [showInvoice, setShowInvoice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [repairData, setRepairData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState(null);
  const [editError, setEditError] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const repairId = route?.params?.id;
  const shouldRefresh = route?.params?.refresh;
  const dispatch = useDispatch();

  const { profileData } = useSelector((state) => state.userSlices);
  const canEdit = true;

  // Function to format and share repair details
  const handleShare = async () => {
    if (!repairData) {
      ShowToast("No repair data available to share");
      return;
    }

    try {
      let shareMessage = `Repair Invoice Details\n\n`;
      shareMessage += `Customer: ${repairData?.client?.name || "Unknown Customer"}\n`;
      shareMessage += `Email: ${repairData?.client?.email || "N/A"}\n`;
      shareMessage += `Phone: ${repairData?.client?.phone || "N/A"}\n`;
      shareMessage += `Address: ${repairData?.client?.address || "N/A"}\n`;
      shareMessage += `Date: ${moment(repairData?.created_at).format("DD MMM YYYY, hh:mm A")}\n`;
      shareMessage += `Status: ${repairData?.status?.replace("_", " ") || "unknown"}\n`;
      shareMessage += `Last Updated: ${new Date(repairData?.updated_at).toLocaleString()}\n\n`;

      shareMessage += `Repair Items:\n`;
      if (repairData?.selectedProduct?.length > 0) {
        repairData.selectedProduct.forEach((item, index) => {
          shareMessage += `${index + 1}. ${item?.name || "Unnamed Product"}\n`;
          shareMessage += `   - Status: ${item?.inventory_status || "unknown"}\n`;
          shareMessage += `   - HUID: ${repairData?.huid || "N/A"}\n`;
          shareMessage += `   - HSN: ${repairData?.hsn_id || "N/A"}\n`;
          if (item?.size) shareMessage += `   - Size: ${item.size}\n`;
          shareMessage += `   - Repair Type: ${item?.repair_type || "Standard"}\n`;
          shareMessage += `   - Gross Weight: ${handleDigitsFix(item?.gross_weight || 0)}g\n`;
          shareMessage += `   - Less Weight: ${handleDigitsFix(item?.less_weight || 0)}g\n`;
          shareMessage += `   - Net Weight: ${handleDigitsFix(item?.net_weight || 0)}g\n`;
          shareMessage += `   - Fine Weight: ${handleDigitsFix(item?.fine_weight || 0)}g\n`;
          shareMessage += `   - Metal Value: ${currency}${handleDigitsFix(item?.metal_value || 0)}\n`;
          shareMessage += `   - Making: ${item?.making_type?.label || "Per Gram"} - ${currency}${handleDigitsFix(item?.making_amount || 0)}\n`;
          shareMessage += `   - Polishing: ${currency}${handleDigitsFix(item?.polishing || 0)}\n`;
          shareMessage += `   - Stone Setting: ${currency}${handleDigitsFix(item?.stone_setting || 0)}\n`;
          shareMessage += `   - Tax (${item?.tax || "0"}%): ${currency}${handleDigitsFix(item?.tax_amount || 0)}\n`;
          shareMessage += `   - Final Amount: ${currency}${handleDigitsFix(item?.final_amount || 0)}\n\n`;
        });
      } else {
        shareMessage += `No items for repair\n\n`;
      }

      shareMessage += `Payment Summary:\n`;
      shareMessage += `Total Amount: ${currency}${handleDigitsFix(repairData?.totalPrice || 0)}\n`;
      if (repairData?.amount_paid > 0) {
        shareMessage += `Amount Paid: ${currency}${handleDigitsFix(repairData?.amount_paid || 0)}\n`;
        shareMessage += `Balance: ${currency}${handleDigitsFix((repairData?.totalPrice || 0) - (repairData?.amount_paid || 0))}\n`;
      }
      if (repairData?.payment_mode) {
        shareMessage += `Payment Mode: ${repairData?.payment_mode}\n`;
        if (repairData?.payment_date) {
          shareMessage += `Payment Date: ${moment(repairData?.payment_date).format("DD MMM YYYY, hh:mm A")}\n`;
        }
      }

      await Share.share({
        message: shareMessage,
      });
    } catch (error) {
      console.error("Share Error:", error);
      ShowToast(error.message || "Error sharing repair details");
    }
  };

  const fetchRepairDetails = async () => {
    try {
      setLoading(true);
      const response = await ApiRequest({
        url: OR_INVOICE_API.list(repairId),
        method: "GET",
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch repair details");
      }

      const data = response?.data || null;
      if (data) {
        data.type = data.type || "repair";
      }
      setRepairData(data);

      if (shouldRefresh) {
        const listResponse = await ApiRequest({
          url: OR_INVOICE_API.listAll,
          method: "GET",
        });

        if (listResponse?.success) {
          dispatch(setInvoiceList(listResponse?.data || []));
        }
      }
    } catch (error) {
      console.error("Error fetching repair details:", error);
      ShowToast(error?.message || "Error fetching repair details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      Alert.alert(
        "Delete Invoice",
        "Are you sure you want to delete this repair invoice?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                setLoading(true);
                const response = await ApiRequest({
                  url: OR_INVOICE_API.delete(repairId),
                  method: "DELETE",
                });

                if (response.success) {
                  ShowToast("Repair invoice deleted successfully");
                  dispatch(deleteInvoice(repairId));
                  navigation.goBack();
                } else {
                  throw new Error(
                    response.message || "Failed to delete repair invoice"
                  );
                }
              } catch (error) {
                console.error("Delete Error:", error);
                ShowToast(error.message || "Error deleting repair invoice");
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Delete Error:", error);
      ShowToast(error.message || "Error deleting repair invoice");
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusLoading(true);

      const response = await ApiRequest({
        url: MANAGE_INVENTORY_API.updateStatus,
        method: "PUT",
        body: {
          id: repairId,
          status: newStatus,
        },
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to update status");
      }

      setRepairData((prev) => ({
        ...prev,
        status: newStatus,
      }));

      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace("T", " ");

      await ApiRequest({
        url: MANAGE_LOGS_API.create,
        method: "POST",
        body: {
          userName: profileData?.name || "Unknown User",
          action: "STATUS_CHANGE",
          entityType: "REPAIR",
          id: repairId,
          type: "repair",
          amount: repairData?.totalPrice || "0",
          timestamp: timestamp,
          metadata: JSON.stringify({
            oldStatus: repairData?.status,
            newStatus: newStatus,
            items: repairData?.selectedProduct || [],
          }),
        },
      });

      ShowToast("Status updated successfully");
    } catch (error) {
      console.error("Status update error:", error);
      ShowToast(error.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    if (repairId) {
      fetchRepairDetails();
    } else {
      ShowToast("Invalid repair ID");
      navigation.goBack();
    }
  }, [repairId, shouldRefresh]);

  const renderRepairItem = ({ item }) => {
    if (!item) return null;

    const getStatusColor = (status) => {
      switch (status) {
        case "available":
          return "bg-green-100 text-green-800";
        case "sold":
          return "bg-red-100 text-red-800";
        case "reserved":
          return "bg-yellow-100 text-yellow-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <View className="flex-row justify-between py-2 border-b border-gray-200">
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium">
              {item?.name || "Unnamed Product"}
            </Text>
            <View
              className={`px-2 py-1 rounded-full ${getStatusColor(
                item?.inventory_status
              )}`}
            >
              <Text className="text-xs capitalize">
                {item?.inventory_status || "unknown"}
              </Text>
            </View>
          </View>
          <Text className="text-xs text-gray-500">
            HUID: {repairData?.huid || "N/A"}
          </Text>
          <Text className="text-xs text-gray-500">
            HSN: {repairData?.hsn_id || "N/A"}
          </Text>
          {item?.size && (
            <Text className="text-xs text-gray-500">Size: {item.size}</Text>
          )}
          <Text className="text-xs text-gray-500">
            Repair Type: {item?.repair_type || "Standard"}
          </Text>
          <Text className="text-xs text-gray-500">
            Less Weight: {handleDigitsFix(item?.less_weight || 0)}g
          </Text>
        </View>

        <View className="items-end">
          <Text className="text-sm">
            {handleDigitsFix(item?.gross_weight || 0)}g (Gross)
          </Text>
          <Text className="text-xs text-gray-500">
            Net: {handleDigitsFix(item?.net_weight || 0)}g
          </Text>
          <Text className="text-xs text-gray-500">
            Fine: {handleDigitsFix(item?.fine_weight || 0)}g
          </Text>
          <Text className="text-sm font-medium text-primary">
            {currency} {handleDigitsFix(item?.final_amount || 0)}
          </Text>
          <Text className="text-xs text-gray-500">
            Metal Value: {currency}
            {handleDigitsFix(item?.metal_value || 0)}
          </Text>
          <Text className="text-xs text-gray-500">
            Making: {item?.making_type?.label || "Per Gram"} - {currency}
            {handleDigitsFix(item?.making_amount || 0)}
          </Text>
          <Text className="text-xs text-gray-500">
            Polishing: {currency}
            {handleDigitsFix(item?.polishing || 0)}
          </Text>
          <Text className="text-xs text-gray-500">
            Stone Setting: {currency}
            {handleDigitsFix(item?.stone_setting || 0)}
          </Text>
          <Text className="text-xs text-gray-500">
            Tax ({item?.tax || "0"}%): {currency}
            {handleDigitsFix(item?.tax_amount || 0)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!repairData) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text>No repair data found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="rounded-md border border-gray-3 bg-white shadow-xl">
        {isEditing && (
          <View className="bg-blue-100 p-2">
            <Text className="text-blue-800 text-center">
              Editing in progress...
            </Text>
          </View>
        )}

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

        {editStatus === "success" && (
          <View className="bg-green-100 p-2">
            <Text className="text-green-800 text-center">
              Successfully updated!
            </Text>
            <TouchableOpacity
              onPress={() => setEditStatus(null)}
              className="absolute right-2 top-2"
            >
              <FontAwesome6 name="times" size={16} color="#166534" />
            </TouchableOpacity>
          </View>
        )}

        <View className="border-b p-3 pb-2 flex flex-row items-center justify-between border-gray-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-3"
            >
              <FontAwesome6 name="arrow-left" size={18} color="black" />
            </TouchableOpacity>
            <Text className="font-bold">Repair Details</Text>
          </View>

          <View className="flex-row items-center space-x-3">
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => {
                if (!repairData) {
                  ShowToast("No repair data available");
                  return;
                }

                const formData = {
                  ...repairData,
                  invoiceType: "repair",
                  client: repairData?.client
                    ? {
                        value: repairData.client.id,
                        label: repairData.client.name,
                        phone: repairData.client.phone,
                        email: repairData.client.email,
                        address: repairData.client.address,
                        city: repairData.client.city_id,
                        pin: repairData.client.pincode,
                        role_id: repairData.client.role_id,
                      }
                    : null,
                  selectedProduct: (repairData?.selectedProduct || []).map(
                    (item) => ({
                      name: item?.name || "Product",
                      product_id: item?.product_id,
                      size: item?.size,
                      repair_type: item?.repair_type || "Standard",
                      sale: {
                        gross_weight: item?.gross_weight?.toString() || "0",
                        less_weight: item?.less_weight?.toString() || "0",
                        net_weight: item?.net_weight?.toString() || "0",
                        tounch: item?.tounch?.toString() || "0",
                        wastage: item?.wastage?.toString() || "0",
                        fine_weight: item?.fine_weight?.toString() || "0",
                        rate: item?.rate?.toString() || "0",
                        metal_value: item?.metal_value?.toString() || "0",
                        making_type:
                          item?.making_type || {
                            value: "PG",
                            label: "Per Gram",
                          },
                        making_charge: item?.making_charge?.toString() || "0",
                        making_amount: item?.making_amount?.toString() || "0",
                        polishing: item?.polishing?.toString() || "0",
                        stone_setting: item?.stone_setting?.toString() || "0",
                        additional_charges:
                          item?.additional_charges?.toString() || "0",
                        subtotal: item?.subtotal?.toString() || "0",
                        tax: item?.tax?.toString() || "3",
                        tax_amount: item?.tax_amount?.toString() || "0",
                        net_price: item?.final_amount?.toString() || "0",
                      },
                    })
                  ),
                  totalPrice: repairData?.totalPrice?.toString() || "0",
                  amount_paid: repairData?.amount_paid?.toString() || "0",
                  payment_mode: repairData?.payment_mode || "Cash",
                  payment_date: repairData?.updated_at
                    ? new Date(repairData.updated_at)
                        .toISOString()
                        .split("T")[0]
                    : new Date().toISOString().split("T")[0],
                  bill_date: repairData?.created_at
                    ? new Date(repairData.created_at)
                        .toISOString()
                        .split("T")[0]
                    : new Date().toISOString().split("T")[0],
                  remark: repairData?.remark || "",
                  comment: repairData?.comment || "",
                  huid: repairData?.huid || "",
                  hsn_id: repairData?.hsn_id
                    ? { value: repairData.hsn_id, label: "Select HSN" }
                    : null,
                };

                console.log(
                  "Navigating with formData:",
                  JSON.stringify(formData, null, 2)
                );

                navigation.navigate("ORInvoiceForm", {
                  editData: formData,
                  isEditing: true,
                  onUpdate: (updatedData) => {
                    setRepairData(updatedData);
                    setEditStatus("success");
                    dispatch(updateInvoice(updatedData));
                  },
                });
              }}
              disabled={isEditing || !canEdit}
              style={{ padding: 10 }}
            >
              {isEditing ? (
                <ActivityIndicator size="small" color="#4F46E5" />
              ) : (
                <FontAwesome6
                  name="pen-to-square"
                  color={!canEdit ? "#9CA3AF" : "#4F46E5"}
                  size={18}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.6}
              onPress={handleDelete}
              disabled={loading || !canEdit}
              style={{ padding: 10 }}
            >
              <FontAwesome6
                name="trash"
                color={!canEdit ? "#9CA3AF" : "#EF4444"}
                size={18}
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => setShowInvoice(true)}
              disabled={loading}
              style={{ padding: 10 }}
            >
              <FontAwesome6 name="file-pdf" color="black" size={18} />
            </TouchableOpacity>

            {/* Share Button */}
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={handleShare}
              disabled={loading}
              style={{ padding: 10 }}
            >
              <FontAwesome6 name="share" color="black" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {repairData?.updated_at && (
          <View className="px-3 py-1 bg-gray-50">
            <Text className="text-xs text-gray-500">
              Last updated: {new Date(repairData.updated_at).toLocaleString()}
            </Text>
          </View>
        )}

        <View className="p-3 border-b border-gray-200">
          <Text className="text-lg font-semibold">
            {repairData?.client?.name || "Unknown Customer"}
          </Text>
          <Text className="text-sm text-gray-500">
            Email: {repairData?.client?.email || "N/A"}
          </Text>
          <Text className="text-sm text-gray-500">
            Phone: {repairData?.client?.phone || "N/A"}
          </Text>
          <Text className="text-sm text-gray-500">
            Address: {repairData?.client?.address || "N/A"}
          </Text>
          <Text className="text-sm text-gray-500">
            Date: {moment(repairData?.created_at).format("DD MMM YYYY, hh:mm A")}
          </Text>
          <View className="mt-2 flex-row justify-between items-center">
            <TouchableOpacity
              onPress={() => {
                if (statusLoading) return;
                Alert.alert("Change Status", "Select new status", [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "In Progress",
                    onPress: () => handleStatusChange("in_progress"),
                  },
                  {
                    text: "Completed",
                    onPress: () => handleStatusChange("completed"),
                  },
                  {
                    text: "Cancelled",
                    onPress: () => handleStatusChange("cancelled"),
                  },
                ]);
              }}
              disabled={statusLoading}
              className={`px-3 py-1 rounded-full ${
                repairData?.status === "completed"
                  ? "bg-green-100"
                  : repairData?.status === "in_progress"
                  ? "bg-yellow-100"
                  : "bg-red-100"
              }`}
            >
              {statusLoading ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <Text
                  className={`text-sm capitalize ${
                    repairData?.status === "completed"
                      ? "text-green-800"
                      : repairData?.status === "in_progress"
                      ? "text-yellow-800"
                      : "text-red-800"
                  }`}
                >
                  {repairData?.status?.replace("_", " ") || "unknown"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View className="p-3">
          <Text className="font-medium text-gray-700 mb-2">Repair Items:</Text>
          <FlatList
            data={repairData?.selectedProduct || []}
            renderItem={renderRepairItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text className="text-gray-500 text-center py-2">
                No items for repair
              </Text>
            }
          />
        </View>

        <View className="p-3 bg-gray-50 border-t border-gray-200">
          <View className="flex-row justify-between mb-1">
            <Text className="font-medium">Total Amount:</Text>
            <Text className="font-medium">
              {currency} {handleDigitsFix(repairData?.totalPrice || 0)}
            </Text>
          </View>
          {repairData?.amount_paid > 0 && (
            <>
              <View className="flex-row justify-between mb-1">
                <Text>Amount Paid:</Text>
                <Text>
                  {currency} {handleDigitsFix(repairData?.amount_paid || 0)}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="font-semibold">Balance:</Text>
                <Text className="font-semibold text-primary">
                  {currency}
                  {handleDigitsFix(
                    (repairData?.totalPrice || 0) -
                      (repairData?.amount_paid || 0)
                  )}
                </Text>
              </View>
            </>
          )}
        </View>

        {repairData?.payment_mode && (
          <View className="p-3 border-t border-gray-200">
            <Text className="text-sm text-gray-600">
              Payment Mode: {repairData?.payment_mode}
            </Text>
            {repairData?.payment_date && (
              <Text className="text-sm text-gray-600">
                Payment Date:
                {moment(repairData?.payment_date).format("DD MMM YYYY, hh:mm A")}
              </Text>
            )}
          </View>
        )}
      </View>

      <OrViewer
        visible={showInvoice}
        onClose={() => setShowInvoice(false)}
        orderId={repairId}
        type="repair"
      />
    </ScrollView>
  );
};

export default RepairDetails;