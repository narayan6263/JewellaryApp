import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, ActivityIndicator } from 'react-native';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import SectionHeader from '@/src/components/common/SectionHeader';
import { GroupContext } from '@/src/screens/groups/GroupsScreen';
import FilterByName from '@/src/components/common/FilterByName';
import { ApiRequest } from "@/src/utils/api";
import { MANAGE_GROUPS_API } from "@/src/utils/api";
import { OR_INVOICE_API } from "@/src/utils/api";
import ShowToast from "@/src/components/common/ShowToast";

const USE_MOCK_DATA = false;

const MOCK_MEMBERS = [
  { 
    id: '1', 
    name: 'John Doe',
    role: 'KARIGAR',
    assignedItems: {
      total: 5,
      pending: 2,
      in_progress: 2,
      completed: 1
    }
  },
  { 
    id: '2', 
    name: 'Jane Smith',
    role: 'KARIGAR',
    assignedItems: {
      total: 3,
      pending: 1,
      in_progress: 1,
      completed: 1
    }
  }
];

const MOCK_ITEMS = [
  {
    id: '1',
    type: 'ORDER',
    order_number: 'ORD001',
    description: 'Gold Ring with Diamond',
    weight: '10.5',
    material: 'GOLD',
    status: 'PENDING',
    inventory_status: 'reserved',
    huid: 'HUID123',
    hsn_id: 'HSN456',
    specifications: {
      design_no: 'D123',
      size: '7'
    }
  },
  {
    id: '2',
    type: 'REPAIR',
    order_number: 'REP001',
    description: 'Silver Chain Repair',
    weight: '15.2',
    material: 'SILVER',
    status: 'PENDING',
    inventory_status: 'repair',
    huid: 'HUID789',
    hsn_id: 'HSN101',
    specifications: {
      design_no: 'R456'
    }
  }
];

const Allocation = ({ navigation }) => {
  const { groups, fetchGroups } = useContext(GroupContext);
  const [members, setMembers] = useState(USE_MOCK_DATA ? MOCK_MEMBERS : []);
  const [filteredMembers, setFilteredMembers] = useState(USE_MOCK_DATA ? MOCK_MEMBERS : []);
  const [selectedMember, setSelectedMember] = useState(null);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itemTypeFilter, setItemTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredItems = itemTypeFilter === 'ALL' 
    ? availableItems
    : availableItems.filter(item => item.type === itemTypeFilter);

  useEffect(() => {
    fetchGroups();
    if (!USE_MOCK_DATA) {
      fetchMembers();
      fetchAvailableItems();
    }
  }, [currentPage]);

  const fetchMembers = async (page = currentPage, search = searchTerm) => {
    if (USE_MOCK_DATA) {
      setMembers(MOCK_MEMBERS);
      setFilteredMembers(MOCK_MEMBERS);
      return;
    }

    try {
      setLoading(true);
      const response = await ApiRequest({
        url: MANAGE_GROUPS_API.membersList,
        method: 'GET',
        params: {
          page,
          search,
          role: 'KARIGAR',
          status: 'ACTIVE'
        }
      });

      if (response.success) {
        const { members: fetchedMembers, pagination } = response.data;
        if (page === 1) {
          setMembers(fetchedMembers);
          setFilteredMembers(fetchedMembers);
        } else {
          setMembers(prev => [...prev, ...fetchedMembers]);
          setFilteredMembers(prev => [...prev, ...fetchedMembers]);
        }
        setTotalPages(pagination.last_page);
      } else {
        throw new Error(response.message || 'Failed to fetch members');
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
      ShowToast(error.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await fetchMembers(1);
  };

  const handleSearch = (searchTerm) => {
    setSearchTerm(searchTerm);
    if (!searchTerm) {
      setFilteredMembers(members);
      return;
    }
    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMembers(filtered);
  };

  const fetchAvailableItems = async () => {
    if (USE_MOCK_DATA) {
      setAvailableItems(MOCK_ITEMS);
      return;
    }

    try {
      // Fetch both orders and repairs that are not assigned
      const [ordersResponse, repairsResponse] = await Promise.all([
        ApiRequest({
          url: OR_INVOICE_API.listAll,
          method: 'GET',
          params: {
            status: 'PENDING',
            type: 'order'
          }
        }),
        ApiRequest({
          url: OR_INVOICE_API.listAll,
          method: 'GET',
          params: {
            status: 'PENDING',
            type: 'repair'
          }
        })
      ]);

      const availableItems = [];

      // Process orders
      if (ordersResponse.success) {
        const orderItems = ordersResponse.data
          .filter(order => !order.assigned_to) // Only get unassigned orders
          .flatMap(order => order.selectedProduct.map(product => ({
            id: product.id,
            type: 'ORDER',
            order_number: order.id,
            description: product.name,
            weight: product.gross_weight,
            material: product.specifications?.material || 'GOLD',
            status: 'PENDING',
            inventory_status: product.inventory_status,
            huid: order.huid,
            hsn_id: order.hsn_id,
            specifications: {
              design_no: product.design_no,
              size: product.size
            }
          })));
        availableItems.push(...orderItems);
      }

      // Process repairs
      if (repairsResponse.success) {
        const repairItems = repairsResponse.data
          .filter(repair => !repair.assigned_to) // Only get unassigned repairs
          .flatMap(repair => repair.selectedProduct.map(product => ({
            id: product.id,
            type: 'REPAIR',
            order_number: repair.id,
            description: product.name,
            weight: product.gross_weight,
            material: product.specifications?.material || 'GOLD',
            status: 'PENDING',
            inventory_status: product.inventory_status,
            huid: repair.huid,
            hsn_id: repair.hsn_id,
            specifications: {
              design_no: product.design_no,
              size: product.size
            }
          })));
        availableItems.push(...repairItems);
      }

      setAvailableItems(availableItems);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const handleAssignItems = async () => {
    if (!selectedMember || selectedItems.length === 0) return;

    setLoading(true);
    try {
      const response = await ApiRequest({
        url: MANAGE_GROUPS_API.assignItems,
        method: 'POST',
        data: {
          member_id: selectedMember.id,
          items: selectedItems.map(item => ({
            item_id: item.id,
            item_type: item.type,
            expected_completion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            description: item.description,
            weight: item.weight,
            specifications: {
              design_no: item.specifications?.design_no,
              size: item.specifications?.size,
              material: item.material
            },
            images: item.images || []
          })),
          assigned_by: 'ADMIN_ID', // Replace with actual admin ID
          priority: 'MEDIUM'
        }
      });

      if (response.success) {
        ShowToast('Items assigned successfully');
        setAssignModalVisible(false);
        setSelectedItems([]);
        if (!USE_MOCK_DATA) {
          fetchMembers();
          fetchAvailableItems();
        }
      } else {
        throw new Error(response.message || 'Failed to assign items');
      }
    } catch (error) {
      console.error('Failed to assign items:', error);
      ShowToast(error.message || 'Failed to assign items');
    } finally {
      setLoading(false);
    }
  };

  const renderAssignmentModal = () => (
    <Modal
      visible={assignModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setAssignModalVisible(false)}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white w-11/12 rounded-xl p-4 max-h-[80%]">
          <Text className="text-xl font-semibold mb-4">Assign Items to {selectedMember?.name}</Text>
          
          <View className="mb-4 flex-row space-x-2">
            <TouchableOpacity 
              onPress={() => setItemTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg ${itemTypeFilter === 'ALL' ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <Text className={itemTypeFilter === 'ALL' ? 'text-white' : 'text-gray-600'}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setItemTypeFilter('ORDER')}
              className={`px-3 py-1.5 rounded-lg ${itemTypeFilter === 'ORDER' ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <Text className={itemTypeFilter === 'ORDER' ? 'text-white' : 'text-gray-600'}>Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setItemTypeFilter('REPAIR')}
              className={`px-3 py-1.5 rounded-lg ${itemTypeFilter === 'REPAIR' ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <Text className={itemTypeFilter === 'REPAIR' ? 'text-white' : 'text-gray-600'}>Repairs</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="max-h-96">
            {filteredItems.map(item => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  const isSelected = selectedItems.some(i => i.id === item.id);
                  setSelectedItems(isSelected
                    ? selectedItems.filter(i => i.id !== item.id)
                    : [...selectedItems, item]
                  );
                }}
                className={`p-4 border rounded-lg mb-2 ${
                  selectedItems.some(i => i.id === item.id) ? 'border-primary bg-primary/10' : 'border-gray-200'
                }`}
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <View className="flex-row items-center space-x-2">
                      <Text className="font-medium text-gray-800">{item.order_number}</Text>
                      <View className={`px-2 py-0.5 rounded-full ${
                        item.type === 'ORDER' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        <Text className="text-xs">{item.type}</Text>
                      </View>
                    </View>
                    <Text className="text-gray-600 mt-1">{item.description}</Text>
                  </View>
                  <View className={`px-2 py-1 rounded-lg ${
                    item.inventory_status === 'reserved' ? 'bg-yellow-100 text-yellow-800' : 
                    item.inventory_status === 'repair' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    <Text className="text-xs capitalize">{item.inventory_status}</Text>
                  </View>
                </View>

                <View className="mt-2 space-y-1">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 text-sm">Weight</Text>
                    <Text className="text-gray-700 text-sm">{item.weight}g</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 text-sm">Material</Text>
                    <Text className="text-gray-700 text-sm">{item.material}</Text>
                  </View>
                  {item.specifications?.size && (
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500 text-sm">Size</Text>
                      <Text className="text-gray-700 text-sm">{item.specifications.size}</Text>
                    </View>
                  )}
                  {item.specifications?.design_no && (
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500 text-sm">Design No</Text>
                      <Text className="text-gray-700 text-sm">{item.specifications.design_no}</Text>
                    </View>
                  )}
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 text-sm">HUID</Text>
                    <Text className="text-gray-700 text-sm">{item.huid || 'N/A'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <View>
              <Text className="text-gray-600">
                Selected: {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setAssignModalVisible(false)}
                className="px-4 py-2 rounded-lg bg-gray-200"
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAssignItems}
                disabled={loading || selectedItems.length === 0}
                className={`px-4 py-2 rounded-lg ${
                  loading || selectedItems.length === 0 ? 'bg-primary/50' : 'bg-primary'
                }`}
              >
                <Text className="text-white">
                  {loading ? 'Assigning...' : 'Assign Selected'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <SectionHeader title="Allocation" navigation={navigation} />
      <FilterByName onSearch={handleSearch} placeholder="Search members..." />
      
      <ScrollView 
        className="flex-1 px-4 pt-4"
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isEndReached = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isEndReached) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        <View className="space-y-3">
          {loading && currentPage === 1 ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color="#5750F1" />
            </View>
          ) : filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <View
                key={member.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <View className="p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                        <FontAwesome6 name="user" size={16} color="#5750F1" />
                      </View>
                      <View>
                        <Text className="text-lg font-semibold text-gray-800">{member.name}</Text>
                        <Text className="text-sm text-gray-500">Role: {member.role}</Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedMember(member);
                        setAssignModalVisible(true);
                      }}
                      className="bg-primary px-3 py-1.5 rounded-lg"
                    >
                      <Text className="text-white">Assign Items</Text>
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row justify-between mt-4 bg-gray-50 rounded-lg p-3">
                    <View className="items-center">
                      <Text className="text-sm text-gray-500">Total</Text>
                      <Text className="text-lg font-semibold text-gray-800">
                        {member.assignedItems.total}
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-sm text-gray-500">Pending</Text>
                      <Text className="text-lg font-semibold text-yellow-600">
                        {member.assignedItems.pending}
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-sm text-gray-500">In Progress</Text>
                      <Text className="text-lg font-semibold text-blue-600">
                        {member.assignedItems.in_progress}
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-sm text-gray-500">Completed</Text>
                      <Text className="text-lg font-semibold text-green-600">
                        {member.assignedItems.completed}
                      </Text>
                        </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => navigation.navigate('AllocationDetails', { member_id: member.id })}
                    className="mt-3 flex-row items-center justify-center py-2 border-t border-gray-100"
                  >
                    <Text className="text-primary mr-2">View Details</Text>
                    <FontAwesome6 name="chevron-right" size={12} color="#5750F1" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-white rounded-xl shadow-sm p-8 items-center">
              <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
                <FontAwesome6 name="users-slash" size={24} color="#5750F1" />
              </View>
              <Text className="text-lg font-medium text-gray-800 mb-1">No Members Found</Text>
              <Text className="text-gray-500 text-center">
                Try adjusting your search criteria
              </Text>
            </View>
          )}

          {loading && currentPage > 1 && (
            <View className="py-4">
              <ActivityIndicator size="small" color="#5750F1" />
            </View>
          )}
        </View>
      </ScrollView>

      {renderAssignmentModal()}
    </View>
  );
};

export default Allocation; 