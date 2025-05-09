import React from "react";
import ProductBillPreview from "../../components/ProductBillPreview";
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from "react-native";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const Invoice = ({ isPreview = false, isPurchase, formValue }) => {
  // Map the props from Invoice to match ProductBillPreview expected props
  const data = {
    ...formValue,
    customer_name: formValue?.costumer_name,
    customer: formValue
  };
  
  // If there are selected products, use the first one for product data
  // ProductBillPreview seems to display only one product
  const selectedProduct = formValue?.selectedProduct?.[0] || {};
  
  const product = {
    type: isPurchase ? "purchase" : "sale",
    [isPurchase ? "purchase" : "sale"]: selectedProduct?.[isPurchase ? "purchase" : "sale"] || {},
    name: selectedProduct?.name,
    size: selectedProduct?.size,
    // Include interest-related properties for the interest section to display correctly
    interest_type: selectedProduct?.interest_type,
    interest_rate: selectedProduct?.interest_rate,
    interest_upto: selectedProduct?.interest_upto,
    interest_amount: selectedProduct?.interest_amount,
    interest_duration: selectedProduct?.interest_duration
  };

  // Function to handle printing the bill
  const handlePrintBill = async () => {
    try {
      // Get HTML content from ProductBillPreview's generateHTML method
      // This is a simplified approach - you might need to adjust based on your actual implementation
      const html = generateHTML(data, product, isPurchase);
      
      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html: html,
        base64: false
      });

      // Share the PDF
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf'
      });
    } catch (error) {
      console.error('Error printing bill:', error);
    }
  };

  // Generate HTML for the invoice - simplified example, adjust as needed
  const generateHTML = (data, product, isPurchase) => {
    const productData = product?.[isPurchase ? "purchase" : "sale"] || {};
    const customerData = data?.customer || data || {};
    const handleDigitsFix = (value) => {
      if (!value || isNaN(value)) return "0.00";
      return parseFloat(value).toFixed(2);
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
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-logo">TJ</div>
            <div class="company-name">TANISHQ JEWELLERS</div>
            <div class="company-details">
              Ganpati Chowk<br>
              Science(1999)<br>
              PETLAWAD-457773<br>
              Email: ajay10son1@gmail.com<br>
              GSTIN: 23BJOPS9792Q1Z4<br>
              <div style="font-weight: bold; text-align: center; margin-top: 5px; font-size: 20px;">${product.type || 'Jewellery'}</div>
            </div>
          </div>

          <div class="customer-section">
            <div>TO,</div>
            <div style="font-weight: 500; margin: 5px 0;">${data?.customer_name || ''}</div>
            <div>Date: ${new Date().toLocaleDateString()}</div>
            <div>Invoice Number: ${data?.invoice_number || ''}</div>
            <div>Type: ${product.type || 'Jewellery'}</div>
          </div>

          <!-- Customer Details Box -->
          <div class="customer-box">
            <div class="customer-header">
              <div style="font-size: 14px; font-weight: 600; color: #444;">CUSTOMER DETAILS</div>
            </div>
            <div class="customer-content" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; padding: 8px;">
              <div style="display: flex; gap: 8px;">
                <div style="flex: 1;">
                  <div style="font-size: 12px; color: #666;">Name: <span style="color: #000;">${customerData?.name || customerData?.customer_name || 'N/A'}</span></div>
                  <div style="font-size: 12px; color: #666;">Phone: <span style="color: #000;">${customerData?.phone || customerData?.contact || 'N/A'}</span></div>
                  <div style="font-size: 12px; color: #666;">Email: <span style="color: #000;">${customerData?.email || 'N/A'}</span></div>
                </div>
              </div>
              <div style="display: flex; gap: 8px;">
                <div style="flex: 1;">
                  <div style="font-size: 12px; color: #666;">Address: <span style="color: #000;">${customerData?.address || 'N/A'}</span></div>
                  <div style="font-size: 12px; color: #666;">City/State: <span style="color: #000;">${customerData?.city?.label || customerData?.city || 'N/A'}, ${customerData?.state?.label || customerData?.state || 'N/A'}</span></div>
                  <div style="font-size: 12px; color: #666;">PIN: <span style="color: #000;">${customerData?.pincode || 'N/A'}</span></div>
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
              <tr>
                <td>
                  <div class="item-name">${selectedProduct?.name || "Item"}</div>
                  <div class="item-details">Touch: ${productData?.tounch || 0}%</div>
                </td>
                <td>₹${handleDigitsFix(typeof productData?.rate === 'object' ? (productData?.rate?.price || 0) : (productData?.rate || 0))}</td>
                <td>${handleDigitsFix(productData?.gross_weight || 0)} gm</td>
                <td>₹${handleDigitsFix(productData?.net_price || 0)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Interest Section -->
          ${product?.interest_type ? `
            <div class="interest-section">
              <div class="interest-details-row">
                <div style="flex: 1; text-align: center;">
                  <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Current Period</div>
                  <div style="font-size: 14px; color: #000; font-weight: 500;">Interest</div>
                </div>
                <div style="flex: 1; text-align: center;">
                  <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Date</div>
                  <div style="font-size: 14px; color: #000; font-weight: 500;">
                    ${product?.interest_upto ? new Date(product.interest_upto).toLocaleDateString() : new Date().toLocaleDateString()}
                  </div>
                </div>
                <div style="flex: 1; text-align: center;">
                  <div style="font-size: 12px; color: #666; margin-bottom: 4px;">On Amount</div>
                  <div style="font-size: 14px; color: #000; font-weight: 500;">₹${handleDigitsFix(productData?.net_price || 0)}</div>
                </div>
                <div style="flex: 1; text-align: center;">
                  <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Interest (${product?.interest_rate || 0}%)</div>
                  <div style="font-size: 14px; color: #000; font-weight: 500;">₹${handleDigitsFix(product?.interest_amount || 0)}</div>
                </div>
              </div>
            </div>
          ` : ''}

          ${productData?.showHuidInBill || productData?.showHsnInBill || productData?.showSizeInBill ? `
            <div class="section">
              <div class="section-title">Product Details</div>
              ${renderHTMLField("Name", data?.name, true)}
              ${renderHTMLField("HUID", data?.huid, productData?.showHuidInBill)}
              ${renderHTMLField("HSN", data?.hsn_id, productData?.showHsnInBill)}
              ${renderHTMLField("Size", product?.size, productData?.showSizeInBill)}
            </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Weight Details</div>
            ${renderHTMLField("Gross Weight", handleDigitsFix(productData?.gross_weight || 0), productData?.showGrossWeightInBill, "g")}
            ${renderHTMLField("Less Weight", handleDigitsFix(productData?.less_weight || 0), productData?.showLessWeightInBill, "g")}
            ${renderHTMLField("Net Weight", handleDigitsFix(productData?.net_weight || 0), productData?.showNetWeightInBill, "g")}
            ${renderHTMLField("Wastage", handleDigitsFix(productData?.wastage || 0), productData?.showWastageInBill, "%")}
            ${renderHTMLField("Tounch", handleDigitsFix(productData?.tounch || 0), productData?.showTounchInBill, "%")}
            ${renderHTMLCalculation(
              "Fine Weight",
              `${handleDigitsFix(productData?.fine_weight || 0)} g`,
              `${handleDigitsFix(productData?.net_weight || 0)} × ${(Number(productData?.tounch || 0) + Number(productData?.wastage || 0))}%`,
              productData?.showFineWeightInBill
            )}
          </div>

          ${productData?.showPriceInBill ? `
            <div class="section">
              <div class="section-title">Price Calculations</div>
              ${renderHTMLCalculation(
                "Metal Value",
                `₹${handleDigitsFix(
                  Number(productData?.fine_weight || 0) * 
                  Number((productData?.rate?.price || productData?.rate) || 0)
                )}`,
                `${handleDigitsFix(productData?.fine_weight || 0)} × ₹${handleDigitsFix(
                  productData?.rate?.price || productData?.rate || 0
                )}`,
                true
              )}

              ${productData?.showMakingChargeInBill ? renderHTMLCalculation(
                "Making Charges",
                `₹${handleDigitsFix(
                  productData?.making_type?.value === "PG"
                    ? Number(productData?.net_weight || 0) * Number(productData?.making_charge || 0)
                    : Number(productData?.making_charge || 0)
                )}`,
                productData?.making_type?.value === "PG"
                  ? `${handleDigitsFix(productData?.net_weight || 0)} × ₹${handleDigitsFix(productData?.making_charge || 0)}`
                  : `₹${handleDigitsFix(productData?.making_charge || 0)}`,
                true
              ) : ''}

              ${productData?.showChargesInBill && productData?.charges_json?.length > 0 ? `
                <div class="charges-section">
                  <div style="margin-bottom: 5px;">Additional Charges:</div>
                  ${productData.charges_json.map(charge => `
                    <div class="detail-row">
                      <span>${charge.name}</span>
                      <span>₹${handleDigitsFix(charge.amount)}</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              <div class="total-row">
                <span>Base Price:</span>
                <span>₹${handleDigitsFix(
                  Number(productData?.fine_weight || 0) * Number((productData?.rate?.price || productData?.rate) || 0) +
                  (productData?.making_type?.value === "PG" 
                    ? Number(productData?.net_weight || 0) * Number(productData?.making_charge || 0)
                    : Number(productData?.making_charge || 0)) +
                  (productData.charges_json || []).reduce((sum, charge) => sum + Number(charge.amount || 0), 0)
                )}</span>
              </div>

              ${productData?.showTaxInBill && productData?.tax_json?.length > 0 ? `
                <div class="tax-section">
                  <div style="margin-bottom: 5px;">Tax:</div>
                  ${productData.tax_json.map(tax => `
                    <div class="detail-row">
                      <span>${tax.name} (${tax.amount}%)</span>
                      <span>₹${handleDigitsFix(
                        (Number(productData?.net_price || 0) * Number(tax.amount || 0)) / 100
                      )}</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}

              <div class="grand-total-row">
                <span>Final Price (Base Price + Tax):</span>
                <span>₹${handleDigitsFix(productData?.net_price || 0)}</span>
              </div>
            </div>
          ` : ''}

          <!-- Custom Fields Section -->
          ${productData?.custom_fields?.length > 0 ? `
            <div class="section">
              <div class="section-title">Custom Fields</div>
              ${productData.custom_fields.map(field => 
                field.showInBill ? `
                  <div class="detail-row">
                    <span>${field.label}:</span>
                    <span>${field.value} ${field.unit?.value || ''}</span>
                  </div>
                ` : ''
              ).join('')}
            </div>
          ` : ''}

          ${productData?.showCommentInBill && data?.comment ? `
            <div class="section">
              <div class="section-title">Additional Notes</div>
              <div style="font-style: italic;">${data.comment}</div>
            </div>
          ` : ''}

          <div style="text-align: right; margin-top: 20px;">
            <div>Total: ₹${handleDigitsFix(formValue?.totalPrice || productData?.net_price || 0)}</div>
            <div>Paid: ₹${handleDigitsFix(formValue?.amount_paid || 0)}</div>
            <div>Balance: ₹${handleDigitsFix(Number(formValue?.totalPrice || productData?.net_price || 0) - Number(formValue?.amount_paid || 0))}</div>
          </div>

          <div class="footer">
            <div>UPI</div>
            <div>Rs. ${handleDigitsFix(productData?.net_price || 0)}</div>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <ProductBillPreview 
          data={data} 
          product={product} 
        />
      </ScrollView>
      
      Additional Print Bill button
        {isPreview && (
        <TouchableOpacity 
          style={styles.printButton} 
          onPress={handlePrintBill}
        >
        
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20, // Add padding at the bottom for better scroll experience
  },
  printButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginHorizontal: 12,
    marginBottom: 16, // Add bottom margin for better spacing above the print button
  },
  printButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default Invoice;
