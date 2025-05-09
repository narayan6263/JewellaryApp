import { createSlice } from "@reduxjs/toolkit";
import {
  addWeightList,
  deleteGroupVariation,
  fetchProductDetail,
  fetchProductGroups,
  fetchProductList,
  fetchProductStocks,
  manageProductGroups,
  manageProductList,
} from "../actions/product.action";

const productSlices = createSlice({
  name: "productSlices",
  initialState: {
    products: [],
    productGroups: [],
    productDetail: null,
    productStocks: null,

    loading: false,
    weightLoading: false,

    fetchLoading: false,
  },
  // reducers: {},
  extraReducers: (builder) => {
    // Handle fetchProductList async thunk
    builder
      .addCase(fetchProductList.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetchProductList.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.products = action.payload;
      })
      .addCase(fetchProductList.rejected, (state) => {
        state.fetchLoading = false;
      })

      // Handle fetchProductDetails async thunk
      .addCase(fetchProductDetail.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.productDetail = action.payload;
      })
      .addCase(fetchProductDetail.rejected, (state) => {
        state.fetchLoading = false;
      })

      // Handle deleteGroupVariation async thunk
      .addCase(deleteGroupVariation.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteGroupVariation.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteGroupVariation.rejected, (state) => {
        state.loading = false;
      })

      // Handle fetchProductStocks async thunk
      .addCase(fetchProductStocks.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetchProductStocks.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.productStocks = action.payload;
      })
      .addCase(fetchProductStocks.rejected, (state) => {
        state.fetchLoading = false;
      })

      // Handle fetchProductGroups
      .addCase(fetchProductGroups.pending, (state) => {
        state.fetchLoading = true;
      })
      .addCase(fetchProductGroups.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.productGroups = action.payload;
      })
      .addCase(fetchProductGroups.rejected, (state) => {
        state.fetchLoading = false;
      })

      // Handle manageProductGroups
      .addCase(manageProductGroups.pending, (state) => {
        state.loading = true;
      })
      .addCase(manageProductGroups.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(manageProductGroups.rejected, (state) => {
        state.loading = false;
      })

      // Handle manageProductList async thunk
      .addCase(manageProductList.pending, (state) => {
        state.loading = true;
      })
      .addCase(manageProductList.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(manageProductList.rejected, (state) => {
        state.loading = false;
      })

      // Handle addWeightList async thunk
      .addCase(addWeightList.pending, (state) => {
        state.weightLoading = true;
      })
      .addCase(addWeightList.fulfilled, (state, action) => {
        state.weightLoading = false;
      })
      .addCase(addWeightList.rejected, (state) => {
        state.weightLoading = false;
      });
  },
});

export default productSlices.reducer;
