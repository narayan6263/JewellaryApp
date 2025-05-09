import React, { Fragment, memo, useCallback, useState, useEffect } from "react";
import BillCard from "../components/BillCard";
import BottomBar from "@/src/components/BottomBar";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Share,
} from "react-native";
import { useFocusEffect } from "expo-router";
import NoData from "@/src/components/common/NoData";
import { useDispatch, useSelector } from "react-redux";
import { TabView, SceneMap } from "react-native-tab-view";
import SectionHeader from "@/src/components/common/SectionHeader";
import { fetchInvoiceHistory } from "@/src/redux/actions/invoice.action";
import { fetchContactLoanList } from "@/src/redux/actions/loan.action";
import { currency } from "@/src/contants";
import AntDesign from "@expo/vector-icons/AntDesign";
import ManageFine from "../components/ManageFine";
import { fetchContactSummary } from "@/src/redux/actions/user.action";
import SimpleInvoiceBill from "@/src/components/SimpleInvoiceBill";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import moment from 'moment';
import FreezeLoanModal from "../components/FreezeLoanModal";
import AsyncStorage from '@react-native-async-storage/async-storage';


// Invoices List
export const BillsList = ({ navigation, fetchLoading, data }) => {
  const billItem = ({ item }) => (
    <BillCard navigation={navigation} item={item} />
  );

  return (
    <View className="pb-[85px] flex-1 px-4">
      {fetchLoading ? (
        <View className="py-5">
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      ) : data.length > 0 ? (
        <FlatList
          data={data}
          renderItem={billItem}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <NoData title="invoices" />
      )}
    </View>
  );
};

// Contact's Loans List
export const LoansList = ({ navigation, fetchLoading, data }) => {
  const { navigate } = navigation;
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('all'); // 'all', 'warning', 'normal'
  const [showBill, setShowBill] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  // Use a local state to track interest periods
  const [localInterestPeriods, setLocalInterestPeriods] = useState({});
  const [freezeModalVisible, setFreezeModalVisible] = useState(false);
  const [currentFreezePeriod, setCurrentFreezePeriod] = useState(null);
  const [currentDate, setCurrentDate] = useState(moment().format('YYYY-MM-DD'));
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key to force re-render

  // Load saved interest periods from AsyncStorage when component mounts
  useEffect(() => {
    loadAllInterestPeriods();
  }, []);

  // Load all interest periods for all loans from AsyncStorage
  const loadAllInterestPeriods = async () => {
    try {
      // Filter for loan interest periods keys
      const keys = (await AsyncStorage.getAllKeys()).filter(key => 
        key.startsWith('loan_interest_periods_')
      );
      
      if (keys.length > 0) {
        const periodsMap = {};
        
        // Get all items for those keys
        const stores = await AsyncStorage.multiGet(keys);
        stores.forEach(([key, value]) => {
          if (value) {
            const loanId = key.replace('loan_interest_periods_', '');
            try {
              periodsMap[loanId] = JSON.parse(value);
              console.log(`Loaded interest periods for loan ${loanId}:`, periodsMap[loanId]);
            } catch (e) {
              console.error(`Error parsing interest periods for loan ${loanId}:`, e);
            }
          }
        });
        
        setLocalInterestPeriods(periodsMap);
      }
    } catch (error) {
      console.error("Error loading interest periods from AsyncStorage:", error);
    }
  };

  // Save interest periods for a specific loan to AsyncStorage
  const saveInterestPeriods = async (loanId, periods) => {
    try {
      const storageKey = `loan_interest_periods_${loanId}`;
      await AsyncStorage.setItem(storageKey, JSON.stringify(periods));
      console.log(`Saved interest periods for loan ${loanId}:`, periods);
    } catch (error) {
      console.error(`Error saving interest periods for loan ${loanId}:`, error);
    }
  };

  // Filter the data based on selected filter
  const filteredData = data.filter(item => {
    const totalAmount = Number(item?.valuation_amount || 0) + Number(item?.interest_amount || 0) + Number(item?.loan_amount || 0);
    
    if (filter === 'warning') {
      return item?.valuation_amount >= totalAmount; // Red background items
    } else if (filter === 'normal') {
      return item?.valuation_amount < totalAmount; // Yellow background items
    }
    return true; // Show all items when filter is 'all'
  });

  // Refresh loan data after a specific loan ID is updated
  const refreshLoanData = async (loanId) => {
    try {
      // Dispatch action to fetch updated loan data for this contact
      if (data && data.length > 0 && data[0].user_contact_id) {
        const contactId = data[0].user_contact_id;
        await dispatch(fetchContactLoanList(contactId));
        
        // If we're viewing a loan bill, update the selected loan data
        if (selectedLoan && selectedLoan.id === loanId) {
          const updatedLoan = data.find(loan => loan.id === loanId);
          if (updatedLoan) {
            setSelectedLoan(updatedLoan);
          }
        }
      }
    } catch (error) {
      console.error("Error refreshing loan data:", error);
      ShowToast("Failed to refresh loan data");
    }
  };

  // Handle data updates from child components
  const handleDataUpdated = (updatedData) => {
    if (updatedData && updatedData.id) {
      setSelectedLoan(updatedData);
      refreshLoanData(updatedData.id);
    }
  };

  // When viewing a bill, prepare the interest periods
  const handleViewBill = (loan) => {
    // Set the selected loan immediately
    setSelectedLoan(loan);
    
    // Show the modal immediately
    setShowBill(true);
    
    // Load interest periods in the background
    loadInterestPeriodsForLoan(loan.id);
  };

  // Load interest periods for a specific loan
  const loadInterestPeriodsForLoan = async (loanId) => {
    try {
      const storageKey = `loan_interest_periods_${loanId}`;
      const storedPeriods = await AsyncStorage.getItem(storageKey);
      
      if (storedPeriods) {
        const periods = JSON.parse(storedPeriods);
        setSelectedLoan(prev => ({
          ...prev,
          interest_periods: periods
        }));
      }
    } catch (error) {
      console.error("Error loading interest periods:", error);
    }
  };

  const loanItem = ({ item }) => {
    // Calculate total amount including interest and loan amount
    const totalAmount = Number(item?.valuation_amount || 0) + Number(item?.interest_amount || 0) + Number(item?.loan_amount || 0);
    
    // Determine background color based on valuation vs total amount
    const backgroundColor = item?.valuation_amount < totalAmount 
      ? '#fff9c4'  // Light yellow if valuation < total amount
      : '#ffebee'; // Light red if valuation >= total amount
    
    // Determine status text color and message
    const statusColor = item?.valuation_amount < totalAmount ? '#f57f17' : '#d32f2f';
    const statusMessage = item?.valuation_amount < totalAmount 
      ? 'Normal: Valuation < Total Amount'
      : 'Warning: Valuation ≥ Total Amount';

    return (
      <View className="border-b bg-white border-gray-4" style={{ backgroundColor }}>
        {/* Status indicator */}
        <View className="px-3 pt-2">
          <Text style={{ color: statusColor, fontSize: 12, fontWeight: '500' }}>
            {statusMessage}
          </Text>
        </View>

        {/* id, view, valuation */}
        <View className="p-3">
          <View className="flex flex-row items-center justify-between w-full pb-2">
            <Text className="text-gray-6 text-lg tracking-wide font-medium">
              #{item.id}
            </Text>
            <Text className="font-medium flex-col tracking-wide">
              {item?.loan_details_data?.length} Items
            </Text>
            <View className="flex-row space-x-4">
              <TouchableOpacity
                onPress={() => navigate("LoanDetails", item)}
                activeOpacity={0.6}
              >
                <AntDesign name="eye" color="black" size={20} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleViewBill(item)}
                activeOpacity={0.6}
                style={{
                  backgroundColor: '#4CAF50',
                  padding: 6,
                  borderRadius: 4,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <AntDesign name="filetext1" color="white" size={16} />
                <Text style={{ color: 'white', marginLeft: 4, fontSize: 12 }}>View Bill</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex flex-row items-center space-y-1.5 flex-wrap w-[100%]">
            {/* valuation */}
            <View className="flex items-center w-1/2 flex-row space-x-2">
              <Text className="text-gray-500 flex-col tracking-wide">
                Valuation :
              </Text>
              <Text className="font-medium flex-col tracking-wide">
                {currency}
                {item?.valuation_amount || 0}
              </Text>
            </View>

            {/* rate */}
            <View className="flex items-center w-1/2 flex-row space-x-2">
              <Text className="text-gray-500 flex-col tracking-wide">
                Interest rate :
              </Text>
              <Text className="font-medium flex-col tracking-wide">
                {item?.interest_rate || 0}%
              </Text>
            </View>

            {/* loan_amount */}
            <View className="flex items-center w-1/2 flex-row space-x-2">
              <Text className="text-gray-500 flex-col tracking-wide">
                Loan Amount :
              </Text>
              <Text className="font-medium flex-col tracking-wide">
                {currency}
                {item?.loan_amount || 0}
              </Text>
            </View>

            {/* date */}
            <View className="flex items-center w-1/2 flex-row space-x-2">
              <Text className="text-gray-500 flex-col tracking-wide">
                Interest upto :
              </Text>
              <Text className="font-medium flex-col tracking-wide">
                {item?.interest_upto}
              </Text>
            </View>

            {/* Total Amount */}
            <View className="flex items-center w-full flex-row space-x-2 mt-2 pt-2 border-t border-gray-200">
              <Text className="text-gray-500 flex-col tracking-wide">
                Total Amount :
              </Text>
              <Text className="font-medium flex-col tracking-wide">
                {currency}
                {totalAmount}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Function to generate HTML content for the bill that matches ProfessionalInvoiceBill.jsx
  const generateBillHTML = (loan) => {
    const totalAmount = Number(loan?.valuation_amount || 0) + Number(loan?.interest_amount || 0) + Number(loan?.loan_amount || 0);
    const totalPaid = (loan?.payments || []).reduce((total, payment) => total + parseFloat(payment.amount || 0), 0);
    const balance = totalAmount - totalPaid;
    
    // Determine background color based on valuation vs total amount
    const getBackgroundColor = () => {
      if (loan?.valuation_amount >= totalAmount) {
        return '#ffebee'; // Light red background
      } else {
        return '#fff9c4'; // Light yellow background
      }
    };
    
    const backgroundColor = getBackgroundColor();
    const statusText = loan?.valuation_amount >= totalAmount 
      ? 'Warning: Valuation exceeds or equals total amount'
      : 'Normal: Valuation is less than total amount';
    const statusColor = loan?.valuation_amount >= totalAmount ? '#d32f2f' : '#f57f17';
    
    // Generate interest periods HTML
    let interestPeriodsHTML = '';
    
    // Use the interest periods from the loan which should include locally stored ones
    if (loan?.interest_periods && Array.isArray(loan.interest_periods)) {
      interestPeriodsHTML = loan.interest_periods.map((period, index) => `
        <div class="interest-details-row">
          <div class="interest-column">
            <div class="interest-label">Interest Period ${index + 1}</div>
            <div class="interest-value">Interest</div>
          </div>
          <div class="interest-column">
            <div class="interest-label">Date</div>
            <div class="interest-value">${period.interest_upto ? moment(period.interest_upto).format('DD/MM/YY') : moment().format('DD/MM/YY')}</div>
          </div>
          <div class="interest-column">
            <div class="interest-label">On Amount</div>
            <div class="interest-value">₹${period.base_amount || 0}</div>
          </div>
          <div class="interest-column">
            <div class="interest-label">Interest Rate (${period.interest_rate || 0}%)</div>
            <div class="interest-value">₹${period.interest_amount || 0}</div>
          </div>
        </div>
      `).join('');
    } else if (typeof loan?.interest_periods === 'string') {
      // If it's stored as a JSON string, parse it
      try {
        const periods = JSON.parse(loan.interest_periods);
        if (Array.isArray(periods)) {
          interestPeriodsHTML = periods.map((period, index) => `
            <div class="interest-details-row">
              <div class="interest-column">
                <div class="interest-label">Interest Period ${index + 1}</div>
                <div class="interest-value">Interest</div>
              </div>
              <div class="interest-column">
                <div class="interest-label">Date</div>
                <div class="interest-value">${period.interest_upto ? moment(period.interest_upto).format('DD/MM/YY') : moment().format('DD/MM/YY')}</div>
              </div>
              <div class="interest-column">
                <div class="interest-label">On Amount</div>
                <div class="interest-value">₹${period.base_amount || 0}</div>
              </div>
              <div class="interest-column">
                <div class="interest-label">Interest Rate (${period.interest_rate || 0}%)</div>
                <div class="interest-value">₹${period.interest_amount || 0}</div>
              </div>
            </div>
          `).join('');
        }
      } catch (e) {
        console.error("Error parsing interest periods:", e);
      }
    }
    
    // Include freeze loan button in the interest section header
    const interestSectionHeader = `
      <div class="interest-section-header">
        <div class="interest-section-title">INTEREST PERIODS</div>
      </div>
    `;
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { 
              font-family: 'Helvetica'; 
              padding: 20px; 
              background-color: ${backgroundColor}; 
              margin: 0;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 16px;
              background-color: ${backgroundColor};
            }
            .main-header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #000;
              padding-bottom: 16px;
              margin-bottom: 16px;
            }
            .header-left { flex: 1; }
            .header-right { text-align: right; }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #000;
              margin-bottom: 4px;
            }
            .company-address, .company-contact {
              font-size: 12px;
              color: #666;
            }
            .bill-title {
              font-size: 20px;
              font-weight: bold;
              color: #000;
              margin-bottom: 8px;
            }
            .bill-no, .date-text {
              font-size: 14px;
              color: #444;
            }
            .status-container {
              padding: 12px;
              margin-bottom: 16px;
              border-radius: 8px;
              border: 1px solid #ddd;
            }
            .status-label {
              font-size: 14px;
              font-weight: 600;
              color: #444;
              margin-bottom: 4px;
            }
            .status-value {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 8px;
              color: ${statusColor};
            }
            .status-details {
              display: flex;
              justify-content: space-between;
              padding-top: 8px;
              border-top: 1px solid #eee;
            }
            .status-text { font-size: 14px; color: #666; }
            .customer-box {
              border: 1px solid #ddd;
              border-radius: 8px;
              margin-bottom: 16px;
            }
            .customer-header {
              background-color: #f5f5f5;
              padding: 8px;
              border-top-left-radius: 8px;
              border-top-right-radius: 8px;
            }
            .customer-header-text {
              font-size: 14px;
              font-weight: 600;
              color: #444;
            }
            .customer-content { padding: 12px; }
            .customer-name {
              font-size: 16px;
              font-weight: 600;
              color: #000;
              margin-bottom: 4px;
            }
            .customer-address, .customer-contact {
              font-size: 14px;
              color: #666;
            }
            .items-section { margin-bottom: 16px; }
            .items-header {
              display: flex;
              background-color: #f5f5f5;
              padding: 8px;
              border-radius: 4px;
            }
            .column-header {
              font-size: 12px;
              font-weight: 600;
              color: #444;
            }
            .item-row {
              display: flex;
              border-bottom: 1px solid #eee;
              padding: 8px 0;
              align-items: center;
            }
            .item-name {
              font-size: 14px;
              color: #000;
              margin-bottom: 2px;
            }
            .item-details {
              font-size: 12px;
              color: #666;
            }
            .item-weight {
              font-size: 14px;
              color: #000;
              text-align: center;
            }
            .item-amount {
              font-size: 14px;
              color: #000;
              text-align: right;
            }
            .interest-section {
              margin-bottom: 16px;
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 12px;
            }
            .interest-section-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 1px solid #eee;
            }
            .interest-section-title {
              font-size: 14px;
              font-weight: bold;
              color: #444;
            }
            .interest-details-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 12px;
              padding-bottom: 12px;
              border-bottom: 1px solid #eee;
            }
            .interest-column {
              flex: 1;
              text-align: center;
            }
            .interest-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 4px;
              text-align: center;
            }
            .interest-value {
              font-size: 14px;
              color: #000;
              font-weight: 500;
              text-align: center;
            }
            .loan-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
            }
            .final-amount-box {
              border: 1px solid #000;
              padding: 12px;
              border-radius: 8px;
              margin-bottom: 16px;
            }
            .final-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
            }
            .final-label, .final-value {
              font-size: 14px;
              font-weight: 600;
              color: #000;
            }
            .balance-row {
              border-top: 1px solid #000;
              margin-top: 8px;
              padding-top: 8px;
            }
            .balance-label, .balance-value {
              font-size: 16px;
              font-weight: bold;
              color: #000;
            }
            .terms-section { margin-bottom: 24px; }
            .terms-header {
              font-size: 14px;
              font-weight: 600;
              color: #000;
              margin-bottom: 8px;
            }
            .terms-text {
              font-size: 12px;
              color: #666;
              margin-bottom: 4px;
            }
            .signature-section {
              display: flex;
              justify-content: space-between;
              margin-top: 32px;
            }
            .signature-box {
              text-align: center;
              width: 40%;
            }
            .signature-text {
              font-size: 14px;
              color: #000;
              border-top: 1px solid #000;
              padding-top: 8px;
              text-align: center;
            }
            .flex-2 { flex: 2; }
            .flex-1 { flex: 1; }
            .current-period-row {
              border-top: 1px solid #ddd;
              margin-top: 12px;
              padding-top: 12px;
            }
            .current-period-label {
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Main Header -->
            <div class="main-header">
              <div class="header-left">
            <div class="company-name">TANISHQ AMANAT</div>
                <div class="company-address">123 Jewelry Street, City - 400001</div>
                <div class="company-contact">Contact: +91 9876543210</div>
              </div>
              <div class="header-right">
                <div class="bill-title">JEWELLERY BILL</div>
                <div class="bill-no">Bill No: ${loan.id}</div>
                <div class="date-text">Date: ${loan.interest_upto || new Date().toLocaleDateString()}</div>
              </div>
            </div>

            <!-- Status Indicator -->
            <div class="status-container">
              <div class="status-label">Status:</div>
              <div class="status-value">${statusText}</div>
              <div class="status-details">
                <div class="status-text">Valuation: ₹${loan?.valuation_amount || 0}</div>
                <div class="status-text">Total Amount: ₹${totalAmount}</div>
              </div>
          </div>
          
            <!-- Customer Details Box -->
            <div class="customer-box">
              <div class="customer-header">
                <div class="customer-header-text">CUSTOMER DETAILS</div>
              </div>
              <div class="customer-content">
                <div class="customer-name">${loan?.customer_name || "Customer Name"}</div>
                <div class="customer-address">${loan?.address || "Customer Address"}</div>
                <div class="customer-contact">${loan?.contact || "Contact Number"}</div>
              </div>
          </div>
          
            <!-- Items Section -->
            <div class="items-section">
              <div class="items-header">
                <div class="column-header flex-2">ITEM DESCRIPTION</div>
                <div class="column-header flex-1">WEIGHT</div>
                <div class="column-header flex-1">AMOUNT</div>
          </div>
          
              ${(loan?.loan_details_data || []).map(item => `
                <div class="item-row">
                  <div class="flex-2">
                    <div class="item-name">${item.name || `Item`}</div>
                    <div class="item-details">Touch: ${item.tounch}%</div>
                  </div>
                  <div class="item-weight flex-1">
                    ${item.gross_weight} gm
                  </div>
                  <div class="item-amount flex-1">
                    ₹${item.valuation || 0}
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Interest and Loan Section -->
            <div class="interest-section">
              ${interestSectionHeader}
              
              <!-- Previous Interest Periods -->
              ${interestPeriodsHTML}
              
              <!-- Current Period -->
              <div class="interest-details-row current-period-row">
                <div class="interest-column">
                  <div class="interest-label current-period-label">Current Period</div>
                  <div class="interest-value">Interest</div>
                </div>
                <div class="interest-column">
                  <div class="interest-label">Date</div>
                  <div class="interest-value">${loan?.interest_upto || new Date().toLocaleDateString()}</div>
                </div>
                <div class="interest-column">
                  <div class="interest-label">On Amount</div>
                  <div class="interest-value">₹${loan?.valuation_amount || 0}</div>
                </div>
                <div class="interest-column">
                  <div class="interest-label">Interest (${loan?.interest_rate || 0}%)</div>
                  <div class="interest-value">₹${loan?.interest_amount || 0}</div>
                </div>
              </div>
              
              ${Number(loan?.loan_amount || 0) > 0 ? `
                <div class="loan-row">
                  <div class="interest-label">Additional Loan Amount:</div>
                  <div class="interest-value">₹${loan?.loan_amount || 0}</div>
                </div>
              ` : ''}
            </div>
          
            <!-- Final Amount Box -->
            <div class="final-amount-box">
              <div class="final-row">
                <div class="final-label">TOTAL AMOUNT</div>
                <div class="final-value">₹${totalAmount}</div>
              </div>
              <div class="final-row">
                <div class="final-label">Amount Paid</div>
                <div class="final-value">₹${totalPaid}</div>
              </div>
              <div class="final-row balance-row">
                <div class="balance-label">Balance Due</div>
                <div class="balance-value">₹${balance}</div>
              </div>
            </div>

            <!-- Terms and Conditions -->
            <div class="terms-section">
              <div class="terms-header">Terms & Conditions:</div>
              <div class="terms-text">1. Interest will be charged at ${loan?.interest_rate || 0}% per annum</div>
              <div class="terms-text">2. Please keep this bill safe for future reference</div>
            </div>

            <!-- Signature Section -->
            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-text">Customer's Signature</div>
              </div>
              <div class="signature-box">
                <div class="signature-text">Authorized Signatory</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // Function to generate and save PDF
  const handleGeneratePDF = async () => {
    try {
      const html = generateBillHTML(selectedLoan);
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false
      });
      
      const pdfName = `bill_${selectedLoan.id}_${Date.now()}.pdf`;
      const pdfPath = `${FileSystem.documentDirectory}${pdfName}`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: pdfPath
      });
      
      // Share the PDF
      await Sharing.shareAsync(pdfPath, {
        mimeType: 'application/pdf',
        dialogTitle: 'View your bill',
        UTI: 'com.adobe.pdf'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    }
  };

  // Function to print the bill
  const handlePrint = async () => {
    try {
      const html = generateBillHTML(selectedLoan);
      await Print.printAsync({
        html,
      });
    } catch (error) {
      console.error('Error printing:', error);
      alert('Failed to print');
    }
  };

  // Function to share the bill
  const handleShare = async () => {
    try {
      // Generate PDF using the same logic as handleGeneratePDF
      const html = generateBillHTML(selectedLoan);
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false
      });
      
      const pdfName = `bill_${selectedLoan.id}_${Date.now()}.pdf`;
      const pdfPath = `${FileSystem.documentDirectory}${pdfName}`;
      
      await FileSystem.moveAsync({
        from: uri,
        to: pdfPath
      });
      
      // Share the PDF file
      await Sharing.shareAsync(pdfPath, {
        mimeType: 'application/pdf',
        dialogTitle: `Share Bill #${selectedLoan.id}`,
        UTI: 'com.adobe.pdf'
      });
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to share');
    }
  };

  // Handle adding a freeze period
  const handleAddFreezePeriod = (period) => {
    setCurrentFreezePeriod(period);
    setFreezeModalVisible(true);
  };

  // Handle submitting a freeze period
  const handleSubmitFreezePeriod = (newPeriod) => {
    if (!selectedLoan || !selectedLoan.id) return;
    
    // Get existing periods for this loan
    const loanId = selectedLoan.id;
    const existingPeriods = localInterestPeriods[loanId] || [];
    
    // Add the new period
    const updatedPeriods = [...existingPeriods, newPeriod];
    
    // Update the local state
    setLocalInterestPeriods(prev => ({
      ...prev,
      [loanId]: updatedPeriods
    }));
    
    // Also save to AsyncStorage for persistence
    saveInterestPeriods(loanId, updatedPeriods);
    
    // Update the selected loan to show the new period immediately
    setSelectedLoan(prev => ({
      ...prev,
      interest_periods: updatedPeriods
    }));
  };

  // Handle date change for the freeze period
  const handleDateChange = (date) => {
    setCurrentDate(date);
    
    // Also update the current freeze period
    if (currentFreezePeriod) {
      // Calculate interest for the new date
      const baseAmount = Number(selectedLoan?.valuation_amount || 0);
      const interestRate = parseFloat(selectedLoan?.interest_rate || 0);
      
      const startDate = moment(selectedLoan?.interest_upto);
      const endDate = moment(date);
      
      // Calculate days between dates
      const days = endDate.diff(startDate, 'days') + 1;
      
      // Daily interest calculation
      const dailyRate = (interestRate / 100) / 365;
      const interest = baseAmount * dailyRate * days;
      
      setCurrentFreezePeriod({
        ...currentFreezePeriod,
        interest_upto: date,
        interest_amount: handleDigitsFix(interest)
      });
    }
  };

  return (
    <View className="flex-1">
      {/* Filter Bar */}
      <View className="flex-row justify-around p-2 bg-white border-b border-gray-200">
        <TouchableOpacity 
          onPress={() => setFilter('all')}
          style={{ 
            backgroundColor: filter === 'all' ? '#e0e0e0' : 'transparent',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20
          }}
        >
          <Text style={{ color: filter === 'all' ? '#000' : '#666' }}>All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setFilter('warning')}
          style={{ 
            backgroundColor: filter === 'warning' ? '#ffebee' : 'transparent',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20
          }}
        >
          <Text style={{ color: '#d32f2f' }}>Red</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setFilter('normal')}
          style={{ 
            backgroundColor: filter === 'normal' ? '#fff9c4' : 'transparent',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20
          }}
        >
          <Text style={{ color: '#f57f17' }}>Yellow</Text>
        </TouchableOpacity>
      </View>

      <View className="pb-[85px] flex-1 px-4">
        {fetchLoading ? (
          <View className="py-5">
            <ActivityIndicator size="small" color="#0000ff" />
          </View>
        ) : filteredData.length > 0 ? (
          <FlatList
            data={filteredData}
            renderItem={loanItem}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
          />
        ) : (
          <NoData title="loans" />
        )}
      </View>

      {/* Bill Modal */}
      <Modal
        visible={showBill}
        animationType="slide"
        onRequestClose={() => setShowBill(false)}
        onDismiss={() => {}}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <TouchableOpacity 
              onPress={() => {
                setShowBill(false);
                setSelectedLoan(null);
              }}
            >
              <AntDesign name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold">Loan Bill</Text>
            <View className="w-6" />
          </View>
          <ScrollView className="flex-1">
            {selectedLoan && (
              <SimpleInvoiceBill
                data={selectedLoan}
                formValue={{
                  loan_amount: selectedLoan.loan_amount,
                  valuation: selectedLoan.valuation_amount,
                  loan_percentage: selectedLoan.loan_percentage,
                  interest_amount: selectedLoan.interest_amount,
                  interest_rate: selectedLoan.interest_rate
                }}
              />
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Freeze Loan Modal */}
      <FreezeLoanModal
        open={freezeModalVisible}
        onClose={() => setFreezeModalVisible(false)}
        loanData={currentFreezePeriod}
        currentDate={currentDate}
        onDateChange={handleDateChange}
        onDateUpdate={handleDateChange}
        onSubmitSuccess={handleSubmitFreezePeriod}
      />
    </View>
  );
};

// User Summary
export const Summary = ({ data, user_contact_id }) => {
  const [modal, setModal] = useState({ rateCut: false, convertMetal: false });
  const handleModal = (key, value) => {
    setModal({ ...modal, [key]: value });
  };
  return (
    <ScrollView className="bg-white">
      {data ? (
        <View className="py-5 pb-[100px] bg-white">
          {/* Profile details */}
          <View className="p-5 pt-0">
            <Text className="text-primary text-lg font-medium text-center tracking-wider mb-4">
              Profile Details
            </Text>
            {/* Invoices */}
            <View className="rounded-md bg-primary/10 border border-gray-1">
              <Text className="text-left border-b font-medium tracking-wider border-gray-4 p-2.5 px-4">
                Invoices
              </Text>
              <View className="space-y-1 p-3">
                <View className="flex flex-row justify-between">
                  <Text className="text-left">Total Invoices</Text>
                  <Text className="text-left">
                    {Number(data?.sale_invoice_count) +
                      Number(data?.purchase_invoice_count)}
                  </Text>
                </View>
                <View className="flex flex-row justify-between">
                  <Text className="text-left">Sale Invoices</Text>
                  <Text className="text-left">{data?.sale_invoice_count}</Text>
                </View>
                <View className="flex flex-row justify-between">
                  <Text className="text-left">Loan Invoices</Text>
                  <Text className="text-left">{data?.loan_count}</Text>
                </View>
                <View className="flex flex-row justify-between">
                  <Text className="text-left">Purchase Invoices</Text>
                  <Text className="text-left">
                    {data?.purchase_invoice_count}
                  </Text>
                </View>
                <View className="flex flex-row justify-between">
                  <Text className="text-left">Balance Amount</Text>
                  <Text className="text-left">
                    {currency} {data?.amount}
                  </Text>
                </View>
              </View>
            </View>

            {/* Fine */}
            <View className="mt-3 rounded-md bg-primary/10 border border-gray-1">
              <Text className="text-left border-b font-medium tracking-wider border-gray-4 p-2.5 px-4">
                Fine
              </Text>
              <View className="space-y-1 p-3">
                <View className="flex flex-row justify-between">
                  <Text className="text-left">Gold</Text>
                  <Text className="text-left">{data?.gold_fine}g</Text>
                </View>
                <View className="flex flex-row justify-between">
                  <Text className="text-left">Silver</Text>
                  <Text className="text-left">{data?.silver_fine}g</Text>
                </View>
              </View>
            </View>

            {/* Personal */}
            <View className="mt-3 rounded-md bg-primary/10 border border-gray-1">
              <Text className="text-left border-b font-medium tracking-wider border-gray-4 p-2.5 px-4">
                Personal
              </Text>
              <View className="space-y-1 p-3">
                <View className="flex flex-row justify-between">
                  <Text className="text-left">Phone</Text>
                  <Text className="text-left">{data?.phone}</Text>
                </View>
                <View className="flex flex-row justify-between">
                  <Text className="text-left">Email</Text>
                  <Text className="text-left">{data?.email}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* rate cut & convert metal */}
          <View className="p-5 pt-0 flex items-center justify-between flex-row">
            <TouchableOpacity
              onPress={() => handleModal("rateCut", true)}
              activeOpacity={0.5}
            >
              <View className="border px-3 flex-row py-2 flex items-center rounded-md border-primary ">
                <Text className="text-primary pl-1 uppercase tracking-wider font-semibold">
                  Rate Cut
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleModal("convertMetal", true)}
              activeOpacity={0.5}
            >
              <View className="border flex flex-row space-x-2 px-4 py-2 rounded-md border-primary">
                <Text className="text-primary tracking-wider font-medium uppercase">
                  Convert to metal
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <ManageFine
            title={modal?.convertMetal ? "Convert To Metal" : "Rate Cut"}
            open={modal?.convertMetal || modal?.rateCut}
            isRateCut={modal?.rateCut}
            userData={{
              id: user_contact_id,
              balance: data?.user_contact_data?.amount,
            }}
            onClose={() =>
              setModal({ ...modal, rateCut: false, convertMetal: false })
            }
          />
        </View>
      ) : (
        <NoData title="summary" />
      )}
    </ScrollView>
  );
};

const Details = ({ navigation, route }) => {
  const userData = route.params;
  const dispatch = useDispatch();
  const layout = Dimensions.get("window");
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { title: "Invoices", key: "invoices" },
    { title: "Loans", key: "loan" },
    { title: "Summary", key: "summary" },
  ]);
  const { invoiceHistory, fetchLoading } = useSelector(
    (state) => state.invoiceSlices
  );
  const { summaryData, fetchLoading: summaryLoading } = useSelector(
    (state) => state.userSlices
  );

  const { contactLoanHistory, fetchLoading: loanLoading } = useSelector(
    (state) => state.loanSlices
  );

  const renderScene = SceneMap({
    invoices: () => (
      <BillsList
        data={invoiceHistory || []}
        fetchLoading={fetchLoading}
        navigation={navigation}
      />
    ),
    summary: () => (
      <Summary
        data={summaryData}
        user_contact_id={userData?.user_contact_id || userData?.id}
      />
    ),
    loan: () => (
      <LoansList
        data={contactLoanHistory || []}
        fetchLoading={loanLoading}
        navigation={navigation}
      />
    ),
  });

  // tabs list
  const renderTabBar = (props) => (
    <View className="bg-primary flex-row justify-around">
      {props.navigationState.routes.map((route, i) => (
        <TouchableOpacity
          key={route.key}
          className={`px-4 pb-3 pt-1.5 flex-1 items-center ${
            index === i && "border-b-4 border-orange-400"
          }`}
          onPress={() => setIndex(i)}
        >
          <Text className="text-white uppercase font-medium tracking-wider text-base">
            {route.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Fetch contact's invoices on mount
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchContactLoanList(userData?.user_contact_id || userData?.id));
      dispatch(fetchInvoiceHistory(userData?.user_contact_id || userData?.id));
      dispatch(fetchContactSummary(userData?.user_contact_id || userData?.id));
    }, [dispatch, userData, index])
  );
  return (
    <Fragment>
      <SectionHeader
        title={userData?.user_contacts_data?.name || userData?.name || ""}
        navigation={navigation}
      />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
      />
      <BottomBar navigation={navigation} />
    </Fragment>
  );
};

export default memo(Details);
