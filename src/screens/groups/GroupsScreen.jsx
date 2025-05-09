import React, { useState, createContext, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Animated } from 'react-native';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import SectionHeader from '@/src/components/common/SectionHeader';
import InputBox from '@/src/components/common/InputBox';
import ShowToast from "@/src/components/common/ShowToast";
import { ApiRequest } from "@/src/utils/api";
import SelectContact from '@/src/screens/users/components/SelectContact';
import { MANAGE_GROUPS_API, MANAGE_CONTACT_API } from '@/src/utils/api/endpoints';

// Create context for groups
export const GroupContext = createContext();

// ============== MOCK DATA (REMOVE IN PRODUCTION) START ==============
const MOCK_GROUPS = [
  {
    id: '1',
    name: 'Wedding Planning',
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
    ],
    createdAt: '2024-03-20T10:00:00Z'
  },
  {
    id: '2',
    name: 'Family Group',
    membersCount: 3,
    role: {
      id: '1',
      name: 'Customer'
    },
    members: [
      { name: 'Dad', role_id: '1' },
      { name: 'Mom', role_id: '1' },
      { name: 'Sister', role_id: '1' }
    ],
    createdAt: '2024-03-19T15:30:00Z'
  },
  {
    id: '3',
    name: 'Project Team',
    membersCount: 2,
    role: {
      id: '2',
      name: 'Supplier'
    },
    members: [
      { name: 'Alex (Developer)', role_id: '2' },
      { name: 'Maria (Designer)', role_id: '2' }
    ],
    createdAt: '2024-03-18T09:15:00Z'
  }
];

// Mock contacts for selection
const MOCK_CONTACTS = [
  { id: '1', name: 'John Smith', phone: '9876543210', role_id: '1', role: { id: '1', name: 'Customer' } },
  { id: '2', name: 'Jane Doe', phone: '8765432109', role_id: '1', role: { id: '1', name: 'Customer' } },
  { id: '3', name: 'Robert Johnson', phone: '7654321098', role_id: '2', role: { id: '2', name: 'Supplier' } },
  { id: '4', name: 'Emily Davis', phone: '6543210987', role_id: '1', role: { id: '1', name: 'Customer' } },
  { id: '5', name: 'Michael Wilson', phone: '5432109876', role_id: '2', role: { id: '2', name: 'Supplier' } }
];

// Flag to toggle between mock data and API
const USE_MOCK_DATA = false;
// ============== MOCK DATA (REMOVE IN PRODUCTION) END ==============

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [currentRole, setCurrentRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use mock data if testing flag is enabled
      if (USE_MOCK_DATA) {
        setGroups(MOCK_GROUPS);
        setLoading(false);
        return;
      }

      const response = await ApiRequest({
        url: MANAGE_GROUPS_API.fetch,
        method: 'GET'
      });

      if (response.success) {
        // For empty data, set empty array
        if (!response.data || response.data.length === 0) {
          setGroups([]);
          return;
        }

        const formattedGroups = response.data.map(group => ({
          id: group.id.toString(),
          name: group.name,
          membersCount: group.members_count,
          role: {
            id: group.role?.id || '',
            name: group.role?.name || 'Unknown'
          },
          members: [], // API response doesn't include members list
          createdAt: group.created_at
        }));
        setGroups(formattedGroups);
      } else {
        throw new Error(response.message || 'Failed to fetch groups');
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      setError(error.message);

      // Use mock data as fallback for critical errors
      if (error.message === 'Authentication required' ||
        error.message.includes('App\\Http\\Middleware\\Authenticate')) {
        ShowToast('Please log in again to view your groups');
        navigation.navigate('Auth');
      } else {
        // Show empty state for other errors
        setGroups([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const addGroup = async (groupName, members, roleId) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_GROUPS_API.create,
        method: 'POST',
        body: {
          group_name: groupName,
          role_id: roleId,
          members: members.map(member => ({
            name: member.name,
            role_id: member.role_id || roleId
          }))
        }
      });

      if (response.success) {
        await fetchGroups(); // Refresh the groups list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create group');
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <GroupContext.Provider value={{
      groups,
      loading,
      error,
      currentRole,
      setCurrentRole,
      fetchGroups,
      addGroup
    }}>
      {children}
    </GroupContext.Provider>
  );
};

const GroupsScreen = ({ navigation }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [contactSearchValue, setContactSearchValue] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const { groups, addGroup, currentRole, setCurrentRole, loading: groupsLoading, error: groupsError } = useContext(GroupContext);

  // Fetch contacts only once when modal opens
  const fetchContacts = async () => {
    if (availableContacts.length > 0) return; // Don't fetch if we already have contacts

    try {
      setIsLoadingContacts(true);
      const response = await ApiRequest({
        url: MANAGE_CONTACT_API.contacts,
        method: 'GET'
      });

      if (response.success) {
        setAvailableContacts(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch contacts');
      }
    } catch (error) {
      ShowToast(error.message || 'Error fetching contacts');
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // Only fetch contacts when modal opens
  useEffect(() => {
    if (isModalVisible) {
      fetchContacts();
    }
  }, [isModalVisible]);

  // Create a mock invoiceHandler to satisfy SelectContact requirements
  const invoiceHandler = {
    formValue: { costumer_name: contactSearchValue },
    setFormValue: (newValues) => {
      if (newValues.costumer_name !== undefined) {
        setContactSearchValue(newValues.costumer_name);
      }
      if (newValues.user_contact_id) {
        // Find contact by ID
        const contact = availableContacts.find(c => c.id === newValues.user_contact_id);
        if (contact) {
          updateContactInfo(contact);
        }
      }
    },
    handleInputChange: ({ name, value }) => {
      if (name === 'costumer_name') {
        setContactSearchValue(value);
      }
    },
    invoiceType: 'loan' // This will set the label to "Contact Name"
  };

  // Handle navigation to group details with only necessary data
  const handleViewDetails = (group) => {
    navigation.navigate('GroupDetails', { group_id: group.id });
  };

  // Remove contact from selection
  const removeContact = (index) => {
    const updatedContacts = selectedContacts.filter((_, i) => i !== index);
    setSelectedContacts(updatedContacts);
  };

  // Update contacts based on search or selection
  const updateContactInfo = (contact) => {
    // Avoid duplicate contacts
    if (!selectedContacts.some(c => c.id === contact.id)) {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  // Validate group name according to API rules
  const validateGroupName = (name) => {
    if (!name.trim()) return 'Group name is required';
    if (name.length < 2) return 'Name must be at least 2 characters';
    if (name.length > 50) return 'Name must not exceed 50 characters';
    if (!/^[a-zA-Z0-9\s]+$/.test(name)) return 'Only alphanumeric characters and spaces allowed';
    return '';
  };

  // Filter contacts based on selected role
  const filteredContacts = selectedRole
    ? availableContacts.filter(contact => contact.role_id === selectedRole.id)
    : availableContacts;

  // Handle role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setCurrentRole(role);
    setSelectedContacts([]); // Clear selected contacts when role changes
  };

  // Handle adding new group with role validation
  const handleAddGroup = async () => {
    const validationError = validateGroupName(newGroupName);
    if (validationError) {
      ShowToast(validationError);
      return;
    }

    if (!selectedRole) {
      ShowToast('Please select a role for the group');
      return;
    }

    if (selectedContacts.length === 0) {
      ShowToast('Please select at least one member');
      return;
    }

    setIsSaving(true);
    try {
      await addGroup(newGroupName, selectedContacts, selectedRole.id);
      ShowToast('Group created successfully');
      setNewGroupName('');
      setSelectedContacts([]);
      setSelectedRole(null);
      setIsModalVisible(false);
    } catch (error) {
      ShowToast(error.message || 'Failed to create group');
    } finally {
      setIsSaving(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SectionHeader title="Groups" navigation={navigation} />

      <ScrollView className="flex-1 px-4 pt-4">
        {/* Add New Group Button */}
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.7}
          className="bg-primary mb-4 p-4 rounded-lg flex-row items-center justify-center shadow-sm"
        >
          <FontAwesome6 name="plus" size={16} color="white" className="mr-2" />
          <Text className="text-white font-medium ml-2">Add New Group</Text>
        </TouchableOpacity>

        {/* Error State */}
        {groupsError && (
          <View className="bg-red-50 p-4 rounded-lg mb-4">
            <Text className="text-red-600">{groupsError}</Text>
          </View>
        )}

        {/* Loading State */}
        {groupsLoading ? (
          <View className="flex-1 justify-center items-center py-8">
            <ActivityIndicator size="large" color="#5750F1" />
          </View>
        ) : groups.length > 0 ? (
          <View className="space-y-3">
            {groups.map((group) => (
              <View
                key={group.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <View className="p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                        <FontAwesome6 name="users" size={16} color="#5750F1" />
                      </View>
                      <View>
                        <Text className="text-lg font-semibold text-gray-800">{group.name}</Text>
                        <View className="flex-row items-center">
                          <Text className="text-sm text-gray-500">
                            {group.membersCount} {group.membersCount === 1 ? 'Member' : 'Members'}
                          </Text>
                          <Text className="text-sm text-primary ml-2">
                            ({group.role.name})
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleViewDetails(group)}
                      className="bg-primary px-4 py-2 rounded-lg flex-row items-center"
                      activeOpacity={0.7}
                    >
                      <Text className="text-white font-medium mr-1">View Details</Text>
                      <FontAwesome6 name="chevron-right" size={12} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-white rounded-xl shadow-sm p-8 items-center">
            <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-4">
              <FontAwesome6 name="users-slash" size={24} color="#5750F1" />
            </View>
            <Text className="text-lg font-medium text-gray-800 mb-1">No Groups Yet</Text>
            <Text className="text-gray-500 text-center">
              Create your first group to start organizing your contacts
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Group Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white w-[90%] rounded-xl p-5">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-semibold text-gray-800">Create New Group</Text>
              <TouchableOpacity
                onPress={() => {
                  setIsModalVisible(false);
                  setNewGroupName('');
                  setSelectedContacts([]);
                  setContactSearchValue('');
                }}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <FontAwesome6 name="xmark" size={16} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Group Name Input */}
            <InputBox
              name="groupName"
              placeholder="Enter group name"
              value={newGroupName}
              onChange={({ value }) => setNewGroupName(value)}
            />

            {/* Role Selection */}
            <View className="mt-4">
              <Text className="text-gray-700 font-medium mb-2">Select Role</Text>
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={() => handleRoleSelect({ id: '1', name: 'Customer' })}
                  className={`flex-1 p-3 rounded-lg border ${selectedRole?.id === '1' ? 'bg-primary border-primary' : 'border-gray-200'
                    }`}
                >
                  <Text className={`text-center ${selectedRole?.id === '1' ? 'text-white' : 'text-gray-700'
                    }`}>Customer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRoleSelect({ id: '2', name: 'Supplier' })}
                  className={`flex-1 p-3 rounded-lg border ${selectedRole?.id === '2' ? 'bg-primary border-primary' : 'border-gray-200'
                    }`}
                >
                  <Text className={`text-center ${selectedRole?.id === '2' ? 'text-white' : 'text-gray-700'
                    }`}>Supplier</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Member Selection */}
            {selectedRole && (
              <View className="mt-4">
                <Text className="text-gray-700 font-medium mb-2">
                  Add {selectedRole.name}s
                </Text>

                {/* Contact Selection */}
                <SelectContact
                  updateContactInfo={updateContactInfo}
                  info={{}}
                  invoiceHandler={invoiceHandler}
                  filteredContacts={filteredContacts}
                />

                {/* Selected Members List */}
                {selectedContacts.length > 0 && (
                  <View className="mt-2 bg-gray-50 p-2 rounded-lg">
                    <Text className="text-gray-600 mb-1">
                      Selected {selectedRole.name}s ({selectedContacts.length}):
                    </Text>
                    {selectedContacts.map((contact, index) => (
                      <View key={index} className="flex-row justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
                        <Text className="text-gray-800">{contact.name}</Text>
                        <TouchableOpacity onPress={() => removeContact(index)}>
                          <FontAwesome6 name="times-circle" size={16} color="red" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View className="flex-row justify-end space-x-3 mt-5">
              <TouchableOpacity
                onPress={() => {
                  setNewGroupName('');
                  setSelectedContacts([]);
                  setContactSearchValue('');
                  setIsModalVisible(false);
                }}
                className="px-4 py-2 bg-gray-100 rounded-lg"
                disabled={isSaving}
              >
                <Text className="text-gray-700 font-medium">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddGroup}
                className="bg-primary px-5 py-2 rounded-lg flex-row items-center"
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="white" className="mr-2" />
                ) : null}
                <Text className="text-white font-medium">Create Group</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GroupsScreen;