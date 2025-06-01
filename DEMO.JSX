// // // // // // import InputBox from "@/src/components/common/InputBox";
// // // // // // import React, { Fragment, useEffect, useState } from "react";
// // // // // // import { View, TouchableOpacity, Switch, Modal, SafeAreaView, ScrollView, Alert, BackHandler, FlatList, Text, Platform } from "react-native";
// // // // // // import { useDispatch, useSelector } from "react-redux";
// // // // // // import SimpleReactValidator from "simple-react-validator";
// // // // // // import CommonButton from "@/src/components/common/buttons/CommonButton";
// // // // // // import SelectInput from "@/src/components/common/SelectInput";
// // // // // // import ImagePickerComponent from "@/src/components/common/ImagePicker";
// // // // // // import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
// // // // // // import {
// // // // // //   fetchProductDetail,
// // // // // //   fetchProductGroups,
// // // // // //   manageProductList,
// // // // // //   fetchProductList,
// // // // // // } from "@/src/redux/actions/product.action";
// // // // // // import KeyboardHanlder from "@/src/components/common/KeyboardHanlder";
// // // // // // import CreateMetalModal from "./CreateMetalModal";
// // // // // // import AddWeightModal from "./AddWeightModal";
// // // // // // import OutlineInput from "@/src/components/common/OutlineInput";
// // // // // // import SearchProduct from "./SearchProduct";
// // // // // // import { makingTypes } from "@/src/utils";
// // // // // // import AntDesign from "@expo/vector-icons/AntDesign";
// // // // // // import moment from "moment";
// // // // // // import DatePickerComponent from "@/src/components/common/DateTimePicker";
// // // // // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // // // // import { useFocusEffect } from "@react-navigation/native";
// // // // // // import { getToken } from "@/src/utils/auth";
// // // // // // import { ApiRequest } from "@/src/utils/api";
// // // // // // import { MANAGE_PRODUCT_API, MANAGE_LOGS_API, MANAGE_BILL_API } from "@/src/utils/api/endpoints";
// // // // // // import ShowToast from "@/src/components/common/ShowToast";

// // // // // // // process sale and purchase data
// // // // // // export function processProductData(productData, prefix, isFromInvoice) {
// // // // // //   return productData.map((item) => {
// // // // // //     const processedItem = {
// // // // // //       gross_weight: 0,
// // // // // //       less_weight: 0,
// // // // // //       net_weight: 0,
// // // // // //       net_price: 0,
// // // // // //       wastage: 0,
// // // // // //       tounch: 0,
// // // // // //       fine_weight: 0,
// // // // // //       rate: 0,
// // // // // //       making_type: "",
// // // // // //       charges_json: [{}],
// // // // // //       tax_json: [{}],
// // // // // //     };
// // // // // //     for (const key in item) {
// // // // // //       if (key.startsWith(prefix)) {
// // // // // //         // Remove the prefix and map the key
// // // // // //         const newKey = key.replace(prefix, "");
// // // // // //         processedItem[newKey] = key.includes("_json")
// // // // // //           ? (() => {
// // // // // //               try {
// // // // // //                 return JSON.parse(item[key].replace(/'/g, '"'));
// // // // // //               } catch (e) {
// // // // // //                 console.error("Invalid JSON string:", item[key]);
// // // // // //                 return [{}];
// // // // // //               }
// // // // // //             })()
// // // // // //           : key === "making_type"
// // // // // //           ? makingTypes.find((type) => type.value === item[key]) || ""
// // // // // //           : item[key];
// // // // // //       }
// // // // // //     }
// // // // // //     return processedItem;
// // // // // //   });
// // // // // // }

// // // // // // // Storage key for form data
// // // // // // const PRODUCT_FORM_STORAGE_KEY = "productForm_savedState";

// // // // // // // At the top of the file, after the imports
// // // // // // const USE_MOCK_DATA = true;

// // // // // // const ProductForm = ({
// // // // // //   navigation,
// // // // // //   route,
// // // // // //   isFromInvoice = false,
// // // // // //   invoiceHandler,
// // // // // //   handleCancel,
// // // // // // }) => {
// // // // // //   const updateData = route?.params?.updateData;
// // // // // //   const isBillEdit = route?.params?.isBillEdit;
// // // // // //   const billType = route?.params?.billType;
// // // // // //   const dispatch = useDispatch();
// // // // // //   const [errors, setErrors] = useState({});
// // // // // //   const [initialState, setInitialState] = useState({
// // // // // //     metalModal: false,
// // // // // //     weightModal: false,
// // // // // //     datePicker: false,
// // // // // //     billDatePicker: false,
// // // // // //     paymentDatePicker: false,
// // // // // //     interestStartDatePicker: false
// // // // // //   });
// // // // // //   const [customFieldModal, setCustomFieldModal] = useState(false);
// // // // // //   const [tempCustomField, setTempCustomField] = useState({
// // // // // //     label: "",
// // // // // //     value: "",
// // // // // //     unit: "",
// // // // // //     showInBill: true
// // // // // //   });
// // // // // //   const [dataLoaded, setDataLoaded] = useState(false);
// // // // // //   const [formChanged, setFormChanged] = useState(false);
// // // // // //   const [loading, setLoading] = useState(false);
// // // // // //   const [showSuggestions, setShowSuggestions] = useState(false);
// // // // // //   const [filteredProducts, setFilteredProducts] = useState([]);
// // // // // //   const { productGroups, isLoading: productLoading, productDetail, products } = useSelector(
// // // // // //     (state) => state.productSlices
// // // // // //   );
// // // // // //   const validator = new SimpleReactValidator();
// // // // // //   const productTypes = ["purchase", "sale"];

// // // // // //   // Get the type based on invoice handler
// // // // // //   const formType = isFromInvoice 
// // // // // //     ? (invoiceHandler?.isPurchase ? "purchase" : "sale")
// // // // // //     : "purchase";

// // // // // //   // Default initial product state
// // // // // //   const defaultProductState = {
// // // // // //     type: formType, // Use determined type
// // // // // //     size: "",
// // // // // //     // Interest Configuration
// // // // // //     interest_enabled: false,
// // // // // //     interest_type: { label: "Flat", value: "2" },
// // // // // //     interest_rate: "2",
// // // // // //     interest_amount: "0",
    
// // // // // //     // Dates
// // // // // //     bill_date: new Date(),
// // // // // //     payment_date: null,
// // // // // //     interest_start_date: null,
// // // // // //     interest_upto: null,
    
// // // // // //     // Grace Period
// // // // // //     grace_period_enabled: false,
// // // // // //     grace_period_days: "0",
    
// // // // // //     // Amount Tracking
// // // // // //     original_amount: "0",
// // // // // //     remaining_balance: "0",
    
// // // // // //     // Notes and History
// // // // // //     interest_notes: "",
// // // // // //     payment_history: [],
    
// // // // // //     // Rest of existing state
// // // // // //     cutting_enabled: false,
// // // // // //     sale: {
// // // // // //       gross_weight: 0,
// // // // // //       less_weight: 0,
// // // // // //       net_weight: 0,
// // // // // //       net_price: 0,
// // // // // //       wastage: 0,
// // // // // //       tounch: 0,
// // // // // //       fine_weight: 0,
// // // // // //       rate: 0,
// // // // // //       metal_value: "0",
// // // // // //       making_type: "",
// // // // // //       photo: null,
// // // // // //       charges_json: [{}],
// // // // // //       tax_json: [{}],
// // // // // //       showSizeInBill: true,
// // // // // //       showGrossWeightInBill: true,
// // // // // //       showLessWeightInBill: true,
// // // // // //       showNetWeightInBill: true,
// // // // // //       showWastageInBill: true,
// // // // // //       showTounchInBill: true,
// // // // // //       showFineWeightInBill: true,
// // // // // //       showRateInBill: true,
// // // // // //       showMakingChargeInBill: true,
// // // // // //       showHuidInBill: true,
// // // // // //       showHsnInBill: true,
// // // // // //       showPriceInBill: true,
// // // // // //       showTaxInBill: true,
// // // // // //       showChargesInBill: true,
// // // // // //       showCommentInBill: true,
// // // // // //     },
// // // // // //     purchase: {
// // // // // //       gross_weight: 0,
// // // // // //       less_weight: 0,
// // // // // //       net_weight: 0,
// // // // // //       net_price: 0,
// // // // // //       wastage: 0,
// // // // // //       tounch: 0,
// // // // // //       fine_weight: 0,
// // // // // //       rate: 0,
// // // // // //       metal_value: "0",
// // // // // //       making_type: "",
// // // // // //       photo: null,
// // // // // //       charges_json: [{}],
// // // // // //       tax_json: [{}],
// // // // // //       showSizeInBill: true,
// // // // // //       showGrossWeightInBill: true,
// // // // // //       showLessWeightInBill: true,
// // // // // //       showNetWeightInBill: true,
// // // // // //       showWastageInBill: true,
// // // // // //       showTounchInBill: true,
// // // // // //       showFineWeightInBill: true,
// // // // // //       showRateInBill: true,
// // // // // //       showMakingChargeInBill: true,
// // // // // //       showHuidInBill: true,
// // // // // //       showHsnInBill: true,
// // // // // //       showPriceInBill: true,
// // // // // //       showTaxInBill: true,
// // // // // //       showChargesInBill: true,
// // // // // //       showCommentInBill: true,
// // // // // //     },
// // // // // //   };

// // // // // //   const [product, setProduct] = useState(defaultProductState);

// // // // // //   // Save form data to AsyncStorage
// // // // // //   const saveFormData = async (formData) => {
// // // // // //     try {
// // // // // //       await AsyncStorage.setItem(PRODUCT_FORM_STORAGE_KEY, JSON.stringify(formData));
// // // // // //       console.log("Form data saved to AsyncStorage");
// // // // // //       setFormChanged(true);
// // // // // //     } catch (error) {
// // // // // //       console.error("Error saving form data:", error);
// // // // // //     }
// // // // // //   };

// // // // // //   // Load form data from AsyncStorage
// // // // // //   const loadFormData = async () => {
// // // // // //     try {
// // // // // //       const savedData = await AsyncStorage.getItem(PRODUCT_FORM_STORAGE_KEY);
// // // // // //       if (savedData) {
// // // // // //         const parsedData = JSON.parse(savedData);
// // // // // //         console.log("Loaded saved form data");
// // // // // //         setProduct(parsedData);
// // // // // //       }
// // // // // //       setDataLoaded(true);
// // // // // //     } catch (error) {
// // // // // //       console.error("Error loading form data:", error);
// // // // // //       setDataLoaded(true);
// // // // // //     }
// // // // // //   };

// // // // // //   // Effect to load form data on component mount
// // // // // //   useEffect(() => {
// // // // // //     // If we're updating an existing product, use that data
// // // // // //     if (updateData?.id) {
// // // // // //       dispatch(fetchProductDetail({ id: updateData.id }));
// // // // // //       setDataLoaded(true);
// // // // // //     } else {
// // // // // //       // Otherwise, try to load saved form data
// // // // // //       loadFormData();
// // // // // //     }
// // // // // //   }, []);

// // // // // //   const isSelectRate = product?.hsn_id?.variation?.length > 0;

// // // // // //   // Add this formatting function at the top of the component
// // // // // //   const handleDigitsFix = (value) => {
// // // // // //     if (!value || isNaN(value)) return "0.00";
// // // // // //     return parseFloat(value).toFixed(2);
// // // // // //   };

// // // // // //   // Add jewelry units array
// // // // // //   const jewelryUnits = [
// // // // // //     { label: "Grams (g)", value: "g" },
// // // // // //     { label: "Milligrams (mg)", value: "mg" },
// // // // // //     { label: "Carats (ct)", value: "ct" },
// // // // // //     { label: "Pieces (pcs)", value: "pcs" },
// // // // // //     { label: "Inches (in)", value: "in" },
// // // // // //     { label: "Millimeters (mm)", value: "mm" },
// // // // // //     { label: "Percentage (%)", value: "%" }
// // // // // //   ];

// // // // // //   // Add this function before handleInputChange
// // // // // //   const calculateTotalChargesAndTaxes = (category) => {
// // // // // //     let totalCharges = 0;
// // // // // //     let totalTaxPercentage = 0;

// // // // // //     // Calculate the sum of charges
// // // // // //     if (category.charges_json) {
// // // // // //       totalCharges = category.charges_json.reduce(
// // // // // //         (sum, charge) => sum + (Number(charge.amount) || 0),
// // // // // //         0
// // // // // //       );
// // // // // //     }

// // // // // //     // Calculate the sum of tax percentages
// // // // // //     if (category.tax_json) {
// // // // // //       totalTaxPercentage = category.tax_json.reduce(
// // // // // //         (sum, tax) => sum + (Number(tax.amount) || 0),
// // // // // //         0
// // // // // //       );
// // // // // //     }

// // // // // //     return { totalCharges, totalTaxPercentage };
// // // // // //   };

// // // // // //   // onchange and calculation of product
// // // // // //   const handleInputChange = (name, value, category) => {
// // // // // //     // Create a copy of the current product state
// // // // // //     const updatedProduct = { ...product };
    
// // // // // //     // Update the changed field
// // // // // //     updatedProduct[category][name] = value;
  
// // // // // //     // Calculate dependent fields
// // // // // //     if (['gross_weight', 'less_weight'].includes(name)) {
// // // // // //       // Calculate net_weight when gross or less weight changes
// // // // // //       const gross = parseFloat(updatedProduct[category].gross_weight) || 0;
// // // // // //       const less = parseFloat(updatedProduct[category].less_weight) || 0;
// // // // // //       updatedProduct[category].net_weight = (gross - less).toFixed(3);
// // // // // //     }
  
// // // // // //     if (['net_weight', 'tounch'].includes(name)) {
// // // // // //       // Calculate fine_weight when net weight or tounch changes
// // // // // //       const net = parseFloat(updatedProduct[category].net_weight) || 0;
// // // // // //       const tounch = parseFloat(updatedProduct[category].tounch) || 0;
// // // // // //       updatedProduct[category].fine_weight = ((net * tounch) / 100).toFixed(3);
// // // // // //     }
  
// // // // // //     if (name === 'wastage') {
// // // // // //       // Handle wastage calculations separately if needed
// // // // // //       // Add any wastage-related calculations here
// // // // // //     }
  
// // // // // //     // Update the state with the new values
// // // // // //     setProduct(updatedProduct);
  
// // // // // //     // Clear error for the changed field
// // // // // //     if (errors[name]) {
// // // // // //       setErrors(prev => ({ ...prev, [name]: null }));
// // // // // //     }
// // // // // //   };

// // // // // //   const handleInitialState = (name, value) => {
// // // // // //     setInitialState({ ...initialState, [name]: value });
// // // // // //   };

// // // // // //   // handle submit issue
// // // // // //   const handleSubmit = async () => {
// // // // // //     try {
// // // // // //       if (!product.name) {
// // // // // //         ShowToast("Product name is required");
// // // // // //       return;
// // // // // //     }

// // // // // //       setLoading(true);

// // // // // //       // Create FormData instance
// // // // // //       const formData = new FormData();

// // // // // //       // Basic product details
// // // // // //       formData.append('name', product.name || '');
// // // // // //       formData.append('huid', product.huid || '');
// // // // // //       formData.append('hsn_id', product.hsn_id?.value || '');
// // // // // //       formData.append('bar_code', product.bar_code || '');
// // // // // //       formData.append('comment', product.comment || '');
// // // // // //       formData.append('image', product.image || '');

// // // // // //       // Sale details
// // // // // //       formData.append('sale_gross_weight', product.sale.gross_weight?.toString() || '0');
// // // // // //       formData.append('sale_less_weight', product.sale.less_weight?.toString() || '0');
// // // // // //       formData.append('sale_net_weight', product.sale.net_weight?.toString() || '0');
// // // // // //       formData.append('sale_wastage', product.sale.wastage?.toString() || '0');
// // // // // //       formData.append('sale_tounch', product.sale.tounch?.toString() || '0');
// // // // // //       formData.append('sale_fine_weight', product.sale.fine_weight?.toString() || '0');
// // // // // //       formData.append('sale_rate', (typeof product.sale.rate === 'object' ? product.sale.rate?.price : product.sale.rate)?.toString() || '0');
// // // // // //       formData.append('sale_making_type', product.sale.making_type?.value || 'PG');
// // // // // //       formData.append('sale_making_charges', product.sale.making_charge?.toString() || '0');
// // // // // //       formData.append('sale_net_price', product.sale.net_price?.toString() || '0');
// // // // // //       formData.append('sale_piece', '1');

// // // // // //       // Purchase details
// // // // // //       formData.append('purchase_gross_weight', product.purchase.gross_weight?.toString() || '0');
// // // // // //       formData.append('purchase_less_weight', product.purchase.less_weight?.toString() || '0');
// // // // // //       formData.append('purchase_net_weight', product.purchase.net_weight?.toString() || '0');
// // // // // //       formData.append('purchase_wastage', product.purchase.wastage?.toString() || '0');
// // // // // //       formData.append('purchase_tounch', product.purchase.tounch?.toString() || '0');
// // // // // //       formData.append('purchase_fine_weight', product.purchase.fine_weight?.toString() || '0');
// // // // // //       formData.append('purchase_rate', (typeof product.purchase.rate === 'object' ? product.purchase.rate?.price : product.purchase.rate)?.toString() || '0');
// // // // // //       formData.append('purchase_making_type', product.purchase.making_type?.value || 'PG');
// // // // // //       formData.append('purchase_making_charges', product.purchase.making_charge?.toString() || '0');
// // // // // //       formData.append('purchase_net_price', product.purchase.net_price?.toString() || '0');
// // // // // //       formData.append('purchase_piece', '1');

// // // // // //       // Additional charges and tax
// // // // // //       formData.append('sale_charges_json', JSON.stringify(product.sale.charges_json || []));
// // // // // //       formData.append('sale_tax_json', JSON.stringify(product.sale.tax_json || []));
// // // // // //       formData.append('purchase_charges_json', JSON.stringify(product.purchase.charges_json || []));
// // // // // //       formData.append('purchase_tax_json', JSON.stringify(product.purchase.tax_json || []));

// // // // // //       // If updating, append the ID
// // // // // //       if (updateData?.id) {
// // // // // //         formData.append('id', updateData.id.toString());
// // // // // //       }

// // // // // //       // Format timestamp for log
// // // // // //       const now = new Date();
// // // // // //       const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');

// // // // // //       // Make API calls simultaneously
// // // // // //       const [productResponse, logResponse] = await Promise.all([
// // // // // //         // Product creation/update API
// // // // // //         ApiRequest({
// // // // // //           url: updateData?.id ? MANAGE_PRODUCT_API.update : MANAGE_PRODUCT_API.create,
// // // // // //         method: 'POST',
// // // // // //         body: formData,
// // // // // //         headers: {
// // // // // //           'Content-Type': 'multipart/form-data',
// // // // // //           }
// // // // // //         }),

// // // // // //         // Log creation API
// // // // // //         ApiRequest({
// // // // // //           url: MANAGE_LOGS_API.create,
// // // // // //           method: 'POST',
// // // // // //           body: {
// // // // // //             userName: profileData?.name || 'Unknown User',
// // // // // //             productName: product.name || 'Unknown Product',
// // // // // //             id: updateData?.id || 0,
// // // // // //             type: 'product',
// // // // // //             amount: parseFloat(product[product.type]?.net_price || 0).toFixed(2),
// // // // // //             action: updateData?.id ? 'UPDATE' : 'CREATE',
// // // // // //             entityType: 'PRODUCT',
// // // // // //             timestamp: timestamp,
// // // // // //             metadata: JSON.stringify({
// // // // // //               action: updateData?.id ? 'Updated product' : 'Created new product',
// // // // // //               productId: product.product_id,
// // // // // //               note: `${updateData?.id ? 'Updated' : 'Created'} product: ${product.name}`,
// // // // // //               formData: {
// // // // // //                 sale_gross_weight: product.sale.gross_weight,
// // // // // //                 sale_net_weight: product.sale.net_weight,
// // // // // //                 sale_fine_weight: product.sale.fine_weight,
// // // // // //                 sale_net_price: product.sale.net_price
// // // // // //               }
// // // // // //             })
// // // // // //           }
// // // // // //         })
// // // // // //       ]);

// // // // // //       if (!productResponse?.success) {
// // // // // //         throw new Error(productResponse?.message || "Failed to save product");
// // // // // //       }

// // // // // //       if (!logResponse?.success) {
// // // // // //         console.error("Warning: Product saved but log creation failed:", logResponse?.message);
// // // // // //         ShowToast("Product saved but logging failed");
// // // // // //       } else {
// // // // // //         ShowToast(productResponse.message || (updateData ? "Product updated successfully" : "Product created successfully"));
// // // // // //       }

// // // // // //       navigation.goBack();
// // // // // //     } catch (error) {
// // // // // //       console.error('Error details:', error);
// // // // // //       ShowToast(error.message || "Error saving product");
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   // Modify the submit button click handler
// // // // // //   const onSubmitClick = () => {
// // // // // //     // Check if we are in update mode by checking both route params and updateData
// // // // // //     const isUpdate = route?.params?.isProductEdit || updateData?.id;
    
// // // // // //     if (isUpdate) {
// // // // // //       // For update operations
// // // // // //       const formData = new FormData();
// // // // // //       formData.append('id', updateData?.id || route?.params?.id);
// // // // // //       handleUpdate();
// // // // // //     } else {
// // // // // //       // For create operations
// // // // // //       handleSubmit();
// // // // // //     }
// // // // // //   };

// // // // // //   // Override the reset function to also clear saved form data
// // // // // //   const resetProduct = async () => {
// // // // // //     // Confirm before clearing all form data
// // // // // //     Alert.alert(
// // // // // //       "Reset Form",
// // // // // //       "Are you sure you want to reset all form values?",
// // // // // //       [
// // // // // //         {
// // // // // //           text: "Cancel",
// // // // // //           style: "cancel"
// // // // // //         },
// // // // // //         {
// // // // // //           text: "Reset",
// // // // // //           onPress: async () => {
// // // // // //             try {
// // // // // //               await AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY);
// // // // // //               console.log("Form data cleared during reset");
// // // // // //               setProduct(defaultProductState);
// // // // // //               setFormChanged(false);
// // // // // //             } catch (error) {
// // // // // //               console.error("Error clearing form data:", error);
// // // // // //             }
// // // // // //           }
// // // // // //         }
// // // // // //       ]
// // // // // //     );
// // // // // //   };

// // // // // //   // handle charges & texes field -- start
// // // // // //   const addItem = (type, key) => {
// // // // // //     setProduct((prev) => ({
// // // // // //       ...prev,
// // // // // //       [type]: {
// // // // // //         ...prev[type],
// // // // // //         [key]: [
// // // // // //           ...prev[type][key],
// // // // // //           key === "charges"
// // // // // //             ? { name: "", amount: "" }
// // // // // //             : { name: "", amount: "" },
// // // // // //         ],
// // // // // //       },
// // // // // //     }));
// // // // // //   };

// // // // // //   // remove charge-tax input
// // // // // //   const removeChargeTaxInput = (type, key, index) => {
// // // // // //     setProduct((prev) => {
// // // // // //       const updatedCategory = { ...prev[type] };
// // // // // //       const itemToRemove = updatedCategory[key].find((item, i) => i === index);
// // // // // //       updatedCategory[key] = updatedCategory[key].filter(
// // // // // //         (item, i) => i !== index
// // // // // //       );

// // // // // //       updatedCategory.net_price =
// // // // // //         Number(updatedCategory.net_price) - Number(itemToRemove.amount);

// // // // // //       return {
// // // // // //         ...prev,
// // // // // //         [type]: updatedCategory,
// // // // // //       };
// // // // // //     });
// // // // // //   };

// // // // // //   // handle charges & taxes field -- end

// // // // // //   // handle produt type tab change
// // // // // //   const handleProductTypeChange = (type) => {
// // // // // //     const isSale = type === "sale";
// // // // // //     setProduct((prev) => {
// // // // // //       const updatedSale = isSale
// // // // // //         ? {
// // // // // //             ...prev.purchase,
// // // // // //             gross_weight: prev?.sale?.gross_weight || 0,
// // // // // //             less_weight: prev?.sale?.less_weight || 0,
// // // // // //             net_weight: prev?.sale?.net_weight || 0,
// // // // // //             net_price: prev?.sale?.net_price || 0,
// // // // // //           }
// // // // // //         : prev.sale;

// // // // // //       return { ...prev, sale: updatedSale, type };
// // // // // //     });
// // // // // //   };

// // // // // //   // update product detail
// // // // // //   const handleProductDetail = (data) => {
// // // // // //     const {
// // // // // //       name,
// // // // // //       hsn_id,
// // // // // //       huid,
// // // // // //       comment,
// // // // // //       image_url,
// // // // // //       sale_product_data,
// // // // // //       purchase_product_data,
// // // // // //     } = data;

// // // // // //     const purchase = processProductData(
// // // // // //       purchase_product_data,
// // // // // //       "purchase_",
// // // // // //       isFromInvoice
// // // // // //     );
// // // // // //     const sale = processProductData(sale_product_data, "sale_", isFromInvoice);
// // // // // //     const hsnName = productGroups.filter((item) => item.id == hsn_id)?.[0];
// // // // // //     setProduct({
// // // // // //       ...product,
// // // // // //       ...(isFromInvoice
// // // // // //         ? { product_id: data.id, product_name: data.name }
// // // // // //         : {}),
// // // // // //       name,
// // // // // //       huid,
// // // // // //       comment,
// // // // // //       image: image_url || "",
// // // // // //       hsn_id: { label: hsnName?.name, value: hsnName?.id },
// // // // // //       sale: sale[0] || { charges_json: [{}], tax_json: [{}] },
// // // // // //       purchase: purchase[0] || { charges_json: [{}], tax_json: [{}] },
// // // // // //     });
// // // // // //   };

// // // // // //   // handle add product to invoice
// // // // // //   const handleAddProduct = () => {
// // // // // //     if (validator.allValid()) {
// // // // // //     const newProducts = [
// // // // // //       ...(invoiceHandler?.formValue?.selectedProduct || []),
// // // // // //       ];

// // // // // //       const { name, hsn_id, huid, comment, image, size } = product;
      
// // // // // //       // Create a more complete product object with proper structure
// // // // // //       const productData = {
// // // // // //         name,
// // // // // //         huid,
// // // // // //         size,
// // // // // //         hsn_id: hsn_id.value,
// // // // // //         comment,
// // // // // //         // Include both sale and purchase objects with complete data
// // // // // //         sale: product.sale || {},
// // // // // //         purchase: product.purchase || {},
// // // // // //         // Include the specific type data directly in the product for easier access
// // // // // //         ...product[product.type],
// // // // // //         // Include rate property at root level for backward compatibility
// // // // // //         rate: typeof product[product.type].rate === 'object' 
// // // // // //           ? product[product.type].rate.price 
// // // // // //           : product[product.type].rate,
// // // // // //         // Add generated product ID if not existing
// // // // // //         product_id: Math.random().toString(36).substring(2, 9)
// // // // // //       };

// // // // // //       // Add the new product to the array
// // // // // //       newProducts.push(productData);
      
// // // // // //       // Calculate the total price for all products
// // // // // //     const totalPrice = newProducts.reduce(
// // // // // //         (acc, product) => Number(acc) + Number(product[invoiceHandler?.isPurchase ? "purchase" : "sale"]?.net_price || 0),
// // // // // //         0
// // // // // //       );

// // // // // //       // Update the form value with the new products and total price
// // // // // //     invoiceHandler?.setFormValue({
// // // // // //       ...invoiceHandler?.formValue,
// // // // // //       selectedProduct: newProducts,
// // // // // //         totalPrice
// // // // // //     });

// // // // // //       // Clear saved form data from AsyncStorage
// // // // // //       AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY)
// // // // // //         .then(() => console.log("Form data cleared after adding product to invoice"))
// // // // // //         .catch(error => console.error("Error clearing form data:", error));

// // // // // //     resetProduct();
// // // // // //       setFormChanged(false);
      
// // // // // //       // Return to product list in the invoice flow
// // // // // //       if (invoiceHandler && invoiceHandler.onSubmit) {
// // // // // //         invoiceHandler.onSubmit();
// // // // // //       }
// // // // // //     } else {
// // // // // //       setErrors(validator.errorMessages);
// // // // // //     }
// // // // // //   };

// // // // // //   // update formvalue on update
// // // // // //   useEffect(() => {
// // // // // //     if (productDetail) {
// // // // // //       handleProductDetail(productDetail);
// // // // // //     }
// // // // // //   }, [productDetail]);

// // // // // //   useEffect(() => {
// // // // // //     resetProduct();
// // // // // //     dispatch(fetchProductGroups());
// // // // // //     if (updateData) {
// // // // // //       dispatch(fetchProductDetail(updateData?.id));
// // // // // //     }
// // // // // //   }, [dispatch, updateData]);

// // // // // //   // Add logging to see the actual API response
// // // // // //   useEffect(() => {
// // // // // //     if (productDetail) {
// // // // // //         console.log('Received product details:', productDetail);
// // // // // //         handleProductDetail(productDetail);
// // // // // //     }
// // // // // //   }, [productDetail]);

// // // // // //   // Add this function before calculateInterest
// // // // // //   const calculateInterestPeriod = (product) => {
// // // // // //     if (!product?.bill_date || !product?.payment_date) return 0;
    
// // // // // //     const startDate = product?.interest_start_date 
// // // // // //       ? moment(product.interest_start_date)
// // // // // //       : moment(product.bill_date);
      
// // // // // //     const endDate = moment(product.payment_date);
    
// // // // // //     // Calculate total days
// // // // // //     let days = endDate.diff(startDate, 'days');
    
// // // // // //     // Subtract grace period if enabled
// // // // // //     if (product?.grace_period_enabled) {
// // // // // //       days = Math.max(0, days - Number(product?.grace_period_days || 0));
// // // // // //     }
    
// // // // // //     return days;
// // // // // //   };

// // // // // //   const calculateInterest = (updatedProduct) => {
// // // // // //     if (!updatedProduct.interest_enabled) {
// // // // // //       return { interestAmount: 0, dailyBreakdown: [] };
// // // // // //     }

// // // // // //     const balance = parseFloat(updatedProduct[updatedProduct.type]?.net_price || 0);
// // // // // //     const interestRate = parseFloat(updatedProduct.interest_rate || 0) / 100;
// // // // // //     const interestType = updatedProduct.interest_type?.value;
    
// // // // // //     let interestAmount = 0;
// // // // // //     let dailyBreakdown = [];

// // // // // //     // Calculate the effective period considering grace period
// // // // // //     const days = calculateInterestPeriod(updatedProduct);
// // // // // //     if (days <= 0) return { interestAmount: 0, dailyBreakdown: [] };

// // // // // //     const timeInYears = days / 365;

// // // // // //     if (interestType === "2") { // Flat
// // // // // //       // Simple interest calculation
// // // // // //       interestAmount = balance * interestRate * timeInYears;
// // // // // //     } else if (interestType === "1") { // Compound
// // // // // //       // Compound interest calculation
// // // // // //       interestAmount = balance * (Math.pow(1 + interestRate, timeInYears) - 1);
// // // // // //     }

// // // // // //     return { interestAmount, dailyBreakdown };
// // // // // //   };

// // // // // //   // calculate tax on price change
// // // // // //   useEffect(() => {
// // // // // //     if (product?.sale && product?.purchase) {
// // // // // //       // Calculate total tax for sale
// // // // // //       if (product.sale.tax_json && product.sale.tax_json.length > 0) {
// // // // // //         const totalTax = product.sale.tax_json.reduce((sum, tax) => sum + Number(tax.amount || 0), 0);
// // // // // //         handleInputChange("tax", totalTax, "sale");
// // // // // //       }

// // // // // //       // Calculate total tax for purchase
// // // // // //       if (product.purchase.tax_json && product.purchase.tax_json.length > 0) {
// // // // // //         const totalTax = product.purchase.tax_json.reduce((sum, tax) => sum + Number(tax.amount || 0), 0);
// // // // // //         handleInputChange("tax", totalTax, "purchase");
// // // // // //       }
// // // // // //     }
// // // // // //   }, [product?.sale?.tax_json, product?.purchase?.tax_json]);

// // // // // //   // Update tax field whenever tax_json changes
// // // // // //   useEffect(() => {
// // // // // //     if (product?.sale?.tax_json?.length > 0) {
// // // // // //       const totalTax = product.sale.tax_json.reduce(
// // // // // //         (sum, tax) => sum + Number(tax.amount || 0),
// // // // // //         0
// // // // // //       );
// // // // // //       setProduct(prev => ({
// // // // // //         ...prev,
// // // // // //         sale: {
// // // // // //           ...prev.sale,
// // // // // //           tax: totalTax
// // // // // //         }
// // // // // //       }));
// // // // // //     }
    
// // // // // //     if (product?.purchase?.tax_json?.length > 0) {
// // // // // //       const totalTax = product.purchase.tax_json.reduce(
// // // // // //         (sum, tax) => sum + Number(tax.amount || 0),
// // // // // //         0
// // // // // //       );
// // // // // //       setProduct(prev => ({
// // // // // //         ...prev,
// // // // // //         purchase: {
// // // // // //           ...prev.purchase,
// // // // // //           tax: totalTax
// // // // // //         }
// // // // // //       }));
// // // // // //     }
// // // // // //   }, [product?.sale?.tax_json, product?.purchase?.tax_json]);

// // // // // //   // Effect to handle back button press
// // // // // //   useFocusEffect(
// // // // // //     React.useCallback(() => {
// // // // // //       const backAction = () => {
// // // // // //         if (formChanged) {
// // // // // //           Alert.alert(
// // // // // //             "Form Data Saved",
// // // // // //             isFromInvoice 
// // // // // //               ? "Your data has been saved. Do you want to return to the product list?" 
// // // // // //               : "Your entered data has been saved. You can continue editing later.",
// // // // // //             [
// // // // // //               { text: "Stay on Form", style: "cancel" },
// // // // // //               { 
// // // // // //                 text: isFromInvoice ? "Back to List" : "Go Back", 
// // // // // //                 onPress: () => {
// // // // // //                   if (isFromInvoice && handleCancel) {
// // // // // //                     // In invoice flow, use handleCancel to return to product list
// // // // // //                     handleCancel();
// // // // // //                   } else {
// // // // // //                     navigation.goBack();
// // // // // //                   }
// // // // // //                 }
// // // // // //               }
// // // // // //             ]
// // // // // //           );
// // // // // //           return true;
// // // // // //         } else if (isFromInvoice && handleCancel) {
// // // // // //           // If no changes but in invoice flow, use handleCancel
// // // // // //           handleCancel();
// // // // // //           return true;
// // // // // //         }
// // // // // //         return false;
// // // // // //       };

// // // // // //       const backHandler = BackHandler.addEventListener(
// // // // // //         "hardwareBackPress",
// // // // // //         backAction
// // // // // //       );

// // // // // //       return () => backHandler.remove();
// // // // // //     }, [formChanged, navigation, isFromInvoice, handleCancel])
// // // // // //   );

// // // // // //   // Add this effect after the other useEffect hooks
// // // // // //   useEffect(() => {
// // // // // //     if (product?.interest_enabled) {
// // // // // //       const { interestAmount } = calculateInterest(product);
// // // // // //       handleInputChange("interest_amount", interestAmount.toString());
// // // // // //     }
// // // // // //   }, [
// // // // // //     product?.bill_date,
// // // // // //     product?.payment_date,
// // // // // //     product?.interest_start_date,
// // // // // //     product?.interest_rate,
// // // // // //     product?.interest_type?.value,
// // // // // //     product?.grace_period_enabled,
// // // // // //     product?.grace_period_days,
// // // // // //     product?.[product?.type]?.net_price
// // // // // //   ]);

// // // // // //   // Update the useEffect that handles updateData
// // // // // //   useEffect(() => {
// // // // // //     if (updateData) {
// // // // // //       console.log('Received updateData:', updateData);
      
// // // // // //       // Create the initial product state with the mock data
// // // // // //       const initialProductState = {
// // // // // //         ...defaultProductState,
// // // // // //         id: updateData.id,
// // // // // //         type: updateData.type,
// // // // // //         name: updateData.name,
// // // // // //         huid: updateData.huid,
// // // // // //         hsn_id: updateData.hsn_id,
// // // // // //         size: updateData.size,
// // // // // //         remark: updateData.remark,
// // // // // //         comment: updateData.comment,
// // // // // //         image: updateData.image,
// // // // // //         additional_image: updateData.additional_image,
// // // // // //         cutting_enabled: updateData.cutting_enabled,
// // // // // //         interest_enabled: updateData.interest_enabled,
// // // // // //         interest_type: updateData.interest_type,
// // // // // //         interest_rate: updateData.interest_rate,
// // // // // //         interest_amount: updateData.interest_amount,
// // // // // //         bill_date: updateData.bill_date,
// // // // // //         payment_date: updateData.payment_date,
// // // // // //         interest_start_date: updateData.interest_start_date,
// // // // // //         grace_period_enabled: updateData.grace_period_enabled,
// // // // // //         grace_period_days: updateData.grace_period_days,
// // // // // //         interest_notes: updateData.interest_notes,
// // // // // //         [updateData.type]: {
// // // // // //           gross_weight: updateData.gross_weight,
// // // // // //           less_weight: updateData.less_weight,
// // // // // //           net_weight: updateData.net_weight,
// // // // // //           wastage: updateData.wastage,
// // // // // //           tounch: updateData.tounch,
// // // // // //           fine_weight: updateData.fine_weight,
// // // // // //           rate: updateData.rate,
// // // // // //           making_type: updateData.making_type,
// // // // // //           making_charge: updateData.making_charge,
// // // // // //           metal_value: updateData.metal_value,
// // // // // //           charges_json: updateData.charges_json || [{}],
// // // // // //           tax_json: updateData.tax_json || [{}],
// // // // // //           custom_fields: updateData.custom_fields || [],
// // // // // //           ...updateData.bill_display_settings
// // // // // //         }
// // // // // //       };

// // // // // //       console.log('Setting initial product state:', initialProductState);
// // // // // //       setProduct(initialProductState);
// // // // // //       setDataLoaded(true);
// // // // // //     } else {
// // // // // //       loadFormData();
// // // // // //     }
// // // // // //   }, [updateData]);

// // // // // //   // Add this to get user info
// // // // // //   const { profileData } = useSelector((state) => state.userSlices);

// // // // // //   // Create log entry helper function
// // // // // //   const createLogEntry = async (product, action, responseData) => {
// // // // // //     try {
// // // // // //       await ApiRequest({
// // // // // //         url: MANAGE_LOGS_API.create,
// // // // // //         method: 'POST',
// // // // // //         body: {
// // // // // //           userName: profileData?.name || "Unknown User",
// // // // // //           productName: product.name,
// // // // // //           id: responseData.id,
// // // // // //           type: product.type.toLowerCase(),
// // // // // //           amount: (product[product.type]?.net_price || 0).toFixed(2),
// // // // // //           invoiceId: responseData.invoiceId || "",
// // // // // //           action: action,
// // // // // //           entityType: "PRODUCT",
// // // // // //           timestamp: new Date().toISOString(),
// // // // // //           metadata: JSON.stringify({
// // // // // //             customerName: product.customer_name || "",
// // // // // //             items: [{
// // // // // //               name: product.name,
// // // // // //               quantity: 1,
// // // // // //               price: (product[product.type]?.net_price || 0).toFixed(2)
// // // // // //             }],
// // // // // //             status: product.status || "active"
// // // // // //           })
// // // // // //         }
// // // // // //       });
// // // // // //     } catch (logError) {
// // // // // //       console.error(`${action} log failed:`, logError);
// // // // // //       ShowToast(logError.message || "Failed to create log entry");
// // // // // //     }
// // // // // //   };

// // // // // //   // Update the handleUpdate function
// // // // // //   const handleUpdate = async () => {
// // // // // //     try {
// // // // // //       if (!product.name) {
// // // // // //         ShowToast("Product name is required");
// // // // // //         return;
// // // // // //       }

// // // // // //       setLoading(true);

// // // // // //       // Create FormData instance
// // // // // //       const formData = new FormData();

// // // // // //       // Ensure we have the product ID for update
// // // // // //       const productId = updateData?.id || route?.params?.id;
// // // // // //       if (!productId) {
// // // // // //         throw new Error("Product ID is required for update");
// // // // // //       }

// // // // // //       // Basic product details
// // // // // //       formData.append('id', productId.toString());
// // // // // //       formData.append('name', product.name || '');
// // // // // //       formData.append('huid', product.huid || '');
// // // // // //       formData.append('hsn_id', product.hsn_id?.value || '');
// // // // // //       formData.append('comment', product.comment || '');

// // // // // //       // Only append image if it's a new image or changed
// // // // // //       if (product.image && typeof product.image === 'object' && product.image.uri) {
// // // // // //         formData.append('image', {
// // // // // //           uri: Platform.OS === 'ios' ? product.image.uri.replace('file://', '') : product.image.uri,
// // // // // //           type: 'image/jpeg',
// // // // // //           name: `product_${productId}_${Date.now()}.jpg`
// // // // // //         });
// // // // // //       }

// // // // // //       // Sale details with null checks
// // // // // //       if (product.sale) {
// // // // // //         formData.append('sale_gross_weight', (product.sale.gross_weight || 0).toString());
// // // // // //         formData.append('sale_less_weight', (product.sale.less_weight || 0).toString());
// // // // // //         formData.append('sale_net_weight', (product.sale.net_weight || 0).toString());
// // // // // //         formData.append('sale_wastage', (product.sale.wastage || 0).toString());
// // // // // //         formData.append('sale_tounch', (product.sale.tounch || 0).toString());
// // // // // //         formData.append('sale_fine_weight', (product.sale.fine_weight || 0).toString());
// // // // // //         formData.append('sale_rate', ((typeof product.sale.rate === 'object' ? product.sale.rate?.price : product.sale.rate) || 0).toString());
// // // // // //         formData.append('sale_making_type', product.sale.making_type?.value || 'PG');
// // // // // //         formData.append('sale_making_charges', (product.sale.making_charge || 0).toString());
// // // // // //         formData.append('sale_net_price', (product.sale.net_price || 0).toString());
// // // // // //       formData.append('sale_charges_json', JSON.stringify(product.sale.charges_json || []));
// // // // // //       formData.append('sale_tax_json', JSON.stringify(product.sale.tax_json || []));
// // // // // //       }

// // // // // //       // Purchase details with null checks
// // // // // //       if (product.purchase) {
// // // // // //         formData.append('purchase_gross_weight', (product.purchase.gross_weight || 0).toString());
// // // // // //         formData.append('purchase_less_weight', (product.purchase.less_weight || 0).toString());
// // // // // //         formData.append('purchase_net_weight', (product.purchase.net_weight || 0).toString());
// // // // // //         formData.append('purchase_wastage', (product.purchase.wastage || 0).toString());
// // // // // //         formData.append('purchase_tounch', (product.purchase.tounch || 0).toString());
// // // // // //         formData.append('purchase_fine_weight', (product.purchase.fine_weight || 0).toString());
// // // // // //         formData.append('purchase_rate', ((typeof product.purchase.rate === 'object' ? product.purchase.rate?.price : product.purchase.rate) || 0).toString());
// // // // // //         formData.append('purchase_making_type', product.purchase.making_type?.value || 'PG');
// // // // // //         formData.append('purchase_making_charges', (product.purchase.making_charge || 0).toString());
// // // // // //         formData.append('purchase_net_price', (product.purchase.net_price || 0).toString());
// // // // // //       formData.append('purchase_charges_json', JSON.stringify(product.purchase.charges_json || []));
// // // // // //       formData.append('purchase_tax_json', JSON.stringify(product.purchase.tax_json || []));
// // // // // //       }

// // // // // //       // Make API call to update product
// // // // // //       const response = await ApiRequest({
// // // // // //         url: MANAGE_PRODUCT_API.update,
// // // // // //         method: 'POST',
// // // // // //         body: formData,
// // // // // //         headers: {
// // // // // //           'Content-Type': 'multipart/form-data',
// // // // // //         }
// // // // // //       });

// // // // // //       if (!response?.success) {
// // // // // //         // Log the full error response for debugging
// // // // // //         console.log('Update API Error Response:', response);
// // // // // //         throw new Error(response?.message || response?.error || "Failed to update product");
// // // // // //       }

// // // // // //       // Create log entry for the update
// // // // // //       try {
// // // // // //         await ApiRequest({
// // // // // //           url: MANAGE_LOGS_API.create,
// // // // // //           method: 'POST',
// // // // // //           body: {
// // // // // //             userName: profileData?.name || 'Unknown User',
// // // // // //             productName: product.name,
// // // // // //             id: productId,
// // // // // //             type: 'product',
// // // // // //             amount: parseFloat(product[product.type]?.net_price || 0).toFixed(2),
// // // // // //             action: 'UPDATE',
// // // // // //             entityType: 'PRODUCT',
// // // // // //             timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
// // // // // //             metadata: JSON.stringify({
// // // // // //               action: 'Updated product',
// // // // // //               productId: productId,
// // // // // //               note: `Updated product: ${product.name}`
// // // // // //             })
// // // // // //           }
// // // // // //         });
// // // // // //       } catch (logError) {
// // // // // //         console.error("Failed to create update log:", logError);
// // // // // //         // Don't throw here, as the main update was successful
// // // // // //       }

// // // // // //       ShowToast(response.message || "Product updated successfully");
// // // // // //       navigation.goBack();
// // // // // //     } catch (error) {
// // // // // //       console.error('Update error details:', error);
// // // // // //       ShowToast(error.message || "Error updating product. Please try again.");
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   // Fetch products on mount
// // // // // //   useEffect(() => {
// // // // // //     dispatch(fetchProductList());
// // // // // //   }, []);

// // // // // //   const handleProductSelect = (selectedProduct) => {
// // // // // //     setProduct(prev => ({
// // // // // //       ...prev,
// // // // // //       ...selectedProduct,
// // // // // //       name: selectedProduct.name,
// // // // // //       huid: selectedProduct.huid,
// // // // // //       hsn_id: selectedProduct.hsn_id,
// // // // // //       image: selectedProduct.image_url,
// // // // // //       type: selectedProduct.type || prev.type
// // // // // //     }));
// // // // // //     setShowSuggestions(false);
// // // // // //   };

// // // // // //   return (
// // // // // //     <Fragment>
// // // // // //       <KeyboardHanlder>
// // // // // //         <View className="pt-4">
// // // // // //           {/* Section - 1 */}
// // // // // //           <View className="px-4">
// // // // // //             {/* image and name */}
// // // // // //             {isFromInvoice ? (
// // // // // //               <SearchProduct
// // // // // //                 productValue={product}
// // // // // //                 setProductValue={setProduct}
// // // // // //                 handleProductDetail={handleProductDetail}
// // // // // //               />
// // // // // //             ) : (
// // // // // //               <View className="flex mb-4 flex-row">
// // // // // //                 <ImagePickerComponent
// // // // // //                   onChange={({ value, name }) => handleInputChange(name, value)}
// // // // // //                   value={product?.image}
// // // // // //                   name="image"
// // // // // //                 />
// // // // // //                 <View className="w-5/6 pl-3">
// // // // // //                   <View className="relative">
// // // // // //                   <InputBox
// // // // // //                     name="name"
// // // // // //                     label="Name"
// // // // // //                     value={product?.name}
// // // // // //                       onChange={({ value, name }) => handleInputChange(name, value)}
// // // // // //                     error={errors?.name}
// // // // // //                   />
// // // // // //                   {validator.message("name", product?.name, "required")}
                    
// // // // // //                     {/* Suggestions Modal */}
// // // // // //                     {showSuggestions && filteredProducts.length > 0 && (
// // // // // //                       <View className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-40">
// // // // // //                         <FlatList
// // // // // //                           data={filteredProducts}
// // // // // //                           keyExtractor={item => item.id}
// // // // // //                           renderItem={({ item }) => (
// // // // // //                             <TouchableOpacity 
// // // // // //                               className="p-3 border-b border-gray-100"
// // // // // //                               onPress={() => handleProductSelect(item)}
// // // // // //                             >
// // // // // //                               <Text className="text-gray-800">{item.name}</Text>
// // // // // //                               {item.huid && (
// // // // // //                                 <Text className="text-xs text-gray-500">HUID: {item.huid}</Text>
// // // // // //                               )}
// // // // // //                             </TouchableOpacity>
// // // // // //                           )}
// // // // // //                         />
// // // // // //                       </View>
// // // // // //                     )}
// // // // // //                   </View>
// // // // // //                 </View>
// // // // // //               </View>
// // // // // //             )}

// // // // // //             {/* Remark field */}
// // // // // //             <View className="mb-4">
// // // // // //               <InputBox
// // // // // //                 name="remark"
// // // // // //                 label="Remark"
// // // // // //                 multiLine={true}
// // // // // //                 value={product?.remark}
// // // // // //                 onChange={({ value, name }) => handleInputChange(name, value)}
// // // // // //                 placeholder="Add a remark about this item..."
// // // // // //               />
// // // // // //             </View>

// // // // // //             {/* Photo Upload */}
// // // // // //               <View className="mb-4">
// // // // // //               <Text className="text-sm font-medium mb-1">Item Photo</Text>
// // // // // //                   <ImagePickerComponent
// // // // // //                 name="image"
// // // // // //                   value={product?.image || null}
// // // // // //                   onChange={({ value, name }) => {
// // // // // //                     // Ensure value is in the correct format or null
// // // // // //                     const safeValue = value ? {
// // // // // //                       uri: value.uri || null,
// // // // // //                       fileName: value.fileName || null,
// // // // // //                       mimeType: value.mimeType || 'image/jpeg'
// // // // // //                     } : null;
// // // // // //                     handleInputChange(name, safeValue);
// // // // // //                   }}
// // // // // //               />
// // // // // //               <Text className="text-xs text-gray-500 mt-1">Upload a photo of the item</Text>
// // // // // //                 </View>

// // // // // //             {/* Size field - New addition */}
// // // // // //             <View className="mb-4">
// // // // // //               <InputBox
// // // // // //                 name="size"
// // // // // //                 label="Size"
// // // // // //                 value={product?.size}
// // // // // //                 placeholder="e.g., 7, 8.5, Medium, 16mm"
// // // // // //                 onChange={({ value, name }) => handleInputChange(name, value)}
// // // // // //               />
// // // // // //               <View className="flex flex-row items-center justify-between mt-1">
// // // // // //                 <Text className="text-xs text-gray-500">Enter ring size, bangle diameter, etc.</Text>
// // // // // //                 <Switch
// // // // // //                   value={product?.[product.type]?.showSizeInBill || false}
// // // // // //                   onValueChange={(value) => handleInputChange("showSizeInBill", value, product.type)}
// // // // // //                   trackColor={{ false: "red", true: "green" }}
// // // // // //                   thumbColor={product?.[product.type]?.showSizeInBill ? "#ffffff" : "#f4f3f4"}
// // // // // //                 />
// // // // // //               </View>
// // // // // //             </View>

// // // // // //             {/* comment */}
// // // // // //             <View className="mb-4">
// // // // // //               <InputBox
// // // // // //                 multiLine={true}
// // // // // //                 name="comment"
// // // // // //                 label="Comment"
// // // // // //                 value={product?.comment}
// // // // // //                 onChange={({ value, name }) => handleInputChange(name, value)}
// // // // // //               />
// // // // // //               <View className="flex flex-row items-center justify-between mt-1">
// // // // // //                 <Text className="text-xs text-gray-500"></Text>
// // // // // //                 <Switch
// // // // // //                   value={product?.[product.type]?.showCommentInBill || false}
// // // // // //                   onValueChange={(value) => handleInputChange("showCommentInBill", value, product.type)}
// // // // // //                   trackColor={{ false: "red", true: "green" }}
// // // // // //                   thumbColor={product?.[product.type]?.showCommentInBill ? "#ffffff" : "#f4f3f4"}
// // // // // //                 />
// // // // // //               </View>
// // // // // //             </View>

// // // // // //             {/* product type */}
// // // // // //             <View className="flex mb-4 flex-row">
// // // // // //               {productTypes.map((type) => (
// // // // // //                 <View key={type} className={`w-1/2`}>
// // // // // //                   <View
// // // // // //                     className={`
// // // // // //                       py-2 
// // // // // //                       ${type === "sale" ? "ml-1.5" : "mr-1.5"}
// // // // // //                       border border-primary 
// // // // // //                       rounded-md 
// // // // // //                       flex flex-row 
// // // // // //                       justify-center 
// // // // // //                       items-center 
// // // // // //                       shadow-xl
// // // // // //                       ${product?.type === type ? "bg-primary" : "bg-white"}
// // // // // //                       relative
// // // // // //                       ${isFromInvoice ? "opacity-75" : ""}
// // // // // //                     `}
// // // // // //                   >
// // // // // //                     <Text
// // // // // //                       className={`${
// // // // // //                         product?.type === type ? "text-white" : "text-primary"
// // // // // //                       } tracking-wider capitalize font-medium`}
// // // // // //                     >
// // // // // //                       {type.charAt(0).toUpperCase() + type.slice(1)}
// // // // // //                     </Text>
// // // // // //                     {product?.type === type && (
// // // // // //                       <View className="absolute right-2">
// // // // // //                         <AntDesign 
// // // // // //                           name="checkcircle" 
// // // // // //                           size={16} 
// // // // // //                           color="white" 
// // // // // //                         />
// // // // // //                       </View>
// // // // // //                     )}
// // // // // //                   </View>
// // // // // //                 </View>
// // // // // //               ))}
// // // // // //             </View>

// // // // // //             {/* huid & category */}
// // // // // //             <View className="mb-4 flex flex-row ">
// // // // // //               <View className="w-2/5 pr-1.5">
// // // // // //                 <InputBox
// // // // // //                   name="huid"
// // // // // //                   label="HUID"
// // // // // //                   value={product?.huid}
// // // // // //                   onChange={({ value, name }) => handleInputChange(name, value)}
// // // // // //                   keyboardType="default"
// // // // // //                 />
// // // // // //                 <View className="flex flex-row items-center justify-between mt-1">
// // // // // //                   <Text className="text-xs text-gray-500"></Text>
// // // // // //                   <Switch
// // // // // //                     value={product?.[product.type]?.showHuidInBill || false}
// // // // // //                     onValueChange={(value) => handleInputChange("showHuidInBill", value, product.type)}
// // // // // //                     trackColor={{ false: "red", true: "green" }}
// // // // // //                     thumbColor={product?.[product.type]?.showHuidInBill ? "#ffffff" : "#f4f3f4"}
// // // // // //                   />
// // // // // //                 </View>
// // // // // //               </View>
// // // // // //               <View className="w-3/5 flex items-start flex-row pl-1.5">
// // // // // //                 <View className="w-full pr-2">
// // // // // //                   <SelectInput
// // // // // //                     label="HSN Name"
// // // // // //                     name="hsn_id"
// // // // // //                     value={product?.hsn_id}
// // // // // //                     placeholder="Select"
// // // // // //                     error={errors?.hsn_id}
// // // // // //                     data={productGroups.map((item) => ({
// // // // // //                       label: item.name,
// // // // // //                       value: item.id,
// // // // // //                       variation: item.variation_data,
// // // // // //                     }))}
// // // // // //                     onSelect={(value) => handleInputChange("hsn_id", value)}
// // // // // //                   />
// // // // // //                   {validator.message("hsn_id", product?.hsn_id, "required")}
// // // // // //                   <View className="flex flex-row items-center justify-between mt-1">
// // // // // //                     <Text className="text-xs text-gray-500"></Text>
// // // // // //                     <Switch
// // // // // //                       value={product?.[product.type]?.showHsnInBill || false}
// // // // // //                       onValueChange={(value) => handleInputChange("showHsnInBill", value, product.type)}
// // // // // //                       trackColor={{ false: "red", true: "green" }}
// // // // // //                       thumbColor={product?.[product.type]?.showHsnInBill ? "#ffffff" : "#f4f3f4"}
// // // // // //                     />
// // // // // //                 </View>
// // // // // //                 </View>
// // // // // //                 {!isFromInvoice && (
// // // // // //                   <TouchableOpacity
// // // // // //                     onPress={() => handleInitialState("metalModal", true)}
// // // // // //                     activeOpacity={0.7}
// // // // // //                     className="bg-primary w-8 h-8 mt-6 flex justify-center items-center rounded-full shadow-xl"
// // // // // //                   >
// // // // // //                     <FontAwesome6 name="plus" size={17} color="white" />
// // // // // //                   </TouchableOpacity>
// // // // // //                 )}
// // // // // //               </View>
// // // // // //             </View>
// // // // // //           </View>

// // // // // //           {/* Interest Configuration Section */}
// // // // // //           <View className="px-4 mb-4">
// // // // // //             <View className="bg-gray-50 rounded-lg p-4">
// // // // // //               <View className="flex-row items-center justify-between mb-4">
// // // // // //                 <Text className="text-lg font-semibold">Interest Configuration</Text>
// // // // // //                 <Switch
// // // // // //                   value={product?.interest_enabled}
// // // // // //                   onValueChange={(value) => handleInputChange("interest_enabled", value)}
// // // // // //                   trackColor={{ false: "#767577", true: "#22c55e" }}
// // // // // //                   thumbColor={product?.interest_enabled ? "#ffffff" : "#f4f3f4"}
// // // // // //                 />
// // // // // //               </View>

// // // // // //               {product?.interest_enabled && (
// // // // // //                 <>
// // // // // //                   {/* Dates Section */}
// // // // // //                   <View className="mb-4">
// // // // // //                     <Text className="text-base font-medium mb-2">Important Dates</Text>
                    
// // // // // //                     <View className="space-y-3">
// // // // // //                       {/* Bill Date */}
// // // // // //                       <TouchableOpacity
// // // // // //                         onPress={() => handleInitialState("billDatePicker", true)}
// // // // // //                         className="border border-gray-300 rounded-md p-3"
// // // // // //                       >
// // // // // //                         <Text className="text-sm text-gray-500">Bill Date</Text>
// // // // // //                         <Text className="text-base">
// // // // // //                           {product?.bill_date ? moment(product.bill_date).format("DD MMM YYYY") : "Select Date"}
// // // // // //                         </Text>
// // // // // //                       </TouchableOpacity>

// // // // // //                       {/* Payment Date */}
// // // // // //                       <TouchableOpacity
// // // // // //                         onPress={() => handleInitialState("paymentDatePicker", true)}
// // // // // //                         className="border border-gray-300 rounded-md p-3"
// // // // // //                       >
// // // // // //                         <Text className="text-sm text-gray-500">Expected Payment Date</Text>
// // // // // //                         <Text className="text-base">
// // // // // //                           {product?.payment_date ? moment(product.payment_date).format("DD MMM YYYY") : "Select Date"}
// // // // // //                         </Text>
// // // // // //                       </TouchableOpacity>

// // // // // //                       {/* Interest Start Date */}
// // // // // //                       <TouchableOpacity
// // // // // //                         onPress={() => handleInitialState("interestStartDatePicker", true)}
// // // // // //                         className="border border-gray-300 rounded-md p-3"
// // // // // //                       >
// // // // // //                         <Text className="text-sm text-gray-500">Interest Start Date</Text>
// // // // // //                         <Text className="text-base">
// // // // // //                           {product?.interest_start_date ? moment(product.interest_start_date).format("DD MMM YYYY") : "Select Date"}
// // // // // //                         </Text>
// // // // // //                       </TouchableOpacity>
// // // // // //                     </View>
// // // // // //                   </View>

// // // // // //                   {/* Interest Details */}
// // // // // //                   <View className="mb-4">
// // // // // //                     <Text className="text-base font-medium mb-2">Interest Details</Text>
                    
// // // // // //                     <View className="space-y-3">
// // // // // //                       {/* Interest Type */}
// // // // // //                       <View>
// // // // // //                 <SelectInput
// // // // // //                   label="Interest Type"
// // // // // //                   name="interest_type"
// // // // // //                   value={product?.interest_type}
// // // // // //                           placeholder="Select Type"
// // // // // //                   data={[
// // // // // //                     { label: "Flat", value: "2" },
// // // // // //                             { label: "Compound", value: "1" }
// // // // // //                   ]}
// // // // // //                   onSelect={(value) => handleInputChange("interest_type", value)}
// // // // // //                 />
// // // // // //               </View>

// // // // // //                       {/* Interest Rate */}
// // // // // //                       <View>
// // // // // //                 <InputBox
// // // // // //                   name="interest_rate"
// // // // // //                           label="Interest Rate (%)"
// // // // // //                   value={product?.interest_rate}
// // // // // //                           keyboardType="numeric"
// // // // // //                   onChange={({ value }) => handleInputChange("interest_rate", value)}
// // // // // //                 />
// // // // // //                       </View>
// // // // // //               </View>
// // // // // //             </View>

// // // // // //                   {/* Grace Period */}
// // // // // //                   <View className="mb-4">
// // // // // //                     <View className="flex-row items-center justify-between mb-2">
// // // // // //                       <Text className="text-base font-medium">Grace Period</Text>
// // // // // //                       <Switch
// // // // // //                         value={product?.grace_period_enabled}
// // // // // //                         onValueChange={(value) => handleInputChange("grace_period_enabled", value)}
// // // // // //                         trackColor={{ false: "#767577", true: "#22c55e" }}
// // // // // //                         thumbColor={product?.grace_period_enabled ? "#ffffff" : "#f4f3f4"}
// // // // // //                       />
// // // // // //                   </View>

// // // // // //                     {product?.grace_period_enabled && (
// // // // // //                       <InputBox
// // // // // //                         name="grace_period_days"
// // // // // //                         label="Grace Period (Days)"
// // // // // //                         value={product?.grace_period_days}
// // // // // //                         keyboardType="numeric"
// // // // // //                         onChange={({ value }) => handleInputChange("grace_period_days", value)}
// // // // // //                       />
// // // // // //                     )}
// // // // // //             </View>

// // // // // //                   {/* Interest Notes */}
// // // // // //                   <View className="mb-4">
// // // // // //                     <InputBox
// // // // // //                       name="interest_notes"
// // // // // //                       label="Interest Notes"
// // // // // //                       value={product?.interest_notes}
// // // // // //                       multiLine={true}
// // // // // //                       numberOfLines={3}
// // // // // //                       onChange={({ value }) => handleInputChange("interest_notes", value)}
// // // // // //                       placeholder="Add any special notes about interest terms..."
// // // // // //                     />
// // // // // //                   </View>

// // // // // //                   {/* Interest Summary */}
// // // // // //                   <View className="bg-white rounded-lg p-3 mb-4">
// // // // // //                     <Text className="text-base font-medium mb-2">Interest Summary</Text>
// // // // // //                     <View className="space-y-2">
// // // // // //                       <View className="flex-row justify-between">
// // // // // //                         <Text className="text-gray-600">Original Amount:</Text>
// // // // // //                         <Text>₹{handleDigitsFix(product?.[product.type]?.net_price || 0)}</Text>
// // // // // //                       </View>
// // // // // //                       <View className="flex-row justify-between">
// // // // // //                         <Text className="text-gray-600">Interest Period:</Text>
// // // // // //                         <Text>{calculateInterestPeriod(product)} days</Text>
// // // // // //                       </View>
// // // // // //                       <View className="flex-row justify-between">
// // // // // //                         <Text className="text-gray-600">Interest Amount:</Text>
// // // // // //                         <Text>₹{handleDigitsFix(Number(product?.interest_amount || 0))}</Text>
// // // // // //                       </View>
// // // // // //                       <View className="flex-row justify-between pt-2 border-t border-gray-200">
// // // // // //                         <Text className="font-medium">Total Amount:</Text>
// // // // // //                         <Text className="font-medium">₹{handleDigitsFix(
// // // // // //                           Number(product?.[product.type]?.net_price || 0) + 
// // // // // //                           Number(product?.interest_amount || 0)
// // // // // //                         )}</Text>
// // // // // //                       </View>
// // // // // //                     </View>
// // // // // //                   </View>
// // // // // //                 </>
// // // // // //               )}
// // // // // //             </View>
// // // // // //           </View>

// // // // // //           {/* ---------  common for sale & purchase - START - ( Section -2 ) ---------- */}
// // // // // //           {productTypes.map((category) => {
// // // // // //             const isPurchase = category == "purchase";
// // // // // //             return (
// // // // // //               product?.type == category && (
// // // // // //                 <View
// // // // // //                   className="bg-slate-50 shadow-lg px-4 pt-4"
// // // // // //                   key={category}
// // // // // //                 >
// // // // // //                   {/* gross, less, net, wastage, tounch */}
// // // // // //                   <View className="mb-4 flex flex-row ">
// // // // // //                     {/* gross weight */}
// // // // // //                     <View className="w-1/5 pr-1">
// // // // // //                       <InputBox
// // // // // //                         name="gross_weight"
// // // // // //                         placeholder="0"
// // // // // //                         label="Gross Wt"
// // // // // //                         value={product?.[category].gross_weight}
// // // // // //                         onChange={({ value, name }) =>
// // // // // //                           handleInputChange(name, value, category)
// // // // // //                         }
// // // // // //                         keyboardType="numeric"
// // // // // //                       />
// // // // // //                       <View className="flex flex-row items-center justify-between mt-1">
// // // // // //                         <Text className="text-xs text-gray-500"></Text>
// // // // // //                         <Switch
// // // // // //                           value={product?.[category]?.showGrossWeightInBill || false}
// // // // // //                           onValueChange={(value) => handleInputChange("showGrossWeightInBill", value, category)}
// // // // // //                           trackColor={{ false: "red", true: "green" }}
// // // // // //                           thumbColor={product?.[category]?.showGrossWeightInBill ? "#ffffff" : "#f4f3f4"}
// // // // // //                         />
// // // // // //                       </View>
// // // // // //                     </View>

// // // // // //                     {/* less weight */}
// // // // // //                     <View className="w-1/5 px-1">
// // // // // //                       <InputBox
// // // // // //                         name="less_weight"
// // // // // //                         placeholder="0"
// // // // // //                         label="Less Wt"
// // // // // //                         value={product?.[category].less_weight}
// // // // // //                         onChange={({ value, name }) =>
// // // // // //                           handleInputChange(name, value, category)
// // // // // //                         }
// // // // // //                         keyboardType="numeric"
// // // // // //                       />
// // // // // //                       <View className="flex flex-row items-center justify-between mt-1">
// // // // // //                         <Text className="text-xs text-gray-500"></Text>
// // // // // //                         <Switch
// // // // // //                           value={product?.[category]?.showLessWeightInBill || false}
// // // // // //                           onValueChange={(value) => handleInputChange("showLessWeightInBill", value, category)}
// // // // // //                           trackColor={{ false: "red", true: "green" }}
// // // // // //                           thumbColor={product?.[category]?.showLessWeightInBill ? "#ffffff" : "#f4f3f4"}
// // // // // //                         />
// // // // // //                       </View>
// // // // // //                     </View>

// // // // // //                     {/* net weight */}
// // // // // //                     <View className="w-1/5 px-1">
// // // // // //                       <InputBox
// // // // // //                         name="net_weight"
// // // // // //                         placeholder="0"
// // // // // //                         label="Net Wt"
// // // // // //                         readOnly={true}
// // // // // //                         value={product?.[category]?.net_weight}
// // // // // //                         onChange={({ value, name }) =>
// // // // // //                           handleInputChange(name, value, category)
// // // // // //                         }
// // // // // //                         keyboardType="numeric"
// // // // // //                       />
// // // // // //                       <View className="flex flex-row items-center justify-between mt-1">
// // // // // //                         <Text className="text-xs text-gray-500"></Text>
// // // // // //                         <Switch
// // // // // //                           value={product?.[category]?.showNetWeightInBill || false}
// // // // // //                           onValueChange={(value) => handleInputChange("showNetWeightInBill", value, category)}
// // // // // //                           trackColor={{ false: "red", true: "green" }}
// // // // // //                           thumbColor={product?.[category]?.showNetWeightInBill ? "#ffffff" : "#f4f3f4"}
// // // // // //                         />
// // // // // //                       </View>
// // // // // //                     </View>

// // // // // //                     {/* tounch & wastage */}
// // // // // //                     <View
// // // // // //                       className={`w-2/5 ${
// // // // // //                         isPurchase ? "flex-row-reverse" : "flex-row"
// // // // // //                       }  flex `}
// // // // // //                     >
// // // // // //                       {/* tounch */}
// // // // // //                       <View
// // // // // //                         className={`w-1/2 ${
// // // // // //                           isPurchase ? "pl-0.5" : "pr-1 pl-0.5"
// // // // // //                         }`}
// // // // // //                       >
// // // // // //                         <InputBox
// // // // // //                           name="tounch"
// // // // // //                           placeholder="0 %"
// // // // // //                           label="Tounch"
// // // // // //                           value={product?.[category].tounch}
// // // // // //                           onChange={({ value, name }) =>
// // // // // //                             handleInputChange(name, value, category)
// // // // // //                           }
// // // // // //                           keyboardType="numeric"
// // // // // //                         />
// // // // // //                         <View className="flex flex-row items-center justify-between mt-1">
// // // // // //                           <Text className="text-xs text-gray-500"></Text>
// // // // // //                           <Switch
// // // // // //                             value={product?.[category]?.showTounchInBill || false}
// // // // // //                             onValueChange={(value) => handleInputChange("showTounchInBill", value, category)}
// // // // // //                             trackColor={{ false: "red", true: "green" }}
// // // // // //                             thumbColor={product?.[category]?.showTounchInBill ? "#ffffff" : "#f4f3f4"}
// // // // // //                           />
// // // // // //                         </View>
// // // // // //                       </View>

// // // // // //                       {/* wastage */}
// // // // // //                       <View
// // // // // //                         className={`w-1/2 ${
// // // // // //                           isPurchase ? "pr-1 pl-0.5" : "pl-0.5"
// // // // // //                         }`}
// // // // // //                       >
// // // // // //                         <InputBox
// // // // // //                           name="wastage"
// // // // // //                           placeholder="0 %"
// // // // // //                           label="Wastage"
// // // // // //                           value={product?.[category].wastage}
// // // // // //                           onChange={({ value, name }) =>
// // // // // //                             handleInputChange(name, value, category)
// // // // // //                           }
// // // // // //                           keyboardType="numeric"
// // // // // //                         />
// // // // // //                         <View className="flex flex-row items-center justify-between mt-1">
// // // // // //                           <Text className="text-xs text-gray-500"></Text>
// // // // // //                           <Switch
// // // // // //                             value={product?.[category]?.showWastageInBill || false}
// // // // // //                             onValueChange={(value) => handleInputChange("showWastageInBill", value, category)}
// // // // // //                             trackColor={{ false: "red", true: "green" }}
// // // // // //                             thumbColor={product?.[category]?.showWastageInBill ? "#ffffff" : "#f4f3f4"}
// // // // // //                           />
// // // // // //                         </View>
// // // // // //                       </View>
// // // // // //                     </View>
// // // // // //                   </View>

// // // // // //                   {/* piece, fine weight & rate */}
// // // // // //                   <View className="mb-4 flex flex-row ">
// // // // // //                     {/* fine weight */}
// // // // // //                     <View className="w-1/3 pr-1">
// // // // // //                       <InputBox
// // // // // //                         name="fine_weight"
// // // // // //                         label="Fine Weight"
// // // // // //                         placeholder="0"
// // // // // //                         readOnly={true}
// // // // // //                         value={product?.[category].fine_weight}
// // // // // //                         onChange={({ value }) => handleInputChange("fine_weight", value, category)}
// // // // // //                         keyboardType="numeric"
// // // // // //                       />
// // // // // //                       <View className="flex flex-row items-center justify-between mt-1">
// // // // // //                         <Text className="text-xs text-gray-500"></Text>
// // // // // //                         <Switch
// // // // // //                           value={product?.[category]?.showFineWeightInBill || false}
// // // // // //                           onValueChange={(value) => handleInputChange("showFineWeightInBill", value, category)}
// // // // // //                           trackColor={{ false: "red", true: "green" }}
// // // // // //                           thumbColor={product?.[category]?.showFineWeightInBill ? "#ffffff" : "#f4f3f4"}
// // // // // //                         />
// // // // // //                       </View>
// // // // // //                     </View>

// // // // // //                     {/* Cutting Button */}
// // // // // //                     <View className="w-1/3 px-1">
// // // // // //                       <Text className="text-slate-500 text-[13px] mb-1">Cutting</Text>
// // // // // //                       <View className="bg-gray-100 rounded-lg">
// // // // // //                         <CommonButton
// // // // // //                           title={product.cutting_enabled ? "ON" : "OFF"}
// // // // // //                           onPress={() => {
// // // // // //                             const currentType = product.type;
// // // // // //                             const buttonRate = isSelectRate 
// // // // // //                               ? parseFloat(product[currentType]?.rate?.price) || 0 
// // // // // //                               : parseFloat(product[currentType]?.rate) || 0;
// // // // // //                             const buttonFineWeight = parseFloat(product[currentType]?.fine_weight) || 0;
// // // // // //                             const buttonMetalValue = !product.cutting_enabled ? (buttonFineWeight * buttonRate).toFixed(2) : "0";
                            
// // // // // //                             setProduct(prev => ({
// // // // // //                               ...prev,
// // // // // //                               cutting_enabled: !prev.cutting_enabled,
// // // // // //                               [currentType]: {
// // // // // //                                 ...prev[currentType],
// // // // // //                                 metal_value: buttonMetalValue
// // // // // //                               }
// // // // // //                             }));
// // // // // //                           }}
// // // // // //                           isFilled={product.cutting_enabled}
// // // // // //                           small
// // // // // //                         />
// // // // // //                       </View>
// // // // // //                     </View>

// // // // // //                     {/* Rate */}
// // // // // //                     <View className="w-1/3 pl-1">
// // // // // //                       <InputBox
// // // // // //                         name="rate"
// // // // // //                         readOnly={true}
// // // // // //                         label="Rate"
// // // // // //                         placeholder="0"
// // // // // //                         value={isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate}
// // // // // //                         onChange={({ value }) => handleInputChange("rate", value, category)}
// // // // // //                         keyboardType="numeric"
// // // // // //                       />
// // // // // //                       <View className="flex flex-row items-center justify-between mt-1">
// // // // // //                         <Text className="text-xs text-gray-500"></Text>
// // // // // //                         <Switch
// // // // // //                           value={product?.[category]?.showRateInBill || false}
// // // // // //                           onValueChange={(value) => handleInputChange("showRateInBill", value, category)}
// // // // // //                           trackColor={{ false: "red", true: "green" }}
// // // // // //                           thumbColor={product?.[category]?.showRateInBill ? "#ffffff" : "#f4f3f4"}
// // // // // //                         />
// // // // // //                       </View>
// // // // // //                     </View>
// // // // // //                   </View>

// // // // // //                   {/* New Making Type and Charge Inputs */}
// // // // // //                   <View className="mb-4 flex flex-row">
// // // // // //                     <View className="w-1/2 pr-1">
// // // // // //                       <SelectInput
// // // // // //                         label="Making Type"
// // // // // //                         name="making_type"
// // // // // //                         value={product?.[category]?.making_type}
// // // // // //                         placeholder="Select"
// // // // // //                         data={[
// // // // // //                           { label: "Per Gram (PG)", value: "PG" },
// // // // // //                           { label: "Per Piece (PP)", value: "PP" }
// // // // // //                         ]}
// // // // // //                         onSelect={(value) => handleInputChange("making_type", value, category)}
// // // // // //                         />
// // // // // //                       </View>
// // // // // //                     <View className="w-1/2 pl-1">
// // // // // //                       <InputBox
// // // // // //                         name="making_charge"
// // // // // //                         label="Making Charge"
// // // // // //                         placeholder="0"
// // // // // //                         value={product?.[category]?.making_charge}
// // // // // //                         onChange={({ value }) => handleInputChange("making_charge", value, category)}
// // // // // //                         keyboardType="numeric"
// // // // // //                         />
// // // // // //                       </View>
// // // // // //                     </View>

// // // // // //                   {/* Net Price */}
// // // // // //                   <View className="mb-4 flex flex-row">
// // // // // //                     <View className="w-full">
// // // // // //                       <InputBox
// // // // // //                         name="net_price"
// // // // // //                         label="Net Price"
// // // // // //                         placeholder="0.00"
// // // // // //                         value={handleDigitsFix(
// // // // // //                           // Subtotal
// // // // // //                           (
// // // // // //                             (product.cutting_enabled ? 
// // // // // //                               (Number(product?.[category]?.fine_weight || 0) * 
// // // // // //                               Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // // // // //                             : 0) +
// // // // // //                             (product?.[category]?.making_type?.value === "PG"
// // // // // //                               ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // // // //                               : Number(product?.[category]?.making_charge || 0)) +
// // // // // //                             ((product[category]?.charges_json || []).reduce((sum, charge) => 
// // // // // //                               sum + Number(charge.amount || 0), 0))
// // // // // //                           ) +
// // // // // //                           // Tax Amount
// // // // // //                           (
// // // // // //                             (
// // // // // //                               (product.cutting_enabled ? 
// // // // // //                                 (Number(product?.[category]?.fine_weight || 0) * 
// // // // // //                                 Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // // // // //                               : 0) +
// // // // // //                               (product?.[category]?.making_type?.value === "PG"
// // // // // //                                 ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // // // //                                 : Number(product?.[category]?.making_charge || 0)) +
// // // // // //                               ((product[category]?.charges_json || []).reduce((sum, charge) => 
// // // // // //                                 sum + Number(charge.amount || 0), 0))
// // // // // //                             ) * (Number(product?.[category]?.tax || 0) / 100)
// // // // // //                           )
// // // // // //                         )}
// // // // // //                         readOnly={true}
// // // // // //                         keyboardType="numeric"
// // // // // //                       />
// // // // // //                       <View className="flex flex-row items-center justify-between mt-1">
// // // // // //                         <Text className="text-xs text-gray-500"></Text>
// // // // // //                         <Switch
// // // // // //                           value={product?.[category]?.showNetPriceInBill || false}
// // // // // //                           onValueChange={(value) => handleInputChange("showNetPriceInBill", value, category)}
// // // // // //                           trackColor={{ false: "red", true: "green" }}
// // // // // //                           thumbColor={product?.[category]?.showNetPriceInBill ? "#ffffff" : "#f4f3f4"}
// // // // // //                         />
// // // // // //                       </View>
// // // // // //                     </View>
// // // // // //                   </View>

// // // // // //                   {/* Show Price Calculations Switch */}
// // // // // //                   <View className="mb-4 flex flex-row items-center bg-gray-50 px-3 py-2 rounded-lg">
// // // // // //                     <Text className="text-gray-600">Show Price in Bill</Text>
// // // // // //                     <Switch
// // // // // //                       value={product?.[category]?.showPriceInBill ?? false}
// // // // // //                       onValueChange={(value) => handleInputChange("showPriceInBill", value, category)}
// // // // // //                       trackColor={{ false: "#767577", true: "green" }}
// // // // // //                       thumbColor={product?.[category]?.showPriceInBill ? "#ffffff" : "#f4f3f4"}
// // // // // //                     />
// // // // // //                   </View>

// // // // // //                   {/* Conditionally show calculation summary */}
// // // // // //                   {product?.[category]?.showPriceInBill ? (
// // // // // //                   <View className="mb-4 bg-gray-50 p-4 rounded-lg">
// // // // // //                     <Text className="text-base font-semibold mb-3">Calculation Summary</Text>
// // // // // //                     <View className="space-y-2">
// // // // // //                       {/* Net Weight */}
// // // // // //                       <View className="flex flex-row justify-between">
// // // // // //                         <Text className="text-gray-600">Net Weight:</Text>
// // // // // //                         <Text>{product?.[category]?.net_weight || 0} g</Text>
// // // // // //                       </View>

// // // // // //                       {/* Fine Weight Calculation */}
// // // // // //                       <View className="flex flex-row justify-between items-center">
// // // // // //                         <Text className="text-gray-600">Fine Weight:</Text>
// // // // // //                         <View className="flex flex-row items-center">
// // // // // //                           <Text className="text-gray-500 text-sm mr-2">
// // // // // //                             ({handleDigitsFix(product?.[category]?.net_weight || 0)} × {Number(product?.[category]?.tounch || 0)}%)
// // // // // //                           </Text>
// // // // // //                           <Text className="font-medium">{handleDigitsFix(product?.[category]?.fine_weight || 0)} g</Text>
// // // // // //                         </View>
// // // // // //                       </View>

// // // // // //                       {/* Wastage Weight Calculation - NEW */}
// // // // // //                       <View className="flex flex-row justify-between items-center">
// // // // // //                         <Text className="text-gray-600">Wastage Weight:</Text>
// // // // // //                         <View className="flex flex-row items-center">
// // // // // //                           <Text className="text-gray-500 text-sm mr-2">
// // // // // //                             ({handleDigitsFix(product?.[category]?.net_weight || 0)} × {Number(product?.[category]?.wastage || 0)}%)
// // // // // //                           </Text>
// // // // // //                           <Text className="font-medium">{handleDigitsFix(
// // // // // //                             Number(product?.[category]?.net_weight || 0) * 
// // // // // //                             (Number(product?.[category]?.wastage || 0) / 100)
// // // // // //                           )} g</Text>
// // // // // //                         </View>
// // // // // //                       </View>

// // // // // //                       {/* Total Weight with Wastage - NEW */}
// // // // // //                       <View className="flex flex-row justify-between items-center">
// // // // // //                         <Text className="text-gray-600">Total Weight with Wastage:</Text>
// // // // // //                         <View className="flex flex-row items-center">
// // // // // //                           <Text className="text-gray-500 text-sm mr-2">
// // // // // //                             ({handleDigitsFix(product?.[category]?.net_weight || 0)} + {handleDigitsFix(
// // // // // //                               Number(product?.[category]?.net_weight || 0) * 
// // // // // //                               (Number(product?.[category]?.wastage || 0) / 100)
// // // // // //                             )})
// // // // // //                           </Text>
// // // // // //                           <Text className="font-medium">{handleDigitsFix(
// // // // // //                             Number(product?.[category]?.net_weight || 0) + 
// // // // // //                             (Number(product?.[category]?.net_weight || 0) * 
// // // // // //                             (Number(product?.[category]?.wastage || 0) / 100))
// // // // // //                           )} g</Text>
// // // // // //                         </View>
// // // // // //                       </View>

// // // // // //                         {/* Wastage Calculation */}
// // // // // //                         <View className="flex flex-row justify-between items-center">
// // // // // //                           <Text className="text-gray-600">Wastage Value:</Text>
// // // // // //                           <View className="flex flex-row items-center">
// // // // // //                             <Text className="text-gray-500 text-sm mr-2">
// // // // // //                               ({handleDigitsFix(
// // // // // //                                 Number(product?.[category]?.net_weight || 0) * 
// // // // // //                                 (Number(product?.[category]?.wastage || 0) / 100)
// // // // // //                               )} × ({Number(product?.[category]?.tounch || 0)}% × ₹{handleDigitsFix(isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0}))
// // // // // //                             </Text>
// // // // // //                             <Text className="font-medium">₹{handleDigitsFix(
// // // // // //                               // Wastage Weight × (Touch% × Rate)
// // // // // //                               (Number(product?.[category]?.net_weight || 0) * 
// // // // // //                                (Number(product?.[category]?.wastage || 0) / 100)) * 
// // // // // //                               ((Number(product?.[category]?.tounch || 0) / 100) * 
// // // // // //                                Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // // // // //                             )}</Text>
// // // // // //                           </View>
// // // // // //                         </View>

// // // // // //                           {/* Metal Value Calculation */}
// // // // // //                           <View className="flex flex-row justify-between items-center">
// // // // // //                             <Text className="text-gray-600">Metal Value:</Text>
// // // // // //                             <View className="flex flex-row items-center">
// // // // // //                               {product.cutting_enabled ? (
// // // // // //                                 <>
// // // // // //                                   <Text className="text-gray-500 text-sm mr-2">
// // // // // //                                     ({handleDigitsFix(product?.[category]?.fine_weight || 0)} × ₹{handleDigitsFix(isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0})
// // // // // //                                   </Text>
// // // // // //                                   <Text className="font-medium">₹{handleDigitsFix(
// // // // // //                                     Number(product?.[category]?.fine_weight || 0) * 
// // // // // //                                     Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0)
// // // // // //                                   )}</Text>
// // // // // //                                 </>
// // // // // //                               ) : (
// // // // // //                                 <Text className="font-medium">₹0.00 (Cutting OFF)</Text>
// // // // // //                               )}
// // // // // //                             </View>
// // // // // //                           </View>

// // // // // //                           {/* Making Charges Calculation */}
// // // // // //                           <View className="flex flex-row justify-between items-center">
// // // // // //                             <Text className="text-gray-600">Making Charges:</Text>
// // // // // //                             <View className="flex flex-row items-center">
// // // // // //                               {product?.[category]?.making_type?.value === "PG" ? (
// // // // // //                                 <Text className="text-gray-500 text-sm mr-2">
// // // // // //                                   ({handleDigitsFix(product?.[category]?.net_weight || 0)} × ₹{handleDigitsFix(product?.[category]?.making_charge || 0)})
// // // // // //                                 </Text>
// // // // // //                               ) : null}
// // // // // //                               <Text className="font-medium">₹{handleDigitsFix(
// // // // // //                                 product?.[category]?.making_type?.value === "PG"
// // // // // //                                   ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // // // //                                   : Number(product?.[category]?.making_charge || 0)
// // // // // //                               )}</Text>
// // // // // //                             </View>
// // // // // //                           </View>

// // // // // //                           {/* Additional Charges Input Section */}
// // // // // //                           <View className="mb-4">
// // // // // //                             <View className="flex-row justify-between items-center mb-2">
// // // // // //                               <Text className="text-gray-600 font-medium">Additional Charges</Text>
// // // // // //                               <TouchableOpacity
// // // // // //                                 onPress={() => {
// // // // // //                                   const updatedCharges = [...(product[category].charges_json || []), { name: '', amount: '0' }];
// // // // // //                                   handleInputChange('charges_json', updatedCharges, category);
// // // // // //                                 }}
// // // // // //                                 className="bg-primary px-2 py-1 rounded-md"
// // // // // //                               >
// // // // // //                                 <Text className="text-white">+ Add</Text>
// // // // // //                               </TouchableOpacity>
// // // // // //                           </View>

// // // // // //                             {(product[category]?.charges_json || []).map((charge, index) => (
// // // // // //                               <View key={index} className="flex-row items-center mb-2">
// // // // // //                                 <View className="flex-1 mr-2">
// // // // // //                                   <OutlineInput
// // // // // //                                     placeholder="Charge name"
// // // // // //                                     value={charge.name}
// // // // // //                                     maxLength={50}
// // // // // //                                     onChangeText={(value) => {
// // // // // //                                       const updatedCharges = [...(product[category].charges_json || [])];
// // // // // //                                       updatedCharges[index] = { ...charge, name: value };
// // // // // //                                       handleInputChange('charges_json', updatedCharges, category);
// // // // // //                                     }}
// // // // // //                                   />
// // // // // //                                 </View>
// // // // // //                                 <View className="w-24 mr-2">
// // // // // //                                   <OutlineInput
// // // // // //                                     placeholder="Amount"
// // // // // //                                     value={String(charge.amount)}
// // // // // //                                     keyboardType="numeric"
// // // // // //                                     onChangeText={(value) => {
// // // // // //                                       const updatedCharges = [...(product[category].charges_json || [])];
// // // // // //                                       updatedCharges[index] = { ...charge, amount: value || '0' };
// // // // // //                                       handleInputChange('charges_json', updatedCharges, category);
// // // // // //                                     }}
// // // // // //                                   />
// // // // // //                                 </View>
// // // // // //                                 <TouchableOpacity
// // // // // //                                   onPress={() => {
// // // // // //                                     const updatedCharges = (product[category].charges_json || []).filter((_, i) => i !== index);
// // // // // //                                     handleInputChange('charges_json', updatedCharges, category);
// // // // // //                                   }}
// // // // // //                                 >
// // // // // //                                   <FontAwesome6 name="trash" size={16} color="red" />
// // // // // //                                 </TouchableOpacity>
// // // // // //                               </View>
// // // // // //                             ))}
                            
// // // // // //                             {(product[category]?.charges_json || []).length > 0 && (
// // // // // //                               <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-200">
// // // // // //                                 <Text className="text-gray-600">Total:</Text>
// // // // // //                                 <Text className="font-medium">₹{handleDigitsFix(
// // // // // //                                   (product[category]?.charges_json || []).reduce((sum, charge) => 
// // // // // //                                     sum + Number(charge.amount || 0), 0)
// // // // // //                                 )}</Text>
// // // // // //                               </View>
// // // // // //                             )}
// // // // // //                           </View>


// // // // // //                         {/* Subtotal Calculation */}
// // // // // //                         <View className="flex flex-row justify-between items-center border-t border-gray-200 mt-2 pt-2">
// // // // // //                           <Text className="text-gray-600 font-semibold">Subtotal:</Text>
// // // // // //                           <Text className="font-semibold">₹{handleDigitsFix(
// // // // // //                             // Metal Value (only if cutting is enabled)
// // // // // //                             (product.cutting_enabled ? 
// // // // // //                               (Number(product?.[category]?.fine_weight || 0) * 
// // // // // //                               Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // // // // //                             : 0) +
// // // // // //                             // Making Charges
// // // // // //                             (product?.[category]?.making_type?.value === "PG" 
// // // // // //                               ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // // // //                             : Number(product?.[category]?.making_charge || 0)) +
// // // // // //                             // Additional Charges from charges_json
// // // // // //                             ((product[category]?.charges_json || []).reduce((sum, charge) => 
// // // // // //                               sum + Number(charge.amount || 0), 0))
// // // // // //                             )}</Text>
// // // // // //                           </View>

// // // // // //                           {/* Tax Amount */}
// // // // // //                           <View className="flex flex-row justify-between items-center">
// // // // // //                           <Text className="text-gray-600">Tax Amount ({Number(product?.[category]?.tax || 0)}%):</Text>
// // // // // //                               <Text className="font-medium">₹{handleDigitsFix(
// // // // // //                             // Calculate tax based on the subtotal
// // // // // //                             (
// // // // // //                               // Metal Value (only if cutting is enabled)
// // // // // //                               (product.cutting_enabled ? 
// // // // // //                                 (Number(product?.[category]?.fine_weight || 0) * 
// // // // // //                                 Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // // // // //                               : 0) +
// // // // // //                               // Making Charges
// // // // // //                               (product?.[category]?.making_type?.value === "PG" 
// // // // // //                                 ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // // // //                               : Number(product?.[category]?.making_charge || 0)) +
// // // // // //                               // Additional Charges from charges_json
// // // // // //                               ((product[category]?.charges_json || []).reduce((sum, charge) => 
// // // // // //                                 sum + Number(charge.amount || 0), 0))
// // // // // //                             ) * (Number(product?.[category]?.tax || 0) / 100)
// // // // // //                               )}</Text>
// // // // // //                           </View>

// // // // // //                         {/* Final Amount */}
// // // // // //                           <View className="flex flex-row justify-between border-t border-gray-200 pt-2">
// // // // // //                             <Text className="text-gray-600 font-semibold">Final Price:</Text>
// // // // // //                           <Text className="font-semibold">₹{handleDigitsFix(
// // // // // //                             // Subtotal
// // // // // //                             (
// // // // // //                               // Metal Value (only if cutting is enabled)
// // // // // //                               (product.cutting_enabled ? 
// // // // // //                                 (Number(product?.[category]?.fine_weight || 0) * 
// // // // // //                                 Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // // // // //                               : 0) +
// // // // // //                               // Making Charges
// // // // // //                               (product?.[category]?.making_type?.value === "PG"
// // // // // //                                 ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // // // //                                 : Number(product?.[category]?.making_charge || 0)) +
// // // // // //                               // Additional Charges from charges_json
// // // // // //                               ((product[category]?.charges_json || []).reduce((sum, charge) => 
// // // // // //                                 sum + Number(charge.amount || 0), 0))
// // // // // //                             ) +
// // // // // //                             // Tax Amount
// // // // // //                             (
// // // // // //                               // Metal Value (only if cutting is enabled)
// // // // // //                               (product.cutting_enabled ? 
// // // // // //                                 (Number(product?.[category]?.fine_weight || 0) * 
// // // // // //                                 Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // // // // //                               : 0) +
// // // // // //                               // Making Charges
// // // // // //                               (product?.[category]?.making_type?.value === "PG"
// // // // // //                                 ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // // // //                                 : Number(product?.[category]?.making_charge || 0)) +
// // // // // //                               // Additional Charges
// // // // // //                               Number(product?.[category]?.additional_charges || 0)
// // // // // //                             ) * (Number(product?.[category]?.tax || 0) / 100)
// // // // // //                           )}</Text>
// // // // // //                           </View>
// // // // // //                     </View>
// // // // // //                     </View>
// // // // // //                   ) : (
// // // // // //                     <View className="mb-4 bg-gray-50 p-4 rounded-lg">
// // // // // //                       <Text className="text-base font-semibold mb-3">Basic Weight Details</Text>
// // // // // //                       <View className="space-y-2">
// // // // // //                         {/* Net Weight */}
// // // // // //                         <View className="flex flex-row justify-between">
// // // // // //                           <Text className="text-gray-600">Net Weight:</Text>
// // // // // //                           <Text>{product?.[category]?.net_weight || 0} g</Text>
// // // // // //                   </View>

// // // // // //                         {/* Fine Weight Calculation */}
// // // // // //                         <View className="flex flex-row justify-between items-center">
// // // // // //                           <Text className="text-gray-600">Fine Weight:</Text>
// // // // // //                           <View className="flex flex-row items-center">
// // // // // //                             <Text className="text-gray-500 text-sm mr-2">
// // // // // //                               ({handleDigitsFix(product?.[category]?.net_weight || 0)} × {Number(product?.[category]?.tounch || 0)}%)
// // // // // //                             </Text>
// // // // // //                             <Text className="font-medium">{handleDigitsFix(product?.[category]?.fine_weight || 0)} g</Text>
// // // // // //                           </View>
// // // // // //                         </View>
// // // // // //                       </View>
// // // // // //                     </View>
// // // // // //                   )}

// // // // // //                   {/* charges and taxes */}
// // // // // //                   <View className="mb-4">
// // // // // //                     {/* Charges */}
// // // // // //                     <View className="mb-5">
// // // // // //                       <View className="flex flex-row items-center justify-between">
// // // // // //                         <Text className="tracking-wider text-base">
// // // // // //                           Charges
// // // // // //                         </Text>
// // // // // //                         <View className="flex flex-row items-center">
// // // // // //                           <Switch
// // // // // //                             value={product?.[category]?.showChargesInBill || false}
// // // // // //                             onValueChange={(value) => handleInputChange("showChargesInBill", value, category)}
// // // // // //                             trackColor={{ false: "red", true: "green" }}
// // // // // //                             thumbColor={product?.[category]?.showChargesInBill ? "#ffffff" : "#f4f3f4"}
// // // // // //                           />
// // // // // //                         <TouchableOpacity
// // // // // //                           onPress={() => addItem(category, "charges_json")}
// // // // // //                           activeOpacity={0.7}
// // // // // //                             className="bg-primary ml-2 w-6 h-6 flex justify-center items-center rounded-full shadow-xl"
// // // // // //                         >
// // // // // //                           <FontAwesome6 name="plus" size={17} color="white" />
// // // // // //                         </TouchableOpacity>
// // // // // //                         </View>
// // // // // //                       </View>
// // // // // //                       {/* Input fields */}
// // // // // //                       {product[category]?.charges_json?.map((charge, index) => {
// // // // // //                         return (
// // // // // //                           <View
// // // // // //                             key={index}
// // // // // //                             className="flex pt-2 pl-1 items-end flex-row"
// // // // // //                           >
// // // // // //                             {/* charge name */}
// // // // // //                             <View className="w-[45%] pr-2">
// // // // // //                               <OutlineInput
// // // // // //                                 placeholder="e.g. Labour Charge"
// // // // // //                                 value={charge.name}
// // // // // //                                 onChangeText={(value) =>
// // // // // //                                   handleInputChange(
// // // // // //                                     "name",
// // // // // //                                     value,
// // // // // //                                     category,
// // // // // //                                     "charges_json",
// // // // // //                                     index
// // // // // //                                   )
// // // // // //                                 }
// // // // // //                               />
// // // // // //                             </View>

// // // // // //                             {/* amount */}
// // // // // //                             <View className="w-[45%] px-2">
// // // // // //                               <OutlineInput
// // // // // //                                 placeholder="e.g. 500"
// // // // // //                                 value={charge.amount}
// // // // // //                                 keyboardType="numeric"
// // // // // //                                 onChangeText={(value) =>
// // // // // //                                   handleInputChange(
// // // // // //                                     "amount",
// // // // // //                                     value,
// // // // // //                                     category,
// // // // // //                                     "charges_json",
// // // // // //                                     index
// // // // // //                                   )
// // // // // //                                 }
// // // // // //                               />
// // // // // //                             </View>

// // // // // //                             {/* trash icon */}
// // // // // //                             {product[category]?.charges_json.length > 1 && (
// // // // // //                               <TouchableOpacity
// // // // // //                                 onPress={() =>
// // // // // //                                   removeChargeTaxInput(
// // // // // //                                     category,
// // // // // //                                     "charges_json",
// // // // // //                                     index
// // // // // //                                   )
// // // // // //                                 }
// // // // // //                                 activeOpacity={0.7}
// // // // // //                                 className="w-[10%] flex justify-center pl-3"
// // // // // //                               >
// // // // // //                                 <FontAwesome6
// // // // // //                                   name="trash"
// // // // // //                                   size={15}
// // // // // //                                   color="red"
// // // // // //                                 />
// // // // // //                               </TouchableOpacity>
// // // // // //                             )}
// // // // // //                           </View>
// // // // // //                         );
// // // // // //                       })}
// // // // // //                     </View>

// // // // // //                     {/* Taxes */}
// // // // // //                     <View className="">
// // // // // //                       <View className="flex flex-row items-center justify-between">
// // // // // //                         <Text className="tracking-wider text-base">Tax</Text>
// // // // // //                         <View className="flex flex-row items-center">
// // // // // //                           <Switch
// // // // // //                             value={product?.[category]?.showTaxInBill || false}
// // // // // //                             onValueChange={(value) => handleInputChange("showTaxInBill", value, category)}
// // // // // //                             trackColor={{ false: "red", true: "green" }}
// // // // // //                             thumbColor={product?.[category]?.showTaxInBill ? "#ffffff" : "#f4f3f4"}
// // // // // //                           />
// // // // // //                         <TouchableOpacity
// // // // // //                           onPress={() => addItem(category, "tax_json")}
// // // // // //                           activeOpacity={0.7}
// // // // // //                             className="bg-primary ml-2 w-6 h-6 flex justify-center items-center rounded-full shadow-xl"
// // // // // //                         >
// // // // // //                           <FontAwesome6 name="plus" size={17} color="white" />
// // // // // //                         </TouchableOpacity>
// // // // // //                         </View>
// // // // // //                       </View>
// // // // // //                       {/* Input fields */}
// // // // // //                       {product[category]?.tax_json?.map((tax, index) => {
// // // // // //                         return (
// // // // // //                           <View
// // // // // //                             key={index}
// // // // // //                             className="flex pt-2 pl-1 items-end flex-row"
// // // // // //                           >
// // // // // //                             {/* tax name */}
// // // // // //                             <View className="w-[45%] pr-2">
// // // // // //                               <OutlineInput
// // // // // //                                 placeholder="e.g. Tax"
// // // // // //                                 value={tax.name}
// // // // // //                                 onChangeText={(value) =>
// // // // // //                                   handleInputChange(
// // // // // //                                     "name",
// // // // // //                                     value,
// // // // // //                                     category,
// // // // // //                                     "tax_json",
// // // // // //                                     index
// // // // // //                                   )
// // // // // //                                 }
// // // // // //                               />
// // // // // //                             </View>

// // // // // //                             {/* tax amount */}
// // // // // //                             <View className="w-[45%] px-2">
// // // // // //                               <OutlineInput
// // // // // //                                 placeholder="e.g. 10%"
// // // // // //                                 value={tax.amount}
// // // // // //                                 keyboardType="numeric"
// // // // // //                                 onChangeText={(value) =>
// // // // // //                                   handleInputChange(
// // // // // //                                     "amount",
// // // // // //                                     value,
// // // // // //                                     category,
// // // // // //                                     "tax_json",
// // // // // //                                     index
// // // // // //                                   )
// // // // // //                                 }
// // // // // //                               />
// // // // // //                             </View>

// // // // // //                             {/* trash icon */}
// // // // // //                             {product[category]?.tax_json.length > 1 && (
// // // // // //                               <TouchableOpacity
// // // // // //                                 onPress={() =>
// // // // // //                                   removeChargeTaxInput(
// // // // // //                                     category,
// // // // // //                                     "tax_json",
// // // // // //                                     index
// // // // // //                                   )
// // // // // //                                 }
// // // // // //                                 activeOpacity={0.7}
// // // // // //                                 className="w-[10%] flex justify-center pl-3"
// // // // // //                               >
// // // // // //                                 <FontAwesome6
// // // // // //                                   name="trash"
// // // // // //                                   size={15}
// // // // // //                                   color="red"
// // // // // //                                 />
// // // // // //                               </TouchableOpacity>
// // // // // //                             )}
// // // // // //                           </View>
// // // // // //                         );
// // // // // //                       })}
// // // // // //                     </View>
// // // // // //                   </View>
// // // // // //                 </View>
// // // // // //               )
// // // // // //             );
// // // // // //           })}
// // // // // //           {/* ---------  common for sale & purchase - END - ---------- */}

// // // // // //           {/* Custom Fields Section */}
// // // // // //           <View className="px-4 pb-4">
// // // // // //             <View className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
// // // // // //               <View className="flex-row items-center justify-between mb-4">
// // // // // //                 <Text className="text-lg font-semibold text-gray-800">Custom Fields</Text>
// // // // // //                 <TouchableOpacity
// // // // // //                   onPress={() => {
// // // // // //                     setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
// // // // // //                     setCustomFieldModal(true);
// // // // // //                   }}
// // // // // //                   className="bg-primary px-4 py-2 rounded-full flex-row items-center"
// // // // // //                 >
// // // // // //                   <FontAwesome6 name="plus" size={14} color="white" className="mr-2" />
// // // // // //                   <Text className="text-white font-medium ml-1">Add Field</Text>
// // // // // //                 </TouchableOpacity>
// // // // // //               </View>

// // // // // //               {/* Custom Fields List */}
// // // // // //               {(product[product.type]?.custom_fields || []).map((field, index) => (
// // // // // //                 <View key={index} className="mb-4 bg-gray-50 p-3 rounded-lg">
// // // // // //                   <View className="flex-row items-center justify-between">
// // // // // //                     <View className="flex-1">
// // // // // //                       <Text className="text-base font-medium">{field.label}</Text>
// // // // // //                       <Text className="text-sm text-gray-600">{field.value} {field.unit?.value || ''}</Text>
// // // // // //                     </View>
// // // // // //                     <View className="flex-row items-center">
// // // // // //                       <Switch
// // // // // //                         value={field.showInBill}
// // // // // //                         onValueChange={(value) => {
// // // // // //                           const updatedFields = [...(product[product.type].custom_fields || [])];
// // // // // //                           updatedFields[index] = { ...field, showInBill: value };
// // // // // //                           handleInputChange("custom_fields", updatedFields, product.type);
// // // // // //                         }}
// // // // // //                         trackColor={{ false: "#767577", true: "#22c55e" }}
// // // // // //                         thumbColor={field.showInBill ? "#ffffff" : "#f4f3f4"}
// // // // // //                       />
// // // // // //                       <TouchableOpacity
// // // // // //                         onPress={() => {
// // // // // //                           const updatedFields = (product[product.type].custom_fields || []).filter((_, i) => i !== index);
// // // // // //                           handleInputChange("custom_fields", updatedFields, product.type);
// // // // // //                         }}
// // // // // //                         className="ml-4 bg-red-100 p-2 rounded-full"
// // // // // //                       >
// // // // // //                         <FontAwesome6 name="trash" size={16} color="#ef4444" />
// // // // // //                       </TouchableOpacity>
// // // // // //                     </View>
// // // // // //                   </View>
// // // // // //                 </View>
// // // // // //               ))}

// // // // // //               {!(product[product.type]?.custom_fields?.length > 0) && (
// // // // // //                 <View className="items-center py-6 bg-gray-50 rounded-lg">
// // // // // //                   <Text className="text-gray-500 text-sm">No custom fields added yet</Text>
// // // // // //                   <Text className="text-gray-400 text-xs mt-1">Click the "Add Field" button to create custom fields</Text>
// // // // // //                 </View>
// // // // // //               )}
// // // // // //             </View>
// // // // // //           </View>

// // // // // //           {/* Custom Field Modal */}
// // // // // //           <Modal
// // // // // //             visible={customFieldModal}
// // // // // //             transparent
// // // // // //             animationType="fade"
// // // // // //             onRequestClose={() => setCustomFieldModal(false)}
// // // // // //           >
// // // // // //             <View className="flex-1 justify-center items-center bg-black/50">
// // // // // //               <View className="bg-white p-4 rounded-lg w-[90%] max-w-md">
// // // // // //                 <Text className="text-lg font-semibold mb-4">Add Custom Field</Text>
                
// // // // // //                 {/* Field Label */}
// // // // // //             <View className="mb-4">
// // // // // //               <InputBox
// // // // // //                     name="label"
// // // // // //                     label="Field Label"
// // // // // //                     placeholder="e.g., Less Weight 2"
// // // // // //                     value={tempCustomField.label}
// // // // // //                     onChange={({ value }) => setTempCustomField(prev => ({ ...prev, label: value }))}
// // // // // //                   />
// // // // // //                 </View>

// // // // // //                 {/* Field Value */}
// // // // // //                 <View className="mb-4">
// // // // // //                   <InputBox
// // // // // //                     name="value"
// // // // // //                     label="Value"
// // // // // //                     placeholder="Enter numeric value"
// // // // // //                     value={tempCustomField.value}
// // // // // //                     keyboardType="numeric"
// // // // // //                     onChange={({ value }) => setTempCustomField(prev => ({ ...prev, value }))}
// // // // // //                   />
// // // // // //                 </View>

// // // // // //                 {/* Unit Selection */}
// // // // // //                 <View className="mb-4">
// // // // // //                   <SelectInput
// // // // // //                     label="Unit"
// // // // // //                     name="unit"
// // // // // //                     value={tempCustomField.unit}
// // // // // //                     placeholder="Select Unit"
// // // // // //                     data={jewelryUnits}
// // // // // //                     onSelect={(value) => setTempCustomField(prev => ({ ...prev, unit: value }))}
// // // // // //                   />
// // // // // //                 </View>

// // // // // //                 {/* Show in Bill Toggle */}
// // // // // //                 <View className="flex-row items-center justify-between mb-6">
// // // // // //                   <Text className="text-base text-gray-700">Show in Bill</Text>
// // // // // //                   <Switch
// // // // // //                     value={tempCustomField.showInBill}
// // // // // //                     onValueChange={(value) => setTempCustomField(prev => ({ ...prev, showInBill: value }))}
// // // // // //                     trackColor={{ false: "#767577", true: "#22c55e" }}
// // // // // //                     thumbColor={tempCustomField.showInBill ? "#ffffff" : "#f4f3f4"}
// // // // // //                   />
// // // // // //                 </View>

// // // // // //                 {/* Buttons */}
// // // // // //                 <View className="flex-row justify-end space-x-2">
// // // // // //                   <TouchableOpacity 
// // // // // //                     onPress={() => {
// // // // // //                       setCustomFieldModal(false);
// // // // // //                       setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
// // // // // //                     }}
// // // // // //                     className="px-4 py-2"
// // // // // //                   >
// // // // // //                     <Text className="text-gray-600">Cancel</Text>
// // // // // //                   </TouchableOpacity>
// // // // // //                   <TouchableOpacity 
// // // // // //                     onPress={() => {
// // // // // //                       const updatedFields = [...(product[product.type]?.custom_fields || [])];
// // // // // //                       updatedFields.push(tempCustomField);
// // // // // //                       handleInputChange("custom_fields", updatedFields, product.type);
// // // // // //                       setCustomFieldModal(false);
// // // // // //                       setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
// // // // // //                     }}
// // // // // //                     className="bg-primary px-4 py-2 rounded-md"
// // // // // //                   >
// // // // // //                     <Text className="text-white">Done</Text>
// // // // // //                   </TouchableOpacity>
// // // // // //                 </View>
// // // // // //               </View>
// // // // // //             </View>
// // // // // //           </Modal>

// // // // // //           {/* Horizontal Layout for Photo + Buttons */}
// // // // // //           <View className="flex-row px-4 pb-4">
// // // // // //             {/* Additional Photo - Left Side */}
// // // // // //             <View className="flex-1 pr-2">
// // // // // //               <View className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
// // // // // //                 <Text className="text-sm font-medium mb-2 text-center">Additional Photo</Text>
// // // // // //                 <ImagePickerComponent
// // // // // //                   name="additional_image"
// // // // // //                   value={product?.additional_image}
// // // // // //                 onChange={({ value, name }) => handleInputChange(name, value)}
// // // // // //               />
// // // // // //                 <Text className="text-xs text-gray-500 mt-2 text-center">
// // // // // //                   Upload item photo
// // // // // //                 </Text>
// // // // // //               </View>
// // // // // //             </View>

// // // // // //             {/* Buttons - Right Side */}
// // // // // //             <View className="w-1/3 pl-2">
// // // // // //             {isFromInvoice ? (
// // // // // //                 <View className="space-y-2">
// // // // // //                 <CommonButton
// // // // // //                   loading={loading}
// // // // // //                   onPress={handleAddProduct}
// // // // // //                   title="Add Product"
// // // // // //                     />
// // // // // //               </View>
// // // // // //             ) : (
// // // // // //                 <View className="space-y-2">
// // // // // //                   <CommonButton
// // // // // //                     loading={loading}
// // // // // //                     onPress={onSubmitClick}
// // // // // //                     title={route?.params?.isProductEdit || updateData ? "Update" : "Create"}
// // // // // //                   />
// // // // // //               </View>
// // // // // //             )}
// // // // // //             </View>
// // // // // //           </View>
// // // // // //         </View>
// // // // // //       </KeyboardHanlder>

// // // // // //       {/* Add weight */}
// // // // // //       {updateData && (
// // // // // //         <AddWeightModal
// // // // // //           product={{ id: updateData.id, type: product?.type }}
// // // // // //           open={initialState.weightModal}
// // // // // //           onClose={() => handleInitialState("weightModal", false)}
// // // // // //         />
// // // // // //       )}

// // // // // //       {/* Create metal */}
// // // // // //       <CreateMetalModal
// // // // // //         navigation={navigation}
// // // // // //         route={route}
// // // // // //         open={initialState.metalModal}
// // // // // //         onClose={() => handleInitialState("metalModal", false)}
// // // // // //       />

// // // // // //       {/* Date Picker Modals */}
// // // // // //       <Modal
// // // // // //         visible={initialState.billDatePicker}
// // // // // //         transparent
// // // // // //         animationType="fade"
// // // // // //         onRequestClose={() => handleInitialState("billDatePicker", false)}
// // // // // //       >
// // // // // //         <View className="flex-1 justify-center items-center bg-black/50">
// // // // // //           <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
// // // // // //             <Text className="text-lg font-semibold mb-4">Select Bill Date</Text>
            
// // // // // //             <DatePickerComponent
// // // // // //               name="bill_date"
// // // // // //               value={product?.bill_date}
// // // // // //               onSelect={({ value }) => {
// // // // // //                 handleInputChange("bill_date", value);
// // // // // //                 handleInitialState("billDatePicker", false);
// // // // // //               }}
// // // // // //             />

// // // // // //             <TouchableOpacity 
// // // // // //               onPress={() => handleInitialState("billDatePicker", false)}
// // // // // //               className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
// // // // // //             >
// // // // // //               <Text className="text-white">Close</Text>
// // // // // //             </TouchableOpacity>
// // // // // //           </View>
// // // // // //         </View>
// // // // // //       </Modal>

// // // // // //       <Modal
// // // // // //         visible={initialState.paymentDatePicker}
// // // // // //         transparent
// // // // // //         animationType="fade"
// // // // // //         onRequestClose={() => handleInitialState("paymentDatePicker", false)}
// // // // // //       >
// // // // // //         <View className="flex-1 justify-center items-center bg-black/50">
// // // // // //           <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
// // // // // //             <Text className="text-lg font-semibold mb-4">Select Expected Payment Date</Text>
            
// // // // // //             <DatePickerComponent
// // // // // //               name="payment_date"
// // // // // //               value={product?.payment_date}
// // // // // //               onSelect={({ value }) => {
// // // // // //                 handleInputChange("payment_date", value);
// // // // // //                 handleInitialState("paymentDatePicker", false);
// // // // // //               }}
// // // // // //             />

// // // // // //             <TouchableOpacity 
// // // // // //               onPress={() => handleInitialState("paymentDatePicker", false)}
// // // // // //               className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
// // // // // //             >
// // // // // //               <Text className="text-white">Close</Text>
// // // // // //             </TouchableOpacity>
// // // // // //           </View>
// // // // // //         </View>
// // // // // //       </Modal>

// // // // // //       <Modal
// // // // // //         visible={initialState.interestStartDatePicker}
// // // // // //         transparent
// // // // // //         animationType="fade"
// // // // // //         onRequestClose={() => handleInitialState("interestStartDatePicker", false)}
// // // // // //       >
// // // // // //         <View className="flex-1 justify-center items-center bg-black/50">
// // // // // //           <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
// // // // // //             <Text className="text-lg font-semibold mb-4">Select Interest Start Date</Text>
            
// // // // // //             <DatePickerComponent
// // // // // //               name="interest_start_date"
// // // // // //               value={product?.interest_start_date}
// // // // // //               onSelect={({ value }) => {
// // // // // //                 handleInputChange("interest_start_date", value);
// // // // // //                 handleInitialState("interestStartDatePicker", false);
// // // // // //               }}
// // // // // //             />

// // // // // //             <TouchableOpacity 
// // // // // //               onPress={() => handleInitialState("interestStartDatePicker", false)}
// // // // // //               className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
// // // // // //             >
// // // // // //               <Text className="text-white">Close</Text>
// // // // // //             </TouchableOpacity>
// // // // // //           </View>
// // // // // //         </View>
// // // // // //       </Modal>

// // // // // //     </Fragment>
// // // // // //   );
// // // // // // };

// // // // // // export default ProductForm;
// // // // // import InputBox from "@/src/components/common/InputBox";
// // // // // import React, { Fragment, useEffect, useState } from "react";
// // // // // import { View, TouchableOpacity, Switch, Modal, SafeAreaView, ScrollView, Alert, BackHandler, FlatList, Text, Platform } from "react-native";
// // // // // import { useDispatch, useSelector } from "react-redux";
// // // // // import SimpleReactValidator from "simple-react-validator";
// // // // // import CommonButton from "@/src/components/common/buttons/CommonButton";
// // // // // import SelectInput from "@/src/components/common/SelectInput";
// // // // // import ImagePickerComponent from "@/src/components/common/ImagePicker";
// // // // // import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
// // // // // import {
// // // // //   fetchProductDetail,
// // // // //   fetchProductGroups,
// // // // //   manageProductList,
// // // // //   fetchProductList,
// // // // // } from "@/src/redux/actions/product.action";
// // // // // import KeyboardHanlder from "@/src/components/common/KeyboardHanlder";
// // // // // import CreateMetalModal from "./CreateMetalModal";
// // // // // import AddWeightModal from "./AddWeightModal";
// // // // // import OutlineInput from "@/src/components/common/OutlineInput";
// // // // // import SearchProduct from "./SearchProduct";
// // // // // import { makingTypes } from "@/src/utils";
// // // // // import AntDesign from "@expo/vector-icons/AntDesign";
// // // // // import moment from "moment";
// // // // // import DatePickerComponent from "@/src/components/common/DateTimePicker";
// // // // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // // // import { useFocusEffect } from "@react-navigation/native";
// // // // // import { getToken } from "@/src/utils/auth";
// // // // // import { ApiRequest } from "@/src/utils/api";
// // // // // import { MANAGE_PRODUCT_API, MANAGE_LOGS_API, MANAGE_BILL_API } from "@/src/utils/api/endpoints";
// // // // // import ShowToast from "@/src/components/common/ShowToast";

// // // // // // process sale and purchase data
// // // // // export function processProductData(productData, prefix, isFromInvoice) {
// // // // //   return productData.map((item) => {
// // // // //     const processedItem = {
// // // // //       gross_weight: 0,
// // // // //       less_weight: 0,
// // // // //       net_weight: 0,
// // // // //       net_price: 0,
// // // // //       wastage: 0,
// // // // //       tounch: 0,
// // // // //       fine_weight: 0,
// // // // //       rate: 0,
// // // // //       making_type: "",
// // // // //       charges_json: [{}],
// // // // //       tax_json: [{}],
// // // // //       custom_fields: [], // Initialize custom_fields
// // // // //     };
// // // // //     for (const key in item) {
// // // // //       if (key.startsWith(prefix)) {
// // // // //         const newKey = key.replace(prefix, "");
// // // // //         processedItem[newKey] = key.includes("_json")
// // // // //           ? (() => {
// // // // //               try {
// // // // //                 return JSON.parse(item[key].replace(/'/g, '"'));
// // // // //               } catch (e) {
// // // // //                 console.error("Invalid JSON string:", item[key]);
// // // // //                 return [{}];
// // // // //               }
// // // // //             })()
// // // // //           : key === "making_type"
// // // // //           ? makingTypes.find((type) => type.value === item[key]) || ""
// // // // //           : item[key];
// // // // //       }
// // // // //     }
// // // // //     return processedItem;
// // // // //   });
// // // // // }

// // // // // // Storage key for form data
// // // // // const PRODUCT_FORM_STORAGE_KEY = "productForm_savedState";

// // // // // const ProductForm = ({
// // // // //   navigation,
// // // // //   route,
// // // // //   isFromInvoice = false,
// // // // //   invoiceHandler,
// // // // //   handleCancel,
// // // // // }) => {
// // // // //   const updateData = route?.params?.updateData;
// // // // //   const isBillEdit = route?.params?.isBillEdit;
// // // // //   const billType = route?.params?.billType;
// // // // //   const dispatch = useDispatch();
// // // // //   const [errors, setErrors] = useState({});
// // // // //   const [initialState, setInitialState] = useState({
// // // // //     metalModal: false,
// // // // //     weightModal: false,
// // // // //     datePicker: false,
// // // // //     billDatePicker: false,
// // // // //     paymentDatePicker: false,
// // // // //     interestStartDatePicker: false,
// // // // //   });
// // // // //   const [customFieldModal, setCustomFieldModal] = useState(false);
// // // // //   const [tempCustomField, setTempCustomField] = useState({
// // // // //     label: "",
// // // // //     value: "",
// // // // //     unit: "",
// // // // //     showInBill: true,
// // // // //   });
// // // // //   const [dataLoaded, setDataLoaded] = useState(false);
// // // // //   const [formChanged, setFormChanged] = useState(false);
// // // // //   const [loading, setLoading] = useState(false);
// // // // //   const [showSuggestions, setShowSuggestions] = useState(false);
// // // // //   const [filteredProducts, setFilteredProducts] = useState([]);
// // // // //   const { productGroups, isLoading: productLoading, productDetail, products } = useSelector(
// // // // //     (state) => state.productSlices
// // // // //   );
// // // // //   const { profileData } = useSelector((state) => state.userSlices);
// // // // //   const validator = new SimpleReactValidator();
// // // // //   const productTypes = ["purchase", "sale"];

// // // // //   const formType = isFromInvoice
// // // // //     ? (invoiceHandler?.isPurchase ? "purchase" : "sale")
// // // // //     : "purchase";

// // // // //   const defaultProductState = {
// // // // //     type: formType,
// // // // //     size: "",
// // // // //     interest_enabled: false,
// // // // //     interest_type: { label: "Flat", value: "2" },
// // // // //     interest_rate: "2",
// // // // //     interest_amount: "0",
// // // // //     bill_date: new Date(),
// // // // //     payment_date: null,
// // // // //     interest_start_date: null,
// // // // //     interest_upto: null,
// // // // //     grace_period_enabled: false,
// // // // //     grace_period_days: "0",
// // // // //     original_amount: "0",
// // // // //     remaining_balance: "0",
// // // // //     interest_notes: "",
// // // // //     payment_history: [],
// // // // //     cutting_enabled: false,
// // // // //     sale: {
// // // // //       gross_weight: 0,
// // // // //       less_weight: 0,
// // // // //       net_weight: 0,
// // // // //       net_price: 0,
// // // // //       wastage: 0,
// // // // //       tounch: 0,
// // // // //       fine_weight: 0,
// // // // //       rate: 0,
// // // // //       metal_value: "0",
// // // // //       making_type: "",
// // // // //       making_charge: 0,
// // // // //       photo: null,
// // // // //       charges_json: [{}],
// // // // //       tax_json: [{}],
// // // // //       custom_fields: [], // Initialize custom_fields
// // // // //       showSizeInBill: true,
// // // // //       showGrossWeightInBill: true,
// // // // //       showLessWeightInBill: true,
// // // // //       showNetWeightInBill: true,
// // // // //       showWastageInBill: true,
// // // // //       showTounchInBill: true,
// // // // //       showFineWeightInBill: true,
// // // // //       showRateInBill: true,
// // // // //       showMakingChargeInBill: true,
// // // // //       showHuidInBill: true,
// // // // //       showHsnInBill: true,
// // // // //       showPriceInBill: true,
// // // // //       showTaxInBill: true,
// // // // //       showChargesInBill: true,
// // // // //       showCommentInBill: true,
// // // // //     },
// // // // //     purchase: {
// // // // //       gross_weight: 0,
// // // // //       less_weight: 0,
// // // // //       net_weight: 0,
// // // // //       net_price: 0,
// // // // //       wastage: 0,
// // // // //       tounch: 0,
// // // // //       fine_weight: 0,
// // // // //       rate: 0,
// // // // //       metal_value: "0",
// // // // //       making_type: "",
// // // // //       making_charge: 0,
// // // // //       photo: null,
// // // // //       charges_json: [{}],
// // // // //       tax_json: [{}],
// // // // //       custom_fields: [], // Initialize custom_fields
// // // // //       showSizeInBill: true,
// // // // //       showGrossWeightInBill: true,
// // // // //       showLessWeightInBill: true,
// // // // //       showNetWeightInBill: true,
// // // // //       showWastageInBill: true,
// // // // //       showTounchInBill: true,
// // // // //       showFineWeightInBill: true,
// // // // //       showRateInBill: true,
// // // // //       showMakingChargeInBill: true,
// // // // //       showHuidInBill: true,
// // // // //       showHsnInBill: true,
// // // // //       showPriceInBill: true,
// // // // //       showTaxInBill: true,
// // // // //       showChargesInBill: true,
// // // // //       showCommentInBill: true,
// // // // //     },
// // // // //   };

// // // // //   const [product, setProduct] = useState(defaultProductState);

// // // // //   const saveFormData = async (formData) => {
// // // // //     try {
// // // // //       await AsyncStorage.setItem(PRODUCT_FORM_STORAGE_KEY, JSON.stringify(formData));
// // // // //       console.log("Form data saved to AsyncStorage");
// // // // //       setFormChanged(true);
// // // // //     } catch (error) {
// // // // //       console.error("Error saving form data:", error);
// // // // //     }
// // // // //   };

// // // // //   const loadFormData = async () => {
// // // // //     try {
// // // // //       const savedData = await AsyncStorage.getItem(PRODUCT_FORM_STORAGE_KEY);
// // // // //       if (savedData) {
// // // // //         const parsedData = JSON.parse(savedData);
// // // // //         console.log("Loaded saved form data");
// // // // //         setProduct(parsedData);
// // // // //       }
// // // // //       setDataLoaded(true);
// // // // //     } catch (error) {
// // // // //       console.error("Error loading form data:", error);
// // // // //       setDataLoaded(true);
// // // // //     }
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     if (updateData?.id) {
// // // // //       dispatch(fetchProductDetail({ id: updateData.id }));
// // // // //       setDataLoaded(true);
// // // // //     } else {
// // // // //       loadFormData();
// // // // //     }
// // // // //   }, []);

// // // // //   const isSelectRate = product?.hsn_id?.variation?.length > 0;

// // // // //   const handleDigitsFix = (value) => {
// // // // //     if (!value || isNaN(value)) return "0.00";
// // // // //     return parseFloat(value).toFixed(2);
// // // // //   };

// // // // //   const jewelryUnits = [
// // // // //     { label: "Grams (g)", value: "g" },
// // // // //     { label: "Milligrams (mg)", value: "mg" },
// // // // //     { label: "Carats (ct)", value: "ct" },
// // // // //     { label: "Pieces (pcs)", value: "pcs" },
// // // // //     { label: "Inches (in)", value: "in" },
// // // // //     { label: "Millimeters (mm)", value: "mm" },
// // // // //     { label: "Percentage (%)", value: "%" },
// // // // //   ];

// // // // //   const calculateTotalChargesAndTaxes = (category) => {
// // // // //     let totalCharges = 0;
// // // // //     let totalTaxPercentage = 0;

// // // // //     if (category?.charges_json) {
// // // // //       totalCharges = category.charges_json.reduce(
// // // // //         (sum, charge) => sum + (Number(charge.amount) || 0),
// // // // //         0
// // // // //       );
// // // // //     }

// // // // //     if (category?.tax_json) {
// // // // //       totalTaxPercentage = category.tax_json.reduce(
// // // // //         (sum, tax) => sum + (Number(tax.amount) || 0),
// // // // //         0
// // // // //       );
// // // // //     }

// // // // //     return { totalCharges, totalTaxPercentage };
// // // // //   };

// // // // // const handleInputChange = (name, value, category, arrayKey, index) => {
// // // // //   const updatedProduct = { ...product };

// // // // //   if (arrayKey && typeof index === 'number' && updatedProduct[category]?.[arrayKey]) {
// // // // //     updatedProduct[category][arrayKey][index] = {
// // // // //       ...updatedProduct[category][arrayKey][index],
// // // // //       [name]: value,
// // // // //     };
// // // // //   } else if (category && updatedProduct[category]) {
// // // // //     updatedProduct[category][name] = value;
// // // // //   } else {
// // // // //     updatedProduct[name] = value;
// // // // //   }

// // // // //   // Calculate net_weight and fine_weight when relevant fields change
// // // // //   if (['gross_weight', 'less_weight', 'wastage', 'tounch'].includes(name) && updatedProduct[category]) {
// // // // //     const gross = parseFloat(updatedProduct[category].gross_weight) || 0;
// // // // //     const less = parseFloat(updatedProduct[category].less_weight) || 0;
// // // // //     const wastage = parseFloat(updatedProduct[category].wastage) || 0;
// // // // //     const tounch = parseFloat(updatedProduct[category].tounch) || 0;

// // // // //     // Calculate net_weight
// // // // //     updatedProduct[category].net_weight = (gross - less).toFixed(3);

// // // // //     // Calculate fine_weight: gross_weight * (tounch + wastage) / 100
// // // // //     updatedProduct[category].fine_weight = (gross * ((tounch + wastage) / 100)).toFixed(3);
// // // // //   }

// // // // //   setProduct(updatedProduct);
// // // // //   saveFormData(updatedProduct);

// // // // //   if (errors[name]) {
// // // // //     setErrors((prev) => ({ ...prev, [name]: null }));
// // // // //   }
// // // // // };
// // // // //   const handleInitialState = (name, value) => {
// // // // //     setInitialState({ ...initialState, [name]: value });
// // // // //   };

// // // // //   const handleSubmit = async () => {
// // // // //     try {
// // // // //       if (!product.name) {
// // // // //         ShowToast("Product name is required");
// // // // //         return;
// // // // //       }

// // // // //       setLoading(true);

// // // // //       const formData = new FormData();

// // // // //       formData.append('name', product.name || '');
// // // // //       formData.append('huid', product.huid || '');
// // // // //       formData.append('hsn_id', product.hsn_id?.value || '');
// // // // //       formData.append('bar_code', product.bar_code || '');
// // // // //       formData.append('comment', product.comment || '');

// // // // //       if (product.image && typeof product.image === 'object' && product.image.uri) {
// // // // //         formData.append('image', {
// // // // //           uri: Platform.OS === 'ios' ? product.image.uri.replace('file://', '') : product.image.uri,
// // // // //           type: 'image/jpeg',
// // // // //           name: `product_${Date.now()}.jpg`,
// // // // //         });
// // // // //       } else if (product.image && typeof product.image === 'string') {
// // // // //         formData.append('image_url', product.image);
// // // // //       }

// // // // //       formData.append('sale_gross_weight', String(product.sale?.gross_weight || '0'));
// // // // //       formData.append('sale_less_weight', String(product.sale?.less_weight || '0'));
// // // // //       formData.append('sale_net_weight', String(product.sale?.net_weight || '0'));
// // // // //       formData.append('sale_wastage', String(product.sale?.wastage || '0'));
// // // // //       formData.append('sale_tounch', String(product.sale?.tounch || '0'));
// // // // //       formData.append('sale_fine_weight', String(product.sale?.fine_weight || '0'));
// // // // //       formData.append('sale_rate', String((typeof product.sale?.rate === 'object' ? product.sale.rate?.price : product.sale?.rate) || '0'));
// // // // //       formData.append('sale_making_type', product.sale?.making_type?.value || 'PG');
// // // // //       formData.append('sale_making_charges', String(product.sale?.making_charge || '0'));
// // // // //       formData.append('sale_net_price', String(product.sale?.net_price || '0'));
// // // // //       formData.append('sale_piece', '1');

// // // // //       formData.append('purchase_gross_weight', String(product.purchase?.gross_weight || '0'));
// // // // //       formData.append('purchase_less_weight', String(product.purchase?.less_weight || '0'));
// // // // //       formData.append('purchase_net_weight', String(product.purchase?.net_weight || '0'));
// // // // //       formData.append('purchase_wastage', String(product.purchase?.wastage || '0'));
// // // // //       formData.append('purchase_tounch', String(product.purchase?.tounch || '0'));
// // // // //       formData.append('purchase_fine_weight', String(product.purchase?.fine_weight || '0'));
// // // // //       formData.append('purchase_rate', String((typeof product.purchase?.rate === 'object' ? product.purchase.rate?.price : product.purchase?.rate) || '0'));
// // // // //       formData.append('purchase_making_type', product.purchase?.making_type?.value || 'PG');
// // // // //       formData.append('purchase_making_charges', String(product.purchase?.making_charge || '0'));
// // // // //       formData.append('purchase_net_price', String(product.purchase?.net_price || '0'));
// // // // //       formData.append('purchase_piece', '1');

// // // // //       formData.append('sale_charges_json', JSON.stringify(product.sale?.charges_json || []));
// // // // //       formData.append('sale_tax_json', JSON.stringify(product.sale?.tax_json || []));
// // // // //       formData.append('purchase_charges_json', JSON.stringify(product.purchase?.charges_json || []));
// // // // //       formData.append('purchase_tax_json', JSON.stringify(product.purchase?.tax_json || []));

// // // // //       const now = new Date();
// // // // //       const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');

// // // // //       const [productResponse, logResponse] = await Promise.all([
// // // // //         ApiRequest({
// // // // //           url: MANAGE_PRODUCT_API.create,
// // // // //           method: 'POST',
// // // // //           body: formData,
// // // // //           headers: {
// // // // //             'Content-Type': 'multipart/form-data',
// // // // //           },
// // // // //         }),
// // // // //         ApiRequest({
// // // // //           url: MANAGE_LOGS_API.create,
// // // // //           method: 'POST',
// // // // //           body: {
// // // // //             userName: profileData?.name || 'Unknown User',
// // // // //             productName: product.name || 'Unknown Product',
// // // // //             id: 0,
// // // // //             type: 'product',
// // // // //             amount: parseFloat(product[product.type]?.net_price || 0).toFixed(2),
// // // // //             action: 'CREATE',
// // // // //             entityType: 'PRODUCT',
// // // // //             timestamp: timestamp,
// // // // //             metadata: JSON.stringify({
// // // // //               action: 'Created new product',
// // // // //               productId: product.product_id || 'new',
// // // // //               note: `Created product: ${product.name}`,
// // // // //               formData: {
// // // // //                 sale_gross_weight: product.sale?.gross_weight || 0,
// // // // //                 sale_net_weight: product.sale?.net_weight || 0,
// // // // //                 sale_fine_weight: product.sale?.fine_weight || 0,
// // // // //                 sale_net_price: product.sale?.net_price || 0,
// // // // //               },
// // // // //             }),
// // // // //           },
// // // // //         }),
// // // // //       ]);

// // // // //       if (!productResponse?.success) {
// // // // //         throw new Error(productResponse?.message || "Failed to save product");
// // // // //       }

// // // // //       if (!logResponse?.success) {
// // // // //         console.error("Warning: Product saved but log creation failed:", logResponse?.message);
// // // // //         ShowToast("Product saved but logging failed");
// // // // //       } else {
// // // // //         ShowToast(productResponse.message || "Product created successfully");
// // // // //       }

// // // // //       await AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY);
// // // // //       navigation.goBack();
// // // // //     } catch (error) {
// // // // //       console.error('Error details:', error);
// // // // //       ShowToast(error.message || "Error saving product");
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   const onSubmitClick = () => {
// // // // //     const isUpdate = route?.params?.isProductEdit || updateData?.id;
// // // // //     if (isUpdate) {
// // // // //       const formData = new FormData();
// // // // //       formData.append('id', updateData?.id || route?.params?.id);
// // // // //       handleUpdate();
// // // // //     } else {
// // // // //       handleSubmit();
// // // // //     }
// // // // //   };

// // // // //   const resetProduct = async () => {
// // // // //     Alert.alert(
// // // // //       "Reset Form",
// // // // //       "Are you sure you want to reset all form values?",
// // // // //       [
// // // // //         {
// // // // //           text: "Cancel",
// // // // //           style: "cancel",
// // // // //         },
// // // // //         {
// // // // //           text: "Reset",
// // // // //           onPress: async () => {
// // // // //             try {
// // // // //               await AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY);
// // // // //               console.log("Form data cleared during reset");
// // // // //               setProduct(defaultProductState);
// // // // //               setFormChanged(false);
// // // // //             } catch (error) {
// // // // //               console.error("Error clearing form data:", error);
// // // // //               ShowToast("Error clearing form data");
// // // // //             }
// // // // //           },
// // // // //         },
// // // // //       ]
// // // // //     );
// // // // //   };

// // // // //   const addItem = (type, key) => {
// // // // //     setProduct((prev) => ({
// // // // //       ...prev,
// // // // //       [type]: {
// // // // //         ...prev[type],
// // // // //         [key]: [
// // // // //           ...prev[type][key],
// // // // //           key === "charges_json"
// // // // //             ? { name: "", amount: "0" }
// // // // //             : { name: "", amount: "0" },
// // // // //         ],
// // // // //       },
// // // // //     }));
// // // // //   };

// // // // //   const removeChargeTaxInput = (type, key, index) => {
// // // // //     setProduct((prev) => {
// // // // //       const updatedCategory = { ...prev[type] };
// // // // //       const itemToRemove = updatedCategory[key].find((item, i) => i === index);
// // // // //       updatedCategory[key] = updatedCategory[key].filter(
// // // // //         (item, i) => i !== index
// // // // //       );

// // // // //       updatedCategory.net_price =
// // // // //         Number(updatedCategory.net_price || 0) - Number(itemToRemove?.amount || 0);

// // // // //       return {
// // // // //         ...prev,
// // // // //         [type]: updatedCategory,
// // // // //       };
// // // // //     });
// // // // //   };

// // // // //   const handleProductTypeChange = (type) => {
// // // // //     const isSale = type === "sale";
// // // // //     setProduct((prev) => {
// // // // //       const updatedSale = isSale
// // // // //         ? {
// // // // //             ...prev.purchase,
// // // // //             gross_weight: prev?.sale?.gross_weight || 0,
// // // // //             less_weight: prev?.sale?.less_weight || 0,
// // // // //             net_weight: prev?.sale?.net_weight || 0,
// // // // //             net_price: prev?.sale?.net_price || 0,
// // // // //           }
// // // // //         : prev.sale;

// // // // //       return { ...prev, sale: updatedSale, type };
// // // // //     });
// // // // //   };

// // // // //   const handleProductDetail = (data) => {
// // // // //     const {
// // // // //       name,
// // // // //       hsn_id,
// // // // //       huid,
// // // // //       comment,
// // // // //       image_url,
// // // // //       sale_product_data,
// // // // //       purchase_product_data,
// // // // //     } = data;

// // // // //     const purchase = processProductData(
// // // // //       purchase_product_data || [{}],
// // // // //       "purchase_",
// // // // //       isFromInvoice
// // // // //     );
// // // // //     const sale = processProductData(
// // // // //       sale_product_data || [{}],
// // // // //       "sale_",
// // // // //       isFromInvoice
// // // // //     );
// // // // //     const hsnName = productGroups.find((item) => item.id == hsn_id);

// // // // //     setProduct({
// // // // //       ...defaultProductState,
// // // // //       ...(isFromInvoice
// // // // //         ? { product_id: data.id, product_name: data.name }
// // // // //         : {}),
// // // // //       name: name || "",
// // // // //       huid: huid || "",
// // // // //       comment: comment || "",
// // // // //       image: image_url || "",
// // // // //       hsn_id: hsnName ? { label: hsnName.name, value: hsnName.id } : null,
// // // // //       sale: sale[0] || defaultProductState.sale,
// // // // //       purchase: purchase[0] || defaultProductState.purchase,
// // // // //     });
// // // // //   };

// // // // //   const handleAddProduct = () => {
// // // // //     if (validator.allValid()) {
// // // // //       const newProducts = [
// // // // //         ...(invoiceHandler?.formValue?.selectedProduct || []),
// // // // //       ];

// // // // //       const { name, hsn_id, huid, comment, image, size } = product;

// // // // //       const productData = {
// // // // //         name,
// // // // //         huid,
// // // // //         size,
// // // // //         hsn_id: hsn_id?.value || '',
// // // // //         comment,
// // // // //         sale: product.sale || {},
// // // // //         purchase: product.purchase || {},
// // // // //         ...product[product.type],
// // // // //         rate: typeof product[product.type].rate === 'object'
// // // // //           ? product[product.type].rate?.price
// // // // //           : product[product.type].rate,
// // // // //         product_id: Math.random().toString(36).substring(2, 9),
// // // // //       };

// // // // //       newProducts.push(productData);

// // // // //       const totalPrice = newProducts.reduce(
// // // // //         (acc, product) => Number(acc) + Number(product[invoiceHandler?.isPurchase ? "purchase" : "sale"]?.net_price || 0),
// // // // //         0
// // // // //       );

// // // // //       invoiceHandler?.setFormValue({
// // // // //         ...invoiceHandler?.formValue,
// // // // //         selectedProduct: newProducts,
// // // // //         totalPrice,
// // // // //       });

// // // // //       AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY)
// // // // //         .then(() => console.log("Form data cleared after adding product to invoice"))
// // // // //         .catch((error) => console.error("Error clearing form data:", error));

// // // // //       resetProduct();
// // // // //       setFormChanged(false);

// // // // //       if (invoiceHandler && invoiceHandler.onSubmit) {
// // // // //         invoiceHandler.onSubmit();
// // // // //       }
// // // // //     } else {
// // // // //       setErrors(validator.errorMessages);
// // // // //     }
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     if (productDetail) {
// // // // //       handleProductDetail(productDetail);
// // // // //     }
// // // // //   }, [productDetail]);

// // // // //   useEffect(() => {
// // // // //     resetProduct();
// // // // //     dispatch(fetchProductGroups());
// // // // //     if (updateData) {
// // // // //       dispatch(fetchProductDetail(updateData?.id));
// // // // //     }
// // // // //   }, [dispatch, updateData]);

// // // // //   const calculateInterestPeriod = (product) => {
// // // // //     if (!product?.bill_date || !product?.payment_date) return 0;

// // // // //     const startDate = product?.interest_start_date
// // // // //       ? moment(product.interest_start_date)
// // // // //       : moment(product.bill_date);

// // // // //     const endDate = moment(product.payment_date);

// // // // //     let days = endDate.diff(startDate, 'days');

// // // // //     if (product?.grace_period_enabled) {
// // // // //       days = Math.max(0, days - Number(product?.grace_period_days || 0));
// // // // //     }

// // // // //     return days;
// // // // //   };

// // // // //   const calculateInterest = (updatedProduct) => {
// // // // //     if (!updatedProduct.interest_enabled) {
// // // // //       return { interestAmount: 0, dailyBreakdown: [] };
// // // // //     }

// // // // //     const balance = parseFloat(updatedProduct[updatedProduct.type]?.net_price || 0);
// // // // //     const interestRate = parseFloat(updatedProduct.interest_rate || 0) / 100;
// // // // //     const interestType = updatedProduct.interest_type?.value;

// // // // //     let interestAmount = 0;
// // // // //     let dailyBreakdown = [];

// // // // //     const days = calculateInterestPeriod(updatedProduct);
// // // // //     if (days <= 0) return { interestAmount: 0, dailyBreakdown: [] };

// // // // //     const timeInYears = days / 365;

// // // // //     if (interestType === "2") {
// // // // //       interestAmount = balance * interestRate * timeInYears;
// // // // //     } else if (interestType === "1") {
// // // // //       interestAmount = balance * (Math.pow(1 + interestRate, timeInYears) - 1);
// // // // //     }

// // // // //     return { interestAmount, dailyBreakdown };
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     if (product?.sale && product?.purchase) {
// // // // //       if (product.sale.tax_json && product.sale.tax_json.length > 0) {
// // // // //         const totalTax = product.sale.tax_json.reduce((sum, tax) => sum + Number(tax.amount || 0), 0);
// // // // //         handleInputChange("tax", totalTax, "sale");
// // // // //       }

// // // // //       if (product.purchase.tax_json && product.purchase.tax_json.length > 0) {
// // // // //         const totalTax = product.purchase.tax_json.reduce((sum, tax) => sum + Number(tax.amount || 0), 0);
// // // // //         handleInputChange("tax", totalTax, "purchase");
// // // // //       }
// // // // //     }
// // // // //   }, [product?.sale?.tax_json, product?.purchase?.tax_json]);

// // // // //   useEffect(() => {
// // // // //     if (product?.sale?.tax_json?.length > 0) {
// // // // //       const totalTax = product.sale.tax_json.reduce(
// // // // //         (sum, tax) => sum + Number(tax.amount || 0),
// // // // //         0
// // // // //       );
// // // // //       setProduct((prev) => ({
// // // // //         ...prev,
// // // // //         sale: {
// // // // //           ...prev.sale,
// // // // //           tax: totalTax,
// // // // //         },
// // // // //       }));
// // // // //     }

// // // // //     if (product?.purchase?.tax_json?.length > 0) {
// // // // //       const totalTax = product.purchase.tax_json.reduce(
// // // // //         (sum, tax) => sum + Number(tax.amount || 0),
// // // // //         0
// // // // //       );
// // // // //       setProduct((prev) => ({
// // // // //         ...prev,
// // // // //         purchase: {
// // // // //           ...prev.purchase,
// // // // //           tax: totalTax,
// // // // //         },
// // // // //       }));
// // // // //     }
// // // // //   }, [product?.sale?.tax_json, product?.purchase?.tax_json]);

// // // // //   useFocusEffect(
// // // // //     React.useCallback(() => {
// // // // //       const backAction = () => {
// // // // //         if (formChanged) {
// // // // //           Alert.alert(
// // // // //             "Form Data Saved",
// // // // //             isFromInvoice
// // // // //               ? "Your data has been saved. Do you want to return to the product list?"
// // // // //               : "Your entered data has been saved. You can continue editing later.",
// // // // //             [
// // // // //               { text: "Stay on Form", style: "cancel" },
// // // // //               {
// // // // //                 text: isFromInvoice ? "Back to List" : "Go Back",
// // // // //                 onPress: () => {
// // // // //                   if (isFromInvoice && handleCancel) {
// // // // //                     handleCancel();
// // // // //                   } else {
// // // // //                     navigation.goBack();
// // // // //                   }
// // // // //                 },
// // // // //               },
// // // // //             ]
// // // // //           );
// // // // //           return true;
// // // // //         } else if (isFromInvoice && handleCancel) {
// // // // //           handleCancel();
// // // // //           return true;
// // // // //         }
// // // // //         return false;
// // // // //       };

// // // // //       const backHandler = BackHandler.addEventListener(
// // // // //         "hardwareBackPress",
// // // // //         backAction
// // // // //       );

// // // // //       return () => backHandler.remove();
// // // // //     }, [formChanged, navigation, isFromInvoice, handleCancel])
// // // // //   );

// // // // //   useEffect(() => {
// // // // //     if (product?.interest_enabled) {
// // // // //       const { interestAmount } = calculateInterest(product);
// // // // //       handleInputChange("interest_amount", interestAmount.toString());
// // // // //     }
// // // // //   }, [
// // // // //     product?.bill_date,
// // // // //     product?.payment_date,
// // // // //     product?.interest_start_date,
// // // // //     product?.interest_rate,
// // // // //     product?.interest_type?.value,
// // // // //     product?.grace_period_enabled,
// // // // //     product?.grace_period_days,
// // // // //     product?.[product?.type]?.net_price,
// // // // //   ]);

// // // // //   useEffect(() => {
// // // // //     if (updateData) {
// // // // //       console.log('Received updateData:', updateData);

// // // // //       const hsnName = productGroups.find((item) => item.id == updateData.hsn_id);

// // // // //       const initialProductState = {
// // // // //         ...defaultProductState,
// // // // //         id: updateData.id,
// // // // //         type: updateData.type || formType,
// // // // //         name: updateData.name || "",
// // // // //         huid: updateData.huid || "",
// // // // //         hsn_id: hsnName ? { label: hsnName.name, value: hsnName.id } : null,
// // // // //         size: updateData.size || "",
// // // // //         remark: updateData.remark || "",
// // // // //         comment: updateData.comment || "",
// // // // //         image: updateData.image || "",
// // // // //         additional_image: updateData.additional_image || null,
// // // // //         cutting_enabled: updateData.cutting_enabled || false,
// // // // //         interest_enabled: updateData.interest_enabled || false,
// // // // //         interest_type: updateData.interest_type || { label: "Flat", value: "2" },
// // // // //         interest_rate: updateData.interest_rate || "2",
// // // // //         interest_amount: updateData.interest_amount || "0",
// // // // //         bill_date: updateData.bill_date ? new Date(updateData.bill_date) : new Date(),
// // // // //         payment_date: updateData.payment_date ? new Date(updateData.payment_date) : null,
// // // // //         interest_start_date: updateData.interest_start_date ? new Date(updateData.interest_start_date) : null,
// // // // //         grace_period_enabled: updateData.grace_period_enabled || false,
// // // // //         grace_period_days: updateData.grace_period_days || "0",
// // // // //         interest_notes: updateData.interest_notes || "",
// // // // //         sale: {
// // // // //           ...defaultProductState.sale,
// // // // //           gross_weight: updateData.sale?.gross_weight || 0,
// // // // //           less_weight: updateData.sale?.less_weight || 0,
// // // // //           net_weight: updateData.sale?.net_weight || 0,
// // // // //           wastage: updateData.sale?.wastage || 0,
// // // // //           tounch: updateData.sale?.tounch || 0,
// // // // //           fine_weight: updateData.sale?.fine_weight || 0,
// // // // //           rate: updateData.sale?.rate || 0,
// // // // //           making_type: updateData.sale?.making_type || "",
// // // // //           making_charge: updateData.sale?.making_charge || 0,
// // // // //           metal_value: updateData.sale?.metal_value || "0",
// // // // //           charges_json: updateData.sale?.charges_json || [{}],
// // // // //           tax_json: updateData.sale?.tax_json || [{}],
// // // // //           custom_fields: updateData.sale?.custom_fields || [],
// // // // //           ...updateData.sale?.bill_display_settings,
// // // // //         },
// // // // //         purchase: {
// // // // //           ...defaultProductState.purchase,
// // // // //           gross_weight: updateData.purchase?.gross_weight || 0,
// // // // //           less_weight: updateData.purchase?.less_weight || 0,
// // // // //           net_weight: updateData.purchase?.net_weight || 0,
// // // // //           wastage: updateData.purchase?.wastage || 0,
// // // // //           tounch: updateData.purchase?.tounch || 0,
// // // // //           fine_weight: updateData.purchase?.fine_weight || 0,
// // // // //           rate: updateData.purchase?.rate || 0,
// // // // //           making_type: updateData.purchase?.making_type || "",
// // // // //           making_charge: updateData.purchase?.making_charge || 0,
// // // // //           metal_value: updateData.purchase?.metal_value || "0",
// // // // //           charges_json: updateData.purchase?.charges_json || [{}],
// // // // //           tax_json: updateData.purchase?.tax_json || [{}],
// // // // //           custom_fields: updateData.purchase?.custom_fields || [],
// // // // //           ...updateData.purchase?.bill_display_settings,
// // // // //         },
// // // // //       };

// // // // //       console.log('Setting initial product state:', initialProductState);
// // // // //       setProduct(initialProductState);
// // // // //       setDataLoaded(true);
// // // // //     } else {
// // // // //       loadFormData();
// // // // //     }
// // // // //   }, [updateData, productGroups]);

// // // // //   const handleUpdate = async () => {
// // // // //     try {
// // // // //       if (!product.name) {
// // // // //         ShowToast("Product name is required");
// // // // //         return;
// // // // //       }

// // // // //       setLoading(true);

// // // // //       const productId = updateData?.id || route?.params?.id;
// // // // //       if (!productId) {
// // // // //         throw new Error("Product ID is required for update");
// // // // //       }

// // // // //       const formData = new FormData();

// // // // //       formData.append('id', String(productId));
// // // // //       formData.append('name', product.name || '');
// // // // //       formData.append('huid', product.huid || '');
// // // // //       formData.append('hsn_id', product.hsn_id?.value || '');
// // // // //       formData.append('comment', product.comment || '');

// // // // //       if (product.image && typeof product.image === 'object' && product.image.uri) {
// // // // //         formData.append('image', {
// // // // //           uri: Platform.OS === 'ios' ? product.image.uri.replace('file://', '') : product.image.uri,
// // // // //           type: 'image/jpeg',
// // // // //           name: `product_${productId}_${Date.now()}.jpg`,
// // // // //         });
// // // // //       }

// // // // //       if (product.sale) {
// // // // //         formData.append('sale_gross_weight', String(product.sale.gross_weight || '0'));
// // // // //         formData.append('sale_less_weight', String(product.sale.less_weight || '0'));
// // // // //         formData.append('sale_net_weight', String(product.sale.net_weight || '0'));
// // // // //         formData.append('sale_wastage', String(product.sale.wastage || '0'));
// // // // //         formData.append('sale_tounch', String(product.sale.tounch || '0'));
// // // // //         formData.append('sale_fine_weight', String(product.sale.fine_weight || '0'));
// // // // //         formData.append('sale_rate', String((typeof product.sale.rate === 'object' ? product.sale.rate?.price : product.sale.rate) || '0'));
// // // // //         formData.append('sale_making_type', product.sale.making_type?.value || 'PG');
// // // // //         formData.append('sale_making_charges', String(product.sale.making_charge || '0'));
// // // // //         formData.append('sale_net_price', String(product.sale.net_price || '0'));
// // // // //         formData.append('sale_charges_json', JSON.stringify(product.sale.charges_json || []));
// // // // //         formData.append('sale_tax_json', JSON.stringify(product.sale.tax_json || []));
// // // // //       }

// // // // //       if (product.purchase) {
// // // // //         formData.append('purchase_gross_weight', String(product.purchase.gross_weight || '0'));
// // // // //         formData.append('purchase_less_weight', String(product.purchase.less_weight || '0'));
// // // // //         formData.append('purchase_net_weight', String(product.purchase.net_weight || '0'));
// // // // //         formData.append('purchase_wastage', String(product.purchase.wastage || '0'));
// // // // //         formData.append('purchase_tounch', String(product.purchase.tounch || '0'));
// // // // //         formData.append('purchase_fine_weight', String(product.purchase.fine_weight || '0'));
// // // // //         formData.append('purchase_rate', String((typeof product.purchase.rate === 'object' ? product.purchase.rate?.price : product.purchase.rate) || '0'));
// // // // //         formData.append('purchase_making_type', product.purchase.making_type?.value || 'PG');
// // // // //         formData.append('purchase_making_charges', String(product.purchase.making_charge || '0'));
// // // // //         formData.append('purchase_net_price', String(product.purchase.net_price || '0'));
// // // // //         formData.append('purchase_charges_json', JSON.stringify(product.purchase.charges_json || []));
// // // // //         formData.append('purchase_tax_json', JSON.stringify(product.purchase.tax_json || []));
// // // // //       }

// // // // //       const response = await ApiRequest({
// // // // //         url: MANAGE_PRODUCT_API.update,
// // // // //         method: 'POST',
// // // // //         body: formData,
// // // // //         headers: {
// // // // //           'Content-Type': 'multipart/form-data',
// // // // //         },
// // // // //       });

// // // // //       if (!response?.success) {
// // // // //         console.log('Update API Error Response:', response);
// // // // //         throw new Error(response?.message || response?.error || "Failed to update product");
// // // // //       }

// // // // //       try {
// // // // //         await ApiRequest({
// // // // //           url: MANAGE_LOGS_API.create,
// // // // //           method: 'POST',
// // // // //           body: {
// // // // //             userName: profileData?.name || 'Unknown User',
// // // // //             productName: product.name,
// // // // //             id: productId,
// // // // //             type: 'product',
// // // // //             amount: parseFloat(product[product.type]?.net_price || 0).toFixed(2),
// // // // //             action: 'UPDATE',
// // // // //             entityType: 'PRODUCT',
// // // // //             timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
// // // // //             metadata: JSON.stringify({
// // // // //               action: 'Updated product',
// // // // //               productId: productId,
// // // // //               note: `Updated product: ${product.name}`,
// // // // //             }),
// // // // //           },
// // // // //         });
// // // // //       } catch (logError) {
// // // // //         console.error("Failed to create update log:", logError);
// // // // //       }

// // // // //       await AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY);
// // // // //       ShowToast(response.message || "Product updated successfully");
// // // // //       navigation.goBack();
// // // // //     } catch (error) {
// // // // //       console.error('Update error details:', error);
// // // // //       ShowToast(error.message || "Error updating product. Please try again.");
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     dispatch(fetchProductList());
// // // // //   }, []);

// // // // //   const handleProductSelect = (selectedProduct) => {
// // // // //     setProduct((prev) => ({
// // // // //       ...prev,
// // // // //       ...selectedProduct,
// // // // //       name: selectedProduct.name,
// // // // //       huid: selectedProduct.huid,
// // // // //       hsn_id: selectedProduct.hsn_id,
// // // // //       image: selectedProduct.image_url,
// // // // //       type: selectedProduct.type || prev.type,
// // // // //     }));
// // // // //     setShowSuggestions(false);
// // // // //   };

// // // // //   return (
// // // // //     <Fragment>
// // // // //       <KeyboardHanlder>
// // // // //         <View className="pt-4">
// // // // //           <View className="px-4">
// // // // //             {isFromInvoice ? (
// // // // //               <SearchProduct
// // // // //                 productValue={product}
// // // // //                 setProductValue={setProduct}
// // // // //                 handleProductDetail={handleProductDetail}
// // // // //               />
// // // // //             ) : (
// // // // //               <View className="flex mb-4 flex-row">
// // // // //                 <ImagePickerComponent
// // // // //                   onChange={({ value, name }) => handleInputChange(name, value)}
// // // // //                   value={product?.image}
// // // // //                   name="image"
// // // // //                 />
// // // // //                 <View className="w-5/6 pl-3">
// // // // //                   <View className="relative">
// // // // //                     <InputBox
// // // // //                       name="name"
// // // // //                       label="Name"
// // // // //                       value={product?.name}
// // // // //                       onChange={({ value, name }) => handleInputChange(name, value)}
// // // // //                       error={errors?.name}
// // // // //                     />
// // // // //                     {validator.message("name", product?.name, "required")}
// // // // //                     {showSuggestions && filteredProducts.length > 0 && (
// // // // //                       <View className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-40">
// // // // //                         <FlatList
// // // // //                           data={filteredProducts}
// // // // //                           keyExtractor={(item) => item.id}
// // // // //                           renderItem={({ item }) => (
// // // // //                             <TouchableOpacity
// // // // //                               className="p-3 border-b border-gray-100"
// // // // //                               onPress={() => handleProductSelect(item)}
// // // // //                             >
// // // // //                               <Text className="text-gray-800">{item.name}</Text>
// // // // //                               {item.huid && (
// // // // //                                 <Text className="text-xs text-gray-500">HUID: {item.huid}</Text>
// // // // //                               )}
// // // // //                             </TouchableOpacity>
// // // // //                           )}
// // // // //                         />
// // // // //                       </View>
// // // // //                     )}
// // // // //                   </View>
// // // // //                 </View>
// // // // //               </View>
// // // // //             )}

// // // // //             <View className="mb-4">
// // // // //               <InputBox
// // // // //                 name="remark"
// // // // //                 label="Remark"
// // // // //                 multiLine={true}
// // // // //                 value={product?.remark}
// // // // //                 onChange={({ value, name }) => handleInputChange(name, value)}
// // // // //                 placeholder="Add a remark about this item..."
// // // // //               />
// // // // //             </View>

// // // // //             <View className="mb-4">
// // // // //               <Text className="text-sm font-medium mb-1">Item Photo</Text>
// // // // //               <ImagePickerComponent
// // // // //                 name="image"
// // // // //                 value={product?.image || null}
// // // // //                 onChange={({ value, name }) => {
// // // // //                   const safeValue = value ? {
// // // // //                     uri: value.uri || null,
// // // // //                     fileName: value.fileName || null,
// // // // //                     mimeType: value.mimeType || 'image/jpeg',
// // // // //                   } : null;
// // // // //                   handleInputChange(name, safeValue);
// // // // //                 }}
// // // // //               />
// // // // //               <Text className="text-xs text-gray-500 mt-1">Upload a photo of the item</Text>
// // // // //             </View>

// // // // //             <View className="mb-4">
// // // // //               <InputBox
// // // // //                 name="size"
// // // // //                 label="Size"
// // // // //                 value={product?.size}
// // // // //                 placeholder="e.g., 7, 8.5, Medium, 16mm"
// // // // //                 onChange={({ value, name }) => handleInputChange(name, value)}
// // // // //               />
// // // // //               <View className="flex flex-row items-center justify-between mt-1">
// // // // //                 <Text className="text-xs text-gray-500">Enter ring size, bangle diameter, etc.</Text>
// // // // //                 <Switch
// // // // //                   value={product?.[product.type]?.showSizeInBill || false}
// // // // //                   onValueChange={(value) => handleInputChange("showSizeInBill", value, product.type)}
// // // // //                   trackColor={{ false: "red", true: "green" }}
// // // // //                   thumbColor={product?.[product.type]?.showSizeInBill ? "#ffffff" : "#f4f3f4"}
// // // // //                 />
// // // // //               </View>
// // // // //             </View>

// // // // //             <View className="mb-4">
// // // // //               <InputBox
// // // // //                 multiLine={true}
// // // // //                 name="comment"
// // // // //                 label="Comment"
// // // // //                 value={product?.comment}
// // // // //                 onChange={({ value, name }) => handleInputChange(name, value)}
// // // // //               />
// // // // //               <View className="flex flex-row items-center justify-between mt-1">
// // // // //                 <Text className="text-xs text-gray-500"></Text>
// // // // //                 <Switch
// // // // //                   value={product?.[product.type]?.showCommentInBill || false}
// // // // //                   onValueChange={(value) => handleInputChange("showCommentInBill", value, product.type)}
// // // // //                   trackColor={{ false: "red", true: "green" }}
// // // // //                   thumbColor={product?.[product.type]?.showCommentInBill ? "#ffffff" : "#f4f3f4"}
// // // // //                 />
// // // // //               </View>
// // // // //             </View>

// // // // //             <View className="flex mb-4 flex-row">
// // // // //               {productTypes.map((type) => (
// // // // //                 <View key={type} className={`w-1/2`}>
// // // // //                   <TouchableOpacity
// // // // //                     className={`
// // // // //                       py-2 
// // // // //                       ${type === "sale" ? "ml-1.5" : "mr-1.5"}
// // // // //                       border border-primary 
// // // // //                       rounded-md 
// // // // //                       flex flex-row 
// // // // //                       justify-center 
// // // // //                       items-center 
// // // // //                       shadow-xl
// // // // //                       ${product?.type === type ? "bg-primary" : "bg-white"}
// // // // //                       relative
// // // // //                       ${isFromInvoice ? "opacity-75" : ""}
// // // // //                     `}
// // // // //                     onPress={() => handleProductTypeChange(type)}
// // // // //                     disabled={isFromInvoice}
// // // // //                   >
// // // // //                     <Text
// // // // //                       className={`${
// // // // //                         product?.type === type ? "text-white" : "text-primary"
// // // // //                       } tracking-wider capitalize font-medium`}
// // // // //                     >
// // // // //                       {type.charAt(0).toUpperCase() + type.slice(1)}
// // // // //                     </Text>
// // // // //                     {product?.type === type && (
// // // // //                       <View className="absolute right-2">
// // // // //                         <AntDesign
// // // // //                           name="checkcircle"
// // // // //                           size={16}
// // // // //                           color="white"
// // // // //                         />
// // // // //                       </View>
// // // // //                     )}
// // // // //                   </TouchableOpacity>
// // // // //                 </View>
// // // // //               ))}
// // // // //             </View>

// // // // //             <View className="mb-4 flex flex-row">
// // // // //               <View className="w-2/5 pr-1.5">
// // // // //                 <InputBox
// // // // //                   name="huid"
// // // // //                   label="HUID"
// // // // //                   value={product?.huid}
// // // // //                   onChange={({ value, name }) => handleInputChange(name, value)}
// // // // //                   keyboardType="default"
// // // // //                 />
// // // // //                 <View className="flex flex-row items-center justify-between mt-1">
// // // // //                   <Text className="text-xs text-gray-500"></Text>
// // // // //                   <Switch
// // // // //                     value={product?.[product.type]?.showHuidInBill || false}
// // // // //                     onValueChange={(value) => handleInputChange("showHuidInBill", value, product.type)}
// // // // //                     trackColor={{ false: "red", true: "green" }}
// // // // //                     thumbColor={product?.[product.type]?.showHuidInBill ? "#ffffff" : "#f4f3f4"}
// // // // //                   />
// // // // //                 </View>
// // // // //               </View>
// // // // //               <View className="w-3/5 flex items-start flex-row pl-1.5">
// // // // //                 <View className="w-full pr-2">
// // // // //                   <SelectInput
// // // // //                     label="HSN Name"
// // // // //                     name="hsn_id"
// // // // //                     value={product?.hsn_id}
// // // // //                     placeholder="Select"
// // // // //                     error={errors?.hsn_id}
// // // // //                     data={productGroups.map((item) => ({
// // // // //                       label: item.name,
// // // // //                       value: item.id,
// // // // //                       variation: item.variation_data,
// // // // //                     }))}
// // // // //                     onSelect={(value) => handleInputChange("hsn_id", value)}
// // // // //                   />
// // // // //                   {validator.message("hsn_id", product?.hsn_id, "required")}
// // // // //                   <View className="flex flex-row items-center justify-between mt-1">
// // // // //                     <Text className="text-xs text-gray-500"></Text>
// // // // //                     <Switch
// // // // //                       value={product?.[product.type]?.showHsnInBill || false}
// // // // //                       onValueChange={(value) => handleInputChange("showHsnInBill", value, product.type)}
// // // // //                       trackColor={{ false: "red", true: "green" }}
// // // // //                       thumbColor={product?.[product.type]?.showHsnInBill ? "#ffffff" : "#f4f3f4"}
// // // // //                     />
// // // // //                   </View>
// // // // //                 </View>
// // // // //                 {!isFromInvoice && (
// // // // //                   <TouchableOpacity
// // // // //                     onPress={() => handleInitialState("metalModal", true)}
// // // // //                     activeOpacity={0.7}
// // // // //                     className="bg-primary w-8 h-8 mt-6 flex justify-center items-center rounded-full shadow-xl"
// // // // //                   >
// // // // //                     <FontAwesome6 name="plus" size={17} color="white" />
// // // // //                   </TouchableOpacity>
// // // // //                 )}
// // // // //               </View>
// // // // //             </View>
// // // // //           </View>

// // // // //           <View className="px-4 mb-4">
// // // // //             <View className="bg-gray-50 rounded-lg p-4">
// // // // //               <View className="flex-row items-center justify-between mb-4">
// // // // //                 <Text className="text-lg font-semibold">Interest Configuration</Text>
// // // // //                 <Switch
// // // // //                   value={product?.interest_enabled}
// // // // //                   onValueChange={(value) => handleInputChange("interest_enabled", value)}
// // // // //                   trackColor={{ false: "#767577", true: "#22c55e" }}
// // // // //                   thumbColor={product?.interest_enabled ? "#ffffff" : "#f4f3f4"}
// // // // //                 />
// // // // //               </View>

// // // // //               {product?.interest_enabled && (
// // // // //                 <>
// // // // //                   <View className="mb-4">
// // // // //                     <Text className="text-base font-medium mb-2">Important Dates</Text>
// // // // //                     <View className="space-y-3">
// // // // //                       <TouchableOpacity
// // // // //                         onPress={() => handleInitialState("billDatePicker", true)}
// // // // //                         className="border border-gray-300 rounded-md p-3"
// // // // //                       >
// // // // //                         <Text className="text-sm text-gray-500">Bill Date</Text>
// // // // //                         <Text className="text-base">
// // // // //                           {product?.bill_date ? moment(product.bill_date).format("DD MMM YYYY") : "Select Date"}
// // // // //                         </Text>
// // // // //                       </TouchableOpacity>
// // // // //                       <TouchableOpacity
// // // // //                         onPress={() => handleInitialState("paymentDatePicker", true)}
// // // // //                         className="border border-gray-300 rounded-md p-3"
// // // // //                       >
// // // // //                         <Text className="text-sm text-gray-500">Expected Payment Date</Text>
// // // // //                         <Text className="text-base">
// // // // //                           {product?.payment_date ? moment(product.payment_date).format("DD MMM YYYY") : "Select Date"}
// // // // //                         </Text>
// // // // //                       </TouchableOpacity>
// // // // //                       <TouchableOpacity
// // // // //                         onPress={() => handleInitialState("interestStartDatePicker", true)}
// // // // //                         className="border border-gray-300 rounded-md p-3"
// // // // //                       >
// // // // //                         <Text className="text-sm text-gray-500">Interest Start Date</Text>
// // // // //                         <Text className="text-base">
// // // // //                           {product?.interest_start_date ? moment(product.interest_start_date).format("DD MMM YYYY") : "Select Date"}
// // // // //                         </Text>
// // // // //                       </TouchableOpacity>
// // // // //                     </View>
// // // // //                   </View>
// // // // //                   <View className="mb-4">
// // // // //                     <Text className="text-base font-medium mb-2">Interest Details</Text>
// // // // //                     <View className="space-y-3">
// // // // //                       <SelectInput
// // // // //                         label="Interest Type"
// // // // //                         name="interest_type"
// // // // //                         value={product?.interest_type}
// // // // //                         placeholder="Select Type"
// // // // //                         data={[
// // // // //                           { label: "Flat", value: "2" },
// // // // //                           { label: "Compound", value: "1" },
// // // // //                         ]}
// // // // //                         onSelect={(value) => handleInputChange("interest_type", value)}
// // // // //                       />
// // // // //                       <InputBox
// // // // //                         name="interest_rate"
// // // // //                         label="Interest Rate (%)"
// // // // //                         value={product?.interest_rate}
// // // // //                         keyboardType="numeric"
// // // // //                         onChange={({ value }) => handleInputChange("interest_rate", value)}
// // // // //                       />
// // // // //                     </View>
// // // // //                   </View>
// // // // //                   <View className="mb-4">
// // // // //                     <View className="flex-row items-center justify-between mb-2">
// // // // //                       <Text className="text-base font-medium">Grace Period</Text>
// // // // //                       <Switch
// // // // //                         value={product?.grace_period_enabled}
// // // // //                         onValueChange={(value) => handleInputChange("grace_period_enabled", value)}
// // // // //                         trackColor={{ false: "#767577", true: "#22c55e" }}
// // // // //                         thumbColor={product?.grace_period_enabled ? "#ffffff" : "#f4f3f4"}
// // // // //                       />
// // // // //                     </View>
// // // // //                     {product?.grace_period_enabled && (
// // // // //                       <InputBox
// // // // //                         name="grace_period_days"
// // // // //                         label="Grace Period (Days)"
// // // // //                         value={product?.grace_period_days}
// // // // //                         keyboardType="numeric"
// // // // //                         onChange={({ value }) => handleInputChange("grace_period_days", value)}
// // // // //                       />
// // // // //                     )}
// // // // //                   </View>
// // // // //                   <View className="mb-4">
// // // // //                     <InputBox
// // // // //                       name="interest_notes"
// // // // //                       label="Interest Notes"
// // // // //                       value={product?.interest_notes}
// // // // //                       multiLine={true}
// // // // //                       numberOfLines={3}
// // // // //                       onChange={({ value }) => handleInputChange("interest_notes", value)}
// // // // //                       placeholder="Add any special notes about interest terms..."
// // // // //                     />
// // // // //                   </View>
// // // // //                   <View className="bg-white rounded-lg p-3 mb-4">
// // // // //                     <Text className="text-base font-medium mb-2">Interest Summary</Text>
// // // // //                     <View className="space-y-2">
// // // // //                       <View className="flex-row justify-between">
// // // // //                         <Text className="text-gray-600">Original Amount:</Text>
// // // // //                         <Text>₹{handleDigitsFix(product?.[product.type]?.net_price || 0)}</Text>
// // // // //                       </View>
// // // // //                       <View className="flex-row justify-between">
// // // // //                         <Text className="text-gray-600">Interest Period:</Text>
// // // // //                         <Text>{calculateInterestPeriod(product)} days</Text>
// // // // //                       </View>
// // // // //                       <View className="flex-row justify-between">
// // // // //                         <Text className="text-gray-600">Interest Amount:</Text>
// // // // //                         <Text>₹{handleDigitsFix(Number(product?.interest_amount || 0))}</Text>
// // // // //                       </View>
// // // // //                       <View className="flex-row justify-between pt-2 border-t border-gray-200">
// // // // //                         <Text className="font-medium">Total Amount:</Text>
// // // // //                         <Text className="font-medium">₹{handleDigitsFix(
// // // // //                           Number(product?.[product.type]?.net_price || 0) +
// // // // //                           Number(product?.interest_amount || 0)
// // // // //                         )}</Text>
// // // // //                       </View>
// // // // //                     </View>
// // // // //                   </View>
// // // // //                 </>
// // // // //               )}
// // // // //             </View>
// // // // //           </View>

// // // // //           {productTypes.map((category) => {
// // // // //             const isPurchase = category === "purchase";
// // // // //             return (
// // // // //               product?.type === category && (
// // // // //                 <View
// // // // //                   className="bg-slate-50 shadow-lg px-4 pt-4"
// // // // //                   key={category}
// // // // //                 >
// // // // //                   <View className="mb-4 flex flex-row">
// // // // //                     <View className="w-1/5 pr-1">
// // // // //                       <InputBox
// // // // //                         name="gross_weight"
// // // // //                         placeholder="0"
// // // // //                         label="Gross Wt"
// // // // //                         value={String(product?.[category]?.gross_weight || '')}
// // // // //                         onChange={({ value, name }) =>
// // // // //                           handleInputChange(name, value, category)
// // // // //                         }
// // // // //                         keyboardType="numeric"
// // // // //                       />
// // // // //                       <View className="flex flex-row items-center justify-between mt-1">
// // // // //                         <Text className="text-xs text-gray-500"></Text>
// // // // //                         <Switch
// // // // //                           value={product?.[category]?.showGrossWeightInBill || false}
// // // // //                           onValueChange={(value) => handleInputChange("showGrossWeightInBill", value, category)}
// // // // //                           trackColor={{ false: "red", true: "green" }}
// // // // //                           thumbColor={product?.[category]?.showGrossWeightInBill ? "#ffffff" : "#f4f3f4"}
// // // // //                         />
// // // // //                       </View>
// // // // //                     </View>
// // // // //                     <View className="w-1/5 px-1">
// // // // //                       <InputBox
// // // // //                         name="less_weight"
// // // // //                         placeholder="0"
// // // // //                         label="Less Wt"
// // // // //                         value={String(product?.[category]?.less_weight || '')}
// // // // //                         onChange={({ value, name }) =>
// // // // //                           handleInputChange(name, value, category)
// // // // //                         }
// // // // //                         keyboardType="numeric"
// // // // //                       />
// // // // //                       <View className="flex flex-row items-center justify-between mt-1">
// // // // //                         <Text className="text-xs text-gray-500"></Text>
// // // // //                         <Switch
// // // // //                           value={product?.[category]?.showLessWeightInBill || false}
// // // // //                           onValueChange={(value) => handleInputChange("showLessWeightInBill", value, category)}
// // // // //                           trackColor={{ false: "red", true: "green" }}
// // // // //                           thumbColor={product?.[category]?.showLessWeightInBill ? "#ffffff" : "#f4f3f4"}
// // // // //                         />
// // // // //                       </View>
// // // // //                     </View>
// // // // //                     <View className="w-1/5 px-1">
// // // // //                       <InputBox
// // // // //                         name="net_weight"
// // // // //                         placeholder="0"
// // // // //                         label="Net Wt"
// // // // //                         readOnly={true}
// // // // //                         value={String(product?.[category]?.net_weight || '')}
// // // // //                         onChange={({ value, name }) =>
// // // // //                           handleInputChange(name, value, category)
// // // // //                         }
// // // // //                         keyboardType="numeric"
// // // // //                       />
// // // // //                       <View className="flex flex-row items-center justify-between mt-1">
// // // // //                         <Text className="text-xs text-gray-500"></Text>
// // // // //                         <Switch
// // // // //                           value={product?.[category]?.showNetWeightInBill || false}
// // // // //                           onValueChange={(value) => handleInputChange("showNetWeightInBill", value, category)}
// // // // //                           trackColor={{ false: "red", true: "green" }}
// // // // //                           thumbColor={product?.[category]?.showNetWeightInBill ? "#ffffff" : "#f4f3f4"}
// // // // //                         />
// // // // //                       </View>
// // // // //                     </View>
// // // // //                     <View
// // // // //                       className={`w-2/5 ${isPurchase ? "flex-row-reverse" : "flex-row"} flex`}
// // // // //                     >
// // // // //                       <View
// // // // //                         className={`w-1/2 ${isPurchase ? "pl-0.5" : "pr-1 pl-0.5"}`}
// // // // //                       >
// // // // //                         <InputBox
// // // // //                           name="tounch"
// // // // //                           placeholder="0 %"
// // // // //                           label="Tounch"
// // // // //                           value={String(product?.[category]?.tounch || '')}
// // // // //                           onChange={({ value, name }) =>
// // // // //                             handleInputChange(name, value, category)
// // // // //                           }
// // // // //                           keyboardType="numeric"
// // // // //                         />
// // // // //                         <View className="flex flex-row items-center justify-between mt-1">
// // // // //                           <Text className="text-xs text-gray-500"></Text>
// // // // //                           <Switch
// // // // //                             value={product?.[category]?.showTounchInBill || false}
// // // // //                             onValueChange={(value) => handleInputChange("showTounchInBill", value, category)}
// // // // //                             trackColor={{ false: "red", true: "green" }}
// // // // //                             thumbColor={product?.[category]?.showTounchInBill ? "#ffffff" : "#f4f3f4"}
// // // // //                           />
// // // // //                         </View>
// // // // //                       </View>
// // // // //                       <View
// // // // //                         className={`w-1/2 ${isPurchase ? "pr-1 pl-0.5" : "pl-0.5"}`}
// // // // //                       >
// // // // //                         <InputBox
// // // // //                           name="wastage"
// // // // //                           placeholder="0 %"
// // // // //                           label="Wastage"
// // // // //                           value={String(product?.[category]?.wastage || '')}
// // // // //                           onChange={({ value, name }) =>
// // // // //                             handleInputChange(name, value, category)
// // // // //                           }
// // // // //                           keyboardType="numeric"
// // // // //                         />
// // // // //                         <View className="flex flex-row items-center justify-between mt-1">
// // // // //                           <Text className="text-xs text-gray-500"></Text>
// // // // //                           <Switch
// // // // //                             value={product?.[category]?.showWastageInBill || false}
// // // // //                             onValueChange={(value) => handleInputChange("showWastageInBill", value, category)}
// // // // //                             trackColor={{ false: "red", true: "green" }}
// // // // //                             thumbColor={product?.[category]?.showWastageInBill ? "#ffffff" : "#f4f3f4"}
// // // // //                           />
// // // // //                         </View>
// // // // //                       </View>
// // // // //                     </View>
// // // // //                   </View>

// // // // //                   <View className="mb-4 flex flex-row">
// // // // //                     <View className="w-1/3 pr-1">
// // // // //                       <InputBox
// // // // //                         name="fine_weight"
// // // // //                         label="Fine Weight"
// // // // //                         placeholder="0"
// // // // //                         readOnly={true}
// // // // //                         value={String(product?.[category]?.fine_weight || '')}
// // // // //                         onChange={({ value }) => handleInputChange("fine_weight", value, category)}
// // // // //                         keyboardType="numeric"
// // // // //                       />
// // // // //                       <View className="flex flex-row items-center justify-between mt-1">
// // // // //                         <Text className="text-xs text-gray-500"></Text>
// // // // //                         <Switch
// // // // //                           value={product?.[category]?.showFineWeightInBill || false}
// // // // //                           onValueChange={(value) => handleInputChange("showFineWeightInBill", value, category)}
// // // // //                           trackColor={{ false: "red", true: "green" }}
// // // // //                           thumbColor={product?.[category]?.showFineWeightInBill ? "#ffffff" : "#f4f3f4"}
// // // // //                         />
// // // // //                       </View>
// // // // //                     </View>
// // // // //                     <View className="w-1/3 px-1">
// // // // //                       <Text className="text-slate-500 text-[13px] mb-1">Cutting</Text>
// // // // //                       <View className="bg-gray-100 rounded-lg">
// // // // //                         <CommonButton
// // // // //                           title={product.cutting_enabled ? "ON" : "OFF"}
// // // // //                           onPress={() => {
// // // // //                             const currentType = product.type;
// // // // //                             const buttonRate = isSelectRate
// // // // //                               ? parseFloat(product[currentType]?.rate?.price) || 0
// // // // //                               : parseFloat(product[currentType]?.rate) || 0;
// // // // //                             const buttonFineWeight = parseFloat(product[currentType]?.fine_weight) || 0;
// // // // //                             const buttonMetalValue = !product.cutting_enabled ? (buttonFineWeight * buttonRate).toFixed(2) : "0";

// // // // //                             setProduct((prev) => ({
// // // // //                               ...prev,
// // // // //                               cutting_enabled: !prev.cutting_enabled,
// // // // //                               [currentType]: {
// // // // //                                 ...prev[currentType],
// // // // //                                 metal_value: buttonMetalValue,
// // // // //                               },
// // // // //                             }));
// // // // //                           }}
// // // // //                           isFilled={product.cutting_enabled}
// // // // //                           small
// // // // //                         />
// // // // //                       </View>
// // // // //                     </View>
// // // // //                     <View className="w-1/3 pl-1">
// // // // //                       <InputBox
// // // // //                         name="rate"
// // // // //                         readOnly={true}
// // // // //                         label="Rate"
// // // // //                         placeholder="0"
// // // // //                         value={String(isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate || '')}
// // // // //                         onChange={({ value }) => handleInputChange("rate", value, category)}
// // // // //                         keyboardType="numeric"
// // // // //                       />
// // // // //                       <View className="flex flex-row items-center justify-between mt-1">
// // // // //                         <Text className="text-xs text-gray-500"></Text>
// // // // //                         <Switch
// // // // //                           value={product?.[category]?.showRateInBill || false}
// // // // //                           onValueChange={(value) => handleInputChange("showRateInBill", value, category)}
// // // // //                           trackColor={{ false: "red", true: "green" }}
// // // // //                           thumbColor={product?.[category]?.showRateInBill ? "#ffffff" : "#f4f3f4"}
// // // // //                         />
// // // // //                       </View>
// // // // //                     </View>
// // // // //                   </View>

// // // // //                   <View className="mb-4 flex flex-row">
// // // // //                     <View className="w-1/2 pr-1">
// // // // //                       <SelectInput
// // // // //                         label="Making Type"
// // // // //                         name="making_type"
// // // // //                         value={product?.[category]?.making_type}
// // // // //                         placeholder="Select"
// // // // //                         data={[
// // // // //                           { label: "Per Gram (PG)", value: "PG" },
// // // // //                           { label: "Per Piece (PP)", value: "PP" },
// // // // //                         ]}
// // // // //                         onSelect={(value) => handleInputChange("making_type", value, category)}
// // // // //                       />
// // // // //                     </View>
// // // // //                     <View className="w-1/2 pl-1">
// // // // //                       <InputBox
// // // // //                         name="making_charge"
// // // // //                         label="Making Charge"
// // // // //                         placeholder="0"
// // // // //                         value={String(product?.[category]?.making_charge || '')}
// // // // //                         onChange={({ value }) => handleInputChange("making_charge", value, category)}
// // // // //                         keyboardType="numeric"
// // // // //                       />
// // // // //                     </View>
// // // // //                   </View>

// // // // //                   <View className="mb-4 flex flex-row">
// // // // //                     <View className="w-full">
// // // // //                       <InputBox
// // // // //                         name="net_price"
// // // // //                         label="Net Price"
// // // // //                         placeholder="0.00"
// // // // //                         value={handleDigitsFix(
// // // // //                           (
// // // // //                             (product.cutting_enabled
// // // // //                               ? (Number(product?.[category]?.fine_weight || 0) *
// // // // //                                 Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // // // //                               : 0) +
// // // // //                             (product?.[category]?.making_type?.value === "PG"
// // // // //                               ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // // //                               : Number(product?.[category]?.making_charge || 0)) +
// // // // //                             ((product[category]?.charges_json || []).reduce((sum, charge) =>
// // // // //                               sum + Number(charge.amount || 0), 0))
// // // // //                           ) +
// // // // //                           (
// // // // //                             (
// // // // //                               (product.cutting_enabled
// // // // //                                 ? (Number(product?.[category]?.fine_weight || 0) *
// // // // //                                   Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // // // //                                 : 0) +
// // // // //                               (product?.[category]?.making_type?.value === "PG"
// // // // //                                 ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // // //                                 : Number(product?.[category]?.making_charge || 0)) +
// // // // //                               ((product[category]?.charges_json || []).reduce((sum, charge) =>
// // // // //                                 sum + Number(charge.amount || 0), 0))
// // // // //                             ) * (Number(product?.[category]?.tax || 0) / 100)
// // // // //                           )
// // // // //                         )}
// // // // //                         readOnly={true}
// // // // //                         keyboardType="numeric"
// // // // //                       />
// // // // //                       <View className="flex flex-row items-center justify-between mt-1">
// // // // //                         <Text className="text-xs text-gray-500"></Text>
// // // // //                         <Switch
// // // // //                           value={product?.[category]?.showNetPriceInBill || false}
// // // // //                           onValueChange={(value) => handleInputChange("showNetPriceInBill", value, category)}
// // // // //                           trackColor={{ false: "red", true: "green" }}
// // // // //                           thumbColor={product?.[category]?.showNetPriceInBill ? "#ffffff" : "#f4f3f4"}
// // // // //                         />
// // // // //                       </View>
// // // // //                     </View>
// // // // //                   </View>

// // // // //                   <View className="mb-4 flex flex-row items-center bg-gray-50 px-3 py-2 rounded-lg">
// // // // //                     <Text className="text-gray-600">Show Price in Bill</Text>
// // // // //                     <Switch
// // // // //                       value={product?.[category]?.showPriceInBill ?? false}
// // // // //                       onValueChange={(value) => handleInputChange("showPriceInBill", value, category)}
// // // // //                       trackColor={{ false: "#767577", true: "green" }}
// // // // //                       thumbColor={product?.[category]?.showPriceInBill ? "#ffffff" : "#f4f3f4"}
// // // // //                     />
// // // // //                   </View>

// // // // //             {product?.[category]?.showPriceInBill ? (
// // // // //   <View className="mb-4 bg-gray-50 p-4 rounded-lg">
// // // // //     <Text className="text-base font-semibold mb-3">Calculation Summary</Text>
// // // // //     <View className="space-y-2">
// // // // //       <View className="flex flex-row justify-between">
// // // // //         <Text className="text-gray-600">Net Weight:</Text>
// // // // //         <Text>{product?.[category]?.net_weight || 0} g</Text>
// // // // //       </View>
// // // // //       <View className="flex flex-row justify-between items-center">
// // // // //         <Text className="text-gray-600">Fine Weight:</Text>
// // // // //         <View className="flex flex-row items-center">
// // // // //           <Text className="text-gray-500 text-sm mr-2">
// // // // //             ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × ({Number(product?.[category]?.tounch || 0)}% + {Number(product?.[category]?.wastage || 0)}%))
// // // // //           </Text>
// // // // //           <Text className="font-medium">{handleDigitsFix(product?.[category]?.fine_weight || 0)} g</Text>
// // // // //         </View>
// // // // //       </View>
// // // // //       <View className="flex flex-row justify-between items-center">
// // // // //         <Text className="text-gray-600">Wastage Weight:</Text>
// // // // //         <View className="flex flex-row items-center">
// // // // //           <Text className="text-gray-500 text-sm mr-2">
// // // // //             ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × {Number(product?.[category]?.wastage || 0)}%)
// // // // //           </Text>
// // // // //           <Text className="font-medium">{handleDigitsFix(
// // // // //             Number(product?.[category]?.gross_weight || 0) *
// // // // //             (Number(product?.[category]?.wastage || 0) / 100)
// // // // //           )} g</Text>
// // // // //         </View>
// // // // //       </View>
// // // // //       <View className="flex flex-row justify-between items-center">
// // // // //         <Text className="text-gray-600">Total Weight with Wastage:</Text>
// // // // //         <View className="flex flex-row items-center">
// // // // //           <Text className="text-gray-500 text-sm mr-2">
// // // // //             ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × (100% + {Number(product?.[category]?.wastage || 0)}%))
// // // // //           </Text>
// // // // //           <Text className="font-medium">{handleDigitsFix(
// // // // //             Number(product?.[category]?.gross_weight || 0) *
// // // // //             (1 + (Number(product?.[category]?.wastage || 0) / 100))
// // // // //           )} g</Text>
// // // // //         </View>
// // // // //       </View>
// // // // //       <View className="flex flex-row justify-between items-center">
// // // // //         <Text className="text-gray-600">Wastage Value:</Text>
// // // // //         <View className="flex flex-row items-center">
// // // // //           <Text className="text-gray-500 text-sm mr-2">
// // // // //             ({handleDigitsFix(
// // // // //               Number(product?.[category]?.gross_weight || 0) *
// // // // //               (Number(product?.[category]?.wastage || 0) / 100)
// // // // //             )} × ({Number(product?.[category]?.tounch || 0)}% × ₹{handleDigitsFix(isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0}))
// // // // //           </Text>
// // // // //           <Text className="font-medium">₹{handleDigitsFix(
// // // // //             (Number(product?.[category]?.gross_weight || 0) *
// // // // //             (Number(product?.[category]?.wastage || 0) / 100)) *
// // // // //             ((Number(product?.[category]?.tounch || 0) / 100) *
// // // // //             Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // // // //           )}</Text>
// // // // //         </View>
// // // // //       </View>
// // // // //       <View className="flex flex-row justify-between items-center">
// // // // //         <Text className="text-gray-600">Metal Value:</Text>
// // // // //         <View className="flex flex-row items-center">
// // // // //           {product.cutting_enabled ? (
// // // // //             <>
// // // // //               <Text className="text-gray-500 text-sm mr-2">
// // // // //                 ({handleDigitsFix(product?.[category]?.fine_weight || 0)} × ₹{handleDigitsFix(isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0})
// // // // //               </Text>
// // // // //               <Text className="font-medium">₹{handleDigitsFix(
// // // // //                 Number(product?.[category]?.fine_weight || 0) *
// // // // //                 Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0)
// // // // //               )}</Text>
// // // // //             </>
// // // // //           ) : (
// // // // //             <Text className="font-medium">₹0.00 (Cutting OFF)</Text>
// // // // //           )}
// // // // //         </View>
// // // // //       </View>
// // // // //       <View className="flex flex-row justify-between items-center">
// // // // //         <Text className="text-gray-600">Making Charges:</Text>
// // // // //         <View className="flex flex-row items-center">
// // // // //           {product?.[category]?.making_type?.value === "PG" ? (
// // // // //             <Text className="text-gray-500 text-sm mr-2">
// // // // //               ({handleDigitsFix(product?.[category]?.net_weight || 0)} × ₹{handleDigitsFix(product?.[category]?.making_charge || 0)})
// // // // //             </Text>
// // // // //           ) : null}
// // // // //           <Text className="font-medium">₹{handleDigitsFix(
// // // // //             product?.[category]?.making_type?.value === "PG"
// // // // //               ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // // //               : Number(product?.[category]?.making_charge || 0)
// // // // //           )}</Text>
// // // // //         </View>
// // // // //       </View>
// // // // //       <View className="mb-4">
// // // // //         <View className="flex-row justify-between items-center mb-2">
// // // // //           <Text className="text-gray-600 font-medium">Additional Charges</Text>
// // // // //           <TouchableOpacity
// // // // //             onPress={() => {
// // // // //               const updatedCharges = [...(product[category].charges_json || []), { name: '', amount: '0' }];
// // // // //               handleInputChange('charges_json', updatedCharges, category);
// // // // //             }}
// // // // //             className="bg-primary px-2 py-1 rounded-md"
// // // // //           >
// // // // //             <Text className="text-white">+ Add</Text>
// // // // //           </TouchableOpacity>
// // // // //         </View>
// // // // //         {(product[category]?.charges_json || []).map((charge, index) => (
// // // // //           <View key={index} className="flex-row items-center mb-2">
// // // // //             <View className="flex-1 mr-2">
// // // // //               <OutlineInput
// // // // //                 placeholder="Charge name"
// // // // //                 value={charge.name}
// // // // //                 maxLength={50}
// // // // //                 onChangeText={(value) => {
// // // // //                   const updatedCharges = [...(product[category].charges_json || [])];
// // // // //                   updatedCharges[index] = { ...charge, name: value };
// // // // //                   handleInputChange('charges_json', updatedCharges, category);
// // // // //                 }}
// // // // //               />
// // // // //             </View>
// // // // //             <View className="w-24 mr-2">
// // // // //               <OutlineInput
// // // // //                 placeholder="Amount"
// // // // //                 value={String(charge.amount)}
// // // // //                 keyboardType="numeric"
// // // // //                 onChangeText={(value) => {
// // // // //                   const updatedCharges = [...(product[category].charges_json || [])];
// // // // //                   updatedCharges[index] = { ...charge, amount: value || '0' };
// // // // //                   handleInputChange('charges_json', updatedCharges, category);
// // // // //                 }}
// // // // //               />
// // // // //             </View>
// // // // //             <TouchableOpacity
// // // // //               onPress={() => {
// // // // //                 const updatedCharges = (product[category].charges_json || []).filter((_, i) => i !== index);
// // // // //                 handleInputChange('charges_json', updatedCharges, category);
// // // // //               }}
// // // // //             >
// // // // //               <FontAwesome6 name="trash" size={16} color="red" />
// // // // //             </TouchableOpacity>
// // // // //           </View>
// // // // //         ))}
// // // // //         {(product[category]?.charges_json || []).length > 0 && (
// // // // //           <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-200">
// // // // //             <Text className="text-gray-600">Total:</Text>
// // // // //             <Text className="font-medium">₹{handleDigitsFix(
// // // // //               (product[category]?.charges_json || []).reduce((sum, charge) =>
// // // // //                 sum + Number(charge.amount || 0), 0)
// // // // //             )}</Text>
// // // // //           </View>
// // // // //         )}
// // // // //       </View>
// // // // //       <View className="flex flex-row justify-between items-center border-t border-gray-200 mt-2 pt-2">
// // // // //         <Text className="text-gray-600 font-semibold">Subtotal:</Text>
// // // // //         <Text className="font-semibold">₹{handleDigitsFix(
// // // // //           (product.cutting_enabled
// // // // //             ? (Number(product?.[category]?.fine_weight || 0) *
// // // // //                Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // // // //             : 0) +
// // // // //           (product?.[category]?.making_type?.value === "PG"
// // // // //             ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // // //             : Number(product?.[category]?.making_charge || 0)) +
// // // // //           (product[category]?.charges_json || []).reduce((sum, charge) => 
// // // // //             sum + Number(charge.amount || 0), 0)
// // // // //         )}</Text>
// // // // //       </View>
// // // // //       <View className="flex flex-row justify-between items-center">
// // // // //         <Text className="text-gray-600">Tax Amount ({Number(product?.[category]?.tax || 0)}%):</Text>
// // // // //         <Text className="font-medium">₹{handleDigitsFix(
// // // // //           (
// // // // //             (product.cutting_enabled ? 
// // // // //               (Number(product?.[category]?.fine_weight || 0) * 
// // // // //                Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // // // //              : 0) +
// // // // //             (product?.[category]?.making_type?.value === "PG" 
// // // // //               ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // // //              : Number(product?.[category]?.making_charge || 0)) +
// // // // //             ((product[category]?.charges_json || []).reduce((sum, charge) => 
// // // // //               sum + Number(charge.amount || 0), 0))
// // // // //           ) * (Number(product?.[category]?.tax || 0) / 100)
// // // // //         )}</Text>
// // // // //       </View>
// // // // //       <View className="flex flex-row justify-between border-t border-gray-200 pt-2">
// // // // //         <Text className="text-gray-600 font-semibold">Final Price:</Text>
// // // // //         <Text className="font-semibold">₹{handleDigitsFix(
// // // // //           // Subtotal
// // // // //           (
// // // // //             (product.cutting_enabled ? 
// // // // //               (Number(product?.[category]?.fine_weight || 0) * 
// // // // //                Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // // // //              : 0) +
// // // // //             (product?.[category]?.making_type?.value === "PG"
// // // // //               ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // // //              : Number(product?.[category]?.making_charge || 0)) +
// // // // //             ((product[category]?.charges_json || []).reduce((sum, charge) => 
// // // // //               sum + Number(charge.amount || 0), 0))
// // // // //           ) +
// // // // //           // Tax Amount
// // // // //           (
// // // // //             (product.cutting_enabled ? 
// // // // //               (Number(product?.[category]?.fine_weight || 0) * 
// // // // //                Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // // // //              : 0) +
// // // // //             (product?.[category]?.making_type?.value === "PG"
// // // // //               ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // // //              : Number(product?.[category]?.making_charge || 0)) +
// // // // //             ((product[category]?.charges_json || []).reduce((sum, charge) => 
// // // // //               sum + Number(charge.amount || 0), 0))
// // // // //           ) * (Number(product?.[category]?.tax || 0) / 100)
// // // // //         )}</Text>
// // // // //       </View>
// // // // //     </View>
// // // // //   </View>
// // // // // ) : (
// // // // //   <View className="mb-4 bg-gray-50 p-4 rounded-lg">
// // // // //     <Text className="text-base font-semibold mb-3">Basic Weight Details</Text>
// // // // //     <View className="space-y-2">
// // // // //       <View className="flex flex-row justify-between">
// // // // //         <Text className="text-gray-600">Net Weight:</Text>
// // // // //         <Text>{product?.[category]?.net_weight || 0} g</Text>
// // // // //       </View>
// // // // //       <View className="flex flex-row justify-between items-center">
// // // // //         <Text className="text-gray-600">Fine Weight:</Text>
// // // // //         <View className="flex flex-row items-center">
// // // // //           <Text className="text-gray-500 text-sm mr-2">
// // // // //             ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × ({Number(product?.[category]?.tounch || 0)}% + {Number(product?.[category]?.wastage || 0)}%))
// // // // //           </Text>
// // // // //           <Text className="font-medium">{handleDigitsFix(product?.[category]?.fine_weight || 0)} g</Text>
// // // // //         </View>
// // // // //       </View>
// // // // //     </View>
// // // // //   </View>
// // // // // )}
// // // // //                   {/* charges and taxes */}
// // // // //                   <View className="mb-4">
// // // // //                     {/* Charges */}
// // // // //                     <View className="mb-5">
// // // // //                       <View className="flex flex-row items-center justify-between">
// // // // //                         <Text className="tracking-wider text-base">
// // // // //                           Charges
// // // // //                         </Text>
// // // // //                         <View className="flex flex-row items-center">
// // // // //                           <Switch
// // // // //                             value={product?.[category]?.showChargesInBill || false}
// // // // //                             onValueChange={(value) => handleInputChange("showChargesInBill", value, category)}
// // // // //                             trackColor={{ false: "red", true: "green" }}
// // // // //                             thumbColor={product?.[category]?.showChargesInBill ? "#ffffff" : "#f4f3f4"}
// // // // //                           />
// // // // //                         <TouchableOpacity
// // // // //                           onPress={() => addItem(category, "charges_json")}
// // // // //                           activeOpacity={0.7}
// // // // //                             className="bg-primary ml-2 w-6 h-6 flex justify-center items-center rounded-full shadow-xl"
// // // // //                         >
// // // // //                           <FontAwesome6 name="plus" size={17} color="white" />
// // // // //                         </TouchableOpacity>
// // // // //                         </View>
// // // // //                       </View>
// // // // //                       {/* Input fields */}
// // // // //                       {product[category]?.charges_json?.map((charge, index) => {
// // // // //                         return (
// // // // //                           <View
// // // // //                             key={index}
// // // // //                             className="flex pt-2 pl-1 items-end flex-row"
// // // // //                           >
// // // // //                             {/* charge name */}
// // // // //                             <View className="w-[45%] pr-2">
// // // // //                               <OutlineInput
// // // // //                                 placeholder="e.g. Labour Charge"
// // // // //                                 value={charge.name}
// // // // //                                 onChangeText={(value) =>
// // // // //                                   handleInputChange(
// // // // //                                     "name",
// // // // //                                     value,
// // // // //                                     category,
// // // // //                                     "charges_json",
// // // // //                                     index
// // // // //                                   )
// // // // //                                 }
// // // // //                               />
// // // // //                             </View>

// // // // //                             {/* amount */}
// // // // //                             <View className="w-[45%] px-2">
// // // // //                               <OutlineInput
// // // // //                                 placeholder="e.g. 500"
// // // // //                                 value={charge.amount}
// // // // //                                 keyboardType="numeric"
// // // // //                                 onChangeText={(value) =>
// // // // //                                   handleInputChange(
// // // // //                                     "amount",
// // // // //                                     value,
// // // // //                                     category,
// // // // //                                     "charges_json",
// // // // //                                     index
// // // // //                                   )
// // // // //                                 }
// // // // //                               />
// // // // //                             </View>

// // // // //                             {/* trash icon */}
// // // // //                             {product[category]?.charges_json.length > 1 && (
// // // // //                               <TouchableOpacity
// // // // //                                 onPress={() =>
// // // // //                                   removeChargeTaxInput(
// // // // //                                     category,
// // // // //                                     "charges_json",
// // // // //                                     index
// // // // //                                   )
// // // // //                                 }
// // // // //                                 activeOpacity={0.7}
// // // // //                                 className="w-[10%] flex justify-center pl-3"
// // // // //                               >
// // // // //                                 <FontAwesome6
// // // // //                                   name="trash"
// // // // //                                   size={15}
// // // // //                                   color="red"
// // // // //                                 />
// // // // //                               </TouchableOpacity>
// // // // //                             )}
// // // // //                           </View>
// // // // //                         );
// // // // //                       })}
// // // // //                     </View>

// // // // //                     {/* Taxes */}
// // // // //                     <View className="">
// // // // //                       <View className="flex flex-row items-center justify-between">
// // // // //                         <Text className="tracking-wider text-base">Tax</Text>
// // // // //                         <View className="flex flex-row items-center">
// // // // //                           <Switch
// // // // //                             value={product?.[category]?.showTaxInBill || false}
// // // // //                             onValueChange={(value) => handleInputChange("showTaxInBill", value, category)}
// // // // //                             trackColor={{ false: "red", true: "green" }}
// // // // //                             thumbColor={product?.[category]?.showTaxInBill ? "#ffffff" : "#f4f3f4"}
// // // // //                           />
// // // // //                         <TouchableOpacity
// // // // //                           onPress={() => addItem(category, "tax_json")}
// // // // //                           activeOpacity={0.7}
// // // // //                             className="bg-primary ml-2 w-6 h-6 flex justify-center items-center rounded-full shadow-xl"
// // // // //                         >
// // // // //                           <FontAwesome6 name="plus" size={17} color="white" />
// // // // //                         </TouchableOpacity>
// // // // //                         </View>
// // // // //                       </View>
// // // // //                       {/* Input fields */}
// // // // //                       {product[category]?.tax_json?.map((tax, index) => {
// // // // //                         return (
// // // // //                           <View
// // // // //                             key={index}
// // // // //                             className="flex pt-2 pl-1 items-end flex-row"
// // // // //                           >
// // // // //                             {/* tax name */}
// // // // //                             <View className="w-[45%] pr-2">
// // // // //                               <OutlineInput
// // // // //                                 placeholder="e.g. Tax"
// // // // //                                 value={tax.name}
// // // // //                                 onChangeText={(value) =>
// // // // //                                   handleInputChange(
// // // // //                                     "name",
// // // // //                                     value,
// // // // //                                     category,
// // // // //                                     "tax_json",
// // // // //                                     index
// // // // //                                   )
// // // // //                                 }
// // // // //                               />
// // // // //                             </View>

// // // // //                             {/* tax amount */}
// // // // //                             <View className="w-[45%] px-2">
// // // // //                               <OutlineInput
// // // // //                                 placeholder="e.g. 10%"
// // // // //                                 value={tax.amount}
// // // // //                                 keyboardType="numeric"
// // // // //                                 onChangeText={(value) =>
// // // // //                                   handleInputChange(
// // // // //                                     "amount",
// // // // //                                     value,
// // // // //                                     category,
// // // // //                                     "tax_json",
// // // // //                                     index
// // // // //                                   )
// // // // //                                 }
// // // // //                               />
// // // // //                             </View>

// // // // //                             {/* trash icon */}
// // // // //                             {product[category]?.tax_json.length > 1 && (
// // // // //                               <TouchableOpacity
// // // // //                                 onPress={() =>
// // // // //                                   removeChargeTaxInput(
// // // // //                                     category,
// // // // //                                     "tax_json",
// // // // //                                     index
// // // // //                                   )
// // // // //                                 }
// // // // //                                 activeOpacity={0.7}
// // // // //                                 className="w-[10%] flex justify-center pl-3"
// // // // //                               >
// // // // //                                 <FontAwesome6
// // // // //                                   name="trash"
// // // // //                                   size={15}
// // // // //                                   color="red"
// // // // //                                 />
// // // // //                               </TouchableOpacity>
// // // // //                             )}
// // // // //                           </View>
// // // // //                         );
// // // // //                       })}
// // // // //                     </View>
// // // // //                   </View>
// // // // //                 </View>
// // // // //               )
// // // // //             );
// // // // //           })}
// // // // //           {/* ---------  common for sale & purchase - END - ---------- */}

// // // // //           {/* Custom Fields Section */}
// // // // //           <View className="px-4 pb-4">
// // // // //             <View className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
// // // // //               <View className="flex-row items-center justify-between mb-4">
// // // // //                 <Text className="text-lg font-semibold text-gray-800">Custom Fields</Text>
// // // // //                 <TouchableOpacity
// // // // //                   onPress={() => {
// // // // //                     setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
// // // // //                     setCustomFieldModal(true);
// // // // //                   }}
// // // // //                   className="bg-primary px-4 py-2 rounded-full flex-row items-center"
// // // // //                 >
// // // // //                   <FontAwesome6 name="plus" size={14} color="white" className="mr-2" />
// // // // //                   <Text className="text-white font-medium ml-1">Add Field</Text>
// // // // //                 </TouchableOpacity>
// // // // //               </View>

// // // // //               {/* Custom Fields List */}
// // // // //               {(product[product.type]?.custom_fields || []).map((field, index) => (
// // // // //                 <View key={index} className="mb-4 bg-gray-50 p-3 rounded-lg">
// // // // //                   <View className="flex-row items-center justify-between">
// // // // //                     <View className="flex-1">
// // // // //                       <Text className="text-base font-medium">{field.label}</Text>
// // // // //                       <Text className="text-sm text-gray-600">{field.value} {field.unit?.value || ''}</Text>
// // // // //                     </View>
// // // // //                     <View className="flex-row items-center">
// // // // //                       <Switch
// // // // //                         value={field.showInBill}
// // // // //                         onValueChange={(value) => {
// // // // //                           const updatedFields = [...(product[product.type].custom_fields || [])];
// // // // //                           updatedFields[index] = { ...field, showInBill: value };
// // // // //                           handleInputChange("custom_fields", updatedFields, product.type);
// // // // //                         }}
// // // // //                         trackColor={{ false: "#767577", true: "#22c55e" }}
// // // // //                         thumbColor={field.showInBill ? "#ffffff" : "#f4f3f4"}
// // // // //                       />
// // // // //                       <TouchableOpacity
// // // // //                         onPress={() => {
// // // // //                           const updatedFields = (product[product.type].custom_fields || []).filter((_, i) => i !== index);
// // // // //                           handleInputChange("custom_fields", updatedFields, product.type);
// // // // //                         }}
// // // // //                         className="ml-4 bg-red-100 p-2 rounded-full"
// // // // //                       >
// // // // //                         <FontAwesome6 name="trash" size={16} color="#ef4444" />
// // // // //                       </TouchableOpacity>
// // // // //                     </View>
// // // // //                   </View>
// // // // //                 </View>
// // // // //               ))}

// // // // //               {!(product[product.type]?.custom_fields?.length > 0) && (
// // // // //                 <View className="items-center py-6 bg-gray-50 rounded-lg">
// // // // //                   <Text className="text-gray-500 text-sm">No custom fieldss added yet</Text>
// // // // //                   <Text className="text-gray-400 text-xs mt-1">Click the "Add Field" button to create custom fields</Text>
// // // // //                 </View>
// // // // //               )}
// // // // //             </View>
// // // // //           </View>

// // // // //           {/* Custom Field Modal */}
// // // // //           <Modal
// // // // //             visible={customFieldModal}
// // // // //             transparent
// // // // //             animationType="fade"
// // // // //             onRequestClose={() => setCustomFieldModal(false)}
// // // // //           >
// // // // //             <View className="flex-1 justify-center items-center bg-black/50">
// // // // //               <View className="bg-white p-4 rounded-lg w-[90%] max-w-md">
// // // // //                 <Text className="text-lg font-semibold mb-4">Add Custom Field</Text>
                
// // // // //                 {/* Field Label */}
// // // // //             <View className="mb-4">
// // // // //               <InputBox
// // // // //                     name="label"
// // // // //                     label="Field Label"
// // // // //                     placeholder="e.g., Less Weight 2"
// // // // //                     value={tempCustomField.label}
// // // // //                     onChange={({ value }) => setTempCustomField(prev => ({ ...prev, label: value }))}
// // // // //                   />
// // // // //                 </View>

// // // // //                 {/* Field Value */}
// // // // //                 <View className="mb-4">
// // // // //                   <InputBox
// // // // //                     name="value"
// // // // //                     label="Value"
// // // // //                     placeholder="Enter numeric value"
// // // // //                     value={tempCustomField.value}
// // // // //                     keyboardType="numeric"
// // // // //                     onChange={({ value }) => setTempCustomField(prev => ({ ...prev, value }))}
// // // // //                   />
// // // // //                 </View>

// // // // //                 {/* Unit Selection */}
// // // // //                 <View className="mb-4">
// // // // //                   <SelectInput
// // // // //                     label="Unit"
// // // // //                     name="unit"
// // // // //                     value={tempCustomField.unit}
// // // // //                     placeholder="Select Unit"
// // // // //                     data={jewelryUnits}
// // // // //                     onSelect={(value) => setTempCustomField(prev => ({ ...prev, unit: value }))}
// // // // //                   />
// // // // //                 </View>

// // // // //                 {/* Show in Bill Toggle */}
// // // // //                 <View className="flex-row items-center justify-between mb-6">
// // // // //                   <Text className="text-base text-gray-700">Show in Bill</Text>
// // // // //                   <Switch
// // // // //                     value={tempCustomField.showInBill}
// // // // //                     onValueChange={(value) => setTempCustomField(prev => ({ ...prev, showInBill: value }))}
// // // // //                     trackColor={{ false: "#767577", true: "#22c55e" }}
// // // // //                     thumbColor={tempCustomField.showInBill ? "#ffffff" : "#f4f3f4"}
// // // // //                   />
// // // // //                 </View>

// // // // //                 {/* Buttons */}
// // // // //                 <View className="flex-row justify-end space-x-2">
// // // // //                   <TouchableOpacity 
// // // // //                     onPress={() => {
// // // // //                       setCustomFieldModal(false);
// // // // //                       setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
// // // // //                     }}
// // // // //                     className="px-4 py-2"
// // // // //                   >
// // // // //                     <Text className="text-gray-600">Cancel</Text>
// // // // //                   </TouchableOpacity>
// // // // //                   <TouchableOpacity 
// // // // //                     onPress={() => {
// // // // //                       const updatedFields = [...(product[product.type]?.custom_fields || [])];
// // // // //                       updatedFields.push(tempCustomField);
// // // // //                       handleInputChange("custom_fields", updatedFields, product.type);
// // // // //                       setCustomFieldModal(false);
// // // // //                       setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
// // // // //                     }}
// // // // //                     className="bg-primary px-4 py-2 rounded-md"
// // // // //                   >
// // // // //                     <Text className="text-white">Done</Text>
// // // // //                   </TouchableOpacity>
// // // // //                 </View>
// // // // //               </View>
// // // // //             </View>
// // // // //           </Modal>

// // // // //           {/* Horizontal Layout for Photo + Buttons */}
// // // // //           <View className="flex-row px-4 pb-4">
// // // // //             {/* Additional Photo - Left Side */}
// // // // //             <View className="flex-1 pr-2">
// // // // //               <View className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
// // // // //                 <Text className="text-sm font-medium mb-2 text-center">Additional Photo</Text>
// // // // //                 <ImagePickerComponent
// // // // //                   name="additional_image"
// // // // //                   value={product?.additional_image}
// // // // //                 onChange={({ value, name }) => handleInputChange(name, value)}
// // // // //               />
// // // // //                 <Text className="text-xs text-gray-500 mt-2 text-center">
// // // // //                   Upload item photo
// // // // //                 </Text>
// // // // //               </View>
// // // // //             </View>

// // // // //             {/* Buttons - Right Side */}
// // // // //             <View className="w-1/3 pl-2">
// // // // //             {isFromInvoice ? (
// // // // //                 <View className="space-y-2">
// // // // //                 <CommonButton
// // // // //                   loading={loading}
// // // // //                   onPress={handleAddProduct}
// // // // //                   title="Add Product"
// // // // //                     />
// // // // //               </View>
// // // // //             ) : (
// // // // //                 <View className="space-y-2">
// // // // //                   <CommonButton
// // // // //                     loading={loading}
// // // // //                     onPress={onSubmitClick}
// // // // //                     title={route?.params?.isProductEdit || updateData ? "Update" : "Create"}
// // // // //                   />
// // // // //               </View>
// // // // //             )}
// // // // //             </View>
// // // // //           </View>
// // // // //         </View>
// // // // //       </KeyboardHanlder>

// // // // //       {/* Add weight */}
// // // // //       {updateData && (
// // // // //         <AddWeightModal
// // // // //           product={{ id: updateData.id, type: product?.type }}
// // // // //           open={initialState.weightModal}
// // // // //           onClose={() => handleInitialState("weightModal", false)}
// // // // //         />
// // // // //       )}

// // // // //       {/* Create metal */}
// // // // //       <CreateMetalModal
// // // // //         navigation={navigation}
// // // // //         route={route}
// // // // //         open={initialState.metalModal}
// // // // //         onClose={() => handleInitialState("metalModal", false)}
// // // // //       />

// // // // //       {/* Date Picker Modals */}
// // // // //       <Modal
// // // // //         visible={initialState.billDatePicker}
// // // // //         transparent
// // // // //         animationType="fade"
// // // // //         onRequestClose={() => handleInitialState("billDatePicker", false)}
// // // // //       >
// // // // //         <View className="flex-1 justify-center items-center bg-black/50">
// // // // //           <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
// // // // //             <Text className="text-lg font-semibold mb-4">Select Bill Date</Text>
            
// // // // //             <DatePickerComponent
// // // // //               name="bill_date"
// // // // //               value={product?.bill_date}
// // // // //               onSelect={({ value }) => {
// // // // //                 handleInputChange("bill_date", value);
// // // // //                 handleInitialState("billDatePicker", false);
// // // // //               }}
// // // // //             />

// // // // //             <TouchableOpacity 
// // // // //               onPress={() => handleInitialState("billDatePicker", false)}
// // // // //               className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
// // // // //             >
// // // // //               <Text className="text-white">Close</Text>
// // // // //             </TouchableOpacity>
// // // // //           </View>
// // // // //         </View>
// // // // //       </Modal>

// // // // //       <Modal
// // // // //         visible={initialState.paymentDatePicker}
// // // // //         transparent
// // // // //         animationType="fade"
// // // // //         onRequestClose={() => handleInitialState("paymentDatePicker", false)}
// // // // //       >
// // // // //         <View className="flex-1 justify-center items-center bg-black/50">
// // // // //           <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
// // // // //             <Text className="text-lg font-semibold mb-4">Select Expected Payment Date</Text>
            
// // // // //             <DatePickerComponent
// // // // //               name="payment_date"
// // // // //               value={product?.payment_date}
// // // // //               onSelect={({ value }) => {
// // // // //                 handleInputChange("payment_date", value);
// // // // //                 handleInitialState("paymentDatePicker", false);
// // // // //               }}
// // // // //             />

// // // // //             <TouchableOpacity 
// // // // //               onPress={() => handleInitialState("paymentDatePicker", false)}
// // // // //               className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
// // // // //             >
// // // // //               <Text className="text-white">Close</Text>
// // // // //             </TouchableOpacity>
// // // // //           </View>
// // // // //         </View>
// // // // //       </Modal>

// // // // //       <Modal
// // // // //         visible={initialState.interestStartDatePicker}
// // // // //         transparent
// // // // //         animationType="fade"
// // // // //         onRequestClose={() => handleInitialState("interestStartDatePicker", false)}
// // // // //       >
// // // // //         <View className="flex-1 justify-center items-center bg-black/50">
// // // // //           <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
// // // // //             <Text className="text-lg font-semibold mb-4">Select Interest Start Date</Text>
            
// // // // //             <DatePickerComponent
// // // // //               name="interest_start_date"
// // // // //               value={product?.interest_start_date}
// // // // //               onSelect={({ value }) => {
// // // // //                 handleInputChange("interest_start_date", value);
// // // // //                 handleInitialState("interestStartDatePicker", false);
// // // // //               }}
// // // // //             />

// // // // //             <TouchableOpacity 
// // // // //               onPress={() => handleInitialState("interestStartDatePicker", false)}
// // // // //               className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
// // // // //             >
// // // // //               <Text className="text-white">Close</Text>
// // // // //             </TouchableOpacity>
// // // // //           </View>
// // // // //         </View>
// // // // //       </Modal>

// // // // //     </Fragment>
// // // // //   );
// // // // // };

// // // // // export default ProductForm;

// // // // import InputBox from "@/src/components/common/InputBox";
// // // // import React, { Fragment, useEffect, useState } from "react";
// // // // import { View, TouchableOpacity, Switch, Modal, SafeAreaView, ScrollView, Alert, BackHandler, FlatList, Text, Platform } from "react-native";
// // // // import { useDispatch, useSelector } from "react-redux";
// // // // import SimpleReactValidator from "simple-react-validator";
// // // // import CommonButton from "@/src/components/common/buttons/CommonButton";
// // // // import SelectInput from "@/src/components/common/SelectInput";
// // // // import ImagePickerComponent from "@/src/components/common/ImagePicker";
// // // // import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
// // // // import {
// // // //   fetchProductDetail,
// // // //   fetchProductGroups,
// // // //   manageProductList,
// // // //   fetchProductList,
// // // // } from "@/src/redux/actions/product.action";
// // // // import KeyboardHanlder from "@/src/components/common/KeyboardHanlder";
// // // // import CreateMetalModal from "./CreateMetalModal";
// // // // import AddWeightModal from "./AddWeightModal";
// // // // import OutlineInput from "@/src/components/common/OutlineInput";
// // // // import SearchProduct from "./SearchProduct";
// // // // import { makingTypes } from "@/src/utils";
// // // // import AntDesign from "@expo/vector-icons/AntDesign";
// // // // import moment from "moment";
// // // // import DatePickerComponent from "@/src/components/common/DateTimePicker";
// // // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // // import { useFocusEffect } from "@react-navigation/native";
// // // // import { getToken } from "@/src/utils/auth";
// // // // import { ApiRequest } from "@/src/utils/api";
// // // // import { MANAGE_PRODUCT_API, MANAGE_LOGS_API, MANAGE_BILL_API } from "@/src/utils/api/endpoints";
// // // // import ShowToast from "@/src/components/common/ShowToast";

// // // // // Process sale and purchase data
// // // // export function processProductData(productData, prefix, isFromInvoice) {
// // // //   return productData.map((item) => {
// // // //     const processedItem = {
// // // //       gross_weight: 0,
// // // //       less_weight: 0,
// // // //       net_weight: 0,
// // // //       net_price: 0,
// // // //       wastage: 0,
// // // //       tounch: 0,
// // // //       fine_weight: 0,
// // // //       rate: 0,
// // // //       making_type: "",
// // // //       charges_json: [{}],
// // // //       tax_json: [{}],
// // // //       custom_fields: [], // Initialize custom_fields
// // // //     };
// // // //     for (const key in item) {
// // // //       if (key.startsWith(prefix)) {
// // // //         const newKey = key.replace(prefix, "");
// // // //         processedItem[newKey] = key.includes("_json")
// // // //           ? (() => {
// // // //               try {
// // // //                 return JSON.parse(item[key].replace(/'/g, '"'));
// // // //               } catch (e) {
// // // //                 console.error("Invalid JSON string:", item[key]);
// // // //                 return [{}];
// // // //               }
// // // //             })()
// // // //           : key === "making_type"
// // // //           ? makingTypes.find((type) => type.value === item[key]) || ""
// // // //           : item[key];
// // // //       }
// // // //     }
// // // //     return processedItem;
// // // //   });
// // // // }

// // // // // Storage key for form data
// // // // const PRODUCT_FORM_STORAGE_KEY = "productForm_savedState";

// // // // const ProductForm = ({
// // // //   navigation,
// // // //   route,
// // // //   isFromInvoice = false,
// // // //   invoiceHandler,
// // // //   handleCancel,
// // // // }) => {
// // // //   const updateData = route?.params?.updateData;
// // // //   const isBillEdit = route?.params?.isBillEdit;
// // // //   const billType = route?.params?.billType;
// // // //   const dispatch = useDispatch();
// // // //   const [errors, setErrors] = useState({});
// // // //   const [initialState, setInitialState] = useState({
// // // //     metalModal: false,
// // // //     weightModal: false,
// // // //     datePicker: false,
// // // //     billDatePicker: false,
// // // //     paymentDatePicker: false,
// // // //     interestStartDatePicker: false,
// // // //   });
// // // //   const [customFieldModal, setCustomFieldModal] = useState(false);
// // // //   const [tempCustomField, setTempCustomField] = useState({
// // // //     label: "",
// // // //     value: "",
// // // //     unit: "",
// // // //     showInBill: true,
// // // //   });
// // // //   const [dataLoaded, setDataLoaded] = useState(false);
// // // //   const [formChanged, setFormChanged] = useState(false);
// // // //   const [loading, setLoading] = useState(false);
// // // //   const [showSuggestions, setShowSuggestions] = useState(false);
// // // //   const [filteredProducts, setFilteredProducts] = useState([]);
// // // //   const { productGroups, isLoading: productLoading, productDetail, products } = useSelector(
// // // //     (state) => state.productSlices
// // // //   );
// // // //   const { profileData } = useSelector((state) => state.userSlices);
// // // //   const validator = new SimpleReactValidator();
// // // //   const productTypes = ["purchase", "sale"];

// // // //   const formType = isFromInvoice
// // // //     ? (invoiceHandler?.isPurchase ? "purchase" : "sale")
// // // //     : "purchase";

// // // //   const defaultProductState = {
// // // //     type: formType,
// // // //     size: "",
// // // //     interest_enabled: false,
// // // //     interest_type: { label: "Flat", value: "2" },
// // // //     interest_rate: "2",
// // // //     interest_amount: "0",
// // // //     bill_date: new Date(),
// // // //     payment_date: null,
// // // //     interest_start_date: null,
// // // //     interest_upto: null,
// // // //     grace_period_enabled: false,
// // // //     grace_period_days: "0",
// // // //     original_amount: "0",
// // // //     remaining_balance: "0",
// // // //     interest_notes: "",
// // // //     payment_history: [],
// // // //     cutting_enabled: false,
// // // //     sale: {
// // // //       gross_weight: 0,
// // // //       less_weight: 0,
// // // //       net_weight: 0,
// // // //       net_price: 0,
// // // //       wastage: 0,
// // // //       tounch: 0,
// // // //       fine_weight: 0,
// // // //       rate: 0,
// // // //       metal_value: "0",
// // // //       making_type: "",
// // // //       making_charge: 0,
// // // //       photo: null,
// // // //       charges_json: [{}],
// // // //       tax_json: [{}],
// // // //       custom_fields: [], // Initialize custom_fields
// // // //       showSizeInBill: true,
// // // //       showGrossWeightInBill: true,
// // // //       showLessWeightInBill: true,
// // // //       showNetWeightInBill: true,
// // // //       showWastageInBill: true,
// // // //       showTounchInBill: true,
// // // //       showFineWeightInBill: true,
// // // //       showRateInBill: true,
// // // //       showMakingChargeInBill: true,
// // // //       showHuidInBill: true,
// // // //       showHsnInBill: true,
// // // //       showPriceInBill: true,
// // // //       showTaxInBill: true,
// // // //       showChargesInBill: true,
// // // //       showCommentInBill: true,
// // // //     },
// // // //     purchase: {
// // // //       gross_weight: 0,
// // // //       less_weight: 0,
// // // //       net_weight: 0,
// // // //       net_price: 0,
// // // //       wastage: 0,
// // // //       tounch: 0,
// // // //       fine_weight: 0,
// // // //       rate: 0,
// // // //       metal_value: "0",
// // // //       making_type: "",
// // // //       making_charge: 0,
// // // //       photo: null,
// // // //       charges_json: [{}],
// // // //       tax_json: [{}],
// // // //       custom_fields: [], // Initialize custom_fields
// // // //       showSizeInBill: true,
// // // //       showGrossWeightInBill: true,
// // // //       showLessWeightInBill: true,
// // // //       showNetWeightInBill: true,
// // // //       showWastageInBill: true,
// // // //       showTounchInBill: true,
// // // //       showFineWeightInBill: true,
// // // //       showRateInBill: true,
// // // //       showMakingChargeInBill: true,
// // // //       showHuidInBill: true,
// // // //       showHsnInBill: true,
// // // //       showPriceInBill: true,
// // // //       showTaxInBill: true,
// // // //       showChargesInBill: true,
// // // //       showCommentInBill: true,
// // // //     },
// // // //   };

// // // //   const [product, setProduct] = useState(defaultProductState);
// // // //   console.log("JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ", product);

// // // //   const saveFormData = async (formData) => {
// // // //     try {
// // // //       await AsyncStorage.setItem(PRODUCT_FORM_STORAGE_KEY, JSON.stringify(formData));
// // // //       console.log("Form data saved to AsyncStorage");
// // // //       setFormChanged(true);
// // // //     } catch (error) {
// // // //       console.error("Error saving form data:", error);
// // // //     }
// // // //   };

// // // //   const loadFormData = async () => {
// // // //     try {
// // // //       const savedData = await AsyncStorage.getItem(PRODUCT_FORM_STORAGE_KEY);
// // // //       if (savedData) {
// // // //         const parsedData = JSON.parse(savedData);
// // // //         console.log("Loaded saved form data");
// // // //         setProduct(parsedData);
// // // //       }
// // // //       setDataLoaded(true);
// // // //     } catch (error) {
// // // //       console.error("Error loading form data:", error);
// // // //       setDataLoaded(true);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     if (updateData?.id) {
// // // //       dispatch(fetchProductDetail({ id: updateData.id }));
// // // //       setDataLoaded(true);
// // // //     } else {
// // // //       loadFormData();
// // // //     }
// // // //   }, []);

// // // //   const isSelectRate = product?.hsn_id?.variation?.length > 0;
// // // //   console.log("bhcxDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD", isSelectRate);

// // // //   const handleDigitsFix = (value) => {
// // // //     if (!value || isNaN(value)) return "0.00";
// // // //     return parseFloat(value).toFixed(2);
// // // //   };

// // // //   const jewelryUnits = [
// // // //     { label: "Grams (g)", value: "g" },
// // // //     { label: "Milligrams (mg)", value: "mg" },
// // // //     { label: "Carats (ct)", value: "ct" },
// // // //     { label: "Pieces (pcs)", value: "pcs" },
// // // //     { label: "Inches (in)", value: "in" },
// // // //     { label: "Millimeters (mm)", value: "mm" },
// // // //     { label: "Percentage (%)", value: "%" },
// // // //   ];

// // // //   const calculateTotalChargesAndTaxes = (category) => {
// // // //     let totalCharges = 0;
// // // //     let totalTaxPercentage = 0;

// // // //     if (category?.charges_json) {
// // // //       totalCharges = category.charges_json.reduce(
// // // //         (sum, charge) => sum + (Number(charge.amount) || 0),
// // // //         0
// // // //       );
// // // //     }

// // // //     if (category?.tax_json) {
// // // //       totalTaxPercentage = category.tax_json.reduce(
// // // //         (sum, tax) => sum + (Number(tax.amount) || 0),
// // // //         0
// // // //       );
// // // //     }

// // // //     return { totalCharges, totalTaxPercentage };
// // // //   };

// // // //   const handleInputChange = (name, value, category, arrayKey, index) => {
// // // //     const updatedProduct = { ...product };

// // // //     if (arrayKey && typeof index === "number" && updatedProduct[category]?.[arrayKey]) {
// // // //       updatedProduct[category][arrayKey][index] = {
// // // //         ...updatedProduct[category][arrayKey][index],
// // // //         [name]: value,
// // // //       };
// // // //     } else if (category && updatedProduct[category]) {
// // // //       updatedProduct[category][name] = value;

// // // //       // Auto-set rate when hsn_id is selected
// // // //       if (name === "hsn_id") {
// // // //         const variations = value?.variation || [];
// // // //         if (variations.length > 0) {
// // // //           const defaultVariation = variations[0];
// // // //           if (!defaultVariation?.price) {
// // // //             ShowToast("Selected HSN has invalid variation data");
// // // //             updatedProduct[category].rate = null;
// // // //           } else {
// // // //             updatedProduct[category].rate = defaultVariation;
// // // //           }
// // // //         } else {
// // // //           updatedProduct[category].rate = "0";
// // // //         }
// // // //       }
// // // //     } else {
// // // //       updatedProduct[name] = value;
// // // //     }

// // // //     // Calculate net_weight and fine_weight
// // // //     if (['gross_weight', 'less_weight', 'wastage', 'tounch'].includes(name) && updatedProduct[category]) {
// // // //       const gross = parseFloat(updatedProduct[category].gross_weight) || 0;
// // // //       const less = parseFloat(updatedProduct[category].less_weight) || 0;
// // // //       const wastage = parseFloat(updatedProduct[category].wastage) || 0;
// // // //       const tounch = parseFloat(updatedProduct[category].tounch) || 0;

// // // //       updatedProduct[category].net_weight = (gross - less).toFixed(3);
// // // //       updatedProduct[category].fine_weight = (gross * ((tounch + wastage) / 100)).toFixed(3);
// // // //     }

// // // //     // Calculate metal_value and net_price
// // // //     if (['rate', 'hsn_id', 'gross_weight', 'less_weight', 'wastage', 'tounch'].includes(name) && updatedProduct[category]) {
// // // //       const fineWeight = parseFloat(updatedProduct[category].fine_weight) || 0;
// // // //       const rateValue = isSelectRate ? parseFloat(updatedProduct[category].rate?.price || 0) : parseFloat(updatedProduct[category].rate || 0);
// // // //       const makingCharge = parseFloat(updatedProduct[category].making_charge) || 0;
// // // //       const netWeight = parseFloat(updatedProduct[category].net_weight) || 0;
// // // //       const chargesTotal = (updatedProduct[category].charges_json || []).reduce(
// // // //         (sum, charge) => sum + Number(charge.amount || 0),
// // // //         0
// // // //       );
// // // //       const taxRate = parseFloat(updatedProduct[category].tax || 0) / 100;

// // // //       updatedProduct[category].metal_value = (fineWeight * rateValue).toFixed(2);

// // // //       const subtotal = (fineWeight * rateValue) +
// // // //         (updatedProduct[category].making_type?.value === "PG"
// // // //           ? netWeight * makingCharge
// // // //           : makingCharge) +
// // // //         chargesTotal;

// // // //       updatedProduct[category].net_price = (subtotal + subtotal * taxRate).toFixed(2);
// // // //     }

// // // //     setProduct(updatedProduct);
// // // //     saveFormData(updatedProduct);

// // // //     if (errors[name]) {
// // // //       setErrors((prev) => ({ ...prev, [name]: null }));
// // // //     }
// // // //   };

// // // //   const handleInitialState = (name, value) => {
// // // //     setInitialState({ ...initialState, [name]: value });
// // // //   };

// // // //   const handleSubmit = async () => {
// // // //     try {
// // // //       if (!product.name) {
// // // //         ShowToast("Product name is required");
// // // //         return;
// // // //       }

// // // //       setLoading(true);

// // // //       const formData = new FormData();

// // // //       formData.append('name', product.name || '');
// // // //       formData.append('huid', product.huid || '');
// // // //       formData.append('hsn_id', product.hsn_id?.value || '');
// // // //       formData.append('bar_code', product.bar_code || '');
// // // //       formData.append('comment', product.comment || '');

// // // //       if (product.image && typeof product.image === 'object' && product.image.uri) {
// // // //         formData.append('image', {
// // // //           uri: Platform.OS === 'ios' ? product.image.uri.replace('file://', '') : product.image.uri,
// // // //           type: 'image/jpeg',
// // // //           name: `product_${Date.now()}.jpg`,
// // // //         });
// // // //       } else if (product.image && typeof product.image === 'string') {
// // // //         formData.append('image_url', product.image);
// // // //       }

// // // //       formData.append('sale_gross_weight', String(product.sale?.gross_weight || '0'));
// // // //       formData.append('sale_less_weight', String(product.sale?.less_weight || '0'));
// // // //       formData.append('sale_net_weight', String(product.sale?.net_weight || '0'));
// // // //       formData.append('sale_wastage', String(product.sale?.wastage || '0'));
// // // //       formData.append('sale_tounch', String(product.sale?.tounch || '0'));
// // // //       formData.append('sale_fine_weight', String(product.sale?.fine_weight || '0'));
// // // //       formData.append('sale_rate', String((typeof product.sale?.rate === 'object' ? product.sale.rate?.price : product.sale?.rate) || '0'));
// // // //       formData.append('sale_making_type', product.sale?.making_type?.value || 'PG');
// // // //       formData.append('sale_making_charges', String(product.sale?.making_charge || '0'));
// // // //       formData.append('sale_net_price', String(product.sale?.net_price || '0'));
// // // //       formData.append('sale_piece', '1');

// // // //       formData.append('purchase_gross_weight', String(product.purchase?.gross_weight || '0'));
// // // //       formData.append('purchase_less_weight', String(product.purchase?.less_weight || '0'));
// // // //       formData.append('purchase_net_weight', String(product.purchase?.net_weight || '0'));
// // // //       formData.append('purchase_wastage', String(product.purchase?.wastage || '0'));
// // // //       formData.append('purchase_tounch', String(product.purchase?.tounch || '0'));
// // // //       formData.append('purchase_fine_weight', String(product.purchase?.fine_weight || '0'));
// // // //       formData.append('purchase_rate', String((typeof product.purchase?.rate === 'object' ? product.purchase.rate?.price : product.purchase?.rate) || '0'));
// // // //       formData.append('purchase_making_type', product.purchase?.making_type?.value || 'PG');
// // // //       formData.append('purchase_making_charges', String(product.purchase?.making_charge || '0'));
// // // //       formData.append('purchase_net_price', String(product.purchase?.net_price || '0'));
// // // //       formData.append('purchase_piece', '1');

// // // //       formData.append('sale_charges_json', JSON.stringify(product.sale?.charges_json || []));
// // // //       formData.append('sale_tax_json', JSON.stringify(product.sale?.tax_json || []));
// // // //       formData.append('purchase_charges_json', JSON.stringify(product.purchase?.charges_json || []));
// // // //       formData.append('purchase_tax_json', JSON.stringify(product.purchase?.tax_json || []));

// // // //       const now = new Date();
// // // //       const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');

// // // //       const [productResponse, logResponse] = await Promise.all([
// // // //         ApiRequest({
// // // //           url: MANAGE_PRODUCT_API.create,
// // // //           method: 'POST',
// // // //           body: formData,
// // // //           headers: {
// // // //             'Content-Type': 'multipart/form-data',
// // // //           },
// // // //         }),
// // // //         ApiRequest({
// // // //           url: MANAGE_LOGS_API.create,
// // // //           method: 'POST',
// // // //           body: {
// // // //             userName: profileData?.name || 'Unknown User',
// // // //             productName: product.name || 'Unknown Product',
// // // //             id: 0,
// // // //             type: 'product',
// // // //             amount: parseFloat(product[product.type]?.net_price || 0).toFixed(2),
// // // //             action: 'CREATE',
// // // //             entityType: 'PRODUCT',
// // // //             timestamp: timestamp,
// // // //             metadata: JSON.stringify({
// // // //               action: 'Created new product',
// // // //               productId: product.product_id || 'new',
// // // //               note: `Created product: ${product.name}`,
// // // //               formData: {
// // // //                 sale_gross_weight: product.sale?.gross_weight || 0,
// // // //                 sale_net_weight: product.sale?.net_weight || 0,
// // // //                 sale_fine_weight: product.sale?.fine_weight || 0,
// // // //                 sale_net_price: product.sale?.net_price || 0,
// // // //               },
// // // //             }),
// // // //           },
// // // //         }),
// // // //       ]);

// // // //       if (!productResponse?.success) {
// // // //         throw new Error(productResponse?.message || "Failed to save product");
// // // //       }

// // // //       if (!logResponse?.success) {
// // // //         console.error("Warning: Product saved but log creation failed:", logResponse?.message);
// // // //         ShowToast("Product saved but logging failed");
// // // //       } else {
// // // //         ShowToast(productResponse.message || "Product created successfully");
// // // //       }

// // // //       await AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY);
// // // //       navigation.goBack();
// // // //     } catch (error) {
// // // //       console.error('Error details:', error);
// // // //       ShowToast(error.message || "Error saving product");
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   const onSubmitClick = () => {
// // // //     const isUpdate = route?.params?.isProductEdit || updateData?.id;
// // // //     if (isUpdate) {
// // // //       const formData = new FormData();
// // // //       formData.append('id', updateData?.id || route?.params?.id);
// // // //       handleUpdate();
// // // //     } else {
// // // //       handleSubmit();
// // // //     }
// // // //   };

// // // //   const resetProduct = async () => {
// // // //     Alert.alert(
// // // //       "Reset Form",
// // // //       "Are you sure you want to reset all form values?",
// // // //       [
// // // //         {
// // // //           text: "Cancel",
// // // //           style: "cancel",
// // // //         },
// // // //         {
// // // //           text: "Reset",
// // // //           onPress: async () => {
// // // //             try {
// // // //               await AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY);
// // // //               console.log("Form data cleared during reset");
// // // //               setProduct(defaultProductState);
// // // //               setFormChanged(false);
// // // //             } catch (error) {
// // // //               console.error("Error clearing form data:", error);
// // // //               ShowToast("Error clearing form data");
// // // //             }
// // // //           },
// // // //         },
// // // //       ]
// // // //     );
// // // //   };

// // // //   const addItem = (type, key) => {
// // // //     setProduct((prev) => ({
// // // //       ...prev,
// // // //       [type]: {
// // // //         ...prev[type],
// // // //         [key]: [
// // // //           ...prev[type][key],
// // // //           key === "charges_json"
// // // //             ? { name: "", amount: "0" }
// // // //             : { name: "", amount: "0" },
// // // //         ],
// // // //       },
// // // //     }));
// // // //   };

// // // //   const removeChargeTaxInput = (type, key, index) => {
// // // //     setProduct((prev) => {
// // // //       const updatedCategory = { ...prev[type] };
// // // //       const itemToRemove = updatedCategory[key].find((item, i) => i === index);
// // // //       updatedCategory[key] = updatedCategory[key].filter(
// // // //         (item, i) => i !== index
// // // //       );

// // // //       updatedCategory.net_price =
// // // //         Number(updatedCategory.net_price || 0) - Number(itemToRemove?.amount || 0);

// // // //       return {
// // // //         ...prev,
// // // //         [type]: updatedCategory,
// // // //       };
// // // //     });
// // // //   };

// // // //   const handleProductTypeChange = (type) => {
// // // //     const isSale = type === "sale";
// // // //     setProduct((prev) => {
// // // //       const updatedSale = isSale
// // // //         ? {
// // // //             ...prev.purchase,
// // // //             gross_weight: prev?.sale?.gross_weight || 0,
// // // //             less_weight: prev?.sale?.less_weight || 0,
// // // //             net_weight: prev?.sale?.net_weight || 0,
// // // //             net_price: prev?.sale?.net_price || 0,
// // // //           }
// // // //         : prev.sale;

// // // //       return { ...prev, sale: updatedSale, type };
// // // //     });
// // // //   };

// // // //   const handleProductDetail = (data) => {
// // // //     const {
// // // //       name,
// // // //       hsn_id,
// // // //       huid,
// // // //       comment,
// // // //       image_url,
// // // //       sale_product_data,
// // // //       purchase_product_data,
// // // //     } = data;

// // // //     const purchase = processProductData(
// // // //       purchase_product_data || [{}],
// // // //       "purchase_",
// // // //       isFromInvoice
// // // //     );
// // // //     const sale = processProductData(
// // // //       sale_product_data || [{}],
// // // //       "sale_",
// // // //       isFromInvoice
// // // //     );
// // // //     const hsnName = productGroups.find((item) => item.id == hsn_id);

// // // //     setProduct({
// // // //       ...defaultProductState,
// // // //       ...(isFromInvoice
// // // //         ? { product_id: data.id, product_name: data.name }
// // // //         : {}),
// // // //       name: name || "",
// // // //       huid: huid || "",
// // // //       comment: comment || "",
// // // //       image: image_url || "",
// // // //       hsn_id: hsnName ? { label: hsnName.name, value: hsnName.id } : null,
// // // //       sale: sale[0] || defaultProductState.sale,
// // // //       purchase: purchase[0] || defaultProductState.purchase,
// // // //     });
// // // //   };

// // // //   const handleAddProduct = () => {
// // // //     if (validator.allValid()) {
// // // //       const newProducts = [
// // // //         ...(invoiceHandler?.formValue?.selectedProduct || []),
// // // //       ];

// // // //       const { name, hsn_id, huid, comment, image, size } = product;

// // // //       const productData = {
// // // //         name,
// // // //         huid,
// // // //         size,
// // // //         hsn_id: hsn_id?.value || '',
// // // //         comment,
// // // //         sale: product.sale || {},
// // // //         purchase: product.purchase || {},
// // // //         ...product[product.type],
// // // //         rate: typeof product[product.type].rate === 'object'
// // // //           ? product[product.type].rate?.price
// // // //           : product[product.type].rate,
// // // //         product_id: Math.random().toString(36).substring(2, 9),
// // // //       };

// // // //       newProducts.push(productData);

// // // //       const totalPrice = newProducts.reduce(
// // // //         (acc, product) => Number(acc) + Number(product[invoiceHandler?.isPurchase ? "purchase" : "sale"]?.net_price || 0),
// // // //         0
// // // //       );

// // // //       invoiceHandler?.setFormValue({
// // // //         ...invoiceHandler?.formValue,
// // // //         selectedProduct: newProducts,
// // // //         totalPrice,
// // // //       });

// // // //       AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY)
// // // //         .then(() => console.log("Form data cleared after adding product to invoice"))
// // // //         .catch((error) => console.error("Error clearing form data:", error));

// // // //       resetProduct();
// // // //       setFormChanged(false);

// // // //       if (invoiceHandler && invoiceHandler.onSubmit) {
// // // //         invoiceHandler.onSubmit();
// // // //       }
// // // //     } else {
// // // //       setErrors(validator.errorMessages);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     if (productDetail) {
// // // //       handleProductDetail(productDetail);
// // // //     }
// // // //   }, [productDetail]);

// // // //   useEffect(() => {
// // // //     resetProduct();
// // // //     dispatch(fetchProductGroups());
// // // //     if (updateData) {
// // // //       dispatch(fetchProductDetail(updateData?.id));
// // // //     }
// // // //   }, [dispatch, updateData]);

// // // //   const calculateInterestPeriod = (product) => {
// // // //     if (!product?.bill_date || !product?.payment_date) return 0;

// // // //     const startDate = product?.interest_start_date
// // // //       ? moment(product.interest_start_date)
// // // //       : moment(product.bill_date);

// // // //     const endDate = moment(product.payment_date);

// // // //     let days = endDate.diff(startDate, 'days');

// // // //     if (product?.grace_period_enabled) {
// // // //       days = Math.max(0, days - Number(product?.grace_period_days || 0));
// // // //     }

// // // //     return days;
// // // //   };

// // // //   const calculateInterest = (updatedProduct) => {
// // // //     if (!updatedProduct.interest_enabled) {
// // // //       return { interestAmount: 0, dailyBreakdown: [] };
// // // //     }

// // // //     const balance = parseFloat(updatedProduct[updatedProduct.type]?.net_price || 0);
// // // //     const interestRate = parseFloat(updatedProduct.interest_rate || 0) / 100;
// // // //     const interestType = updatedProduct.interest_type?.value;

// // // //     let interestAmount = 0;
// // // //     let dailyBreakdown = [];

// // // //     const days = calculateInterestPeriod(updatedProduct);
// // // //     if (days <= 0) return { interestAmount: 0, dailyBreakdown: [] };

// // // //     const timeInYears = days / 365;

// // // //     if (interestType === "2") {
// // // //       interestAmount = balance * interestRate * timeInYears;
// // // //     } else if (interestType === "1") {
// // // //       interestAmount = balance * (Math.pow(1 + interestRate, timeInYears) - 1);
// // // //     }

// // // //     return { interestAmount, dailyBreakdown };
// // // //   };

// // // //   useEffect(() => {
// // // //     if (product?.sale && product?.purchase) {
// // // //       if (product.sale.tax_json && product.sale.tax_json.length > 0) {
// // // //         const totalTax = product.sale.tax_json.reduce((sum, tax) => sum + Number(tax.amount || 0), 0);
// // // //         handleInputChange("tax", totalTax, "sale");
// // // //       }

// // // //       if (product.purchase.tax_json && product.purchase.tax_json.length > 0) {
// // // //         const totalTax = product.purchase.tax_json.reduce((sum, tax) => sum + Number(tax.amount || 0), 0);
// // // //         handleInputChange("tax", totalTax, "purchase");
// // // //       }
// // // //     }
// // // //   }, [product?.sale?.tax_json, product?.purchase?.tax_json]);

// // // //   useEffect(() => {
// // // //     if (product?.sale?.tax_json?.length > 0) {
// // // //       const totalTax = product.sale.tax_json.reduce(
// // // //         (sum, tax) => sum + Number(tax.amount || 0),
// // // //         0
// // // //       );
// // // //       setProduct((prev) => ({
// // // //         ...prev,
// // // //         sale: {
// // // //           ...prev.sale,
// // // //           tax: totalTax,
// // // //         },
// // // //       }));
// // // //     }

// // // //     if (product?.purchase?.tax_json?.length > 0) {
// // // //       const totalTax = product.purchase.tax_json.reduce(
// // // //         (sum, tax) => sum + Number(tax.amount || 0),
// // // //         0
// // // //       );
// // // //       setProduct((prev) => ({
// // // //         ...prev,
// // // //         purchase: {
// // // //           ...prev.purchase,
// // // //           tax: totalTax,
// // // //         },
// // // //       }));
// // // //     }
// // // //   }, [product?.sale?.tax_json, product?.purchase?.tax_json]);

// // // //   useFocusEffect(
// // // //     React.useCallback(() => {
// // // //       const backAction = () => {
// // // //         if (formChanged) {
// // // //           Alert.alert(
// // // //             "Form Data Saved",
// // // //             isFromInvoice
// // // //               ? "Your data has been saved. Do you want to return to the product list?"
// // // //               : "Your entered data has been saved. You can continue editing later.",
// // // //             [
// // // //               { text: "Stay on Form", style: "cancel" },
// // // //               {
// // // //                 text: isFromInvoice ? "Back to List" : "Go Back",
// // // //                 onPress: () => {
// // // //                   if (isFromInvoice && handleCancel) {
// // // //                     handleCancel();
// // // //                   } else {
// // // //                     navigation.goBack();
// // // //                   }
// // // //                 },
// // // //               },
// // // //             ]
// // // //           );
// // // //           return true;
// // // //         } else if (isFromInvoice && handleCancel) {
// // // //           handleCancel();
// // // //           return true;
// // // //         }
// // // //         return false;
// // // //       };

// // // //       const backHandler = BackHandler.addEventListener(
// // // //         "hardwareBackPress",
// // // //         backAction
// // // //       );

// // // //       return () => backHandler.remove();
// // // //     }, [formChanged, navigation, isFromInvoice, handleCancel])
// // // //   );

// // // //   useEffect(() => {
// // // //     if (product?.interest_enabled) {
// // // //       const { interestAmount } = calculateInterest(product);
// // // //       handleInputChange("interest_amount", interestAmount.toString());
// // // //     }
// // // //   }, [
// // // //     product?.bill_date,
// // // //     product?.payment_date,
// // // //     product?.interest_start_date,
// // // //     product?.interest_rate,
// // // //     product?.interest_type?.value,
// // // //     product?.grace_period_enabled,
// // // //     product?.grace_period_days,
// // // //     product?.[product?.type]?.net_price,
// // // //   ]);

// // // //   useEffect(() => {
// // // //     if (updateData) {
// // // //       console.log('Received updateData:', updateData);

// // // //       const hsnName = productGroups.find((item) => item.id == updateData.hsn_id);

// // // //       const initialProductState = {
// // // //         ...defaultProductState,
// // // //         id: updateData.id,
// // // //         type: updateData.type || formType,
// // // //         name: updateData.name || "",
// // // //         huid: updateData.huid || "",
// // // //         hsn_id: hsnName ? { label: hsnName.name, value: hsnName.id } : null,
// // // //         size: updateData.size || "",
// // // //         remark: updateData.remark || "",
// // // //         comment: updateData.comment || "",
// // // //         image: updateData.image || "",
// // // //         additional_image: updateData.additional_image || null,
// // // //         cutting_enabled: updateData.cutting_enabled || false,
// // // //         interest_enabled: updateData.interest_enabled || false,
// // // //         interest_type: updateData.interest_type || { label: "Flat", value: "2" },
// // // //         interest_rate: updateData.interest_rate || "2",
// // // //         interest_amount: updateData.interest_amount || "0",
// // // //         bill_date: updateData.bill_date ? new Date(updateData.bill_date) : new Date(),
// // // //         payment_date: updateData.payment_date ? new Date(updateData.payment_date) : null,
// // // //         interest_start_date: updateData.interest_start_date ? new Date(updateData.interest_start_date) : null,
// // // //         grace_period_enabled: updateData.grace_period_enabled || false,
// // // //         grace_period_days: updateData.grace_period_days || "0",
// // // //         interest_notes: updateData.interest_notes || "",
// // // //         sale: {
// // // //           ...defaultProductState.sale,
// // // //           gross_weight: updateData.sale?.gross_weight || 0,
// // // //           less_weight: updateData.sale?.less_weight || 0,
// // // //           net_weight: updateData.sale?.net_weight || 0,
// // // //           wastage: updateData.sale?.wastage || 0,
// // // //           tounch: updateData.sale?.tounch || 0,
// // // //           fine_weight: updateData.sale?.fine_weight || 0,
// // // //           rate: updateData.sale?.rate || 0,
// // // //           making_type: updateData.sale?.making_type || "",
// // // //           making_charge: updateData.sale?.making_charge || 0,
// // // //           metal_value: updateData.sale?.metal_value || "0",
// // // //           charges_json: updateData.sale?.charges_json || [{}],
// // // //           tax_json: updateData.sale?.tax_json || [{}],
// // // //           custom_fields: updateData.sale?.custom_fields || [],
// // // //           ...updateData.sale?.bill_display_settings,
// // // //         },
// // // //         purchase: {
// // // //           ...defaultProductState.purchase,
// // // //           gross_weight: updateData.purchase?.gross_weight || 0,
// // // //           less_weight: updateData.purchase?.less_weight || 0,
// // // //           net_weight: updateData.purchase?.net_weight || 0,
// // // //           wastage: updateData.purchase?.wastage || 0,
// // // //           tounch: updateData.purchase?.tounch || 0,
// // // //           fine_weight: updateData.purchase?.fine_weight || 0,
// // // //           rate: updateData.purchase?.rate || 0,
// // // //           making_type: updateData.purchase?.making_type || "",
// // // //           making_charge: updateData.purchase?.making_charge || 0,
// // // //           metal_value: updateData.purchase?.metal_value || "0",
// // // //           charges_json: updateData.purchase?.charges_json || [{}],
// // // //           tax_json: updateData.purchase?.tax_json || [{}],
// // // //           custom_fields: updateData.purchase?.custom_fields || [],
// // // //           ...updateData.purchase?.bill_display_settings,
// // // //         },
// // // //       };

// // // //       console.log('Setting initial product state:', initialProductState);
// // // //       setProduct(initialProductState);
// // // //       setDataLoaded(true);
// // // //     } else {
// // // //       loadFormData();
// // // //     }
// // // //   }, [updateData, productGroups]);

// // // //   const handleUpdate = async () => {
// // // //     try {
// // // //       if (!product.name) {
// // // //         ShowToast("Product name is required");
// // // //         return;
// // // //       }

// // // //       setLoading(true);

// // // //       const productId = updateData?.id || route?.params?.id;
// // // //       if (!productId) {
// // // //         throw new Error("Product ID is required for update");
// // // //       }

// // // //       const formData = new FormData();

// // // //       formData.append('id', String(productId));
// // // //       formData.append('name', product.name || '');
// // // //       formData.append('huid', product.huid || '');
// // // //       formData.append('hsn_id', product.hsn_id?.value || '');
// // // //       formData.append('comment', product.comment || '');

// // // //       if (product.image && typeof product.image === 'object' && product.image.uri) {
// // // //         formData.append('image', {
// // // //           uri: Platform.OS === 'ios' ? product.image.uri.replace('file://', '') : product.image.uri,
// // // //           type: 'image/jpeg',
// // // //           name: `product_${productId}_${Date.now()}.jpg`,
// // // //         });
// // // //       }

// // // //       if (product.sale) {
// // // //         formData.append('sale_gross_weight', String(product.sale.gross_weight || '0'));
// // // //         formData.append('sale_less_weight', String(product.sale.less_weight || '0'));
// // // //         formData.append('sale_net_weight', String(product.sale.net_weight || '0'));
// // // //         formData.append('sale_wastage', String(product.sale.wastage || '0'));
// // // //         formData.append('sale_tounch', String(product.sale.tounch || '0'));
// // // //         formData.append('sale_fine_weight', String(product.sale.fine_weight || '0'));
// // // //         formData.append('sale_rate', String((typeof product.sale.rate === 'object' ? product.sale.rate?.price : product.sale.rate) || '0'));
// // // //         formData.append('sale_making_type', product.sale.making_type?.value || 'PG');
// // // //         formData.append('sale_making_charges', String(product.sale.making_charge || '0'));
// // // //         formData.append('sale_net_price', String(product.sale.net_price || '0'));
// // // //         formData.append('sale_charges_json', JSON.stringify(product.sale.charges_json || []));
// // // //         formData.append('sale_tax_json', JSON.stringify(product.sale.tax_json || []));
// // // //       }

// // // //       if (product.purchase) {
// // // //         formData.append('purchase_gross_weight', String(product.purchase.gross_weight || '0'));
// // // //         formData.append('purchase_less_weight', String(product.purchase.less_weight || '0'));
// // // //         formData.append('purchase_net_weight', String(product.purchase.net_weight || '0'));
// // // //         formData.append('purchase_wastage', String(product.purchase.wastage || '0'));
// // // //         formData.append('purchase_tounch', String(product.purchase.tounch || '0'));
// // // //         formData.append('purchase_fine_weight', String(product.purchase.fine_weight || '0'));
// // // //         formData.append('purchase_rate', String((typeof product.purchase.rate === 'object' ? product.purchase.rate?.price : product.purchase.rate) || '0'));
// // // //         formData.append('purchase_making_type', product.purchase.making_type?.value || 'PG');
// // // //         formData.append('purchase_making_charges', String(product.purchase.making_charge || '0'));
// // // //         formData.append('purchase_net_price', String(product.purchase.net_price || '0'));
// // // //         formData.append('purchase_charges_json', JSON.stringify(product.purchase.charges_json || []));
// // // //         formData.append('purchase_tax_json', JSON.stringify(product.purchase.tax_json || []));
// // // //       }

// // // //       const response = await ApiRequest({
// // // //         url: MANAGE_PRODUCT_API.update,
// // // //         method: 'POST',
// // // //         body: formData,
// // // //         headers: {
// // // //           'Content-Type': 'multipart/form-data',
// // // //         },
// // // //       });

// // // //       if (!response?.success) {
// // // //         console.log('Update API Error Response:', response);
// // // //         throw new Error(response?.message || response?.error || "Failed to update product");
// // // //       }

// // // //       try {
// // // //         await ApiRequest({
// // // //           url: MANAGE_LOGS_API.create,
// // // //           method: 'POST',
// // // //           body: {
// // // //             userName: profileData?.name || 'Unknown User',
// // // //             productName: product.name,
// // // //             id: productId,
// // // //             type: 'product',
// // // //             amount: parseFloat(product[product.type]?.net_price || 0).toFixed(2),
// // // //             action: 'UPDATE',
// // // //             entityType: 'PRODUCT',
// // // //             timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
// // // //             metadata: JSON.stringify({
// // // //               action: 'Updated product',
// // // //               productId: productId,
// // // //               note: `Updated product: ${product.name}`,
// // // //             }),
// // // //           },
// // // //         });
// // // //       } catch (logError) {
// // // //         console.error("Failed to create update log:", logError);
// // // //       }

// // // //       await AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY);
// // // //       ShowToast(response.message || "Product updated successfully");
// // // //       navigation.goBack();
// // // //     } catch (error) {
// // // //       console.error('Update error details:', error);
// // // //       ShowToast(error.message || "Error updating product. Please try again.");
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   useEffect(() => {
// // // //     dispatch(fetchProductList());
// // // //   }, []);

// // // //   const handleProductSelect = (selectedProduct) => {
// // // //     setProduct((prev) => ({
// // // //       ...prev,
// // // //       ...selectedProduct,
// // // //       name: selectedProduct.name,
// // // //       huid: selectedProduct.huid,
// // // //       hsn_id: selectedProduct.hsn_id,
// // // //       image: selectedProduct.image_url,
// // // //       type: selectedProduct.type || prev.type,
// // // //     }));
// // // //     setShowSuggestions(false);
// // // //   };

// // // //   return (
// // // //     <Fragment>
// // // //       <KeyboardHanlder>
// // // //         <View className="pt-4">
// // // //           <View className="px-4">
// // // //             {isFromInvoice ? (
// // // //               <SearchProduct
// // // //                 productValue={product}
// // // //                 setProductValue={setProduct}
// // // //                 handleProductDetail={handleProductDetail}
// // // //               />
// // // //             ) : (
// // // //               <View className="flex mb-4 flex-row">
// // // //                 <ImagePickerComponent
// // // //                   onChange={({ value, name }) => handleInputChange(name, value)}
// // // //                   value={product?.image}
// // // //                   name="image"
// // // //                 />
// // // //                 <View className="w-5/6 pl-3">
// // // //                   <View className="relative">
// // // //                     <InputBox
// // // //                       name="name"
// // // //                       label="Name"
// // // //                       value={product?.name}
// // // //                       onChange={({ value, name }) => handleInputChange(name, value)}
// // // //                       error={errors?.name}
// // // //                     />
// // // //                     {validator.message("name", product?.name, "required")}
// // // //                     {showSuggestions && filteredProducts.length > 0 && (
// // // //                       <View className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-40">
// // // //                         <FlatList
// // // //                           data={filteredProducts}
// // // //                           keyExtractor={(item) => item.id}
// // // //                           renderItem={({ item }) => (
// // // //                             <TouchableOpacity
// // // //                               className="p-3 border-b border-gray-100"
// // // //                               onPress={() => handleProductSelect(item)}
// // // //                             >
// // // //                               <Text className="text-gray-800">{item.name}</Text>
// // // //                               {item.huid && (
// // // //                                 <Text className="text-xs text-gray-500">HUID: {item.huid}</Text>
// // // //                               )}
// // // //                             </TouchableOpacity>
// // // //                           )}
// // // //                         />
// // // //                       </View>
// // // //                     )}
// // // //                   </View>
// // // //                 </View>
// // // //               </View>
// // // //             )}

// // // //             <View className="mb-4">
// // // //               <InputBox
// // // //                 name="remark"
// // // //                 label="Remark"
// // // //                 multiLine={true}
// // // //                 value={product?.remark}
// // // //                 onChange={({ value, name }) => handleInputChange(name, value)}
// // // //                 placeholder="Add a remark about this item..."
// // // //               />
// // // //             </View>

// // // //             <View className="mb-4">
// // // //               <Text className="text-sm font-medium mb-1">Item Photo</Text>
// // // //               <ImagePickerComponent
// // // //                 name="image"
// // // //                 value={product?.image || null}
// // // //                 onChange={({ value, name }) => {
// // // //                   const safeValue = value ? {
// // // //                     uri: value.uri || null,
// // // //                     fileName: value.fileName || null,
// // // //                     mimeType: value.mimeType || 'image/jpeg',
// // // //                   } : null;
// // // //                   handleInputChange(name, safeValue);
// // // //                 }}
// // // //               />
// // // //               <Text className="text-xs text-gray-500 mt-1">Upload a photo of the item</Text>
// // // //             </View>

// // // //             <View className="mb-4">
// // // //               <InputBox
// // // //                 name="size"
// // // //                 label="Size"
// // // //                 value={product?.size}
// // // //                 placeholder="e.g., 7, 8.5, Medium, 16mm"
// // // //                 onChange={({ value, name }) => handleInputChange(name, value)}
// // // //               />
// // // //               <View className="flex flex-row items-center justify-between mt-1">
// // // //                 <Text className="text-xs text-gray-500">Enter ring size, bangle diameter, etc.</Text>
// // // //                 <Switch
// // // //                   value={product?.[product.type]?.showSizeInBill || false}
// // // //                   onValueChange={(value) => handleInputChange("showSizeInBill", value, product.type)}
// // // //                   trackColor={{ false: "red", true: "green" }}
// // // //                   thumbColor={product?.[product.type]?.showSizeInBill ? "#ffffff" : "#f4f3f4"}
// // // //                 />
// // // //               </View>
// // // //             </View>

// // // //             <View className="mb-4">
// // // //               <InputBox
// // // //                 multiLine={true}
// // // //                 name="comment"
// // // //                 label="Comment"
// // // //                 value={product?.comment}
// // // //                 onChange={({ value, name }) => handleInputChange(name, value)}
// // // //               />
// // // //               <View className="flex flex-row items-center justify-between mt-1">
// // // //                 <Text className="text-xs text-gray-500"></Text>
// // // //                 <Switch
// // // //                   value={product?.[product.type]?.showCommentInBill || false}
// // // //                   onValueChange={(value) => handleInputChange("showCommentInBill", value, product.type)}
// // // //                   trackColor={{ false: "red", true: "green" }}
// // // //                   thumbColor={product?.[product.type]?.showCommentInBill ? "#ffffff" : "#f4f3f4"}
// // // //                 />
// // // //               </View>
// // // //             </View>

// // // //             <View className="flex mb-4 flex-row">
// // // //               {productTypes.map((type) => (
// // // //                 <View key={type} className={`w-1/2`}>
// // // //                   <TouchableOpacity
// // // //                     className={`
// // // //                       py-2 
// // // //                       ${type === "sale" ? "ml-1.5" : "mr-1.5"}
// // // //                       border border-primary 
// // // //                       rounded-md 
// // // //                       flex flex-row 
// // // //                       justify-center 
// // // //                       items-center 
// // // //                       shadow-xl
// // // //                       ${product?.type === type ? "bg-primary" : "bg-white"}
// // // //                       relative
// // // //                       ${isFromInvoice ? "opacity-75" : ""}
// // // //                     `}
// // // //                     onPress={() => handleProductTypeChange(type)}
// // // //                     disabled={isFromInvoice}
// // // //                   >
// // // //                     <Text
// // // //                       className={`${
// // // //                         product?.type === type ? "text-white" : "text-primary"
// // // //                       } tracking-wider capitalize font-medium`}
// // // //                     >
// // // //                       {type.charAt(0).toUpperCase() + type.slice(1)}
// // // //                     </Text>
// // // //                     {product?.type === type && (
// // // //                       <View className="absolute right-2">
// // // //                         <AntDesign
// // // //                           name="checkcircle"
// // // //                           size={16}
// // // //                           color="white"
// // // //                         />
// // // //                       </View>
// // // //                     )}
// // // //                   </TouchableOpacity>
// // // //                 </View>
// // // //               ))}
// // // //             </View>

// // // //             <View className="mb-4 flex flex-row">
// // // //               <View className="w-2/5 pr-1.5">
// // // //                 <InputBox
// // // //                   name="huid"
// // // //                   label="HUID"
// // // //                   value={product?.huid}
// // // //                   onChange={({ value, name }) => handleInputChange(name, value)}
// // // //                   keyboardType="default"
// // // //                 />
// // // //                 <View className="flex flex-row items-center justify-between mt-1">
// // // //                   <Text className="text-xs text-gray-500"></Text>
// // // //                   <Switch
// // // //                     value={product?.[product.type]?.showHuidInBill || false}
// // // //                     onValueChange={(value) => handleInputChange("showHuidInBill", value, product.type)}
// // // //                     trackColor={{ false: "red", true: "green" }}
// // // //                     thumbColor={product?.[product.type]?.showHuidInBill ? "#ffffff" : "#f4f3f4"}
// // // //                   />
// // // //                 </View>
// // // //               </View>
// // // //               <View className="w-3/5 flex items-start flex-row pl-1.5">
// // // //                 <View className="w-full pr-2">
// // // //                   <SelectInput
// // // //                     label="HSN Name"
// // // //                     name="hsn_id"
// // // //                     value={product?.hsn_id}
// // // //                     placeholder="Select"
// // // //                     error={errors?.hsn_id}
// // // //                     data={productGroups.map((item) => ({
// // // //                       label: item.name,
// // // //                       value: item.id,
// // // //                       variation: item.variation_data,
// // // //                     }))}
// // // //                     onSelect={(value) => handleInputChange("hsn_id", value)}
// // // //                   />
// // // //                   {validator.message("hsn_id", product?.hsn_id, "required")}
// // // //                   <View className="flex flex-row items-center justify-between mt-1">
// // // //                     <Text className="text-xs text-gray-500"></Text>
// // // //                     <Switch
// // // //                       value={product?.[product.type]?.showHsnInBill || false}
// // // //                       onValueChange={(value) => handleInputChange("showHsnInBill", value, product.type)}
// // // //                       trackColor={{ false: "red", true: "green" }}
// // // //                       thumbColor={product?.[product.type]?.showHsnInBill ? "#ffffff" : "#f4f3f4"}
// // // //                     />
// // // //                   </View>
// // // //                 </View>
// // // //                 {!isFromInvoice && (
// // // //                   <TouchableOpacity
// // // //                     onPress={() => handleInitialState("metalModal", true)}
// // // //                     activeOpacity={0.7}
// // // //                     className="bg-primary w-8 h-8 mt-6 flex justify-center items-center rounded-full shadow-xl"
// // // //                   >
// // // //                     <FontAwesome6 name="plus" size={17} color="white" />
// // // //                   </TouchableOpacity>
// // // //                 )}
// // // //               </View>
// // // //             </View>
// // // //           </View>

// // // //           <View className="px-4 mb-4">
// // // //             <View className="bg-gray-50 rounded-lg p-4">
// // // //               <View className="flex-row items-center justify-between mb-4">
// // // //                 <Text className="text-lg font-semibold">Interest Configuration</Text>
// // // //                 <Switch
// // // //                   value={product?.interest_enabled}
// // // //                   onValueChange={(value) => handleInputChange("interest_enabled", value)}
// // // //                   trackColor={{ false: "#767577", true: "#22c55e" }}
// // // //                   thumbColor={product?.interest_enabled ? "#ffffff" : "#f4f3f4"}
// // // //                 />
// // // //               </View>

// // // //               {product?.interest_enabled && (
// // // //                 <>
// // // //                   <View className="mb-4">
// // // //                     <Text className="text-base font-medium mb-2">Important Dates</Text>
// // // //                     <View className="space-y-3">
// // // //                       <TouchableOpacity
// // // //                         onPress={() => handleInitialState("billDatePicker", true)}
// // // //                         className="border border-gray-300 rounded-md p-3"
// // // //                       >
// // // //                         <Text className="text-sm text-gray-500">Bill Date</Text>
// // // //                         <Text className="text-base">
// // // //                           {product?.bill_date ? moment(product.bill_date).format("DD MMM YYYY") : "Select Date"}
// // // //                         </Text>
// // // //                       </TouchableOpacity>
// // // //                       <TouchableOpacity
// // // //                         onPress={() => handleInitialState("paymentDatePicker", true)}
// // // //                         className="border border-gray-300 rounded-md p-3"
// // // //                       >
// // // //                         <Text className="text-sm text-gray-500">Expected Payment Date</Text>
// // // //                         <Text className="text-base">
// // // //                           {product?.payment_date ? moment(product.payment_date).format("DD MMM YYYY") : "Select Date"}
// // // //                         </Text>
// // // //                       </TouchableOpacity>
// // // //                       <TouchableOpacity
// // // //                         onPress={() => handleInitialState("interestStartDatePicker", true)}
// // // //                         className="border border-gray-300 rounded-md p-3"
// // // //                       >
// // // //                         <Text className="text-sm text-gray-500">Interest Start Date</Text>
// // // //                         <Text className="text-base">
// // // //                           {product?.interest_start_date ? moment(product.interest_start_date).format("DD MMM YYYY") : "Select Date"}
// // // //                         </Text>
// // // //                       </TouchableOpacity>
// // // //                     </View>
// // // //                   </View>
// // // //                   <View className="mb-4">
// // // //                     <Text className="text-base font-medium mb-2">Interest Details</Text>
// // // //                     <View className="space-y-3">
// // // //                       <SelectInput
// // // //                         label="Interest Type"
// // // //                         name="interest_type"
// // // //                         value={product?.interest_type}
// // // //                         placeholder="Select Type"
// // // //                         data={[
// // // //                           { label: "Flat", value: "2" },
// // // //                           { label: "Compound", value: "1" },
// // // //                         ]}
// // // //                         onSelect={(value) => handleInputChange("interest_type", value)}
// // // //                       />
// // // //                       <InputBox
// // // //                         name="interest_rate"
// // // //                         label="Interest Rate (%)"
// // // //                         value={product?.interest_rate}
// // // //                         keyboardType="numeric"
// // // //                         onChange={({ value }) => handleInputChange("interest_rate", value)}
// // // //                       />
// // // //                     </View>
// // // //                   </View>
// // // //                   <View className="mb-4">
// // // //                     <View className="flex-row items-center justify-between mb-2">
// // // //                       <Text className="text-base font-medium">Grace Period</Text>
// // // //                       <Switch
// // // //                         value={product?.grace_period_enabled}
// // // //                         onValueChange={(value) => handleInputChange("grace_period_enabled", value)}
// // // //                         trackColor={{ false: "#767577", true: "#22c55e" }}
// // // //                         thumbColor={product?.grace_period_enabled ? "#ffffff" : "#f4f3f4"}
// // // //                       />
// // // //                     </View>
// // // //                     {product?.grace_period_enabled && (
// // // //                       <InputBox
// // // //                         name="grace_period_days"
// // // //                         label="Grace Period (Days)"
// // // //                         value={product?.grace_period_days}
// // // //                         keyboardType="numeric"
// // // //                         onChange={({ value }) => handleInputChange("grace_period_days", value)}
// // // //                       />
// // // //                     )}
// // // //                   </View>
// // // //                   <View className="mb-4">
// // // //                     <InputBox
// // // //                       name="interest_notes"
// // // //                       label="Interest Notes"
// // // //                       value={product?.interest_notes}
// // // //                       multiLine={true}
// // // //                       numberOfLines={3}
// // // //                       onChange={({ value }) => handleInputChange("interest_notes", value)}
// // // //                       placeholder="Add any special notes about interest terms..."
// // // //                     />
// // // //                   </View>
// // // //                   <View className="bg-white rounded-lg p-3 mb-4">
// // // //                     <Text className="text-base font-medium mb-2">Interest Summary</Text>
// // // //                     <View className="space-y-2">
// // // //                       <View className="flex-row justify-between">
// // // //                         <Text className="text-gray-600">Original Amount:</Text>
// // // //                         <Text>₹{handleDigitsFix(product?.[product.type]?.net_price || 0)}</Text>
// // // //                       </View>
// // // //                       <View className="flex-row justify-between">
// // // //                         <Text className="text-gray-600">Interest Period:</Text>
// // // //                         <Text>{calculateInterestPeriod(product)} days</Text>
// // // //                       </View>
// // // //                       <View className="flex-row justify-between">
// // // //                         <Text className="text-gray-600">Interest Amount:</Text>
// // // //                         <Text>₹{handleDigitsFix(Number(product?.interest_amount || 0))}</Text>
// // // //                       </View>
// // // //                       <View className="flex-row justify-between pt-2 border-t border-gray-200">
// // // //                         <Text className="font-medium">Total Amount:</Text>
// // // //                         <Text className="font-medium">₹{handleDigitsFix(
// // // //                           Number(product?.[product.type]?.net_price || 0) +
// // // //                           Number(product?.interest_amount || 0)
// // // //                         )}</Text>
// // // //                       </View>
// // // //                     </View>
// // // //                   </View>
// // // //                 </>
// // // //               )}
// // // //             </View>
// // // //           </View>

// // // //           {productTypes.map((category) => {
// // // //             const isPurchase = category === "purchase";
// // // //             return (
// // // //               product?.type === category && (
// // // //                 <View
// // // //                   className="bg-slate-50 shadow-lg px-4 pt-4"
// // // //                   key={category}
// // // //                 >
// // // //                   <View className="mb-4 flex flex-row">
// // // //                     <View className="w-1/5 pr-1">
// // // //                       <InputBox
// // // //                         name="gross_weight"
// // // //                         placeholder="0"
// // // //                         label="Gross Wt"
// // // //                         value={String(product?.[category]?.gross_weight || '')}
// // // //                         onChange={({ value, name }) =>
// // // //                           handleInputChange(name, value, category)
// // // //                         }
// // // //                         keyboardType="numeric"
// // // //                       />
// // // //                       <View className="flex flex-row items-center justify-between mt-1">
// // // //                         <Text className="text-xs text-gray-500"></Text>
// // // //                         <Switch
// // // //                           value={product?.[category]?.showGrossWeightInBill || false}
// // // //                           onValueChange={(value) => handleInputChange("showGrossWeightInBill", value, category)}
// // // //                           trackColor={{ false: "red", true: "green" }}
// // // //                           thumbColor={product?.[category]?.showGrossWeightInBill ? "#ffffff" : "#f4f3f4"}
// // // //                         />
// // // //                       </View>
// // // //                     </View>
// // // //                     <View className="w-1/5 px-1">
// // // //                       <InputBox
// // // //                         name="less_weight"
// // // //                         placeholder="0"
// // // //                         label="Less Wt"
// // // //                         value={String(product?.[category]?.less_weight || '')}
// // // //                         onChange={({ value, name }) =>
// // // //                           handleInputChange(name, value, category)
// // // //                         }
// // // //                         keyboardType="numeric"
// // // //                       />
// // // //                       <View className="flex flex-row items-center justify-between mt-1">
// // // //                         <Text className="text-xs text-gray-500"></Text>
// // // //                         <Switch
// // // //                           value={product?.[category]?.showLessWeightInBill || false}
// // // //                           onValueChange={(value) => handleInputChange("showLessWeightInBill", value, category)}
// // // //                           trackColor={{ false: "red", true: "green" }}
// // // //                           thumbColor={product?.[category]?.showLessWeightInBill ? "#ffffff" : "#f4f3f4"}
// // // //                         />
// // // //                       </View>
// // // //                     </View>
// // // //                     <View className="w-1/5 px-1">
// // // //                       <InputBox
// // // //                         name="net_weight"
// // // //                         placeholder="0"
// // // //                         label="Net Wt"
// // // //                         readOnly={true}
// // // //                         value={String(product?.[category]?.net_weight || '')}
// // // //                         onChange={({ value, name }) =>
// // // //                           handleInputChange(name, value, category)
// // // //                         }
// // // //                         keyboardType="numeric"
// // // //                       />
// // // //                       <View className="flex flex-row items-center justify-between mt-1">
// // // //                         <Text className="text-xs text-gray-500"></Text>
// // // //                         <Switch
// // // //                           value={product?.[category]?.showNetWeightInBill || false}
// // // //                           onValueChange={(value) => handleInputChange("showNetWeightInBill", value, category)}
// // // //                           trackColor={{ false: "red", true: "green" }}
// // // //                           thumbColor={product?.[category]?.showNetWeightInBill ? "#ffffff" : "#f4f3f4"}
// // // //                         />
// // // //                       </View>
// // // //                     </View>
// // // //                     <View
// // // //                       className={`w-2/5 ${isPurchase ? "flex-row-reverse" : "flex-row"} flex`}
// // // //                     >
// // // //                       <View
// // // //                         className={`w-1/2 ${isPurchase ? "pl-0.5" : "pr-1 pl-0.5"}`}
// // // //                       >
// // // //                         <InputBox
// // // //                           name="tounch"
// // // //                           placeholder="0 %"
// // // //                           label="Tounch"
// // // //                           value={String(product?.[category]?.tounch || '')}
// // // //                           onChange={({ value, name }) =>
// // // //                             handleInputChange(name, value, category)
// // // //                           }
// // // //                           keyboardType="numeric"
// // // //                         />
// // // //                         <View className="flex flex-row items-center justify-between mt-1">
// // // //                           <Text className="text-xs text-gray-500"></Text>
// // // //                           <Switch
// // // //                             value={product?.[category]?.showTounchInBill || false}
// // // //                             onValueChange={(value) => handleInputChange("showTounchInBill", value, category)}
// // // //                             trackColor={{ false: "red", true: "green" }}
// // // //                             thumbColor={product?.[category]?.showTounchInBill ? "#ffffff" : "#f4f3f4"}
// // // //                           />
// // // //                         </View>
// // // //                       </View>
// // // //                       <View
// // // //                         className={`w-1/2 ${isPurchase ? "pr-1 pl-0.5" : "pl-0.5"}`}
// // // //                       >
// // // //                         <InputBox
// // // //                           name="wastage"
// // // //                           placeholder="0 %"
// // // //                           label="Wastage"
// // // //                           value={String(product?.[category]?.wastage || '')}
// // // //                           onChange={({ value, name }) =>
// // // //                             handleInputChange(name, value, category)
// // // //                           }
// // // //                           keyboardType="numeric"
// // // //                         />
// // // //                         <View className="flex flex-row items-center justify-between mt-1">
// // // //                           <Text className="text-xs text-gray-500"></Text>
// // // //                           <Switch
// // // //                             value={product?.[category]?.showWastageInBill || false}
// // // //                             onValueChange={(value) => handleInputChange("showWastageInBill", value, category)}
// // // //                             trackColor={{ false: "red", true: "green" }}
// // // //                             thumbColor={product?.[category]?.showWastageInBill ? "#ffffff" : "#f4f3f4"}
// // // //                           />
// // // //                         </View>
// // // //                       </View>
// // // //                     </View>
// // // //                   </View>

// // // //                   <View className="mb-4 flex flex-row">
// // // //                     <View className="w-1/3 pr-1">
// // // //                       <InputBox
// // // //                         name="fine_weight"
// // // //                         label="Fine Weight"
// // // //                         placeholder="0"
// // // //                         readOnly={true}
// // // //                         value={String(product?.[category]?.fine_weight || '')}
// // // //                         onChange={({ value }) => handleInputChange("fine_weight", value, category)}
// // // //                         keyboardType="numeric"
// // // //                       />
// // // //                       <View className="flex flex-row items-center justify-between mt-1">
// // // //                         <Text className="text-xs text-gray-500"></Text>
// // // //                         <Switch
// // // //                           value={product?.[category]?.showFineWeightInBill || false}
// // // //                           onValueChange={(value) => handleInputChange("showFineWeightInBill", value, category)}
// // // //                           trackColor={{ false: "red", true: "green" }}
// // // //                           thumbColor={product?.[category]?.showFineWeightInBill ? "#ffffff" : "#f4f3f4"}
// // // //                         />
// // // //                       </View>
// // // //                     </View>
// // // //                     <View className="w-1/3 px-1">
// // // //                       <Text className="text-slate-500 text-[13px] mb-1">Cutting</Text>
// // // //                       <View className="bg-gray-100 rounded-lg">
// // // //                         <CommonButton
// // // //                           title={product.cutting_enabled ? "ON" : "OFF"}
// // // //                           onPress={() => {
// // // //                             const currentType = product.type;
// // // //                             const buttonRate = isSelectRate
// // // //                               ? parseFloat(product[currentType]?.rate?.price) || 0
// // // //                               : parseFloat(product[currentType]?.rate) || 0;
// // // //                             const buttonFineWeight = parseFloat(product[currentType]?.fine_weight) || 0;
// // // //                             const buttonMetalValue = !product.cutting_enabled ? (buttonFineWeight * buttonRate).toFixed(2) : "0";

// // // //                             setProduct((prev) => ({
// // // //                               ...prev,
// // // //                               cutting_enabled: !prev.cutting_enabled,
// // // //                               [currentType]: {
// // // //                                 ...prev[currentType],
// // // //                                 metal_value: buttonMetalValue,
// // // //                               },
// // // //                             }));
// // // //                           }}
// // // //                           isFilled={product.cutting_enabled}
// // // //                           small
// // // //                         />
// // // //                       </View>
// // // //                     </View>
// // // //                     <View className="w-1/3 pl-1">
// // // //                       <InputBox
// // // //                         name="rate"
// // // //                         label="Rate"
// // // //                         placeholder="0"
// // // //                             // readOnly={true}

// // // //                         value={isSelectRate ? String(product?.[category]?.rate?.price || '') : String(product?.[category]?.rate || '')}
// // // //                         readOnly={isSelectRate}
// // // //                         onChange={({ value }) => handleInputChange("rate", value, category)}
// // // //                         keyboardType="numeric"
// // // //                       />
// // // //                       <View className="flex flex-row items-center justify-between mt-1">
// // // //                         <Text className="text-xs text-gray-500"></Text>
// // // //                         <Switch
// // // //                           value={product?.[category]?.showRateInBill || false}
// // // //                           onValueChange={(value) => handleInputChange("showRateInBill", value, category)}
// // // //                           trackColor={{ false: "red", true: "green" }}
// // // //                           thumbColor={product?.[category]?.showRateInBill ? "#ffffff" : "#f4f3f4"}
// // // //                         />
// // // //                       </View>
// // // //                     </View>
// // // //                   </View>

// // // //                   <View className="mb-4 flex flex-row">
// // // //                     <View className="w-1/2 pr-1">
// // // //                       <SelectInput
// // // //                         label="Making Type"
// // // //                         name="making_type"
// // // //                         value={product?.[category]?.making_type}
// // // //                         placeholder="Select"
// // // //                         data={[
// // // //                           { label: "Per Gram (PG)", value: "PG" },
// // // //                           { label: "Per Piece (PP)", value: "PP" },
// // // //                         ]}
// // // //                         onSelect={(value) => handleInputChange("making_type", value, category)}
// // // //                       />
// // // //                     </View>
// // // //                     <View className="w-1/2 pl-1">
// // // //                       <InputBox
// // // //                         name="making_charge"
// // // //                         label="Making Charge"
// // // //                         placeholder="0"
// // // //                         value={String(product?.[category]?.making_charge || '')}
// // // //                         onChange={({ value }) => handleInputChange("making_charge", value, category)}
// // // //                         keyboardType="numeric"
// // // //                       />
// // // //                     </View>
// // // //                   </View>

// // // //                   <View className="mb-4 flex flex-row">
// // // //                     <View className="w-full">
// // // //                       <InputBox
// // // //                         name="net_price"
// // // //                         readOnly={true}
// // // //                         label="Net Price"
// // // //                         placeholder="0"
// // // //                         value={handleDigitsFix(
// // // //                           (
// // // //                             (Number(product?.[category]?.fine_weight || 0) *
// // // //                               Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0)) +
// // // //                             (product?.[category]?.making_type?.value === "PG"
// // // //                               ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // //                               : Number(product?.[category]?.making_charge || 0)) +
// // // //                             ((product[category]?.charges_json || []).reduce((sum, charge) =>
// // // //                               sum + Number(charge.amount || 0), 0))
// // // //                           ) +
// // // //                           (
// // // //                             (
// // // //                               (Number(product?.[category]?.fine_weight || 0) *
// // // //                                 Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0)) +
// // // //                               (product?.[category]?.making_type?.value === "PG"
// // // //                                 ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // //                                 : Number(product?.[category]?.making_charge || 0)) +
// // // //                               ((product[category]?.charges_json || []).reduce((sum, charge) =>
// // // //                                 sum + Number(charge.amount || 0), 0))
// // // //                             ) * (Number(product?.[category]?.tax || 0) / 100)
// // // //                           )
// // // //                         )}
// // // //                         keyboardType="numeric"
// // // //                       />
// // // //                       <View className="flex flex-row items-center justify-between mt-1">
// // // //                         <Text className="text-xs text-gray-500"></Text>
// // // //                         <Switch
// // // //                           value={product?.[category]?.showNetPriceInBill || false}
// // // //                           onValueChange={(value) => handleInputChange("showNetPriceInBill", value, category)}
// // // //                           trackColor={{ false: "red", true: "green" }}
// // // //                           thumbColor={product?.[category]?.showNetPriceInBill ? "#ffffff" : "#f4f3f4"}
// // // //                         />
// // // //                       </View>
// // // //                     </View>
// // // //                   </View>

// // // //                   <View className="mb-4 flex flex-row items-center bg-gray-50 px-3 py-2 rounded-lg">
// // // //                     <Text className="text-gray-600">Show Price in Bill</Text>
// // // //                     <Switch
// // // //                       value={product?.[category]?.showPriceInBill ?? false}
// // // //                       onValueChange={(value) => handleInputChange("showPriceInBill", value, category)}
// // // //                       trackColor={{ false: "#767577", true: "green" }}
// // // //                       thumbColor={product?.[category]?.showPriceInBill ? "#ffffff" : "#f4f3f4"}
// // // //                     />
// // // //                   </View>

// // // //                   {product?.[category]?.showPriceInBill ? (
// // // //                     <View className="mb-4 bg-gray-50 p-4 rounded-lg">
// // // //                       <Text className="text-base font-semibold mb-3">Calculation Summary</Text>
// // // //                       <View className="space-y-2">
// // // //                         <View className="flex flex-row justify-between">
// // // //                           <Text className="text-gray-600">Net Weight:</Text>
// // // //                           <Text>{product?.[category]?.net_weight || 0} g</Text>
// // // //                         </View>
// // // //                         <View className="flex flex-row justify-between items-center">
// // // //                           <Text className="text-gray-600">Fine Weight:</Text>
// // // //                           <View className="flex flex-row items-center">
// // // //                             <Text className="text-gray-500 text-sm mr-2">
// // // //                               ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × ({Number(product?.[category]?.tounch || 0)}% + {Number(product?.[category]?.wastage || 0)}%))
// // // //                             </Text>
// // // //                             <Text className="font-medium">{handleDigitsFix(product?.[category]?.fine_weight || 0)} g</Text>
// // // //                           </View>
// // // //                         </View>
// // // //                         <View className="flex flex-row justify-between items-center">
// // // //                           <Text className="text-gray-600">Wastage Weight:</Text>
// // // //                           <View className="flex flex-row items-center">
// // // //                             <Text className="text-gray-500 text-sm mr-2">
// // // //                               ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × {Number(product?.[category]?.wastage || 0)}%)
// // // //                             </Text>
// // // //                             <Text className="font-medium">{handleDigitsFix(
// // // //                               Number(product?.[category]?.gross_weight || 0) *
// // // //                               (Number(product?.[category]?.wastage || 0) / 100)
// // // //                             )} g</Text>
// // // //                           </View>
// // // //                         </View>
// // // //                         <View className="flex flex-row justify-between items-center">
// // // //                           <Text className="text-gray-600">Total Weight with Wastage:</Text>
// // // //                           <View className="flex flex-row items-center">
// // // //                             <Text className="text-gray-500 text-sm mr-2">
// // // //                               ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × (100% + {Number(product?.[category]?.wastage || 0)}%))
// // // //                             </Text>
// // // //                             <Text className="font-medium">{handleDigitsFix(
// // // //                               Number(product?.[category]?.gross_weight || 0) *
// // // //                               (1 + (Number(product?.[category]?.wastage || 0) / 100))
// // // //                             )} g</Text>
// // // //                           </View>
// // // //                         </View>
// // // //                         <View className="flex flex-row justify-between items-center">
// // // //                           <Text className="text-gray-600">Wastage Value:</Text>
// // // //                           <View className="flex flex-row items-center">
// // // //                             <Text className="text-gray-500 text-sm mr-2">
// // // //                               ({handleDigitsFix(
// // // //                                 Number(product?.[category]?.gross_weight || 0) *
// // // //                                 (Number(product?.[category]?.wastage || 0) / 100)
// // // //                               )} × ({Number(product?.[category]?.tounch || 0)}% × ₹{handleDigitsFix(isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0}))
// // // //                             </Text>
// // // //                             <Text className="font-medium">₹{handleDigitsFix(
// // // //                               (Number(product?.[category]?.gross_weight || 0) *
// // // //                               (Number(product?.[category]?.wastage || 0) / 100)) *
// // // //                               ((Number(product?.[category]?.tounch || 0) / 100) *
// // // //                               Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // // //                             )}</Text>
// // // //                           </View>
// // // //                         </View>
// // // //                         <View className="flex flex-row justify-between items-center">
// // // //                           <Text className="text-gray-600">Metal Value:</Text>
// // // //                           <View className="flex flex-row items-center">
// // // //                             {product.cutting_enabled ? (
// // // //                               <>
// // // //                                 <Text className="text-gray-500 text-sm mr-2">
// // // //                                   ({handleDigitsFix(product?.[category]?.fine_weight || 0)} × ₹{handleDigitsFix(isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0})
// // // //                                 </Text>
// // // //                                 <Text className="font-medium">₹{handleDigitsFix(
// // // //                                   Number(product?.[category]?.fine_weight || 0) *
// // // //                                   Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0)
// // // //                                 )}</Text>
// // // //                               </>
// // // //                             ) : (
// // // //                               <Text className="font-medium">₹0.00 (Cutting OFF)</Text>
// // // //                             )}
// // // //                           </View>
// // // //                         </View>
// // // //                         <View className="flex flex-row justify-between items-center">
// // // //                           <Text className="text-gray-600">Making Charges:</Text>
// // // //                           <View className="flex flex-row items-center">
// // // //                             {product?.[category]?.making_type?.value === "PG" ? (
// // // //                               <Text className="text-gray-500 text-sm mr-2">
// // // //                                 ({handleDigitsFix(product?.[category]?.net_weight || 0)} × ₹{handleDigitsFix(product?.[category]?.making_charge || 0)})
// // // //                               </Text>
// // // //                             ) : null}
// // // //                             <Text className="font-medium">₹{handleDigitsFix(
// // // //                               product?.[category]?.making_type?.value === "PG"
// // // //                                 ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // //                                 : Number(product?.[category]?.making_charge || 0)
// // // //                             )}</Text>
// // // //                           </View>
// // // //                         </View>
// // // //                         <View className="mb-4">
// // // //                           <View className="flex-row justify-between items-center mb-2">
// // // //                             <Text className="text-gray-600 font-medium">Additional Charges</Text>
// // // //                             <TouchableOpacity
// // // //                               onPress={() => {
// // // //                                 const updatedCharges = [...(product[category].charges_json || []), { name: '', amount: '0' }];
// // // //                                 handleInputChange('charges_json', updatedCharges, category);
// // // //                               }}
// // // //                               className="bg-primary px-2 py-1 rounded-md"
// // // //                             >
// // // //                               <Text className="text-white">+ Add</Text>
// // // //                             </TouchableOpacity>
// // // //                           </View>
// // // //                           {(product[category]?.charges_json || []).map((charge, index) => (
// // // //                             <View key={index} className="flex-row items-center mb-2">
// // // //                               <View className="flex-1 mr-2">
// // // //                                 <OutlineInput
// // // //                                   placeholder="Charge name"
// // // //                                   value={charge.name}
// // // //                                   maxLength={50}
// // // //                                   onChangeText={(value) => {
// // // //                                     const updatedCharges = [...(product[category].charges_json || [])];
// // // //                                     updatedCharges[index] = { ...charge, name: value };
// // // //                                     handleInputChange('charges_json', updatedCharges, category);
// // // //                                   }}
// // // //                                 />
// // // //                               </View>
// // // //                               <View className="w-24 mr-2">
// // // //                                 <OutlineInput
// // // //                                   placeholder="Amount"
// // // //                                   value={String(charge.amount)}
// // // //                                   keyboardType="numeric"
// // // //                                   onChangeText={(value) => {
// // // //                                     const updatedCharges = [...(product[category].charges_json || [])];
// // // //                                     updatedCharges[index] = { ...charge, amount: value || '0' };
// // // //                                                     handleInputChange('charges_json', updatedCharges, category);
// // // //                 }}
// // // //               />
// // // //             </View>
// // // //             <TouchableOpacity
// // // //               onPress={() => {
// // // //                 const updatedCharges = (product[category].charges_json || []).filter((_, i) => i !== index);
// // // //                 handleInputChange('charges_json', updatedCharges, category);
// // // //               }}
// // // //             >
// // // //               <FontAwesome6 name="trash" size={16} color="red" />
// // // //             </TouchableOpacity>
// // // //           </View>
// // // //         ))}
// // // //         {(product[category]?.charges_json || []).length > 0 && (
// // // //           <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-200">
// // // //             <Text className="text-gray-600">Total:</Text>
// // // //             <Text className="font-medium">₹{handleDigitsFix(
// // // //               (product[category]?.charges_json || []).reduce((sum, charge) =>
// // // //                 sum + Number(charge.amount || 0), 0)
// // // //             )}</Text>
// // // //           </View>
// // // //         )}
// // // //       </View>
// // // //       <View className="flex flex-row justify-between items-center border-t border-gray-200 mt-2 pt-2">
// // // //         <Text className="text-gray-600 font-semibold">Subtotal:</Text>
// // // //         <Text className="font-semibold">₹{handleDigitsFix(
// // // //           (product.cutting_enabled
// // // //             ? (Number(product?.[category]?.fine_weight || 0) *
// // // //                Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // // //             : 0) +
// // // //           (product?.[category]?.making_type?.value === "PG"
// // // //             ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // //             : Number(product?.[category]?.making_charge || 0)) +
// // // //           (product[category]?.charges_json || []).reduce((sum, charge) => 
// // // //             sum + Number(charge.amount || 0), 0)
// // // //         )}</Text>
// // // //       </View>
// // // //       <View className="flex flex-row justify-between items-center">
// // // //         <Text className="text-gray-600">Tax Amount ({Number(product?.[category]?.tax || 0)}%):</Text>
// // // //         <Text className="font-medium">₹{handleDigitsFix(
// // // //           (
// // // //             (product.cutting_enabled ? 
// // // //               (Number(product?.[category]?.fine_weight || 0) * 
// // // //                Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // // //              : 0) +
// // // //             (product?.[category]?.making_type?.value === "PG" 
// // // //               ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // //              : Number(product?.[category]?.making_charge || 0)) +
// // // //             ((product[category]?.charges_json || []).reduce((sum, charge) => 
// // // //               sum + Number(charge.amount || 0), 0))
// // // //           ) * (Number(product?.[category]?.tax || 0) / 100)
// // // //         )}</Text>
// // // //       </View>
// // // //       <View className="flex flex-row justify-between border-t border-gray-200 pt-2">
// // // //         <Text className="text-gray-600 font-semibold">Final Price:</Text>
// // // //         <Text className="font-semibold">₹{handleDigitsFix(
// // // //           // Subtotal
// // // //           (
// // // //             (product.cutting_enabled ? 
// // // //               (Number(product?.[category]?.fine_weight || 0) * 
// // // //                Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // // //              : 0) +
// // // //             (product?.[category]?.making_type?.value === "PG"
// // // //               ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // //              : Number(product?.[category]?.making_charge || 0)) +
// // // //             ((product[category]?.charges_json || []).reduce((sum, charge) => 
// // // //               sum + Number(charge.amount || 0), 0))
// // // //           ) +
// // // //           // Tax Amount
// // // //           (
// // // //             (product.cutting_enabled ? 
// // // //               (Number(product?.[category]?.fine_weight || 0) * 
// // // //                Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // // //              : 0) +
// // // //             (product?.[category]?.making_type?.value === "PG"
// // // //               ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // // //              : Number(product?.[category]?.making_charge || 0)) +
// // // //             ((product[category]?.charges_json || []).reduce((sum, charge) => 
// // // //               sum + Number(charge.amount || 0), 0))
// // // //           ) * (Number(product?.[category]?.tax || 0) / 100)
// // // //         )}</Text>
// // // //       </View>
// // // //     </View>
// // // //   </View>
// // // // ) : (
// // // //   <View className="mb-4 bg-gray-50 p-4 rounded-lg">
// // // //     <Text className="text-base font-semibold mb-3">Basic Weight Details</Text>
// // // //     <View className="space-y-2">
// // // //       <View className="flex flex-row justify-between">
// // // //         <Text className="text-gray-600">Net Weight:</Text>
// // // //         <Text>{product?.[category]?.net_weight || 0} g</Text>
// // // //       </View>
// // // //       <View className="flex flex-row justify-between items-center">
// // // //         <Text className="text-gray-600">Fine Weight:</Text>
// // // //         <View className="flex flex-row items-center">
// // // //           <Text className="text-gray-500 text-sm mr-2">
// // // //             ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × ({Number(product?.[category]?.tounch || 0)}% + {Number(product?.[category]?.wastage || 0)}%))
// // // //           </Text>
// // // //           <Text className="font-medium">{handleDigitsFix(product?.[category]?.fine_weight || 0)} g</Text>
// // // //         </View>
// // // //       </View>
// // // //     </View>
// // // //   </View>
// // // // )}
// // // //                   {/* charges and taxes */}
// // // //                   <View className="mb-4">
// // // //                     {/* Charges */}
// // // //                     <View className="mb-5">
// // // //                       <View className="flex flex-row items-center justify-between">
// // // //                         <Text className="tracking-wider text-base">
// // // //                           Charges
// // // //                         </Text>
// // // //                         <View className="flex flex-row items-center">
// // // //                           <Switch
// // // //                             value={product?.[category]?.showChargesInBill || false}
// // // //                             onValueChange={(value) => handleInputChange("showChargesInBill", value, category)}
// // // //                             trackColor={{ false: "red", true: "green" }}
// // // //                             thumbColor={product?.[category]?.showChargesInBill ? "#ffffff" : "#f4f3f4"}
// // // //                           />
// // // //                         <TouchableOpacity
// // // //                           onPress={() => addItem(category, "charges_json")}
// // // //                           activeOpacity={0.7}
// // // //                             className="bg-primary ml-2 w-6 h-6 flex justify-center items-center rounded-full shadow-xl"
// // // //                         >
// // // //                           <FontAwesome6 name="plus" size={17} color="white" />
// // // //                         </TouchableOpacity>
// // // //                         </View>
// // // //                       </View>
// // // //                       {/* Input fields */}
// // // //                       {product[category]?.charges_json?.map((charge, index) => {
// // // //                         return (
// // // //                           <View
// // // //                             key={index}
// // // //                             className="flex pt-2 pl-1 items-end flex-row"
// // // //                           >
// // // //                             {/* charge name */}
// // // //                             <View className="w-[45%] pr-2">
// // // //                               <OutlineInput
// // // //                                 placeholder="e.g. Labour Charge"
// // // //                                 value={charge.name}
// // // //                                 onChangeText={(value) =>
// // // //                                   handleInputChange(
// // // //                                     "name",
// // // //                                     value,
// // // //                                     category,
// // // //                                     "charges_json",
// // // //                                     index
// // // //                                   )
// // // //                                 }
// // // //                               />
// // // //                             </View>

// // // //                             {/* amount */}
// // // //                             <View className="w-[45%] px-2">
// // // //                               <OutlineInput
// // // //                                 placeholder="e.g. 500"
// // // //                                 value={charge.amount}
// // // //                                 keyboardType="numeric"
// // // //                                 onChangeText={(value) =>
// // // //                                   handleInputChange(
// // // //                                     "amount",
// // // //                                     value,
// // // //                                     category,
// // // //                                     "charges_json",
// // // //                                     index
// // // //                                   )
// // // //                                 }
// // // //                               />
// // // //                             </View>

// // // //                             {/* trash icon */}
// // // //                             {product[category]?.charges_json.length > 1 && (
// // // //                               <TouchableOpacity
// // // //                                 onPress={() =>
// // // //                                   removeChargeTaxInput(
// // // //                                     category,
// // // //                                     "charges_json",
// // // //                                     index
// // // //                                   )
// // // //                                 }
// // // //                                 activeOpacity={0.7}
// // // //                                 className="w-[10%] flex justify-center pl-3"
// // // //                               >
// // // //                                 <FontAwesome6
// // // //                                   name="trash"
// // // //                                   size={15}
// // // //                                   color="red"
// // // //                                 />
// // // //                               </TouchableOpacity>
// // // //                             )}
// // // //                           </View>
// // // //                         );
// // // //                       })}
// // // //                     </View>

// // // //                     {/* Taxes */}
// // // //                     <View className="">
// // // //                       <View className="flex flex-row items-center justify-between">
// // // //                         <Text className="tracking-wider text-base">Tax</Text>
// // // //                         <View className="flex flex-row items-center">
// // // //                           <Switch
// // // //                             value={product?.[category]?.showTaxInBill || false}
// // // //                             onValueChange={(value) => handleInputChange("showTaxInBill", value, category)}
// // // //                             trackColor={{ false: "red", true: "green" }}
// // // //                             thumbColor={product?.[category]?.showTaxInBill ? "#ffffff" : "#f4f3f4"}
// // // //                           />
// // // //                         <TouchableOpacity
// // // //                           onPress={() => addItem(category, "tax_json")}
// // // //                           activeOpacity={0.7}
// // // //                             className="bg-primary ml-2 w-6 h-6 flex justify-center items-center rounded-full shadow-xl"
// // // //                         >
// // // //                           <FontAwesome6 name="plus" size={17} color="white" />
// // // //                         </TouchableOpacity>
// // // //                         </View>
// // // //                       </View>
// // // //                       {/* Input fields */}
// // // //                       {product[category]?.tax_json?.map((tax, index) => {
// // // //                         return (
// // // //                           <View
// // // //                             key={index}
// // // //                             className="flex pt-2 pl-1 items-end flex-row"
// // // //                           >
// // // //                             {/* tax name */}
// // // //                             <View className="w-[45%] pr-2">
// // // //                               <OutlineInput
// // // //                                 placeholder="e.g. Tax"
// // // //                                 value={tax.name}
// // // //                                 onChangeText={(value) =>
// // // //                                   handleInputChange(
// // // //                                     "name",
// // // //                                     value,
// // // //                                     category,
// // // //                                     "tax_json",
// // // //                                     index
// // // //                                   )
// // // //                                 }
// // // //                               />
// // // //                             </View>

// // // //                             {/* tax amount */}
// // // //                             <View className="w-[45%] px-2">
// // // //                               <OutlineInput
// // // //                                 placeholder="e.g. 10%"
// // // //                                 value={tax.amount}
// // // //                                 keyboardType="numeric"
// // // //                                 onChangeText={(value) =>
// // // //                                   handleInputChange(
// // // //                                     "amount",
// // // //                                     value,
// // // //                                     category,
// // // //                                     "tax_json",
// // // //                                     index
// // // //                                   )
// // // //                                 }
// // // //                               />
// // // //                             </View>

// // // //                             {/* trash icon */}
// // // //                             {product[category]?.tax_json.length > 1 && (
// // // //                               <TouchableOpacity
// // // //                                 onPress={() =>
// // // //                                   removeChargeTaxInput(
// // // //                                     category,
// // // //                                     "tax_json",
// // // //                                     index
// // // //                                   )
// // // //                                 }
// // // //                                 activeOpacity={0.7}
// // // //                                 className="w-[10%] flex justify-center pl-3"
// // // //                               >
// // // //                                 <FontAwesome6
// // // //                                   name="trash"
// // // //                                   size={15}
// // // //                                   color="red"
// // // //                                 />
// // // //                               </TouchableOpacity>
// // // //                             )}
// // // //                           </View>
// // // //                         );
// // // //                       })}
// // // //                     </View>
// // // //                   </View>
// // // //                 </View>
// // // //               )
// // // //             );
// // // //           })}
// // // //           {/* ---------  common for sale & purchase - END - ---------- */}

// // // //           {/* Custom Fields Section */}
// // // //           <View className="px-4 pb-4">
// // // //             <View className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
// // // //               <View className="flex-row items-center justify-between mb-4">
// // // //                 <Text className="text-lg font-semibold text-gray-800">Custom Fields</Text>
// // // //                 <TouchableOpacity
// // // //                   onPress={() => {
// // // //                     setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
// // // //                     setCustomFieldModal(true);
// // // //                   }}
// // // //                   className="bg-primary px-4 py-2 rounded-full flex-row items-center"
// // // //                 >
// // // //                   <FontAwesome6 name="plus" size={14} color="white" className="mr-2" />
// // // //                   <Text className="text-white font-medium ml-1">Add Field</Text>
// // // //                 </TouchableOpacity>
// // // //               </View>

// // // //               {/* Custom Fields List */}
// // // //               {(product[product.type]?.custom_fields || []).map((field, index) => (
// // // //                 <View key={index} className="mb-4 bg-gray-50 p-3 rounded-lg">
// // // //                   <View className="flex-row items-center justify-between">
// // // //                     <View className="flex-1">
// // // //                       <Text className="text-base font-medium">{field.label}</Text>
// // // //                       <Text className="text-sm text-gray-600">{field.value} {field.unit?.value || ''}</Text>
// // // //                     </View>
// // // //                     <View className="flex-row items-center">
// // // //                       <Switch
// // // //                         value={field.showInBill}
// // // //                         onValueChange={(value) => {
// // // //                           const updatedFields = [...(product[product.type].custom_fields || [])];
// // // //                           updatedFields[index] = { ...field, showInBill: value };
// // // //                           handleInputChange("custom_fields", updatedFields, product.type);
// // // //                         }}
// // // //                         trackColor={{ false: "#767577", true: "#22c55e" }}
// // // //                         thumbColor={field.showInBill ? "#ffffff" : "#f4f3f4"}
// // // //                       />
// // // //                       <TouchableOpacity
// // // //                         onPress={() => {
// // // //                           const updatedFields = (product[product.type].custom_fields || []).filter((_, i) => i !== index);
// // // //                           handleInputChange("custom_fields", updatedFields, product.type);
// // // //                         }}
// // // //                         className="ml-4 bg-red-100 p-2 rounded-full"
// // // //                       >
// // // //                         <FontAwesome6 name="trash" size={16} color="#ef4444" />
// // // //                       </TouchableOpacity>
// // // //                     </View>
// // // //                   </View>
// // // //                 </View>
// // // //               ))}

// // // //               {!(product[product.type]?.custom_fields?.length > 0) && (
// // // //                 <View className="items-center py-6 bg-gray-50 rounded-lg">
// // // //                   <Text className="text-gray-500 text-sm">No custom fieldss added yet</Text>
// // // //                   <Text className="text-gray-400 text-xs mt-1">Click the "Add Field" button to create custom fields</Text>
// // // //                 </View>
// // // //               )}
// // // //             </View>
// // // //           </View>

// // // //           {/* Custom Field Modal */}
// // // //           <Modal
// // // //             visible={customFieldModal}
// // // //             transparent
// // // //             animationType="fade"
// // // //             onRequestClose={() => setCustomFieldModal(false)}
// // // //           >
// // // //             <View className="flex-1 justify-center items-center bg-black/50">
// // // //               <View className="bg-white p-4 rounded-lg w-[90%] max-w-md">
// // // //                 <Text className="text-lg font-semibold mb-4">Add Custom Field</Text>
                
// // // //                 {/* Field Label */}
// // // //             <View className="mb-4">
// // // //               <InputBox
// // // //                     name="label"
// // // //                     label="Field Label"
// // // //                     placeholder="e.g., Less Weight 2"
// // // //                     value={tempCustomField.label}
// // // //                     onChange={({ value }) => setTempCustomField(prev => ({ ...prev, label: value }))}
// // // //                   />
// // // //                 </View>

// // // //                 {/* Field Value */}
// // // //                 <View className="mb-4">
// // // //                   <InputBox
// // // //                     name="value"
// // // //                     label="Value"
// // // //                     placeholder="Enter numeric value"
// // // //                     value={tempCustomField.value}
// // // //                     keyboardType="numeric"
// // // //                     onChange={({ value }) => setTempCustomField(prev => ({ ...prev, value }))}
// // // //                   />
// // // //                 </View>

// // // //                 {/* Unit Selection */}
// // // //                 <View className="mb-4">
// // // //                   <SelectInput
// // // //                     label="Unit"
// // // //                     name="unit"
// // // //                     value={tempCustomField.unit}
// // // //                     placeholder="Select Unit"
// // // //                     data={jewelryUnits}
// // // //                     onSelect={(value) => setTempCustomField(prev => ({ ...prev, unit: value }))}
// // // //                   />
// // // //                 </View>

// // // //                 {/* Show in Bill Toggle */}
// // // //                 <View className="flex-row items-center justify-between mb-6">
// // // //                   <Text className="text-base text-gray-700">Show in Bill</Text>
// // // //                   <Switch
// // // //                     value={tempCustomField.showInBill}
// // // //                     onValueChange={(value) => setTempCustomField(prev => ({ ...prev, showInBill: value }))}
// // // //                     trackColor={{ false: "#767577", true: "#22c55e" }}
// // // //                     thumbColor={tempCustomField.showInBill ? "#ffffff" : "#f4f3f4"}
// // // //                   />
// // // //                 </View>

// // // //                 {/* Buttons */}
// // // //                 <View className="flex-row justify-end space-x-2">
// // // //                   <TouchableOpacity 
// // // //                     onPress={() => {
// // // //                       setCustomFieldModal(false);
// // // //                       setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
// // // //                     }}
// // // //                     className="px-4 py-2"
// // // //                   >
// // // //                     <Text className="text-gray-600">Cancel</Text>
// // // //                   </TouchableOpacity>
// // // //                   <TouchableOpacity 
// // // //                     onPress={() => {
// // // //                       const updatedFields = [...(product[product.type]?.custom_fields || [])];
// // // //                       updatedFields.push(tempCustomField);
// // // //                       handleInputChange("custom_fields", updatedFields, product.type);
// // // //                       setCustomFieldModal(false);
// // // //                       setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
// // // //                     }}
// // // //                     className="bg-primary px-4 py-2 rounded-md"
// // // //                   >
// // // //                     <Text className="text-white">Done</Text>
// // // //                   </TouchableOpacity>
// // // //                 </View>
// // // //               </View>
// // // //             </View>
// // // //           </Modal>

// // // //           {/* Horizontal Layout for Photo + Buttons */}
// // // //           <View className="flex-row px-4 pb-4">
// // // //             {/* Additional Photo - Left Side */}
// // // //             <View className="flex-1 pr-2">
// // // //               <View className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
// // // //                 <Text className="text-sm font-medium mb-2 text-center">Additional Photo</Text>
// // // //                 <ImagePickerComponent
// // // //                   name="additional_image"
// // // //                   value={product?.additional_image}
// // // //                 onChange={({ value, name }) => handleInputChange(name, value)}
// // // //               />
// // // //                 <Text className="text-xs text-gray-500 mt-2 text-center">
// // // //                   Upload item photo
// // // //                 </Text>
// // // //               </View>
// // // //             </View>

// // // //             {/* Buttons - Right Side */}
// // // //             <View className="w-1/3 pl-2">
// // // //             {isFromInvoice ? (
// // // //                 <View className="space-y-2">
// // // //                 <CommonButton
// // // //                   loading={loading}
// // // //                   onPress={handleAddProduct}
// // // //                   title="Add Product"
// // // //                     />
// // // //               </View>
// // // //             ) : (
// // // //                 <View className="space-y-2">
// // // //                   <CommonButton
// // // //                     loading={loading}
// // // //                     onPress={onSubmitClick}
// // // //                     title={route?.params?.isProductEdit || updateData ? "Update" : "Create"}
// // // //                   />
// // // //               </View>
// // // //             )}
// // // //             </View>
// // // //           </View>
// // // //         </View>
// // // //       </KeyboardHanlder>

// // // //       {/* Add weight */}
// // // //       {updateData && (
// // // //         <AddWeightModal
// // // //           product={{ id: updateData.id, type: product?.type }}
// // // //           open={initialState.weightModal}
// // // //           onClose={() => handleInitialState("weightModal", false)}
// // // //         />
// // // //       )}

// // // //       {/* Create metal */}
// // // //       <CreateMetalModal
// // // //         navigation={navigation}
// // // //         route={route}
// // // //         open={initialState.metalModal}
// // // //         onClose={() => handleInitialState("metalModal", false)}
// // // //       />

// // // //       {/* Date Picker Modals */}
// // // //       <Modal
// // // //         visible={initialState.billDatePicker}
// // // //         transparent
// // // //         animationType="fade"
// // // //         onRequestClose={() => handleInitialState("billDatePicker", false)}
// // // //       >
// // // //         <View className="flex-1 justify-center items-center bg-black/50">
// // // //           <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
// // // //             <Text className="text-lg font-semibold mb-4">Select Bill Date</Text>
            
// // // //             <DatePickerComponent
// // // //               name="bill_date"
// // // //               value={product?.bill_date}
// // // //               onSelect={({ value }) => {
// // // //                 handleInputChange("bill_date", value);
// // // //                 handleInitialState("billDatePicker", false);
// // // //               }}
// // // //             />

// // // //             <TouchableOpacity 
// // // //               onPress={() => handleInitialState("billDatePicker", false)}
// // // //               className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
// // // //             >
// // // //               <Text className="text-white">Close</Text>
// // // //             </TouchableOpacity>
// // // //           </View>
// // // //         </View>
// // // //       </Modal>

// // // //       <Modal
// // // //         visible={initialState.paymentDatePicker}
// // // //         transparent
// // // //         animationType="fade"
// // // //         onRequestClose={() => handleInitialState("paymentDatePicker", false)}
// // // //       >
// // // //         <View className="flex-1 justify-center items-center bg-black/50">
// // // //           <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
// // // //             <Text className="text-lg font-semibold mb-4">Select Expected Payment Date</Text>
            
// // // //             <DatePickerComponent
// // // //               name="payment_date"
// // // //               value={product?.payment_date}
// // // //               onSelect={({ value }) => {
// // // //                 handleInputChange("payment_date", value);
// // // //                 handleInitialState("paymentDatePicker", false);
// // // //               }}
// // // //             />

// // // //             <TouchableOpacity 
// // // //               onPress={() => handleInitialState("paymentDatePicker", false)}
// // // //               className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
// // // //             >
// // // //               <Text className="text-white">Close</Text>
// // // //             </TouchableOpacity>
// // // //           </View>
// // // //         </View>
// // // //       </Modal>

// // // //       <Modal
// // // //         visible={initialState.interestStartDatePicker}
// // // //         transparent
// // // //         animationType="fade"
// // // //         onRequestClose={() => handleInitialState("interestStartDatePicker", false)}
// // // //       >
// // // //         <View className="flex-1 justify-center items-center bg-black/50">
// // // //           <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
// // // //             <Text className="text-lg font-semibold mb-4">Select Interest Start Date</Text>
            
// // // //             <DatePickerComponent
// // // //               name="interest_start_date"
// // // //               value={product?.interest_start_date}
// // // //               onSelect={({ value }) => {
// // // //                 handleInputChange("interest_start_date", value);
// // // //                 handleInitialState("interestStartDatePicker", false);
// // // //               }}
// // // //             />

// // // //             <TouchableOpacity 
// // // //               onPress={() => handleInitialState("interestStartDatePicker", false)}
// // // //               className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
// // // //             >
// // // //               <Text className="text-white">Close</Text>
// // // //             </TouchableOpacity>
// // // //           </View>
// // // //         </View>
// // // //       </Modal>

// // // //     </Fragment>
// // // //   );
// // // // };

// // // // export default ProductForm;

// // // import InputBox from "@/src/components/common/InputBox";
// // // import React, { Fragment, useEffect, useState } from "react";
// // // import { View, TouchableOpacity, Switch, Modal, SafeAreaView, ScrollView, Alert, BackHandler, FlatList, Text, Platform } from "react-native";
// // // import { useDispatch, useSelector } from "react-redux";
// // // import SimpleReactValidator from "simple-react-validator";
// // // import CommonButton from "@/src/components/common/buttons/CommonButton";
// // // import SelectInput from "@/src/components/common/SelectInput";
// // // import ImagePickerComponent from "@/src/components/common/ImagePicker";
// // // import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
// // // import {
// // //   fetchProductDetail,
// // //   fetchProductGroups,
// // //   manageProductList,
// // //   fetchProductList,
// // // } from "@/src/redux/actions/product.action";
// // // import KeyboardHanlder from "@/src/components/common/KeyboardHanlder";
// // // import CreateMetalModal from "./CreateMetalModal";
// // // import AddWeightModal from "./AddWeightModal";
// // // import OutlineInput from "@/src/components/common/OutlineInput";
// // // import SearchProduct from "./SearchProduct";
// // // import { makingTypes } from "@/src/utils";
// // // import AntDesign from "@expo/vector-icons/AntDesign";
// // // import moment from "moment";
// // // import DatePickerComponent from "@/src/components/common/DateTimePicker";
// // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // import { useFocusEffect } from "@react-navigation/native";
// // // import { getToken } from "@/src/utils/auth";
// // // import { ApiRequest } from "@/src/utils/api";
// // // import { MANAGE_PRODUCT_API, MANAGE_LOGS_API, MANAGE_BILL_API } from "@/src/utils/api/endpoints";
// // // import ShowToast from "@/src/components/common/ShowToast";

// // // // Process sale and purchase data
// // // export function processProductData(productData, prefix, isFromInvoice) {
// // //   return productData.map((item) => {
// // //     const processedItem = {
// // //       gross_weight: 0,
// // //       less_weight: 0,
// // //       net_weight: 0,
// // //       net_price: 0,
// // //       wastage: 0,
// // //       tounch: 0,
// // //       fine_weight: 0,
// // //       rate: 0,
// // //       making_type: "",
// // //       charges_json: [{}],
// // //       tax_json: [{}],
// // //       custom_fields: [], // Initialize custom_fields
// // //     };
// // //     for (const key in item) {
// // //       if (key.startsWith(prefix)) {
// // //         const newKey = key.replace(prefix, "");
// // //         processedItem[newKey] = key.includes("_json")
// // //           ? (() => {
// // //               try {
// // //                 return JSON.parse(item[key].replace(/'/g, '"'));
// // //               } catch (e) {
// // //                 console.error("Invalid JSON string:", item[key]);
// // //                 return [{}];
// // //               }
// // //             })()
// // //           : key === "making_type"
// // //           ? makingTypes.find((type) => type.value === item[key]) || ""
// // //           : item[key];
// // //       }
// // //     }
// // //     return processedItem;
// // //   });
// // // }

// // // // Storage key for form data
// // // const PRODUCT_FORM_STORAGE_KEY = "productForm_savedState";

// // // const ProductForm = ({
// // //   navigation,
// // //   route,
// // //   isFromInvoice = false,
// // //   invoiceHandler,
// // //   handleCancel,
// // // }) => {
// // //   const updateData = route?.params?.updateData;
// // //   const isBillEdit = route?.params?.isBillEdit;
// // //   const billType = route?.params?.billType;
// // //   const dispatch = useDispatch();
// // //   const [errors, setErrors] = useState({});
// // //   const [initialState, setInitialState] = useState({
// // //     metalModal: false,
// // //     weightModal: false,
// // //     datePicker: false,
// // //     billDatePicker: false,
// // //     paymentDatePicker: false,
// // //     interestStartDatePicker: false,
// // //   });
// // //   const [customFieldModal, setCustomFieldModal] = useState(false);
// // //   const [tempCustomField, setTempCustomField] = useState({
// // //     label: "",
// // //     value: "",
// // //     unit: "",
// // //     showInBill: true,
// // //   });
// // //   const [dataLoaded, setDataLoaded] = useState(false);
// // //   const [formChanged, setFormChanged] = useState(false);
// // //   const [loading, setLoading] = useState(false);
// // //   const [showSuggestions, setShowSuggestions] = useState(false);
// // //   const [filteredProducts, setFilteredProducts] = useState([]);
// // //   const { productGroups, isLoading: productLoading, productDetail, products } = useSelector(
// // //     (state) => state.productSlices
// // //   );
// // //   const { profileData } = useSelector((state) => state.userSlices);
// // //   const validator = new SimpleReactValidator();
// // //   const productTypes = ["purchase", "sale"];

// // //   const formType = isFromInvoice
// // //     ? (invoiceHandler?.isPurchase ? "purchase" : "sale")
// // //     : "purchase";

// // //   const defaultProductState = {
// // //     type: formType,
// // //     size: "",
// // //     interest_enabled: false,
// // //     interest_type: { label: "Flat", value: "2" },
// // //     interest_rate: "2",
// // //     interest_amount: "0",
// // //     bill_date: new Date(),
// // //     payment_date: null,
// // //     interest_start_date: null,
// // //     interest_upto: null,
// // //     grace_period_enabled: false,
// // //     grace_period_days: "0",
// // //     original_amount: "0",
// // //     remaining_balance: "0",
// // //     interest_notes: "",
// // //     payment_history: [],
// // //     cutting_enabled: false,
// // //     sale: {
// // //       gross_weight: 0,
// // //       less_weight: 0,
// // //       net_weight: 0,
// // //       net_price: 0,
// // //       wastage: 0,
// // //       tounch: 0,
// // //       fine_weight: 0,
// // //       rate: 0,
// // //       metal_value: "0",
// // //       making_type: "",
// // //       making_charge: 0,
// // //       photo: null,
// // //       charges_json: [{}],
// // //       tax_json: [{}],
// // //       custom_fields: [], // Initialize custom_fields
// // //       showSizeInBill: true,
// // //       showGrossWeightInBill: true,
// // //       showLessWeightInBill: true,
// // //       showNetWeightInBill: true,
// // //       showWastageInBill: true,
// // //       showTounchInBill: true,
// // //       showFineWeightInBill: true,
// // //       showRateInBill: true,
// // //       showMakingChargeInBill: true,
// // //       showHuidInBill: true,
// // //       showHsnInBill: true,
// // //       showPriceInBill: true,
// // //       showTaxInBill: true,
// // //       showChargesInBill: true,
// // //       showCommentInBill: true,
// // //     },
// // //     purchase: {
// // //       gross_weight: 0,
// // //       less_weight: 0,
// // //       net_weight: 0,
// // //       net_price: 0,
// // //       wastage: 0,
// // //       tounch: 0,
// // //       fine_weight: 0,
// // //       rate: 0,
// // //       metal_value: "0",
// // //       making_type: "",
// // //       making_charge: 0,
// // //       photo: null,
// // //       charges_json: [{}],
// // //       tax_json: [{}],
// // //       custom_fields: [], // Initialize custom_fields
// // //       showSizeInBill: true,
// // //       showGrossWeightInBill: true,
// // //       showLessWeightInBill: true,
// // //       showNetWeightInBill: true,
// // //       showWastageInBill: true,
// // //       showTounchInBill: true,
// // //       showFineWeightInBill: true,
// // //       showRateInBill: true,
// // //       showMakingChargeInBill: true,
// // //       showHuidInBill: true,
// // //       showHsnInBill: true,
// // //       showPriceInBill: true,
// // //       showTaxInBill: true,
// // //       showChargesInBill: true,
// // //       showCommentInBill: true,
// // //     },
// // //   };

// // //   const [product, setProduct] = useState(defaultProductState);

// // //   const saveFormData = async (formData) => {
// // //     try {
// // //       await AsyncStorage.setItem(PRODUCT_FORM_STORAGE_KEY, JSON.stringify(formData));
// // //       console.log("Form data saved to AsyncStorage");
// // //       setFormChanged(true);
// // //     } catch (error) {
// // //       console.error("Error saving form data:", error);
// // //     }
// // //   };

// // //   const loadFormData = async () => {
// // //     try {
// // //       const savedData = await AsyncStorage.getItem(PRODUCT_FORM_STORAGE_KEY);
// // //       if (savedData) {
// // //         const parsedData = JSON.parse(savedData);
// // //         console.log("Loaded saved form data");
// // //         setProduct(parsedData);
// // //       }
// // //       setDataLoaded(true);
// // //     } catch (error) {
// // //       console.error("Error loading form data:", error);
// // //       setDataLoaded(true);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     if (updateData?.id) {
// // //       dispatch(fetchProductDetail({ id: updateData.id }));
// // //       setDataLoaded(true);
// // //     } else {
// // //       loadFormData();
// // //     }
// // //   }, []);

// // //   const isSelectRate = product?.hsn_id?.variation?.length > 0;

// // //   const handleDigitsFix = (value) => {
// // //     if (!value || isNaN(value)) return "0.00";
// // //     return parseFloat(value).toFixed(2);
// // //   };

// // //   const jewelryUnits = [
// // //     { label: "Grams (g)", value: "g" },
// // //     { label: "Milligrams (mg)", value: "mg" },
// // //     { label: "Carats (ct)", value: "ct" },
// // //     { label: "Pieces (pcs)", value: "pcs" },
// // //     { label: "Inches (in)", value: "in" },
// // //     { label: "Millimeters (mm)", value: "mm" },
// // //     { label: "Percentage (%)", value: "%" },
// // //   ];

// // //   const calculateTotalChargesAndTaxes = (category) => {
// // //     let totalCharges = 0;
// // //     let totalTaxPercentage = 0;

// // //     if (category?.charges_json) {
// // //       totalCharges = category.charges_json.reduce(
// // //         (sum, charge) => sum + (Number(charge.amount) || 0),
// // //         0
// // //       );
// // //     }

// // //     if (category?.tax_json) {
// // //       totalTaxPercentage = category.tax_json.reduce(
// // //         (sum, tax) => sum + (Number(tax.amount) || 0),
// // //         0
// // //       );
// // //     }

// // //     return { totalCharges, totalTaxPercentage };
// // //   };

// // //   const handleInputChange = (name, value, category, arrayKey, index) => {
// // //     const updatedProduct = { ...product };

// // //     if (arrayKey && typeof index === "number" && updatedProduct[category]?.[arrayKey]) {
// // //       updatedProduct[category][arrayKey][index] = {
// // //         ...updatedProduct[category][arrayKey][index],
// // //         [name]: value,
// // //       };
// // //     } else if (category && updatedProduct[category]) {
// // //       updatedProduct[category][name] = value;

// // //       // Auto-set rate when hsn_id is selected
// // //       if (name === "hsn_id") {
// // //         const variations = value?.variation || [];
// // //         if (variations.length > 0) {
// // //           const defaultVariation = variations[0];
// // //           if (!defaultVariation?.price) {
// // //             ShowToast("Selected HSN has invalid variation data");
// // //             updatedProduct[category].rate = null;
// // //           } else {
// // //             updatedProduct[category].rate = defaultVariation;
// // //           }
// // //         } else {
// // //           updatedProduct[category].rate = "0";
// // //         }
// // //       }
// // //       // Set rate when variation is selected
// // //       if (name === "variation") {
// // //         updatedProduct[category].rate = value;
// // //       }
// // //     } else {
// // //       updatedProduct[name] = value;
// // //     }

// // //     // Calculate net_weight and fine_weight
// // //     if (['gross_weight', 'less_weight', 'wastage', 'tounch'].includes(name) && updatedProduct[category]) {
// // //       const gross = parseFloat(updatedProduct[category].gross_weight) || 0;
// // //       const less = parseFloat(updatedProduct[category].less_weight) || 0;
// // //       const wastage = parseFloat(updatedProduct[category].wastage) || 0;
// // //       const tounch = parseFloat(updatedProduct[category].tounch) || 0;

// // //       updatedProduct[category].net_weight = (gross - less).toFixed(3);
// // //       updatedProduct[category].fine_weight = (gross * ((tounch + wastage) / 100)).toFixed(3);
// // //     }

// // //     // Calculate metal_value and net_price
// // //     if (['rate', 'hsn_id', 'variation', 'gross_weight', 'less_weight', 'wastage', 'tounch'].includes(name) && updatedProduct[category]) {
// // //       const fineWeight = parseFloat(updatedProduct[category].fine_weight) || 0;
// // //       const rateValue = isSelectRate ? parseFloat(updatedProduct[category].rate?.price || 0) : parseFloat(updatedProduct[category].rate || 0);
// // //       const makingCharge = parseFloat(updatedProduct[category].making_charge) || 0;
// // //       const netWeight = parseFloat(updatedProduct[category].net_weight) || 0;
// // //       const chargesTotal = (updatedProduct[category].charges_json || []).reduce(
// // //         (sum, charge) => sum + Number(charge.amount || 0),
// // //         0
// // //       );
// // //       const taxRate = parseFloat(updatedProduct[category].tax || 0) / 100;

// // //       updatedProduct[category].metal_value = (fineWeight * rateValue).toFixed(2);

// // //       const subtotal = (fineWeight * rateValue) +
// // //         (updatedProduct[category].making_type?.value === "PG"
// // //           ? netWeight * makingCharge
// // //           : makingCharge) +
// // //         chargesTotal;

// // //       updatedProduct[category].net_price = (subtotal + subtotal * taxRate).toFixed(2);
// // //     }

// // //     setProduct(updatedProduct);
// // //     saveFormData(updatedProduct);

// // //     if (errors[name]) {
// // //       setErrors((prev) => ({ ...prev, [name]: null }));
// // //     }
// // //   };

// // //   const handleInitialState = (name, value) => {
// // //     setInitialState({ ...initialState, [name]: value });
// // //   };

// // //   const handleSubmit = async () => {
// // //     try {
// // //       if (!product.name) {
// // //         ShowToast("Product name is required");
// // //         return;
// // //       }

// // //       setLoading(true);

// // //       const formData = new FormData();

// // //       formData.append('name', product.name || '');
// // //       formData.append('huid', product.huid || '');
// // //       formData.append('hsn_id', product.hsn_id?.value || '');
// // //       formData.append('bar_code', product.bar_code || '');
// // //       formData.append('comment', product.comment || '');

// // //       if (product.image && typeof product.image === 'object' && product.image.uri) {
// // //         formData.append('image', {
// // //           uri: Platform.OS === 'ios' ? product.image.uri.replace('file://', '') : product.image.uri,
// // //           type: 'image/jpeg',
// // //           name: `product_${Date.now()}.jpg`,
// // //         });
// // //       } else if (product.image && typeof product.image === 'string') {
// // //         formData.append('image_url', product.image);
// // //       }

// // //       formData.append('sale_gross_weight', String(product.sale?.gross_weight || '0'));
// // //       formData.append('sale_less_weight', String(product.sale?.less_weight || '0'));
// // //       formData.append('sale_net_weight', String(product.sale?.net_weight || '0'));
// // //       formData.append('sale_wastage', String(product.sale?.wastage || '0'));
// // //       formData.append('sale_tounch', String(product.sale?.tounch || '0'));
// // //       formData.append('sale_fine_weight', String(product.sale?.fine_weight || '0'));
// // //       formData.append('sale_rate', String((typeof product.sale?.rate === 'object' ? product.sale.rate?.price : product.sale?.rate) || '0'));
// // //       formData.append('sale_making_type', product.sale?.making_type?.value || 'PG');
// // //       formData.append('sale_making_charges', String(product.sale?.making_charge || '0'));
// // //       formData.append('sale_net_price', String(product.sale?.net_price || '0'));
// // //       formData.append('sale_piece', '1');

// // //       formData.append('purchase_gross_weight', String(product.purchase?.gross_weight || '0'));
// // //       formData.append('purchase_less_weight', String(product.purchase?.less_weight || '0'));
// // //       formData.append('purchase_net_weight', String(product.purchase?.net_weight || '0'));
// // //       formData.append('purchase_wastage', String(product.purchase?.wastage || '0'));
// // //       formData.append('purchase_tounch', String(product.purchase?.tounch || '0'));
// // //       formData.append('purchase_fine_weight', String(product.purchase?.fine_weight || '0'));
// // //       formData.append('purchase_rate', String((typeof product.purchase?.rate === 'object' ? product.purchase.rate?.price : product.purchase?.rate) || '0'));
// // //       formData.append('purchase_making_type', product.purchase?.making_type?.value || 'PG');
// // //       formData.append('purchase_making_charges', String(product.purchase?.making_charge || '0'));
// // //       formData.append('purchase_net_price', String(product.purchase?.net_price || '0'));
// // //       formData.append('purchase_piece', '1');

// // //       formData.append('sale_charges_json', JSON.stringify(product.sale?.charges_json || []));
// // //       formData.append('sale_tax_json', JSON.stringify(product.sale?.tax_json || []));
// // //       formData.append('purchase_charges_json', JSON.stringify(product.purchase?.charges_json || []));
// // //       formData.append('purchase_tax_json', JSON.stringify(product.purchase?.tax_json || []));

// // //       const now = new Date();
// // //       const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');

// // //       const [productResponse, logResponse] = await Promise.all([
// // //         ApiRequest({
// // //           url: MANAGE_PRODUCT_API.create,
// // //           method: 'POST',
// // //           body: formData,
// // //           headers: {
// // //             'Content-Type': 'multipart/form-data',
// // //           },
// // //         }),
// // //         ApiRequest({
// // //           url: MANAGE_LOGS_API.create,
// // //           method: 'POST',
// // //           body: {
// // //             userName: profileData?.name || 'Unknown User',
// // //             productName: product.name || 'Unknown Product',
// // //             id: 0,
// // //             type: 'product',
// // //             amount: parseFloat(product[product.type]?.net_price || 0).toFixed(2),
// // //             action: 'CREATE',
// // //             entityType: 'PRODUCT',
// // //             timestamp: timestamp,
// // //             metadata: JSON.stringify({
// // //               action: 'Created new product',
// // //               productId: product.product_id || 'new',
// // //               note: `Created product: ${product.name}`,
// // //               formData: {
// // //                 sale_gross_weight: product.sale?.gross_weight || 0,
// // //                 sale_net_weight: product.sale?.net_weight || 0,
// // //                 sale_fine_weight: product.sale?.fine_weight || 0,
// // //                 sale_net_price: product.sale?.net_price || 0,
// // //               },
// // //             }),
// // //           },
// // //         }),
// // //       ]);

// // //       if (!productResponse?.success) {
// // //         throw new Error(productResponse?.message || "Failed to save product");
// // //       }

// // //       if (!logResponse?.success) {
// // //         console.error("Warning: Product saved but log creation failed:", logResponse?.message);
// // //         ShowToast("Product saved but logging failed");
// // //       } else {
// // //         ShowToast(productResponse.message || "Product created successfully");
// // //       }

// // //       await AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY);
// // //       navigation.goBack();
// // //     } catch (error) {
// // //       console.error('Error details:', error);
// // //       ShowToast(error.message || "Error saving product");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const onSubmitClick = () => {
// // //     const isUpdate = route?.params?.isProductEdit || updateData?.id;
// // //     if (isUpdate) {
// // //       const formData = new FormData();
// // //       formData.append('id', updateData?.id || route?.params?.id);
// // //       handleUpdate();
// // //     } else {
// // //       handleSubmit();
// // //     }
// // //   };

// // //   const resetProduct = async () => {
// // //     Alert.alert(
// // //       "Reset Form",
// // //       "Are you sure you want to reset all form values?",
// // //       [
// // //         {
// // //           text: "Cancel",
// // //           style: "cancel",
// // //         },
// // //         {
// // //           text: "Reset",
// // //           onPress: async () => {
// // //             try {
// // //               await AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY);
// // //               console.log("Form data cleared during reset");
// // //               setProduct(defaultProductState);
// // //               setFormChanged(false);
// // //             } catch (error) {
// // //               console.error("Error clearing form data:", error);
// // //               ShowToast("Error clearing form data");
// // //             }
// // //           },
// // //         },
// // //       ]
// // //     );
// // //   };

// // //   const addItem = (type, key) => {
// // //     setProduct((prev) => ({
// // //       ...prev,
// // //       [type]: {
// // //         ...prev[type],
// // //         [key]: [
// // //           ...prev[type][key],
// // //           key === "charges_json"
// // //             ? { name: "", amount: "0" }
// // //             : { name: "", amount: "0" },
// // //         ],
// // //       },
// // //     }));
// // //   };

// // //   const removeChargeTaxInput = (type, key, index) => {
// // //     setProduct((prev) => {
// // //       const updatedCategory = { ...prev[type] };
// // //       const itemToRemove = updatedCategory[key].find((item, i) => i === index);
// // //       updatedCategory[key] = updatedCategory[key].filter(
// // //         (item, i) => i !== index
// // //       );

// // //       updatedCategory.net_price =
// // //         Number(updatedCategory.net_price || 0) - Number(itemToRemove?.amount || 0);

// // //       return {
// // //         ...prev,
// // //         [type]: updatedCategory,
// // //       };
// // //     });
// // //   };

// // //   const handleProductTypeChange = (type) => {
// // //     const isSale = type === "sale";
// // //     setProduct((prev) => {
// // //       const updatedSale = isSale
// // //         ? {
// // //             ...prev.purchase,
// // //             gross_weight: prev?.sale?.gross_weight || 0,
// // //             less_weight: prev?.sale?.less_weight || 0,
// // //             net_weight: prev?.sale?.net_weight || 0,
// // //             net_price: prev?.sale?.net_price || 0,
// // //           }
// // //         : prev.sale;

// // //       return { ...prev, sale: updatedSale, type };
// // //     });
// // //   };

// // //   const handleProductDetail = (data) => {
// // //     const {
// // //       name,
// // //       hsn_id,
// // //       huid,
// // //       comment,
// // //       image_url,
// // //       sale_product_data,
// // //       purchase_product_data,
// // //     } = data;

// // //     const purchase = processProductData(
// // //       purchase_product_data || [{}],
// // //       "purchase_",
// // //       isFromInvoice
// // //     );
// // //     const sale = processProductData(
// // //       sale_product_data || [{}],
// // //       "sale_",
// // //       isFromInvoice
// // //     );
// // //     const hsnName = productGroups.find((item) => item.id == hsn_id);

// // //     setProduct({
// // //       ...defaultProductState,
// // //       ...(isFromInvoice
// // //         ? { product_id: data.id, product_name: data.name }
// // //         : {}),
// // //       name: name || "",
// // //       huid: huid || "",
// // //       comment: comment || "",
// // //       image: image_url || "",
// // //       hsn_id: hsnName ? { label: hsnName.name, value: hsnName.id, variation: hsnName.variation_data } : null,
// // //       sale: sale[0] || defaultProductState.sale,
// // //       purchase: purchase[0] || defaultProductState.purchase,
// // //     });
// // //   };

// // //   const handleAddProduct = () => {
// // //     if (validator.allValid()) {
// // //       const newProducts = [
// // //         ...(invoiceHandler?.formValue?.selectedProduct || []),
// // //       ];

// // //       const { name, hsn_id, huid, comment, image, size } = product;

// // //       const productData = {
// // //         name,
// // //         huid,
// // //         size,
// // //         hsn_id: hsn_id?.value || '',
// // //         comment,
// // //         sale: product.sale || {},
// // //         purchase: product.purchase || {},
// // //         ...product[product.type],
// // //         rate: typeof product[product.type].rate === 'object'
// // //           ? product[product.type].rate?.price
// // //           : product[product.type].rate,
// // //         product_id: Math.random().toString(36).substring(2, 9),
// // //       };

// // //       newProducts.push(productData);

// // //       const totalPrice = newProducts.reduce(
// // //         (acc, product) => Number(acc) + Number(product[invoiceHandler?.isPurchase ? "purchase" : "sale"]?.net_price || 0),
// // //         0
// // //       );

// // //       invoiceHandler?.setFormValue({
// // //         ...invoiceHandler?.formValue,
// // //         selectedProduct: newProducts,
// // //         totalPrice,
// // //       });

// // //       AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY)
// // //         .then(() => console.log("Form data cleared after adding product to invoice"))
// // //         .catch((error) => console.error("Error clearing form data:", error));

// // //       resetProduct();
// // //       setFormChanged(false);

// // //       if (invoiceHandler && invoiceHandler.onSubmit) {
// // //         invoiceHandler.onSubmit();
// // //       }
// // //     } else {
// // //       setErrors(validator.errorMessages);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     if (productDetail) {
// // //       handleProductDetail(productDetail);
// // //     }
// // //   }, [productDetail]);

// // //   useEffect(() => {
// // //     resetProduct();
// // //     dispatch(fetchProductGroups());
// // //     if (updateData) {
// // //       dispatch(fetchProductDetail(updateData?.id));
// // //     }
// // //   }, [dispatch, updateData]);

// // //   const calculateInterestPeriod = (product) => {
// // //     if (!product?.bill_date || !product?.payment_date) return 0;

// // //     const startDate = product?.interest_start_date
// // //       ? moment(product.interest_start_date)
// // //       : moment(product.bill_date);

// // //     const endDate = moment(product.payment_date);

// // //     let days = endDate.diff(startDate, 'days');

// // //     if (product?.grace_period_enabled) {
// // //       days = Math.max(0, days - Number(product?.grace_period_days || 0));
// // //     }

// // //     return days;
// // //   };

// // //   const calculateInterest = (updatedProduct) => {
// // //     if (!updatedProduct.interest_enabled) {
// // //       return { interestAmount: 0, dailyBreakdown: [] };
// // //     }

// // //     const balance = parseFloat(updatedProduct[updatedProduct.type]?.net_price || 0);
// // //     const interestRate = parseFloat(updatedProduct.interest_rate || 0) / 100;
// // //     const interestType = updatedProduct.interest_type?.value;

// // //     let interestAmount = 0;
// // //     let dailyBreakdown = [];

// // //     const days = calculateInterestPeriod(updatedProduct);
// // //     if (days <= 0) return { interestAmount: 0, dailyBreakdown: [] };

// // //     const timeInYears = days / 365;

// // //     if (interestType === "2") {
// // //       interestAmount = balance * interestRate * timeInYears;
// // //     } else if (interestType === "1") {
// // //       interestAmount = balance * (Math.pow(1 + interestRate, timeInYears) - 1);
// // //     }

// // //     return { interestAmount, dailyBreakdown };
// // //   };

// // //   useEffect(() => {
// // //     if (product?.sale && product?.purchase) {
// // //       if (product.sale.tax_json && product.sale.tax_json.length > 0) {
// // //         const totalTax = product.sale.tax_json.reduce((sum, tax) => sum + Number(tax.amount || 0), 0);
// // //         handleInputChange("tax", totalTax, "sale");
// // //       }

// // //       if (product.purchase.tax_json && product.purchase.tax_json.length > 0) {
// // //         const totalTax = product.purchase.tax_json.reduce((sum, tax) => sum + Number(tax.amount || 0), 0);
// // //         handleInputChange("tax", totalTax, "purchase");
// // //       }
// // //     }
// // //   }, [product?.sale?.tax_json, product?.purchase?.tax_json]);

// // //   useEffect(() => {
// // //     if (product?.sale?.tax_json?.length > 0) {
// // //       const totalTax = product.sale.tax_json.reduce(
// // //         (sum, tax) => sum + Number(tax.amount || 0),
// // //         0
// // //       );
// // //       setProduct((prev) => ({
// // //         ...prev,
// // //         sale: {
// // //           ...prev.sale,
// // //           tax: totalTax,
// // //         },
// // //       }));
// // //     }

// // //     if (product?.purchase?.tax_json?.length > 0) {
// // //       const totalTax = product.purchase.tax_json.reduce(
// // //         (sum, tax) => sum + Number(tax.amount || 0),
// // //         0
// // //       );
// // //       setProduct((prev) => ({
// // //         ...prev,
// // //         purchase: {
// // //           ...prev.purchase,
// // //           tax: totalTax,
// // //         },
// // //       }));
// // //     }
// // //   }, [product?.sale?.tax_json, product?.purchase?.tax_json]);

// // //   useFocusEffect(
// // //     React.useCallback(() => {
// // //       const backAction = () => {
// // //         if (formChanged) {
// // //           Alert.alert(
// // //             "Form Data Saved",
// // //             isFromInvoice
// // //               ? "Your data has been saved. Do you want to return to the product list?"
// // //               : "Your entered data has been saved. You can continue editing later.",
// // //             [
// // //               { text: "Stay on Form", style: "cancel" },
// // //               {
// // //                 text: isFromInvoice ? "Back to List" : "Go Back",
// // //                 onPress: () => {
// // //                   if (isFromInvoice && handleCancel) {
// // //                     handleCancel();
// // //                   } else {
// // //                     navigation.goBack();
// // //                   }
// // //                 },
// // //               },
// // //             ]
// // //           );
// // //           return true;
// // //         } else if (isFromInvoice && handleCancel) {
// // //           handleCancel();
// // //           return true;
// // //         }
// // //         return false;
// // //       };

// // //       const backHandler = BackHandler.addEventListener(
// // //         "hardwareBackPress",
// // //         backAction
// // //       );

// // //       return () => backHandler.remove();
// // //     }, [formChanged, navigation, isFromInvoice, handleCancel])
// // //   );

// // //   useEffect(() => {
// // //     if (product?.interest_enabled) {
// // //       const { interestAmount } = calculateInterest(product);
// // //       handleInputChange("interest_amount", interestAmount.toString());
// // //     }
// // //   }, [
// // //     product?.bill_date,
// // //     product?.payment_date,
// // //     product?.interest_start_date,
// // //     product?.interest_rate,
// // //     product?.interest_type?.value,
// // //     product?.grace_period_enabled,
// // //     product?.grace_period_days,
// // //     product?.[product?.type]?.net_price,
// // //   ]);

// // //   useEffect(() => {
// // //     if (updateData) {
// // //       console.log('Received updateData:', updateData);

// // //       const hsnName = productGroups.find((item) => item.id == updateData.hsn_id);

// // //       const initialProductState = {
// // //         ...defaultProductState,
// // //         id: updateData.id,
// // //         type: updateData.type || formType,
// // //         name: updateData.name || "",
// // //         huid: updateData.huid || "",
// // //         hsn_id: hsnName ? { label: hsnName.name, value: hsnName.id, variation: hsnName.variation_data } : null,
// // //         size: updateData.size || "",
// // //         remark: updateData.remark || "",
// // //         comment: updateData.comment || "",
// // //         image: updateData.image || "",
// // //         additional_image: updateData.additional_image || null,
// // //         cutting_enabled: updateData.cutting_enabled || false,
// // //         interest_enabled: updateData.interest_enabled || false,
// // //         interest_type: updateData.interest_type || { label: "Flat", value: "2" },
// // //         interest_rate: updateData.interest_rate || "2",
// // //         interest_amount: updateData.interest_amount || "0",
// // //         bill_date: updateData.bill_date ? new Date(updateData.bill_date) : new Date(),
// // //         payment_date: updateData.payment_date ? new Date(updateData.payment_date) : null,
// // //         interest_start_date: updateData.interest_start_date ? new Date(updateData.interest_start_date) : null,
// // //         grace_period_enabled: updateData.grace_period_enabled || false,
// // //         grace_period_days: updateData.grace_period_days || "0",
// // //         interest_notes: updateData.interest_notes || "",
// // //         sale: {
// // //           ...defaultProductState.sale,
// // //           gross_weight: updateData.sale?.gross_weight || 0,
// // //           less_weight: updateData.sale?.less_weight || 0,
// // //           net_weight: updateData.sale?.net_weight || 0,
// // //           wastage: updateData.sale?.wastage || 0,
// // //           tounch: updateData.sale?.tounch || 0,
// // //           fine_weight: updateData.sale?.fine_weight || 0,
// // //           rate: updateData.sale?.rate || 0,
// // //           making_type: updateData.sale?.making_type || "",
// // //           making_charge: updateData.sale?.making_charge || 0,
// // //           metal_value: updateData.sale?.metal_value || "0",
// // //           charges_json: updateData.sale?.charges_json || [{}],
// // //           tax_json: updateData.sale?.tax_json || [{}],
// // //           custom_fields: updateData.sale?.custom_fields || [],
// // //           ...updateData.sale?.bill_display_settings,
// // //         },
// // //         purchase: {
// // //           ...defaultProductState.purchase,
// // //           gross_weight: updateData.purchase?.gross_weight || 0,
// // //           less_weight: updateData.purchase?.less_weight || 0,
// // //           net_weight: updateData.purchase?.net_weight || 0,
// // //           wastage: updateData.purchase?.wastage || 0,
// // //           tounch: updateData.purchase?.tounch || 0,
// // //           fine_weight: updateData.purchase?.fine_weight || 0,
// // //           rate: updateData.purchase?.rate || 0,
// // //           making_type: updateData.purchase?.making_type || "",
// // //           making_charge: updateData.purchase?.making_charge || 0,
// // //           metal_value: updateData.purchase?.metal_value || "0",
// // //           charges_json: updateData.purchase?.charges_json || [{}],
// // //           tax_json: updateData.purchase?.tax_json || [{}],
// // //           custom_fields: updateData.purchase?.custom_fields || [],
// // //           ...updateData.purchase?.bill_display_settings,
// // //         },
// // //       };

// // //       console.log('Setting initial product state:', initialProductState);
// // //       setProduct(initialProductState);
// // //       setDataLoaded(true);
// // //     } else {
// // //       loadFormData();
// // //     }
// // //   }, [updateData, productGroups]);

// // //   const handleUpdate = async () => {
// // //     try {
// // //       if (!product.name) {
// // //         ShowToast("Product name is required");
// // //         return;
// // //       }

// // //       setLoading(true);

// // //       const productId = updateData?.id || route?.params?.id;
// // //       if (!productId) {
// // //         throw new Error("Product ID is required for update");
// // //       }

// // //       const formData = new FormData();

// // //       formData.append('id', String(productId));
// // //       formData.append('name', product.name || '');
// // //       formData.append('huid', product.huid || '');
// // //       formData.append('hsn_id', product.hsn_id?.value || '');
// // //       formData.append('comment', product.comment || '');

// // //       if (product.image && typeof product.image === 'object' && product.image.uri) {
// // //         formData.append('image', {
// // //           uri: Platform.OS === 'ios' ? product.image.uri.replace('file://', '') : product.image.uri,
// // //           type: 'image/jpeg',
// // //           name: `product_${productId}_${Date.now()}.jpg`,
// // //         });
// // //       }

// // //       if (product.sale) {
// // //         formData.append('sale_gross_weight', String(product.sale.gross_weight || '0'));
// // //         formData.append('sale_less_weight', String(product.sale.less_weight || '0'));
// // //         formData.append('sale_net_weight', String(product.sale.net_weight || '0'));
// // //         formData.append('sale_wastage', String(product.sale.wastage || '0'));
// // //         formData.append('sale_tounch', String(product.sale.tounch || '0'));
// // //         formData.append('sale_fine_weight', String(product.sale.fine_weight || '0'));
// // //         formData.append('sale_rate', String((typeof product.sale.rate === 'object' ? product.sale.rate?.price : product.sale.rate) || '0'));
// // //         formData.append('sale_making_type', product.sale.making_type?.value || 'PG');
// // //         formData.append('sale_making_charges', String(product.sale.making_charge || '0'));
// // //         formData.append('sale_net_price', String(product.sale.net_price || '0'));
// // //         formData.append('sale_charges_json', JSON.stringify(product.sale.charges_json || []));
// // //         formData.append('sale_tax_json', JSON.stringify(product.sale.tax_json || []));
// // //       }

// // //       if (product.purchase) {
// // //         formData.append('purchase_gross_weight', String(product.purchase.gross_weight || '0'));
// // //         formData.append('purchase_less_weight', String(product.purchase.less_weight || '0'));
// // //         formData.append('purchase_net_weight', String(product.purchase.net_weight || '0'));
// // //         formData.append('purchase_wastage', String(product.purchase.wastage || '0'));
// // //         formData.append('purchase_tounch', String(product.purchase.tounch || '0'));
// // //         formData.append('purchase_fine_weight', String(product.purchase.fine_weight || '0'));
// // //         formData.append('purchase_rate', String((typeof product.purchase.rate === 'object' ? product.purchase.rate?.price : product.purchase.rate) || '0'));
// // //         formData.append('purchase_making_type', product.purchase.making_type?.value || 'PG');
// // //         formData.append('purchase_making_charges', String(product.purchase.making_charge || '0'));
// // //         formData.append('purchase_net_price', String(product.purchase.net_price || '0'));
// // //         formData.append('purchase_charges_json', JSON.stringify(product.purchase.charges_json || []));
// // //         formData.append('purchase_tax_json', JSON.stringify(product.purchase.tax_json || []));
// // //       }

// // //       const response = await ApiRequest({
// // //         url: MANAGE_PRODUCT_API.update,
// // //         method: 'POST',
// // //         body: formData,
// // //         headers: {
// // //           'Content-Type': 'multipart/form-data',
// // //         },
// // //       });

// // //       if (!response?.success) {
// // //         console.log('Update API Error Response:', response);
// // //         throw new Error(response?.message || response?.error || "Failed to update product");
// // //       }

// // //       try {
// // //         await ApiRequest({
// // //           url: MANAGE_LOGS_API.create,
// // //           method: 'POST',
// // //           body: {
// // //             userName: profileData?.name || 'Unknown User',
// // //             productName: product.name,
// // //             id: productId,
// // //             type: 'product',
// // //             amount: parseFloat(product[product.type]?.net_price || 0).toFixed(2),
// // //             action: 'UPDATE',
// // //             entityType: 'PRODUCT',
// // //             timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
// // //             metadata: JSON.stringify({
// // //               action: 'Updated product',
// // //               productId: productId,
// // //               note: `Updated product: ${product.name}`,
// // //             }),
// // //           },
// // //         });
// // //       } catch (logError) {
// // //         console.error("Failed to create update log:", logError);
// // //       }

// // //       await AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY);
// // //       ShowToast(response.message || "Product updated successfully");
// // //       navigation.goBack();
// // //     } catch (error) {
// // //       console.error('Update error details:', error);
// // //       ShowToast(error.message || "Error updating product. Please try again.");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     dispatch(fetchProductList());
// // //   }, []);

// // //   const handleProductSelect = (selectedProduct) => {
// // //     setProduct((prev) => ({
// // //       ...prev,
// // //       ...selectedProduct,
// // //       name: selectedProduct.name,
// // //       huid: selectedProduct.huid,
// // //       hsn_id: selectedProduct.hsn_id,
// // //       image: selectedProduct.image_url,
// // //       type: selectedProduct.type || prev.type,
// // //     }));
// // //     setShowSuggestions(false);
// // //   };

// // //   return (
// // //     <Fragment>
// // //       <KeyboardHanlder>
// // //         <View className="pt-4">
// // //           <View className="px-4">
// // //             {isFromInvoice ? (
// // //               <SearchProduct
// // //                 productValue={product}
// // //                 setProductValue={setProduct}
// // //                 handleProductDetail={handleProductDetail}
// // //               />
// // //             ) : (
// // //               <View className="flex mb-4 flex-row">
// // //                 <ImagePickerComponent
// // //                   onChange={({ value, name }) => handleInputChange(name, value)}
// // //                   value={product?.image}
// // //                   name="image"
// // //                 />
// // //                 <View className="w-5/6 pl-3">
// // //                   <View className="relative">
// // //                     <InputBox
// // //                       name="name"
// // //                       label="Name"
// // //                       value={product?.name}
// // //                       onChange={({ value, name }) => handleInputChange(name, value)}
// // //                       error={errors?.name}
// // //                     />
// // //                     {validator.message("name", product?.name, "required")}
// // //                     {showSuggestions && filteredProducts.length > 0 && (
// // //                       <View className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-40">
// // //                         <FlatList
// // //                           data={filteredProducts}
// // //                           keyExtractor={(item) => item.id}
// // //                           renderItem={({ item }) => (
// // //                             <TouchableOpacity
// // //                               className="p-3 border-b border-gray-100"
// // //                               onPress={() => handleProductSelect(item)}
// // //                             >
// // //                               <Text className="text-gray-800">{item.name}</Text>
// // //                               {item.huid && (
// // //                                 <Text className="text-xs text-gray-500">HUID: {item.huid}</Text>
// // //                               )}
// // //                             </TouchableOpacity>
// // //                           )}
// // //                         />
// // //                       </View>
// // //                     )}
// // //                   </View>
// // //                 </View>
// // //               </View>
// // //             )}

// // //             <View className="mb-4">
// // //               <InputBox
// // //                 name="remark"
// // //                 label="Remark"
// // //                 multiLine={true}
// // //                 value={product?.remark}
// // //                 onChange={({ value, name }) => handleInputChange(name, value)}
// // //                 placeholder="Add a remark about this item..."
// // //               />
// // //             </View>

// // //             <View className="mb-4">
// // //               <Text className="text-sm font-medium mb-1">Item Photo</Text>
// // //               <ImagePickerComponent
// // //                 name="image"
// // //                 value={product?.image || null}
// // //                 onChange={({ value, name }) => {
// // //                   const safeValue = value ? {
// // //                     uri: value.uri || null,
// // //                     fileName: value.fileName || null,
// // //                     mimeType: value.mimeType || 'image/jpeg',
// // //                   } : null;
// // //                   handleInputChange(name, safeValue);
// // //                 }}
// // //               />
// // //               <Text className="text-xs text-gray-500 mt-1">Upload a photo of the item</Text>
// // //             </View>

// // //             <View className="mb-4">
// // //               <InputBox
// // //                 name="size"
// // //                 label="Size"
// // //                 value={product?.size}
// // //                 placeholder="e.g., 7, 8.5, Medium, 16mm"
// // //                 onChange={({ value, name }) => handleInputChange(name, value)}
// // //               />
// // //               <View className="flex flex-row items-center justify-between mt-1">
// // //                 <Text className="text-xs text-gray-500">Enter ring size, bangle diameter, etc.</Text>
// // //                 <Switch
// // //                   value={product?.[product.type]?.showSizeInBill || false}
// // //                   onValueChange={(value) => handleInputChange("showSizeInBill", value, product.type)}
// // //                   trackColor={{ false: "red", true: "green" }}
// // //                   thumbColor={product?.[product.type]?.showSizeInBill ? "#ffffff" : "#f4f3f4"}
// // //                 />
// // //               </View>
// // //             </View>

// // //             <View className="mb-4">
// // //               <InputBox
// // //                 multiLine={true}
// // //                 name="comment"
// // //                 label="Comment"
// // //                 value={product?.comment}
// // //                 onChange={({ value, name }) => handleInputChange(name, value)}
// // //               />
// // //               <View className="flex flex-row items-center justify-between mt-1">
// // //                 <Text className="text-xs text-gray-500"></Text>
// // //                 <Switch
// // //                   value={product?.[product.type]?.showCommentInBill || false}
// // //                   onValueChange={(value) => handleInputChange("showCommentInBill", value, product.type)}
// // //                   trackColor={{ false: "red", true: "green" }}
// // //                   thumbColor={product?.[product.type]?.showCommentInBill ? "#ffffff" : "#f4f3f4"}
// // //                 />
// // //               </View>
// // //             </View>

// // //             <View className="flex mb-4 flex-row">
// // //               {productTypes.map((type) => (
// // //                 <View key={type} className={`w-1/2`}>
// // //                   <TouchableOpacity
// // //                     className={`
// // //                       py-2 
// // //                       ${type === "sale" ? "ml-1.5" : "mr-1.5"}
// // //                       border border-primary 
// // //                       rounded-md 
// // //                       flex flex-row 
// // //                       justify-center 
// // //                       items-center 
// // //                       shadow-xl
// // //                       ${product?.type === type ? "bg-primary" : "bg-white"}
// // //                       relative
// // //                       ${isFromInvoice ? "opacity-75" : ""}
// // //                     `}
// // //                     onPress={() => handleProductTypeChange(type)}
// // //                     disabled={isFromInvoice}
// // //                   >
// // //                     <Text
// // //                       className={`${
// // //                         product?.type === type ? "text-white" : "text-primary"
// // //                       } tracking-wider capitalize font-medium`}
// // //                     >
// // //                       {type.charAt(0).toUpperCase() + type.slice(1)}
// // //                     </Text>
// // //                     {product?.type === type && (
// // //                       <View className="absolute right-2">
// // //                         <AntDesign
// // //                           name="checkcircle"
// // //                           size={16}
// // //                           color="white"
// // //                         />
// // //                       </View>
// // //                     )}
// // //                   </TouchableOpacity>
// // //                 </View>
// // //               ))}
// // //             </View>

// // //             <View className="mb-4 flex flex-row">
// // //               <View className="w-2/5 pr-1.5">
// // //                 <InputBox
// // //                   name="huid"
// // //                   label="HUID"
// // //                   value={product?.huid}
// // //                   onChange={({ value, name }) => handleInputChange(name, value)}
// // //                   keyboardType="default"
// // //                 />
// // //                 <View className="flex flex-row items-center justify-between mt-1">
// // //                   <Text className="text-xs text-gray-500"></Text>
// // //                   <Switch
// // //                     value={product?.[product.type]?.showHuidInBill || false}
// // //                     onValueChange={(value) => handleInputChange("showHuidInBill", value, product.type)}
// // //                     trackColor={{ false: "red", true: "green" }}
// // //                     thumbColor={product?.[product.type]?.showHuidInBill ? "#ffffff" : "#f4f3f4"}
// // //                   />
// // //                 </View>
// // //               </View>
// // //               <View className="w-3/5 flex items-start flex-row pl-1.5">
// // //                 <View className="w-full pr-2">
// // //                   <SelectInput
// // //                     label="HSN Name"
// // //                     name="hsn_id"
// // //                     value={product?.hsn_id}
// // //                     placeholder="Select"
// // //                     error={errors?.hsn_id}
// // //                     data={productGroups.map((item) => ({
// // //                       label: item.name,
// // //                       value: item.id,
// // //                       variation: item.variation_data,
// // //                     }))}
// // //                     onSelect={(value) => handleInputChange("hsn_id", value)}
// // //                   />
// // //                   {validator.message("hsn_id", product?.hsn_id, "required")}
// // //                   <View className="flex flex-row items-center justify-between mt-1">
// // //                     <Text className="text-xs text-gray-500"></Text>
// // //                     <Switch
// // //                       value={product?.[product.type]?.showHsnInBill || false}
// // //                       onValueChange={(value) => handleInputChange("showHsnInBill", value, product.type)}
// // //                       trackColor={{ false: "red", true: "green" }}
// // //                       thumbColor={product?.[product.type]?.showHsnInBill ? "#ffffff" : "#f4f3f4"}
// // //                     />
// // //                   </View>
// // //                 </View>
// // //                 {!isFromInvoice && (
// // //                   <TouchableOpacity
// // //                     onPress={() => handleInitialState("metalModal", true)}
// // //                     activeOpacity={0.7}
// // //                     className="bg-primary w-8 h-8 mt-6 flex justify-center items-center rounded-full shadow-xl"
// // //                   >
// // //                     <FontAwesome6 name="plus" size={17} color="white" />
// // //                   </TouchableOpacity>
// // //                 )}
// // //               </View>
// // //             </View>

// // //             {/* Variation Dropdown */}
// // //             {isSelectRate && (
// // //               <View className="mb-4">
// // //                 <SelectInput
// // //                   label="Variation"
// // //                   name="variation"
// // //                   value={product?.[product.type]?.rate}
// // //                   placeholder="Select Variation"
// // //                   data={product?.hsn_id?.variation?.map((item) => ({
// // //                     label: `${item.name} (₹${item.price})`,
// // //                     value: item,
// // //                   })) || []}
// // //                   onSelect={(value) => handleInputChange("variation", value, product.type)}
// // //                 />
// // //               </View>
// // //             )}
// // //           </View>

// // //           <View className="px-4 mb-4">
// // //             <View className="bg-gray-50 rounded-lg p-4">
// // //               <View className="flex-row items-center justify-between mb-4">
// // //                 <Text className="text-lg font-semibold">Interest Configuration</Text>
// // //                 <Switch
// // //                   value={product?.interest_enabled}
// // //                   onValueChange={(value) => handleInputChange("interest_enabled", value)}
// // //                   trackColor={{ false: "#767577", true: "#22c55e" }}
// // //                   thumbColor={product?.interest_enabled ? "#ffffff" : "#f4f3f4"}
// // //                 />
// // //               </View>

// // //               {product?.interest_enabled && (
// // //                 <>
// // //                   <View className="mb-4">
// // //                     <Text className="text-base font-medium mb-2">Important Dates</Text>
// // //                     <View className="space-y-3">
// // //                       <TouchableOpacity
// // //                         onPress={() => handleInitialState("billDatePicker", true)}
// // //                         className="border border-gray-300 rounded-md p-3"
// // //                       >
// // //                         <Text className="text-sm text-gray-500">Bill Date</Text>
// // //                         <Text className="text-base">
// // //                           {product?.bill_date ? moment(product.bill_date).format("DD MMM YYYY") : "Select Date"}
// // //                         </Text>
// // //                       </TouchableOpacity>
// // //                       <TouchableOpacity
// // //                         onPress={() => handleInitialState("paymentDatePicker", true)}
// // //                         className="border border-gray-300 rounded-md p-3"
// // //                       >
// // //                         <Text className="text-sm text-gray-500">Expected Payment Date</Text>
// // //                         <Text className="text-base">
// // //                           {product?.payment_date ? moment(product.payment_date).format("DD MMM YYYY") : "Select Date"}
// // //                         </Text>
// // //                       </TouchableOpacity>
// // //                       <TouchableOpacity
// // //                         onPress={() => handleInitialState("interestStartDatePicker", true)}
// // //                         className="border border-gray-300 rounded-md p-3"
// // //                       >
// // //                         <Text className="text-sm text-gray-500">Interest Start Date</Text>
// // //                         <Text className="text-base">
// // //                           {product?.interest_start_date ? moment(product.interest_start_date).format("DD MMM YYYY") : "Select Date"}
// // //                         </Text>
// // //                       </TouchableOpacity>
// // //                     </View>
// // //                   </View>
// // //                   <View className="mb-4">
// // //                     <Text className="text-base font-medium mb-2">Interest Details</Text>
// // //                     <View className="space-y-3">
// // //                       <SelectInput
// // //                         label="Interest Type"
// // //                         name="interest_type"
// // //                         value={product?.interest_type}
// // //                         placeholder="Select Type"
// // //                         data={[
// // //                           { label: "Flat", value: "2" },
// // //                           { label: "Compound", value: "1" },
// // //                         ]}
// // //                         onSelect={(value) => handleInputChange("interest_type", value)}
// // //                       />
// // //                       <InputBox
// // //                         name="interest_rate"
// // //                         label="Interest Rate (%)"
// // //                         value={product?.interest_rate}
// // //                         keyboardType="numeric"
// // //                         onChange={({ value }) => handleInputChange("interest_rate", value)}
// // //                       />
// // //                     </View>
// // //                   </View>
// // //                   <View className="mb-4">
// // //                     <View className="flex-row items-center justify-between mb-2">
// // //                       <Text className="text-base font-medium">Grace Period</Text>
// // //                       <Switch
// // //                         value={product?.grace_period_enabled}
// // //                         onValueChange={(value) => handleInputChange("grace_period_enabled", value)}
// // //                         trackColor={{ false: "#767577", true: "#22c55e" }}
// // //                         thumbColor={product?.grace_period_enabled ? "#ffffff" : "#f4f3f4"}
// // //                       />
// // //                     </View>
// // //                     {product?.grace_period_enabled && (
// // //                       <InputBox
// // //                         name="grace_period_days"
// // //                         label="Grace Period (Days)"
// // //                         value={product?.grace_period_days}
// // //                         keyboardType="numeric"
// // //                         onChange={({ value }) => handleInputChange("grace_period_days", value)}
// // //                       />
// // //                     )}
// // //                   </View>
// // //                   <View className="mb-4">
// // //                     <InputBox
// // //                       name="interest_notes"
// // //                       label="Interest Notes"
// // //                       value={product?.interest_notes}
// // //                       multiLine={true}
// // //                       numberOfLines={3}
// // //                       onChange={({ value }) => handleInputChange("interest_notes", value)}
// // //                       placeholder="Add any special notes about interest terms..."
// // //                     />
// // //                   </View>
// // //                   <View className="bg-white rounded-lg p-3 mb-4">
// // //                     <Text className="text-base font-medium mb-2">Interest Summary</Text>
// // //                     <View className="space-y-2">
// // //                       <View className="flex-row justify-between">
// // //                         <Text className="text-gray-600">Original Amount:</Text>
// // //                         <Text>₹{handleDigitsFix(product?.[product.type]?.net_price || 0)}</Text>
// // //                       </View>
// // //                       <View className="flex-row justify-between">
// // //                         <Text className="text-gray-600">Interest Period:</Text>
// // //                         <Text>{calculateInterestPeriod(product)} days</Text>
// // //                       </View>
// // //                       <View className="flex-row justify-between">
// // //                         <Text className="text-gray-600">Interest Amount:</Text>
// // //                         <Text>₹{handleDigitsFix(Number(product?.interest_amount || 0))}</Text>
// // //                       </View>
// // //                       <View className="flex-row justify-between pt-2 border-t border-gray-200">
// // //                         <Text className="font-medium">Total Amount:</Text>
// // //                         <Text className="font-medium">₹{handleDigitsFix(
// // //                           Number(product?.[product.type]?.net_price || 0) +
// // //                           Number(product?.interest_amount || 0)
// // //                         )}</Text>
// // //                       </View>
// // //                     </View>
// // //                   </View>
// // //                 </>
// // //               )}
// // //             </View>
// // //           </View>

// // //           {productTypes.map((category) => {
// // //             const isPurchase = category === "purchase";
// // //             return (
// // //               product?.type === category && (
// // //                 <View
// // //                   className="bg-slate-50 shadow-lg px-4 pt-4"
// // //                   key={category}
// // //                 >
// // //                   <View className="mb-4 flex flex-row">
// // //                     <View className="w-1/5 pr-1">
// // //                       <InputBox
// // //                         name="gross_weight"
// // //                         placeholder="0"
// // //                         label="Gross Wt"
// // //                         value={String(product?.[category]?.gross_weight || '')}
// // //                         onChange={({ value, name }) =>
// // //                           handleInputChange(name, value, category)
// // //                         }
// // //                         keyboardType="numeric"
// // //                       />
// // //                       <View className="flex flex-row items-center justify-between mt-1">
// // //                         <Text className="text-xs text-gray-500"></Text>
// // //                         <Switch
// // //                           value={product?.[category]?.showGrossWeightInBill || false}
// // //                           onValueChange={(value) => handleInputChange("showGrossWeightInBill", value, category)}
// // //                           trackColor={{ false: "red", true: "green" }}
// // //                           thumbColor={product?.[category]?.showGrossWeightInBill ? "#ffffff" : "#f4f3f4"}
// // //                         />
// // //                       </View>
// // //                     </View>
// // //                     <View className="w-1/5 px-1">
// // //                       <InputBox
// // //                         name="less_weight"
// // //                         placeholder="0"
// // //                         label="Less Wt"
// // //                         value={String(product?.[category]?.less_weight || '')}
// // //                         onChange={({ value, name }) =>
// // //                           handleInputChange(name, value, category)
// // //                         }
// // //                         keyboardType="numeric"
// // //                       />
// // //                       <View className="flex flex-row items-center justify-between mt-1">
// // //                         <Text className="text-xs text-gray-500"></Text>
// // //                         <Switch
// // //                           value={product?.[category]?.showLessWeightInBill || false}
// // //                           onValueChange={(value) => handleInputChange("showLessWeightInBill", value, category)}
// // //                           trackColor={{ false: "red", true: "green" }}
// // //                           thumbColor={product?.[category]?.showLessWeightInBill ? "#ffffff" : "#f4f3f4"}
// // //                         />
// // //                       </View>
// // //                     </View>
// // //                     <View className="w-1/5 px-1">
// // //                       <InputBox
// // //                         name="net_weight"
// // //                         placeholder="0"
// // //                         label="Net Wt"
// // //                         readOnly={true}
// // //                         value={String(product?.[category]?.net_weight || '')}
// // //                         onChange={({ value, name }) =>
// // //                           handleInputChange(name, value, category)
// // //                         }
// // //                         keyboardType="numeric"
// // //                       />
// // //                       <View className="flex flex-row items-center justify-between mt-1">
// // //                         <Text className="text-xs text-gray-500"></Text>
// // //                         <Switch
// // //                           value={product?.[category]?.showNetWeightInBill || false}
// // //                           onValueChange={(value) => handleInputChange("showNetWeightInBill", value, category)}
// // //                           trackColor={{ false: "red", true: "green" }}
// // //                           thumbColor={product?.[category]?.showNetWeightInBill ? "#ffffff" : "#f4f3f4"}
// // //                         />
// // //                       </View>
// // //                     </View>
// // //                     <View
// // //                       className={`w-2/5 ${isPurchase ? "flex-row-reverse" : "flex-row"} flex`}
// // //                     >
// // //                       <View
// // //                         className={`w-1/2 ${isPurchase ? "pl-0.5" : "pr-1 pl-0.5"}`}
// // //                       >
// // //                         <InputBox
// // //                           name="tounch"
// // //                           placeholder="0 %"
// // //                           label="Tounch"
// // //                           value={String(product?.[category]?.tounch || '')}
// // //                           onChange={({ value, name }) =>
// // //                             handleInputChange(name, value, category)
// // //                           }
// // //                           keyboardType="numeric"
// // //                         />
// // //                         <View className="flex flex-row items-center justify-between mt-1">
// // //                           <Text className="text-xs text-gray-500"></Text>
// // //                           <Switch
// // //                             value={product?.[category]?.showTounchInBill || false}
// // //                             onValueChange={(value) => handleInputChange("showTounchInBill", value, category)}
// // //                             trackColor={{ false: "red", true: "green" }}
// // //                             thumbColor={product?.[category]?.showTounchInBill ? "#ffffff" : "#f4f3f4"}
// // //                           />
// // //                         </View>
// // //                       </View>
// // //                       <View
// // //                         className={`w-1/2 ${isPurchase ? "pr-1 pl-0.5" : "pl-0.5"}`}
// // //                       >
// // //                         <InputBox
// // //                           name="wastage"
// // //                           placeholder="0 %"
// // //                           label="Wastage"
// // //                           value={String(product?.[category]?.wastage || '')}
// // //                           onChange={({ value, name }) =>
// // //                             handleInputChange(name, value, category)
// // //                           }
// // //                           keyboardType="numeric"
// // //                         />
// // //                         <View className="flex flex-row items-center justify-between mt-1">
// // //                           <Text className="text-xs text-gray-500"></Text>
// // //                           <Switch
// // //                             value={product?.[category]?.showWastageInBill || false}
// // //                             onValueChange={(value) => handleInputChange("showWastageInBill", value, category)}
// // //                             trackColor={{ false: "red", true: "green" }}
// // //                             thumbColor={product?.[category]?.showWastageInBill ? "#ffffff" : "#f4f3f4"}
// // //                           />
// // //                         </View>
// // //                       </View>
// // //                     </View>
// // //                   </View>

// // //                   <View className="mb-4 flex flex-row">
// // //                     <View className="w-1/3 pr-1">
// // //                       <InputBox
// // //                         name="fine_weight"
// // //                         label="Fine Weight"
// // //                         placeholder="0"
// // //                         readOnly={true}
// // //                         value={String(product?.[category]?.fine_weight || '')}
// // //                         onChange={({ value }) => handleInputChange("fine_weight", value, category)}
// // //                         keyboardType="numeric"
// // //                       />
// // //                       <View className="flex flex-row items-center justify-between mt-1">
// // //                         <Text className="text-xs text-gray-500"></Text>
// // //                         <Switch
// // //                           value={product?.[category]?.showFineWeightInBill || false}
// // //                           onValueChange={(value) => handleInputChange("showFineWeightInBill", value, category)}
// // //                           trackColor={{ false: "red", true: "green" }}
// // //                           thumbColor={product?.[category]?.showFineWeightInBill ? "#ffffff" : "#f4f3f4"}
// // //                         />
// // //                       </View>
// // //                     </View>
// // //                     <View className="w-1/3 px-1">
// // //                       <Text className="text-slate-500 text-[13px] mb-1">Cutting</Text>
// // //                       <View className="bg-gray-100 rounded-lg">
// // //                         <CommonButton
// // //                           title={product.cutting_enabled ? "ON" : "OFF"}
// // //                           onPress={() => {
// // //                             const currentType = product.type;
// // //                             const buttonRate = isSelectRate
// // //                               ? parseFloat(product[currentType]?.rate?.price) || 0
// // //                               : parseFloat(product[currentType]?.rate) || 0;
// // //                             const buttonFineWeight = parseFloat(product[currentType]?.fine_weight) || 0;
// // //                             const buttonMetalValue = !product.cutting_enabled ? (buttonFineWeight * buttonRate).toFixed(2) : "0";

// // //                             setProduct((prev) => ({
// // //                               ...prev,
// // //                               cutting_enabled: !prev.cutting_enabled,
// // //                               [currentType]: {
// // //                                 ...prev[currentType],
// // //                                 metal_value: buttonMetalValue,
// // //                               },
// // //                             }));
// // //                           }}
// // //                           isFilled={product.cutting_enabled}
// // //                           small
// // //                         />
// // //                       </View>
// // //                     </View>
// // //                     <View className="w-1/3 pl-1">
// // //                       <InputBox
// // //                         name="rate"
// // //                         label="Rate"
// // //                         placeholder="0"
// // //                         value={isSelectRate ? String(product?.[category]?.rate?.price || '') : String(product?.[category]?.rate || '')}
// // //                         readOnly={isSelectRate}
// // //                         onChange={({ value }) => handleInputChange("rate", value, category)}
// // //                         keyboardType="numeric"
// // //                       />
// // //                       <View className="flex flex-row items-center justify-between mt-1">
// // //                         <Text className="text-xs text-gray-500"></Text>
// // //                         <Switch
// // //                           value={product?.[category]?.showRateInBill || false}
// // //                           onValueChange={(value) => handleInputChange("showRateInBill", value, category)}
// // //                           trackColor={{ false: "red", true: "green" }}
// // //                           thumbColor={product?.[category]?.showRateInBill ? "#ffffff" : "#f4f3f4"}
// // //                         />
// // //                       </View>
// // //                     </View>
// // //                   </View>

// // //                   <View className="mb-4 flex flex-row">
// // //                     <View className="w-1/2 pr-1">
// // //                       <SelectInput
// // //                         label="Making Type"
// // //                         name="making_type"
// // //                         value={product?.[category]?.making_type}
// // //                         placeholder="Select"
// // //                         data={[
// // //                           { label: "Per Gram (PG)", value: "PG" },
// // //                           { label: "Per Piece (PP)", value: "PP" },
// // //                         ]}
// // //                         onSelect={(value) => handleInputChange("making_type", value, category)}
// // //                       />
// // //                     </View>
// // //                     <View className="w-1/2 pl-1">
// // //                       <InputBox
// // //                         name="making_charge"
// // //                         label="Making Charge"
// // //                         placeholder="0"
// // //                         value={String(product?.[category]?.making_charge || '')}
// // //                         onChange={({ value }) => handleInputChange("making_charge", value, category)}
// // //                         keyboardType="numeric"
// // //                       />
// // //                     </View>
// // //                   </View>

// // //                   <View className="mb-4 flex flex-row">
// // //                     <View className="w-full">
// // //                       <InputBox
// // //                         name="net_price"
// // //                         readOnly={true}
// // //                         label="Net Price"
// // //                         placeholder="0"
// // //                         value={handleDigitsFix(
// // //                           (
// // //                             (Number(product?.[category]?.fine_weight || 0) *
// // //                               Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0)) +
// // //                             (product?.[category]?.making_type?.value === "PG"
// // //                               ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // //                               : Number(product?.[category]?.making_charge || 0)) +
// // //                             ((product[category]?.charges_json || []).reduce((sum, charge) =>
// // //                               sum + Number(charge.amount || 0), 0))
// // //                           ) +
// // //                           (
// // //                             (
// // //                               (Number(product?.[category]?.fine_weight || 0) *
// // //                                 Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0)) +
// // //                               (product?.[category]?.making_type?.value === "PG"
// // //                                 ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // //                                 : Number(product?.[category]?.making_charge || 0)) +
// // //                               ((product[category]?.charges_json || []).reduce((sum, charge) =>
// // //                                 sum + Number(charge.amount || 0), 0))
// // //                             ) * (Number(product?.[category]?.tax || 0) / 100)
// // //                           )
// // //                         )}
// // //                         keyboardType="numeric"
// // //                       />
// // //                       <View className="flex flex-row items-center justify-between mt-1">
// // //                         <Text className="text-xs text-gray-500"></Text>
// // //                         <Switch
// // //                           value={product?.[category]?.showNetPriceInBill || false}
// // //                           onValueChange={(value) => handleInputChange("showNetPriceInBill", value, category)}
// // //                           trackColor={{ false: "red", true: "green" }}
// // //                           thumbColor={product?.[category]?.showNetPriceInBill ? "#ffffff" : "#f4f3f4"}
// // //                         />
// // //                       </View>
// // //                     </View>
// // //                   </View>

// // //                   <View className="mb-4 flex flex-row items-center bg-gray-50 px-3 py-2 rounded-lg">
// // //                     <Text className="text-gray-600">Show Price in Bill</Text>
// // //                     <Switch
// // //                       value={product?.[category]?.showPriceInBill ?? false}
// // //                       onValueChange={(value) => handleInputChange("showPriceInBill", value, category)}
// // //                       trackColor={{ false: "#767577", true: "green" }}
// // //                       thumbColor={product?.[category]?.showPriceInBill ? "#ffffff" : "#f4f3f4"}
// // //                     />
// // //                   </View>

// // //                   {product?.[category]?.showPriceInBill ? (
// // //                     <View className="mb-4 bg-gray-50 p-4 rounded-lg">
// // //                       <Text className="text-base font-semibold mb-3">Calculation Summary</Text>
// // //                       <View className="space-y-2">
// // //                         <View className="flex flex-row justify-between">
// // //                           <Text className="text-gray-600">Net Weight:</Text>
// // //                           <Text>{product?.[category]?.net_weight || 0} g</Text>
// // //                         </View>
// // //                         <View className="flex flex-row justify-between items-center">
// // //                           <Text className="text-gray-600">Fine Weight:</Text>
// // //                           <View className="flex flex-row items-center">
// // //                             <Text className="text-gray-500 text-sm mr-2">
// // //                               ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × ({Number(product?.[category]?.tounch || 0)}% + {Number(product?.[category]?.wastage || 0)}%))
// // //                             </Text>
// // //                             <Text className="font-medium">{handleDigitsFix(product?.[category]?.fine_weight || 0)} g</Text>
// // //                           </View>
// // //                         </View>
// // //                         <View className="flex flex-row justify-between items-center">
// // //                           <Text className="text-gray-600">Wastage Weight:</Text>
// // //                           <View className="flex flex-row items-center">
// // //                             <Text className="text-gray-500 text-sm mr-2">
// // //                               ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × {Number(product?.[category]?.wastage || 0)}%)
// // //                             </Text>
// // //                             <Text className="font-medium">{handleDigitsFix(
// // //                               Number(product?.[category]?.gross_weight || 0) *
// // //                               (Number(product?.[category]?.wastage || 0) / 100)
// // //                             )} g</Text>
// // //                           </View>
// // //                         </View>
// // //                         <View className="flex flex-row justify-between items-center">
// // //                           <Text className="text-gray-600">Total Weight with Wastage:</Text>
// // //                           <View className="flex flex-row items-center">
// // //                             <Text className="text-gray-500 text-sm mr-2">
// // //                               ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × (100% + {Number(product?.[category]?.wastage || 0)}%))
// // //                             </Text>
// // //                             <Text className="font-medium">{handleDigitsFix(
// // //                               Number(product?.[category]?.gross_weight || 0) *
// // //                               (1 + (Number(product?.[category]?.wastage || 0) / 100))
// // //                             )} g</Text>
// // //                           </View>
// // //                         </View>
// // //                         <View className="flex flex-row justify-between items-center">
// // //                           <Text className="text-gray-600">Wastage Value:</Text>
// // //                           <View className="flex flex-row items-center">
// // //                             <Text className="text-gray-500 text-sm mr-2">
// // //                               ({handleDigitsFix(
// // //                                 Number(product?.[category]?.gross_weight || 0) *
// // //                                 (Number(product?.[category]?.wastage || 0) / 100)
// // //                               )} × ({Number(product?.[category]?.tounch || 0)}% × ₹{handleDigitsFix(isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0}))
// // //                             </Text>
// // //                             <Text className="font-medium">₹{handleDigitsFix(
// // //                               (Number(product?.[category]?.gross_weight || 0) *
// // //                               (Number(product?.[category]?.wastage || 0) / 100)) *
// // //                               ((Number(product?.[category]?.tounch || 0) / 100) *
// // //                               Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // //                             )}</Text>
// // //                           </View>
// // //                         </View>
// // //                         <View className="flex flex-row justify-between items-center">
// // //                           <Text className="text-gray-600">Metal Value:</Text>
// // //                           <View className="flex flex-row items-center">
// // //                             {product.cutting_enabled ? (
// // //                               <>
// // //                                 <Text className="text-gray-500 text-sm mr-2">
// // //                                   ({handleDigitsFix(product?.[category]?.fine_weight || 0)} × ₹{handleDigitsFix(isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0})
// // //                                 </Text>
// // //                                 <Text className="font-medium">₹{handleDigitsFix(
// // //                                   Number(product?.[category]?.fine_weight || 0) *
// // //                                   Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0)
// // //                                 )}</Text>
// // //                               </>
// // //                             ) : (
// // //                               <Text className="font-medium">₹0.00 (Cutting OFF)</Text>
// // //                             )}
// // //                           </View>
// // //                         </View>
// // //                         <View className="flex flex-row justify-between items-center">
// // //                           <Text className="text-gray-600">Making Charges:</Text>
// // //                           <View className="flex flex-row items-center">
// // //                             {product?.[category]?.making_type?.value === "PG" ? (
// // //                               <Text className="text-gray-500 text-sm mr-2">
// // //                                 ({handleDigitsFix(product?.[category]?.net_weight || 0)} × ₹{handleDigitsFix(product?.[category]?.making_charge || 0)})
// // //                               </Text>
// // //                             ) : null}
// // //                             <Text className="font-medium">₹{handleDigitsFix(
// // //                               product?.[category]?.making_type?.value === "PG"
// // //                                 ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // //                                 : Number(product?.[category]?.making_charge || 0)
// // //                             )}</Text>
// // //                           </View>
// // //                         </View>
// // //                         <View className="mb-4">
// // //                           <View className="flex-row justify-between items-center mb-2">
// // //                             <Text className="text-gray-600 font-medium">Additional Charges</Text>
// // //                             <TouchableOpacity
// // //                               onPress={() => {
// // //                                 const updatedCharges = [...(product[category].charges_json || []), { name: '', amount: '0' }];
// // //                                 handleInputChange('charges_json', updatedCharges, category);
// // //                               }}
// // //                               className="bg-primary px-2 py-1 rounded-md"
// // //                             >
// // //                               <Text className="text-white">+ Add</Text>
// // //                             </TouchableOpacity>
// // //                           </View>
// // //                           {(product[category]?.charges_json || []).map((charge, index) => (
// // //                             <View key={index} className="flex-row items-center mb-2">
// // //                               <View className="flex-1 mr-2">
// // //                                 <OutlineInput
// // //                                   placeholder="Charge name"
// // //                                   value={charge.name}
// // //                                   maxLength={50}
// // //                                   onChangeText={(value) => {
// // //                                     const updatedCharges = [...(product[category].charges_json || [])];
// // //                                     updatedCharges[index] = { ...charge, name: value };
// // //                                     handleInputChange('charges_json', updatedCharges, category);
// // //                                   }}
// // //                                 />
// // //                               </View>
// // //                               <View className="w-24 mr-2">
// // //                                 <OutlineInput
// // //                                   placeholder="Amount"
// // //                                   value={String(charge.amount)}
// // //                                   keyboardType="numeric"
// // //                                   onChangeText={(value) => {
// // //                                     const updatedCharges = [...(product[category].charges_json || [])];
// // //                                     updatedCharges[index] = { ...charge, amount: value || '0' };
// // //                                     handleInputChange('charges_json', updatedCharges, category);
// // //                                   }}
// // //                                 />
// // //                               </View>
// // //                               <TouchableOpacity
// // //                                 onPress={() => {
// // //                                   const updatedCharges = (product[category].charges_json || []).filter((_, i) => i !== index);
// // //                                   handleInputChange('charges_json', updatedCharges, category);
// // //                                 }}
// // //                               >
// // //                                 <FontAwesome6 name="trash" size={16} color="red" />
// // //                               </TouchableOpacity>
// // //                             </View>
// // //                           ))}
// // //                           {(product[category]?.charges_json || []).length > 0 && (
// // //                             <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-200">
// // //                               <Text className="text-gray-600">Total:</Text>
// // //                               <Text className="font-medium">₹{handleDigitsFix(
// // //                                 (product[category]?.charges_json || []).reduce((sum, charge) =>
// // //                                   sum + Number(charge.amount || 0), 0)
// // //                               )}</Text>
// // //                             </View>
// // //                           )}
// // //                         </View>
// // //                         <View className="flex flex-row justify-between items-center border-t border-gray-200 mt-2 pt-2">
// // //                           <Text className="text-gray-600 font-semibold">Subtotal:</Text>
// // //                           <Text className="font-semibold">₹{handleDigitsFix(
// // //                             (product.cutting_enabled
// // //                               ? (Number(product?.[category]?.fine_weight || 0) *
// // //                                  Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // //                               : 0) +
// // //                             (product?.[category]?.making_type?.value === "PG"
// // //                               ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // //                               : Number(product?.[category]?.making_charge || 0)) +
// // //                             (product[category]?.charges_json || []).reduce((sum, charge) => 
// // //                               sum + Number(charge.amount || 0), 0)
// // //                           )}</Text>
// // //                         </View>
// // //                        <View className="flex flex-row justify-between items-center">
// // //         <Text className="text-gray-600">Tax Amount ({Number(product?.[category]?.tax || 0)}%):</Text>
// // //         <Text className="font-medium">₹{handleDigitsFix(
// // //           (
// // //             (product.cutting_enabled ? 
// // //               (Number(product?.[category]?.fine_weight || 0) * 
// // //                Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // //              : 0) +
// // //             (product?.[category]?.making_type?.value === "PG" 
// // //               ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // //              : Number(product?.[category]?.making_charge || 0)) +
// // //             ((product[category]?.charges_json || []).reduce((sum, charge) => 
// // //               sum + Number(charge.amount || 0), 0))
// // //           ) * (Number(product?.[category]?.tax || 0) / 100)
// // //         )}</Text>
// // //       </View>
// // //       <View className="flex flex-row justify-between border-t border-gray-200 pt-2">
// // //         <Text className="text-gray-600 font-semibold">Final Price:</Text>
// // //         <Text className="font-semibold">₹{handleDigitsFix(
// // //           // Subtotal
// // //           (
// // //             (product.cutting_enabled ? 
// // //               (Number(product?.[category]?.fine_weight || 0) * 
// // //                Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // //              : 0) +
// // //             (product?.[category]?.making_type?.value === "PG"
// // //               ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // //              : Number(product?.[category]?.making_charge || 0)) +
// // //             ((product[category]?.charges_json || []).reduce((sum, charge) => 
// // //               sum + Number(charge.amount || 0), 0))
// // //           ) +
// // //           // Tax Amount
// // //           (
// // //             (product.cutting_enabled ? 
// // //               (Number(product?.[category]?.fine_weight || 0) * 
// // //                Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// // //              : 0) +
// // //             (product?.[category]?.making_type?.value === "PG"
// // //               ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// // //              : Number(product?.[category]?.making_charge || 0)) +
// // //             ((product[category]?.charges_json || []).reduce((sum, charge) => 
// // //               sum + Number(charge.amount || 0), 0))
// // //           ) * (Number(product?.[category]?.tax || 0) / 100)
// // //         )}</Text>
// // //       </View>
// // //     </View>
// // //   </View>
// // // ) : (
// // //   <View className="mb-4 bg-gray-50 p-4 rounded-lg">
// // //     <Text className="text-base font-semibold mb-3">Basic Weight Details</Text>
// // //     <View className="space-y-2">
// // //       <View className="flex flex-row justify-between">
// // //         <Text className="text-gray-600">Net Weight:</Text>
// // //         <Text>{product?.[category]?.net_weight || 0} g</Text>
// // //       </View>
// // //       <View className="flex flex-row justify-between items-center">
// // //         <Text className="text-gray-600">Fine Weight:</Text>
// // //         <View className="flex flex-row items-center">
// // //           <Text className="text-gray-500 text-sm mr-2">
// // //             ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × ({Number(product?.[category]?.tounch || 0)}% + {Number(product?.[category]?.wastage || 0)}%))
// // //           </Text>
// // //           <Text className="font-medium">{handleDigitsFix(product?.[category]?.fine_weight || 0)} g</Text>
// // //         </View>
// // //       </View>
// // //     </View>
// // //   </View>
// // // )}
// // //                   {/* charges and taxes */}
// // //                   <View className="mb-4">
// // //                     {/* Charges */}
// // //                     <View className="mb-5">
// // //                       <View className="flex flex-row items-center justify-between">
// // //                         <Text className="tracking-wider text-base">
// // //                           Charges
// // //                         </Text>
// // //                         <View className="flex flex-row items-center">
// // //                           <Switch
// // //                             value={product?.[category]?.showChargesInBill || false}
// // //                             onValueChange={(value) => handleInputChange("showChargesInBill", value, category)}
// // //                             trackColor={{ false: "red", true: "green" }}
// // //                             thumbColor={product?.[category]?.showChargesInBill ? "#ffffff" : "#f4f3f4"}
// // //                           />
// // //                         <TouchableOpacity
// // //                           onPress={() => addItem(category, "charges_json")}
// // //                           activeOpacity={0.7}
// // //                             className="bg-primary ml-2 w-6 h-6 flex justify-center items-center rounded-full shadow-xl"
// // //                         >
// // //                           <FontAwesome6 name="plus" size={17} color="white" />
// // //                         </TouchableOpacity>
// // //                         </View>
// // //                       </View>
// // //                       {/* Input fields */}
// // //                       {product[category]?.charges_json?.map((charge, index) => {
// // //                         return (
// // //                           <View
// // //                             key={index}
// // //                             className="flex pt-2 pl-1 items-end flex-row"
// // //                           >
// // //                             {/* charge name */}
// // //                             <View className="w-[45%] pr-2">
// // //                               <OutlineInput
// // //                                 placeholder="e.g. Labour Charge"
// // //                                 value={charge.name}
// // //                                 onChangeText={(value) =>
// // //                                   handleInputChange(
// // //                                     "name",
// // //                                     value,
// // //                                     category,
// // //                                     "charges_json",
// // //                                     index
// // //                                   )
// // //                                 }
// // //                               />
// // //                             </View>

// // //                             {/* amount */}
// // //                             <View className="w-[45%] px-2">
// // //                               <OutlineInput
// // //                                 placeholder="e.g. 500"
// // //                                 value={charge.amount}
// // //                                 keyboardType="numeric"
// // //                                 onChangeText={(value) =>
// // //                                   handleInputChange(
// // //                                     "amount",
// // //                                     value,
// // //                                     category,
// // //                                     "charges_json",
// // //                                     index
// // //                                   )
// // //                                 }
// // //                               />
// // //                             </View>

// // //                             {/* trash icon */}
// // //                             {product[category]?.charges_json.length > 1 && (
// // //                               <TouchableOpacity
// // //                                 onPress={() =>
// // //                                   removeChargeTaxInput(
// // //                                     category,
// // //                                     "charges_json",
// // //                                     index
// // //                                   )
// // //                                 }
// // //                                 activeOpacity={0.7}
// // //                                 className="w-[10%] flex justify-center pl-3"
// // //                               >
// // //                                 <FontAwesome6
// // //                                   name="trash"
// // //                                   size={15}
// // //                                   color="red"
// // //                                 />
// // //                               </TouchableOpacity>
// // //                             )}
// // //                           </View>
// // //                         );
// // //                       })}
// // //                     </View>

// // //                     {/* Taxes */}
// // //                     <View className="">
// // //                       <View className="flex flex-row items-center justify-between">
// // //                         <Text className="tracking-wider text-base">Tax</Text>
// // //                         <View className="flex flex-row items-center">
// // //                           <Switch
// // //                             value={product?.[category]?.showTaxInBill || false}
// // //                             onValueChange={(value) => handleInputChange("showTaxInBill", value, category)}
// // //                             trackColor={{ false: "red", true: "green" }}
// // //                             thumbColor={product?.[category]?.showTaxInBill ? "#ffffff" : "#f4f3f4"}
// // //                           />
// // //                         <TouchableOpacity
// // //                           onPress={() => addItem(category, "tax_json")}
// // //                           activeOpacity={0.7}
// // //                             className="bg-primary ml-2 w-6 h-6 flex justify-center items-center rounded-full shadow-xl"
// // //                         >
// // //                           <FontAwesome6 name="plus" size={17} color="white" />
// // //                         </TouchableOpacity>
// // //                         </View>
// // //                       </View>
// // //                       {/* Input fields */}
// // //                       {product[category]?.tax_json?.map((tax, index) => {
// // //                         return (
// // //                           <View
// // //                             key={index}
// // //                             className="flex pt-2 pl-1 items-end flex-row"
// // //                           >
// // //                             {/* tax name */}
// // //                             <View className="w-[45%] pr-2">
// // //                               <OutlineInput
// // //                                 placeholder="e.g. Tax"
// // //                                 value={tax.name}
// // //                                 onChangeText={(value) =>
// // //                                   handleInputChange(
// // //                                     "name",
// // //                                     value,
// // //                                     category,
// // //                                     "tax_json",
// // //                                     index
// // //                                   )
// // //                                 }
// // //                               />
// // //                             </View>

// // //                             {/* tax amount */}
// // //                             <View className="w-[45%] px-2">
// // //                               <OutlineInput
// // //                                 placeholder="e.g. 10%"
// // //                                 value={tax.amount}
// // //                                 keyboardType="numeric"
// // //                                 onChangeText={(value) =>
// // //                                   handleInputChange(
// // //                                     "amount",
// // //                                     value,
// // //                                     category,
// // //                                     "tax_json",
// // //                                     index
// // //                                   )
// // //                                 }
// // //                               />
// // //                             </View>

// // //                             {/* trash icon */}
// // //                             {product[category]?.tax_json.length > 1 && (
// // //                               <TouchableOpacity
// // //                                 onPress={() =>
// // //                                   removeChargeTaxInput(
// // //                                     category,
// // //                                     "tax_json",
// // //                                     index
// // //                                   )
// // //                                 }
// // //                                 activeOpacity={0.7}
// // //                                 className="w-[10%] flex justify-center pl-3"
// // //                               >
// // //                                 <FontAwesome6
// // //                                   name="trash"
// // //                                   size={15}
// // //                                   color="red"
// // //                                 />
// // //                               </TouchableOpacity>
// // //                             )}
// // //                           </View>
// // //                         );
// // //                       })}
// // //                     </View>
// // //                   </View>
// // //                 </View>
// // //               )
// // //             );
// // //           })}
// // //           {/* ---------  common for sale & purchase - END - ---------- */}

// // //           {/* Custom Fields Section */}
// // //           <View className="px-4 pb-4">
// // //             <View className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
// // //               <View className="flex-row items-center justify-between mb-4">
// // //                 <Text className="text-lg font-semibold text-gray-800">Custom Fields</Text>
// // //                 <TouchableOpacity
// // //                   onPress={() => {
// // //                     setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
// // //                     setCustomFieldModal(true);
// // //                   }}
// // //                   className="bg-primary px-4 py-2 rounded-full flex-row items-center"
// // //                 >
// // //                   <FontAwesome6 name="plus" size={14} color="white" className="mr-2" />
// // //                   <Text className="text-white font-medium ml-1">Add Field</Text>
// // //                 </TouchableOpacity>
// // //               </View>

// // //               {/* Custom Fields List */}
// // //               {(product[product.type]?.custom_fields || []).map((field, index) => (
// // //                 <View key={index} className="mb-4 bg-gray-50 p-3 rounded-lg">
// // //                   <View className="flex-row items-center justify-between">
// // //                     <View className="flex-1">
// // //                       <Text className="text-base font-medium">{field.label}</Text>
// // //                       <Text className="text-sm text-gray-600">{field.value} {field.unit?.value || ''}</Text>
// // //                     </View>
// // //                     <View className="flex-row items-center">
// // //                       <Switch
// // //                         value={field.showInBill}
// // //                         onValueChange={(value) => {
// // //                           const updatedFields = [...(product[product.type].custom_fields || [])];
// // //                           updatedFields[index] = { ...field, showInBill: value };
// // //                           handleInputChange("custom_fields", updatedFields, product.type);
// // //                         }}
// // //                         trackColor={{ false: "#767577", true: "#22c55e" }}
// // //                         thumbColor={field.showInBill ? "#ffffff" : "#f4f3f4"}
// // //                       />
// // //                       <TouchableOpacity
// // //                         onPress={() => {
// // //                           const updatedFields = (product[product.type].custom_fields || []).filter((_, i) => i !== index);
// // //                           handleInputChange("custom_fields", updatedFields, product.type);
// // //                         }}
// // //                         className="ml-4 bg-red-100 p-2 rounded-full"
// // //                       >
// // //                         <FontAwesome6 name="trash" size={16} color="#ef4444" />
// // //                       </TouchableOpacity>
// // //                     </View>
// // //                   </View>
// // //                 </View>
// // //               ))}

// // //               {!(product[product.type]?.custom_fields?.length > 0) && (
// // //                 <View className="items-center py-6 bg-gray-50 rounded-lg">
// // //                   <Text className="text-gray-500 text-sm">No custom fieldss added yet</Text>
// // //                   <Text className="text-gray-400 text-xs mt-1">Click the "Add Field" button to create custom fields</Text>
// // //                 </View>
// // //               )}
// // //             </View>
// // //           </View>

// // //           {/* Custom Field Modal */}
// // //           <Modal
// // //             visible={customFieldModal}
// // //             transparent
// // //             animationType="fade"
// // //             onRequestClose={() => setCustomFieldModal(false)}
// // //           >
// // //             <View className="flex-1 justify-center items-center bg-black/50">
// // //               <View className="bg-white p-4 rounded-lg w-[90%] max-w-md">
// // //                 <Text className="text-lg font-semibold mb-4">Add Custom Field</Text>
                
// // //                 {/* Field Label */}
// // //             <View className="mb-4">
// // //               <InputBox
// // //                     name="label"
// // //                     label="Field Label"
// // //                     placeholder="e.g., Less Weight 2"
// // //                     value={tempCustomField.label}
// // //                     onChange={({ value }) => setTempCustomField(prev => ({ ...prev, label: value }))}
// // //                   />
// // //                 </View>

// // //                 {/* Field Value */}
// // //                 <View className="mb-4">
// // //                   <InputBox
// // //                     name="value"
// // //                     label="Value"
// // //                     placeholder="Enter numeric value"
// // //                     value={tempCustomField.value}
// // //                     keyboardType="numeric"
// // //                     onChange={({ value }) => setTempCustomField(prev => ({ ...prev, value }))}
// // //                   />
// // //                 </View>

// // //                 {/* Unit Selection */}
// // //                 <View className="mb-4">
// // //                   <SelectInput
// // //                     label="Unit"
// // //                     name="unit"
// // //                     value={tempCustomField.unit}
// // //                     placeholder="Select Unit"
// // //                     data={jewelryUnits}
// // //                     onSelect={(value) => setTempCustomField(prev => ({ ...prev, unit: value }))}
// // //                   />
// // //                 </View>

// // //                 {/* Show in Bill Toggle */}
// // //                 <View className="flex-row items-center justify-between mb-6">
// // //                   <Text className="text-base text-gray-700">Show in Bill</Text>
// // //                   <Switch
// // //                     value={tempCustomField.showInBill}
// // //                     onValueChange={(value) => setTempCustomField(prev => ({ ...prev, showInBill: value }))}
// // //                     trackColor={{ false: "#767577", true: "#22c55e" }}
// // //                     thumbColor={tempCustomField.showInBill ? "#ffffff" : "#f4f3f4"}
// // //                   />
// // //                 </View>

// // //                 {/* Buttons */}
// // //                 <View className="flex-row justify-end space-x-2">
// // //                   <TouchableOpacity 
// // //                     onPress={() => {
// // //                       setCustomFieldModal(false);
// // //                       setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
// // //                     }}
// // //                     className="px-4 py-2"
// // //                   >
// // //                     <Text className="text-gray-600">Cancel</Text>
// // //                   </TouchableOpacity>
// // //                   <TouchableOpacity 
// // //                     onPress={() => {
// // //                       const updatedFields = [...(product[product.type]?.custom_fields || [])];
// // //                       updatedFields.push(tempCustomField);
// // //                       handleInputChange("custom_fields", updatedFields, product.type);
// // //                       setCustomFieldModal(false);
// // //                       setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
// // //                     }}
// // //                     className="bg-primary px-4 py-2 rounded-md"
// // //                   >
// // //                     <Text className="text-white">Done</Text>
// // //                   </TouchableOpacity>
// // //                 </View>
// // //               </View>
// // //             </View>
// // //           </Modal>

// // //           {/* Horizontal Layout for Photo + Buttons */}
// // //           <View className="flex-row px-4 pb-4">
// // //             {/* Additional Photo - Left Side */}
// // //             <View className="flex-1 pr-2">
// // //               <View className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
// // //                 <Text className="text-sm font-medium mb-2 text-center">Additional Photo</Text>
// // //                 <ImagePickerComponent
// // //                   name="additional_image"
// // //                   value={product?.additional_image}
// // //                 onChange={({ value, name }) => handleInputChange(name, value)}
// // //               />
// // //                 <Text className="text-xs text-gray-500 mt-2 text-center">
// // //                   Upload item photo
// // //                 </Text>
// // //               </View>
// // //             </View>

// // //             {/* Buttons - Right Side */}
// // //             <View className="w-1/3 pl-2">
// // //             {isFromInvoice ? (
// // //                 <View className="space-y-2">
// // //                 <CommonButton
// // //                   loading={loading}
// // //                   onPress={handleAddProduct}
// // //                   title="Add Product"
// // //                     />
// // //               </View>
// // //             ) : (
// // //                 <View className="space-y-2">
// // //                   <CommonButton
// // //                     loading={loading}
// // //                     onPress={onSubmitClick}
// // //                     title={route?.params?.isProductEdit || updateData ? "Update" : "Create"}
// // //                   />
// // //               </View>
// // //             )}
// // //             </View>
// // //           </View>
// // //         </View>
// // //       </KeyboardHanlder>

// // //       {/* Add weight */}
// // //       {updateData && (
// // //         <AddWeightModal
// // //           product={{ id: updateData.id, type: product?.type }}
// // //           open={initialState.weightModal}
// // //           onClose={() => handleInitialState("weightModal", false)}
// // //         />
// // //       )}

// // //       {/* Create metal */}
// // //       <CreateMetalModal
// // //         navigation={navigation}
// // //         route={route}
// // //         open={initialState.metalModal}
// // //         onClose={() => handleInitialState("metalModal", false)}
// // //       />

// // //       {/* Date Picker Modals */}
// // //       <Modal
// // //         visible={initialState.billDatePicker}
// // //         transparent
// // //         animationType="fade"
// // //         onRequestClose={() => handleInitialState("billDatePicker", false)}
// // //       >
// // //         <View className="flex-1 justify-center items-center bg-black/50">
// // //           <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
// // //             <Text className="text-lg font-semibold mb-4">Select Bill Date</Text>
            
// // //             <DatePickerComponent
// // //               name="bill_date"
// // //               value={product?.bill_date}
// // //               onSelect={({ value }) => {
// // //                 handleInputChange("bill_date", value);
// // //                 handleInitialState("billDatePicker", false);
// // //               }}
// // //             />

// // //             <TouchableOpacity 
// // //               onPress={() => handleInitialState("billDatePicker", false)}
// // //               className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
// // //             >
// // //               <Text className="text-white">Close</Text>
// // //             </TouchableOpacity>
// // //           </View>
// // //         </View>
// // //       </Modal>

// // //       <Modal
// // //         visible={initialState.paymentDatePicker}
// // //         transparent
// // //         animationType="fade"
// // //         onRequestClose={() => handleInitialState("paymentDatePicker", false)}
// // //       >
// // //         <View className="flex-1 justify-center items-center bg-black/50">
// // //           <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
// // //             <Text className="text-lg font-semibold mb-4">Select Expected Payment Date</Text>
            
// // //             <DatePickerComponent
// // //               name="payment_date"
// // //               value={product?.payment_date}
// // //               onSelect={({ value }) => {
// // //                 handleInputChange("payment_date", value);
// // //                 handleInitialState("paymentDatePicker", false);
// // //               }}
// // //             />

// // //             <TouchableOpacity 
// // //               onPress={() => handleInitialState("paymentDatePicker", false)}
// // //               className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
// // //             >
// // //               <Text className="text-white">Close</Text>
// // //             </TouchableOpacity>
// // //           </View>
// // //         </View>
// // //       </Modal>

// // //       <Modal
// // //         visible={initialState.interestStartDatePicker}
// // //         transparent
// // //         animationType="fade"
// // //         onRequestClose={() => handleInitialState("interestStartDatePicker", false)}
// // //       >
// // //         <View className="flex-1 justify-center items-center bg-black/50">
// // //           <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
// // //             <Text className="text-lg font-semibold mb-4">Select Interest Start Date</Text>
            
// // //             <DatePickerComponent
// // //               name="interest_start_date"
// // //               value={product?.interest_start_date}
// // //               onSelect={({ value }) => {
// // //                 handleInputChange("interest_start_date", value);
// // //                 handleInitialState("interestStartDatePicker", false);
// // //               }}
// // //             />

// // //             <TouchableOpacity 
// // //               onPress={() => handleInitialState("interestStartDatePicker", false)}
// // //               className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
// // //             >
// // //               <Text className="text-white">Close</Text>
// // //             </TouchableOpacity>
// // //           </View>
// // //         </View>
// // //       </Modal>

// // //     </Fragment>
// // //   );
// // // };

// // // export default ProductForm;

// // import InputBox from "@/src/components/common/InputBox";
// // import React, { Fragment, useEffect, useState } from "react";
// // import { View, TouchableOpacity, Switch, Modal, SafeAreaView, ScrollView, Alert, BackHandler, FlatList, Text, Platform } from "react-native";
// // import { useDispatch, useSelector } from "react-redux";
// // import SimpleReactValidator from "simple-react-validator";
// // import CommonButton from "@/src/components/common/buttons/CommonButton";
// // import SelectInput from "@/src/components/common/SelectInput";
// // import ImagePickerComponent from "@/src/components/common/ImagePicker";
// // import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
// // import {
// //   fetchProductDetail,
// //   fetchProductGroups,
// //   manageProductList,
// //   fetchProductList,
// // } from "@/src/redux/actions/product.action";
// // import KeyboardHanlder from "@/src/components/common/KeyboardHanlder";
// // import CreateMetalModal from "./CreateMetalModal";
// // import AddWeightModal from "./AddWeightModal";
// // import OutlineInput from "@/src/components/common/OutlineInput";
// // import SearchProduct from "./SearchProduct";
// // import { makingTypes } from "@/src/utils";
// // import AntDesign from "@expo/vector-icons/AntDesign";
// // import moment from "moment";
// // import DatePickerComponent from "@/src/components/common/DateTimePicker";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import { useFocusEffect } from "@react-navigation/native";
// // import { getToken } from "@/src/utils/auth";
// // import { ApiRequest } from "@/src/utils/api";
// // import { MANAGE_PRODUCT_API, MANAGE_LOGS_API, MANAGE_BILL_API } from "@/src/utils/api/endpoints";
// // import ShowToast from "@/src/components/common/ShowToast";

// // // Process sale and purchase data
// // export function processProductData(productData, prefix, isFromInvoice) {
// //   return productData.map((item) => {
// //     const processedItem = {
// //       gross_weight: 0,
// //       less_weight: 0,
// //       net_weight: 0,
// //       net_price: 0,
// //       wastage: 0,
// //       tounch: 0,
// //       fine_weight: 0,
// //       rate: 0,
// //       making_type: "",
// //       charges_json: [{}],
// //       tax_json: [{}],
// //       custom_fields: [], // Initialize custom_fields
// //     };
// //     for (const key in item) {
// //       if (key.startsWith(prefix)) {
// //         const newKey = key.replace(prefix, "");
// //         processedItem[newKey] = key.includes("_json")
// //           ? (() => {
// //               try {
// //                 return JSON.parse(item[key].replace(/'/g, '"'));
// //               } catch (e) {
// //                 console.error("Invalid JSON string:", item[key]);
// //                 return [{}];
// //               }
// //             })()
// //           : key === "making_type"
// //           ? makingTypes.find((type) => type.value === item[key]) || ""
// //           : item[key];
// //       }
// //     }
// //     return processedItem;
// //   });
// // }

// // // Storage key for form data
// // const PRODUCT_FORM_STORAGE_KEY = "productForm_savedState";

// // const ProductForm = ({
// //   navigation,
// //   route,
// //   isFromInvoice = false,
// //   invoiceHandler,
// //   handleCancel,
// // }) => {
// //   const updateData = route?.params?.updateData;
// //   const isBillEdit = route?.params?.isBillEdit;
// //   const billType = route?.params?.billType;
// //   const dispatch = useDispatch();
// //   const [errors, setErrors] = useState({});
// //   const [initialState, setInitialState] = useState({
// //     metalModal: false,
// //     weightModal: false,
// //     datePicker: false,
// //     billDatePicker: false,
// //     paymentDatePicker: false,
// //     interestStartDatePicker: false,
// //   });
// //   const [customFieldModal, setCustomFieldModal] = useState(false);
// //   const [tempCustomField, setTempCustomField] = useState({
// //     label: "",
// //     value: "",
// //     unit: "",
// //     showInBill: true,
// //   });
// //   const [dataLoaded, setDataLoaded] = useState(false);
// //   const [formChanged, setFormChanged] = useState(false);
// //   const [loading, setLoading] = useState(false);
// //   const [showSuggestions, setShowSuggestions] = useState(false);
// //   const [filteredProducts, setFilteredProducts] = useState([]);
// //   const { productGroups, isLoading: productLoading, productDetail, products } = useSelector(
// //     (state) => state.productSlices
// //   );
// //   const { profileData } = useSelector((state) => state.userSlices);
// //   const validator = new SimpleReactValidator();
// //   const productTypes = ["purchase", "sale"];

// //   const formType = isFromInvoice
// //     ? (invoiceHandler?.isPurchase ? "purchase" : "sale")
// //     : "purchase";

// //   const defaultProductState = {
// //     type: formType,
// //     size: "",
// //     interest_enabled: false,
// //     interest_type: { label: "Flat", value: "2" },
// //     interest_rate: "2",
// //     interest_amount: "0",
// //     bill_date: new Date(),
// //     payment_date: null,
// //     interest_start_date: null,
// //     interest_upto: null,
// //     grace_period_enabled: false,
// //     grace_period_days: "0",
// //     original_amount: "0",
// //     remaining_balance: "0",
// //     interest_notes: "",
// //     payment_history: [],
// //     cutting_enabled: false,
// //     sale: {
// //       gross_weight: 0,
// //       less_weight: 0,
// //       net_weight: 0,
// //       net_price: 0,
// //       wastage: 0,
// //       tounch: 0,
// //       fine_weight: 0,
// //       rate: 0,
// //       metal_value: "0",
// //       making_type: "",
// //       making_charge: 0,
// //       photo: null,
// //       charges_json: [{}],
// //       tax_json: [{}],
// //       custom_fields: [], // Initialize custom_fields
// //       showSizeInBill: true,
// //       showGrossWeightInBill: true,
// //       showLessWeightInBill: true,
// //       showNetWeightInBill: true,
// //       showWastageInBill: true,
// //       showTounchInBill: true,
// //       showFineWeightInBill: true,
// //       showRateInBill: true,
// //       showMakingChargeInBill: true,
// //       showHuidInBill: true,
// //       showHsnInBill: true,
// //       showPriceInBill: true,
// //       showTaxInBill: true,
// //       showChargesInBill: true,
// //       showCommentInBill: true,
// //     },
// //     purchase: {
// //       gross_weight: 0,
// //       less_weight: 0,
// //       net_weight: 0,
// //       net_price: 0,
// //       wastage: 0,
// //       tounch: 0,
// //       fine_weight: 0,
// //       rate: 0,
// //       metal_value: "0",
// //       making_type: "",
// //       making_charge: 0,
// //       photo: null,
// //       charges_json: [{}],
// //       tax_json: [{}],
// //       custom_fields: [], // Initialize custom_fields
// //       showSizeInBill: true,
// //       showGrossWeightInBill: true,
// //       showLessWeightInBill: true,
// //       showNetWeightInBill: true,
// //       showWastageInBill: true,
// //       showTounchInBill: true,
// //       showFineWeightInBill: true,
// //       showRateInBill: true,
// //       showMakingChargeInBill: true,
// //       showHuidInBill: true,
// //       showHsnInBill: true,
// //       showPriceInBill: true,
// //       showTaxInBill: true,
// //       showChargesInBill: true,
// //       showCommentInBill: true,
// //     },
// //   };

// //   const [product, setProduct] = useState(defaultProductState);

// //   const saveFormData = async (formData) => {
// //     try {
// //       await AsyncStorage.setItem(PRODUCT_FORM_STORAGE_KEY, JSON.stringify(formData));
// //       console.log("Form data saved to AsyncStorage");
// //       setFormChanged(true);
// //     } catch (error) {
// //       console.error("Error saving form data:", error);
// //     }
// //   };

// //   const loadFormData = async () => {
// //     try {
// //       const savedData = await AsyncStorage.getItem(PRODUCT_FORM_STORAGE_KEY);
// //       if (savedData) {
// //         const parsedData = JSON.parse(savedData);
// //         console.log("Loaded saved form data");
// //         setProduct(parsedData);
// //       }
// //       setDataLoaded(true);
// //     } catch (error) {
// //       console.error("Error loading form data:", error);
// //       setDataLoaded(true);
// //     }
// //   };

// //   useEffect(() => {
// //     if (updateData?.id) {
// //       dispatch(fetchProductDetail({ id: updateData.id }));
// //       setDataLoaded(true);
// //     } else {
// //       loadFormData();
// //     }
// //   }, []);

// //   const isSelectRate = product?.hsn_id?.variation?.length > 0;
// // console .log(isSelectRate,"dfdcdfdsdgdgsghgdgfsgydgfsghdfshfdghs")


// // const vl= product?.[product.type]?.variation


// // console.log('helooooddddddddddddddddddddddd',vl)
// //   const handleDigitsFix = (value) => {
// //     if (!value || isNaN(value)) return "0.00";
// //     return parseFloat(value).toFixed(2);
// //   };

// //   const jewelryUnits = [
// //     { label: "Grams (g)", value: "g" },
// //     { label: "Milligrams (mg)", value: "mg" },
// //     { label: "Carats (ct)", value: "ct" },
// //     { label: "Pieces (pcs)", value: "pcs" },
// //     { label: "Inches (in)", value: "in" },
// //     { label: "Millimeters (mm)", value: "mm" },
// //     { label: "Percentage (%)", value: "%" },
// //   ];

// //   const calculateTotalChargesAndTaxes = (category) => {
// //     let totalCharges = 0;
// //     let totalTaxPercentage = 0;

// //     if (category?.charges_json) {
// //       totalCharges = category.charges_json.reduce(
// //         (sum, charge) => sum + (Number(charge.amount) || 0),
// //         0
// //       );
// //     }

// //     if (category?.tax_json) {
// //       totalTaxPercentage = category.tax_json.reduce(
// //         (sum, tax) => sum + (Number(tax.amount) || 0),
// //         0
// //       );
// //     }

// //     return { totalCharges, totalTaxPercentage };
// //   };

// // const handleInputChange = (name, value, category, arrayKey, index) => {
// //   const updatedProduct = { ...product };

// //   if (arrayKey && typeof index === "number" && updatedProduct[category]?.[arrayKey]) {
// //     updatedProduct[category][arrayKey][index] = {
// //       ...updatedProduct[category][arrayKey][index],
// //       [name]: value,
// //     };
// //   } else if (category && updatedProduct[category]) {
// //     updatedProduct[category][name] = value;

// //     // Handle hsn_id change: reset variation and set rate based on new variations
// //     if (name === "hsn_id") {
// //       const variations = value?.variation || [];
// //       updatedProduct[category].variation = null; // Reset variation to null
// //       updatedProduct[category].rate = variations.length > 0 ? String(variations[0].price || "0") : "0"; // Set rate to first variation's price or 0
// //       updatedProduct.hsn_id = value; // Ensure hsn_id is updated at the root level
// //     }
// //     // Set rate when variation is selected
// //     if (name === "variation") {
// //       updatedProduct[category].rate = String(value?.price || "0"); // Update rate to selected variation's price
// //     }
// //   } else {
// //     updatedProduct[name] = value;
// //   }

// //   // Calculate net_weight and fine_weight
// //   if (['gross_weight', 'less_weight', 'wastage', 'tounch'].includes(name) && updatedProduct[category]) {
// //     const gross = parseFloat(updatedProduct[category].gross_weight) || 0;
// //     const less = parseFloat(updatedProduct[category].less_weight) || 0;
// //     const wastage = parseFloat(updatedProduct[category].wastage) || 0;
// //     const tounch = parseFloat(updatedProduct[category].tounch) || 0;

// //     updatedProduct[category].net_weight = (gross - less).toFixed(3);
// //     updatedProduct[category].fine_weight = (gross * ((tounch + wastage) / 100)).toFixed(3);
// //   }

// //   // Calculate metal_value and net_price
// //   if (['rate', 'hsn_id', 'variation', 'gross_weight', 'less_weight', 'wastage', 'tounch', 'making_charge', 'making_type'].includes(name) && updatedProduct[category]) {
// //     const fineWeight = parseFloat(updatedProduct[category].fine_weight) || 0;
// //     const rateValue = parseFloat(updatedProduct[category].rate || 0);
// //     const makingCharge = parseFloat(updatedProduct[category].making_charge) || 0;
// //     const netWeight = parseFloat(updatedProduct[category].net_weight) || 0;
// //     const chargesTotal = (updatedProduct[category].charges_json || []).reduce(
// //       (sum, charge) => sum + Number(charge.amount || 0),
// //       0
// //     );
// //     const taxRate = parseFloat(updatedProduct[category].tax || 0) / 100;

// //     updatedProduct[category].metal_value = (fineWeight * rateValue).toFixed(2);

// //     const subtotal = (fineWeight * rateValue) +
// //       (updatedProduct[category].making_type?.value === "PG"
// //         ? netWeight * makingCharge
// //         : makingCharge) +
// //       chargesTotal;

// //     updatedProduct[category].net_price = (subtotal + subtotal * taxRate).toFixed(2);
// //   }

// //   console.log('Updated product state:', updatedProduct); // Debug log
// //   setProduct(updatedProduct);
// //   saveFormData(updatedProduct);

// //   if (errors[name]) {
// //     setErrors((prev) => ({ ...prev, [name]: null }));
// //   }
// // };
// //   const handleInitialState = (name, value) => {
// //     setInitialState({ ...initialState, [name]: value });
// //   };

// //   const handleSubmit = async () => {
// //     try {
// //       if (!product.name) {
// //         ShowToast("Product name is required");
// //         return;
// //       }

// //       setLoading(true);

// //       const formData = new FormData();

// //       formData.append('name', product.name || '');
// //       formData.append('huid', product.huid || '');
// //       formData.append('hsn_id', product.hsn_id?.value || '');
// //       formData.append('bar_code', product.bar_code || '');
// //       formData.append('comment', product.comment || '');

// //       if (product.image && typeof product.image === 'object' && product.image.uri) {
// //         formData.append('image', {
// //           uri: Platform.OS === 'ios' ? product.image.uri.replace('file://', '') : product.image.uri,
// //           type: 'image/jpeg',
// //           name: `product_${Date.now()}.jpg`,
// //         });
// //       } else if (product.image && typeof product.image === 'string') {
// //         formData.append('image_url', product.image);
// //       }

// //       formData.append('sale_gross_weight', String(product.sale?.gross_weight || '0'));
// //       formData.append('sale_less_weight', String(product.sale?.less_weight || '0'));
// //       formData.append('sale_net_weight', String(product.sale?.net_weight || '0'));
// //       formData.append('sale_wastage', String(product.sale?.wastage || '0'));
// //       formData.append('sale_tounch', String(product.sale?.tounch || '0'));
// //       formData.append('sale_fine_weight', String(product.sale?.fine_weight || '0'));
// //       formData.append('sale_rate', String(product.sale?.rate || '0'));
// //       formData.append('sale_making_type', product.sale?.making_type?.value || 'PG');
// //       formData.append('sale_making_charges', String(product.sale?.making_charge || '0'));
// //       formData.append('sale_net_price', String(product.sale?.net_price || '0'));
// //       formData.append('sale_piece', '1');

// //       formData.append('purchase_gross_weight', String(product.purchase?.gross_weight || '0'));
// //       formData.append('purchase_less_weight', String(product.purchase?.less_weight || '0'));
// //       formData.append('purchase_net_weight', String(product.purchase?.net_weight || '0'));
// //       formData.append('purchase_wastage', String(product.purchase?.wastage || '0'));
// //       formData.append('purchase_tounch', String(product.purchase?.tounch || '0'));
// //       formData.append('purchase_fine_weight', String(product.purchase?.fine_weight || '0'));
// //       formData.append('purchase_rate', String(product.purchase?.rate || '0'));
// //       formData.append('purchase_making_type', product.purchase?.making_type?.value || 'PG');
// //       formData.append('purchase_making_charges', String(product.purchase?.making_charge || '0'));
// //       formData.append('purchase_net_price', String(product.purchase?.net_price || '0'));
// //       formData.append('purchase_piece', '1');

// //       formData.append('sale_charges_json', JSON.stringify(product.sale?.charges_json || []));
// //       formData.append('sale_tax_json', JSON.stringify(product.sale?.tax_json || []));
// //       formData.append('purchase_charges_json', JSON.stringify(product.purchase?.charges_json || []));
// //       formData.append('purchase_tax_json', JSON.stringify(product.purchase?.tax_json || []));

// //       const now = new Date();
// //       const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');

// //       const [productResponse, logResponse] = await Promise.all([
// //         ApiRequest({
// //           url: MANAGE_PRODUCT_API.create,
// //           method: 'POST',
// //           body: formData,
// //           headers: {
// //             'Content-Type': 'multipart/form-data',
// //           },
// //         }),
// //         ApiRequest({
// //           url: MANAGE_LOGS_API.create,
// //           method: 'POST',
// //           body: {
// //             userName: profileData?.name || 'Unknown User',
// //             productName: product.name || 'Unknown Product',
// //             id: 0,
// //             type: 'product',
// //             amount: parseFloat(product[product.type]?.net_price || 0).toFixed(2),
// //             action: 'CREATE',
// //             entityType: 'PRODUCT',
// //             timestamp: timestamp,
// //             metadata: JSON.stringify({
// //               action: 'Created new product',
// //               productId: product.product_id || 'new',
// //               note: `Created product: ${product.name}`,
// //               formData: {
// //                 sale_gross_weight: product.sale?.gross_weight || 0,
// //                 sale_net_weight: product.sale?.net_weight || 0,
// //                 sale_fine_weight: product.sale?.fine_weight || 0,
// //                 sale_net_price: product.sale?.net_price || 0,
// //               },
// //             }),
// //           },
// //         }),
// //       ]);

// //       if (!productResponse?.success) {
// //         throw new Error(productResponse?.message || "Failed to save product");
// //       }

// //       if (!logResponse?.success) {
// //         console.error("Warning: Product saved but log creation failed:", logResponse?.message);
// //         ShowToast("Product saved but logging failed");
// //       } else {
// //         ShowToast(productResponse.message || "Product created successfully");
// //       }

// //       await AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY);
// //       navigation.goBack();
// //     } catch (error) {
// //       console.error('Error details:', error);
// //       ShowToast(error.message || "Error saving product");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const onSubmitClick = () => {
// //     const isUpdate = route?.params?.isProductEdit || updateData?.id;
// //     if (isUpdate) {
// //       const formData = new FormData();
// //       formData.append('id', updateData?.id || route?.params?.id);
// //       handleUpdate();
// //     } else {
// //       handleSubmit();
// //     }
// //   };

// //   const resetProduct = async () => {
// //     Alert.alert(
// //       "Reset Form",
// //       "Are you sure you want to reset all form values?",
// //       [
// //         {
// //           text: "Cancel",
// //           style: "cancel",
// //         },
// //         {
// //           text: "Reset",
// //           onPress: async () => {
// //             try {
// //               await AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY);
// //               console.log("Form data cleared during reset");
// //               setProduct(defaultProductState);
// //               setFormChanged(false);
// //             } catch (error) {
// //               console.error("Error clearing form data:", error);
// //               ShowToast("Error clearing form data");
// //             }
// //           },
// //         },
// //       ]
// //     );
// //   };

// //   const addItem = (type, key) => {
// //     setProduct((prev) => ({
// //       ...prev,
// //       [type]: {
// //         ...prev[type],
// //         [key]: [
// //           ...prev[type][key],
// //           key === "charges_json"
// //             ? { name: "", amount: "0" }
// //             : { name: "", amount: "0" },
// //         ],
// //       },
// //     }));
// //   };

// //   const removeChargeTaxInput = (type, key, index) => {
// //     setProduct((prev) => {
// //       const updatedCategory = { ...prev[type] };
// //       const itemToRemove = updatedCategory[key].find((item, i) => i === index);
// //       updatedCategory[key] = updatedCategory[key].filter(
// //         (item, i) => i !== index
// //       );

// //       updatedCategory.net_price =
// //         Number(updatedCategory.net_price || 0) - Number(itemToRemove?.amount || 0);

// //       return {
// //         ...prev,
// //         [type]: updatedCategory,
// //       };
// //     });
// //   };

// //   const handleProductTypeChange = (type) => {
// //     const isSale = type === "sale";
// //     setProduct((prev) => {
// //       const updatedSale = isSale
// //         ? {
// //             ...prev.purchase,
// //             gross_weight: prev?.sale?.gross_weight || 0,
// //             less_weight: prev?.sale?.less_weight || 0,
// //             net_weight: prev?.sale?.net_weight || 0,
// //             net_price: prev?.sale?.net_price || 0,
// //           }
// //         : prev.sale;

// //       return { ...prev, sale: updatedSale, type };
// //     });
// //   };

// //   const handleProductDetail = (data) => {
// //     const {
// //       name,
// //       hsn_id,
// //       huid,
// //       comment,
// //       image_url,
// //       sale_product_data,
// //       purchase_product_data,
// //     } = data;

// //     const purchase = processProductData(
// //       purchase_product_data || [{}],
// //       "purchase_",
// //       isFromInvoice
// //     );
// //     const sale = processProductData(
// //       sale_product_data || [{}],
// //       "sale_",
// //       isFromInvoice
// //     );
// //     const hsnName = productGroups.find((item) => item.id == hsn_id);

// //     setProduct({
// //       ...defaultProductState,
// //       ...(isFromInvoice
// //         ? { product_id: data.id, product_name: data.name }
// //         : {}),
// //       name: name || "",
// //       huid: huid || "",
// //       comment: comment || "",
// //       image: image_url || "",
// //       hsn_id: hsnName ? { label: hsnName.name, value: hsnName.id, variation: hsnName.variation_data } : null,
// //       sale: sale[0] || defaultProductState.sale,
// //       purchase: purchase[0] || defaultProductState.purchase,
// //     });
// //   };

// //   const handleAddProduct = () => {
// //     if (validator.allValid()) {
// //       const newProducts = [
// //         ...(invoiceHandler?.formValue?.selectedProduct || []),
// //       ];

// //       const { name, hsn_id, huid, comment, image, size } = product;

// //       const productData = {
// //         name,
// //         huid,
// //         size,
// //         hsn_id: hsn_id?.value || '',
// //         comment,
// //         sale: product.sale || {},
// //         purchase: product.purchase || {},
// //         ...product[product.type],
// //         rate: product[product.type].rate,
// //         product_id: Math.random().toString(36).substring(2, 9),
// //       };

// //       newProducts.push(productData);

// //       const totalPrice = newProducts.reduce(
// //         (acc, product) => Number(acc) + Number(product[invoiceHandler?.isPurchase ? "purchase" : "sale"]?.net_price || 0),
// //         0
// //       );

// //       invoiceHandler?.setFormValue({
// //         ...invoiceHandler?.formValue,
// //         selectedProduct: newProducts,
// //         totalPrice,
// //       });

// //       AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY)
// //         .then(() => console.log("Form data cleared after adding product to invoice"))
// //         .catch((error) => console.error("Error clearing form data:", error));

// //       resetProduct();
// //       setFormChanged(false);

// //       if (invoiceHandler && invoiceHandler.onSubmit) {
// //         invoiceHandler.onSubmit();
// //       }
// //     } else {
// //       setErrors(validator.errorMessages);
// //     }
// //   };

// //   useEffect(() => {
// //     if (productDetail) {
// //       handleProductDetail(productDetail);
// //     }
// //   }, [productDetail]);

// //   useEffect(() => {
// //     resetProduct();
// //     dispatch(fetchProductGroups());
// //     if (updateData) {
// //       dispatch(fetchProductDetail(updateData?.id));
// //     }
// //   }, [dispatch, updateData]);

// //   const calculateInterestPeriod = (product) => {
// //     if (!product?.bill_date || !product?.payment_date) return 0;

// //     const startDate = product?.interest_start_date
// //       ? moment(product.interest_start_date)
// //       : moment(product.bill_date);

// //     const endDate = moment(product.payment_date);

// //     let days = endDate.diff(startDate, 'days');

// //     if (product?.grace_period_enabled) {
// //       days = Math.max(0, days - Number(product?.grace_period_days || 0));
// //     }

// //     return days;
// //   };

// //   const calculateInterest = (updatedProduct) => {
// //     if (!updatedProduct.interest_enabled) {
// //       return { interestAmount: 0, dailyBreakdown: [] };
// //     }

// //     const balance = parseFloat(updatedProduct[updatedProduct.type]?.net_price || 0);
// //     const interestRate = parseFloat(updatedProduct.interest_rate || 0) / 100;
// //     const interestType = updatedProduct.interest_type?.value;

// //     let interestAmount = 0;
// //     let dailyBreakdown = [];

// //     const days = calculateInterestPeriod(updatedProduct);
// //     if (days <= 0) return { interestAmount: 0, dailyBreakdown: [] };

// //     const timeInYears = days / 365;

// //     if (interestType === "2") {
// //       interestAmount = balance * interestRate * timeInYears;
// //     } else if (interestType === "1") {
// //       interestAmount = balance * (Math.pow(1 + interestRate, timeInYears) - 1);
// //     }

// //     return { interestAmount, dailyBreakdown };
// //   };

// //   useEffect(() => {
// //     if (product?.sale && product?.purchase) {
// //       if (product.sale.tax_json && product.sale.tax_json.length > 0) {
// //         const totalTax = product.sale.tax_json.reduce((sum, tax) => sum + Number(tax.amount || 0), 0);
// //         handleInputChange("tax", totalTax, "sale");
// //       }

// //       if (product.purchase.tax_json && product.purchase.tax_json.length > 0) {
// //         const totalTax = product.purchase.tax_json.reduce((sum, tax) => sum + Number(tax.amount || 0), 0);
// //         handleInputChange("tax", totalTax, "purchase");
// //       }
// //     }
// //   }, [product?.sale?.tax_json, product?.purchase?.tax_json]);

// //   useEffect(() => {
// //     if (product?.sale?.tax_json?.length > 0) {
// //       const totalTax = product.sale.tax_json.reduce(
// //         (sum, tax) => sum + Number(tax.amount || 0),
// //         0
// //       );
// //       setProduct((prev) => ({
// //         ...prev,
// //         sale: {
// //           ...prev.sale,
// //           tax: totalTax,
// //         },
// //       }));
// //     }

// //     if (product?.purchase?.tax_json?.length > 0) {
// //       const totalTax = product.purchase.tax_json.reduce(
// //         (sum, tax) => sum + Number(tax.amount || 0),
// //         0
// //       );
// //       setProduct((prev) => ({
// //         ...prev,
// //         purchase: {
// //           ...prev.purchase,
// //           tax: totalTax,
// //         },
// //       }));
// //     }
// //   }, [product?.sale?.tax_json, product?.purchase?.tax_json]);

// //   useFocusEffect(
// //     React.useCallback(() => {
// //       const backAction = () => {
// //         if (formChanged) {
// //           Alert.alert(
// //             "Form Data Saved",
// //             isFromInvoice
// //               ? "Your data has been saved. Do you want to return to the product list?"
// //               : "Your entered data has been saved. You can continue editing later.",
// //             [
// //               { text: "Stay on Form", style: "cancel" },
// //               {
// //                 text: isFromInvoice ? "Back to List" : "Go Back",
// //                 onPress: () => {
// //                   if (isFromInvoice && handleCancel) {
// //                     handleCancel();
// //                   } else {
// //                     navigation.goBack();
// //                   }
// //                 },
// //               },
// //             ]
// //           );
// //           return true;
// //         } else if (isFromInvoice && handleCancel) {
// //           handleCancel();
// //           return true;
// //         }
// //         return false;
// //       };

// //       const backHandler = BackHandler.addEventListener(
// //         "hardwareBackPress",
// //         backAction
// //       );

// //       return () => backHandler.remove();
// //     }, [formChanged, navigation, isFromInvoice, handleCancel])
// //   );

// //   useEffect(() => {
// //     if (product?.interest_enabled) {
// //       const { interestAmount } = calculateInterest(product);
// //       handleInputChange("interest_amount", interestAmount.toString());
// //     }
// //   }, [
// //     product?.bill_date,
// //     product?.payment_date,
// //     product?.interest_start_date,
// //     product?.interest_rate,
// //     product?.interest_type?.value,
// //     product?.grace_period_enabled,
// //     product?.grace_period_days,
// //     product?.[product?.type]?.net_price,
// //   ]);

// //   useEffect(() => {
// //     if (updateData) {
// //       console.log('Received updateData:', updateData);

// //       const hsnName = productGroups.find((item) => item.id == updateData.hsn_id);

// //       const initialProductState = {
// //         ...defaultProductState,
// //         id: updateData.id,
// //         type: updateData.type || formType,
// //         name: updateData.name || "",
// //         huid: updateData.huid || "",
// //         hsn_id: hsnName ? { label: hsnName.name, value: hsnName.id, variation: hsnName.variation_data } : null,
// //         size: updateData.size || "",
// //         remark: updateData.remark || "",
// //         comment: updateData.comment || "",
// //         image: updateData.image || "",
// //         additional_image: updateData.additional_image || null,
// //         cutting_enabled: updateData.cutting_enabled || false,
// //         interest_enabled: updateData.interest_enabled || false,
// //         interest_type: updateData.interest_type || { label: "Flat", value: "2" },
// //         interest_rate: updateData.interest_rate || "2",
// //         interest_amount: updateData.interest_amount || "0",
// //         bill_date: updateData.bill_date ? new Date(updateData.bill_date) : new Date(),
// //         payment_date: updateData.payment_date ? new Date(updateData.payment_date) : null,
// //         interest_start_date: updateData.interest_start_date ? new Date(updateData.interest_start_date) : null,
// //         grace_period_enabled: updateData.grace_period_enabled || false,
// //         grace_period_days: updateData.grace_period_days || "0",
// //         interest_notes: updateData.interest_notes || "",
// //         sale: {
// //           ...defaultProductState.sale,
// //           gross_weight: updateData.sale?.gross_weight || 0,
// //           less_weight: updateData.sale?.less_weight || 0,
// //           net_weight: updateData.sale?.net_weight || 0,
// //           wastage: updateData.sale?.wastage || 0,
// //           tounch: updateData.sale?.tounch || 0,
// //           fine_weight: updateData.sale?.fine_weight || 0,
// //           rate: updateData.sale?.rate || 0,
// //           making_type: updateData.sale?.making_type || "",
// //           making_charge: updateData.sale?.making_charge || 0,
// //           metal_value: updateData.sale?.metal_value || "0",
// //           charges_json: updateData.sale?.charges_json || [{}],
// //           tax_json: updateData.sale?.tax_json || [{}],
// //           custom_fields: updateData.sale?.custom_fields || [],
// //           ...updateData.sale?.bill_display_settings,
// //         },
// //         purchase: {
// //           ...defaultProductState.purchase,
// //           gross_weight: updateData.purchase?.gross_weight || 0,
// //           less_weight: updateData.purchase?.less_weight || 0,
// //           net_weight: updateData.purchase?.net_weight || 0,
// //           wastage: updateData.purchase?.wastage || 0,
// //           tounch: updateData.purchase?.tounch || 0,
// //           fine_weight: updateData.purchase?.fine_weight || 0,
// //           rate: updateData.purchase?.rate || 0,
// //           making_type: updateData.purchase?.making_type || "",
// //           making_charge: updateData.purchase?.making_charge || 0,
// //           metal_value: updateData.purchase?.metal_value || "0",
// //           charges_json: updateData.purchase?.charges_json || [{}],
// //           tax_json: updateData.purchase?.tax_json || [{}],
// //           custom_fields: updateData.purchase?.custom_fields || [],
// //           ...updateData.purchase?.bill_display_settings,
// //         },
// //       };

// //       console.log('Setting initial product state:', initialProductState);
// //       setProduct(initialProductState);
// //       setDataLoaded(true);
// //     } else {
// //       loadFormData();
// //     }
// //   }, [updateData, productGroups]);

// //   const handleUpdate = async () => {
// //     try {
// //       if (!product.name) {
// //         ShowToast("Product name is required");
// //         return;
// //       }

// //       setLoading(true);

// //       const productId = updateData?.id || route?.params?.id;
// //       if (!productId) {
// //         throw new Error("Product ID is required for update");
// //       }

// //       const formData = new FormData();

// //       formData.append('id', String(productId));
// //       formData.append('name', product.name || '');
// //       formData.append('huid', product.huid || '');
// //       formData.append('hsn_id', product.hsn_id?.value || '');
// //       formData.append('comment', product.comment || '');

// //       if (product.image && typeof product.image === 'object' && product.image.uri) {
// //         formData.append('image', {
// //           uri: Platform.OS === 'ios' ? product.image.uri.replace('file://', '') : product.image.uri,
// //           type: 'image/jpeg',
// //           name: `product_${productId}_${Date.now()}.jpg`,
// //         });
// //       }

// //       if (product.sale) {
// //         formData.append('sale_gross_weight', String(product.sale.gross_weight || '0'));
// //         formData.append('sale_less_weight', String(product.sale.less_weight || '0'));
// //         formData.append('sale_net_weight', String(product.sale.net_weight || '0'));
// //         formData.append('sale_wastage', String(product.sale.wastage || '0'));
// //         formData.append('sale_tounch', String(product.sale.tounch || '0'));
// //         formData.append('sale_fine_weight', String(product.sale.fine_weight || '0'));
// //         formData.append('sale_rate', String(product.sale.rate || '0'));
// //         formData.append('sale_making_type', product.sale.making_type?.value || 'PG');
// //         formData.append('sale_making_charges', String(product.sale.making_charge || '0'));
// //         formData.append('sale_net_price', String(product.sale.net_price || '0'));
// //         formData.append('sale_charges_json', JSON.stringify(product.sale.charges_json || []));
// //         formData.append('sale_tax_json', JSON.stringify(product.sale.tax_json || []));
// //       }

// //       if (product.purchase) {
// //         formData.append('purchase_gross_weight', String(product.purchase.gross_weight || '0'));
// //         formData.append('purchase_less_weight', String(product.purchase.less_weight || '0'));
// //         formData.append('purchase_net_weight', String(product.purchase.net_weight || '0'));
// //         formData.append('purchase_wastage', String(product.purchase.wastage || '0'));
// //         formData.append('purchase_tounch', String(product.purchase.tounch || '0'));
// //         formData.append('purchase_fine_weight', String(product.purchase.fine_weight || '0'));
// //         formData.append('purchase_rate', String(product.purchase.rate || '0'));
// //         formData.append('purchase_making_type', product.purchase.making_type?.value || 'PG');
// //         formData.append('purchase_making_charges', String(product.purchase.making_charge || '0'));
// //         formData.append('purchase_net_price', String(product.purchase.net_price || '0'));
// //         formData.append('purchase_charges_json', JSON.stringify(product.purchase.charges_json || []));
// //         formData.append('purchase_tax_json', JSON.stringify(product.purchase.tax_json || []));
// //       }

// //       const response = await ApiRequest({
// //         url: MANAGE_PRODUCT_API.update,
// //         method: 'POST',
// //         body: formData,
// //         headers: {
// //           'Content-Type': 'multipart/form-data',
// //         },
// //       });

// //       if (!response?.success) {
// //         console.log('Update API Error Response:', response);
// //         throw new Error(response?.message || response?.error || "Failed to update product");
// //       }

// //       try {
// //         await ApiRequest({
// //           url: MANAGE_LOGS_API.create,
// //           method: 
// //             'POST',
// //           body: {
// //             userName: profileData?.name || 'Unknown User',
// //             productName: product.name,
// //             id: productId,
// //             type: 'product',
// //             amount: parseFloat(product[product.type]?.net_price || 0).toFixed(2),
// //             action: 'UPDATE',
// //             entityType: 'PRODUCT',
// //             timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
// //             metadata: JSON.stringify({
// //               action: 'Updated product',
// //               productId: productId,
// //               note: `Updated product: ${product.name}`,
// //             }),
// //           },
// //         });
// //       } catch (logError) {
// //         console.error("Failed to create update log:", logError);
// //       }

// //       await AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY);
// //       ShowToast(response.message || "Product updated successfully");
// //       navigation.goBack();
// //     } catch (error) {
// //       console.error('Update error details:', error);
// //       ShowToast(error.message || "Error updating product. Please try again.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     dispatch(fetchProductList());
// //   }, []);

// //   const handleProductSelect = (selectedProduct) => {
// //     setProduct((prev) => ({
// //       ...prev,
// //       ...selectedProduct,
// //       name: selectedProduct.name,
// //       huid: selectedProduct.huid,
// //       hsn_id: selectedProduct.hsn_id,
// //       image: selectedProduct.image_url,
// //       type: selectedProduct.type || prev.type,
// //     }));
// //     setShowSuggestions(false);
// //   };

// //   return (
// //     <Fragment>
// //       <KeyboardHanlder>
// //         <View className="pt-4">
// //           <View className="px-4">
// //             {isFromInvoice ? (
// //               <SearchProduct
// //                 productValue={product}
// //                 setProductValue={setProduct}
// //                 handleProductDetail={handleProductDetail}
// //               />
// //             ) : (
// //               <View className="flex mb-4 flex-row">
// //                 <ImagePickerComponent
// //                   onChange={({ value, name }) => handleInputChange(name, value)}
// //                   value={product?.image}
// //                   name="image"
// //                 />
// //                 <View className="w-5/6 pl-3">
// //                   <View className="relative">
// //                     <InputBox
// //                       name="name"
// //                       label="Name"
// //                       value={product?.name}
// //                       onChange={({ value, name }) => handleInputChange(name, value)}
// //                       error={errors?.name}
// //                     />
// //                     {validator.message("name", product?.name, "required")}
// //                     {showSuggestions && filteredProducts.length > 0 && (
// //                       <View className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-40">
// //                         <FlatList
// //                           data={filteredProducts}
// //                           keyExtractor={(item) => item.id}
// //                           renderItem={({ item }) => (
// //                             <TouchableOpacity
// //                               className="p-3 border-b border-gray-100"
// //                               onPress={() => handleProductSelect(item)}
// //                             >
// //                               <Text className="text-gray-800">{item.name}</Text>
// //                               {item.huid && (
// //                                 <Text className="text-xs text-gray-500">HUID: {item.huid}</Text>
// //                               )}
// //                             </TouchableOpacity>
// //                           )}
// //                         />
// //                       </View>
// //                     )}
// //                   </View>
// //                 </View>
// //               </View>
// //             )}

// //             <View className="mb-4">
// //               <InputBox
// //                 name="remark"
// //                 label="Remark"
// //                 multiLine={true}
// //                 value={product?.remark}
// //                 onChange={({ value, name }) => handleInputChange(name, value)}
// //                 placeholder="Add a remark about this item..."
// //               />
// //             </View>

// //             <View className="mb-4">
// //               <Text className="text-sm font-medium mb-1">Item Photo</Text>
// //               <ImagePickerComponent
// //                 name="image"
// //                 value={product?.image || null}
// //                 onChange={({ value, name }) => {
// //                   const safeValue = value ? {
// //                     uri: value.uri || null,
// //                     fileName: value.fileName || null,
// //                     mimeType: value.mimeType || 'image/jpeg',
// //                   } : null;
// //                   handleInputChange(name, safeValue);
// //                 }}
// //               />
// //               <Text className="text-xs text-gray-500 mt-1">Upload a photo of the item</Text>
// //             </View>

// //             <View className="mb-4">
// //               <InputBox
// //                 name="size"
// //                 label="Size"
// //                 value={product?.size}
// //                 placeholder="e.g., 7, 8.5, Medium, 16mm"
// //                 onChange={({ value, name }) => handleInputChange(name, value)}
// //               />
// //               <View className="flex flex-row items-center justify-between mt-1">
// //                 <Text className="text-xs text-gray-500">Enter ring size, bangle diameter, etc.</Text>
// //                 <Switch
// //                   value={product?.[product.type]?.showSizeInBill || false}
// //                   onValueChange={(value) => handleInputChange("showSizeInBill", value, product.type)}
// //                   trackColor={{ false: "red", true: "green" }}
// //                   thumbColor={product?.[product.type]?.showSizeInBill ? "#ffffff" : "#f4f3f4"}
// //                 />
// //               </View>
// //             </View>

// //             <View className="mb-4">
// //               <InputBox
// //                 multiLine={true}
// //                 name="comment"
// //                 label="Comment"
// //                 value={product?.comment}
// //                 onChange={({ value, name }) => handleInputChange(name, value)}
// //               />
// //               <View className="flex flex-row items-center justify-between mt-1">
// //                 <Text className="text-xs text-gray-500"></Text>
// //                 <Switch
// //                   value={product?.[product.type]?.showCommentInBill || false}
// //                   onValueChange={(value) => handleInputChange("showCommentInBill", value, product.type)}
// //                   trackColor={{ false: "red", true: "green" }}
// //                   thumbColor={product?.[product.type]?.showCommentInBill ? "#ffffff" : "#f4f3f4"}
// //                 />
// //               </View>
// //             </View>

// //             <View className="flex mb-4 flex-row">
// //               {productTypes.map((type) => (
// //                 <View key={type} className={`w-1/2`}>
// //                   <TouchableOpacity
// //                     className={`
// //                       py-2 
// //                       ${type === "sale" ? "ml-1.5" : "mr-1.5"}
// //                       border border-primary 
// //                       rounded-md 
// //                       flex flex-row 
// //                       justify-center 
// //                       items-center 
// //                       shadow-xl
// //                       ${product?.type === type ? "bg-primary" : "bg-white"}
// //                       relative
// //                       ${isFromInvoice ? "opacity-75" : ""}
// //                     `}
// //                     onPress={() => handleProductTypeChange(type)}
// //                     disabled={isFromInvoice}
// //                   >
// //                     <Text
// //                       className={`${
// //                         product?.type === type ? "text-white" : "text-primary"
// //                       } tracking-wider capitalize font-medium`}
// //                     >
// //                       {type.charAt(0).toUpperCase() + type.slice(1)}
// //                     </Text>
// //                     {product?.type === type && (
// //                       <View className="absolute right-2">
// //                         <AntDesign
// //                           name="checkcircle"
// //                           size={16}
// //                           color="white"
// //                         />
// //                       </View>
// //                     )}
// //                   </TouchableOpacity>
// //                 </View>
// //               ))}
// //             </View>

// //             <View className="mb-4 flex flex-row">
// //               <View className="w-2/5 pr-1.5">
// //                 <InputBox
// //                   name="huid"
// //                   label="HUID"
// //                   value={product?.huid}
// //                   onChange={({ value, name }) => handleInputChange(name, value)}
// //                   keyboardType="default"
// //                 />
// //                 <View className="flex flex-row items-center justify-between mt-1">
// //                   <Text className="text-xs text-gray-500"></Text>
// //                   <Switch
// //                     value={product?.[product.type]?.showHuidInBill || false}
// //                     onValueChange={(value) => handleInputChange("showHuidInBill", value, product.type)}
// //                     trackColor={{ false: "red", true: "green" }}
// //                     thumbColor={product?.[product.type]?.showHuidInBill ? "#ffffff" : "#f4f3f4"}
// //                   />
// //                 </View>
// //               </View>
// //               <View className="w-3/5 flex items-start flex-row pl-1.5">
// //                 <View className="w-full pr-2">
// //                   <SelectInput
// //                     label="HSN Name"
// //                     name="hsn_id"
// //                     value={product?.hsn_id}
// //                     placeholder="Select"
// //                     error={errors?.hsn_id}
// //                     data={productGroups.map((item) => ({
// //                       label: item.name,
// //                       value: item.id,
// //                       variation: item.variation_data,
// //                     }))}
// //                     onSelect={(value) => handleInputChange("hsn_id", value)}
// //                   />
// //                   {validator.message("hsn_id", product?.hsn_id, "required")}
// //                   <View className="flex flex-row items-center justify-between mt-1">
// //                     <Text className="text-xs text-gray-500"></Text>
// //                     <Switch
// //                       value={product?.[product.type]?.showHsnInBill || false}
// //                       onValueChange={(value) => handleInputChange("showHsnInBill", value, product.type)}
// //                       trackColor={{ false: "red", true: "green" }}
// //                       thumbColor={product?.[product.type]?.showHsnInBill ? "#ffffff" : "#f4f3f4"}
// //                     />
// //                   </View>
// //                 </View>
// //                 {!isFromInvoice && (
// //                   <TouchableOpacity
// //                     onPress={() => handleInitialState("metalModal", true)}
// //                     activeOpacity={0.7}
// //                     className="bg-primary w-8 h-8 mt-6 flex justify-center items-center rounded-full shadow-xl"
// //                   >
// //                     <FontAwesome6 name="plus" size={17} color="white" />
// //                   </TouchableOpacity>
// //                 )}
// //               </View>
// //             </View>

// //             {/* Variation Dropdown */}
// //            {isSelectRate && (
// //   <View className="mb-4">
// //     <SelectInput
// //       label="Variation"
// //       name="variation"
// //       value={product?.[product.type]?.variation}
// //       placeholder="Select Variation"
// //       data={product?.hsn_id?.variation?.map((item) => ({
// //         label: `${item.name} (₹${item.price})`,
// //         value: item,
// //       })) || []}
// //       onSelect={(value) => handleInputChange("variation", value, product.type)}
// //     />
// //     {/* console.log() */}
// //   </View>
// // )}
// //           </View>

// //           <View className="px-4 mb-4">
// //             <View className="bg-gray-50 rounded-lg p-4">
// //               <View className="flex-row items-center justify-between mb-4">
// //                 <Text className="text-lg font-semibold">Interest Configuration</Text>
// //                 <Switch
// //                   value={product?.interest_enabled}
// //                   onValueChange={(value) => handleInputChange("interest_enabled", value)}
// //                   trackColor={{ false: "#767577", true: "#22c55e" }}
// //                   thumbColor={product?.interest_enabled ? "#ffffff" : "#f4f3f4"}
// //                 />
// //               </View>

// //               {product?.interest_enabled && (
// //                 <>
// //                   <View className="mb-4">
// //                     <Text className="text-base font-medium mb-2">Important Dates</Text>
// //                     <View className="space-y-3">
// //                       <TouchableOpacity
// //                         onPress={() => handleInitialState("billDatePicker", true)}
// //                         className="border border-gray-300 rounded-md p-3"
// //                       >
// //                         <Text className="text-sm text-gray-500">Bill Date</Text>
// //                         <Text className="text-base">
// //                           {product?.bill_date ? moment(product.bill_date).format("DD MMM YYYY") : "Select Date"}
// //                         </Text>
// //                       </TouchableOpacity>
// //                       <TouchableOpacity
// //                         onPress={() => handleInitialState("paymentDatePicker", true)}
// //                         className="border border-gray-300 rounded-md p-3"
// //                       >
// //                         <Text className="text-sm text-gray-500">Expected Payment Date</Text>
// //                         <Text className="text-base">
// //                           {product?.payment_date ? moment(product.payment_date).format("DD MMM YYYY") : "Select Date"}
// //                         </Text>
// //                       </TouchableOpacity>
// //                       <TouchableOpacity
// //                         onPress={() => handleInitialState("interestStartDatePicker", true)}
// //                         className="border border-gray-300 rounded-md p-3"
// //                       >
// //                         <Text className="text-sm text-gray-500">Interest Start Date</Text>
// //                         <Text className="text-base">
// //                           {product?.interest_start_date ? moment(product.interest_start_date).format("DD MMM YYYY") : "Select Date"}
// //                         </Text>
// //                       </TouchableOpacity>
// //                     </View>
// //                   </View>
// //                   <View className="mb-4">
// //                     <Text className="text-base font-medium mb-2">Interest Details</Text>
// //                     <View className="space-y-3">
// //                       <SelectInput
// //                         label="Interest Type"
// //                         name="interest_type"
// //                         value={product?.interest_type}
// //                         placeholder="Select Type"
// //                         data={[
// //                           { label: "Flat", value: "2" },
// //                           { label: "Compound", value: "1" },
// //                         ]}
// //                         onSelect={(value) => handleInputChange("interest_type", value)}
// //                       />
// //                       <InputBox
// //                         name="interest_rate"
// //                         label="Interest Rate (%)"
// //                         value={product?.interest_rate}
// //                         keyboardType="numeric"
// //                         onChange={({ value }) => handleInputChange("interest_rate", value)}
// //                       />
// //                     </View>
// //                   </View>
// //                   <View className="mb-4">
// //                     <View className="flex-row items-center justify-between mb-2">
// //                       <Text className="text-base font-medium">Grace Period</Text>
// //                       <Switch
// //                         value={product?.grace_period_enabled}
// //                         onValueChange={(value) => handleInputChange("grace_period_enabled", value)}
// //                         trackColor={{ false: "#767577", true: "#22c55e" }}
// //                         thumbColor={product?.grace_period_enabled ? "#ffffff" : "#f4f3f4"}
// //                       />
// //                     </View>
// //                     {product?.grace_period_enabled && (
// //                       <InputBox
// //                         name="grace_period_days"
// //                         label="Grace Period (Days)"
// //                         value={product?.grace_period_days}
// //                         keyboardType="numeric"
// //                         onChange={({ value }) => handleInputChange("grace_period_days", value)}
// //                       />
// //                     )}
// //                   </View>
// //                   <View className="mb-4">
// //                     <InputBox
// //                       name="interest_notes"
// //                       label="Interest Notes"
// //                       value={product?.interest_notes}
// //                       multiLine={true}
// //                       numberOfLines={3}
// //                       onChange={({ value }) => handleInputChange("interest_notes", value)}
// //                       placeholder="Add any special notes about interest terms..."
// //                     />
// //                   </View>
// //                   <View className="bg-white rounded-lg p-3 mb-4">
// //                     <Text className="text-base font-medium mb-2">Interest Summary</Text>
// //                     <View className="space-y-2">
// //                       <View className="flex-row justify-between">
// //                         <Text className="text-gray-600">Original Amount:</Text>
// //                         <Text>₹{handleDigitsFix(product?.[product.type]?.net_price || 0)}</Text>
// //                       </View>
// //                       <View className="flex-row justify-between">
// //                         <Text className="text-gray-600">Interest Period:</Text>
// //                         <Text>{calculateInterestPeriod(product)} days</Text>
// //                       </View>
// //                       <View className="flex-row justify-between">
// //                         <Text className="text-gray-600">Interest Amount:</Text>
// //                         <Text>₹{handleDigitsFix(Number(product?.interest_amount || 0))}</Text>
// //                       </View>
// //                       <View className="flex-row justify-between pt-2 border-t border-gray-200">
// //                         <Text className="font-medium">Total Amount:</Text>
// //                         <Text className="font-medium">₹{handleDigitsFix(
// //                           Number(product?.[product.type]?.net_price || 0) +
// //                           Number(product?.interest_amount || 0)
// //                         )}</Text>
// //                       </View>
// //                     </View>
// //                   </View>
// //                 </>
// //               )}
// //             </View>
// //           </View>

// //           {productTypes.map((category) => {
// //             const isPurchase = category === "purchase";
// //             return (
// //               product?.type === category && (
// //                 <View
// //                   className="bg-slate-50 shadow-lg px-4 pt-4"
// //                   key={category}
// //                 >
// //                   <View className="mb-4 flex flex-row">
// //                     <View className="w-1/5 pr-1">
// //                       <InputBox
// //                         name="gross_weight"
// //                         placeholder="0"
// //                         label="Gross Wt"
// //                         value={String(product?.[category]?.gross_weight || '')}
// //                         onChange={({ value, name }) =>
// //                           handleInputChange(name, value, category)
// //                         }
// //                         keyboardType="numeric"
// //                       />
// //                       <View className="flex flex-row items-center justify-between mt-1">
// //                         <Text className="text-xs text-gray-500"></Text>
// //                         <Switch
// //                           value={product?.[category]?.showGrossWeightInBill || false}
// //                           onValueChange={(value) => handleInputChange("showGrossWeightInBill", value, category)}
// //                           trackColor={{ false: "red", true: "green" }}
// //                           thumbColor={product?.[category]?.showGrossWeightInBill ? "#ffffff" : "#f4f3f4"}
// //                         />
// //                       </View>
// //                     </View>
// //                     <View className="w-1/5 px-1">
// //                       <InputBox
// //                         name="less_weight"
// //                         placeholder="0"
// //                         label="Less Wt"
// //                         value={String(product?.[category]?.less_weight || '')}
// //                         onChange={({ value, name }) =>
// //                           handleInputChange(name, value, category)
// //                         }
// //                         keyboardType="numeric"
// //                       />
// //                       <View className="flex flex-row items-center justify-between mt-1">
// //                         <Text className="text-xs text-gray-500"></Text>
// //                         <Switch
// //                           value={product?.[category]?.showLessWeightInBill || false}
// //                           onValueChange={(value) => handleInputChange("showLessWeightInBill", value, category)}
// //                           trackColor={{ false: "red", true: "green" }}
// //                           thumbColor={product?.[category]?.showLessWeightInBill ? "#ffffff" : "#f4f3f4"}
// //                         />
// //                       </View>
// //                     </View>
// //                     <View className="w-1/5 px-1">
// //                       <InputBox
// //                         name="net_weight"
// //                         placeholder="0"
// //                         label="Net Wt"
// //                         readOnly={true}
// //                         value={String(product?.[category]?.net_weight || '')}
// //                         onChange={({ value, name }) =>
// //                           handleInputChange(name, value, category)
// //                         }
// //                         keyboardType="numeric"
// //                       />
// //                       <View className="flex flex-row items-center justify-between mt-1">
// //                         <Text className="text-xs text-gray-500"></Text>
// //                         <Switch
// //                           value={product?.[category]?.showNetWeightInBill || false}
// //                           onValueChange={(value) => handleInputChange("showNetWeightInBill", value, category)}
// //                           trackColor={{ false: "red", true: "green" }}
// //                           thumbColor={product?.[category]?.showNetWeightInBill ? "#ffffff" : "#f4f3f4"}
// //                         />
// //                       </View>
// //                     </View>
// //                     <View
// //                       className={`w-2/5 ${isPurchase ? "flex-row-reverse" : "flex-row"} flex`}
// //                     >
// //                       <View
// //                         className={`w-1/2 ${isPurchase ? "pl-0.5" : "pr-1 pl-0.5"}`}
// //                       >
// //                         <InputBox
// //                           name="tounch"
// //                           placeholder="0 %"
// //                           label="Tounch"
// //                           value={String(product?.[category]?.tounch || '')}
// //                           onChange={({ value, name }) =>
// //                             handleInputChange(name, value, category)
// //                           }
// //                           keyboardType="numeric"
// //                         />
// //                         <View className="flex flex-row items-center justify-between mt-1">
// //                           <Text className="text-xs text-gray-500"></Text>
// //                           <Switch
// //                             value={product?.[category]?.showTounchInBill || false}
// //                             onValueChange={(value) => handleInputChange("showTounchInBill", value, category)}
// //                             trackColor={{ false: "red", true: "green" }}
// //                             thumbColor={product?.[category]?.showTounchInBill ? "#ffffff" : "#f4f3f4"}
// //                           />
// //                         </View>
// //                       </View>
// //                       <View
// //                         className={`w-1/2 ${isPurchase ? "pr-1 pl-0.5" : "pl-0.5"}`}
// //                       >
// //                         <InputBox
// //                           name="wastage"
// //                           placeholder="0 %"
// //                           label="Wastage"
// //                           value={String(product?.[category]?.wastage || '')}
// //                           onChange={({ value, name }) =>
// //                             handleInputChange(name, value, category)
// //                           }
// //                           keyboardType="numeric"
// //                         />
// //                         <View className="flex flex-row items-center justify-between mt-1">
// //                           <Text className="text-xs text-gray-500"></Text>
// //                           <Switch
// //                             value={product?.[category]?.showWastageInBill || false}
// //                             onValueChange={(value) => handleInputChange("showWastageInBill", value, category)}
// //                             trackColor={{ false: "red", true: "green" }}
// //                             thumbColor={product?.[category]?.showWastageInBill ? "#ffffff" : "#f4f3f4"}
// //                           />
// //                         </View>
// //                       </View>
// //                     </View>
// //                   </View>

// //                   <View className="mb-4 flex flex-row">
// //                     <View className="w-1/3 pr-1">
// //                       <InputBox
// //                         name="fine_weight"
// //                         label="Fine Weight"
// //                         placeholder="0"
// //                         readOnly={true}
// //                         value={String(product?.[category]?.fine_weight || '')}
// //                         onChange={({ value }) => handleInputChange("fine_weight", value, category)}
// //                         keyboardType="numeric"
// //                       />
// //                       <View className="flex flex-row items-center justify-between mt-1">
// //                         <Text className="text-xs text-gray-500"></Text>
// //                         <Switch
// //                           value={product?.[category]?.showFineWeightInBill || false}
// //                           onValueChange={(value) => handleInputChange("showFineWeightInBill", value, category)}
// //                           trackColor={{ false: "red", true: "green" }}
// //                           thumbColor={product?.[category]?.showFineWeightInBill ? "#ffffff" : "#f4f3f4"}
// //                         />
// //                       </View>
// //                     </View>
// //                     <View className="w-1/3 px-1">
// //                       <Text className="text-slate-500 text-[13px] mb-1">Cutting</Text>
// //                       <View className="bg-gray-100 rounded-lg">
// //                         <CommonButton
// //                           title={product.cutting_enabled ? "ON" : "OFF"}
// //                           onPress={() => {
// //                             const currentType = product.type;
// //                             const buttonRate = parseFloat(product[currentType]?.rate || 0);
// //                             const buttonFineWeight = parseFloat(product[currentType]?.fine_weight) || 0;
// //                             const buttonMetalValue = !product.cutting_enabled ? (buttonFineWeight * buttonRate).toFixed(2) : "0";

// //                             setProduct((prev) => ({
// //                               ...prev,
// //                               cutting_enabled: !prev.cutting_enabled,
// //                               [currentType]: {
// //                                 ...prev[currentType],
// //                                 metal_value: buttonMetalValue,
// //                               },
// //                             }));
// //                           }}
// //                           isFilled={product.cutting_enabled}
// //                           small
// //                         />
// //                       </View>
// //                     </View>
// //                     <View className="w-1/3 pl-1">
// //                      <InputBox
// //   name="rate"
// //   label="Rate"
// //   placeholder="0"
// //   value={String(product?.[category]?.rate || '')}
// //   readOnly={isSelectRate}
// //   onChange={({ value }) => handleInputChange("rate", value, category)}
// //   keyboardType="numeric"
// // />
// //                       <View className="flex flex-row items-center justify-between mt-1">
// //                         <Text className="text-xs text-gray-500"></Text>
// //                         <Switch
// //                           value={product?.[category]?.showRateInBill || false}
// //                           onValueChange={(value) => handleInputChange("showRateInBill", value, category)}
// //                           trackColor={{ false: "red", true: "green" }}
// //                           thumbColor={product?.[category]?.showRateInBill ? "#ffffff" : "#f4f3f4"}
// //                         />
// //                       </View>
// //                     </View>
// //                   </View>

// //                   <View className="mb-4 flex flex-row">
// //                     <View className="w-1/2 pr-1">
// //                       <SelectInput
// //                         label="Making Type"
// //                         name="making_type"
// //                         value={product?.[category]?.making_type}
// //                         placeholder="Select"
// //                         data={[
// //                           { label: "Per Gram (PG)", value: "PG" },
// //                           { label: "Per Piece (PP)", value: "PP" },
// //                         ]}
// //                         onSelect={(value) => handleInputChange("making_type", value, category)}
// //                       />
// //                     </View>
// //                     <View className="w-1/2 pl-1">
// //                       <InputBox
// //                         name="making_charge"
// //                         label="Making Charge"
// //                         placeholder="0"
// //                         value={String(product?.[category]?.making_charge || '')}
// //                         onChange={({ value }) => handleInputChange("making_charge", value, category)}
// //                         keyboardType="numeric"
// //                       />
// //                     </View>
// //                   </View>

// //                   <View className="mb-4 flex flex-row">
// //                     <View className="w-full">
// //                       <InputBox
// //                         name="net_price"
// //                         readOnly={true}
// //                         label="Net Price"
// //                         placeholder="0"
// //                         value={handleDigitsFix(product?.[category]?.net_price || 0)}
// //                         keyboardType="numeric"
// //                       />
// //                       <View className="flex flex-row items-center justify-between mt-1">
// //                         <Text className="text-xs text-gray-500"></Text>
// //                         <Switch
// //                           value={product?.[category]?.showNetPriceInBill || false}
// //                           onValueChange={(value) => handleInputChange("showNetPriceInBill", value, category)}
// //                           trackColor={{ false: "red", true: "green" }}
// //                           thumbColor={product?.[category]?.showNetPriceInBill ? "#ffffff" : "#f4f3f4"}
// //                         />
// //                       </View>
// //                     </View>
// //                   </View>

// //                   <View className="mb-4 flex flex-row items-center bg-gray-50 px-3 py-2 rounded-lg">
// //                     <Text className="text-gray-600">Show Price in Bill</Text>
// //                     <Switch
// //                       value={product?.[category]?.showPriceInBill ?? false}
// //                       onValueChange={(value) => handleInputChange("showPriceInBill", value, category)}
// //                       trackColor={{ false: "#767577", true: "green" }}
// //                       thumbColor={product?.[category]?.showPriceInBill ? "#ffffff" : "#f4f3f4"}
// //                     />
// //                   </View>

// //                   {product?.[category]?.showPriceInBill ? (
// //                     <View className="mb-4 bg-gray-50 p-4 rounded-lg">
// //                       <Text className="text-base font-semibold mb-3">Calculation Summary</Text>
// //                       <View className="space-y-2">
// //                         <View className="flex flex-row justify-between">
// //                           <Text className="text-gray-600">Net Weight:</Text>
// //                           <Text>{product?.[category]?.net_weight || 0} g</Text>
// //                         </View>
// //                         <View className="flex flex-row justify-between items-center">
// //                           <Text className="text-gray-600">Fine Weight:</Text>
// //                           <View className="flex flex-row items-center">
// //                             <Text className="text-gray-500 text-sm mr-2">
// //                               ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × ({Number(product?.[category]?.tounch || 0)}% + {Number(product?.[category]?.wastage || 0)}%))
// //                             </Text>
// //                             <Text className="font-medium">{handleDigitsFix(product?.[category]?.fine_weight || 0)} g</Text>
// //                           </View>
// //                         </View>
// //                         <View className="flex flex-row justify-between items-center">
// //                           <Text className="text-gray-600">Wastage Weight:</Text>
// //                           <View className="flex flex-row items-center">
// //                             <Text className="text-gray-500 text-sm mr-2">
// //                               ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × {Number(product?.[category]?.wastage || 0)}%)
// //                             </Text>
// //                             <Text className="font-medium">{handleDigitsFix(
// //                               Number(product?.[category]?.gross_weight || 0) *
// //                               (Number(product?.[category]?.wastage || 0) / 100)
// //                             )} g</Text>
// //                           </View>
// //                         </View>
// //                         <View className="flex flex-row justify-between items-center">
// //                           <Text className="text-gray-600">Total Weight with Wastage:</Text>
// //                           <View className="flex flex-row items-center">
// //                             <Text className="text-gray-500 text-sm mr-2">
// //                               ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × (100% + {Number(product?.[category]?.wastage || 0)}%))
// //                             </Text>
// //                             <Text className="font-medium">{handleDigitsFix(
// //                               Number(product?.[category]?.gross_weight || 0) *
// //                               (1 + (Number(product?.[category]?.wastage || 0) / 100))
// //                             )} g</Text>
// //                           </View>
// //                         </View>
// //                         <View className="flex flex-row justify-between items-center">
// //                           <Text className="text-gray-600">Wastage Value:</Text>
// //                           <View className="flex flex-row items-center">
// //                             <Text className="text-gray-500 text-sm mr-2">
// //                               ({handleDigitsFix(
// //                                 Number(product?.[category]?.gross_weight || 0) *
// //                                 (Number(product?.[category]?.wastage || 0) / 100)
// //                               )} × ({Number(product?.[category]?.tounch || 0)}% × ₹{handleDigitsFix(product?.[category]?.rate || 0)}))
// //                             </Text>
// //                             <Text className="font-medium">₹{handleDigitsFix(
// //                               (Number(product?.[category]?.gross_weight || 0) *
// //                               (Number(product?.[category]?.wastage || 0) / 100)) *
// //                               ((Number(product?.[category]?.tounch || 0) / 100) *
// //                               Number(product?.[category]?.rate || 0))
// //                             )}</Text>
// //                           </View>
// //                         </View>
// //                         <View className="flex flex-row justify-between items-center">
// //                           <Text className="text-gray-600">Metal Value:</Text>
// //                           <View className="flex flex-row items-center">
// //                             {product.cutting_enabled ? (
// //                               <>
// //                                 <Text className="text-gray-500 text-sm mr-2">
// //                                   ({handleDigitsFix(product?.[category]?.fine_weight || 0)} × ₹{handleDigitsFix(product?.[category]?.rate || 0)})
// //                                 </Text>
// //                                 <Text className="font-medium">₹{handleDigitsFix(
// //                                   Number(product?.[category]?.fine_weight || 0) *
// //                                   Number(product?.[category]?.rate || 0)
// //                                 )}</Text>
// //                               </>
// //                             ) : (
// //                               <Text className="font-medium">₹0.00 (Cutting OFF)</Text>
// //                             )}
// //                           </View>
// //                         </View>
// //                         <View className="flex flex-row justify-between items-center">
// //                           <Text className="text-gray-600">Making Charges:</Text>
// //                           <View className="flex flex-row items-center">
// //                             {product?.[category]?.making_type?.value === "PG" ? (
// //                               <Text className="text-gray-500 text-sm mr-2">
// //                                 ({handleDigitsFix(product?.[category]?.net_weight || 0)} × ₹{handleDigitsFix(product?.[category]?.making_charge || 0)})
// //                               </Text>
// //                             ) : null}
// //                             <Text className="font-medium">₹{handleDigitsFix(
// //                               product?.[category]?.making_type?.value === "PG"
// //                                 ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// //                                 : Number(product?.[category]?.making_charge || 0)
// //                             )}</Text>
// //                           </View>
// //                         </View>
// //                         <View className="mb-4">
// //                           <View className="flex-row justify-between items-center mb-2">
// //                             <Text className="text-gray-600 font-medium">Additional Charges</Text>
// //                             <TouchableOpacity
// //                               onPress={() => {
// //                                 const updatedCharges = [...(product[category].charges_json || []), { name: '', amount: '0' }];
// //                                 handleInputChange('charges_json', updatedCharges, category);
// //                               }}
// //                               className="bg-primary px-2 py-1 rounded-md"
// //                             >
// //                               <Text className="text-white">+ Add</Text>
// //                             </TouchableOpacity>
// //                           </View>
// //                           {(product[category]?.charges_json || []).map((charge, index) => (
// //                             <View key={index} className="flex-row items-center mb-2">
// //                               <View className="flex-1 mr-2">
// //                                 <OutlineInput
// //                                   placeholder="Charge name"
// //                                   value={charge.name}
// //                                   maxLength={50}
// //                                   onChangeText={(value) => {
// //                                     const updatedCharges = [...(product[category].charges_json || [])];
// //                                     updatedCharges[index] = { ...charge, name: value };
// //                                     handleInputChange('charges_json', updatedCharges, category);
// //                                   }}
// //                                 />
// //                               </View>
// //                               <View className="w-24 mr-2">
// //                                 <OutlineInput
// //                                   placeholder="Amount"
// //                                   value={String(charge.amount)}
// //                                   keyboardType="numeric"
// //                                   onChangeText={(value) => {
// //                                     const updatedCharges = [...(product[category].charges_json || [])];
// //                                     updatedCharges[index] = { ...charge, amount: value || '0' };
// //                                     handleInputChange('charges_json', updatedCharges, category);
// //                                   }}
// //                                 />
// //                               </View>
// //                               <TouchableOpacity
// //                                 onPress={() => {
// //                                   const updatedCharges = (product[category].charges_json || []).filter((_, i) => i !== index);
// //                                   handleInputChange('charges_json', updatedCharges, category);
// //                                 }}
// //                               >
// //                                 <FontAwesome6 name="trash" size={16} color="red" />
// //                               </TouchableOpacity>
// //                             </View>
// //                           ))}
// //                           {(product[category]?.charges_json || []).length > 0 && (
// //                             <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-200">
// //                               <Text className="text-gray-600">Total:</Text>
// //                               <Text className="font-medium">₹{handleDigitsFix(
// //                                 (product[category]?.charges_json || []).reduce((sum, charge) =>
// //                                   sum + Number(charge.amount || 0), 0)
// //                               )}</Text>
// //                             </View>
// //                           )}
// //                         </View>
// //                         <View className="flex flex-row justify-between items-center border-t border-gray-200 mt-2 pt-2">
// //                           <Text className="text-gray-600 font-semibold">Subtotal:</Text>
// //                           <Text className="font-semibold">₹{handleDigitsFix(
// //                             (product.cutting_enabled
// //                               ? (Number(product?.[category]?.fine_weight || 0) *
// //                                  Number(product?.[category]?.rate || 0))
// //                               : 0) +
// //                             (product?.[category]?.making_type?.value === "PG"
// //                               ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// //                               : Number(product?.[category]?.making_charge || 0)) +
// //                             (product[category]?.charges_json || []).reduce((sum, charge) => 
// //                               sum + Number(charge.amount || 0), 0)
// //                           )}</Text>
// //                         </View>
// //                         <View className="flex flex-row justify-between items-center">
// //                           <Text className="text-gray-600">Tax Amount ({Number(product?.[category]?.tax || 0)}%):</Text>
// //                           <Text className="font-medium">₹{handleDigitsFix(
// //                             (
// //                               (product.cutting_enabled ? 
// //                                 (Number(product?.[category]?.fine_weight || 0) * 
// //                                  Number(product?.[category]?.rate || 0))
// //                                : 0) +
// //                               (product?.[category]?.making_type?.value === "PG" 
// //                                 ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// //                                : Number(product?.[category]?.making_charge || 0)) +
// //                               ((product[category]?.charges_json || []).reduce((sum, charge) => 
// //                                 sum + Number(charge.amount || 0), 0))
// //                             ) * (Number(product?.[category]?.tax || 0) / 100)
// //                           )}</Text>
// //                         </View>
// //                         <View className="flex flex-row justify-between border-t border-gray-200 pt-2">
// //                           <Text className="text-gray-600 font-semibold">Final Price:</Text>
// //                           <Text className="font-semibold">₹{handleDigitsFix(
// //                             // Subtotal
// //                             (
// //                               (product.cutting_enabled ? 
// //                                 (Number(product?.[category]?.fine_weight || 0) * 
// //                                  Number(product?.[category]?.rate || 0))
// //                                : 0) +
// //                               (product?.[category]?.making_type?.value === "PG"
// //                                 ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// //                                : Number(product?.[category]?.making_charge || 0)) +
// //                               ((product[category]?.charges_json || []).reduce((sum, charge) => 
// //                                 sum + Number(charge.amount || 0), 0))
// //                             ) +
// //                             // Tax Amount
// //                             (
// //                               (product.cutting_enabled ? 
// //                                 (Number(product?.[category]?.fine_weight || 0) *
// //                                   Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
// //              : 0) +
// //             (product?.[category]?.making_type?.value === "PG"
// //               ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
// //              : Number(product?.[category]?.making_charge || 0)) +
// //             ((product[category]?.charges_json || []).reduce((sum, charge) => 
// //               sum + Number(charge.amount || 0), 0))
// //           ) * (Number(product?.[category]?.tax || 0) / 100)
// //         )}</Text>
// //       </View>
// //     </View>
// //   </View>
// // ) : (
// //   <View className="mb-4 bg-gray-50 p-4 rounded-lg">
// //     <Text className="text-base font-semibold mb-3">Basic Weight Details</Text>
// //     <View className="space-y-2">
// //       <View className="flex flex-row justify-between">
// //         <Text className="text-gray-600">Net Weight:</Text>
// //         <Text>{product?.[category]?.net_weight || 0} g</Text>
// //       </View>
// //       <View className="flex flex-row justify-between items-center">
// //         <Text className="text-gray-600">Fine Weight:</Text>
// //         <View className="flex flex-row items-center">
// //           <Text className="text-gray-500 text-sm mr-2">
// //             ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × ({Number(product?.[category]?.tounch || 0)}% + {Number(product?.[category]?.wastage || 0)}%))
// //           </Text>
// //           <Text className="font-medium">{handleDigitsFix(product?.[category]?.fine_weight || 0)} g</Text>
// //         </View>
// //       </View>
// //     </View>
// //   </View>
// // )}
// //                   {/* charges and taxes */}
// //                   <View className="mb-4">
// //                     {/* Charges */}
// //                     <View className="mb-5">
// //                       <View className="flex flex-row items-center justify-between">
// //                         <Text className="tracking-wider text-base">
// //                           Charges
// //                         </Text>
// //                         <View className="flex flex-row items-center">
// //                           <Switch
// //                             value={product?.[category]?.showChargesInBill || false}
// //                             onValueChange={(value) => handleInputChange("showChargesInBill", value, category)}
// //                             trackColor={{ false: "red", true: "green" }}
// //                             thumbColor={product?.[category]?.showChargesInBill ? "#ffffff" : "#f4f3f4"}
// //                           />
// //                         <TouchableOpacity
// //                           onPress={() => addItem(category, "charges_json")}
// //                           activeOpacity={0.7}
// //                             className="bg-primary ml-2 w-6 h-6 flex justify-center items-center rounded-full shadow-xl"
// //                         >
// //                           <FontAwesome6 name="plus" size={17} color="white" />
// //                         </TouchableOpacity>
// //                         </View>
// //                       </View>
// //                       {/* Input fields */}
// //                       {product[category]?.charges_json?.map((charge, index) => {
// //                         return (
// //                           <View
// //                             key={index}
// //                             className="flex pt-2 pl-1 items-end flex-row"
// //                           >
// //                             {/* charge name */}
// //                             <View className="w-[45%] pr-2">
// //                               <OutlineInput
// //                                 placeholder="e.g. Labour Charge"
// //                                 value={charge.name}
// //                                 onChangeText={(value) =>
// //                                   handleInputChange(
// //                                     "name",
// //                                     value,
// //                                     category,
// //                                     "charges_json",
// //                                     index
// //                                   )
// //                                 }
// //                               />
// //                             </View>

// //                             {/* amount */}
// //                             <View className="w-[45%] px-2">
// //                               <OutlineInput
// //                                 placeholder="e.g. 500"
// //                                 value={charge.amount}
// //                                 keyboardType="numeric"
// //                                 onChangeText={(value) =>
// //                                   handleInputChange(
// //                                     "amount",
// //                                     value,
// //                                     category,
// //                                     "charges_json",
// //                                     index
// //                                   )
// //                                 }
// //                               />
// //                             </View>

// //                             {/* trash icon */}
// //                             {product[category]?.charges_json.length > 1 && (
// //                               <TouchableOpacity
// //                                 onPress={() =>
// //                                   removeChargeTaxInput(
// //                                     category,
// //                                     "charges_json",
// //                                     index
// //                                   )
// //                                 }
// //                                 activeOpacity={0.7}
// //                                 className="w-[10%] flex justify-center pl-3"
// //                               >
// //                                 <FontAwesome6
// //                                   name="trash"
// //                                   size={15}
// //                                   color="red"
// //                                 />
// //                               </TouchableOpacity>
// //                             )}
// //                           </View>
// //                         );
// //                       })}
// //                     </View>

// //                     {/* Taxes */}
// //                     <View className="">
// //                       <View className="flex flex-row items-center justify-between">
// //                         <Text className="tracking-wider text-base">Tax</Text>
// //                         <View className="flex flex-row items-center">
// //                           <Switch
// //                             value={product?.[category]?.showTaxInBill || false}
// //                             onValueChange={(value) => handleInputChange("showTaxInBill", value, category)}
// //                             trackColor={{ false: "red", true: "green" }}
// //                             thumbColor={product?.[category]?.showTaxInBill ? "#ffffff" : "#f4f3f4"}
// //                           />
// //                         <TouchableOpacity
// //                           onPress={() => addItem(category, "tax_json")}
// //                           activeOpacity={0.7}
// //                             className="bg-primary ml-2 w-6 h-6 flex justify-center items-center rounded-full shadow-xl"
// //                         >
// //                           <FontAwesome6 name="plus" size={17} color="white" />
// //                         </TouchableOpacity>
// //                         </View>
// //                       </View>
// //                       {/* Input fields */}
// //                       {product[category]?.tax_json?.map((tax, index) => {
// //                         return (
// //                           <View
// //                             key={index}
// //                             className="flex pt-2 pl-1 items-end flex-row"
// //                           >
// //                             {/* tax name */}
// //                             <View className="w-[45%] pr-2">
// //                               <OutlineInput
// //                                 placeholder="e.g. Tax"
// //                                 value={tax.name}
// //                                 onChangeText={(value) =>
// //                                   handleInputChange(
// //                                     "name",
// //                                     value,
// //                                     category,
// //                                     "tax_json",
// //                                     index
// //                                   )
// //                                 }
// //                               />
// //                             </View>

// //                             {/* tax amount */}
// //                             <View className="w-[45%] px-2">
// //                               <OutlineInput
// //                                 placeholder="e.g. 10%"
// //                                 value={tax.amount}
// //                                 keyboardType="numeric"
// //                                 onChangeText={(value) =>
// //                                   handleInputChange(
// //                                     "amount",
// //                                     value,
// //                                     category,
// //                                     "tax_json",
// //                                     index
// //                                   )
// //                                 }
// //                               />
// //                             </View>

// //                             {/* trash icon */}
// //                             {product[category]?.tax_json.length > 1 && (
// //                               <TouchableOpacity
// //                                 onPress={() =>
// //                                   removeChargeTaxInput(
// //                                     category,
// //                                     "tax_json",
// //                                     index
// //                                   )
// //                                 }
// //                                 activeOpacity={0.7}
// //                                 className="w-[10%] flex justify-center pl-3"
// //                               >
// //                                 <FontAwesome6
// //                                   name="trash"
// //                                   size={15}
// //                                   color="red"
// //                                 />
// //                               </TouchableOpacity>
// //                             )}
// //                           </View>
// //                         );
// //                       })}
// //                     </View>
// //                   </View>
// //                 </View>
// //               )
// //             );
// //           })}
// //           {/* ---------  common for sale & purchase - END - ---------- */}

// //           {/* Custom Fields Section */}
// //           <View className="px-4 pb-4">
// //             <View className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
// //               <View className="flex-row items-center justify-between mb-4">
// //                 <Text className="text-lg font-semibold text-gray-800">Custom Fields</Text>
// //                 <TouchableOpacity
// //                   onPress={() => {
// //                     setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
// //                     setCustomFieldModal(true);
// //                   }}
// //                   className="bg-primary px-4 py-2 rounded-full flex-row items-center"
// //                 >
// //                   <FontAwesome6 name="plus" size={14} color="white" className="mr-2" />
// //                   <Text className="text-white font-medium ml-1">Add Field</Text>
// //                 </TouchableOpacity>
// //               </View>

// //               {/* Custom Fields List */}
// //               {(product[product.type]?.custom_fields || []).map((field, index) => (
// //                 <View key={index} className="mb-4 bg-gray-50 p-3 rounded-lg">
// //                   <View className="flex-row items-center justify-between">
// //                     <View className="flex-1">
// //                       <Text className="text-base font-medium">{field.label}</Text>
// //                       <Text className="text-sm text-gray-600">{field.value} {field.unit?.value || ''}</Text>
// //                     </View>
// //                     <View className="flex-row items-center">
// //                       <Switch
// //                         value={field.showInBill}
// //                         onValueChange={(value) => {
// //                           const updatedFields = [...(product[product.type].custom_fields || [])];
// //                           updatedFields[index] = { ...field, showInBill: value };
// //                           handleInputChange("custom_fields", updatedFields, product.type);
// //                         }}
// //                         trackColor={{ false: "#767577", true: "#22c55e" }}
// //                         thumbColor={field.showInBill ? "#ffffff" : "#f4f3f4"}
// //                       />
// //                       <TouchableOpacity
// //                         onPress={() => {
// //                           const updatedFields = (product[product.type].custom_fields || []).filter((_, i) => i !== index);
// //                           handleInputChange("custom_fields", updatedFields, product.type);
// //                         }}
// //                         className="ml-4 bg-red-100 p-2 rounded-full"
// //                       >
// //                         <FontAwesome6 name="trash" size={16} color="#ef4444" />
// //                       </TouchableOpacity>
// //                     </View>
// //                   </View>
// //                 </View>
// //               ))}

// //               {!(product[product.type]?.custom_fields?.length > 0) && (
// //                 <View className="items-center py-6 bg-gray-50 rounded-lg">
// //                   <Text className="text-gray-500 text-sm">No custom fieldss added yet</Text>
// //                   <Text className="text-gray-400 text-xs mt-1">Click the "Add Field" button to create custom fields</Text>
// //                 </View>
// //               )}
// //             </View>
// //           </View>

// //           {/* Custom Field Modal */}
// //           <Modal
// //             visible={customFieldModal}
// //             transparent
// //             animationType="fade"
// //             onRequestClose={() => setCustomFieldModal(false)}
// //           >
// //             <View className="flex-1 justify-center items-center bg-black/50">
// //               <View className="bg-white p-4 rounded-lg w-[90%] max-w-md">
// //                 <Text className="text-lg font-semibold mb-4">Add Custom Field</Text>
                
// //                 {/* Field Label */}
// //             <View className="mb-4">
// //               <InputBox
// //                     name="label"
// //                     label="Field Label"
// //                     placeholder="e.g., Less Weight 2"
// //                     value={tempCustomField.label}
// //                     onChange={({ value }) => setTempCustomField(prev => ({ ...prev, label: value }))}
// //                   />
// //                 </View>

// //                 {/* Field Value */}
// //                 <View className="mb-4">
// //                   <InputBox
// //                     name="value"
// //                     label="Value"
// //                     placeholder="Enter numeric value"
// //                     value={tempCustomField.value}
// //                     keyboardType="numeric"
// //                     onChange={({ value }) => setTempCustomField(prev => ({ ...prev, value }))}
// //                   />
// //                 </View>

// //                 {/* Unit Selection */}
// //                 <View className="mb-4">
// //                   <SelectInput
// //                     label="Unit"
// //                     name="unit"
// //                     value={tempCustomField.unit}
// //                     placeholder="Select Unit"
// //                     data={jewelryUnits}
// //                     onSelect={(value) => setTempCustomField(prev => ({ ...prev, unit: value }))}
// //                   />
// //                 </View>

// //                 {/* Show in Bill Toggle */}
// //                 <View className="flex-row items-center justify-between mb-6">
// //                   <Text className="text-base text-gray-700">Show in Bill</Text>
// //                   <Switch
// //                     value={tempCustomField.showInBill}
// //                     onValueChange={(value) => setTempCustomField(prev => ({ ...prev, showInBill: value }))}
// //                     trackColor={{ false: "#767577", true: "#22c55e" }}
// //                     thumbColor={tempCustomField.showInBill ? "#ffffff" : "#f4f3f4"}
// //                   />
// //                 </View>

// //                 {/* Buttons */}
// //                 <View className="flex-row justify-end space-x-2">
// //                   <TouchableOpacity 
// //                     onPress={() => {
// //                       setCustomFieldModal(false);
// //                       setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
// //                     }}
// //                     className="px-4 py-2"
// //                   >
// //                     <Text className="text-gray-600">Cancel</Text>
// //                   </TouchableOpacity>
// //                   <TouchableOpacity 
// //                     onPress={() => {
// //                       const updatedFields = [...(product[product.type]?.custom_fields || [])];
// //                       updatedFields.push(tempCustomField);
// //                       handleInputChange("custom_fields", updatedFields, product.type);
// //                       setCustomFieldModal(false);
// //                       setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
// //                     }}
// //                     className="bg-primary px-4 py-2 rounded-md"
// //                   >
// //                     <Text className="text-white">Done</Text>
// //                   </TouchableOpacity>
// //                 </View>
// //               </View>
// //             </View>
// //           </Modal>

// //           {/* Horizontal Layout for Photo + Buttons */}
// //           <View className="flex-row px-4 pb-4">
// //             {/* Additional Photo - Left Side */}
// //             <View className="flex-1 pr-2">
// //               <View className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
// //                 <Text className="text-sm font-medium mb-2 text-center">Additional Photo</Text>
// //                 <ImagePickerComponent
// //                   name="additional_image"
// //                   value={product?.additional_image}
// //                 onChange={({ value, name }) => handleInputChange(name, value)}
// //               />
// //                 <Text className="text-xs text-gray-500 mt-2 text-center">
// //                   Upload item photo
// //                 </Text>
// //               </View>
// //             </View>

// //             {/* Buttons - Right Side */}
// //             <View className="w-1/3 pl-2">
// //             {isFromInvoice ? (
// //                 <View className="space-y-2">
// //                 <CommonButton
// //                   loading={loading}
// //                   onPress={handleAddProduct}
// //                   title="Add Product"
// //                     />
// //               </View>
// //             ) : (
// //                 <View className="space-y-2">
// //                   <CommonButton
// //                     loading={loading}
// //                     onPress={onSubmitClick}
// //                     title={route?.params?.isProductEdit || updateData ? "Update" : "Create"}
// //                   />
// //               </View>
// //             )}
// //             </View>
// //           </View>
// //         </View>
// //       </KeyboardHanlder>

// //       {/* Add weight */}
// //       {updateData && (
// //         <AddWeightModal
// //           product={{ id: updateData.id, type: product?.type }}
// //           open={initialState.weightModal}
// //           onClose={() => handleInitialState("weightModal", false)}
// //         />
// //       )}

// //       {/* Create metal */}
// //       <CreateMetalModal
// //         navigation={navigation}
// //         route={route}
// //         open={initialState.metalModal}
// //         onClose={() => handleInitialState("metalModal", false)}
// //       />

// //       {/* Date Picker Modals */}
// //       <Modal
// //         visible={initialState.billDatePicker}
// //         transparent
// //         animationType="fade"
// //         onRequestClose={() => handleInitialState("billDatePicker", false)}
// //       >
// //         <View className="flex-1 justify-center items-center bg-black/50">
// //           <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
// //             <Text className="text-lg font-semibold mb-4">Select Bill Date</Text>
            
// //             <DatePickerComponent
// //               name="bill_date"
// //               value={product?.bill_date}
// //               onSelect={({ value }) => {
// //                 handleInputChange("bill_date", value);
// //                 handleInitialState("billDatePicker", false);
// //               }}
// //             />

// //             <TouchableOpacity 
// //               onPress={() => handleInitialState("billDatePicker", false)}
// //               className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
// //             >
// //               <Text className="text-white">Close</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </Modal>

// //       <Modal
// //         visible={initialState.paymentDatePicker}
// //         transparent
// //         animationType="fade"
// //         onRequestClose={() => handleInitialState("paymentDatePicker", false)}
// //       >
// //         <View className="flex-1 justify-center items-center bg-black/50">
// //           <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
// //             <Text className="text-lg font-semibold mb-4">Select Expected Payment Date</Text>
            
// //             <DatePickerComponent
// //               name="payment_date"
// //               value={product?.payment_date}
// //               onSelect={({ value }) => {
// //                 handleInputChange("payment_date", value);
// //                 handleInitialState("paymentDatePicker", false);
// //               }}
// //             />

// //             <TouchableOpacity 
// //               onPress={() => handleInitialState("paymentDatePicker", false)}
// //               className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
// //             >
// //               <Text className="text-white">Close</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </Modal>

// //       <Modal
// //         visible={initialState.interestStartDatePicker}
// //         transparent
// //         animationType="fade"
// //         onRequestClose={() => handleInitialState("interestStartDatePicker", false)}
// //       >
// //         <View className="flex-1 justify-center items-center bg-black/50">
// //           <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
// //             <Text className="text-lg font-semibold mb-4">Select Interest Start Date</Text>
            
// //             <DatePickerComponent
// //               name="interest_start_date"
// //               value={product?.interest_start_date}
// //               onSelect={({ value }) => {
// //                 handleInputChange("interest_start_date", value);
// //                 handleInitialState("interestStartDatePicker", false);
// //               }}
// //             />

// //             <TouchableOpacity 
// //               onPress={() => handleInitialState("interestStartDatePicker", false)}
// //               className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
// //             >
// //               <Text className="text-white">Close</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </Modal>

// //     </Fragment>
// //   );
// // };

// // export default ProductForm;
// import InputBox from "@/src/components/common/InputBox";
// import React, { Fragment, useEffect, useState } from "react";
// import { View, TouchableOpacity, Switch, Modal, SafeAreaView, ScrollView, Alert, BackHandler, FlatList, Text, Platform } from "react-native";
// import { useDispatch, useSelector } from "react-redux";
// import SimpleReactValidator from "simple-react-validator";
// import CommonButton from "@/src/components/common/buttons/CommonButton";
// import SelectInput from "@/src/components/common/SelectInput";
// import ImagePickerComponent from "@/src/components/common/ImagePicker";
// import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
// import {
//   fetchProductDetail,
//   fetchProductGroups,
//   manageProductList,
//   fetchProductList,
// } from "@/src/redux/actions/product.action";
// import KeyboardHanlder from "@/src/components/common/KeyboardHanlder";
// import CreateMetalModal from "./CreateMetalModal";
// import AddWeightModal from "./AddWeightModal";
// import OutlineInput from "@/src/components/common/OutlineInput";
// import SearchProduct from "./SearchProduct";
// import { makingTypes } from "@/src/utils";
// import AntDesign from "@expo/vector-icons/AntDesign";
// import moment from "moment";
// import DatePickerComponent from "@/src/components/common/DateTimePicker";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useFocusEffect } from "@react-navigation/native";
// import { getToken } from "@/src/utils/auth";
// import { ApiRequest } from "@/src/utils/api";
// import { MANAGE_PRODUCT_API, MANAGE_LOGS_API, MANAGE_BILL_API } from "@/src/utils/api/endpoints";
// import ShowToast from "@/src/components/common/ShowToast";

// // Process sale and purchase data
// export function processProductData(productData, prefix, isFromInvoice) {
//   return productData.map((item) => {
//     const processedItem = {
//       gross_weight: 0,
//       less_weight: 0,
//       net_weight: 0,
//       net_price: 0,
//       wastage: 0,
//       tounch: 0,
//       fine_weight: 0,
//       rate: 0,
//       making_type: "",
//       charges_json: [{}],
//       tax_json: [{}],
//       custom_fields: [], // Initialize custom_fields
//     };
//     for (const key in item) {
//       if (key.startsWith(prefix)) {
//         const newKey = key.replace(prefix, "");
//         processedItem[newKey] = key.includes("_json")
//           ? (() => {
//               try {
//                 return JSON.parse(item[key].replace(/'/g, '"'));
//               } catch (e) {
//                 console.error("Invalid JSON string:", item[key]);
//                 return [{}];
//               }
//             })()
//           : key === "making_type"
//           ? makingTypes.find((type) => type.value === item[key]) || ""
//           : item[key];
//       }
//     }
//     return processedItem;
//   });
// }

// // Storage key for form data
// const PRODUCT_FORM_STORAGE_KEY = "productForm_savedState";

// const ProductForm = ({
//   navigation,
//   route,
//   isFromInvoice = false,
//   invoiceHandler,
//   handleCancel,
// }) => {
//   const updateData = route?.params?.updateData;
//   const isBillEdit = route?.params?.isBillEdit;
//   const billType = route?.params?.billType;
//   const dispatch = useDispatch();
//   const [errors, setErrors] = useState({});
//   const [initialState, setInitialState] = useState({
//     metalModal: false,
//     weightModal: false,
//     datePicker: false,
//     billDatePicker: false,
//     paymentDatePicker: false,
//     interestStartDatePicker: false,
//   });
//   const [customFieldModal, setCustomFieldModal] = useState(false);
//   const [tempCustomField, setTempCustomField] = useState({
//     label: "",
//     value: "",
//     unit: "",
//     showInBill: true,
//   });
//   const [dataLoaded, setDataLoaded] = useState(false);
//   const [formChanged, setFormChanged] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const { productGroups, isLoading: productLoading, productDetail, products } = useSelector(
//     (state) => state.productSlices
//   );
//   const { profileData } = useSelector((state) => state.userSlices);
//   const validator = new SimpleReactValidator();
//   const productTypes = ["purchase", "sale"];

//   const formType = isFromInvoice
//     ? (invoiceHandler?.isPurchase ? "purchase" : "sale")
//     : "purchase";

//   const defaultProductState = {
//     type: formType,
//     size: "",
//     interest_enabled: false,
//     interest_type: { label: "Flat", value: "2" },
//     interest_rate: "2",
//     interest_amount: "0",
//     bill_date: new Date(),
//     payment_date: null,
//     interest_start_date: null,
//     interest_upto: null,
//     grace_period_enabled: false,
//     grace_period_days: "0",
//     original_amount: "0",
//     remaining_balance: "0",
//     interest_notes: "",
//     payment_history: [],
//     cutting_enabled: false,
//     sale: {
//       gross_weight: 0,
//       less_weight: 0,
//       net_weight: 0,
//       net_price: 0,
//       wastage: 0,
//       tounch: 0,
//       fine_weight: 0,
//       rate: 0,
//       variation: null,
//       metal_value: "0",
//       making_type: "",
//       making_charge: 0,
//       photo: null,
//       charges_json: [{}],
//       tax_json: [{}],
//       custom_fields: [],
//       showSizeInBill: true,
//       showGrossWeightInBill: true,
//       showLessWeightInBill: true,
//       showNetWeightInBill: true,
//       showWastageInBill: true,
//       showTounchInBill: true,
//       showFineWeightInBill: true,
//       showRateInBill: true,
//       showMakingChargeInBill: true,
//       showHuidInBill: true,
//       showHsnInBill: true,
//       showPriceInBill: true,
//       showTaxInBill: true,
//       showChargesInBill: true,
//       showCommentInBill: true,
//     },
//     purchase: {
//       gross_weight: 0,
//       less_weight: 0,
//       net_weight: 0,
//       net_price: 0,
//       wastage: 0,
//       tounch: 0,
//       fine_weight: 0,
//       rate: 0,
//       variation: null,
//       metal_value: "0",
//       making_type: "",
//       making_charge: 0,
//       photo: null,
//       charges_json: [{}],
//       tax_json: [{}],
//       custom_fields: [],
//       showSizeInBill: true,
//       showGrossWeightInBill: true,
//       showLessWeightInBill: true,
//       showNetWeightInBill: true,
//       showWastageInBill: true,
//       showTounchInBill: true,
//       showFineWeightInBill: true,
//       showRateInBill: true,
//       showMakingChargeInBill: true,
//       showHuidInBill: true,
//       showHsnInBill: true,
//       showPriceInBill: true,
//       showTaxInBill: true,
//       showChargesInBill: true,
//       showCommentInBill: true,
//     },
//   };

//   const [product, setProduct] = useState(defaultProductState);

//   const saveFormData = async (formData) => {
//     try {
//       await AsyncStorage.setItem(PRODUCT_FORM_STORAGE_KEY, JSON.stringify(formData));
//       console.log("Form data saved to AsyncStorage");
//       setFormChanged(true);
//     } catch (error) {
//       console.error("Error saving form data:", error);
//     }
//   };

//   const loadFormData = async () => {
//     try {
//       const savedData = await AsyncStorage.getItem(PRODUCT_FORM_STORAGE_KEY);
//       if (savedData) {
//         const parsedData = JSON.parse(savedData);
//         console.log("Loaded saved form data:", parsedData);
//         if (parsedData?.hsn_id?.variation?.length > 0) {
//           parsedData[parsedData.type].variation = null;
//           parsedData[parsedData.type].rate = String(parsedData.hsn_id.variation[0].price || "0");
//         }
//         setProduct(parsedData);
//       }
//       setDataLoaded(true);
//     } catch (error) {
//       console.error("Error loading form data:", error);
//       setDataLoaded(true);
//     }
//   };

//   useEffect(() => {
//     if (updateData?.id) {
//       dispatch(fetchProductDetail({ id: updateData.id }));
//       setDataLoaded(true);
//     } else {
//       loadFormData();
//     }
//   }, []);

//   const isSelectRate = product?.hsn_id?.variation?.length > 0;
//   console.log("isSelectRate:", isSelectRate);

//   const handleDigitsFix = (value) => {
//     if (!value || isNaN(value)) return "0.00";
//     return parseFloat(value).toFixed(2);
//   };

//   const jewelryUnits = [
//     { label: "Grams (g)", value: "g" },
//     { label: "Milligrams (mg)", value: "mg" },
//     { label: "Carats (ct)", value: "ct" },
//     { label: "Pieces (pcs)", value: "pcs" },
//     { label: "Inches (in)", value: "in" },
//     { label: "Millimeters (mm)", value: "mm" },
//     { label: "Percentage (%)", value: "%" },
//   ];

//   const calculateTotalChargesAndTaxes = (category) => {
//     let totalCharges = 0;
//     let totalTaxPercentage = 0;

//     if (category?.charges_json) {
//       totalCharges = category.charges_json.reduce(
//         (sum, charge) => sum + (Number(charge.amount) || 0),
//         0
//       );
//     }

//     if (category?.tax_json) {
//       totalTaxPercentage = category.tax_json.reduce(
//         (sum, tax) => sum + (Number(tax.amount) || 0),
//         0
//       );
//     }

//     return { totalCharges, totalTaxPercentage };
//   };

//   const handleInputChange = (name, value, category, arrayKey, index) => {
//     const updatedProduct = { ...product };

//     if (arrayKey && typeof index === "number" && updatedProduct[category]?.[arrayKey]) {
//       updatedProduct[category][arrayKey][index] = {
//         ...updatedProduct[category][arrayKey][index],
//         [name]: value,
//       };
//     } else if (category && updatedProduct[category]) {
//       updatedProduct[category][name] = value;

//       // Handle hsn_id change: reset variation and set rate based on new variations
//       if (name === "hsn_id") {
//         const variations = value?.variation || [];
//         updatedProduct[category].variation = null; // Reset variation to null
//         updatedProduct[category].rate = variations.length > 0 ? String(variations[0].price || "0") : "0"; // Set rate to first variation's price or 0
//         updatedProduct.hsn_id = value; // Ensure hsn_id is updated at the root level
//         console.log('HSN changed:', { hsn_id: value, variations, rate: updatedProduct[category].rate });
//       }
//       // Set rate when variation is selected
//       if (name === "variation") {
//         updatedProduct[category].rate = String(value?.price || "0"); // Update rate to selected variation's price
//         console.log('Variation selected:', { variation: value, rate: updatedProduct[category].rate });
//       }
//     } else {
//       updatedProduct[name] = value;
//     }

//     // Calculate net_weight and fine_weight
//     if (['gross_weight', 'less_weight', 'wastage', 'tounch'].includes(name) && updatedProduct[category]) {
//       const gross = parseFloat(updatedProduct[category].gross_weight) || 0;
//       const less = parseFloat(updatedProduct[category].less_weight) || 0;
//       const wastage = parseFloat(updatedProduct[category].wastage) || 0;
//       const tounch = parseFloat(updatedProduct[category].tounch) || 0;

//       updatedProduct[category].net_weight = (gross - less).toFixed(3);
//       updatedProduct[category].fine_weight = (gross * ((tounch + wastage) / 100)).toFixed(3);
//     }

//     // Calculate metal_value and net_price
//     if (['rate', 'hsn_id', 'variation', 'gross_weight', 'less_weight', 'wastage', 'tounch', 'making_charge', 'making_type'].includes(name) && updatedProduct[category]) {
//       const fineWeight = parseFloat(updatedProduct[category].fine_weight) || 0;
//       const rateValue = parseFloat(updatedProduct[category].rate || 0);
//       const makingCharge = parseFloat(updatedProduct[category].making_charge) || 0;
//       const netWeight = parseFloat(updatedProduct[category].net_weight) || 0;
//       const chargesTotal = (updatedProduct[category].charges_json || []).reduce(
//         (sum, charge) => sum + Number(charge.amount || 0),
//         0
//       );
//       const taxRate = parseFloat(updatedProduct[category].tax || 0) / 100;

//       updatedProduct[category].metal_value = (fineWeight * rateValue).toFixed(2);

//       const subtotal = (fineWeight * rateValue) +
//         (updatedProduct[category].making_type?.value === "PG"
//           ? netWeight * makingCharge
//           : makingCharge) +
//         chargesTotal;

//       updatedProduct[category].net_price = (subtotal + subtotal * taxRate).toFixed(2);
//     }

//     console.log('Updated product state:', updatedProduct);
//     setProduct(updatedProduct);
//     saveFormData(updatedProduct);

//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: null }));
//     }
//   };

//   const handleInitialState = (name, value) => {
//     setInitialState({ ...initialState, [name]: value });
//   };

//   const handleSubmit = async () => {
//     try {
//       if (!product.name) {
//         ShowToast("Product name is required");
//         return;
//       }

//       setLoading(true);

//       const formData = new FormData();

//       formData.append('name', product.name || '');
//       formData.append('huid', product.huid || '');
//       formData.append('hsn_id', product.hsn_id?.value || '');
//       formData.append('bar_code', product.bar_code || '');
//       formData.append('comment', product.comment || '');

//       if (product.image && typeof product.image === 'object' && product.image.uri) {
//         formData.append('image', {
//           uri: Platform.OS === 'ios' ? product.image.uri.replace('file://', '') : product.image.uri,
//           type: 'image/jpeg',
//           name: `product_${Date.now()}.jpg`,
//         });
//       } else if (product.image && typeof product.image === 'string') {
//         formData.append('image_url', product.image);
//       }

//       formData.append('sale_gross_weight', String(product.sale?.gross_weight || '0'));
//       formData.append('sale_less_weight', String(product.sale?.less_weight || '0'));
//       formData.append('sale_net_weight', String(product.sale?.net_weight || '0'));
//       formData.append('sale_wastage', String(product.sale?.wastage || '0'));
//       formData.append('sale_tounch', String(product.sale?.tounch || '0'));
//       formData.append('sale_fine_weight', String(product.sale?.fine_weight || '0'));
//       formData.append('sale_rate', String(product.sale?.rate || '0'));
//       formData.append('sale_making_type', product.sale?.making_type?.value || 'PG');
//       formData.append('sale_making_charges', String(product.sale?.making_charge || '0'));
//       formData.append('sale_net_price', String(product.sale?.net_price || '0'));
//       formData.append('sale_piece', '1');

//       formData.append('purchase_gross_weight', String(product.purchase?.gross_weight || '0'));
//       formData.append('purchase_less_weight', String(product.purchase?.less_weight || '0'));
//       formData.append('purchase_net_weight', String(product.purchase?.net_weight || '0'));
//       formData.append('purchase_wastage', String(product.purchase?.wastage || '0'));
//       formData.append('purchase_tounch', String(product.purchase?.tounch || '0'));
//       formData.append('purchase_fine_weight', String(product.purchase?.fine_weight || '0'));
//       formData.append('purchase_rate', String(product.purchase?.rate || '0'));
//       formData.append('purchase_making_type', product.purchase?.making_type?.value || 'PG');
//       formData.append('purchase_making_charges', String(product.purchase?.making_charge || '0'));
//       formData.append('purchase_net_price', String(product.purchase?.net_price || '0'));
//       formData.append('purchase_piece', '1');

//       formData.append('sale_charges_json', JSON.stringify(product.sale?.charges_json || []));
//       formData.append('sale_tax_json', JSON.stringify(product.sale?.tax_json || []));
//       formData.append('purchase_charges_json', JSON.stringify(product.purchase?.charges_json || []));
//       formData.append('purchase_tax_json', JSON.stringify(product.purchase?.tax_json || []));

//       const now = new Date();
//       const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');

//       const [productResponse, logResponse] = await Promise.all([
//         ApiRequest({
//           url: MANAGE_PRODUCT_API.create,
//           method: 'POST',
//           body: formData,
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         }),
//         ApiRequest({
//           url: MANAGE_LOGS_API.create,
//           method: 'POST',
//           body: {
//             userName: profileData?.name || 'Unknown User',
//             productName: product.name || 'Unknown Product',
//             id: 0,
//             type: 'product',
//             amount: parseFloat(product[product.type]?.net_price || 0).toFixed(2),
//             action: 'CREATE',
//             entityType: 'PRODUCT',
//             timestamp: timestamp,
//             metadata: JSON.stringify({
//               action: 'Created new product',
//               productId: product.product_id || 'new',
//               note: `Created product: ${product.name}`,
//               formData: {
//                 sale_gross_weight: product.sale?.gross_weight || 0,
//                 sale_net_weight: product.sale?.net_weight || 0,
//                 sale_fine_weight: product.sale?.fine_weight || 0,
//                 sale_net_price: product.sale?.net_price || 0,
//               },
//             }),
//           },
//         }),
//       ]);

//       if (!productResponse?.success) {
//         throw new Error(productResponse?.message || "Failed to save product");
//       }

//       if (!logResponse?.success) {
//         console.error("Warning: Product saved but log creation failed:", logResponse?.message);
//         ShowToast("Product saved but logging failed");
//       } else {
//         ShowToast(productResponse.message || "Product created successfully");
//       }

//       await AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY);
//       navigation.goBack();
//     } catch (error) {
//       console.error('Error details:', error);
//       ShowToast(error.message || "Error saving product");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const onSubmitClick = () => {
//     const isUpdate = route?.params?.isProductEdit || updateData?.id;
//     if (isUpdate) {
//       const formData = new FormData();
//       formData.append('id', updateData?.id || route?.params?.id);
//       handleUpdate();
//     } else {
//       handleSubmit();
//     }
//   };

//   const resetProduct = async () => {
//     Alert.alert(
//       "Reset Form",
//       "Are you sure you want to reset all form values?",
//       [
//         {
//           text: "Cancel",
//           style: "cancel",
//         },
//         {
//           text: "Reset",
//           onPress: async () => {
//             try {
//               await AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY);
//               console.log("Form data cleared during reset");
//               setProduct(defaultProductState);
//               setFormChanged(false);
//             } catch (error) {
//               console.error("Error clearing form data:", error);
//               ShowToast("Error clearing form data");
//             }
//           },
//         },
//       ]
//     );
//   };

//   const addItem = (type, key) => {
//     setProduct((prev) => ({
//       ...prev,
//       [type]: {
//         ...prev[type],
//         [key]: [
//           ...prev[type][key],
//           key === "charges_json"
//             ? { name: "", amount: "0" }
//             : { name: "", amount: "0" },
//         ],
//       },
//     }));
//   };

//   const removeChargeTaxInput = (type, key, index) => {
//     setProduct((prev) => {
//       const updatedCategory = { ...prev[type] };
//       const itemToRemove = updatedCategory[key].find((item, i) => i === index);
//       updatedCategory[key] = updatedCategory[key].filter(
//         (item, i) => i !== index
//       );

//       updatedCategory.net_price =
//         Number(updatedCategory.net_price || 0) - Number(itemToRemove?.amount || 0);

//       return {
//         ...prev,
//         [type]: updatedCategory,
//       };
//     });
//   };

//   const handleProductTypeChange = (type) => {
//     const isSale = type === "sale";
//     setProduct((prev) => {
//       const updatedSale = isSale
//         ? {
//             ...prev.purchase,
//             gross_weight: prev?.sale?.gross_weight || 0,
//             less_weight: prev?.sale?.less_weight || 0,
//             net_weight: prev?.sale?.net_weight || 0,
//             net_price: prev?.sale?.net_price || 0,
//           }
//         : prev.sale;

//       return { ...prev, sale: updatedSale, type };
//     });
//   };

//   const handleProductDetail = (data) => {
//     const {
//       name,
//       hsn_id,
//       huid,
//       comment,
//       image_url,
//       sale_product_data,
//       purchase_product_data,
//     } = data;

//     const purchase = processProductData(
//       purchase_product_data || [{}],
//       "purchase_",
//       isFromInvoice
//     );
//     const sale = processProductData(
//       sale_product_data || [{}],
//       "sale_",
//       isFromInvoice
//     );
//     const hsnName = productGroups.find((item) => item.id == hsn_id);

//     setProduct({
//       ...defaultProductState,
//       ...(isFromInvoice
//         ? { product_id: data.id, product_name: data.name }
//         : {}),
//       name: name || "",
//       huid: huid || "",
//       comment: comment || "",
//       image: image_url || "",
//       hsn_id: hsnName ? { label: hsnName.name, value: hsnName.id, variation: hsnName.variation_data } : null,
//       sale: sale[0] || defaultProductState.sale,
//       purchase: purchase[0] || defaultProductState.purchase,
//     });
//   };

//   const handleAddProduct = () => {
//     if (validator.allValid()) {
//       const newProducts = [
//         ...(invoiceHandler?.formValue?.selectedProduct || []),
//       ];

//       const { name, hsn_id, huid, comment, image, size } = product;

//       const productData = {
//         name,
//         huid,
//         size,
//         hsn_id: hsn_id?.value || '',
//         comment,
//         sale: product.sale || {},
//         purchase: product.purchase || {},
//         ...product[product.type],
//         rate: product[product.type].rate,
//         product_id: Math.random().toString(36).substring(2, 9),
//       };

//       newProducts.push(productData);

//       const totalPrice = newProducts.reduce(
//         (acc, product) => Number(acc) + Number(product[invoiceHandler?.isPurchase ? "purchase" : "sale"]?.net_price || 0),
//         0
//       );

//       invoiceHandler?.setFormValue({
//         ...invoiceHandler?.formValue,
//         selectedProduct: newProducts,
//         totalPrice,
//       });

//       AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY)
//         .then(() => console.log("Form data cleared after adding product to invoice"))
//         .catch((error) => console.error("Error clearing form data:", error));

//       resetProduct();
//       setFormChanged(false);

//       if (invoiceHandler && invoiceHandler.onSubmit) {
//         invoiceHandler.onSubmit();
//       }
//     } else {
//       setErrors(validator.errorMessages);
//     }
//   };

//   useEffect(() => {
//     if (productDetail) {
//       handleProductDetail(productDetail);
//     }
//   }, [productDetail]);

//   useEffect(() => {
//     resetProduct();
//     dispatch(fetchProductGroups());
//     if (updateData) {
//       dispatch(fetchProductDetail(updateData?.id));
//     }
//   }, [dispatch, updateData]);

//   const calculateInterestPeriod = (product) => {
//     if (!product?.bill_date || !product?.payment_date) return 0;

//     const startDate = product?.interest_start_date
//       ? moment(product.interest_start_date)
//       : moment(product.bill_date);

//     const endDate = moment(product.payment_date);

//     let days = endDate.diff(startDate, 'days');

//     if (product?.grace_period_enabled) {
//       days = Math.max(0, days - Number(product?.grace_period_days || 0));
//     }

//     return days;
//   };

//   const calculateInterest = (updatedProduct) => {
//     if (!updatedProduct.interest_enabled) {
//       return { interestAmount: 0, dailyBreakdown: [] };
//     }

//     const balance = parseFloat(updatedProduct[updatedProduct.type]?.net_price || 0);
//     const interestRate = parseFloat(updatedProduct.interest_rate || 0) / 100;
//     const interestType = updatedProduct.interest_type?.value;

//     let interestAmount = 0;
//     let dailyBreakdown = [];

//     const days = calculateInterestPeriod(updatedProduct);
//     if (days <= 0) return { interestAmount: 0, dailyBreakdown: [] };

//     const timeInYears = days / 365;

//     if (interestType === "2") {
//       interestAmount = balance * interestRate * timeInYears;
//     } else if (interestType === "1") {
//       interestAmount = balance * (Math.pow(1 + interestRate, timeInYears) - 1);
//     }

//     return { interestAmount, dailyBreakdown };
//   };

//   useEffect(() => {
//     if (product?.sale && product?.purchase) {
//       if (product.sale.tax_json && product.sale.tax_json.length > 0) {
//         const totalTax = product.sale.tax_json.reduce((sum, tax) => sum + Number(tax.amount || 0), 0);
//         handleInputChange("tax", totalTax, "sale");
//       }

//       if (product.purchase.tax_json && product.purchase.tax_json.length > 0) {
//         const totalTax = product.purchase.tax_json.reduce((sum, tax) => sum + Number(tax.amount || 0), 0);
//         handleInputChange("tax", totalTax, "purchase");
//       }
//     }
//   }, [product?.sale?.tax_json, product?.purchase?.tax_json]);

//   useEffect(() => {
//     if (product?.sale?.tax_json?.length > 0) {
//       const totalTax = product.sale.tax_json.reduce(
//         (sum, tax) => sum + Number(tax.amount || 0),
//         0
//       );
//       setProduct((prev) => ({
//         ...prev,
//         sale: {
//           ...prev.sale,
//           tax: totalTax,
//         },
//       }));
//     }

//     if (product?.purchase?.tax_json?.length > 0) {
//       const totalTax = product.purchase.tax_json.reduce(
//         (sum, tax) => sum + Number(tax.amount || 0),
//         0
//       );
//       setProduct((prev) => ({
//         ...prev,
//         purchase: {
//           ...prev.purchase,
//           tax: totalTax,
//         },
//       }));
//     }
//   }, [product?.sale?.tax_json, product?.purchase?.tax_json]);

//   useFocusEffect(
//     React.useCallback(() => {
//       const backAction = () => {
//         if (formChanged) {
//           Alert.alert(
//             "Form Data Saved",
//             isFromInvoice
//               ? "Your data has been saved. Do you want to return to the product list?"
//               : "Your entered data has been saved. You can continue editing later.",
//             [
//               { text: "Stay on Form", style: "cancel" },
//               {
//                 text: isFromInvoice ? "Back to List" : "Go Back",
//                 onPress: () => {
//                   if (isFromInvoice && handleCancel) {
//                     handleCancel();
//                   } else {
//                     navigation.goBack();
//                   }
//                 },
//               },
//             ]
//           );
//           return true;
//         } else if (isFromInvoice && handleCancel) {
//           handleCancel();
//           return true;
//         }
//         return false;
//       };

//       const backHandler = BackHandler.addEventListener(
//         "hardwareBackPress",
//         backAction
//       );

//       return () => backHandler.remove();
//     }, [formChanged, navigation, isFromInvoice, handleCancel])
//   );

//   useEffect(() => {
//     if (product?.interest_enabled) {
//       const { interestAmount } = calculateInterest(product);
//       handleInputChange("interest_amount", interestAmount.toString());
//     }
//   }, [
//     product?.bill_date,
//     product?.payment_date,
//     product?.interest_start_date,
//     product?.interest_rate,
//     product?.interest_type?.value,
//     product?.grace_period_enabled,
//     product?.grace_period_days,
//     product?.[product?.type]?.net_price,
//   ]);

//   useEffect(() => {
//     if (updateData) {
//       console.log('Received updateData:', updateData);

//       const hsnName = productGroups.find((item) => item.id == updateData.hsn_id);

//       const initialProductState = {
//         ...defaultProductState,
//         id: updateData.id,
//         type: updateData.type || formType,
//         name: updateData.name || "",
//         huid: updateData.huid || "",
//         hsn_id: hsnName ? { label: hsnName.name, value: hsnName.id, variation: hsnName.variation_data } : null,
//         size: updateData.size || "",
//         remark: updateData.remark || "",
//         comment: updateData.comment || "",
//         image: updateData.image || "",
//         additional_image: updateData.additional_image || null,
//         cutting_enabled: updateData.cutting_enabled || false,
//         interest_enabled: updateData.interest_enabled || false,
//         interest_type: updateData.interest_type || { label: "Flat", value: "2" },
//         interest_rate: updateData.interest_rate || "2",
//         interest_amount: updateData.interest_amount || "0",
//         bill_date: updateData.bill_date ? new Date(updateData.bill_date) : new Date(),
//         payment_date: updateData.payment_date ? new Date(updateData.payment_date) : null,
//         interest_start_date: updateData.interest_start_date ? new Date(updateData.interest_start_date) : null,
//         grace_period_enabled: updateData.grace_period_enabled || false,
//         grace_period_days: updateData.grace_period_days || "0",
//         interest_notes: updateData.interest_notes || "",
//         sale: {
//           ...defaultProductState.sale,
//           gross_weight: updateData.sale?.gross_weight || 0,
//           less_weight: updateData.sale?.less_weight || 0,
//           net_weight: updateData.sale?.net_weight || 0,
//           wastage: updateData.sale?.wastage || 0,
//           tounch: updateData.sale?.tounch || 0,
//           fine_weight: updateData.sale?.fine_weight || 0,
//           rate: updateData.sale?.rate || 0,
//           making_type: updateData.sale?.making_type || "",
//           making_charge: updateData.sale?.making_charge || 0,
//           metal_value: updateData.sale?.metal_value || "0",
//           charges_json: updateData.sale?.charges_json || [{}],
//           tax_json: updateData.sale?.tax_json || [{}],
//           custom_fields: updateData.sale?.custom_fields || [],
//           ...updateData.sale?.bill_display_settings,
//         },
//         purchase: {
//           ...defaultProductState.purchase,
//           gross_weight: updateData.purchase?.gross_weight || 0,
//           less_weight: updateData.purchase?.less_weight || 0,
//           net_weight: updateData.purchase?.net_weight || 0,
//           wastage: updateData.purchase?.wastage || 0,
//           tounch: updateData.purchase?.tounch || 0,
//           fine_weight: updateData.purchase?.fine_weight || 0,
//           rate: updateData.purchase?.rate || 0,
//           making_type: updateData.purchase?.making_type || "",
//           making_charge: updateData.purchase?.making_charge || 0,
//           metal_value: updateData.purchase?.metal_value || "0",
//           charges_json: updateData.purchase?.charges_json || [{}],
//           tax_json: updateData.purchase?.tax_json || [{}],
//           custom_fields: updateData.purchase?.custom_fields || [],
//           ...updateData.purchase?.bill_display_settings,
//         },
//       };

//       // Initialize variation and rate if hsn_id has variations
//       if (hsnName?.variation_data?.length > 0) {
//         initialProductState[initialProductState.type].variation = null;
//         initialProductState[initialProductState.type].rate = String(hsnName.variation_data[0].price || "0");
//       }

//       console.log('Setting initial product state:', initialProductState);
//       setProduct(initialProductState);
//       setDataLoaded(true);
//     } else {
//       loadFormData();
//     }
//   }, [updateData, productGroups]);

//   const handleUpdate = async () => {
//     try {
//       if (!product.name) {
//         ShowToast("Product name is required");
//         return;
//       }

//       setLoading(true);

//       const productId = updateData?.id || route?.params?.id;
//       if (!productId) {
//         throw new Error("Product ID is required for update");
//       }

//       const formData = new FormData();

//       formData.append('id', String(productId));
//       formData.append('name', product.name || '');
//       formData.append('huid', product.huid || '');
//       formData.append('hsn_id', product.hsn_id?.value || '');
//       formData.append('comment', product.comment || '');

//       if (product.image && typeof product.image === 'object' && product.image.uri) {
//         formData.append('image', {
//           uri: Platform.OS === 'ios' ? product.image.uri.replace('file://', '') : product.image.uri,
//           type: 'image/jpeg',
//           name: `product_${productId}_${Date.now()}.jpg`,
//         });
//       }

//       if (product.sale) {
//         formData.append('sale_gross_weight', String(product.sale.gross_weight || '0'));
//         formData.append('sale_less_weight', String(product.sale.less_weight || '0'));
//         formData.append('sale_net_weight', String(product.sale.net_weight || '0'));
//         formData.append('sale_wastage', String(product.sale.wastage || '0'));
//         formData.append('sale_tounch', String(product.sale.tounch || '0'));
//         formData.append('sale_fine_weight', String(product.sale.fine_weight || '0'));
//         formData.append('sale_rate', String(product.sale.rate || '0'));
//         formData.append('sale_making_type', product.sale.making_type?.value || 'PG');
//         formData.append('sale_making_charges', String(product.sale.making_charge || '0'));
//         formData.append('sale_net_price', String(product.sale.net_price || '0'));
//         formData.append('sale_charges_json', JSON.stringify(product.sale.charges_json || []));
//         formData.append('sale_tax_json', JSON.stringify(product.sale.tax_json || []));
//       }

//       if (product.purchase) {
//         formData.append('purchase_gross_weight', String(product.purchase.gross_weight || '0'));
//         formData.append('purchase_less_weight', String(product.purchase.less_weight || '0'));
//         formData.append('purchase_net_weight', String(product.purchase.net_weight || '0'));
//         formData.append('purchase_wastage', String(product.purchase.wastage || '0'));
//         formData.append('purchase_tounch', String(product.purchase.tounch || '0'));
//         formData.append('purchase_fine_weight', String(product.purchase.fine_weight || '0'));
//         formData.append('purchase_rate', String(product.purchase.rate || '0'));
//         formData.append('purchase_making_type', product.purchase.making_type?.value || 'PG');
//         formData.append('purchase_making_charges', String(product.purchase.making_charge || '0'));
//         formData.append('purchase_net_price', String(product.purchase.net_price || '0'));
//         formData.append('purchase_charges_json', JSON.stringify(product.purchase.charges_json || []));
//         formData.append('purchase_tax_json', JSON.stringify(product.purchase.tax_json || []));
//       }

//       const response = await ApiRequest({
//         url: MANAGE_PRODUCT_API.update,
//         method: 'POST',
//         body: formData,
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       if (!response?.success) {
//         console.log('Update API Error Response:', response);
//         throw new Error(response?.message || response?.error || "Failed to update product");
//       }

//       try {
//         await ApiRequest({
//           url: MANAGE_LOGS_API.create,
//           method: 'POST',
//           body: {
//             userName: profileData?.name || 'Unknown User',
//             productName: product.name,
//             id: productId,
//             type: 'product',
//             amount: parseFloat(product[product.type]?.net_price || 0).toFixed(2),
//             action: 'UPDATE',
//             entityType: 'PRODUCT',
//             timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
//             metadata: JSON.stringify({
//               action: 'Updated product',
//               productId: productId,
//               note: `Updated product: ${product.name}`,
//             }),
//           },
//         });
//       } catch (logError) {
//         console.error("Failed to create update log:", logError);
//       }

//       await AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY);
//       ShowToast(response.message || "Product updated successfully");
//       navigation.goBack();
//     } catch (error) {
//       console.error('Update error details:', error);
//       ShowToast(error.message || "Error updating product. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     dispatch(fetchProductList());
//   }, []);

//   const handleProductSelect = (selectedProduct) => {
//     setProduct((prev) => ({
//       ...prev,
//       ...selectedProduct,
//       name: selectedProduct.name,
//       huid: selectedProduct.huid,
//       hsn_id: selectedProduct.hsn_id,
//       image: selectedProduct.image_url,
//       type: selectedProduct.type || prev.type,
//     }));
//     setShowSuggestions(false);
//   };

//   return (
//     <Fragment>
//       <KeyboardHanlder>
//         <View className="pt-4">
//           <View className="px-4">
//             {isFromInvoice ? (
//               <SearchProduct
//                 productValue={product}
//                 setProductValue={setProduct}
//                 handleProductDetail={handleProductDetail}
//               />
//             ) : (
//               <View className="flex mb-4 flex-row">
//                 <ImagePickerComponent
//                   onChange={({ value, name }) => handleInputChange(name, value)}
//                   value={product?.image}
//                   name="image"
//                 />
//                 <View className="w-5/6 pl-3">
//                   <View className="relative">
//                     <InputBox
//                       name="name"
//                       label="Name"
//                       value={product?.name}
//                       onChange={({ value, name }) => handleInputChange(name, value)}
//                       error={errors?.name}
//                     />
//                     {validator.message("name", product?.name, "required")}
//                     {showSuggestions && filteredProducts.length > 0 && (
//                       <View className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-40">
//                         <FlatList
//                           data={filteredProducts}
//                           keyExtractor={(item) => item.id}
//                           renderItem={({ item }) => (
//                             <TouchableOpacity
//                               className="p-3 border-b border-gray-100"
//                               onPress={() => handleProductSelect(item)}
//                             >
//                               <Text className="text-gray-800">{item.name}</Text>
//                               {item.huid && (
//                                 <Text className="text-xs text-gray-500">HUID: {item.huid}</Text>
//                               )}
//                             </TouchableOpacity>
//                           )}
//                         />
//                       </View>
//                     )}
//                   </View>
//                 </View>
//               </View>
//             )}

//             <View className="mb-4">
//               <InputBox
//                 name="remark"
//                 label="Remark"
//                 multiLine={true}
//                 value={product?.remark}
//                 onChange={({ value, name }) => handleInputChange(name, value)}
//                 placeholder="Add a remark about this item..."
//               />
//             </View>

//             <View className="mb-4">
//               <Text className="text-sm font-medium mb-1">Item Photo</Text>
//               <ImagePickerComponent
//                 name="image"
//                 value={product?.image || null}
//                 onChange={({ value, name }) => {
//                   const safeValue = value ? {
//                     uri: value.uri || null,
//                     fileName: value.fileName || null,
//                     mimeType: value.mimeType || 'image/jpeg',
//                   } : null;
//                   handleInputChange(name, safeValue);
//                 }}
//               />
//               <Text className="text-xs text-gray-500 mt-1">Upload a photo of the item</Text>
//             </View>

//             <View className="mb-4">
//               <InputBox
//                 name="size"
//                 label="Size"
//                 value={product?.size}
//                 placeholder="e.g., 7, 8.5, Medium, 16mm"
//                 onChange={({ value, name }) => handleInputChange(name, value)}
//               />
//               <View className="flex flex-row items-center justify-between mt-1">
//                 <Text className="text-xs text-gray-500">Enter ring size, bangle diameter, etc.</Text>
//                 <Switch
//                   value={product?.[product.type]?.showSizeInBill || false}
//                   onValueChange={(value) => handleInputChange("showSizeInBill", value, product.type)}
//                   trackColor={{ false: "red", true: "green" }}
//                   thumbColor={product?.[product.type]?.showSizeInBill ? "#ffffff" : "#f4f3f4"}
//                 />
//               </View>
//             </View>

//             <View className="mb-4">
//               <InputBox
//                 multiLine={true}
//                 name="comment"
//                 label="Comment"
//                 value={product?.comment}
//                 onChange={({ value, name }) => handleInputChange(name, value)}
//               />
//               <View className="flex flex-row items-center justify-between mt-1">
//                 <Text className="text-xs text-gray-500"></Text>
//                 <Switch
//                   value={product?.[product.type]?.showCommentInBill || false}
//                   onValueChange={(value) => handleInputChange("showCommentInBill", value, product.type)}
//                   trackColor={{ false: "red", true: "green" }}
//                   thumbColor={product?.[product.type]?.showCommentInBill ? "#ffffff" : "#f4f3f4"}
//                 />
//               </View>
//             </View>

//             <View className="flex mb-4 flex-row">
//               {productTypes.map((type) => (
//                 <View key={type} className={`w-1/2`}>
//                   <TouchableOpacity
//                     className={`
//                       py-2 
//                       ${type === "sale" ? "ml-1.5" : "mr-1.5"}
//                       border border-primary 
//                       rounded-md 
//                       flex flex-row 
//                       justify-center 
//                       items-center 
//                       shadow-xl
//                       ${product?.type === type ? "bg-primary" : "bg-white"}
//                       relative
//                       ${isFromInvoice ? "opacity-75" : ""}
//                     `}
//                     onPress={() => handleProductTypeChange(type)}
//                     disabled={isFromInvoice}
//                   >
//                     <Text
//                       className={`${
//                         product?.type === type ? "text-white" : "text-primary"
//                       } tracking-wider capitalize font-medium`}
//                     >
//                       {type.charAt(0).toUpperCase() + type.slice(1)}
//                     </Text>
//                     {product?.type === type && (
//                       <View className="absolute right-2">
//                         <AntDesign
//                           name="checkcircle"
//                           size={16}
//                           color="white"
//                         />
//                       </View>
//                     )}
//                   </TouchableOpacity>
//                 </View>
//               ))}
//             </View>

//             <View className="mb-4 flex flex-row">
//               <View className="w-2/5 pr-1.5">
//                 <InputBox
//                   name="huid"
//                   label="HUID"
//                   value={product?.huid}
//                   onChange={({ value, name }) => handleInputChange(name, value)}
//                   keyboardType="default"
//                 />
//                 <View className="flex flex-row items-center justify-between mt-1">
//                   <Text className="text-xs text-gray-500"></Text>
//                   <Switch
//                     value={product?.[product.type]?.showHuidInBill || false}
//                     onValueChange={(value) => handleInputChange("showHuidInBill", value, product.type)}
//                     trackColor={{ false: "red", true: "green" }}
//                     thumbColor={product?.[product.type]?.showHuidInBill ? "#ffffff" : "#f4f3f4"}
//                   />
//                 </View>
//               </View>
//               <View className="w-3/5 flex items-start flex-row pl-1.5">
//                 <View className="w-full pr-2">
//                   <SelectInput
//                     label="HSN Name"
//                     name="hsn_id"
//                     value={product?.hsn_id}
//                     placeholder="Select"
//                     error={errors?.hsn_id}
//                     data={productGroups.map((item) => ({
//                       label: item.name,
//                       value: item.id,
//                       variation: item.variation_data,
//                     }))}
//                     onSelect={(value) => handleInputChange("hsn_id", value)}
//                   />
//                   {validator.message("hsn_id", product?.hsn_id, "required")}
//                   <View className="flex flex-row items-center justify-between mt-1">
//                     <Text className="text-xs text-gray-500"></Text>
//                     <Switch
//                       value={product?.[product.type]?.showHsnInBill || false}
//                       onValueChange={(value) => handleInputChange("showHsnInBill", value, product.type)}
//                       trackColor={{ false: "red", true: "green" }}
//                       thumbColor={product?.[product.type]?.showHsnInBill ? "#ffffff" : "#f4f3f4"}
//                     />
//                   </View>
//                 </View>
//                 {!isFromInvoice && (
//                   <TouchableOpacity
//                     onPress={() => handleInitialState("metalModal", true)}
//                     activeOpacity={0.7}
//                     className="bg-primary w-8 h-8 mt-6 flex justify-center items-center rounded-full shadow-xl"
//                   >
//                     <FontAwesome6 name="plus" size={17} color="white" />
//                   </TouchableOpacity>
//                 )}
//               </View>
//             </View>

//             {/* Variation Dropdown */}
//             {isSelectRate && (
//               <View className="mb-4" key={product?.hsn_id?.value}>
//                 <SelectInput
//                   label="Variation"
//                   name="variation"
//                   value={product?.[product.type]?.variation || null}
//                   placeholder="Select Variation"
//                   data={product?.hsn_id?.variation?.map((item) => {
//                     console.log('Variation item:', item.price);
//                     return {
//                       label: `${item.name} (₹${item.price})`,
//                       value: item,
//                     };
//                   }) || []}
//                   onSelect={(value) => {
//                     console.log('Selected variation:', value);
//                     handleInputChange("variation", value, product.type);
//                   }}
//                 />
//               </View>
//             )}
//           </View>

//           <View className="px-4 mb-4">
//             <View className="bg-gray-50 rounded-lg p-4">
//               <View className="flex-row items-center justify-between mb-4">
//                 <Text className="text-lg font-semibold">Interest Configuration</Text>
//                 <Switch
//                   value={product?.interest_enabled}
//                   onValueChange={(value) => handleInputChange("interest_enabled", value)}
//                   trackColor={{ false: "#767577", true: "#22c55e" }}
//                   thumbColor={product?.interest_enabled ? "#ffffff" : "#f4f3f4"}
//                 />
//               </View>

//               {product?.interest_enabled && (
//                 <>
//                   <View className="mb-4">
//                     <Text className="text-base font-medium mb-2">Important Dates</Text>
//                     <View className="space-y-3">
//                       <TouchableOpacity
//                         onPress={() => handleInitialState("billDatePicker", true)}
//                         className="border border-gray-300 rounded-md p-3"
//                       >
//                         <Text className="text-sm text-gray-500">Bill Date</Text>
//                         <Text className="text-base">
//                           {product?.bill_date ? moment(product.bill_date).format("DD MMM YYYY") : "Select Date"}
//                         </Text>
//                       </TouchableOpacity>
//                       <TouchableOpacity
//                         onPress={() => handleInitialState("paymentDatePicker", true)}
//                         className="border border-gray-300 rounded-md p-3"
//                       >
//                         <Text className="text-sm text-gray-500">Expected Payment Date</Text>
//                         <Text className="text-base">
//                           {product?.payment_date ? moment(product.payment_date).format("DD MMM YYYY") : "Select Date"}
//                         </Text>
//                       </TouchableOpacity>
//                       <TouchableOpacity
//                         onPress={() => handleInitialState("interestStartDatePicker", true)}
//                         className="border border-gray-300 rounded-md p-3"
//                       >
//                         <Text className="text-sm text-gray-500">Interest Start Date</Text>
//                         <Text className="text-base">
//                           {product?.interest_start_date ? moment(product.interest_start_date).format("DD MMM YYYY") : "Select Date"}
//                         </Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                   <View className="mb-4">
//                     <Text className="text-base font-medium mb-2">Interest Details</Text>
//                     <View className="space-y-3">
//                       <SelectInput
//                         label="Interest Type"
//                         name="interest_type"
//                         value={product?.interest_type}
//                         placeholder="Select Type"
//                         data={[
//                           { label: "Flat", value: "2" },
//                           { label: "Compound", value: "1" },
//                         ]}
//                         onSelect={(value) => handleInputChange("interest_type", value)}
//                       />
//                       <InputBox
//                         name="interest_rate"
//                         label="Interest Rate (%)"
//                         value={product?.interest_rate}
//                         keyboardType="numeric"
//                         onChange={({ value }) => handleInputChange("interest_rate", value)}
//                       />
//                     </View>
//                   </View>
//                   <View className="mb-4">
//                     <View className="flex-row items-center justify-between mb-2">
//                       <Text className="text-base font-medium">Grace Period</Text>
//                       <Switch
//                         value={product?.grace_period_enabled}
//                         onValueChange={(value) => handleInputChange("grace_period_enabled", value)}
//                         trackColor={{ false: "#767577", true: "#22c55e" }}
//                         thumbColor={product?.grace_period_enabled ? "#ffffff" : "#f4f3f4"}
//                       />
//                     </View>
//                     {product?.grace_period_enabled && (
//                       <InputBox
//                         name="grace_period_days"
//                         label="Grace Period (Days)"
//                         value={product?.grace_period_days}
//                         keyboardType="numeric"
//                         onChange={({ value }) => handleInputChange("grace_period_days", value)}
//                       />
//                     )}
//                   </View>
//                   <View className="mb-4">
//                     <InputBox
//                       name="interest_notes"
//                       label="Interest Notes"
//                       value={product?.interest_notes}
//                       multiLine={true}
//                       numberOfLines={3}
//                       onChange={({ value }) => handleInputChange("interest_notes", value)}
//                       placeholder="Add any special notes about interest terms..."
//                     />
//                   </View>
//                   <View className="bg-white rounded-lg p-3 mb-4">
//                     <Text className="text-base font-medium mb-2">Interest Summary</Text>
//                     <View className="space-y-2">
//                       <View className="flex-row justify-between">
//                         <Text className="text-gray-600">Original Amount:</Text>
//                         <Text>₹{handleDigitsFix(product?.[product.type]?.net_price || 0)}</Text>
//                       </View>
//                       <View className="flex-row justify-between">
//                         <Text className="text-gray-600">Interest Period:</Text>
//                         <Text>{calculateInterestPeriod(product)} days</Text>
//                       </View>
//                       <View className="flex-row justify-between">
//                         <Text className="text-gray-600">Interest Amount:</Text>
//                         <Text>₹{handleDigitsFix(Number(product?.interest_amount || 0))}</Text>
//                       </View>
//                       <View className="flex-row justify-between pt-2 border-t border-gray-200">
//                         <Text className="font-medium">Total Amount:</Text>
//                         <Text className="font-medium">₹{handleDigitsFix(
//                           Number(product?.[product.type]?.net_price || 0) +
//                           Number(product?.interest_amount || 0)
//                         )}</Text>
//                       </View>
//                     </View>
//                   </View>
//                 </>
//               )}
//             </View>
//           </View>

//           {productTypes.map((category) => {
//             const isPurchase = category === "purchase";
//             return (
//               product?.type === category && (
//                 <View
//                   className="bg-slate-50 shadow-lg px-4 pt-4"
//                   key={category}
//                 >
//                   <View className="mb-4 flex flex-row">
//                     <View className="w-1/5 pr-1">
//                       <InputBox
//                         name="gross_weight"
//                         placeholder="0"
//                         label="Gross Wt"
//                         value={String(product?.[category]?.gross_weight || '')}
//                         onChange={({ value, name }) =>
//                           handleInputChange(name, value, category)
//                         }
//                         keyboardType="numeric"
//                       />
//                       <View className="flex flex-row items-center justify-between mt-1">
//                         <Text className="text-xs text-gray-500"></Text>
//                         <Switch
//                           value={product?.[category]?.showGrossWeightInBill || false}
//                           onValueChange={(value) => handleInputChange("showGrossWeightInBill", value, category)}
//                           trackColor={{ false: "red", true: "green" }}
//                           thumbColor={product?.[category]?.showGrossWeightInBill ? "#ffffff" : "#f4f3f4"}
//                         />
//                       </View>
//                     </View>
//                     <View className="w-1/5 px-1">
//                       <InputBox
//                         name="less_weight"
//                         placeholder="0"
//                         label="Less Wt"
//                         value={String(product?.[category]?.less_weight || '')}
//                         onChange={({ value, name }) =>
//                           handleInputChange(name, value, category)
//                         }
//                         keyboardType="numeric"
//                       />
//                       <View className="flex flex-row items-center justify-between mt-1">
//                         <Text className="text-xs text-gray-500"></Text>
//                         <Switch
//                           value={product?.[category]?.showLessWeightInBill || false}
//                           onValueChange={(value) => handleInputChange("showLessWeightInBill", value, category)}
//                           trackColor={{ false: "red", true: "green" }}
//                           thumbColor={product?.[category]?.showLessWeightInBill ? "#ffffff" : "#f4f3f4"}
//                         />
//                       </View>
//                     </View>
//                     <View className="w-1/5 px-1">
//                       <InputBox
//                         name="net_weight"
//                         placeholder="0"
//                         label="Net Wt"
//                         readOnly={true}
//                         value={String(product?.[category]?.net_weight || '')}
//                         onChange={({ value, name }) =>
//                           handleInputChange(name, value, category)
//                         }
//                         keyboardType="numeric"
//                       />
//                       <View className="flex flex-row items-center justify-between mt-1">
//                         <Text className="text-xs text-gray-500"></Text>
//                         <Switch
//                           value={product?.[category]?.showNetWeightInBill || false}
//                           onValueChange={(value) => handleInputChange("showNetWeightInBill", value, category)}
//                           trackColor={{ false: "red", true: "green" }}
//                           thumbColor={product?.[category]?.showNetWeightInBill ? "#ffffff" : "#f4f3f4"}
//                         />
//                       </View>
//                     </View>
//                     <View
//                       className={`w-2/5 ${isPurchase ? "flex-row-reverse" : "flex-row"} flex`}
//                     >
//                       <View
//                         className={`w-1/2 ${isPurchase ? "pl-0.5" : "pr-1 pl-0.5"}`}
//                       >
//                         <InputBox
//                           name="tounch"
//                           placeholder="0 %"
//                           label="Tounch"
//                           value={String(product?.[category]?.tounch || '')}
//                           onChange={({ value, name }) =>
//                             handleInputChange(name, value, category)
//                           }
//                           keyboardType="numeric"
//                         />
//                         <View className="flex flex-row items-center justify-between mt-1">
//                           <Text className="text-xs text-gray-500"></Text>
//                           <Switch
//                             value={product?.[category]?.showTounchInBill || false}
//                             onValueChange={(value) => handleInputChange("showTounchInBill", value, category)}
//                             trackColor={{ false: "red", true: "green" }}
//                             thumbColor={product?.[category]?.showTounchInBill ? "#ffffff" : "#f4f3f4"}
//                           />
//                         </View>
//                       </View>
//                       <View
//                         className={`w-1/2 ${isPurchase ? "pr-1 pl-0.5" : "pl-0.5"}`}
//                       >
//                         <InputBox
//                           name="wastage"
//                           placeholder="0 %"
//                           label="Wastage"
//                           value={String(product?.[category]?.wastage || '')}
//                           onChange={({ value, name }) =>
//                             handleInputChange(name, value, category)
//                           }
//                           keyboardType="numeric"
//                         />
//                         <View className="flex flex-row items-center justify-between mt-1">
//                           <Text className="text-xs text-gray-500"></Text>
//                           <Switch
//                             value={product?.[category]?.showWastageInBill || false}
//                             onValueChange={(value) => handleInputChange("showWastageInBill", value, category)}
//                             trackColor={{ false: "red", true: "green" }}
//                             thumbColor={product?.[category]?.showWastageInBill ? "#ffffff" : "#f4f3f4"}
//                           />
//                         </View>
//                       </View>
//                     </View>
//                   </View>

//                   <View className="mb-4 flex flex-row">
//                     <View className="w-1/3 pr-1">
//                       <InputBox
//                         name="fine_weight"
//                         label="Fine Weight"
//                         placeholder="0"
//                         readOnly={true}
//                         value={String(product?.[category]?.fine_weight || '')}
//                         onChange={({ value }) => handleInputChange("fine_weight", value, category)}
//                         keyboardType="numeric"
//                       />
//                       <View className="flex flex-row items-center justify-between mt-1">
//                         <Text className="text-xs text-gray-500"></Text>
//                         <Switch
//                           value={product?.[category]?.showFineWeightInBill || false}
//                           onValueChange={(value) => handleInputChange("showFineWeightInBill", value, category)}
//                           trackColor={{ false: "red", true: "green" }}
//                           thumbColor={product?.[category]?.showFineWeightInBill ? "#ffffff" : "#f4f3f4"}
//                         />
//                       </View>
//                     </View>
//                     <View className="w-1/3 px-1">
//                       <Text className="text-slate-500 text-[13px] mb-1">Cutting</Text>
//                       <View className="bg-gray-100 rounded-lg">
//                         <CommonButton
//                           title={product.cutting_enabled ? "ON" : "OFF"}
//                           onPress={() => {
//                             const currentType = product.type;
//                             const buttonRate = parseFloat(product[currentType]?.rate || 0);
//                             const buttonFineWeight = parseFloat(product[currentType]?.fine_weight) || 0;
//                             const buttonMetalValue = !product.cutting_enabled ? (buttonFineWeight * buttonRate).toFixed(2) : "0";

//                             setProduct((prev) => ({
//                               ...prev,
//                               cutting_enabled: !prev.cutting_enabled,
//                               [currentType]: {
//                                 ...prev[currentType],
//                                 metal_value: buttonMetalValue,
//                               },
//                             }));
//                           }}
//                           isFilled={product.cutting_enabled}
//                           small
//                         />
//                       </View>
//                     </View>
//                     <View className="w-1/3 pl-1">
//                       <InputBox
//                         name="rate"
//                         label="Rate"
//                         placeholder="0"
//                         value={String(product?.[category]?.rate || '0')}
//                         readOnly={isSelectRate}
//                         onChange={({ value }) => handleInputChange("rate", value, category)}
//                         keyboardType="numeric"
//                       />
//                       <View className="flex flex-row items-center justify-between mt-1">
//                         <Text className="text-xs text-gray-500"></Text>
//                         <Switch
//                           value={product?.[category]?.showRateInBill || false}
//                           onValueChange={(value) => handleInputChange("showRateInBill", value, category)}
//                           trackColor={{ false: "red", true: "green" }}
//                           thumbColor={product?.[category]?.showRateInBill ? "#ffffff" : "#f4f3f4"}
//                         />
//                       </View>
//                     </View>
//                   </View>

//                   <View className="mb-4 flex flex-row">
//                     <View className="w-1/2 pr-1">
//                       <SelectInput
//                         label="Making Type"
//                         name="making_type"
//                         value={product?.[category]?.making_type}
//                         placeholder="Select"
//                         data={[
//                           { label: "Per Gram (PG)", value: "PG" },
//                           { label: "Per Piece (PP)", value: "PP" },
//                         ]}
//                         onSelect={(value) => handleInputChange("making_type", value, category)}
//                       />
//                     </View>
//                     <View className="w-1/2 pl-1">
//                       <InputBox
//                         name="making_charge"
//                         label="Making Charge"
//                         placeholder="0"
//                         value={String(product?.[category]?.making_charge || '')}
//                         onChange={({ value }) => handleInputChange("making_charge", value, category)}
//                         keyboardType="numeric"
//                       />
//                     </View>
//                   </View>

//                   <View className="mb-4 flex flex-row">
//                     <View className="w-full">
//                       <InputBox
//                         name="net_price"
//                         readOnly={true}
//                         label="Net Price"
//                         placeholder="0"
//                         value={handleDigitsFix(product?.[category]?.net_price || 0)}
//                         keyboardType="numeric"
//                       />
//                       <View className="flex flex-row items-center justify-between mt-1">
//                         <Text className="text-xs text-gray-500"></Text>
//                         <Switch
//                           value={product?.[category]?.showNetPriceInBill || false}
//                           onValueChange={(value) => handleInputChange("showNetPriceInBill", value, category)}
//                           trackColor={{ false: "red", true: "green" }}
//                           thumbColor={product?.[category]?.showNetPriceInBill ? "#ffffff" : "#f4f3f4"}
//                         />
//                       </View>
//                     </View>
//                   </View>

//                   <View className="mb-4 flex flex-row items-center bg-gray-50 px-3 py-2 rounded-lg">
//                     <Text className="text-gray-600">Show Price in Bill</Text>
//                     <Switch
//                       value={product?.[category]?.showPriceInBill ?? false}
//                       onValueChange={(value) => handleInputChange("showPriceInBill", value, category)}
//                       trackColor={{ false: "#767577", true: "green" }}
//                       thumbColor={product?.[category]?.showPriceInBill ? "#ffffff" : "#f4f3f4"}
//                     />
//                   </View>

//                   {product?.[category]?.showPriceInBill ? (
//                     <View className="mb-4 bg-gray-50 p-4 rounded-lg">
//                       <Text className="text-base font-semibold mb-3">Calculation Summary</Text>
//                       <View className="space-y-2">
//                         <View className="flex flex-row justify-between">
//                           <Text className="text-gray-600">Net Weight:</Text>
//                           <Text>{product?.[category]?.net_weight || 0} g</Text>
//                         </View>
//                         <View className="flex flex-row justify-between items-center">
//                           <Text className="text-gray-600">Fine Weight:</Text>
//                           <View className="flex flex-row items-center">
//                             <Text className="text-gray-500 text-sm mr-2">
//                               ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × ({Number(product?.[category]?.tounch || 0)}% + {Number(product?.[category]?.wastage || 0)}%))
//                             </Text>
//                             <Text className="font-medium">{handleDigitsFix(product?.[category]?.fine_weight || 0)} g</Text>
//                           </View>
//                         </View>
//                         <View className="flex flex-row justify-between items-center">
//                           <Text className="text-gray-600">Wastage Weight:</Text>
//                           <View className="flex flex-row items-center">
//                             <Text className="text-gray-500 text-sm mr-2">
//                               ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × {Number(product?.[category]?.wastage || 0)}%)
//                             </Text>
//                             <Text className="font-medium">{handleDigitsFix(
//                               Number(product?.[category]?.gross_weight || 0) *
//                               (Number(product?.[category]?.wastage || 0) / 100)
//                             )} g</Text>
//                           </View>
//                         </View>
//                         <View className="flex flex-row justify-between items-center">
//                           <Text className="text-gray-600">Total Weight with Wastage:</Text>
//                           <View className="flex flex-row items-center">
//                             <Text className="text-gray-500 text-sm mr-2">
//                               ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × (100% + {Number(product?.[category]?.wastage || 0)}%))
//                             </Text>
//                             <Text className="font-medium">{handleDigitsFix(
//                               Number(product?.[category]?.gross_weight || 0) *
//                               (1 + (Number(product?.[category]?.wastage || 0) / 100))
//                             )} g</Text>
//                           </View>
//                         </View>
//                         <View className="flex flex-row justify-between items-center">
//                           <Text className="text-gray-600">Wastage Value:</Text>
//                           <View className="flex flex-row items-center">
//                             <Text className="text-gray-500 text-sm mr-2">
//                               ({handleDigitsFix(
//                                 Number(product?.[category]?.gross_weight || 0) *
//                                 (Number(product?.[category]?.wastage || 0) / 100)
//                               )} × ({Number(product?.[category]?.tounch || 0)}% × ₹{handleDigitsFix(product?.[category]?.rate || 0)}))
//                             </Text>
//                             <Text className="font-medium">₹{handleDigitsFix(
//                               (Number(product?.[category]?.gross_weight || 0) *
//                               (Number(product?.[category]?.wastage || 0) / 100)) *
//                               ((Number(product?.[category]?.tounch || 0) / 100) *
//                               Number(product?.[category]?.rate || 0))
//                             )}</Text>
//                           </View>
//                         </View>
//                         <View className="flex flex-row justify-between items-center">
//                           <Text className="text-gray-600">Metal Value:</Text>
//                           <View className="flex flex-row items-center">
//                             {product.cutting_enabled ? (
//                               <>
//                                 <Text className="text-gray-500 text-sm mr-2">
//                                   ({handleDigitsFix(product?.[category]?.fine_weight || 0)} × ₹{handleDigitsFix(product?.[category]?.rate || 0)})
//                                 </Text>
//                                 <Text className="font-medium">₹{handleDigitsFix(
//                                   Number(product?.[category]?.fine_weight || 0) *
//                                   Number(product?.[category]?.rate || 0)
//                                 )}</Text>
//                               </>
//                             ) : (
//                               <Text className="font-medium">₹0.00 (Cutting OFF)</Text>
//                             )}
//                           </View>
//                         </View>
//                         <View className="flex flex-row justify-between items-center">
//                           <Text className="text-gray-600">Making Charges:</Text>
//                           <View className="flex flex-row items-center">
//                             {product?.[category]?.making_type?.value === "PG" ? (
//                               <Text className="text-gray-500 text-sm mr-2">
//                                 ({handleDigitsFix(product?.[category]?.net_weight || 0)} × ₹{handleDigitsFix(product?.[category]?.making_charge || 0)})
//                               </Text>
//                             ) : null}
//                             <Text className="font-medium">₹{handleDigitsFix(
//                               product?.[category]?.making_type?.value === "PG"
//                                 ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
//                                 : Number(product?.[category]?.making_charge || 0)
//                             )}</Text>
//                           </View>
//                         </View>
//                         <View className="mb-4">
//                           <View className="flex-row justify-between items-center mb-2">
//                             <Text className="text-gray-600 font-medium">Additional Charges</Text>
//                             <TouchableOpacity
//                               onPress={() => {
//                                 const updatedCharges = [...(product[category].charges_json || []), { name: '', amount: '0' }];
//                                 handleInputChange('charges_json', updatedCharges, category);
//                               }}
//                               className="bg-primary px-2 py-1 rounded-md"
//                             >
//                               <Text className="text-white">+ Add</Text>
//                             </TouchableOpacity>
//                           </View>
//                           {(product[category]?.charges_json || []).map((charge, index) => (
//                             <View key={index} className="flex-row items-center mb-2">
//                               <View className="flex-1 mr-2">
//                                 <OutlineInput
//                                   placeholder="Charge name"
//                                   value={charge.name}
//                                   maxLength={50}
//                                   onChangeText={(value) => {
//                                     const updatedCharges = [...(product[category].charges_json || [])];
//                                     updatedCharges[index] = { ...charge, name: value };
//                                     handleInputChange('charges_json', updatedCharges, category);
//                                   }}
//                                 />
//                               </View>
//                               <View className="w-24 mr-2">
//                                 <OutlineInput
//                                   placeholder="Amount"
//                                   value={String(charge.amount)}
//                                   keyboardType="numeric"
//                                   onChangeText={(value) => {
//                                     const updatedCharges = [...(product[category].charges_json || [])];
//                                     updatedCharges[index] = { ...charge, amount: value || '0' };
//                                     handleInputChange('charges_json', updatedCharges, category);
//                                   }}
//                                 />
//                               </View>
//                               <TouchableOpacity
//                                 onPress={() => {
//                                   const updatedCharges = (product[category].charges_json || []).filter((_, i) => i !== index);
//                                   handleInputChange('charges_json', updatedCharges, category);
//                                 }}
//                               >
//                                 <FontAwesome6 name="trash" size={16} color="red" />
//                               </TouchableOpacity>
//                             </View>
//                           ))}
//                           {(product[category]?.charges_json || []).length > 0 && (
//                             <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-200">
//                               <Text className="text-gray-600">Total:</Text>
//                               <Text className="font-medium">₹{handleDigitsFix(
//                                 (product[category]?.charges_json || []).reduce((sum, charge) =>
//                                   sum + Number(charge.amount || 0), 0)
//                               )}</Text>
//                             </View>
//                           )}
//                         </View>
//                         <View className="flex flex-row justify-between items-center border-t border-gray-200 mt-2 pt-2">
//                           <Text className="text-gray-600 font-semibold">Subtotal:</Text>
//                           <Text className="font-semibold">₹{handleDigitsFix(
//                             (product.cutting_enabled
//                               ? (Number(product?.[category]?.fine_weight || 0) *
//                                  Number(product?.[category]?.rate || 0))
//                               : 0) +
//                             (product?.[category]?.making_type?.value === "PG"
//                               ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
//                               : Number(product?.[category]?.making_charge || 0)) +
//                             (product[category]?.charges_json || []).reduce((sum, charge) => 
//                               sum + Number(charge.amount || 0), 0)
//                           )}</Text>
//                         </View>
//                         <View className="flex flex-row justify-between items-center">
//                           <Text className="text-gray-600">Tax Amount ({Number(product?.[category]?.tax || 0)}%):</Text>
//                           <Text className="font-medium">₹{handleDigitsFix(
//                             (
//                               (product.cutting_enabled ? 
//                                 (Number(product?.[category]?.fine_weight || 0) * 
//                                  Number(product?.[category]?.rate || 0))
//                                : 0) +
//                               (product?.[category]?.making_type?.value === "PG" 
//                                 ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
//                                : Number(product?.[category]?.making_charge || 0)) +
//                               ((product[category]?.charges_json || []).reduce((sum, charge) => 
//                                 sum + Number(charge.amount || 0), 0))
//                             ) * (Number(product?.[category]?.tax || 0) / 100)
//                           )}</Text>
//                         </View>
//                         <View className="flex flex-row justify-between border-t border-gray-200 pt-2">
//                           <Text className="text-gray-600 font-semibold">Final Price:</Text>
//                           <Text className="font-semibold">₹{handleDigitsFix(
//                             // Subtotal
//                             (
//                               (product.cutting_enabled ? 
//                                 (Number(product?.[category]?.fine_weight || 0) * 
//                                  Number(product?.[category]?.rate || 0))
//                                : 0) +
//                               (product?.[category]?.making_type?.value === "PG"
//                                 ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
//                                : Number(product?.[category]?.making_charge || 0)) +
//                               ((product[category]?.charges_json || []).reduce((sum, charge) => 
//                                 sum + Number(charge.amount || 0), 0))
//                             ) +
//                             // Tax Amount
//                             (
//                               (product.cutting_enabled ? 
//                                 (Number(product?.[category]?.fine_weight || 0) *
//                                   Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
//              : 0) +
//             (product?.[category]?.making_type?.value === "PG"
//               ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
//              : Number(product?.[category]?.making_charge || 0)) +
//             ((product[category]?.charges_json || []).reduce((sum, charge) => 
//               sum + Number(charge.amount || 0), 0))
//           ) * (Number(product?.[category]?.tax || 0) / 100)
//         )}</Text>
//       </View>
//     </View>
//   </View>
// ) : (
//   <View className="mb-4 bg-gray-50 p-4 rounded-lg">
//     <Text className="text-base font-semibold mb-3">Basic Weight Details</Text>
//     <View className="space-y-2">
//       <View className="flex flex-row justify-between">
//         <Text className="text-gray-600">Net Weight:</Text>
//         <Text>{product?.[category]?.net_weight || 0} g</Text>
//       </View>
//       <View className="flex flex-row justify-between items-center">
//         <Text className="text-gray-600">Fine Weight:</Text>
//         <View className="flex flex-row items-center">
//           <Text className="text-gray-500 text-sm mr-2">
//             ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × ({Number(product?.[category]?.tounch || 0)}% + {Number(product?.[category]?.wastage || 0)}%))
//           </Text>
//           <Text className="font-medium">{handleDigitsFix(product?.[category]?.fine_weight || 0)} g</Text>
//         </View>
//       </View>
//     </View>
//   </View>
// )}
//                   {/* charges and taxes */}
//                   <View className="mb-4">
//                     {/* Charges */}
//                     <View className="mb-5">
//                       <View className="flex flex-row items-center justify-between">
//                         <Text className="tracking-wider text-base">
//                           Charges
//                         </Text>
//                         <View className="flex flex-row items-center">
//                           <Switch
//                             value={product?.[category]?.showChargesInBill || false}
//                             onValueChange={(value) => handleInputChange("showChargesInBill", value, category)}
//                             trackColor={{ false: "red", true: "green" }}
//                             thumbColor={product?.[category]?.showChargesInBill ? "#ffffff" : "#f4f3f4"}
//                           />
//                         <TouchableOpacity
//                           onPress={() => addItem(category, "charges_json")}
//                           activeOpacity={0.7}
//                             className="bg-primary ml-2 w-6 h-6 flex justify-center items-center rounded-full shadow-xl"
//                         >
//                           <FontAwesome6 name="plus" size={17} color="white" />
//                         </TouchableOpacity>
//                         </View>
//                       </View>
//                       {/* Input fields */}
//                       {product[category]?.charges_json?.map((charge, index) => {
//                         return (
//                           <View
//                             key={index}
//                             className="flex pt-2 pl-1 items-end flex-row"
//                           >
//                             {/* charge name */}
//                             <View className="w-[45%] pr-2">
//                               <OutlineInput
//                                 placeholder="e.g. Labour Charge"
//                                 value={charge.name}
//                                 onChangeText={(value) =>
//                                   handleInputChange(
//                                     "name",
//                                     value,
//                                     category,
//                                     "charges_json",
//                                     index
//                                   )
//                                 }
//                               />
//                             </View>

//                             {/* amount */}
//                             <View className="w-[45%] px-2">
//                               <OutlineInput
//                                 placeholder="e.g. 500"
//                                 value={charge.amount}
//                                 keyboardType="numeric"
//                                 onChangeText={(value) =>
//                                   handleInputChange(
//                                     "amount",
//                                     value,
//                                     category,
//                                     "charges_json",
//                                     index
//                                   )
//                                 }
//                               />
//                             </View>

//                             {/* trash icon */}
//                             {product[category]?.charges_json.length > 1 && (
//                               <TouchableOpacity
//                                 onPress={() =>
//                                   removeChargeTaxInput(
//                                     category,
//                                     "charges_json",
//                                     index
//                                   )
//                                 }
//                                 activeOpacity={0.7}
//                                 className="w-[10%] flex justify-center pl-3"
//                               >
//                                 <FontAwesome6
//                                   name="trash"
//                                   size={15}
//                                   color="red"
//                                 />
//                               </TouchableOpacity>
//                             )}
//                           </View>
//                         );
//                       })}
//                     </View>

//                     {/* Taxes */}
//                     <View className="">
//                       <View className="flex flex-row items-center justify-between">
//                         <Text className="tracking-wider text-base">Tax</Text>
//                         <View className="flex flex-row items-center">
//                           <Switch
//                             value={product?.[category]?.showTaxInBill || false}
//                             onValueChange={(value) => handleInputChange("showTaxInBill", value, category)}
//                             trackColor={{ false: "red", true: "green" }}
//                             thumbColor={product?.[category]?.showTaxInBill ? "#ffffff" : "#f4f3f4"}
//                           />
//                         <TouchableOpacity
//                           onPress={() => addItem(category, "tax_json")}
//                           activeOpacity={0.7}
//                             className="bg-primary ml-2 w-6 h-6 flex justify-center items-center rounded-full shadow-xl"
//                         >
//                           <FontAwesome6 name="plus" size={17} color="white" />
//                         </TouchableOpacity>
//                         </View>
//                       </View>
//                       {/* Input fields */}
//                       {product[category]?.tax_json?.map((tax, index) => {
//                         return (
//                           <View
//                             key={index}
//                             className="flex pt-2 pl-1 items-end flex-row"
//                           >
//                             {/* tax name */}
//                             <View className="w-[45%] pr-2">
//                               <OutlineInput
//                                 placeholder="e.g. Tax"
//                                 value={tax.name}
//                                 onChangeText={(value) =>
//                                   handleInputChange(
//                                     "name",
//                                     value,
//                                     category,
//                                     "tax_json",
//                                     index
//                                   )
//                                 }
//                               />
//                             </View>

//                             {/* tax amount */}
//                             <View className="w-[45%] px-2">
//                               <OutlineInput
//                                 placeholder="e.g. 10%"
//                                 value={tax.amount}
//                                 keyboardType="numeric"
//                                 onChangeText={(value) =>
//                                   handleInputChange(
//                                     "amount",
//                                     value,
//                                     category,
//                                     "tax_json",
//                                     index
//                                   )
//                                 }
//                               />
//                             </View>

//                             {/* trash icon */}
//                             {product[category]?.tax_json.length > 1 && (
//                               <TouchableOpacity
//                                 onPress={() =>
//                                   removeChargeTaxInput(
//                                     category,
//                                     "tax_json",
//                                     index
//                                   )
//                                 }
//                                 activeOpacity={0.7}
//                                 className="w-[10%] flex justify-center pl-3"
//                               >
//                                 <FontAwesome6
//                                   name="trash"
//                                   size={15}
//                                   color="red"
//                                 />
//                               </TouchableOpacity>
//                             )}
//                           </View>
//                         );
//                       })}
//                     </View>
//                   </View>
//                 </View>
//               )
//             );
//           })}
//           {/* ---------  common for sale & purchase - END - ---------- */}

//           {/* Custom Fields Section */}
//           <View className="px-4 pb-4">
//             <View className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
//               <View className="flex-row items-center justify-between mb-4">
//                 <Text className="text-lg font-semibold text-gray-800">Custom Fields</Text>
//                 <TouchableOpacity
//                   onPress={() => {
//                     setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
//                     setCustomFieldModal(true);
//                   }}
//                   className="bg-primary px-4 py-2 rounded-full flex-row items-center"
//                 >
//                   <FontAwesome6 name="plus" size={14} color="white" className="mr-2" />
//                   <Text className="text-white font-medium ml-1">Add Field</Text>
//                 </TouchableOpacity>
//               </View>

//               {/* Custom Fields List */}
//               {(product[product.type]?.custom_fields || []).map((field, index) => (
//                 <View key={index} className="mb-4 bg-gray-50 p-3 rounded-lg">
//                   <View className="flex-row items-center justify-between">
//                     <View className="flex-1">
//                       <Text className="text-base font-medium">{field.label}</Text>
//                       <Text className="text-sm text-gray-600">{field.value} {field.unit?.value || ''}</Text>
//                     </View>
//                     <View className="flex-row items-center">
//                       <Switch
//                         value={field.showInBill}
//                         onValueChange={(value) => {
//                           const updatedFields = [...(product[product.type].custom_fields || [])];
//                           updatedFields[index] = { ...field, showInBill: value };
//                           handleInputChange("custom_fields", updatedFields, product.type);
//                         }}
//                         trackColor={{ false: "#767577", true: "#22c55e" }}
//                         thumbColor={field.showInBill ? "#ffffff" : "#f4f3f4"}
//                       />
//                       <TouchableOpacity
//                         onPress={() => {
//                           const updatedFields = (product[product.type].custom_fields || []).filter((_, i) => i !== index);
//                           handleInputChange("custom_fields", updatedFields, product.type);
//                         }}
//                         className="ml-4 bg-red-100 p-2 rounded-full"
//                       >
//                         <FontAwesome6 name="trash" size={16} color="#ef4444" />
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 </View>
//               ))}

//               {!(product[product.type]?.custom_fields?.length > 0) && (
//                 <View className="items-center py-6 bg-gray-50 rounded-lg">
//                   <Text className="text-gray-500 text-sm">No custom fieldss added yet</Text>
//                   <Text className="text-gray-400 text-xs mt-1">Click the "Add Field" button to create custom fields</Text>
//                 </View>
//               )}
//             </View>
//           </View>

//           {/* Custom Field Modal */}
//           <Modal
//             visible={customFieldModal}
//             transparent
//             animationType="fade"
//             onRequestClose={() => setCustomFieldModal(false)}
//           >
//             <View className="flex-1 justify-center items-center bg-black/50">
//               <View className="bg-white p-4 rounded-lg w-[90%] max-w-md">
//                 <Text className="text-lg font-semibold mb-4">Add Custom Field</Text>
                
//                 {/* Field Label */}
//             <View className="mb-4">
//               <InputBox
//                     name="label"
//                     label="Field Label"
//                     placeholder="e.g., Less Weight 2"
//                     value={tempCustomField.label}
//                     onChange={({ value }) => setTempCustomField(prev => ({ ...prev, label: value }))}
//                   />
//                 </View>

//                 {/* Field Value */}
//                 <View className="mb-4">
//                   <InputBox
//                     name="value"
//                     label="Value"
//                     placeholder="Enter numeric value"
//                     value={tempCustomField.value}
//                     keyboardType="numeric"
//                     onChange={({ value }) => setTempCustomField(prev => ({ ...prev, value }))}
//                   />
//                 </View>

//                 {/* Unit Selection */}
//                 <View className="mb-4">
//                   <SelectInput
//                     label="Unit"
//                     name="unit"
//                     value={tempCustomField.unit}
//                     placeholder="Select Unit"
//                     data={jewelryUnits}
//                     onSelect={(value) => setTempCustomField(prev => ({ ...prev, unit: value }))}
//                   />
//                 </View>

//                 {/* Show in Bill Toggle */}
//                 <View className="flex-row items-center justify-between mb-6">
//                   <Text className="text-base text-gray-700">Show in Bill</Text>
//                   <Switch
//                     value={tempCustomField.showInBill}
//                     onValueChange={(value) => setTempCustomField(prev => ({ ...prev, showInBill: value }))}
//                     trackColor={{ false: "#767577", true: "#22c55e" }}
//                     thumbColor={tempCustomField.showInBill ? "#ffffff" : "#f4f3f4"}
//                   />
//                 </View>

//                 {/* Buttons */}
//                 <View className="flex-row justify-end space-x-2">
//                   <TouchableOpacity 
//                     onPress={() => {
//                       setCustomFieldModal(false);
//                       setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
//                     }}
//                     className="px-4 py-2"
//                   >
//                     <Text className="text-gray-600">Cancel</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity 
//                     onPress={() => {
//                       const updatedFields = [...(product[product.type]?.custom_fields || [])];
//                       updatedFields.push(tempCustomField);
//                       handleInputChange("custom_fields", updatedFields, product.type);
//                       setCustomFieldModal(false);
//                       setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
//                     }}
//                     className="bg-primary px-4 py-2 rounded-md"
//                   >
//                     <Text className="text-white">Done</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </View>
//           </Modal>

//           {/* Horizontal Layout for Photo + Buttons */}
//           <View className="flex-row px-4 pb-4">
//             {/* Additional Photo - Left Side */}
//             <View className="flex-1 pr-2">
//               <View className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
//                 <Text className="text-sm font-medium mb-2 text-center">Additional Photo</Text>
//                 <ImagePickerComponent
//                   name="additional_image"
//                   value={product?.additional_image}
//                 onChange={({ value, name }) => handleInputChange(name, value)}
//               />
//                 <Text className="text-xs text-gray-500 mt-2 text-center">
//                   Upload item photo
//                 </Text>
//               </View>
//             </View>

//             {/* Buttons - Right Side */}
//             <View className="w-1/3 pl-2">
//             {isFromInvoice ? (
//                 <View className="space-y-2">
//                 <CommonButton
//                   loading={loading}
//                   onPress={handleAddProduct}
//                   title="Add Product"
//                     />
//               </View>
//             ) : (
//                 <View className="space-y-2">
//                   <CommonButton
//                     loading={loading}
//                     onPress={onSubmitClick}
//                     title={route?.params?.isProductEdit || updateData ? "Update" : "Create"}
//                   />
//               </View>
//             )}
//             </View>
//           </View>
//         </View>
//       </KeyboardHanlder>

//       {/* Add weight */}
//       {updateData && (
//         <AddWeightModal
//           product={{ id: updateData.id, type: product?.type }}
//           open={initialState.weightModal}
//           onClose={() => handleInitialState("weightModal", false)}
//         />
//       )}

//       {/* Create metal */}
//       <CreateMetalModal
//         navigation={navigation}
//         route={route}
//         open={initialState.metalModal}
//         onClose={() => handleInitialState("metalModal", false)}
//       />

//       {/* Date Picker Modals */}
//       <Modal
//         visible={initialState.billDatePicker}
//         transparent
//         animationType="fade"
//         onRequestClose={() => handleInitialState("billDatePicker", false)}
//       >
//         <View className="flex-1 justify-center items-center bg-black/50">
//           <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
//             <Text className="text-lg font-semibold mb-4">Select Bill Date</Text>
            
//             <DatePickerComponent
//               name="bill_date"
//               value={product?.bill_date}
//               onSelect={({ value }) => {
//                 handleInputChange("bill_date", value);
//                 handleInitialState("billDatePicker", false);
//               }}
//             />

//             <TouchableOpacity 
//               onPress={() => handleInitialState("billDatePicker", false)}
//               className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
//             >
//               <Text className="text-white">Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       <Modal
//         visible={initialState.paymentDatePicker}
//         transparent
//         animationType="fade"
//         onRequestClose={() => handleInitialState("paymentDatePicker", false)}
//       >
//         <View className="flex-1 justify-center items-center bg-black/50">
//           <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
//             <Text className="text-lg font-semibold mb-4">Select Expected Payment Date</Text>
            
//             <DatePickerComponent
//               name="payment_date"
//               value={product?.payment_date}
//               onSelect={({ value }) => {
//                 handleInputChange("payment_date", value);
//                 handleInitialState("paymentDatePicker", false);
//               }}
//             />

//             <TouchableOpacity 
//               onPress={() => handleInitialState("paymentDatePicker", false)}
//               className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
//             >
//               <Text className="text-white">Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       <Modal
//         visible={initialState.interestStartDatePicker}
//         transparent
//         animationType="fade"
//         onRequestClose={() => handleInitialState("interestStartDatePicker", false)}
//       >
//         <View className="flex-1 justify-center items-center bg-black/50">
//           <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
//             <Text className="text-lg font-semibold mb-4">Select Interest Start Date</Text>
            
//             <DatePickerComponent
//               name="interest_start_date"
//               value={product?.interest_start_date}
//               onSelect={({ value }) => {
//                 handleInputChange("interest_start_date", value);
//                 handleInitialState("interestStartDatePicker", false);
//               }}
//             />

//             <TouchableOpacity 
//               onPress={() => handleInitialState("interestStartDatePicker", false)}
//               className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
//             >
//               <Text className="text-white">Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//     </Fragment>
//   );
// };

// export default ProductForm;

import InputBox from "@/src/components/common/InputBox";
import React, { Fragment, useEffect, useState } from "react";
import { View, TouchableOpacity, Switch, Modal, SafeAreaView, ScrollView, Alert, BackHandler, FlatList, Text, Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import SimpleReactValidator from "simple-react-validator";
import CommonButton from "@/src/components/common/buttons/CommonButton";
import SelectInput from "@/src/components/common/SelectInput";
import ImagePickerComponent from "@/src/components/common/ImagePicker";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {
  fetchProductDetail,
  fetchProductGroups,
  manageProductList,
  fetchProductList,
} from "@/src/redux/actions/product.action";
import KeyboardHanlder from "@/src/components/common/KeyboardHanlder";
import CreateMetalModal from "./CreateMetalModal";
import AddWeightModal from "./AddWeightModal";
import OutlineInput from "@/src/components/common/OutlineInput";
import SearchProduct from "./SearchProduct";
import { makingTypes } from "@/src/utils";
import AntDesign from "@expo/vector-icons/AntDesign";
import moment from "moment";
import DatePickerComponent from "@/src/components/common/DateTimePicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { getToken } from "@/src/utils/auth";
import { ApiRequest } from "@/src/utils/api";
import { MANAGE_PRODUCT_API, MANAGE_LOGS_API, MANAGE_BILL_API } from "@/src/utils/api/endpoints";
import ShowToast from "@/src/components/common/ShowToast";

// Process sale and purchase data
export function processProductData(productData, prefix, isFromInvoice) {
  return productData.map((item) => {
    const processedItem = {
      gross_weight: 0,
      less_weight: 0,
      net_weight: 0,
      net_price: 0,
      wastage: 0,
      tounch: 0,
      fine_weight: 0,
      rate: 0,
      making_type: "",
      charges_json: [{}],
      tax_json: [{}],
      custom_fields: [],
    };
    for (const key in item) {
      if (key.startsWith(prefix)) {
        const newKey = key.replace(prefix, "");
        processedItem[newKey] = key.includes("_json")
          ? (() => {
              try {
                return JSON.parse(item[key].replace(/'/g, '"'));
              } catch (e) {
                console.error("Invalid JSON string:", item[key]);
                return [{}];
              }
            })()
          : key === "making_type"
          ? makingTypes.find((type) => type.value === item[key]) || ""
          : item[key];
      }
    }
    return processedItem;
  });
}

// Storage key for form data
const PRODUCT_FORM_STORAGE_KEY = "productForm_savedState";

const ProductForm = ({
  navigation,
  route,
  isFromInvoice = false,
  invoiceHandler,
  handleCancel,
}) => {
  const updateData = route?.params?.updateData;
  const isBillEdit = route?.params?.isBillEdit;
  const billType = route?.params?.billType;
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [initialState, setInitialState] = useState({
    metalModal: false,
    weightModal: false,
    datePicker: false,
    billDatePicker: false,
    paymentDatePicker: false,
    interestStartDatePicker: false,
  });
  const [customFieldModal, setCustomFieldModal] = useState(false);
  const [tempCustomField, setTempCustomField] = useState({
    label: "",
    value: "",
    unit: "",
    showInBill: true,
  });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const { productGroups, isLoading: productLoading, productDetail, products } = useSelector(
    (state) => state.productSlices
  );
  const { profileData } = useSelector((state) => state.userSlices);
  const validator = new SimpleReactValidator();
  const productTypes = ["purchase", "sale"];

  const formType = isFromInvoice
    ? (invoiceHandler?.isPurchase ? "purchase" : "sale")
    : "purchase";

  const defaultProductState = {
    type: formType,
    size: "",
    interest_enabled: false,
    interest_type: { label: "Flat", value: "2" },
    interest_rate: "2",
    interest_amount: "0",
    bill_date: new Date(),
    payment_date: null,
    interest_start_date: null,
    interest_upto: null,
    grace_period_enabled: false,
    grace_period_days: "0",
    original_amount: "0",
    remaining_balance: "0",
    interest_notes: "",
    payment_history: [],
    cutting_enabled: false,
    sale: {
      gross_weight: 0,
      less_weight: 0,
      net_weight: 0,
      net_price: 0,
      wastage: 0,
      tounch: 0,
      fine_weight: 0,
      rate: 0,
      variation: null,
      metal_value: "0",
      making_type: "",
      making_charge: 0,
      photo: null,
      charges_json: [{}],
      tax_json: [{}],
      custom_fields: [],
      showSizeInBill: true,
      showGrossWeightInBill: true,
      showLessWeightInBill: true,
      showNetWeightInBill: true,
      showWastageInBill: true,
      showTounchInBill: true,
      showFineWeightInBill: true,
      showRateInBill: true,
      showMakingChargeInBill: true,
      showHuidInBill: true,
      showHsnInBill: true,
      showPriceInBill: true,
      showTaxInBill: true,
      showChargesInBill: true,
      showCommentInBill: true,
    },
    purchase: {
      gross_weight: 0,
      less_weight: 0,
      net_weight: 0,
      net_price: 0,
      wastage: 0,
      tounch: 0,
      fine_weight: 0,
      rate: 0,
      variation: null,
      metal_value: "0",
      making_type: "",
      making_charge: 0,
      photo: null,
      charges_json: [{}],
      tax_json: [{}],
      custom_fields: [],
      showSizeInBill: true,
      showGrossWeightInBill: true,
      showLessWeightInBill: true,
      showNetWeightInBill: true,
      showWastageInBill: true,
      showTounchInBill: true,
      showFineWeightInBill: true,
      showRateInBill: true,
      showMakingChargeInBill: true,
      showHuidInBill: true,
      showHsnInBill: true,
      showPriceInBill: true,
      showTaxInBill: true,
      showChargesInBill: true,
      showCommentInBill: true,
    },
  };

  const [product, setProduct] = useState(defaultProductState);

  const saveFormData = async (formData) => {
    try {
      await AsyncStorage.setItem(PRODUCT_FORM_STORAGE_KEY, JSON.stringify(formData));
      console.log("Form data saved to AsyncStorage");
      setFormChanged(true);
    } catch (error) {
      console.error("Error saving form data:", error);
    }
  };

  const loadFormData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(PRODUCT_FORM_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log("Loaded saved form data:", parsedData);
        if (parsedData?.hsn_id?.variation?.length > 0) {
          parsedData[parsedData.type].variation = null;
          parsedData[parsedData.type].rate = String(parsedData.hsn_id.variation[0].price || "0");
        }
        setProduct(parsedData);
      }
      setDataLoaded(true);
    } catch (error) {
      console.error("Error loading form data:", error);
      setDataLoaded(true);
    }
  };

  useEffect(() => {
    if (updateData?.id) {
      dispatch(fetchProductDetail({ id: updateData.id }));
      setDataLoaded(true);
    } else {
      loadFormData();
    }
  }, []);

  const isSelectRate = product?.hsn_id?.variation?.length > 0;
  console.log("isSelectRate:", isSelectRate);

  const handleDigitsFix = (value) => {
    if (!value || isNaN(value)) return "0.00";
    return parseFloat(value).toFixed(2);
  };

  const jewelryUnits = [
    { label: "Grams (g)", value: "g" },
    { label: "Milligrams (mg)", value: "mg" },
    { label: "Carats (ct)", value: "ct" },
    { label: "Pieces (pcs)", value: "pcs" },
    { label: "Inches (in)", value: "in" },
    { label: "Millimeters (mm)", value: "mm" },
    { label: "Percentage (%)", value: "%" },
  ];

  const calculateTotalChargesAndTaxes = (category) => {
    let totalCharges = 0;
    let totalTaxPercentage = 0;

    if (category?.charges_json) {
      totalCharges = category.charges_json.reduce(
        (sum, charge) => sum + (Number(charge.amount) || 0),
        0
      );
    }

    if (category?.tax_json) {
      totalTaxPercentage = category.tax_json.reduce(
        (sum, tax) => sum + (Number(tax.amount) || 0),
        0
      );
    }

    return { totalCharges, totalTaxPercentage };
  };

  // Updated handleInputChange to ensure reliable state updates and rate handling
  const handleInputChange = (name, value, category, arrayKey, index) => {
    setProduct((prev) => {
      const updatedProduct = { ...prev };

      if (arrayKey && typeof index === "number" && updatedProduct[category]?.[arrayKey]) {
        updatedProduct[category][arrayKey][index] = {
          ...updatedProduct[category][arrayKey][index],
          [name]: value,
        };
      } else if (category && updatedProduct[category]) {
        updatedProduct[category][name] = value;

        // Handle hsn_id change: reset variation and set rate to first variation's price
        if (name === "hsn_id") {
          const variations = value?.variation || [];
          updatedProduct[category].variation = null;
          updatedProduct[category].rate = variations.length > 0 ? String(variations[0].price || "0") : "0";
          updatedProduct.hsn_id = value;
          console.log('HSN changed:', {
            hsn_id: value,
            variations,
            rate: updatedProduct[category].rate,
          });
        }

        // Handle variation change: update rate to selected variation's price
        if (name === "variation") {
          updatedProduct[category].variation = value;
          updatedProduct[category].rate = String(value?.price || "0");
          console.log('Variation selected:', {
            variation: value,
            rate: updatedProduct[category].rate,
          });
        }
      } else {
        updatedProduct[name] = value;
      }

      // Calculate net_weight and fine_weight
      if (['gross_weight', 'less_weight', 'wastage', 'tounch'].includes(name) && updatedProduct[category]) {
        const gross = parseFloat(updatedProduct[category].gross_weight) || 0;
        const less = parseFloat(updatedProduct[category].less_weight) || 0;
        const wastage = parseFloat(updatedProduct[category].wastage) || 0;
        const tounch = parseFloat(updatedProduct[category].tounch) || 0;

        updatedProduct[category].net_weight = (gross - less).toFixed(3);
        updatedProduct[category].fine_weight = (gross * ((tounch + wastage) / 100)).toFixed(3);
      }

      // Calculate metal_value and net_price
      if (['rate', 'hsn_id', 'variation', 'gross_weight', 'less_weight', 'wastage', 'tounch', 'making_charge', 'making_type'].includes(name) && updatedProduct[category]) {
        const fineWeight = parseFloat(updatedProduct[category].fine_weight) || 0;
        const rateValue = parseFloat(updatedProduct[category].rate || 0);
        const makingCharge = parseFloat(updatedProduct[category].making_charge) || 0;
        const netWeight = parseFloat(updatedProduct[category].net_weight) || 0;
        const chargesTotal = (updatedProduct[category].charges_json || []).reduce(
          (sum, charge) => sum + Number(charge.amount || 0),
          0
        );
        const taxRate = parseFloat(updatedProduct[category].tax || 0) / 100;

        updatedProduct[category].metal_value = (fineWeight * rateValue).toFixed(2);

        const subtotal = (fineWeight * rateValue) +
          (updatedProduct[category].making_type?.value === "PG"
            ? netWeight * makingCharge
            : makingCharge) +
          chargesTotal;

        updatedProduct[category].net_price = (subtotal + subtotal * taxRate).toFixed(2);
        console.log('Net price recalculated:', {
          category,
          rate: rateValue,
          fineWeight,
          net_price: updatedProduct[category].net_price,
        });
      }

      console.log('Updated product state:', updatedProduct[category]);
      saveFormData(updatedProduct);
      return updatedProduct;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleInitialState = (name, value) => {
    setInitialState({ ...initialState, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      if (!product.name) {
        ShowToast("Product name is required");
        return;
      }

      setLoading(true);

      const formData = new FormData();

      formData.append('name', product.name || '');
      formData.append('huid', product.huid || '');
      formData.append('hsn_id', product.hsn_id?.value || '');
      formData.append('bar_code', product.bar_code || '');
      formData.append('comment', product.comment || '');

      if (product.image && typeof product.image === 'object' && product.image.uri) {
        formData.append('image', {
          uri: Platform.OS === 'ios' ? product.image.uri.replace('file://', '') : product.image.uri,
          type: 'image/jpeg',
          name: `product_${Date.now()}.jpg`,
        });
      } else if (product.image && typeof product.image === 'string') {
        formData.append('image_url', product.image);
      }

      formData.append('sale_gross_weight', String(product.sale?.gross_weight || '0'));
      formData.append('sale_less_weight', String(product.sale?.less_weight || '0'));
      formData.append('sale_net_weight', String(product.sale?.net_weight || '0'));
      formData.append('sale_wastage', String(product.sale?.wastage || '0'));
      formData.append('sale_tounch', String(product.sale?.tounch || '0'));
      formData.append('sale_fine_weight', String(product.sale?.fine_weight || '0'));
      formData.append('sale_rate', String(product.sale?.rate || '0'));
      formData.append('sale_making_type', product.sale?.making_type?.value || 'PG');
      formData.append('sale_making_charges', String(product.sale?.making_charge || '0'));
      formData.append('sale_net_price', String(product.sale?.net_price || '0'));
      formData.append('sale_piece', '1');

      formData.append('purchase_gross_weight', String(product.purchase?.gross_weight || '0'));
      formData.append('purchase_less_weight', String(product.purchase?.less_weight || '0'));
      formData.append('purchase_net_weight', String(product.purchase?.net_weight || '0'));
      formData.append('purchase_wastage', String(product.purchase?.wastage || '0'));
      formData.append('purchase_tounch', String(product.purchase?.tounch || '0'));
      formData.append('purchase_fine_weight', String(product.purchase?.fine_weight || '0'));
      formData.append('purchase_rate', String(product.purchase?.rate || '0'));
      formData.append('purchase_making_type', product.purchase?.making_type?.value || 'PG');
      formData.append('purchase_making_charges', String(product.purchase?.making_charge || '0'));
      formData.append('purchase_net_price', String(product.purchase?.net_price || '0'));
      formData.append('purchase_piece', '1');

      formData.append('sale_charges_json', JSON.stringify(product.sale?.charges_json || []));
      formData.append('sale_tax_json', JSON.stringify(product.sale?.tax_json || []));
      formData.append('purchase_charges_json', JSON.stringify(product.purchase?.charges_json || []));
      formData.append('purchase_tax_json', JSON.stringify(product.purchase?.tax_json || []));

      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');

      const [productResponse, logResponse] = await Promise.all([
        ApiRequest({
          url: MANAGE_PRODUCT_API.create,
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }),
        ApiRequest({
          url: MANAGE_LOGS_API.create,
          method: 'POST',
          body: {
            userName: profileData?.name || 'Unknown User',
            productName: product.name || 'Unknown Product',
            id: 0,
            type: 'product',
            amount: parseFloat(product[product.type]?.net_price || 0).toFixed(2),
            action: 'CREATE',
            entityType: 'PRODUCT',
            timestamp: timestamp,
            metadata: JSON.stringify({
              action: 'Created new product',
              productId: product.product_id || 'new',
              note: `Created product: ${product.name}`,
              formData: {
                sale_gross_weight: product.sale?.gross_weight || 0,
                sale_net_weight: product.sale?.net_weight || 0,
                sale_fine_weight: product.sale?.fine_weight || 0,
                sale_net_price: product.sale?.net_price || 0,
              },
            }),
          },
        }),
      ]);

      if (!productResponse?.success) {
        throw new Error(productResponse?.message || "Failed to save product");
      }

      if (!logResponse?.success) {
        console.error("Warning: Product saved but log creation failed:", logResponse?.message);
        ShowToast("Product saved but logging failed");
      } else {
        ShowToast(productResponse.message || "Product created successfully");
      }

      await AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY);
      navigation.goBack();
    } catch (error) {
      console.error('Error details:', error);
      ShowToast(error.message || "Error saving product");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitClick = () => {
    const isUpdate = route?.params?.isProductEdit || updateData?.id;
    if (isUpdate) {
      const formData = new FormData();
      formData.append('id', updateData?.id || route?.params?.id);
      handleUpdate();
    } else {
      handleSubmit();
    }
  };

  const resetProduct = async () => {
    Alert.alert(
      "Reset Form",
      "Are you sure you want to reset all form values?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY);
              console.log("Form data cleared during reset");
              setProduct(defaultProductState);
              setFormChanged(false);
            } catch (error) {
              console.error("Error clearing form data:", error);
              ShowToast("Error clearing form data");
            }
          },
        },
      ]
    );
  };

  const addItem = (type, key) => {
    setProduct((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: [
          ...prev[type][key],
          key === "charges_json"
            ? { name: "", amount: "0" }
            : { name: "", amount: "0" },
        ],
      },
    }));
  };

  const removeChargeTaxInput = (type, key, index) => {
    setProduct((prev) => {
      const updatedCategory = { ...prev[type] };
      const itemToRemove = updatedCategory[key].find((item, i) => i === index);
      updatedCategory[key] = updatedCategory[key].filter(
        (item, i) => i !== index
      );

      updatedCategory.net_price =
        Number(updatedCategory.net_price || 0) - Number(itemToRemove?.amount || 0);

      return {
        ...prev,
        [type]: updatedCategory,
      };
    });
  };

  const handleProductTypeChange = (type) => {
    const isSale = type === "sale";
    setProduct((prev) => {
      const updatedSale = isSale
        ? {
            ...prev.purchase,
            gross_weight: prev?.sale?.gross_weight || 0,
            less_weight: prev?.sale?.less_weight || 0,
            net_weight: prev?.sale?.net_weight || 0,
            net_price: prev?.sale?.net_price || 0,
          }
        : prev.sale;

      return { ...prev, sale: updatedSale, type };
    });
  };

  const handleProductDetail = (data) => {
    const {
      name,
      hsn_id,
      huid,
      comment,
      image_url,
      sale_product_data,
      purchase_product_data,
    } = data;

    const purchase = processProductData(
      purchase_product_data || [{}],
      "purchase_",
      isFromInvoice
    );
    const sale = processProductData(
      sale_product_data || [{}],
      "sale_",
      isFromInvoice
    );
    const hsnName = productGroups.find((item) => item.id == hsn_id);

    setProduct({
      ...defaultProductState,
      ...(isFromInvoice
        ? { product_id: data.id, product_name: data.name }
        : {}),
      name: name || "",
      huid: huid || "",
      comment: comment || "",
      image: image_url || "",
      hsn_id: hsnName ? { label: hsnName.name, value: hsnName.id, variation: hsnName.variation_data } : null,
      sale: sale[0] || defaultProductState.sale,
      purchase: purchase[0] || defaultProductState.purchase,
    });
  };

  const handleAddProduct = () => {
    if (validator.allValid()) {
      const newProducts = [
        ...(invoiceHandler?.formValue?.selectedProduct || []),
      ];

      const { name, hsn_id, huid, comment, image, size } = product;

      const productData = {
        name,
        huid,
        size,
        hsn_id: hsn_id?.value || '',
        comment,
        sale: product.sale || {},
        purchase: product.purchase || {},
        ...product[product.type],
        rate: product[product.type].rate,
        product_id: Math.random().toString(36).substring(2, 9),
      };

      newProducts.push(productData);

      const totalPrice = newProducts.reduce(
        (acc, product) => Number(acc) + Number(product[invoiceHandler?.isPurchase ? "purchase" : "sale"]?.net_price || 0),
        0
      );

      invoiceHandler?.setFormValue({
        ...invoiceHandler?.formValue,
        selectedProduct: newProducts,
        totalPrice,
      });

      AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY)
        .then(() => console.log("Form data cleared after adding product to invoice"))
        .catch((error) => console.error("Error clearing form data:", error));

      resetProduct();
      setFormChanged(false);

      if (invoiceHandler && invoiceHandler.onSubmit) {
        invoiceHandler.onSubmit();
      }
    } else {
      setErrors(validator.errorMessages);
    }
  };

  useEffect(() => {
    if (productDetail) {
      handleProductDetail(productDetail);
    }
  }, [productDetail]);

  useEffect(() => {
    resetProduct();
    dispatch(fetchProductGroups());
    if (updateData) {
      dispatch(fetchProductDetail(updateData?.id));
    }
  }, [dispatch, updateData]);

  const calculateInterestPeriod = (product) => {
    if (!product?.bill_date || !product?.payment_date) return 0;

    const startDate = product?.interest_start_date
      ? moment(product.interest_start_date)
      : moment(product.bill_date);

    const endDate = moment(product.payment_date);

    let days = endDate.diff(startDate, 'days');

    if (product?.grace_period_enabled) {
      days = Math.max(0, days - Number(product?.grace_period_days || 0));
    }

    return days;
  };

  const calculateInterest = (updatedProduct) => {
    if (!updatedProduct.interest_enabled) {
      return { interestAmount: 0, dailyBreakdown: [] };
    }

    const balance = parseFloat(updatedProduct[updatedProduct.type]?.net_price || 0);
    const interestRate = parseFloat(updatedProduct.interest_rate || 0) / 100;
    const interestType = updatedProduct.interest_type?.value;

    let interestAmount = 0;
    let dailyBreakdown = [];

    const days = calculateInterestPeriod(updatedProduct);
    if (days <= 0) return { interestAmount: 0, dailyBreakdown: [] };

    const timeInYears = days / 365;

    if (interestType === "2") {
      interestAmount = balance * interestRate * timeInYears;
    } else if (interestType === "1") {
      interestAmount = balance * (Math.pow(1 + interestRate, timeInYears) - 1);
    }

    return { interestAmount, dailyBreakdown };
  };

  useEffect(() => {
    if (product?.sale && product?.purchase) {
      if (product.sale.tax_json && product.sale.tax_json.length > 0) {
        const totalTax = product.sale.tax_json.reduce((sum, tax) => sum + Number(tax.amount || 0), 0);
        handleInputChange("tax", totalTax, "sale");
      }

      if (product.purchase.tax_json && product.purchase.tax_json.length > 0) {
        const totalTax = product.purchase.tax_json.reduce((sum, tax) => sum + Number(tax.amount || 0), 0);
        handleInputChange("tax", totalTax, "purchase");
      }
    }
  }, [product?.sale?.tax_json, product?.purchase?.tax_json]);

  useEffect(() => {
    if (product?.sale?.tax_json?.length > 0) {
      const totalTax = product.sale.tax_json.reduce(
        (sum, tax) => sum + Number(tax.amount || 0),
        0
      );
      setProduct((prev) => ({
        ...prev,
        sale: {
          ...prev.sale,
          tax: totalTax,
        },
      }));
    }

    if (product?.purchase?.tax_json?.length > 0) {
      const totalTax = product.purchase.tax_json.reduce(
        (sum, tax) => sum + Number(tax.amount || 0),
        0
      );
      setProduct((prev) => ({
        ...prev,
        purchase: {
          ...prev.purchase,
          tax: totalTax,
        },
      }));
    }
  }, [product?.sale?.tax_json, product?.purchase?.tax_json]);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        if (formChanged) {
          Alert.alert(
            "Form Data Saved",
            isFromInvoice
              ? "Your data has been saved. Do you want to return to the product list?"
              : "Your entered data has been saved. You can continue editing later.",
            [
              { text: "Stay on Form", style: "cancel" },
              {
                text: isFromInvoice ? "Back to List" : "Go Back",
                onPress: () => {
                  if (isFromInvoice && handleCancel) {
                    handleCancel();
                  } else {
                    navigation.goBack();
                  }
                },
              },
            ]
          );
          return true;
        } else if (isFromInvoice && handleCancel) {
          handleCancel();
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [formChanged, navigation, isFromInvoice, handleCancel])
  );

  useEffect(() => {
    if (product?.interest_enabled) {
      const { interestAmount } = calculateInterest(product);
      handleInputChange("interest_amount", interestAmount.toString());
    }
  }, [
    product?.bill_date,
    product?.payment_date,
    product?.interest_start_date,
    product?.interest_rate,
    product?.interest_type?.value,
    product?.grace_period_enabled,
    product?.grace_period_days,
    product?.[product?.type]?.net_price,
  ]);

  useEffect(() => {
    if (updateData) {
      console.log('Received updateData:', updateData);

      const hsnName = productGroups.find((item) => item.id == updateData.hsn_id);

      const initialProductState = {
        ...defaultProductState,
        id: updateData.id,
        type: updateData.type || formType,
        name: updateData.name || "",
        huid: updateData.huid || "",
        hsn_id: hsnName ? { label: hsnName.name, value: hsnName.id, variation: hsnName.variation_data } : null,
        size: updateData.size || "",
        remark: updateData.remark || "",
        comment: updateData.comment || "",
        image: updateData.image || "",
        additional_image: updateData.additional_image || null,
        cutting_enabled: updateData.cutting_enabled || false,
        interest_enabled: updateData.interest_enabled || false,
        interest_type: updateData.interest_type || { label: "Flat", value: "2" },
        interest_rate: updateData.interest_rate || "2",
        interest_amount: updateData.interest_amount || "0",
        bill_date: updateData.bill_date ? new Date(updateData.bill_date) : new Date(),
        payment_date: updateData.payment_date ? new Date(updateData.payment_date) : null,
        interest_start_date: updateData.interest_start_date ? new Date(updateData.interest_start_date) : null,
        grace_period_enabled: updateData.grace_period_enabled || false,
        grace_period_days: updateData.grace_period_days || "0",
        interest_notes: updateData.interest_notes || "",
        sale: {
          ...defaultProductState.sale,
          gross_weight: updateData.sale?.gross_weight || 0,
          less_weight: updateData.sale?.less_weight || 0,
          net_weight: updateData.sale?.net_weight || 0,
          wastage: updateData.sale?.wastage || 0,
          tounch: updateData.sale?.tounch || 0,
          fine_weight: updateData.sale?.fine_weight || 0,
          rate: updateData.sale?.rate || 0,
          making_type: updateData.sale?.making_type || "",
          making_charge: updateData.sale?.making_charge || 0,
          metal_value: updateData.sale?.metal_value || "0",
          charges_json: updateData.sale?.charges_json || [{}],
          tax_json: updateData.sale?.tax_json || [{}],
          custom_fields: updateData.sale?.custom_fields || [],
          ...updateData.sale?.bill_display_settings,
        },
        purchase: {
          ...defaultProductState.purchase,
          gross_weight: updateData.purchase?.gross_weight || 0,
          less_weight: updateData.purchase?.less_weight || 0,
          net_weight: updateData.purchase?.net_weight || 0,
          wastage: updateData.purchase?.wastage || 0,
          tounch: updateData.purchase?.tounch || 0,
          fine_weight: updateData.purchase?.fine_weight || 0,
          rate: updateData.purchase?.rate || 0,
          making_type: updateData.purchase?.making_type || "",
          making_charge: updateData.purchase?.making_charge || 0,
          metal_value: updateData.purchase?.metal_value || "0",
          charges_json: updateData.purchase?.charges_json || [{}],
          tax_json: updateData.purchase?.tax_json || [{}],
          custom_fields: updateData.purchase?.custom_fields || [],
          ...updateData.purchase?.bill_display_settings,
        },
      };

      if (hsnName?.variation_data?.length > 0) {
        initialProductState[initialProductState.type].variation = null;
        initialProductState[initialProductState.type].rate = String(hsnName.variation_data[0].price || "0");
      }

      console.log('Setting initial product state:', initialProductState);
      setProduct(initialProductState);
      setDataLoaded(true);
    } else {
      loadFormData();
    }
  }, [updateData, productGroups]);

  const handleUpdate = async () => {
    try {
      if (!product.name) {
        ShowToast("Product name is required");
        return;
      }

      setLoading(true);

      const productId = updateData?.id || route?.params?.id;
      if (!productId) {
        throw new Error("Product ID is required for update");
      }

      const formData = new FormData();

      formData.append('id', String(productId));
      formData.append('name', product.name || '');
      formData.append('huid', product.huid || '');
      formData.append('hsn_id', product.hsn_id?.value || '');
      formData.append('comment', product.comment || '');

      if (product.image && typeof product.image === 'object' && product.image.uri) {
        formData.append('image', {
          uri: Platform.OS === 'ios' ? product.image.uri.replace('file://', '') : product.image.uri,
          type: 'image/jpeg',
          name: `product_${productId}_${Date.now()}.jpg`,
        });
      }

      if (product.sale) {
        formData.append('sale_gross_weight', String(product.sale.gross_weight || '0'));
        formData.append('sale_less_weight', String(product.sale.less_weight || '0'));
        formData.append('sale_net_weight', String(product.sale.net_weight || '0'));
        formData.append('sale_wastage', String(product.sale.wastage || '0'));
        formData.append('sale_tounch', String(product.sale.tounch || '0'));
        formData.append('sale_fine_weight', String(product.sale.fine_weight || '0'));
        formData.append('sale_rate', String(product.sale.rate || '0'));
        formData.append('sale_making_type', product.sale.making_type?.value || 'PG');
        formData.append('sale_making_charges', String(product.sale.making_charge || '0'));
        formData.append('sale_net_price', String(product.sale.net_price || '0'));
        formData.append('sale_charges_json', JSON.stringify(product.sale.charges_json || []));
        formData.append('sale_tax_json', JSON.stringify(product.sale.tax_json || []));
      }

      if (product.purchase) {
        formData.append('purchase_gross_weight', String(product.purchase.gross_weight || '0'));
        formData.append('purchase_less_weight', String(product.purchase.less_weight || '0'));
        formData.append('purchase_net_weight', String(product.purchase.net_weight || '0'));
        formData.append('purchase_wastage', String(product.purchase.wastage || '0'));
        formData.append('purchase_tounch', String(product.purchase.tounch || '0'));
        formData.append('purchase_fine_weight', String(product.purchase.fine_weight || '0'));
        formData.append('purchase_rate', String(product.purchase.rate || '0'));
        formData.append('purchase_making_type', product.purchase.making_type?.value || 'PG');
        formData.append('purchase_making_charges', String(product.purchase.making_charge || '0'));
        formData.append('purchase_net_price', String(product.purchase.net_price || '0'));
        formData.append('purchase_charges_json', JSON.stringify(product.purchase.charges_json || []));
        formData.append('purchase_tax_json', JSON.stringify(product.purchase.tax_json || []));
      }

      const response = await ApiRequest({
        url: MANAGE_PRODUCT_API.update,
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response?.success) {
        console.log('Update API Error Response:', response);
        throw new Error(response?.message || response?.error || "Failed to update product");
      }

      try {
        await ApiRequest({
          url: MANAGE_LOGS_API.create,
          method: 'POST',
          body: {
            userName: profileData?.name || 'Unknown User',
            productName: product.name,
            id: productId,
            type: 'product',
            amount: parseFloat(product[product.type]?.net_price || 0).toFixed(2),
            action: 'UPDATE',
            entityType: 'PRODUCT',
            timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
            metadata: JSON.stringify({
              action: 'Updated product',
              productId: productId,
              note: `Updated product: ${product.name}`,
            }),
          },
        });
      } catch (logError) {
        console.error("Failed to create update log:", logError);
      }

      await AsyncStorage.removeItem(PRODUCT_FORM_STORAGE_KEY);
      ShowToast(response.message || "Product updated successfully");
      navigation.goBack();
    } catch (error) {
      console.error('Update error details:', error);
      ShowToast(error.message || "Error updating product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchProductList());
  }, []);

  const handleProductSelect = (selectedProduct) => {
    setProduct((prev) => ({
      ...prev,
      ...selectedProduct,
      name: selectedProduct.name,
      huid: selectedProduct.huid,
      hsn_id: selectedProduct.hsn_id,
      image: selectedProduct.image_url,
      type: selectedProduct.type || prev.type,
    }));
    setShowSuggestions(false);
  };

  return (
    <Fragment>
      <KeyboardHanlder>
        <View className="pt-4">
          <View className="px-4">
            {isFromInvoice ? (
              <SearchProduct
                productValue={product}
                setProductValue={setProduct}
                handleProductDetail={handleProductDetail}
              />
            ) : (
              <View className="flex mb-4 flex-row">
                <ImagePickerComponent
                  onChange={({ value, name }) => handleInputChange(name, value)}
                  value={product?.image}
                  name="image"
                />
                <View className="w-5/6 pl-3">
                  <View className="relative">
                    <InputBox
                      name="name"
                      label="Name"
                      value={product?.name}
                      onChange={({ value, name }) => handleInputChange(name, value)}
                      error={errors?.name}
                    />
                    {validator.message("name", product?.name, "required")}
                    {showSuggestions && filteredProducts.length > 0 && (
                      <View className="absolute z-10 top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg max-h-40">
                        <FlatList
                          data={filteredProducts}
                          keyExtractor={(item) => item.id}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              className="p-3 border-b border-gray-100"
                              onPress={() => handleProductSelect(item)}
                            >
                              <Text className="text-gray-800">{item.name}</Text>
                              {item.huid && (
                                <Text className="text-xs text-gray-500">HUID: {item.huid}</Text>
                              )}
                            </TouchableOpacity>
                          )}
                        />
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            <View className="mb-4">
              <InputBox
                name="remark"
                label="Remark"
                multiLine={true}
                value={product?.remark}
                onChange={({ value, name }) => handleInputChange(name, value)}
                placeholder="Add a remark about this item..."
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium mb-1">Item Photo</Text>
              <ImagePickerComponent
                name="image"
                value={product?.image || null}
                onChange={({ value, name }) => {
                  const safeValue = value ? {
                    uri: value.uri || null,
                    fileName: value.fileName || null,
                    mimeType: value.mimeType || 'image/jpeg',
                  } : null;
                  handleInputChange(name, safeValue);
                }}
              />
              <Text className="text-xs text-gray-500 mt-1">Upload a photo of the item</Text>
            </View>

            <View className="mb-4">
              <InputBox
                name="size"
                label="Size"
                value={product?.size}
                placeholder="e.g., 7, 8.5, Medium, 16mm"
                onChange={({ value, name }) => handleInputChange(name, value)}
              />
              <View className="flex flex-row items-center justify-between mt-1">
                <Text className="text-xs text-gray-500">Enter ring size, bangle diameter, etc.</Text>
                <Switch
                  value={product?.[product.type]?.showSizeInBill || false}
                  onValueChange={(value) => handleInputChange("showSizeInBill", value, product.type)}
                  trackColor={{ false: "red", true: "green" }}
                  thumbColor={product?.[product.type]?.showSizeInBill ? "#ffffff" : "#f4f3f4"}
                />
              </View>
            </View>

            <View className="mb-4">
              <InputBox
                multiLine={true}
                name="comment"
                label="Comment"
                value={product?.comment}
                onChange={({ value, name }) => handleInputChange(name, value)}
              />
              <View className="flex flex-row items-center justify-between mt-1">
                <Text className="text-xs text-gray-500"></Text>
                <Switch
                  value={product?.[product.type]?.showCommentInBill || false}
                  onValueChange={(value) => handleInputChange("showCommentInBill", value, product.type)}
                  trackColor={{ false: "red", true: "green" }}
                  thumbColor={product?.[product.type]?.showCommentInBill ? "#ffffff" : "#f4f3f4"}
                />
              </View>
            MILLION

            <View className="flex mb-4 flex-row">
              {productTypes.map((type) => (
                <View key={type} className={`w-1/2`}>
                  <TouchableOpacity
                    className={`
                      py-2 
                      ${type === "sale" ? "ml-1.5" : "mr-1.5"}
                      border border-primary 
                      rounded-md 
                      flex flex-row 
                      justify-center 
                      items-center 
                      shadow-xl
                      ${product?.type === type ? "bg-primary" : "bg-white"}
                      relative
                      ${isFromInvoice ? "opacity-75" : ""}
                    `}
                    onPress={() => handleProductTypeChange(type)}
                    disabled={isFromInvoice}
                  >
                    <Text
                      className={`${
                        product?.type === type ? "text-white" : "text-primary"
                      } tracking-wider capitalize font-medium`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                    {product?.type === type && (
                      <View className="absolute right-2">
                        <AntDesign
                          name="checkcircle"
                          size={16}
                          color="white"
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View className="mb-4 flex flex-row">
              <View className="w-2/5 pr-1.5">
                <InputBox
                  name="huid"
                  label="HUID"
                  value={product?.huid}
                  onChange={({ value, name }) => handleInputChange(name, value)}
                  keyboardType="default"
                />
                <View className="flex flex-row items-center justify-between mt-1">
                  <Text className="text-xs text-gray-500"></Text>
                  <Switch
                    value={product?.[product.type]?.showHuidInBill || false}
                    onValueChange={(value) => handleInputChange("showHuidInBill", value, product.type)}
                    trackColor={{ false: "red", true: "green" }}
                    thumbColor={product?.[product.type]?.showHuidInBill ? "#ffffff" : "#f4f3f4"}
                  />
                </View>
              </View>
              <View className="w-3/5 flex items-start flex-row pl-1.5">
                <View className="w-full pr-2">
                  <SelectInput
                    label="HSN Name"
                    name="hsn_id"
                    value={product?.hsn_id}
                    placeholder="Select"
                    error={errors?.hsn_id}
                    data={productGroups.map((item) => ({
                      label: item.name,
                      value: item.id,
                      variation: item.variation_data,
                    }))}
                    onSelect={(value) => handleInputChange("hsn_id", value, product.type)}
                  />
                  {validator.message("hsn_id", product?.hsn_id, "required")}
                  <View className="flex flex-row items-center justify-between mt-1">
                    <Text className="text-xs text-gray-500"></Text>
                    <Switch
                      value={product?.[product.type]?.showHsnInBill || false}
                      onValueChange={(value) => handleInputChange("showHsnInBill", value, product.type)}
                      trackColor={{ false: "red", true: "green" }}
                      thumbColor={product?.[product.type]?.showHsnInBill ? "#ffffff" : "#f4f3f4"}
                    />
                  </View>
                </View>
                {!isFromInvoice && (
                  <TouchableOpacity
                    onPress={() => handleInitialState("metalModal", true)}
                    activeOpacity={0.7}
                    className="bg-primary w-8 h-8 mt-6 flex justify-center items-center rounded-full shadow-xl"
                  >
                    <FontAwesome6 name="plus" size={17} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Updated Variation Dropdown */}
            {isSelectRate && (
              <View className="mb-4" key={product?.hsn_id?.value}>
                <SelectInput
                  label="Variation"
                  name="variation"
                  value={product?.[product.type]?.variation || null}
                  placeholder="Select Variation"
                  data={product?.hsn_id?.variation?.map((item) => {
                    console.log('Variation item:', item);
                    return {
                      label: `${item.name} (₹${item.price})`,
                      value: item,
                    };
                  }) || []}
                  onSelect={(value) => {
                    console.log('Selected variation:', value);
                    handleInputChange("variation", value, product.type);
                  }}
                />
              </View>
            )}
          </View>

          <View className="px-4 mb-4">
            <View className="bg-gray-50 rounded-lg p-4">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold">Interest Configuration</Text>
                <Switch
                  value={product?.interest_enabled}
                  onValueChange={(value) => handleInputChange("interest_enabled", value)}
                  trackColor={{ false: "#767577", true: "#22c55e" }}
                  thumbColor={product?.interest_enabled ? "#ffffff" : "#f4f3f4"}
                />
              </View>

              {product?.interest_enabled && (
                <>
                  <View className="mb-4">
                    <Text className="text-base font-medium mb-2">Important Dates</Text>
                    <View className="space-y-3">
                      <TouchableOpacity
                        onPress={() => handleInitialState("billDatePicker", true)}
                        className="border border-gray-300 rounded-md p-3"
                      >
                        <Text className="text-sm text-gray-500">Bill Date</Text>
                        <Text className="text-base">
                          {product?.bill_date ? moment(product.bill_date).format("DD MMM YYYY") : "Select Date"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleInitialState("paymentDatePicker", true)}
                        className="border border-gray-300 rounded-md p-3"
                      >
                        <Text className="text-sm text-gray-500">Expected Payment Date</Text>
                        <Text className="text-base">
                          {product?.payment_date ? moment(product.payment_date).format("DD MMM YYYY") : "Select Date"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleInitialState("interestStartDatePicker", true)}
                        className="border border-gray-300 rounded-md p-3"
                      >
                        <Text className="text-sm text-gray-500">Interest Start Date</Text>
                        <Text className="text-base">
                          {product?.interest_start_date ? moment(product.interest_start_date).format("DD MMM YYYY") : "Select Date"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View className="mb-4">
                    <Text className="text-base font-medium mb-2">Interest Details</Text>
                    <View className="space-y-3">
                      <SelectInput
                        label="Interest Type"
                        name="interest_type"
                        value={product?.interest_type}
                        placeholder="Select Type"
                        data={[
                          { label: "Flat", value: "2" },
                          { label: "Compound", value: "1" },
                        ]}
                        onSelect={(value) => handleInputChange("interest_type", value)}
                      />
                      <InputBox
                        name="interest_rate"
                        label="Interest Rate (%)"
                        value={product?.interest_rate}
                        keyboardType="numeric"
                        onChange={({ value }) => handleInputChange("interest_rate", value)}
                      />
                    </View>
                  </View>
                  <View className="mb-4">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-base font-medium">Grace Period</Text>
                      <Switch
                        value={product?.grace_period_enabled}
                        onValueChange={(value) => handleInputChange("grace_period_enabled", value)}
                        trackColor={{ false: "#767577", true: "#22c55e" }}
                        thumbColor={product?.grace_period_enabled ? "#ffffff" : "#f4f3f4"}
                      />
                    </View>
                    {product?.grace_period_enabled && (
                      <InputBox
                        name="grace_period_days"
                        label="Grace Period (Days)"
                        value={product?.grace_period_days}
                        keyboardType="numeric"
                        onChange={({ value }) => handleInputChange("grace_period_days", value)}
                      />
                    )}
                  </View>
                  <View className="mb-4">
                    <InputBox
                      name="interest_notes"
                      label="Interest Notes"
                      value={product?.interest_notes}
                      multiLine={true}
                      numberOfLines={3}
                      onChange={({ value }) => handleInputChange("interest_notes", value)}
                      placeholder="Add any special notes about interest terms..."
                    />
                  </View>
                  <View className="bg-white rounded-lg p-3 mb-4">
                    <Text className="text-base font-medium mb-2">Interest Summary</Text>
                    <View className="space-y-2">
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600">Original Amount:</Text>
                        <Text>₹{handleDigitsFix(product?.[product.type]?.net_price || 0)}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600">Interest Period:</Text>
                        <Text>{calculateInterestPeriod(product)} days</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-gray-600">Interest Amount:</Text>
                        <Text>₹{handleDigitsFix(Number(product?.interest_amount || 0))}</Text>
                      </View>
                      <View className="flex-row justify-between pt-2 border-t border-gray-200">
                        <Text className="font-medium">Total Amount:</Text>
                        <Text className="font-medium">₹{handleDigitsFix(
                          Number(product?.[product.type]?.net_price || 0) +
                          Number(product?.interest_amount || 0)
                        )}</Text>
                      </View>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          {productTypes.map((category) => {
            const isPurchase = category === "purchase";
            return (
              product?.type === category && (
                <View
                  className="bg-slate-50 shadow-lg px-4 pt-4"
                  key={category}
                >
                  <View className="mb-4 flex flex-row">
                    <View className="w-1/5 pr-1">
                      <InputBox
                        name="gross_weight"
                        placeholder="0"
                        label="Gross Wt"
                        value={String(product?.[category]?.gross_weight || '')}
                        onChange={({ value, name }) =>
                          handleInputChange(name, value, category)
                        }
                        keyboardType="numeric"
                      />
                      <View className="flex flex-row items-center justify-between mt-1">
                        <Text className="text-xs text-gray-500"></Text>
                        <Switch
                          value={product?.[category]?.showGrossWeightInBill || false}
                          onValueChange={(value) => handleInputChange("showGrossWeightInBill", value, category)}
                          trackColor={{ false: "red", true: "green" }}
                          thumbColor={product?.[category]?.showGrossWeightInBill ? "#ffffff" : "#f4f3f4"}
                        />
                      </View>
                    </View>
                    <View className="w-1/5 px-1">
                      <InputBox
                        name="less_weight"
                        placeholder="0"
                        label="Less Wt"
                        value={String(product?.[category]?.less_weight || '')}
                        onChange={({ value, name }) =>
                          handleInputChange(name, value, category)
                        }
                        keyboardType="numeric"
                      />
                      <View className="flex flex-row items-center justify-between mt-1">
                        <Text className="text-xs text-gray-500"></Text>
                        <Switch
                          value={product?.[category]?.showLessWeightInBill || false}
                          onValueChange={(value) => handleInputChange("showLessWeightInBill", value, category)}
                          trackColor={{ false: "red", true: "green" }}
                          thumbColor={product?.[category]?.showLessWeightInBill ? "#ffffff" : "#f4f3f4"}
                        />
                      </View>
                    </View>
                    <View className="w-1/5 px-1">
                      <InputBox
                        name="net_weight"
                        placeholder="0"
                        label="Net Wt"
                        readOnly={true}
                        value={String(product?.[category]?.net_weight || '')}
                        onChange={({ value, name }) =>
                          handleInputChange(name, value, category)
                        }
                        keyboardType="numeric"
                      />
                      <View className="flex flex-row items-center justify-between mt-1">
                        <Text className="text-xs text-gray-500"></Text>
                        <Switch
                          value={product?.[category]?.showNetWeightInBill || false}
                          onValueChange={(value) => handleInputChange("showNetWeightInBill", value, category)}
                          trackColor={{ false: "red", true: "green" }}
                          thumbColor={product?.[category]?.showNetWeightInBill ? "#ffffff" : "#f4f3f4"}
                        />
                      </View>
                    </View>
                    <View
                      className={`w-2/5 ${isPurchase ? "flex-row-reverse" : "flex-row"} flex`}
                    >
                      <View
                        className={`w-1/2 ${isPurchase ? "pl-0.5" : "pr-1 pl-0.5"}`}
                      >
                        <InputBox
                          name="tounch"
                          placeholder="0 %"
                          label="Tounch"
                          value={String(product?.[category]?.tounch || '')}
                          onChange={({ value, name }) =>
                            handleInputChange(name, value, category)
                          }
                          keyboardType="numeric"
                        />
                        <View className="flex flex-row items-center justify-between mt-1">
                          <Text className="text-xs text-gray-500"></Text>
                          <Switch
                            value={product?.[category]?.showTounchInBill || false}
                            onValueChange={(value) => handleInputChange("showTounchInBill", value, category)}
                            trackColor={{ false: "red", true: "green" }}
                            thumbColor={product?.[category]?.showTounchInBill ? "#ffffff" : "#f4f3f4"}
                          />
                        </View>
                      </View>
                      <View
                        className={`w-1/2 ${isPurchase ? "pr-1 pl-0.5" : "pl-0.5"}`}
                      >
                        <InputBox
                          name="wastage"
                          placeholder="0 %"
                          label="Wastage"
                          value={String(product?.[category]?.wastage || '')}
                          onChange={({ value, name }) =>
                            handleInputChange(name, value, category)
                          }
                          keyboardType="numeric"
                        />
                        <View className="flex flex-row items-center justify-between mt-1">
                          <Text className="text-xs text-gray-500"></Text>
                          <Switch
                            value={product?.[category]?.showWastageInBill || false}
                            onValueChange={(value) => handleInputChange("showWastageInBill", value, category)}
                            trackColor={{ false: "red", true: "green" }}
                            thumbColor={product?.[category]?.showWastageInBill ? "#ffffff" : "#f4f3f4"}
                          />
                        </View>
                      </View>
                    </View>
                  </View>

                  <View className="mb-4 flex flex-row">
                    <View className="w-1/3 pr-1">
                      <InputBox
                        name="fine_weight"
                        label="Fine Weight"
                        placeholder="0"
                        readOnly={true}
                        value={String(product?.[category]?.fine_weight || '')}
                        onChange={({ value }) => handleInputChange("fine_weight", value, category)}
                        keyboardType="numeric"
                      />
                      <View className="flex flex-row items-center justify-between mt-1">
                        <Text className="text-xs text-gray-500"></Text>
                        <Switch
                          value={product?.[category]?.showFineWeightInBill || false}
                          onValueChange={(value) => handleInputChange("showFineWeightInBill", value, category)}
                          trackColor={{ false: "red", true: "green" }}
                          thumbColor={product?.[category]?.showFineWeightInBill ? "#ffffff" : "#f4f3f4"}
                        />
                      </View>
                    </View>
                    <View className="w-1/3 px-1">
                      <Text className="text-slate-500 text-[13px] mb-1">Cutting</Text>
                      <View className="bg-gray-100 rounded-lg">
                        <CommonButton
                          title={product.cutting_enabled ? "ON" : "OFF"}
                          onPress={() => {
                            const currentType = product.type;
                            const buttonRate = parseFloat(product[currentType]?.rate || 0);
                            const buttonFineWeight = parseFloat(product[currentType]?.fine_weight) || 0;
                            const buttonMetalValue = !product.cutting_enabled ? (buttonFineWeight * buttonRate).toFixed(2) : "0";

                            setProduct((prev) => ({
                              ...prev,
                              cutting_enabled: !prev.cutting_enabled,
                              [currentType]: {
                                ...prev[currentType],
                                metal_value: buttonMetalValue,
                              },
                            }));
                          }}
                          isFilled={product.cutting_enabled}
                          small
                        />
                      </View>
                    </View>
                    <View className="w-1/3 pl-1">
                      <InputBox
                        name="rate"
                        label="Rate"
                        placeholder="0"
                        value={String(product?.[category]?.rate || '0')} // Ensure rate is bound to state
                        readOnly={isSelectRate}
                        onChange={({ value }) => handleInputChange("rate", value, category)}
                        keyboardType="numeric"
                      />
                      <View className="flex flex-row items-center justify-between mt-1">
                        <Text className="text-xs text-gray-500"></Text>
                        <Switch
                          value={product?.[category]?.showRateInBill || false}
                          onValueChange={(value) => handleInputChange("showRateInBill", value, category)}
                          trackColor={{ false: "red", true: "green" }}
                          thumbColor={product?.[category]?.showRateInBill ? "#ffffff" : "#f4f3f4"}
                        />
                      </View>
                    </View>
                  </View>

                  <View className="mb-4 flex flex-row">
                    <View className="w-1/2 pr-1">
                      <SelectInput
                        label="Making Type"
                        name="making_type"
                        value={product?.[category]?.making_type}
                        placeholder="Select"
                        data={[
                          { label: "Per Gram (PG)", value: "PG" },
                          { label: "Per Piece (PP)", value: "PP" },
                        ]}
                        onSelect={(value) => handleInputChange("making_type", value, category)}
                      />
                    </View>
                    <View className="w-1/2 pl-1">
                      <InputBox
                        name="making_charge"
                        label="Making Charge"
                        placeholder="0"
                        value={String(product?.[category]?.making_charge || '')}
                        onChange={({ value }) => handleInputChange("making_charge", value, category)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View className="mb-4 flex flex-row">
                    <View className="w-full">
                      <InputBox
                        name="net_price"
                        readOnly={true}
                        label="Net Price"
                        placeholder="0"
                        value={handleDigitsFix(product?.[category]?.net_price || 0)}
                        keyboardType="numeric"
                      />
                      <View className="flex flex-row items-center justify-between mt-1">
                        <Text className="text-xs text-gray-500"></Text>
                        <Switch
                          value={product?.[category]?.showNetPriceInBill || false}
                          onValueChange={(value) => handleInputChange("showNetPriceInBill", value, category)}
                          trackColor={{ false: "red", true: "green" }}
                          thumbColor={product?.[category]?.showNetPriceInBill ? "#ffffff" : "#f4f3f4"}
                        />
                      </View>
                    </View>
                  </View>

                  <View className="mb-4 flex flex-row items-center bg-gray-50 px-3 py-2 rounded-lg">
                    <Text className="text-gray-600">Show Price in Bill</Text>
                    <Switch
                      value={product?.[category]?.showPriceInBill ?? false}
                      onValueChange={(value) => handleInputChange("showPriceInBill", value, category)}
                      trackColor={{ false: "#767577", true: "green" }}
                      thumbColor={product?.[category]?.showPriceInBill ? "#ffffff" : "#f4f3f4"}
                    />
                  </View>

                  {product?.[category]?.showPriceInBill ? (
                    <View className="mb-4 bg-gray-50 p-4 rounded-lg">
                      <Text className="text-base font-semibold mb-3">Calculation Summary</Text>
                      <View className="space-y-2">
                        <View className="flex flex-row justify-between">
                          <Text className="text-gray-600">Net Weight:</Text>
                          <Text>{product?.[category]?.net_weight || 0} g</Text>
                        </View>
                        <View className="flex flex-row justify-between items-center">
                          <Text className="text-gray-600">Fine Weight:</Text>
                          <View className="flex flex-row items-center">
                            <Text className="text-gray-500 text-sm mr-2">
                              ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × ({Number(product?.[category]?.tounch || 0)}% + {Number(product?.[category]?.wastage || 0)}%))
                            </Text>
                            <Text className="font-medium">{handleDigitsFix(product?.[category]?.fine_weight || 0)} g</Text>
                          </View>
                        </View>
                        <View className="flex flex-row justify-between items-center">
                          <Text className="text-gray-600">Wastage Weight:</Text>
                          <View className="flex flex-row items-center">
                            <Text className="text-gray-500 text-sm mr-2">
                              ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × {Number(product?.[category]?.wastage || 0)}%)
                            </Text>
                            <Text className="font-medium">{handleDigitsFix(
                              Number(product?.[category]?.gross_weight || 0) *
                              (Number(product?.[category]?.wastage || 0) / 100)
                            )} g</Text>
                          </View>
                        </View>
                        <View className="flex flex-row justify-between items-center">
                          <Text className="text-gray-600">Total Weight with Wastage:</Text>
                          <View className="flex flex-row items-center">
                            <Text className="text-gray-500 text-sm mr-2">
                              ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × (100% + {Number(product?.[category]?.wastage || 0)}%))
                            </Text>
                            <Text className="font-medium">{handleDigitsFix(
                              Number(product?.[category]?.gross_weight || 0) *
                              (1 + (Number(product?.[category]?.wastage || 0) / 100))
                            )} g</Text>
                          </View>
                        </View>
                        <View className="flex flex-row justify-between items-center">
                          <Text className="text-gray-600">Wastage Value:</Text>
                          <View className="flex flex-row items-center">
                            <Text className="text-gray-500 text-sm mr-2">
                              ({handleDigitsFix(
                                Number(product?.[category]?.gross_weight || 0) *
                                (Number(product?.[category]?.wastage || 0) / 100)
                              )} × ({Number(product?.[category]?.tounch || 0)}% × ₹{handleDigitsFix(product?.[category]?.rate || 0)}))
                            </Text>
                            <Text className="font-medium">₹{handleDigitsFix(
                              (Number(product?.[category]?.gross_weight || 0) *
                              (Number(product?.[category]?.wastage || 0) / 100)) *
                              ((Number(product?.[category]?.tounch || 0) / 100) *
                              Number(product?.[category]?.rate || 0))
                            )}</Text>
                          </View>
                        </View>
                        <View className="flex flex-row justify-between items-center">
                          <Text className="text-gray-600">Metal Value:</Text>
                          <View className="flex flex-row items-center">
                            {product.cutting_enabled ? (
                              <>
                                <Text className="text-gray-500 text-sm mr-2">
                                  ({handleDigitsFix(product?.[category]?.fine_weight || 0)} × ₹{handleDigitsFix(product?.[category]?.rate || 0)})
                                </Text>
                                <Text className="font-medium">₹{handleDigitsFix(
                                  Number(product?.[category]?.fine_weight || 0) *
                                  Number(product?.[category]?.rate || 0)
                                )}</Text>
                              </>
                            ) : (
                              <Text className="font-medium">₹0.00 (Cutting OFF)</Text>
                            )}
                          </View>
                        </View>
                        <View className="flex flex-row justify-between items-center">
                          <Text className="text-gray-600">Making Charges:</Text>
                          <View className="flex flex-row items-center">
                            {product?.[category]?.making_type?.value === "PG" ? (
                              <Text className="text-gray-500 text-sm mr-2">
                                ({handleDigitsFix(product?.[category]?.net_weight || 0)} × ₹{handleDigitsFix(product?.[category]?.making_charge || 0)})
                              </Text>
                            ) : null}
                            <Text className="font-medium">₹{handleDigitsFix(
                              product?.[category]?.making_type?.value === "PG"
                                ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
                                : Number(product?.[category]?.making_charge || 0)
                            )}</Text>
                          </View>
                        </View>
                        <View className="mb-4">
                          <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-gray-600 font-medium">Additional Charges</Text>
                            <TouchableOpacity
                              onPress={() => {
                                const updatedCharges = [...(product[category].charges_json || []), { name: '', amount: '0' }];
                                handleInputChange('charges_json', updatedCharges, category);
                              }}
                              className="bg-primary px-2 py-1 rounded-md"
                            >
                              <Text className="text-white">+ Add</Text>
                            </TouchableOpacity>
                          </View>
                          {(product[category]?.charges_json || []).map((charge, index) => (
                            <View key={index} className="flex-row items-center mb-2">
                              <View className="flex-1 mr-2">
                                <OutlineInput
                                  placeholder="Charge name"
                                  value={charge.name}
                                  maxLength={50}
                                  onChangeText={(value) => {
                                    const updatedCharges = [...(product[category].charges_json || [])];
                                    updatedCharges[index] = { ...charge, name: value };
                                    handleInputChange('charges_json', updatedCharges, category);
                                  }}
                                />
                              </View>
                              <View className="w-24 mr-2">
                                <OutlineInput
                                  placeholder="Amount"
                                  value={String(charge.amount)}
                                  keyboardType="numeric"
                                  onChangeText={(value) => {
                                    const updatedCharges = [...(product[category].charges_json || [])];
                                    updatedCharges[index] = { ...charge, amount: value || '0' };
                                    handleInputChange('charges_json', updatedCharges, category);
                                  }}
                                />
                              </View>
                              <TouchableOpacity
                                onPress={() => {
                                  const updatedCharges = (product[category].charges_json || []).filter((_, i) => i !== index);
                                  handleInputChange('charges_json', updatedCharges, category);
                                }}
                              >
                                <FontAwesome6 name="trash" size={16} color="red" />
                              </TouchableOpacity>
                            </View>
                          ))}
                          {(product[category]?.charges_json || []).length > 0 && (
                            <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-200">
                              <Text className="text-gray-600">Total:</Text>
                              <Text className="font-medium">₹{handleDigitsFix(
                                (product[category]?.charges_json || []).reduce((sum, charge) =>
                                  sum + Number(charge.amount || 0), 0)
                              )}</Text>
                            </View>
                          )}
                        </View>
                        <View className="flex flex-row justify-between items-center border-t border-gray-200 mt-2 pt-2">
                          <Text className="text-gray-600 font-semibold">Subtotal:</Text>
                          <Text className="font-semibold">₹{handleDigitsFix(
                            (product.cutting_enabled
                              ? (Number(product?.[category]?.fine_weight || 0) *
                                 Number(product?.[category]?.rate || 0))
                              : 0) +
                            (product?.[category]?.making_type?.value === "PG"
                              ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
                              : Number(product?.[category]?.making_charge || 0)) +
                            (product[category]?.charges_json || []).reduce((sum, charge) => 
                              sum +Number(charge.amount || 0), 0)
                          )}</Text>
                        </View>
                        <View className="flex flex-row justify-between items-center">
                          <Text className="text-gray-600">Tax Amount ({Number(product?.[category]?.tax || 0)}%):</Text>
                          <Text className="font-medium">₹{handleDigitsFix(
                            (
                              (product.cutting_enabled ? 
                                (Number(product?.[category]?.fine_weight || 0) * 
                                 Number(product?.[category]?.rate || 0))
                               : 0) +
                              (product?.[category]?.making_type?.value === "PG" 
                                ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
                               : Number(product?.[category]?.making_charge || 0)) +
                              ((product[category]?.charges_json || []).reduce((sum, charge) => 
                                sum + Number(charge.amount || 0), 0))
                            ) * (Number(product?.[category]?.tax || 0) / 100)
                          )}</Text>
                        </View>
                        <View className="flex flex-row justify-between border-t border-gray-200 pt-2">
                          <Text className="text-gray-600 font-semibold">Final Price:</Text>
                          <Text className="font-semibold">₹{handleDigitsFix(
                            // Subtotal
                            (
                              (product.cutting_enabled ? 
                                (Number(product?.[category]?.fine_weight || 0) * 
                                 Number(product?.[category]?.rate || 0))
                               : 0) +
                              (product?.[category]?.making_type?.value === "PG"
                                ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
                               : Number(product?.[category]?.making_charge || 0)) +
                              ((product[category]?.charges_json || []).reduce((sum, charge) => 
                                sum + Number(charge.amount || 0), 0))
                            ) +
                            // Tax Amount
                            (
                              (product.cutting_enabled ? 
                                (Number(product?.[category]?.fine_weight || 0) *
                                  Number((isSelectRate ? product?.[category]?.rate?.price : product?.[category]?.rate) || 0))
             : 0) +
            (product?.[category]?.making_type?.value === "PG"
              ? Number(product?.[category]?.net_weight || 0) * Number(product?.[category]?.making_charge || 0)
             : Number(product?.[category]?.making_charge || 0)) +
            ((product[category]?.charges_json || []).reduce((sum, charge) => 
              sum + Number(charge.amount || 0), 0))
          ) * (Number(product?.[category]?.tax || 0) / 100)
        )}</Text>
      </View>
    </View>
  </View>
) : (
  <View className="mb-4 bg-gray-50 p-4 rounded-lg">
    <Text className="text-base font-semibold mb-3">Basic Weight Details</Text>
    <View className="space-y-2">
      <View className="flex flex-row justify-between">
        <Text className="text-gray-600">Net Weight:</Text>
        <Text>{product?.[category]?.net_weight || 0} g</Text>
      </View>
      <View className="flex flex-row justify-between items-center">
        <Text className="text-gray-600">Fine Weight:</Text>
        <View className="flex flex-row items-center">
          <Text className="text-gray-500 text-sm mr-2">
            ({handleDigitsFix(product?.[category]?.gross_weight || 0)} × ({Number(product?.[category]?.tounch || 0)}% + {Number(product?.[category]?.wastage || 0)}%))
          </Text>
          <Text className="font-medium">{handleDigitsFix(product?.[category]?.fine_weight || 0)} g</Text>
        </View>
      </View>
    </View>
  </View>
)}
                  {/* charges and taxes */}
                  <View className="mb-4">
                    {/* Charges */}
                    <View className="mb-5">
                      <View className="flex flex-row items-center justify-between">
                        <Text className="tracking-wider text-base">
                          Charges
                        </Text>
                        <View className="flex flex-row items-center">
                          <Switch
                            value={product?.[category]?.showChargesInBill || false}
                            onValueChange={(value) => handleInputChange("showChargesInBill", value, category)}
                            trackColor={{ false: "red", true: "green" }}
                            thumbColor={product?.[category]?.showChargesInBill ? "#ffffff" : "#f4f3f4"}
                          />
                        <TouchableOpacity
                          onPress={() => addItem(category, "charges_json")}
                          activeOpacity={0.7}
                            className="bg-primary ml-2 w-6 h-6 flex justify-center items-center rounded-full shadow-xl"
                        >
                          <FontAwesome6 name="plus" size={17} color="white" />
                        </TouchableOpacity>
                        </View>
                      </View>
                      {/* Input fields */}
                      {product[category]?.charges_json?.map((charge, index) => {
                        return (
                          <View
                            key={index}
                            className="flex pt-2 pl-1 items-end flex-row"
                          >
                            {/* charge name */}
                            <View className="w-[45%] pr-2">
                              <OutlineInput
                                placeholder="e.g. Labour Charge"
                                value={charge.name}
                                onChangeText={(value) =>
                                  handleInputChange(
                                    "name",
                                    value,
                                    category,
                                    "charges_json",
                                    index
                                  )
                                }
                              />
                            </View>

                            {/* amount */}
                            <View className="w-[45%] px-2">
                              <OutlineInput
                                placeholder="e.g. 500"
                                value={charge.amount}
                                keyboardType="numeric"
                                onChangeText={(value) =>
                                  handleInputChange(
                                    "amount",
                                    value,
                                    category,
                                    "charges_json",
                                    index
                                  )
                                }
                              />
                            </View>

                            {/* trash icon */}
                            {product[category]?.charges_json.length > 1 && (
                              <TouchableOpacity
                                onPress={() =>
                                  removeChargeTaxInput(
                                    category,
                                    "charges_json",
                                    index
                                  )
                                }
                                activeOpacity={0.7}
                                className="w-[10%] flex justify-center pl-3"
                              >
                                <FontAwesome6
                                  name="trash"
                                  size={15}
                                  color="red"
                                />
                              </TouchableOpacity>
                            )}
                          </View>
                        );
                      })}
                    </View>

                    {/* Taxes */}
                    <View className="">
                      <View className="flex flex-row items-center justify-between">
                        <Text className="tracking-wider text-base">Tax</Text>
                        <View className="flex flex-row items-center">
                          <Switch
                            value={product?.[category]?.showTaxInBill || false}
                            onValueChange={(value) => handleInputChange("showTaxInBill", value, category)}
                            trackColor={{ false: "red", true: "green" }}
                            thumbColor={product?.[category]?.showTaxInBill ? "#ffffff" : "#f4f3f4"}
                          />
                        <TouchableOpacity
                          onPress={() => addItem(category, "tax_json")}
                          activeOpacity={0.7}
                            className="bg-primary ml-2 w-6 h-6 flex justify-center items-center rounded-full shadow-xl"
                        >
                          <FontAwesome6 name="plus" size={17} color="white" />
                        </TouchableOpacity>
                        </View>
                      </View>
                      {/* Input fields */}
                      {product[category]?.tax_json?.map((tax, index) => {
                        return (
                          <View
                            key={index}
                            className="flex pt-2 pl-1 items-end flex-row"
                          >
                            {/* tax name */}
                            <View className="w-[45%] pr-2">
                              <OutlineInput
                                placeholder="e.g. Tax"
                                value={tax.name}
                                onChangeText={(value) =>
                                  handleInputChange(
                                    "name",
                                    value,
                                    category,
                                    "tax_json",
                                    index
                                  )
                                }
                              />
                            </View>

                            {/* tax amount */}
                            <View className="w-[45%] px-2">
                              <OutlineInput
                                placeholder="e.g. 10%"
                                value={tax.amount}
                                keyboardType="numeric"
                                onChangeText={(value) =>
                                  handleInputChange(
                                    "amount",
                                    value,
                                    category,
                                    "tax_json",
                                    index
                                  )
                                }
                              />
                            </View>

                            {/* trash icon */}
                            {product[category]?.tax_json.length > 1 && (
                              <TouchableOpacity
                                onPress={() =>
                                  removeChargeTaxInput(
                                    category,
                                    "tax_json",
                                    index
                                  )
                                }
                                activeOpacity={0.7}
                                className="w-[10%] flex justify-center pl-3"
                              >
                                <FontAwesome6
                                  name="trash"
                                  size={15}
                                  color="red"
                                />
                              </TouchableOpacity>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>
              )
            );
          })}
          {/* ---------  common for sale & purchase - END - ---------- */}

          {/* Custom Fields Section */}
          <View className="px-4 pb-4">
            <View className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold text-gray-800">Custom Fields</Text>
                <TouchableOpacity
                  onPress={() => {
                    setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
                    setCustomFieldModal(true);
                  }}
                  className="bg-primary px-4 py-2 rounded-full flex-row items-center"
                >
                  <FontAwesome6 name="plus" size={14} color="white" className="mr-2" />
                  <Text className="text-white font-medium ml-1">Add Field</Text>
                </TouchableOpacity>
              </View>

              {/* Custom Fields List */}
              {(product[product.type]?.custom_fields || []).map((field, index) => (
                <View key={index} className="mb-4 bg-gray-50 p-3 rounded-lg">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-medium">{field.label}</Text>
                      <Text className="text-sm text-gray-600">{field.value} {field.unit?.value || ''}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Switch
                        value={field.showInBill}
                        onValueChange={(value) => {
                          const updatedFields = [...(product[product.type].custom_fields || [])];
                          updatedFields[index] = { ...field, showInBill: value };
                          handleInputChange("custom_fields", updatedFields, product.type);
                        }}
                        trackColor={{ false: "#767577", true: "#22c55e" }}
                        thumbColor={field.showInBill ? "#ffffff" : "#f4f3f4"}
                      />
                      <TouchableOpacity
                        onPress={() => {
                          const updatedFields = (product[product.type].custom_fields || []).filter((_, i) => i !== index);
                          handleInputChange("custom_fields", updatedFields, product.type);
                        }}
                        className="ml-4 bg-red-100 p-2 rounded-full"
                      >
                        <FontAwesome6 name="trash" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}

              {!(product[product.type]?.custom_fields?.length > 0) && (
                <View className="items-center py-6 bg-gray-50 rounded-lg">
                  <Text className="text-gray-500 text-sm">No custom fieldss added yet</Text>
                  <Text className="text-gray-400 text-xs mt-1">Click the "Add Field" button to create custom fields</Text>
                </View>
              )}
            </View>
          </View>

          {/* Custom Field Modal */}
          <Modal
            visible={customFieldModal}
            transparent
            animationType="fade"
            onRequestClose={() => setCustomFieldModal(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/50">
              <View className="bg-white p-4 rounded-lg w-[90%] max-w-md">
                <Text className="text-lg font-semibold mb-4">Add Custom Field</Text>
                
                {/* Field Label */}
            <View className="mb-4">
              <InputBox
                    name="label"
                    label="Field Label"
                    placeholder="e.g., Less Weight 2"
                    value={tempCustomField.label}
                    onChange={({ value }) => setTempCustomField(prev => ({ ...prev, label: value }))}
                  />
                </View>

                {/* Field Value */}
                <View className="mb-4">
                  <InputBox
                    name="value"
                    label="Value"
                    placeholder="Enter numeric value"
                    value={tempCustomField.value}
                    keyboardType="numeric"
                    onChange={({ value }) => setTempCustomField(prev => ({ ...prev, value }))}
                  />
                </View>

                {/* Unit Selection */}
                <View className="mb-4">
                  <SelectInput
                    label="Unit"
                    name="unit"
                    value={tempCustomField.unit}
                    placeholder="Select Unit"
                    data={jewelryUnits}
                    onSelect={(value) => setTempCustomField(prev => ({ ...prev, unit: value }))}
                  />
                </View>

                {/* Show in Bill Toggle */}
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-base text-gray-700">Show in Bill</Text>
                  <Switch
                    value={tempCustomField.showInBill}
                    onValueChange={(value) => setTempCustomField(prev => ({ ...prev, showInBill: value }))}
                    trackColor={{ false: "#767577", true: "#22c55e" }}
                    thumbColor={tempCustomField.showInBill ? "#ffffff" : "#f4f3f4"}
                  />
                </View>

                {/* Buttons */}
                <View className="flex-row justify-end space-x-2">
                  <TouchableOpacity 
                    onPress={() => {
                      setCustomFieldModal(false);
                      setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
                    }}
                    className="px-4 py-2"
                  >
                    <Text className="text-gray-600">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      const updatedFields = [...(product[product.type]?.custom_fields || [])];
                      updatedFields.push(tempCustomField);
                      handleInputChange("custom_fields", updatedFields, product.type);
                      setCustomFieldModal(false);
                      setTempCustomField({ label: "", value: "", unit: "", showInBill: true });
                    }}
                    className="bg-primary px-4 py-2 rounded-md"
                  >
                    <Text className="text-white">Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Horizontal Layout for Photo + Buttons */}
          <View className="flex-row px-4 pb-4">
            {/* Additional Photo - Left Side */}
            <View className="flex-1 pr-2">
              <View className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                <Text className="text-sm font-medium mb-2 text-center">Additional Photo</Text>
                <ImagePickerComponent
                  name="additional_image"
                  value={product?.additional_image}
                onChange={({ value, name }) => handleInputChange(name, value)}
              />
                <Text className="text-xs text-gray-500 mt-2 text-center">
                  Upload item photo
                </Text>
              </View>
            </View>

            {/* Buttons - Right Side */}
            <View className="w-1/3 pl-2">
            {isFromInvoice ? (
                <View className="space-y-2">
                <CommonButton
                  loading={loading}
                  onPress={handleAddProduct}
                  title="Add Product"
                    />
              </View>
            ) : (
                <View className="space-y-2">
                  <CommonButton
                    loading={loading}
                    onPress={onSubmitClick}
                    title={route?.params?.isProductEdit || updateData ? "Update" : "Create"}
                  />
              </View>
            )}
            </View>
          </View>
        </View>
        </View>
      </KeyboardHanlder>

      {/* Add weight */}
      {updateData && (
        <AddWeightModal
          product={{ id: updateData.id, type: product?.type }}
          open={initialState.weightModal}
          onClose={() => handleInitialState("weightModal", false)}
        />
      )}

      {/* Create metal */}
      <CreateMetalModal
        navigation={navigation}
        route={route}
        open={initialState.metalModal}
        onClose={() => handleInitialState("metalModal", false)}
      />

      {/* Date Picker Modals */}
      <Modal
        visible={initialState.billDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => handleInitialState("billDatePicker", false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
            <Text className="text-lg font-semibold mb-4">Select Bill Date</Text>
            
            <DatePickerComponent
              name="bill_date"
              value={product?.bill_date}
              onSelect={({ value }) => {
                handleInputChange("bill_date", value);
                handleInitialState("billDatePicker", false);
              }}
            />

            <TouchableOpacity 
              onPress={() => handleInitialState("billDatePicker", false)}
              className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
            >
              <Text className="text-white">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={initialState.paymentDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => handleInitialState("paymentDatePicker", false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
            <Text className="text-lg font-semibold mb-4">Select Expected Payment Date</Text>
            
            <DatePickerComponent
              name="payment_date"
              value={product?.payment_date}
              onSelect={({ value }) => {
                handleInputChange("payment_date", value);
                handleInitialState("paymentDatePicker", false);
              }}
            />

            <TouchableOpacity 
              onPress={() => handleInitialState("paymentDatePicker", false)}
              className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
            >
              <Text className="text-white">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={initialState.interestStartDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => handleInitialState("interestStartDatePicker", false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-5 rounded-lg w-[90%] max-w-md">
            <Text className="text-lg font-semibold mb-4">Select Interest Start Date</Text>
            
            <DatePickerComponent
              name="interest_start_date"
              value={product?.interest_start_date}
              onSelect={({ value }) => {
                handleInputChange("interest_start_date", value);
                handleInitialState("interestStartDatePicker", false);
              }}
            />

            <TouchableOpacity 
              onPress={() => handleInitialState("interestStartDatePicker", false)}
              className="bg-primary px-4 py-2 rounded-md mt-4 self-end"
            >
              <Text className="text-white">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </Fragment>
  );
};

export default ProductForm;
