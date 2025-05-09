# Inventory & Stock Management API Documentation

## Base URL
```
https://app.theskillsocean.com
```

## Authentication
All endpoints require a valid Bearer token in the Authorization header:
```
Authorization: Bearer {accessToken}
```

## 1. Fetch Products
Retrieves a list of all products.

### Endpoint
```
GET /get-product
```

### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "PRODUCT123",
      "name": "Gold Chain",
      "hsn_id": "HSN001",
      "metal_id": "METAL1",
      "image_url": "https://example.com/images/product123.jpg",
      "purchase_product_data": [
        {
          "id": "ENTRY001",
          "created_at": "2024-03-15T12:00:00.000Z",
          "purchase_gross_weight": 10.5,
          "purchase_net_weight": 10.2,
          "purchase_fine_weight": 9.8
        }
      ],
      "created_at": "2024-03-15T12:00:00.000Z"
    }
  ]
}
```

## 2. Create Product
Creates a new product record.

### Endpoint
```
POST /create-product
```

### Request Format
- Content-Type: `multipart/form-data`

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| name | String | Yes | Name of the product |
| hsn_id | String | Yes | HSN ID/code of the product |
| metal_id | String | Yes | ID of the metal type |
| image | File | No | Product image |
| purchase_product_data | JSON String | No | Array of weight entries |

### Success Response
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "PRODUCT123",
    "name": "Gold Chain",
    "hsn_id": "HSN001",
    "metal_id": "METAL1",
    "image_url": "https://example.com/images/product123.jpg",
    "purchase_product_data": [],
    "created_at": "2024-03-15T12:00:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Failed to create product",
  "errors": [
    "Product name is required",
    "HSN ID is required"
  ]
}
```

## 3. Get Product Details
Retrieves details of a specific product by ID.

### Endpoint
```
POST /product-detail-by-id
```

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | String | Yes | ID of the product to retrieve |

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "PRODUCT123",
    "name": "Gold Chain",
    "hsn_id": "HSN001",
    "metal_id": "METAL1",
    "image_url": "https://example.com/images/product123.jpg",
    "purchase_product_data": [
      {
        "id": "ENTRY001",
        "created_at": "2024-03-15T12:00:00.000Z",
        "purchase_gross_weight": 10.5,
        "purchase_net_weight": 10.2,
        "purchase_fine_weight": 9.8
      }
    ],
    "created_at": "2024-03-15T12:00:00.000Z"
  }
}
```

## 4. Update Product
Updates an existing product including weight management.

### Endpoint
```
POST /update-product
```

### Request Format
- Content-Type: `multipart/form-data`

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | String | Yes | ID of the product to update |
| name | String | No | Updated name of the product |
| hsn_id | String | No | Updated HSN ID/code |
| metal_id | String | No | Updated metal type ID |
| image | File | No | Updated product image |
| purchase_product_data | JSON String | No | Complete array of weight entries |

### Weight Entry Object Format
Each entry in the purchase_product_data array should follow this format:

| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier for the entry |
| created_at | DateTime | When this entry was created |
| purchase_gross_weight | Number | Gross weight in grams |
| purchase_net_weight | Number | Net weight in grams (positive for additions, negative for transfers out) |
| purchase_fine_weight | Number | Fine weight calculation |

### Success Response
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "PRODUCT123",
    "name": "Gold Chain",
    "hsn_id": "HSN001",
    "metal_id": "METAL1",
    "image_url": "https://example.com/images/product123.jpg",
    "purchase_product_data": [
      {
        "id": "ENTRY001",
        "created_at": "2024-03-15T12:00:00.000Z",
        "purchase_gross_weight": 10.5,
        "purchase_net_weight": 10.2,
        "purchase_fine_weight": 9.8
      },
      {
        "id": "ENTRY002",
        "created_at": "2024-03-16T14:30:00.000Z",
        "purchase_gross_weight": 10.5,
        "purchase_net_weight": 5.0,
        "purchase_fine_weight": 4.8
      }
    ],
    "updated_at": "2024-03-16T14:35:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Failed to update product",
  "errors": [
    "Invalid product ID",
    "Invalid weight data format"
  ]
}
```

## 5. Delete Product
Deletes a product record.

### Endpoint
```
POST /delete-product
```

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | String | Yes | ID of the product to delete |

### Success Response
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

## 6. Manage Stock
Manages product stock weight.

### Endpoint
```
POST /manage-stock
```

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| product_id | String | Yes | ID of the product |
| weight | Number | Yes | Weight amount to add/remove |
| transaction_type | String | Yes | Type (add, remove) |
| description | String | No | Transaction description |

### Success Response
```json
{
  "success": true,
  "message": "Stock updated successfully",
  "data": {
    "id": "TRANSACTION125",
    "product_id": "PRODUCT123",
    "weight": 5.0,
    "transaction_type": "add",
    "description": "New stock added",
    "created_at": "2024-03-20T12:00:00.000Z"
  }
}
```

## 7. Get Stock Transactions
Retrieves stock transaction history for a product.

### Endpoint
```
GET /get-stock-transaction
```

### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| product_id | String | Yes | ID of the product |

### Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": "TRANSACTION124",
      "product_id": "PRODUCT123",
      "weight": 3.0,
      "transaction_type": "add",
      "description": "Initial stock",
      "created_at": "2024-03-19T12:00:00.000Z"
    },
    {
      "id": "TRANSACTION125",
      "product_id": "PRODUCT123",
      "weight": 5.0,
      "transaction_type": "add",
      "description": "New stock added",
      "created_at": "2024-03-20T12:00:00.000Z"
    }
  ]
}
```

## 8. Weight Management Implementation

### Adding Weight
To add new weight to a product:

1. Retrieve the current `purchase_product_data` array for the product
2. Create a new weight entry object:
   ```json
   {
     "id": "ENTRY_ID",
     "created_at": "2024-03-20T12:00:00.000Z",
     "purchase_gross_weight": 10.5,
     "purchase_net_weight": 5.0,
     "purchase_fine_weight": 4.8
   }
   ```
3. Append this entry to the array
4. Send the complete array in the `purchase_product_data` field when calling `/update-product`

### Transferring Weight
To transfer weight between products:

1. Create a negative entry for the source product:
   ```json
   {
     "id": "SOURCE_ENTRY_ID",
     "created_at": "2024-03-20T12:00:00.000Z",
     "purchase_gross_weight": 10.5,
     "purchase_net_weight": -2.0,
     "purchase_fine_weight": 4.8
   }
   ```

2. Create a positive entry for the destination product:
   ```json
   {
     "id": "DEST_ENTRY_ID",
     "created_at": "2024-03-20T12:00:00.000Z",
     "purchase_gross_weight": 0,
     "purchase_net_weight": 2.0,
     "purchase_fine_weight": 0
   }
   ```

3. Update both products by sending their complete updated arrays to `/update-product` in separate requests

## Data Models

### Product
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| name | String | Product name |
| hsn_id | String | HSN ID/code |
| metal_id | String | Metal type ID |
| image_url | String | Product image URL |
| purchase_product_data | Array | Weight history entries |
| created_at | Date | Creation timestamp |
| updated_at | Date | Last update timestamp |

### Weight Entry
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier for the entry |
| created_at | DateTime | Entry creation timestamp |
| purchase_gross_weight | Number | Gross weight in grams |
| purchase_net_weight | Number | Net weight in grams |
| purchase_fine_weight | Number | Fine weight calculation |

### Stock Transaction
| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| product_id | String | Associated product ID |
| weight | Number | Transaction weight amount |
| transaction_type | String | Type (add, remove, transfer) |
| description | String | Transaction description |
| created_at | Date | Creation timestamp | 