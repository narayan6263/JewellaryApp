import React from 'react'
import { Text, View } from 'react-native'
import BackButton from './buttons/BackButton'

const SectionHeader = ({ title, navigation }) => {
    const { goBack } = navigation
    return (
        <View className="px-3 py-5 flex flex-row bg-primary items-center">
            <BackButton onPress={() => goBack()} color="white" />
            <Text className="px-5 text-lg text-white">{title}</Text>
        </View>
    )
}

export default SectionHeader
