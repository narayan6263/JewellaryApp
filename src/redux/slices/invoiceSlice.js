import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  invoiceList: [],
  loading: false,
  error: null,
  selectedInvoice: null
};

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    setInvoiceList: (state, action) => {
      state.invoiceList = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    addInvoice: (state, action) => {
      state.invoiceList = [...state.invoiceList, action.payload];
    },
    updateInvoice: (state, action) => {
      state.invoiceList = state.invoiceList.map(invoice => 
        invoice.id === action.payload.id ? action.payload : invoice
      );
    },
    deleteInvoice: (state, action) => {
      state.invoiceList = state.invoiceList.filter(invoice => 
        invoice.id !== action.payload
      );
    },
    setSelectedInvoice: (state, action) => {
      state.selectedInvoice = action.payload;
    },
    clearSelectedInvoice: (state) => {
      state.selectedInvoice = null;
    }
  }
});

export const {
  setInvoiceList,
  setLoading,
  setError,
  addInvoice,
  updateInvoice,
  deleteInvoice,
  setSelectedInvoice,
  clearSelectedInvoice
} = invoiceSlice.actions;

export default invoiceSlice.reducer; 