# Group API Documentation

This document provides details on the Group API endpoints for managing contact groups and their members.

## Endpoints

### (1) Fetch Groups List

**API Endpoint:** `GET /groups/list`

**Request Format:** None

**Success Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "groups": [
            {
                "id": "string",
                "name": "string",
                "role": {
                    "id": "string",
                    "name": "string"  // e.g. "Customer", "Supplier"
                },
                "membersCount": number,
                "createdAt": "string (ISO date)"
            }
        ]
    }
}
```

**Error Response (400 Bad Request):**
```json
{
    "success": false,
    "message": "Failed to fetch groups"
}
```

**Use Case:** Retrieves all available groups for a contact, showing group names, IDs, and the count of members. This list is used for displaying available groups.

**Backend Expectations:**
- Fetch all groups linked to the user/contact.
- Return only the group name, ID, and member count for efficiency.

### (2) Fetch Group Details

**API Endpoint:** `GET /group/details/{group_id}`

**URL Parameters:** 
- `group_id`: ID of the group to fetch

**Request Format:** None

**Success Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "group_id": "string",
        "name": "string",
        "membersCount": number,
        "members": [
            {
                "id": "string",
                "name": "string"
            }
        ]
    }
}
```

**Error Response (400 Bad Request):**
```json
{
    "success": false,
    "message": "Failed to fetch group details"
}
```

**Use Case:** Retrieves all members of a specific group when a user clicks on a group.

**Backend Expectations:**
- Fetch all members of the specified group.
- Ensure optimized database queries for performance.

### (3) Create New Group

**API Endpoint:** `POST /groups/create`

**Request Format:**
```json
{
    "group_name": "string",
    "role_id": "string",  // ID of the role (Customer/Supplier)
    "members": [
        {
            "name": "string",
            "role_id": "string"  // Must match group's role_id
        }
    ]
}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "group": {
            "id": "string",
            "name": "string",
            "role": {
                "id": "string",
                "name": "string"
            },
            "membersCount": number
        }
    },
    "message": "Group created successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
    "success": false,
    "message": "string of error message"
}
```

**Use Case:** Creates a new contact group with the specified name, role and members.

**Backend Expectations:**
- Validate request data (ensure the group name is unique and members are valid)
- Verify that all members have the same role as the group
- Generate a unique group ID
- Store the group and member details in the database
- Log the group creation
- Ensure ACID compliance for data consistency

### (4) Manage Contact Groups

**API Endpoint:** `POST /contacts/manage-groups`

**Request Format:**
```json
{
    "contactId": "string",
    "groupId": "string"
}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "message": "Group assigned successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
    "success": false,
    "message": "one line error message"
}
```

**Use Case:** Assigns groups for a contact by linking to existing groups.

**Backend Expectations:**
- Check in the already created group.
- Update contact's group associations.
- Ensure database integrity and consistency.
- Log all modifications for auditing.

### (5) Assigning Item to Group Member

**API Endpoint:** `POST /groups/assign-item`

**Request Format:**
```json
{
    "Id": "string",  // The ID of the item being assigned
    "memberId": "string"  // The ID of the member receiving the item
}
```

**Success Response (200 OK):**
```json
{
    "status": "success",
    "message": "Item successfully assigned to member."
}
```

**Error Response (400 Bad Request):**
```json
{
    "status": "error",
    "message": "Failed to assign item due to insufficient permissions."
}
```

**Use Case:** Assign items to a group member.

**Backend Expectations:**
- Validate that both the item and member exist.
- Update the assignment in the database.
- Return appropriate success or error messages.

### (6) Fetch Member's Assigned Products

**API Endpoint:** `GET /members/{memberId}/assigned-products`

**URL Parameters:**
- `memberId`: ID of the member

**Request Format:** None

**Success Response (200 OK):**
```json
{
    "success": true,
    "data": [
        {
            "id": "string",
            "name": "string",
            "huid": "string",
            "hsn_id": {
                "value": "string",
                "label": "string",
                "variation": [
                    {
                        "id": "string",
                        "name": "string",
                        "price": number
                    }
                ]
            },
            "gross_weight": "string",
            "fine_weight": "string"
        }
        // ... more products
    ]
}
```

**Error Response (400 Bad Request):**
```json
{
    "success": false,
    "message": "Error in fetching assigned products"
}
```

**Use Case:** Retrieve all products assigned to a specific group member.

**Backend Expectations:**
- Query the database for all products assigned to the specified member.
- Return detailed product information including weights and variations.
- Provide appropriate error handling.

### (7) Assign Items to Member

**API Endpoint:** `POST /groups/assign-items`

**Request Format:**
```json
{
    "member_id": "string",
    "items": [
        {
            "item_id": "string",
            "item_type": "ORDER" | "REPAIR",
            "expected_completion": "2024-05-10",
            "description": "string",
            "weight": "10.5",
            "images": ["url1", "url2"],
            "specifications": {
                "design_no": "string",
                "size": "string",
                "material": "GOLD" | "SILVER"
            }
        }
    ],
    "assigned_by": "string",
    "priority": "HIGH" | "MEDIUM" | "LOW"
}
```

**Success Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "assignment_id": "string",
        "member": {
            "id": "string",
            "name": "string"
        },
        "items": [
            {
                "id": "string",
                "type": "ORDER" | "REPAIR",
                "status": "ASSIGNED",
                "assigned_at": "2024-05-03T10:00:00Z"
            }
        ]
    },
    "message": "Items assigned successfully"
}
```

### (8) Get Member's Assigned Items

**API Endpoint:** `GET /groups/members/{member_id}/assigned-items`

**Query Parameters:**
- `status`: "ALL" | "PENDING" | "IN_PROGRESS" | "COMPLETED" (optional)
- `type`: "ORDER" | "REPAIR" | "ALL" (optional)
- `from_date`: "2024-05-01" (optional)
- `to_date`: "2024-05-10" (optional)

**Success Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "member": {
            "id": "string",
            "name": "string",
            "role": "KARIGAR",
            "total_assigned": 10,
            "pending": 3,
            "in_progress": 5,
            "completed": 2
        },
        "items": [
            {
                "assignment_id": "string",
                "item": {
                    "id": "string",
                    "type": "ORDER" | "REPAIR",
                    "order_number": "string",
                    "description": "string",
                    "weight": "10.5",
                    "images": ["url1", "url2"],
                    "specifications": {
                        "design_no": "string",
                        "size": "string",
                        "material": "GOLD" | "SILVER"
                    },
                    "status": "PENDING" | "IN_PROGRESS" | "COMPLETED",
                    "assigned_at": "2024-05-03T10:00:00Z",
                    "expected_completion": "2024-05-10",
                    "completed_at": null,
                    "priority": "HIGH" | "MEDIUM" | "LOW",
                    "assigned_by": {
                        "id": "string",
                        "name": "string"
                    }
                },
                "work_updates": [
                    {
                        "status": "IN_PROGRESS",
                        "updated_at": "2024-05-04T15:30:00Z",
                        "comment": "Work started",
                        "images": ["url1", "url2"]
                    }
                ]
            }
        ],
        "pagination": {
            "total": 50,
            "per_page": 10,
            "current_page": 1,
            "last_page": 5
        }
    }
}
```

### (9) Get Members List with Assignment Statistics

**API Endpoint:** `GET /groups/members/stats`

**Query Parameters:**
- `role`: "KARIGAR" | "CUSTOMER" | "SUPPLIER" (optional)
- `search`: string (optional, search by name)
- `status`: "ALL" | "ACTIVE" | "INACTIVE" (optional)

**Success Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "members": [
            {
                "id": "string",
                "name": "string",
                "role": "KARIGAR",
                "status": "ACTIVE",
                "assignedItems": {
                    "total": 5,
                    "pending": 2,
                    "in_progress": 2,
                    "completed": 1
                },
                "contact": {
                    "phone": "string",
                    "email": "string",
                    "address": "string"
                },
                "created_at": "2024-03-20T10:00:00Z",
                "last_assigned": "2024-03-19T15:30:00Z"
            }
        ],
        "pagination": {
            "total": 50,
            "per_page": 10,
            "current_page": 1,
            "last_page": 5
        }
    }
}
```

**Error Response (400 Bad Request):**
```json
{
    "success": false,
    "message": "Failed to fetch members list"
}
```

**Use Case:** Retrieves a list of members with their current assignment statistics. This is primarily used in the allocation screen to show karigars and their workload.

**Backend Expectations:**
- Filter members by role (defaulting to KARIGAR for allocation screen)
- Calculate assignment statistics for each member:
  - Total assigned items
  - Pending items count
  - In-progress items count
  - Completed items count
- Support pagination for large member lists
- Support search by member name
- Include basic contact information
- Track last assignment date
- Optimize database queries for performance
- Cache results where appropriate

**Data Validation Rules:**
1. Assignment counts must be non-negative integers
2. Total must equal sum of pending + in_progress + completed
3. Status must be one of the defined values
4. Role must be a valid system role
5. Dates must be in ISO 8601 format

**Notes:**
- Response is paginated by default (10 items per page)
- Search is case-insensitive
- Last assigned date helps track member activity
- Contact information is included for quick reference
- Created date helps track member tenure

## Data Validation Rules

1. **Group Names:**
   - Required
   - Min length: 2 characters
   - Max length: 50 characters
   - Allowed characters: alphanumeric and spaces only

2. **Roles:**
   - Required for groups and members
   - Must be valid role IDs from the system
   - All members in a group must have the same role as the group
   - Supported roles: "Customer", "Supplier" (or as defined in the system)

3. **IDs:**
   - Must be valid strings
   - Non-empty

4. **Member Names:**
   - Required
   - Non-empty strings

## Notes

1. All timestamps are in ISO 8601 format
2. Group IDs for batch operations should be comma-separated strings
3. All responses include a `success` boolean flag
4. Success responses include relevant data and/or a success message
5. Error responses always include an error message 