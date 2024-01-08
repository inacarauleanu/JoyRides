import {Text, View, Button, StyleSheet, Image} from 'react-native';
import { auth } from '../firebase-config';
import { getAuth, signOut } from 'firebase/auth';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import MapView, {Marker, Polyline} from 'react-native-maps';
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import DestinationButton from '../components/DestinationButton';
import axios from 'axios';

const LandingPage = (navigation) => {

  const { user } = useAuthentication();

  const [currentLocation, setCurrentLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);


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

  const [coordinates, setCoordinates] = useState([
    { latitude: 45.727073937005436, longitude: 21.276126083094514 },
    { latitude: 45.72926084389645, longitude: 21.2686802708622 },
    { latitude: 45.73354453672023, longitude: 21.258573707289397 },
    { latitude: 45.737094061197595, longitude: 21.25059145325732 },
  ]);

  const [currentCoordinate, setCurrentCoordinate] = useState(coordinates[0]);
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (coordinates.length > 1) {
        setCoordinates((prevCoordinates) => {
          const nextIndex = (prevCoordinates.indexOf(currentCoordinate) + 1) % prevCoordinates.length;
          setCurrentCoordinate(prevCoordinates[nextIndex]);
          return prevCoordinates;
        });
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [currentCoordinate, coordinates]);
  
  return (   
    <View style={styles.container}>
      <DestinationButton/>
      
    <MapView 
          initialRegion={{
            latitude: coordinates[0].latitude,
            longitude: coordinates[0].longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
    
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
      <Polyline
        coordinates={coordinates}
        strokeColor="#FFC66C" // Line color
        strokeWidth={3}
      />
       
       <Marker
       coordinate={currentCoordinate}
       title={`Moving Marker`}
       description={`Visit in 5 seconds`}
     >
          <Image source={require('../assets/icons/tram.png')}
      style={{
          width:32,
          height:42
      }}/>
      </Marker>
             
        
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
