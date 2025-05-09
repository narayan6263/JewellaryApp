import React, { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { currency } from "@/src/contants";
import { useDispatch, useSelector } from "react-redux";
import OverlayModal from "@/src/components/common/OverlayModal";
import { fetchProductList } from "@/src/redux/actions/product.action";
import OutlineInput from "../common/OutlineInput";

const AddItem = ({ onSubmit, selectedProduct, ...props }) => {
  const dispatch = useDispatch();
  const [params, setParams] = useState({});
  const [formValue, setFormValue] = useState({});
  const { products = {} } = useSelector((state) => state.productSlices);

  const newProducts = products?.data?.filter((product) => {
    return !selectedProduct?.some((item) => item.product_id == product.id);
  });

  const [modalState, setModalState] = useState({
    datePicker: false,
    dropdown: false,
  });

  // handle modal states
  const handleModalState = (name, value) => {
    setModalState((prevState) => ({ ...prevState, [name]: value }));
  };

  // handle product name
  const handleInputChange = (text) => {
    text.length > 0 && handleModalState("dropdown", true);
    setParams({ ...params, search: text });
  };

  // handle select product
  const selectProduct = (item) => {
    // Update search parameters
    setParams({
      ...params,
      search: item?.name || "",
    });

    // Safely access sale_product_data and calculate product_amount
    const saleRate = item?.sale_product_data?.[0]?.sale_rate || 0;

    // Calculate amount
    const amount = Number(saleRate || 0) * Number(formValue?.gross_weight || 0);

    // Update form values
    setFormValue({
      ...formValue,
      product_id: item?.id || "",
      product_name: item?.name || "",
      product_amount: saleRate,
      amount: amount,
    });

    // Close the dropdown modal
    handleModalState("dropdown", false);
  };

  // handle submit
  const handleSubmit = () => {
    if (
      formValue?.gross_weight > 0 &&
      formValue?.product_id &&
      formValue?.product_name
    ) {
      onSubmit(formValue);
      setFormValue({});
      setParams({});
      props.onClose();
    }
  };

  useEffect(() => {
    dispatch(
      fetchProductList({
        product_name: params?.search || "",
      })
    );
  }, [dispatch, params]);

  return (
    <OverlayModal {...props} onSubmit={handleSubmit} heading="Add Product">
      {/* product name */}
      <View className="relative mb-4">
        <Text className="text-base tracking-wide">Item name</Text>
        <View className="border-b border-gray-4 items-center flex flex-row justify-between">
          <TextInput
            className="px-1 w-[90%] pb-0 pt-1.5"
            value={params.search}
            onChangeText={handleInputChange}
            placeholder="Enter name"
          />
        </View>

        {/* Dropdown Modal */}
        {modalState?.dropdown && (
          <View className="shadow-md absolute w-full top-[60px] bg-gray-3 z-50 max-h-[400px]">
            <FlatList
              data={newProducts || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => selectProduct(item)}
                  className="p-3 w-full"
                >
                  <Text className="tracking-wider text-base">{item.name}</Text>
                  <Text className="text-gray-6 text-xs">
                    {currency}{" "}
                    {item?.purchase_product_data?.[0].purchase_net_price}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* gross weight */}
      <View className="">
        <OutlineInput
          name="gross_weight"
          placeholder="0"
          label="Gross Weight"
          value={formValue?.gross_weight}
          onChange={({ value, name }) =>
            setFormValue({
              ...formValue,
              amount:
                Number(formValue?.product_amount || 0) * Number(value || 0),
              [name]: value,
            })
          }
          keyboardType="numeric"
        />
      </View>
    </OverlayModal>
  );
};

export default AddItem;
