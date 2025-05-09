import React, { useState } from "react";
import AddUser from "../components/AddUser";
import { FlatList, View, TextInput } from "react-native";
import ChatCard from "../components/ChatCard";
import NoData from "@/src/components/common/NoData";
import { useDispatch, useSelector } from "react-redux";
import { fetchHomeInvoiceList } from "@/src/redux/actions/home.action";

const Invoices = ({ navigation, data }) => {
  const dispatch = useDispatch();
  const { fetchLoading } = useSelector((state) => state.homeSlices);
  const [search, setSearch] = useState("");

  const item = ({ item }) => <ChatCard data={item} navigation={navigation} />;

  const fetchInvoices = () => dispatch(fetchHomeInvoiceList());

  const filteredData = data?.filter(item => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      (item?.user_contact_data?.name || "").toLowerCase().includes(searchLower) ||
      (item?.customer_name || "").toLowerCase().includes(searchLower) ||
      (item?.invoice_number || "").toLowerCase().includes(searchLower)
    );
  });

  return (
    <View className="bg-white h-full">
      <View className="px-4 py-2">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name..."
          className="bg-white p-3 rounded-lg border border-gray-200 mb-2"
        />
      </View>

      <FlatList
        data={filteredData || []}
        renderItem={item}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<NoData title="invoices" />}
        onRefresh={fetchInvoices}
        refreshing={fetchLoading}
        keyExtractor={item => item?.id?.toString() || Math.random().toString()}
      />
      <AddUser navigation={navigation} />
    </View>
  );
};

export default Invoices;
