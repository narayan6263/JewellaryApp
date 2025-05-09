  // Update the handleAddProduct function
  const handleAddProduct = () => {
    // Create new product object with all necessary fields
    const newProduct = {
      name: product.name || product.product_name,
      product_id: product.product_id || Date.now().toString(),
      huid: product.huid,
      hsn_id: product.hsn_id?.value,
      comment: product.comment,
      [invoiceHandler?.isPurchase ? "purchase" : "sale"]: {
        ...product[invoiceHandler?.isPurchase ? "purchase" : "sale"],
        showGrossWeightInBill: true,
        showLessWeightInBill: true,
        showNetWeightInBill: true,
        showWastageInBill: true,
        showTounchInBill: true,
        showFineWeightInBill: true,
        showPriceInBill: true,
        showMakingChargeInBill: true,
        showChargesInBill: true,
        showTaxInBill: true
      }
    };

    // Get existing products or initialize empty array
    const existingProducts = invoiceHandler?.formValue?.selectedProduct || [];
    
    // Calculate new total price including the new product
    const totalPrice = existingProducts.reduce(
      (acc, product) => {
        const type = invoiceHandler?.isPurchase ? "purchase" : "sale";
        return Number(acc) + Number(product?.[type]?.net_price || 0);
      },
      Number(product[invoiceHandler?.isPurchase ? "purchase" : "sale"]?.net_price || 0)
    );

    // Update form value with new product and total
    invoiceHandler?.setFormValue({
      ...invoiceHandler?.formValue,
      selectedProduct: [...existingProducts, newProduct],
      totalPrice: totalPrice.toString()
    });

    resetProduct();
    invoiceHandler?.onSubmit();
  }; 

  // ... existing code ...

  {/* Bill Preview Modal */}
  <Modal
    visible={showBill}
    animationType="slide"
    onRequestClose={() => setShowBill(false)}
    presentationStyle="pageSheet"
  >
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View className="flex-row justify-between items-center p-4 bg-primary">
        <TouchableOpacity onPress={() => setShowBill(false)}>
          <AntDesign name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-semibold">Product Bill</Text>
        <TouchableOpacity onPress={() => {/* TODO: Implement actual printing */}}>
          <AntDesign name="printer" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1 }}>
        <ProductBillPreview
          data={{
            name: product?.name,
            huid: product?.huid,
            hsn_id: product?.hsn_id?.value,
            type: product?.type,
            comment: product?.comment,
            phone: product?.customer?.phone || product?.customer?.contact,
            email: product?.customer?.email,
            address: product?.customer?.address,
            pincode: product?.customer?.pincode,
            state: product?.customer?.state,
            city: product?.customer?.city,
            role: product?.customer?.role,
          }}
          product={product}
          isPreview={true}
        />
      </ScrollView>
    </SafeAreaView>
  </Modal>

  // ... existing code ... 