import TopBar from "./components/TopBar";
import BottomBar from "../../components/BottomBar";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  Alert,
  BackHandler,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Orders from "./tabScreens/Orders";
import Dashboard from "./tabScreens/Dashboard";
import Repairing from "./tabScreens/Repairing";
import Invoices from "./tabScreens/Invoices";
import { TabView, SceneMap } from "react-native-tab-view";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchContactList,
  fetcheProfileDetails,
} from "@/src/redux/actions/user.action";
import LoanTabScreen from "./tabScreens/Loan";
import {
  fetchHomeInvoiceList,
  fetchHomeLoanList,
} from "@/src/redux/actions/home.action";
import Allocation from "./tabScreens/Allocation";

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const layout = Dimensions.get("window");
  const [index, setIndex] = useState(1);
  const { contacts } = useSelector((state) => state.userSlices);
  const { homeLoanList, homeInvoiceList } = useSelector(
    (state) => state.homeSlices
  );

  const [routes] = useState([
    { title: <AntDesign name="home" color="white" size={20} />, key: "home" },
    { title: "Invoices", key: "invoices" },
    { title: "Loan", key: "loan" },
    { title: "Orders", key: "orders" },
    { title: "Repairing", key: "repairing" },
    { title: "Allocation", key: "allocation" },
  ]);

  const renderScene = SceneMap({
    invoices: () => <Invoices data={homeInvoiceList} navigation={navigation} />,
    orders: () => <Orders navigation={navigation} />,
    home: () => <Dashboard navigation={navigation} />,
    repairing: () => <Repairing navigation={navigation} />,
    loan: () => <LoanTabScreen navigation={navigation} data={homeLoanList} />,
    allocation: () => <Allocation navigation={navigation} />,
  });

  const renderTabBar = (props) => (
    <View className="bg-primary flex-row justify-around items-center">
      {props.navigationState.routes.map((route, i) => (
        <TouchableOpacity
          key={route.key}
          className={`p-2 border-b-4 items-center ${
            index === i ? " border-orange-400" : "border-primary"
          }`}
          onPress={() => setIndex(i)}
        >
          <Text
            className={`uppercase text-[15px] font-medium tracking-wider ${
              index === i ? "text-white" : "text-gray-4"
            }`}
          >
            {route.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        Alert.alert("Hold on!", "Are you sure you want to exit the app?", [
          {
            text: "Cancel",
            onPress: () => null,
            style: "cancel",
          },
          { text: "YES", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      // Add event listener for back button press on Android
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      // Clean up the event listener when the component is unfocused
      return () => backHandler.remove();
    }, [])
  );

  useEffect(() => {
    dispatch(fetchContactList());
    dispatch(fetchHomeLoanList());
    dispatch(fetchHomeInvoiceList());
    dispatch(fetcheProfileDetails());
  }, [dispatch]);

  return (
    <Fragment>
      <TopBar navigation={navigation} />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
      />
      <BottomBar navigation={navigation} />
    </Fragment>
  );
};

export default HomeScreen;
