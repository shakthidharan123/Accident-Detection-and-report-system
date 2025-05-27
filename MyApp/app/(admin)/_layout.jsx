import { View, Text,Image } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import {Tabs} from 'expo-router'
import im1 from "../../assets/icons/home.png";
import bm from "../../assets/icons/plus.png";
import prof from "../../assets/icons/profile.png";


const TabIcon = ({icon,color,name,focus})=>{
    return(
        <View className="items-center justify-center gap-2">
            <Image  source={icon} tintColor={color} className="w-6 h-6" resizeMode='contain'/>
            {/* <Text className={`${focus ? ' font-bold' : ' font-normal'} text-xs` } >{name}</Text> */}
            
        </View>
    )
}
const AdminLayout = () => {
  return (
    <>
    <Tabs
    screenOptions={{
        headerShown: false, // ✅ Hides header for all tabs
        
    }}>
        <Tabs.Screen
        name="Users"
        options={{
            title:"Users",
            headerShown:false,
            tabBarIcon:({color,focused})=>(
                <TabIcon icon={im1} color={color} name={"Users"}  focus={focused} />
                
            )
        }}
        />
        <Tabs.Screen
        name="AddUsers"
        options={{
            title:"AddUsers",
            headerShown:false,
            tabBarIcon:({color,focused})=>(
                <TabIcon icon={bm}  color={color} name="AddUsers"  focused={focused} />
                
            )
        }}
        />
        <Tabs.Screen
        name="Profile"
        options={{
            title:"Profile",
            headerShown:false,
            tabBarIcon:({color,focused})=>(
                <TabIcon icon={prof} color={color}  focused={focused} />
                
            )
        }}
        />
    </Tabs>
    </>
  )
}

export default AdminLayout