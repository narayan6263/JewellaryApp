import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { handleDigitsFix } from "../../utils";
import moment from "moment";

const ProfessionalInvoiceBill = ({ data, invoices, formValue, payments = [] }) => {
  // Calculate totals
  const totalValuation = invoices.reduce(
    (total, invoice) => total + parseFloat(invoice.valuation || 0),
    0
  );

  const currentBalance = invoices.reduce(
    (total, invoice) => total + parseFloat(invoice.net_price || 0),
    0
  );

  // Calculate total paid amount from payments
  const totalPaid = payments.reduce((total, payment) => total + parseFloat(payment.amount || 0), 0);
  
  // Calculate final balance
  const totalAmount = Number(currentBalance || 0) + Number(formValue?.interest_amount || 0) + Number(formValue?.loan_amount || 0);
  const balance = totalAmount - totalPaid;

  return (
    <View style={styles.container}>
      {/* Main Header */}
      <View style={styles.mainHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.companyName}>TANISHQ AMANAT</Text>
          <Text style={styles.companyAddress}>123 Jewelry Street, City - 400001</Text>
          <Text style={styles.companyContact}>Contact: +91 9876543210</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.billTitle}>JEWELLERY BILL</Text>
          <Text style={styles.billNo}>Bill No: {data.id}</Text>
          <Text style={styles.dateText}>Date: {moment().format('DD-MM-YYYY')}</Text>
        </View>
      </View>

      {/* Customer Details */}
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
              ₹{handleDigitsFix(invoice.valuation)}
            </Text>
          </View>
        ))}
      </View>

      {/* Interest and Loan Section */}
      <View style={styles.interestSection}>
        {/* Previous Interest Periods */}
        {formValue?.interest_periods?.map((period, index) => (
          <View key={index} style={styles.interestDetailsRow}>
            <View style={styles.interestColumn}>
              <Text style={styles.interestLabel}>Interest Period {index + 1}</Text>
              <Text style={styles.interestValue}>Interest</Text>
            </View>
            <View style={styles.interestColumn}>
              <Text style={styles.interestLabel}>Date</Text>
              <Text style={styles.interestValue}>
                {moment(period.interest_upto).format('DD/MM/YY')}
              </Text>
            </View>
            <View style={styles.interestColumn}>
              <Text style={styles.interestLabel}>On Amount</Text>
              <Text style={styles.interestValue}>₹{handleDigitsFix(period.base_amount)}</Text>
            </View>
            <View style={styles.interestColumn}>
              <Text style={styles.interestLabel}>Interest ({period.interest_rate}%)</Text>
              <Text style={styles.interestValue}>₹{handleDigitsFix(period.interest_amount)}</Text>
            </View>
          </View>
        ))}
        
        {/* Current Period */}
        <View style={[styles.interestDetailsRow, styles.currentPeriodRow]}>
          <View style={styles.interestColumn}>
            <Text style={[styles.interestLabel, styles.currentPeriodLabel]}>Current Period</Text>
            <Text style={styles.interestValue}>Interest</Text>
          </View>
          <View style={styles.interestColumn}>
            <Text style={styles.interestLabel}>Date</Text>
            <Text style={styles.interestValue}>
              {moment(formValue?.interest_upto).format('DD/MM/YY')}
            </Text>
          </View>
          <View style={styles.interestColumn}>
            <Text style={styles.interestLabel}>On Amount</Text>
            <Text style={styles.interestValue}>₹{handleDigitsFix(currentBalance)}</Text>
          </View>
          <View style={styles.interestColumn}>
            <Text style={styles.interestLabel}>Interest ({formValue?.interest_rate}%)</Text>
            <Text style={styles.interestValue}>₹{handleDigitsFix(formValue?.interest_amount)}</Text>
          </View>
        </View>

        {/* Additional Loan Amount if any */}
        {Number(formValue?.loan_amount) > 0 && (
          <View style={styles.loanRow}>
            <Text style={styles.interestLabel}>Additional Loan Amount:</Text>
            <Text style={styles.interestValue}>₹{handleDigitsFix(formValue?.loan_amount)}</Text>
          </View>
        )}
      </View>

      {/* Final Amount Box */}
      <View style={styles.finalAmountBox}>
        <View style={styles.finalRow}>
          <Text style={styles.finalLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.finalValue}>₹{handleDigitsFix(totalAmount)}</Text>
        </View>
        <View style={styles.finalRow}>
          <Text style={styles.finalLabel}>Amount Paid</Text>
          <Text style={styles.finalValue}>₹{handleDigitsFix(totalPaid)}</Text>
        </View>
        <View style={[styles.finalRow, styles.balanceRow]}>
          <Text style={styles.balanceLabel}>Balance Due</Text>
          <Text style={styles.balanceValue}>₹{handleDigitsFix(balance)}</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  companyAddress: {
    fontSize: 14,
    color: '#666',
  },
  companyContact: {
    fontSize: 14,
    color: '#666',
  },
  billTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  billNo: {
    fontSize: 14,
    color: '#666',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  customerBox: {
    padding: 10,
  },
  customerHeader: {
    marginBottom: 10,
  },
  customerHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerAddress: {
    fontSize: 14,
    color: '#666',
  },
  customerContact: {
    fontSize: 14,
    color: '#666',
  },
  itemsSection: {
    padding: 10,
  },
  itemsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  columnHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemName: {
    flex: 2,
    fontSize: 16,
  },
  itemDetails: {
    flex: 2,
    fontSize: 14,
    color: '#666',
  },
  itemWeight: {
    flex: 1,
    fontSize: 14,
  },
  itemAmount: {
    flex: 1,
    fontSize: 14,
  },
  interestSection: {
    padding: 10,
  },
  interestDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  interestColumn: {
    flex: 1,
  },
  interestLabel: {
    fontSize: 14,
    color: '#666',
  },
  interestValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentPeriodRow: {
    backgroundColor: '#f5f5f5',
    marginTop: 8,
    borderRadius: 4,
  },
  currentPeriodLabel: {
    color: '#1976d2',
    fontWeight: '600',
  },
  loanRow: {
    marginTop: 8,
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  finalAmountBox: {
    padding: 10,
  },
  finalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  finalLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  finalValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceRow: {
    backgroundColor: '#f5f5f5',
    marginTop: 8,
    borderRadius: 4,
  },
  balanceLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  balanceValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsSection: {
    padding: 10,
  },
  termsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
  },
  signatureSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  signatureBox: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  signatureText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfessionalInvoiceBill; 