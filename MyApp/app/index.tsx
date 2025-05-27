import { SafeAreaView, Text, View,ScrollView,Image } from 'react-native'
import React from 'react'
import { Link, Redirect,router } from 'expo-router'
import ambulance from "../assets/images/Ambulace-signin.jpg"
import CustomButton from "../components/CustomButton.jsx"


const Index = () => {
  return (
   <SafeAreaView className='bg-white h-full'>
    <ScrollView contentContainerStyle={{height:'100%'}}>
        <View className='h-full justify-center items-center'>
          <Text className=' font-bold text-2xl'>My Ambulance</Text>
          
          <Image source={ambulance} className='w-[80%] h-[50%]' 
          resizeMode='contain' ></Image>
        <View className='w-[80%] mt-10'>
        <CustomButton title="SigIn" handlePress={()=>{router.push('/navigator')}} containerStyle="w-full mt-8 bg-red-600"
          textStyle="font-bold text-xl text-white" />

        </View>
          
          
        </View>
    </ScrollView>
   </SafeAreaView>
  )
}


export default Index
