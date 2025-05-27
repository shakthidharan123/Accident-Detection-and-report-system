import React from 'react';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';
import { useDriverStore, useLocationStore } from '@/store';
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
} from '../../lib/map';
import { useState,useEffect } from 'react';
import { MarkerData } from '@/types/type';
import MapViewDirections from 'react-native-maps-directions';
const ROUTES_API_KEY = "AIzaSyB4meH6iJJd7eBE2Wg4mnsXOS9zfz5diUY";



export default function App() {

  const [destinationCoordinates, setDestinationCoordinates] = useState({
    latitude: 11.53,  // example coordinates
    longitude: 77.12,
  });
  
  const setDestinationLocation = useLocationStore(state => state.setDestinationLocation);
  const [markers,setMarkers] = useState<MarkerData[]>([]);
  const {
    userLatitude,userLongitude,
    destinationLatitude,destinationLongitude
  } = useLocationStore();
  const { selectedDriver, setDrivers } = useDriverStore();
  useEffect(() => {
    //console.log(directionsAPI);
    
      if (!userLatitude || !userLongitude) return;

    
    
  }, [userLatitude,userLongitude,destinationLatitude,destinationLongitude]);
 

  const region = calculateRegion({
    userLatitude,userLongitude,destinationLatitude,destinationLongitude
  })
  return (

    <View style={styles.container}>
      <MapView style={styles.map} 
      provider={PROVIDER_DEFAULT}
      showsUserLocation={true}
      initialRegion={region}
      >
       

        {destinationLatitude && destinationLongitude && (
        <>
          <Marker
            key="destination1"
            coordinate={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            title="Destination"
            //image={icons.pin}
          />
         
        </>
      )}
    </MapView>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
