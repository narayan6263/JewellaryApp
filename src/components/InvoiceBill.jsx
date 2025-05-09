import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { handleDigitsFix } from "../utils";
import moment from "moment";

const InvoiceBill = ({ data, invoices, formValue }) => {
  // Calculate totals
  const totalGrossWeight = invoices.reduce(
    (total, invoice) => total + parseFloat(invoice.gross_weight || 0),
    0
  );

  const totalFineWeight = invoices.reduce(
    (total, invoice) => total + parseFloat(invoice.fine_weight || 0),
    0
  );

  const totalValuation = invoices.reduce(
    (total, invoice) => total + parseFloat(invoice.valuation || 0),
    0
  );

  const currentBalance = invoices.reduce(
    (total, invoice) => total + parseFloat(invoice.net_price || 0),
    0
  );

  // Calculate total paid amount
  const totalPaid = 0; // This should come from your payments data
  const balance = Number(currentBalance || 0) + Number(formValue?.interest_amount || 0) + Number(formValue?.loan_amount || 0) - totalPaid;

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
          <Text style={styles.billNo}>Bill No: {moment().unix()}</Text>
          <Text style={styles.dateText}>Date: {moment().format('DD-MM-YYYY')}</Text>
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
              ₹{handleDigitsFix(invoice.valuation)}
            </Text>
          </View>
        ))}
      </View>

      {/* Calculations Box */}
      <View style={styles.calculationsBox}>
        <View style={styles.calculationRow}>
          <Text style={styles.calculationLabel}>Total Gross Weight:</Text>
          <Text style={styles.calculationValue}>{handleDigitsFix(totalGrossWeight)} gm</Text>
        </View>
        <View style={styles.calculationRow}>
          <Text style={styles.calculationLabel}>Total Fine Weight:</Text>
          <Text style={styles.calculationValue}>{handleDigitsFix(totalFineWeight)} gm</Text>
        </View>
        <View style={styles.calculationRow}>
          <Text style={styles.calculationLabel}>Total Valuation:</Text>
          <Text style={styles.calculationValue}>₹{handleDigitsFix(totalValuation)}</Text>
        </View>
      </View>

      {/* Interest and Loan Section */}
      <View style={styles.interestSection}>
        {formValue?.interest_upto && (
          <View style={styles.interestRow}>
            <Text style={styles.interestLabel}>Interest ({formValue?.interest_rate}%) up to {moment(formValue.interest_upto).format('DD/MM/YY')}:</Text>
            <Text style={styles.interestValue}>₹{handleDigitsFix(formValue?.interest_amount)}</Text>
          </View>
        )}
        {formValue?.loan_amount > 0 && (
          <View style={styles.interestRow}>
            <Text style={styles.interestLabel}>Loan Amount:</Text>
            <Text style={styles.interestValue}>₹{handleDigitsFix(formValue?.loan_amount)}</Text>
          </View>
        )}
      </View>

      {/* Final Amount Box */}
      <View style={styles.finalAmountBox}>
        <View style={styles.finalRow}>
          <Text style={styles.finalLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.finalValue}>₹{handleDigitsFix(Number(currentBalance || 0) + Number(formValue?.interest_amount || 0) + Number(formValue?.loan_amount || 0))}</Text>
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
    padding: 16,
    backgroundColor: 'white',
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 16,
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  companyAddress: {
    fontSize: 12,
    color: '#666',
  },
  companyContact: {
    fontSize: 12,
    color: '#666',
  },
  billTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  billNo: {
    fontSize: 14,
    color: '#444',
  },
  dateText: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },
  customerBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
  },
  customerHeader: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  customerHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  customerContent: {
    padding: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  customerAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  customerContact: {
    fontSize: 14,
    color: '#666',
  },
  itemsSection: {
    marginBottom: 16,
  },
  itemsHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
  columnHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
  },
  itemRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
    alignItems: 'center',
  },
  itemName: {
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 12,
    color: '#666',
  },
  itemWeight: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
  itemAmount: {
    fontSize: 14,
    color: '#000',
    textAlign: 'right',
  },
  calculationsBox: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  calculationLabel: {
    fontSize: 14,
    color: '#444',
  },
  calculationValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  interestSection: {
    marginBottom: 16,
  },
  interestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  interestLabel: {
    fontSize: 14,
    color: '#444',
  },
  interestValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  finalAmountBox: {
    borderWidth: 1,
    borderColor: '#000',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  finalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  finalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  finalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  balanceRow: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    marginTop: 8,
    paddingTop: 8,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  termsSection: {
    marginBottom: 24,
  },
  termsHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  signatureBox: {
    alignItems: 'center',
    width: '40%',
  },
  signatureText: {
    fontSize: 14,
    color: '#000',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 8,
    textAlign: 'center',
  }
});

export default InvoiceBill; 