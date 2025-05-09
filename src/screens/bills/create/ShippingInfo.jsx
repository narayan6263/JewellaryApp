import React, { useEffect, useState } from 'react'
import SectionHeader from '@/src/components/common/SectionHeader'
import { View } from 'react-native'
import CommonButton from '@/src/components/common/buttons/CommonButton'
import InputBox from '@/src/components/common/InputBox'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCitiesList, fetchStatesList } from '@/src/redux/actions/user.action'
import SelectInput from '@/src/components/common/SelectInput'

const ShippingInfo = ({ navigation, route }) => {
    const { goBack } = navigation
    const dispatch = useDispatch()
    const [info, setInfo] = useState({})
    const { statesList, cityList } = useSelector(state => state.userSlices)

    const handleInfoChange = ({ name, value }) => {
        setInfo({ ...info, [name]: value })
    }

    useEffect(() => {
        if (info?.state) {
            dispatch(fetchCitiesList(info?.state?.value))
        } else {
            dispatch(fetchStatesList())
        }
    }, [dispatch, info])

    return (
        <View className="bg-white min-h-screen">
            <SectionHeader title='Shipping Information' navigation={navigation} />
            <View className="px-3 py-4">
                <View className="mb-4">
                    <InputBox name="name" label="Full Name" />
                </View>
                <View className="mb-4">
                    <InputBox name="address1" label="Address Line 1" />
                </View>
                <View className="mb-3">
                    <InputBox name="address2" label="Address Line 2" />
                </View>

                {/* state & city */}
                <View className="flex mb-3 flex-row">
                    <View className="w-1/2 pr-1">
                        <SelectInput
                            label="State"
                            value={info?.state}
                            placeholder="Select State"
                            data={statesList}
                            onSelect={(value) => handleInfoChange({ name: "state", value })}
                        />
                    </View>
                    <View className="w-1/2 pl-1">
                        <SelectInput
                            label="City"
                            value={info?.city}
                            placeholder="Select City"
                            data={cityList}
                            onSelect={(value) => handleInfoChange({ name: "city", value })}
                        />
                    </View>
                </View>

                {/* Buttons */}
                <View className="flex-row pt-1 flex w-full justify-center">
                    <CommonButton isFilled={false} title='Close' onPress={goBack} />
                    <View className="px-3"></View>
                    <CommonButton isFilled={false} title={"OK"} />
                </View>
            </View>
        </View>
    )
}

export default ShippingInfo
