import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { handleDigitsFix } from "../utils";
import moment from "moment";
import AntDesign from "@expo/vector-icons/AntDesign";
import InputBox from "./common/InputBox";
import SelectInput from "./common/SelectInput";
import CommonButton from "./common/buttons/CommonButton";
import DatePickerComponent from "./common/DateTimePicker";
import { useDispatch, useSelector } from "react-redux";
import { addCashTransaction, getLoanCashTransactions, freezeLoan, fetchLoansDetails } from "../redux/actions/loan.action";
import { ApiRequest } from "../utils/api";
import { MANAGE_LOAN_API, MANAGE_LOGS_API } from "../utils/api/endpoints";
import DateTimePickerAndroid from "@react-native-community/datetimepicker";
import axios from "axios";
import ToggleSwitch from "../components/common/ToggleSwicth";
import ShowToast from "./common/ShowToast";
import { validateFreezeLoan } from "../utils/validators/loanValidators";

const SimpleInvoiceBill = ({ data, formValue, onDataUpdated }) => {
  const dispatch = useDispatch();
  const [showFreezeLoanModal, setShowFreezeLoanModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [modalData, setModalData] = useState(null);
  const [modalState, setModalState] = useState({ cashDatePicker: false });
  const [newCashTransaction, setNewCashTransaction] = useState({
    amount: '',
    type: { label: "Given", value: "1" },
    date: moment().format('YYYY-MM-DD')
  });
  const [cashTransactions, setCashTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [interestTillToday, setInterestTillToday] = useState(null);
  const [transactionHistory, setTransactionHistory] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(null);
  const [freezeFormValue, setFreezeFormValue] = useState({
    is_freeze: false,
    interest_periods: [],
    new_amount_type: { label: "Given", value: "1" },
    to_date: moment().format('YYYY-MM-DD')
  });
  const [error, setError] = useState(null);

  // Fetch cash transactions, interest, transaction history and current balance when component mounts
  useEffect(() => {
    if (data?.id) {
      fetchCashTransactions();
      fetchInterestTillToday();
      fetchTransactionHistory();
      fetchCurrentBalance();
    }
  }, [data?.id]);

  // Function to fetch cash transactions
  const fetchCashTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const response = await ApiRequest({
        url: `/get-loan-cash-transactions/${data.id}`,
        method: 'GET'
      });
       
      if (response.success) {
        const formattedTransactions = response.data.map(transaction => ({
          id: transaction.id.toString(),
          loan_id: transaction.loan_id.toString(),
          amount: transaction.amount,
          type: transaction.type.toString(),
          date: transaction.date,
          created_at: transaction.created_at,
          updated_at: transaction.updated_at
        }));
        setCashTransactions(formattedTransactions);
      } else {
        throw new Error(response.message || 'Failed to fetch cash transactions');
      }
    } catch (error) {
      console.error('Failed to fetch cash transactions:', error);
      setError(error.message);
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Function to fetch interest till today
  const fetchInterestTillToday = async () => {
    try {
      const response = await ApiRequest({
        url: MANAGE_LOAN_API.get_interest_till_today,
        method: "GET",
        params: { loan_id: data.id },
      });
      if (response?.data) {
        setInterestTillToday(response.data);
      }
    } catch (error) {
      console.error('Error fetching interest till today:', error);
    }
  };

  // Function to fetch transaction history
  const fetchTransactionHistory = async () => {
    try {
      // Fetch transaction history
      const historyResponse = await ApiRequest({
        url: MANAGE_LOAN_API.get_transaction_history(data.id),
        method: "GET",
      });

      // Fetch cash transactions
      const cashResponse = await ApiRequest({
        url: `/get-loan-cash-transactions/${data.id}`,
        method: 'GET'
      });

      let transactions = [];

      // Process freeze periods and initial loan
      if (historyResponse?.data?.loan_history_data) {
        transactions = historyResponse.data.loan_history_data.map(history => ({
          date: history.interest_till_date,
          type: history.is_freeze ? 'Freeze Period' : 'Initial Loan',
          baseAmount: Number(history.new_base_amount || historyResponse.data.loan_amount),
          cashAmount: null,
          interest: Number(history.interest_amount),
          newBalance: Number(history.new_base_amount || historyResponse.data.loan_amount),
          days: history.interest_upto ? moment(history.interest_till_date).diff(moment(history.interest_upto), 'days') : null,
          notes: history.interest_periods ? history.interest_periods : null
        }));
      }

      // Add cash transactions
      if (cashResponse?.success) {
        const cashTransactions = cashResponse.data.map(transaction => {
          const isGiven = transaction.type === 1;  // type 1 is Cash Given (green), type 2 is Cash Received (red)
          return {
            date: transaction.date,
            type: isGiven ? 'Cash Given' : 'Cash Received',
            baseAmount: Number(transaction.amount),
            cashAmount: Number(transaction.amount),  // Always positive for type 1
            interest: null,
            newBalance: null,
            days: null,
            notes: isGiven ? 'New base amount' : 'Reduced base amount',
            originalType: transaction.type  // Store the original type for color matching
          };
        });
        
        // Merge and sort all transactions by date
        transactions = [...transactions, ...cashTransactions].sort((a, b) => 
          moment(a.date).diff(moment(b.date))
        );
      }

      setTransactionHistory({
        transactions: transactions
      });
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    }
  };

  // Function to fetch current balance
  const fetchCurrentBalance = async () => {
    try {
      const response = await ApiRequest({
        url: `/loan/${data.id}/current-balance`,
        method: "GET",
      });
      if (response?.data) {
        setCurrentBalance(response.data);
      }
    } catch (error) {
      console.error('Error fetching current balance:', error);
    }
  };

  // Calculate totals
  const totalValuation = Number(formValue.valuation || 0);
  const totalAmount = Number(formValue.loan_amount || 0) + Number(formValue.interest_amount || 0);
  
  // Determine background color based on valuation vs total amount
  const getBackgroundColor = () => {
    if (totalValuation >= totalAmount) {
      return '#ffebee'; // Light red background
    } else {
      return '#fff9c4'; // Light yellow background
    }
  };

  // Real-time interest calculation
  const calculateInterest = useCallback(() => {
    try {
      const currentBaseAmount = Number(currentBalance?.current_balance || data?.loan_amount || 0);
      const interestRate = parseFloat(data?.interest_rate || 0);
      
      const startDate = moment(data?.interest_upto);
      const endDate = moment(freezeFormValue.to_date);
      
      const days = endDate.diff(startDate, 'days') + 1;
      
      const dailyRate = (interestRate / 100) / 365;
      const interest = currentBaseAmount * dailyRate * days;
      
      const amountChange = freezeFormValue?.new_amount 
        ? (freezeFormValue.new_amount_type?.value === "1" 
          ? Number(freezeFormValue.new_amount) 
          : -Number(freezeFormValue.new_amount))
        : 0;
      
      const newBaseAmount = currentBaseAmount + interest + amountChange;

      setFreezeFormValue(prev => ({
        ...prev,
        current_period_interest: handleDigitsFix(interest),
        current_base_amount: handleDigitsFix(newBaseAmount),
        total_amount: handleDigitsFix(newBaseAmount)
      }));

    } catch (error) {
      console.error("Interest calculation error:", error);
    }
  }, [freezeFormValue.to_date, freezeFormValue.new_amount, freezeFormValue.new_amount_type, data, currentBalance]);

  // Recalculate on any relevant change
  useEffect(() => {
    calculateInterest();
  }, [calculateInterest]);

  // Create log entry for loan freeze
  const createLoanFreezeLog = async (payloadData) => {
    try {
      const currentUser = useSelector(state => state.auth.user) || { name: "User" };
      
      const logPayload = {
        userName: currentUser.name,
        id: data.id,
        type: "loan",
        amount: payloadData.new_base_amount,
        action: "FREEZE",
        entityType: "LOAN",
        timestamp: new Date().toISOString(),
        metadata: JSON.stringify({
          customerName: data.customer_name,
          status: "Frozen",
          interestRate: data.interest_rate,
          interestAmount: payloadData.current_period_interest,
          previousAmount: data.valuation_amount,
          interestPeriod: `${data.interest_upto} to ${payloadData.interest_upto}`
        })
      };
      
      const response = await ApiRequest({
        url: MANAGE_LOGS_API.create,
        method: 'POST',
        data: logPayload
      });
      
      if (!response.success) {
        console.error("Failed to create loan freeze log:", response.message);
      }
    } catch (error) {
      console.error("Error creating loan freeze log:", error);
    }
  };

  // Handle freeze loan submission
  const handleFreezeLoanSubmit = async () => {
    const currentPeriodInterest = {
      interest_upto: freezeFormValue.to_date,
      base_amount: Number(data.loan_amount),
      interest_amount: Number(freezeFormValue.current_period_interest),
      interest_rate: Number(data.interest_rate)
    };
    
    const payload = {
      loan_id: data.id,
      new_amount: freezeFormValue.new_amount,
      new_amount_type: freezeFormValue?.new_amount_type?.value,
      interest_upto: freezeFormValue.to_date,
      current_period_interest: freezeFormValue.current_period_interest,
      new_base_amount: freezeFormValue.current_base_amount,
      is_freeze: freezeFormValue.is_freeze ? 1 : 0,
      interest_periods: JSON.stringify([currentPeriodInterest]),
      interest_amount: freezeFormValue.current_period_interest,
      interest_till_amount: freezeFormValue.current_period_interest,
      interest_till_date: freezeFormValue.to_date
    };
    
    const validationResult = validateFreezeLoan(payload);
    if (!validationResult.isValid) {
      const errorMessages = Object.values(validationResult.errors);
      ShowToast(errorMessages[0]);
      return;
    }
    
    ShowToast("Freezing loan...");
    
    const callback = () => {
      createLoanFreezeLog(payload);
      ShowToast("Loan frozen successfully!");
      setFreezeFormValue({
        is_freeze: false,
        interest_periods: [],
        new_amount_type: { label: "Given", value: "1" },
        to_date: moment().format('YYYY-MM-DD')
      });
      setShowFreezeLoanModal(false);
      dispatch(fetchLoansDetails(data.id));
      if (onDataUpdated) {
        const updatedLoan = {
          ...data,
          interest_upto: freezeFormValue.to_date,
          interest_amount: handleDigitsFix(Number(data.interest_amount || 0) + Number(freezeFormValue.current_period_interest || 0)),
          valuation_amount: freezeFormValue.current_base_amount,
          interest_periods: [currentPeriodInterest]
        };
        onDataUpdated(updatedLoan);
      }
    };
    
    dispatch(freezeLoan({ payload, callback }));
  };

  // Handle cash transaction
  const handleAddCash = async () => {
    if (!data || !data.id) {
      return;
    }

    const transactionData = {
      loan_id: data.id,
      amount: newCashTransaction.amount,
      type: newCashTransaction.type.value,
      date: newCashTransaction.date
    };

    dispatch(addCashTransaction({
      payload: transactionData,
      callback: (updatedData) => {
        setShowCashModal(false);
        setNewCashTransaction({
          amount: '',
          type: { label: "Given", value: "1" },
          date: moment().format('YYYY-MM-DD')
        });
        
        // Refresh cash transactions after adding new one
        fetchCashTransactions();
        
        if (onDataUpdated) {
          onDataUpdated(updatedData);
        }
      }
    }));
  };

  // Handle modal state
  const handleModalState = (name, value) => {
    setModalState(prev => ({ ...prev, [name]: value }));
  };

  // Calculate total cash given and received
  const calculateCashTotals = () => {
    let totalGiven = 0;
    let totalReceived = 0;

    cashTransactions.forEach(transaction => {
      if (transaction.type === "1") {
        totalGiven += Number(transaction.amount);
      } else if (transaction.type === "2") {
        totalReceived += Number(transaction.amount);
      }
    });

    return {
      totalGiven,
      totalReceived,
      netCash: totalGiven - totalReceived
    };
  };

  const cashTotals = calculateCashTotals();

  const renderTransactionHistory = () => (
    <View style={styles.transactionHistorySection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>TRANSACTION HISTORY</Text>
      </View>
      <View style={styles.transactionHistory}>
        <View style={styles.transactionHeader}>
          <Text style={styles.headerCell}>Date</Text>
          <Text style={styles.headerCell}>Type</Text>
          <Text style={styles.headerCell}>Base</Text>
          <Text style={styles.headerCell}>Cash</Text>
          <Text style={styles.headerCell}>Interest</Text>
          <Text style={styles.headerCell}>Balance</Text>
          <Text style={styles.headerCell}>Days</Text>
          <Text style={styles.headerCell}>Notes</Text>
        </View>
        
        <ScrollView style={styles.transactionList}>
          {transactionHistory?.transactions?.map((transaction, index) => (
            <View 
              key={index} 
              style={[
                styles.transactionRow,
                transaction.type === 'Initial Loan' ? styles.initialLoan :
                transaction.type === 'Freeze Period' ? styles.freezePeriod :
                transaction.originalType === 1 ? styles.cashGiven :
                styles.cashReceived
              ]}
            >
              <Text style={styles.cell}>{moment(transaction.date).format('DD/MM/YY')}</Text>
              <Text style={styles.cell}>{transaction.type}</Text>
              <Text style={styles.cell}>₹{handleDigitsFix(transaction.baseAmount)}</Text>
              <Text style={[
                styles.cell,
                transaction.originalType === 1 ? styles.positiveAmount : 
                transaction.originalType === 2 ? styles.negativeAmount : 
                styles.neutralAmount
              ]}>
                {transaction.cashAmount ? 
                  transaction.originalType === 1 ? 
                    `+₹${handleDigitsFix(Math.abs(transaction.cashAmount))}` : 
                    `-₹${handleDigitsFix(Math.abs(transaction.cashAmount))}` : 
                  '-'
                }
              </Text>
              <Text style={styles.cell}>{transaction.interest ? `₹${handleDigitsFix(transaction.interest)}` : '-'}</Text>
              <Text style={styles.cell}>₹{handleDigitsFix(transaction.newBalance)}</Text>
              <Text style={styles.cell}>{transaction.days || '-'}</Text>
              <Text style={styles.cell}>
                {transaction.type === 'Cash Given' ? 'New base amount' :
                 transaction.type === 'Cash Received' ? 'Reduced base amount' :
                 transaction.notes || '-'}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
        {/* Main Header */}
        <View style={styles.mainHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>TANISHQ AMANAT</Text>
            <Text style={styles.companyAddress}>123 Jewelry Street, City - 400001</Text>
            <Text style={styles.companyContact}>Contact: +91 9876543210</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.billTitle}>JEWELLERY BILL</Text>
            <Text style={styles.billNo}>Bill No: {data?.id}</Text>
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

        {/* Interest and Loan Section */}
        <View style={styles.interestSection}>
          <View style={styles.interestSectionHeader}>
            <Text style={styles.interestSectionTitle}>INTEREST PERIODS</Text>
            <TouchableOpacity 
              style={styles.addPeriodButton}
              onPress={() => setShowFreezeLoanModal(true)}
            >
              <AntDesign name="plus" size={16} color="#fff" />
              <Text style={styles.addPeriodText}>Freeze Loan</Text>
            </TouchableOpacity>
          </View>

          {/* Interest Till Today */}
          {interestTillToday && (
            <View style={[styles.interestDetailsRow, styles.currentPeriodRow]}>
              <View style={styles.interestColumn}>
                <Text style={styles.interestLabel}>Interest Till Today</Text>
                <Text style={styles.interestValue}>Current</Text>
              </View>
              <View style={styles.interestColumn}>
                <Text style={styles.interestLabel}>Date</Text>
                <Text style={styles.interestValue}>
                  {moment().format('DD/MM/YY')}
                </Text>
              </View>
              <View style={styles.interestColumn}>
                <Text style={styles.interestLabel}>On Amount</Text>
                <Text style={styles.interestValue}>₹{handleDigitsFix(totalAmount)}</Text>
              </View>
              <View style={styles.interestColumn}>
                <Text style={styles.interestLabel}>Interest ({formValue?.interest_rate || 0}%)</Text>
                <Text style={styles.interestValue}>₹{handleDigitsFix(interestTillToday.interest_till_amount || 0)}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Cash Transactions Section */}
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
          
          {loadingTransactions ? (
            <View style={styles.loadingContainer}>
              <Text>Loading transactions...</Text>
            </View>
          ) : cashTransactions.length > 0 ? (
            <>
              {/* Cash Transactions List */}
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
                    <Text style={[
                      styles.transactionValue,
                      { color: transaction.type === "1" ? '#4CAF50' : '#F44336' }
                    ]}>
                      {transaction.type === "1" ? "Given" : "Received"}
                    </Text>
                  </View>
                  <View style={styles.transactionColumn}>
                    <Text style={styles.transactionLabel}>Amount</Text>
                    <Text style={[
                      styles.transactionValue,
                      { color: transaction.type === "1" ? '#4CAF50' : '#F44336' }
                    ]}>
                      ₹{handleDigitsFix(transaction.amount)}
                    </Text>
                  </View>
                </View>
              ))}

              {/* Cash Totals */}
              <View style={styles.cashTotals}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Given:</Text>
                  <Text style={[styles.totalValue, { color: '#4CAF50' }]}>
                    ₹{handleDigitsFix(cashTotals.totalGiven)}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Received:</Text>
                  <Text style={[styles.totalValue, { color: '#F44336' }]}>
                    ₹{handleDigitsFix(cashTotals.totalReceived)}
                  </Text>
                </View>
                <View style={[styles.totalRow, styles.netTotalRow]}>
                  <Text style={styles.netTotalLabel}>Net Cash:</Text>
                  <Text style={[
                    styles.netTotalValue,
                    { color: cashTotals.netCash >= 0 ? '#4CAF50' : '#F44336' }
                  ]}>
                    ₹{handleDigitsFix(Math.abs(cashTotals.netCash))}
                    {cashTotals.netCash < 0 ? ' (Due)' : ' (Given)'}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noTransactions}>
              <Text style={styles.noTransactionsText}>No cash transactions found</Text>
            </View>
          )}
        </View>

        {/* Transaction History Section */}
        {transactionHistory && (
          renderTransactionHistory()
        )}

        {/* Final Amount Box */}
        <View style={styles.finalAmountBox}>
          <View style={styles.finalRow}>
            <Text style={styles.finalLabel}>Valuation Amount</Text>
            <Text style={styles.finalValue}>₹{handleDigitsFix(formValue.valuation)}</Text>
          </View>
          
          <View style={styles.finalRow}>
            <Text style={styles.finalLabel}>Loan Amount</Text>
            <Text style={styles.finalValue}>₹{handleDigitsFix(formValue.loan_amount)}</Text>
          </View>
          
          <View style={styles.finalRow}>
            <Text style={styles.finalLabel}>Interest Amount</Text>
            <Text style={styles.finalValue}>₹{handleDigitsFix(formValue.interest_amount)}</Text>
          </View>

          {currentBalance && (
            <>
              <View style={styles.finalRow}>
                <Text style={styles.finalLabel}>Total Interest</Text>
                <Text style={styles.finalValue}>₹{handleDigitsFix(currentBalance.total_interest)}</Text>
              </View>
              <View style={styles.finalRow}>
                <Text style={styles.finalLabel}>Total Cash Given</Text>
                <Text style={styles.finalValue}>₹{handleDigitsFix(currentBalance.total_cash_given)}</Text>
              </View>
              <View style={styles.finalRow}>
                <Text style={styles.finalLabel}>Total Cash Received</Text>
                <Text style={styles.finalValue}>₹{handleDigitsFix(currentBalance.total_cash_received)}</Text>
              </View> 
            </>
          )}

          <View style={[styles.finalRow, styles.balanceRow]}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceValue}>
              ₹{handleDigitsFix(currentBalance?.current_balance || totalAmount)}
            </Text>
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

      {/* Cash Transaction Modal */}
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
                  title="Add Transaction"
                  onPress={handleAddCash}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Freeze Loan Modal */}
      {showFreezeLoanModal && (
        <Modal
          visible={showFreezeLoanModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowFreezeLoanModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Freeze Loan Period</Text>
                <TouchableOpacity onPress={() => setShowFreezeLoanModal(false)}>
                  <AntDesign name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.interestPeriodBox}>
                  <Text style={styles.interestPeriodTitle}>Current Interest Period</Text>
                  <View style={styles.interestPeriodRow}>
                    <Text style={styles.interestPeriodText}>Interest from {data?.interest_upto} to</Text>
                    <DatePickerComponent
                      name="to_date"
                      value={freezeFormValue.to_date}
                      onSelect={({ value }) => {
                        const formattedDate = moment(value).format('YYYY-MM-DD');
                        const startDate = moment(data?.interest_upto);
                        const endDate = moment(formattedDate);
                        const days = endDate.diff(startDate, 'days') + 1;
                        const loanAmount = Number(data?.loan_amount || 0);
                        const interestRate = parseFloat(data?.interest_rate || 0);
                        const interest = (loanAmount * interestRate * days) / (100 * 365);
                        
                        const amountChange = freezeFormValue?.new_amount 
                          ? (freezeFormValue.new_amount_type?.value === "1" 
                            ? Number(freezeFormValue.new_amount) 
                            : -Number(freezeFormValue.new_amount))
                          : 0;
                        
                        const totalAfterFreezing = loanAmount + interest + amountChange;

                        setFreezeFormValue(prev => ({
                          ...prev,
                          current_period_interest: handleDigitsFix(interest),
                          current_base_amount: handleDigitsFix(totalAfterFreezing),
                          total_amount: handleDigitsFix(totalAfterFreezing),
                          to_date: formattedDate
                        }));
                      }}
                    />
                  </View>
                  <View style={styles.interestPeriodRow}>
                    <Text style={styles.interestPeriodText}>Interest Amount</Text>
                    <Text style={styles.interestPeriodValue}>₹{freezeFormValue?.current_period_interest || "0.00"}</Text>
                  </View>
                  <View style={styles.interestPeriodRow}>
                    <Text style={styles.interestPeriodText}>On Amount</Text>
                    <Text style={styles.interestPeriodValue}>₹{handleDigitsFix(freezeFormValue?.total_amount || data?.loan_amount || "0.00")}</Text>
                  </View>
                </View>

                <View style={styles.newAmountSection}>
                  <View style={styles.newAmountRow}>
                    <InputBox
                      name="new_amount"
                      placeholder="0"
                      label="New Amount"
                      value={freezeFormValue?.new_amount}
                      onChange={({ value }) => setFreezeFormValue(prev => ({ ...prev, new_amount: value }))}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.newAmountRow}>
                    <SelectInput
                      label="Amount Type"
                      name="new_amount_type"
                      placeholder="Select"
                      value={freezeFormValue?.new_amount_type}
                      data={[
                        { label: "Given", value: "1" },
                        { label: "Received", value: "2" },
                      ]}
                      onSelect={(value) => setFreezeFormValue(prev => ({ ...prev, new_amount_type: value }))}
                    />
                  </View>
                </View>

                <View style={styles.newBaseAmount}>
                  <InputBox
                    name="current_base_amount"
                    label="New Base Amount (After Interest & New Loan)"
                    placeholder="0.00"
                    value={freezeFormValue?.current_base_amount}
                    readOnly={true}
                  />
                </View>

                <View style={styles.finalTotal}>
                  <Text style={styles.finalTotalTitle}>Total After Freezing</Text>
                  <Text style={styles.finalTotalValue}>₹{freezeFormValue?.total_amount || "0.00"}</Text>
                </View>

                <View style={styles.freezeToggle}>
                  <Text style={styles.freezeToggleText}>Do you want to freeze this loan?</Text>
                  <ToggleSwitch
                    value={freezeFormValue?.is_freeze}
                    name="is_freeze"
                    onChange={(name, value) => setFreezeFormValue(prev => ({ ...prev, [name]: value }))}
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowFreezeLoanModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleFreezeLoanSubmit}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
    backgroundColor: 'white',
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 4,
    marginBottom: 4,
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
    marginBottom: 4,
  },
  customerHeader: {
    backgroundColor: '#f5f5f5',
    padding: 2,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  customerHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
  },
  customerContent: {
    padding: 3,
  },
  customerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginBottom: 1,
  },
  customerAddress: {
    fontSize: 10,
    color: '#666',
    marginBottom: 1,
  },
  customerContact: {
    fontSize: 10,
    color: '#666',
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
  finalAmountBox: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 3,
    borderRadius: 4,
    marginBottom: 4,
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
    marginTop: 2,
    paddingTop: 2,
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
    marginBottom: 4,
  },
  termsHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  termsText: {
    fontSize: 9,
    color: '#666',
    marginBottom: 1,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
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
  interestSection: {
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 3,
  },
  interestSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
    paddingBottom: 2,
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
    padding: 2,
    borderRadius: 2,
    alignItems: 'center',
  },
  addPeriodText: {
    color: '#fff',
    marginLeft: 2,
    fontSize: 9,
  },
  cashSection: {
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
    paddingBottom: 2,
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
    padding: 2,
    borderRadius: 2,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 2,
    fontSize: 9,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    marginBottom: 20,
  },
  interestPeriodBox: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  interestPeriodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  interestPeriodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  interestPeriodText: {
    fontSize: 14,
    color: '#666',
  },
  interestPeriodValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  newAmountSection: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  newAmountRow: {
    flex: 1,
  },
  newBaseAmount: {
    marginBottom: 20,
  },
  finalTotal: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  finalTotalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  freezeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  freezeToggleText: {
    fontSize: 14,
    color: '#666',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
  },
  interestDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  interestColumn: {
    flex: 1,
    alignItems: 'center',
  },
  currentPeriodRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 6,
    paddingTop: 6,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 24,
  },
  transactionColumn: {
    flex: 1,
    alignItems: 'center',
  },
  transactionLabel: {
    fontSize: 9,
    color: '#666',
    marginBottom: 1,
  },
  transactionValue: {
    fontSize: 10,
    color: '#000',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noTransactions: {
    padding: 16,
    alignItems: 'center',
  },
  noTransactionsText: {
    color: '#666',
    fontSize: 14,
  },
  cashTotals: {
    marginTop: 3,
    paddingTop: 3,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  netTotalRow: {
    marginTop: 2,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  netTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  netTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionHistorySection: {
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 3,
  },
  transactionHistory: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  transactionHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 10,
    padding: 2,
  },
  transactionList: {
    maxHeight: 400,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 10,
    padding: 2,
  },
  positiveAmount: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  negativeAmount: {
    color: '#F44336',
    fontWeight: '600',
  },
  neutralAmount: {
    color: '#000000',
  },
  initialLoan: {
    backgroundColor: '#E3F2FD',
  },
  freezePeriod: {
    backgroundColor: '#FFF3E0',
  },
  cashGiven: {
    backgroundColor: '#E8F5E9',
  },
  cashReceived: {
    backgroundColor: '#FFEBEE',
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
  buttonContainer: {
    marginTop: 8,
  },
});

export default SimpleInvoiceBill; 