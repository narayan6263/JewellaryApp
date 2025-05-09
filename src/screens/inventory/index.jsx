import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { MANAGE_INVENTORY_API, MANAGE_LOGS_API } from '../../utils/api/endpoints';
import { ApiRequest } from '../../utils/api';
import ShowToast from '../../components/common/ShowToast';
import { useSelector } from 'react-redux';

const InventoryScreen = () => {
  const navigation = useNavigation();
  const { profileData } = useSelector((state) => state.userSlices);
  const [searchQuery, setSearchQuery] = useState('');
  const [inventory, setInventory] = useState({
    items: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItemLoading, setSelectedItemLoading] = useState(false);

  const fetchInventory = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiRequest({
        url: MANAGE_INVENTORY_API.list,
        params: { page }
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch inventory");
      }

      setInventory({
        items: response.data.data,
        currentPage: response.data.current_page,
        totalPages: response.data.last_page,
        totalItems: response.data.total,
        perPage: response.data.per_page
      });
    } catch (error) {
      console.error("Error fetching inventory:", error);
      setError(error.message);
      ShowToast(error.message || "Error fetching inventory");
    } finally {
      setLoading(false);
    }
  };

  // Add focus effect to refresh list when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchInventory();
    }, [])
  );

  const handleAddItem = () => {
    navigation.navigate('AddEditInventory');
  };

  const handleItemPress = async (item) => {
    try {
      setSelectedItemLoading(true);
      
      const response = await ApiRequest({
        url: `${MANAGE_INVENTORY_API.details}/${item.id}`,
        cache: true // Enable caching
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to fetch item details");
      }

      navigation.navigate('InventoryDetails', { 
        id: item.id,
        item: response.data,
        refresh: fetchInventory 
      });
    } catch (error) {
      console.error("Error fetching item details:", error);
      ShowToast(error.message || "Error fetching item details");
    } finally {
      setSelectedItemLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'available': 'Available',
      'sold': 'Sold',
      'reserved': 'Reserved',
      'unavailable': 'Unavailable'
    };
    return statusMap[status] || 'Unknown';
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'available': 'bg-green-100 text-green-700',
      'sold': 'bg-blue-100 text-blue-700',
      'reserved': 'bg-yellow-100 text-yellow-700',
      'unavailable': 'bg-red-100 text-red-700'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700';
  };

  const handleStatusUpdate = async (item, newStatus) => {
    try {
      setSelectedItemLoading(true);

      // Format timestamp to MySQL format (YYYY-MM-DD HH:mm:ss)
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
      
      // Prepare both API calls
      const statusUpdatePromise = ApiRequest({
        url: MANAGE_INVENTORY_API.updateStatus,
        method: 'PUT',
        body: { 
          status: newStatus,
          id: item.id.toString()
        }
      });

      const logCreatePromise = ApiRequest({
        url: MANAGE_LOGS_API.create,
        method: 'POST',
        body: {
          userName: profileData?.name || 'Unknown User',
          productName: item.name || 'Unknown Product',
          id: item.id,
          type: 'inventory',
          amount: parseFloat(item.final_amount || 0).toFixed(2),
          action: 'STATUS_CHANGE',
          entityType: 'INVENTORY',
          timestamp: timestamp,
          metadata: JSON.stringify({
            note: `Status changed from ${item.status} to ${newStatus}`,
            oldStatus: item.status,
            newStatus: newStatus,
            formData: {
              gross_weight: item.gross_weight,
              net_weight: item.net_weight,
              fine_weight: item.fine_weight,
              final_amount: item.final_amount,
              product_id: item.product_id
            }
          })
        }
      });

      // Execute both API calls simultaneously
      const [statusResponse, logResponse] = await Promise.all([
        statusUpdatePromise,
        logCreatePromise
      ]);

      if (!statusResponse?.success) {
        throw new Error(statusResponse?.message || "Failed to update status");
      }

      if (!logResponse?.success) {
        console.error("Warning: Status updated but log creation failed:", logResponse?.message);
        ShowToast("Status updated but logging failed");
      } else {
        ShowToast(statusResponse.message || "Status updated successfully");
      }

      fetchInventory(); // Refresh the list
    } catch (error) {
      console.error("Error updating status:", error);
      ShowToast(error.message || "Error updating status");
    } finally {
      setSelectedItemLoading(false);
    }
  };

  const StatusButton = ({ item }) => {
    const [showStatusOptions, setShowStatusOptions] = useState(false);
    
    const statusOptions = [
      { value: 'available', label: 'Available' },
      { value: 'sold', label: 'Sold' },
      { value: 'reserved', label: 'Reserved' },
      { value: 'unavailable', label: 'Unavailable' }
    ];

    return (
      <View>
        <TouchableOpacity
          onPress={() => setShowStatusOptions(!showStatusOptions)}
          disabled={selectedItemLoading}
          className={`px-3 py-1.5 rounded-full ${getStatusColor(item.status)}`}
        >
          <Text className={`text-sm font-medium`}>
            {getStatusLabel(item.status)}
          </Text>
        </TouchableOpacity>

        {showStatusOptions && (
          <View className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg z-10 min-w-[180px]">
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  handleStatusUpdate(item, option.value);
                  setShowStatusOptions(false);
                }}
                className={`px-6 py-3 border-b border-gray-100 ${
                  item.status === option.value ? getStatusColor(option.value) : ''
                }`}
              >
                <Text className={`text-base ${
                  item.status === option.value 
                    ? 'font-bold' 
                    : 'text-gray-700'
                }`}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const handleLoadMore = () => {
    if (inventory.currentPage < inventory.totalPages) {
      fetchInventory(inventory.currentPage + 1);
    }
  };

  const renderInventoryItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => handleItemPress(item)}
      className="bg-white rounded-lg p-4 mb-3 flex-row items-center"
      disabled={selectedItemLoading}
    >
      <View className="h-16 w-16 bg-gray-200 rounded-lg mr-4">
        {item.product_data?.image_url ? (
          <Image 
            source={{ uri: item.product_data.image_url }} 
            className="h-16 w-16 rounded-lg"
            resizeMode="cover"
          />
        ) : (
          <View className="h-16 w-16 bg-gray-200 rounded-lg justify-center items-center">
            <MaterialIcons name="image" size={24} color="#9ca3af" />
          </View>
        )}
      </View>
      
      <View className="flex-1">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-lg font-semibold">{item.name}</Text>
            <Text className="text-gray-500 text-sm">{item.product_data?.name}</Text>
          </View>
          <StatusButton item={item} />
        </View>
        
        <Text className="text-gray-600 mt-1">ID: {item.product_id}</Text>
        
        <View className="flex-row mt-2">
          <View className="mr-4">
            <Text className="text-gray-500">Net Weight</Text>
            <Text>{item.net_weight}g</Text>
          </View>
          <View>
            <Text className="text-gray-500">Rate</Text>
            <Text>₹{item.rate}/g</Text>
          </View>
        </View>
      </View>
      {selectedItemLoading && (
        <ActivityIndicator size="small" color="#0000ff" style={{ marginLeft: 10 }} />
      )}
    </TouchableOpacity>
  );

  useEffect(() => {
    fetchInventory();
  }, []);

  if (loading && inventory.items.length === 0) {
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
          onPress={() => fetchInventory()} 
          className="bg-blue-500 px-4 py-2 rounded"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white p-4 flex-row justify-between items-center">
        <Text className="text-xl font-bold">Inventory</Text>
        <TouchableOpacity
          onPress={handleAddItem}
          className="bg-blue-500 p-2 rounded-full"
        >
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="p-4">
        <TextInput
          placeholder="Search items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="bg-white p-3 rounded-lg"
        />
      </View>

      {/* Inventory List */}
      <FlatList
        data={inventory.items.filter(item => 
          (item?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (item?.product_id?.toString() || '').includes(searchQuery)
        )}
        renderItem={renderInventoryItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => (
          loading ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#0000ff" />
            </View>
          ) : null
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-gray-500">No items found</Text>
          </View>
        )}
      />
    </View>
  );
};

export default InventoryScreen; 