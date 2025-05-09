# API Documentation

This directory contains comprehensive API documentation for the backend services. The documentation is split into two main sections to clearly differentiate between the inventory management system and the billing system.

## Available Documentation

1. **[Inventory & Stock Management API](./InventoryAPI.md)**
   - Covers all endpoints related to raw inventory management
   - Includes weight tracking, transfers, and stock management
   - Primary endpoints: `/get-product`, `/create-product`, `/update-product`, `/manage-stock`, etc.

2. **[Bill & Invoice Management API](./BillAPI.md)**
   - Covers all endpoints related to customer bills and invoices
   - Includes product details in bill context, financial calculations, and payment tracking
   - Primary endpoints: `/product-detail-by-id`, `/update-product` (in bill context), etc.

## Important Notes

- Some endpoints (like `/product-detail-by-id` and `/update-product`) appear in both API documents because they serve dual purposes depending on the context and parameters.
- When using these endpoints:
  - For inventory management, include appropriate inventory-related parameters
  - For bill management, include appropriate bill-related parameters including the bill context

## Implementation Guidance

- Use the `isFromInvoice` flag in your code to differentiate between inventory and bill contexts
- Each API has its own data models and response structures tailored to its specific domain
- The backend determines the appropriate context based on the parameters passed

## Authentication

All API endpoints require authentication via a Bearer token:

```
Authorization: Bearer {accessToken}
``` 