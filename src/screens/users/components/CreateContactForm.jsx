import React, { useEffect, useState, useContext } from "react";
import { Text, View, TouchableOpacity, Modal } from "react-native";
import KeyboardHanlder from "@/src/components/common/KeyboardHanlder";
import InputBox from "@/src/components/common/InputBox";
import TrackedTextInput from "@/src/components/TrackedTextInput";
import CommonButton from "@/src/components/common/buttons/CommonButton";
import SimpleReactValidator from "simple-react-validator";
import { useDispatch, useSelector } from "react-redux";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {
  fetchCitiesList,
  fetchContactGroupsList,
  fetchStatesList,
  manageContactList,
} from "@/src/redux/actions/user.action";
import SelectInput from "@/src/components/common/SelectInput";
import SelectContact from "./SelectContact";
import { GroupContext } from "@/src/screens/groups/GroupsScreen";
import ShowToast from "@/src/components/common/ShowToast";
import { ApiRequest } from "@/src/utils/api";
import { MANAGE_GROUPS_API } from "@/src/utils/api/endpoints";

const API_BASE_URL = '/api/v1';

// ============== MOCK DATA (REMOVE IN PRODUCTION) START ==============
const MOCK_EXISTING_GROUPS = [
  { id: '1', name: 'Family' },
  { id: '2', name: 'Business Partners' },
  { id: '3', name: 'VIP Customers' },
  { id: '4', name: 'Suppliers' },
  { id: '5', name: 'Wedding Contacts' }
];

// Flag to toggle between mock data and API
const USE_MOCK_DATA = false;
// ============== MOCK DATA (REMOVE IN PRODUCTION) END ==============

const CreateContactForm = ({
  navigation,
  isFromInvoice = false,
  invoiceHandler,
  updateData = null,
}) => {
  const { goBack } = navigation;
  const dispatch = useDispatch();
  const [info, setInfo] = useState({
    selectedGroups: [],
    ...updateData
  });
  const [errors, setErrors] = useState({});
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [availableGroups, setAvailableGroups] = useState([]);
  const validator = new SimpleReactValidator();
  const { groups, statesList, cityList, loading } = useSelector(
    (state) => state.userSlices
  );
  const { addGroup } = useContext(GroupContext);

  const fetchGroups = async () => {
    try {
      if (USE_MOCK_DATA) {
        setAvailableGroups(MOCK_EXISTING_GROUPS);
        return;
      }

      const response = await ApiRequest({
        url: MANAGE_GROUPS_API.fetch,
        method: 'GET'
      });
      if (response.success && response.data) {
        setAvailableGroups(response.data);
      } else {
        setAvailableGroups([]);
      }
    } catch (error) {
      ShowToast('Failed to fetch groups');
      setAvailableGroups([]);
    }
  };

  const handleInfoChange = ({ name, value }) => {
    setErrors({ ...errors, [name]: "" });
    setInfo({ ...info, [name]: value });
  };

  const handleTrackedChange = (name) => (value) => {
    setErrors({ ...errors, [name]: "" });
    setInfo({ ...info, [name]: value });
  };

  const handleCreateGroup = async () => {
    if (!newGroupName?.trim()) {
      ShowToast('Please enter a group name');
      return;
    }

    if (!selectedRole) {
      ShowToast('Please select a role');
      return;
    }

    try {
      const response = await ApiRequest({
        url: MANAGE_GROUPS_API.create,
        method: 'POST',
        body: {
          group_name: newGroupName,
          role_id: selectedRole.value,
          members: info.name ? [{ name: info.name, role_id: selectedRole.value }] : []
        }
      });

      if (response.success) {
        ShowToast('Group created successfully');
        setNewGroupName('');
        setSelectedRole(null);
        setIsGroupModalVisible(false);
        fetchGroups();
      } else {
        throw new Error(response.message || 'Failed to create group');
      }
    } catch (error) {
      ShowToast(error.message || 'Failed to create group');
    }
  };

  const handleAssignGroups = async () => {
    try {
      const groupIds = info.selectedGroups.map(group => group.value).filter(Boolean);
      
      if (groupIds.length === 0) {
        ShowToast('Please select at least one group');
        return;
      }

      const response = await ApiRequest({
        url: '/contacts/manage-groups',
        method: 'POST',
        body: {
          contactId: updateData?.id || info.id,
          groupId: groupIds.join(',')
        }
      });

      if (response.success) {
        ShowToast('Groups assigned successfully');
        fetchGroups();
      } else {
        throw new Error(response.message || 'Failed to assign groups');
      }
    } catch (error) {
      ShowToast(error.message || 'Failed to assign groups');
    }
  };

  const handleSubmit = () => {
    if (validator.allValid()) {
      const payload = {
        ...info,
        role_id: info?.role?.value,
        city_id: info?.city?.value,
          state_id: info?.state?.value
        };

      delete payload.role;
      delete payload.state;
      delete payload.city;
      delete payload.selectedGroups;

      dispatch(
        manageContactList({
          payload: updateData ? { ...payload, id: updateData.id } : payload,
          callback: () => goBack(),
            isUpdate: !!updateData,
        })
      );
    } else {
      setErrors(validator.errorMessages);
    }
  };

  const updateContactInfo = (updateValue) => {
    setInfo((prev) => {
      let updateInfo = { ...prev };

      if (updateValue) {
        updateInfo = { ...updateInfo, ...updateValue };

        const targetState = statesList.find(
          (state) => updateValue.state_id == state.value
        );
        const targetCity = cityList.find(
          (city) => updateValue.city_id == city.value
        );

        updateInfo.state = targetState;
        updateInfo.city = targetCity;
      }

      return updateInfo;
    });
  };

  useEffect(() => {
    setInfo((prev) => {
      let updateInfo = { ...prev };
      
      if (!isFromInvoice && groups) {
        const targetCustomer = groups.find((customer) =>
          updateData
            ? updateData.role_id == customer.id
            : customer.name == "Customer"
        );
        if (targetCustomer) {
          updateInfo.role = {
            label: targetCustomer?.name,
            value: targetCustomer?.id,
          };
        }
      }

      if (updateData) {
        updateInfo = { ...updateData, ...updateInfo };

        const targetState = statesList.find(
          (state) => updateData.state_id == state.value
        );
        const targetCity = cityList.find(
          (city) => updateData.city_id == city.value
        );

        if (!updateInfo.state) {
          updateInfo.state = targetState;
        }

        if (!updateInfo.city) {
          updateInfo.city = targetCity;
        }
      }

      return updateInfo;
    });
  }, [groups, statesList, cityList, updateData, isFromInvoice]);

  useEffect(() => {
    if (info?.state?.value) {
      dispatch(fetchCitiesList(info.state.value));
    }
  }, [dispatch, info?.state?.value]);

  useEffect(() => {
    if (!info?.state) {
      dispatch(fetchStatesList());
      dispatch(fetchContactGroupsList());
    }
  }, [dispatch, info?.state]);

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <KeyboardHanlder>
      <View className="px-4 pt-4">
        {/* Personal Information */}
        <View>
          {!isFromInvoice && (
            <Text className="text-primary mb-3 font-semibold uppercase tracking-wider">
              Personal Information
            </Text>
          )}
          {isFromInvoice ? (
            <SelectContact
              info={info}
              invoiceHandler={invoiceHandler}
              updateContactInfo={updateContactInfo}
            />
          ) : (
            <View className="mb-3">
              <TrackedTextInput
                screenName="Create Contact Form"
                fieldName="Full Name"
                value={info?.name}
                onChangeText={handleTrackedChange('name')}
                placeholder="Full Name"
                className="bg-white p-3 rounded-lg border border-gray-200"
              />
              {validator.message("name", info?.name, "required")}
            </View>
          )}

          <View className="flex mb-3 flex-row">
            <View className="w-1/2 pr-1">
              {isFromInvoice ? (
                <>
                  <TrackedTextInput
                    screenName="Create Contact Form"
                    fieldName="Email"
                    value={info?.email}
                    onChangeText={handleTrackedChange('email')}
                    placeholder="Email"
                    className="bg-white p-3 rounded-lg border border-gray-200"
                    editable={!isFromInvoice}
                  />
                  {validator.message("email", info?.email, "email")}
                </>
              ) : (
                <SelectInput
                  label="Group"
                  value={info?.role}
                  disabled={false}
                  placeholder="Select Type"
                  data={groups.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  error={errors?.role}
                  onSelect={(value) =>
                    handleInfoChange({ name: "role", value })
                  }
                />
              )}
            </View>
            <View className="w-1/2 pl-1">
              <TrackedTextInput
                screenName="Create Contact Form"
                fieldName="Phone"
                value={info?.phone}
                onChangeText={handleTrackedChange('phone')}
                placeholder="Phone"
                className="bg-white p-3 rounded-lg border border-gray-200"
                editable={!isFromInvoice && !updateData}
              />
              {validator.message(
                "phone",
                info?.phone,
                [
                  "required",
                  "min:10",
                  {
                    regex:
                      /^\+?(\d{1,4})?[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/,
                  },
                ],
                {
                  messages: { regex: "Please enter a valid phone number." },
                }
              )}
            </View>
          </View>

          {!isFromInvoice && (
            <View className="mb-3">
              <TrackedTextInput
                screenName="Create Contact Form"
                fieldName="Email"
                value={info?.email}
                onChangeText={handleTrackedChange('email')}
                placeholder="Email"
                className="bg-white p-3 rounded-lg border border-gray-200"
                editable={!isFromInvoice}
              />
              {validator.message("email", info?.email, "email")}
            </View>
          )}
        </View>

        {/* Groups Section */}
        <View className="mb-4">
          <View className="flex flex-row items-center justify-between mb-2">
            <Text className="text-primary font-semibold uppercase tracking-wider">
              Groups
            </Text>
          </View>

          {/* Existing Groups Selection */}
          <View className="mb-3">
            <SelectInput
              label="Select Existing Groups"
              value={info?.selectedGroups || []}
              placeholder="Choose from existing groups"
              data={availableGroups?.map(item => ({
                label: `${item.name} (${item.role?.name || ''})`,
                value: item.group_id || item.id || '',
              })) || []}
              onSelect={(value) =>
                handleInfoChange({ name: "selectedGroups", value: value || [] })
              }
              isMulti={true}
            />
            <TouchableOpacity
              onPress={handleAssignGroups}
              className="bg-primary mt-2 py-2 px-4 rounded-lg self-start flex-row items-center"
              activeOpacity={0.7}
            >
              <FontAwesome6 name="user-group" size={14} color="white" className="mr-2" />
              <Text className="text-white font-medium">Assign Contact to Groups</Text>
            </TouchableOpacity>
          </View>

          {/* Add New Group Button */}
              <TouchableOpacity
            onPress={() => setIsGroupModalVisible(true)}
                activeOpacity={0.7}
            className="bg-primary mb-4 p-4 rounded-lg flex-row items-center justify-center shadow-sm"
              >
            <FontAwesome6 name="plus" size={16} color="white" className="mr-2" />
            <Text className="text-white font-medium">Add New Group</Text>
              </TouchableOpacity>
            </View>
            
        {/* Create Group Modal */}
        <Modal
          visible={isGroupModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsGroupModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center">
            <View className="bg-white w-[90%] rounded-xl p-5">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-semibold text-gray-800">Create New Group</Text>
                    <TouchableOpacity
                  onPress={() => {
                    setIsGroupModalVisible(false);
                    setNewGroupName('');
                    setSelectedRole(null);
                  }}
                  className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                >
                  <FontAwesome6 name="xmark" size={16} color="#666" />
                    </TouchableOpacity>
              </View>

              <View className="mb-4">
                <InputBox
                  name="groupName"
                  placeholder="Enter group name"
                  value={newGroupName}
                  onChange={({ value }) => setNewGroupName(value)}
                />
              </View>

              <View className="mb-6">
                <SelectInput
                  label="Role"
                  value={selectedRole}
                  placeholder="Select role"
                  data={groups.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  onSelect={setSelectedRole}
                      />
                    </View>

              <View className="flex-row justify-end space-x-3">
                <TouchableOpacity
                  onPress={() => {
                    setIsGroupModalVisible(false);
                    setNewGroupName('');
                    setSelectedRole(null);
                  }}
                  className="px-4 py-2 bg-gray-100 rounded-lg"
                >
                  <Text className="text-gray-700 font-medium">Cancel</Text>
                </TouchableOpacity>
                
                      <TouchableOpacity
                  onPress={handleCreateGroup}
                  className="bg-primary px-5 py-2 rounded-lg flex-row items-center"
                      >
                  <Text className="text-white font-medium">Create Group</Text>
                      </TouchableOpacity>
                </View>
            </View>
          </View>
        </Modal>
        
        {/* Address Information */}
        <View className="my-2.5">
          {!isFromInvoice && (
            <Text className="text-primary mb-3 font-semibold uppercase tracking-wider">
              Contact Information
            </Text>
          )}

          <View className="flex mb-3 flex-row">
            <View className="w-1/2 pr-1">
              <TrackedTextInput
                screenName="Create Contact Form"
                fieldName="Address"
                value={info?.address}
                onChangeText={handleTrackedChange('address')}
                placeholder="Address"
                className="bg-white p-3 rounded-lg border border-gray-200"
                editable={!isFromInvoice}
              />
            </View>

            <View className="w-1/2 pl-1">
              <TrackedTextInput
                screenName="Create Contact Form"
                fieldName="Postal Code"
                value={info?.pincode}
                onChangeText={handleTrackedChange('pincode')}
                placeholder="Postal Code"
                className="bg-white p-3 rounded-lg border border-gray-200"
                editable={!isFromInvoice}
                keyboardType="numeric"
              />
              {validator.message(
                "pincode",
                info?.pincode,
                "min:6|max:6|integer"
              )}
            </View>
          </View>

          <View className="flex mb-3 flex-row">
            <View className="w-1/2 pr-1">
              <SelectInput
                label="State"
                value={info?.state}
                placeholder="Select State"
                data={statesList}
                disabled={false}
                error={errors?.state}
                onSelect={(value) => handleInfoChange({ name: "state", value })}
              />
            </View>
            <View className="w-1/2 pl-1">
              <SelectInput
                label="City"
                value={info?.city}
                placeholder="Select City"
                data={cityList}
                disabled={false}
                error={errors?.city}
                onSelect={(value) => handleInfoChange({ name: "city", value })}
              />
            </View>
          </View>
        </View>

        {/* Submit Button */}
        {!isFromInvoice && (
          <CommonButton
            loading={loading}
            title={updateData ? "Update" : "Submit"}
            onPress={handleSubmit}
          />
        )}
      </View>
    </KeyboardHanlder>
  );
};

export default CreateContactForm;
