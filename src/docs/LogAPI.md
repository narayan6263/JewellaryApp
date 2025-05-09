# Log API Documentation

This document provides details on the Log API endpoints for tracking system activities, including loan operations.

## Endpoints

### (1) Create Log Entry

**API Endpoint:** `POST /api/logs/create`

**Request Format:**
```json
{
  "userName": string,        // Name of user performing action
  "productName": string,     // Name of product/item (optional)
  "id": string,              // ID of the entity being acted upon
  "type": string,            // "order" | "repair" | "sale" | "purchase" | "loan" (lowercase)
  "amount": string,          // Transaction amount (2 decimal places)
  "invoiceId": string,       // Invoice identifier (optional)
  "action": string,          // "CREATE" | "UPDATE" | "DELETE" | "PAYMENT" | "FREEZE"
  "entityType": string,      // "PRODUCT" | "INVOICE" | "REPAIR" | "PAYMENT" | "LOAN"
  "timestamp": string,       // ISO date string
  "metadata": {              // Optional additional data
    "customerName": string,
    "status": string,        // Current status of the entity
    "interestRate": string,  // For loan actions, the interest rate
    "interestAmount": string, // For loan actions, the interest amount
    "previousAmount": string, // Previous loan amount before freezing
    "interestPeriod": string, // Period for interest calculation
    "transactionType": string, // Type of transaction (e.g., "Cash")
    "transactionDate": string, // Date of transaction
    "paymentType": string,    // "Given" or "Received"
    "remarks": string,        // Additional notes
    "items": [               // Array of items involved (optional)
      {
        "name": string,
        "quantity": number,   // Defaults to 1 if not specified
        "price": string       // 2 decimal places
      }
    ]
  }
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Log created successfully",
  "data": {
    "id": "log_123",
    "timestamp": "2024-03-21T10:30:00Z"
  }
}
```

**Error Response (400/401/403/404/500):**
```json
{
  "success": false,
  "message": "Failed to create log entry"
}
```

### (2) Fetch Logs

**API Endpoint:** `GET /api/logs/fetch`

**Request Format:** No request body required

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logs fetched successfully",
  "logs": [
    {
      "id": string,           // Unique log identifier
      "userName": string,     // User who performed the action
      "productName": string,  // Name of the product/item (if applicable)
      "type": string,         // "order" | "repair" | "sale" | "purchase" | "loan"
      "amount": string,       // Transaction amount (2 decimal places)
      "action": string,       // "CREATE" | "UPDATE" | "PAYMENT" | "FREEZE"
      "entityType": string,   // "PRODUCT" | "INVOICE" | "PAYMENT" | "LOAN"
      "timestamp": string,    // ISO date string
      "metadata": {           // Additional data if available
        "customerName": string,
        "status": string,
        "interestRate": string,
        "interestAmount": string,
        "previousAmount": string,
        "interestPeriod": string,
        "transactionType": string,
        "transactionDate": string,
        "paymentType": string,
        "remarks": string,
        "items": Array<{
          "name": string,
          "quantity": number,
          "price": string
        }>
      }
    }
  ]
}
```

**Error Response (400/401/403/404/500):**
```json
{
  "success": false,
  "message": "Failed to fetch logs"
}
```

## Implementation Details

### Loan-Specific Logging

#### Freezing a Loan

When freezing a loan with interest, a log entry is created with:
- `action`: "FREEZE"
- `entityType`: "LOAN"
- `type`: "loan"
- `metadata.status`: "Frozen"
- `metadata.interestRate`: The loan's interest rate
- `metadata.interestAmount`: The calculated interest amount
- `metadata.previousAmount`: The loan amount before freezing
- `metadata.interestPeriod`: The period over which interest was calculated

#### Cash Transactions for Loans

When adding a cash transaction to a loan, a log entry is created with:
- `action`: "PAYMENT"
- `entityType`: "LOAN"
- `type`: "loan"
- `metadata.transactionType`: "Cash"
- `metadata.transactionDate`: Date of the transaction
- `metadata.paymentType`: "Given" or "Received" based on transaction direction

## Display and Filtering

The Logs screen provides filtering options to view specific types of actions:
- All logs
- Created items
- Updated items
- Payment transactions
- Freeze operations

Each log entry is color-coded based on its entity type for easy identification:
- Product: Blue
- Invoice: Green
- Repair: Orange
- Payment: Purple
- Loan: Red 