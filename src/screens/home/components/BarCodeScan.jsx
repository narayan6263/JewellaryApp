import React, { Fragment } from "react";
import { TouchableOpacity, } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const BarCodeScan = () => {
    return (
        <Fragment>
            <TouchableOpacity activeOpacity={0.6} className="ml-5">
                <MaterialCommunityIcons name="barcode-scan" color="white" size={25} />
            </TouchableOpacity>
        </Fragment>
    );
};

export default BarCodeScan;
