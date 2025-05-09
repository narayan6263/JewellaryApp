import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";

const DatePickerComponent = ({
  name = "",
  value = null,
  onSelect,
  maxDate,
}) => {
  // Allow dates up to 10 years in future
  const maximumDate = moment().add(10, 'years').toDate();
  
  // Parse initial date safely
  const initialDate = value ? moment(value).toDate() : new Date();
  const [date, setDate] = useState(initialDate);
  const [showPicker, setShowPicker] = useState(false);

  const onChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      const newDate = moment(selectedDate).toDate();
      setDate(newDate);
      onSelect({ 
        name, 
        value: moment(newDate).format("YYYY-MM-DD")
      });
    }
  };

  // Format using moment.js
  const formattedDate = moment(date).format("DD MMM YYYY");

  return (
    <View>
      <TouchableOpacity onPress={() => setShowPicker(true)}>
        <Text className="text-gray-600 text-sm font-medium">
          {formattedDate}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
          maximumDate={maximumDate} // Now allows dates up to 10 years in future
        />
      )}
    </View>
  );
};

export default DatePickerComponent;
