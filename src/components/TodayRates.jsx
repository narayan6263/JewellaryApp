import { Text, View } from "react-native";
import React, { Fragment } from "react";
import { useDispatch } from "react-redux";

const TodayRates = () => {

  return (
    <Fragment>
      {/* today's rates */}
      <View className="flex border-b border-white flex-row">
        <View
          style={{ backgroundColor: "whitesmoke" }}
          className="flex items-center w-1/2 px-4 py-6"
        >
          <Text className="font-bold uppercase tracking-wider pb-0.5">
            Today&#39;s Rate{" "}
          </Text>
          <Text className="font-bold text-gray-7 uppercase">
            ( Rs.100 per/kg )
          </Text>
        </View>
        <View
          style={{ backgroundColor: "gold" }}
          className="flex items-center w-1/2 px-4 py-6"
        >
          <Text className="font-bold uppercase tracking-wider pb-0.5">
            Today&#39;s Rate{" "}
          </Text>
          <Text className="font-bold text-gray-7 uppercase">
            ( Rs.190 per/gm )
          </Text>
        </View>
      </View>
    </Fragment>
  );
};

export default TodayRates;
