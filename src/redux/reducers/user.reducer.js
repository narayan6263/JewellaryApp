import { createSlice } from "@reduxjs/toolkit";
import {
  fetchContactDetailsByPhone,
  fetchContactList,
  fetchContactGroupsList,
  manageContactList,
  fetchStatesList,
  fetchCitiesList,
  updateProfileSetting,
  fetcheProfileDetails,
  deleteContactFromList,
  fetchContactHistory,
  fetchContactSummary,
} from "../actions/user.action";

const userSlices = createSlice({
  name: "userSlices",
  initialState: {
    contacts: [],
    statesList: [],
    cityList: [],
    profileData: {},
    contactHistory: {},
    summaryData: null,

    groups: [],
    contactDetails: {},
    loading: false,
    fetchLoading: false,
  },
  extraReducers: (builder) => {
    // Handle fetchContactList async thunk
    builder
      .addCase(fetchContactList.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetchContactList.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.contacts = action.payload;
      })
      .addCase(fetchContactList.rejected, (state) => {
        state.fetchLoading = false;
      })

      // fetch contact summary data
      .addCase(fetchContactSummary.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetchContactSummary.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.summaryData = action.payload;
      })
      .addCase(fetchContactSummary.rejected, (state) => {
        state.fetchLoading = false;
      })

      // fetch/contact-history
      .addCase(fetchContactHistory.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetchContactHistory.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.contactHistory = action.payload;
      })
      .addCase(fetchContactHistory.rejected, (state) => {
        state.fetchLoading = false;
      })

      // fetch/state-list
      .addCase(fetchStatesList.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetchStatesList.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.statesList = action.payload;
      })
      .addCase(fetchStatesList.rejected, (state) => {
        state.fetchLoading = false;
      })

      // fetch/city-list
      .addCase(fetchCitiesList.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetchCitiesList.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.cityList = action.payload;
      })
      .addCase(fetchCitiesList.rejected, (state) => {
        state.fetchLoading = false;
      })

      // fetch/groups-list
      .addCase(fetchContactGroupsList.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetchContactGroupsList.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.groups = action.payload;
      })
      .addCase(fetchContactGroupsList.rejected, (state) => {
        state.fetchLoading = false;
      })

      // fetch/contact-details-by-phone
      .addCase(fetchContactDetailsByPhone.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchContactDetailsByPhone.fulfilled, (state, action) => {
        state.loading = false;
        state.contactDetails = action.payload;
      })
      .addCase(fetchContactDetailsByPhone.rejected, (state) => {
        state.loading = false;
      })

      // Handle manageContactList async thunk
      .addCase(manageContactList.pending, (state) => {
        state.loading = true;
      })
      .addCase(manageContactList.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(manageContactList.rejected, (state) => {
        state.loading = false;
      })

      // Handle deleteContactList async thunk
      .addCase(deleteContactFromList.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteContactFromList.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteContactFromList.rejected, (state) => {
        state.loading = false;
      })

      // Handle updateProfileSetting async thunk
      .addCase(updateProfileSetting.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfileSetting.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateProfileSetting.rejected, (state) => {
        state.loading = false;
      })

      // Handle fetcheProfileDetails async thunk
      .addCase(fetcheProfileDetails.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetcheProfileDetails.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.profileData = action.payload;
      })
      .addCase(fetcheProfileDetails.rejected, (state) => {
        state.fetchLoading = false;
      });
  },
});

export default userSlices.reducer;
