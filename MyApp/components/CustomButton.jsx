import { View, Text,TouchableOpacity } from 'react-native'
import React from 'react'

const CustomButton = ({title,handlePress,containerStyle,textStyle,isLoading}) => {
  return (
    <TouchableOpacity className={`min-h-20 justify-center items-center rounded-xl ${containerStyle} ${isLoading ? 'opacity-50' : ''}
    `}
    disabled={isLoading}
    onPress={handlePress}
    activeOpacity={0.7}
    >
        <Text className={`font-bold text-lg ${textStyle} `}>{title}</Text>
    </TouchableOpacity>
    
  )
}

export default CustomButton