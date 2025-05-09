import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import SectionHeader from '@/src/components/common/SectionHeader';
import { ApiRequest } from "@/src/utils/api";
import { MANAGE_GROUPS_API } from "@/src/utils/api/endpoints";

// ============== MOCK DATA (REMOVE IN PRODUCTION) START ==============
const MOCK_GROUP_DETAILS = {
  "1": {
    group_id: "1",
    name: "Wedding Planning",
    membersCount: 4,
    role: {
      id: '1',
      name: 'Customer'
    },
    members: [
      { name: 'Sarah (Bride)', role_id: '1' },
      { name: 'Mike (Groom)', role_id: '1' },
      { name: 'Lisa (Planner)', role_id: '1' },
      { name: 'John (Best Man)', role_id: '1' }
    ]
  },
  "2": {
    group_id: "2",
    name: "Family Group",
    membersCount: 3,
    role: {
      id: '1',
      name: 'Customer'
    },
    members: [
      { name: 'Dad', role_id: '1' },
      { name: 'Mom', role_id: '1' },
      { name: 'Sister', role_id: '1' }
    ]
  },
  "3": {
    group_id: "3",
    name: "Project Team",
    membersCount: 2,
    role: {
      id: '2',
      name: 'Supplier'
    },
    members: [
      { name: 'Alex (Developer)', role_id: '2' },
      { name: 'Maria (Designer)', role_id: '2' }
    ]
  }
};

// Flag to toggle between mock data and API (should match GroupsScreen)
const USE_MOCK_DATA = false;
// ============== MOCK DATA (REMOVE IN PRODUCTION) END ==============

const GroupDetailsScreen = ({ route, navigation }) => {
  const { group_id } = route.params;
  const [groupDetails, setGroupDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch group details
  const fetchGroupDetails = async () => {
    try {
      if (USE_MOCK_DATA) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockDetails = MOCK_GROUP_DETAILS[group_id];
        if (mockDetails) {
          setGroupDetails(mockDetails);
        } else {
          setError('Group not found');
        }
        setLoading(false);
        return;
      }

      const response = await ApiRequest({
        url: MANAGE_GROUPS_API.details(group_id),
        method: 'GET'
      });

      if (response.success) {
        const formattedGroup = {
          id: response.data.id.toString(),
          name: response.data.name,
          membersCount: response.data.membersCount,
          role: {
            id: response.data.role_id.toString(),
            name: response.data.role_id === 1 ? 'Customer' : 'Supplier'
          },
          members: response.data.members.map(member => ({
            id: member.id.toString(),
            name: member.name,
            email: member.email,
            phone: member.phone,
            address: member.address,
            role_id: member.role_id.toString(),
            gold_fine: member.gold_fine,
            silver_fine: member.silver_fine,
            amount: member.amount
          })),
          createdAt: response.data.created_at
        };
        setGroupDetails(formattedGroup);
      } else {
        setError(response.message || 'Failed to fetch group details');
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [group_id]);

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
          title="Group Details"
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
        title="Group Details"
        navigation={navigation}
        showBack={true}
      />
      
      {groupDetails && (
        <ScrollView className="flex-1 px-4 pt-4">
          {/* Group Info Card */}
          <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mr-3">
                <FontAwesome6 name="users" size={20} color="#5750F1" />
              </View>
              <View>
                <Text className="text-lg font-semibold text-gray-800 mb-1">
                  {groupDetails.name}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-base text-gray-500">
                    {groupDetails.membersCount} {groupDetails.membersCount === 1 ? 'Member' : 'Members'}
                  </Text>
                  <Text className="text-base text-primary ml-2">
                    ({groupDetails.role.name})
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Members List */}
          <View className="bg-white rounded-xl shadow-sm p-4">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              {groupDetails.role.name}s in Group
            </Text>
            {groupDetails.members.length > 0 ? (
              <View className="space-y-3">
                {groupDetails.members.map((member, index) => (
                  <View 
                    key={index}
                    className="flex-row items-center py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mr-3">
                      <FontAwesome6 name="user" size={12} color="#5750F1" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base text-gray-800">{member.name}</Text>
                      <Text className="text-sm text-gray-500">
                        {groupDetails.role.name}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-gray-500 text-center py-4">
                No members in this group yet
              </Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default GroupDetailsScreen; 