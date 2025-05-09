import { createSlice } from "@reduxjs/toolkit";
import { manageAuth, manageMPIN } from "../actions/auth.action";

const authSlices = createSlice({
  name: "authSlices",
  initialState: {
    loading: false, // To manage the loading state
  },
  extraReducers: (builder) => {
    // Handle auththentication async thunk
    builder
      .addCase(manageAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(manageAuth.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(manageAuth.rejected, (state) => {
        state.loading = false;
      })

      // Handle MPIN async thunk
      .addCase(manageMPIN.pending, (state) => {
        state.loading = true;
      })
      .addCase(manageMPIN.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(manageMPIN.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default authSlices.reducer;
