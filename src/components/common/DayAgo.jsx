import React from "react";
import moment from "moment";
import { Text } from "react-native";

const DayAgo = ({ date }) => {
  const calculateFullTimeAgo = (inputDate) => {
    const now = moment();
    const past = moment(inputDate);
    const duration = moment.duration(now.diff(past));

    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    let result = "";
    if (days > 0) result += `${days} day${days > 1 ? "s" : ""}, `;
    if (hours > 0) result += `${hours} hour${hours > 1 ? "s" : ""}, `;
    if (minutes > 0) result += `${minutes} min${minutes > 1 ? "s" : ""}, `;
    if (seconds > 0) result += `${seconds} second${seconds > 1 ? "s" : ""}`;

    return result.trim().replace(/,$/, "") + " ago";
  };

  return <Text>{calculateFullTimeAgo(date)}</Text>;
};

export default DayAgo;
