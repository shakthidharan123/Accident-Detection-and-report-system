import React, { useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
// import { hostel_ip ,college_ip} from "@env";
const hostel_ip = "10.5.15.200"

const Profile = () => {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user details
  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem("token");
          const response = await axios.get(`http://${hostel_ip}:5000/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          setUser(response.data);
          setImage(response.data.profilePicture || null);
          setError(null);
        } catch (err) {
          setError("Failed to fetch profile data");
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }, [])
  );

  // Logout function
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/(auth)/navigator");
  };

  // Image Picker
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900 p-6 items-center">
      {/* Profile Picture Section */}
      <TouchableOpacity onPress={pickImage} className="mb-4">
        <Image
          source={image ? { uri: image } : require("../../assets/icons/profile.png")}
          className="w-36 h-36 rounded-full border-4 border-yellow-500"
        />
      </TouchableOpacity>

      {/* Profile Card */}
      <View className="w-full bg-gray-800 p-6 rounded-lg shadow-md">
        <Text className="text-white text-center text-2xl font-bold">{user?.name}</Text>
        <Text className="text-gray-400 text-center text-lg mb-2">@{user?.username}</Text>

        <View className="border-b border-gray-600 my-2" />

        {/* Details Section */}
        <View className="mt-3 space-y-2">
          <Text className="text-gray-300 text-lg">
            📞 Phone: <Text className="text-white">{user?.phoneNumber}</Text>
          </Text>
          <Text className="text-gray-300 text-lg">
            🚗 License: <Text className="text-white">{user?.licenseNumber}</Text>
          </Text>
          <Text className="text-gray-300 text-lg">
            🏍️ Vehicle No: <Text className="text-white">{user?.vehicleNumber}</Text>
          </Text>
          <Text className="text-gray-300 text-lg">
            📍 Location: <Text className="text-white">{user?.location || "N/A"}</Text>
          </Text>
          <Text
            className={`text-lg font-bold ${
              user?.active_status ? "text-green-500" : "text-red-500"
            }`}
          >
            {user?.active_status ? "🟢 Active" : "🔴 Inactive"}
          </Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-500 px-6 py-3 mt-6 rounded-lg shadow-lg"
      >
        <Text className="text-white font-bold text-lg">Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;
