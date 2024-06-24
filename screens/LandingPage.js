import {Text, ScrollView, FlatList, View, Button, StyleSheet, Image, KeyboardAvoidingView, TouchableOpacity, Linking}  from 'react-native';
import { auth } from '../firebase-config';
import { getAuth, signOut } from 'firebase/auth';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import MapView, {Marker, Polyline, Callout} from 'react-native-maps';
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import DestinationButton from '../components/DestinationButton';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import {decode} from "@mapbox/polyline";
import RenderHtml from 'react-native-render-html';
import SlidingUpPanel from 'rn-sliding-up-panel';
import { Colors } from '../constants';
import Icon from 'react-native-vector-icons/FontAwesome';

const LandingPage = (navigation) => {

  const { user } = useAuthentication();

  const [currentLocation, setCurrentLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [showSecondAutocomplete, setShowSecondAutocomplete] = useState(false);
  const [originAddress, setOriginAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [directions, setDirections] = useState(null);
  const [coordsPoints, setCoordsPoints] = useState([]);
  const [stepDetails, setStepDetails] = useState([]);
  const [searchPressed, setSearchPressed] = useState(false); 
  const [coordsPointsArray, setCoordsPointsArray] = useState([]);
  const [routeColors, setRouteColors] = useState(["#FFC66C", "#FF5733", "#33FF57", "#337DFF", "#7F33FF"]); 
  const [stops, setStops] = useState([]);
  const [nearbyStops, setNearbyStops] = useState([]);

  const error = console.error;
  console.error = function(...args) {
    if (/defaultProps/.test(args[0])) return;
    error(...args);
  };


  const openGoogleMapsDirections = () => {
    const origin = encodeURIComponent(originAddress);
    const destination = encodeURIComponent(destinationAddress);
    // Construiește URL-ul Google Maps cu indicațiile de transport
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  
    // Deschide Google Maps cu URL-ul construit
    Linking.openURL(mapsUrl)
      .catch(error => console.error('Eroare la deschiderea Google Maps:', error));
  };
  
  // Exemplu de utilizare

  //openGoogleMapsDirections();

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

    const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&departure_time=now&mode=transit&alternatives=true&key=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      setDirections(data);
      console.log(data);
      console.log("Legs:", data.routes[0].legs); // Log the legs array

      const stepsDetails = data.routes.map((route, routeIndex) => ({
        routeIndex,
        legs: route.legs.map((leg, legIndex) => ({
          legIndex,
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          departureTime: leg.departure_time ? leg.departure_time.text : "N/A",
          arrivalTime: leg.arrival_time ? leg.arrival_time.text : "N/A",
          distance: leg.distance.text,
          duration: leg.duration.text,
          steps: leg.steps.map((step, stepIndex) => ({
            stepIndex,
            html_instructions: step.html_instructions,
            distance: step.distance.text,
            duration: step.duration.text,
            startLocation: {
              lat: step.start_location.lat,
              lng: step.start_location.lng,
            },
            endLocation: {
              lat: step.end_location.lat,
              lng: step.end_location.lng,
            },
            transitDetails: step.transit_details || null,
            subSteps: step.steps ? step.steps.map((subStep, subStepIndex) => ({
              subStepIndex,
              html_instructions: subStep.html_instructions,
              distance: subStep.distance.text,
              duration: subStep.duration.text,
              startLocation: {
                lat: subStep.start_location.lat,
                lng: subStep.start_location.lng,
              },
              endLocation: {
                lat: subStep.end_location.lat,
                lng: subStep.end_location.lng,
              },
            })) : [],
          })),
        })),
      }));
      setStepDetails(stepsDetails);


      const routesCoords = data.routes.map(route => {
        let points = decode(route.overview_polyline.points);
        return points.map(point => ({
          latitude: point[0],
          longitude: point[1]
        }));
      });
      setCoordsPointsArray(routesCoords);

    } catch (error) {
      console.error("Error fetching directions:", error);
    }
  };

  const renderSubSteps = ({ item }) => (
    <View style={styles.subStepContainer}>
     {item.html_instructions ? (
      <RenderHtml contentWidth={300} source={{ html: item.html_instructions }} />
    ) : (
      <Text>Nicio instrucțiune disponibilă</Text>
    )}
      <Text>Distanță: {item.distance}</Text>
      <Text>Durată: {item.duration}</Text>
     {/* <Text>Locație plecare: {item.startLocation.lat}, {item.startLocation.lng}</Text>
      <Text>Locație sosire: {item.endLocation.lat}, {item.endLocation.lng}</Text>*/}
    </View>
  );

  const renderStepInstructions = ({ item }) => (
    
    <View style={styles.stepContainer}>
     {item.html_instructions ? (
      <RenderHtml contentWidth={300} source={{ html: item.html_instructions }} />
    ) : (
      <Text>Nicio instrucțiune disponibilă</Text>
    )}

      <Text>Distanță: {item.distance}</Text>
      <Text>Durată: {item.duration}</Text>
      {/*<Text>Locație start: {item.startLocation.lat}, {item.startLocation.lng}</Text>
      <Text>Locație finală: {item.endLocation.lat}, {item.endLocation.lng}</Text>*/}
      {item.transitDetails && (
        <View style={styles.transitDetails}>
          <Text>Linia: {item.transitDetails.line.short_name}</Text>
          <Text>Stop plecare: {item.transitDetails.departure_stop.name}</Text>
          <Text>Ora plecare: {item.transitDetails.departure_time.text}</Text>
          <Text>Stop sosire: {item.transitDetails.arrival_stop.name}</Text>
          <Text>Ora sosire: {item.transitDetails.arrival_time.text}</Text>
          <Text>Număr de opriri: {item.transitDetails.num_stops}</Text>
        </View>
      )}
      {/*item.subSteps.length > 0 && (
        <FlatList
          data={item.subSteps}
          renderItem={renderSubSteps}
          keyExtractor={(subStep, index) => `subStep-${index}`}  
        />
      )*/}
    </View>
  );

  const renderLegInstructions = ({ item }) => (
    <View style={styles.legContainer}>
    {/*<Text>Pasul {item.legIndex + 1}:</Text>
      <Text>De la: {item.startAddress}</Text>
      <Text>Până la: {item.endAddress}</Text>
      <Text>Timp de plecare: {item.departureTime}</Text>
      <Text>Timp de sosire: {item.arrivalTime}</Text>
      <Text>Distanță: {item.distance}</Text>
      <Text>Durată: {item.duration}</Text>*/}
      <FlatList
        data={item.steps}
        renderItem={renderStepInstructions}
        keyExtractor={(step, index) => `step-${item.legIndex}-${index}`} 
      />
    </View>
  );

  const renderRouteInstructions = ({ item }) => (


    <View style={styles.routeContainer}>
      <Text>Ruta {item.routeIndex + 1}:</Text>
      
      <FlatList
        data={item.legs}
        renderItem={renderLegInstructions}
        keyExtractor={(leg, index) => `leg-${item.routeIndex}-${index}`} // Unique key for leg
      />
    </View>

  );

  
  const handleSearchButtonPress = async () => {
    setSearchPressed(true); 
    await handleGetDirections(); 
  };


  const getStopsNames = async () => {


    const url = 'https://api.tranzy.ai/v1/opendata/stops';
    const options = {
      method: 'GET',
      headers: {'X-Agency-Id': '8', Accept: 'application/json', 'X-API-KEY': 'NZ1x19bpMZRzEciT7eadiL16cvxCLDdYa3KQKuRh'}
    };
    
    try {
      const response = await fetch(url, options);
      const data = await response.json();

      setStops(data);


    } catch (error) {
      setLoading(false);
      console.error(error);
    }

  };

  useEffect (() => {
      getStopsNames()
  }, []);


  // Helper function to calculate distance between two coordinates in meters
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // in meters
  return distance;
};


const getNearbyStops = async (currentLocation, stops) => {

    if (currentLocation && stops.length > 0) {
      const radius = 500; // Radius in meters
      const nearbyStops = stops.filter(stop => {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          stop.stop_lat,
          stop.stop_lon
        );
        return distance <= radius;
      });
      setNearbyStops(nearbyStops); 
      //console.log("nearby stops", nearbyStops);
    }

}

useEffect (() => {
  getNearbyStops(currentLocation, stops)
}, [currentLocation, stops]);

  return (   
    <View style={styles.container}>
     
     <GooglePlacesAutocomplete
      placeholder='Adresă Plecare'
      onPress={(data, details = null) => {
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
      <TouchableOpacity onPress={handleSearchButtonPress} style={styles.directionsIcon}>
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
          style={searchPressed == false ? styles.mapUnPressed : styles.mapPressed} >
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
              }}
              title="Your Location"
            />
          )}
        
        {nearbyStops.map(stop => (
            <Marker
              key={stop.stop_id}
              coordinate={{
                latitude: stop.stop_lat,
                longitude: stop.stop_lon,
              }}
              //title={stop.stop_name}
              //tracksViewChanges={false}
            >
              <Image source={require('../assets/icons/station.png')}
                style={{
                  width: 20,
                  height: 20
                }}/>
                      <Callout tooltip>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutTitle}>{stop.stop_name}</Text>
              {/*<Text style={styles.calloutDescription}>Descriere sau alte informații</Text>*/}
            </View>
          </Callout>
            </Marker>
  ))}
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
     
      {/*coordsPoints.length > 0 && <Polyline coordinates={coordsPoints} strokeColor="#FFC66C" strokeWidth={3} />*/}

      {coordsPointsArray.map((coords, index) => (
              <Polyline
                key={index}
                coordinates={coords}
                strokeColor={routeColors[index % routeColors.length]}
                strokeWidth={6}
              />
            ))}

{directions && directions.routes && directions.routes.length > 0 && directions.routes[0].legs && (
  <>
    <Marker
      coordinate={{
        latitude: directions.routes[0].legs[0].start_location.lat,
        longitude: directions.routes[0].legs[0].start_location.lng,
      }}
      title="Start"
      pinColor="blue"
    />
    <Marker
      coordinate={{
        latitude: directions.routes[0].legs[0].end_location.lat,
        longitude: directions.routes[0].legs[0].end_location.lng,
      }}
      title="End"
      pinColor="green"
    />
  </>
)}


</MapView>

{searchPressed && stepDetails.length > 0 && (
      <SlidingUpPanel
      ref={c => this._panel = c}
      draggableRange={{ top: 500, bottom: 200 }} 
      allowDragging={true}
      showBackdrop={false}
      >
  <View style={styles.instructionsContainer}>
  <View style={{ alignItems: 'center' }}>
    <Icon name="minus" size={15} color="#C1CDCF" />
  </View>
<FlatList
    data={stepDetails} 
    renderItem={renderRouteInstructions} 
    keyExtractor={(route, index) => `route-${index}`} 
  />
</View>
</SlidingUpPanel>
      )}
      
    </View>
    
  );
  };

  const styles = StyleSheet.create(
    
    {
      container:{
        flex:1,
      },
      routeContainer:{
        alignItems: 'center'
      },
      mapPressed: {
        width: '100%',
        height: '100%',
      },
  
      mapUnPressed: {
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
  
      instructionsContainer: {
      flex: 1, 
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 10,
    },
    legContainer: {
      marginBottom: 20,
      backgroundColor: Colors.babyOrange,
      padding: 10,
      borderRadius: 10,
    },
    stepContainer: {
      marginBottom: 10,
      backgroundColor: Colors.white,
      padding: 10,
      borderRadius: 10,
    },
    subStepContainer: {
      marginLeft: 20,
      marginBottom: 10,
      backgroundColor: '#d0d0d0',
      padding: 10,
      borderRadius: 10,
    },
    transitDetails: {
      marginLeft: 20,
      marginTop: 10,
    },
    calloutContainer: {
      width: 150,
      padding: 10,
      backgroundColor: '#fff',
      borderRadius: 10,
      borderColor: '#ccc',
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 5,
    },
    calloutTitle: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    calloutDescription: {
      fontSize: 14,
      color: '#555',
    },
  });
  

export default LandingPage;