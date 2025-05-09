# Order/Repair Invoice API Documentation

## Base URL
`/or-invoices`

## Inventory Integration
The Order/Repair system integrates with the Inventory system through the following mechanisms:

1. **Inventory Status Flow:**
   - `available` → `reserved` (when added to order) → `sold` (when order completed)
   - `available` → `repair` (when added to repair) → `available` (when repair completed)

2. **Inventory Validation:**
   - All products in orders/repairs must exist in inventory
   - Product IDs must match between systems
   - Inventory status must be valid for the operation

## Endpoints

### 1. Create Invoice
**Endpoint:** `POST /create`

Creates a new order or repair invoice and updates inventory status.

**Request Body:**
```json
{
  "invoiceType": "string",     // "order" or "repair"
  "client": {
    "id": "string",
    "name": "string",
    "role_id": "string"
  },
  "selectedProduct": [{
    "inventory_id": "string",  // Added: Reference to inventory item
    "name": "string",
    "product_id": "string", 
    "size": "string",
    "gross_weight": "number",
    "less_weight": "number",
    "net_weight": "number",
    "tounch": "number",
    "wastage": "number",
    "fine_weight": "number",
    "rate": "number",
    "metal_value": "number",
    "making_type": {
      "value": "string",    
      "label": "string"     
    },
    "making_charge": "number",
    "making_amount": "number",
    "polishing": "number",
    "stone_setting": "number",
    "additional_charges": "number",
    "subtotal": "number",
    "tax": "number",
    "tax_amount": "number",
    "final_amount": "number"
  }],
  "totalPrice": "number",      
  "photo": "file",            
  "additional_photo": "file",  
  "huid": "string",           
  "hsn_id": "string",
  "remark": "string",         
  "status": "string",         // "completed" | "in_progress"
  "profile_id": "string",     
  "payment_mode": "string",   
  "amount_paid": "number",    
  "bill_display_settings": {  
    "showSizeInBill": "boolean",
    "showWeightInBill": "boolean",
    "showRateInBill": "boolean",
    "showMakingInBill": "boolean",
    "showTaxInBill": "boolean",
    "showCommentInBill": "boolean"
  }
}
```

**Inventory Status Updates:**
- For Orders:
  - On creation: Inventory status → "reserved"
  - On completion: Inventory status → "sold"
  - On cancellation: Inventory status → "available"
- For Repairs:
  - On creation: Inventory status → "repair"
  - On completion: Inventory status → "available"

**Validation Rules:**
- All products must exist in inventory
- Products must be in "available" status for new orders
- Products must be in "repair" status for repair completion
- Product weights and details must match inventory records

**Success Response (200):**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "id": "string",
    "invoice_number": "string",
    "created_at": "timestamp",
    "inventory_updates": [{    // Added: Track inventory changes
      "inventory_id": "string",
      "previous_status": "string",
      "new_status": "string"
    }]
  }
}
```

### 2. List Orders/Repairs
**Endpoint:** `GET /or-invoices/list`

Retrieves a list of all orders and repairs with inventory status.

**Query Parameters:**
- `search` (optional): Search by client name
- `type` (optional): Filter by invoice type ("order" or "repair")
- `inventory_status` (optional): Filter by inventory status

**Success Response (200):**
```json
{
  "success": true,
  "data": [{
    "id": "string",
    "type": "string",          
    "client": {
      "id": "string",
      "name": "string",
      "role_id": "string"
    },
    "total_amount": "number",  
    "status": "string",        
    "created_at": "string",    
    "items": [{
      "inventory_id": "string",  // Added
      "name": "string",
      "product_id": "string",
      "inventory_status": "string"  // Added: Current inventory status
    }]
  }]
}
```

### 3. Get Invoice Details
**Endpoint:** `GET /list/:id`

Retrieves details of a specific invoice with inventory information.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "type": "string",
    "invoice_number": "string",
    "client": {},
    "selectedProduct": [{
      "inventory_id": "string",  // Added
      "inventory_status": "string",  // Added
      // ... existing product fields
    }],
    "totalPrice": "number",    
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "status": "string",        
    "payment_mode": "string",  
    "amount_paid": "number",   
    "huid": "string",
    "hsn_id": "string"
  }
}
```

### 4. Update Invoice
**Endpoint:** `PUT /update/:id`

Updates an existing invoice and manages inventory status.

**Request Body:** Same as Create Invoice

**Inventory Status Updates:**
- If changing from "in_progress" to "completed":
  - For orders: Inventory status → "sold"
  - For repairs: Inventory status → "available"
- If changing from "completed" to "in_progress":
  - For orders: Inventory status → "reserved"
  - For repairs: Inventory status → "repair"

**Success Response (200):**
```json
{
  "success": true,
  "message": "Invoice updated successfully",
  "data": {
    "id": "string",
    "inventory_updates": [{    // Added: Track inventory changes
      "inventory_id": "string",
      "previous_status": "string",
      "new_status": "string"
    }]
  }
}
```

### 5. Delete Invoice
**Endpoint:** `DELETE /delete/:id`

Deletes an invoice and reverts inventory status.

**Inventory Status Updates:**
- For orders: Inventory status → "available"
- For repairs: Inventory status → "available"

**Success Response (200):**
```json
{
  "success": true,
  "message": "Invoice deleted successfully",
  "inventory_updates": [{    // Added: Track inventory changes
    "inventory_id": "string",
    "previous_status": "string",
    "new_status": "string"
  }]
}
```

## Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Invalid request parameters",
  "errors": [
    {
      "field": "selectedProduct[0].inventory_id",
      "message": "Inventory item not found or not available"
    }
  ]
}
```

**409 Conflict:**
```json
{
  "success": false,
  "message": "Inventory status conflict",
  "errors": [
    {
      "field": "selectedProduct[0].inventory_id",
      "message": "Inventory item is already reserved/sold"
    }
  ]
}
```

## Notes
- All inventory status changes are logged and tracked
- Inventory validation is performed before any order/repair operation
- Status changes are atomic (all succeed or all fail)
- Inventory history is maintained for audit purposes
- System maintains data consistency between orders/repairs and inventory

## Backend Expectations for PDF Generation

The backend should implement the PDF generation endpoint with the following requirements:

1. **PDF Content Requirements:**
   - The PDF should include all order/repair details from the invoice
   - Header should clearly identify document type ("ORDER INVOICE" or "REPAIR INVOICE")
   - Include business details (name, address, contact information, GST number)
   - Include invoice number, date, and status
   - Customer information section with name and contact details
   - Detailed item information section including:
     - Product name and description
     - HUID and HSN numbers
     - Size specifications (if enabled in bill_display_settings)
     - Weight details (gross, net, fine) (if enabled in bill_display_settings)
     - Touch/purity
     - Wastage percentage
     - Rate details (if enabled in bill_display_settings)
     - Making charge details (type and amount) (if enabled in bill_display_settings)
     - Additional charges (polishing, stone setting)
     - Tax information (if enabled in bill_display_settings)
   - Payment summary with total amount, amount paid, and balance due
   - Payment method information
   - Remarks/comments (if enabled in bill_display_settings)
   - Terms and conditions section
   - Signature fields for customer and business

2. **Technical Requirements:**
   - Generate professional-quality PDF documents
   - PDFs should be stored securely on the server with appropriate access controls
   - Implement file naming conventions including invoice ID and timestamp
   - Ensure PDFs are printer-friendly with proper margins and formatting
   - Support for custom business branding elements (logo, colors)
   - Implement proper error handling for failed PDF generation
   - Support proper character encoding for multiple languages
   - Optimize PDF file size while maintaining quality
   - Implement caching mechanism to avoid regenerating unchanged PDFs
   - Ensure PDF URLs remain valid for a reasonable period (at least 24 hours)

3. **Security Considerations:**
   - PDFs should only be accessible to authorized users
   - Implement token-based access to PDF URLs
   - Log all PDF generation and access attempts
   - Implement rate limiting to prevent abuse
   - Consider adding watermarks for sensitive documents

## Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Invalid request parameters",
  "errors": []
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Invoice not found"
}
```

**500 Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Notes
- All monetary values should be sent as strings to maintain precision
- Dates are in ISO 8601 format
- File uploads should use multipart/form-data
- Authentication token required in headers for all requests
- PDF generation may take longer than standard API calls; consider implementing asynchronous processing for large invoices 