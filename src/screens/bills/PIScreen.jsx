import CreateInvoice from "./create";
import React, { Fragment } from "react";

const PurchaseInvoice = ({ navigation }) => {
  return (
    <Fragment>
      <CreateInvoice navigation={navigation} type="purchase" />
    </Fragment>
  );
};

export default PurchaseInvoice;
