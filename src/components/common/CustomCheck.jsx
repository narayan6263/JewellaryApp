import React from 'react'
import { TouchableOpacity } from 'react-native'
import AntDesign from "@expo/vector-icons/AntDesign";

const CustomCheck = (props) => {
    const { onChange, checked } = props
    return (
        <TouchableOpacity
            activeOpacity={0.6}
            className="flex flex-row gap-1.5 items-center justify-center"
            onPress={onChange}
        >
            {checked ?
                <AntDesign name="checksquare" size={24} className="text-primary" />
                :
                <AntDesign name="checksquareo" size={24} color="gray" />
            }
        </TouchableOpacity>
    )
}

export default CustomCheck
