import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
//import {college_ip,hostel_ip} from "@env"
hostel_ip = "10.5.15.200"
const AddUser = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const handleAddUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      console.log(token);

      axios
        .post(
          `http://${hostel_ip}:5000/admin/adduser`,
          {
            username,
            password,
            name,
            phoneNumber,
            licenseNumber,
            vehicleNumber,
            role: "user",
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then((res) => {
          console.log(res.data);
          if (res.data.message === "User added successfully") {
            Alert.alert("User added successfully");
          } else {
            Alert.alert("Error adding the user");
          }
        })
        .catch((err) => {
          console.log(err);
          Alert.alert("Request failed. Please try again.");
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-900 p-5">
      <Text className="text-white text-lg mb-4">Add New Driver</Text>
      <TextInput
        className="bg-gray-800 text-white w-full p-3 rounded-lg mb-4"
        placeholder="Full Name"
        placeholderTextColor="#A1A1AA"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        className="bg-gray-800 text-white w-full p-3 rounded-lg mb-4"
        placeholder="Phone Number"
        placeholderTextColor="#A1A1AA"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <TextInput
        className="bg-gray-800 text-white w-full p-3 rounded-lg mb-4"
        placeholder="License Number"
        placeholderTextColor="#A1A1AA"
        value={licenseNumber}
        onChangeText={setLicenseNumber}
      />
      <TextInput
        className="bg-gray-800 text-white w-full p-3 rounded-lg mb-4"
        placeholder="Vehicle Number"
        placeholderTextColor="#A1A1AA"
        value={vehicleNumber}
        onChangeText={setVehicleNumber}
      />
      <TextInput
        className="bg-gray-800 text-white w-full p-3 rounded-lg mb-4"
        placeholder="Username"
        placeholderTextColor="#A1A1AA"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        className="bg-gray-800 text-white w-full p-3 rounded-lg mb-4"
        placeholder="Password"
        placeholderTextColor="#A1A1AA"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity className="bg-yellow-500 px-5 py-3 rounded-lg" onPress={handleAddUser}>
        <Text className="text-black font-bold">Add Driver</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddUser;
