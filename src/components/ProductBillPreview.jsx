import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { handleDigitsFix } from '../utils';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import moment from 'moment';

const ProductBillPreview = ({ data, product, isPreview = false, isPurchase = false, formValue = null }) => {
  if (formValue) {
    data = {
      ...formValue,
      customer_name: formValue?.costumer_name,
      customer: formValue
    };
    
    const selectedProduct = formValue?.selectedProduct?.[0] || {};
    
    product = {
      type: isPurchase ? "purchase" : "sale",
      [isPurchase ? "purchase" : "sale"]: selectedProduct?.[isPurchase ? "purchase" : "sale"] || {},
      name: selectedProduct?.name,
      size: selectedProduct?.size,
      interest_type: selectedProduct?.interest_type,
      interest_rate: selectedProduct?.interest_rate,
      interest_upto: selectedProduct?.interest_upto,
      interest_amount: selectedProduct?.interest_amount,
      interest_duration: selectedProduct?.interest_duration
    };
  }

  const category = product?.type || (isPurchase ? "purchase" : "sale");
  const productData = product?.[category] || {};
  const customerData = data?.customer || data || {};

  const renderField = (label, value, showField, unit = '') => {
    if (!showField) return null;
    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}:</Text>
        <Text style={styles.detailValue}>{value}{unit}</Text>
      </View>
    );
  };

  const renderCalculation = (label, value, formula, showField) => {
    if (!showField) return null;
    return (
      <View style={styles.calculationRow}>
        <Text style={styles.calculationLabel}>{label}:</Text>
        <View style={styles.calculationValueContainer}>
          <Text style={styles.formula}>({formula})</Text>
          <Text style={styles.calculationValue}>{value}</Text>
        </View>
      </View>
    );
  };

  const generateHTML = () => {
    // Get all products from the formValue or data
    const allProducts = formValue?.selectedProduct || data?.selectedProduct || [product];

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Bill Preview</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .company-logo { font-size: 24px; font-weight: bold; }
            .company-name { font-size: 18px; font-weight: bold; }
            .company-details { font-size: 12px; color: #333; }
            .customer-section { margin-bottom: 20px; }
            .section { margin-bottom: 15px; border: 1px solid #ddd; padding: 10px; }
            .section-title { font-size: 14px; font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; }
            .detail-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .calculation-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .formula { font-size: 11px; color: #666; margin-right: 5px; }
            .charges-section { margin-top: 10px; padding-top: 5px; border-top: 1px solid #ddd; }
            .tax-section { margin-top: 10px; padding-top: 5px; border-top: 1px solid #ddd; }
            .total-row { display: flex; justify-content: space-between; margin-top: 10px; padding-top: 5px; border-top: 1px solid #ddd; }
            .grand-total-row { display: flex; justify-content: space-between; margin-top: 10px; padding-top: 5px; border-top: 2px solid #333; font-weight: bold; }
            .footer { margin-top: 20px; border-top: 1px solid #ddd; padding-top: 10px; text-align: right; }
            .status-container { 
              padding: 12px; 
              margin-bottom: 16px; 
              border-radius: 8px; 
              border: 1px solid #ddd; 
            }
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
            .customer-content {
              padding: 12px;
            }
            .customer-info-row {
              display: flex;
              margin-bottom: 8px;
            }
            .customer-info-label {
              width: 120px;
              color: #666;
              font-size: 14px;
            }
            .customer-info-value {
              flex: 1;
              color: #000;
              font-size: 14px;
            }
            .items-section {
              margin-bottom: 16px;
            }
            .items-header {
              display: flex;
              background-color: #f5f5f5;
              padding: 8px;
              border-radius: 4px;
              margin-bottom: 8px;
            }
            .interest-section {
              margin-bottom: 16px;
              border: 1px solid #ddd;
              border-radius: 8px;
              padding: 12px;
            }
            .interest-details-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 12px;
              padding-bottom: 12px;
              border-bottom: 1px solid #eee;
            }
            .custom-field-box {
              margin-bottom: 10px;
              padding: 12px;
              background-color: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              min-height: 40px;
              display: flex;
              align-items: center;
              box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }
            .custom-field-value {
              font-size: 14px;
              color: #333333;
            }
            /* PDF Table Alignment */
            .items-table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
              margin: 20px 0;
              font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif;
            }
            .items-table th, 
            .items-table td {
              padding: 8px;
              border: 1px solid #ddd;
              vertical-align: top;
            }
            .items-table th {
              background-color: #f5f5f5;
              font-weight: 600;
              color: #444;
              font-size: 12px;
            }
            .items-table th:first-child,
            .items-table td:first-child {
              width: 40%;
              text-align: left;
            }
            .items-table th:nth-child(2),
            .items-table td:nth-child(2),
            .items-table th:nth-child(3),
            .items-table td:nth-child(3),
            .items-table th:nth-child(4),
            .items-table td:nth-child(4) {
              width: 20%;
              text-align: right;
              font-family: 'Courier New', monospace;
            }
            .item-name {
              font-size: 14px;
              color: #000;
              font-weight: 500;
            }
            .item-details {
              font-size: 12px;
              color: #666;
              margin-top: 4px;
            }
            .payment-summary {
              text-align: right;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px solid #ddd;
              line-height: 1.5;
            }
            /* Additional styles for product details */
            .product-detail-container {
              padding: 12px;
              background-color: #f9f9f9;
              margin-top: 4px;
              margin-bottom: 8px;
              border-radius: 8px;
            }
            .product-detail-section {
              margin-bottom: 16px;
            }
            .product-detail-title {
              font-size: 14px;
              font-weight: 600;
              color: #333;
              margin-bottom: 8px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 4px;
            }
            .product-detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 4px;
              padding: 0 8px;
            }
            .product-detail-label {
              font-size: 12px;
              color: #666;
            }
            .product-detail-value {
              font-size: 12px;
              color: #333;
              font-weight: 500;
            }
            .product-detail-value-container {
              display: flex;
              align-items: center;
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
            }
            .interest-value {
              font-size: 14px;
              color: #000;
              font-weight: 500;
            }
            .subtotal-row {
              margin-top: 12px;
              padding-top: 8px;
              border-top: 1px solid #ddd;
              display: flex;
              justify-content: space-between;
            }
            .final-price-row {
              margin-top: 12px;
              padding-top: 8px;
              border-top: 2px solid #333;
              display: flex;
              justify-content: space-between;
            }
            .final-price-label, .final-price-value {
              font-size: 14px;
              font-weight: bold;
              color: #333;
            }
            /* Add new styles for compact details */
            .details-line {
              display: flex;
              flex-wrap: wrap;
              gap: 4px;
              padding: 4px 8px;
              background-color: #f9f9f9;
              border-top: 1px dashed #ddd;
              font-size: 11px;
            }
            .detail-chip {
              display: inline-flex;
              align-items: center;
              border: 1px solid #ddd;
              padding: 2px 4px;
              border-radius: 4px;
              background: white;
            }
            .detail-label {
              color: #666;
              font-size: 8px;
              text-transform: uppercase;
              margin-right: 2px;
            }
            .detail-value {
              color: #333;
              font-weight: 500;
            }
            .interest-chip {
              background-color: #e3f2fd;
              border-color: #90caf9;
            }
            .weight-chip {
              background-color: #f3e5f5;
              border-color: #ce93d8;
            }
            .price-chip {
              background-color: #e8f5e9;
              border-color: #a5d6a7;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-logo">TJ</div>
            <div class="company-name">TANISHQ JEWELLER</div>
            <div class="company-details">
              Ganpati Chowk<br>
              Science(1999)<br>
              PETLAWAD-457773<br>
              Email: ajay10son1@gmail.com<br>
              GSTIN: 23BJOPS9792Q1Z4<br>
              <div style="font-weight: bold; text-align: center; margin-top: 5px; font-size: 20px;">${category || 'Jewellery'}</div>
            </div>
          </div>

          <div class="customer-section">
            <div>TO,</div>
            <div style="font-weight: 500; margin: 5px 0;">${data?.customer_name || ''}</div>
            <div>Date: ${new Date().toLocaleDateString()}</div>
            <div>Invoice Number: ${data?.invoice_number || ''}</div>
            <div>Type: ${category || 'Jewellery'}</div>
          </div>

          <!-- Customer Details Box -->
          <div class="customer-box">
            <div class="customer-header">
              <div style="font-size: 14px; font-weight: 600; color: #444;">CUSTOMER DETAILS</div>
            </div>
            <div class="customer-content" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; padding: 8px;">
              <div style="display: flex; gap: 8px;">
                <div style="flex: 1;">
                  <div style="font-size: 12px; color: #666;">Name: <span style="color: #000;">${data?.customer_name || ''}</span></div>
                  <div style="font-size: 12px; color: #666;">Phone: <span style="color: #000;">${data?.phone || ''}</span></div>
                  <div style="font-size: 12px; color: #666;">Email: <span style="color: #000;">${data?.email || ''}</span></div>
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                <div style="flex: 1;">
                  <div style="font-size: 12px; color: #666;">Address: <span style="color: #000;">${data?.address || ''}</span></div>
                  <div style="font-size: 12px; color: #666;">City/State: <span style="color: #000;">${data?.city || ''}, ${data?.state || ''}</span></div>
                  <div style="font-size: 12px; color: #666;">PIN: <span style="color: #000;">${data?.pincode || ''}</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Items Section - Table-based layout -->
          <table class="items-table">
            <thead>
              <tr>
                <th>ITEM DESCRIPTION</th>
                <th>RATE</th>
                <th>WEIGHT</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${(formValue?.selectedProduct || [product]).map((item, index) => {
                const itemData = item[isPurchase ? "purchase" : "sale"] || {};
                
                // Generate compact details
                const weightDetails = [
                  itemData?.showGrossWeightInBill && { label: 'GW', value: `${handleDigitsFix(itemData?.gross_weight || 0)}g` },
                  itemData?.showLessWeightInBill && { label: 'LW', value: `${handleDigitsFix(itemData?.less_weight || 0)}g` },
                  itemData?.showNetWeightInBill && { label: 'NW', value: `${handleDigitsFix(itemData?.net_weight || 0)}g` },
                  itemData?.showWastageInBill && { label: 'WS', value: `${handleDigitsFix(itemData?.wastage || 0)}%` },
                  itemData?.showTounchInBill && { label: 'T', value: `${handleDigitsFix(itemData?.tounch || 0)}%` },
                  itemData?.showFineWeightInBill && { label: 'FW', value: `${handleDigitsFix(itemData?.fine_weight || 0)}g` }
                ].filter(Boolean);

                const priceDetails = [
                  itemData?.showPriceInBill && { label: 'MV', value: `₹${handleDigitsFix(Number(itemData?.fine_weight || 0) * Number((itemData?.rate?.price || itemData?.rate) || 0))}` },
                  itemData?.showMakingChargeInBill && { label: 'MC', value: `₹${handleDigitsFix(itemData?.making_charge || 0)}` },
                  ...(itemData?.showChargesInBill && itemData?.charges_json ? 
                    itemData.charges_json.map(charge => ({ 
                      label: (charge?.name || "CH").substring(0, 2).toUpperCase(), 
                      value: `₹${handleDigitsFix(charge?.amount || 0)}` 
                    })) : []),
                  ...(itemData?.showTaxInBill && itemData?.tax_json ? 
                    itemData.tax_json.map(tax => ({ 
                      label: 'TAX', 
                      value: `${handleDigitsFix(tax?.amount || 0)}%` 
                    })) : [])
                ].filter(Boolean);

                return `
              <tr>
                <td>
                      <div class="item-name">${item?.name || "Item"} ${index + 1}</div>
                      <div class="item-details">Touch: ${itemData?.tounch || 0}%</div>
                </td>
                    <td>₹${handleDigitsFix(typeof itemData?.rate === 'object' ? (itemData?.rate?.price || 0) : (itemData?.rate || 0))}</td>
                    <td>${handleDigitsFix(itemData?.gross_weight || 0)} gm</td>
                    <td>₹${handleDigitsFix(itemData?.net_price || 0)}</td>
              </tr>
                  ${(weightDetails.length > 0 || priceDetails.length > 0) ? `
                    <tr>
                      <td colspan="4">
                        <div class="details-line">
                          ${weightDetails.map(detail => `
                            <div class="detail-chip weight-chip">
                              <span class="detail-label">${detail.label}</span>
                              <span class="detail-value">${detail.value}</span>
                    </div>
                  `).join('')}
                          ${priceDetails.map(detail => `
                            <div class="detail-chip price-chip">
                              <span class="detail-label">${detail.label}</span>
                              <span class="detail-value">${detail.value}</span>
                    </div>
                  `).join('')}
                      </div>
                    </td>
                  </tr>
                  ` : ''}
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="payment-summary">
            <div>Total: ₹${handleDigitsFix(
              (formValue?.selectedProduct || [product]).reduce((sum, item) => {
                const itemData = item[isPurchase ? "purchase" : "sale"] || {};
                return sum + Number(itemData?.net_price || 0);
              }, 0)
            )}</div>
            <div>Paid: ₹${handleDigitsFix(formValue?.amount_paid || data?.amount_paid || 0)}</div>
            <div>Balance: ₹${handleDigitsFix(
              (formValue?.selectedProduct || [product]).reduce((sum, item) => {
                const itemData = item[isPurchase ? "purchase" : "sale"] || {};
                return sum + Number(itemData?.net_price || 0);
              }, 0) - 
              Number(formValue?.amount_paid || data?.amount_paid || 0)
            )}</div>
            </div>

          <div class="footer">
            <div>Payment Mode: ${formValue?.payment_mode || data?.payment_mode || 'Cash/UPI'}</div>
            <div>Date: ${moment(formValue?.payment_date || data?.payment_date || new Date()).format('DD MMM YYYY')}</div>
          </div>
        </body>
      </html>
    `;
  };

  const renderHTMLField = (label, value, showField, unit = '') => {
    if (!showField) return '';
    return `
      <div class="detail-row">
        <span>${label}:</span>
        <span>${value}${unit}</span>
      </div>
    `;
  };

  const renderHTMLCalculation = (label, value, formula, showField) => {
    if (!showField) return '';
    return `
      <div class="calculation-row">
        <span>${label}:</span>
        <span>
          <span class="formula">(${formula})</span>
          <span>${value}</span>
        </span>
      </div>
    `;
  };

  const handlePrintBill = async () => {
    try {
      const { uri } = await Print.printToFileAsync({
        html: generateHTML(),
        base64: false
      });

      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf'
      });
    } catch (error) {
      console.error('Error printing bill:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.headerSection}>
        <Text style={styles.companyLogo}>TJ</Text>
        <Text style={styles.companyName}>TANISH JEWELLERS</Text>
        <Text style={styles.companyAddress}>Ganpati Chowk</Text>
        <Text style={styles.companyAddress}>Science(1999)</Text>
        <Text style={styles.companyAddress}>PETLAWAD-457773</Text>
        <Text style={styles.companyContact}>Email: ajay10son1@gmail.com</Text>
        <Text style={styles.companyContact}>GSTIN: 23BJOPS9792Q1Z4</Text>
        <Text style={[styles.companyContact, styles.typeText]}>{category || 'Jewellery'}</Text>
      </View>

      <View style={styles.customerSection}>
        <Text style={styles.customerLabel}>TO,</Text>
        <Text style={styles.customerName}>{data?.customer_name || ''}</Text>
        <View style={styles.invoiceDetails}>
          <Text style={styles.invoiceText}>Date: {new Date().toLocaleDateString()}</Text>
          <Text style={styles.invoiceText}>Invoice Number: {data?.invoice_number || ''}</Text>
          <Text style={styles.invoiceText}>Type: {category || 'Jewellery'}</Text>
        </View>
      </View>

      <View style={styles.customerBox}>
        <View style={styles.customerHeader}>
          <Text style={styles.customerHeaderText}>CUSTOMER DETAILS</Text>
        </View>
        <View style={styles.customerContent}>
          <View style={styles.customerColumn}>
            <View style={styles.customerInfoItem}>
              <Text style={styles.customerInfoLabel}>Name:</Text>
              <Text style={styles.customerInfoValue}>{data?.customer_name || ''}</Text>
            </View>
            <View style={styles.customerInfoItem}>
              <Text style={styles.customerInfoLabel}>Phone:</Text>
              <Text style={styles.customerInfoValue}>{data?.phone || ''}</Text>
            </View>
            <View style={styles.customerInfoItem}>
              <Text style={styles.customerInfoLabel}>Email:</Text>
              <Text style={styles.customerInfoValue}>{data?.email || ''}</Text>
            </View>
          </View>
          <View style={styles.customerColumn}>
            <View style={styles.customerInfoItem}>
              <Text style={styles.customerInfoLabel}>Address:</Text>
              <Text style={styles.customerInfoValue}>{data?.address || ''}</Text>
            </View>
            <View style={styles.customerInfoItem}>
              <Text style={styles.customerInfoLabel}>City/State:</Text>
              <Text style={styles.customerInfoValue}>
                {data?.city || ''}, {data?.state || ''}
              </Text>
            </View>
            <View style={styles.customerInfoItem}>
              <Text style={styles.customerInfoLabel}>PIN:</Text>
              <Text style={styles.customerInfoValue}>{data?.pincode || ''}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.itemsSection}>
        <View style={styles.itemsHeader}>
            <Text style={[styles.columnHeader, styles.firstColumn]}>ITEM DESCRIPTION</Text>
          <Text style={styles.columnHeader}>RATE</Text>
          <Text style={styles.columnHeader}>WEIGHT</Text>
          <Text style={styles.columnHeader}>AMOUNT</Text>
        </View>
        
          {(formValue?.selectedProduct || data?.selectedProduct || [product]).map((item, index) => {
            const itemData = item[isPurchase ? "purchase" : "sale"] || {};
            return (
              <View key={index}>
        <View style={styles.itemRow}>
          <View style={styles.itemDescription}>
                    <Text style={styles.itemName}>{item?.name || "Item"}</Text>
                    <Text style={styles.itemDetails}>Touch: {itemData?.tounch || 0}%</Text>
          </View>
                  <Text style={styles.itemText}>₹{handleDigitsFix(typeof itemData?.rate === 'object' ? (itemData?.rate?.price || 0) : (itemData?.rate || 0))}</Text>
                  <Text style={styles.itemText}>{handleDigitsFix(itemData?.gross_weight || 0)} g</Text>
                  <Text style={styles.itemText}>₹{handleDigitsFix(itemData?.net_price || 0)}</Text>
      </View>

                {/* Detailed information for each product */}
                <View style={styles.productDetailContainer}>
      {/* Interest Section */}
                {item?.interest_type && (
                    <View style={styles.productDetailSection}>
                    <Text style={styles.productDetailTitle}>Interest Details</Text>
                    
                    {/* Interest Configuration */}
                    <View style={styles.interestConfigSection}>
                    <View style={styles.interestConfigRow}>
  <Text style={styles.interestConfigLabel}>Interest Type</Text>
  <Text style={styles.interestConfigValue}>{(() => {
      // Get interest type using same logic as in ProductForm
      if (!item?.interest_type) return 'N/A';
      
      // Check if interest_type is an object with label property
      if (item.interest_type.label) {
        return item.interest_type.label;
      }
      
      // If it's a direct value, map it to the correct label
      const interestTypeMap = {
        "1": "Compound",
        "2": "Flat"
      };
      
      return interestTypeMap[item.interest_type] || String(item.interest_type);
    })()}
  </Text>
</View>
 
<View style={styles.remarkSection}>
  <Text style={styles.remarkTitle}>Remark</Text>
  <View style={styles.remarkBox}>
    <View style={styles.remarkContainer}>
      <Text style={styles.remarkLabel}>Remark:</Text>
      <Text style={styles.remarkValue}>{item?.remark || 'N/A'}</Text>
    </View>
  </View>
</View>

<View style={styles.interestNotesSection}>
  <Text style={styles.interestNotesTitle}>Interest Notes</Text>
  <View style={styles.interestNotesBox}>
    <View style={styles.interestNotesContainer}>
      <Text style={styles.interestNotesValue}>{item?.interest_notes || 'N/A'}</Text>
    </View>
  </View>
</View>

 

                      <View style={styles.interestConfigRow}>
                        <Text style={styles.interestConfigLabel}>Interest Rate</Text>
                        <Text style={styles.interestConfigValue}>{`${item?.interest_rate || 0}%`}</Text>
                      </View>
                      <View style={styles.interestConfigRow}>
                        <Text style={styles.interestConfigLabel}>Interest Duration</Text>
                        <Text style={styles.interestConfigValue}>{String(item?.interest_duration || 'N/A')}</Text>
                      </View>
                      {item?.grace_period_enabled && (
                        <View style={styles.interestConfigRow}>
                          <Text style={styles.interestConfigLabel}>Grace Period</Text>
                          <Text style={styles.interestConfigValue}>{`${item?.grace_period || 0} days`}</Text>
                        </View>
                      )}
                    </View>

                    {/* Current Period Details */}
                    <Text style={styles.interestSubtitle}>Current Period Details</Text>
          <View style={styles.interestDetailsRow}>
            <View style={styles.interestColumn}>
  <Text style={styles.interestLabel}>Start Date</Text>
              <Text style={styles.interestValue}>{(() => {
      // Get start date using same logic as period calculation
      if (!item?.bill_date) return 'N/A';
      
      const startDate = item?.interest_start_date 
        ? moment(item.interest_start_date)
        : moment(item.bill_date);
        
      return startDate.format('DD/MM/YY');
              })()}</Text>
            </View>
            <View style={styles.interestColumn}>
                        <Text style={styles.interestLabel}>End Date</Text>
              <Text style={styles.interestValue}>{item?.interest_upto ? moment(item.interest_upto).format('DD/MM/YY') : moment().format('DD/MM/YY')}</Text>
            </View>
            <View style={styles.interestColumn}>
                        <Text style={styles.interestLabel}>Period</Text>
              <Text style={styles.interestValue}>
                          {(() => {
                            // Calculate interest period
                            if (!item?.bill_date || !item?.payment_date) return '0 days';
                            
                            const startDate = item?.interest_start_date 
                              ? moment(item.interest_start_date)
                              : moment(item.bill_date);
                              
                            const endDate = moment(item.payment_date);
                            
                            // Calculate total days
                            let days = endDate.diff(startDate, 'days');
                            
                            // Subtract grace period if enabled
                            if (item?.grace_period_enabled) {
                              days = Math.max(0, days - Number(item?.grace_period_days || 0));
                            }
                            
                            return `${days} days`;
                          })()}
              </Text>
            </View>
          </View>

                    {/* Interest Calculation */}
                    <View style={styles.interestCalculationSection}>
                      <View style={styles.interestCalcRow}>
                        <Text style={styles.interestCalcLabel}>Principal Amount</Text>
                        <Text style={styles.interestCalcValue}>₹{handleDigitsFix(itemData?.net_price || 0)}</Text>
      </View>
                      <View style={styles.interestCalcRow}>
                        <Text style={styles.interestCalcLabel}>Interest Amount</Text>
                        <Text style={styles.interestCalcValue}>₹{handleDigitsFix(item?.interest_amount || 0)}</Text>
      </View>
                      <View style={styles.interestCalcRow}>
                        <Text style={styles.interestCalcLabel}>Total Amount Due</Text>
                        <Text style={[styles.interestCalcValue, styles.totalDueValue]}>
                          ₹{handleDigitsFix((Number(itemData?.net_price || 0) + Number(item?.interest_amount || 0)))}
                        </Text>
                      </View>
                      </View>

                    {/* Payment History */}
                    {Array.isArray(item?.payment_history) && item.payment_history.length > 0 && (
                      <View>
                        <Text style={styles.interestSubtitle}>Payment History</Text>
                        <View style={styles.paymentHistoryTable}>
                          <View style={styles.paymentHistoryHeader}>
                            <Text style={styles.paymentHistoryHeaderCell}>Date</Text>
                            <Text style={styles.paymentHistoryHeaderCell}>Amount</Text>
                            <Text style={styles.paymentHistoryHeaderCell}>Interest</Text>
                            <Text style={styles.paymentHistoryHeaderCell}>Balance</Text>
                      </View>
                          {item.payment_history.map((payment, index) => (
                            <View key={index} style={styles.paymentHistoryRow}>
                              <Text style={styles.paymentHistoryCell}>
                                {moment(payment.date).format('DD/MM/YY')}
                          </Text>
                              <Text style={styles.paymentHistoryCell}>
                                ₹{handleDigitsFix(payment.amount)}
                              </Text>
                              <Text style={styles.paymentHistoryCell}>
                                ₹{handleDigitsFix(payment.interest_paid)}
                              </Text>
                              <Text style={styles.paymentHistoryCell}>
                                ₹{handleDigitsFix(payment.remaining_balance)}
                </Text>
                            </View>
                          ))}
                        </View>
              </View>
          )}
        </View>
      )}

                {/* Weight Details */}
                {(itemData?.showGrossWeightInBill || itemData?.showLessWeightInBill || 
                  itemData?.showNetWeightInBill || itemData?.showWastageInBill || 
                  itemData?.showTounchInBill || itemData?.showFineWeightInBill) && (
                  <View style={styles.productDetailSection}>
                    <Text style={styles.productDetailTitle}>Weight Details:</Text>
                    {itemData?.showGrossWeightInBill ? `
                      <div class="product-detail-row">
                        <span class="product-detail-label">Gross Weight:</span>
                        <span class="product-detail-value">${handleDigitsFix(itemData?.gross_weight || 0)} g</span>
            </div>
          ` : ''}
                    {itemData?.showLessWeightInBill ? `
                      <div class="product-detail-row">
                        <span class="product-detail-label">Less Weight:</span>
                        <span class="product-detail-value">${handleDigitsFix(itemData?.less_weight || 0)} g</span>
          </div>
                    ` : ''}
                    {itemData?.showNetWeightInBill ? `
                      <div class="product-detail-row">
                        <span class="product-detail-label">Net Weight:</span>
                        <span class="product-detail-value">${handleDigitsFix(itemData?.net_weight || 0)} g</span>
                      </div>
                    ` : ''}
                    {itemData?.showWastageInBill ? `
                      <div class="product-detail-row">
                        <span class="product-detail-label">Wastage:</span>
                        <span class="product-detail-value">${handleDigitsFix(itemData?.wastage || 0)}%</span>
                      </div>
                    ` : ''}
                    {itemData?.showTounchInBill ? `
                      <div class="product-detail-row">
                        <span class="product-detail-label">Touch:</span>
                        <span class="product-detail-value">${handleDigitsFix(itemData?.tounch || 0)}%</span>
                      </div>
                    ` : ''}
                    {itemData?.showFineWeightInBill ? `
                      <div class="product-detail-row">
                        <span class="product-detail-label">Fine Weight:</span>
                        <span class="product-detail-value">
                          ${handleDigitsFix(itemData?.fine_weight || 0)} g
                          <span class="formula">
                            (${handleDigitsFix(itemData?.net_weight || 0)} × ${(Number(itemData?.tounch || 0) + Number(itemData?.wastage || 0))}%)
                          </span>
                        </span>
                      </div>
                    ` : ''}
        </View>
      )}

                {/* Price Details */}
                {itemData?.showPriceInBill ? `
                  <div class="product-detail-section">
                    <div class="product-detail-title">Price Details:</div>
                    
                    <!-- Metal Value -->
                    <div class="product-detail-row">
                      <span class="product-detail-label">Metal Value:</span>
                      <div class="product-detail-value-container">
                        <span class="formula">
                          (${handleDigitsFix(itemData?.fine_weight || 0)} × ₹${handleDigitsFix(
                            itemData?.rate?.price || itemData?.rate || 0
                          )})
                        </span>
                        <span class="product-detail-value">₹${handleDigitsFix(
                          Number(itemData?.fine_weight || 0) * 
                          Number((itemData?.rate?.price || itemData?.rate) || 0)
                        )}</span>
                      </div>
                    </div>

                    <!-- Making Charges -->
                    ${itemData?.showMakingChargeInBill && itemData?.making_type?.value ? `
                      <div class="product-detail-row">
                        <span class="product-detail-label">Making Charges:</span>
                        <div class="product-detail-value-container">
                          ${itemData?.making_type?.value === "PG" ? `
                            <span class="formula">
                              (${handleDigitsFix(itemData?.net_weight || 0)} × ₹${handleDigitsFix(itemData?.making_charge || 0)})
                            </span>
                          ` : ''}
                          <span class="product-detail-value">₹${handleDigitsFix(
                            itemData?.making_type?.value === "PG"
                              ? Number(itemData?.net_weight || 0) * Number(itemData?.making_charge || 0)
                              : Number(itemData?.making_charge || 0)
                          )}</span>
                        </div>
                      </div>
                    ` : ''}

                    <!-- Additional Charges -->
                    ${itemData?.showChargesInBill && itemData?.charges_json?.length > 0 ? `
              <div class="charges-section">
                              <div class="charges-title">Additional Charges:</div>
                              ${itemData.charges_json.map(charge => `
                                <div class="charge-row">
                                  <span class="charge-name">${charge.name}</span>
                                  <span class="charge-amount">₹${handleDigitsFix(charge.amount)}</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

                    <!-- Base Price -->
                    <div class="subtotal-row">
                      <span class="subtotal-label">Base Price (Subtotal):</span>
                      <span class="subtotal-value">₹${handleDigitsFix(
                        Number(itemData?.fine_weight || 0) * Number((itemData?.rate?.price || itemData?.rate) || 0) +
                        (itemData?.making_type?.value === "PG"
                          ? Number(itemData?.net_weight || 0) * Number(itemData?.making_charge || 0)
                          : Number(itemData?.making_charge || 0)) +
                        (itemData.charges_json || []).reduce((sum, charge) => sum + Number(charge.amount || 0), 0)
                )}</span>
              </div>

              <!-- Tax Section -->
                    ${itemData?.showTaxInBill && itemData?.tax_json?.length > 0 ? `
              <div class="tax-section">
                              <div class="tax-title">Taxes:</div>
                              ${itemData.tax_json.map(tax => `
                                <div class="tax-row">
                                  <span class="tax-name">${tax.name} (${tax.amount}%)</span>
                                  <span class="tax-amount">₹${handleDigitsFix(
                              (Number(itemData?.net_price || 0) * Number(tax.amount || 0)) / 100
                      )}</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

                    <!-- Final Price -->
                    <div class="final-price-row">
                      <span class="final-price-label">Final Price:</span>
                      <span class="final-price-value">₹${handleDigitsFix(itemData?.net_price || 0)}</span>
            </div>
          </div>
        ` : ''}

                {/* Custom Fields */}
                {itemData?.custom_fields?.some(field => field.showInBill) && (
                  <View style={styles.productDetailSection}>
                    <Text style={styles.productDetailTitle}>Additional Details:</Text>
                    {itemData.custom_fields.map((field, fieldIndex) => 
                      field.showInBill && (
                        <View key={fieldIndex} style={styles.productDetailRow}>
                          <Text style={styles.productDetailLabel}>{field.label}:</Text>
                          <Text style={styles.productDetailValue}>
                            {field.value} {field.unit?.value || ''}
                          </Text>
        </View>
                      )
                    )}
                  </View>
                )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Payment Summary */}
        <View style={styles.paymentSummaryContainer}>
          <View style={styles.paymentSummaryRow}>
            <Text style={styles.paymentSummaryLabel}>Total:</Text>
            <Text style={styles.paymentSummaryValue}>
              ₹{handleDigitsFix(formValue?.totalPrice || data?.totalPrice || productData?.net_price || 0)}
            </Text>
          </View>
          <View style={styles.paymentSummaryRow}>
            <Text style={styles.paymentSummaryLabel}>Paid:</Text>
            <Text style={styles.paymentSummaryValue}>
              ₹{handleDigitsFix(formValue?.amount_paid || data?.amount_paid || 0)}
            </Text>
          </View>
          <View style={styles.paymentSummaryRow}>
            <Text style={[styles.paymentSummaryLabel, styles.balanceLabel]}>Balance:</Text>
            <Text style={[styles.paymentSummaryValue, styles.balanceValue]}>
              ₹{handleDigitsFix(Number(formValue?.totalPrice || data?.totalPrice || productData?.net_price || 0) - Number(formValue?.amount_paid || data?.amount_paid || 0))}
            </Text>
          </View>
        </View>

      {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            Payment Mode: {formValue?.payment_mode || data?.payment_mode || 'Cash/UPI'}
          </Text>
          <Text style={styles.footerText}>
            Date: {moment(formValue?.payment_date || data?.payment_date || new Date()).format('DD MMM YYYY')}
          </Text>
      </View>
      </ScrollView>

      {/* Print Bill button */}
      <TouchableOpacity 
        style={styles.printButton} 
        onPress={handlePrintBill}
      >
        <Text style={styles.printButtonText}>Print Bill</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  companyLogo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  companyAddress: {
    fontSize: 12,
    color: '#333',
    marginBottom: 1,
  },
  companyContact: {
    fontSize: 12,
    color: '#333',
    marginBottom: 1,
  },
  customerSection: {
    marginBottom: 16,
  },
  customerLabel: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  invoiceDetails: {
    marginTop: 4,
  },
  invoiceText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 1,
  },
  section: {
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  detailLabel: {
    fontSize: 12,
    color: '#333',
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    textAlign: 'right',
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  calculationLabel: {
    fontSize: 12,
    color: '#333',
  },
  calculationValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formula: {
    fontSize: 10,
    color: '#666',
    marginRight: 4,
  },
  calculationValue: {
    fontSize: 12,
    color: '#333',
  },
  chargesSection: {
    marginTop: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  chargesTitle: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
  },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 12,
    marginBottom: 2,
  },
  chargeName: {
    fontSize: 12,
    color: '#333',
  },
  chargeAmount: {
    fontSize: 12,
    color: '#333',
  },
  taxSection: {
    marginTop: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  taxTitle: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 12,
    marginBottom: 2,
  },
  taxName: {
    fontSize: 12,
    color: '#333',
  },
  taxAmount: {
    fontSize: 12,
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  grandTotalLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  grandTotalValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  footer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'right',
  },
  comment: {
    fontSize: 12,
    color: '#333',
    fontStyle: 'italic',
  },
  typeText: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    fontSize: 20,
  },
  customerBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
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
    padding: 8,
    flexDirection: 'row',
  },
  customerColumn: {
    flex: 1,
    paddingHorizontal: 4,
  },
  customerInfoItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  customerInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  customerInfoValue: {
    fontSize: 12,
    color: '#000',
    flex: 1,
  },
  itemsSection: {
    marginBottom: 16,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
  },
  columnHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#444',
    flex: 1,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  firstColumn: {
    flex: 2,
    textAlign: 'left',
    fontFamily: 'sans-serif',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  itemText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  itemDescription: {
    flex: 2,
    textAlign: 'left',
  },
  interestSection: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  interestDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  interestColumn: {
    flex: 1,
    alignItems: 'center',
  },
  interestLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  interestValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
    textAlign: 'center',
  },
  printButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  printButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentSummaryContainer: {
    marginTop: 20,
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  paymentSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    width: 200,
  },
  paymentSummaryLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  paymentSummaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  balanceLabel: {
    fontWeight: 'bold',
  },
  balanceValue: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  footerContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  productSeparator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 12,
  },
  productDetailContainer: {
    padding: 12,
    backgroundColor: '#f9f9f9',
    marginTop: 4,
    marginBottom: 8,
    borderRadius: 8,
  },
  productDetailSection: {
    marginBottom: 16,
  },
  productDetailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 4,
  },
  productDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  productDetailLabel: {
    fontSize: 12,
    color: '#666',
  },
  productDetailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  productDetailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtotalRow: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  subtotalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  subtotalValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  finalPriceRow: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#333',
  },
  finalPriceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  finalPriceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  interestConfigSection: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  interestConfigRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  interestConfigLabel: {
    fontSize: 12,
    color: '#666',
  },
  interestConfigValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  interestSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
    marginTop: 16,
    paddingHorizontal: 8,
  },
  interestCalculationSection: {
    marginTop: 16,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  interestCalcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  interestCalcLabel: {
    fontSize: 12,
    color: '#666',
  },
  interestCalcValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  totalDueValue: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  paymentHistoryTable: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  paymentHistoryHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  paymentHistoryHeaderCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: '#444',
    textAlign: 'center',
  },
  paymentHistoryRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  paymentHistoryCell: {
    flex: 1,
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
  },
remarkLabel: {
  fontSize: 12,
  color: '#666',
  fontWeight: '500',
  marginRight: 8,
},
remarkValue: {
  fontSize: 12,
  color: '#333',
  flex: 1,
},
remarkContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 8,
  backgroundColor: '#f9f9f9',
  borderRadius: 8,
  marginTop: 8,
  marginBottom: 8,
},
remarkBox: {
  borderWidth: 1,
  borderColor: '#ddd',
  padding: 12,
  borderRadius: 8,
  marginTop: 8,
  backgroundColor: '#fff',
},
remarkSection: {
  marginBottom: 16,
},
remarkTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#333',
  marginBottom: 8,
  borderBottomWidth: 1,
  borderBottomColor: '#ddd',
  paddingBottom: 4,
},
interestNotesLabel: {
  fontSize: 12,
  color: '#666',
  fontWeight: '500',
  marginRight: 8,
},
interestNotesValue: {
  fontSize: 12,
  color: '#333',
  flex: 1,
},
interestNotesContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 8,
  backgroundColor: '#f9f9f9',
  borderRadius: 8,
  marginTop: 8,
  marginBottom: 8,
},
interestNotesBox: {
  borderWidth: 1,
  borderColor: '#ddd',
  padding: 12,
  borderRadius: 8,
  marginTop: 8,
  backgroundColor: '#fff',
},
interestNotesSection: {
  marginBottom: 16,
},
interestNotesTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: '#333',
  marginBottom: 8,
  borderBottomWidth: 1,
  borderBottomColor: '#ddd',
  paddingBottom: 4,
},
});

export default ProductBillPreview;