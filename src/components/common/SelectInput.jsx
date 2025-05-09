import React, { Fragment, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import Entypo from "@expo/vector-icons/Entypo";

const SelectInput = ({
  data,
  placeholder,
  value,
  onSelect,
  error,
  label,
  required,
  disabled,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const handleSelect = (item) => {
    onSelect(item.value == "" ? null : item); // Trigger parent callback
    setIsModalVisible(false); // Close modal after selection
  };

  return (
    <Fragment>
      {label && (
        <View className="flex flex-row items-center gap-1 pb-1 pl-0.5">
          {/* label */}
          <Text className=" text-gray-6 tracking-wider text-xs">{label}</Text>
          {/* required */}
          {required && <Text className="text-red-600 text-base">*</Text>}
        </View>
      )}
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={disabled}
        className={`border flex-row flex items-center justify-between ${
          error ? "border-red-600" : "border-gray-5"
        } ${disabled && "border-gray-3"} px-3 rounded-lg py-1.5`}
        onPress={() => !disabled && setIsModalVisible(true)}
      >
        <Text
          className={`capitalize ${
            disabled && "text-gray-5"
          } max-w-[88%] text-xs w-full py-1.5`}
        >
          {value ? value.label : placeholder}
        </Text>
        <Entypo
          name={isModalVisible ? "chevron-up" : "chevron-down"}
          className="text-gray-5 pl-1 font-bold"
          size={18}
        />
      </TouchableOpacity>

      {/* error */}
      {error && (
        <Text className="p-2 text-xs text-red-600 tracking-wide font-medium">
          {error}
        </Text>
      )}

      {/* Options */}
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay} className="">
          <View style={styles.modalContent} className="rounded-md">
            <FlatList
              data={data}
              keyExtractor={(item) =>
                typeof item.value == "number"
                  ? item.value
                  : item.value.toString()
              }
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelect(item)}>
                  <Text
                    className={`${
                      value?.value == item.value
                        ? "bg-primary/70 text-white"
                        : "text-primary"
                    } capitalize text-base py-3 px-4`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text className="py-10 text-center border-t border-gray-3 bg-white-1 tracking-wider rounded-t-md">
                  No Options Here
                </Text>
              }
            />

            {/* Cancel button */}
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => setIsModalVisible(false)}
            >
              <Text className="py-3 text-center border-t border-red-100 bg-red-100 uppercase tracking-wider rounded-b-md">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  selectInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    justifyContent: "center",
  },
  selectedText: {
    fontSize: 16,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    maxHeight: "50%",
  },
  optionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  optionText: {
    fontSize: 16,
  },
  closeButton: {
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default SelectInput;
