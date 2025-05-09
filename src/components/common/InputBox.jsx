import React, { useState } from "react";
import { Text, TextInput, View, TouchableOpacity } from "react-native";

const InputBox = ({
  name,
  label,
  icon,
  readOnly,
  multiLine = false,
  value,
  error,
  placeholder,
  required,
  onChange,
  customBorder,
  ...other
}) => {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelText, setLabelText] = useState(label);

  const handleLabelPress = () => {
    if (!readOnly) {
      setIsEditingLabel(true);
    }
  };

  const handleLabelChange = (text) => {
    setLabelText(text);
    // Notify parent of label change
    if (onChange) {
      onChange({ name: `${name}_label`, value: text });
    }
  };

  const handleLabelBlur = () => {
    setIsEditingLabel(false);
  };

  const handleInputChange = (newValue) => {
    // Call the original onChange
    if (onChange) {
      onChange({ value: newValue, name });
    }
  };

  return (
    <View>
      {label && (
        <TouchableOpacity onPress={handleLabelPress} activeOpacity={0.7}>
          <View className="flex flex-row items-center gap-1 pb-1 pl-0.5">
            {isEditingLabel ? (
              <TextInput
                className="text-gray-8 text-xs tracking-wider"
                value={labelText}
                onChangeText={handleLabelChange}
                onBlur={handleLabelBlur}
                autoFocus
              />
            ) : (
              <>
                <Text className="text-gray-8 text-xs tracking-wider">{labelText}</Text>
                {required && <Text className="text-red-600 text-xs">*</Text>}
              </>
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* input field */}
      <View
        className={`border ${
          customBorder ? "border-red-500 border-2" :
          error
            ? "border-red-600"
            : readOnly
            ? "border-gray-3"
            : "border-gray-5"
        } items-center flex flex-row justify-between rounded-lg ${
          icon && "pr-4"
        }`}
      >
        <TextInput
          className={`p-3 bg-transparent text-xs rounded-lg ${
            icon ? "w-[85%] pr-0" : "w-full"
          }`}
          readOnly={readOnly}
          multiline={multiLine}
          placeholder={placeholder || labelText}
          value={typeof value == "number" ? String(value) : value}
          onChangeText={handleInputChange}
          {...other}
        />
        {icon}
      </View>

      {/* error */}
      {error && (
        <Text className="pl-1 pt-1 text-[10px] text-red-600 tracking-wide font-medium">
          {error}
        </Text>
      )}
    </View>
  );
};

export default InputBox;




// import React, { useState, useEffect } from "react";
// import { Text, TextInput, View, TouchableOpacity } from "react-native";
// import { useDispatch, useSelector } from "react-redux";
// import { addActivityLog } from "@/src/redux/slices/activityLogSlice";

// const InputBox = ({
//   name,
//   label,
//   icon,
//   readOnly,
//   multiLine = false,
//   value,
//   error,
//   placeholder,
//   required,
//   onChange,
//   customBorder,
//   screenName = "Unknown Screen", // Default screen name
//   ...other
// }) => {
//   const [isEditingLabel, setIsEditingLabel] = useState(false);
//   const [labelText, setLabelText] = useState(label);
//   const [previousValue, setPreviousValue] = useState(value);
//   const dispatch = useDispatch();
//   const user = useSelector(state => state.userSlices?.profileData?.name || 'Unknown User');

//   // Track input changes
//   useEffect(() => {
//     // Update previous value when value prop changes from outside
//     setPreviousValue(value);
//   }, [value]);

//   const handleLabelPress = () => {
//     if (!readOnly) {
//       setIsEditingLabel(true);
//     }
//   };

//   const handleLabelChange = (text) => {
//     setLabelText(text);
//     // Notify parent of label change
//     if (onChange) {
//       onChange({ name: `${name}_label`, value: text });
//     }
//   };

//   const handleLabelBlur = () => {
//     setIsEditingLabel(false);
//   };

//   const handleInputChange = (newValue) => {
//     // Only track if there's actually a change and not in read-only mode
//     if (!readOnly && newValue !== previousValue) {
//       console.log('Tracking Input Change:', {
//         screen: screenName,
//         field: label || name,
//         oldValue: previousValue,
//         newValue
//       });

//       // Log the change
//       dispatch(addActivityLog({
//         action: 'INPUT_CHANGE',
//         description: `Changed ${label || name} in ${screenName}`,
//         details: {
//           screen: screenName,
//           field: label || name,
//           oldValue: previousValue || '',
//           newValue: newValue || '',
//           timestamp: new Date().toISOString()
//         },
//         user: user
//       }));
      
//       setPreviousValue(newValue);
//     }

//     // Call the original onChange
//     if (onChange) {
//       onChange({ value: newValue, name });
//     }
//   };

//   return (
//     <View>
//       {label && (
//         <TouchableOpacity onPress={handleLabelPress} activeOpacity={0.7}>
//           <View className="flex flex-row items-center gap-1 pb-1 pl-0.5">
//             {isEditingLabel ? (
//               <TextInput
//                 className="text-gray-8 text-xs tracking-wider"
//                 value={labelText}
//                 onChangeText={handleLabelChange}
//                 onBlur={handleLabelBlur}
//                 autoFocus
//               />
//             ) : (
//               <>
//                 <Text className="text-gray-8 text-xs tracking-wider">{labelText}</Text>
//                 {required && <Text className="text-red-600 text-xs">*</Text>}
//               </>
//             )}
//           </View>
//         </TouchableOpacity>
//       )}

//       {/* input field */}
//       <View
//         className={`border ${
//           customBorder ? "border-red-500 border-2" :
//           error
//             ? "border-red-600"
//             : readOnly
//             ? "border-gray-3"
//             : "border-gray-5"
//         } items-center flex flex-row justify-between rounded-lg ${
//           icon && "pr-4"
//         }`}
//       >
//         <TextInput
//           className={`p-3 bg-transparent text-xs rounded-lg ${
//             icon ? "w-[85%] pr-0" : "w-full"
//           }`}
//           readOnly={readOnly}
//           multiline={multiLine}
//           placeholder={placeholder || labelText}
//           value={typeof value == "number" ? String(value) : value}
//           onChangeText={handleInputChange}
//           {...other}
//         />
//         {icon}
//       </View>

//       {/* error */}
//       {error && (
//         <Text className="pl-1 pt-1 text-[10px] text-red-600 tracking-wide font-medium">
//           {error}
//         </Text>
//       )}
//     </View>
//   );
// };

// export default InputBox;
