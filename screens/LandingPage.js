import {Text, View, Button, StyleSheet, Image, KeyboardAvoidingView, TouchableOpacity}  from 'react-native';
import { auth } from '../firebase-config';
import { getAuth, signOut } from 'firebase/auth';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import MapView, {Marker, Polyline} from 'react-native-maps';
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import DestinationButton from '../components/DestinationButton';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import {decode} from "@mapbox/polyline";

const LandingPage = (navigation) => {

  const { user } = useAuthentication();

  const [currentLocation, setCurrentLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [showSecondAutocomplete, setShowSecondAutocomplete] = useState(false);
  const [originAddress, setOriginAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [directions, setDirections] = useState(null);
  const [coordsPoints, setCoordsPoints] = useState([]);


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
    { latitude: 45.73715297653913,  longitude: 21.250007799830325 },
    { latitude: 45.7383136358611,  longitude: 21.24074881431289 },
    { latitude: 45.73653145228806,  longitude: 21.23130743857969 },
    { latitude: 45.73508619442292,  longitude: 21.226779869762918 },
    { latitude: 45.73510646512803, longitude: 21.226635268339795 },
    { latitude: 45.73855105822525,  longitude: 21.225133231290602},
    { latitude: 45.74168096073263,   longitude: 21.225090315945867,},
     
  ]);

  const [currentCoordinate, setCurrentCoordinate] = useState(coordinates[0]);
  

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (coordinates.length > 1) {
        setCoordinates((prevCoordinates) => {
          const nextIndex = (prevCoordinates.indexOf(currentCoordinate) + 1) % prevCoordinates.length;
  
          // verific daca marker-ul a ajuns la ultimele coordonate
          if (nextIndex === 0) {
            // intorc array-ul
            const reversedCoordinates = [...prevCoordinates].reverse();
            setCurrentCoordinate(reversedCoordinates[0]);
            return reversedCoordinates;
          }
  
          setCurrentCoordinate(prevCoordinates[nextIndex]);
          return prevCoordinates;
        });
      }
    }, 5000);
  
    return () => clearInterval(intervalId);
  }, [currentCoordinate, coordinates]);
  const handleGetDirections = async () => {
    if (!currentLocation) {
      console.log("Current location not available");
      return;
    }

    const apiKey = "AIzaSyANusx15v_PhIIfm5wUOchee7ayMMqkYcs";
    const origin = encodeURIComponent(originAddress);
    const destination = encodeURIComponent(destinationAddress);

    const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&departure_time=now&mode=transit&key=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      setDirections(data);
      console.log(data);
      console.log("Legs:", data.routes[0].legs); // Log the legs array

      data.routes[0].legs.forEach((leg, index) => {
        console.log(`Steps for leg ${index + 1}:`);
        leg.steps.forEach((step, stepIndex) => {
          console.log(`Step ${stepIndex + 1}:`, step);
        });
      });
      let points = decode(data.routes[0].overview_polyline.points);
      console.log(points);
      let coordsPoints = points.map((point, index) => {
        return {
          latitude: point[0],
          longitude: point[1]
        };
      });
      setCoordsPoints(coordsPoints);
      return coordsPoints;
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
  };

  
  return (   
    <View style={styles.container}>
     
     <GooglePlacesAutocomplete
      placeholder='Adresă Plecare'
      onPress={(data, details = null) => {
        // 'details' is provided when fetchDetails = true
        console.log(data, details);
        setShowSecondAutocomplete(true);
        setOriginAddress(data.description);
      }}
      query={{
        key: 'AIzaSyANusx15v_PhIIfm5wUOchee7ayMMqkYcs',
        language: 'en',
      }}
      styles={{
        container: {
          position: 'absolute',
          top: 100,
          left: 20,
          zIndex: 1,
          width: '90%',
         /* borderColor: 'black',
          borderWidth: 1, // Match the border width of the search input
          borderRadius: 5, // Match the border radius of the search input*/

        },
        listView: {
          backgroundColor: 'white',
          zIndex: 1,
        },
      }}
    />
    {showSecondAutocomplete && (
      <View style={styles.autocompleteContainer}>
        <GooglePlacesAutocomplete
        placeholder='Destinație'
        onPress={(data, details = null) => {
          // 'details' is provided when fetchDetails = true
          console.log(data, details);
          setDestinationAddress(data.description);
        }}
        query={{
          key: 'AIzaSyANusx15v_PhIIfm5wUOchee7ayMMqkYcs',
          language: 'en',
        }}
        styles={{
          container: styles.autocompleteInputContainer,
          textInput: styles.autocompleteInput,
        }}
      />
      <TouchableOpacity onPress={handleGetDirections} style={styles.directionsIcon}>
        <Image
          source={require('../assets/icons/search.png')}
          style={styles.icon}
        />
      </TouchableOpacity>
      </View>
      
      )}

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
        
      {/*<Polyline
        coordinates={coordinates}
        strokeColor="#FFC66C" 
        strokeWidth={3}
      />
       
       <Marker
       coordinate={currentCoordinate}
       title={`8`}
     >
          <Image source={require('../assets/icons/tram.png')}
      style={{
          width:32,
          height:42
      }}/>
    </Marker>*/}
      {/* Display polyline for directions */}
      {coordsPoints.length > 0 && <Polyline coordinates={coordsPoints}  strokeColor="#FFC66C" 
        strokeWidth={3}/>}

    
  {directions && directions.routes && directions.routes.length > 0 && directions.routes[0].legs && (
    <Marker
      coordinate={{
        latitude: directions.routes[0].legs[0].start_location.lat,
        longitude: directions.routes[0].legs[0].start_location.lng,
      }}
      title="Start"
      pinColor="blue"
    />
  )}
  {directions && directions.routes && directions.routes.length > 0 && directions.routes[0].legs && (
    <Marker
      coordinate={{
        latitude: directions.routes[0].legs[0].end_location.lat,
        longitude: directions.routes[0].legs[0].end_location.lng,
      }}
      title="End"
      pinColor="green"
    />
  )}
  
  </MapView>
  </View>
  
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

    favoriteButton: {
      position: 'absolute',
      bottom: 20,
      alignSelf: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: 'blue',
      borderRadius: 5,

    },

    autocompleteContainer: {
      position: 'absolute',
      top: 100,
      left: 20,
      zIndex: 1,
      width: '90%',
      marginTop: 50,
      flexDirection: 'row', // Arrange children horizontally
      alignItems: 'center', // Center children vertically
      backgroundColor: 'white', // Optional: background color for the container
      borderRadius: 5,
    },
    autocompleteInputContainer: {
      flex: 1, // Take remaining space in the container
      paddingHorizontal: 10, // Add some padding
    },
    autocompleteInput: {
      flex: 1, // Take remaining space in the container
      paddingHorizontal: 10, // Add some padding
    },
    directionsIcon: {
      padding: 10, // Add some padding to the icon
    },
    icon: {
      width: 20,
      height: 20,
    },
  }
)

export default LandingPage;
