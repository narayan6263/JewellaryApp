import { createSlice } from "@reduxjs/toolkit";
import {
  fetchHomeInvoiceList,
  fetchHomeLoanList,
} from "../actions/home.action";

const homeSlices = createSlice({
  name: "homeSlices",
  initialState: {
    loading: false,
    homeLoanList: [],
    homeInvoiceList: [],
    fetchLoading: false,
    error: null
  },
  extraReducers: (builder) => {
    // Handle invoice async thunk : loan/fetch
    builder
      .addCase(fetchHomeInvoiceList.pending, (state) => {
        state.fetchLoading = true;
        state.error = null;
      })
      .addCase(fetchHomeInvoiceList.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.homeInvoiceList = action.payload || [];
        state.error = null;
      })
      .addCase(fetchHomeInvoiceList.rejected, (state, action) => {
        state.fetchLoading = false;
        state.homeInvoiceList = [];
        state.error = action.error.message;
      });

    // loan/details
    builder
      .addCase(fetchHomeLoanList.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetchHomeLoanList.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.homeLoanList = action.payload;
      })
      .addCase(fetchHomeLoanList.rejected, (state) => {
        state.fetchLoading = false;
      });
  },
});

export default homeSlices.reducer;
