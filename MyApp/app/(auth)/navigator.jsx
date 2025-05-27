import { View, Text ,Image} from 'react-native'
import React from 'react'
import {Redirect,router} from 'expo-router'
import driverImage from "../../assets/images/amb-driver.jpg"
import CustomButton from '../../components/CustomButton'

const navigator = () => {
  return (
    <View className="h-full  items-center justify-center flex-1">
        <CustomButton title="Driver Login" containerStyle="bg-red-600 w-[50%]" textStyle="text-2xl font-bold text-white"
        handlePress={()=>{router.push('/sign-in')}} />
        <CustomButton title="Admin Login" containerStyle="bg-blue-600 w-[50%] mt-10" textStyle="text-2xl font-bold text-white" 
        handlePress={()=>{router.push('/admin-signin')}}/>

    </View>
  )
}

export default navigator