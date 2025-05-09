import React from "react";
// import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

// Tabs
import HomeScreen from "./screens/home";
import UserScreen from "./screens/users";
import ProductScreen from "./screens/products";
import SIScreen from "./screens/bills/SIScreen";
import PIScreen from "./screens/bills/PIScreen";
import RIScreen from "./screens/bills/RIScreen";
import OIScreen from "./screens/bills/OIScreen";
import LIScreen from "./screens/bills/LIScreen";
import InventoryScreen from "./screens/inventory";

// Screens
import MetalRates from "./screens/rates";
import SettingScreen from "./screens/setting";
import ChatDetailScreen from "./screens/home/details";
import CreateContact from "./screens/users/CreateContact";
import ShippingInfo from "./screens/bills/create/ShippingInfo";
import ManageGroupScreen from "./screens/setting/manage-groups";
import GroupFormScreen from "./screens/setting/manage-groups/GroupFormScreen";
import Items from "./screens/bills/create/Items";
import ItemsForInvoice from "./screens/bills/create/ItemsForInvoice";
import ItemAssignment from "./screens/groups/components/ItemAssignment";
import CreateProduct from "./screens/products/CreateProduct";
import StockHistory from "./screens/products/StockHistory";
import InventoryDetails from "./screens/inventory/InventoryDetails";
import AddEditInventory from "./screens/inventory/AddEditInventory";

import BussinessInfoScreen from "./screens/setting/general";
import BillDetailScreen from "./screens/bills/DetailScreen";
import LoanDetailScreen from "./screens/bills/loan/LoanDetailScreen";
import SignatureScreen from "./screens/setting/general/Signature";
import InvoiceConfigScreen from "./screens/setting/general/InvoiceConfig";
import AuthScreen from "./screens/auth";
import WalkthroughScreen from "./screens/welcome";
import AuthDecisionScreen from "./screens/auth/AuthDecisionScreen";
import MPINScreen from "./screens/setting/security/MPIN";
import GroupsScreen, { GroupProvider } from "./screens/groups/GroupsScreen";
import ProductForm from "./screens/products/components/ProductForm";
import ORInvoiceForm from "@/src/components/ORInvoiceForm";
import GroupDetailsScreen from "./screens/groups/GroupDetailsScreen";
import Allocation from "./screens/home/tabScreens/Allocation";
import AllocationDetails from "./screens/home/tabScreens/AllocationDetails";
import AdminAuthScreen from './screens/log/AdminAuthScreen';
import LogScreen from './screens/log/Logscreen';
import OrderDetails from '@/src/screens/home/components/OrderDetails';
import Repairing from './screens/home/tabScreens/Repairing';
import RepairDetails from '@/src/screens/home/components/RepairDetails';
import ORExtras from "./screens/bills/create/ORExtras";
import ORPreview from "./screens/bills/create/ORPreview";
import InvoiceForm from "@/src/components/InvoiceForm";
import LoanItemsList from "@/src/components/LoanItemsList";
import ProfessionalInvoiceBill from "@/src/components/ProfessionalInvoiceBill";
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const tabScreens = [
  { name: "Home", component: HomeScreen },
  { name: "UserList", component: UserScreen },
  { name: "SaleInvoice", component: SIScreen },
  { name: "Setting", component: SettingScreen },
  { name: "Products", component: ProductScreen },
  { name: "PurchaseInvoice", component: PIScreen },
  { name: "RepairingInvoice", component: RIScreen },
  { name: "OrderInvoice", component: OIScreen },
  { name: "LoanInvoice", component: LIScreen },
  { name: "Allocation", component: Allocation },
  { name: "AllocationDetails", component: AllocationDetails },
  { name: "Inventory", component: InventoryScreen },
];

// Wrapper component for GroupsScreen with its provider
const WrappedGroupsScreen = (props) => (
  <GroupProvider>
    <GroupsScreen {...props} />
  </GroupProvider>
);

const stackScreens = [
  { name: "MetalRates", component: MetalRates },
  { name: "NewContact", component: CreateContact },
  { name: "ShippingInfo", component: ShippingInfo },
  { name: "NewProduct", component: CreateProduct },
  { name: "ProductForm", component: ProductForm },
  { name: "ChatDetails", component: ChatDetailScreen },
  { name: "BillDetails", component: BillDetailScreen },
  { name: "LoanDetails", component: LoanDetailScreen },
  { name: "StockHistory", component: StockHistory },
  { name: "SignatureScreen", component: SignatureScreen },
  { name: "NewGroupScreen", component: GroupFormScreen },
  { name: "ManageGroupsScreen", component: ManageGroupScreen },
  { name: "ManageMPINScreen", component: MPINScreen },
  { name: "InvoiceConfigScreen", component: InvoiceConfigScreen },
  { name: "BussinessInfoScreen", component: BussinessInfoScreen },
  { name: "InventoryDetails", component: InventoryDetails },
  { name: "AddEditInventory", component: AddEditInventory },
  { name: "ProfessionalInvoiceBill", component: ProfessionalInvoiceBill },
  {
    name: "GroupsScreen",
    component: WrappedGroupsScreen
  },
  { name: "ORExtras", component: ORExtras },
  { name: "ORPreview", component: ORPreview },
  { name: "Items", component: Items },
  { name: "ORInvoiceForm", component: ORInvoiceForm },
  { name: "ItemsForInvoice", component: ItemsForInvoice },
  { name: "GroupDetails", component: GroupDetailsScreen },
  { name: "OrderDetails", component: OrderDetails },
  { name: "Repairing", component: Repairing },
  { name: "RepairDetails", component: RepairDetails },
  { name: "InvoiceForm", component: InvoiceForm },
  { name: "LoanItemsList", component: LoanItemsList }
];

const MainTabScreen = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: { position: "absolute", display: "none" }, // Hides the tab bar
    }}
    initialRouteName="Home"
  >
    {tabScreens.map((screen) => (
      <Tab.Screen
        key={screen.name}
        name={screen.name}
        component={screen.component}
      />
    ))}
  </Tab.Navigator>
);

const Navigations = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={MainTabScreen} />
        <Stack.Screen
          name="Welcome"
          component={WalkthroughScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AuthDecisionScreen"
          component={AuthDecisionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ headerShown: false }}
        />
        {stackScreens.map((screen) => (
          <Stack.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
          />
        ))}
        <Stack.Screen
          name="AdminAuth"
          component={AdminAuthScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LogScreen"
          component={LogScreen}
          options={{
            title: 'System Logs',
            headerLeft: null // Prevents going back to PIN screen
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigations;
