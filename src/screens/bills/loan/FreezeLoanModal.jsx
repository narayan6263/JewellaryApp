import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import OverlayModal from "@/src/components/common/OverlayModal";
import InputBox from "@/src/components/common/InputBox";
import { Text, TouchableOpacity, View } from "react-native";
import SimpleReactValidator from "simple-react-validator";
import SelectInput from "@/src/components/common/SelectInput";
import DatePickerComponent from "@/src/components/common/DateTimePicker";
import { freezeLoan, fetchLoansDetails } from "@/src/redux/actions/loan.action";
import moment from "moment";
import ShowToast from "@/src/components/common/ShowToast";
import { handleDigitsFix } from "@/src/utils";
import ToggleSwitch from "@/src/components/common/ToggleSwicth";
import { updateUptoDate } from '@/src/redux/reducers/loan.reducer';
import { MANAGE_LOAN_API, MANAGE_LOGS_API } from "@/src/utils/api/endpoints";
import { validateFreezeLoan } from "@/src/utils/validators/loanValidators";
import { ApiRequest } from "@/src/utils/api";

const FreezeLoanModal = ({ loanData, onDateUpdate, ...props }) => {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const validator = new SimpleReactValidator();
  const [formValue, setFormValue] = useState({
    is_freeze: false,
    interest_periods: [],
    new_amount_type: { label: "Given", value: "1" },
    to_date: moment().format('YYYY-MM-DD') // Initialize with today
  });

  // handle input change
  const handleInputChange = useCallback((name, value) => {
    console.log(`Input changed: ${name} = ${value}`);
    setFormValue(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  }, []);

  // Real-time interest calculation
  const calculateInterest = useCallback(() => {
    try {
      const baseAmount = Number(loanData?.loan_amount || 0);
      const interestRate = parseFloat(loanData?.interest_rate || 0);
      
      const startDate = moment(loanData?.interest_upto);
      const endDate = moment(formValue.to_date);
      
      // Calculate exact days between dates (inclusive)
      const days = endDate.diff(startDate, 'days') + 1;
      
      // Daily interest calculation
      const dailyRate = (interestRate / 100) / 365;
      const interest = baseAmount * dailyRate * days;
      
      const amountChange = formValue?.new_amount 
        ? (formValue.new_amount_type?.value === "1" 
          ? Number(formValue.new_amount) 
          : -Number(formValue.new_amount))
        : 0;
      
      const newBaseAmount = baseAmount + interest + amountChange;

      setFormValue(prev => ({
        ...prev,
        current_period_interest: handleDigitsFix(interest),
        current_base_amount: handleDigitsFix(newBaseAmount),
        total_amount: handleDigitsFix(newBaseAmount)
      }));

    } catch (error) {
      console.error("Interest calculation error:", error);
    }
  }, [formValue.to_date, formValue.new_amount, formValue.new_amount_type, loanData]);

  // Recalculate on any relevant change
  useEffect(() => {
    calculateInterest();
  }, [calculateInterest]);

  // handle submit
  const handleSubmit = () => {
    // Calculate the current interest period information
    const currentPeriodInterest = {
      interest_upto: moment().format('YYYY-MM-DD'),
      base_amount: Number(loanData.loan_amount),
      interest_amount: Number(formValue.current_period_interest),
      interest_rate: Number(loanData.interest_rate)
    };
    
    // Parse and prepare interest periods data
    let existingPeriods = [];
    try {
      console.log("Existing loan data periods:", loanData.interest_periods);
      if (loanData.interest_periods) {
        if (Array.isArray(loanData.interest_periods)) {
          existingPeriods = loanData.interest_periods;
        } else if (typeof loanData.interest_periods === 'string') {
          existingPeriods = JSON.parse(loanData.interest_periods || '[]');
        }
      }
      console.log("Parsed existing periods:", existingPeriods);
    } catch (e) {
      console.error("Error parsing interest periods:", e);
      existingPeriods = [];
    }
    
    // Add current period to periods array
    const updatedPeriods = [...existingPeriods, currentPeriodInterest];
    console.log("Updated interest periods:", updatedPeriods);
    
    const payload = {
      loan_id: loanData.id,
      new_amount: formValue.new_amount,
      new_amount_type: formValue?.new_amount_type?.value,
      interest_upto: formValue.to_date,
      current_period_interest: formValue.current_period_interest,
      new_base_amount: formValue.current_base_amount,
      is_freeze: formValue.is_freeze ? 1 : 0,
      interest_periods: JSON.stringify(updatedPeriods),
      interest_amount: formValue.current_period_interest || "0",
      interest_till_amount: formValue.current_period_interest || "0",
      interest_till_date: formValue.to_date
    };
    
    // Validate the form data
    const validationResult = validateFreezeLoan(payload);
    if (!validationResult.isValid) {
      // Show validation errors
      const errorMessages = Object.values(validationResult.errors);
      ShowToast(errorMessages[0]); // Show the first error
      return;
    }
    
    ShowToast("Freezing loan...");
    
    const callback = () => {
      // Create log entry for the loan freeze action
      createLoanFreezeLog(payload);
      
      ShowToast("Loan frozen successfully!");
      setFormValue({});
      props.onClose();
      
      // Refresh loan details after successful freeze
      dispatch(fetchLoansDetails(loanData.id));
      
      // Call onFreezeSuccess callback if provided with updated loan data
      if (props.onFreezeSuccess) {
        // Create updated loan object with new interest period
        const updatedLoan = {
          ...loanData,
          interest_upto: formValue.to_date,
          interest_amount: handleDigitsFix(Number(loanData.interest_amount || 0) + Number(formValue.current_period_interest || 0)),
          valuation_amount: formValue.current_base_amount,
          interest_periods: updatedPeriods
        };
        props.onFreezeSuccess(updatedLoan);
      }
    };
    
    console.log("Dispatching payload with interest_upto:", payload.interest_upto);
    dispatch(freezeLoan({ payload, callback }));
  };

  // Create log entry for loan freeze
  const createLoanFreezeLog = async (payloadData) => {
    try {
      const currentUser = useSelector(state => state.auth.user) || { name: "User" };
      
      const logPayload = {
        userName: currentUser.name,
        id: loanData.id.toString(),
        type: "loan",
        amount: payloadData.new_base_amount,
        action: "FREEZE",
        entityType: "LOAN",
        timestamp: new Date().toISOString(),
        metadata: {
          customerName: loanData.customer_name,
          status: "Frozen",
          interestRate: loanData.interest_rate,
          interestAmount: payloadData.current_period_interest,
          previousAmount: loanData.valuation_amount,
          interestPeriod: `${loanData.interest_upto} to ${payloadData.interest_upto}`
        }
      };
      
      // Make API request to create log
      const response = await ApiRequest({
        url: MANAGE_LOGS_API.create,
        method: 'POST',
        data: logPayload
      });
      
      if (!response.success) {
        console.error("Failed to create loan freeze log:", response.message);
      }
    } catch (error) {
      console.error("Error creating loan freeze log:", error);
    }
  };

  // When date changes
  const handleDateChange = (date) => {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    // Update both local and parent state
    setFormValue(prev => ({ ...prev, to_date: formattedDate }));
    props.onDateChange(formattedDate); // Immediate parent update
  };

  return (
    <OverlayModal {...props} onSubmit={handleSubmit} heading="Freeze Loan">
      {/* Interest Till Today Section */}
      <View className="bg-primary/10 p-3 mb-4 rounded-lg">
        <Text className="font-semibold pb-2">Current Interest Period</Text>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Interest from {loanData?.interest_upto} to</Text>
          <DatePickerComponent
            name="to_date"
            value={props.currentDate}
            onSelect={({ value }) => {
              const formattedDate = moment(value).format('YYYY-MM-DD');
              props.onDateChange(formattedDate);
              handleDateChange(value);
            }}
          />
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Interest Amount</Text>
          <Text className="font-semibold">₹{formValue?.current_period_interest || "0.00"}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">On Amount</Text>
          <Text className="font-semibold">₹{loanData?.loan_amount || "0.00"}</Text>
        </View>
      </View>
      
      {/* amount & amount type */}
      <View className="flex flex-row mb-3">
        {/* new_amount */}
        <View className="w-1/2 pr-1">
          <InputBox
            name="new_amount"
            placeholder="0"
            label="New Amount"
            value={formValue?.new_amount}
            onChange={({ value }) => handleInputChange("new_amount", value)}
            error={errors?.new_amount}
            keyboardType="numeric"
          />
          {validator.message("new_amount", formValue?.new_amount, "required")}
        </View>
        {/* amount type  */}
        <View className="pl-1 w-1/2">
          <SelectInput
            label="Amount Type"
            name="new_amount_type"
            placeholder="Select"
            value={formValue?.new_amount_type}
            data={[
              { label: "Given", value: "1" },
              { label: "Received", value: "2" },
            ]}
            onSelect={(value) => handleInputChange("new_amount_type", value)}
            error={errors?.new_amount_type}
          />
          {validator.message(
            "new_amount_type",
            formValue?.new_amount_type,
            "required"
          )}
        </View>
      </View>

      {/* Total New Base Amount */}
      <View className="mb-4">
        <InputBox
          name="current_base_amount"
          label="New Base Amount (After Interest & New Loan)"
          placeholder="0.00"
          value={formValue?.current_base_amount}
          readOnly={true}
        />
      </View>

      {/* Final Total */}
      <View className="mt-4 bg-primary/10 p-3 rounded-lg">
        <Text className="font-semibold pb-2">Total After Freezing</Text>
        <Text className="font-semibold text-lg">₹{formValue?.total_amount || "0.00"}</Text>
      </View>

      <View className="flex pt-3 px-1 pb-1 flex-row items-center justify-between">
        <Text className="tracking-wider">
          Do you want to freeze this loan?
        </Text>
        <ToggleSwitch
          value={formValue?.is_freeze}
          name="is_freeze"
          onChange={(name, value) => handleInputChange(name, value)}
        />
      </View>
    </OverlayModal>
  );
};

export default FreezeLoanModal;
