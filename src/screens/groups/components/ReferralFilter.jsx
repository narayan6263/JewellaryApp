import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { GroupContext } from '@/src/screens/groups/GroupsScreen';

const ReferralFilter = ({ value, onChange }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const { groups } = useContext(GroupContext);

  const handleGroupSelect = (group) => {
    if (selectedGroup?.id === group.id) {
      setSelectedGroup(null);
    } else {
      setSelectedGroup(group);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
        className="bg-white rounded-lg shadow-sm p-3 flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mr-2">
            <FontAwesome6 name="users" size={14} color="#5750F1" />
          </View>
          <Text className="text-gray-700 font-medium">Select Group</Text>
        </View>
        <FontAwesome6 name="chevron-right" size={14} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white w-[90%] rounded-xl max-h-[80%]">
            {/* Header */}
            <View className="p-4 border-b border-gray-100 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-800">Select Group</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <FontAwesome6 name="xmark" size={16} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Groups List */}
            <ScrollView className="p-4">
              {groups.length > 0 ? (
                groups.map((group) => (
                  <View key={group.id} className="mb-3 last:mb-0">
                    <TouchableOpacity
                      onPress={() => handleGroupSelect(group)}
                      activeOpacity={0.7}
                      className={`bg-white rounded-lg border p-3 ${
                        selectedGroup?.id === group.id ? 'border-primary' : 'border-gray-200'
                      }`}
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                          <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mr-2">
                            <FontAwesome6 name="users" size={14} color="#5750F1" />
                          </View>
                          <Text className="text-gray-800 font-medium">{group.name}</Text>
                        </View>
                        <View className="bg-primary/10 px-2 py-1 rounded">
                          <Text className="text-primary text-xs">
                            {group.membersCount} {group.membersCount === 1 ? 'Member' : 'Members'}
                          </Text>
                        </View>
                      </View>

                      {/* Members List - Always show */}
                      {group.members.length > 0 && (
                        <View className="mt-2 pt-2 border-t border-gray-100">
                          <Text className="text-sm text-gray-600 mb-2">Members:</Text>
                          {group.members.map((member, index) => (
                            <View 
                              key={index} 
                              className="flex-row items-center py-1"
                            >
                              <View className="w-6 h-6 bg-gray-100 rounded-full items-center justify-center mr-2">
                                <FontAwesome6 name="user" size={12} color="#666" />
                              </View>
                              <Text className="text-gray-700">{member.name}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View className="items-center py-8">
                  <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-3">
                    <FontAwesome6 name="users-slash" size={24} color="#5750F1" />
                  </View>
                  <Text className="text-gray-500 text-center">No groups available</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ReferralFilter; 