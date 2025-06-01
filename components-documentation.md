# Jewellery Bills Application - Components Documentation

This document provides an overview of all components in the src directory, their purpose, and functionality.

## Main Components

### BottomBar.jsx
- **Purpose**: Provides navigation to different invoice screens
- **Functionality**: Displays a bottom navigation bar with buttons for Sale, Purchase, Order, Repairing, Loan, and Products screens

### GeneratePDF.jsx
- **Purpose**: Generates PDF documents for invoices and bills
- **Functionality**: Converts React components to PDF format for printing or sharing invoices

### InventorySearch.jsx
- **Purpose**: Enables searching through inventory items
- **Functionality**: Provides search functionality with filters for jewelry inventory management

### InvoiceBill.jsx
- **Purpose**: Displays complete invoice details
- **Functionality**: Renders a comprehensive view of an invoice with all billing information

### InvoiceForm.jsx
- **Purpose**: Handles creation and editing of invoices
- **Functionality**: Form for inputting all invoice details including customer, items, and payment information

### LoanItemsList.jsx
- **Purpose**: Manages items given on loan
- **Functionality**: Displays and manages jewelry items provided on loan to customers

### ORInvoiceForm.jsx
- **Purpose**: Special form for Order-Related invoices
- **Functionality**: Dedicated form for creating and managing order invoices with specific fields

### PDFViewer.jsx
- **Purpose**: Displays PDF documents within the application
- **Functionality**: Renders PDF files with viewing controls for previewing generated invoices

### ProductBillPreview.jsx
- **Purpose**: Shows a preview of product bills before generation
- **Functionality**: Displays a preview of how the bill will look when generated

### ProductForm.jsx
- **Purpose**: Form for adding or editing products
- **Functionality**: Input form for product details including name, weight, price, and other attributes

### ProfessionalInvoiceBill.jsx
- **Purpose**: Generates professional-looking invoice bills
- **Functionality**: Creates formatted, business-style invoices with branding elements

### SimpleInvoiceBill.jsx
- **Purpose**: Generates simplified invoice bills
- **Functionality**: Creates basic invoices with essential information in a clean format

### SingleInvoiceForm.jsx
- **Purpose**: Form for creating single-item invoices
- **Functionality**: Streamlined form for quick creation of invoices with a single product

### TodayRates.jsx
- **Purpose**: Displays current metal rates
- **Functionality**: Shows up-to-date prices for gold, silver, and other metals

### TrackedTextInput.jsx
- **Purpose**: Text input with tracking capabilities
- **Functionality**: Enhanced text input component that tracks user input for analytics or validation

## Common Components

### Avatar.jsx
- **Purpose**: Displays user avatars
- **Functionality**: Shows user profile images with appropriate styling

### CustomCheck.jsx
- **Purpose**: Custom checkbox component
- **Functionality**: Styled checkbox for form inputs with customizable appearance

### DateTimePicker.jsx
- **Purpose**: Allows selection of dates and times
- **Functionality**: Date and time picker with calendar interface for form inputs

### DayAgo.jsx
- **Purpose**: Displays relative time information
- **Functionality**: Shows "X days ago" format for timestamps

### FilterByName.jsx
- **Purpose**: Filters lists by name
- **Functionality**: Provides search and filtering functionality for name-based lists

### ImagePicker.jsx
- **Purpose**: Allows selection of images
- **Functionality**: Component for uploading and selecting images for products or profiles

### InputBox.jsx
- **Purpose**: Enhanced input field
- **Functionality**: Customizable input component with validation and styling options

### Invoice.jsx
- **Purpose**: Base invoice component
- **Functionality**: Core component for rendering invoice data with customizable sections

### KeyboardHanlder.jsx
- **Purpose**: Manages keyboard interactions
- **Functionality**: Handles keyboard events and adjusts UI when keyboard is shown/hidden

### NoData.jsx
- **Purpose**: Placeholder for empty states
- **Functionality**: Displays a message when no data is available for a section

### OutlineInput.jsx
- **Purpose**: Input with outline styling
- **Functionality**: Text input with outline border and focus effects

### OverlayModal.jsx
- **Purpose**: Modal overlay component
- **Functionality**: Creates modals that overlay the main UI for focused interactions

### RadioButton.jsx
- **Purpose**: Custom radio button component
- **Functionality**: Styled radio button for selecting options in forms

### SectionHeader.jsx
- **Purpose**: Header for sections
- **Functionality**: Consistent heading style for different sections of the application

### SelectInput.jsx
- **Purpose**: Dropdown selection component
- **Functionality**: Allows selection from a list of options with dropdown interface

### ShowToast.jsx
- **Purpose**: Displays toast notifications
- **Functionality**: Shows temporary notification messages to the user

### ToggleSwicth.jsx
- **Purpose**: Toggle switch component
- **Functionality**: On/off switch for boolean settings or options

## Invoice Components

### AddItem.jsx
- **Purpose**: Adds items to invoices
- **Functionality**: Interface for adding new product items to an invoice

### AdditionalModal.jsx
- **Purpose**: Modal for additional invoice information
- **Functionality**: Allows entry of supplementary details for invoices

### PaymentModal.jsx
- **Purpose**: Handles payment information entry
- **Functionality**: Modal for adding payment details including method and amount

## Bills Components

### ProfessionalInvoiceBill.jsx (in bills directory)
- **Purpose**: Bill template for professional invoices
- **Functionality**: Specialized template for generating professional-looking jewelry invoices

## Screen Components

### Home Screens

#### HomeScreen (index.jsx)
- **Purpose**: Main dashboard of the application
- **Functionality**: Displays overview of recent activities, pending orders, and quick access to key features

#### Allocation
- **Purpose**: Manages allocation of jewelry items
- **Functionality**: Tracks and manages the allocation of items to different customers or departments

#### AllocationDetails
- **Purpose**: Shows detailed view of allocations
- **Functionality**: Provides comprehensive information about specific allocations

#### Repairing
- **Purpose**: Manages jewelry repair orders
- **Functionality**: Tracks and manages items that are under repair

#### RepairDetails
- **Purpose**: Shows detailed information about repairs
- **Functionality**: Displays comprehensive information about specific repair orders

### Bill Screens

#### SIScreen (Sale Invoice)
- **Purpose**: Manages sale invoices
- **Functionality**: Creates and lists invoices for jewelry sales

#### PIScreen (Purchase Invoice)
- **Purpose**: Manages purchase invoices
- **Functionality**: Creates and lists invoices for jewelry purchases

#### RIScreen (Repair Invoice)
- **Purpose**: Manages repair invoices
- **Functionality**: Creates and lists invoices for jewelry repairs

#### OIScreen (Order Invoice)
- **Purpose**: Manages order invoices
- **Functionality**: Creates and lists invoices for jewelry orders

#### LIScreen (Loan Invoice)
- **Purpose**: Manages loan invoices
- **Functionality**: Creates and lists invoices for loaned jewelry items

### Other Screens

#### MetalRates
- **Purpose**: Manages precious metal rates
- **Functionality**: Displays and updates current rates for gold, silver, and other metals

#### SettingScreen
- **Purpose**: Application settings management
- **Functionality**: Provides interface for configuring application preferences

#### UserScreen
- **Purpose**: User management
- **Functionality**: Lists and manages customer/client information

#### ProductScreen
- **Purpose**: Product management
- **Functionality**: Lists and manages jewelry inventory items

#### InventoryScreen
- **Purpose**: Inventory management
- **Functionality**: Comprehensive inventory tracking and management

#### GroupsScreen
- **Purpose**: Group management
- **Functionality**: Manages groups of products, customers, or other entities

#### AuthScreen
- **Purpose**: Authentication
- **Functionality**: Handles user login and authentication

#### WalkthroughScreen
- **Purpose**: Application introduction
- **Functionality**: Provides initial walkthrough for new users

## Utilities

### Logger.js
- **Purpose**: Application logging utility
- **Functionality**: Provides consistent logging functionality throughout the application

### auth.js
- **Purpose**: Authentication utilities
- **Functionality**: Contains functions for user authentication, login, and session management

### pdfGenerator.js
- **Purpose**: PDF generation utility
- **Functionality**: Handles the generation of PDF documents for invoices and reports

### API Utilities
- **Purpose**: API integration utilities
- **Functionality**: Manages API calls and responses for communication with backend services

### Validators
- **Purpose**: Form validation utilities
- **Functionality**: Provides validation functions for different form inputs and data types

## Hooks

### useTrackInput.js
- **Purpose**: Custom hook for tracking input
- **Functionality**: Tracks and manages input changes with additional functionality beyond standard form hooks

## Redux State Management

### Store
- **Purpose**: Central state management
- **Functionality**: Configures and initializes the Redux store for global state management

### Actions
- **Purpose**: Defines Redux actions
- **Functionality**: Contains action creators for modifying the application state

### Reducers
- **Purpose**: State transition logic
- **Functionality**: Contains logic for how state transitions in response to actions

### Slices
- **Purpose**: Redux Toolkit slices
- **Functionality**: Modern Redux state management using the Redux Toolkit slice pattern

### Middleware
- **Purpose**: Custom Redux middleware
- **Functionality**: Provides custom logic for processing actions before they reach reducers

## Navigation

### Navigations.jsx
- **Purpose**: Application navigation configuration
- **Functionality**: Sets up the navigation structure for the entire application, including stacks and tabs 