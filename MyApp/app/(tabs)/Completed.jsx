import React, { useState, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
// import {college_ip,hostel_ip} from "@env"
const hostel_ip = "10.5.15.200"
const Completed = () => {
  const [completedRides, setCompletedRides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch completed rides
  const fetchCompletedRides = async () => {
    try {
      setLoading(true); // Show loading every time data is fetched
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }

      const response = await axios.get(`http://${hostel_ip}:5000/user/completed-accidents`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(response.data);
      setCompletedRides(response.data);
    } catch (error) {
      console.error("Error fetching completed rides:", error);
    } finally {
      setLoading(false);
    }
  };

  // Use `useFocusEffect` to fetch data every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchCompletedRides();
    }, [])
  );

  return (
    <View className="flex-1 bg-gray-900 p-5">
      <Text className="text-white text-lg mb-4">Completed Rides</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#ff0000" />
      ) : (
        <FlatList
          data={completedRides}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View className="bg-gray-800 p-4 my-2 rounded-lg">
              <Text className="text-red-400 font-bold">Location: {item.location}</Text>
              <Text className="text-gray-400">Time: {item.datetime}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default Completed;
