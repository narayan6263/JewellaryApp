import Header from "../create/Header";
import Preview from "../create/Preview";
import InvoiceForm from "@/src/components/InvoiceForm";
import ShowToast from "@/src/components/common/ShowToast";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, Fragment, useState } from "react";
import { Alert, BackHandler, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";

const CreateLoanInvoice = ({ navigation, route }) => {
  const totlalStep = 4;
  const [activeStep, setActiveStep] = useState(0);
  const [formValue, setFormValue] = useState({ 
    item: [{}],
    user_contact_id: null,
    costumer_name: ""
  });

  // handle formchange
  const handleInputChange = ({ name, value }) => {
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handle next validation based on fields
  const handleNext = () => {
    switch (activeStep) {
      // if contact selected
      case 0:
        if (formValue?.user_contact_id) {
          setActiveStep(activeStep + 1);
        } else {
          ShowToast("Please select a contact first");
        }
        break;

      // if item not selected
      case 1:
        if (formValue?.item?.length > 0) {
          setActiveStep(activeStep + 1);
        } else {
          ShowToast("Please select item");
        }
        break;

      default:
        setActiveStep(activeStep + 1);
    }
  };
  const handleBack = () => setActiveStep(activeStep - 1);

  // get title & content based on step
  const getTitleAndContent = () => {
    switch (activeStep) {
      case 0:
        return {
          name: "Contact Details",
          content: (
            <Header
              formValue={formValue}
              setFormValue={setFormValue}
              handleInputChange={handleInputChange}
              navigation={navigation}
              invoiceType="loan"
            />
          ),
        };
      case 1:
        return {
          name: "Items",
          content: (
            <InvoiceForm
              route={route}
              data={formValue}
              handleNext={() => navigation.goBack()}
              setData={setFormValue}
              handleInputChange={handleInputChange}
              navigation={navigation}
            />
          ),
        };
      case 2:
        return {
          name: "Loan Details",
          content: (
            <View className="p-4">
              <Text>Loan Terms Configuration</Text>
              {/* Add your loan-specific form fields here */}
            </View>
          )
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
        return {
          name: "Loading...",
          content: <ActivityIndicator />
        };
    }
  };

  const data = getTitleAndContent();

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

      // Add event listener for back button press on Android
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      // Clean up the event listener when the component is unfocused
      return () => backHandler.remove();
    }, [])
  );

  return (
    <Fragment>
      {/* Header */}
      <View className="px-5 py-3 flex flex-row justify-between bg-primary items-center">
        <Text className="text-lg text-white">{data?.name}</Text>

        {/* next & back */}
        <View className="flex-row items-center space-x-2">
          {activeStep != 0 && (
            <TouchableOpacity onPress={handleBack} activeOpacity={0.6}>
              <Ionicons name="arrow-back-circle" size={30} color="white" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleNext}
            disabled={totlalStep - 1 == activeStep}
            activeOpacity={0.6}
          >
            <Ionicons
              name="arrow-forward-circle"
              size={30}
              color={totlalStep - 1 == activeStep ? "lightgray" : "white"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View className="h-full">{data.content}</View>
    </Fragment>
  );
};

export default CreateLoanInvoice;
