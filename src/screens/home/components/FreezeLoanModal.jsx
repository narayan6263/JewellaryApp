import React, { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import OverlayModal from "@/src/components/common/OverlayModal";
import InputBox from "@/src/components/common/InputBox";
import { Text, View } from "react-native";
import SelectInput from "@/src/components/common/SelectInput";
import DatePickerComponent from "@/src/components/common/DateTimePicker";
import { freezeLoan, fetchLoansDetails, fetchContactLoanList, fetchIntrestTillToday } from "@/src/redux/actions/loan.action";
import moment from "moment";
import ShowToast from "@/src/components/common/ShowToast";
import ToggleSwitch from "@/src/components/common/ToggleSwicth";

const FreezeLoanModal = ({ loanData, currentDate, onDateChange, onSubmitSuccess, ...props }) => {
  const dispatch = useDispatch();
  const [formValue, setFormValue] = useState({
    is_freeze: false,
    new_amount_type: { label: "Given", value: "1" },
    to_date: currentDate || moment().format('YYYY-MM-DD')
  });
  const [interestDetails, setInterestDetails] = useState(null);

  // Fetch latest interest details when date changes
  useEffect(() => {
    if (loanData?.id && formValue.to_date) {
      dispatch(fetchIntrestTillToday(loanData.id))
        .unwrap()
        .then((response) => {
          setInterestDetails(response);
        })
        .catch((error) => {
          ShowToast("Failed to fetch interest details");
          console.error("Error fetching interest:", error);
        });
    }
  }, [loanData?.id, formValue.to_date]);

  // handle input change
  const handleInputChange = useCallback((name, value) => {
    setFormValue(prev => ({ ...prev, [name]: value }));
  }, []);

  // handle submit
  const handleSubmit = () => {
    if (!formValue.new_amount) {
      ShowToast("Please enter new amount");
      return;
    }
    
    if (!formValue.new_amount_type) {
      ShowToast("Please select amount type");
      return;
    }
    
    ShowToast("Freezing loan...");
    
    const callback = () => {
      ShowToast("Loan frozen successfully!");
      setFormValue({});
      props.onClose();
      
      // Refresh loan details after successful freeze
      dispatch(fetchLoansDetails(loanData.id));
      // Also refresh the loans list to show updated data
      if (loanData.customer_id) {
        dispatch(fetchContactLoanList(loanData.customer_id));
      }
    };

    const payload = {
      loan_id: loanData.id,
      new_amount: formValue.new_amount,
      new_amount_type: formValue?.new_amount_type?.value,
      to_date: formValue.to_date || currentDate,
      is_freeze: formValue.is_freeze ? 1 : 0
    };
    
    dispatch(freezeLoan({ payload, callback }));
  };

  // When date changes
  const handleModalDateChange = (date) => {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    setFormValue(prev => ({ ...prev, to_date: formattedDate }));
    if (onDateChange) {
      onDateChange(formattedDate);
    }
  };

  return (
    <OverlayModal {...props} onSubmit={handleSubmit} heading="Freeze Loan">
      {/* Interest Till Today Section */}
      <View className="bg-primary/10 p-3 mb-4 rounded-lg">
        <Text className="font-semibold pb-2">Current Interest Period</Text>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">
            Interest from {loanData?.interest_upto ? moment(loanData.interest_upto).format('DD MMM YYYY') : 'N/A'} to
          </Text>
          <DatePickerComponent
            name="to_date"
            value={formValue.to_date}
            onSelect={({ value }) => {
              handleModalDateChange(value);
            }}
          />
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600">Interest Amount</Text>
          <Text className="font-semibold">₹{interestDetails?.interest_amount || "0.00"}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600">On Amount</Text>
          <Text className="font-semibold">₹{loanData?.valuation_amount || "0.00"}</Text>
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
            keyboardType="numeric"
          />
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
          />
        </View>
      </View>

      {/* Total New Base Amount */}
      <View className="mb-4">
        <InputBox
          name="current_base_amount"
          label="New Base Amount (After Interest & New Loan)"
          placeholder="0.00"
          value={interestDetails?.new_base_amount || "0.00"}
          readOnly={true}
        />
      </View>

      {/* Final Total */}
      <View className="mt-4 bg-primary/10 p-3 rounded-lg">
        <Text className="font-semibold pb-2">Total After Freezing</Text>
        <Text className="font-semibold text-lg">₹{interestDetails?.total_amount || "0.00"}</Text>
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