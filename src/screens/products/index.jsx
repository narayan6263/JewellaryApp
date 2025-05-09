import BackButton from "@/src/components/common/buttons/BackButton";
import NoData from "@/src/components/common/NoData";
import {
  fetchProductGroups,
  fetchProductList,
} from "@/src/redux/actions/product.action";
import React, { Fragment, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

import { useDispatch, useSelector } from "react-redux";
import ProductCard from "./components/ProductCard";
import SelectInput from "@/src/components/common/SelectInput";
import CommonButton from "@/src/components/common/buttons/CommonButton";
import { handleDigitsFix } from "@/src/utils";

const ProductScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [params, setParams] = useState({});
  const [productWeights, setProductWeights] = useState({});
  const [productFineWeights, setProductFineWeights] = useState({});
  const {
    products = {},
    productGroups,
    fetchLoading,
  } = useSelector((state) => state.productSlices);
  const [initialState, setInitialState] = useState({ isSearch: false });

  const handleUpdateTotalWeight = (productId, weight) => {
    setProductWeights(prev => ({
      ...prev,
      [productId]: weight
    }));
  };

  const handleUpdateFineWeight = (productId, weight) => {
    setProductFineWeights(prev => ({
      ...prev,
      [productId]: weight
    }));
  };

  // Calculate totals only for filtered products
  const calculateFilteredTotals = () => {
    const filteredProducts = products?.data || [];
    let netWeight = 0;
    let fineWeight = 0;

    filteredProducts.forEach(product => {
      if (productWeights[product.id]) {
        netWeight += productWeights[product.id];
      }
      if (productFineWeights[product.id]) {
        fineWeight += productFineWeights[product.id];
      }
    });

    return {
      totalNetWeight: netWeight,
      totalFineWeight: fineWeight
    };
  };

  const { totalNetWeight, totalFineWeight } = calculateFilteredTotals();

  const item = (data) => (
    <ProductCard 
      data={data.item} 
      navigation={navigation} 
      onUpdateTotalWeight={handleUpdateTotalWeight}
      onUpdateFineWeight={handleUpdateFineWeight}
    />
  );

  const handleInitialState = (event) => {
    setInitialState({ ...initialState, ...event });
  };

  const BackComponent = () => {
    return (
      <BackButton
        onPress={() => {
          handleInitialState({ isSearch: false });
          navigation.navigate("Home");
        }}
        color="white"
      />
    );
  };

  const fetchAllProducts = () => {
    dispatch(
      fetchProductList({
        metal_id: params?.metal_id?.value || "",
        product_name: params?.search || "",
      })
    );
  };

  // reset params
  useEffect(() => setParams({}), []);

  useEffect(() => {
    dispatch(fetchProductGroups());
    fetchAllProducts();
  }, [dispatch, params]);
  return (
    <Fragment>
      {/* Topbar */}
      {initialState?.isSearch ? (
        <View className="px-5 py-3 flex flex-row bg-primary justify- items-center">
          <BackComponent />
          <View className="flew bg-transprent justify-between w-[91%] py-2 ml-3 bg-red-0 flex-row items-center">
            <TextInput
              placeholder="Search Contact ..."
              placeholderTextColor="lightgray"
              value={params?.search}
              onChangeText={(value) => setParams({ ...params, search: value })}
              className="text-lg pl-1 max-w-[300px] text-white placeholder:text-white"
            />
            <TouchableOpacity activeOpacity={0.6} className="pl-4">
              <AntDesign
                name="close"
                color="white"
                size={24}
                onPress={() => {
                  setParams({ ...params, search: null });
                  handleInitialState({ isSearch: false });
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="p-5 flex flex-row bg-primary justify-between items-center">
          <View className="flex flex-row items-center">
            <BackButton
              onPress={() => navigation.navigate("Home")}
              color="white"
            />
            <View>
              <Text className="pl-5 text-lg text-white ">
                Products ( {products?.data?.length} )
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => handleInitialState({ isSearch: true })}
          >
            <AntDesign name="search1" color="white" size={20} />
          </TouchableOpacity>
        </View>
      )}

      {/* products list */}
      <View className="min-h-screen pb-[200px] bg-white">
        {/* Filter and Add button */}
        <View className="bg-primary/10 justify-between flex-row px-4 py-3">
          <View className="bg-white rounded-lg w-[170px] ">
            <SelectInput
              name="metal_id"
              value={params?.metal_id}
              placeholder="Filter by metal"
              data={[
                { label: "All", value: "" },
                ...productGroups.map((item) => ({
                  label: item.name,
                  value: item.id,
                })),
              ]}
              onSelect={(value) => setParams({ ...params, metal_id: value })}
            />
          </View>

          <View className="w-[140px]">
            <CommonButton
              onPress={() => navigation.navigate("NewProduct")}
              title="Add Product"
            />
          </View>
        </View>

        {/* Weight */}
        <View className="flex bg-primary/10 px-4 pb-3 flex-row justify-between">
          {/* Net Weight */}
          <View>
            <Text className="font-semibold tracking-wide">
              {handleDigitsFix(totalNetWeight) || 0} g
            </Text>
            <Text className="tracking-wide">Net Weight</Text>
          </View>

          {/* Fine Weight */}
          <View>
            <Text className="font-semibold tracking-wide">
              {handleDigitsFix(totalFineWeight) || 0} g
            </Text>
            <Text className="tracking-wide">Fine Weight</Text>
          </View>
        </View>

        {/* product list */}
        {products?.data?.length == 0 && fetchLoading ? (
          <ActivityIndicator className="mt-20" size={40} color="purple" />
        ) : (
          <FlatList
            data={products?.data || []}
            renderItem={item}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={<NoData title="products" />}
            onRefresh={fetchAllProducts}
            refreshing={fetchLoading}
          />
        )}
      </View>
    </Fragment>
  );
};

export default ProductScreen;
