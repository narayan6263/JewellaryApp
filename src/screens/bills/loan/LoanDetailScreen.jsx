import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Image, ScrollView } from "react-native";
import SectionHeader from "../../../components/common/SectionHeader";
import { useFocusEffect } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchIntrestTillToday,
  fetchLoansDetails,
} from "@/src/redux/actions/loan.action";
import { currency } from "@/src/contants";
import CommonButton from "@/src/components/common/buttons/CommonButton";
import FreezeLoanModal from "./FreezeLoanModal";
import NoData from "@/src/components/common/NoData";
import moment from "moment";

const LoanDetailScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const userData = route.params;
  const [open, setOpen] = useState(false);
  const { loanDetails, intrestTillToday } = useSelector(
    (state) => state.loanSlices
  );
  const [interestDate, setInterestDate] = useState(loanDetails?.interest_upto);
  const [loanAmount, setLoanAmount] = useState(loanDetails?.loan_amount);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchLoansDetails(userData?.id));
    }, [dispatch, userData])
  );

  useEffect(() => {
    if (loanDetails) {
      dispatch(fetchIntrestTillToday(loanDetails.id));
    }
  }, [loanDetails]);

  const getInterestTypeLabel = (type) => {
    return type === "1" ? "Compound" : "Flat";
  };

  return (
    <View>
      <SectionHeader title="Loan Detail" navigation={navigation} />
      {loanDetails ? (
        <ScrollView className="border-y bg-white min-h-screen border-gray-4">
          {/* Basic Loan Information */}
          <View className="py-5 px-4">
            <Text className="font-semibold uppercase text-base pb-4 tracking-wider">
              Loan Information
            </Text>
            
            {/* Loan ID */}
            <View className="flex flex-row pb-2">
              <Text className="tracking-wider font-semibold w-1/3">Loan ID:</Text>
              <Text className="tracking-wider text-gray-6">{loanDetails.id}</Text>
            </View>

            {/* Created Date */}
            <View className="flex flex-row pb-2">
              <Text className="tracking-wider font-semibold w-1/3">Created:</Text>
              <Text className="tracking-wider text-gray-6">
                {moment(loanDetails.created_at).format('DD MMM YYYY')}
              </Text>
            </View>

            {/* Status */}
            <View className="flex flex-row pb-2">
              <Text className="tracking-wider font-semibold w-1/3">Status:</Text>
              <Text className={`tracking-wider ${loanDetails.status === 'frozen' ? 'text-blue-600' : 'text-green-600'}`}>
                {loanDetails.status || 'Active'}
              </Text>
            </View>

            {/* Amounts Section */}
            <View className="mt-4">
              <Text className="font-semibold uppercase text-base pb-2 tracking-wider">
                Amounts
              </Text>
              
              {/* Valuation Amount */}
              <View className="flex flex-row pb-2">
                <Text className="tracking-wider font-semibold w-1/3">Valuation:</Text>
                <Text className="tracking-wider text-gray-6">
                  {currency}{loanDetails.valuation_amount}
                </Text>
              </View>

              {/* Loan Amount */}
              <View className="flex flex-row pb-2">
                <Text className="tracking-wider font-semibold w-1/3">Loan Amount:</Text>
                <Text className="tracking-wider text-gray-6">
                  {currency}{loanAmount}
                </Text>
              </View>
            </View>

            {/* Interest Details */}
            <View className="mt-4">
              <Text className="font-semibold uppercase text-base pb-2 tracking-wider">
                Interest Details
              </Text>

              {/* Interest Type */}
              <View className="flex flex-row pb-2">
                <Text className="tracking-wider font-semibold w-1/3">Type:</Text>
                <Text className="tracking-wider text-gray-6">
                  {getInterestTypeLabel(loanDetails.interest_type)}
                </Text>
              </View>

              {/* Interest Rate */}
              <View className="flex flex-row pb-2">
                <Text className="tracking-wider font-semibold w-1/3">Rate:</Text>
                <Text className="tracking-wider text-gray-6">
                  {loanDetails.interest_rate}%
                </Text>
              </View>

              {/* Interest Period */}
              <View className="pb-3">
                <Text className="font-semibold uppercase text-sm pb-2 tracking-wider">
                  Current Period
                </Text>
                <View className="flex flex-row justify-between">
                  <View className="flex-1 pr-2">
                    <Text className="tracking-wider font-semibold">From:</Text>
                    <Text className="tracking-wider text-gray-6">
                      {loanDetails?.interest_periods?.length > 0 
                        ? moment(loanDetails.interest_periods[0]?.interest_from).format('DD MMM YYYY')
                        : moment(loanDetails?.created_at).format('DD MMM YYYY')}
                    </Text>
                  </View>
                  <View className="flex-1 pl-2">
                    <Text className="tracking-wider font-semibold">Upto:</Text>
                    <Text className="tracking-wider text-gray-6">
                      {moment(interestDate).format('DD MMM YYYY')}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Interest Amount */}
              <View className="flex flex-row pb-2">
                <Text className="tracking-wider font-semibold w-1/3">Interest:</Text>
                <Text className="tracking-wider text-gray-6">
                  {currency}{loanDetails.interest_amount}
                </Text>
              </View>

              {/* Interest Till Today */}
              {intrestTillToday && (
                <View className="flex flex-row pb-2">
                  <Text className="tracking-wider font-semibold w-1/3">Till Today:</Text>
                  <Text className="tracking-wider text-gray-6">
                    {currency}{intrestTillToday.interest_till_amount}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Items List */}
          <View className="py-5">
            <Text className="font-semibold px-4 uppercase text-base pb-4 tracking-wider">
              Items List
            </Text>

            {loanDetails?.loan_details_data?.length === 0 ? (
              <NoData title="items" />
            ) : (
              loanDetails?.loan_details_data?.map((item) => (
                <View
                  key={item.id}
                  className="border-b px-4 py-2.5 flex flex-row space-x-3 border-gray-3"
                >
                  {/* Item Image */}
                  <View>
                    <Image
                      src={item?.image_url}
                      className="w-[50px] bg-gray-2 shadow-md rounded-full h-[50px]"
                    />
                  </View>

                  {/* Item Details */}
                  <View className="flex w-[85%]">
                    <View className="flex flex-row items-center pb-1 justify-between w-full">
                      <Text className="text-base text-gray-6 font-medium">
                        {item?.product_data?.name}
                      </Text>
                      <Text className="text-gray-6 font-medium">
                        {currency}{item?.net_price}
                      </Text>
                    </View>
                    {/* Weight Details */}
                    <View className="flex-row space-x-2 items-center">
                      <Text className="text-gray-500 text-xs font-medium">
                        GWT: {item?.gross_weight}g
                      </Text>
                      <Text className="px-1 text-primary text-base">|</Text>
                      <Text className="text-gray-500 text-xs font-medium">
                        FWT: {item?.fine_weight}g
                      </Text>
                      <Text className="px-1 text-primary text-base">|</Text>
                      <Text className="text-gray-500 text-xs font-medium">
                        Touch: {item?.tounch}%
                      </Text>
                    </View>
                    {/* HSN and Making Charges */}
                    <View className="flex-row space-x-2 items-center mt-1">
                      <Text className="text-gray-500 text-xs font-medium">
                        HSN: {item?.hsn_id}
                      </Text>
                      <Text className="px-1 text-primary text-base">|</Text>
                      <Text className="text-gray-500 text-xs font-medium">
                        Making: {currency}{item?.making_charge}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}

            {/* Freeze Loan Button */}
            <View className="p-5">
              <CommonButton 
                onPress={() => setOpen(true)} 
                title={loanDetails.status === 'frozen' ? "Update Loan" : "Freeze Loan"}
              />
            </View>
          </View>
        </ScrollView>
      ) : (
        <NoData title="detail" />
      )}

      {/* Freeze Loan Modal */}
      {intrestTillToday && loanDetails && open && (
        <FreezeLoanModal
          onLoanAmountUpdate={setLoanAmount}
          currentLoanAmount={loanAmount}
          loanData={loanDetails}
          open={open}
          intrestTillToday={intrestTillToday}
          onClose={() => setOpen(false)}
          onFreezeSuccess={(updatedLoan) => {
            dispatch({ type: 'LOAN/UPDATE_DETAILS', payload: updatedLoan });
          }}
          onDateChange={setInterestDate}
          currentDate={interestDate}
        />
      )}
    </View>
  );
};

export default LoanDetailScreen;
