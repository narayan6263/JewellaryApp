// import React, { useState, useEffect, useCallback, Fragment } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { SafeAreaView, Text, TouchableOpacity, View, Modal, ScrollView } from "react-native";
// import InputBox from "./common/InputBox";
// import CommonButton from "./common/buttons/CommonButton";
// import SelectInput from "@/src/components/common/SelectInput";
// import ShowToast from "./common/ShowToast";
// import AntDesign from "@expo/vector-icons/AntDesign";
// import DatePickerComponent from "./common/DateTimePicker";
// import KeyboardHanlder from "./common/KeyboardHanlder";
// import SearchProduct from "../screens/products/components/SearchProduct";
// import moment from "moment";
// import { fetchContactList } from "../redux/actions/user.action";
// import { fetchProductGroups } from "../redux/actions/product.action";
// import SimpleReactValidator from "simple-react-validator";
// import ImagePickerComponent from "./common/ImagePicker";
// import { handleDigitsFix } from "../utils";
// import axios from "axios";
// import { getToken } from "../utils/api";
// import { BASE_URL, MANAGE_LOAN_API } from "../utils/api/endpoints";
// import SingleInvoiceForm from "./SingleInvoiceForm";
// import InvoiceBill from "./InvoiceBill";
// import ProfessionalInvoiceBill from "./ProfessionalInvoiceBill";
// import { Switch } from "react-native";
// import { FontAwesome6 } from "@expo/vector-icons";
// import OutlineInput from "./common/OutlineInput";
// import LoanItemsList from "./LoanItemsList";

// const InvoiceForm = (props) => {
//   const dispatch = useDispatch();
//   const [errors, setErrors] = useState({});
//   const { data, setData, handleNext } = props;
//   const validator = new SimpleReactValidator();
//   const [loading, setLoading] = useState(false);
//   const [previews, setPreviews] = useState([]);
//   const [invoices, setInvoices] = useState([
//     {
//       less_by_type: { label: "Weight", value: "weight" },
//       less_weight: "0",
//       loan_percentage: "0"
//     }
//   ]);
//   const [formValue, setFormValue] = useState({
//     photo: null,
//     valuation: "",
//     interest_rate: "",
//     interest_type: { label: "Flat", value: "2" },
//     interest_duration: { label: "1 Year", value: "12" },
//     start_date: moment().format('YYYY-MM-DD'),
//     next_calculation_date: moment().add(1, 'year').format('YYYY-MM-DD'),
//     selectedProduct: [],
//     totalPrice: "0",
//     interest_amount: "0",
//     dailyBreakdown: [],
//     selection_date: moment().format('YYYY-MM-DD'),
//     interest_upto: moment().add(1, 'year').format('YYYY-MM-DD'),
//     showChargesInBill: false,
//     showTaxInBill: false,
//     charges_json: [],
//     tax_json: [],
//     comment: "",
//     receipt_photo: null,
//     loan_amount: "0",
//     loan_percentage: "0"
//   });
//   const [modalState, setModalState] = useState({ datePicker: false, futureDatePicker: false, flatInterestDatePicker: false });
//   const { productGroups } = useSelector((state) => state.productSlices);
//   const [showNewInvoice, setShowNewInvoice] = useState(false);
//   const [showBill, setShowBill] = useState(false);
//   const [showFutureInterestTest, setShowFutureInterestTest] = useState(false);
//   const [futureDate, setFutureDate] = useState(null);
//   const [futureInterestResults, setFutureInterestResults] = useState(null);
//   const [showItemsList, setShowItemsList] = useState(false);

//   useEffect(() => {
//     dispatch(fetchContactList());
//     dispatch(fetchProductGroups());
//     // Calculate interest initially with default values
//     calculateAndSetInterest();
//   }, [dispatch]);

//   // handle product invoice change
//   const handleInvoiceChange = useCallback(
//     (index, name, value) => {
//       setInvoices((prev) => {
//         const updatedInvoices = [...prev];
//         const updatedInvoice = { ...updatedInvoices[index], [name]: value };

//         // If pieces are being updated, recalculate any labor charges
//         if (name === "piece") {
//           const pieces = Number(value || 0);
//           if (updatedInvoice.charges_json) {
//             updatedInvoice.charges_json = updatedInvoice.charges_json.map(charge => {
//               if (charge.name.toLowerCase().includes('labour') || charge.name.toLowerCase().includes('labor')) {
//                 const ratePerPiece = Number(charge.amount || 0);
//                 return {
//                   ...charge,
//                   calculatedAmount: (pieces * ratePerPiece).toString()
//                 };
//               }
//               return charge;
//             });
//           }
//         }

//         if (name === "hsn_id") {
//           const metalPrice = productGroups.find(
//             (item) => item.id == value.value
//           )?.price;
//           const isVariation = value?.variation?.length > 0;
//           updatedInvoice.rate = isVariation
//             ? {
//                 label: value?.variation?.[0]?.name,
//                 value: value?.variation?.[0]?.id,
//                 price: value?.variation?.[0]?.price,
//               }
//             : metalPrice || 0;
//         }

//         // If less_by_type changes, we need to recalculate the less_weight if it's percentage
//         if (name === "less_by_type" && value?.value === "percentage" && updatedInvoice.less_weight) {
//           const percentage = Number(updatedInvoice.less_weight || 0);
//           const lessWeightValue = (Number(updatedInvoice.gross_weight || 0) * percentage) / 100;
//           updatedInvoice.less_weight = lessWeightValue.toString();
//         }

//         // Calculate Net Weight
//         updatedInvoice.net_weight = handleDigitsFix(
//           Number(updatedInvoice.gross_weight || 0) - Number(updatedInvoice.less_weight || 0)
//         );

//         // Calculate Fine Weight immediately after net_weight
//         updatedInvoice.fine_weight = (
//           (Number(updatedInvoice.net_weight || 0) * 
//           Number(updatedInvoice.tounch || 0)) / 100
//         ).toFixed(3);

//         // Calculate valuation based on cutting state
//         const fine = Number(updatedInvoice.fine_weight || 0);
//         const currentRate = updatedInvoice?.rate?.price || updatedInvoice?.rate || 0;
        
//         updatedInvoice.valuation = !updatedInvoice.cutting_enabled 
//           ? "0" 
//           : handleDigitsFix(fine * currentRate);

//         // Initialize cutting_enabled if not present
//         if (typeof updatedInvoice.cutting_enabled === 'undefined') {
//           updatedInvoice.cutting_enabled = false;
//         }

//         // Calculate Making Charges (separate from valuation)
//         const makingCharges = Number(updatedInvoice.making_charge || 0) * Number(updatedInvoice.net_weight || 0);

//         // Calculate Additional Charges (separate from valuation)
//         const additionalCharges = Number(updatedInvoice.additional_charge || 0);

//         // Calculate Total Price (valuation + other charges)
//         const totalBeforeTax = updatedInvoice.valuation + makingCharges + additionalCharges;

//         // Calculate Tax Amount (if applicable)
//         const taxRate = Number(updatedInvoice.tax_rate || 0) / 100;
//         const taxAmount = totalBeforeTax * taxRate;

//         // Calculate Final Price (total price including all charges and tax)
//         updatedInvoice.net_price = handleDigitsFix(totalBeforeTax + taxAmount);

//         updatedInvoices[index] = updatedInvoice;
//         return updatedInvoices;
//       });
//     },
//     [productGroups]
//   );

//   // handle product detail
//   const handleProductDetail = useCallback(
//     (index, product) => {
//       setInvoices((prev) => {
//         const updatedInvoices = [...prev];
//         const hsnName = productGroups.find(
//           (item) => item?.id == product?.hsn_id
//         );
//         const variation = hsnName?.variation_data;
//         const isVariation = variation?.length > 0;

//         updatedInvoices[index] = {
//           ...updatedInvoices[index],
//           product_id: product.id,
//           name: product.name,
//           hsn_id: { label: hsnName?.name, value: hsnName?.id, variation },
//           rate: isVariation
//             ? {
//                 label: variation?.[0]?.name,
//                 value: variation?.[0]?.id,
//                 price: variation?.[0]?.price,
//               }
//             : hsnName?.price,
//         };
//         return updatedInvoices;
//       });
//     },
//     [productGroups]
//   );

//   // handle input change
//   const handleInputChange = useCallback((name, value) => {
//     setErrors((prev) => ({ ...prev, [name]: "" }));
//     setFormValue(prev => {
//       const newState = { ...prev, [name]: value };
      
//       // Recalculate valuation from all invoices
//       const totalValuation = invoices.reduce((sum, invoice) => {
//         return sum + Number(invoice.valuation || 0);
//       }, 0);
      
//       newState.valuation = totalValuation;
      
//       // Always recalculate interest when any relevant field changes
//       if (newState.interest_rate && newState.interest_type) {
//         const interestRate = parseFloat(newState.interest_rate) / 100;
//         const interestType = newState.interest_type.value;
//         let interestAmount = 0;
        
//         if (interestType === "2" && newState.interest_upto) { // Flat interest
//           const startDate = moment();
//           const endDate = moment(newState.interest_upto);
//           const yearsDecimal = endDate.diff(startDate, 'days') / 365;
          
//           let principal = Number(newState.loan_amount) > 0 
//             ? Number(newState.loan_amount)
//             : (Number(newState.valuation) * Number(newState.loan_percentage || 0)) / 100;
          
//           interestAmount = principal * interestRate * yearsDecimal;
//         } else if (interestType === "1") { // Compound interest
//           const durationInMonths = parseInt(newState.interest_duration?.value || "12");
//           const monthlyRate = interestRate / 12;
//           const principal = Number(newState.loan_amount || 0);
          
//           const finalAmount = principal * Math.pow(1 + monthlyRate, durationInMonths);
//           interestAmount = finalAmount - principal;
//         }
        
//         newState.interest_amount = handleDigitsFix(interestAmount);
//       }
      
//       return newState;
//     });
//   }, [invoices]);

//   // handle modal state
//   const handleModalState = useCallback((name, value) => {
//     setModalState((prevState) => ({ ...prevState, [name]: value }));
//   }, []);

//   // handle calculate interest rate
//   const calculateAndSetInterest = useCallback(() => {
//     if (
//       (!formValue?.interest_duration && formValue?.interest_type?.value === "1") ||
//       (!formValue?.interest_upto && formValue?.interest_type?.value === "2") ||
//       !formValue?.interest_rate ||
//       !formValue?.interest_type
//     ) {
//       return;
//     }

//     const interestRate = parseFloat(formValue?.interest_rate || 0) / 100;
//     const interestType = formValue?.interest_type?.value;
    
//     let interestAmount = 0;
//     let dailyBreakdown = [];

//     if (formValue?.interest_duration?.value === "daily") {
//       if (!formValue?.interest_upto) return;

//       const startDate = moment();
//       const endDate = moment(formValue.interest_upto);
      
//       // Validate that end date is after start date
//       if (endDate.isSameOrBefore(startDate)) {
//         setFormValue((prev) => ({
//           ...prev,
//           interest_amount: "0",
//           dailyBreakdown: []
//         }));
//         return;
//       }
      
//       const totalDays = endDate.diff(startDate, 'days');
      
//       // Daily interest rate (2% per month / 30 days)
//       const dailyRate = interestRate / 30;
      
//       let runningTotal = Number(formValue.loan_amount || 0);
      
//       // Calculate compound interest for each day
//       for (let day = 1; day <= totalDays; day++) {
//         const dailyInterest = runningTotal * dailyRate;
//         runningTotal += dailyInterest;
        
//         dailyBreakdown.push({
//           day: day,
//           date: moment(startDate).add(day, 'days').format('DD MMM YYYY'),
//           principal: runningTotal - dailyInterest,
//           interest: dailyInterest,
//           total: runningTotal
//         });
//       }
      
//       interestAmount = runningTotal - Number(formValue.loan_amount || 0);
      
//     } else if (interestType === "2") {
//       // Flat interest calculation based on selected date
//       if (!formValue?.interest_upto) return;
      
//       const startDate = moment();
//       const endDate = moment(formValue.interest_upto);
      
//       // Validate that end date is after start date
//       if (endDate.isSameOrBefore(startDate)) {
//         setFormValue((prev) => ({
//           ...prev,
//           interest_amount: "0"
//         }));
//         return;
//       }
      
//       const yearsDecimal = endDate.diff(startDate, 'days') / 365; // Calculate years as decimal
      
//       // Calculate principal based on either loan_amount or loan_percentage
//       let principal = 0;
//       if (Number(formValue.loan_amount) > 0) {
//         principal = Number(formValue.loan_amount);
//       } else {
//         principal = (Number(formValue.valuation || 0) * Number(formValue.loan_percentage || 0)) / 100;
//       }
      
//       // Calculate interest: Principal x interest % x time period in years
//       interestAmount = principal * interestRate * yearsDecimal;
      
//     } else if (interestType === "1") {
//       const durationInMonths = parseInt(formValue?.interest_duration?.value || "12");
//       const monthlyRate = interestRate / 12;  // Convert annual rate to monthly rate
//       const principal = Number(formValue.loan_amount || 0);
      
//       // Use monthly compound interest formula: P(1 + r/12)^(t*12)
//       const finalAmount = principal * Math.pow(1 + monthlyRate, durationInMonths);
//       interestAmount = finalAmount - principal;
//     }

//     setFormValue((prev) => ({
//       ...prev,
//       interest_amount: handleDigitsFix(interestAmount),
//       dailyBreakdown: dailyBreakdown
//     }));
//   }, [formValue]);

//   // Update this to track initial selection
//   const handleInterestDurationChange = useCallback((value) => {
//     const today = moment().format('YYYY-MM-DD');
//     handleInputChange("interest_duration", value);
    
//     // Set selection date to track initial selection
//     setFormValue(prev => ({
//       ...prev,
//       interest_duration: value,
//       selection_date: today
//     }));
//   }, [handleInputChange]);

//   const totalGrossWeight = invoices.reduce(
//     (total, invoice) => total + parseFloat(invoice.gross_weight || 0),
//     0
//   );

//   const totalFineWeight = invoices.reduce(
//     (total, invoice) => total + parseFloat(invoice.fine_weight || 0),
//     0
//   );

//   const currentBalance = invoices.reduce(
//     (total, invoice) => total + parseFloat(invoice.net_price || 0),
//     0
//   );

//   // Add these new calculations at the top with other calculations
//   const goldInvoices = invoices.filter(invoice => invoice?.hsn_id?.label?.toLowerCase().includes('gold'));
//   const silverInvoices = invoices.filter(invoice => invoice?.hsn_id?.label?.toLowerCase().includes('silver'));

//   const goldCalculations = {
//     grossWeight: goldInvoices.reduce((total, invoice) => total + parseFloat(invoice.gross_weight || 0), 0),
//     fineWeight: goldInvoices.reduce((total, invoice) => total + parseFloat(invoice.fine_weight || 0), 0),
//     value: goldInvoices.reduce((total, invoice) => {
//       const fine = parseFloat(invoice.fine_weight || 0);
//       const rate = Number(invoice?.rate?.price || invoice?.rate || 0);
//       return total + ((fine / 100) * rate);
//     }, 0)
//   };

//   const silverCalculations = {
//     grossWeight: silverInvoices.reduce((total, invoice) => total + parseFloat(invoice.gross_weight || 0), 0),
//     fineWeight: silverInvoices.reduce((total, invoice) => total + parseFloat(invoice.fine_weight || 0), 0),
//     value: silverInvoices.reduce((total, invoice) => {
//       const fine = parseFloat(invoice.fine_weight || 0);
//       const rate = Number(invoice?.rate?.price || invoice?.rate || 0);
//       return total + ((fine / 100) * rate);
//     }, 0)
//   };

//   const handleSubmitInvoice = async () => {
//     if (!formValue?.selectedProduct?.length) {
//       alert("Please add at least one item");
//       return;
//     }

//     // Add validation for user_contact_id
//     if (!data?.user_contact_id && !formValue?.user_contact_id) {
//       ShowToast("Please select a contact first");
//       return;
//     }

//     if (validator.allValid() && invoices.length > 0) {
//       const formData = new FormData();

//       // Use either data.user_contact_id or formValue.user_contact_id, ensuring one exists
//       const contactId = data?.user_contact_id || formValue?.user_contact_id;
//       formData.append("user_contact_id", contactId);
      
//       // Append other fields
//       formData.append("valuation_amount", currentBalance);
//       formData.append("loan_amount", formValue.loan_amount || "0");
//       formData.append("interest_type", formValue?.interest_type?.value);
//       formData.append("interest_rate", formValue.interest_rate);
//       formData.append(
//         "interest_upto",
//         moment(formValue.interest_upto).format("YYYY-MM-DD")
//       );
//       formData.append("interest_amount", formValue.interest_amount);

//       // Append order photo if available
//       if (formValue.photo) {
//         formData.append("order_photo", {
//           uri: formValue.photo.uri,
//           name: formValue.photo.uri.split('/').pop(),
//           type: formValue.photo.type || 'image/jpeg',
//         });
//       }

//       // Append invoices
//       invoices.forEach((invoice, index) => {
//         const isSelectRate = invoice?.hsn_id?.variation?.length > 0;

//         // Append images
//         if (invoice.image) {
//           formData.append(`image${index}`, {
//             uri: invoice?.image?.uri,
//             name: invoice?.image?.fileName,
//             type: invoice?.image?.mimeType || "image/jpeg",
//           });
//         }

//         // Remove the image from the invoice
//         delete invoice.image;

//         // Rewrite hsn value
//         invoice.hsn_id = invoice?.hsn_id?.value;
//         invoice.rate = isSelectRate ? invoice?.rate?.price : invoice?.rate;
//       });

//       formData.append("item", JSON.stringify(invoices));

//       const accessToken = await getToken();

//       setLoading(true);
//       try {
//         const response = await axios.post(
//           `${BASE_URL}${MANAGE_LOAN_API.create}`,
//           formData,
//           {
//             headers: {
//               Authorization: `Bearer ${accessToken?.token}`,
//               "Content-Type": "multipart/form-data",
//             },
//           }
//         );
//         setData((prev) => ({ ...prev }));
//         handleNext();
//         setLoading(false);
//         return response.data;
//       } catch (error) {
//         setLoading(false);
//         console.error("Full Error:", error);
//         console.error("Error Config:", error.config);
//         console.error("Error Response:", error.response);
//         console.error("Error Request:", error.request);
//         console.error("Error Message:", error.message);
//         throw error;
//       }
//     } else {
//       console.error("Validation Errors:", validator.errorMessages);
//       setErrors(validator.errorMessages);
//     }
//   };

//   // Add handler for new invoice
//   const handleNewInvoice = (newInvoice) => {
//     setInvoices(prev => [...prev, newInvoice]);
//     setShowNewInvoice(false);
//   };

//   useEffect(() => {
//     calculateAndSetInterest();
//   }, [
//     currentBalance,
//     formValue?.interest_upto,
//     formValue?.interest_rate,
//     formValue?.interest_type,
//     formValue?.interest_duration,
//   ]);

//   // Add this function to calculate future interest
//   const calculateFutureInterest = (selectedDate) => {
//     if (!selectedDate) return;

//     const startDate = moment();
//     const endDate = moment(selectedDate);
//     const totalDays = endDate.diff(startDate, 'days');
    
//     const balance = Number(currentBalance || 0);
//     const interestRate = Number(formValue?.interest_rate || 0) / 100;
//     const interestType = formValue?.interest_type?.value;
    
//     let results = {
//       startDate: startDate.format('DD MMM YYYY'),
//       endDate: endDate.format('DD MMM YYYY'),
//       totalDays,
//       originalAmount: balance,
//       interestType: formValue?.interest_type?.label,
//       interestRate: formValue?.interest_rate + '%',
//       breakdown: []
//     };

//     let finalAmount = balance;
    
//     if (interestType === "1") { // Compound Interest
//       // Calculate monthly compounding
//       const months = endDate.diff(startDate, 'months');
//       for (let i = 1; i <= months; i++) {
//         const monthDate = startDate.clone().add(i, 'months');
//         const monthlyInterest = finalAmount * (interestRate / 12);
//         finalAmount += monthlyInterest;
        
//         results.breakdown.push({
//           date: monthDate.format('DD MMM YYYY'),
//           principal: finalAmount - monthlyInterest,
//           interest: monthlyInterest,
//           total: finalAmount
//         });
//       }
//     } else { // Flat Interest
//       const years = totalDays / 365;
//       const totalInterest = balance * interestRate * years;
//       finalAmount = balance + totalInterest;
      
//       // Create quarterly breakdown
//       for (let i = 1; i <= Math.ceil(years * 4); i++) {
//         const quarterDate = startDate.clone().add(i * 3, 'months');
//         if (quarterDate.isAfter(endDate)) break;
        
//         const quarterlyInterest = totalInterest / (Math.ceil(years * 4));
//         results.breakdown.push({
//           date: quarterDate.format('DD MMM YYYY'),
//           principal: balance,
//           interest: quarterlyInterest,
//           total: balance + (quarterlyInterest * i)
//         });
//       }
//     }
    
//     results.totalInterest = finalAmount - balance;
//     results.finalAmount = finalAmount;
    
//     setFutureInterestResults(results);
//   };

//   // Add this modal component for future interest testing
//   const FutureInterestTestModal = () => (
//     <Modal
//       visible={showFutureInterestTest}
//       animationType="slide"
//       onRequestClose={() => setShowFutureInterestTest(false)}
//     >
//       <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
//         <View className="flex-row justify-between items-center p-4 bg-primary">
//           <TouchableOpacity onPress={() => setShowFutureInterestTest(false)}>
//             <AntDesign name="close" size={24} color="white" />
//           </TouchableOpacity>
//           <Text className="text-white text-lg font-semibold">Test Future Interest</Text>
//           <View style={{ width: 24 }} />
//         </View>
        
//         <ScrollView className="p-4">
//           <View className="mb-6">
//             <Text className="text-gray-6 text-xs tracking-wider pb-1">Select Future Date</Text>
//             <TouchableOpacity
//               onPress={() => handleModalState("futureDatePicker", true)}
//               className="items-center px-2 py-3 rounded-lg border-gray-5 border flex flex-row justify-between"
//             >
//               <Text>{futureDate ? moment(futureDate).format('DD MMM YYYY') : 'Select Date'}</Text>
//               <DatePickerComponent
//                 name="futureDate"
//                 open={modalState.futureDatePicker}
//                 value={futureDate}
//                 handleClose={() => handleModalState("futureDatePicker", false)}
//                 onSelect={({ value }) => {
//                   setFutureDate(value);
//                   handleModalState("futureDatePicker", false);
//                   calculateFutureInterest(value);
//                 }}
//               />
//             </TouchableOpacity>
//           </View>

//           {futureInterestResults && (
//             <View className="bg-gray-50 rounded-lg p-4">
//               <View className="mb-4 border-b border-gray-200 pb-4">
//                 <Text className="text-lg font-semibold mb-2">Summary</Text>
//                 <Text>Period: {futureInterestResults.startDate} to {futureInterestResults.endDate}</Text>
//                 <Text>Days: {futureInterestResults.totalDays}</Text>
//                 <Text>Interest Type: {futureInterestResults.interestType}</Text>
//                 <Text>Interest Rate: {futureInterestResults.interestRate}</Text>
//               </View>

//               <View className="mb-4 border-b border-gray-200 pb-4">
//                 <Text className="text-lg font-semibold mb-2">Totals</Text>
//                 <Text>Principal Amount: ₹{handleDigitsFix(futureInterestResults.originalAmount)}</Text>
//                 <Text>Total Interest: ₹{handleDigitsFix(futureInterestResults.totalInterest)}</Text>
//                 <Text className="text-lg font-bold mt-2">
//                   Final Amount: ₹{handleDigitsFix(futureInterestResults.finalAmount)}
//                 </Text>
//               </View>

//               <View>
//                 <Text className="text-lg font-semibold mb-2">Breakdown</Text>
//                 <ScrollView style={{ maxHeight: 300 }}>
//                   {futureInterestResults.breakdown.map((item, index) => (
//                     <View key={index} className="flex-row justify-between py-2 border-b border-gray-100">
//                       <Text className="text-sm">{item.date}</Text>
//                       <View>
//                         <Text className="text-sm text-right">
//                           Principal: ₹{handleDigitsFix(item.principal)}
//                         </Text>
//                         <Text className="text-sm text-right text-green-600">
//                           +₹{handleDigitsFix(item.interest)} interest
//                         </Text>
//                         <Text className="text-sm font-bold text-right">
//                           Total: ₹{handleDigitsFix(item.total)}
//                         </Text>
//                       </View>
//                     </View>
//                   ))}
//                 </ScrollView>
//               </View>
//             </View>
//           )}
//         </ScrollView>
//       </SafeAreaView>
//     </Modal>
//   );

//   // Modify handleAddProduct to properly pass data
//   const handleAddProduct = useCallback(() => {
//     const currentInvoice = invoices[invoices.length - 1];

//     // Create new product object
//     const newProduct = {
//       name: currentInvoice.name || "New Item",
//       huid: currentInvoice.huid || "",
//       size: currentInvoice.size || "",
//       hsn_id: currentInvoice.hsn_id || null,
//       comment: currentInvoice.comment || "",
//       piece: currentInvoice.piece || "0",
//       gross_weight: currentInvoice.gross_weight || "0",
//       less_weight: currentInvoice.less_weight || "0",
//       net_weight: currentInvoice.net_weight || "0",
//       tounch: currentInvoice.tounch || "0",
//       fine_weight: currentInvoice.fine_weight || "0",
//       rate: typeof currentInvoice.rate === 'object' ? currentInvoice.rate.price : currentInvoice.rate || "0",
//       cutting_enabled: currentInvoice.cutting_enabled || false,
//       valuation: currentInvoice.valuation || "0",
//       making_charge: currentInvoice.making_charge || "0",
//       charges_json: currentInvoice.charges_json || [],
//       tax_json: currentInvoice.tax_json || [],
//       net_price: currentInvoice.net_price || "0",
//       product_id: Math.random().toString(36).substring(2, 9)
//     };

//     // Get existing products or initialize empty array
//     const existingProducts = formValue?.selectedProduct || [];

//     // Create updated form value with new product
//     const updatedFormValue = {
//       ...formValue,
//       selectedProduct: [...existingProducts, newProduct],
//       totalPrice: handleDigitsFix(
//         existingProducts.reduce((sum, item) => sum + Number(item.net_price || 0), 0) + 
//         Number(newProduct.net_price || 0)
//       ),
//       valuation: handleDigitsFix(
//         existingProducts.reduce((sum, item) => sum + Number(item.valuation || 0), 0) + 
//         Number(newProduct.valuation || 0)
//       )
//     };

//     // Update local state
//     setFormValue(updatedFormValue);

//     // Reset the invoice form
//     setInvoices([{
//       less_by_type: { label: "Weight", value: "weight" },
//       less_weight: "0",
//       loan_percentage: "0"
//     }]);

//     // Navigate to LoanItemsList with updated data
//     props.navigation.navigate("LoanItemsList", {
//       formValue: updatedFormValue,
//       setFormValue: (newValue) => {
//         console.log("Updating form value:", newValue);
//         setFormValue(newValue);
//       }
//     });
//   }, [invoices, formValue, props.navigation]);

//   // Add useEffect to handle form value updates from route params
//   useEffect(() => {
//     if (props.route?.params?.formValue) {
//       console.log("Received form value from route:", props.route.params.formValue);
//       setFormValue(props.route.params.formValue);
//     }
//   }, [props.route?.params?.formValue]);

//   // Update handleLoanAmountChange to trigger interest recalculation
//   const handleLoanAmountChange = useCallback(({ name, value }) => {
//     setFormValue(prev => {
//       const updatedForm = { ...prev };

//       if (name === 'loan_amount') {
//         // If loan amount is entered, set it directly as loan by valuation
//         updatedForm.loan_amount = value;
//         updatedForm.loan_by_valuation = value;
//         // Reset loan percentage since we're using direct amount
//         updatedForm.loan_percentage = "0";
//       } else if (name === 'loan_percentage') {
//         // If loan percentage is entered, calculate loan by valuation based on percentage
//         updatedForm.loan_percentage = value;
//         // Use the correct formula: Valuation * (Loan percentage/100)
//         const totalValuation = invoices.reduce(
//           (total, invoice) => total + Number(invoice.valuation || 0),
//           0
//         );
//         updatedForm.loan_by_valuation = handleDigitsFix(
//           totalValuation * (Number(value || 0) / 100)
//         );
//         // Reset loan amount since we're using percentage
//         updatedForm.loan_amount = "0";
//       }

//       // Trigger interest calculation in the next tick
//       setTimeout(() => calculateAndSetInterest(), 0);

//       return updatedForm;
//     });
//   }, [invoices, calculateAndSetInterest]);

//   return (
//     <Fragment>
//       <KeyboardHanlder>
//         {/* header section */}
//         <View className="bg-primary/10 px-5 py-3">
//           {/* Gold Section */}
//           <View className="mb-4">
//             <Text className="text-xs font-semibold text-yellow-600 mb-1">Gold</Text>
//             <View className="flex pt-1 flex-row justify-between border-b border-yellow-200 pb-2">
//             <View>
//               <Text className="font-semibold tracking-wide">
//                   {handleDigitsFix(goldCalculations.grossWeight)} g
//               </Text>
//               <Text className="tracking-wide">Gross Weight</Text>
//             </View>
//             <View>
//               <Text className="font-semibold tracking-wide">
//                   {handleDigitsFix(goldCalculations.fineWeight)} g
//               </Text>
//               <Text className="tracking-wide">Fine Weight</Text>
//             </View>
//             <View className="flex">
//               <Text className="font-semibold tracking-wide">
//                   ₹{handleDigitsFix(goldCalculations.value)}
//               </Text>
//                 <Text className="tracking-wide">Value</Text>
//             </View>
//             </View>
//           </View>

//           {/* Silver Section */}
//           <View>
//             <Text className="text-xs font-semibold text-gray-400 mb-1">Silver</Text>
//             <View className="flex pt-1 flex-row justify-between">
//               <View>
//                 <Text className="font-semibold tracking-wide">
//                   {handleDigitsFix(silverCalculations.grossWeight)} g
//                 </Text>
//                 <Text className="tracking-wide">Gross Weight</Text>
//               </View>
//               <View>
//                 <Text className="font-semibold tracking-wide">
//                   {handleDigitsFix(silverCalculations.fineWeight)} g
//                 </Text>
//                 <Text className="tracking-wide">Fine Weight</Text>
//               </View>
//               <View className="flex">
//                 <Text className="font-semibold tracking-wide">
//                   ₹{handleDigitsFix(silverCalculations.value)}
//               </Text>
//                 <Text className="tracking-wide">Value</Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Valuation, Total Interest, and Total Amount in horizontal layout */}
//         <View className="px-4 pt-2.5 pb-4 flex-row justify-between">
//           <View className="flex-1 pr-2">
//             <InputBox
//               name="valuation"
//               placeholder="Calculated value"
//               label="Valuation"
//               value={handleDigitsFix(invoices.reduce(
//                 (total, invoice) => total + parseFloat(invoice.valuation || 0),
//                 0
//               ))}
//               keyboardType="numeric"
//               readOnly={true}
//               customBorder={true}
//             />
//           </View>

//           <View className="flex-1 px-2">
//             <InputBox
//               name="total_interest"
//               placeholder="Total interest"
//               label="Total Interest"
//               value={handleDigitsFix(Number(formValue?.interest_amount || 0) + Number(formValue?.loan_amount || 0))}
//               keyboardType="numeric"
//               readOnly={true}
//               customBorder={true}
//             />
//           </View>

//           <View className="flex-1 pl-2">
//             <InputBox
//               name="total_amount"
//               placeholder="Total amount"
//               label="Total Amount"
//               value={handleDigitsFix((Number(formValue.valuation || 0) * Number(formValue.loan_percentage || 0)) / 100 + Number(formValue?.interest_amount || 0))}
//               keyboardType="numeric"
//               readOnly={true}
//               customBorder={true}
//             />
//           </View>
//         </View>

//         {/* Order Photo Upload */}
//         <View className="px-4 pt-2.5 pb-4">
//           <Text className="text-slate-500 text-[13px] mb-1">Order Photo</Text>
//           <View className="flex flex-row">
//             <ImagePickerComponent
//               onChange={({ value }) => handleInputChange("photo", value)}
//               value={formValue.photo}
//               name="photo"
//             />
//             <Text className="ml-3 text-gray-500 self-center">Upload a photo of the order</Text>
//           </View>
//         </View>

//         {/* select items */}
//         <View>
//           {invoices.map((invoice, index) => {
//             const isSelectRate = invoice?.hsn_id?.variation?.length > 0;
//             return (
//               <View
//                 key={index}
//                 className={`px-4 pt-2.5 pb-4 ${
//                   index % 2 !== 0 && "bg-gray-50"
//                 }`}
//               >
//                 {/* image & product name */}
//                 <View className="flex items-start flex-row">
//                   <ImagePickerComponent
//                     onChange={({ value }) =>
//                       handleInvoiceChange(index, "image", value)
//                     }
//                     value={invoice?.image}
//                     name="image"
//                   />
//                   <View className="w-5/6 pl-3">
//                     <SearchProduct
//                       productValue={invoice}
//                       setProductValue={(event) =>
//                         handleInvoiceChange(index, "name", event?.name)
//                       }
//                       handleProductDetail={(data) =>
//                         handleProductDetail(index, data)
//                       }
//                     />
//                   </View>
//                 </View>

//                 {/* hsn, gross, tounch */}
//                 <View className="mb-4 flex flex-row">
//                   <View className="w-1/3 pr-1">
//                     <SelectInput
//                       label="HSN Name"
//                       name="hsn_id"
//                       value={invoice.hsn_id}
//                       placeholder="Select"
//                       data={productGroups.map((item) => ({
//                         label: item.name,
//                         value: item.id,
//                         variation: item.variation_data,
//                       }))}
//                       onSelect={(value) =>
//                         handleInvoiceChange(index, "hsn_id", value)
//                       }
//                     />
//                   </View>
//                   <View className="w-1/3 px-1">
//                     <InputBox
//                       name="gross_weight"
//                       placeholder="0"
//                       label="Gross Weight"
//                       value={invoice.gross_weight}
//                       keyboardType="numeric"
//                       onChange={({ value }) =>
//                         handleInvoiceChange(index, "gross_weight", value)
//                       }
//                     />
//                   </View>
//                   <View className="w-1/3 pl-1">
//                     <InputBox
//                       name="tounch"
//                       placeholder="0 %"
//                       label="Tounch (in %)"
//                       value={invoice.tounch}
//                       keyboardType="numeric"
//                       onChange={({ value }) =>
//                         handleInvoiceChange(index, "tounch", value)
//                       }
//                     />
//                   </View>
//                 </View>

//                 {/* Adding new row for Less By and Less Weight */}
//                 <View className="mb-4 flex flex-row">
//                   <View className="w-1/3 pr-1">
//                     <SelectInput
//                       label="Less By"
//                       name="less_by_type"
//                       value={invoice.less_by_type}
//                       placeholder="Select"
//                       data={[
//                         { label: "Percentage", value: "percentage" },
//                         { label: "Weight", value: "weight" },
//                       ]}
//                       onSelect={(value) =>
//                         handleInvoiceChange(index, "less_by_type", value)
//                       }
//                     />
//                   </View>
//                   <View className="w-1/3 px-1">
//                     <InputBox
//                       name="less_weight"
//                       placeholder="0"
//                       label={invoice.less_by_type?.value === "percentage" ? "Less %" : "Less Weight"}
//                       value={invoice.less_weight}
//                       keyboardType="numeric"
//                       onChange={({ value }) => {
//                         if (invoice.less_by_type?.value === "percentage") {
//                           const lessWeightValue = (Number(invoice.gross_weight || 0) * Number(value || 0)) / 100;
//                           handleInvoiceChange(index, "less_weight", lessWeightValue.toString());
//                         } else {
//                           handleInvoiceChange(index, "less_weight", value);
//                         }
//                       }}
//                     />
//                   </View>
//                   <View className="w-1/3 pl-1">
//                     <InputBox
//                       name="net_weight"
//                       label="Net Weight"
//                       placeholder="0"
//                       readOnly={true}
//                       value={invoice.net_weight}
//                       keyboardType="numeric"
//                     />
//                   </View>
//                 </View>

//                 {/* fine_weight, rate, net_price */}
//                 <View className="mb-4 flex-wrap flex-row ">
//                   <View className="w-1/3 pr-1">
//                     <InputBox
//                       name="fine_weight"
//                       label="Fine Weight"
//                       placeholder="0.000"
//                       readOnly={true}
//                       value={invoice.fine_weight || "0.000"}
//                       keyboardType="numeric"
//                     />
//                   </View>

//                   {/* Add Cutting Button */}
//                   <View className="w-1/3 px-1">
//                     <Text className="text-slate-500 text-[13px] mb-1">Cutting</Text>
//                     <View className="bg-gray-100 rounded-lg">
//                       <CommonButton
//                         title={invoice.cutting_enabled ? "ON" : "OFF"}
//                         onPress={() => {
//                           const updatedInvoices = [...invoices];
//                           updatedInvoices[index] = {
//                             ...updatedInvoices[index],
//                             cutting_enabled: !updatedInvoices[index].cutting_enabled
//                           };
                          
//                           // Update valuation based on cutting state
//                           const fine = Number(updatedInvoices[index].fine_weight || 0);
//                           const rate = isSelectRate 
//                             ? Number(updatedInvoices[index]?.rate?.price || 0)
//                             : Number(updatedInvoices[index]?.rate || 0);
                          
//                           updatedInvoices[index].valuation = !updatedInvoices[index].cutting_enabled 
//                             ? "0" 
//                             : handleDigitsFix(fine * rate);
                          
//                           setInvoices(updatedInvoices);
//                         }}
//                         isFilled={invoice.cutting_enabled}
//                         small
//                       />
//                     </View>
//                   </View>

//                   {/* Add Piece input field */}
//                   <View className="w-1/3 pl-1">
//                     <InputBox
//                       name="piece"
//                       label="Piece"
//                       placeholder="0"
//                       value={invoice.piece}
//                       keyboardType="numeric"
//                       onChange={({ value }) =>
//                         handleInvoiceChange(index, "piece", value)
//                       }
//                     />
//                   </View>

//                   <View className="w-1/3 pl-1 pt-2">
//                     {isSelectRate ? (
//                       <SelectInput
//                         label="Rate"
//                         name="rate"
//                         value={invoice?.rate}
//                         placeholder="Select Rate"
//                         data={invoice?.hsn_id?.variation?.map((item) => ({
//                           label: `${item.name} ( ${item.price} )`,
//                           value: item.id,
//                           price: item.price,
//                         }))}
//                         onSelect={(value) =>
//                           handleInvoiceChange(index, "rate", value)
//                         }
//                       />
//                     ) : (
//                       <InputBox
//                         name="rate"
//                         label="Rate"
//                         placeholder="0.00"
//                         readOnly={true}
//                         value={invoice?.rate}
//                         onChange={({ value }) =>
//                           handleInvoiceChange(index, "rate", value)
//                         }
//                         keyboardType="numeric"
//                       />
//                     )}
//                   </View>
//                   <View className="w-1/3 pl-1 pt-2">
//                     <InputBox
//                       name="net_price"
//                       placeholder="0"
//                       label="Net Price"
//                       readOnly={true}
//                       value={invoice.net_price}
//                     />
//                   </View>
//                 </View>

//                 {/* Making Charges, Additional Charges, Tax Rate */}
//                 <View className="mb-4 flex flex-row">
//                   <View className="w-1/3 pr-1">
//                     <InputBox
//                       name="making_charge"
//                       label="Making Charges"
//                       placeholder="0"
//                       value={invoice.making_charge}
//                       keyboardType="numeric"
//                       onChange={({ value }) =>
//                         handleInvoiceChange(index, "making_charge", value)
//                       }
//                     />
//                   </View>
//                   <View className="w-1/3 px-1">
//                     <InputBox
//                       name="additional_charge"
//                       label="Additional Charges"
//                       placeholder="0"
//                       value={invoice.additional_charge}
//                       keyboardType="numeric"
//                       onChange={({ value }) =>
//                         handleInvoiceChange(index, "additional_charge", value)
//                       }
//                     />
//                   </View>
//                   <View className="w-1/3 pl-1">
//                     <InputBox
//                       name="tax_rate"
//                       label="Tax Rate (%)"
//                       placeholder="0"
//                       value={invoice.tax_rate}
//                       keyboardType="numeric"
//                       onChange={({ value }) =>
//                         handleInvoiceChange(index, "tax_rate", value)
//                       }
//                     />
//                   </View>
//                 </View>

//                 {/* charges and taxes */}
//                 <View className="mb-4">
//                   {/* Charges */}
//                   <View className="mb-5">
//                     <View className="flex flex-row items-center justify-between">
//                       <Text className="tracking-wider text-base">
//                         Charges
//                       </Text>
//                       <View className="flex flex-row items-center">
//                         <Switch
//                           value={invoice?.showChargesInBill || false}
//                           onValueChange={(value) => handleInvoiceChange(index, "showChargesInBill", value)}
//                           trackColor={{ false: "red", true: "green" }}
//                           thumbColor={invoice?.showChargesInBill ? "#ffffff" : "#f4f3f4"}
//                         />
//                         <TouchableOpacity
//                           onPress={() => {
//                             const updatedInvoices = [...invoices];
//                             if (!updatedInvoices[index].charges_json) {
//                               updatedInvoices[index].charges_json = [];
//                             }
//                             updatedInvoices[index].charges_json.push({ name: "", amount: "" });
//                             setInvoices(updatedInvoices);
//                           }}
//                           activeOpacity={0.7}
//                           className="bg-primary ml-2 w-6 h-6 flex justify-center items-center rounded-full shadow-xl"
//                         >
//                           <FontAwesome6 name="plus" size={17} color="white" />
//                         </TouchableOpacity>
//                       </View>
//                     </View>
//                     {/* Input fields */}
//                     {(invoice?.charges_json || []).map((charge, chargeIndex) => {
//                       return (
//                         <View
//                           key={chargeIndex}
//                           className="flex pt-2 pl-1 items-end flex-row"
//                         >
//                           {/* charge name */}
//                           <View className="w-[45%] pr-2">
//                             <OutlineInput
//                               placeholder="e.g. Labour Charge"
//                               value={charge.name}
//                               onChangeText={(value) => {
//                                 const updatedInvoices = [...invoices];
//                                 updatedInvoices[index].charges_json[chargeIndex].name = value;
//                                 // If this is a labor charge, calculate based on pieces
//                                 if (value.toLowerCase().includes('labour') || value.toLowerCase().includes('labor')) {
//                                   const pieces = Number(updatedInvoices[index].piece || 0);
//                                   const ratePerPiece = Number(updatedInvoices[index].charges_json[chargeIndex].amount || 0);
//                                   updatedInvoices[index].charges_json[chargeIndex].calculatedAmount = (pieces * ratePerPiece).toString();
//                                 }
//                                 setInvoices(updatedInvoices);
//                               }}
//                             />
//                           </View>

//                           {/* amount */}
//                           <View className="w-[45%] px-2">
//                             <OutlineInput
//                               placeholder="e.g. 500"
//                               value={charge.amount}
//                               keyboardType="numeric"
//                               onChangeText={(value) => {
//                                 const updatedInvoices = [...invoices];
//                                 updatedInvoices[index].charges_json[chargeIndex].amount = value;
//                                 // If this is a labor charge, recalculate based on pieces
//                                 if (charge.name.toLowerCase().includes('labour') || charge.name.toLowerCase().includes('labor')) {
//                                   const pieces = Number(updatedInvoices[index].piece || 0);
//                                   const ratePerPiece = Number(value || 0);
//                                   updatedInvoices[index].charges_json[chargeIndex].calculatedAmount = (pieces * ratePerPiece).toString();
//                                 }
//                                 setInvoices(updatedInvoices);
//                               }}
//                             />
//                             {/* Show calculated amount if this is a labor charge */}
//                             {(charge.name.toLowerCase().includes('labour') || charge.name.toLowerCase().includes('labor')) && (
//                               <Text className="text-xs text-gray-500 mt-1">
//                                 Total: ₹{handleDigitsFix(Number(charge.calculatedAmount || 0))} ({invoice.piece || 0} × ₹{charge.amount || 0})
//                               </Text>
//                             )}
//                           </View>

//                           {/* trash icon */}
//                           {(invoice?.charges_json || []).length > 1 && (
//                             <TouchableOpacity
//                               onPress={() => {
//                                 const updatedInvoices = [...invoices];
//                                 updatedInvoices[index].charges_json = updatedInvoices[index].charges_json.filter(
//                                   (_, i) => i !== chargeIndex
//                                 );
//                                 setInvoices(updatedInvoices);
//                               }}
//                               activeOpacity={0.7}
//                               className="w-[10%] flex justify-center pl-3"
//                             >
//                               <FontAwesome6
//                                 name="trash"
//                                 size={15}
//                                 color="red"
//                               />
//                             </TouchableOpacity>
//                           )}
//                         </View>
//                       );
//                     })}
//                   </View>

//                   {/* Taxes */}
//                   <View className="">
//                     <View className="flex flex-row items-center justify-between">
//                       <Text className="tracking-wider text-base">Tax</Text>
//                       <View className="flex flex-row items-center">
//                         <Switch
//                           value={invoice?.showTaxInBill || false}
//                           onValueChange={(value) => handleInvoiceChange(index, "showTaxInBill", value)}
//                           trackColor={{ false: "red", true: "green" }}
//                           thumbColor={invoice?.showTaxInBill ? "#ffffff" : "#f4f3f4"}
//                         />
//                         <TouchableOpacity
//                           onPress={() => {
//                             const updatedInvoices = [...invoices];
//                             if (!updatedInvoices[index].tax_json) {
//                               updatedInvoices[index].tax_json = [];
//                             }
//                             updatedInvoices[index].tax_json.push({ name: "", amount: "" });
//                             setInvoices(updatedInvoices);
//                           }}
//                           activeOpacity={0.7}
//                           className="bg-primary ml-2 w-6 h-6 flex justify-center items-center rounded-full shadow-xl"
//                         >
//                           <FontAwesome6 name="plus" size={17} color="white" />
//                         </TouchableOpacity>
//                       </View>
//                     </View>
//                     {/* Input fields */}
//                     {(invoice?.tax_json || []).map((tax, taxIndex) => {
//                       return (
//                         <View
//                           key={taxIndex}
//                           className="flex pt-2 pl-1 items-end flex-row"
//                         >
//                           {/* tax name */}
//                           <View className="w-[45%] pr-2">
//                             <OutlineInput
//                               placeholder="e.g. Tax"
//                               value={tax.name}
//                               onChangeText={(value) => {
//                                 const updatedInvoices = [...invoices];
//                                 updatedInvoices[index].tax_json[taxIndex].name = value;
//                                 setInvoices(updatedInvoices);
//                               }}
//                             />
//                           </View>

//                           {/* tax amount */}
//                           <View className="w-[45%] px-2">
//                             <OutlineInput
//                               placeholder="e.g. 10%"
//                               value={tax.amount}
//                               keyboardType="numeric"
//                               onChangeText={(value) => {
//                                 const updatedInvoices = [...invoices];
//                                 updatedInvoices[index].tax_json[taxIndex].amount = value;
//                                 setInvoices(updatedInvoices);
//                               }}
//                             />
//                           </View>

//                           {/* trash icon */}
//                           {(invoice?.tax_json || []).length > 1 && (
//                             <TouchableOpacity
//                               onPress={() => {
//                                 const updatedInvoices = [...invoices];
//                                 updatedInvoices[index].tax_json = updatedInvoices[index].tax_json.filter(
//                                   (_, i) => i !== taxIndex
//                                 );
//                                 setInvoices(updatedInvoices);
//                               }}
//                               activeOpacity={0.7}
//                               className="w-[10%] flex justify-center pl-3"
//                             >
//                               <FontAwesome6
//                                 name="trash"
//                                 size={15}
//                                 color="red"
//                               />
//                             </TouchableOpacity>
//                           )}
//                         </View>
//                       );
//                     })}
//                   </View>
//                 </View>

//                 <View className="flex items-end flex-row">
//                   <View className={invoices?.length > 1 && "w-[82%]"}>
//                     <InputBox
//                       name="comment"
//                       multiLine={true}
//                       label="Comment"
//                       value={invoice?.comment}
//                       onChange={({ value }) =>
//                         handleInvoiceChange(index, "comment", value)
//                       }
//                     />
//                   </View>

//                   {invoices?.length > 1 && (
//                     <TouchableOpacity
//                       onPress={() => removeInvoiceRow(index)}
//                       className="w-1/6 ml-auto py-2.5 rounded-md bg-red-500 flex justify-center items-center"
//                     >
//                       <AntDesign name="delete" size={20} color="white" />
//                     </TouchableOpacity>
//                   )}
//                 </View>

//                 {/* Payment Receipt Photo Upload */}
//                 <View className="mt-4 items-center">
//                   <Text className="text-slate-500 text-[13px] mb-1">Payment Receipt Photo</Text>
//                   <View className="flex flex-row items-center">
//                     <ImagePickerComponent
//                       onChange={({ value }) =>
//                         handleInvoiceChange(index, "receipt_photo", value)
//                       }
//                       value={invoice?.receipt_photo}
//                       name="receipt_photo"
//                     />
//                     <Text className="ml-3 text-gray-500">Upload payment receipt</Text>
//                   </View>
//                 </View>
//               </View>
//             );
//           })}
//         </View>

//         {/* amount & interest */}
//         <View className="bg-primary/10 px-5 py-3">
//           <View className="flex flex-row pb-4">
//             <View className="w-2/3 pr-1">
//               <SelectInput
//                 label="Interest Type"
//                 name="interest_type"
//                 placeholder="Select"
//                 value={formValue?.interest_type}
//                 data={[
//                   { label: "Flat", value: "2" },
//                   { label: "Compound Interest", value: "1" },
//                 ]}
//                 onSelect={(value) => handleInputChange("interest_type", value)}
//                 error={errors?.interest_type}
//               />
//               {validator.message(
//                 "interest_type",
//                 formValue?.interest_type,
//                 "required"
//               )}
//             </View>
//             <View className="w-1/3 pl-1">
//               <InputBox
//                 name="interest_rate"
//                 label="Interest (%)"
//                 placeholder="0%"
//                 keyboardType="numeric"
//                 value={formValue?.interest_rate}
//                 onChange={({ value }) =>
//                   handleInputChange("interest_rate", value)
//                 }
//                 error={errors?.interest_type}
//               />
//               {validator.message(
//                 "interest_rate",
//                 formValue?.interest_rate,
//                 "required"
//               )}
//             </View>
//           </View>

//           {/* Adding Interest Duration based on interest type */}
//           <View className="flex flex-row pb-4">
//             {formValue?.interest_type?.value === "1" && (
//               <View className="w-2/3 pr-1">
//                 <SelectInput
//                   label="Interest Duration"
//                   name="interest_duration"
//                   placeholder="Select Duration"
//                   value={formValue?.interest_duration}
//                   data={[
//                     { label: "1 Year", value: "12" },
//                     { label: "6 Months", value: "6" },
//                     { label: "3 Months", value: "3" },
//                     { label: "Daily", value: "daily" },
//                   ]}
//                   onSelect={handleInterestDurationChange}
//                   error={errors?.interest_duration}
//                 />
//                 {validator.message(
//                   "interest_duration",
//                   formValue?.interest_duration,
//                   formValue?.interest_type?.value === "1" ? "required" : ""
//                 )}
//               </View>
//             )}
            
//             {formValue?.interest_type?.value === "2" && (
//               <View className="w-2/3 pr-1">
//                 <Text className="text-gray-6 text-xs tracking-wider pb-1">
//                   Interest End Date
//                 </Text>
//                 <TouchableOpacity
//                   onPress={() => handleModalState("flatInterestDatePicker", true)}
//                   className="items-center px-2 py-3 rounded-lg border-gray-5 border flex flex-row justify-between"
//                 >
//                   <Text>{formValue?.interest_upto ? moment(formValue.interest_upto).format('DD MMM YYYY') : 'Select Date'}</Text>
//                   <AntDesign name="calendar" size={20} color="#666" />
//                 </TouchableOpacity>
//                 <DatePickerComponent
//                   name="interest_upto"
//                   open={modalState.flatInterestDatePicker}
//                   value={formValue?.interest_upto}
//                   handleClose={() => handleModalState("flatInterestDatePicker", false)}
//                   onSelect={({ value }) => {
//                     handleInputChange("interest_upto", moment(value).format('YYYY-MM-DD'));
//                     handleModalState("flatInterestDatePicker", false);
//                   }}
//                 />
//               </View>
//             )}
//           </View>

//           {/* Flat Interest Calculation Summary */}
//           {formValue?.interest_type?.value === "2" && formValue?.interest_upto && (
//             <View className="bg-gray-50 p-3 mb-4 rounded-lg">
//               <View className="flex flex-row justify-between items-center">
//                 <View>
//                   <Text className="text-sm text-gray-600">Flat Interest Calculation</Text>
//                   <Text className="text-xs text-gray-500">
//                     {moment().format('DD MMM YYYY')} to {moment(formValue.interest_upto).format('DD MMM YYYY')}
//                   </Text>
//                 </View>
//                 <View>
//                   <Text className="text-sm font-semibold text-primary">
//                     {Math.max(0, moment(formValue.interest_upto).diff(moment(), 'days'))} days
//                   </Text>
//                 </View>
//               </View>
//               <View className="mt-2">
//                 <Text className="text-xs text-gray-500">
//                   Loan by Valuation: ₹{handleDigitsFix((Number(formValue.valuation || 0) * Number(formValue.loan_percentage || 0)) / 100)}
//                 </Text>
//                 <Text className="text-xs text-gray-500">
//                   Interest Rate: {formValue?.interest_rate}%
//                 </Text>
//                 <Text className="text-xs text-gray-500">
//                   Time Period: {(moment(formValue.interest_upto).diff(moment(), 'days') / 365).toFixed(2)} years
//                 </Text>
//                 <Text className="text-xs font-bold text-gray-600 mt-1">
//                   Formula: Loan by Valuation × Interest Rate × Time Period
//                 </Text>
//               </View>
//             </View>
//           )}

//           {/* Compound Interest Calculation Example */}
//           {formValue?.interest_type?.value === "1" && 
//           formValue?.interest_duration?.value !== "daily" && 
//           formValue?.interest_amount !== "0" && (
//             <View className="bg-gray-50 p-3 mb-4 rounded-lg">
//               <Text className="text-sm font-semibold text-gray-600 mb-2">Compound Interest Example</Text>
//               <Text className="text-xs text-gray-500">Loan by Valuation: ₹{handleDigitsFix((Number(formValue.valuation || 0) * Number(formValue.loan_percentage || 0)) / 100)}</Text>
//               <Text className="text-xs text-gray-500">Interest Rate: {formValue?.interest_rate}% per annum</Text>
//               <Text className="text-xs text-gray-500">Duration: {formValue?.interest_duration?.label}</Text>
              
//               <View className="mt-2 border-t border-gray-200 pt-2">
//                 <Text className="text-xs text-gray-500">Step-by-step calculation:</Text>
//                 <Text className="text-xs text-gray-500">
//                   • Principal: ₹{handleDigitsFix((Number(formValue.valuation || 0) * Number(formValue.loan_percentage || 0)) / 100)}
//                 </Text>
//                 <Text className="text-xs text-gray-500">
//                   • Year 1: ₹{handleDigitsFix((Number(formValue.valuation || 0) * Number(formValue.loan_percentage || 0)) / 100)} × {formValue?.interest_rate}% = ₹{handleDigitsFix(((Number(formValue.valuation || 0) * Number(formValue.loan_percentage || 0)) / 100) * (Number(formValue?.interest_rate || 0) / 100))} interest
//                 </Text>
//                 <Text className="text-xs text-gray-500">
//                   • New Principal: ₹{handleDigitsFix((Number(formValue.valuation || 0) * Number(formValue.loan_percentage || 0)) / 100 + ((Number(formValue.valuation || 0) * Number(formValue.loan_percentage || 0)) / 100) * (Number(formValue?.interest_rate || 0) / 100))}
//                 </Text>
//                 {parseInt(formValue?.interest_duration?.value || "12") > 12 && (
//                   <Text className="text-xs text-gray-500">
//                     • Year 2: ₹{handleDigitsFix((Number(formValue.valuation || 0) * Number(formValue.loan_percentage || 0)) / 100 + ((Number(formValue.valuation || 0) * Number(formValue.loan_percentage || 0)) / 100) * (Number(formValue?.interest_rate || 0) / 100))} × {formValue?.interest_rate}% = ₹{handleDigitsFix(((Number(formValue.valuation || 0) * Number(formValue.loan_percentage || 0)) / 100 + ((Number(formValue.valuation || 0) * Number(formValue.loan_percentage || 0)) / 100) * (Number(formValue?.interest_rate || 0) / 100)) * (Number(formValue?.interest_rate || 0) / 100))} interest
//                   </Text>
//                 )}
//               </View>
              
//               <View className="mt-2 border-t border-gray-200 pt-2">
//                 <Text className="text-xs font-semibold">Total interest: ₹{formValue?.interest_amount}</Text>
//                 <Text className="text-xs font-semibold">Total repayable: ₹{handleDigitsFix((Number(formValue.valuation || 0) * Number(formValue.loan_percentage || 0)) / 100 + Number(formValue?.interest_amount || 0))}</Text>
//               </View>
//             </View>
//           )}

//           {/* Timer Section */}
//           {formValue?.interest_type?.value === "1" && formValue?.interest_duration?.value !== "daily" && (
//             <View className="bg-gray-50 p-3 mb-4 rounded-lg">
//               <View className="flex flex-row justify-between items-center">
//                 <View>
//                   <Text className="text-sm text-gray-600">Next Interest Calculation</Text>
//                   <Text className="text-xs text-gray-500">
//                     {moment().add(parseInt(formValue?.interest_duration?.value), 'months').format('DD MMM YYYY')}
//                   </Text>
//                 </View>
//                 <View>
//                   <Text className="text-sm font-semibold text-primary">
//                     {Math.max(0, moment().add(parseInt(formValue?.interest_duration?.value), 'months').diff(moment(), 'days'))} days remaining
//                   </Text>
//                 </View>
//               </View>
//               <View className="mt-2">
//                 <Text className="text-xs text-gray-500">
//                   Principal Amount: ₹{handleDigitsFix(Number(currentBalance || 0))}
//                 </Text>
//                 <Text className="text-xs text-gray-500">
//                   Loan by Valuation: ₹{handleDigitsFix((Number(formValue.valuation || 0) * Number(formValue.loan_percentage || 0)) / 100)}
//                 </Text>
//                 <Text className="text-xs text-gray-500">
//                   Current Total: ₹{handleDigitsFix(Number(currentBalance || 0) + Number(formValue?.interest_amount || 0))}
//                 </Text>
//                 <Text className="text-xs text-gray-500">
//                   Next Interest ({formValue?.interest_rate}%): ₹{handleDigitsFix((Number(formValue.valuation || 0) * Number(formValue.loan_percentage || 0) / 100) * (Number(formValue?.interest_rate || 0) / 100))}
//                 </Text>
//                 <Text className="text-xs text-gray-500">
//                   Duration: {formValue?.interest_duration?.label}
//                 </Text>
//               </View>
//             </View>
//           )}

//           {/* Daily Interest Breakdown */}
//           {formValue?.interest_type?.value === "1" && 
//            formValue?.interest_duration?.value === "daily" && 
//            formValue?.interest_upto && (
//             <View className="bg-gray-50 p-3 mb-4 rounded-lg">
//               <Text className="text-sm font-semibold text-gray-600 mb-2">Daily Interest Breakdown</Text>
//               <View className="max-h-40 overflow-scroll">
//                 {formValue?.dailyBreakdown?.map((day, index) => (
//                   <View key={index} className="flex flex-row justify-between py-1 border-b border-gray-200">
//                     <Text className="text-xs text-gray-500">{day.date}</Text>
//                     <View>
//                       <Text className="text-xs text-gray-500">
//                         Principal: ₹{handleDigitsFix(day.principal)}
//                       </Text>
//                       <Text className="text-xs text-gray-500">
//                         Interest: +₹{handleDigitsFix(day.interest)}
//                       </Text>
//                       <Text className="text-xs font-semibold text-gray-600">
//                         Total: ₹{handleDigitsFix(day.total)}
//                       </Text>
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             </View>
//           )}

//           <View className="flex-row">
//             {formValue?.interest_duration?.value === "daily" && (
//             <View className="w-1/3 pr-1">
//               <Text className="text-gray-6 text-xs tracking-wider pb-1">
//                 Interest Upto
//               </Text>
//               <TouchableOpacity
//                 onPress={() => handleModalState("datePicker", true)}
//                 className="items-center px-2 py-3 rounded-lg border-gray-5 border flex flex-row justify-between"
//               >
//                 <Text>{formValue?.interest_upto ? moment(formValue.interest_upto).format('DD MMM YYYY') : 'Select Date'}</Text>
//                 <DatePickerComponent
//                   name="interest_upto"
//                   open={modalState.datePicker}
//                   value={formValue?.interest_upto}
//                   handleClose={() => handleModalState("datePicker", false)}
//                   onSelect={({ value }) => {
//                     handleInputChange("interest_upto", value);
//                     handleModalState("datePicker", false);
//                   }}
//                 />
//               </TouchableOpacity>
//             </View>
//             )}
//             <View className={`${formValue?.interest_duration?.value === "daily" ? 'w-1/3 px-1' : 'w-1/2 pr-1'}`}>
//               <InputBox
//                 name="interest_amount"
//                 label="Interest Amount"
//                 placeholder="0.00"
//                 value={handleDigitsFix(Number(formValue?.interest_amount || 0))}
//                 readOnly={true}
//               />
//             </View>
//             <View className={`${formValue?.interest_duration?.value === "daily" ? 'w-1/3 pl-1' : 'w-1/2 pl-1'}`}>
//               <InputBox
//                 name="loan_amount"
//                 label="Loan Amount"
//                 placeholder="0.00"
//                 keyboardType="numeric"
//                 value={formValue?.loan_amount}
//                 onChange={handleLoanAmountChange}
//               />
              
//               <View className="mt-2">
//                 <InputBox
//                   name="loan_percentage"
//                   label="Loan Percentage (%)"
//                   placeholder="0%"
//                   keyboardType="numeric"
//                   value={formValue?.loan_percentage}
//                   onChange={handleLoanAmountChange}
//                 />
//                 <InputBox
//                   name="loan_by_valuation"
//                   label="Loan by Valuation"
//                   placeholder="0.00"
//                   readOnly={true}
//                   value={formValue?.loan_by_valuation || "0"}
//                 />
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Modal for new invoice */}
//         <Modal
//           visible={showNewInvoice}
//           animationType="slide"
//           onRequestClose={() => setShowNewInvoice(false)}
//         >
//           <SingleInvoiceForm
//             initialData={{
//               interest_rate: formValue.interest_rate,
//               interest_type: formValue.interest_type,
//               interest_duration: formValue.interest_duration,
//               start_date: moment().format('YYYY-MM-DD'),
//               next_calculation_date: moment().add(1, 'year').format('YYYY-MM-DD')
//             }}
//             onSave={handleNewInvoice}
//             onClose={() => setShowNewInvoice(false)}
//           />
//         </Modal>

//         {/* Modify the items list modal */}
//         <Modal
//           visible={showItemsList}
//           animationType="slide"
//           onRequestClose={() => setShowItemsList(false)}
//         >
//           <LoanItemsList
//             navigation={props.navigation}
//             route={props.route}
//             onClose={() => setShowItemsList(false)}
//             formValue={formValue}
//             setFormValue={setFormValue}
//           />
//         </Modal>

//         {/* Modify the buttons section */}
//         <View className="px-4 pt-2 flex flex-row">
//           <View className="w-[45%] pr-3">
//             <CommonButton
//               onPress={handleSubmitInvoice}
//               loading={loading}
//               title="Submit"
//             />
//           </View>
//           <View className="w-[20%] pr-3">
//             <CommonButton 
//               onPress={handleAddProduct}
//               title="Add Item" 
//             />
//           </View>
//           <View className="w-[35%]">
//             <CommonButton 
//               onPress={() => setShowBill(true)} 
//               title="Print" 
//             />
//           </View>
//         </View>

//         {/* Bill Modal */}
//         <Modal
//           visible={showBill}
//           animationType="slide"
//           onRequestClose={() => setShowBill(false)}
//         >
//           <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
//             <View className="flex-row justify-between items-center p-4 bg-primary">
//               <TouchableOpacity onPress={() => setShowBill(false)}>
//                 <AntDesign name="close" size={24} color="white" />
//               </TouchableOpacity>
//               <Text className="text-white text-lg font-semibold">Invoice Bill</Text>
//               <TouchableOpacity onPress={() => {/* TODO: Implement actual printing */}}>
//                 <AntDesign name="printer" size={24} color="white" />
//               </TouchableOpacity>
//             </View>
//             <ScrollView>
//               <ProfessionalInvoiceBill
//                 data={data}
//                 invoices={invoices}
//                 formValue={formValue}
//                 payments={[]} // Add your payments data here
//               />
//             </ScrollView>
//           </SafeAreaView>
//         </Modal>

//         {/* Future Interest Test Modal */}
//         <FutureInterestTestModal />
//       </KeyboardHanlder>
//     </Fragment>
//   );
// };

// export default InvoiceForm;
import React, { useState, useEffect, useCallback, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SafeAreaView, Text, TouchableOpacity, View, Modal, ScrollView } from "react-native";
import InputBox from "./common/InputBox";
import CommonButton from "./common/buttons/CommonButton";
import SelectInput from "@/src/components/common/SelectInput";
import ShowToast from "./common/ShowToast";
import AntDesign from "@expo/vector-icons/AntDesign";
import DatePickerComponent from "./common/DateTimePicker";
import KeyboardHanlder from "./common/KeyboardHanlder";
import SearchProduct from "../screens/products/components/SearchProduct";
import moment from "moment";
import { fetchContactList } from "../redux/actions/user.action";
import { fetchProductGroups } from "../redux/actions/product.action";
import SimpleReactValidator from "simple-react-validator";
import ImagePickerComponent from "./common/ImagePicker";
import { handleDigitsFix } from "../utils";
import axios from "axios";
import { getToken } from "../utils/api";
import { BASE_URL, MANAGE_LOAN_API } from "../utils/api/endpoints";
import SingleInvoiceForm from "./SingleInvoiceForm";
import InvoiceBill from "./InvoiceBill";
import ProfessionalInvoiceBill from "./ProfessionalInvoiceBill";
import { Switch } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import OutlineInput from "./common/OutlineInput";
import LoanItemsList from "./LoanItemsList";

const InvoiceForm = (props) => {
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const { data, setData, handleNext } = props;
  const validator = new SimpleReactValidator();
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [invoices, setInvoices] = useState([
    {
      less_by_type: { label: "Weight", value: "weight" },
      less_weight: "0",
      loan_percentage: "0",
    },
  ]);
  const [formValue, setFormValue] = useState({
    photo: null,
    valuation: "0",
    interest_rate: "",
    interest_type: { label: "Flat", value: "2" },
    interest_duration: { label: "1 Year", value: "12" },
    start_date: moment().format("YYYY-MM-DD"),
    next_calculation_date: moment().add(1, "year").format("YYYY-MM-DD"),
    selectedProduct: [],
    totalPrice: "0",
    interest_amount: "0",
    dailyBreakdown: [],
    selection_date: moment().format("YYYY-MM-DD"),
    interest_upto: moment().add(1, "year").format("YYYY-MM-DD"),
    showChargesInBill: false,
    showTaxInBill: false,
    charges_json: [],
    tax_json: [],
    comment: "",
    receipt_photo: null,
    loan_amount: "0",
    loan_percentage: "0",
    loan_by_valuation: "0",
  });
  const [modalState, setModalState] = useState({ datePicker: false, futureDatePicker: false, flatInterestDatePicker: false });
  const { productGroups } = useSelector((state) => state.productSlices);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [showFutureInterestTest, setShowFutureInterestTest] = useState(false);
  const [futureDate, setFutureDate] = useState(null);
  const [futureInterestResults, setFutureInterestResults] = useState(null);
  const [showItemsList, setShowItemsList] = useState(false);

  useEffect(() => {
    dispatch(fetchContactList());
    dispatch(fetchProductGroups());
  }, [dispatch]);

  // Trigger interest calculation when relevant fields change
  useEffect(() => {
    calculateAndSetInterest();
  }, [
    formValue.loan_amount,
    formValue.loan_percentage,
    formValue.interest_rate,
    formValue.interest_type,
    formValue.interest_upto,
    formValue.interest_duration,
    formValue.valuation,
    invoices,
  ]);

  // Handle invoice change
  const handleInvoiceChange = useCallback(
    (index, name, value) => {
      setInvoices((prev) => {
        const updatedInvoices = [...prev];
        const updatedInvoice = { ...updatedInvoices[index], [name]: value };

        // If pieces are being updated, recalculate any labor charges
        if (name === "piece") {
          const pieces = Number(value || 0);
          if (updatedInvoice.charges_json) {
            updatedInvoice.charges_json = updatedInvoice.charges_json.map((charge) => {
              if (charge.name.toLowerCase().includes("labour") || charge.name.toLowerCase().includes("labor")) {
                const ratePerPiece = Number(charge.amount || 0);
                return {
                  ...charge,
                  calculatedAmount: (pieces * ratePerPiece).toString(),
                };
              }
              return charge;
            });
          }
        }

        if (name === "hsn_id") {
          const metalPrice = productGroups.find((item) => item.id == value.value)?.price;
          const isVariation = value?.variation?.length > 0;
          updatedInvoice.rate = isVariation
            ? {
                label: value?.variation?.[0]?.name,
                value: value?.variation?.[0]?.id,
                price: value?.variation?.[0]?.price,
              }
            : metalPrice || 0;
        }

        // If less_by_type changes, recalculate less_weight if it's percentage
        if (name === "less_by_type" && value?.value === "percentage" && updatedInvoice.less_weight) {
          const percentage = Number(updatedInvoice.less_weight || 0);
          const lessWeightValue = (Number(updatedInvoice.gross_weight || 0) * percentage) / 100;
          updatedInvoice.less_weight = lessWeightValue.toString();
        }

        // Calculate Net Weight
        updatedInvoice.net_weight = handleDigitsFix(
          Number(updatedInvoice.gross_weight || 0) - Number(updatedInvoice.less_weight || 0)
        );

        // Calculate Fine Weight
        updatedInvoice.fine_weight = (
          (Number(updatedInvoice.net_weight || 0) * Number(updatedInvoice.tounch || 0)) / 100
        ).toFixed(3);

        // Calculate valuation based on cutting state
        const fine = Number(updatedInvoice.fine_weight || 0);
        const currentRate = updatedInvoice?.rate?.price || updatedInvoice?.rate || 0;
        updatedInvoice.valuation = !updatedInvoice.cutting_enabled
          ? "0"
          : handleDigitsFix(fine * currentRate);

        // Initialize cutting_enabled if not present
        if (typeof updatedInvoice.cutting_enabled === "undefined") {
          updatedInvoice.cutting_enabled = false;
        }

        // Calculate Making Charges
        const makingCharges = Number(updatedInvoice.making_charge || 0) * Number(updatedInvoice.net_weight || 0);

        // Calculate Additional Charges
        const additionalCharges = Number(updatedInvoice.additional_charge || 0);

        // Calculate Total Price (valuation + other charges)
        const totalBeforeTax = Number(updatedInvoice.valuation || 0) + makingCharges + additionalCharges;

        // Calculate Tax Amount
        const taxRate = Number(updatedInvoice.tax_rate || 0) / 100;
        const taxAmount = totalBeforeTax * taxRate;

        // Calculate Final Price
        updatedInvoice.net_price = handleDigitsFix(totalBeforeTax + taxAmount);

        updatedInvoices[index] = updatedInvoice;

        // Update formValue.valuation
        const totalValuation = updatedInvoices.reduce(
          (total, invoice) => total + Number(invoice.valuation || 0),
          0
        );
        setFormValue((prev) => ({
          ...prev,
          valuation: handleDigitsFix(totalValuation),
        }));

        return updatedInvoices;
      });
    },
    [productGroups]
  );

  // Handle product detail
  const handleProductDetail = useCallback(
    (index, product) => {
      setInvoices((prev) => {
        const updatedInvoices = [...prev];
        const hsnName = productGroups.find((item) => item?.id == product?.hsn_id);
        const variation = hsnName?.variation_data;
        const isVariation = variation?.length > 0;

        updatedInvoices[index] = {
          ...updatedInvoices[index],
          product_id: product.id,
          name: product.name,
          hsn_id: { label: hsnName?.name, value: hsnName?.id, variation },
          rate: isVariation
            ? {
                label: variation?.[0]?.name,
                value: variation?.[0]?.id,
                price: variation?.[0]?.price,
              }
            : hsnName?.price,
        };
        return updatedInvoices;
      });
    },
    [productGroups]
  );

  // Handle input change
  const handleInputChange = useCallback((name, value) => {
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Handle loan amount and percentage change
  const handleLoanAmountChange = useCallback(
    ({ name, value }) => {
      setErrors((prev) => ({ ...prev, [name]: "" }));
      setFormValue((prev) => {
        const updatedForm = { ...prev };

        if (name === "loan_amount") {
          updatedForm.loan_amount = value;
          updatedForm.loan_by_valuation = value;
          updatedForm.loan_percentage = "0"; // Reset percentage when amount is set
        } else if (name === "loan_percentage") {
          updatedForm.loan_percentage = value;
          const totalValuation = Number(updatedForm.valuation || 0);
          updatedForm.loan_by_valuation = handleDigitsFix(
            (totalValuation * Number(value || 0)) / 100
          );
          updatedForm.loan_amount = "0"; // Reset amount when percentage is set
        }

        return updatedForm;
      });
    },
    []
  );

  // Calculate and set interest
  const calculateAndSetInterest = useCallback(() => {
    if (
      !formValue.interest_rate ||
      !formValue.interest_type ||
      (!formValue.interest_duration && formValue.interest_type.value === "1" && formValue.interest_duration?.value !== "daily") ||
      (!formValue.interest_upto && formValue.interest_type.value === "2")
    ) {
      setFormValue((prev) => ({
        ...prev,
        interest_amount: "0",
        dailyBreakdown: [],
      }));
      return;
    }

    const interestRate = parseFloat(formValue.interest_rate || 0) / 100;
    const interestType = formValue.interest_type.value;
    let interestAmount = 0;
    let dailyBreakdown = [];

    // Calculate principal
    let principal = 0;
    if (Number(formValue.loan_amount) > 0) {
      principal = Number(formValue.loan_amount);
    } else {
      principal = (Number(formValue.valuation || 0) * Number(formValue.loan_percentage || 0)) / 100;
    }

    if (formValue.interest_duration?.value === "daily" && interestType === "1") {
      if (!formValue.interest_upto) return;

      const startDate = moment();
      const endDate = moment(formValue.interest_upto);

      if (endDate.isSameOrBefore(startDate)) {
        setFormValue((prev) => ({
          ...prev,
          interest_amount: "0",
          dailyBreakdown: [],
        }));
        return;
      }

      const totalDays = endDate.diff(startDate, "days");
      const dailyRate = interestRate / 30; // Daily rate based on monthly rate
      let runningTotal = principal;

      for (let day = 1; day <= totalDays; day++) {
        const dailyInterest = runningTotal * dailyRate;
        runningTotal += dailyInterest;

        dailyBreakdown.push({
          day,
          date: moment(startDate).add(day, "days").format("DD MMM YYYY"),
          principal: runningTotal - dailyInterest,
          interest: dailyInterest,
          total: runningTotal,
        });
      }

      interestAmount = runningTotal - principal;
    } else if (interestType === "2") {
      // Flat interest
      if (!formValue.interest_upto) return;

      const startDate = moment();
      const endDate = moment(formValue.interest_upto);

      if (endDate.isSameOrBefore(startDate)) {
        setFormValue((prev) => ({
          ...prev,
          interest_amount: "0",
        }));
        return;
      }

      const yearsDecimal = endDate.diff(startDate, "days") / 365;
      interestAmount = principal * interestRate * yearsDecimal;
    } else if (interestType === "1") {
      // Compound interest
      const durationInMonths = parseInt(formValue.interest_duration?.value || "12");
      const monthlyRate = interestRate / 12;
      const finalAmount = principal * Math.pow(1 + monthlyRate, durationInMonths);
      interestAmount = finalAmount - principal;
    }

    setFormValue((prev) => ({
      ...prev,
      interest_amount: handleDigitsFix(interestAmount),
      dailyBreakdown,
    }));
  }, [formValue]);

  // Handle modal state
  const handleModalState = useCallback((name, value) => {
    setModalState((prevState) => ({ ...prevState, [name]: value }));
  }, []);

  // Handle interest duration change
  const handleInterestDurationChange = useCallback(
    (value) => {
      const today = moment().format("YYYY-MM-DD");
      handleInputChange("interest_duration", value);
      setFormValue((prev) => ({
        ...prev,
        selection_date: today,
      }));
    },
    [handleInputChange]
  );

  const totalGrossWeight = invoices.reduce(
    (total, invoice) => total + parseFloat(invoice.gross_weight || 0),
    0
  );

  const totalFineWeight = invoices.reduce(
    (total, invoice) => total + parseFloat(invoice.fine_weight || 0),
    0
  );

  const currentBalance = invoices.reduce(
    (total, invoice) => total + parseFloat(invoice.net_price || 0),
    0
  );

  // Gold and Silver calculations
  const goldInvoices = invoices.filter((invoice) => invoice?.hsn_id?.label?.toLowerCase().includes("gold"));
  const silverInvoices = invoices.filter((invoice) => invoice?.hsn_id?.label?.toLowerCase().includes("silver"));

  const goldCalculations = {
    grossWeight: goldInvoices.reduce((total, invoice) => total + parseFloat(invoice.gross_weight || 0), 0),
    fineWeight: goldInvoices.reduce((total, invoice) => total + parseFloat(invoice.fine_weight || 0), 0),
    value: goldInvoices.reduce((total, invoice) => {
      const fine = parseFloat(invoice.fine_weight || 0);
      const rate = Number(invoice?.rate?.price || invoice?.rate || 0);
      return total + (fine * rate);
    }, 0),
  };

  const silverCalculations = {
    grossWeight: silverInvoices.reduce((total, invoice) => total + parseFloat(invoice.gross_weight || 0), 0),
    fineWeight: silverInvoices.reduce((total, invoice) => total + parseFloat(invoice.fine_weight || 0), 0),
    value: silverInvoices.reduce((total, invoice) => {
      const fine = parseFloat(invoice.fine_weight || 0);
      const rate = Number(invoice?.rate?.price || invoice?.rate || 0);
      return total + (fine * rate);
    }, 0),
  };

  const handleSubmitInvoice = async () => {
    if (!formValue?.selectedProduct?.length) {
      alert("Please add at least one item");
      return;
    }

    if (!data?.user_contact_id && !formValue?.user_contact_id) {
      ShowToast("Please select a contact first");
      return;
    }

    if (validator.allValid() && invoices.length > 0) {
      const formData = new FormData();
      const contactId = data?.user_contact_id || formValue?.user_contact_id;
      formData.append("user_contact_id", contactId);
      formData.append("valuation_amount", currentBalance);
      formData.append("loan_amount", formValue.loan_amount || "0");
      formData.append("interest_type", formValue?.interest_type?.value);
      formData.append("interest_rate", formValue.interest_rate);
      formData.append("interest_upto", moment(formValue.interest_upto).format("YYYY-MM-DD"));
      formData.append("interest_amount", formValue.interest_amount);

      if (formValue.photo) {
        formData.append("order_photo", {
          uri: formValue.photo.uri,
          name: formValue.photo.uri.split("/").pop(),
          type: formValue.photo.type || "image/jpeg",
        });
      }

      invoices.forEach((invoice, index) => {
        const isSelectRate = invoice?.hsn_id?.variation?.length > 0;
        if (invoice.image) {
          formData.append(`image${index}`, {
            uri: invoice?.image?.uri,
            name: invoice?.image?.fileName,
            type: invoice?.image?.mimeType || "image/jpeg",
          });
        }
        delete invoice.image;
        invoice.hsn_id = invoice?.hsn_id?.value;
        invoice.rate = isSelectRate ? invoice?.rate?.price : invoice?.rate;
      });

      formData.append("item", JSON.stringify(invoices));

      const accessToken = await getToken();
      setLoading(true);
      try {
        const response = await axios.post(`${BASE_URL}${MANAGE_LOAN_API.create}`, formData, {
          headers: {
            Authorization: `Bearer ${accessToken?.token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setData((prev) => ({ ...prev }));
        handleNext();
        setLoading(false);
        return response.data;
      } catch (error) {
        setLoading(false);
        console.error("Full Error:", error);
        throw error;
      }
    } else {
      console.error("Validation Errors:", validator.errorMessages);
      setErrors(validator.errorMessages);
    }
  };

  // Handle new invoice
  const handleNewInvoice = (newInvoice) => {
    setInvoices((prev) => [...prev, newInvoice]);
    setShowNewInvoice(false);
  };

  // Calculate future interest
  const calculateFutureInterest = (selectedDate) => {
    if (!selectedDate) return;

    const startDate = moment();
    const endDate = moment(selectedDate);
    const totalDays = endDate.diff(startDate, "days");
    const balance = Number(currentBalance || 0);
    const interestRate = Number(formValue?.interest_rate || 0) / 100;
    const interestType = formValue?.interest_type?.value;

    let results = {
      startDate: startDate.format("DD MMM YYYY"),
      endDate: endDate.format("DD MMM YYYY"),
      totalDays,
      originalAmount: balance,
      interestType: formValue?.interest_type?.label,
      interestRate: formValue?.interest_rate + "%",
      breakdown: [],
    };

    let finalAmount = balance;

    if (interestType === "1") {
      const months = endDate.diff(startDate, "months");
      for (let i = 1; i <= months; i++) {
        const monthDate = startDate.clone().add(i, "months");
        const monthlyInterest = finalAmount * (interestRate / 12);
        finalAmount += monthlyInterest;
        results.breakdown.push({
          date: monthDate.format("DD MMM YYYY"),
          principal: finalAmount - monthlyInterest,
          interest: monthlyInterest,
          total: finalAmount,
        });
      }
    } else {
      const years = totalDays / 365;
      const totalInterest = balance * interestRate * years;
      finalAmount = balance + totalInterest;
      for (let i = 1; i <= Math.ceil(years * 4); i++) {
        const quarterDate = startDate.clone().add(i * 3, "months");
        if (quarterDate.isAfter(endDate)) break;
        const quarterlyInterest = totalInterest / Math.ceil(years * 4);
        results.breakdown.push({
          date: quarterDate.format("DD MMM YYYY"),
          principal: balance,
          interest: quarterlyInterest,
          total: balance + quarterlyInterest * i,
        });
      }
    }

    results.totalInterest = finalAmount - balance;
    results.finalAmount = finalAmount;
    setFutureInterestResults(results);
  };

  // Future Interest Test Modal
  const FutureInterestTestModal = () => (
    <Modal
      visible={showFutureInterestTest}
      animationType="slide"
      onRequestClose={() => setShowFutureInterestTest(false)}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View className="flex-row justify-between items-center p-4 bg-primary">
          <TouchableOpacity onPress={() => setShowFutureInterestTest(false)}>
            <AntDesign name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold">Test Future Interest</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView className="p-4">
          <View className="mb-6">
            <Text className="text-gray-6 text-xs tracking-wider pb-1">Select Future Date</Text>
            <TouchableOpacity
              onPress={() => handleModalState("futureDatePicker", true)}
              className="items-center px-2 py-3 rounded-lg border-gray-5 border flex flex-row justify-between"
            >
              <Text>{futureDate ? moment(futureDate).format("DD MMM YYYY") : "Select Date"}</Text>
              <DatePickerComponent
                name="futureDate"
                open={modalState.futureDatePicker}
                value={futureDate}
                handleClose={() => handleModalState("futureDatePicker", false)}
                onSelect={({ value }) => {
                  setFutureDate(value);
                  handleModalState("futureDatePicker", false);
                  calculateFutureInterest(value);
                }}
              />
            </TouchableOpacity>
          </View>
          {futureInterestResults && (
            <View className="bg-gray-50 rounded-lg p-4">
              <View className="mb-4 border-b border-gray-200 pb-4">
                <Text className="text-lg font-semibold mb-2">Summary</Text>
                <Text>Period: {futureInterestResults.startDate} to {futureInterestResults.endDate}</Text>
                <Text>Days: {futureInterestResults.totalDays}</Text>
                <Text>Interest Type: {futureInterestResults.interestType}</Text>
                <Text>Interest Rate: {futureInterestResults.interestRate}</Text>
              </View>
              <View className="mb-4 border-b border-gray-200 pb-4">
                <Text className="text-lg font-semibold mb-2">Totals</Text>
                <Text>Principal Amount: ₹{handleDigitsFix(futureInterestResults.originalAmount)}</Text>
                <Text>Total Interest: ₹{handleDigitsFix(futureInterestResults.totalInterest)}</Text>
                <Text className="text-lg font-bold mt-2">Final Amount: ₹{handleDigitsFix(futureInterestResults.finalAmount)}</Text>
              </View>
              <View>
                <Text className="text-lg font-semibold mb-2">Breakdown</Text>
                <ScrollView style={{ maxHeight: 300 }}>
                  {futureInterestResults.breakdown.map((item, index) => (
                    <View key={index} className="flex-row justify-between py-2 border-b border-gray-100">
                      <Text className="text-sm">{item.date}</Text>
                      <View>
                        <Text className="text-sm text-right">Principal: ₹{handleDigitsFix(item.principal)}</Text>
                        <Text className="text-sm text-right text-green-600">+₹{handleDigitsFix(item.interest)} interest</Text>
                        <Text className="text-sm font-bold text-right">Total: ₹{handleDigitsFix(item.total)}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  // Handle add product
  const handleAddProduct = useCallback(() => {
    const currentInvoice = invoices[invoices.length - 1];
    const newProduct = {
      name: currentInvoice.name || "New Item",
      huid: currentInvoice.huid || "",
      size: currentInvoice.size || "",
      hsn_id: currentInvoice.hsn_id || null,
      comment: currentInvoice.comment || "",
      piece: currentInvoice.piece || "0",
      gross_weight: currentInvoice.gross_weight || "0",
      less_weight: currentInvoice.less_weight || "0",
      net_weight: currentInvoice.net_weight || "0",
      tounch: currentInvoice.tounch || "0",
      fine_weight: currentInvoice.fine_weight || "0",
      rate: typeof currentInvoice.rate === "object" ? currentInvoice.rate.price : currentInvoice.rate || "0",
      cutting_enabled: currentInvoice.cutting_enabled || false,
      valuation: currentInvoice.valuation || "0",
      making_charge: currentInvoice.making_charge || "0",
      charges_json: currentInvoice.charges_json || [],
      tax_json: currentInvoice.tax_json || [],
      net_price: currentInvoice.net_price || "0",
      product_id: Math.random().toString(36).substring(2, 9),
    };

    const existingProducts = formValue?.selectedProduct || [];
    const updatedFormValue = {
      ...formValue,
      selectedProduct: [...existingProducts, newProduct],
      totalPrice: handleDigitsFix(
        existingProducts.reduce((sum, item) => sum + Number(item.net_price || 0), 0) + Number(newProduct.net_price || 0)
      ),
      valuation: handleDigitsFix(
        existingProducts.reduce((sum, item) => sum + Number(item.valuation || 0), 0) + Number(newProduct.valuation || 0)
      ),
    };

    setFormValue(updatedFormValue);
    setInvoices([
      {
        less_by_type: { label: "Weight", value: "weight" },
        less_weight: "0",
        loan_percentage: "0",
      },
    ]);

    props.navigation.navigate("LoanItemsList", {
      formValue: updatedFormValue,
      setFormValue: (newValue) => {
        console.log("Updating form value:", newValue);
        setFormValue(newValue);
      },
    });
  }, [invoices, formValue, props.navigation]);

  // Handle form value updates from route params
  useEffect(() => {
    if (props.route?.params?.formValue) {
      console.log("Received form value from route:", props.route.params.formValue);
      setFormValue(props.route.params.formValue);
    }
  }, [props.route?.params?.formValue]);

  // Remove invoice row
  const removeInvoiceRow = (index) => {
    setInvoices((prev) => {
      const updatedInvoices = prev.filter((_, i) => i !== index);
      const totalValuation = updatedInvoices.reduce(
        (total, invoice) => total + Number(invoice.valuation || 0),
        0
      );
      setFormValue((prev) => ({
        ...prev,
        valuation: handleDigitsFix(totalValuation),
      }));
      return updatedInvoices;
    });
  };

  return (
    <Fragment>
      <KeyboardHanlder>
        {/* Header section */}
        <View className="bg-primary/10 px-5 py-3">
          <View className="mb-4">
            <Text className="text-xs font-semibold text-yellow-600 mb-1">Gold</Text>
            <View className="flex pt-1 flex-row justify-between border-b border-yellow-200 pb-2">
              <View>
                <Text className="font-semibold tracking-wide">{handleDigitsFix(goldCalculations.grossWeight)} g</Text>
                <Text className="tracking-wide">Gross Weight</Text>
              </View>
              <View>
                <Text className="font-semibold tracking-wide">{handleDigitsFix(goldCalculations.fineWeight)} g</Text>
                <Text className="tracking-wide">Fine Weight</Text>
              </View>
              <View className="flex">
                <Text className="font-semibold tracking-wide">₹{handleDigitsFix(goldCalculations.value)}</Text>
                <Text className="tracking-wide">Value</Text>
              </View>
            </View>
          </View>
          <View>
            <Text className="text-xs font-semibold text-gray-400 mb-1">Silver</Text>
            <View className="flex pt-1 flex-row justify-between">
              <View>
                <Text className="font-semibold tracking-wide">{handleDigitsFix(silverCalculations.grossWeight)} g</Text>
                <Text className="tracking-wide">Gross Weight</Text>
              </View>
              <View>
                <Text className="font-semibold tracking-wide">{handleDigitsFix(silverCalculations.fineWeight)} g</Text>
                <Text className="tracking-wide">Fine Weight</Text>
              </View>
              <View className="flex">
                <Text className="font-semibold tracking-wide">₹{handleDigitsFix(silverCalculations.value)}</Text>
                <Text className="tracking-wide">Value</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Valuation, Total Interest, and Total Amount */}
        <View className="px-4 pt-2.5 pb-4 flex-row justify-between">
          <View className="flex-1 pr-2">
            <InputBox
              name="valuation"
              placeholder="Calculated value"
              label="Valuation"
              value={handleDigitsFix(formValue.valuation)}
              keyboardType="numeric"
              readOnly={true}
              customBorder={true}
            />
          </View>
          <View className="flex-1 px-2">
            <InputBox
              name="total_interest"
              placeholder="Total interest"
              label="Total Interests"
              value={handleDigitsFix(Number(formValue.interest_amount || 0))}
              // value={handleDigitsFix(Number(formValue.interest_amount || 0) + Number(formValue.loan_by_valuation || 0))}

              keyboardType="numeric"
              readOnly={true}
              customBorder={true}
            />
          </View>
          <View className="flex-1 pl-2">
            <InputBox
              name="total_amount"
              placeholder="Total amount"
              label="Total Amount"
              value={handleDigitsFix(Number(formValue.loan_by_valuation || 0) + Number(formValue.interest_amount || 0))}
              keyboardType="numeric"
              readOnly={true}
              customBorder={true}
            />
          </View>
        </View>

        {/* Order Photo Upload */}
        <View className="px-4 pt-2.5 pb-4">
          <Text className="text-slate-500 text-[13px] mb-1">Order Photo</Text>
          <View className="flex flex-row">
            <ImagePickerComponent
              onChange={({ value }) => handleInputChange("photo", value)}
              value={formValue.photo}
              name="photo"
            />
            <Text className="ml-3 text-gray-500 self-center">Upload a photo of the order</Text>
          </View>
        </View>

        {/* Select items */}
        <View>
          {invoices.map((invoice, index) => {
            const isSelectRate = invoice?.hsn_id?.variation?.length > 0;
            return (
              <View
                key={index}
                className={`px-4 pt-2.5 pb-4 ${index % 2 !== 0 && "bg-gray-50"}`}
              >
                <View className="flex items-start flex-row">
                  <ImagePickerComponent
                    onChange={({ value }) => handleInvoiceChange(index, "image", value)}
                    value={invoice?.image}
                    name="image"
                  />
                  <View className="w-5/6 pl-3">
                    <SearchProduct
                      productValue={invoice}
                      setProductValue={(event) => handleInvoiceChange(index, "name", event?.name)}
                      handleProductDetail={(data) => handleProductDetail(index, data)}
                    />
                  </View>
                </View>
                <View className="mb-4 flex flex-row">
                  <View className="w-1/3 pr-1">
                    <SelectInput
                      label="HSN Name"
                      name="hsn_id"
                      value={invoice.hsn_id}
                      placeholder="Select"
                      data={productGroups.map((item) => ({
                        label: item.name,
                        value: item.id,
                        variation: item.variation_data,
                      }))}
                      onSelect={(value) => handleInvoiceChange(index, "hsn_id", value)}
                    />
                  </View>
                  <View className="w-1/3 px-1">
                    <InputBox
                      name="gross_weight"
                      placeholder="0"
                      label="Gross Weight"
                      value={invoice.gross_weight}
                      keyboardType="numeric"
                      onChange={({ value }) => handleInvoiceChange(index, "gross_weight", value)}
                    />
                  </View>
                  <View className="w-1/3 pl-1">
                    <InputBox
                      name="tounch"
                      placeholder="0 %"
                      label="Tounch (in %)"
                      value={invoice.tounch}
                      keyboardType="numeric"
                      onChange={({ value }) => handleInvoiceChange(index, "tounch", value)}
                    />
                  </View>
                </View>
                <View className="mb-4 flex flex-row">
                  <View className="w-1/3 pr-1">
                    <SelectInput
                      label="Less By"
                      name="less_by_type"
                      value={invoice.less_by_type}
                      placeholder="Select"
                      data={[
                        { label: "Percentage", value: "percentage" },
                        { label: "Weight", value: "weight" },
                      ]}
                      onSelect={(value) => handleInvoiceChange(index, "less_by_type", value)}
                    />
                  </View>
                  <View className="w-1/3 px-1">
                    <InputBox
                      name="less_weight"
                      placeholder="0"
                      label={invoice.less_by_type?.value === "percentage" ? "Less %" : "Less Weight"}
                      value={invoice.less_weight}
                      keyboardType="numeric"
                      onChange={({ value }) => {
                        if (invoice.less_by_type?.value === "percentage") {
                          const lessWeightValue = (Number(invoice.gross_weight || 0) * Number(value || 0)) / 100;
                          handleInvoiceChange(index, "less_weight", lessWeightValue.toString());
                        } else {
                          handleInvoiceChange(index, "less_weight", value);
                        }
                      }}
                    />
                  </View>
                  <View className="w-1/3 pl-1">
                    <InputBox
                      name="net_weight"
                      label="Net Weight"
                      placeholder="0"
                      readOnly={true}
                      value={invoice.net_weight}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View className="mb-4 flex-wrap flex-row">
                  <View className="w-1/3 pr-1">
                    <InputBox
                      name="fine_weight"
                      label="Fine Weight"
                      placeholder="0.000"
                      readOnly={true}
                      value={invoice.fine_weight || "0.000"}
                      keyboardType="numeric"
                    />
                  </View>
                  <View className="w-1/3 px-1">
                    <Text className="text-slate-500 text-[13px] mb-1">Cutting</Text>
                    <View className="bg-gray-100 rounded-lg">
                      <CommonButton
                        title={invoice.cutting_enabled ? "ON" : "OFF"}
                        onPress={() => {
                          const updatedInvoices = [...invoices];
                          updatedInvoices[index] = {
                            ...updatedInvoices[index],
                            cutting_enabled: !updatedInvoices[index].cutting_enabled,
                          };
                          const fine = Number(updatedInvoices[index].fine_weight || 0);
                          const rate = isSelectRate
                            ? Number(updatedInvoices[index]?.rate?.price || 0)
                            : Number(updatedInvoices[index]?.rate || 0);
                          updatedInvoices[index].valuation = !updatedInvoices[index].cutting_enabled
                            ? "0"
                            : handleDigitsFix(fine * rate);
                          setInvoices(updatedInvoices);
                        }}
                        isFilled={invoice.cutting_enabled}
                        small
                      />
                    </View>
                  </View>
                  <View className="w-1/3 pl-1">
                    <InputBox
                      name="piece"
                      label="Piece"
                      placeholder="0"
                      value={invoice.piece}
                      keyboardType="numeric"
                      onChange={({ value }) => handleInvoiceChange(index, "piece", value)}
                    />
                  </View>
                  <View className="w-1/3 pl-1 pt-2">
                    {isSelectRate ? (
                      <SelectInput
                        label="Rate"
                        name="rate"
                        value={invoice?.rate}
                        placeholder="Select Rate"
                        data={invoice?.hsn_id?.variation?.map((item) => ({
                          label: `${item.name} ( ${item.price} )`,
                          value: item.id,
                          price: item.price,
                        }))}
                        onSelect={(value) => handleInvoiceChange(index, "rate", value)}
                      />
                    ) : (
                      <InputBox
                        name="rate"
                        label="Rate"
                        placeholder="0.00"
                        readOnly={true}
                        value={invoice?.rate}
                        onChange={({ value }) => handleInvoiceChange(index, "rate", value)}
                        keyboardType="numeric"
                      />
                    )}
                  </View>
                  <View className="w-1/3 pl-1 pt-2">
                    <InputBox
                      name="net_price"
                      placeholder="0"
                      label="Net Price"
                      readOnly={true}
                      value={invoice.net_price}
                    />
                  </View>
                </View>
                <View className="mb-4 flex flex-row">
                  <View className="w-1/3 pr-1">
                    <InputBox
                      name="making_charge"
                      label="Making Charges"
                      placeholder="0"
                      value={invoice.making_charge}
                      keyboardType="numeric"
                      onChange={({ value }) => handleInvoiceChange(index, "making_charge", value)}
                    />
                  </View>
                  <View className="w-1/3 px-1">
                    <InputBox
                      name="additional_charge"
                      label="Additional Charges"
                      placeholder="0"
                      value={invoice.additional_charge}
                      keyboardType="numeric"
                      onChange={({ value }) => handleInvoiceChange(index, "additional_charge", value)}
                    />
                  </View>
                  <View className="w-1/3 pl-1">
                    <InputBox
                      name="tax_rate"
                      label="Tax Rate (%)"
                      placeholder="0"
                      value={invoice.tax_rate}
                      keyboardType="numeric"
                      onChange={({ value }) => handleInvoiceChange(index, "tax_rate", value)}
                    />
                  </View>
                </View>
                <View className="mb-4">
                  <View className="mb-5">
                    <View className="flex flex-row items-center justify-between">
                      <Text className="tracking-wider text-base">Charges</Text>
                      <View className="flex flex-row items-center">
                        <Switch
                          value={invoice?.showChargesInBill || false}
                          onValueChange={(value) => handleInvoiceChange(index, "showChargesInBill", value)}
                          trackColor={{ false: "red", true: "green" }}
                          thumbColor={invoice?.showChargesInBill ? "#ffffff" : "#f4f3f4"}
                        />
                        <TouchableOpacity
                          onPress={() => {
                            const updatedInvoices = [...invoices];
                            if (!updatedInvoices[index].charges_json) {
                              updatedInvoices[index].charges_json = [];
                            }
                            updatedInvoices[index].charges_json.push({ name: "", amount: "" });
                            setInvoices(updatedInvoices);
                          }}
                          activeOpacity={0.7}
                          className="bg-primary ml-2 w-6 h-6 flex justify-center items-center rounded-full shadow-xl"
                        >
                          <FontAwesome6 name="plus" size={17} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {(invoice?.charges_json || []).map((charge, chargeIndex) => (
                      <View key={chargeIndex} className="flex pt-2 pl-1 items-end flex-row">
                        <View className="w-[45%] pr-2">
                          <OutlineInput
                            placeholder="e.g. Labour Charge"
                            value={charge.name}
                            onChangeText={(value) => {
                              const updatedInvoices = [...invoices];
                              updatedInvoices[index].charges_json[chargeIndex].name = value;
                              if (value.toLowerCase().includes("labour") || value.toLowerCase().includes("labor")) {
                                const pieces = Number(updatedInvoices[index].piece || 0);
                                const ratePerPiece = Number(updatedInvoices[index].charges_json[chargeIndex].amount || 0);
                                updatedInvoices[index].charges_json[chargeIndex].calculatedAmount = (pieces * ratePerPiece).toString();
                              }
                              setInvoices(updatedInvoices);
                            }}
                          />
                        </View>
                        <View className="w-[45%] px-2">
                          <OutlineInput
                            placeholder="e.g. 500"
                            value={charge.amount}
                            keyboardType="numeric"
                            onChangeText={(value) => {
                              const updatedInvoices = [...invoices];
                              updatedInvoices[index].charges_json[chargeIndex].amount = value;
                              if (charge.name.toLowerCase().includes("labour") || charge.name.toLowerCase().includes("labor")) {
                                const pieces = Number(updatedInvoices[index].piece || 0);
                                const ratePerPiece = Number(value || 0);
                                updatedInvoices[index].charges_json[chargeIndex].calculatedAmount = (pieces * ratePerPiece).toString();
                              }
                              setInvoices(updatedInvoices);
                            }}
                          />
                          {(charge.name.toLowerCase().includes("labour") || charge.name.toLowerCase().includes("labor")) && (
                            <Text className="text-xs text-gray-500 mt-1">
                              Total: ₹{handleDigitsFix(Number(charge.calculatedAmount || 0))} ({invoice.piece || 0} × ₹{charge.amount || 0})
                            </Text>
                          )}
                        </View>
                        {(invoice?.charges_json || []).length > 1 && (
                          <TouchableOpacity
                            onPress={() => {
                              const updatedInvoices = [...invoices];
                              updatedInvoices[index].charges_json = updatedInvoices[index].charges_json.filter((_, i) => i !== chargeIndex);
                              setInvoices(updatedInvoices);
                            }}
                            activeOpacity={0.7}
                            className="w-[10%] flex justify-center pl-3"
                          >
                            <FontAwesome6 name="trash" size={15} color="red" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                  <View className="">
                    <View className="flex flex-row items-center justify-between">
                      <Text className="tracking-wider text-base">Tax</Text>
                      <View className="flex flex-row items-center">
                        <Switch
                          value={invoice?.showTaxInBill || false}
                          onValueChange={(value) => handleInvoiceChange(index, "showTaxInBill", value)}
                          trackColor={{ false: "red", true: "green" }}
                          thumbColor={invoice?.showTaxInBill ? "#ffffff" : "#f4f3f4"}
                        />
                        <TouchableOpacity
                          onPress={() => {
                            const updatedInvoices = [...invoices];
                            if (!updatedInvoices[index].tax_json) {
                              updatedInvoices[index].tax_json = [];
                            }
                            updatedInvoices[index].tax_json.push({ name: "", amount: "" });
                            setInvoices(updatedInvoices);
                          }}
                          activeOpacity={0.7}
                          className="bg-primary ml-2 w-6 h-6 flex justify-center items-center rounded-full shadow-xl"
                        >
                          <FontAwesome6 name="plus" size={17} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {(invoice?.tax_json || []).map((tax, taxIndex) => (
                      <View key={taxIndex} className="flex pt-2 pl-1 items-end flex-row">
                        <View className="w-[45%] pr-2">
                          <OutlineInput
                            placeholder="e.g. Tax"
                            value={tax.name}
                            onChangeText={(value) => {
                              const updatedInvoices = [...invoices];
                              updatedInvoices[index].tax_json[taxIndex].name = value;
                              setInvoices(updatedInvoices);
                            }}
                          />
                        </View>
                        <View className="w-[45%] px-2">
                          <OutlineInput
                            placeholder="e.g. 10%"
                            value={tax.amount}
                            keyboardType="numeric"
                            onChangeText={(value) => {
                              const updatedInvoices = [...invoices];
                              updatedInvoices[index].tax_json[taxIndex].amount = value;
                              setInvoices(updatedInvoices);
                            }}
                          />
                        </View>
                        {(invoice?.tax_json || []).length > 1 && (
                          <TouchableOpacity
                            onPress={() => {
                              const updatedInvoices = [...invoices];
                              updatedInvoices[index].tax_json = updatedInvoices[index].tax_json.filter((_, i) => i !== taxIndex);
                              setInvoices(updatedInvoices);
                            }}
                            activeOpacity={0.7}
                            className="w-[10%] flex justify-center pl-3"
                          >
                            <FontAwesome6 name="trash" size={15} color="red" />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
                <View className="flex items-end flex-row">
                  <View className={invoices?.length > 1 && "w-[82%]"}>
                    <InputBox
                      name="comment"
                      multiLine={true}
                      label="Comment"
                      value={invoice?.comment}
                      onChange={({ value }) => handleInvoiceChange(index, "comment", value)}
                    />
                  </View>
                  {invoices?.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeInvoiceRow(index)}
                      className="w-1/6 ml-auto py-2.5 rounded-md bg-red-500 flex justify-center items-center"
                    >
                      <AntDesign name="delete" size={20} color="white" />
                    </TouchableOpacity>
                  )}
                </View>
                <View className="mt-4 items-center">
                  <Text className="text-slate-500 text-[13px] mb-1">Payment Receipt Photo</Text>
                  <View className="flex flex-row items-center">
                    <ImagePickerComponent
                      onChange={({ value }) => handleInvoiceChange(index, "receipt_photo", value)}
                      value={invoice?.receipt_photo}
                      name="receipt_photo"
                    />
                    <Text className="ml-3 text-gray-500">Upload payment receipt</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Amount & Interest */}
        <View className="bg-primary/10 px-5 py-3">
          <View className="flex flex-row pb-4">
            <View className="w-2/3 pr-1">
              <SelectInput
                label="Interest Type"
                name="interest_type"
                placeholder="Select"
                value={formValue?.interest_type}
                data={[
                  { label: "Flat", value: "2" },
                  { label: "Compound Interest", value: "1" },
                ]}
                onSelect={(value) => handleInputChange("interest_type", value)}
                error={errors?.interest_type}
              />
              {validator.message("interest_type", formValue?.interest_type, "required")}
            </View>
            <View className="w-1/3 pl-1">
              <InputBox
                name="interest_rate"
                label="Interest (%)"
                placeholder="0%"
                keyboardType="numeric"
                value={formValue?.interest_rate}
                onChange={({ value }) => handleInputChange("interest_rate", value)}
                error={errors?.interest_rate}
              />
              {validator.message("interest_rate", formValue?.interest_rate, "required")}
            </View>
          </View>
          <View className="flex flex-row pb-4">
            {formValue?.interest_type?.value === "1" && (
              <View className="w-2/3 pr-1">
                <SelectInput
                  label="Interest Duration"
                  name="interest_duration"
                  placeholder="Select Duration"
                  value={formValue?.interest_duration}
                  data={[
                    { label: "1 Year", value: "12" },
                    { label: "6 Months", value: "6" },
                    { label: "3 Months", value: "3" },
                    { label: "Daily", value: "daily" },
                  ]}
                  onSelect={handleInterestDurationChange}
                  error={errors?.interest_duration}
                />
                {validator.message(
                  "interest_duration",
                  formValue?.interest_duration,
                  formValue?.interest_type?.value === "1" ? "required" : ""
                )}
              </View>
            )}
            {formValue?.interest_type?.value === "2" && (
              <View className="w-2/3 pr-1">
                <Text className="text-gray-6 text-xs tracking-wider pb-1">Interest End Date</Text>
                <TouchableOpacity
                  onPress={() => handleModalState("flatInterestDatePicker", true)}
                  className="items-center px-2 py-3 rounded-lg border-gray-5 border flex flex-row justify-between"
                >
                  <Text>
                    {formValue?.interest_upto ? moment(formValue.interest_upto).format("DD MMM YYYY") : "Select Date"}
                  </Text>
                  <AntDesign name="calendar" size={20} color="#666" />
                </TouchableOpacity>
                <DatePickerComponent
                  name="interest_upto"
                  open={modalState.flatInterestDatePicker}
                  value={formValue?.interest_upto}
                  handleClose={() => handleModalState("flatInterestDatePicker", false)}
                  onSelect={({ value }) => {
                    handleInputChange("interest_upto", moment(value).format("YYYY-MM-DD"));
                    handleModalState("flatInterestDatePicker", false);
                  }}
                />
              </View>
            )}
          </View>
          {formValue?.interest_type?.value === "2" && formValue?.interest_upto && (
            <View className="bg-gray-50 p-3 mb-4 rounded-lg">
              <View className="flex flex-row justify-between items-center">
                <View>
                  <Text className="text-sm text-gray-600">Flat Interest Calculation</Text>
                  <Text className="text-xs text-gray-500">
                    {moment().format("DD MMM YYYY")} to {moment(formValue.interest_upto).format("DD MMM YYYY")}
                  </Text>
                </View>
                <View>
                  <Text className="text-sm font-semibold text-primary">
                    {Math.max(0, moment(formValue.interest_upto).diff(moment(), "days"))} days
                  </Text>
                </View>
              </View>
              <View className="mt-2">
                <Text className="text-xs text-gray-500">
                  Loan by Valuation: ₹{handleDigitsFix(formValue.loan_by_valuation)}
                </Text>
                <Text className="text-xs text-gray-500">Interest Rate: {formValue?.interest_rate}%</Text>
                <Text className="text-xs text-gray-500">
                  Time Period: {(moment(formValue.interest_upto).diff(moment(), "days") / 365).toFixed(2)} years
                </Text>
                <Text className="text-xs font-bold text-gray-600 mt-1">
                  Formula: Loan by Valuation × Interest Rate × Time Period
                </Text>
              </View>
            </View>
          )}
          {formValue?.interest_type?.value === "1" && formValue?.interest_duration?.value !== "daily" && formValue?.interest_amount !== "0" && (
            <View className="bg-gray-50 p-3 mb-4 rounded-lg">
              <Text className="text-sm font-semibold text-gray-600 mb-2">Compound Interest Example</Text>
              <Text className="text-xs text-gray-500">Loan by Valuation: ₹{handleDigitsFix(formValue.loan_by_valuation)}</Text>
              <Text className="text-xs text-gray-500">Interest Rate: {formValue?.interest_rate}% per annum</Text>
              <Text className="text-xs text-gray-500">Duration: {formValue?.interest_duration?.label}</Text>
              <View className="mt-2 border-t border-gray-200 pt-2">
                <Text className="text-xs text-gray-500">Step-by-step calculation:</Text>
                <Text className="text-xs text-gray-500">• Principal: ₹{handleDigitsFix(formValue.loan_by_valuation)}</Text>
                <Text className="text-xs text-gray-500">
                  • Year 1: ₹{handleDigitsFix(formValue.loan_by_valuation)} × {formValue?.interest_rate}% = ₹{handleDigitsFix(formValue.loan_by_valuation * (Number(formValue?.interest_rate || 0) / 100))} interest
                </Text>
                <Text className="text-xs text-gray-500">
                  • New Principal: ₹{handleDigitsFix(formValue.loan_by_valuation * (1 + Number(formValue?.interest_rate || 0) / 100))}
                </Text>
                {parseInt(formValue?.interest_duration?.value || "12") > 12 && (
                  <Text className="text-xs text-gray-500">
                    • Year 2: ₹{handleDigitsFix(formValue.loan_by_valuation * (1 + Number(formValue?.interest_rate || 0) / 100))} × {formValue?.interest_rate}% = ₹{handleDigitsFix(formValue.loan_by_valuation * (1 + Number(formValue?.interest_rate || 0) / 100) * (Number(formValue?.interest_rate || 0) / 100))} interest
                  </Text>
                )}
              </View>
              <View className="mt-2 border-t border-gray-200 pt-2">
                <Text className="text-xs font-semibold">Total interest: ₹{formValue?.interest_amount}</Text>
                <Text className="text-xs font-semibold">Total repayable: ₹{handleDigitsFix(Number(formValue.loan_by_valuation || 0) + Number(formValue?.interest_amount || 0))}</Text>
              </View>
            </View>
          )}
          {formValue?.interest_type?.value === "1" && formValue?.interest_duration?.value !== "daily" && (
            <View className="bg-gray-50 p-3 mb-4 rounded-lg">
              <View className="flex flex-row justify-between items-center">
                <View>
                  <Text className="text-sm text-gray-600">Next Interest Calculation</Text>
                  <Text className="text-xs text-gray-500">
                    {moment().add(parseInt(formValue?.interest_duration?.value), "months").format("DD MMM YYYY")}
                  </Text>
                </View>
                <View>
                  <Text className="text-sm font-semibold text-primary">
                    {Math.max(0, moment().add(parseInt(formValue?.interest_duration?.value), "months").diff(moment(), "days"))} days remaining
                  </Text>
                </View>
              </View>
              <View className="mt-2">
                <Text className="text-xs text-gray-500">Principal Amount: ₹{handleDigitsFix(Number(currentBalance || 0))}</Text>
                <Text className="text-xs text-gray-500">Loan by Valuation: ₹{handleDigitsFix(formValue.loan_by_valuation)}</Text>
                <Text className="text-xs text-gray-500">
                  Current Total: ₹{handleDigitsFix(Number(formValue.loan_by_valuation || 0) + Number(formValue?.interest_amount || 0))}
                </Text>
                <Text className="text-xs text-gray-500">
                  Next Interest ({formValue?.interest_rate}%): ₹{handleDigitsFix(formValue.loan_by_valuation * (Number(formValue?.interest_rate || 0) / 100))}
                </Text>
                <Text className="text-xs text-gray-500">Duration: {formValue?.interest_duration?.label}</Text>
              </View>
            </View>
          )}
          {formValue?.interest_type?.value === "1" && formValue?.interest_duration?.value === "daily" && formValue?.interest_upto && (
            <View className="bg-gray-50 p-3 mb-4 rounded-lg">
              <Text className="text-sm font-semibold text-gray-600 mb-2">Daily Interest Breakdown</Text>
              <View className="max-h-40 overflow-scroll">
                {formValue?.dailyBreakdown?.map((day, index) => (
                  <View key={index} className="flex flex-row justify-between py-1 border-b border-gray-200">
                    <Text className="text-xs text-gray-500">{day.date}</Text>
                    <View>
                      <Text className="text-xs text-gray-500">Principal: ₹{handleDigitsFix(day.principal)}</Text>
                      <Text className="text-xs text-gray-500">Interest: +₹{handleDigitsFix(day.interest)}</Text>
                      <Text className="text-xs font-semibold text-gray-600">Total: ₹{handleDigitsFix(day.total)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
          <View className="flex-row">
            {formValue?.interest_duration?.value === "daily" && (
              <View className="w-1/3 pr-1">
                <Text className="text-gray-6 text-xs tracking-wider pb-1">Interest Upto</Text>
                <TouchableOpacity
                  onPress={() => handleModalState("datePicker", true)}
                  className="items-center px-2 py-3 rounded-lg border-gray-5 border flex flex-row justify-between"
                >
                  <Text>
                    {formValue?.interest_upto ? moment(formValue.interest_upto).format("DD MMM YYYY") : "Select Date"}
                  </Text>
                  <DatePickerComponent
                    name="interest_upto"
                    open={modalState.datePicker}
                    value={formValue?.interest_upto}
                    handleClose={() => handleModalState("datePicker", false)}
                    onSelect={({ value }) => {
                      handleInputChange("interest_upto", value);
                      handleModalState("datePicker", false);
                    }}
                  />
                </TouchableOpacity>
              </View>
            )}
            <View className={`${formValue?.interest_duration?.value === "daily" ? "w-1/3 px-1" : "w-1/2 pr-1"}`}>
              <InputBox
                name="interest_amount"
                label="Interest Amount"
                placeholder="0.00"
                value={handleDigitsFix(Number(formValue?.interest_amount || 0))}
                readOnly={true}
              />
            </View>
            <View className={`${formValue?.interest_duration?.value === "daily" ? "w-1/3 pl-1" : "w-1/2 pl-1"}`}>
              <InputBox
                name="loan_amount"
                label="Loan Amount"
                placeholder="0.00"
                keyboardType="numeric"
                value={formValue?.loan_amount}
                onChange={handleLoanAmountChange}
              />
              <View className="mt-2">
                <InputBox
                  name="loan_percentage"
                  label="Loan Percentage (%)"
                  placeholder="0%"
                  keyboardType="numeric"
                  value={formValue?.loan_percentage}
                  onChange={handleLoanAmountChange}
                />
                <InputBox
                  name="loan_by_valuation"
                  label="Loan by Valuation"
                  placeholder="0.00"
                  readOnly={true}
                  value={handleDigitsFix(formValue?.loan_by_valuation || "0")}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Modals */}
        <Modal visible={showNewInvoice} animationType="slide" onRequestClose={() => setShowNewInvoice(false)}>
          <SingleInvoiceForm
            initialData={{
              interest_rate: formValue.interest_rate,
              interest_type: formValue.interest_type,
              interest_duration: formValue.interest_duration,
              start_date: moment().format("YYYY-MM-DD"),
              next_calculation_date: moment().add(1, "year").format("YYYY-MM-DD"),
            }}
            onSave={handleNewInvoice}
            onClose={() => setShowNewInvoice(false)}
          />
        </Modal>
        <Modal visible={showItemsList} animationType="slide" onRequestClose={() => setShowItemsList(false)}>
          <LoanItemsList
            navigation={props.navigation}
            route={props.route}
            onClose={() => setShowItemsList(false)}
            formValue={formValue}
            setFormValue={setFormValue}
          />
        </Modal>
        <Modal visible={showBill} animationType="slide" onRequestClose={() => setShowBill(false)}>
          <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
            <View className="flex-row justify-between items-center p-4 bg-primary">
              <TouchableOpacity onPress={() => setShowBill(false)}>
                <AntDesign name="close" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-lg font-semibold">Invoice Bill</Text>
              <TouchableOpacity onPress={() => { /* TODO: Implement actual printing */ }}>
                <AntDesign name="printer" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <ProfessionalInvoiceBill data={data} invoices={invoices} formValue={formValue} payments={[]} />
            </ScrollView>
          </SafeAreaView>
        </Modal>
        <FutureInterestTestModal />

        {/* Buttons */}
        <View className="px-4 pt-2 flex flex-row">
          <View className="w-[45%] pr-3">
            <CommonButton onPress={handleSubmitInvoice} loading={loading} title="Submit" />
          </View>
          <View className="w-[20%] pr-3">
            <CommonButton onPress={handleAddProduct} title="Add Item" />
          </View>
          <View className="w-[35%]">
            <CommonButton onPress={() => setShowBill(true)} title="Print" />
          </View>
        </View>
      </KeyboardHanlder>
    </Fragment>
  );
};

export default InvoiceForm;