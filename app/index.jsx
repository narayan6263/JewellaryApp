import "../global.css";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "../src/redux/store";
import { StatusBar } from "expo-status-bar";
import Navigations from "../src/Navigations";
import {
  setStatusBarStyle,
  setStatusBarBackgroundColor,
} from "expo-status-bar";
import { GroupProvider } from "../src/screens/groups/GroupsScreen";

const App = () => {
  useEffect(() => {
    setStatusBarStyle("light");
    setStatusBarBackgroundColor("#5750F1", false);
  }, []);

  return (
    <Provider store={store}>
      <GroupProvider>
        <StatusBar />
        <Navigations />
      </GroupProvider>
    </Provider>
  );
};

export default App;
