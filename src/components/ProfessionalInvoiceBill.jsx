import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView, ScrollView } from 'react-native';
import { handleDigitsFix } from "../utils";
import moment from "moment";
import AntDesign from "@expo/vector-icons/AntDesign";
import FreezeLoanModal from "../screens/home/components/FreezeLoanModal";
import InputBox from "./common/InputBox";
import SelectInput from "./common/SelectInput";
import CommonButton from "./common/buttons/CommonButton";
import { useDispatch, useSelector } from "react-redux";
import DatePickerComponent from "./common/DateTimePicker";
import ShowToast from "./common/ShowToast";
import { ApiRequest } from "../utils/api";
import { MANAGE_LOAN_API, MANAGE_LOGS_API } from "../utils/api/endpoints";
import { validateCashTransaction } from "../utils/validators/loanValidators";
import { addCashTransaction, fetchLoanCashTransactions, fetchIntrestTillToday } from "../redux/actions/loan.action";

// Function to calculate interest for a period
const calculateInterest = (baseAmount, days, interestRate = 2) => {
  const dailyRate = interestRate / (100 * 365);
  return handleDigitsFix(baseAmount * dailyRate * days);
};

const ProfessionalInvoiceBill = ({ data, invoices, formValue, payments = [], onAddFreezePeriod = null, onDataUpdated = null }) => {
  const dispatch = useDispatch();
  const [interestPeriods, setInterestPeriods] = useState([]);
  const [showAddPeriod, setShowAddPeriod] = useState(false);
  const [newPeriod, setNewPeriod] = useState(null);
  const [showFreezeLoanModal, setShowFreezeLoanModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [modalData, setModalData] = useState(null);
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashTransactions, setCashTransactions] = useState([]);
  const [modalState, setModalState] = useState({ cashDatePicker: false });
  const [newCashTransaction, setNewCashTransaction] = useState({
    amount: '',
    type: { label: "Given", value: "1" },
    date: moment().format('YYYY-MM-DD')
  });
  const [testResults, setTestResults] = useState(null);
  
  // Get cash transactions and loading state from Redux
  const { cashTransactions: reduxCashTransactions, loading, cashTransactionLoading, intrestTillToday } = useSelector(
    (state) => state.loanSlices
  );

  // Add new state for transaction history
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loanBalance, setLoanBalance] = useState(0);

  // Load cash transactions when component mounts or when refreshing is needed
  useEffect(() => {
    if (data?.id) {
      dispatch(fetchLoanCashTransactions(data.id));
    }
  }, [data?.id, dispatch]);

  // Update local cash transactions when Redux state changes
  useEffect(() => {
    if (data?.id && reduxCashTransactions && reduxCashTransactions[data.id]) {
      setCashTransactions(reduxCashTransactions[data.id]);
    }
  }, [reduxCashTransactions, data?.id]);

  // Fetch interest data when needed
  const fetchInterestData = useCallback(() => {
    if (data?.id) {
      dispatch(fetchIntrestTillToday(data.id));
    }
  }, [data?.id, dispatch]);

  // Load initial transaction history
  useEffect(() => {
    if (data?.id) {
      // Combine freeze periods and cash transactions into one sorted history
      const history = [
        // Initial loan entry
        {
          date: data.created_at,
          type: 'Initial Loan',
          baseAmount: Number(formValue.loan_amount || 0),
          cashAmount: 0,
          interest: 0,
          newBalance: Number(formValue.loan_amount || 0),
          days: 0,
          notes: 'Loan starts'
        },
        // Add freeze periods
        ...(interestPeriods || []).map((period, index) => ({
          date: period.interest_upto,
          type: 'Freeze Period',
          baseAmount: Number(period.base_amount || 0),
          cashAmount: 0,
          interest: Number(period.interest_amount || 0),
          newBalance: Number(period.base_amount || 0) + Number(period.interest_amount || 0),
          days: moment(period.interest_upto).diff(
            index === 0 ? data.created_at : interestPeriods[index - 1].interest_upto,
            'days'
          ),
          notes: `Interest from ${moment(index === 0 ? data.created_at : interestPeriods[index - 1].interest_upto).format('DD/MM/YY')} to ${moment(period.interest_upto).format('DD/MM/YY')}`
        })),
        // Add cash transactions
        ...(cashTransactions || []).map(transaction => ({
          date: transaction.date,
          type: transaction.type === "1" ? 'Cash Given' : 'Cash Received',
          baseAmount: Number(transaction.base_amount || 0),
          cashAmount: Number(transaction.amount || 0) * (transaction.type === "1" ? 1 : -1),
          interest: 0,
          newBalance: Number(transaction.new_balance || 0),
          days: 0,
          notes: transaction.type === "1" ? 'Increased base amount' : 'Reduced base amount'
        }))
      ].sort((a, b) => moment(a.date).valueOf() - moment(b.date).valueOf());

      setTransactionHistory(history);
      
      // Set loan balance from the last transaction
      if (history.length > 0) {
        setLoanBalance(history[history.length - 1].newBalance);
      }
    }
  }, [data?.id, interestPeriods, cashTransactions, formValue.loan_amount]);

  // Handle adding new cash transaction
  const handleAddCash = async () => {
    // Check if loan_id is available
    if (!data || !data.id) {
      ShowToast("Loan ID is not available. Please reload or check loan details.");
      return;
    }

    const transactionData = {
      loan_id: data.id,
      amount: newCashTransaction.amount,
      type: newCashTransaction.type.value,
      date: newCashTransaction.date
    };

    // Validate transaction data
    const validationResult = validateCashTransaction(transactionData);
    if (!validationResult.isValid) {
      // Show validation errors
      const errorMessages = Object.values(validationResult.errors);
      ShowToast(errorMessages[0]); // Show the first error
      return;
    }

    // Dispatch the action to add cash transaction
    dispatch(addCashTransaction({
      payload: transactionData,
      callback: (updatedData) => {
        // Clear form and close modal
        setShowCashModal(false);
        setNewCashTransaction({
          amount: '',
          type: { label: "Given", value: "1" },
          date: moment().format('YYYY-MM-DD')
        });
        
        // If we have a callback, pass the updated data
        if (onDataUpdated) {
          onDataUpdated({
            ...data,
            cashTransactions: reduxCashTransactions[data.id] || []
          });
        }
      }
    }));
  };

  // Calculate total cash given and received
  const totalCashGiven = cashTransactions
    .filter(t => t.type === "1")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalCashReceived = cashTransactions
    .filter(t => t.type === "2")
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  // Get original loan amount (either direct or calculated from percentage)
  const getOriginalLoanAmount = () => {
    if (formValue.loan_amount && formValue.loan_amount !== "0") {
      return Number(formValue.loan_amount);
    } else {
      return (Number(formValue.valuation || 0) * Number(formValue.loan_percentage || 0)) / 100;
    }
  };

  // Calculate final balance
  const getFinalBalance = () => {
    return handleDigitsFix(
      getOriginalLoanAmount() +
      Number(formValue.interest_amount || 0) +
      totalCashGiven - totalCashReceived
    );
  };

  // Handle modal state
  const handleModalState = (name, value) => {
    setModalState(prev => ({ ...prev, [name]: value }));
  };

  // Parse interest periods if they exist
  useEffect(() => {
    try {
      if (formValue?.interest_periods) {
        if (Array.isArray(formValue.interest_periods)) {
          setInterestPeriods(formValue.interest_periods);
        } else if (typeof formValue.interest_periods === 'string') {
          setInterestPeriods(JSON.parse(formValue.interest_periods));
        }
      } else {
        setInterestPeriods([]);
      }
    } catch (e) {
      console.error('Error parsing interest periods:', e);
      setInterestPeriods([]);
    }
  }, [formValue?.interest_periods]);

  // Calculate totals
  const totalValuation = invoices.reduce(
    (total, invoice) => total + parseFloat(invoice.valuation || 0),
    0
  );

  const invoiceTotalAmount = invoices.reduce(
    (total, invoice) => total + parseFloat(invoice.net_price || 0),
    0
  );

  // Calculate total paid amount from payments
  const totalPaid = payments.reduce((total, payment) => total + parseFloat(payment.amount || 0), 0);
  
  // Calculate total interest from all periods
  const totalInterestFromPeriods = interestPeriods.reduce(
    (total, period) => total + parseFloat(period.interest_amount || 0),
    0
  );
  
  // Calculate Loan by Valuation and Balance Due
  const loanByValuation = handleDigitsFix((Number(formValue.valuation || 0) * Number(formValue.loan_percentage || 0)) / 100);
  
  // Use loan_amount as base if valuation or loan_percentage is not set
  const baseAmountForInterest = (Number(formValue.valuation || 0) && Number(formValue.loan_percentage || 0))
    ? loanByValuation
    : handleDigitsFix(Number(formValue.loan_amount || 0));
  
  // Calculate total amount (including interest)
  const totalAmount = Number(baseAmountForInterest) + Number(formValue?.interest_amount || 0) + totalInterestFromPeriods;
  
  // Calculate balance
  const balance = totalAmount - Number(formValue?.paid_amount || 0);

  // Determine background color based on valuation vs total amount
  const getBackgroundColor = () => {
    if (totalValuation >= totalAmount) {
      return '#ffebee'; // Light red background
    } else {
      return '#fff9c4'; // Light yellow background
    }
  };

  // Handle adding freeze period
  const handleAddFreezePeriod = () => {
    fetchInterestData();
    
    const fromDate = formValue?.interest_upto || moment().format('YYYY-MM-DD');
    const days = moment(selectedDate).diff(moment(fromDate), 'days');
    const calculatedInterest = calculateInterest(loanBalance, days, Number(formValue?.interest_rate || 2));
    const newBalance = loanBalance + calculatedInterest;
    
    const loanDataObj = {
      ...modalData,
      id: data?.id,
      interest_upto: fromDate,
      base_amount: loanBalance,
      calculated_interest: calculatedInterest,
      new_balance: newBalance,
      days: days
    };
    
    setModalData(loanDataObj);
    setShowFreezeLoanModal(true);
  };

  // Handle close freeze loan modal
  const handleCloseFreezeLoanModal = () => {
    setShowFreezeLoanModal(false);
    setShowAddPeriod(false);
    setModalData(null);
  };
  
  // Handle freeze loan submit success
  const handleFreezeLoanSuccess = (periodData) => {
    // Add the new period to the interest periods array
    if (periodData) {
      try {
        let updatedPeriods = [...interestPeriods];
        if (!Array.isArray(updatedPeriods)) {
          updatedPeriods = [];
        }
        updatedPeriods.push(periodData);
        setInterestPeriods(updatedPeriods);
      } catch (error) {
        console.error("Error updating interest periods:", error);
      }
    }
    
    // Close the modal
    setShowFreezeLoanModal(false);
    setShowAddPeriod(false);
    setModalData(null);
  };

  // Handle date change for freeze loan modal
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Handle date update for freeze loan modal
  const handleDateUpdate = (date) => {
    setSelectedDate(date);
  };

  // Add this function where appropriate in the ProfessionalInvoiceBill component
  const createCashTransactionLog = async (transactionData) => {
    try {
      const currentUser = useSelector(state => state.auth.user) || { name: "User" };
      
      const logPayload = {
        userName: currentUser.name,
        id: data.id,
        type: "loan",
        amount: transactionData.amount,
        action: "PAYMENT",
        entityType: "LOAN",
        timestamp: new Date().toISOString(),
        metadata: JSON.stringify({
          customerName: data.customer_name,
          transactionType: "Cash",
          transactionDate: transactionData.date,
          paymentType: transactionData.type === 1 ? "Given" : "Received",
          remarks: transactionData.remarks || "Cash transaction"
        })
      };
      
      const response = await ApiRequest({
        url: MANAGE_LOGS_API.create,
        method: 'POST',
        data: logPayload
      });
      
      if (!response.success) {
        console.error("Failed to create cash transaction log:", response.message);
      }
    } catch (error) {
      console.error("Error creating cash transaction log:", error);
    }
  };

  // Handle cash transaction
  const handleCashTransaction = async () => {
    const amount = Number(newCashTransaction.amount || 0);
    const type = newCashTransaction.type.value;
    const newBalance = calculateNewBalance(loanBalance, amount, type);
    
    const transactionData = {
      loan_id: data.id,
      amount: amount,
      type: type,
      date: newCashTransaction.date,
      base_amount: loanBalance,
      new_balance: newBalance
    };
    
    dispatch(addCashTransaction({
      payload: transactionData,
      callback: () => {
        setShowCashModal(false);
        setNewCashTransaction({
          amount: '',
          type: { label: "Given", value: "1" },
          date: moment().format('YYYY-MM-DD')
        });
        if (onDataUpdated) {
          onDataUpdated({
            ...data,
            loanBalance: newBalance
          });
        }
      }
    }));
  };

  // Update test function
  const runCalculationTest = () => {
    const result = verifyCalculations(TEST_LOAN_DATA.transactions);
    setTestResults(result);
    if (result.isValid) {
      ShowToast("All calculations are correct!");
      } else {
      ShowToast("Calculation errors found!");
      console.error("Calculation errors:", result.errors);
    }
  };

  // Add transaction history display
  const renderTransactionHistory = () => (
    <View style={styles.transactionHistory}>
      <View style={styles.transactionHeader}>
        <Text style={styles.headerCell}>Date</Text>
        <Text style={styles.headerCell}>Type</Text>
        <Text style={styles.headerCell}>Base Amount</Text>
        <Text style={styles.headerCell}>Cash Amount</Text>
        <Text style={styles.headerCell}>Interest</Text>
        <Text style={styles.headerCell}>New Balance</Text>
        <Text style={styles.headerCell}>Days</Text>
        <Text style={styles.headerCell}>Notes</Text>
      </View>
      
      <ScrollView style={styles.transactionList}>
        {transactionHistory.map((transaction, index) => (
          <View 
            key={index} 
            style={[
              styles.transactionRow,
              transaction.type === 'Initial Loan' ? styles.initialLoan :
              transaction.type === 'Freeze Period' ? styles.freezePeriod :
              transaction.type === 'Cash Given' ? styles.cashGiven :
              styles.cashReceived
            ]}
          >
            <Text style={styles.cell}>{moment(transaction.date).format('DD/MM/YY')}</Text>
            <Text style={styles.cell}>{transaction.type}</Text>
            <Text style={styles.cell}>₹{handleDigitsFix(transaction.baseAmount)}</Text>
            <Text style={styles.cell}>{transaction.cashAmount ? `₹${handleDigitsFix(Math.abs(transaction.cashAmount))}` : '-'}</Text>
            <Text style={styles.cell}>{transaction.interest ? `₹${handleDigitsFix(transaction.interest)}` : '-'}</Text>
            <Text style={styles.cell}>₹{handleDigitsFix(transaction.newBalance)}</Text>
            <Text style={styles.cell}>{transaction.days || '-'}</Text>
            <Text style={styles.cell}>{transaction.notes}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <>
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      {/* Test Section commented out
      <View style={styles.testSection}>
        <TouchableOpacity 
          style={styles.testButton}
          onPress={runCalculationTest}
        >
          <Text style={styles.testButtonText}>Test Calculations</Text>
        </TouchableOpacity>

        {testResults && (
          <View style={styles.testResults}>
            <Text style={[styles.testResultText, testResults.isValid ? styles.testSuccess : styles.testError]}>
              {testResults.isValid ? "✓ All calculations are correct!" : "✗ Calculation errors found"}
            </Text>
            {!testResults.isValid && testResults.errors.map((error, index) => (
              <Text key={index} style={styles.errorText}>{error}</Text>
            ))}
          </View>
        )}

        <View style={styles.testDataSection}>
          <Text style={styles.testDataHeader}>Test Transactions</Text>
          <ScrollView style={styles.testDataScroll}>
            <View style={[styles.transactionRow, styles.initialLoan]}>
              <Text style={styles.transactionDate}>{moment(TEST_LOAN_DATA.initialLoan.date).format('DD/MM/YY')}</Text>
              <Text style={styles.transactionType}>{TEST_LOAN_DATA.initialLoan.type}</Text>
              <Text style={styles.transactionAmount}>₹{handleDigitsFix(TEST_LOAN_DATA.initialLoan.baseAmount)}</Text>
              <Text style={styles.transactionBalance}>₹{handleDigitsFix(TEST_LOAN_DATA.initialLoan.baseAmount)}</Text>
            </View>

            {TEST_LOAN_DATA.transactions.map((transaction, index) => (
              <View 
                key={index} 
                style={[
                  styles.transactionRow,
                  transaction.type === 'Freeze Period' ? styles.freezePeriod :
                  transaction.type === 'Cash Given' ? styles.cashGiven :
                  transaction.type === 'Cash Received' ? styles.cashReceived :
                  transaction.type === 'Final Interest' ? styles.finalInterest :
                  null
                ]}
              >
                <Text style={styles.transactionDate}>{moment(transaction.date).format('DD/MM/YY')}</Text>
                <Text style={styles.transactionType}>{transaction.type}</Text>
                <Text style={styles.transactionAmount}>
                  {transaction.type.includes('Period') || transaction.type === 'Final Interest'
                    ? `₹${handleDigitsFix(transaction.interest)}`
                    : `₹${handleDigitsFix(Math.abs(transaction.cashAmount))}`
                  }
                </Text>
                <Text style={styles.transactionBalance}>₹{handleDigitsFix(transaction.newBalance)}</Text>
                <Text style={styles.transactionNotes}>{transaction.notes}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
      */}

      {/* Main Header */}
      <View style={styles.mainHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.companyName}>TANISHQ AMANAT</Text>
          <Text style={styles.companyAddress}>123 Jewelry Street, City - 400001</Text>
          <Text style={styles.companyContact}>Contact: +91 9876543210</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.billTitle}>JEWELLERY BILL</Text>
          <Text style={styles.billNo}>Bill No: {moment().unix()}</Text>
          <Text style={styles.dateText}>Date: {moment().format('DD-MM-YYYY')}</Text>
        </View>
      </View>

      {/* Status Indicator */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={[
          styles.statusValue,
          { color: totalValuation >= totalAmount ? '#d32f2f' : '#f57f17' }
        ]}>
          {totalValuation >= totalAmount ? 'Warning: Valuation exceeds or equals total amount' : 'Normal: Valuation is less than total amount'}
        </Text>
        <View style={styles.statusDetails}>
          <Text style={styles.statusText}>Valuation: ₹{handleDigitsFix(totalValuation)}</Text>
          <Text style={styles.statusText}>Total Amount: ₹{handleDigitsFix(totalAmount)}</Text>
        </View>
      </View>

      {/* Customer Details Box */}
      <View style={styles.customerBox}>
        <View style={styles.customerHeader}>
          <Text style={styles.customerHeaderText}>CUSTOMER DETAILS</Text>
        </View>
        <View style={styles.customerContent}>
          <Text style={styles.customerName}>{data?.customer_name || "Customer Name"}</Text>
          <Text style={styles.customerAddress}>{data?.address || "Customer Address"}</Text>
          <Text style={styles.customerContact}>{data?.contact || "Contact Number"}</Text>
        </View>
      </View>

      {/* Items Section */}
      <View style={styles.itemsSection}>
        <View style={styles.itemsHeader}>
          <Text style={[styles.columnHeader, { flex: 2 }]}>ITEM DESCRIPTION</Text>
          <Text style={[styles.columnHeader, { flex: 1 }]}>WEIGHT</Text>
          <Text style={[styles.columnHeader, { flex: 1 }]}>AMOUNT</Text>
        </View>
        
        {invoices.map((invoice, index) => (
          <View key={index} style={styles.itemRow}>
            <View style={{ flex: 2 }}>
              <Text style={styles.itemName}>{invoice.name || `Item ${index + 1}`}</Text>
              <Text style={styles.itemDetails}>Touch: {invoice.tounch}%</Text>
            </View>
            <Text style={[styles.itemWeight, { flex: 1 }]}>
              {handleDigitsFix(invoice.gross_weight)} gm
            </Text>
            <Text style={[styles.itemAmount, { flex: 1 }]}>
              ₹{handleDigitsFix((Number(formValue.valuation || 0) && Number(formValue.loan_percentage || 0))
                ? (Number(invoice.valuation || 0) * Number(formValue.loan_percentage || 0)) / 100
                : Number(formValue.loan_amount || 0))}
            </Text>
          </View>
        ))}
      </View>

      {/* Interest and Loan Section */}
      <View style={styles.interestSection}>
        <View style={styles.interestSectionHeader}>
          <Text style={styles.interestSectionTitle}>INTEREST PERIODS</Text>
          <TouchableOpacity 
            style={styles.addPeriodButton}
            onPress={handleAddFreezePeriod}
          >
            <AntDesign name="plus" size={16} color="#fff" />
            <Text style={styles.addPeriodText}>Freeze Loan</Text>
          </TouchableOpacity>
        </View>

        {/* Headers */}
        <View style={[styles.interestDetailsRow, { backgroundColor: '#f5f5f5', padding: 4 }]}>
          <View style={styles.interestColumn}>
            <Text style={styles.interestLabel}>Type</Text>
          </View>
          <View style={styles.interestColumn}>
            <Text style={styles.interestLabel}>Date</Text>
          </View>
          <View style={styles.daysColumn}>
            <Text style={styles.interestLabel}>Days</Text>
          </View>
          <View style={styles.interestColumn}>
            <Text style={styles.interestLabel}>Base Amount</Text>
          </View>
          <View style={styles.interestColumn}>
            <Text style={styles.interestLabel}>Interest</Text>
          </View>
          <View style={styles.notesColumn}>
            <Text style={styles.interestLabel}>Notes</Text>
          </View>
        </View>

        {/* Current Period */}
        <View style={[styles.interestDetailsRow, styles.currentPeriodRow, styles.transactionTypeFreeze]}>
          <View style={styles.interestColumn}>
            <Text style={styles.interestValue}>Current</Text>
          </View>
          <View style={styles.interestColumn}>
            <Text style={styles.interestValue}>
              {formValue?.interest_upto ? moment(formValue.interest_upto).format('DD/MM/YY') : moment().format('DD/MM/YY')}
            </Text>
          </View>
          <View style={styles.daysColumn}>
            <Text style={styles.interestValue}>-</Text>
          </View>
          <View style={styles.interestColumn}>
            <Text style={styles.interestValue}>₹{handleDigitsFix(baseAmountForInterest)}</Text>
          </View>
          <View style={styles.interestColumn}>
            <Text style={styles.interestValue}>₹{handleDigitsFix(formValue?.interest_amount)}</Text>
          </View>
          <View style={styles.notesColumn}>
            <Text style={styles.noteText}>Initial period</Text>
          </View>
        </View>

        {/* Previous Interest Periods */}
        {interestPeriods.map((period, index) => (
          <View key={index} style={[
            styles.interestDetailsRow,
            styles.transactionTypeFreeze
          ]}>
            <View style={styles.interestColumn}>
              <Text style={styles.interestValue}>Freeze</Text>
            </View>
            <View style={styles.interestColumn}>
              <Text style={styles.interestValue}>
                {period.interest_upto ? moment(period.interest_upto).format('DD/MM/YY') : ''}
              </Text>
            </View>
            <View style={styles.daysColumn}>
              <Text style={styles.interestValue}>
                {period.days || moment(period.interest_upto).diff(moment(period.start_date || formValue.interest_upto), 'days')}
              </Text>
            </View>
            <View style={styles.interestColumn}>
              <Text style={styles.interestValue}>₹{handleDigitsFix(period.base_amount)}</Text>
            </View>
            <View style={styles.interestColumn}>
              <Text style={styles.interestValue}>₹{handleDigitsFix(period.interest_amount)}</Text>
            </View>
            <View style={styles.notesColumn}>
              <Text style={styles.noteText}>Period {index + 1} interest</Text>
            </View>
          </View>
        ))}

        {/* Cash Transactions in Interest Section */}
        {cashTransactions.map((transaction, index) => (
          <View key={`cash_${index}`} style={[
            styles.interestDetailsRow,
            styles.transactionTypeCash
          ]}>
            <View style={styles.interestColumn}>
              <Text style={styles.interestValue}>{transaction.type === "1" ? "Given" : "Received"}</Text>
            </View>
            <View style={styles.interestColumn}>
              <Text style={styles.interestValue}>
                {moment(transaction.date).format('DD/MM/YY')}
              </Text>
            </View>
            <View style={styles.daysColumn}>
              <Text style={styles.interestValue}>-</Text>
            </View>
            <View style={styles.interestColumn}>
              <Text style={styles.interestValue}>₹{handleDigitsFix(transaction.amount)}</Text>
            </View>
            <View style={styles.interestColumn}>
              <Text style={styles.interestValue}>-</Text>
            </View>
            <View style={styles.notesColumn}>
              <Text style={styles.noteText}>
                Cash {transaction.type === "1" ? "given to customer" : "received from customer"}
              </Text>
          </View>
          </View>
        ))}

        {formValue?.loan_amount > 0 && (
          <View style={styles.loanRow}>
            <Text style={styles.interestLabel}>Additional Loan Amount:</Text>
            <Text style={styles.interestValue}>₹{handleDigitsFix(formValue?.loan_amount)}</Text>
          </View>
        )}
      </View>

      {/* Add Cash Transactions Section before Final Amount Box */}
      <View style={styles.cashSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CASH TRANSACTIONS</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowCashModal(true)}
          >
            <AntDesign name="plus" size={16} color="#fff" />
            <Text style={styles.addButtonText}>Add Cash</Text>
          </TouchableOpacity>
        </View>
        
        {cashTransactions.map((transaction, index) => (
          <View key={index} style={styles.transactionRow}>
            <View style={styles.transactionColumn}>
              <Text style={styles.transactionLabel}>Date</Text>
              <Text style={styles.transactionValue}>
                {moment(transaction.date).format('DD/MM/YY')}
              </Text>
            </View>
            <View style={styles.transactionColumn}>
              <Text style={styles.transactionLabel}>Type</Text>
              <Text style={styles.transactionValue}>
                {transaction.type === "1" ? "Given" : "Received"}
              </Text>
            </View>
            <View style={styles.transactionColumn}>
              <Text style={styles.transactionLabel}>Amount</Text>
              <Text style={styles.transactionValue}>
                ₹{handleDigitsFix(transaction.amount)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Update Final Amount Box */}
      <View style={styles.finalAmountBox}>
        <View style={styles.finalRow}>
          <Text style={styles.finalLabel}>Valuation Amount</Text>
          <Text style={styles.finalValue}>₹{handleDigitsFix(formValue.valuation)}</Text>
        </View>
        
        {formValue.loan_amount && formValue.loan_amount !== "0" ? (
          <View style={styles.finalRow}>
            <Text style={styles.finalLabel}>Original Loan Amount</Text>
            <Text style={styles.finalValue}>₹{handleDigitsFix(formValue.loan_amount)}</Text>
          </View>
        ) : (
          <>
            <View style={styles.finalRow}>
              <Text style={styles.finalLabel}>Loan Percentage</Text>
              <Text style={styles.finalValue}>{formValue.loan_percentage}%</Text>
            </View>
            <View style={styles.finalRow}>
              <Text style={styles.finalLabel}>Original Loan Amount</Text>
              <Text style={styles.finalValue}>
                ₹{handleDigitsFix((Number(formValue.valuation || 0) * Number(formValue.loan_percentage || 0)) / 100)}
              </Text>
            </View>
          </>
        )}
        
        <View style={styles.finalRow}>
          <Text style={styles.finalLabel}>Interest Amount</Text>
          <Text style={styles.finalValue}>₹{handleDigitsFix(formValue.interest_amount)}</Text>
        </View>
        <View style={styles.finalRow}>
          <Text style={styles.finalLabel}>Cash Given</Text>
          <Text style={styles.finalValue}>₹{handleDigitsFix(totalCashGiven)}</Text>
        </View>
        <View style={styles.finalRow}>
          <Text style={styles.finalLabel}>Cash Received</Text>
          <Text style={styles.finalValue}>₹{handleDigitsFix(totalCashReceived)}</Text>
        </View>
        <View style={[styles.finalRow, styles.balanceRow]}>
          <Text style={styles.balanceLabel}>Final Balance</Text>
          <Text style={styles.balanceValue}>₹{getFinalBalance()}</Text>
        </View>
      </View>

      {/* Terms and Conditions */}
      <View style={styles.termsSection}>
        <Text style={styles.termsHeader}>Terms & Conditions:</Text>
        <Text style={styles.termsText}>1. Interest will be charged at {formValue?.interest_rate}% per annum</Text>
        <Text style={styles.termsText}>2. Please keep this bill safe for future reference</Text>
      </View>

      {/* Signature Section */}
      <View style={styles.signatureSection}>
        <View style={styles.signatureBox}>
          <Text style={styles.signatureText}>Customer's Signature</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text style={styles.signatureText}>Authorized Signatory</Text>
        </View>
      </View>
    </View>
    
    {/* Cash Transaction Popup Modal */}
    <Modal
      visible={showCashModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowCashModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.popupContainer}>
          <View style={styles.popupHeader}>
            <Text style={styles.popupTitle}>Add Cash Transaction</Text>
            <TouchableOpacity onPress={() => setShowCashModal(false)}>
              <AntDesign name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.popupContent}>
            <View style={styles.inputContainer}>
              <InputBox
                name="amount"
                label="Amount"
                placeholder="Enter amount"
                value={newCashTransaction.amount}
                keyboardType="numeric"
                onChange={({ value }) => setNewCashTransaction(prev => ({ ...prev, amount: value }))}
              />
            </View>

            <View style={styles.inputContainer}>
              <SelectInput
                label="Transaction Type"
                name="type"
                placeholder="Select type"
                value={newCashTransaction.type}
                data={[
                  { label: "Given", value: "1" },
                  { label: "Received", value: "2" }
                ]}
                onSelect={(value) => setNewCashTransaction(prev => ({ ...prev, type: value }))}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.dateLabel}>Date</Text>
              <TouchableOpacity
                onPress={() => handleModalState("cashDatePicker", true)}
                style={styles.dateButton}
              >
                <Text style={styles.dateText}>{moment(newCashTransaction.date).format('DD MMM YYYY')}</Text>
                <DatePickerComponent
                  name="cash_date"
                  open={modalState.cashDatePicker}
                  value={newCashTransaction.date}
                  handleClose={() => handleModalState("cashDatePicker", false)}
                  onSelect={({ value }) => {
                    setNewCashTransaction(prev => ({ ...prev, date: value }));
                    handleModalState("cashDatePicker", false);
                  }}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <CommonButton
                title={loading ? "Adding..." : "Add Transaction"}
                onPress={handleAddCash}
                disabled={loading}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>

    {showFreezeLoanModal && modalData && (
      <FreezeLoanModal 
        open={showFreezeLoanModal}
        onClose={handleCloseFreezeLoanModal}
        loanData={modalData}
        currentDate={selectedDate}
        onDateChange={handleDateChange}
        onDateUpdate={handleDateUpdate}
        onSubmitSuccess={handleFreezeLoanSuccess}
      />
    )}

    {/* Add transaction history section */}
    {renderTransactionHistory()}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: 'white',
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 8,
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  companyAddress: {
    fontSize: 10,
    color: '#666',
  },
  companyContact: {
    fontSize: 10,
    color: '#666',
  },
  billTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  billNo: {
    fontSize: 12,
    color: '#444',
  },
  dateText: {
    fontSize: 12,
    color: '#444',
    marginTop: 2,
  },
  customerBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 8,
  },
  customerHeader: {
    backgroundColor: '#f5f5f5',
    padding: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  customerHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
  },
  customerContent: {
    padding: 6,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  customerAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 1,
  },
  customerContact: {
    fontSize: 12,
    color: '#666',
  },
  itemsSection: {
    marginBottom: 8,
  },
  itemsHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 4,
    borderRadius: 4,
  },
  columnHeader: {
    fontSize: 11,
    fontWeight: '600',
    color: '#444',
  },
  itemRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 4,
    alignItems: 'center',
  },
  itemName: {
    fontSize: 12,
    color: '#000',
    marginBottom: 1,
  },
  itemDetails: {
    fontSize: 10,
    color: '#666',
  },
  itemWeight: {
    fontSize: 12,
    color: '#000',
    textAlign: 'center',
  },
  itemAmount: {
    fontSize: 12,
    color: '#000',
    textAlign: 'right',
  },
  interestSection: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 6,
  },
  interestSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  interestSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#444',
  },
  addPeriodButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 4,
    borderRadius: 3,
    alignItems: 'center',
  },
  addPeriodText: {
    color: '#fff',
    marginLeft: 2,
    fontSize: 10,
  },
  interestDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  interestColumn: {
    flex: 1,
    alignItems: 'center',
  },
  loanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  interestLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
    textAlign: 'center',
  },
  interestValue: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
    textAlign: 'center',
  },
  finalAmountBox: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 6,
    borderRadius: 4,
    marginBottom: 8,
  },
  finalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  finalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  finalValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  balanceRow: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    marginTop: 4,
    paddingTop: 4,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  termsSection: {
    marginBottom: 12,
  },
  termsHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  termsText: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  signatureBox: {
    alignItems: 'center',
    width: '40%',
  },
  signatureText: {
    fontSize: 12,
    color: '#000',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 4,
    textAlign: 'center',
  },
  statusContainer: {
    padding: 6,
    marginBottom: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  currentPeriodRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 6,
    paddingTop: 6,
  },
  currentPeriodLabel: {
    fontWeight: 'bold',
  },
  newPeriodRow: {
    backgroundColor: '#e8f5e9',
    borderRadius: 4,
    padding: 4,
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  newPeriodLabel: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  lastPeriodLabel: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  lastPeriodValue: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  cashSection: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionColumn: {
    flex: 1,
    alignItems: 'center',
  },
  transactionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  transactionValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  popupContent: {
    padding: 16,
    maxHeight: '70%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  dateText: {
    color: '#333',
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 8,
  },
  transactionTypeFreeze: {
    backgroundColor: '#E3F2FD',  // Light blue background for freeze
    borderLeftWidth: 3,
    borderLeftColor: '#1976D2',  // Blue border
    paddingLeft: 4
  },
  transactionTypeCash: {
    backgroundColor: '#F1F8E9',  // Light green background for cash
    borderLeftWidth: 3,
    borderLeftColor: '#689F38',  // Green border
    paddingLeft: 4
  },
  daysColumn: {
    flex: 0.7,
    alignItems: 'center',
  },
  notesColumn: {
    flex: 1.5,
    alignItems: 'flex-start',
    paddingLeft: 4,
  },
  noteText: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic'
  },
  testSection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 20,
  },
  testButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  testResults: {
    marginTop: 10,
    padding: 10,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
  },
  testResultText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  testSuccess: {
    color: '#4CAF50',
  },
  testError: {
    color: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
  },
  testDataSection: {
    marginTop: 20,
  },
  testDataHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  testDataScroll: {
    maxHeight: 300,
  },
  initialLoan: {
    backgroundColor: '#e8f5e9',
  },
  freezePeriod: {
    backgroundColor: '#e3f2fd',
  },
  cashGiven: {
    backgroundColor: '#f3e5f5',
  },
  cashReceived: {
    backgroundColor: '#fff3e0',
  },
  finalInterest: {
    backgroundColor: '#fce4ec',
  },
  transactionDate: {
    flex: 1,
    fontSize: 12,
  },
  transactionType: {
    flex: 2,
    fontSize: 12,
    fontWeight: 'bold',
  },
  transactionAmount: {
    flex: 2,
    fontSize: 12,
    textAlign: 'right',
  },
  transactionBalance: {
    flex: 2,
    fontSize: 12,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  transactionNotes: {
    flex: 3,
    fontSize: 12,
    color: '#666',
    paddingLeft: 10,
  },
  transactionHistory: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden'
  },
  transactionHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  headerCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#444'
  },
  transactionList: {
    maxHeight: 400
  },
  transactionRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  cell: {
    flex: 1,
    fontSize: 11,
    color: '#333'
  },
});

export default ProfessionalInvoiceBill; 