import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";

const DatePickerComponent = ({
  name = "",
  value = null,
  onSelect,
  open = false,
  handleClose
}) => {
  // Parse initial date safely
  const initialDate = value ? moment(value).toDate() : new Date();
  const [date, setDate] = useState(initialDate);
  const maximumDate = moment().add(10, 'years').toDate();

  const onChange = (event, selectedDate) => {
    if (selectedDate) {
      const newDate = moment(selectedDate).toDate();
      setDate(newDate);
      onSelect({ 
        name, 
        value: moment(newDate).format("YYYY-MM-DD")
      });
    }
    handleClose();
  };

  // Format using moment.js
  const formattedDate = moment(date).format("DD MMM YYYY");

  return (
    <View>
      {open && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
};

export default DatePickerComponent;
