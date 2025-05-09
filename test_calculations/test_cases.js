// Test Case 1: Basic Calculation
const testCase1 = {
    gross_weight: 100,
    less_weight: 10,
    tounch: 80,
    wastage: 2,
    rate: 5000,
    making_type: { value: "PG" }, // Per Gram
    making_charge: 500,
    charges_json: [
        { name: "Polish Charge", amount: "1000" }
    ],
    tax_json: [
        { name: "GST", amount: "3" }
    ]
};

// Expected calculations for Test Case 1
const calculations1 = {
    // 1. Net Weight
    net_weight: testCase1.gross_weight - testCase1.less_weight,
    // Should be: 100 - 10 = 90 grams

    // 2. Fine Weight
    fine_weight: 90 * ((80 + 2) / 100),
    // Should be: 90 * (82/100) = 73.8 grams

    // 3. Metal Value
    metal_value: 73.8 * 5000,
    // Should be: 73.8 * 5000 = 369,000

    // 4. Making Charges (Per Gram)
    making_charges: 90 * 500,
    // Should be: 90 * 500 = 45,000

    // 5. Total Charges
    total_charges: 1000,
    // Should be: 1000 (from charges_json)

    // 6. Base Price
    base_price: 369000 + 45000 + 1000,
    // Should be: 369,000 + 45,000 + 1,000 = 415,000

    // 7. Tax Amount (3%)
    tax_amount: 415000 * (3/100),
    // Should be: 415,000 * 0.03 = 12,450

    // 8. Final Price
    final_price: 415000 + 12450
    // Should be: 415,000 + 12,450 = 427,450
};

// Test Case 2: Per Piece Making Charge
const testCase2 = {
    gross_weight: 50,
    less_weight: 5,
    tounch: 92,
    wastage: 1.5,
    rate: 6000,
    making_type: { value: "PP" }, // Per Piece
    making_charge: 2500,
    charges_json: [
        { name: "Polish", amount: "500" },
        { name: "Stone Setting", amount: "1500" }
    ],
    tax_json: [
        { name: "GST", amount: "3" },
        { name: "Other Tax", amount: "2" }
    ]
};

// Expected calculations for Test Case 2
const calculations2 = {
    // 1. Net Weight
    net_weight: testCase2.gross_weight - testCase2.less_weight,
    // Should be: 50 - 5 = 45 grams

    // 2. Fine Weight
    fine_weight: 45 * ((92 + 1.5) / 100),
    // Should be: 45 * (93.5/100) = 42.075 grams

    // 3. Metal Value
    metal_value: 42.075 * 6000,
    // Should be: 42.075 * 6000 = 252,450

    // 4. Making Charges (Per Piece)
    making_charges: 2500,
    // Should be: 2500 (flat rate per piece)

    // 5. Total Charges
    total_charges: 500 + 1500,
    // Should be: 500 + 1500 = 2000

    // 6. Base Price
    base_price: 252450 + 2500 + 2000,
    // Should be: 252,450 + 2,500 + 2,000 = 256,950

    // 7. Tax Amount (5% total - 3% GST + 2% Other)
    tax_amount: 256950 * (5/100),
    // Should be: 256,950 * 0.05 = 12,847.50

    // 8. Final Price
    final_price: 256950 + 12847.50
    // Should be: 256,950 + 12,847.50 = 269,797.50
};

// Function to run tests and compare with actual calculations
function verifyCalculations(testCase, expected) {
    console.log("Testing calculations...");
    
    // 1. Net Weight
    const actualNetWeight = Number(testCase.gross_weight) - Number(testCase.less_weight);
    console.log("Net Weight:", actualNetWeight === expected.net_weight ? "✓" : "✗");
    console.log(`Expected: ${expected.net_weight}, Got: ${actualNetWeight}`);

    // 2. Fine Weight
    const actualFineWeight = actualNetWeight * ((Number(testCase.tounch) + Number(testCase.wastage)) / 100);
    console.log("Fine Weight:", Math.abs(actualFineWeight - expected.fine_weight) < 0.01 ? "✓" : "✗");
    console.log(`Expected: ${expected.fine_weight}, Got: ${actualFineWeight}`);

    // 3. Metal Value
    const actualMetalValue = actualFineWeight * testCase.rate;
    console.log("Metal Value:", Math.abs(actualMetalValue - expected.metal_value) < 0.01 ? "✓" : "✗");
    console.log(`Expected: ${expected.metal_value}, Got: ${actualMetalValue}`);

    // 4. Making Charges
    const actualMakingCharges = testCase.making_type.value === "PG" 
        ? actualNetWeight * testCase.making_charge
        : testCase.making_charge;
    console.log("Making Charges:", actualMakingCharges === expected.making_charges ? "✓" : "✗");
    console.log(`Expected: ${expected.making_charges}, Got: ${actualMakingCharges}`);

    // 5. Total Charges
    const actualTotalCharges = testCase.charges_json.reduce((sum, charge) => sum + Number(charge.amount), 0);
    console.log("Total Charges:", actualTotalCharges === expected.total_charges ? "✓" : "✗");
    console.log(`Expected: ${expected.total_charges}, Got: ${actualTotalCharges}`);

    // 6. Base Price
    const actualBasePrice = actualMetalValue + actualMakingCharges + actualTotalCharges;
    console.log("Base Price:", Math.abs(actualBasePrice - expected.base_price) < 0.01 ? "✓" : "✗");
    console.log(`Expected: ${expected.base_price}, Got: ${actualBasePrice}`);

    // 7. Tax Amount
    const totalTaxPercentage = testCase.tax_json.reduce((sum, tax) => sum + Number(tax.amount), 0);
    const actualTaxAmount = actualBasePrice * (totalTaxPercentage / 100);
    console.log("Tax Amount:", Math.abs(actualTaxAmount - expected.tax_amount) < 0.01 ? "✓" : "✗");
    console.log(`Expected: ${expected.tax_amount}, Got: ${actualTaxAmount}`);

    // 8. Final Price
    const actualFinalPrice = actualBasePrice + actualTaxAmount;
    console.log("Final Price:", Math.abs(actualFinalPrice - expected.final_price) < 0.01 ? "✓" : "✗");
    console.log(`Expected: ${expected.final_price}, Got: ${actualFinalPrice}`);
}

console.log("\nTest Case 1 - Per Gram Making Charge:");
console.log("=====================================");
verifyCalculations(testCase1, calculations1);

console.log("\nTest Case 2 - Per Piece Making Charge:");
console.log("=====================================");
verifyCalculations(testCase2, calculations2); 