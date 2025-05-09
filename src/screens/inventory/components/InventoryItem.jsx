import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const InventoryItem = ({ item, onPress }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'sold':
        return 'bg-red-500';
      case 'reserved':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-lg p-4 mb-4 shadow-sm"
    >
      <View className="flex-row">
        {/* Item Image */}
        <View className="w-20 h-20 bg-gray-200 rounded-lg mr-4">
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              className="w-full h-full rounded-lg"
            />
          ) : (
            <View className="flex-1 justify-center items-center">
              <MaterialIcons name="image" size={32} color="gray" />
            </View>
          )}
        </View>

        {/* Item Details */}
        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <Text className="text-lg font-bold">{item.name}</Text>
            <View className={`px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
              <Text className="text-white text-xs">{item.status}</Text>
            </View>
          </View>

          <Text className="text-gray-600">{item.product_id}</Text>
          
          <View className="flex-row mt-2">
            <View className="mr-4">
              <Text className="text-gray-500 text-sm">Weight</Text>
              <Text className="font-medium">{item.net_weight}g</Text>
            </View>
            <View>
              <Text className="text-gray-500 text-sm">Rate</Text>
              <Text className="font-medium">₹{item.rate}/g</Text>
            </View>
          </View>

          <View className="mt-2">
            <Text className="text-gray-500 text-sm">Metal Type</Text>
            <Text className="font-medium capitalize">{item.metal_type}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default InventoryItem; 