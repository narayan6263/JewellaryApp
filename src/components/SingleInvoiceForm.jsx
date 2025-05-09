import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import InputBox from "./common/InputBox";
import CommonButton from "./common/buttons/CommonButton";
import SelectInput from "@/src/components/common/SelectInput";
import ImagePickerComponent from "./common/ImagePicker";
import SearchProduct from "../screens/products/components/SearchProduct";
import DatePickerComponent from "./common/DateTimePicker";
import KeyboardHanlder from "./common/KeyboardHanlder";
import moment from "moment";
import { handleDigitsFix } from "../utils";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductGroups } from "@/src/redux/actions/product.action";

const SingleInvoiceForm = ({ initialData, onSave, onClose }) => {
  const dispatch = useDispatch();
  const { productGroups } = useSelector((state) => state.productSlices);

  const [formValue, setFormValue] = useState(initialData || {
    photo: null,
    valuation: "",
    interest_rate: "2",
    interest_type: { label: "Flat", value: "2" },
    interest_duration: { label: "1 Year", value: "12" },
    start_date: moment().format('YYYY-MM-DD'),
    next_calculation_date: moment().add(1, 'year').format('YYYY-MM-DD'),
    less_by_type: { label: "Weight", value: "weight" },
    less_weight: "0",
    loan_percentage: "0",
    loan_amount: "",
  });

  const [modalState, setModalState] = useState({ datePicker: false, flatInterestDatePicker: false });

  const handleInputChange = useCallback((name, value) => {
    setFormValue(prev => {
      const newState = { ...prev, [name]: value };

      // Calculate net weight
      if (["gross_weight", "less_weight", "less_by_type"].includes(name)) {
        if (newState.less_by_type?.value === "percentage" && name === "less_weight") {
          const percentage = Number(value || 0);
          const lessWeightValue = (Number(newState.gross_weight || 0) * percentage) / 100;
          newState.less_weight = lessWeightValue.toString();
        }
        
        newState.net_weight = handleDigitsFix(
          Number(newState.gross_weight || 0) - Number(newState.less_weight || 0)
        );

        // Add fine weight calculation
        newState.fine_weight = (
          (Number(newState.net_weight || 0) * Number(newState.tounch || 0)) / 100
        ).toFixed(3);
      }

      // Update calculations when tounch changes
      if (["tounch"].includes(name)) {
        // Add fine weight calculation
        newState.fine_weight = (
          (Number(newState.net_weight || 0) * Number(value || 0)) / 100
        ).toFixed(3);
      }

      // Calculate valuation directly: Net Weight × (Tounch/Purity %) × Rate
      const rate = Number(newState?.rate?.price || newState?.rate || 0);
      const valuation = Number(newState.fine_weight || 0) * rate;
      
      newState.net_price = handleDigitsFix(valuation);
      newState.valuation = newState.net_price;

      // Update calculations when rate changes
      if (name === "rate") {
        // Calculate valuation directly: Net Weight × (Tounch/Purity %) × Rate
        const rate = Number(value?.price || value || 0);
        const valuation = Number(newState.fine_weight || 0) * rate;
        
        newState.net_price = handleDigitsFix(valuation);
        newState.valuation = newState.net_price;
      }

      return newState;
    });
  }, []);

  const handleModalState = useCallback((name, value) => {
    setModalState(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleProductDetail = useCallback((product) => {
    setFormValue(prev => {
      const newState = { ...prev };
      const isVariation = product?.hsn_id?.variation?.length > 0;

      newState.product_id = product.id;
      newState.name = product.name;
      newState.hsn_id = { 
        label: product?.hsn_name, 
        value: product?.hsn_id,
        variation: product?.variation_data 
      };
      newState.rate = isVariation
        ? {
            label: product?.variation_data?.[0]?.name,
            value: product?.variation_data?.[0]?.id,
            price: product?.variation_data?.[0]?.price,
          }
        : product?.price;

      return newState;
    });
  }, []);

  // Calculate interest rate
  const calculateAndSetInterest = useCallback(() => {
    if (
      (!formValue?.interest_duration && formValue?.interest_type?.value === "1") ||
      (!formValue?.interest_upto && formValue?.interest_type?.value === "2") ||
      !formValue?.interest_rate ||
      !formValue?.interest_type
    ) {
      return;
    }

    const balance = parseFloat(formValue?.net_price || 0);
    const interestRate = parseFloat(formValue?.interest_rate || 0) / 100;
    const interestType = formValue?.interest_type?.value;
    
    let interestAmount = 0;
    let dailyBreakdown = [];

    // For first-time calculation when selecting duration with compound interest,
    // return 0 interest since no time has passed yet
    if (interestType === "1" && formValue?.interest_duration?.value !== "daily") {
      // Get today's date
      const today = moment().startOf('day');
      
      // Get the stored selection date or use today if not available
      const selectionDate = formValue?.selection_date ? moment(formValue?.selection_date).startOf('day') : today;
      
      // If this is the initial selection (same day), return 0 interest
      if (selectionDate.isSame(today)) {
        setFormValue((prev) => ({
          ...prev,
          interest_amount: "0",
          selection_date: today.format('YYYY-MM-DD')
        }));
        return;
      }
    }

    if (formValue?.interest_duration?.value === "daily") {
      if (!formValue?.interest_upto) return;

      const startDate = moment();
      const endDate = moment(formValue.interest_upto);
      
      // Validate that end date is after start date
      if (endDate.isSameOrBefore(startDate)) {
        setFormValue((prev) => ({
          ...prev,
          interest_amount: "0",
          dailyBreakdown: []
        }));
        return;
      }
      
      const totalDays = endDate.diff(startDate, 'days');
      
      // Daily interest rate (2% per month / 30 days)
      const dailyRate = interestRate / 30;
      
      let runningTotal = balance;
      
      // Calculate compound interest for each day
      for (let day = 1; day <= totalDays; day++) {
        const dailyInterest = runningTotal * dailyRate;
        runningTotal += dailyInterest;
        
        dailyBreakdown.push({
          day: day,
          date: moment(startDate).add(day, 'days').format('DD MMM YYYY'),
          principal: runningTotal - dailyInterest,
          interest: dailyInterest,
          total: runningTotal
        });
      }
      
      interestAmount = runningTotal - balance;
      
    } else if (interestType === "2") {
      // Flat interest calculation based on selected date
      if (!formValue?.interest_upto) return;
      
      const startDate = moment();
      const endDate = moment(formValue.interest_upto);
      
      // Validate that end date is after start date
      if (endDate.isSameOrBefore(startDate)) {
        setFormValue((prev) => ({
          ...prev,
          interest_amount: "0"
        }));
        return;
      }
      
      const yearsDecimal = endDate.diff(startDate, 'days') / 365; // Calculate years as decimal
      
      // Calculate interest: Loan by valuation x interest % x time period in years
      const loanByValuation = (Number(formValue?.net_price || 0) * Number(formValue?.loan_percentage || 0)) / 100;
      interestAmount = loanByValuation * interestRate * yearsDecimal;
      
    } else if (interestType === "1") {
      // Compound interest calculation - yearly compounding
      // Following the example: 
      // Principal ₹40,500 at 2% p.a.
      // Year 1: ₹40,500 × 2% = ₹810 → New Principal: ₹41,310
      // Year 2: ₹41,310 × 2% = ₹826.20 → Total Repayable: ₹42,136.20
      
      const durationInMonths = parseInt(formValue?.interest_duration?.value || "12");
      const years = durationInMonths / 12; // Convert months to years
      
      let currentPrincipal = balance;
      let totalInterest = 0;
      
      // Calculate compound interest for each year
      for (let i = 0; i < Math.floor(years); i++) {
        const yearlyInterest = currentPrincipal * interestRate;
        totalInterest += yearlyInterest;
        currentPrincipal += yearlyInterest;
      }
      
      // Calculate partial year interest if needed
      const remainingMonths = durationInMonths % 12;
      if (remainingMonths > 0) {
        const partialYearInterest = currentPrincipal * interestRate * (remainingMonths / 12);
        totalInterest += partialYearInterest;
      }
      
      interestAmount = totalInterest;
    }

    setFormValue((prev) => ({
      ...prev,
      interest_amount: handleDigitsFix(interestAmount),
      dailyBreakdown: dailyBreakdown
    }));
  }, [formValue]);

  // Update this to track initial selection
  const handleInterestDurationChange = useCallback((value) => {
    const today = moment().format('YYYY-MM-DD');
    handleInputChange("interest_duration", value);
    
    // Set selection date to track initial selection
    setFormValue(prev => ({
      ...prev,
      interest_duration: value,
      selection_date: today
    }));
  }, [handleInputChange]);

  // Update interest calculations when relevant values change
  React.useEffect(() => {
    calculateAndSetInterest();
  }, [
    formValue?.net_price,
    formValue?.interest_upto,
    formValue?.interest_rate,
    formValue?.interest_type,
    formValue?.interest_duration,
  ]);

  // Add this useEffect to load product groups
  React.useEffect(() => {
    dispatch(fetchProductGroups());
  }, [dispatch]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardHanlder>
        {/* Header */}
        <View className="px-4 py-3 bg-primary/10 flex-row justify-between items-center">
          <Text className="text-lg font-semibold">New Invoice</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <AntDesign name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Header Stats */}
        <View className="bg-primary/10 px-5 py-3">
          <View className="flex pt-2 flex-row justify-between">
            <View>
              <Text className="font-semibold tracking-wide">
                {handleDigitsFix(Number(formValue?.gross_weight || 0))} g
              </Text>
              <Text className="tracking-wide">Gross Weight</Text>
            </View>
            <View>
              <Text className="font-semibold tracking-wide">
                {handleDigitsFix(Number(formValue?.fine_weight || 0))} g
              </Text>
              <Text className="tracking-wide">Fine Weight</Text>
            </View>
            <View className="flex">
              <Text className="font-semibold tracking-wide">
                {handleDigitsFix(Number(formValue?.net_price || 0))}
              </Text>
              <Text className="tracking-wide">Current Balance</Text>
            </View>
          </View>
        </View>

        {/* Form Content */}
        <View className="flex-1 px-4">
          {/* Valuation */}
          <View className="pt-2.5 pb-2">
            <InputBox
              name="valuation"
              placeholder="Calculated value"
              label="Valuation"
              value={formValue?.net_price ? handleDigitsFix(formValue.net_price) : "0"}
              keyboardType="numeric"
              readOnly={true}
            />
          </View>

          {/* Total Interest field */}
          <View className="pb-2">
            <InputBox
              name="total_interest"
              placeholder="Total interest"
              label="Total Interest"
              value={formValue?.interest_amount || "0"}
              keyboardType="numeric"
              readOnly={true}
            />
          </View>

          {/* Total Amount field */}
          <View className="pb-4">
            <InputBox
              name="total_amount"
              placeholder="Total amount"
              label="Total Amount"
              value={handleDigitsFix((Number(formValue?.net_price || 0) * Number(formValue?.loan_percentage || 0)) / 100 + Number(formValue?.interest_amount || 0))}
              keyboardType="numeric"
              readOnly={true}
            />
          </View>

          {/* Product Search */}
          <View className="pt-2.5 pb-4">
            <SearchProduct
              productValue={formValue}
              setProductValue={(event) => handleInputChange("name", event?.name)}
              handleProductDetail={handleProductDetail}
            />
          </View>

          {/* HSN and Weights */}
          <View className="mb-4 flex flex-row">
            <View className="w-1/3 pr-1">
              <SelectInput
                label="HSN Name"
                name="hsn_id"
                value={formValue.hsn_id}
                placeholder="Select"
                data={productGroups.map(item => ({ 
                  label: item.name, 
                  value: item.id,
                  variation: item.variation_data 
                }))}
                onSelect={(value) => handleInputChange("hsn_id", value)}
              />
            </View>
            <View className="w-1/3 px-1">
              <InputBox
                name="gross_weight"
                placeholder="0"
                label="Gross Weight"
                value={formValue.gross_weight}
                keyboardType="numeric"
                onChange={({ value }) => handleInputChange("gross_weight", value)}
              />
            </View>
            <View className="w-1/3 pl-1">
              <InputBox
                name="tounch"
                placeholder="0 %"
                label="Tounch (in %)"
                value={formValue.tounch}
                keyboardType="numeric"
                onChange={({ value }) => handleInputChange("tounch", value)}
              />
            </View>
          </View>

          {/* Less By and Weights */}
          <View className="mb-4 flex flex-row">
            <View className="w-1/3 pr-1">
              <SelectInput
                label="Less By"
                name="less_by_type"
                value={formValue.less_by_type}
                placeholder="Select"
                data={[
                  { label: "Percentage", value: "percentage" },
                  { label: "Weight", value: "weight" },
                ]}
                onSelect={(value) => handleInputChange("less_by_type", value)}
              />
            </View>
            <View className="w-1/3 px-1">
              <InputBox
                name="less_weight"
                placeholder="0"
                label={formValue.less_by_type?.value === "percentage" ? "Less %" : "Less Weight"}
                value={formValue.less_weight}
                keyboardType="numeric"
                onChange={({ value }) => handleInputChange("less_weight", value)}
              />
            </View>
            <View className="w-1/3 pl-1">
              <InputBox
                name="net_weight"
                label="Net Weight"
                placeholder="0"
                readOnly={true}
                value={formValue.net_weight}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Fine Weight and Rate */}
          <View className="mb-4 flex flex-row">
            <View className="w-1/3 pr-1">
              <InputBox
                name="fine_weight"
                label="Fine Weight"
                placeholder="0"
                readOnly={true}
                value={formValue.fine_weight}
                keyboardType="numeric"
              />
            </View>
            <View className="w-1/3 px-1">
              {formValue?.hsn_id?.variation?.length > 0 ? (
                <SelectInput
                  label="Rate"
                  name="rate"
                  value={formValue?.rate}
                  placeholder="Select Rate"
                  data={formValue?.hsn_id?.variation?.map((item) => ({
                    label: `${item.name} ( ${item.price} )`,
                    value: item.id,
                    price: item.price,
                  }))}
                  onSelect={(value) => handleInputChange("rate", value)}
                />
              ) : (
                <InputBox
                  name="rate"
                  label="Rate"
                  placeholder="0.00"
                  readOnly={true}
                  value={formValue?.rate}
                  onChange={({ value }) => handleInputChange("rate", value)}
                  keyboardType="numeric"
                />
              )}
            </View>
            <View className="w-1/3 pl-1">
              <InputBox
                name="net_price"
                placeholder="0"
                label="Net Price"
                readOnly={true}
                value={formValue.net_price}
              />
            </View>
          </View>

          {/* Interest Section */}
          <View className="bg-primary/10 p-3 mt-4 rounded-lg">
            <View className="flex flex-row pb-4">
              <View className="w-2/3 pr-1">
                <SelectInput
                  label="Interest Type"
                  name="interest_type"
                  placeholder="Select"
                  value={formValue.interest_type}
                  data={[
                    { label: "Flat", value: "2" },
                    { label: "Compound Interest", value: "1" },
                  ]}
                  onSelect={(value) => handleInputChange("interest_type", value)}
                />
              </View>
              <View className="w-1/3 pl-1">
                <InputBox
                  name="interest_rate"
                  label="Interest (%)"
                  placeholder="0 %"
                  keyboardType="numeric"
                  value={formValue.interest_rate}
                  onChange={({ value }) => handleInputChange("interest_rate", value)}
                />
              </View>
            </View>

            {/* Interest Duration - different options based on interest type */}
            <View className="flex flex-row pb-4">
              {formValue?.interest_type?.value === "1" && (
                <View className="w-2/3 pr-1">
                  <SelectInput
                    label="Interest Duration"
                    name="interest_duration"
                    placeholder="Select Duration"
                    value={formValue.interest_duration}
                    data={[
                      { label: "1 Year", value: "12" },
                      { label: "6 Months", value: "6" },
                      { label: "3 Months", value: "3" },
                      { label: "Daily", value: "daily" },
                    ]}
                    onSelect={handleInterestDurationChange}
                  />
                </View>
              )}
              
              {formValue?.interest_type?.value === "2" && (
                <View className="w-2/3 pr-1">
                  <Text className="text-gray-6 text-xs tracking-wider pb-1">
                    Interest End Date
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleModalState("flatInterestDatePicker", true)}
                    className="items-center px-2 py-3 rounded-lg border-gray-5 border flex flex-row justify-between"
                  >
                    <Text>{formValue?.interest_upto ? moment(formValue.interest_upto).format('DD MMM YYYY') : 'Select Date'}</Text>
                    <AntDesign name="calendar" size={20} color="#666" />
                    <DatePickerComponent
                      name="interest_upto"
                      open={modalState.flatInterestDatePicker}
                      value={formValue?.interest_upto}
                      handleClose={() => handleModalState("flatInterestDatePicker", false)}
                      onSelect={({ value }) => {
                        handleInputChange("interest_upto", value);
                        handleModalState("flatInterestDatePicker", false);
                      }}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Flat Interest Calculation Summary */}
            {formValue?.interest_type?.value === "2" && formValue?.interest_upto && (
              <View className="bg-gray-50 p-3 mb-4 rounded-lg">
                <View className="flex flex-row justify-between items-center">
                  <View>
                    <Text className="text-sm text-gray-600">Flat Interest Calculation</Text>
                    <Text className="text-xs text-gray-500">
                      {moment().format('DD MMM YYYY')} to {moment(formValue.interest_upto).format('DD MMM YYYY')}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-sm font-semibold text-primary">
                      {Math.max(0, moment(formValue.interest_upto).diff(moment(), 'days'))} days
                    </Text>
                  </View>
                </View>
                <View className="mt-2">
                  <Text className="text-xs text-gray-500">
                    Loan by Valuation: ₹{handleDigitsFix((Number(formValue?.net_price || 0) * Number(formValue?.loan_percentage || 0)) / 100)}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Interest Rate: {formValue?.interest_rate}%
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Time Period: {(moment(formValue.interest_upto).diff(moment(), 'days') / 365).toFixed(2)} years
                  </Text>
                  <Text className="text-xs font-bold text-gray-600 mt-1">
                    Formula: Loan by Valuation × Interest Rate × Time Period
                  </Text>
                </View>
              </View>
            )}

            {/* Timer Section */}
            {formValue?.interest_type?.value === "1" && formValue?.interest_duration?.value !== "daily" && (
              <View className="bg-gray-50 p-3 mb-4 rounded-lg">
                <View className="flex flex-row justify-between items-center">
                  <View>
                    <Text className="text-sm text-gray-600">Next Interest Calculation</Text>
                    <Text className="text-xs text-gray-500">
                      {moment().add(parseInt(formValue?.interest_duration?.value), 'months').format('DD MMM YYYY')}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-sm font-semibold text-primary">
                      {Math.max(0, moment().add(parseInt(formValue?.interest_duration?.value), 'months').diff(moment(), 'days'))} days remaining
                    </Text>
                  </View>
                </View>
                <View className="mt-2">
                  <Text className="text-xs text-gray-500">
                    Principal Amount: ₹{handleDigitsFix(Number(formValue?.net_price || 0))}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Loan by Valuation: ₹{handleDigitsFix((Number(formValue?.net_price || 0) * Number(formValue?.loan_percentage || 0)) / 100)}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Current Total: ₹{handleDigitsFix(Number(formValue?.net_price || 0) + Number(formValue?.interest_amount || 0))}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Next Interest ({formValue?.interest_rate}%): ₹{handleDigitsFix((Number(formValue?.net_price || 0) * Number(formValue?.loan_percentage || 0) / 100) * (Number(formValue?.interest_rate || 0) / 100))}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Duration: {formValue?.interest_duration?.label}
                  </Text>
                </View>
              </View>
            )}

            {/* Daily Interest Breakdown */}
            {formValue?.interest_type?.value === "1" && 
             formValue?.interest_duration?.value === "daily" && 
             formValue?.interest_upto && (
              <View className="bg-gray-50 p-3 mb-4 rounded-lg">
                <Text className="text-sm font-semibold text-gray-600 mb-2">Daily Interest Breakdown</Text>
                <View className="max-h-40 overflow-scroll">
                  {formValue?.dailyBreakdown?.map((day, index) => (
                    <View key={index} className="flex flex-row justify-between py-1 border-b border-gray-200">
                      <Text className="text-xs text-gray-500">{day.date}</Text>
                      <View>
                        <Text className="text-xs text-gray-500">
                          Principal: ₹{handleDigitsFix(day.principal)}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          Interest: +₹{handleDigitsFix(day.interest)}
                        </Text>
                        <Text className="text-xs font-semibold text-gray-600">
                          Total: ₹{handleDigitsFix(day.total)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Compound Interest Calculation Example */}
            {formValue?.interest_type?.value === "1" && 
            formValue?.interest_duration?.value !== "daily" && 
            formValue?.interest_amount !== "0" && (
              <View className="bg-gray-50 p-3 mb-4 rounded-lg">
                <Text className="text-sm font-semibold text-gray-600 mb-2">Compound Interest Example</Text>
                <Text className="text-xs text-gray-500">Loan by Valuation: ₹{handleDigitsFix((Number(formValue?.net_price || 0) * Number(formValue?.loan_percentage || 0)) / 100)}</Text>
                <Text className="text-xs text-gray-500">Interest Rate: {formValue?.interest_rate}% per annum</Text>
                <Text className="text-xs text-gray-500">Duration: {formValue?.interest_duration?.label}</Text>
                
                <View className="mt-2 border-t border-gray-200 pt-2">
                  <Text className="text-xs text-gray-500">Step-by-step calculation:</Text>
                  <Text className="text-xs text-gray-500">
                    • Principal: ₹{handleDigitsFix((Number(formValue?.net_price || 0) * Number(formValue?.loan_percentage || 0)) / 100)}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    • Year 1: ₹{handleDigitsFix((Number(formValue?.net_price || 0) * Number(formValue?.loan_percentage || 0)) / 100)} × {formValue?.interest_rate}% = ₹{handleDigitsFix(((Number(formValue?.net_price || 0) * Number(formValue?.loan_percentage || 0)) / 100) * (Number(formValue?.interest_rate || 0) / 100))} interest
                  </Text>
                  <Text className="text-xs text-gray-500">
                    • New Principal: ₹{handleDigitsFix((Number(formValue?.net_price || 0) * Number(formValue?.loan_percentage || 0)) / 100 + ((Number(formValue?.net_price || 0) * Number(formValue?.loan_percentage || 0)) / 100) * (Number(formValue?.interest_rate || 0) / 100))}
                  </Text>
                  {parseInt(formValue?.interest_duration?.value || "12") > 12 && (
                    <Text className="text-xs text-gray-500">
                      • Year 2: ₹{handleDigitsFix((Number(formValue?.net_price || 0) * Number(formValue?.loan_percentage || 0)) / 100 + ((Number(formValue?.net_price || 0) * Number(formValue?.loan_percentage || 0)) / 100) * (Number(formValue?.interest_rate || 0) / 100))} × {formValue?.interest_rate}% = ₹{handleDigitsFix(((Number(formValue?.net_price || 0) * Number(formValue?.loan_percentage || 0)) / 100 + ((Number(formValue?.net_price || 0) * Number(formValue?.loan_percentage || 0)) / 100) * (Number(formValue?.interest_rate || 0) / 100)) * (Number(formValue?.interest_rate || 0) / 100))} interest
                </Text>
                  )}
                </View>
                
                <View className="mt-2 border-t border-gray-200 pt-2">
                  <Text className="text-xs font-semibold">Total interest: ₹{formValue?.interest_amount}</Text>
                  <Text className="text-xs font-semibold">Total repayable: ₹{handleDigitsFix((Number(formValue?.net_price || 0) * Number(formValue?.loan_percentage || 0)) / 100 + Number(formValue?.interest_amount || 0))}</Text>
                </View>
              </View>
            )}

            <View className="flex-row">
              {formValue?.interest_duration?.value === "daily" && formValue?.interest_type?.value === "1" && (
              <View className="w-1/3 pr-1">
                <Text className="text-gray-6 text-xs tracking-wider pb-1">
                  Interest Upto
                </Text>
                <TouchableOpacity
                  onPress={() => handleModalState("datePicker", true)}
                  className="items-center px-2 py-3 rounded-lg border-gray-5 border flex flex-row justify-between"
                >
                  <Text>{formValue?.interest_upto ? moment(formValue.interest_upto).format('DD MMM YYYY') : 'Select Date'}</Text>
                  <DatePickerComponent
                    name="interest_upto"
                    open={modalState.datePicker}
                    value={formValue?.interest_upto}
                    handleClose={() => handleModalState("datePicker", false)}
                    onSelect={({ value }) => {
                      handleInputChange("interest_upto", value);
                      handleModalState("datePicker", false);
                    }}
                  />
                </TouchableOpacity>
              </View>
              )}
              <View className={`${formValue?.interest_duration?.value === "daily" && formValue?.interest_type?.value === "1" ? 'w-1/3 px-1' : 'w-1/2 pr-1'}`}>
                <InputBox
                  name="interest_amount"
                  label="Interest Amount"
                  placeholder="0.00"
                  value={formValue?.interest_amount}
                  readOnly={true}
                />
              </View>
              <View className={`${formValue?.interest_duration?.value === "daily" && formValue?.interest_type?.value === "1" ? 'w-1/3 pl-1' : 'w-1/2 pl-1'}`}>
                <InputBox
                  name="loan_amount"
                  label="Loan Amount"
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={formValue?.loan_amount}
                  onChange={({ value }) => handleInputChange("loan_amount", value)}
                />
                
                <View className="mt-2">
                  <InputBox
                    name="loan_percentage"
                    label="Loan Percentage (%)"
                    placeholder="0%"
                    keyboardType="numeric"
                    value={formValue?.loan_percentage}
                    onChange={({ value }) => handleInputChange("loan_percentage", value)}
                  />
                  <InputBox
                    name="loan_by_valuation"
                    label="Loan Amount by Valuation"
                    placeholder="0.00"
                    readOnly={true}
                    value={handleDigitsFix(
                      (Number(formValue?.valuation || 0) * Number(formValue?.loan_percentage || 0)) / 100
                    )}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Save Button */}
          <View className="px-4 pt-4">
            <CommonButton
              onPress={() => onSave(formValue)}
              title="Save Invoice"
            />
          </View>
        </View>
      </KeyboardHanlder>
    </SafeAreaView>
  );
};

export default SingleInvoiceForm; 