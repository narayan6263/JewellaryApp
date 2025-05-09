import React from 'react'
import { TouchableOpacity } from 'react-native';
import AntDesign from "@expo/vector-icons/AntDesign";

const SearchBtn = ({ onPress, size, color = 'white' }) => {
    return (
        <TouchableOpacity activeOpacity={0.6} onPress={onPress || null}>
            <AntDesign name="search1" color={color} size={size || 23} />
        </TouchableOpacity>
    )
}

export default SearchBtn
