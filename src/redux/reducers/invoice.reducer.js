import { createSlice } from "@reduxjs/toolkit";
import {
  addInvoice,
  addLoan,
  convertToMetal,
  fetchInvoiceHistory,
  rateCutting,
} from "../actions/invoice.action";

const invoiceSlices = createSlice({
  name: "invoiceSlices",
  initialState: {
    loading: false,
    invoiceHistory: [],
    fetchLoading: false,
  },
  reducers: {
    setInvoiceList: (state, action) => {
      state.invoiceHistory = action.payload;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // Handle invoice async thunk : invoices/fetch
    builder
      .addCase(fetchInvoiceHistory.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetchInvoiceHistory.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.invoiceHistory = action.payload;
      })
      .addCase(fetchInvoiceHistory.rejected, (state) => {
        state.fetchLoading = false;
      });

    // invoice/add-invoice
    builder
      .addCase(addInvoice.pending, (state) => {
        state.loading = true;
      })
      .addCase(addInvoice.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addInvoice.rejected, (state) => {
        state.loading = false;
      });

    // invoice/add-loan
    builder
      .addCase(addLoan.pending, (state) => {
        state.loading = true;
      })
      .addCase(addLoan.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addLoan.rejected, (state) => {
        state.loading = false;
      });

    // manage/rate-cutting
    builder
      .addCase(rateCutting.pending, (state) => {
        state.loading = true;
      })
      .addCase(rateCutting.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(rateCutting.rejected, (state) => {
        state.loading = false;
      });

    // manage/convert-to-metal
    builder
      .addCase(convertToMetal.pending, (state) => {
        state.loading = true;
      })
      .addCase(convertToMetal.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(convertToMetal.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setInvoiceList } = invoiceSlices.actions;
export default invoiceSlices.reducer;
