import React, { useState, useEffect } from "react";
import { View, TextInput, FlatList } from "react-native";
import NoData from "@/src/components/common/NoData";
import RepairCard from "../components/RepairCard";
import { ApiRequest } from "@/src/utils/api";
import { OR_INVOICE_API } from "@/src/utils/api/endpoints";
import { ShowToast } from "../../../components/common/ShowToast";

// Flag to switch between mock and API data
const USE_MOCK_DATA = true; // Set to true to use mock data, false for API

// Mock data for development
const mockRepairs = [
  {
    id: 1,
    customer_name: "John Doe",
    total_amount: "₹15,000.00",
    status: "pending",
    created_at: "2024-03-15",
    expected_delivery: "2024-03-20",
    items: [
      {
        name: "Gold Ring",
        repair_type: "Resizing",
        gross_weight: "10.5",
        net_weight: "10.0",
        fine_weight: "9.5",
        repair_charge: "500",
        labor_charge: "200"
      }
    ]
  },
  {
    id: 2,
    customer_name: "Jane Smith",
    total_amount: "₹25,000.00",
    status: "completed",
    created_at: "2024-03-10",
    expected_delivery: "2024-03-15",
    items: [
      {
        name: "Diamond Necklace",
        repair_type: "Stone Setting",
        gross_weight: "20.0",
        net_weight: "19.5",
        fine_weight: "18.5",
        repair_charge: "1000",
        labor_charge: "500"
      }
    ]
  }
];

const Repairing = ({ navigation }) => {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRepairs = async () => {
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
        const repairItems = response.data.filter(item => item.type === "repair");
        setRepairs(repairItems);
        setTotalPages(response.pagination.last_page);
      } else {
        ShowToast(response.message || "Failed to fetch repairs");
      }
    } catch (error) {
      console.error("Error fetching repairs:", error);
      ShowToast("Error fetching repairs");
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
    fetchRepairs();
  }, [currentPage, search]);

  const renderItem = ({ item }) => (
    <RepairCard 
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
        data={repairs}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<NoData title="repair" />}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshing={loading}
        onRefresh={() => {
          setCurrentPage(1);
          fetchRepairs();
        }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

export default Repairing;
