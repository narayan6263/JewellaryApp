import { ApiRequest } from "@/src/utils/api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { MANAGE_HOME_API } from "@/src/utils/api/endpoints";
import ShowToast from "@/src/components/common/ShowToast";

// fetch home invoice list
export const fetchHomeInvoiceList = createAsyncThunk(
  "fetch/home-invoice",
  async () => {
    try {
      const response = await ApiRequest({
        url: MANAGE_HOME_API.invoice,
        method: "GET",
      });
      
      // Check if response has data property
      if (!response || !response.data) {
        ShowToast("No invoice data available");
        return [];
      }
      
      // Return the invoice list to update the Redux state
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Home invoice error:", error);
      ShowToast(error.message || "Failed to fetch home invoice history");
      throw error;
    }
  }
);

// fetch home loan list
export const fetchHomeLoanList = createAsyncThunk(
  "fetch/loan-invoice",
  async () => {
    try {
      const response = await ApiRequest({
        url: MANAGE_HOME_API.loan,
        method: "GET",
      });
      // Return the loan list to update the Redux state
      return response.data || [];
    } catch (error) {
      console.error(error.message);
      throw new Error(error.message || "Failed to fetch home loan history");
    }
  }
);
