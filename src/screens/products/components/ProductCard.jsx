import React, { useState, useEffect } from "react";
import { Text, View, Modal, TextInput, FlatList, ActivityIndicator } from "react-native";
import { TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { manageProductList, fetchProductList } from "@/src/redux/actions/product.action";
import ImagePickerComponent from "@/src/components/common/ImagePicker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ShowToast from "@/src/components/common/ShowToast";

const ProductCard = ({ navigation, data, onUpdateTotalWeight, onUpdateFineWeight }) => {
  const dispatch = useDispatch();
  const { navigate } = navigation;
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [newNetWeight, setNewNetWeight] = useState("");
  const [weightHistory, setWeightHistory] = useState([]);
  const [touchValue, setTouchValue] = useState(0);
  const [transferAmount, setTransferAmount] = useState("");
  const [destinationProduct, setDestinationProduct] = useState(null);
  const [showProductList, setShowProductList] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [grossWeight, setGrossWeight] = useState("");
  const { loading, products } = useSelector((state) => state.productSlices);

  // Filter out current product from available products
  const availableProducts = products?.data?.filter(p => p.id !== data.id) || [];

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadStoredHistory();
    loadStoredTouch();
    dispatch(fetchProductList());
  }, []);

  const loadStoredTouch = async () => {
    try {
      const stored = await AsyncStorage.getItem(`touch_value_${data.id}`);
      if (stored) {
        setTouchValue(parseFloat(stored));
      }
    } catch (error) {
      console.log('Error loading touch value:', error);
    }
  };

  const loadStoredHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(`weight_history_${data.id}`);
      if (stored) {
        setWeightHistory(JSON.parse(stored));
      } else if (data?.purchase_product_data) {
        setWeightHistory(data.purchase_product_data);
        await AsyncStorage.setItem(
          `weight_history_${data.id}`, 
          JSON.stringify(data.purchase_product_data)
        );
      }
    } catch (error) {
      console.log('Error loading history:', error);
    }
  };

  const handleImageUpdate = ({ value }) => {
    // The value object is already properly formatted by ImagePickerComponent
    const formData = new FormData();
    formData.append("image", value);
    formData.append("id", data.id);
    
    dispatch(
      manageProductList({
        payload: formData,
        isUpdate: true,
        callback: () => {
          setSelectedProduct(null);
        },
      })
    );
  };

  const handleUpdateNetWeight = async () => {
    if (!newNetWeight) {
      ShowToast("Please enter a valid weight");
      return;
    }

    setSaveLoading(true);

    const newEntry = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      purchase_gross_weight: grossWeight ? parseFloat(grossWeight) : 
        (weightHistory.length > 0 ? 
          weightHistory[weightHistory.length - 1]?.purchase_gross_weight || 0 : 0),
      purchase_net_weight: parseFloat(newNetWeight),
      purchase_fine_weight: (parseFloat(newNetWeight) * touchValue) / 100
    };

    const updatedHistory = [...weightHistory, newEntry];
    
    // Update local state
    setWeightHistory(updatedHistory);
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(
        `weight_history_${data.id}`, 
        JSON.stringify(updatedHistory)
      );

      // Save to backend
      const formData = new FormData();
      formData.append("id", data.id);
      formData.append("purchase_product_data", JSON.stringify(updatedHistory));
      
      dispatch(manageProductList({
        payload: formData,
        isUpdate: true,
        callback: () => {
          setSaveLoading(false);
          setShowModal(false);
          setNewNetWeight("");
          setGrossWeight("");
          ShowToast("Weight updated successfully");
        }
      }));
    } catch (error) {
      setSaveLoading(false);
      console.error("Error updating weight:", error);
      ShowToast("Failed to update weight");
    }
  };

  const handleTransferWeight = async () => {
    if (!destinationProduct || !transferAmount) {
      ShowToast("Please select a product and enter an amount");
      return;
    }

    const amountToTransfer = parseFloat(transferAmount);
    const currentTotalWeight = weightHistory.reduce((sum, item) => 
      sum + (parseFloat(item.purchase_net_weight) || 0), 0
    );

    if (amountToTransfer > currentTotalWeight) {
      ShowToast("Cannot transfer more weight than available");
      return;
    }

    setSaveLoading(true);
    
    // Create new entry for source product (reducing weight)
    const sourceEntry = {
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      purchase_gross_weight: weightHistory[weightHistory.length - 1]?.purchase_gross_weight || 0,
      purchase_net_weight: -amountToTransfer,
      purchase_fine_weight: weightHistory[weightHistory.length - 1]?.purchase_fine_weight || 0
    };

    // Create new entry for destination product (adding weight)
    const destinationEntry = {
      id: (Date.now() + 1).toString(),
      created_at: new Date().toISOString(),
      purchase_gross_weight: 0,
      purchase_net_weight: amountToTransfer,
      purchase_fine_weight: 0
    };

    // Update source product
    const updatedSourceHistory = [...weightHistory, sourceEntry];
    await AsyncStorage.setItem(
      `weight_history_${data.id}`, 
      JSON.stringify(updatedSourceHistory)
    );
    setWeightHistory(updatedSourceHistory);

    // Update destination product
    const destStoredHistory = await AsyncStorage.getItem(`weight_history_${destinationProduct.id}`);
    const destHistory = destStoredHistory ? JSON.parse(destStoredHistory) : [];
    const updatedDestHistory = [...destHistory, destinationEntry];
    await AsyncStorage.setItem(
      `weight_history_${destinationProduct.id}`, 
      JSON.stringify(updatedDestHistory)
    );

    // Update both products in backend
    const sourceFormData = new FormData();
    sourceFormData.append("id", data.id);
    sourceFormData.append("purchase_product_data", JSON.stringify(updatedSourceHistory));

    const destFormData = new FormData();
    destFormData.append("id", destinationProduct.id);
    destFormData.append("purchase_product_data", JSON.stringify(updatedDestHistory));

    // Update source product
    await dispatch(manageProductList({
      payload: sourceFormData,
      isUpdate: true,
      callback: () => {}
    }));

    // Update destination product
    await dispatch(manageProductList({
      payload: destFormData,
      isUpdate: true,
      callback: () => {
        setShowTransferModal(false);
        setTransferAmount("");
        setDestinationProduct(null);
        dispatch(fetchProductList());
        setSaveLoading(false);
      }
    }));
  };

  // Get the latest weight values for display
  const latestWeight = weightHistory[weightHistory.length - 1] || {};
  
  // Calculate total net weight
  const totalNetWeight = weightHistory.reduce((sum, item) => 
    sum + (parseFloat(item.purchase_net_weight) || 0), 0
  );

  // Calculate total fine weight using formula (net weight * touch) / 100
  const totalFineWeight = (totalNetWeight * touchValue) / 100;

  // Calculate total net weight and fine weight and notify parent component
  useEffect(() => {
    if (onUpdateTotalWeight) {
      onUpdateTotalWeight(data.id, totalNetWeight);
    }
    if (onUpdateFineWeight) {
      onUpdateFineWeight(data.id, totalFineWeight);
    }
  }, [totalNetWeight, totalFineWeight]);

  return loading && selectedProduct == data.id ? (
    <Text className="px-3 py-3 border-b text-center bg-white border-gray-2 flex flex-row items-center">
      Updating Image...
    </Text>
  ) : (
    <View>
      {/* Transfer Weight Modal */}
      <Modal
        visible={showTransferModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTransferModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-4 rounded-lg w-4/5">
            <Text className="text-lg font-medium mb-4">Transfer Weight</Text>
            
            {/* Destination Product Selection */}
            <TouchableOpacity
              onPress={() => setShowProductList(!showProductList)}
              className="border border-gray-300 rounded-md p-2 mb-2"
            >
              <Text>{destinationProduct ? destinationProduct.name : "Select Product"}</Text>
            </TouchableOpacity>

            {showProductList && (
              <View className="border border-gray-300 rounded-md max-h-32 mb-2">
                <FlatList
                  data={availableProducts}
                  keyExtractor={item => item.id}
                  renderItem={({item}) => (
                    <TouchableOpacity
                      onPress={() => {
                        setDestinationProduct(item);
                        setShowProductList(false);
                      }}
                      className="p-2 border-b border-gray-200"
                    >
                      <Text>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Weight Input */}
            <TextInput
              className="border border-gray-300 rounded-md p-2 mb-4"
              keyboardType="numeric"
              placeholder="Enter weight to transfer (in grams)"
              value={transferAmount}
              onChangeText={setTransferAmount}
            />

            <View className="flex-row justify-end space-x-2">
              <TouchableOpacity 
                onPress={() => {
                  setShowTransferModal(false);
                  setTransferAmount("");
                  setDestinationProduct(null);
                }}
                className="px-4 py-2"
                disabled={saveLoading}
              >
                <Text className="text-gray-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleTransferWeight}
                className={`${saveLoading ? 'bg-primary/50' : 'bg-primary'} px-4 py-2 rounded-md flex-row items-center`}
                disabled={saveLoading}
              >
                {saveLoading ? (
                  <>
                    <ActivityIndicator size="small" color="white" style={{marginRight: 8}} />
                    <Text className="text-white">Processing...</Text>
                  </>
                ) : (
                  <Text className="text-white">Transfer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Net Weight Update Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-4 rounded-lg w-4/5">
            <Text className="text-lg font-medium mb-4">Enter New Weight</Text>
            
            {/* Gross Weight Input */}
            <Text className="text-sm text-gray-600 mb-1">Gross Weight (g)</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-2 mb-3"
              keyboardType="numeric"
              placeholder="Enter gross weight in grams"
              value={grossWeight}
              onChangeText={setGrossWeight}
            />
            
            {/* Net Weight Input */}
            <Text className="text-sm text-gray-600 mb-1">Net Weight (g)</Text>
            <TextInput
              className="border border-gray-300 rounded-md p-2 mb-4"
              keyboardType="numeric"
              placeholder="Enter net weight in grams"
              value={newNetWeight}
              onChangeText={setNewNetWeight}
              autoFocus={true}
            />
            
            {newNetWeight && touchValue ? (
              <View className="bg-gray-100 p-2 rounded-md mb-4">
                <Text className="text-sm text-gray-600">
                  Fine Weight: {((parseFloat(newNetWeight) || 0) * touchValue / 100).toFixed(2)}g
                </Text>
              </View>
            ) : null}
            
            <View className="flex-row justify-end space-x-2">
              <TouchableOpacity 
                onPress={() => {
                  setShowModal(false);
                  setNewNetWeight("");
                  setGrossWeight("");
                }}
                className="px-4 py-2"
                disabled={saveLoading}
              >
                <Text className="text-gray-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleUpdateNetWeight}
                className={`${saveLoading ? 'bg-primary/50' : 'bg-primary'} px-4 py-2 rounded-md flex-row items-center`}
                disabled={saveLoading}
              >
                {saveLoading ? (
                  <>
                    <ActivityIndicator size="small" color="white" style={{marginRight: 8}} />
                    <Text className="text-white">Saving...</Text>
                  </>
                ) : (
                  <Text className="text-white">Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Main Product Card */}
    <View className="px-3 py-2.5 border-b bg-white border-gray-2 flex flex-row items-center">
      <ImagePickerComponent
        onChange={(event) => {
          setSelectedProduct(data.id);
          handleImageUpdate(event);
        }}
        value={data?.image_url}
        name="image"
        loading={loading}
      />
        <View className="flex-1 pl-3">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigate("NewProduct", { 
            ...data,
            isProductEdit: true,     // Flag to indicate product edit
            onTouchUpdate: async (newTouch) => {
              await AsyncStorage.setItem(`touch_value_${data.id}`, newTouch.toString());
              setTouchValue(parseFloat(newTouch));
            }
          })}
        >
          <Text className="text-base text-gray-6 font-medium">
            {data?.name}
          </Text>
            <View className="flex-row items-center flex-wrap">
              <Text className="text-gray-500 text-xs font-medium">
                Total NWT : {totalNetWeight.toFixed(2)} g
              </Text>
              <Text className="px-1 text-primary text-base">|</Text>
            <Text className="text-gray-500 text-xs font-medium">
                Touch : {touchValue.toFixed(2)}%
            </Text>
            <Text className="px-1 text-primary text-base">|</Text>
            <Text className="text-gray-500 text-xs font-medium">
                Total FWT : {totalFineWeight.toFixed(2)} g
            </Text>
          </View>
        </TouchableOpacity>
        </View>
      </View>

      {/* Actions Bar */}
      <View className="flex-row items-center justify-end space-x-3 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <MaterialIcons
          onPress={() => setShowTransferModal(true)}
          name="swap-horiz"
          color="#6366f1"
          size={24}
        />
        <MaterialIcons
          onPress={() => setShowModal(true)}
          name="add-circle-outline"
          color="#6366f1"
          size={24}
        />
          <MaterialIcons
            onPress={() => navigate("StockHistory", data)}
            name="history"
          color="#6366f1"
          size={24}
        />
      </View>

      {/* Weight History Section */}
      <View>
        {/* Expand/Collapse Header */}
        <TouchableOpacity 
          onPress={() => setIsExpanded(!isExpanded)}
          className="flex-row items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200"
        >
          <Text className="text-sm font-medium text-gray-600">Weight History</Text>
          <MaterialIcons
            name={isExpanded ? "expand-less" : "expand-more"}
            color="#6366f1"
            size={24}
          />
        </TouchableOpacity>

        {/* Expandable Content */}
        {isExpanded && (
          <View className="px-3 py-2 bg-gray-50 border-b border-gray-2">
            {weightHistory.length > 0 ? (
              weightHistory.map((item) => (
                <View 
                  key={item.id} 
                  className="mb-2 border-b border-gray-200 pb-2 last:border-0 last:mb-0"
                >
                  <Text className="text-sm text-gray-600 mb-1">
                    Added: {new Date(item.created_at).toLocaleString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    })}
                  </Text>
                  <View className="flex-row items-center">
                    <View 
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: 7,
                        backgroundColor: Number(item.purchase_net_weight) >= 0 ? '#22c55e' : '#ef4444',
                        marginRight: 8
                      }}
                    />
                    <Text className="text-sm text-gray-600">
                      Net Weight: {item.purchase_net_weight} g
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-sm text-gray-500 text-center py-2">No weight history available</Text>
            )}
        </View>
        )}
      </View>
    </View>
  );
};

export default ProductCard;
