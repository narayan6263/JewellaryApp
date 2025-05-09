import React, { Fragment } from 'react'
import { Text, View } from 'react-native'
import SectionHeader from '@/src/components/common/SectionHeader'
import CommonButton from '@/src/components/common/buttons/CommonButton'

const SignatureScreen = ({ navigation }) => {
    return (
        <Fragment>
            <SectionHeader title="Set Signature" navigation={navigation} />

            <View className="px-5 py-4">
                <View className="mb-3">
                    <Text className=" text-gray-6 tracking-wider pb-2 text-sm font-medium">
                        Signature
                    </Text>
                    <View className="border p-5 py-20 flex justify-center items-center rounded-lg border-gray-4">

                    </View>
                </View>
                <CommonButton title="Save" />
            </View>
        </Fragment>
    )
}

export default SignatureScreen
