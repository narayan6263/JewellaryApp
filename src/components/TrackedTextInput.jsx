import React, { useState, useEffect } from 'react';
import { TextInput } from 'react-native';
import { useTrackInput } from '../hooks/useTrackInput';

const TrackedTextInput = ({ 
    screenName,
    fieldName,
    value,
    onChangeText,
    ...props 
}) => {
    const [previousValue, setPreviousValue] = useState(value);
    const trackInputChange = useTrackInput(screenName, fieldName);

    useEffect(() => {
        // Update previous value when value prop changes from outside
        setPreviousValue(value);
    }, [value]);

    const handleChangeText = (newValue) => {
        console.log('Input Change:', {
            screen: screenName,
            field: fieldName,
            previousValue,
            newValue
        });

        // Only track if there's actually a change
        if (newValue !== previousValue) {
            trackInputChange(newValue, previousValue);
            setPreviousValue(newValue);
        }

        // Call the original onChangeText
        if (onChangeText) {
            onChangeText(newValue);
        }
    };

    return (
        <TextInput
            value={value}
            onChangeText={handleChangeText}
            {...props}
        />
    );
};

export default TrackedTextInput; 