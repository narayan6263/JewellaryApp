# Loan API Documentation

## Base URL
```
https://app.theskillsocean.com
```

## Authentication
All endpoints require a valid Bearer token in the Authorization header:
```
Authorization: Bearer {accessToken}
```

## 1. Create Loan
Creates a new loan record with item details, valuation, and interest calculations.

### Endpoint
```
POST /api/add-loan
```

### Request Format
- Content-Type: `multipart/form-data`

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| user_contact_id | String | Yes | ID of the contact/client for this loan |
| valuation_amount | Number | Yes | Total valuation of all items |
| loan_amount | Number | Yes | Amount of loan given |
| interest_type | String | Yes | Type of interest (1: Compound, 2: Flat) |
| interest_rate | Number | Yes | Interest rate percentage |
| interest_upto | Date | Yes | Interest calculation end date (YYYY-MM-DD) |
| interest_amount | Number | Yes | Calculated interest amount |
| order_photo | File | No | Photo of the order/items |
| item | JSON String | Yes | Array of item details |

### Item Object Properties
| Name | Type | Description |
|------|------|-------------|
| name | String | Name of the item |
| hsn_id | String | HSN ID/code of the item |
| gross_weight | Number | Gross weight in grams |
| less_weight | Number | Weight reduction |
| net_weight | Number | Net weight after reduction |
| tounch | Number | Purity percentage |
| fine_weight | Number | Fine weight calculation |
| rate | Number | Rate per gram/unit |
| making_charge | Number | Making charges |
| additional_charge | Number | Additional charges |
| tax_rate | Number | Tax rate percentage |
| charges_json | Array | Additional itemized charges |
| tax_json | Array | Tax breakdown |
| valuation | Number | Calculated value of the item |
| net_price | Number | Final price including all charges |
| comment | String | Additional comments |
| cutting_enabled | Boolean | Whether cutting is enabled |
| piece | Number | Number of pieces |

### Success Response
```json
{
  "success": true,
  "message": "Loan created successfully",
  "data": {
    "id": "LOAN123456",
    "user_contact_id": "CONTACT123",
    "valuation_amount": 65000,
    "loan_amount": 50000,
    "interest_type": "2",
    "interest_rate": "2",
    "interest_upto": "2025-03-15T00:00:00.000Z",
    "interest_amount": 2000,
    "items": [
      {
        "id": "ITEM001",
        "name": "Gold Ring",
        "hsn_id": "HSN001",
        "gross_weight": 10.5,
        "net_weight": 10.2,
        "fine_weight": 9.8,
        "tounch": 916,
        "rate": 5500,
        "valuation": 53900,
        "making_charge": 1200,
        "net_price": 65000
      }
    ],
    "created_at": "2024-03-15T12:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Failed to create loan",
  "errors": [
    "Invalid contact ID",
    "Valuation amount is required"
  ]
}
```

## 2. Get Loans
Retrieves a list of all loans.

### Endpoint
```
GET /get-loans
```

### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "LOAN123456",
      "user_contact_id": "CONTACT123",
      "valuation_amount": 65000,
      "loan_amount": 50000,
      "interest_type": "2",
      "interest_rate": "2",
      "interest_upto": "2025-03-15T00:00:00.000Z",
      "interest_amount": 2000,
      "items": [],
      "created_at": "2024-03-15T12:00:00.000Z"
    }
  ]
}
```

## 3. Get Loan Details
Retrieves details of a specific loan by ID.

### Endpoint
```
GET /get-loans-by-id
```

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | String | Yes | ID of the loan to retrieve |

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "LOAN123456",
    "user_contact_id": "CONTACT123",
    "valuation_amount": 65000,
    "loan_amount": 50000,
    "interest_type": "2",
    "interest_rate": "2",
    "interest_upto": "2025-03-15T00:00:00.000Z",
    "interest_amount": 2000,
    "items": [
      {
        "id": "ITEM001",
        "name": "Gold Ring",
        "hsn_id": "HSN001",
        "gross_weight": 10.5,
        "net_weight": 10.2,
        "fine_weight": 9.8,
        "tounch": 916,
        "rate": 5500,
        "valuation": 53900,
        "making_charge": 1200,
        "net_price": 65000
      }
    ],
    "created_at": "2024-03-15T12:00:00.000Z"
  }
}
```

## 4. Get Loans by Contact ID
Retrieves all loans associated with a specific contact.

### Endpoint
```
GET /get-loans-by-contact-id
```

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| user_contact_id | String | Yes | ID of the contact to retrieve loans for |

### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "LOAN123456",
      "user_contact_id": "CONTACT123",
      "valuation_amount": 65000,
      "loan_amount": 50000,
      "interest_type": "2",
      "interest_rate": "2",
      "interest_upto": "2025-03-15T00:00:00.000Z",
      "interest_amount": 2000,
      "items": [],
      "created_at": "2024-03-15T12:00:00.000Z"
    }
  ]
}
```

## 5. Freeze Loan
Freezes a loan to prevent further interest accrual and optionally adds/removes an amount.

### Endpoint
```
POST /freeze-loan
```

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| loan_id | String | Yes | ID of the loan to freeze |
| new_amount | Number | Yes | Amount being added/subtracted |
| new_amount_type | String | Yes | Type of amount (1: Given, 2: Received) |
| interest_upto | Date | Yes | Date to calculate interest until |
| current_period_interest | Number | Yes | Calculated interest for the period |
| new_base_amount | Number | Yes | New principal amount after interest |
| is_freeze | Number | Yes | Whether to freeze the loan (1: Yes, 0: No) |
| interest_periods | String | Yes | JSON string of interest period history |
| interest_amount | Number | Yes | Interest amount |
| interest_till_amount | Number | Yes | Interest calculated till date |
| interest_till_date | Date | Yes | Date till which interest is calculated |

### Success Response
```json
{
  "success": true,
  "message": "Loan frozen successfully",
  "data": {
    "id": "LOAN123456",
    "status": "frozen",
    "freeze_date": "2024-03-15T12:00:00.000Z",
    "interest_periods": [{
      "interest_upto": "2024-03-15",
      "base_amount": 50000,
      "interest_amount": 2000,
      "interest_rate": 2
    }],
    "new_base_amount": 52000
  }
}
```

## 6. Get Interest Till Today
Calculates the interest accrued on a loan up to the current date.

### Endpoint
```
GET /get-interest-till-today
```

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| loan_id | String | Yes | ID of the loan to calculate interest for |

### Success Response
```json
{
  "success": true,
  "data": {
    "loan_id": "LOAN123456",
    "original_amount": 50000,
    "interest_type": "2",
    "interest_rate": "2",
    "interest_start_date": "2024-03-15T12:00:00.000Z",
    "interest_till_date": "2024-03-20T12:00:00.000Z",
    "days_elapsed": 5,
    "interest_amount": 136.99,
    "total_amount": 50136.99
  }
}
```

## 7. Get Loan Cash Transactions
Retrieves all cash transactions for a specific loan.

### Endpoint
```
GET /get-loan-cash-transactions/:id
```

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | String | Yes | ID of the loan to retrieve transactions for |

### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "TRANSACTION123",
      "loan_id": "LOAN123456",
      "amount": 5000,
      "type": "1",
      "date": "2024-03-18T12:00:00.000Z",
      "created_at": "2024-03-18T12:00:00.000Z"
    },
    {
      "id": "TRANSACTION124",
      "loan_id": "LOAN123456",
      "amount": 2000,
      "type": "2",
      "date": "2024-03-19T12:00:00.000Z",
      "created_at": "2024-03-19T12:00:00.000Z"
    }
  ]
}
```

## 8. Add Loan Cash Transaction
Adds a new cash transaction to a loan.

### Endpoint
```
POST /add-loan-cash-transaction
```

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| loan_id | String | Yes | ID of the loan |
| amount | Number | Yes | Transaction amount |
| type | String | Yes | Transaction type (1: Given, 2: Received) |
| date | Date | Yes | Transaction date |

### Success Response
```json
{
  "success": true,
  "message": "Cash transaction added successfully",
  "data": {
    "id": "TRANSACTION125",
    "loan_id": "LOAN123456",
    "amount": 3000,
    "type": "1",
    "date": "2024-03-20T12:00:00.000Z",
    "created_at": "2024-03-20T12:00:00.000Z"
  }
}
```

## 9. Get Transaction History
Retrieves the complete transaction history for a loan, including freeze periods and cash transactions.

### Endpoint
```
GET /loan/{id}/transaction-history
```

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | String | Yes | ID of the loan |

### Success Response
```json
{
  "success": true,
  "data": {
    "loan_id": "LOAN123456",
    "transactions": [
      {
        "date": "2025-04-08",
        "type": "Initial Loan",
        "baseAmount": 3760.00,
        "cashAmount": null,
        "interest": null,
        "newBalance": 3760.00,
        "days": null,
        "notes": "Loan starts"
      },
      {
        "date": "2025-07-08",
        "type": "Freeze Period",
        "baseAmount": 3760.00,
        "cashAmount": null,
        "interest": 18.74,
        "newBalance": 3778.74,
        "days": 91,
        "notes": "First freeze"
      },
      {
        "date": "2025-07-15",
        "type": "Cash Given",
        "baseAmount": 3778.74,
        "cashAmount": 2000.00,
        "interest": null,
        "newBalance": 5778.74,
        "days": null,
        "notes": "New base amount"
      }
    ]
  }
}
```

## 10. Calculate Interest
Calculates interest for a given period and base amount.

### Endpoint
```
POST /calculate-loan-interest
```

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| base_amount | Number | Yes | Base amount for calculation |
| interest_rate | Number | Yes | Interest rate percentage |
| start_date | Date | Yes | Start date for calculation |
| end_date | Date | Yes | End date for calculation |

### Success Response
```json
{
  "success": true,
  "data": {
    "base_amount": 3760.00,
    "interest_rate": 2,
    "days": 91,
    "calculated_interest": 18.74,
    "new_balance": 3778.74
  }
}
```

## 11. Get Loan Balance
Retrieves the current balance and transaction summary for a loan.

### Endpoint
```
GET /loan/{id}/current-balance
```

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | String | Yes | ID of the loan |

### Success Response
```json
{
  "success": true,
  "data": {
    "loan_id": "LOAN123456",
    "initial_amount": 3760.00,
    "total_interest": 220.66,
    "total_cash_given": 3500.00,
    "total_cash_received": 1000.00,
    "current_balance": 6480.66,
    "last_transaction_date": "2026-04-22T00:00:00.000Z"
  }
}
```

## 12. Update Loan Balance
Updates the loan balance after a transaction.

### Endpoint
```
POST /update-loan-balance
```

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| loan_id | String | Yes | ID of the loan |
| transaction_type | String | Yes | Type of transaction (freeze/cash) |
| amount | Number | Yes | Transaction amount |
| new_balance | Number | Yes | New balance after transaction |
| transaction_date | Date | Yes | Date of transaction |

### Success Response
```json
{
  "success": true,
  "data": {
    "loan_id": "LOAN123456",
    "previous_balance": 5778.74,
    "transaction_amount": 57.78,
    "new_balance": 5836.52,
    "transaction_date": "2025-10-08T00:00:00.000Z"
  }
}
```

## Interest Calculation Methods

### Flat Interest
Calculated as:  
`Interest = Principal × Rate × Time`  
Where:
- Principal is the loan amount
- Rate is the annual interest rate (as a decimal)
- Time is the period in years (or fraction of a year)

### Compound Interest
Calculated as:  
`A = P(1 + r/n)^(nt)`  
Where:
- A is the final amount
- P is the principal
- r is the annual interest rate (as a decimal)
- n is the number of times the interest is compounded per year
- t is the time in years

For monthly compounding:  
`A = P(1 + r/12)^(12t)`

For daily compounding:  
`A = P(1 + r/365)^(365t)`

### Flat Interest (Daily)
For freeze periods and regular interest calculations:
```
Interest = (Principal × Rate × Days) / (365 × 100)
```
Where:
- Principal is the current base amount
- Rate is the annual interest rate (e.g., 2%)
- Days is the number of days in the period

Example:
```
Principal: ₹3,760.00
Rate: 2%
Days: 91
Interest = (3760 × 2 × 91) / (365 × 100) = ₹18.74
```

### Balance Updates
1. For Freeze Periods:
   ```
   New Balance = Base Amount + Calculated Interest
   ```

2. For Cash Given:
   ```
   New Balance = Current Balance + Cash Amount
   ```

3. For Cash Received:
   ```
   New Balance = Current Balance - Cash Amount
   ```

## Transaction Types
| Type | Description | Balance Effect |
|------|-------------|----------------|
| Initial Loan | Initial loan amount | Sets base balance |
| Freeze Period | Interest calculation period | Adds interest to balance |
| Cash Given | Additional cash given | Increases balance |
| Cash Received | Cash received from customer | Decreases balance |

## Data Models

### Loan
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| user_contact_id | String | ID of the customer |
| valuation_amount | Number | Total valuation of items |
| loan_amount | Number | Amount of loan given |
| interest_type | String | Type of interest (1: Compound, 2: Flat) |
| interest_rate | Number | Interest rate percentage |
| interest_upto | Date | Interest calculation end date |
| interest_amount | Number | Calculated interest amount |
| interest_periods | Array/String | Interest period history |
| status | String | Loan status (active, frozen, etc.) |
| created_at | Date | Creation timestamp |
| updated_at | Date | Last update timestamp |

### Interest Period
| Field | Type | Description |
|-------|------|-------------|
| interest_upto | Date | End date for this interest period |
| base_amount | Number | Base amount for interest calculation |
| interest_amount | Number | Interest amount for this period |
| interest_rate | Number | Interest rate for this period |

### Cash Transaction
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| loan_id | String | Associated loan ID |
| amount | Number | Transaction amount |
| type | String | Transaction type (1: Given, 2: Received) |
| date | Date | Transaction date |
| created_at | Date | Creation timestamp | 