// src/screens/log/LogScreen.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import CommonButton from '../../components/common/buttons/CommonButton';
import { ApiRequest } from '@/src/utils/api';
import { ShowToast } from '../../components/common/ShowToast';
import { MANAGE_LOGS_API } from '@/src/utils/api/endpoints';
import InputBox from '../../components/common/InputBox';
import { validateAdminAccess } from '@/src/utils/constants/admin';

// Toggle between mock and real data
const USE_MOCK_DATA = false;  // Set to false to use real API

const LogScreen = ({ navigation }) => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [displayLogs, setDisplayLogs] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', pin: '' });
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    userName: 'Abhi',
    productName: 'Gold Ring',
    id: '4',
    type: 'loan',
    amount: '50.00',
    invoiceId: 'optional_invoice_id',
    action: 'CREATE',
    entityType: 'LOAN',
    timestamp: '2024-03-21',
    metadata: ''
  });

  // Mock data
  const sampleLogs = [
    {
      id: '1',
      userName: 'John Doe',
      productName: 'Gold Ring',
      type: 'sale',
      amount: '50000',
      timestamp: new Date().toISOString(),
      action: 'CREATE',
      entityType: 'PRODUCT'
    },
    {
      id: '2',
      userName: 'Jane Smith',
      productName: 'Diamond Necklace',
      type: 'purchase',
      amount: '75000',
      timestamp: new Date().toISOString(),
      action: 'UPDATE',
      entityType: 'PRODUCT'
    },
    {
      id: '3',
      userName: 'Alex Johnson',
      productName: null,
      type: 'loan',
      amount: '120000',
      timestamp: new Date().toISOString(),
      action: 'FREEZE',
      entityType: 'LOAN',
      metadata: {
        customerName: 'Raj Malhotra',
        status: 'Frozen',
        interestRate: '2.5'
      }
    },
    {
      id: '4',
      userName: 'Sarah Williams',
      productName: null,
      type: 'loan',
      amount: '5000',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      action: 'PAYMENT',
      entityType: 'LOAN',
      metadata: {
        customerName: 'Raj Malhotra',
        transactionType: 'Cash'
      }
    }
  ];

  const handleAuthSubmit = () => {
    if (!authForm.email || !authForm.pin) {
      ShowToast('Please enter both email and PIN');
      return;
    }

    if (validateAdminAccess(authForm.email, authForm.pin)) {
      setIsAuthenticated(true);
      fetchLogs();
    } else {
      ShowToast('Invalid admin credentials');
    }
  };

  const handleAuthInputChange = ({ name, value }) => {
    setAuthForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFormInputChange = ({ name, value }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchLogs().finally(() => setRefreshing(false));
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      console.log('Fetching logs from:', MANAGE_LOGS_API.fetch);
      
      const response = await ApiRequest({
        url: MANAGE_LOGS_API.fetch,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response:', response);

      if (response.success) {
        const logsData = response.data ? [response.data] : [];
        console.log('Processed logs data:', logsData);
        setLogs(logsData);
        setDisplayLogs(logsData);
      } else {
        throw new Error(response.message || 'Failed to fetch logs');
      }
    } catch (error) {
      console.error('Error in fetchLogs:', error);
      ShowToast(error.message || 'Error fetching logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = logs.filter(log => {
      const searchLower = query.toLowerCase();
      return (
        log.userName?.toLowerCase().includes(searchLower) ||
        log.productName?.toLowerCase().includes(searchLower) ||
        log.type?.toLowerCase().includes(searchLower) ||
        log.entityType?.toLowerCase().includes(searchLower)
      );
    });
    setDisplayLogs(filtered);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    if (filter === 'ALL') {
      setDisplayLogs(logs);
    } else {
      const filtered = logs.filter(log => log.action === filter);
      setDisplayLogs(filtered);
    }
  }, [filter, logs]);

  const getEntityTypeColor = (entityType) => {
    const colorMap = {
      'PRODUCT': '#2563eb',
      'INVOICE': '#059669',
      'REPAIR': '#b45309',
      'PAYMENT': '#6d28d9',
      'LOAN': '#dc2626'
    };
    return colorMap[entityType] || '#6b7280';
  };

  const getActionColor = (action) => {
    const colorMap = {
      'CREATE': '#10b981', // Green
      'UPDATE': '#3b82f6', // Blue
      'PAYMENT': '#8b5cf6', // Purple
      'FREEZE': '#ef4444', // Red
      'DELETE': '#f97316'  // Orange
    };
    return colorMap[action] || '#6b7280';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderLogItem = ({ item }) => {
    console.log('Rendering item:', item);

    // Parse metadata if it exists and is a string
    let parsedMetadata = null;
    try {
      if (item.metadata && typeof item.metadata === 'string') {
        // First parse the string to get the escaped JSON
        const unescapedJson = JSON.parse(item.metadata);
        // Then parse the unescaped JSON string
        parsedMetadata = JSON.parse(unescapedJson);
      } else if (item.metadata && typeof item.metadata === 'object') {
        parsedMetadata = item.metadata;
      }
    } catch (error) {
      console.error('Error parsing metadata:', error);
    }

    return (
      <View 
        className="bg-white p-4 rounded-lg mb-3 shadow-sm"
        style={{
          borderLeftWidth: 4,
          borderLeftColor: getActionColor(item.action)
        }}
      >
        <View className="flex-row justify-between items-start mb-2">
          <View>
            <Text className="text-gray-800 font-medium">{item.userName}</Text>
            <View className="flex-row gap-2 mt-1">
              <Text 
                style={[
                  styles.badge, 
                  { 
                    color: getActionColor(item.action),
                    backgroundColor: `${getActionColor(item.action)}20`,
                  }
                ]}
              >
                {item.action}
              </Text>
              <Text 
                style={[
                  styles.badge, 
                  { 
                    color: getEntityTypeColor(item.entityType),
                    backgroundColor: `${getEntityTypeColor(item.entityType)}20`,
                  }
                ]}
              >
                {item.entityType.toLowerCase()}
              </Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-gray-500 text-sm">
              {formatDate(item.timestamp)}
            </Text>
            {item.updated_at && (
              <Text className="text-gray-400 text-xs mt-1">
                Updated: {formatDate(item.updated_at)}
              </Text>
            )}
          </View>
        </View>
        {item.productName && (
          <Text className="text-gray-700">Item: {item.productName}</Text>
        )}
        <Text className="text-gray-700">
          Amount: ₹{parseFloat(item.amount).toFixed(2)}
        </Text>
        <Text className="text-gray-700 capitalize">Type: {item.type}</Text>
        {item.invoiceId && (
          <Text className="text-gray-700">Invoice ID: {item.invoiceId}</Text>
        )}
        {parsedMetadata && (
          <View className="mt-2 p-2 bg-gray-50 rounded-md">
            <Text className="text-gray-700 font-medium mb-1">Additional Details:</Text>
            {parsedMetadata.oldStatus && (
              <Text className="text-gray-600">
                Status Changed: {parsedMetadata.oldStatus} → {parsedMetadata.newStatus}
              </Text>
            )}
            {parsedMetadata.customerName && (
              <Text className="text-gray-600">Customer: {parsedMetadata.customerName}</Text>
            )}
            {parsedMetadata.transactionType && (
              <Text className="text-gray-600">Payment Type: {parsedMetadata.transactionType}</Text>
            )}
            {parsedMetadata.status && (
              <Text className="text-gray-600">Status: {parsedMetadata.status}</Text>
            )}
            {parsedMetadata.interestRate && (
              <Text className="text-gray-600">Interest Rate: {parsedMetadata.interestRate}%</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>Admin Authentication Required</Text>
          <Text style={styles.authSubtitle}>Please enter your credentials to view logs</Text>
          
          <View style={styles.formContainer}>
            <InputBox
              name="email"
              placeholder="Admin Email"
              value={authForm.email}
              onChange={handleAuthInputChange}
            />
            
            <InputBox
              name="pin"
              placeholder="Admin PIN"
              value={authForm.pin}
              onChange={handleAuthInputChange}
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
            />
            
            <CommonButton
              title="Access Logs"
              onPress={handleAuthSubmit}
              isFilled
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity Logs</Text>
        <InputBox
          name="search"
          placeholder="Search by name, product, or type..."
          value={searchQuery}
          onChange={({ value }) => handleSearch(value)}
          containerStyle={styles.searchContainer}
          inputStyle={styles.searchInput}
        />
        <View style={styles.filterButtons}>
          <CommonButton
            title="All"
            onPress={() => setFilter('ALL')}
            isFilled={filter === 'ALL'}
            small
          />
          <CommonButton
            title="Created"
            onPress={() => setFilter('CREATE')}
            isFilled={filter === 'CREATE'}
            small
          />
          <CommonButton
            title="Updated"
            onPress={() => setFilter('UPDATE')}
            isFilled={filter === 'UPDATE'}
            small
          />
          <CommonButton
            title="Payment"
            onPress={() => setFilter('PAYMENT')}
            isFilled={filter === 'PAYMENT'}
            small
          />
          <CommonButton
            title="Freeze"
            onPress={() => setFilter('FREEZE')}
            isFilled={filter === 'FREEZE'}
            small
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading logs...</Text>
        </View>
      ) : (
        <FlatList
          data={displayLogs}
          renderItem={renderLogItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text>No logs found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap'
  },
  listContainer: {
    paddingVertical: 4,
    paddingHorizontal: 12
  },
  logLine: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  logText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18
  },
  bold: {
    fontWeight: 'bold'
  },
  entityType: {
    fontWeight: 'bold',
    fontSize: 12
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center'
  },
  authContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center'
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center'
  },
  authSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center'
  },
  formContainer: {
    gap: 16
  },
  badge: {
    fontWeight: '600',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase'
  },
  searchContainer: {
    marginBottom: 12,
    marginHorizontal: 8
  },
  searchInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8
  }
});

export default LogScreen;