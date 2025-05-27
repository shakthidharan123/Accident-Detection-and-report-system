import { View, Text,} from 'react-native'
import React, { useState } from 'react'
import { TextInput, Button } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import CustomButton from "../../components/CustomButton"
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
//import {college_ip,hostel_ip} from "@env"
import { router } from 'expo-router';
const Signin = () => {
    const { control, handleSubmit, formState: { errors } } = useForm();
    const [isSubmitting,setissubmitting] = useState(false);
    const homeip = "192.168.20.181"
    const collegeip = "10.5.7.210"
    const hostel_ip = "10.5.15.200"
    const onSubmit = (data)=>{
     // setIsSubmitting(true);

      console.log(data);
      axios.post(`http://${hostel_ip}:5000/admin/login`,data).then(async(res)=>{
        console.log(res.data);
        
        await AsyncStorage.setItem('token',res.data.token);
        
        
         
        
        router.replace("/(admin)/Users");
      }).catch((err)=>{
        console.log(err);
      })
    }
    
    
  return (
    
        <View className="flex-1 justify-center px-5">
          <Text className="text-2xl font-bold text-center mb-5">Admin LogIn</Text>
          
          <Controller
            control={control}
            name="username"
            rules={{ required: 'Username is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Username"
                mode="outlined"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className="mb-3 "
                theme={{ colors: { primary: 'black' } }}

              />
            )}
          />
          {errors.username && <Text className="text-red-500 text-sm mb-3">{errors.username.message}</Text>}
          
          <Controller
            control={control}
            name="password"
            rules={{ required: 'Password is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Password"
                mode="outlined"
                secureTextEntry
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className="mb-3"
                theme={{ colors: { primary: 'black' } }}

              />
            )}
          />
          {errors.password && <Text className="text-red-500 text-sm mb-3">{errors.password.message}</Text>}
          
          <CustomButton title="SignIn" textStyle="text-white" handlePress={handleSubmit(onSubmit)} containerStyle="mt-10 bg-red-600" isLoading={isSubmitting} />  
        </View>
      );
  
}

export default Signin