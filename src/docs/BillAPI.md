# Bill & Invoice Management API Documentation

## Base URL
```
https://app.theskillsocean.com
```

## Authentication
All endpoints require a valid Bearer token in the Authorization header:
```
Authorization: Bearer {accessToken}
```

## 1. Fetch Bill & Product Details
Retrieves detailed information about a bill/invoice and its associated products.

### Endpoint
```
POST /product-detail-by-id
```

### Request Format
```json
{
    "id": "string" // bill/invoice ID
}
```

### Success Response
```json
{
    "success": true,
    "data": {
        "id": "string",
        "type": "sale | purchase",
        "name": "string",
        "huid": "string",
        "hsn_id": {
            "value": "string",
            "label": "string",
            "variation": [
                {
                    "id": "string",
                    "name": "string",
                    "price": "number"
                }
            ]
        },
        "size": "string",
        "remark": "string",
        "comment": "string",

        "image": {
            "uri": "string",
            "fileName": "string",
            "mimeType": "string"
        },
        "additional_image": {
            "uri": "string",
            "fileName": "string",
            "mimeType": "string"
        },

        "gross_weight": "string",  // 3 decimal places
        "less_weight": "string",   // 3 decimal places
        "net_weight": "string",    // 3 decimal places, calculated
        "wastage": "string",       // percentage
        "tounch": "string",        // percentage
        "fine_weight": "string",   // 3 decimal places, calculated

        "rate": {
            "label": "string",
            "value": "string",
            "price": "string"
        },
        "making_type": {
            "label": "Per Gram (PG) | Per Piece (PP)",
            "value": "PG | PP"
        },
        "making_charge": "string", // 2 decimal places
        "metal_value": "string",   // calculated if cutting_enabled
        "cutting_enabled": "boolean",

        "interest_enabled": "boolean",
        "interest_type": {
            "label": "Flat | Compound",
            "value": "1 | 2"
        },
        "interest_rate": "string",
        "interest_amount": "string",
        "bill_date": "string",     // ISO date
        "payment_date": "string",   // ISO date
        "interest_start_date": "string", // ISO date
        "grace_period_enabled": "boolean",
        "grace_period_days": "string",
        "interest_notes": "string",

        "charges_json": [
            {
                "name": "string",
                "amount": "string" // 2 decimal places
            }
        ],
        "tax_json": [
            {
                "name": "string",
                "amount": "string" // percentage
            }
        ],

        "custom_fields": [
            {
                "label": "string",
                "value": "string",
                "unit": {
                    "label": "string",
                    "value": "string"
                },
                "showInBill": "boolean"
            }
        ],

        "bill_display_settings": {
            "showSizeInBill": "boolean",
            "showGrossWeightInBill": "boolean",
            "showLessWeightInBill": "boolean",
            "showNetWeightInBill": "boolean",
            "showWastageInBill": "boolean",
            "showTounchInBill": "boolean",
            "showFineWeightInBill": "boolean",
            "showRateInBill": "boolean",
            "showMakingChargeInBill": "boolean",
            "showHuidInBill": "boolean",
            "showHsnInBill": "boolean",
            "showPriceInBill": "boolean",
            "showTaxInBill": "boolean",
            "showChargesInBill": "boolean",
            "showCommentInBill": "boolean"
        },

        "payment_history": [
            {
                "amount": "string",         // 2 decimal places
                "date": "string",           // ISO date
                "interest_paid": "string",  // 2 decimal places
                "remaining_balance": "string" // 2 decimal places, calculated
            }
        ]
    }
}
```

### Error Response
```json
{
    "success": false,
    "message": "Failed to get product detail by id"
}
```

### Use Case
- Fetches bill and product details based on a given bill ID, including invoice type, payment information, and product specifications
- Used in BillCard.jsx when clicking on an invoice to view or edit its details

## 2. Update Bill & Product Details
Updates an existing bill/invoice and its product details.

### Endpoint
```
POST /update-product
```

### Request Format
- Content-Type: `multipart/form-data`

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | String | Yes | ID of the bill/invoice to update |
| type | String | Yes | "sale" or "purchase" |
| name | String | Yes | Product name |
| huid | String | No | Unique hallmark ID |
| hsn_id | JSON String | Yes | HSN code information object |
| size | String | No | Size of the product |
| remark | String | No | Additional remarks |
| comment | String | No | Comments about the product |
| image | File | No | Product image |
| additional_image | File | No | Additional product image |
| gross_weight | String | Yes | Gross weight (3 decimal places) |
| less_weight | String | Yes | Weight reduction (3 decimal places) |
| net_weight | String | Yes | Net weight (3 decimal places, calculated) |
| wastage | String | Yes | Wastage percentage |
| tounch | String | Yes | Purity percentage |
| fine_weight | String | Yes | Fine weight (3 decimal places, calculated) |
| rate | JSON String | Yes | Rate information object |
| making_type | JSON String | Yes | Making charge type object |
| making_charge | String | Yes | Making charge amount (2 decimal places) |
| metal_value | String | Yes | Metal value calculation (if cutting_enabled) |
| cutting_enabled | Boolean | Yes | Whether cutting is enabled |
| interest_enabled | Boolean | Yes | Whether interest is enabled |
| interest_type | JSON String | No | Interest type object (required if interest_enabled is true) |
| interest_rate | String | No | Interest rate (required if interest_enabled is true) |
| interest_amount | String | No | Interest amount (required if interest_enabled is true) |
| bill_date | String | Yes | Invoice date (ISO format) |
| payment_date | String | No | Payment date (ISO format) |
| interest_start_date | String | No | Interest start date (ISO format) |
| grace_period_enabled | Boolean | Yes | Whether grace period is enabled |
| grace_period_days | String | No | Grace period days (required if grace_period_enabled is true) |
| interest_notes | String | No | Notes about interest calculation |
| charges_json | JSON String | No | JSON string of additional charges array |
| tax_json | JSON String | No | JSON string of tax information array |
| custom_fields | JSON String | No | JSON string of custom fields array |
| bill_display_settings | JSON String | No | JSON string of display settings object |
| payment_history | JSON String | No | JSON string of payment history array |

### Success Response
```json
{
    "success": true,
    "message": "Product updated successfully",
    "data": {
        "id": "string",
        "type": "sale | purchase"
        // Other product details may be included
    }
}
```

### Error Response
```json
{
    "success": false,
    "message": "Failed to update product"
}
```

### Use Case
- Updates product and bill details, including financial settings and optional image uploads
- Used in ProductForm.jsx for both creating new products and updating existing ones
- Handles both inventory products and bill-related products based on context

## 3. Create/Add Sale or Purchase Invoice
Creates a new sale or purchase invoice.

### Endpoint
```
POST /add-invoice
```

### Request Format
- Content-Type: `multipart/form-data`

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| user_contact_id | String | Yes | Customer contact ID |
| payment_mode | String | Yes | Payment mode (e.g., "Cash", "Card") |
| payment_date | String | Yes | Payment date (ISO format) |
| bill_total | String | Yes | Total bill amount |
| amount_paid | String | Yes | Amount already paid |
| tax | String | No | Tax percentage |
| additional_charges | String | No | Additional charges amount |
| total | String | Yes | Remaining balance (bill_total - amount_paid) |
| invoice_type | String | Yes | "1" for sale, "2" for purchase |
| item | JSON String | Yes | JSON string of product items array |

### Item Object Format
Each object in the 'item' array should contain:
```json
{
  "product_id": "number",
  "hsn_id": "number",
  "tounch": "number",
  "wastage": "number",
  "gross_weight": "number",
  "net_price": "number",
  "fine_weight": "number",
  "size": "string",
  "show_size_in_bill": "boolean"
}
```

### Success Response
```json
{
    "success": true,
    "message": "Invoice added successfully",
    "data": {
        "id": "string",
        "invoice_type": "1 | 2",
        "user_contact_id": "string",
        // Other invoice details
    }
}
```

### Error Response
```json
{
    "success": false,
    "message": "Failed to add invoice"
}
```

### Use Case
- Creates a new sale or purchase invoice record with all necessary details
- Used in the invoice creation flow for both sale and purchase invoices

## 4. Get Invoice Home List
Retrieves a list of invoices for the home screen.

### Endpoint
```
GET /get-invoice-home
```

### Success Response
```json
{
    "success": true,
    "data": [
        {
            "id": "string",
            "invoice_type": "1 | 2", // 1 for sale, 2 for purchase
            "user_contact_id": "string",
            "customer_name": "string",
            "payment_date": "string",
            "bill_total": "string",
            "amount_paid": "string",
            "items": [
                {
                    "product_id": "number",
                    "product": {
                        "name": "string",
                        "huid": "string",
                        "hsn_id": "string"
                    },
                    "gross_weight": "number",
                    "net_weight": "number",
                    "fine_weight": "number",
                    "tounch": "number",
                    "wastage": "number",
                    "net_price": "number",
                    "making_type": "string",
                    "making_charge": "number",
                    "rate": {
                        "price": "number"
                    }
                }
            ],
            "created_at": "string",
            "updated_at": "string"
        }
    ]
}
```

### Error Response
```json
{
    "success": false,
    "message": "Failed to get invoices"
}
```

### Use Case
- Retrieves a list of invoices for display on the home screen
- Used in BillCard.jsx to display invoice summaries and details

## 5. Get Contact Invoice History
Retrieves invoice history for a specific contact.

### Endpoint
```
GET /user-contact-invoice-history
```

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| user_contact_id | String | Yes | Customer contact ID |

### Success Response
```json
{
    "success": true,
    "data": [
        {
            "id": "string",
            "invoice_type": "1 | 2", // 1 for sale, 2 for purchase
            "payment_date": "string",
            "bill_total": "string",
            "amount_paid": "string",
            "created_at": "string"
        }
    ]
}
```

### Error Response
```json
{
    "success": false,
    "message": "Failed to get contact invoice history"
}
```

### Use Case
- Retrieves a contact's invoice history for displaying their transaction history
- Used when viewing a customer's purchase/sale history

## 6. Save Invoice PDF
Saves an invoice as a PDF file.

### Endpoint
```
GET /invoice/:invoiceId/pdf
```

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| invoiceId | String | Yes | ID of the invoice to save as PDF (in URL) |

### Success Response
```json
{
    "success": true,
    "data": {
        "pdf_url": "string" // URL to download the PDF
    }
}
```

### Error Response
```json
{
    "success": false,
    "message": "Failed to save invoice as PDF"
}
```

### Use Case
- Generates and saves a PDF version of a specific invoice
- Used in the invoice viewing flow for saving/sharing invoices

## 7. Create Log Entry for Invoices
Creates a log entry for invoice-related actions.

### Endpoint
```
POST /api/logs/create
```

### Request Format
```json
{
    "userName": "string",
    "productName": "string",
    "id": "string",
    "type": "string",
    "amount": "string",
    "invoiceId": "string",
    "action": "CREATE | UPDATE | DELETE",
    "entityType": "PRODUCT | INVOICE",
    "timestamp": "string", // ISO date
    "metadata": {
        "customerName": "string",
        "items": [
            {
                "name": "string",
                "quantity": "number",
                "price": "string"
            }
        ],
        "status": "string"
    }
}
```

### Success Response
```json
{
    "success": true,
    "message": "Log created successfully"
}
```

### Error Response
```json
{
    "success": false,
    "message": "Failed to create log"
}
```

### Use Case
- Creates audit logs for invoice and product actions
- Used in ProductForm.jsx to log product creation and updates

## Data Models

### Bill/Invoice
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| invoice_type | String | "1" for sale, "2" for purchase |
| user_contact_id | String | Customer reference |
| payment_date | Date | Payment date |
| bill_total | Number | Total bill amount |
| amount_paid | Number | Amount paid |
| tax | Number | Tax percentage |
| additional_charges | Number | Additional charges amount |
| total | Number | Remaining balance |
| item | Array | Product items in the bill |
| created_at | Date | Creation timestamp |
| updated_at | Date | Last update timestamp |

### Bill Product (Item)
| Field | Type | Description |
|-------|------|-------------|
| product_id | Number | Product identifier |
| hsn_id | Number | HSN code information |
| tounch | Number | Purity percentage |
| wastage | Number | Wastage percentage |
| gross_weight | Number | Gross weight in grams |
| net_price | Number | Final price of the product |
| fine_weight | Number | Fine weight in grams |
| size | String | Size of the product |
| show_size_in_bill | Boolean | Whether to show size in bill |

### Product
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| type | String | "sale" or "purchase" |
| name | String | Product name |
| huid | String | Hallmark ID |
| hsn_id | Object | HSN code information |
| size | String | Size specification |
| remark | String | Additional remarks |
| comment | String | Comments about the product |
| image | Object | Product image details |
| additional_image | Object | Additional image details |
| gross_weight | String | Gross weight in grams |
| less_weight | String | Weight reduction in grams |
| net_weight | String | Net weight in grams |
| wastage | String | Wastage percentage |
| tounch | String | Purity percentage |
| fine_weight | String | Fine weight in grams |
| rate | Object | Rate information |
| making_type | Object | Making charge type |
| making_charge | String | Making charge amount |
| charges_json | Array | Additional charges |
| tax_json | Array | Tax information |
| custom_fields | Array | Custom fields |
| bill_display_settings | Object | Display settings for bill |

## Important Notes

1. All monetary values should be strings with 2 decimal places
2. All weight values should be strings with 3 decimal places
3. Dates should be in ISO 8601 format (YYYY-MM-DDThh:mm:ss.sssZ)
4. File uploads should use multipart/form-data format
5. JSON fields should be stringified properly before sending
6. Invoice type is represented as "1" for sale and "2" for purchase 