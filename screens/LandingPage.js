import {Text, View, Button, StyleSheet, Image} from 'react-native';
import { auth } from '../firebase-config';
import { getAuth, signOut } from 'firebase/auth';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import MapView, {Marker} from 'react-native-maps';
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import DestinationButton from '../components/DestinationButton';
import Transport from '../components/Transport.js';
import axios from 'axios';

const LandingPage = (navigation) => {

  const { user } = useAuthentication();

  const [currentLocation, setCurrentLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);

      setInitialRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    };

    getLocation();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://192.168.100.20:3000/api/vehicles');
        const data = await response.json();
        setVehicles(data);
        console.log("ceva");
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    // Fetch data initially
    fetchData();

    // Fetch data and update coordinates every 10 seconds
    const interval = setInterval(fetchData, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  
  return (   
    <View style={styles.container}>
      <DestinationButton/>
      
    <MapView 
    initialRegion={initialRegion}
    showsUserLocation = {true}
    showsCompass = {true}
    rotateEnabled = {true}
    style={styles.map} >
    {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="Your Location"
            />
          )}
      {vehicles.map(vehicle => (
            <Marker
              key={vehicle.vehicleId}
              coordinate={{ latitude: vehicle.latitude, longitude: vehicle.longitude }}
              title={`Vehicle ${vehicle.vehicleId}`}
            >
              <Image source={require('../assets/icons/tram.png')}
      style={{
          width:32,
          height:42
      }}/>
              </Marker>
          ))}
      {/*<Marker
       coordinate={{
        latitude: 45.73336873421114,
        longitude: 21.261539609618417,
      }}
      title="8">
      <Image source={require('../assets/icons/tram.png')}
      style={{
          width:32,
          height:42
      }}/>
    </Marker>*/}
     {/*<Transport driver={{uid: 'null', location:{
     latitude: 45.73336873421114,
     longitude: 21.261539609618417,
     }
     }}/>*/}

  </MapView>
  </View>
   /* <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text>Hello, {user?.email}!</Text>
       <Button title="Sign Out" style={{marginTop:10}} onPress={() => signOut(auth)} />
    </View>*/
    

  );
};

const styles = StyleSheet.create(
  {
    container:{
      flex:1,
    },
    map: {
      width: '100%',
      height: '100%',
    },
  }
)

export default LandingPage;
