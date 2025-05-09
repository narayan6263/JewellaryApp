import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { MANAGE_INVENTORY_API, MANAGE_LOGS_API } from '../../utils/api/endpoints';
import { ApiRequest } from '../../utils/api';
import ShowToast from '../../components/common/ShowToast';
import { getToken } from '../../utils/auth';
import InputBox from '../../components/common/InputBox';
import CommonButton from '../../components/common/buttons/CommonButton';
import SelectInput from '../../components/common/SelectInput';
import { useSelector } from 'react-redux';

const AddEditInventory = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const editItem = route.params?.item;
  const [loading, setLoading] = useState(false);
  const userName = useSelector(state => state.userSlices?.profileData?.name || 'Unknown User');

  const [formData, setFormData] = useState({
    name: '',
    product_id: '',
    size: '',
    gross_weight: '0',
    less_weight: '0',
    net_weight: '0',
    tounch: '0',
    wastage: '0',
    fine_weight: '0',
    rate: '0',
    metal_value: '0',
    metal_type: '',
    making_type: { value: "PG", label: "Per Gram" },
    making_charge: '0',
    making_amount: '0',
    polishing: '0',
    stone_setting: '0',
    additional_charges: '0',
    subtotal: '0',
    tax: '3',
    tax_amount: '0',
    final_amount: '0',
    status: 'available'
  });

  // Add useEffect for net weight calculation
  useEffect(() => {
    const grossWeight = parseFloat(formData.gross_weight) || 0;
    const lessWeight = parseFloat(formData.less_weight) || 0;
    const netWeight = (grossWeight - lessWeight).toFixed(3);
    
    setFormData(prev => ({
      ...prev,
      net_weight: netWeight
    }));
  }, [formData.gross_weight, formData.less_weight]);

  // Add useEffect for fine weight calculation
  useEffect(() => {
    const netWeight = parseFloat(formData.net_weight) || 0;
    const touch = parseFloat(formData.tounch) || 0;
    const wastage = parseFloat(formData.wastage) || 0;
    const totalTouch = touch + wastage;
    const fineWeight = ((netWeight * totalTouch) / 100).toFixed(3);
    
    setFormData(prev => ({
      ...prev,
      fine_weight: fineWeight
    }));
  }, [formData.net_weight, formData.tounch, formData.wastage]);

  // Add useEffect for metal value and making amount calculation
  useEffect(() => {
    const fineWeight = parseFloat(formData.fine_weight) || 0;
    const rate = parseFloat(formData.rate) || 0;
    const netWeight = parseFloat(formData.net_weight) || 0;
    const makingCharge = parseFloat(formData.making_charge) || 0;

    // Calculate metal value
    const metalValue = (fineWeight * rate).toFixed(2);
    
    // Calculate making amount based on type
    const makingAmount = formData.making_type.value === "PG"
      ? (netWeight * makingCharge).toFixed(2)  // Per Gram
      : makingCharge.toFixed(2);               // Per Piece
    
    setFormData(prev => ({
      ...prev,
      metal_value: metalValue,
      making_amount: makingAmount
    }));
  }, [formData.fine_weight, formData.rate, formData.net_weight, formData.making_charge, formData.making_type]);

  // Add useEffect for subtotal, tax and final amount calculations
  useEffect(() => {
    const metalValue = parseFloat(formData.metal_value) || 0;
    const makingAmount = parseFloat(formData.making_amount) || 0;
    const polishing = parseFloat(formData.polishing) || 0;
    const stoneSetting = parseFloat(formData.stone_setting) || 0;
    
    // Calculate additional charges
    const additionalCharges = (polishing + stoneSetting).toFixed(2);
    
    // Calculate subtotal
    const subtotal = (metalValue + makingAmount + parseFloat(additionalCharges)).toFixed(2);
    
    // Calculate tax amount
    const taxRate = parseFloat(formData.tax) || 0;
    const taxAmount = ((parseFloat(subtotal) * taxRate) / 100).toFixed(2);
    
    // Calculate final amount
    const finalAmount = (parseFloat(subtotal) + parseFloat(taxAmount)).toFixed(2);
    
    setFormData(prev => ({
      ...prev,
      additional_charges: additionalCharges,
      subtotal: subtotal,
      tax_amount: taxAmount,
      final_amount: finalAmount
    }));
  }, [formData.metal_value, formData.making_amount, formData.polishing, formData.stone_setting, formData.tax]);

  useEffect(() => {
    if (editItem) {
      const extractValue = (val) => {
        // Handle JSON string case
        if (typeof val === 'string') {
          try {
            // Try to parse if it looks like a JSON string
            if (val.includes('{') && val.includes('}')) {
              const parsed = JSON.parse(val.replace(/'/g, '"'));
              return parsed.value || '0';
            }
            // Handle "value:X" format
            if (val.includes('value:')) {
              return val.split('value:')[1].split(',')[0].replace(/['"{}]/g, '').trim();
            }
          } catch (e) {
            // If parsing fails, return original value
            return val;
          }
        }
        // Handle object case
        if (val && typeof val === 'object' && 'value' in val) {
          return val.value;
        }
        // Default case
        return val || '0';
      };

      setFormData({
        name: extractValue(editItem.name) || '',
        product_id: extractValue(editItem.product_id)?.toString() || '',
        size: extractValue(editItem.size) || '',
        gross_weight: extractValue(editItem.gross_weight) || '0',
        less_weight: extractValue(editItem.less_weight) || '0',
        net_weight: extractValue(editItem.net_weight) || '0',
        tounch: extractValue(editItem.tounch) || '0',
        wastage: extractValue(editItem.wastage) || '0',
        fine_weight: extractValue(editItem.fine_weight) || '0',
        rate: extractValue(editItem.rate) || '0',
        metal_value: extractValue(editItem.metal_value) || '0',
        metal_type: extractValue(editItem.metal_type) || '',
        making_type: editItem.making_type || { value: "PG", label: "Per Gram" },
        making_charge: extractValue(editItem.making_charge) || '0',
        making_amount: extractValue(editItem.making_amount) || '0',
        polishing: extractValue(editItem.polishing) || '0',
        stone_setting: extractValue(editItem.stone_setting) || '0',
        additional_charges: extractValue(editItem.additional_charges) || '0',
        subtotal: extractValue(editItem.subtotal) || '0',
        tax: extractValue(editItem.tax) || '3',
        tax_amount: extractValue(editItem.tax_amount) || '0',
        final_amount: extractValue(editItem.final_amount) || '0',
        status: extractValue(editItem.status) || 'available'
      });
    }
  }, [editItem]);

  // Create log entry function
  const createLogEntry = async (action, entityType, amount = 0, metadata = {}) => {
    try {
      // Format timestamp to MySQL format (YYYY-MM-DD HH:mm:ss)
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');

      const response = await ApiRequest({
        url: MANAGE_LOGS_API.create,
        method: 'POST',
        body: {
          userName: userName,
          productName: formData.name || 'Unknown Product',
          id: editItem?.id || 0,
          type: 'inventory',
          amount: parseFloat(amount || 0).toFixed(2),
          action: action.toUpperCase(),
          entityType: entityType.toUpperCase(),
          timestamp: timestamp,
          metadata: JSON.stringify({
            ...metadata,
            formData: {
              gross_weight: formData.gross_weight,
              net_weight: formData.net_weight,
              fine_weight: formData.fine_weight,
              final_amount: formData.final_amount,
              status: formData.status,
              product_id: formData.product_id
            }
          })
        }
      });

      if (!response?.success) {
        throw new Error('Failed to create log entry');
      }

      console.log('Log created successfully:', {
        action,
        entityType,
        amount,
        metadata
      });
    } catch (error) {
      console.error('Error creating log:', error);
      ShowToast('Warning: Action logged with errors');
    }
  };

  // Add log for field changes
  const handleInputChange = (field, value) => {
    try {
      // Extract the actual value from the input
      let actualValue = value;
      if (typeof value === 'object' && value !== null) {
        actualValue = value.value || value;
      }
      
      setFormData(prev => {
        const oldValue = prev[field];
        const newFormData = {
          ...prev,
          [field]: actualValue
        };

        // Only create logs for significant fields
        const significantFields = ['gross_weight', 'less_weight', 'tounch', 'wastage', 'rate', 'making_charge'];
        if (significantFields.includes(field) && oldValue !== actualValue) {
          // Format timestamp to MySQL format (YYYY-MM-DD HH:mm:ss)
          const now = new Date();
          const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');

          ApiRequest({
            url: MANAGE_LOGS_API.create,
            method: 'POST',
            body: {
              userName: userName,
              productName: formData.name || 'Unknown Product',
              id: editItem?.id || 0,
              type: 'inventory',
              amount: parseFloat(formData.final_amount || 0).toFixed(2),
              action: 'FIELD_UPDATE',
              entityType: 'INVENTORY',
              timestamp: timestamp,
              metadata: JSON.stringify({
                field,
                oldValue: oldValue?.toString() || '0',
                newValue: actualValue?.toString() || '0',
                note: `Updated ${field} from ${oldValue || '0'} to ${actualValue || '0'}`
              })
            }
          }).catch(error => {
            console.error('Error creating field update log:', error);
          });
        }

        return newFormData;
      });
    } catch (error) {
      console.error('Error in handleInputChange:', error);
      ShowToast('Error updating field');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      if (!editItem?.id) {
        ShowToast("No item selected for status update");
        return;
      }

      setLoading(true);

      // Format timestamp to MySQL format (YYYY-MM-DD HH:mm:ss)
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');

      // Prepare both API calls
      const statusUpdatePromise = ApiRequest({
        url: MANAGE_INVENTORY_API.updateStatus,
        method: 'PUT',
        body: { 
          id: editItem.id,
          status: newStatus 
        }
      });

      const logCreatePromise = ApiRequest({
        url: MANAGE_LOGS_API.create,
        method: 'POST',
        body: {
          userName: userName,
          productName: formData.name || 'Unknown Product',
          id: editItem?.id,
          type: 'inventory',
          amount: parseFloat(formData.final_amount || 0).toFixed(2),
          action: 'STATUS_CHANGE',
          entityType: 'INVENTORY',
          timestamp: timestamp,
          metadata: JSON.stringify({
            note: `Status changed from ${formData.status} to ${newStatus}`,
            oldStatus: formData.status,
            newStatus: newStatus,
            formData: {
              gross_weight: formData.gross_weight,
              net_weight: formData.net_weight,
              fine_weight: formData.fine_weight,
              final_amount: formData.final_amount,
              product_id: formData.product_id
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

      // Update local state
      setFormData(prev => ({
        ...prev,
        status: newStatus
      }));

      navigation.goBack();
    } catch (error) {
      console.error('Error in handleStatusChange:', error);
      ShowToast(error.message || "Error updating status");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.product_id) {
        ShowToast("Product ID is required");
        return;
      }

      setLoading(true);

      const submitData = {
        name: formData.name,
        product_id: formData.product_id,
        size: formData.size,
        gross_weight: formData.gross_weight,
        less_weight: formData.less_weight,
        net_weight: formData.net_weight,
        tounch: formData.tounch,
        wastage: formData.wastage,
        fine_weight: formData.fine_weight,
        rate: formData.rate,
        metal_type: formData.metal_type,
        making_type: formData.making_type?.value || "PG",
        making_charge: formData.making_charge,
        polishing: formData.polishing,
        stone_setting: formData.stone_setting,
        additional_charges: formData.additional_charges,
        final_amount: formData.final_amount,
        status: formData.status
      };

      // Format timestamp to MySQL format (YYYY-MM-DD HH:mm:ss)
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');

      // Prepare both API calls
      const mainApiPromise = ApiRequest({
        url: editItem ? `${MANAGE_INVENTORY_API.update}/${editItem.id}` : MANAGE_INVENTORY_API.create,
        method: editItem ? 'PUT' : 'POST',
        body: submitData
      });

      const logCreatePromise = ApiRequest({
        url: MANAGE_LOGS_API.create,
        method: 'POST',
        body: {
          userName: userName,
          productName: formData.name || 'Unknown Product',
          id: editItem?.id || 0,
          type: 'inventory',
          amount: parseFloat(formData.final_amount || 0).toFixed(2),
          action: editItem ? 'UPDATE' : 'CREATE',
          entityType: 'INVENTORY',
          timestamp: timestamp,
          metadata: JSON.stringify({
            action: editItem ? 'Updated inventory item' : 'Created new inventory item',
            productId: formData.product_id,
            note: `${editItem ? 'Updated' : 'Created'} inventory item: ${formData.name}`,
            formData: {
              gross_weight: formData.gross_weight,
              net_weight: formData.net_weight,
              fine_weight: formData.fine_weight,
              final_amount: formData.final_amount,
              status: formData.status,
              product_id: formData.product_id
            }
          })
        }
      });

      // Execute both API calls simultaneously
      const [mainResponse, logResponse] = await Promise.all([
        mainApiPromise,
        logCreatePromise
      ]);

      if (!mainResponse?.success) {
        throw new Error(mainResponse?.message || "Failed to save item");
      }

      if (!logResponse?.success) {
        console.error("Warning: Item saved but log creation failed:", logResponse?.message);
        ShowToast("Item saved but logging failed");
      } else {
        ShowToast(mainResponse.message || (editItem ? "Item updated successfully" : "Item created successfully"));
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error details:', error);
      ShowToast(error.message || "Error saving item");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (!editItem?.id) {
        ShowToast("No item selected for deletion");
        return;
      }

      setLoading(true);

      const response = await ApiRequest({
        url: `${MANAGE_INVENTORY_API.delete}/${editItem.id}`,
        method: 'DELETE'
      });

      if (!response?.success) {
        throw new Error(response?.message || "Failed to delete item");
      }

      // Log the delete action
      await createLogEntry(
        'DELETE',
        'INVENTORY',
        parseFloat(formData.final_amount),
        {
          action: 'Deleted inventory item',
          productId: formData.product_id,
          note: `Deleted inventory item: ${formData.name}`
        }
      );

      ShowToast(response.message || "Item deleted successfully");
      navigation.goBack();
    } catch (error) {
      console.error('Error details:', error);
      ShowToast(error.message || "Error deleting item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white p-4 flex-row justify-between items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text className="text-xl font-bold">{editItem ? 'Edit Item' : 'Add Item'}</Text>
        <View className="flex-row">
          {editItem && (
            <>
              <TouchableOpacity 
                onPress={() => handleStatusChange(formData.status === 'available' ? 'sold' : 'available')}
                disabled={loading}
                className="mr-4"
              >
                <MaterialIcons 
                  name={formData.status === 'available' ? 'check-circle' : 'cancel'} 
                  size={24} 
                  color={formData.status === 'available' ? 'green' : 'red'} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleDelete}
                disabled={loading}
                className="mr-4"
              >
                <MaterialIcons name="delete" size={24} color="red" />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              <Text className="text-blue-500 font-semibold">Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Basic Information */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-semibold mb-4">Basic Information</Text>
          
          <View className="mb-4">
            <InputBox
              name="name"
              label="Name"
              value={formData.name}
              onChange={(value) => handleInputChange('name', value)}
              placeholder="Enter item name"
              containerStyle={{paddingVertical: 2}}
              labelStyle={{fontSize: 12}}
              inputStyle={{fontSize: 13}}
            />
          </View>

          <View className="mb-4">
            <InputBox
              name="product_id"
              label="Product ID"
              value={formData.product_id}
              onChange={(value) => handleInputChange('product_id', value)}
              keyboardType="numeric"
              placeholder="Enter product ID"
              containerStyle={{paddingVertical: 2}}
              labelStyle={{fontSize: 12}}
              inputStyle={{fontSize: 13}}
            />
          </View>

          <View className="mb-4">
            <InputBox
              name="size"
              label="Size"
              value={formData.size}
              onChange={(value) => handleInputChange('size', value)}
              placeholder="Enter size"
              containerStyle={{paddingVertical: 2}}
              labelStyle={{fontSize: 12}}
              inputStyle={{fontSize: 13}}
            />
          </View>

          <View>
            <InputBox
              name="metal_type"
              label="Metal Type"
              value={formData.metal_type}
              onChange={(value) => handleInputChange('metal_type', value)}
              placeholder="Enter metal type"
              containerStyle={{paddingVertical: 2}}
              labelStyle={{fontSize: 12}}
              inputStyle={{fontSize: 13}}
            />
          </View>
        </View>

        {/* Weight Information */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-semibold mb-4">Weight Information</Text>
          
          <View className="flex-row justify-between mb-4">
            <View style={{width: '32%'}}>
              <InputBox
                name="gross_weight"
                label="Gross Weight"
                value={formData.gross_weight}
                onChange={(value) => handleInputChange('gross_weight', value)}
                keyboardType="numeric"
                placeholder="0.000"
                containerStyle={{paddingVertical: 2}}
                labelStyle={{fontSize: 12}}
                inputStyle={{fontSize: 13}}
              />
            </View>
            <View style={{width: '32%'}}>
              <InputBox
                name="less_weight"
                label="Less Weight"
                value={formData.less_weight}
                onChange={(value) => handleInputChange('less_weight', value)}
                keyboardType="numeric"
                placeholder="0.000"
                containerStyle={{paddingVertical: 2}}
                labelStyle={{fontSize: 12}}
                inputStyle={{fontSize: 13}}
              />
            </View>
            <View style={{width: '32%'}}>
              <InputBox
                name="net_weight"
                label="Net Weight"
                value={formData.net_weight}
                editable={false}
                keyboardType="numeric"
                placeholder="0.000"
                containerStyle={{paddingVertical: 2}}
                labelStyle={{fontSize: 12}}
                inputStyle={{fontSize: 13}}
              />
            </View>
          </View>

          <View className="flex-row justify-between mb-4">
            <View style={{width: '32%'}}>
              <InputBox
                name="tounch"
                label="Touch %"
                value={formData.tounch}
                onChange={(value) => handleInputChange('tounch', value)}
                keyboardType="numeric"
                placeholder="0.00"
                containerStyle={{paddingVertical: 2}}
                labelStyle={{fontSize: 12}}
                inputStyle={{fontSize: 13}}
              />
            </View>
            <View style={{width: '32%'}}>
              <InputBox
                name="wastage"
                label="Wastage %"
                value={formData.wastage}
                onChange={(value) => handleInputChange('wastage', value)}
                keyboardType="numeric"
                placeholder="0.00"
                containerStyle={{paddingVertical: 2}}
                labelStyle={{fontSize: 12}}
                inputStyle={{fontSize: 13}}
              />
            </View>
            <View style={{width: '32%'}}>
              <InputBox
                name="fine_weight"
                label="Fine Weight"
                value={formData.fine_weight}
                editable={false}
                keyboardType="numeric"
                placeholder="0.000"
                containerStyle={{paddingVertical: 2}}
                labelStyle={{fontSize: 12}}
                inputStyle={{fontSize: 13}}
              />
            </View>
          </View>
        </View>

        {/* Pricing Information */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-semibold mb-4">Pricing Information</Text>
          
          <View className="flex-row justify-between mb-4">
            <View style={{width: '32%'}}>
              <InputBox
                name="rate"
                label="Rate"
                value={formData.rate}
                onChange={(value) => handleInputChange('rate', value)}
                keyboardType="numeric"
                placeholder="0.00"
                containerStyle={{paddingVertical: 2}}
                labelStyle={{fontSize: 12}}
                inputStyle={{fontSize: 13}}
              />
            </View>
            <View style={{width: '32%'}}>
              <SelectInput
                label="Making Type"
                value={formData.making_type}
                data={[
                  { value: "PG", label: "Per Gram" },
                  { value: "PP", label: "Per Piece" }
                ]}
                onSelect={(value) => handleInputChange('making_type', value)}
              />
            </View>
            <View style={{width: '32%'}}>
              <InputBox
                name="making_charge"
                label="Making Charge"
                value={formData.making_charge}
                onChange={(value) => handleInputChange('making_charge', value)}
                keyboardType="numeric"
                placeholder="0.00"
                containerStyle={{paddingVertical: 2}}
                labelStyle={{fontSize: 12}}
                inputStyle={{fontSize: 13}}
              />
            </View>
          </View>

          <View className="flex-row justify-between mb-4">
            <View style={{width: '32%'}}>
              <InputBox
                name="metal_value"
                label="Metal Value"
                value={formData.metal_value}
                editable={false}
                keyboardType="numeric"
                placeholder="0.00"
                containerStyle={{paddingVertical: 2}}
                labelStyle={{fontSize: 12}}
                inputStyle={{fontSize: 13}}
              />
            </View>
            <View style={{width: '32%'}}>
              <InputBox
                name="making_amount"
                label="Making Amount"
                value={formData.making_amount}
                editable={false}
                keyboardType="numeric"
                placeholder="0.00"
                containerStyle={{paddingVertical: 2}}
                labelStyle={{fontSize: 12}}
                inputStyle={{fontSize: 13}}
              />
            </View>
            <View style={{width: '32%'}}>
              <InputBox
                name="polishing"
                label="Polishing"
                value={formData.polishing}
                onChange={(value) => handleInputChange('polishing', value)}
                keyboardType="numeric"
                placeholder="0.00"
                containerStyle={{paddingVertical: 2}}
                labelStyle={{fontSize: 12}}
                inputStyle={{fontSize: 13}}
              />
            </View>
          </View>

          <View className="flex-row justify-between mb-4">
            <View style={{width: '32%'}}>
              <InputBox
                name="stone_setting"
                label="Stone Setting"
                value={formData.stone_setting}
                onChange={(value) => handleInputChange('stone_setting', value)}
                keyboardType="numeric"
                placeholder="0.00"
                containerStyle={{paddingVertical: 2}}
                labelStyle={{fontSize: 12}}
                inputStyle={{fontSize: 13}}
              />
            </View>
            <View style={{width: '32%'}}>
              <InputBox
                name="additional_charges"
                label="Additional"
                value={formData.additional_charges}
                onChange={(value) => handleInputChange('additional_charges', value)}
                keyboardType="numeric"
                placeholder="0.00"
                containerStyle={{paddingVertical: 2}}
                labelStyle={{fontSize: 12}}
                inputStyle={{fontSize: 13}}
              />
            </View>
            <View style={{width: '32%'}}>
              <InputBox
                name="subtotal"
                label="Subtotal"
                value={formData.subtotal}
                editable={false}
                keyboardType="numeric"
                placeholder="0.00"
                containerStyle={{paddingVertical: 2}}
                labelStyle={{fontSize: 12}}
                inputStyle={{fontSize: 13}}
              />
            </View>
          </View>

          <View className="flex-row justify-between mb-4">
            <View style={{width: '32%'}}>
              <InputBox
                name="tax"
                label="Tax %"
                value={formData.tax}
                onChange={(value) => handleInputChange('tax', value)}
                keyboardType="numeric"
                placeholder="0.00"
                containerStyle={{paddingVertical: 2}}
                labelStyle={{fontSize: 12}}
                inputStyle={{fontSize: 13}}
              />
            </View>
            <View style={{width: '32%'}}>
              <InputBox
                name="tax_amount"
                label="Tax Amount"
                value={formData.tax_amount}
                editable={false}
                keyboardType="numeric"
                placeholder="0.00"
                containerStyle={{paddingVertical: 2}}
                labelStyle={{fontSize: 12}}
                inputStyle={{fontSize: 13}}
              />
            </View>
            <View style={{width: '32%'}}>
              <InputBox
                name="final_amount"
                label="Final Amount"
                value={formData.final_amount}
                editable={false}
                keyboardType="numeric"
                placeholder="0.00"
                containerStyle={{paddingVertical: 2}}
                labelStyle={{fontSize: 12}}
                inputStyle={{fontSize: 13}}
              />
            </View>
          </View>
        </View>

        {/* Calculation Summary */}
        <View className="bg-white rounded-lg p-4 mb-4">
          <Text className="text-lg font-semibold mb-4">Calculation Summary</Text>
          
          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-600 mb-2">Weight Details:</Text>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-500">Gross Weight:</Text>
              <Text className="text-sm">{parseFloat(formData.gross_weight).toFixed(3)} g</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-500">Less Weight:</Text>
              <Text className="text-sm">- {parseFloat(formData.less_weight).toFixed(3)} g</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm font-medium">Net Weight:</Text>
              <Text className="text-sm font-medium">{parseFloat(formData.net_weight).toFixed(3)} g</Text>
            </View>
          </View>

          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-600 mb-2">Fine Weight Calculation:</Text>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-500">Touch:</Text>
              <Text className="text-sm">{parseFloat(formData.tounch).toFixed(2)}%</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-500">Wastage:</Text>
              <Text className="text-sm">{parseFloat(formData.wastage).toFixed(2)}%</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-500">Total Percentage:</Text>
              <Text className="text-sm">{(parseFloat(formData.tounch) + parseFloat(formData.wastage)).toFixed(2)}%</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm font-medium">Fine Weight:</Text>
              <Text className="text-sm font-medium">{parseFloat(formData.fine_weight).toFixed(3)} g</Text>
            </View>
          </View>

          <View className="mb-3">
            <Text className="text-sm font-medium text-gray-600 mb-2">Value Calculation:</Text>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-500">Rate:</Text>
              <Text className="text-sm">₹{parseFloat(formData.rate).toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-500">Metal Value:</Text>
              <Text className="text-sm">₹{parseFloat(formData.metal_value).toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-500">Making Charges ({formData.making_type.label}):</Text>
              <Text className="text-sm">₹{parseFloat(formData.making_charge).toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-500">Making Amount:</Text>
              <Text className="text-sm">₹{parseFloat(formData.making_amount).toFixed(2)}</Text>
            </View>
          </View>

          <View className="pt-2 border-t border-gray-200">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-500">Subtotal:</Text>
              <Text className="text-sm">₹{parseFloat(formData.subtotal).toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-500">Tax ({formData.tax}%):</Text>
              <Text className="text-sm">₹{parseFloat(formData.tax_amount).toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between pt-2 border-t border-gray-200">
              <Text className="text-base font-semibold">Total Amount:</Text>
              <Text className="text-base font-semibold">₹{parseFloat(formData.final_amount).toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddEditInventory; 