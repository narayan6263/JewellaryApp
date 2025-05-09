import ShowToast from "../components/common/ShowToast";
import AsyncStorage from "@react-native-async-storage/async-storage";

// all payments method
export const allPaymentMethod = [
  { name: "Cash" },
  { name: "Cheque" },
  { name: "Credit-Card" },
  { name: "Debit-Card" },
  { name: "Net-Banking" },
  { name: "E-Wallet" },
  { name: "UPI" },
];

// remove empty value
export const removeEmptyValues = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value != null && value !== "" && value.lenght > 0
    )
  );
};

// handle logout
export const handleLogout = (callback) => {
  AsyncStorage.clear();
  ShowToast("Logout successfully");
  callback && callback();
  return;
};

// making types list
export const makingTypes = [
  { label: "Per Gram", value: "PG" },
  { label: "Per Piece", value: "PP" },
];

// handle digits fix
export const handleDigitsFix = (amount = 0) => {
  return Number(amount).toFixed(2);
};
