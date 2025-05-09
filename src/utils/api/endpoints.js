export const BASE_URL = "https://app.theskillsocean.com";

// manage contacts
export const MANAGE_CONTACT_API = {
  cities: "/city",
  roles: "/get-role",
  summary: "/get-contact-detail-data",
  states: "/states",
  contacts: "/get-user-contact",
  create: "/create-user-contacts",
  update: "/update-user-contacts",
  delete: "/delete-user-contacts",
  history: "/get-user-history",
};

// manage groups api's
export const MANAGE_GROUPS_API = {
  fetch: "/groups/list",
  create: "/group/create",
  details: (id) => `/group/details/${id}`,
  manageContact: "/contacts/manage-groups",
  assignItem: "/groups/assign-item",
  memberProducts: (id) => `/members/${id}/assigned-products`,
  assignItems: "/groups/assign-items",
  memberAssignedItems: (id) => `/groups/members/${id}/assigned-items`,
  membersList: "/groups/members/stats"
};
 
// manage profile setting api's
export const MANAGE_PROFILE_API = {
  update: "/user-profile-update",
  fetch: "/get-user-profile",
};

// manage auth api's
export const MANAGE_AUTH_API = {
  signup: "/register",
  login: "/login",
};

// manage mpin api's
export const MANAGE_MPIN_API = {
  verify: "/mpin-login",
  update: "/set-mpin",
};

// manage home api's
export const MANAGE_HOME_API = {
  invoice: "/get-invoice-home",
  loan: "/get-loan-home",
};

// manage product api's
export const MANAGE_PRODUCT_API = {
  fetch: "/get-product",
  create: "/create-product",
  details: "/product-detail-by-id",
  update: "/update-product",
  stock: "/manage-stock",

  stocks: "/get-stock-transaction",

  groups: "/get-product-group",
  delete_group: "/delete-metal",
  update_group: "/metal-price-update",
  create_group: "/create-product-group",
  bulk_update: "/bulk-price-update",
};

// manage order/repair invoice api's
export const OR_INVOICE_API = {
  create: "/create",
  list: (id) => `/list/${id}`,
  update: (id) => `/update/${id}`,
  delete: (id) => `/delete/${id}`,
  listAll: "/invoice-list",
  pdf: (id) => `/order-invoice/${id}/pdf`
};

// manage inventory api's
export const MANAGE_INVENTORY_API = {
  list: "/inventory/list",
  details: "/inventory/details",
  create: "/inventory/create",
  update: "/inventory/update",
  delete: "/inventory/delete",
  updateStatus: "/inventory/status",
};

// manage metal rate api's
export const MANAGE_METAL_API = {
  fetch: "/get-metals",
  update: "/metal-price-update",
  variations: "/product-group-variations",
  delete_variant: "/delete-varient",
};

// manage invoice api's
export const MANAGE_INVOICE_API = {
  loan: "/add-loan",
  add: "/add-invoice",
  rate_cut: "/rate-cut",
  convert_to_metal: "/convert-to-metal",
  contact_invoice_history: "/user-contact-invoice-history",
  save_invoice: "/invoice/:invoiceId/pdf",
};

// manage loan api's
export const MANAGE_LOAN_API = {
  fetch: "/get-loans",
  freeze: "/freeze-loan",
  details: "/get-loans-by-id",
  contact_loans_history: "/get-loans-by-contact-id",
  get_interest_till_today: "/get-interest-till-today",
  create: "/api/add-loan",
  cash_transactions: (id) => `/get-loan-cash-transactions/${id}`,
  add_cash_transaction: "/add-loan-cash-transaction",
  interest_periods: (id) => `/loan/${id}/interest-periods`,
  get_freeze_periods: (id) => `/loan/${id}/freeze-periods`,
  get_transaction_history: (id) => `/loan/${id}/transaction-history/`,
  calculate_interest: "/calculate-loan-interest",
  get_loan_balance: (id) => `/loan/${id}/current-balance`,
  update_loan_balance: "/update-loan-balance"
};

// manage logs api's
export const MANAGE_LOGS_API = {
  fetch: "/logs/fetch",
  create: "/logs/create"
};

// manage bill api's
export const MANAGE_BILL_API = {
  billbyid: "/bill-detail-by-id",      // for fetching bill details
  billupdate: "/update-bill",          // for updating bills
  pdf: (id) => `/api/invoice/${id}/pdf`    // for fetching PDF
};
