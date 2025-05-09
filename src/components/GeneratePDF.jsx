import React from 'react';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { currency } from '@/src/contants';

// Function to generate HTML content for the invoice
const generateInvoiceHTML = (invoice, profileData, isPurchase) => {
  const tableHeaders = ["Items", "Rate", "Weight", "Amount"];
  
  // Calculate the total amount
  const totalAmount = invoice?.totalPrice || 0;
  const amountPaid = invoice?.amount_paid || 0;
  const balance = Number(totalAmount) - Number(amountPaid);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body {
            font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            color: #333;
          }
          .header {
            background-color: #1a237e;
            color: white;
            padding: 10px 15px;
            border-radius: 5px 5px 0 0;
            display: flex;
            justify-content: space-between;
          }
          .content {
            padding: 15px;
            border: 1px solid #ddd;
            border-top: none;
          }
          .business-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 15px;
          }
          .customer-details {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
          }
          .section {
            margin-bottom: 15px;
            border: 1px solid #ddd;
            padding: 10px;
          }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
            margin-bottom: 10px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .detail-label {
            font-size: 12px;
            color: #333;
          }
          .detail-value {
            font-size: 12px;
            color: #333;
            text-align: right;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            table-layout: fixed;
          }
          th, td {
            padding: 8px;
            border: 1px solid #ddd;
            font-size: 14px;
          }
          th {
            background-color: #f5f5f5;
            font-weight: 600;
            color: #444;
          }
          td {
            color: #000;
          }
          th:first-child, td:first-child {
            width: 40%;
            text-align: left;
          }
          th:not(:first-child), td:not(:first-child) {
            width: 20%;
            text-align: right;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .totals {
            margin-left: auto;
            width: 60%;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 10px;
          }
          .grand-total {
            background-color: #1a237e;
            color: white;
            font-weight: bold;
            padding: 8px 10px;
            margin: 10px 0;
            display: flex;
            justify-content: space-between;
          }
          .signature {
            text-align: right;
            margin-top: 40px;
            padding-top: 5px;
            border-top: 1px solid #ddd;
            width: 200px;
            margin-left: auto;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>INVOICE</div>
          <div>${invoice?.payment_date || ''}</div>
        </div>
        
        <div class="content">
          <!-- Business Details -->
          <div class="business-details">
            <div>
              <div style="font-weight: bold;">${isPurchase ? "Seller Name" : profileData?.business_name || profileData?.name}</div>
            </div>
            <div>
              <div>${profileData?.address || ''}</div>
              <div>${profileData?.city_data?.city || ''}, ${profileData?.state_data?.state || ''}-${profileData?.pincode || ''}</div>
              ${profileData?.business_phone ? `<div><strong>Contact:</strong> ${profileData?.business_phone}</div>` : ''}
              ${profileData?.business_email ? `<div><strong>Email:</strong> ${profileData?.business_email}</div>` : ''}
              ${profileData?.gstin ? `<div><strong>GSTIN:</strong> ${profileData?.gstin}</div>` : ''}
            </div>
          </div>
          
          <!-- Customer Details -->
          <div class="customer-details">
            <div style="font-weight: bold;">To,</div>
            <div>${isPurchase ? (profileData?.business_name || profileData?.name) : (invoice?.costumer_name || "Customer Name")}</div>
            ${invoice?.costumer_contact ? `<div><strong>Contact:</strong> ${invoice?.costumer_contact}</div>` : ''}
          </div>
          
          <!-- Items Table -->
          <table>
            <thead>
              <tr>
                <th>Items</th>
                <th>Rate</th>
                <th>Weight</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice?.selectedProduct?.map((item, index) => `
                <tr>
                  <td>
                    <div>${item?.name || ''}</div>
                    <div style="font-size: 12px; color: #666;">Touch: ${item?.[isPurchase ? "purchase" : "sale"]?.tounch || 0}%</div>
                  </td>
                  <td>${currency} ${item?.[isPurchase ? "purchase" : "sale"]?.rate || 0}</td>
                  <td>${item?.[isPurchase ? "purchase" : "sale"]?.gross_weight || 0}g</td>
                  <td>${currency} ${item?.[isPurchase ? "purchase" : "sale"]?.net_price || 0}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          
          <!-- Custom Fields Section -->
          ${invoice?.selectedProduct?.map((item, index) => {
            const productData = item?.[isPurchase ? "purchase" : "sale"];
            return productData?.custom_fields?.length > 0 ? `
              <div style="margin-bottom: 15px; border: 1px solid #ddd; padding: 15px;">
                <div style="font-size: 14px; font-weight: bold; margin-bottom: 15px;">Custom Fields</div>
                ${productData.custom_fields.filter(field => field.showInBill).map(field => `
                  <div style="margin-bottom: 10px; padding: 12px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; min-height: 40px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">
                    <span style="font-size: 14px; color: #333333; font-weight: 500;">${field.label}:</span>
                    <span style="font-size: 14px; color: #333333;">${field.value} ${field.unit?.value || ''}</span>
                  </div>
                `).join('')}
              </div>
            ` : '';
          }).join('')}
          
          <!-- Totals -->
          <div class="totals">
            ${invoice?.tax ? `
              <div class="total-row">
                <div>Tax</div>
                <div>${invoice?.tax || 0}%</div>
              </div>
            ` : ''}
            
            ${invoice?.charges?.filter(charge => charge?.name && charge?.amount)?.map((charge, index) => `
              <div class="total-row">
                <div>${charge?.name}</div>
                <div>${currency} ${charge?.amount}</div>
              </div>
            `).join('') || ''}
            
            <div class="grand-total">
              <div>Total</div>
              <div>${currency} ${totalAmount}</div>
            </div>
            
            <div class="total-row">
              <div>Total Paid</div>
              <div>${currency} ${amountPaid}</div>
            </div>
            
            <div class="total-row">
              <div>Balance</div>
              <div>${currency} ${balance}</div>
            </div>
          </div>
          
          <!-- Signature -->
          <div class="signature">
            <div>${isPurchase ? "Seller Name" : profileData?.name}</div>
            <div>Authorized Signatory</div>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Main export function for generating and printing/sharing PDF
export const generateInvoicePDF = async (invoice, profileData, isPurchase, fileName = "invoice") => {
  try {
    console.log("GeneratePDF: Starting PDF generation");
    console.log("Invoice data:", JSON.stringify(invoice, null, 2));
    console.log("Profile data:", JSON.stringify(profileData, null, 2));
    
    // Generate HTML content
    const htmlContent = generateInvoiceHTML(invoice, profileData, isPurchase);
    console.log("HTML content generated successfully");
    
    // Create a PDF file
    console.log("Attempting to create PDF file...");
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false
    });
    console.log("PDF file created at:", uri);
    
    // Get the file name with timestamp
    const timestamp = new Date().getTime();
    const newUri = FileSystem.documentDirectory + `${fileName}_${timestamp}.pdf`;
    console.log("Moving file to:", newUri);
    
    // Move the file to document directory
    await FileSystem.moveAsync({
      from: uri,
      to: newUri
    });
    console.log("File moved successfully");
    
    // Share the PDF file
    console.log("Attempting to share PDF...");
    await shareAsync(newUri, {
      UTI: '.pdf',
      mimeType: 'application/pdf',
    });
    console.log("PDF shared successfully");
    
    return { success: true, uri: newUri };
  } catch (error) {
    console.error("Error in generateInvoicePDF:", error);
    console.error("Error stack:", error.stack);
    return { success: false, error: error.message };
  }
};

// Function to print directly without sharing
export const printInvoice = async (invoice, profileData, isPurchase) => {
  try {
    // Generate HTML content
    const htmlContent = generateInvoiceHTML(invoice, profileData, isPurchase);
    
    // Print the document
    await Print.printAsync({
      html: htmlContent,
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error printing:", error);
    return { success: false, error: error.message };
  }
};

export default {
  generateInvoicePDF,
  printInvoice
};
