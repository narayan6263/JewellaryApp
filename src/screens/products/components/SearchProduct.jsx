import React, { useEffect, useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import InputBox from "@/src/components/common/InputBox";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { fetchProductList } from "@/src/redux/actions/product.action";

const SelectProduct = ({
  productValue,
  setProductValue,
  handleProductDetail,
}) => {
  const dispatch = useDispatch();
  const [showDropdown, setShowDropdown] = useState(false);
  const { products = {} } = useSelector((state) => state.productSlices || {});

  // handle product selection
  const handleProduct = (product) => {
    handleProductDetail(product);
    setShowDropdown(false);
  };

  // handle filter products
  const filteredProducts = products?.data?.filter((item) =>
    item.name.toLowerCase().includes(productValue?.name?.toLowerCase())
  );

  useEffect(() => {
    dispatch(fetchProductList());
  }, [dispatch]);

  return (
    <View className="relative mb-5">
      {/* product name input */}
      <View style={styles.inputWrapper}>
        <InputBox
          name="name"
          label="Product Name"
          value={productValue?.name || ""}
          onChange={({ value, name }) => {
            setShowDropdown(value?.length > 0);
            setProductValue({ ...productValue, name: value || "" });
          }}
        />
      </View>

      {/* Dropdown Modal */}
      {showDropdown && (
        <View style={styles.dropdown}>
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) =>
              item.id?.toString() || Math.random().toString()
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleProduct(item)}
                className="px-4 flex flex-row gap-2 items-center py-2"
              >
                <MaterialIcons
                  name="image"
                  classNamem="m-auto"
                  color="lightgray"
                  size={27}
                />
                <Text style={styles.productName}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  relative: { position: "relative" },
  title: { fontSize: 16, fontWeight: "500" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: { flex: 1, paddingVertical: 6 },
  iconWrapper: { flexDirection: "row", gap: 10 },
  dropdown: {
    position: "absolute",
    top: 63,
    width: "100%",
    backgroundColor: "#fff",
    maxHeight: 400,
    elevation: 5,
    zIndex: 50,
  },
  productName: { fontSize: 16, fontWeight: "400" },
});

export default SelectProduct;
