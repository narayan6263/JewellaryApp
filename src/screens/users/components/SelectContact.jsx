import React, { useEffect, useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  StyleSheet,
} from "react-native";
import { fetchContactList } from "@/src/redux/actions/user.action";
import { useDispatch, useSelector } from "react-redux";
import InputBox from "@/src/components/common/InputBox";
import { ShowToast } from "../../../components/common/ShowToast";

const SelectContact = ({ invoiceHandler, info, updateContactInfo }) => {
  const { formValue, setFormValue, handleInputChange: handleInputChangeHandler, invoiceType } =
    invoiceHandler;
  const label =
    invoiceType == "loan"
      ? "Contact Name"
      : invoiceType == "sale"
      ? "Buyer Name"
      : "Seller Name";
  const dispatch = useDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
  const { contacts = [] } = useSelector((state) => state.userSlices || {});

  // Fetch contacts on mount
  useEffect(() => {
    dispatch(fetchContactList());
  }, [dispatch]);

  // Handle contact selection
  const selectContact = (contact) => {
    if (!contact || !contact.id) {
      ShowToast("Invalid contact selected");
      return;
    }

    const updatedFormValue = {
      ...formValue,
      costumer_name: contact.name,
      user_contact_id: contact.id
    };

    setFormValue(updatedFormValue);
    
    if (typeof updateContactInfo === 'function') {
      updateContactInfo(contact);
    }
    
    setShowDropdown(false);
  };

  const filteredContacts = contacts?.filter((contact) =>
    contact.name.toLowerCase().includes(formValue?.costumer_name?.toLowerCase())
  );

  return (
    <View className="relative mb-3">
      {/* contact name input */}
      <View style={styles.inputWrapper}>
        <InputBox
          name="costumer_name"
          label={label}
          value={formValue?.costumer_name || ""}
          onChange={({ value, name }) => {
            setShowDropdown(value?.length > 0);
            handleInputChangeHandler({ 
              value: value || "", 
              name: "costumer_name" 
            });
          }}
        />
      </View>

      {/* Dropdown Modal */}
      {showDropdown && (
        <View style={styles.dropdown}>
          <FlatList
            data={filteredContacts}
            nestedScrollEnabled={true}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => selectContact(item)}
                style={styles.dropdownItem}
              >
                <Text style={styles.contactName}>{item.name}</Text>
                <Text style={styles.contactNumber}>
                  {item.phone || "No Number"}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  relative: { position: "relative" },
  title: { fontSize: 16, fontWeight: "500" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: { flex: 1, paddingVertical: 6 },
  iconWrapper: { flexDirection: "row", gap: 10 },
  dropdown: {
    position: "absolute",
    top: 63,
    width: "100%",
    backgroundColor: "#fff",
    maxHeight: 400,
    elevation: 5,
    zIndex: 50,
  },
  dropdownItem: { padding: 12 },
  contactName: { fontSize: 16, fontWeight: "400" },
  contactNumber: { fontSize: 14, color: "#6b7280" },
});

export default SelectContact;
