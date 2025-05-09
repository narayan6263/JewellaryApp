import axios from "axios";
import { BASE_URL } from "./endpoints";
import ShowToast from "@/src/components/common/ShowToast";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Check if the user is authenticated and retrieve the token
export const getToken = async () => {
  try {
    const accessTokenString = await AsyncStorage.getItem("accessToken");
    if (!accessTokenString) {
      return null;
    }

    try {
      const parsedToken = JSON.parse(accessTokenString);
      // Validate complete token structure
      if (!parsedToken?.token || typeof parsedToken.token !== 'string') {
        console.warn("Invalid token structure found");
        await AsyncStorage.removeItem("accessToken");
        return null;
      }

      // Ensure all required fields exist
      const validatedToken = {
        token: parsedToken.token,
        is_mpin: parsedToken.is_mpin || 0,
        user: parsedToken.user || {}
      };

      return validatedToken;
    } catch (parseError) {
      console.error("Error parsing token:", parseError);
      await AsyncStorage.removeItem("accessToken");
      return null;
    }
  } catch (storageError) {
    console.error("Error retrieving token:", storageError);
    return null;
  }
};

// Clear authentication data
export const clearAuthData = async () => {
  try {
    await AsyncStorage.removeItem("accessToken");
    return true;
  } catch (error) {
    console.error("Error clearing auth data:", error);
    return false;
  }
};

// Api request handler
export const ApiRequest = async ({
  url,
  method = "GET",
  body = null,
  params = null,
  headers = {},
}) => {
  try {
    // Get the access token
    const accessToken = await getToken();

    // Determine Content-Type dynamically
    const isFormDataContent = body instanceof FormData;
    const contentType = isFormDataContent
      ? "multipart/form-data"
      : "application/json";

    // Construct default headers
    const defaultHeaders = {
      "Content-Type": contentType,
      ...(accessToken && { Authorization: `Bearer ${accessToken?.token}` }),
    };

    // Axios configuration
    const axiosConfig = {
      method,
      url: `${BASE_URL}/api${url}`,
      headers: { ...defaultHeaders, ...headers },
      params,
      ...(body && { data: body }),
    };

    console.log("API Request Config:", axiosConfig);

    // Make the Axios request
    const response = await axios(axiosConfig);

    // Handle successful response
    const responseData = response.data;
    
    // If the response indicates success through message
    if (responseData?.message?.includes("Successfully")) {
      return {
        success: true,
        ...responseData
      };
    }

    // Return the response data
    return responseData;
  } catch (error) {
    console.log("API Request Error:", error.message);

    // Handle Laravel authentication middleware error
    if ((error.message && (
      error.message.includes("App\\Http\\Middleware\\Authenticate::redirectTo()") ||
      error.message.includes("none returned") ||
      error.message.includes("Return value must be of type ?string")
    )) ||
      error.response?.status === 401 ||
      error.response?.status === 500
    ) {
      console.warn("Authentication or server error detected");

      // Check if it's specifically the Laravel auth middleware error
      const isLaravelAuthError = error.message && (
        error.message.includes("App\\Http\\Middleware\\Authenticate::redirectTo()") ||
        error.message.includes("none returned") ||
        error.message.includes("Return value must be of type ?string")
      );

      if (isLaravelAuthError) {
        // Clear the token for auth errors
        await clearAuthData();
        ShowToast("Session expired. Please login again.");
      } else if (error.response?.status === 500) {
        // For 500 errors, show generic message but don't necessarily log out
        ShowToast("Server error. Please try again later.");
      }

      // Special handling for the groups list endpoint
      if (url === "/groups/list") {
        console.log("Returning empty groups list due to auth/server error");
        return {
          success: true,
          message: "Using offline data",
          data: []
        };
      }

      // For other endpoints with auth errors, throw authentication error
      if (isLaravelAuthError) {
        throw new Error("Authentication required");
      } else {
        throw new Error("Server error");
      }
    }

    // Handle standard error response
    if (error.response) {
      const message = error.response.data?.message || "Something went wrong!";
      ShowToast(message);
      throw new Error(message);
    } else if (error.request) {
      const message = "Network error. Please try again.";
      ShowToast(message);
      throw new Error(message);
    } else {
      const message = error.message || "An error occurred. Please try again.";
      ShowToast(message);
      throw new Error(message);
    }
  }
};
