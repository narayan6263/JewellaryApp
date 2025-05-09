import { useState, useEffect } from 'react';
import { MANAGE_INVENTORY_API } from '../../../utils/api/endpoints';
import { ApiRequest } from '../../../utils/api';

const useInventory = () => {
  const [inventory, setInventory] = useState({
    items: [],
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchInventory = async (page = 1) => {
    try {
      setLoading(true);
      console.log('Fetching inventory with page:', page);
      
      const data = await ApiRequest({
        url: MANAGE_INVENTORY_API.list,
        params: { page }
      });
      
      console.log('API Response:', data);
      
      if (data.success) {
        console.log('Setting inventory data:', data.data);
        setInventory({
          items: data.data.data,
          currentPage: data.data.current_page,
          totalPages: data.data.last_page,
          totalItems: data.data.total,
          perPage: data.data.per_page
        });
      } else {
        throw new Error(data.message || 'Failed to fetch inventory');
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getItemDetails = async (id) => {
    try {
      setLoading(true);
      const data = await ApiRequest({
        url: `${MANAGE_INVENTORY_API.details}/${id}`
      });
      
      if (data.success) {
        setSelectedItem(data.data);
      }
      return data;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (itemData) => {
    try {
      const data = await ApiRequest({
        url: MANAGE_INVENTORY_API.create,
        method: 'POST',
        body: itemData
      });
      
      if (data.success) {
        setInventory(prev => ({
          ...prev,
          items: [...prev.items, data.data]
        }));
      }
      return data;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const updateItem = async (id, itemData) => {
    try {
      const data = await ApiRequest({
        url: `${MANAGE_INVENTORY_API.update}/${id}`,
        method: 'PUT',
        body: itemData
      });
      
      if (data.success) {
        setInventory(prev => ({
          ...prev,
          items: prev.items.map(item => (item.id === id ? { ...item, ...data.data } : item))
        }));
      }
      return data;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const deleteItem = async (id) => {
    try {
      const data = await ApiRequest({
        url: `${MANAGE_INVENTORY_API.delete}/${id}`,
        method: 'DELETE'
      });
      
      if (data.success) {
        setInventory(prev => ({
          ...prev,
          items: prev.items.filter(item => item.id !== id)
        }));
      }
      return data;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const updateItemStatus = async (id, status) => {
    try {
      const data = await ApiRequest({
        url: `${MANAGE_INVENTORY_API.updateStatus}/${id}`,
        method: 'PUT',
        body: { status }
      });
      
      if (data.success) {
        setInventory(prev => ({
          ...prev,
          items: prev.items.map(item => (item.id === id ? { ...item, status } : item))
        }));
      }
      return data;
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return {
    inventory: inventory.items,
    pagination: {
      currentPage: inventory.currentPage,
      totalPages: inventory.totalPages,
      totalItems: inventory.totalItems,
      perPage: inventory.perPage
    },
    loading,
    error,
    selectedItem,
    refresh: fetchInventory,
    getItemDetails,
    createItem,
    updateItem,
    deleteItem,
    updateItemStatus,
  };
};

export { useInventory }; 