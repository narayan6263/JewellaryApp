import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, StyleSheet } from 'react-native';
import { FontAwesome6 } from "@expo/vector-icons";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import WebView from 'react-native-webview';
import { ShowToast } from "../../../components/common/ShowToast";

const OrViewer = ({ visible, onClose, orderId, type }) => {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const getNotificationMessage = () => {
    if (type.toLowerCase() === 'order') {
      return {
        title: "Order Invoice Downloaded",
        message: "Your order invoice has been successfully saved. Keep it for your records and future reference.",
        icon: "file-invoice",
        color: "#4CAF50"
      };
    } else {
      return {
        title: "Repair Invoice Downloaded",
        message: "Your repair invoice has been successfully saved. Keep it for your records and future reference.",
        icon: "file-invoice",
        color: "#2196F3"
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

  const handleDownloadPdf = async () => {
    try {
      setPdfLoading(true);
      setDownloadProgress(0);
      
      const fileName = `${type}_${orderId}_${Date.now()}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      const downloadResumable = FileSystem.createDownloadResumable(
        `https://app.theskillsocean.com/api/order-invoice/${orderId}/pdf`,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
        }
      );

      const { uri } = await downloadResumable.downloadAsync();
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share ${type.charAt(0).toUpperCase() + type.slice(1)} PDF`,
          UTI: 'com.adobe.pdf'
        });
        setShowNotification(true);
      } else {
        ShowToast("Sharing is not available on this device");
      }
      
    } catch (error) {
      console.error("Error downloading PDF:", error);
      ShowToast("Error downloading PDF");
    } finally {
      setPdfLoading(false);
      setDownloadProgress(0);
    }
  };

  useEffect(() => {
    if (visible) {
      setPdfUrl(`https://app.theskillsocean.com/api/order-invoice/${orderId}/pdf`);
    } else {
      setPdfUrl(null);
      setShowNotification(false);
      setIsDownloaded(false);
    }
  }, [visible, orderId]);

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        <View className="bg-primary p-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={onClose}>
            <FontAwesome6 name="arrow-left" size={18} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">
            {type.charAt(0).toUpperCase() + type.slice(1)} PDF
          </Text>
          <TouchableOpacity onPress={handleDownloadPdf} disabled={pdfLoading}>
            <FontAwesome6 
              name="download" 
              size={18} 
              color={pdfLoading ? "rgba(255,255,255,0.5)" : "white"} 
            />
          </TouchableOpacity>
        </View>
        
        {pdfLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text className="mt-4 text-gray-600">
              Downloading PDF... {Math.round(downloadProgress * 100)}%
            </Text>
          </View>
        ) : pdfUrl ? (
          <WebView 
            source={{ uri: pdfUrl }}
            style={{ flex: 1 }}
            startInLoadingState={true}
            renderLoading={() => (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#4F46E5" />
              </View>
            )}
          />
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-600">PDF not available</Text>
          </View>
        )}

        <CustomNotification />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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

export default OrViewer; 