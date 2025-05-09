import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { MANAGE_INVENTORY_API } from '../../utils/api/endpoints';
import { ApiRequest } from '../../utils/api';
import { ShowToast } from '../../components/common/ShowToast';

const InventoryDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [item, setItem] = useState(route.params?.item || null);
  const [loading, setLoading] = useState(!route.params?.item);
  const [error, setError] = useState(null);

  const fetchItemDetails = useCallback(async (itemId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiRequest({
        url: `${MANAGE_INVENTORY_API.details}/${itemId}`,
        cache: true // Enable caching
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch item details");
      }

      setItem(response.data);
    } catch (error) {
      console.error("Error fetching item details:", error);
      setError(error.message);
      ShowToast(error.message || "Error fetching item details");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const itemId = route.params?.id;
    if (itemId && !route.params?.item) {
      fetchItemDetails(itemId);
    }
    // Log the item data to see the structure
    if (route.params?.item) {
      console.log('Item Data:', JSON.stringify(route.params.item, null, 2));
    }
  }, [route.params?.id, route.params?.item, fetchItemDetails]);

  const handleEdit = () => {
    navigation.navigate('AddEditInventory', { item });
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiRequest({
                url: `${MANAGE_INVENTORY_API.delete}/${item.id}`,
                method: 'DELETE'
              });
              ShowToast('Item deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting item:", error);
              ShowToast(error.message || "Failed to delete item");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <Text className="text-red-500 text-lg mb-4">Error: {error}</Text>
        <TouchableOpacity 
          onPress={() => fetchItemDetails(route.params?.id)} 
          className="bg-blue-500 px-4 py-2 rounded"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!item) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <Text className="text-gray-500">Item not found</Text>
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 1:
        return 'bg-green-100 text-green-700';
      case 0:
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return 'Active';
      case 0:
        return 'Inactive';
      default:
        return 'Unknown';
    }
  };

  const parseValue = (val) => {
    try {
      if (typeof val === 'string' && val.includes('{')) {
        const parsed = JSON.parse(val);
        return parsed.value || val;
      }
      return val;
    } catch (e) {
      return val;
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white p-4 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Item Details</Text>
        <View className="flex-row">
          <TouchableOpacity onPress={handleEdit} className="mr-4">
            <MaterialIcons name="edit" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <MaterialIcons name="delete" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Item Header */}
        <View className="bg-white p-4 mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-2xl font-bold">{item.name}</Text>
            <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
              <Text className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
          <Text className="text-gray-600">ID: {item.product_id}</Text>
        </View>

        {/* Image */}
        <View className="bg-white p-4 mb-4">
          {item.product_data?.image ? (
            <Image
              source={{ uri: `${item.image_url}/${item.product_data.image}` }}
              className="w-full h-64 rounded-lg"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-64 bg-gray-200 rounded-lg justify-center items-center">
              <MaterialIcons name="image" size={48} color="#9ca3af" />
              <Text className="text-gray-400 mt-2">No image available</Text>
            </View>
          )}
        </View>

        {/* Basic Information */}
        <View className="bg-white p-4 mb-4">
          <Text className="text-lg font-semibold mb-4">Basic Information</Text>
          <View className="space-y-4">
            <View>
              <Text className="text-gray-600">Metal Type</Text>
              <Text className="text-lg">{item.metal_type}</Text>
            </View>
            <View>
              <Text className="text-gray-600">Size</Text>
              <Text className="text-lg">{item.size}</Text>
            </View>
          </View>
        </View>

        {/* Weight Information */}
        <View className="bg-white p-4 mb-4">
          <Text className="text-lg font-semibold mb-4">Weight Information</Text>
          <View className="space-y-4">
            <View className="flex-row justify-between">
              <View>
                <Text className="text-gray-600">Gross Weight</Text>
                <Text className="text-lg">{parseValue(item.gross_weight)}g</Text>
              </View>
              <View>
                <Text className="text-gray-600">Less Weight</Text>
                <Text className="text-lg">{parseValue(item.less_weight)}g</Text>
              </View>
              <View>
                <Text className="text-gray-600">Net Weight</Text>
                <Text className="text-lg">{parseValue(item.net_weight)}g</Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <View>
                <Text className="text-gray-600">Touch</Text>
                <Text className="text-lg">{parseValue(item.tounch)}%</Text>
              </View>
              <View>
                <Text className="text-gray-600">Wastage</Text>
                <Text className="text-lg">{parseValue(item.wastage)}%</Text>
              </View>
              <View>
                <Text className="text-gray-600">Fine Weight</Text>
                <Text className="text-lg">{parseValue(item.fine_weight)}g</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pricing Information */}
        <View className="bg-white p-4 mb-4">
          <Text className="text-lg font-semibold mb-4">Pricing Information</Text>
          <View className="space-y-4">
            <View className="flex-row justify-between">
              <View>
                <Text className="text-gray-600">Rate</Text>
                <Text className="text-lg">₹{parseValue(item.rate)}</Text>
              </View>
              <View>
                <Text className="text-gray-600">Making Type</Text>
                <Text className="text-lg">{parseValue(item.making_type)}</Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <View>
                <Text className="text-gray-600">Making Charges</Text>
                <Text className="text-lg">₹{parseValue(item.making_charge)}</Text>
              </View>
              <View>
                <Text className="text-gray-600">Stone Setting</Text>
                <Text className="text-lg">₹{parseValue(item.stone_setting)}</Text>
              </View>
            </View>

            <View>
              <Text className="text-gray-600">Polishing</Text>
              <Text className="text-lg">{parseValue(item.polishing)}</Text>
            </View>

            <View>
              <Text className="text-gray-600">Additional Charges</Text>
              <Text className="text-lg">{parseValue(item.additional_charges)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default InventoryDetails; 