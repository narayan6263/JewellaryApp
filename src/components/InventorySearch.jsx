// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons';
// import { ApiRequest } from '../utils/api';
// import { MANAGE_INVENTORY_API } from '../utils/api/endpoints';
// import ShowToast from './common/ShowToast';

// const InventorySearch = ({ 
//   onItemSelect,
//   selectedItem = null
// }) => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showResults, setShowResults] = useState(false);
//   const [inventoryItems, setInventoryItems] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [filteredItems, setFilteredItems] = useState([]);

//   const fetchInventoryItems = async () => {
//     try {
//       setLoading(true);
//       const response = await ApiRequest({
//         url: MANAGE_INVENTORY_API.list,
//         params: { page: 1 }
//       });

//       if (response?.success) {
//         setInventoryItems(response.data.data);
//       } else {
//         ShowToast(response?.message || "Failed to fetch inventory items");
//       }
//     } catch (error) {
//       console.error("Error fetching inventory:", error);
//       ShowToast("Failed to fetch inventory items");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchInventoryItems();
//   }, []);

//   useEffect(() => {
//     if (searchQuery.trim()) {
//       const filtered = inventoryItems.filter(item => 
//         item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.product_id.toString().includes(searchQuery)
//       );
//       setFilteredItems(filtered);
//     } else {
//       setFilteredItems([]);
//     }
//   }, [searchQuery, inventoryItems]);

//   const handleItemSelect = (item) => {
//     onItemSelect(item);
//     setSearchQuery(item.name);
//     setShowResults(false);
//   };

//   return (
//     <View className="relative">
//       <View className="flex-row items-center border border-gray-300 rounded-lg p-2">
//         <MaterialIcons name="search" size={24} color="gray" />
//         <TextInput
//           className="flex-1 ml-2"
//           placeholder="Search inventory items..."
//           value={searchQuery}
//           onChangeText={(text) => {
//             setSearchQuery(text);
//             setShowResults(true);
//           }}
//           onFocus={() => setShowResults(true)}
//         />
//         {searchQuery && (
//           <TouchableOpacity onPress={() => {
//             setSearchQuery('');
//             setShowResults(false);
//           }}>
//             <MaterialIcons name="close" size={24} color="gray" />
//           </TouchableOpacity>
//         )}
//       </View>

//       {showResults && (
//         <View className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-60 z-10">
//           {loading ? (
//             <View className="p-4 items-center">
//               <ActivityIndicator size="small" color="#0000ff" />
//             </View>
//           ) : filteredItems.length > 0 ? (
//             <FlatList
//               data={filteredItems}
//               keyExtractor={(item) => item.id.toString()}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   className="p-3 border-b border-gray-200"
//                   onPress={() => handleItemSelect(item)}
//                 >
//                   <Text className="font-medium">{item.name}</Text>
//                   <Text className="text-gray-500 text-sm">ID: {item.product_id}</Text>
//                   <View className="flex-row justify-between mt-1">
//                     <Text className="text-sm">Weight: {item.net_weight}g</Text>
//                     <Text className="text-sm">Rate: ₹{item.rate}/g</Text>
//                   </View>
//                 </TouchableOpacity>
//               )}
//             />
//           ) : searchQuery ? (
//             <View className="p-4">
//               <Text className="text-gray-500 text-center">No items found</Text>
//             </View>
//           ) : null}
//         </View>
//       )}
//     </View>
//   );
// };

// export default InventorySearch; 



import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ApiRequest } from '../utils/api';
import { MANAGE_INVENTORY_API } from '../utils/api/endpoints';
import ShowToast from './common/ShowToast';

const InventorySearch = ({ 
  onItemSelect,
  selectedItem = null
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);

  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      const response = await ApiRequest({
        url: MANAGE_INVENTORY_API.list,
        params: { page: 1 }
      });
      
      console.log('API Response:', response); // Add this line
      
      if (response?.success) {
        setInventoryItems(response.data.data);
        console.log('Inventory Items:', response.data.data); // Add this line
      } else {
        ShowToast(response?.message || "Failed to fetch inventory items");
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      ShowToast("Failed to fetch inventory items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = inventoryItems.filter(item => 
        (item.name && typeof item.name === 'string' ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
        (item.product_id ? item.product_id.toString().includes(searchQuery) : false)
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
  }, [searchQuery, inventoryItems]);

  const handleItemSelect = (item) => {
    onItemSelect(item);
    setSearchQuery(item.name || '');
    setShowResults(false);
  };

  return (
    <View className="relative">
      <View className="flex-row items-center border border-gray-300 rounded-lg p-2">
        <MaterialIcons name="search" size={24} color="gray" />
        <TextInput
          className="flex-1 ml-2"
          placeholder="Search inventory items..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
        />
        {searchQuery && (
          <TouchableOpacity onPress={() => {
            setSearchQuery('');
            setShowResults(false);
          }}>
            <MaterialIcons name="close" size={24} color="gray" />
          </TouchableOpacity>
        )}
      </View>

      {showResults && (
        <View className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-60 z-10">
          {loading ? (
            <View className="p-4 items-center">
              <ActivityIndicator size="small" color="#0000ff" />
            </View>
          ) : filteredItems.length > 0 ? (
            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="p-3 border-b border-gray-200"
                  onPress={() => handleItemSelect(item)}
                >
                  <Text className="font-medium">{item.name || 'Unnamed Item'}</Text>
                  <Text className="text-gray-500 text-sm">ID: {item.product_id || 'N/A'}</Text>
                  <View className="flex-row justify-between mt-1">
                    <Text className="text-sm">Weight: {item.net_weight || 0}g</Text>
                    <Text className="text-sm">Rate: ₹{item.rate || 0}/g</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : searchQuery ? (
            <View className="p-4">
              <Text className="text-gray-500 text-center">No items found</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

export default InventorySearch;