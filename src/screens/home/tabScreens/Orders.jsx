import React, { useState, useEffect } from "react";
import { View, TextInput, FlatList } from "react-native";
import NoData from "@/src/components/common/NoData";
import OrderCard from "../components/OrderCard";
import { ApiRequest } from "@/src/utils/api";
import { OR_INVOICE_API } from "@/src/utils/api/endpoints";
import { ShowToast } from "../../../components/common/ShowToast";

const Orders = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ApiRequest({
        url: OR_INVOICE_API.listAll,
        method: "GET",
        params: {
          page: currentPage,
          search: search || undefined
        }
      });

      if (response.success) {
        const orderItems = response.data.filter(item => item.type === "order");
        setOrders(orderItems);
        setTotalPages(response.pagination.last_page);
      } else {
        ShowToast(response.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      ShowToast("Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, search]);

  const renderItem = ({ item }) => (
    <OrderCard 
      data={item}
      navigation={navigation} 
    />
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-4">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by client name..."
          className="bg-white p-3 rounded-lg border border-gray-200 mb-2"
        />
      </View>

      <FlatList
        data={orders}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<NoData title="order" />}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshing={loading}
        onRefresh={() => {
          setCurrentPage(1);
          fetchOrders();
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

export default Orders;
