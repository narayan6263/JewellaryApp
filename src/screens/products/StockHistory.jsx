import NoData from "@/src/components/common/NoData";
import SectionHeader from "@/src/components/common/SectionHeader";
import { fetchProductStocks } from "@/src/redux/actions/product.action";
import React, { Fragment, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import { TabView, SceneMap } from "react-native-tab-view";
import { useDispatch, useSelector } from "react-redux";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from "moment";

const HistoryTabContent = ({ productId, historyType, navigation }) => {
  const { fetchLoading, productStocks } = useSelector(
    (state) => state.productSlices
  );
  
  const [weightHistory, setWeightHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load the local weight history from AsyncStorage
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        const stored = await AsyncStorage.getItem(`weight_history_${productId}`);
        if (stored) {
          const history = JSON.parse(stored);
          
          // Filter history based on selected tab
          // historyType: 0 = All, 1 = Positive (Added), 2 = Negative (Transferred out)
          const filteredHistory = historyType === 0 
            ? history 
            : history.filter(item => 
                historyType === 1 
                  ? parseFloat(item.purchase_net_weight) > 0 
                  : parseFloat(item.purchase_net_weight) < 0
              );
          
          setWeightHistory(filteredHistory);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading history:', error);
        setLoading(false);
      }
    };
    
    loadHistory();
  }, [productId, historyType]);

  const renderFooter = () => {
    return loading ? (
      <ActivityIndicator
        color="purple"
        size="large"
        style={{ marginVertical: 10 }}
      />
    ) : null;
  };

  const renderItem = ({ item }) => {
    const isNegative = parseFloat(item.purchase_net_weight) < 0;
    const netWeight = Math.abs(parseFloat(item.purchase_net_weight) || 0);
    const fineWeight = Math.abs(parseFloat(item.purchase_fine_weight) || 0);
    const grossWeight = parseFloat(item.purchase_gross_weight) || 0;
    
    return (
      <View
        key={item.id}
        className="p-3 flex flex-row items-start border-b border-gray-200"
      >
        <View 
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: isNegative ? '#fee2e2' : '#dcfce7',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 10
          }}
        >
          <MaterialIcons
            name={isNegative ? "remove" : "add"}
            size={20}
            color={isNegative ? "#dc2626" : "#059669"}
          />
        </View>
        
        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <Text className="font-medium text-base">
              {isNegative ? 'Transferred Out' : 'Added Weight'}
            </Text>
            <Text 
              style={{ 
                color: isNegative ? "#dc2626" : "#059669", 
                fontWeight: "bold" 
              }}
            >
              {isNegative ? "-" : "+"}{netWeight.toFixed(2)}g
            </Text>
          </View>

          {/* Weight details */}
          <View className="mt-1">
            {grossWeight > 0 && (
              <Text className="text-gray-500 text-xs">
                Gross Weight: {grossWeight.toFixed(2)}g
              </Text>
            )}
            
            {fineWeight > 0 && (
              <Text className="text-gray-500 text-xs">
                Fine Weight: {fineWeight.toFixed(2)}g
              </Text>
            )}
          </View>
          
          {/* Date and timestamp */}
          <Text className="text-gray-400 text-xs mt-1">
            {moment(item.created_at).format("MMM DD, YYYY - hh:mm A")}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ActivityIndicator
        color="purple"
        size={40}
        style={{ marginTop: 50, alignSelf: "center" }}
      />
    );
  }

  if (!loading && weightHistory.length === 0) {
    return <NoData title="weight history" />;
  }

  return (
    <FlatList
      data={weightHistory}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListFooterComponent={renderFooter}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
};

// API-based history component (will be used when backend is ready)
const ApiStockHistory = ({ productId, type }) => {
  const { fetchLoading, productStocks } = useSelector(
    (state) => state.productSlices
  );
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(fetchProductStocks({ product_id: productId, type }));
  }, [productId, type, dispatch]);

  const renderFooter = () => {
    return fetchLoading ? (
      <ActivityIndicator
        color="purple"
        size="large"
        style={{ marginVertical: 10 }}
      />
    ) : null;
  };

  const renderItem = ({ item }) => {
    const isSale = item.transaction_type === "remove";
    return (
      <View
        key={item.id}
        className="p-3 flex flex-row items-start border-b border-gray-200"
      >
        <View 
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: isSale ? '#fee2e2' : '#dcfce7',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 10
          }}
        >
          <MaterialIcons
            name={isSale ? "remove" : "add"}
            size={20}
            color={isSale ? "#dc2626" : "#059669"}
          />
        </View>
        
        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <Text className="font-medium text-base">
              {isSale ? 'Removed' : 'Added'} Weight
            </Text>
            <Text 
              style={{ 
                color: isSale ? "#dc2626" : "#059669", 
                fontWeight: "bold" 
              }}
            >
              {isSale ? "-" : "+"}{parseFloat(item.weight).toFixed(2)}g
            </Text>
          </View>

          {/* Description */}
          {item.description && (
            <Text className="text-gray-600 text-sm mt-1">
              {item.description}
            </Text>
          )}
          
          {/* Date and timestamp */}
          <Text className="text-gray-400 text-xs mt-1">
            {moment(item.created_at).format("MMM DD, YYYY - hh:mm A")}
          </Text>
        </View>
      </View>
    );
  };

  if (fetchLoading && (!productStocks || productStocks.length === 0)) {
    return (
      <ActivityIndicator
        color="purple"
        size={40}
        style={{ marginTop: 50, alignSelf: "center" }}
      />
    );
  }

  if (!fetchLoading && productStocks?.length === 0) {
    return <NoData title="stock history" />;
  }

  return (
    <FlatList
      data={productStocks}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      ListFooterComponent={renderFooter}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
};

const StockHistory = ({ navigation, route }) => {
  const product = route.params;
  const layout = Dimensions.get("window");
  const [index, setIndex] = useState(0);
  const [tabType, setTabType] = useState(0);
  
  // Toggle between local history and API history
  const useApiHistory = false; // Set to true when backend is ready

  const [routes] = useState([
    { title: "All", key: 0 },
    { title: "Added", key: 1 },
    { title: "Transferred", key: 2 },
  ]);

  const renderScene = ({ route }) => {
    const historyType = route.key;
    
    if (useApiHistory) {
      return <ApiStockHistory productId={product.id} type={historyType} />;
    } else {
      return <HistoryTabContent productId={product.id} historyType={historyType} navigation={navigation} />;
    }
  };

  const renderTabBar = (props) => (
    <View className="bg-primary flex-row justify-around">
      {props.navigationState.routes.map((route, i) => (
        <TouchableOpacity
          key={route.key}
          className={`px-4 pb-3 pt-1.5 flex-1 items-center ${
            index === i && "border-b-4 border-orange-400"
          }`}
          onPress={() => {
            setIndex(i);
            setTabType(route.key);
          }}
        >
          <Text className="text-white uppercase font-medium tracking-wider text-base">
            {route.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Fragment>
      <SectionHeader
        title={`${product.name}'s Weight History`}
        navigation={navigation}
      />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
      />
    </Fragment>
  );
};

export default StockHistory;
