import { ToastAndroid } from "react-native";

const ShowToast = (message) => {
  ToastAndroid.showWithGravityAndOffset(
    message,
    ToastAndroid.LONG,
    ToastAndroid.BOTTOM,
    25,
    50
  );
};

export default ShowToast;
