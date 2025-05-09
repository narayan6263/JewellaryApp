import { createSlice } from "@reduxjs/toolkit";
import {
  fetchContactLoanList,
  fetchIntrestTillToday,
  fetchLoansDetails,
  fetchLoansList,
  freezeLoan,
  fetchLoanCashTransactions,
  addCashTransaction
} from "../actions/loan.action";

const loanSlices = createSlice({
  name: "loanSlices",
  initialState: {
    loading: false,
    loanList: [],
    loanDetails: null,
    intrestTillToday: {},
    contactLoanHistory: [],
    fetchLoading: false,
    cashTransactions: {}, // Map of loan ID to transactions
    cashTransactionLoading: false
  },
  reducers: {
    // Manual update for loan details (used when we need to update without API call)
    updateLoanDetails: (state, action) => {
      state.loanDetails = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle invoice async thunk : loan/fetch
    builder
      .addCase(fetchLoansList.pending, (state) => {
        state.fetchLoading = true;
        state.loanList = [];
      })
      .addCase(fetchLoansList.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.loanList = action.payload;
      })
      .addCase(fetchLoansList.rejected, (state) => {
        state.fetchLoading = false;
      });

    // loan/details
    builder
      .addCase(fetchLoansDetails.pending, (state) => {
        state.fetchLoading = true;
        state.loanDetails = null;
      })
      .addCase(fetchLoansDetails.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.loanDetails = action.payload;
      })
      .addCase(fetchLoansDetails.rejected, (state) => {
        state.fetchLoading = false;
      });

    // get-interest-till-today
    builder
      .addCase(fetchIntrestTillToday.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetchIntrestTillToday.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.intrestTillToday = action.payload;
      })
      .addCase(fetchIntrestTillToday.rejected, (state) => {
        state.fetchLoading = false;
      });

    // user-contact/loan-history
    builder
      .addCase(fetchContactLoanList.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetchContactLoanList.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.contactLoanHistory = action.payload;
      })
      .addCase(fetchContactLoanList.rejected, (state) => {
        state.fetchLoading = false;
      });

    // freeze/loan
    builder
      .addCase(freezeLoan.pending, (state) => {
        state.loading = true;
      })
      .addCase(freezeLoan.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(freezeLoan.rejected, (state) => {
        state.loading = false;
      });
      
    // loans/cash-transactions
    builder
      .addCase(fetchLoanCashTransactions.pending, (state) => {
        state.cashTransactionLoading = true;
      })
      .addCase(fetchLoanCashTransactions.fulfilled, (state, action) => {
        state.cashTransactionLoading = false;
        // Store transactions by loan ID for easy access
        state.cashTransactions = {
          ...state.cashTransactions,
          [action.payload.loanId]: action.payload.transactions
        };
      })
      .addCase(fetchLoanCashTransactions.rejected, (state) => {
        state.cashTransactionLoading = false;
      });
      
    // loans/add-cash-transaction
    builder
      .addCase(addCashTransaction.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCashTransaction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addCashTransaction.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { updateLoanDetails } = loanSlices.actions;
export default loanSlices.reducer;
