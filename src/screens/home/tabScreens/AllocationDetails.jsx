import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import SectionHeader from '@/src/components/common/SectionHeader';
import { ApiRequest } from "@/src/utils/api";
import { MANAGE_GROUPS_API } from "@/src/utils/api";
import ShowToast from "@/src/components/common/ShowToast";
  
// ============== MOCK DATA (REMOVE IN PRODUCTION) START ==============
const MOCK_GROUP_DETAILS = {
  "1": {
    group_id: "1",
    membersCount: 4,
    members: [
      { name: 'Sarah (Bride)' },
      { name: 'Mike (Groom)' },
      { name: 'Lisa (Planner)' },
      { name: 'John (Best Man)' }
    ]
  },
  "2": {
    group_id: "2",
    membersCount: 3,
    members: [
      { name: 'Dad' },
      { name: 'Mom' },
      { name: 'Sister' }
    ]
  },
  "3": {
    group_id: "3",
    membersCount: 2,
    members: [
      { name: 'Alex (Developer)' },
      { name: 'Maria (Designer)' }
    ]
  }
};

// Flag to toggle between mock data and API (should match GroupsScreen)
const USE_MOCK_DATA = false;

const MOCK_MEMBER_DETAILS = {
  id: "1",
  name: "John Doe",
  role: "KARIGAR",
  total_assigned: 5,
  pending: 2,
  in_progress: 2,
  completed: 1,
  items: [
    {
      assignment_id: "a1",
      item: {
        id: "1",
        type: "ORDER",
        order_number: "ORD001",
        description: "Gold Ring with Diamond",
        weight: "10.5",
        images: ["url1"],
        specifications: {
          design_no: "D123",
          size: "7",
          material: "GOLD"
        },
        status: "PENDING",
        assigned_at: "2024-05-03T10:00:00Z",
        expected_completion: "2024-05-10",
        priority: "HIGH",
        assigned_by: {
          id: "admin1",
          name: "Admin User"
        }
      },
      work_updates: []
    },
    {
      assignment_id: "a2",
      item: {
        id: "2",
        type: "REPAIR",
        order_number: "REP001",
        description: "Silver Chain Repair",
        weight: "15.2",
        images: ["url1"],
        specifications: {
          design_no: "R456",
          material: "SILVER"
        },
        status: "IN_PROGRESS",
        assigned_at: "2024-05-02T10:00:00Z",
        expected_completion: "2024-05-09",
        priority: "MEDIUM",
        assigned_by: {
          id: "admin1",
          name: "Admin User"
        }
      },
      work_updates: [
        {
          status: "IN_PROGRESS",
          updated_at: "2024-05-04T15:30:00Z",
          comment: "Started repair work",
          images: ["url1"]
        }
      ]
    }
  ]
};
// ============== MOCK DATA (REMOVE IN PRODUCTION) END ==============

const AllocationDetails = ({ route, navigation }) => {
  const { member_id } = route.params;
  const [memberDetails, setMemberDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const fetchMemberDetails = async () => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setMemberDetails(MOCK_MEMBER_DETAILS);
      setLoading(false);
      return;
    }

    try {
      const response = await ApiRequest({
        url: MANAGE_GROUPS_API.memberAssignedItems(member_id),
        method: 'GET',
        params: {
          status: selectedFilter !== 'ALL' ? selectedFilter : undefined,
          type: 'ALL'
        }
      });

      if (response.success) {
        setMemberDetails(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch member details');
      }
    } catch (error) {
      console.error('Failed to fetch member details:', error);
      ShowToast(error.message || 'Failed to fetch member details');
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberDetails();
  }, [member_id, selectedFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50';
      case 'IN_PROGRESS':
        return 'text-blue-600 bg-blue-50';
      case 'COMPLETED':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'text-red-600 bg-red-50';
      case 'MEDIUM':
        return 'text-orange-600 bg-orange-50';
      case 'LOW':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#5750F1" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50">
        <SectionHeader 
          title="Allocation Details"
          navigation={navigation}
          showBack={true}
        />
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-red-500 text-center">{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <SectionHeader 
        title="Allocation Details"
        navigation={navigation}
        showBack={true}
      />
      
      {memberDetails && (
        <ScrollView className="flex-1 px-4 pt-4">
          {/* Member Info Card */}
          <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mr-3">
                <FontAwesome6 name="user" size={20} color="#5750F1" />
              </View>
              <View>
                <Text className="text-xl font-semibold text-gray-800">{memberDetails.name}</Text>
                <Text className="text-base text-gray-500">{memberDetails.role}</Text>
              </View>
            </View>

            <View className="flex-row justify-between bg-gray-50 rounded-lg p-3">
              <View className="items-center flex-1">
                <Text className="text-sm text-gray-500">Total</Text>
                <Text className="text-lg font-semibold text-gray-800">
                  {memberDetails.total_assigned}
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-sm text-gray-500">Pending</Text>
                <Text className="text-lg font-semibold text-yellow-600">
                  {memberDetails.pending}
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-sm text-gray-500">In Progress</Text>
                <Text className="text-lg font-semibold text-blue-600">
                  {memberDetails.in_progress}
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-sm text-gray-500">Completed</Text>
                <Text className="text-lg font-semibold text-green-600">
                  {memberDetails.completed}
                </Text>
              </View>
            </View>
          </View>

          {/* Filter Buttons */}
          <View className="flex-row space-x-2 mb-4">
            {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg ${
                  selectedFilter === filter ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <Text className={selectedFilter === filter ? 'text-white' : 'text-gray-600'}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Assigned Items List */}
          <View className="space-y-4">
            {memberDetails.items.map((assignment) => (
                <View 
                key={assignment.assignment_id}
                className="bg-white rounded-xl shadow-sm p-4"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View>
                    <Text className="text-lg font-semibold text-gray-800">
                      {assignment.item.order_number}
                    </Text>
                    <Text className="text-gray-600">{assignment.item.description}</Text>
                  </View>
                  <View className={`px-3 py-1 rounded-lg ${getStatusColor(assignment.item.status)}`}>
                    <Text className="font-medium">{assignment.item.status}</Text>
                  </View>
                </View>

                <View className="space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500">Weight</Text>
                    <Text className="text-gray-800">{assignment.item.weight}g</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500">Material</Text>
                    <Text className="text-gray-800">{assignment.item.specifications.material}</Text>
                  </View>
                  {assignment.item.specifications.design_no && (
                    <View className="flex-row justify-between">
                      <Text className="text-gray-500">Design No</Text>
                      <Text className="text-gray-800">{assignment.item.specifications.design_no}</Text>
                    </View>
                  )}
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500">Assigned Date</Text>
                    <Text className="text-gray-800">{formatDate(assignment.item.assigned_at)}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500">Expected Completion</Text>
                    <Text className="text-gray-800">{formatDate(assignment.item.expected_completion)}</Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <View className="flex-row items-center">
                    <Text className="text-gray-500 mr-2">Priority:</Text>
                    <View className={`px-2 py-1 rounded ${getPriorityColor(assignment.item.priority)}`}>
                      <Text className="font-medium">{assignment.item.priority}</Text>
                    </View>
                  </View>
                  <Text className="text-gray-500">
                    By: {assignment.item.assigned_by.name}
                  </Text>
                </View>

                {assignment.work_updates.length > 0 && (
                  <View className="mt-4 pt-4 border-t border-gray-100">
                    <Text className="font-semibold text-gray-800 mb-2">Work Updates</Text>
                    {assignment.work_updates.map((update, index) => (
                      <View key={index} className="bg-gray-50 rounded-lg p-3 mb-2">
                        <View className="flex-row justify-between items-center mb-1">
                          <Text className={`font-medium ${getStatusColor(update.status)}`}>
                            {update.status}
                          </Text>
                          <Text className="text-gray-500 text-sm">
                            {formatDate(update.updated_at)}
                          </Text>
                        </View>
                        <Text className="text-gray-600">{update.comment}</Text>
                </View>
              ))}
            </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default AllocationDetails; 