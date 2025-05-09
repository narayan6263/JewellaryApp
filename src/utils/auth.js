import AsyncStorage from '@react-native-async-storage/async-storage';

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const setToken = async (token) => {
  try {
    await AsyncStorage.setItem('auth_token', token);
    return true;
  } catch (error) {
    console.error('Error setting token:', error);
    return false;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('auth_token');
    return true;
  } catch (error) {
    console.error('Error removing token:', error);
    return false;
  }
}; 