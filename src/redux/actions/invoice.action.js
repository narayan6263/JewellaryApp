import { ApiRequest } from "@/src/utils/api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import ShowToast from "@/src/components/common/ShowToast";
import { MANAGE_INVOICE_API } from "@/src/utils/api/endpoints";
import { fetchHomeInvoiceList } from "./home.action";

// fetch invoice history by contact id
export const fetchInvoiceHistory = createAsyncThunk(
  "invoices/fetch",
  async (user_contact_id) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_INVOICE_API.contact_invoice_history,
        method: "GET",
        params: { user_contact_id },
      });
      // Return the invoice history to update the Redux state
      return response.data || [];
    } catch (error) {
      console.error(error.message);
      throw new Error(error.message || "Failed to fetch invoice history");
    }
  }
);

// save invoice pdf by invoice id
export const saveInvoicePDF = createAsyncThunk(
  "invoices/pdf-save",
  async (invoiceId) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_INVOICE_API.save_invoice.replace(":invoiceId", invoiceId),
        method: "GET",
      });
      // Return the invoice history to update the Redux state
      return response.data || [];
    } catch (error) {
      console.error(error.message);
      throw new Error(error.message || "Failed to fetch invoice history");
    }
  }
);

// add invoice (Sale, Purchase)
export const addInvoice = createAsyncThunk(
  "invoice/add-invoice",
  async ({ payload, callback }, { dispatch }) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_INVOICE_API.add,
        method: "POST",
        body: payload,
      });

      if (response?.success) {
        ShowToast(response.message);
        dispatch(fetchHomeInvoiceList());
        callback();
      }

      // Return the updated products list to update the Redux state
      return response;
    } catch (error) {
      console.error(error.message);
      throw new Error(error.message || "Failed to manage product list");
    }
  }
);

// add invoice (Loan)
export const addLoan = createAsyncThunk(
  "invoice/add-loan",
  async ({ payload, callback }) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_INVOICE_API.loan,
        method: "POST",
        body: payload,
      });

      if (response?.success) {
        ShowToast(response.message);
        callback && callback();
      }

      // Return the updated products list to update the Redux state
      return response;
    } catch (error) {
      console.error(error.message);
      throw new Error(error.message || "Failed to manage product list");
    }
  }
);

// manage rate cut
export const rateCutting = createAsyncThunk(
  "manage/rate-cut",
  async ({ payload, callback }) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_INVOICE_API.rate_cut,
        method: "POST",
        body: payload,
      });

      if (response?.success) {
        ShowToast(response.message);
        callback && callback();
      }

      // Return the updated products list to update the Redux state
      return response;
    } catch (error) {
      console.error(error.message);
      throw new Error(error.message || "Failed to manage rate cutting");
    }
  }
);

// manage rate cut
export const convertToMetal = createAsyncThunk(
  "manage/convert-to-metal",
  async ({ payload, callback }) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_INVOICE_API.convert_to_metal,
        method: "POST",
        body: payload,
      });

      if (response?.success) {
        ShowToast(response.message);
        callback && callback();
      }

      // Return the updated products list to update the Redux state
      return response;
    } catch (error) {
      console.error(error.message);
      throw new Error(error.message || "Failed to manage convert to metal");
    }
  }
);
