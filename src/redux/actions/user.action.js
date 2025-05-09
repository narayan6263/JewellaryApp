import { ApiRequest } from "@/src/utils/api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  MANAGE_CONTACT_API,
  MANAGE_PROFILE_API,
} from "@/src/utils/api/endpoints";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ShowToast from "@/src/components/common/ShowToast";

// fetch contact list
export const fetchContactList = createAsyncThunk(
  "fetch/contact-list",
  async () => {
    try {
      const response = await ApiRequest({ url: MANAGE_CONTACT_API.contacts });

      // Return the contact list to update the Redux state
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch contact list");
    }
  }
);

// fetch contact summary list
export const fetchContactSummary = createAsyncThunk(
  "fetch/summary-data",
  async (user_contact_id) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_CONTACT_API.summary,
        method: "GET",
        params: { user_contact_id },
      });

      // Return the contact list to update the Redux state
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch contact summary data");
    }
  }
);

// fetch Contact Details By Phone
export const fetchContactDetailsByPhone = createAsyncThunk(
  "fetch/contact-details-by-phone",
  async (phone) => {
    try {
      // Fetch the existing contact list from local storage
      const storedContacts = await AsyncStorage.getItem("contactList");
      const contactList = storedContacts ? JSON.parse(storedContacts) : [];

      // Find the contact with the matching phone number
      const contactDetails = contactList.find(
        (contact) => contact?.phone === phone
      );

      if (!contactDetails) {
        throw new Error("Contact not found");
      }

      // Return the contact details to update the Redux state
      return contactDetails;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch contact details");
    }
  }
);

// create & update contact
export const manageContactList = createAsyncThunk(
  "manage/contact",
  async ({ payload, callback, isUpdate = false }, { dispatch }) => {
    try {
      const response = await ApiRequest({
        url: isUpdate ? MANAGE_CONTACT_API.update : MANAGE_CONTACT_API.create,
        method: "POST",
        body: payload,
      });

      if (response?.success) {
        ShowToast(response.message || `Contact created success`);
        callback();
        dispatch(fetchContactList());
      }
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to manage contact list");
    }
  }
);

// create & update contact
export const fetchContactHistory = createAsyncThunk(
  "fetch/contact-history",
  async (id) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_CONTACT_API.history,
        method: "GET",
        params: { user_contact_id: id },
      });

      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch contact history");
    }
  }
);

// delete contact
export const deleteContactFromList = createAsyncThunk(
  "delete/contact",
  async ({ id, callback }, { dispatch }) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_CONTACT_API.delete,
        method: "GET",
        params: { id },
      });
      if (response?.success) {
        ShowToast(response.message || `Contact created success`);
        callback();
        dispatch(fetchContactList());
      }
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to manage contact list");
    }
  }
);

// ----------------------------- Groups (Role) List ------------------------ //

// fetch contact's groups list
export const fetchContactGroupsList = createAsyncThunk(
  "fetch/groups-list",
  async () => {
    try {
      const response = await ApiRequest({ url: MANAGE_CONTACT_API.roles });
      // save roles to offline
      response.data &&
        (await AsyncStorage.setItem(
          "groupsList",
          JSON.stringify(response.data)
        ));
      // Fetch the groups list from local storage
      const storedGroups = await AsyncStorage.getItem("groupsList");
      const groupsList = storedGroups ? JSON.parse(storedGroups) : [];
      return groupsList;
    } catch (error) {
      throw new Error("Failed to fetch groups list");
    }
  }
);

// ----------------------------- States & Cities List ------------------------ //

// fetch states list
export const fetchStatesList = createAsyncThunk(
  "fetch/states-list",
  async () => {
    try {
      const response = await ApiRequest({ url: MANAGE_CONTACT_API.states });
      // save states to offline
      const states = response.data.map((item) => ({
        value: item.id,
        label: item.state,
      }));
      response.data &&
        (await AsyncStorage.setItem("statesList", JSON.stringify(states)));
      // Fetch the states list from local storage
      const storedStates = await AsyncStorage.getItem("statesList");
      const statesList = storedStates ? JSON.parse(storedStates) : [];
      return statesList;
    } catch (error) {
      throw new Error("Failed to fetch states list");
    }
  }
);

// fetch cities list
export const fetchCitiesList = createAsyncThunk(
  "fetch/city-list",
  async (state_id) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_CONTACT_API.cities,
        params: { state_id },
      });
      // save cities to offline
      const cities = response.data.map((item) => ({
        value: item.id,
        label: item.city,
      }));
      response.data &&
        (await AsyncStorage.setItem("cityList", JSON.stringify(cities)));
      // Fetch the cities list from local storage
      const storedCities = await AsyncStorage.getItem("cityList");
      const cityList = storedCities ? JSON.parse(storedCities) : [];
      return cityList;
    } catch (error) {
      throw new Error("Failed to fetch cities list");
    }
  }
);

// ----------------------------- Update Setting ------------------------ //

// fetch profile
export const fetcheProfileDetails = createAsyncThunk(
  "fetch/profile",
  async () => {
    try {
      const response = await ApiRequest({
        url: MANAGE_PROFILE_API.fetch,
        method: "GET",
      });

      if (response?.success) {
        await AsyncStorage.setItem(
          "profileDetails",
          JSON.stringify(response.data)
        );
      }
      const profileData = await AsyncStorage.getItem("profileDetails");
      const data = profileData ? JSON.parse(profileData) : {};
      return data;
    } catch (error) {
      throw new Error(error.message || "Failed to fetch profile details");
    }
  }
);

// update profile
export const updateProfileSetting = createAsyncThunk(
  "update/profile-setting",
  async ({ payload, callback }, { dispatch }) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_PROFILE_API.update,
        method: "POST",
        body: payload,
      });
      if (response?.success) {
        dispatch(fetcheProfileDetails());
        response?.success && callback();
      }
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to manage profile details");
    }
  }
);
