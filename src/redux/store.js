import authSlices from "./reducers/auth.reducer";
import loanSlices from "./reducers/loan.reducer";
import userSlices from "./reducers/user.reducer";
import homeSlices from "./reducers/home.reducer";
import productSlices from "./reducers/product.reducer";
import invoiceSlices from "./reducers/invoice.reducer";
import activityLogReducer from './slices/activityLogSlice';
import activityLogger from './middleware/activityLogger';
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    userSlices,
    authSlices,
    productSlices,
    invoiceSlices,
    loanSlices,
    homeSlices,
    activityLog: activityLogReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(activityLogger),
});

export default store;
