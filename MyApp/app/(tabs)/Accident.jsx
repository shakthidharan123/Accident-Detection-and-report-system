import { View, Text, TouchableOpacity, FlatList, Button } from "react-native";
import React, { useState, useEffect } from "react";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Maps from "./Maps";
import { useLocationStore } from "../../store/index";
// import {college_ip,hostel_ip} from "@env"

// const homeip = "192.168.20.181";
// const collegeip = "10.5.7.210";
const hostel_ip = "10.5.15.200"
const GOOGLE_API_KEY = "AIzaSyB4meH6iJJd7eBE2Wg4mnsXOS9zfz5diUY"; // 🔴 Replace with your actual Google API Key

const Accident = () => {
  const { setUserLocation } = useLocationStore();
  const [hasPermission, setHasPermission] = useState(false);
  const [accidentLocations, setAccidentLocations] = useState([]);
  const [userLocation, setUserLocationState] = useState(null);
  const [accidentData,setAccidentData] = useState([]);
 // const [destination,setDestination] = useState({});
  const setDestinationLocation = useLocationStore(
    (state) => state.setDestinationLocation
  );
  
  useEffect(() => {
    const fetchAccidentData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.log("No token found");
          return;
        }

        // Get user location
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setHasPermission(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        setUserLocation({
          latitude,
          longitude,
        });

        setUserLocationState({ latitude, longitude });

        // Fetch accident data
        const response = await axios.get(`http://${hostel_ip}:5000/accidents`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const accidents = response.data || [];
        //console.log(destination)
        setAccidentData(accidents);
        // Filter accidents by distance
        
      } catch (error) {
        console.log("Error fetching accident data:", error);
      }
    };

    fetchAccidentData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchAccidentData, 30000);
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  function handleLocationClick(item){
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lng);
    const addr = item.location;
    setDestinationLocation({latitude:lat,longitude:lng,address:addr});
  }
  // Function to check if an accident is within 30 km
  const filterAccidentsByDistance = async (accidents, userLat, userLng) => {
    const filtered = [];

    for (const accident of accidents) {
      const accidentLat = parseFloat(accident.lat);
      const accidentLong = parseFloat(accident.lng);
      const distance = await getDrivingDistance(
        userLat,
        userLng,
        accidentLat,
        accidentLong
      );
      accident['distance'] = distance;
      console.log(accident)

      if (distance !== null && distance <= 30) {
        filtered.push(accident);
      }
    }

    return filtered;
  };

  const handleLocationNavigation = async(item) =>{
    try{
      console.log(item);
      const accidentId=item._id;
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }

      
      const response = await axios.post(`http://${hostel_ip}:5000/assign-accident`,{
        accidentId
      },{
        headers:{
          Authorization: `Bearer ${token}`,

        }
      })
      console.log(response.data);
    }catch(err){
      console.log(err);
    }
    openGoogleMaps(item.lat, item.lng);
  }

  const handleRefresh = async()=>{
    // const response = await axios.get(`http://${collegeip}:5000/accidents`, {
    //   headers: { Authorization: `Bearer ${token}` },
    // });

    // const accidents = response.data || [];
    // //console.log(destination)
    // setAccidentData(accidents);
    // console.log(accidentData);
    
    const filteredAccidents = await filterAccidentsByDistance(
      accidentData,
      userLocation.latitude,
      userLocation.longitude
    );
    console.log(filteredAccidents);

    setAccidentLocations(filteredAccidents);
  }

  // Function to get driving distance using Google Routes API
  const getDrivingDistance = async (originLat, originLng, destLat, destLng) => {
   // const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY";  // Replace with your API key
  
    // Construct the Routes API request
    const url = `https://routes.googleapis.com/directions/v2:computeRoutes`;
  
    const requestBody = {
      origin: {
        location: {
          latLng: {
            latitude: originLat,
            longitude: originLng,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: destLat,
            longitude: destLng,
          },
        },
      },
      travelMode: "DRIVE",
      computeAlternativeRoutes: false,
      routingPreference: "TRAFFIC_UNAWARE",
    };
  
    console.log("📌 Fetching Google Routes API:", requestBody); // ✅ Debugging
  
    try {
      const response = await axios.post(url, requestBody, {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_API_KEY,
          "X-Goog-FieldMask": "routes.distanceMeters", // Only get distance
        },
      });
  
      console.log("✅ API Response:", response.data); // ✅ Debugging
  
      if (!response.data.routes || response.data.routes.length === 0) {
        console.log("❌ No route found.");
        return null;
      }
  
      const distanceInMeters = response.data.routes[0].distanceMeters;
      return distanceInMeters / 1000; // Convert to kilometers
    } catch (error) {
      console.log("❌ Error fetching distance:", error.response?.data || error.message);
      return null;
    }
  };
  

  const openGoogleMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  return (
    <View className="flex-1 bg-gray-900 p-5">
  <View className="h-[300px] z-20">
    <Maps />
  </View>
  <Text className="text-white text-lg mb-4">New Accident Alerts!</Text>
  <Button onPress={handleRefresh} title="Refresh" />

  <View className="flex-1 w-full mt-3"> 
    {userLocation ? (
      <FlatList
        data={accidentLocations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity className="w-full" onPress={() => handleLocationClick(item)}>
            <View className="bg-gray-800 p-4 rounded-lg mb-3 flex-row justify-between">
              <View>
                <Text className="text-white">Location: {item.location}</Text>
                <Text className="text-white">Severity: {item.severity_label}</Text>
                <Text className="text-white">Distance: {item.distance} km</Text>
              </View>
              <TouchableOpacity
                className="bg-red-500 px-5 py-3 rounded-lg mt-2"
                onPress={() => handleLocationNavigation(item)}
              >
                <Text className="text-black font-bold">Go to Location</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }} // Ensures scrollability
      />
    ) : (
      <Text className="text-white mt-5">Fetching your location...</Text>
    )}
  </View>
</View>

    
  );
};

export default Accident;
