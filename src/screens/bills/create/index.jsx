import React, { useState, useCallback } from "react";
import { View } from "react-native";
import Header from "./Header";
import Items from "./Items";
import Extras from "./Extras";
import Preview from "./Preview";
import moment from "moment";
import { useDispatch } from "react-redux";
import ShowToast from "@/src/components/common/ShowToast";
import { useFocusEffect } from "@react-navigation/native";
import { addInvoice } from "@/src/redux/actions/invoice.action";
import { Alert, BackHandler, Text, TouchableOpacity, ActivityIndicator } from "react-native";

// for back and next button
const CommonButton = (props) => {
  const { onPress, title, loading } = props;
  return (
    <TouchableOpacity
      disabled={loading}
      activeOpacity={0.6}
      onPress={loading ? null : onPress}
      className={`rounded-sm bg-white px-3 py-1.5 `}
    >
      {loading ? (
        <ActivityIndicator color="white" size={20} className="text-center" />
      ) : (
        <Text className="text-[11px] uppercase text-center tracking-wider font-medium">
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const CreateInvoice = ({ navigation, route, type }) => {
  const totalStep = 4;
  const dispatch = useDispatch();
  const isPurchase = type == "purchase";
  const [activeStep, setActiveStep] = useState(0);
  const formattedDate = moment(new Date()).format("YYYY-MM-DD");

  const isLastStep = totalStep - 1 == activeStep;

  const [formValue, setFormValue] = useState({
    charges: [{}],
    payment_mode: "Cash",
    type: isPurchase ? 2 : 1,
    payment_date: formattedDate,
    tax: 0,
  });

  // handle formchange
  const handleInputChange = ({ name, value }) => {
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // get title & content based on step
  const getTitleAndContent = () => {
    switch (activeStep) {
      case 0:
        return {
          name: isPurchase ? "Seller Details" : "Buyer Details",
          content: (
            <Header
              formValue={formValue}
              setFormValue={setFormValue}
              handleInputChange={handleInputChange}
              navigation={navigation}
              invoiceType={type}
            />
          ),
        };
      case 1:
        return {
          name: "Items",
          content: (
            <Items
              route={route}
              formValue={formValue}
              setFormValue={setFormValue}
              handleInputChange={handleInputChange}
              navigation={navigation}
              isPurchase={Boolean(isPurchase)}
            />
          ),
        };
      case 2:
        return {
          name: "Extras",
          content: (
            <Extras
              formValue={formValue}
              setFormValue={setFormValue}
              navigation={navigation}
              isPurchase={isPurchase}
            />
          ),
        };
      case 3:
        return {
          name: "Preview",
          content: (
            <Preview
              formValue={formValue}
              navigation={navigation}
              isPurchase={isPurchase}
            />
          ),
        };
      default:
        return null;
    }
  };
  const data = getTitleAndContent();

  // handle next validation based on fields
  const handleNext = () => {
    switch (activeStep) {
      // if contact selected
      case 0:
        if (formValue?.user_contact_id) {
          setActiveStep(activeStep + 1);
        } else {
          ShowToast("Please select contact");
        }
        break;

      // if products has selected
      case 1:
        if (
          formValue?.selectedProduct &&
          formValue?.selectedProduct?.length > 0
        ) {
          setActiveStep(activeStep + 1);
        } else {
          ShowToast("Please select product");
        }
        break;

      default:
        setActiveStep(activeStep + 1);
        break;
    }
  };
  const handleBack = () => setActiveStep(activeStep - 1);

  // handle submit invoice
  const handleSubmit = (formData) => {
    const item = formData?.selectedProduct?.map((prod) => {
      const data = isPurchase ? prod.sale : prod.purchase;
      return {
        product_id: prod?.product_id || 0,
        hsn_id: prod?.hsn_id?.value || 0,
        tounch: data?.tounch || 0,
        wastage: data?.wastage || 0,
        gross_weight: prod?.gross_weight || 0,
        net_price: data?.net_price || 0,
        fine_weight: data?.fine_weight || 0,
        size: prod?.size || '',
        show_size_in_bill: data?.showSizeInBill || true,
      };
    });

    let data = new FormData();
    data.append("user_contact_id", formData?.user_contact_id);
    data.append("payment_mode", formData?.payment_mode);
    data.append("payment_date", formData?.payment_date);
    data.append("bill_total", formData?.totalPrice || 0);
    data.append("amount_paid", formData?.amount_paid || 0);
    data.append("tax", formData?.tax || 0);
    data.append("additional_charges", formData?.totalCharges || 0);
    data.append(
      "total",
      Number(formData?.totalPrice || 0) - Number(formData?.amount_paid || 0)
    );
    data.append("invoice_type", isPurchase ? "2" : "1");
    data.append("item", JSON.stringify(item));

    dispatch(
      addInvoice({
        payload: data,
        callback: () => {
          setFormValue({
            charges: [{}],
            payment_mode: "Cash",
            type: isPurchase ? 2 : 1,
            payment_date: formattedDate,
            tax: 0,
          });
          navigation.goBack();
        },
      })
    );
  };

  // take confirmation to go back
  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        Alert.alert(
          "Are you sure?",
          "Entered Bill details will be lost; do you really want to go back?",
          [
            {
              text: "Cancel",
              onPress: () => null,
              style: "cancel",
            },
            {
              text: "YES",
              onPress: () => {
                setActiveStep(0);
                navigation.goBack();
                setFormValue({ charges: [{}], payment_mode: "Cash" });
              },
            },
          ]
        );
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [])
  );

  return (
    <View>
      {/* Header */}
      <View className="px-4 py-3 flex flex-row justify-between bg-primary items-center">
        {/* Previous Button */}
        {activeStep != 0 && <CommonButton onPress={handleBack} title="Back" />}

        {/* Page title */}
        <Text className="text-white text-base tracking-wider">
          {data?.name}
        </Text>

        {/* Next Button */}
        <CommonButton
          onPress={isLastStep ? () => handleSubmit(formValue) : handleNext}
          title={isLastStep ? "Submit" : "Next"}
        />
      </View>

      {/* Content */}
      <View className="h-full">{data.content}</View>
    </View>
  );
};

export default CreateInvoice;
