import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, FlatList, Modal, ScrollView, ActivityIndicator, Alert } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { currency } from "@/src/contants";
import { handleDigitsFix } from "@/src/utils";
import moment from "moment";
import { ApiRequest } from "@/src/utils/api";
import { OR_INVOICE_API, MANAGE_LOGS_API, MANAGE_INVENTORY_API } from "@/src/utils/api/endpoints";
import ShowToast from "@/src/components/common/ShowToast";
import { useSelector, useDispatch } from "react-redux";
import { setInvoiceList, deleteInvoice, updateInvoice } from "@/src/redux/slices/invoiceSlice";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import WebView from 'react-native-webview';
import OrViewer from './OrViewer';

// Flag to switch between mock and API data
const USE_MOCK_DATA = false;


// Mock data for testing
const MOCK_ORDER_DETAIL = {
  id: "ORD123456",
  type: "order",
  client: {
    id: "C123",
    name: "John Smith",
    role_id: "R1"
  },
  items: [{
    name: "Gold Ring",
    product_id: "P123",
    size: "12",
    gross_weight: 10.5,
    net_weight: 10.2,
    fine_weight: 9.8,
    tounch: 916,
    wastage: 2.5,
    rate: 5500,
    making_type: {
      value: "per_gram",
      label: "Per Gram"
    },
    making_charge: 1200,
    price: 65000
  }],
  total_amount: 65000,
  amount_paid: 30000,
  payment_mode: "Cash",
  payment_date: "2024-03-15",
  created_at: "2024-03-15",
  updated_at: "2024-03-15",
  status: "in_progress",
  huid: "HUID123",
  hsn_id: "HSN456",
  photo: "https://example.com/photo.jpg",
  additional_photo: "https://example.com/additional.jpg",
  user_id: "USER123"
};

const OrderDetails = ({ route, navigation }) => {
  const [showInvoice, setShowInvoice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState(null);
  const [editError, setEditError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const orderId = route?.params?.id;
  const shouldRefresh = route?.params?.refresh;
  const dispatch = useDispatch();
  
  // Get profile data for edit permission check
  const { profileData } = useSelector((state) => state.userSlices);
  const canEdit = true;
  const [statusLoading, setStatusLoading] = useState(false);

  // Fetch order details and update Redux store
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      if (USE_MOCK_DATA) {
        // Use mock data
        setOrderData(MOCK_ORDER_DETAIL);
        if (shouldRefresh) {
          dispatch(setInvoiceList([MOCK_ORDER_DETAIL]));
        }
        return;
      }

      // Fetch single order details
      const orderResponse = await ApiRequest({
        url: OR_INVOICE_API.list(orderId),
        method: "GET"
      });

      if (!orderResponse?.success) {
        throw new Error(orderResponse?.message || "Failed to fetch order details");
      }

      // Ensure type is preserved
      const orderData = orderResponse?.data || null;
      if (orderData) {
        orderData.type = orderData.type || "order"; // Default to "order" if type is missing
      }
      setOrderData(orderData);

      // If refresh flag is true, also fetch updated invoice list
      if (shouldRefresh) {
        const listResponse = await ApiRequest({
          url: OR_INVOICE_API.listAll,
          method: "GET"
        });

        if (listResponse?.success) {
          dispatch(setInvoiceList(listResponse?.data || []));
        }
      }

    } catch (error) {
      console.error("Error fetching order details:", error);
      ShowToast(error?.message || "Error fetching order details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Handle PDF generation and download
  const handlePdfGeneration = () => {
    setShowInvoice(true);
  };

  // Handle edit action
  const handleEdit = async (editedData) => {
    try {
      setLoading(true);

      if (USE_MOCK_DATA) {
        const updatedMockData = {
          ...MOCK_ORDER_DETAIL,
          ...editedData,
          type: "order",
          updated_at: new Date().toISOString()
        };
        setOrderData(updatedMockData);
        dispatch(setInvoiceList([updatedMockData]));
        ShowToast("Order updated successfully");
        return;
      }

      const response = await ApiRequest({
        url: OR_INVOICE_API.update(orderId),
        method: "POST",
        body: {
          ...editedData,
          type: "order",
          invoiceType: "order"
        }
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to update order");
      }

      // Transform the API response data to match our expected format
      const updatedData = {
        id: response.data.invoice.id,
        type: "order",
        client: {
          id: response.data.invoice.user_contact_id,
          name: editedData.client?.name || orderData?.client?.name,
          role_id: editedData.client?.role_id || orderData?.client?.role_id
        },
        selectedProduct: response.data.details.map(detail => ({
          name: detail.name,
          product_id: detail.product_id,
          size: detail.size,
          gross_weight: detail.gross_weight,
          less_weight: detail.less_weight,
          net_weight: detail.net_weight,
          tounch: detail.tounch,
          wastage: detail.wastage,
          fine_weight: detail.fine_weight,
          rate: detail.rate,
          metal_value: detail.metal_value,
          making_type: {
            value: detail.making_type,
            label: detail.making_type === "per_gram" ? "Per Gram" : "Per Piece"
          },
          making_charge: detail.making_charge,
          making_amount: detail.making_amount,
          polishing: detail.polishing,
          stone_setting: detail.stone_setting,
          additional_charges: detail.additional_charges,
          subtotal: detail.subtotal,
          tax: detail.tax,
          tax_amount: detail.tax_amount,
          final_amount: detail.final_amount
        })),
        totalPrice: response.data.invoice.totalPrice,
        huid: response.data.invoice.huid,
        hsn_id: response.data.invoice.hsn_id,
        remark: response.data.invoice.remark,
        status: response.data.invoice.status,
        payment_mode: response.data.invoice.payment_mode,
        amount_paid: response.data.invoice.amount_paid,
        created_at: response.data.invoice.created_at,
        updated_at: response.data.invoice.updated_at
      };
      
      setOrderData(updatedData);
      dispatch(setInvoiceList([updatedData]));

      // Auto-refresh the order details
      await fetchOrderDetails();

      ShowToast("Order updated successfully");
    } catch (error) {
      console.error("Error updating order:", error);
      ShowToast(error.message || "Error updating order");
    } finally {
      setLoading(false);
    }
  };

  // Add delete handler
  const handleDelete = async () => {
    try {
      Alert.alert(
        "Delete Invoice",
        "Are you sure you want to delete this invoice?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                setLoading(true);
                const response = await ApiRequest({
                  url: OR_INVOICE_API.delete(orderId),
                  method: "DELETE"
                });

                if (response.success) {
                  ShowToast("Invoice deleted successfully");
                  dispatch(deleteInvoice(orderId));
                  navigation.goBack();
                } else {
                  throw new Error(response.message || "Failed to delete invoice");
                }
              } catch (error) {
                console.error("Delete Error:", error);
                ShowToast(error.message || "Error deleting invoice");
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error("Delete Error:", error);
      ShowToast(error.message || "Error deleting invoice");
    }
  };

  // Add handleStatusChange function
  const handleStatusChange = async (newStatus) => {
    try {
      setStatusLoading(true);
      
      const response = await ApiRequest({
        url: MANAGE_INVENTORY_API.updateStatus,
        method: "PUT",
        body: {
          id: orderId,
          status: newStatus
        }
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to update status");
      }

      // Update local state
      setOrderData(prev => ({
        ...prev,
        status: newStatus
      }));

      // Format timestamp to MySQL format (YYYY-MM-DD HH:mm:ss)
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');

      // Create log entry for status change
      await ApiRequest({
        url: MANAGE_LOGS_API.create,
        method: "POST",
        body: {
          userName: profileData?.name || "Unknown User",
          action: "STATUS_CHANGE",
          entityType: "ORDER",
          id: orderId,
          type: "order",
          amount: orderData?.totalPrice || "0",
          timestamp: timestamp,
          metadata: JSON.stringify({
            oldStatus: orderData?.status,
            newStatus: newStatus,
            items: orderData?.selectedProduct || []
          })
        }
      });

      ShowToast("Status updated successfully");
    } catch (error) {
      console.error("Status update error:", error);
      ShowToast(error.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  // Fetch data when component mounts or when refresh flag changes
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      ShowToast("Invalid order ID");
      navigation.goBack();
    }
  }, [orderId, shouldRefresh]);

  // Reset PDF URL when modal is closed
  useEffect(() => {
    if (!showInvoice) {
      setPdfUrl(null);
    }
  }, [showInvoice]);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!orderData) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <Text>No order data found</Text>
      </View>
    );
  }

  const isOrder = orderData?.type === "order";

  const renderOrderItem = ({ item }) => {
    if (!item) return null;

    const getStatusColor = (status) => {
      switch (status) {
        case 'available':
          return 'bg-green-100 text-green-800';
        case 'sold':
          return 'bg-red-100 text-red-800';
        case 'reserved':
          return 'bg-yellow-100 text-yellow-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <View className="flex-row justify-between py-2 border-b border-gray-200">
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium">
              {item?.name || 'Unnamed Product'}
            </Text>
            <View className={`px-2 py-1 rounded-full ${getStatusColor(item?.inventory_status)}`}>
              <Text className="text-xs capitalize">
                {item?.inventory_status || 'unknown'}
              </Text>
            </View>
          </View>
          <Text className="text-xs text-gray-500">
            HUID: {orderData?.huid || 'N/A'}
          </Text>
          <Text className="text-xs text-gray-500">
            HSN: {orderData?.hsn_id || 'N/A'}
          </Text>
          {item?.size && (
            <Text className="text-xs text-gray-500">
              Size: {item.size}
            </Text>
          )}
          <Text className="text-xs text-gray-500">
            Wastage: {item?.wastage || '0'}%
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
          <Text className="text-xs text-gray-500">
            Touch: {item?.tounch || '91.60'}
          </Text>
          <Text className="text-sm font-medium text-primary">
            {currency} {handleDigitsFix(item?.final_amount || 0)}
          </Text>
          <Text className="text-xs text-gray-500">
            Metal Value: {currency}{handleDigitsFix(item?.metal_value || 0)}
          </Text>
          <Text className="text-xs text-gray-500">
            Making: {item?.making_type?.label || 'Per Gram'} - {currency}{handleDigitsFix(item?.making_amount || 0)}
          </Text>
          <Text className="text-xs text-gray-500">
            Polishing: {currency}{handleDigitsFix(item?.polishing || 0)}
          </Text>
          <Text className="text-xs text-gray-500">
            Stone Setting: {currency}{handleDigitsFix(item?.stone_setting || 0)}
          </Text>
          <Text className="text-xs text-gray-500">
            Tax ({item?.tax || '0'}%): {currency}{handleDigitsFix(item?.tax_amount || 0)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="rounded-md border border-gray-3 bg-white shadow-xl">
        {/* Status Banner - Show when editing */}
        {isEditing && (
          <View className="bg-blue-100 p-2">
            <Text className="text-blue-800 text-center">Editing in progress...</Text>
          </View>
        )}

        {/* Error Banner - Show when there's an error */}
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

        {/* Success Banner - Show after successful edit */}
        {editStatus === 'success' && (
          <View className="bg-green-100 p-2">
            <Text className="text-green-800 text-center">Successfully updated!</Text>
            <TouchableOpacity 
              onPress={() => setEditStatus(null)}
              className="absolute right-2 top-2"
            >
              <FontAwesome6 name="times" size={16} color="#166534" />
            </TouchableOpacity>
          </View>
        )}

        {/* Header */}
        <View className="border-b p-3 pb-2 flex flex-row items-center justify-between border-gray-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
              <FontAwesome6 name="arrow-left" size={18} color="black" />
            </TouchableOpacity>
            <Text className="font-bold">{isOrder ? "Order" : "Repair"} Details</Text>
          </View>

          <View className="flex-row items-center space-x-3">
            {/* Edit Button */}
            <TouchableOpacity 
              activeOpacity={0.6} 
              onPress={() => {
                if (!orderData) return;
                
                // Transform the order data to match ORInvoiceForm's expected structure
                const formData = {
                  ...orderData,
                  invoiceType: orderData?.type || "order",
                  client: orderData?.client ? {
                    value: orderData.client.id,
                    label: orderData.client.name,
                    phone: orderData.client.phone,
                    email: orderData.client.email,
                    address: orderData.client.address,
                    city: orderData.client.city_id,
                    pin: orderData.client.pincode,
                    role_id: orderData.client.role_id
                  } : null,
                  selectedProduct: (orderData?.selectedProduct || []).map(item => ({
                    name: item?.name || "Product",
                    product_id: item?.product_id,
                    size: item?.size,
                    sale: {
                      gross_weight: item?.gross_weight || "0",
                      less_weight: item?.less_weight || "0",
                      net_weight: item?.net_weight || "0",
                      tounch: item?.tounch || "0",
                      wastage: item?.wastage || "0",
                      fine_weight: item?.fine_weight || "0",
                      rate: item?.rate || "0",
                      metal_value: item?.metal_value || "0",
                      making_type: item?.making_type || { value: "PG", label: "Per Gram" },
                      making_charge: item?.making_charge || "0",
                      making_amount: item?.making_amount || "0",
                      polishing: item?.polishing || "0",
                      stone_setting: item?.stone_setting || "0",
                      additional_charges: item?.additional_charges || "0",
                      subtotal: item?.subtotal || "0",
                      tax: item?.tax || "3",
                      tax_amount: item?.tax_amount || "0",
                      net_price: item?.final_amount || "0"
                    }
                  })),
                  // Add direct fields for the form
                  weight: orderData?.selectedProduct?.[0]?.gross_weight || "0",
                  less_weight: orderData?.selectedProduct?.[0]?.less_weight || "0",
                  net_weight: orderData?.selectedProduct?.[0]?.net_weight || "0",
                  tounch: orderData?.selectedProduct?.[0]?.tounch || "0",
                  wastage: orderData?.selectedProduct?.[0]?.wastage || "0",
                  fine_weight: orderData?.selectedProduct?.[0]?.fine_weight || "0",
                  rate: orderData?.selectedProduct?.[0]?.rate || "0",
                  metal_value: orderData?.selectedProduct?.[0]?.metal_value || "0",
                  making_type: orderData?.selectedProduct?.[0]?.making_type || { value: "PG", label: "Per Gram" },
                  making_charge: orderData?.selectedProduct?.[0]?.making_charge || "0",
                  making_amount: orderData?.selectedProduct?.[0]?.making_amount || "0",
                  polishing: orderData?.selectedProduct?.[0]?.polishing || "0",
                  stone_setting: orderData?.selectedProduct?.[0]?.stone_setting || "0",
                  additional_charges: orderData?.selectedProduct?.[0]?.additional_charges || "0",
                  subtotal: orderData?.selectedProduct?.[0]?.subtotal || "0",
                  tax: orderData?.selectedProduct?.[0]?.tax || "3",
                  tax_amount: orderData?.selectedProduct?.[0]?.tax_amount || "0",
                  final_amount: orderData?.selectedProduct?.[0]?.final_amount || "0",
                  totalPrice: orderData?.totalPrice || "0",
                  amount_paid: orderData?.amount_paid || "0",
                  payment_mode: orderData?.payment_mode || "Cash",
                  payment_date: orderData?.updated_at ? new Date(orderData.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                  bill_date: orderData?.created_at ? new Date(orderData.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                  remark: orderData?.remark || "",
                  comment: orderData?.comment || "",
                  huid: orderData?.huid || "",
                  hsn_id: orderData?.hsn_id ? {
                    value: orderData.hsn_id,
                    label: 'Select HSN'
                  } : null,
                  showInBill: {
                    weight: true,
                    less_weight: true,
                    net_weight: true,
                    tounch: true,
                    wastage: true,
                    fine_weight: true,
                    rate: true,
                    making_charge: true,
                    making_amount: true,
                    tax: true,
                    tax_amount: true,
                    final_amount: true,
                    huid: true,
                    hsn: true
                  },
                  showSizeInBill: true,
                  showCommentInBill: true,
                  cutting_enabled: true
                };

                navigation.navigate('ORInvoiceForm', {
                  editData: formData,
                  isEditing: true,
                  onUpdate: (updatedData) => {
                    setOrderData(updatedData);
                    setEditStatus('success');
                  }
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

            {/* Delete Button */}
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

            {/* PDF Button */}
            <TouchableOpacity 
              activeOpacity={0.6} 
              onPress={handlePdfGeneration}
              disabled={loading}
            >
              <FontAwesome6 name="file-pdf" color="black" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Last Updated Info */}
        {orderData?.updated_at && (
          <View className="px-3 py-1 bg-gray-50">
            <Text className="text-xs text-gray-500">
              Last updated: {new Date(orderData.updated_at).toLocaleString()}
            </Text>
          </View>
        )}

        {/* Customer Info */}
        <View className="p-3 border-b border-gray-200">
          <Text className="text-lg font-semibold">{orderData?.client?.name || 'Unknown Customer'}</Text>
          <Text className="text-sm text-gray-500">
            Email: {orderData?.client?.email || 'N/A'}
          </Text>
          <Text className="text-sm text-gray-500">
            Phone: {orderData?.client?.phone || 'N/A'}
          </Text>
          <Text className="text-sm text-gray-500">
            Address: {orderData?.client?.address || 'N/A'}
          </Text>
          <Text className="text-sm text-gray-500">
            Date: {moment(orderData?.created_at).format('DD MMM YYYY, hh:mm A')}
          </Text>
          <View className="mt-2 flex-row justify-between items-center">
            <TouchableOpacity 
              onPress={() => {
                if (statusLoading) return;
                Alert.alert(
                  "Change Status",
                  "Select new status",
                  [
                    {
                      text: "Cancel",
                      style: "cancel"
                    },
                    {
                      text: "In Progress",
                      onPress: () => handleStatusChange("in_progress")
                    },
                    {
                      text: "Completed",
                      onPress: () => handleStatusChange("completed")
                    },
                    {
                      text: "Cancelled",
                      onPress: () => handleStatusChange("cancelled")
                    }
                  ]
                );
              }}
              disabled={statusLoading}
              className={`px-3 py-1 rounded-full ${
                orderData?.status === 'completed' ? 'bg-green-100' : 
                orderData?.status === 'in_progress' ? 'bg-yellow-100' : 'bg-red-100'
              }`}
            >
              {statusLoading ? (
                <ActivityIndicator size="small" color="#666" />
              ) : (
                <Text className={`text-sm capitalize ${
                  orderData?.status === 'completed' ? 'text-green-800' : 
                  orderData?.status === 'in_progress' ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  {orderData?.status?.replace('_', ' ') || 'unknown'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Items Section */}
        <View className="p-3">
          <Text className="font-medium text-gray-700 mb-2">Items:</Text>
          <FlatList
            data={orderData?.selectedProduct || []}
            renderItem={renderOrderItem}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text className="text-gray-500 text-center py-2">
                No items in this order
              </Text>
            }
          />
        </View>

        {/* Payment Summary */}
        <View className="p-3 bg-gray-50 border-t border-gray-200">
          <View className="flex-row justify-between mb-1">
            <Text className="font-medium">Total Amount:</Text>
            <Text className="font-medium">
              {currency} {handleDigitsFix(orderData?.total_amount || 0)}
            </Text>
          </View>
          {orderData?.amount_paid > 0 && (
            <>
              <View className="flex-row justify-between mb-1">
                <Text>Amount Paid:</Text>
                <Text>{currency} {handleDigitsFix(orderData?.amount_paid || 0)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="font-semibold">Balance:</Text>
                <Text className="font-semibold text-primary">
                  {currency} {handleDigitsFix((orderData?.total_amount || 0) - (orderData?.amount_paid || 0))}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Payment Details */}
        {orderData?.payment_mode && (
          <View className="p-3 border-t border-gray-200">
            <Text className="text-sm text-gray-600">
              Payment Mode: {orderData?.payment_mode}
            </Text>
            {orderData?.payment_date && (
              <Text className="text-sm text-gray-600">
                Payment Date: {moment(orderData?.payment_date).format('DD MMM YYYY, hh:mm A')}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* OrViewer Modal */}
      <OrViewer
        visible={showInvoice}
        onClose={() => setShowInvoice(false)}
        orderId={orderId}
        type={orderData?.type || 'order'}
      />
    </ScrollView>
  );
};

export default OrderDetails;
