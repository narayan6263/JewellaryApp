import { ApiRequest } from "@/src/utils/api";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  MANAGE_METAL_API,
  MANAGE_PRODUCT_API,
} from "@/src/utils/api/endpoints";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ShowToast from "@/src/components/common/ShowToast";

// fetch product list
export const fetchProductList = createAsyncThunk(
  "fetch/product-list",
  async (params = {}) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_PRODUCT_API.fetch,
        params,
      });

      // save groups to offline
      if (response.success) {
        const { data, purchase_fine_weight, purchase_net_weight } = response;
        await AsyncStorage.setItem(
          "productList",
          JSON.stringify({ data, purchase_fine_weight, purchase_net_weight })
        );
      }

      // Fetch the existing product list from local storage
      const storedProductList = await AsyncStorage.getItem("productList");
      const productGroupList = storedProductList
        ? JSON.parse(storedProductList)
        : { data: [], purchase_fine_weight: 0, purchase_net_weight: 0 };
      // Return the product list to update the Redux state
      return response.success ? response : productGroupList;
    } catch (error) {
      throw new Error("Failed to fetch product group");
    }
  }
);

// fetch product detail
export const fetchProductDetail = createAsyncThunk(
  "fetch/product-details",
  async (id) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_PRODUCT_API.details,
        params: { id },
      });

      // save groups to offline
      response.success &&
        (await AsyncStorage.setItem(
          "productDetails",
          JSON.stringify(response.data)
        ));
      // Fetch the existing product list from local storage
      const storedProductDetails = await AsyncStorage.getItem("productDetails");
      const productDetails = storedProductDetails
        ? JSON.parse(storedProductDetails)
        : [];
      // Return the product list to update the Redux state
      return productDetails;
    } catch (error) {
      throw new Error("Failed to fetch product group");
    }
  }
);

// manage product list
export const manageProductList = createAsyncThunk(
  "manage/product-list",
  async ({ payload, isUpdate = false, callback }, { dispatch }) => {
    try {
      const response = await ApiRequest({
        url: isUpdate ? MANAGE_PRODUCT_API.update : MANAGE_PRODUCT_API.create,
        method: "POST",
        body: payload,
      });

      if (response?.success) {
        ShowToast(response.message);
        dispatch(fetchProductList({}));
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

// --------------------- Manage Groups ----------------------- //

// fetch product group
export const fetchProductGroups = createAsyncThunk(
  "fetch/product-groups",
  async () => {
    try {
      const response = await ApiRequest({ url: MANAGE_PRODUCT_API.groups });
      // save groups to offline
      response.success &&
        (await AsyncStorage.setItem(
          "productGroups",
          JSON.stringify(response.data)
        ));
      // Fetch the existing product list from local storage
      const storedProductGroups = await AsyncStorage.getItem("productGroups");
      const productGroupList = storedProductGroups
        ? JSON.parse(storedProductGroups)
        : [];
      // Return the product list to update the Redux state
      return productGroupList;
    } catch (error) {
      throw new Error("Failed to fetch product group");
    }
  }
);

// delete product group
export const deleteProductGroups = createAsyncThunk(
  "delete/product-groups",
  async ({ productId, callback }, { dispatch }) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_PRODUCT_API.delete_group,
        params: { id: productId },
      });

      if (response?.success) {
        dispatch(fetchProductGroups());
        response?.success && callback();
      }
      return response;
    } catch (error) {
      throw new Error("Failed to fetch product group");
    }
  }
);

// manage product group
export const manageProductGroups = createAsyncThunk(
  "manage/product-groups",
  async (
    { payload, callback, isUpdate = false, isBulk = false },
    { dispatch }
  ) => {
    try {
      const response = await ApiRequest({
        url: isUpdate
          ? isBulk
            ? MANAGE_PRODUCT_API.bulk_update
            : MANAGE_PRODUCT_API.update_group
          : MANAGE_PRODUCT_API.create_group,
        method: "POST",
        body: payload,
      });
      if (response?.success) {
        dispatch(fetchProductGroups());
        response?.success && callback();
      }
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to manage product group");
    }
  }
);

// update product group variation
export const updateGroupVariation = createAsyncThunk(
  "update/product-groups-variations",
  async ({ payload, callback }, { dispatch }) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_METAL_API.variations,
        method: "POST",
        body: payload,
      });
      if (response?.success) {
        dispatch(fetchProductGroups());
        response?.success && callback();
      }
      return response;
    } catch (error) {
      throw new Error(error.message || "Failed to manage product group");
    }
  }
);

// delete product group variation
export const deleteGroupVariation = createAsyncThunk(
  "delete/product-groups-variations",
  async ({ variant_id, callback }, { dispatch }) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_METAL_API.delete_variant,
        method: "GET",
        params: { id: variant_id },
      });
      if (response?.success) {
        dispatch(fetchProductGroups());
        // response?.success && callback();
      }
      return response;
    } catch (error) {
      throw new Error(
        error.message || "Failed to delete product group variant"
      );
    }
  }
);

// --------------------- Manage Stocks ----------------------- //
// fetch product stocks
export const fetchProductStocks = createAsyncThunk(
  "fetch/product-stocks",
  async (params) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_PRODUCT_API.stocks,
        params,
      });
      // save groups to offline
      response.success &&
        (await AsyncStorage.setItem(
          "productStocks",
          JSON.stringify(response.data)
        ));
      // Fetch the existing product list from local storage
      const storedProductStocks = await AsyncStorage.getItem("productStocks");
      const productStocksList = storedProductStocks
        ? JSON.parse(storedProductStocks)
        : [];
      // Return the product list to update the Redux state
      return productStocksList;
    } catch (error) {
      throw new Error("Failed to fetch product group");
    }
  }
);

// add stock of product
export const addWeightList = createAsyncThunk(
  "manage/weight",
  async ({ payload, callback }, { dispatch }) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_PRODUCT_API.stock,
        method: "POST",
        body: payload,
      });
      if (response?.success) {
        dispatch(fetchProductDetail(payload.product_id));
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
