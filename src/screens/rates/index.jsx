import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import InputBox from "../../components/common/InputBox";
import React, { Fragment, useEffect, useState } from "react";
import SectionHeader from "../../components/common/SectionHeader";
import CommonButton from "../../components/common/buttons/CommonButton";
import {
  deleteGroupVariation,
  fetchProductGroups,
  manageProductGroups,
} from "@/src/redux/actions/product.action";
import NoData from "@/src/components/common/NoData";
import AntDesign from "@expo/vector-icons/AntDesign";
import KeyboardHanlder from "@/src/components/common/KeyboardHanlder";

const MetalRates = ({ navigation }) => {
  const dispatch = useDispatch();
  const [rates, setRates] = useState([]);
  const [deleteVariant, setDeleteVariantData] = useState(null);
  const { productGroups, loading } = useSelector(
    (state) => state.productSlices
  );

  // Handle rate changes
  const handleRatesChange = (event, metalId) => {
    const { name, value } = event;
    setRates((prevRates) =>
      prevRates.map((rate) =>
        rate.metal_id === metalId ? { ...rate, [name]: value } : rate
      )
    );
  };

  // Handle variant changes
  const handleVariantChange = (metal_id, index, field, value) => {
    setRates((prevRates) =>
      prevRates.map((rate) => {
        if (rate.metal_id === metal_id) {
          const updatedVariation = [...(rate.variation_data || [])];
          updatedVariation[index] = {
            ...updatedVariation[index],
            [field]: value,
          };
          return { ...rate, variation_data: updatedVariation };
        }
        return rate;
      })
    );
  };

  // Add a new variant
  const addVariant = (metal_id) => {
    setRates((prevRates) =>
      prevRates.map((rate) => {
        if (rate.metal_id === metal_id) {
          return {
            ...rate,
            variation_data: [
              ...(rate.variation_data || []),
              { name: "", price: "" },
            ],
          };
        }
        return rate;
      })
    );
  };

  // Remove a variant
  const removeVariant = (metal_id, index, variant_id) => {
    if (variant_id != null) {
      setDeleteVariantData(variant_id);
      dispatch(
        deleteGroupVariation({
          variant_id,
          callback: () => setDeleteVariantData(null),
        })
      );
    } else {
      setRates((prevRates) =>
        prevRates.map((rate) => {
          if (rate.metal_id === metal_id) {
            const updatedVariation = (rate.variation_data || []).filter(
              (_, i) => i !== index
            );
            return { ...rate, variation_data: updatedVariation };
          }
          return rate;
        })
      );
    }
  };

  // Submit data
  const handleSubmit = () => {
    dispatch(
      manageProductGroups({
        payload: rates,
        isBulk: true,
        isUpdate: true,
        callback: () => {
          setRates([]);
          navigation.goBack();
        },
      })
    );
  };

  // Set rates from productGroups API response
  useEffect(() => {
    if (productGroups) {
      const data = productGroups.map((item) => ({
        price: item.price || "",
        metal_id: item.id,
        label: item.name,
        variation_data: (item.variation_data || []).map((variant) => ({
          name: variant.name,
          price: variant.price,
          varient_id: variant.id,
        })), // Ensure variation_data is an array
      }));
      setRates(data);
    }
  }, [productGroups]);

  // Fetch product groups on mount
  useEffect(() => {
    dispatch(fetchProductGroups());
  }, [dispatch]);

  return (
    <Fragment>
      <SectionHeader title="Metal Rates" navigation={navigation} />

      <KeyboardHanlder>
        {rates.length > 0 ? (
          <View className="py-1 space-y-2.5">
            <View className="flex divide-y divide-gray-4 space-y-4 flex-wrap">
              {rates.map((item) => (
                <View key={item.metal_id} className="px-4 pt-3">
                  <View className="flex justify-between mb-2.5 flex-row items-center w-full">
                    <Text className="uppercase tracking-wider font-semibold">
                      {item.label}
                    </Text>
                    <TouchableOpacity
                      onPress={() => addVariant(item.metal_id)}
                      className="ml-1.5 flex flex-row items-center gap-1.5"
                    >
                      <AntDesign
                        name="plus"
                        className="bg-primary text-white p-1 rounded-full"
                        size={13}
                      />
                      <Text>Add Variant</Text>
                    </TouchableOpacity>
                  </View>
                  <InputBox
                    name="price"
                    required={true}
                    value={item.price}
                    onChange={(event) =>
                      handleRatesChange(event, item.metal_id)
                    }
                    keyboardType="numeric"
                  />

                  {/* Render Variations */}
                  <View className="flex pt-4 space-y-3">
                    {item.variation_data.map((variant, index) => {
                      const isLoading =
                        deleteVariant != null &&
                        variant?.varient_id == deleteVariant &&
                        loading;
                      return (
                        <View
                          key={index}
                          className="flex items-center flex-row"
                        >
                          <View className="w-2/5">
                            <InputBox
                              name="name"
                              required={true}
                              placeholder="Variant Name"
                              value={variant.name}
                              onChange={({ value }) =>
                                handleVariantChange(
                                  item.metal_id,
                                  index,
                                  "name",
                                  value
                                )
                              }
                            />
                          </View>
                          <View className="w-2/5 flex flex-row px-2">
                            <InputBox
                              name="price"
                              required={true}
                              placeholder="Price"
                              value={variant.price}
                              onChange={({ value }) =>
                                handleVariantChange(
                                  item.metal_id,
                                  index,
                                  "price",
                                  value
                                )
                              }
                              keyboardType="numeric"
                            />
                          </View>
                          <TouchableOpacity
                            disabled={isLoading}
                            onPress={() =>
                              removeVariant(
                                item.metal_id,
                                index,
                                variant?.varient_id || null
                              )
                            }
                            className="w-1/6 ml-auto py-2.5 rounded-md bg-red-500 flex justify-center items-center"
                          >
                            {isLoading ? (
                              <ActivityIndicator size="small" color="white" />
                            ) : (
                              <AntDesign
                                name="delete"
                                size={20}
                                color="white"
                              />
                            )}
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>

            {/* Submit Button */}
            <View className="px-4 border-t border-gray-4 pt-3">
              <CommonButton
                title="Update Metal Price"
                loading={deleteVariant == null && loading}
                onPress={handleSubmit}
              />
            </View>
          </View>
        ) : (
          <NoData title="Metals" />
        )}
      </KeyboardHanlder>
    </Fragment>
  );
};

export default MetalRates;
