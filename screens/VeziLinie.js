import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Modal, Animated} from 'react-native';
import { Button } from 'react-native-elements';
import MapView, { Marker, Polyline, Callout, CalloutSubview } from 'react-native-maps';
import * as Location from "expo-location";
import { auth } from "../firebase-config.js";
import { getDatabase, ref, set, get, update, push} from "firebase/database";
import Icon from 'react-native-vector-icons/FontAwesome';
import SlidingUpPanel from 'rn-sliding-up-panel';


const VeziLinie = ({ route }) => {
  // Extract stops data from route parameters

  const [currentLocation, setCurrentLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [goToRegion, setGoToRegion] = useState(null);
  //const [id_ruta, setIDRuta] = useState('');
  const [trips, setTrips] = useState([]);
  const [selectedTripHeadsign, setSelectedTripHeadsign] = useState([]);
  const [currentHeadsignIndex, setCurrentHeadsignIndex] = useState(0);
  const [selectedTripIDs, setSelectedTripIDs] = useState([]);
  const [currentTripID, setCurrentcurrentTripID] = useState(0);
  const [id_trip, setIDTrip] = useState('');
  const [stops, setStops] = useState([]);
  const [filteredStops, setFilteredStops] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [progress, setProgress] = useState(100);
  const [shapes, setShapes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [isUserNearby, setIsUserNearby] = useState(false);
  const [arrivalTimes, setArrivalTimes] = useState({});
  const [currentState, setCurrentState] = useState({
    currentHeadsignIndex: 0,
    currentTripID: 0
  });
  const [showOverlay, setShowOverlay] = useState(false);
  const [modalStationId, setModalStationId] = useState(null);
  const [stopTimer, setStopTimer] = useState(null);
  const [stopTimerAll, setStopTimerAll] = useState(null);
  const [progressWidth, setProgressWidth] = useState('100%');
  const [stopToBeDeleted, setStopToBeDeleted] = useState('');

  useEffect(() => {
    const duration = 10000; // Duration in milliseconds (10 seconds)
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(duration - elapsedTime, 0);
      const remainingProgress = (remainingTime / duration) * 100;
      setProgressWidth(remainingProgress);

      if (remainingTime === 0) {
        clearInterval(interval);
        setShowOverlay(false);
      }
    }, 100); // Update progress every 100 milliseconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);



const id_ruta = route.params.route_id;

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

  useEffect (() => {
  const getTripTranzy = async () => {

    setLoadingTrips(true);
    const url = 'https://api.tranzy.ai/v1/opendata/trips';
    const options = {
      method: 'GET',
      headers: {'X-Agency-Id': '8', Accept: 'application/json', 'X-API-KEY': 'kqZQV3y8d87sUvqLC6AFnPud6Gr1SFw1Ktk5kjNW'}
    };
    
      const response = await fetch(url, options);
      const data = await response.json();
      let tripuri = data.filter(obj => obj.route_id === id_ruta);

      //console.log("tripuri", tripuri);
      setTrips(tripuri);

      const headsigns = tripuri.map(trip => trip.trip_headsign);
      setSelectedTripHeadsign(headsigns);

      const tripIDs = tripuri.map(trip => trip.trip_id);
      setSelectedTripIDs(tripIDs);
      setLoadingTrips(false); // Stop loading'
  };
  getTripTranzy().catch(console.error);
  }, []);

  useEffect(() => {
    if (id_trip && !loadingTrips) {
      console.log("TRIP_ID in fetch", id_trip);
      getStopsTranzy(id_trip);
      getShapesTranzy(id_trip);
      getVehicles(id_trip);
    }
  }, [id_trip, loadingTrips]);
  

useEffect (() => {
  getStopsNames(stops)
}, [stops]);

useEffect(() => {
  if (vehicles.length > 0 && filteredStops.length > 0) {
    calculateArrivalTimes();
  }
}, [vehicles, filteredStops]);

  const getStopsTranzy = async (id_trip) => {

    setLoading(true);
    const url = 'https://api.tranzy.ai/v1/opendata/stop_times';
    const options = {
      method: 'GET',
      headers: {'X-Agency-Id': '8', Accept: 'application/json', 'X-API-KEY': 'kqZQV3y8d87sUvqLC6AFnPud6Gr1SFw1Ktk5kjNW'}
    };
    
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      let stops = data.filter(obj => obj.trip_id === id_trip); 

      //console.log("stops", stops);
      setStops(stops);
      setLoading(false);

    } catch (error) {
      setLoading(false);
      console.error(error);
    }

  };

  const getShapesTranzy = async (id_trip) => {

    setLoading(true);
    const url = 'https://api.tranzy.ai/v1/opendata/shapes';
    const options = {
      method: 'GET',
      headers: {'X-Agency-Id': '8', Accept: 'application/json', 'X-API-KEY': 'kqZQV3y8d87sUvqLC6AFnPud6Gr1SFw1Ktk5kjNW'}
    };
    
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      let shapeuri = data.filter(obj => obj.shape_id === id_trip); 

      //console.log("shapes", shapeuri);
      setShapes(shapeuri);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }

  };

  const getStopsNames = async (stops) => {

    setLoading(true);
    const url = 'https://api.tranzy.ai/v1/opendata/stops';
    const options = {
      method: 'GET',
      headers: {'X-Agency-Id': '8', Accept: 'application/json', 'X-API-KEY': 'kqZQV3y8d87sUvqLC6AFnPud6Gr1SFw1Ktk5kjNW'}
    };
    
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      //console.log("Toate stopurile", data);

      const stopIds = stops.map(stop => stop.stop_id);
      const filteredStops = data.filter(stop => stopIds.includes(stop.stop_id));

      filteredStops.sort((a, b) => {
        const stopA = stops.find(stop => stop.stop_id === a.stop_id);
        const stopB = stops.find(stop => stop.stop_id === b.stop_id);
        return stopA.stop_sequence - stopB.stop_sequence;
      });

     // console.log("STOPS", filteredStops);
      setFilteredStops(filteredStops);
      setLoading(false);

    } catch (error) {
      setLoading(false);
      console.error(error);
    }

  };


  const getVehicles = async (id_trip) => {

    
    const url = 'https://api.tranzy.ai/v1/opendata/vehicles';
    const options = {
      method: 'GET',
      headers: {'X-Agency-Id': '8', Accept: 'application/json', 'X-API-KEY': 'kqZQV3y8d87sUvqLC6AFnPud6Gr1SFw1Ktk5kjNW'}
    };
    
    try {
      const response = await fetch(url, options);
      const data = await response.json();

      let vehicule = data.filter(obj => obj.trip_id === id_trip); 

     // console.log("vehicles", vehicule);
      setVehicles(vehicule);

    } catch (error) {
      console.error(error);
    }

  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      getVehicles(id_trip);
      setProgress(100); // Reset progress bar
    }, 30000); 
  
    return () => clearInterval(intervalId); 
  }, [id_trip]);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prevProgress => prevProgress > 0 ? prevProgress - (100 / 30) : 0);
    }, 1000);

    return () => clearInterval(progressInterval); // Clear progress interval on unmount
  }, []);


  const handlePress = () => {
    setCurrentState(prevState => {
      const newIndex = (prevState.currentTripID + 1) % selectedTripIDs.length;
      return {
        currentHeadsignIndex: newIndex,
        currentTripID: newIndex
      };
    });
  };

  useEffect(() => {
    setIDTrip(selectedTripIDs[currentState.currentTripID]);
    setProgress(100); // Reset progress bar
  }, [currentState.currentTripID, selectedTripIDs]);


    const isStopIDOnThisLine = (stopId, filteredStops) =>{

      return filteredStops.some(stop => String(stop.stop_id) === String(stopId));

    };



  useEffect(() => {
    const checkThreeClicksForStations = async () => {
      const db = getDatabase();
      const stopsRef = ref(db, 'stops');

      try {
        const stopsSnapshot = await get(stopsRef);
        const stopsData = stopsSnapshot.val();

        if (stopsData) {
          Object.entries(stopsData).forEach(([stopId, stopData]) => {
            if (stopData && stopData.pressedBy && stopData.pressedBy.length >= 3 && isStopIDOnThisLine(stopId, filteredStops)) {
              // At least three users have pressed the button for this station
              setShowOverlay(true);
              setModalStationId(stopId);
            } /*else if (stopData.pressedBy.length < 3){
              setModalStationId(stopId);
            }*/
          });
        }
      } catch (error) {
        console.error('Error checking clicks for stations:', error);
      }
    };

    checkThreeClicksForStations();
  }, [filteredStops]);

// Funcția pentru a calcula distanța dintre două puncte GPS folosind formula haversine
const haversine = (lat1, lon1, lat2, lon2) => {
  const toRad = (x) => (x * Math.PI) / 180;

  const R = 6371; // Raza Pământului în km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return d; // Distanța în km
};

const estimateArrivalTime = (distance, speed) => {
  if (speed === 0) return "Staționat"; 
  if (speed < 0) return "N/A"; 

  const timeInHours = distance / speed; // Timpul în ore
  const timeInMinutes = timeInHours * 60; // Convertire în minute

  
  if (timeInMinutes < 5) {
    const currentDate = new Date(); 
    const currentHour = currentDate.getHours(); 
    const currentMinute = currentDate.getMinutes(); 

    // Adunăm timpul estimat la ora curentă
    const arrivalHour = currentHour + Math.floor((currentMinute + timeInMinutes) / 60);
    const arrivalMinute = Math.floor((currentMinute + timeInMinutes) % 60);

    return `${arrivalHour}:${arrivalMinute < 10 ? '0' : ''}${arrivalMinute}`; 
  } else {
    return `${Math.round(timeInMinutes)} minute`; 
  }
};


const calculateArrivalTimes = () => {
  const times = {};

  vehicles.forEach(vehicle => {
    filteredStops.forEach(stop => {
      const distance = haversine(vehicle.latitude, vehicle.longitude, stop.stop_lat, stop.stop_lon);
      const time = estimateArrivalTime(distance, vehicle.speed);
      if (!times[stop.stop_id] || time < times[stop.stop_id]) {
        times[stop.stop_id] = time;
      }
    });
  });

  setArrivalTimes(times);
};



const navigateToStation = (latitude, longitude) => {
  setInitialRegion({
    latitude,
    longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
};

  // Effect to start timer when overlay is shown
  useEffect(() => {
    if (modalStationId) {
      if (stopTimer) clearTimeout(stopTimer);
      const newTimer = setTimeout(() => deleteStopFromFirebase(modalStationId), 2 * 60 * 1000);
      setStopTimer(newTimer);
    //  setShowOverlay(false);
    }
  }, [showOverlay, modalStationId]);

  
const handleBellPress = async (stopId, stopLat, stop_lon) => {
 // console.log("bell pressed");
  const userId = auth.currentUser.uid; // Get the current user's ID
  const db = getDatabase();
  const stopRef = ref(db, 'stops/' + stopId);
  const proximityThreshold = 2; // Example threshold in kilometers --- DE MODIFICAT PENTRU ACURATETE MAI MARE

  try {
    
    // Get the current stop data
    const stopSnapshot = await get(stopRef);
    let stopData = stopSnapshot.val();

    if (!stopData) {
      // If no data exists for this stop, create a new entry
      stopData = { 
        pressedBy: [],
        pressedByNo: [],
        latitude: stopLat, // Add stop latitude
        longitude: stop_lon, // Add stop longitude
       };
    }

     // Calculate distance between user and stop
     const distance = haversine(currentLocation.latitude, currentLocation.longitude, stopLat, stop_lon);
     console.log("distance", distance);

     // Check if the user is in proximity of the stop
     if (distance <= proximityThreshold) {

      const currentTime = new Date().toISOString();
       // User is in proximity, handle bell press
       console.log(`User ${userId} is in proximity of stop ${stopId}`);
       
       // Add the current user's ID to the pressedBy array if it's not already present
       if (!stopData.pressedBy.some(entry => entry.userId === userId)) {
        stopData.pressedBy.push({ userId, date: currentTime });
       }
 
       // Check if the count of unique users pressing the button is three
       if (stopData.pressedBy.length === 3) {
         // Save the stop data to Firebase
         await set(stopRef, stopData);
         console.log(`Stop ${stopId} saved to Firebase`);
         setShowOverlay(true);
       } else {
         // Update the stop data in Firebase
         await update(stopRef, stopData);

         console.log(`User ${userId} pressed the bell for stop ${stopId}`);

       }
     } else {
       // User is not in proximity, display message
       alert("Nu esti suficient de aproape pentru a performa această acțiune.");
     }

     //setModalStationId(stopId);
     setShowOverlay(false);

  } catch (error) {
    console.error('Error handling bell press:', error);
  }
};
const handleModalButton1 = async () => {
  // Logic for handling button 1 in the modal
  console.log("Button 1 in modal pressed");

  const userId = auth.currentUser.uid; // Get the current user's ID

  const db = getDatabase();
  const stopRef = ref(db, `stops/${modalStationId}/`);
  const proximityThreshold = 2; // Example threshold in kilometers

  try {
    // Retrieve stop data from Firebase
    const stopSnapshot = await get(stopRef);
    const stopData = stopSnapshot.val();

    if (stopData) {
            
            const currentTime = new Date().toISOString();
           // Add the current user's ID to the pressedBy array if it's not already present
           if (!stopData.pressedBy.some(entry => entry.userId === userId)) {
            stopData.pressedBy.push({ userId, date: currentTime });
          }
      // Calculate distance between user and stop
      const distance = haversine(currentLocation.latitude, currentLocation.longitude, stopData.latitude, stopData.longitude);
      console.log("Distance to stop:", distance);

      // Check if the user is in proximity of the stop
      if (distance <= proximityThreshold) {
        // User is in proximity, proceed to push user's ID to pressedBy array
        await update(stopRef, stopData);
        console.log(`User ${userId} pressed the button at stop ${modalStationId}`);
        
        // Close the modal
        setShowOverlay(false);
      } else {
        // User is not in proximity, display a message or handle accordingly
        console.log("User is not in proximity to the stop.");
      }
    } else {
      console.log("Stop data not found.");
    }

    if (stopTimer) clearTimeout(stopTimer);
    setShowOverlay(false);

  } catch (error) {
    console.error('Error handling button press:', error);
  }
};

const handleModalButton2 = async () => {
  // Logic for handling button 2 in the modal
  console.log("Button 2 in modal pressed");
  const userId = auth.currentUser.uid; // Get the current user's ID

  const db = getDatabase();
  const stopRef = ref(db, `stops/${modalStationId}/`);
  const proximityThreshold = 2; // Example threshold in kilometers

  try{
  const stopSnapshot = await get(stopRef);
  let stopData = stopSnapshot.val();

  if (!stopData.pressedByNo) {
    stopData.pressedByNo = [];
  }

  const currentTime = new Date().toISOString();
  if (!stopData.pressedByNo.some(entry => entry.userId === userId)) {
    stopData.pressedByNo.push({ userId, date: currentTime });
  }
  

      // Calculate distance between user and stop
      const distance = haversine(currentLocation.latitude, currentLocation.longitude, stopData.latitude, stopData.longitude);
      console.log("Distance to stop:", distance);

      // Check if the user is in proximity of the stop
      if (distance <= proximityThreshold) {
        // User is in proximity, proceed to push user's ID to pressedBy array
        await update(stopRef, stopData);
        console.log(`User ${userId} pressed the button NO at stop ${modalStationId}`);
        
        // Close the modal
        setShowOverlay(false);
      } else {
        // User is not in proximity, display a message or handle accordingly
        console.log("User is not in proximity to the stop.");
      }
    

    if (stopTimer) clearTimeout(stopTimer);
    setShowOverlay(false);

  } catch (error) {
    console.error('Error handling button press:', error);
  }
};

const deleteStopFromFirebase = async (stopId) => {
  const db = getDatabase();
  const stopRef = ref(db, 'stops/' + stopId);
  try {
    await set(stopRef, null);
    console.log(`Stop ${stopId} deleted from Firebase`);
    setShowOverlay(false);
  } catch (error) {
    console.error('Error deleting stop:', error);
  }
};



  return (
    <View style={styles.container}>
      {/*<Text style={styles.lineTitle}>{lineParams.line}</Text>*/}
      {loading ? <ActivityIndicator size="small" color="#0000ff" /> : 
      <TouchableOpacity       
            onPress={handlePress} >
            <View style={styles.stopContainer}>
              <View style={styles.stopItem}>
                <Text style={styles.stopName}>{selectedTripHeadsign[currentHeadsignIndex]}</Text>
                <Text style={styles.arrivalTime}>{selectedTripIDs[currentTripID]}</Text>
              </View>
            </View>
            </TouchableOpacity>
}
            <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {showOverlay && (
<View style={styles.overlayContent}>
  <Text>Three users have pressed the button for station {modalStationId}!</Text>

  <Button
    onPress={handleModalButton1}
    title="Este tot acolo"
    color="#841584"
  />
  <Button
    onPress={handleModalButton2}
    title="Nu mai este"
    color="#33D7FF"
  />

<View style={styles.progressBarContainer}>
  <View style={[styles.progressBar1, { width: `${progressWidth}%` }]} />
  </View>

</View>

)}
      <MapView
        //initialRegion={initialRegion}
        region={initialRegion}
        showsUserLocation={true}
        style={styles.map}
      >
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Your Location"
          />
        )}
        
        {shapes.length > 0 && (
          <Polyline
            coordinates={shapes.map(shape => ({
              latitude: shape.shape_pt_lat,
              longitude: shape.shape_pt_lon
            }))}
            strokeColor="#FF0000"
            strokeWidth={3}
          />
        )}

    { filteredStops.map(stop => (
          <Marker
            key={stop.stop_id}
            coordinate={{
              latitude: stop.stop_lat,
              longitude: stop.stop_lon,
            }}
           // title={stop.stop_name}
            tracksViewChanges = {false}
            
          >
          <Image source={require('../assets/icons/station.png')}
      style={{
          width:20,
          height:20
      }}/>
        <Callout tooltip>
          <View style={styles.calloutContainer}>
            <Text style={styles.calloutTitle}>{stop.stop_name}</Text>
           </View>
        </Callout>

      </Marker>
        ))}

    {vehicles.map(vehicule => (
          <Marker
            key={vehicule.id}
            coordinate={{
              latitude: vehicule.latitude,
              longitude: vehicule.longitude,
            }}
           // title={`id:${vehicule.id}`}
            //description={`viteza:${vehicule.speed} km/h`}
            pinColor="blue"
            onPress={() => console.log(`id:${vehicule.id}`)}
          >
                  <Callout tooltip>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutTitle}>{`viteza:${vehicule.speed} km/h`}</Text>
              <Text style={styles.calloutTitle}>{`ultima actualizare:${vehicule.timestamp}`}</Text>
              {/*<Text style={styles.calloutDescription}>Descriere sau alte informații</Text>*/}
            </View>
          </Callout>

      </Marker>
        ))}

      </MapView>


     <SlidingUpPanel
     ref={c => this._panel = c}
     draggableRange={{ top: 600, bottom: 200 }} 
     allowDragging={true}
     showBackdrop={false}
     >
      <View style={styles.flatcontainer}>
      <View style={{ alignItems: 'center' }}>
    <Icon name="arrow-down" size={15} color="#0FF" />
  </View>
      {filteredStops.length > 0 && loading ? <ActivityIndicator size="small" color="#0000ff" /> : 
      <View style={styles.Slidecontainer}>
        <FlatList
          data={filteredStops}
          keyExtractor={(item) => item.stop_id}
          renderItem={({ item }) => (
            <TouchableOpacity       
            onPress={() => navigateToStation(item.stop_lat, item.stop_lon)}>
            <View style={styles.stopContainer}>
              <View style={styles.stopItem}>
                <Text style={styles.stopName}>{item.stop_name}</Text>
                <Text style={styles.arrivalTime}>{arrivalTimes[item.stop_id]}</Text>
                <TouchableOpacity 
                  style={styles.favoriteButton}
                  onPress={() =>  handleBellPress(item.stop_id, item.stop_lat, item.stop_lon)}
                  >
                  <Image source={require('../assets/icons/collector.png')} style={{ width: 20, height: 20}}/>
            </TouchableOpacity>

              </View>
            </View>

            </TouchableOpacity>
          )}
        
        />
          </View>
}
      </View>
      </SlidingUpPanel>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 35,
  },
  map: {
    flex: 1,
    marginBottom: 10,
  },
  bar: {
    height: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    backgroundColor: 'green',
  },
  flatcontainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  Slidecontainer: {
    flex: 1,
    backgroundColor: 'white',
    width: '100%',
  },
  stopContainer: {
    marginBottom: 10,
  },
  lineTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  stopItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    elevation: 3,
    flexWrap: 'wrap', 
  },
  stopName: {
    fontSize: 16,
    fontWeight: 'bold',
    maxWidth: '70%', 
  },
  arrivalTime: {
    fontSize: 16,
    maxWidth: '30%', 
    textAlign: 'right', 

  },
    progressBarContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginTop: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4caf50', 
    borderRadius: 5,
  },
  progressBar1: {
    height: '100%',
    backgroundColor: 'blue', 
    borderRadius: 5,
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
    marginBottom: 5, 
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,

    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5, 
  }}
);

export default VeziLinie;