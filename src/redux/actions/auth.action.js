import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiRequest } from "@/src/utils/api";
import { MANAGE_AUTH_API } from "@/src/utils/api/endpoints";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ShowToast from "@/src/components/common/ShowToast";
import { clearAuthData } from "@/src/utils/api";

// manage auth
export const manageAuth = createAsyncThunk(
  "manage/auth",
  async ({ payload, isSignIn = false, callback }) => {
    try {
      const response = await ApiRequest({
        url: isSignIn ? MANAGE_AUTH_API.login : MANAGE_AUTH_API.register,
        method: "POST",
        body: payload,
      });

      // Handle successful login even if response structure varies
      if (response?.success || response?.message?.includes("Successfully")) {
        // Store token in AsyncStorage with proper structure
        const tokenData = {
          token: response.data?.token || response.token,
          is_mpin: response.data?.is_mpin || response.is_mpin || 0,
          user: response.data?.user || response.user || {}
        };
        
        if (!tokenData.token) {
          console.warn("Login successful but no token received:", response);
          throw new Error("Login successful but server did not return required data");
        }

        await AsyncStorage.setItem("accessToken", JSON.stringify(tokenData));
        ShowToast(response.message || "Login successful");
        callback && callback();
        return response;
      } else {
        throw new Error(response?.message || "Invalid response from server");
      }
    } catch (error) {
      console.error("Auth error:", error);
      ShowToast(error.message || "Authentication failed");
      throw error;
    }
  }
);

// manage MPIN
export const manageMPIN = createAsyncThunk(
  "manage/mpin",
  async ({ payload, callback }) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_AUTH_API.mpin,
        method: "POST",
        body: payload,
      });

      if (response?.success) {
        // Update token with MPIN status
        const currentToken = await AsyncStorage.getItem("accessToken");
        if (currentToken) {
          const tokenData = JSON.parse(currentToken);
          tokenData.is_mpin = 1;
          await AsyncStorage.setItem("accessToken", JSON.stringify(tokenData));
        }
        ShowToast(response.message);
        callback && callback();
      }

      return response;
    } catch (error) {
      console.error("MPIN error:", error);
      ShowToast(error.message || "MPIN verification failed");
      throw error;
    }
  }
);

// verify MPIN
export const verifyMPIN = createAsyncThunk(
  "verify/mpin",
  async ({ payload, callback }) => {
    try {
      const response = await ApiRequest({
        url: MANAGE_AUTH_API.verify_mpin,
        method: "POST",
        body: payload,
      });

      if (response?.success) {
        ShowToast(response.message);
        callback && callback();
      }

      return response;
    } catch (error) {
      console.error("MPIN verification error:", error);
      ShowToast(error.message || "MPIN verification failed");
      throw error;
    }
  }
);

// logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (callback) => {
    try {
      await clearAuthData();
      ShowToast("Logged out successfully");
      callback && callback();
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      ShowToast("Error during logout");
      throw error;
    }
  }
);
