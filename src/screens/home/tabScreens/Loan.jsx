import React, { useState } from "react";
import { FlatList, View, TextInput } from "react-native";
import LoanCard from "../components/LoanCard";
import NoData from "@/src/components/common/NoData";
import { useDispatch, useSelector } from "react-redux";
import { fetchHomeLoanList } from "@/src/redux/actions/home.action";

const LoanTabScreen = ({ navigation, data }) => {
  const dispatch = useDispatch();
  const { fetchLoading } = useSelector((state) => state.homeSlices);
  const [search, setSearch] = useState("");

  const item = ({ item }) => <LoanCard data={item} navigation={navigation} />;

  const getLoans = () => dispatch(fetchHomeLoanList());

  const filteredData = data?.filter(item => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      (item?.user_contacts_data?.name || "").toLowerCase().includes(searchLower)
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
        ListEmptyComponent={<NoData title="loans" />}
        onRefresh={getLoans}
        refreshing={fetchLoading}
        keyExtractor={item => item?.id?.toString() || Math.random().toString()}
      />
    </View>
  );
};

export default LoanTabScreen;
