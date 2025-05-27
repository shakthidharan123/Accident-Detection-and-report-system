import React, { useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
// import { hostel_ip, college_ip } from "@env";
import { useFocusEffect } from "@react-navigation/native";
hostel_ip = "10.5.15.200"
const Users = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchDrivers = async () => {
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem("token");
          const response = await axios.get(`http://${hostel_ip}:5000/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setDrivers(response.data);
          setError(null);
        } catch (err) {
          setError("Failed to fetch drivers");
        } finally {
          setLoading(false);
        }
      };

      fetchDrivers();
    }, [])
  );

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
    <View className="flex-1 bg-gray-900 p-5">
      <Text className="text-white text-lg mb-4">Drivers List</Text>
      <FlatList
        data={drivers}
        keyExtractor={(item) => item._id} // Assuming MongoDB ObjectId (_id)
        renderItem={({ item }) => (
          <View className="flex-row justify-between items-center bg-gray-800 p-4 my-2 rounded-lg">
            <Text className="text-white font-bold">{item.name}</Text>
            {item.active_status ? (
              <Text className="text-green-500">Active</Text>
            ) : (
              <Text className="text-red-500">Inactive</Text>
            )}
          </View>
        )}
      />
    </View>
  );
};

export default Users;
