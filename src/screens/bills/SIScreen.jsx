import CreateInvoice from "./create";
import React, { Fragment } from "react";

const SaleInvoice = ({ navigation, route }) => {
  return (
    <Fragment>
      <CreateInvoice navigation={navigation} route={route} type="sale" />
    </Fragment>
  );
};

export default SaleInvoice;
