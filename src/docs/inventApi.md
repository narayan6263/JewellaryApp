# Inventory Management API Documentation

## Base URL
`/inventory`

## Endpoints

### 1. List Inventory Items
**Endpoint:** `GET /list`

**Query Parameters:**
- `search` (optional): Search by name or barcode
- `metal_type` (optional): Filter by metal type (gold/silver)
- `status` (optional): Filter by status (available/sold/reserved)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [{
      "id": "string",
      "name": "string",
      "product_id": "string",
      "metal_type": "string",
      "gross_weight": "number",
      "net_weight": "number",
      "rate": "number",
      "status": "string",
      "image_url": "string"
    }],
    "total": "number",
    "page": "number",
    "limit": "number"
  }
}
```

### 2. Get Item Details
**Endpoint:** `GET /:id`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
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
    "final_amount": "number",
    "status": "string",
    "images": ["string"]
  }
}
```

### 3. Create Inventory Item
**Endpoint:** `POST /create`

**Request Body:**
```json
{
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
  "metal_type": "string",
  "making_type": {
    "value": "string",
    "label": "string"
  },
  "making_charge": "number",
  "polishing": "number",
  "stone_setting": "number",
  "additional_charges": "number",
  "images": ["file"]
}
```

### 4. Update Inventory Item
**Endpoint:** `PUT /update/:id`

**Request Body:** Same as Create

### 5. Delete Inventory Item
**Endpoint:** `DELETE /delete/:id`

### 6. Update Item Status
**Endpoint:** `PUT /status/:id`

**Request Body:**
```json
{
  "status": "string"  // available/sold/reserved
}
```

## Mock Data Structure
```javascript
const mockInventory = {
  items: [{
    id: "inv_001",
    name: "Gold Ring",
    product_id: "GR001",
    metal_type: "gold",
    gross_weight: 5.2,
    net_weight: 5.0,
    rate: 5000,
    status: "available",
    image_url: "https://example.com/ring.jpg"
  }],
  total: 1,
  page: 1,
  limit: 10
};
```

## Environment Configuration
```javascript
const config = {
  useMockData: true,  // Set to false to use real API
  apiBaseUrl: "https://api.example.com",
  mockData: mockInventory
};
``` 