import React, { Fragment, useEffect, useState } from "react";
import { ScrollView, Text, View, Switch, Dimensions, SafeAreaView, TouchableOpacity, Platform } from "react-native";
import InputBox from "./common/InputBox";
import CommonButton from "./common/buttons/CommonButton";
import TodayRates from "./TodayRates";
import SelectInput from "@/src/components/common/SelectInput";
import ImagePickerComponent from "@/src/components/common/ImagePicker";
import {
  fetchContactGroupsList,
  fetchContactList,
} from "../redux/actions/user.action";
import { fetchProductGroups } from "../redux/actions/product.action";
import { useDispatch, useSelector } from "react-redux";
import { ApiRequest } from "@/src/utils/api";
import { OR_INVOICE_API } from "@/src/utils/api/endpoints";
import ShowToast from "@/src/components/common/ShowToast";
import { Modal } from "react-native";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { AntDesign } from '@expo/vector-icons';
import SearchProduct from "../screens/products/components/SearchProduct";
import InventorySearch from './InventorySearch';

const ORInvoiceForm = ({ title, navigation, route, invoiceHandler }) => {
  const dispatch = useDispatch();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { contacts, groups } = useSelector((state) => state.userSlices);
  const { productGroups } = useSelector((state) => state.productSlices);
  const editData = route?.params?.editData;
  const isEditing = route?.params?.isEditing;
  const onUpdate = route?.params?.onUpdate;

  // Get params from navigation if coming from ProductList or ItemsForInvoice
  const formValueFromList = route?.params?.formValue;
  const setFormValueFromList = route?.params?.setFormValue;
  const isPurchase = route?.params?.isPurchase;
  const isFromItemsList = route?.params?.isFromItemsList;
  const [isFromProductList, setIsFromProductList] = useState(route?.params?.isFromProductList || false);

  // Get the type from route params
  const formType = route?.params?.isRepair ? "repair" : "order";

  // Initialize invoices state with type from route
  const [invoices, setInvoices] = useState(() => {
    if (editData) {
      return {
        ...editData,
        client: editData.client || null,
        selectedProduct: editData.selectedProduct || [],
        photo: editData.photo || null,
        additional_photo: editData.additional_photo || null,
        huid: editData.huid || "",
        hsn_id: editData.hsn_id || "",
        payment_mode: editData.payment_mode || "Cash",
        amount_paid: editData.amount_paid || "0",
        totalPrice: editData.totalPrice || "0",
        weight: editData.weight || "0",
        less_weight: editData.less_weight || "0",
        net_weight: editData.net_weight || "0",
        tounch: editData.tounch || "0",
        wastage: editData.wastage || "0",
        fine_weight: editData.fine_weight || "0",
        rate: editData.rate || "0",
        metal_value: editData.metal_value || "0",
        making_type: editData.making_type || { value: "PG", label: "Per Gram" },
        making_charge: editData.making_charge || "0",
        making_amount: editData.making_amount || "0",
        polishing: editData.polishing || "0",
        stone_setting: editData.stone_setting || "0",
        additional_charges: editData.additional_charges || "0",
        subtotal: editData.subtotal || "0",
        tax: editData.tax || "3",
        tax_amount: editData.tax_amount || "0",
        final_amount: editData.final_amount || "0",
        balance: editData.balance || "0",
        showInBill: editData.showInBill || {
          weight: false,
          less_weight: false,
          net_weight: false,
          tounch: false,
          wastage: false,
          fine_weight: false,
          rate: false,
          making_charge: false,
          making_amount: false,
          tax: false,
          tax_amount: false,
          final_amount: false,
          huid: false,
          hsn: false
        }
      };
    }
    return {
      invoiceType: "order",
      selectedProduct: [],
      photo: null,
      additional_photo: null,
      huid: "",
      hsn_id: "",
      payment_mode: "Cash",
      amount_paid: "0",
      totalPrice: "0",
      weight: "0",
      less_weight: "0",
      net_weight: "0",
      tounch: "0",
      wastage: "0",
      fine_weight: "0",
      rate: "0",
      metal_value: "0",
      making_type: { value: "PG", label: "Per Gram" },
      making_charge: "0",
      making_amount: "0",
      polishing: "0",
      stone_setting: "0",
      additional_charges: "0",
      subtotal: "0",
      tax: "3",
      tax_amount: "0",
      final_amount: "0",
      balance: "0",
      showInBill: {
        weight: false,
        less_weight: false,
        net_weight: false,
        tounch: false,
        wastage: false,
        fine_weight: false,
        rate: false,
        making_charge: false,
        making_amount: false,
        tax: false,
        tax_amount: false,
        final_amount: false,
        huid: false,
        hsn: false
      }
    };
  });
  const isSelectRate = invoices?.hsn_id?.variation?.length > 0;

  const [makingRate, setMakingRate] = useState("0");
  const [baseWeight, setBaseWeight] = useState(0); // Track base weight separately

  // Reset form function
  const resetForm = () => {
    // Reset only the product-related fields, keep the client and other invoice info
    setInvoices(prev => ({
      ...prev,
      photo: null,
      additional_photo: null,
      given_weight: "0",
      received_weight: "0",
      weight: "0",
      less_weight: "0",
      net_weight: "0",
      tounch: "0",
      wastage: "0",
      fine_weight: "0",
      rate: "0",
      metal_value: "0",
      making_type: { value: "PG", label: "Per Gram" },
      making_charge: "0",
      making_amount: "0",
      polishing: "0",
      stone_setting: "0",
      additional_charges: "0",
      subtotal: "0",
      tax: "3",
      tax_amount: "0",
      final_amount: "0",
      huid: "",
      hsn: "",
      remark: "",
      item: null,
      hsn_id: null,
      cutting_enabled: false,
      showSizeInBill: false,
      showCommentInBill: false,
      size: "",
      comment: ""
    }));

    // Reset base weight
    setBaseWeight(0);

    // Reset making rate
    setMakingRate("0");
  };

  const handleInvoiceChange = ({ name, value }) => {
    setInvoices(prev => {
      const updatedInvoices = { ...prev, [name]: value };

      // Special handling for HSN selection
      if (name === "hsn_id") {
        const selectedHSN = productGroups.find(item => item.id === value.value);
        const isVariation = value?.variation?.length > 0;

        // Set rate based on variation or direct price
        const rate = isVariation
          ? {
            label: value.variation[0].name,
            value: value.variation[0].id,
            price: value.variation[0].price
          }
          : selectedHSN?.price || 0;

        updatedInvoices.rate = rate;
        return updatedInvoices;
      }

      // Reset system when manually changing gross weight
      if (name === "weight") {
        setBaseWeight(parseFloat(value || 0));
        updatedInvoices.given_weight = "0";
        updatedInvoices.received_weight = "0";
        return updatedInvoices;
      }

      // Calculate adjustment only when changing given/received
      if (name === "given_weight" || name === "received_weight") {
        const given = parseFloat(updatedInvoices.given_weight) || 0;
        const received = parseFloat(updatedInvoices.received_weight) || 0;
        updatedInvoices.weight = (baseWeight + (given - received)).toFixed(3);
      }

      // Calculate Net Weight
      if (["weight", "less_weight"].includes(name)) {
        const grossWeight = parseFloat(name === "weight" ? value : prev.weight) || 0;
        const lessWeight = parseFloat(name === "less_weight" ? value : prev.less_weight) || 0;
        updatedInvoices.net_weight = (grossWeight - lessWeight).toFixed(3);
      }

      // Calculate Fine Weight
      if (["tounch", "wastage", "net_weight", "weight", "less_weight"].includes(name)) {
        const netWeight = parseFloat(updatedInvoices.net_weight) || 0;
        const touch = parseFloat(name === "tounch" ? value : prev.tounch) || 0;
        const wastage = parseFloat(name === "wastage" ? value : prev.wastage) || 0;
        const totalTouch = touch + wastage;
        updatedInvoices.fine_weight = ((netWeight * totalTouch) / 100).toFixed(3);
      }

      // Calculate Metal Value
      if (["rate", "tounch", "wastage", "net_weight", "weight", "less_weight"].includes(name)) {
        const fineWeight = parseFloat(updatedInvoices.fine_weight) || 0;
        const rate = parseFloat(updatedInvoices.rate?.price || updatedInvoices.rate) || 0;
        updatedInvoices.metal_value = (fineWeight * rate).toFixed(2);
      }

      // Calculate Making Amount
      if (["making_charge", "making_type", "net_weight"].includes(name)) {
        const netWeight = parseFloat(updatedInvoices.net_weight) || 0;
        const makingCharge = parseFloat(name === "making_charge" ? value : prev.making_charge) || 0;

        // Calculate making amount based on type
        const makingAmount = updatedInvoices.making_type.value === "PG"
          ? netWeight * makingCharge  // Per Gram: net_weight × making_charge
          : makingCharge;             // Per Piece: making_charge as is

        updatedInvoices.making_amount = makingAmount.toFixed(2);
      }

      // Calculate Additional Charges
      const polishing = parseFloat(updatedInvoices.polishing) || 0;
      const stoneSetting = parseFloat(updatedInvoices.stone_setting) || 0;
      updatedInvoices.additional_charges = (polishing + stoneSetting).toFixed(2);

      // Calculate Subtotal using making_amount
      const metalValue = parseFloat(updatedInvoices.metal_value) || 0;
      const makingAmount = parseFloat(updatedInvoices.making_amount) || 0;
      const additionalCharges = parseFloat(updatedInvoices.additional_charges) || 0;
      updatedInvoices.subtotal = (metalValue + makingAmount + additionalCharges).toFixed(2);

      // Calculate Tax Amount
      const subtotal = parseFloat(updatedInvoices.subtotal) || 0;
      const taxRate = parseFloat(updatedInvoices.tax) || 0;
      updatedInvoices.tax_amount = ((subtotal * taxRate) / 100).toFixed(2);

      // Calculate Final Amount
      const taxAmount = parseFloat(updatedInvoices.tax_amount) || 0;
      updatedInvoices.final_amount = (subtotal + taxAmount).toFixed(2);

      // Calculate Balance
      const finalAmount = parseFloat(updatedInvoices.final_amount) || 0;
      const amountPaid = parseFloat(updatedInvoices.amount_paid) || 0;
      updatedInvoices.balance = (finalAmount - amountPaid).toFixed(2);

      return updatedInvoices;
    });
  };

  const clientList = role
    ? contacts
      .filter((item) => item.role_id == role?.value)
      .map((item) => ({
        label: item.name,
        value: item.id,
        role_id: item.role_id
      }))
    : contacts.map((item) => ({
      label: item.name,
      value: item.id,
      role_id: item.role_id
    }));

  useEffect(() => {
    dispatch(fetchContactList());
    dispatch(fetchContactGroupsList());
    dispatch(fetchProductGroups());
  }, [dispatch]);

  useEffect(() => {
    const grossWeight = parseFloat(invoices.weight) || 0;
    const lessWeight = parseFloat(invoices.less_weight) || 0;

    // Calculate net weight directly from gross and less weights
    const netWeight = grossWeight - lessWeight;

    setInvoices(prev => ({
      ...prev,
      net_weight: netWeight.toString()
    }));
  }, [invoices.weight, invoices.less_weight]);

  useEffect(() => {
    const netWeight = parseFloat(invoices.net_weight) || 0;
    const tounch = parseFloat(invoices.tounch) || 0;
    const wastage = parseFloat(invoices.wastage) || 0;

    // First calculate total percentage (Touch% + Wastage%)
    const totalPercentage = tounch + wastage;

    // Then calculate fine weight as percentage of net weight
    // Example: If net weight = 90g, touch = 80%, wastage = 5%
    // totalPercentage = 85%
    // fine weight = 90 × 0.85 = 76.5g
    const fineWeight = (netWeight * (totalPercentage / 100)).toFixed(3);

    setInvoices(prev => ({
      ...prev,
      fine_weight: fineWeight
    }));
  }, [invoices.net_weight, invoices.tounch, invoices.wastage]);

  useEffect(() => {
    const rate = isSelectRate
      ? parseFloat(invoices?.rate?.price) || 0
      : parseFloat(invoices.rate) || 0;
    const fineWeight = parseFloat(invoices.fine_weight) || 0;
    const netWeight = parseFloat(invoices.net_weight) || 0;
    const currentMakingRate = parseFloat(makingRate) || 0;

    // Calculate metal value based on cutting state
    const metalValue = invoices.cutting_enabled
      ? (fineWeight * rate).toFixed(2)  // When cutting is ON: fine_weight × rate
      : "0";                            // When cutting is OFF: 0

    // Calculate making charges based on type
    let makingCharges = 0;
    if (invoices.making_type.value === "PG") {
      makingCharges = netWeight * currentMakingRate;
    } else {
      makingCharges = currentMakingRate;
    }

    setInvoices(prev => ({
      ...prev,
      metal_value: metalValue,
      making_charge: makingCharges.toString()
    }));
  }, [
    invoices.fine_weight,
    invoices.rate,
    invoices.net_weight,
    invoices.cutting_enabled,
    invoices.making_type,
    makingRate
  ]);

  useEffect(() => {
    // Update rate when HSN is selected
    if (invoices?.hsn_id?.variation?.length > 0) {
      const latestRate = invoices.hsn_id.variation[invoices.hsn_id.variation.length - 1];
      setInvoices(prev => ({
        ...prev,
        rate: latestRate
      }));
    }
  }, [invoices.hsn_id]);

  const calculateTotal = () => {
    const metalValue = parseFloat(invoices.metal_value) || 0;
    const makingAmount = parseFloat(invoices.making_amount) || 0;
    const taxAmount = parseFloat(invoices.tax_amount) || 0;

    // Calculate total as sum of metal value, making amount, and tax amount
    const total = metalValue + makingAmount + taxAmount;

    return total.toFixed(2);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!role || !invoices.client) {
        ShowToast("Please select Role and Client");
        return;
      }

      // Validate products
      if (!invoices.selectedProduct || invoices.selectedProduct.length === 0) {
        ShowToast("Please add at least one product");
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();

      // Create request body matching API structure
      const requestBody = {
        invoiceType: invoices.invoiceType,
        user_contact_id: invoices.client.value, // Use the client's ID
        client: {
          id: invoices.client.value,
          name: invoices.client.label,
          role_id: role.value
        },
        selectedProduct: invoices.selectedProduct.map(product => ({
          name: product.name || "",
          product_id: product.product_id || "",
          size: product.size || "",
          gross_weight: product.sale?.gross_weight || "0",
          less_weight: product.sale?.less_weight || "0",
          net_weight: product.sale?.net_weight || "0",
          tounch: product.sale?.tounch || "0",
          wastage: product.sale?.wastage || "0",
          fine_weight: product.sale?.fine_weight || "0",
          rate: product.sale?.rate || "0",
          metal_value: product.sale?.metal_value || "0",
          making_type: product.sale?.making_type || { value: "PG", label: "Per Gram" },
          making_charge: product.sale?.making_charge || "0",
          making_amount: product.sale?.making_amount || "0",
          polishing: product.sale?.polishing || "0",
          stone_setting: product.sale?.stone_setting || "0",
          additional_charges: product.sale?.additional_charges || "0",
          subtotal: product.sale?.subtotal || "0",
          tax: product.sale?.tax || "0",
          tax_amount: product.sale?.tax_amount || "0",
          final_amount: product.sale?.net_price || "0"
        })),
        totalPrice: invoices.totalPrice,
        huid: invoices.huid,
        hsn_id: invoices.hsn_id?.value,
        remark: invoices.remark,
        status: "in_progress",
        profile_id: "13", // This should come from user profile
        payment_mode: invoices.payment_mode,
        amount_paid: invoices.amount_paid,
        bill_display_settings: JSON.stringify({
          showSizeInBill: invoices.showSizeInBill,
          showWeightInBill: invoices.showInBill.weight,
          showRateInBill: invoices.showInBill.rate,
          showMakingInBill: invoices.showInBill.making_charge,
          showTaxInBill: invoices.showInBill.tax,
          showCommentInBill: invoices.showCommentInBill
        })
      };

      // Handle file uploads
      if (invoices.photo) {
        const photoUri = invoices.photo.uri;
        const filename = photoUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';

        formData.append('photo', {
          uri: Platform.OS === 'ios' ? photoUri.replace('file://', '') : photoUri,
          name: filename,
          type
        });
      }

      if (invoices.additional_photo) {
        const photoUri = invoices.additional_photo.uri;
        const filename = photoUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image';

        formData.append('additional_photo', {
          uri: Platform.OS === 'ios' ? photoUri.replace('file://', '') : photoUri,
          name: filename,
          type
        });
      }

      // Add all other fields to FormData
      Object.keys(requestBody).forEach(key => {
        if (key !== 'photo' && key !== 'additional_photo') {
          const value = requestBody[key];
          if (value === undefined || value === null) {
            formData.append(key, '');
          } else if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // Determine API endpoint and method based on editing status
      const apiEndpoint = isEditing ? OR_INVOICE_API.update(editData.id) : OR_INVOICE_API.create;
      const method = "POST";

      const response = await ApiRequest({
        url: apiEndpoint,
        method: method,
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
      });

      if (response.success) {
        ShowToast(response.message || (isEditing ? "Order Updated Successfully" : "Order Created Successfully"));
        if (isEditing && onUpdate) {
          onUpdate(response.data);
        }
        navigation.goBack();
      } else {
        ShowToast(response.message || (isEditing ? "Error in Updating Order" : "Error in Creating Order"));
      }
    } catch (error) {
      console.error("Submit error:", error);
      ShowToast(error.message || (isEditing ? "Error in Updating Order" : "Error in Creating Order"));
    } finally {
      setLoading(false);
    }
  };

  // Update form value in ProductList or ItemsForInvoice when returning
  useEffect(() => {
    if ((isFromProductList || isFromItemsList) && setFormValueFromList) {
      setFormValueFromList({
        ...invoices,
        selectedProduct: invoices.selectedProduct,
        totalPrice: invoices.totalPrice
      });
    }
  }, [invoices.selectedProduct, invoices.totalPrice]);

  const handleFormSubmit = () => {
    // Basic validation
    if (!invoices.hsn_id) {
      alert("Please select a product category (HSN)");
      return;
    }

    // Get existing products array or initialize empty array
    const existingProducts = route.params?.formValue?.selectedProduct || [];

    // Create new product object with current form values
    const newProduct = {
      name: invoices.hsn_id?.label || "New Item",
      product_id: Date.now().toString(), // Unique ID
      size: invoices.size || "-",
      huid: invoices.huid,
      hsn_id: invoices.hsn_id?.value,
      comment: invoices.comment,
      // Add type-specific data (purchase or sale)
      [route.params?.isPurchase ? "purchase" : "sale"]: {
        gross_weight: invoices.weight || "0",
        less_weight: invoices.less_weight || "0",
        net_weight: invoices.net_weight || "0",
        tounch: invoices.tounch || "0",
        wastage: invoices.wastage || "0",
        fine_weight: invoices.fine_weight || "0",
        rate: isSelectRate ? invoices.rate?.price : invoices.rate || "0",
        metal_value: invoices.metal_value || "0",
        making_type: invoices.making_type || { value: "PG", label: "Per Gram" },
        making_charge: invoices.making_charge || "0",
        making_amount: invoices.making_amount || "0",
        polishing: invoices.polishing || "0",
        stone_setting: invoices.stone_setting || "0",
        additional_charges: invoices.additional_charges || "0",
        tax: invoices.tax || "0",
        tax_amount: invoices.tax_amount || "0",
        net_price: invoices.final_amount || "0",
        showInBill: invoices.showInBill || {}
      }
    };

    // Calculate new total price including the new product
    const newTotalPrice = existingProducts.reduce(
      (acc, product) => {
        const typeData = product[route.params?.isPurchase ? "purchase" : "sale"] || {};
        return Number(acc) + Number(typeData.net_price || 0);
      },
      Number(invoices.final_amount || 0) // Add current product's price
    );

    // Create updated form value
    const updatedFormValue = {
      ...route.params?.formValue,
      selectedProduct: [...existingProducts, newProduct],
      totalPrice: newTotalPrice.toString()
    };

    // Update form value using the handler
    if (route.params?.setFormValue) {
      route.params.setFormValue(updatedFormValue);
    }

    // Reset form for next product
    resetForm();

    // Navigate back to ItemsForInvoice
    navigation.goBack();
  };

  // Add navigation confirmation handler
  useEffect(() => {
    if (!navigation) return; // Add this check

    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!isNavigating && !route?.params?.isFromProductList) {
        // Prevent default navigation
        e.preventDefault();
        // Show reset confirmation
        setShowResetConfirm(true);
      }
    });

    return unsubscribe;
  }, [navigation, isNavigating, route?.params?.isFromProductList]);

  useEffect(() => {
    if (editData?.client) {
      // Set role based on client data
      const clientRole = groups.find(g => g.id === editData.client.role_id);
      if (clientRole) {
        setRole({
          value: clientRole.id,
          label: clientRole.name
        });
      }
    }
  }, [editData, groups]);

  return (
    <Fragment>
      <SafeAreaView className="flex-1 bg-white">
        <TodayRates />
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
          <View className="px-5 bg-white pt-2.5">
            {/* Order/Repair Type Selector with Visual Indicator */}
            <View className="flex mb-4 flex-row">
              {["order", "repair"].map((type) => (
                <View key={type} className={`w-1/2`}>
                  <View
                    className={`
                    py-2 
                    ${type === "repair" ? "ml-1.5" : "mr-1.5"}
                    border border-primary 
                    rounded-md 
                    flex flex-row 
                    justify-center 
                    items-center 
                    shadow-xl
                    ${invoices.invoiceType === type ? "bg-primary" : "bg-white"}
                    relative
                  `}
                  >
                    <Text
                      className={`${invoices.invoiceType === type ? "text-white" : "text-primary"
                        } tracking-wider capitalize font-medium`}
                    >
                      {type}
                    </Text>
                    {invoices.invoiceType === type && (
                      <View className="absolute right-2">
                        <AntDesign
                          name="checkcircle"
                          size={16}
                          color="white"
                        />
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Add InventorySearch component here */}
            <View className="mb-4">
              <InventorySearch
                onItemSelect={(item) => {
                  setInvoices(prev => ({
                    ...prev,
                    name: item.name,
                    product_id: item.id,
                    hsn_id: item.hsn_id,
                    huid: item.huid,
                    weight: item.weight || "0",
                    tounch: item.tounch || "0",
                    wastage: item.wastage || "0",
                    rate: item.rate || "0",
                    net_weight: item.net_weight || "0",
                    fine_weight: item.fine_weight || "0",
                    metal_value: item.metal_value || "0",
                    making_charge: item.making_charge || "0",
                    making_amount: item.making_amount || "0",
                    polishing: item.polishing || "0",
                    stone_setting: item.stone_setting || "0",
                    additional_charges: item.additional_charges || "0",
                    subtotal: item.subtotal || "0",
                    tax: item.tax || "0",
                    tax_amount: item.tax_amount || "0",
                    final_amount: item.final_amount || "0"
                  }));
                }}
              />
            </View>

            {/* Photo Upload */}
            <View className="mb-4">
              <Text className="text-slate-500 text-[13px] mb-1">Item Photo</Text>
              <View className="flex flex-row">
                <ImagePickerComponent
                  onChange={({ value }) => handleInvoiceChange({ name: "photo", value })}
                  value={invoices?.photo}
                  name="photo"
                />
                <Text className="ml-3 text-gray-500 self-center">Upload a photo of the item</Text>
              </View>
            </View>

            {/* Additional Photo */}
            <View className="mb-4">
              <Text className="text-slate-500 text-[13px] mb-1">Additional Photo</Text>
              <View className="flex flex-row">
                <ImagePickerComponent
                  onChange={({ value }) => handleInvoiceChange({ name: "additional_photo", value })}
                  value={invoices?.additional_photo}
                  name="additional_photo"
                />
                <Text className="ml-3 text-gray-500 self-center">Upload additional photos if needed</Text>
              </View>
            </View>

            {/* Comment Field */}
            <View className="mb-4">
              <InputBox
                name="comment"
                label="Comment"
                multiLine={true}
                value={invoices?.comment}
                onChange={handleInvoiceChange}
                placeholder="Add any special instructions or notes..."
              />
              <View className="flex flex-row items-center justify-between mt-1">
                <Text className="text-xs text-gray-500">Show in bill</Text>
                <Switch
                  value={invoices?.showCommentInBill || false}
                  onValueChange={(value) => handleInvoiceChange({ name: "showCommentInBill", value })}
                  trackColor={{ false: "red", true: "green" }}
                  thumbColor={invoices?.showCommentInBill ? "#ffffff" : "#f4f3f4"}
                />
              </View>
            </View>

            {/* client */}
            <View className="mb-4 flex flex-row ">
              <View className="w-2/5">
                <SelectInput
                  label="Role"
                  value={role}
                  placeholder="Select Role"
                  data={groups.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  onSelect={(value) => setRole(value)}
                />
              </View>
              <View className="w-3/5 pl-2">
                <SelectInput
                  label="Client"
                  value={invoices?.client}
                  placeholder="Select Client"
                  data={clientList}
                  onSelect={(value) =>
                    handleInvoiceChange({ name: "client", value })
                  }
                />
              </View>
            </View>

            {/* Given and Received Weight */}
            <View className="mb-4 flex flex-row">
              <View className="w-2/5 pr-1">
                <InputBox
                  name="given_weight"
                  placeholder="0"
                  label="Given Weight"
                  value={invoices.given_weight}
                  onChange={handleInvoiceChange}
                  keyboardType="numeric"
                />
              </View>
              <View className="w-1/5 px-1 justify-center">
                <InputBox
                  name="given_received"
                  label="Given-Received"
                  value={(parseFloat(invoices.given_weight || 0) - parseFloat(invoices.received_weight || 0)).toFixed(3)}
                  editable={false}
                  inputStyle={{ textAlign: 'center', fontSize: 12 }}
                  containerStyle={{ paddingVertical: 4 }}
                />
              </View>
              <View className="w-2/5 pl-1">
                <InputBox
                  name="received_weight"
                  placeholder="0"
                  label="Received Weight"
                  value={invoices.received_weight}
                  onChange={handleInvoiceChange}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Weight Details Row */}
            <View className="mb-4">
              <Text className="text-slate-500 text-[13px] mb-1">Weight Details</Text>
              <View className="flex-row justify-between">
                <View style={{ width: '18%' }}>
                  <InputBox
                    name="weight"
                    placeholder="0"
                    label="Gross"
                    value={invoices?.weight}
                    onChange={handleInvoiceChange}
                    editable={true}
                    keyboardType="numeric"
                    containerStyle={{ paddingVertical: 2 }}
                    labelStyle={{ fontSize: 12 }}
                    inputStyle={{ fontSize: 13 }}
                  />
                  <View className="flex flex-row items-center justify-between mt-1">
                    <Text className="text-[10px] text-gray-500">  </Text>
                    <Switch
                      value={invoices.showInBill.weight}
                      onValueChange={(value) => setInvoices(prev => ({
                        ...prev,
                        showInBill: { ...prev.showInBill, weight: value }
                      }))}
                      trackColor={{ false: "red", true: "green" }}
                    />
                  </View>
                </View>
                <View style={{ width: '18%' }}>
                  <InputBox
                    name="less_weight"
                    placeholder="0"
                    label="Less"
                    value={invoices?.less_weight}
                    onChange={handleInvoiceChange}
                    keyboardType="numeric"
                    containerStyle={{ paddingVertical: 2 }}
                    labelStyle={{ fontSize: 12 }}
                    inputStyle={{ fontSize: 13 }}
                  />
                  <View className="flex flex-row items-center justify-between mt-1">
                    <Text className="text-[10px] text-gray-500">  </Text>
                    <Switch
                      value={invoices.showInBill.less_weight}
                      onValueChange={(value) => setInvoices(prev => ({
                        ...prev,
                        showInBill: { ...prev.showInBill, less_weight: value }
                      }))}
                      trackColor={{ false: "red", true: "green" }}
                    />
                  </View>
                </View>
                <View style={{ width: '18%' }}>
                  <InputBox
                    name="net_weight"
                    placeholder="0"
                    label="Net"
                    value={invoices?.net_weight}
                    onChange={handleInvoiceChange}
                    editable={false}
                    containerStyle={{ paddingVertical: 2 }}
                    labelStyle={{ fontSize: 12 }}
                    inputStyle={{ fontSize: 13 }}
                  />
                  <View className="flex flex-row items-center justify-between mt-1">
                    <Text className="text-[10px] text-gray-500">  </Text>
                    <Switch
                      value={invoices.showInBill.net_weight}
                      onValueChange={(value) => setInvoices(prev => ({
                        ...prev,
                        showInBill: { ...prev.showInBill, net_weight: value }
                      }))}
                      trackColor={{ false: "red", true: "green" }}
                    />
                  </View>
                </View>
                <View style={{ width: '18%' }}>
                  <InputBox
                    name="tounch"
                    placeholder="0"
                    label="Touch%"
                    value={invoices?.tounch}
                    onChange={handleInvoiceChange}
                    keyboardType="numeric"
                    containerStyle={{ paddingVertical: 2 }}
                    labelStyle={{ fontSize: 12 }}
                    inputStyle={{ fontSize: 13 }}
                  />
                  <View className="flex flex-row items-center justify-between mt-1">
                    <Text className="text-[10px] text-gray-500">  </Text>
                    <Switch
                      value={invoices.showInBill.tounch}
                      onValueChange={(value) => setInvoices(prev => ({
                        ...prev,
                        showInBill: { ...prev.showInBill, tounch: value }
                      }))}
                      trackColor={{ false: "red", true: "green" }}
                    />
                  </View>
                </View>
                <View style={{ width: '18%' }}>
                  <InputBox
                    name="wastage"
                    placeholder="0"
                    label="Wast%"
                    value={invoices?.wastage}
                    onChange={handleInvoiceChange}
                    keyboardType="numeric"
                    containerStyle={{ paddingVertical: 2 }}
                    labelStyle={{ fontSize: 12 }}
                    inputStyle={{ fontSize: 13 }}
                  />
                  <View className="flex flex-row items-center justify-between mt-1">
                    <Text className="text-[10px] text-gray-500">  </Text>
                    <Switch
                      value={invoices.showInBill.wastage}
                      onValueChange={(value) => setInvoices(prev => ({
                        ...prev,
                        showInBill: { ...prev.showInBill, wastage: value }
                      }))}
                      trackColor={{ false: "red", true: "green" }}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* HUID, HSN Name and Tax */}
            <View className="mb-4">
              <View className="flex-row justify-between">
                <View style={{ width: '32%' }}>
                  <InputBox
                    name="huid"
                    label="HUID"
                    value={invoices?.huid}
                    onChange={handleInvoiceChange}
                    containerStyle={{ paddingVertical: 2 }}
                    labelStyle={{ fontSize: 12 }}
                    inputStyle={{ fontSize: 13 }}
                  />
                  <View className="flex flex-row items-center justify-between mt-1">
                    <Text className="text-[10px] text-gray-500">  </Text>
                    <Switch
                      value={invoices.showInBill.huid}
                      onValueChange={(value) => setInvoices(prev => ({
                        ...prev,
                        showInBill: { ...prev.showInBill, huid: value }
                      }))}
                      trackColor={{ false: "red", true: "green" }}
                    />
                  </View>
                </View>
                <View style={{ width: '32%' }}>
                  <SelectInput
                    label="HSN Name"
                    name="hsn_id"
                    value={invoices?.hsn_id}
                    placeholder="Select HSN"
                    error={null}
                    data={productGroups.map((item) => ({
                      label: item.name,
                      value: item.id,
                      variation: item.variation_data,
                    }))}
                    onSelect={(value) => handleInvoiceChange({ name: "hsn_id", value })}
                  />
                  <View className="flex flex-row items-center justify-between mt-1">
                    <Text className="text-[10px] text-gray-500">  </Text>
                    <Switch
                      value={invoices.showInBill.hsn}
                      onValueChange={(value) => setInvoices(prev => ({
                        ...prev,
                        showInBill: { ...prev.showInBill, hsn: value }
                      }))}
                      trackColor={{ false: "red", true: "green" }}
                    />
                  </View>
                </View>
                <View style={{ width: '32%' }}>
                  <InputBox
                    name="tax"
                    placeholder="0%"
                    label="HSN Tax"
                    value={invoices.tax}
                    onChange={handleInvoiceChange}
                    keyboardType="numeric"
                    containerStyle={{ paddingVertical: 2 }}
                    labelStyle={{ fontSize: 12 }}
                    inputStyle={{ fontSize: 13 }}
                  />
                  <View className="flex flex-row items-center justify-between mt-1">
                    <Text className="text-[10px] text-gray-500">  </Text>
                    <Switch
                      value={invoices.showInBill.tax}
                      onValueChange={(value) => setInvoices(prev => ({
                        ...prev,
                        showInBill: { ...prev.showInBill, tax: value }
                      }))}
                      trackColor={{ false: "red", true: "green" }}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Fine Weight, Cutting, and Rate Row */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center">
                <View style={{ width: '32%' }}>
                  <InputBox
                    name="fine_weight"
                    placeholder="0"
                    label="Fine Weight"
                    value={invoices.fine_weight}
                    editable={false}
                    containerStyle={{ paddingVertical: 2 }}
                    labelStyle={{ fontSize: 12 }}
                    inputStyle={{ fontSize: 13 }}
                  />
                  <View className="flex flex-row items-center justify-between mt-1">
                    <Text className="text-[10px] text-gray-500">  </Text>
                    <Switch
                      value={invoices.showInBill.fine_weight}
                      onValueChange={(value) => setInvoices(prev => ({
                        ...prev,
                        showInBill: { ...prev.showInBill, fine_weight: value }
                      }))}
                      trackColor={{ false: "red", true: "green" }}
                    />
                  </View>
                </View>
                <View style={{ width: '32%' }} className="flex items-center">
                  <View className="bg-gray-100 rounded-lg px-4 py-2">
                    <CommonButton
                      title={invoices.cutting_enabled ? "Cutting: ON" : "Cutting: OFF"}
                      onPress={() => {
                        const rate = isSelectRate
                          ? parseFloat(invoices?.rate?.price) || 0
                          : parseFloat(invoices.rate) || 0;
                        const fineWeight = parseFloat(invoices.fine_weight) || 0;
                        const newMetalValue = !invoices.cutting_enabled ? (fineWeight * rate).toFixed(2) : "0";

                        setInvoices(prev => ({
                          ...prev,
                          cutting_enabled: !prev.cutting_enabled,
                          metal_value: newMetalValue
                        }));
                      }}
                      isFilled={invoices.cutting_enabled}
                      small
                    />
                  </View>
                </View>
                <View style={{ width: '32%' }}>
                  <InputBox
                    name="rate"
                    label="Rate"
                    placeholder="0"
                    value={
                      isSelectRate
                        ? (invoices?.rate?.price?.toString() || "0")
                        : (typeof invoices?.rate === 'object'
                          ? invoices?.rate?.price?.toString()
                          : invoices?.rate?.toString() || "0")
                    }
                    onChange={handleInvoiceChange}
                    editable={false}
                    keyboardType="numeric"
                    containerStyle={{ paddingVertical: 2 }}
                    labelStyle={{ fontSize: 12 }}
                    inputStyle={{ fontSize: 13 }}
                  />
                  <View className="flex flex-row items-center justify-between mt-1">
                    <Text className="text-[10px] text-gray-500">  </Text>
                    <Switch
                      value={invoices.showInBill.rate}
                      onValueChange={(value) => setInvoices(prev => ({
                        ...prev,
                        showInBill: { ...prev.showInBill, rate: value }
                      }))}
                      trackColor={{ false: "red", true: "green" }}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Making Type, Rate, and Amount Row */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center">
                <View style={{ width: '32%' }}>
                  <SelectInput
                    label="Making Type"
                    value={invoices.making_type}
                    data={[{ value: "PG", label: "Per Gram" }, { value: "PP", label: "Per Piece" }]}
                    onSelect={(value) => handleInvoiceChange({ name: "making_type", value })}
                  />
                  <View className="flex flex-row items-center justify-between mt-1">
                    <Text className="text-[10px] text-gray-500">  </Text>
                    <Switch
                      value={invoices.showInBill.making_type}
                      onValueChange={(value) => setInvoices(prev => ({
                        ...prev,
                        showInBill: { ...prev.showInBill, making_type: value }
                      }))}
                      trackColor={{ false: "red", true: "green" }}
                    />
                  </View>
                </View>
                <View style={{ width: '32%' }}>
                  <InputBox
                    name="making_charge"
                    placeholder="0"
                    label="Making Rate"
                    value={invoices.making_charge}
                    onChange={handleInvoiceChange}
                    keyboardType="numeric"
                    containerStyle={{ paddingVertical: 2 }}
                    labelStyle={{ fontSize: 12 }}
                    inputStyle={{ fontSize: 13 }}
                  />
                  <View className="flex flex-row items-center justify-between mt-1">
                    <Text className="text-[10px] text-gray-500">  </Text>
                    <Switch
                      value={invoices.showInBill.making_charge}
                      onValueChange={(value) => setInvoices(prev => ({
                        ...prev,
                        showInBill: { ...prev.showInBill, making_charge: value }
                      }))}
                      trackColor={{ false: "red", true: "green" }}
                    />
                  </View>
                </View>
                <View style={{ width: '32%' }}>
                  <InputBox
                    name="making_amount"
                    label="Making Amount"
                    value={invoices.making_amount}
                    editable={false}
                    keyboardType="numeric"
                    containerStyle={{ paddingVertical: 2 }}
                    labelStyle={{ fontSize: 12 }}
                    inputStyle={{ fontSize: 13 }}
                  />
                  <View className="flex flex-row items-center justify-between mt-1">
                    <Text className="text-[10px] text-gray-500">  </Text>
                    <Switch
                      value={invoices.showInBill.making_amount}
                      onValueChange={(value) => setInvoices(prev => ({
                        ...prev,
                        showInBill: { ...prev.showInBill, making_amount: value }
                      }))}
                      trackColor={{ false: "red", true: "green" }}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Additional Charges and Subtotal Row */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center">
                <View style={{ width: '32%' }}>
                  <InputBox
                    name="polishing"
                    placeholder="0"
                    label="Polishing"
                    value={invoices.polishing}
                    onChange={handleInvoiceChange}
                    keyboardType="numeric"
                    containerStyle={{ paddingVertical: 2 }}
                    labelStyle={{ fontSize: 12 }}
                    inputStyle={{ fontSize: 13 }}
                  />
                  <View className="flex flex-row items-center justify-between mt-1">
                    <Text className="text-[10px] text-gray-500">  </Text>
                    <Switch
                      value={invoices.showInBill.polishing}
                      onValueChange={(value) => setInvoices(prev => ({
                        ...prev,
                        showInBill: { ...prev.showInBill, polishing: value }
                      }))}
                      trackColor={{ false: "red", true: "green" }}
                    />
                  </View>
                </View>
                <View style={{ width: '32%' }}>
                  <InputBox
                    name="stone_setting"
                    placeholder="0"
                    label="Stone Setting"
                    value={invoices.stone_setting}
                    onChange={handleInvoiceChange}
                    keyboardType="numeric"
                    containerStyle={{ paddingVertical: 2 }}
                    labelStyle={{ fontSize: 12 }}
                    inputStyle={{ fontSize: 13 }}
                  />
                  <View className="flex flex-row items-center justify-between mt-1">
                    <Text className="text-[10px] text-gray-500">  </Text>
                    <Switch
                      value={invoices.showInBill.stone_setting}
                      onValueChange={(value) => setInvoices(prev => ({
                        ...prev,
                        showInBill: { ...prev.showInBill, stone_setting: value }
                      }))}
                      trackColor={{ false: "red", true: "green" }}
                    />
                  </View>
                </View>
                <View style={{ width: '32%' }}>
                  <InputBox
                    name="subtotal"
                    label="Subtotal"
                    value={invoices.subtotal}
                    editable={false}
                    keyboardType="numeric"
                    containerStyle={{ paddingVertical: 2 }}
                    labelStyle={{ fontSize: 12 }}
                    inputStyle={{ fontSize: 13 }}
                  />
                  <View className="flex flex-row items-center justify-between mt-1">
                    <Text className="text-[10px] text-gray-500">  </Text>
                    <Switch
                      value={invoices.showInBill.subtotal}
                      onValueChange={(value) => setInvoices(prev => ({
                        ...prev,
                        showInBill: { ...prev.showInBill, subtotal: value }
                      }))}
                      trackColor={{ false: "red", true: "green" }}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* GST and Final Amount Row */}
            <View className="mb-4">
              <View className="flex-row justify-between items-center">
                <View style={{ width: '32%' }}>
                  <InputBox
                    name="tax"
                    placeholder="3"
                    label="GST %"
                    value={invoices.tax}
                    onChange={handleInvoiceChange}
                    keyboardType="numeric"
                    containerStyle={{ paddingVertical: 2 }}
                    labelStyle={{ fontSize: 12 }}
                    inputStyle={{ fontSize: 13 }}
                  />
                  <View className="flex flex-row items-center justify-between mt-1">
                    <Text className="text-[10px] text-gray-500">  </Text>
                    <Switch
                      value={invoices.showInBill.tax}
                      onValueChange={(value) => setInvoices(prev => ({
                        ...prev,
                        showInBill: { ...prev.showInBill, tax: value }
                      }))}
                      trackColor={{ false: "red", true: "green" }}
                    />
                  </View>
                </View>
                <View style={{ width: '32%' }}>
                  <InputBox
                    name="tax_amount"
                    label="GST Amount"
                    value={invoices.tax_amount}
                    editable={false}
                    keyboardType="numeric"
                    containerStyle={{ paddingVertical: 2 }}
                    labelStyle={{ fontSize: 12 }}
                    inputStyle={{ fontSize: 13 }}
                  />
                  <View className="flex flex-row items-center justify-between mt-1">
                    <Text className="text-[10px] text-gray-500">  </Text>
                    <Switch
                      value={invoices.showInBill.tax_amount}
                      onValueChange={(value) => setInvoices(prev => ({
                        ...prev,
                        showInBill: { ...prev.showInBill, tax_amount: value }
                      }))}
                      trackColor={{ false: "red", true: "green" }}
                    />
                  </View>
                </View>
                <View style={{ width: '32%' }}>
                  <InputBox
                    name="final_amount"
                    label="Final Amount"
                    value={invoices.final_amount}
                    editable={false}
                    keyboardType="numeric"
                    containerStyle={{ paddingVertical: 2 }}
                    labelStyle={{ fontSize: 12 }}
                    inputStyle={{ fontSize: 13 }}
                  />
                  <View className="flex flex-row items-center justify-between mt-1">
                    <Text className="text-[10px] text-gray-500">  </Text>
                    <Switch
                      value={invoices.showInBill.final_amount}
                      onValueChange={(value) => setInvoices(prev => ({
                        ...prev,
                        showInBill: { ...prev.showInBill, final_amount: value }
                      }))}
                      trackColor={{ false: "red", true: "green" }}
                    />
                  </View>
                </View>
              </View>
            </View>

            <View className="mb-4">
              <SelectInput
                label="Item"
                value={invoices?.item}
                placeholder="Select Item"
                data={[]}
                onSelect={(value) =>
                  handleInvoiceChange({ name: "item", value })
                }
              />
            </View>

            {/* Size with Bill Toggle */}
            <View className="mb-4">
              <InputBox
                name="size"
                label="Size"
                value={invoices.size}
                onChange={handleInvoiceChange}
                placeholder="e.g., 7, 8.5, Medium"
              />
              <View className="flex flex-row items-center justify-between mt-1">
                <Text className="text-xs text-gray-500">Item dimensions/size</Text>
                <Switch
                  value={invoices.showSizeInBill}
                  onValueChange={(value) => setInvoices(prev => ({ ...prev, showSizeInBill: value }))}
                  trackColor={{ false: "red", true: "green" }}
                />
              </View>
            </View>

            {/* Remarks with Bill Toggle */}
            <View className="mb-4">
              <InputBox
                name="remark"
                label="Remarks"
                multiLine={true}
                value={invoices.remark}
                onChange={handleInvoiceChange}
                placeholder="Additional notes..."
              />
              <View className="flex flex-row items-center justify-between mt-1">
                <Text className="text-xs text-gray-500">Show in final bill</Text>
                <Switch
                  value={invoices.showCommentInBill}
                  onValueChange={(value) => setInvoices(prev => ({ ...prev, showCommentInBill: value }))}
                  trackColor={{ false: "red", true: "green" }}
                />
              </View>
            </View>

            {/* Calculation Summary */}
            <View className="mb-6 bg-gray-50 p-4 rounded-lg">
              <Text className="text-base font-semibold mb-3">Calculation Summary</Text>

              {/* Weight Calculations */}
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-600 mb-2">Weight Details:</Text>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-gray-500">Gross Weight:</Text>
                  <Text className="text-sm">{parseFloat(invoices.weight).toFixed(2)} g</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-gray-500">Less Weight:</Text>
                  <Text className="text-sm">- {parseFloat(invoices.less_weight).toFixed(2)} g</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm font-medium">Net Weight:</Text>
                  <Text className="text-sm font-medium">{parseFloat(invoices.net_weight).toFixed(2)} g</Text>
                </View>
              </View>

              {/* Fine Weight Calculations */}
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-600 mb-2">Fine Weight Calculation:</Text>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-gray-500">Touch:</Text>
                  <Text className="text-sm">{parseFloat(invoices.tounch).toFixed(2)}%</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-gray-500">Wastage:</Text>
                  <Text className="text-sm">{parseFloat(invoices.wastage).toFixed(2)}%</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-gray-500">Total Percentage:</Text>
                  <Text className="text-sm">{(parseFloat(invoices.tounch) + parseFloat(invoices.wastage)).toFixed(2)}%</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm font-medium">Fine Weight:</Text>
                  <Text className="text-sm font-medium">{parseFloat(invoices.fine_weight).toFixed(3)} g</Text>
                </View>
              </View>

              {/* Value Calculations */}
              <View className="mb-3">
                <Text className="text-sm font-medium text-gray-600 mb-2">Value Calculation:</Text>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-gray-500">Rate:</Text>
                  <Text className="text-sm">₹{parseFloat(isSelectRate ? invoices?.rate?.price : invoices?.rate).toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-gray-500">Cutting Status:</Text>
                  <Text className="text-sm">{invoices.cutting_enabled ? "ON" : "OFF"}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-gray-500">Metal Value:</Text>
                  <Text className="text-sm">
                    {invoices.cutting_enabled ? (
                      `₹${parseFloat(invoices.metal_value).toFixed(2)} (${parseFloat(invoices.fine_weight).toFixed(3)}g × ₹${parseFloat(isSelectRate ? invoices?.rate?.price : invoices?.rate).toFixed(2)})`
                    ) : (
                      "₹0.00 (Cutting OFF)"
                    )}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-gray-500">Making Charges ({invoices.making_type.label}):</Text>
                  <Text className="text-sm">₹{parseFloat(invoices.making_charge).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-gray-500">Tax ({invoices.tax}%):</Text>
                  <Text className="text-sm">₹{((parseFloat(invoices.metal_value) + parseFloat(invoices.making_charge)) * parseFloat(invoices.tax) / 100).toFixed(2)}</Text>
                </View>
              </View>

              {/* Total */}
              <View className="pt-2 border-t border-gray-200">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-gray-500">Metal Value:</Text>
                  <Text className="text-sm">₹{parseFloat(invoices.metal_value).toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-gray-500">Making Amount:</Text>
                  <Text className="text-sm">₹{parseFloat(invoices.making_amount).toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-gray-500">GST Amount:</Text>
                  <Text className="text-sm">₹{parseFloat(invoices.tax_amount).toFixed(2)}</Text>
                </View>
                <View className="flex-row justify-between pt-2 border-t border-gray-200">
                  <Text className="text-base font-semibold">Total Amount:</Text>
                  <Text className="text-base font-semibold">₹{calculateTotal()}</Text>
                </View>
              </View>
            </View>

            {/* Add Product Button - Centered */}
            <View className="mb-4 flex items-center justify-center">
              <View style={{ width: '50%' }}>
                <CommonButton
                  title="Add Product"
                  onPress={() => {
                    // Create new product object from current form values
                    const newProduct = {
                      name: invoices.hsn_id?.label || "New Item",
                      size: invoices.size || "-",
                      product_id: Date.now().toString(),
                      [isPurchase ? "purchase" : "sale"]: {
                        rate: isSelectRate ? invoices.rate?.price : invoices.rate,
                        gross_weight: invoices.weight,
                        net_weight: invoices.net_weight,
                        tounch: invoices.tounch,
                        wastage: invoices.wastage,
                        fine_weight: invoices.fine_weight,
                        net_price: invoices.final_amount
                      }
                    };

                    const updatedInvoices = {
                      ...invoices,
                      selectedProduct: [...(invoices.selectedProduct || []), newProduct],
                      totalPrice: (parseFloat(invoices.totalPrice || 0) + parseFloat(invoices.final_amount || 0)).toString()
                    };

                    setInvoices(updatedInvoices);

                    // Navigate to ItemsForInvoice with the updated state
                    navigation.navigate('ItemsForInvoice', {
                      formValue: updatedInvoices,
                      setFormValue: setInvoices,
                      isPurchase,
                      handleInputChange: handleInvoiceChange,
                      isFromORInvoice: true  // Add this flag
                    });
                  }}
                  isFilled={true}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Buttons */}
        <View className="px-4 py-2 bg-white border-t border-gray-200">
          <View className="flex-row">
            <View className="flex-1">
              <CommonButton
                title={isFromProductList ? "Add Product" : "Submit Invoice"}
                onPress={isFromProductList ? handleFormSubmit : handleSubmit}
                isFilled={true}
                loading={loading}
              />
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Reset Form Confirmation Modal */}
      <Modal visible={showResetConfirm} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-4 rounded-lg w-[80%] max-w-[300px]">
            <Text className="text-lg font-medium mb-3">Reset Form</Text>
            <Text className="text-base mb-4">Are you sure you want to reset all form values?</Text>
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={() => setShowResetConfirm(false)}
                className="px-4 py-2"
              >
                <Text className="text-blue-500">CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowResetConfirm(false);
                  setIsNavigating(true);
                  navigation.goBack();
                }}
                className="px-4 py-2"
              >
                <Text className="text-blue-500">RESET</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Save Form Confirmation Modal */}
      <Modal visible={showSaveConfirm} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-4 rounded-lg w-[80%] max-w-[300px]">
            <Text className="text-lg font-medium mb-3">Form Data Saved</Text>
            <Text className="text-base mb-4">Your data has been saved. Do you want to return to the product list?</Text>
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={() => setShowSaveConfirm(false)}
                className="px-4 py-2"
              >
                <Text className="text-blue-500">STAY ON FORM</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowSaveConfirm(false);
                  setIsNavigating(true);
                  if (invoiceHandler?.onSubmit) {
                    invoiceHandler.onSubmit();
                  } else {
                    navigation.goBack();
                  }
                }}
                className="px-4 py-2"
              >
                <Text className="text-blue-500">BACK TO LIST</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Fragment>
  );
};

// Export the ORInvoiceForm as default
export default ORInvoiceForm;