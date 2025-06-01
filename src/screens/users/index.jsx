// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   TextInput,
//   ScrollView
// } from "react-native";
// import { useDispatch, useSelector } from "react-redux";
// import UserItem from "./components/UserItem";
// import BackButton from "../../components/common/buttons/BackButton";
// import SearchBtn from "@/src/components/common/buttons/SearchBtn";
// import NoData from "@/src/components/common/NoData";
// import AntDesign from "@expo/vector-icons/AntDesign";

// import PlusButton from "@/src/components/common/buttons/PlusButton";
// import {
//   deleteContactFromList,
//   fetchContactList,
// } from "@/src/redux/actions/user.action";
// import OverlayModal from "@/src/components/common/OverlayModal";

// const UserScreen = ({ navigation }) => {
//   const dispatch = useDispatch();
//   const [isSearch, setIsSearch] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [deleteContact, setDeleteContact] = useState(null);
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
//   const { contacts, fetchLoading } = useSelector((state) => state.userSlices);

//   // handle delete contact from list
//   const handleRemoveContact = () => {
//     dispatch(
//       deleteContactFromList({
//         id: deleteContact,
//         callback: () => setDeleteContact(null),
//       })
//     );
//   };

//   // Debounce search term
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm);
//     }, 500); // 500ms debounce time

//     return () => clearTimeout(handler);
//   }, [searchTerm]);

//   const fetchList = () => dispatch(fetchContactList());

//   // Fetch contacts on mount
//   useEffect(() => {
//     fetchList();
//   }, [dispatch]);

//   // Filter contacts based on debouncedSearchTerm
//   const filteredContacts = contacts?.filter((contact) =>
//     contact.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
//   );

//   return (
//     <ScrollView className="bg-white min-h-screen ">
//       {/* Topbar */}
//       <View className="p-5 flex flex-row w-full bg-primary justify-between items-center">
//         <BackButton
//           onPress={() => {
//             setIsSearch(false);
//             setSearchTerm("");
//             navigation.navigate("Home");
//           }}
//           color="white"
//         />
//         <View className="flex-row items-center justify-between w-[91%]">
//           {isSearch ? (
//             <>
//               <TextInput
//                 placeholder="Search Contact ..."
//                 placeholderTextColor="lightgray"
//                 value={searchTerm}
//                 onChangeText={setSearchTerm}
//                 className="text-lg pl-1 py-0 w-full max-w-[300px] text-white"
//               />
//               <TouchableOpacity onPress={() => setIsSearch(false)}>
//                 <AntDesign name="close" color="white" size={24} />
//               </TouchableOpacity>
//             </>
//           ) : (
//             <>
//               <View>
//                 <Text className="pl-5 text-lg text-white">Select contact</Text>
//                 <Text className="pl-5 text-white">
//                   {contacts?.length} contacts
//                 </Text>
//               </View>
//               <SearchBtn onPress={() => setIsSearch(true)} />
//             </>
//           )}
//         </View>
//       </View>

//       {/* New Contact Button */}
//       <PlusButton onPress={() => navigation.navigate("NewContact")} />

//       <FlatList
//         data={filteredContacts}
//         renderItem={({ item }) => (
//           <UserItem
//             item={item}
//             navigation={navigation}
//             onDelete={() => setDeleteContact(item?.id)}
//           />
//         )}
//         onRefresh={fetchList}
//         refreshing={fetchLoading}
//         showsVerticalScrollIndicator={false}
//         ListEmptyComponent={<NoData title="contacts" />}
//       />

//       {/* Delete User Contact Modal */}
//       <OverlayModal
//         heading="Delete Contact"
//         open={deleteContact ? true : false}
//         onClose={() => setDeleteContact(null)}
//         onSubmit={handleRemoveContact}
//       >
//         <Text className="text-base tracking-wider">
//           Are you sure want to delete contact? This action will not undo.
//         </Text>
//       </OverlayModal>
//     </ScrollView>
//   );
// };

// export default UserScreen;

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import UserItem from "./components/UserItem";
import BackButton from "../../components/common/buttons/BackButton";
import SearchBtn from "@/src/components/common/buttons/SearchBtn";
import NoData from "@/src/components/common/NoData";
import AntDesign from "@expo/vector-icons/AntDesign";
import PlusButton from "@/src/components/common/buttons/PlusButton";
import {
  deleteContactFromList,
  fetchContactList,
} from "@/src/redux/actions/user.action";
import OverlayModal from "@/src/components/common/OverlayModal";

const UserScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [isSearch, setIsSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteContact, setDeleteContact] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const { contacts, fetchLoading } = useSelector((state) => state.userSlices);

  // Handle delete contact from list
  const handleRemoveContact = () => {
    dispatch(
      deleteContactFromList({
        id: deleteContact,
        callback: () => setDeleteContact(null),
      })
    );
  };

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce time

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchList = () => dispatch(fetchContactList());

  // Fetch contacts on mount
  useEffect(() => {
    fetchList();
  }, [dispatch]);

  // Filter contacts based on debouncedSearchTerm
  const filteredContacts = contacts?.filter((contact) =>
    contact.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Topbar */}
        <View className="p-5 flex-row w-full bg-primary justify-between items-center">
          <BackButton
            onPress={() => {
              setIsSearch(false);
              setSearchTerm("");
              navigation.navigate("Home");
            }}
            color="white"
          />
          <View className="flex-row items-center justify-between w-[85%]">
            {isSearch ? (
              <>
                <TextInput
                  placeholder="Search Contact ..."
                  placeholderTextColor="lightgray"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  className="text-lg pl-1 py-0 flex-1 text-white"
                />
                <TouchableOpacity onPress={() => setIsSearch(false)}>
                  <AntDesign name="close" color="white" size={24} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View>
                  <Text className="pl-5 text-lg text-white font-bold">Select contact</Text>
                  <Text className="pl-5 text-white">{contacts?.length} contacts</Text>
                </View>
                <SearchBtn onPress={() => setIsSearch(true)} />
              </>
            )}
          </View>
        </View>

        {/* New Contact Button */}
        <PlusButton onPress={() => navigation.navigate("NewContact")} />

        <FlatList
          data={filteredContacts}
          renderItem={({ item }) => (
            <UserItem
              item={item}
              navigation={navigation}
              onDelete={() => setDeleteContact(item?.id)}
            />
          )}
          onRefresh={fetchList}
          refreshing={fetchLoading}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<NoData title="contacts" />}
          contentContainerStyle={{ paddingBottom: 100 }} // Ensure last item is visible
        />

        {/* Delete User Contact Modal */}
        <OverlayModal
          heading="Delete Contact"
          open={deleteContact ? true : false}
          onClose={() => setDeleteContact(null)}
          onSubmit={handleRemoveContact}
        >
          <Text className="text-base tracking-wider">
            Are you sure you want to delete this contact? This action cannot be undone.
          </Text>
        </OverlayModal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserScreen;