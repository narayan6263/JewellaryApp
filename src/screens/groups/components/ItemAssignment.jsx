import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, FlatList } from 'react-native';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { GroupContext } from '@/src/screens/groups/GroupsScreen';
import { ApiRequest } from '@/src/utils/api';
import ShowToast from '@/src/components/common/ShowToast';
import { MANAGE_PRODUCT_API, MANAGE_GROUPS_API } from '@/src/utils/api/endpoints';
import { handleDigitsFix } from '@/src/utils';
import { useInventory } from '@/src/screens/inventory/hooks/useInventory';
import SelectInput from '@/src/components/common/SelectInput';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const USE_MOCK_DATA = false; // Toggle for using mock data

// Mock jewelry items for demonstration
const MOCK_JEWELRY_ITEMS = [
  { id: '1', name: 'Diamond Ring', type: 'Ring', weight: '2.5g', price: '1500' },
  { id: '2', name: 'Gold Necklace', type: 'Necklace', weight: '5g', price: '2500' },
  { id: '3', name: 'Pearl Earrings', type: 'Earrings', weight: '1g', price: '800' },
];

const ItemAssignment = ({ contactId }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [assignedItems, setAssignedItems] = useState([]);
  const { groups, setGroups } = useContext(GroupContext);
  const { inventory } = useInventory();

  // Fetch groups
  const fetchGroups = async () => {
    try {
      const response = await ApiRequest({
        url: MANAGE_GROUPS_API.fetch,
        method: 'GET',
      });
      if (response.success) {
        setGroups(response.data.groups);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      ShowToast('Failed to fetch groups');
    }
  };

  // Fetch assigned items
  const fetchAssignedItems = async () => {
    try {
      const response = await ApiRequest({
        url: `/members/${contactId}/assigned-products`,
        method: 'GET'
      });

      if (response.success) {
        setAssignedItems(response.data || []);
      }
    } catch (error) {
      ShowToast('Failed to fetch assigned items');
    }
  };

  useEffect(() => {
    if (contactId) {
      fetchAssignedItems();
      fetchGroups();
    }
  }, [contactId]);

  // Handle item selection
  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setShowGroupModal(true);
  };

  // Handle group selection
  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setShowGroupModal(false);
    setShowMemberModal(true);
  };

  // Handle assigning item to member
  const handleAssignToMember = async (memberId) => {
    try {
      const response = await ApiRequest({
        url: '/groups/assign-item',
        method: 'POST',
        body: {
          Id: selectedItem.value,
          memberId: memberId
        }
      });

      if (response.status === 'success') {
        ShowToast('Item assigned successfully');
        fetchAssignedItems();
        setSelectedItem(null);
        setSelectedGroup(null);
        setShowMemberModal(false);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      ShowToast(error.message || 'Failed to assign item');
    }
  };

  // Handle removing assigned item
  const handleRemoveItem = async (itemId) => {
    try {
      const response = await ApiRequest({
        url: '/groups/unassign-item',
        method: 'POST',
        body: {
          Id: itemId,
          memberId: contactId
        }
      });

      if (response.success) {
        ShowToast('Item unassigned successfully');
        fetchAssignedItems();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      ShowToast(error.message || 'Failed to unassign item');
    }
  };

  // Format inventory items for dropdown
  const inventoryOptions = inventory
    .filter(item => item.status === 'available')
    .map(item => ({
      label: `${item.name} (${item.product_id}) - ${item.metal_type}`,
      value: item.id,
      details: item
    }));

  const renderAssignedItem = ({ item }) => (
    <View className="bg-white p-4 rounded-lg mb-2 flex-row justify-between items-center">
      <View>
        <Text className="font-medium">{item.name}</Text>
        <Text className="text-gray-600 text-sm">
          {item.product_id} - {item.metal_type}
        </Text>
        <Text className="text-gray-600 text-sm">
          Weight: {item.gross_weight}g | Fine: {item.fine_weight}g
        </Text>
      </View>
      <TouchableOpacity 
        onPress={() => handleRemoveItem(item.id)}
        className="bg-red-100 p-2 rounded-full"
      >
        <MaterialIcons name="remove-circle-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="bg-white rounded-lg p-4">
      {/* Item Selection */}
      <View className="mb-4">
        <Text className="text-gray-600 mb-2">Select Item to Assign</Text>
        <SelectInput
          value={selectedItem}
          placeholder="Choose an item"
          data={inventoryOptions}
          onSelect={handleItemSelect}
        />
      </View>

      {/* Groups Modal */}
      <Modal
        visible={showGroupModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGroupModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white w-[90%] rounded-xl max-h-[80%]">
            <View className="p-4 border-b border-gray-100 flex-row justify-between items-center">
              <Text className="text-lg font-semibold">Select Group</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowGroupModal(false);
                  setSelectedItem(null);
                }}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <FontAwesome6 name="xmark" size={16} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView className="p-4">
              {groups.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  onPress={() => handleGroupSelect(group)}
                  className="bg-white border border-gray-200 rounded-lg p-4 mb-2 flex-row justify-between items-center"
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                      <FontAwesome6 name="users" size={16} color="#5750F1" />
                    </View>
                    <View>
                      <Text className="font-medium text-gray-800">{group.name}</Text>
                      <Text className="text-gray-500 text-sm">
                        {group.membersCount || 0} members
                      </Text>
                    </View>
                  </View>
                  <FontAwesome6 name="chevron-right" size={16} color="#666" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Members Modal */}
      <Modal
        visible={showMemberModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMemberModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white w-[90%] rounded-xl max-h-[80%]">
            <View className="p-4 border-b border-gray-100">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-semibold">{selectedGroup?.name} Members</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setShowMemberModal(false);
                    setSelectedGroup(null);
                  }}
                  className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                >
                  <FontAwesome6 name="xmark" size={16} color="#666" />
                </TouchableOpacity>
              </View>
              {selectedItem && (
                <Text className="text-gray-500">
                  Assigning: {selectedItem.label}
                </Text>
              )}
            </View>
            
            <ScrollView className="p-4">
              {selectedGroup?.members?.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  onPress={() => handleAssignToMember(member.id)}
                  className="bg-white border border-gray-200 rounded-lg p-4 mb-2 flex-row justify-between items-center"
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                      <FontAwesome6 name="user" size={16} color="#5750F1" />
                    </View>
                    <Text className="font-medium text-gray-800">{member.name}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleAssignToMember(member.id)}
                    className="bg-primary px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white font-medium">Assign</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Assigned Items List */}
      {assignedItems.length > 0 && (
        <View>
          <Text className="text-gray-600 mb-2">Assigned Items</Text>
          <FlatList
            data={assignedItems}
            renderItem={renderAssignedItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>
      )}
    </View>
  );
};

export default ItemAssignment; 