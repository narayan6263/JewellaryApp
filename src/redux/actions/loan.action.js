import { ApiRequest } from "@/src/utils/api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import ShowToast from "@/src/components/common/ShowToast";
import { MANAGE_LOAN_API } from "@/src/utils/api/endpoints";

// fetch loan list
export const fetchLoansList = createAsyncThunk("loans/fetch", async () => {
  try {
    const response = await ApiRequest({
      url: MANAGE_LOAN_API.fetch,
      method: "GET",
    });
    // Return the loan list to update the Redux state
    return response.data || [];
  } catch (error) {
    console.error(error.message);
    throw new Error(error.message || "Failed to fetch loan history");
  }
});

// fetch user's contact loan list
export const fetchContactLoanList = createAsyncThunk(
  "user-contact/loan-fetch",
  async (id) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_LOAN_API.contact_loans_history,
        method: "GET",
        params: { user_contact_id: id },
      });
      // Return the  user's contact loan list to update the Redux state
      return response.data || [];
    } catch (error) {
      console.error(error.message);
      throw new Error(
        error.message || "Failed to fetch  user's contact loan history"
      );
    }
  }
);

// fetch loan details
export const fetchLoansDetails = createAsyncThunk(
  "loans/details",
  async (id) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_LOAN_API.details,
        method: "GET",
        params: { id },
      });
      // Return the loan detail by id to update the Redux state
      return response.data || [];
    } catch (error) {
      console.error(error.message);
      throw new Error(error.message || "Failed to fetch loan details");
    }
  }
);

// get-interest-till-today
export const fetchIntrestTillToday = createAsyncThunk(
  "loans/get-interest-till-today",
  async (id) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_LOAN_API.get_interest_till_today,
        method: "GET",
        params: { loan_id: id },
      });

      // Return the loan detail by id to update the Redux state
      return response.data || {};
    } catch (error) {
      console.error(error.message);
      throw new Error(error.message || "Failed to fetch interest-till-today");
    }
  }
);

// freeze invoice (Loan)
export const freezeLoan = createAsyncThunk(
  "freeze/loan",
  async ({ payload, callback }, { dispatch }) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_LOAN_API.freeze,
        method: "POST",
        body: payload,
      });

      if (response?.success) {
        dispatch(fetchLoansDetails(payload.loan_id));
        ShowToast(response.message);
        callback && callback();
      }

      // Return the updated products list to update the Redux state
      return response;
    } catch (error) {
      console.error(error.message);
      throw new Error(error.message || "Failed to freeze loan");
    }
  }
);

// fetch loan cash transactions
export const fetchLoanCashTransactions = createAsyncThunk(
  "loans/cash-transactions",
  async (loanId) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_LOAN_API.cash_transactions(loanId),
        method: "GET",
      });
      
      // Return the cash transactions to update the Redux state
      return {
        loanId,
        transactions: response.data || []
      };
    } catch (error) {
      console.error(error.message);
      throw new Error(error.message || "Failed to fetch cash transactions");
    }
  }
);

// add cash transaction
export const addCashTransaction = createAsyncThunk(
  "loans/add-cash-transaction",
  async ({ payload, callback }, { dispatch }) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_LOAN_API.add_cash_transaction,
        method: "POST",
        body: payload,
      });

      if (response?.success) {
        // Refresh loan details and cash transactions
        dispatch(fetchLoanCashTransactions(payload.loan_id));
        dispatch(fetchLoansDetails(payload.loan_id));
        
        ShowToast(response.message || "Cash transaction added successfully");
        callback && callback(response.data);
      } else {
        ShowToast(response.message || "Failed to add cash transaction");
      }

      // Return the response to update the Redux state
      return response;
    } catch (error) {
      console.error(error.message);
      ShowToast(error.message || "Failed to add cash transaction");
      throw new Error(error.message || "Failed to add cash transaction");
    }
  }
);
