import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { FontAwesome6 } from "@expo/vector-icons";
import { handleDigitsFix } from "@/src/utils";
import { currency } from "@/src/contants";

const PDFViewer = ({ pdfUrl, onClose, title = "Bill PDF", billData }) => {
  const [error, setError] = useState(null);
  const [showSummary, setShowSummary] = useState(true);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const getNotificationMessage = () => {
    if (title.toLowerCase().includes('sale')) {
      return {
        title: "Sale Bill Downloaded",
        message: "Your sale bill has been successfully saved. Keep it for your records and future reference.",
        icon: "receipt",
        color: "#4CAF50"
      };
    } else if (title.toLowerCase().includes('purchase')) {
      return {
        title: "Purchase Bill Downloaded",
        message: "Your purchase bill has been successfully saved. Keep it for accounting and tax purposes.",
        icon: "file-invoice",
        color: "#2196F3"
      };
    } else {
      return {
        title: "Bill Downloaded",
        message: "Your bill has been successfully saved to your device's internal storage.",
        icon: "file",
        color: "#1a237e"
      };
    }
  };

  useEffect(() => {
    if (pdfUrl && !isDownloaded) {
      const timer = setTimeout(() => {
        setShowNotification(true);
        setIsDownloaded(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [pdfUrl, isDownloaded]);

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    setError('Failed to load PDF. Please try again.');
  };

  const CustomNotification = () => {
    const notification = getNotificationMessage();
    
    return (
      <Modal
        transparent={true}
        visible={showNotification}
        animationType="fade"
        onRequestClose={() => setShowNotification(false)}
      >
        <View style={styles.notificationOverlay}>
          <View style={styles.notificationContainer}>
            <View style={styles.notificationIconContainer}>
              <FontAwesome6 name={notification.icon} size={40} color={notification.color} />
            </View>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <Text style={styles.notificationMessage}>
              {notification.message}
            </Text>
            <TouchableOpacity
              style={[styles.notificationButton, { backgroundColor: notification.color }]}
              onPress={() => setShowNotification(false)}
            >
              <Text style={styles.notificationButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderBillSummary = () => {
    if (!billData) return null;

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Bill Summary</Text>
          <TouchableOpacity 
            onPress={() => setShowSummary(!showSummary)}
            style={styles.toggleButton}
          >
            <FontAwesome6 
              name={showSummary ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#1a237e" 
            />
          </TouchableOpacity>
        </View>

        {showSummary && (
          <ScrollView style={styles.summaryContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Details</Text>
              <Text style={styles.text}>Name: {billData.name || 'N/A'}</Text>
              <Text style={styles.text}>Date: {new Date(billData.created_at).toLocaleDateString()}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Items ({billData.items?.length || 0})</Text>
              {billData.items?.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.text}>{item.product?.name || 'Unnamed Product'}</Text>
                  <Text style={styles.text}>
                    {currency} {handleDigitsFix(item.net_price)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Totals</Text>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>
                  {currency} {handleDigitsFix(billData.total)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Amount Paid:</Text>
                <Text style={styles.totalValue}>
                  {currency} {handleDigitsFix(billData.amount_paid)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Balance:</Text>
                <Text style={[styles.totalValue, styles.balanceValue]}>
                  {currency} {handleDigitsFix(billData.total - billData.amount_paid)}
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <FontAwesome6 name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={{ width: 20 }} />
      </View>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => setError(null)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {renderBillSummary()}
          <WebView
            source={{ uri: pdfUrl }}
            style={styles.webview}
            onError={handleError}
          />
        </View>
      )}
      <CustomNotification />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#1a237e',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  summaryContainer: {
    width: 300,
    backgroundColor: 'white',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a237e',
  },
  toggleButton: {
    padding: 5,
  },
  summaryContent: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a237e',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  balanceValue: {
    color: '#1a237e',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  notificationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  notificationIconContainer: {
    marginBottom: 15,
  },
  notificationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 10,
  },
  notificationMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  notificationButton: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  notificationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PDFViewer; 