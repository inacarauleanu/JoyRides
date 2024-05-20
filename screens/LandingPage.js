import {Text, ScrollView, FlatList, View, Button, StyleSheet, Image, KeyboardAvoidingView, TouchableOpacity, Linking}  from 'react-native';
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
import RenderHtml from 'react-native-render-html';

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
      <RenderHtml contentWidth={300} source={{ html: item.html_instructions }} />
      <Text>Distance: {item.distance}</Text>
      <Text>Duration: {item.duration}</Text>
      <Text>Start Location: {item.startLocation.lat}, {item.startLocation.lng}</Text>
      <Text>End Location: {item.endLocation.lat}, {item.endLocation.lng}</Text>
    </View>
  );

  const renderStepInstructions = ({ item }) => (
    <View style={styles.stepContainer}>
      <RenderHtml contentWidth={300} source={{ html: item.html_instructions }} />
      <Text>Distance: {item.distance}</Text>
      <Text>Duration: {item.duration}</Text>
      <Text>Start Location: {item.startLocation.lat}, {item.startLocation.lng}</Text>
      <Text>End Location: {item.endLocation.lat}, {item.endLocation.lng}</Text>
      {item.transitDetails && (
        <View style={styles.transitDetails}>
          <Text>Bus Line: {item.transitDetails.line.short_name}</Text>
          <Text>Departure Stop: {item.transitDetails.departure_stop.name}</Text>
          <Text>Departure Time: {item.transitDetails.departure_time.text}</Text>
          <Text>Arrival Stop: {item.transitDetails.arrival_stop.name}</Text>
          <Text>Arrival Time: {item.transitDetails.arrival_time.text}</Text>
          <Text>Number of Stops: {item.transitDetails.num_stops}</Text>
        </View>
      )}
      {item.subSteps.length > 0 && (
        <FlatList
          data={item.subSteps}
          renderItem={renderSubSteps}
          keyExtractor={(subStep, index) => `subStep-${index}`} // Unique key for subStep
        />
      )}
    </View>
  );

  const renderLegInstructions = ({ item }) => (
    <View style={styles.legContainer}>
      <Text>Leg {item.legIndex + 1}:</Text>
      <Text>From: {item.startAddress}</Text>
      <Text>To: {item.endAddress}</Text>
      <Text>Departure Time: {item.departureTime}</Text>
      <Text>Arrival Time: {item.arrivalTime}</Text>
      <Text>Distance: {item.distance}</Text>
      <Text>Duration: {item.duration}</Text>
      <FlatList
        data={item.steps}
        renderItem={renderStepInstructions}
        keyExtractor={(step, index) => `step-${item.legIndex}-${index}`} // Unique key for step
      />
    </View>
  );

  const renderRouteInstructions = ({ item }) => (
    <View style={styles.routeContainer}>
      <Text>Route {item.routeIndex + 1}:</Text>
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
  <View style={styles.instructionsContainer}>
          <Button
        title="Open Google Maps"
        onPress={openGoogleMapsDirections} // Define openGoogleMapsDirections function
      />
<FlatList
    data={stepDetails} // The data contains the details of each route
    renderItem={renderRouteInstructions} // Function to render each route
    keyExtractor={(route, index) => `route-${index}`} // Unique key for each route
  />
</View>
      )}
      
    </View>
    
  );
  };

  const styles = StyleSheet.create(
    {
      container:{
        flex:1,
      },
      mapPressed: {
        width: '100%',
        height: '60%',
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
      flex: 1, // Takes the remaining space
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 10,
    },
    legContainer: {
      marginBottom: 20,
      backgroundColor: '#f0f0f0',
      padding: 10,
      borderRadius: 10,
    },
    stepContainer: {
      marginBottom: 10,
      backgroundColor: '#e0e0e0',
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
  });
  

export default LandingPage;