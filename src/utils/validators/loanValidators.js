/**
 * Loan validators to ensure API request data is valid
 */

/**
 * Validates create loan form data
 * @param {Object} formData - The loan form data
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateCreateLoan = (formData) => {
  const errors = {};
  
  // Required fields validation
  if (!formData.user_contact_id) {
    errors.user_contact_id = "Customer is required";
  }
  
  if (!formData.valuation_amount) {
    errors.valuation_amount = "Valuation amount is required";
  }
  
  if (!formData.interest_type) {
    errors.interest_type = "Interest type is required";
  }
  
  if (!formData.interest_rate) {
    errors.interest_rate = "Interest rate is required";
  }
  
  if (!formData.interest_upto) {
    errors.interest_upto = "Interest end date is required";
  }
  
  if (!formData.interest_amount) {
    errors.interest_amount = "Interest amount is required";
  }
  
  if (!formData.item || !Array.isArray(formData.item) || formData.item.length === 0) {
    errors.item = "At least one item is required";
  }
  
  // Data type validations
  if (formData.valuation_amount && isNaN(Number(formData.valuation_amount))) {
    errors.valuation_amount = "Valuation amount must be a number";
  }
  
  if (formData.interest_rate && isNaN(Number(formData.interest_rate))) {
    errors.interest_rate = "Interest rate must be a number";
  }
  
  if (formData.interest_amount && isNaN(Number(formData.interest_amount))) {
    errors.interest_amount = "Interest amount must be a number";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates freeze loan form data
 * @param {Object} formData - The freeze loan form data
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateFreezeLoan = (formData) => {
  const errors = {};
  
  // Required fields validation
  if (!formData.loan_id) {
    errors.loan_id = "Loan ID is required";
  }
  
  if (!formData.new_amount) {
    errors.new_amount = "New amount is required";
  }
  
  if (!formData.new_amount_type) {
    errors.new_amount_type = "Amount type is required";
  }
  
  if (!formData.interest_upto) {
    errors.interest_upto = "Interest date is required";
  }
  
  // Data type validations
  if (formData.new_amount && isNaN(Number(formData.new_amount))) {
    errors.new_amount = "New amount must be a number";
  }
  
  if (formData.current_period_interest && isNaN(Number(formData.current_period_interest))) {
    errors.current_period_interest = "Interest amount must be a number";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates cash transaction form data
 * @param {Object} formData - The cash transaction form data
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateCashTransaction = (formData) => {
  const errors = {};
  
  // Required fields validation
  if (!formData.loan_id) {
    errors.loan_id = "Loan ID is required";
  }
  
  if (!formData.amount) {
    errors.amount = "Amount is required";
  }
  
  if (!formData.type) {
    errors.type = "Transaction type is required";
  }
  
  if (!formData.date) {
    errors.date = "Transaction date is required";
  }
  
  // Data type validations
  if (formData.amount && isNaN(Number(formData.amount))) {
    errors.amount = "Amount must be a number";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 