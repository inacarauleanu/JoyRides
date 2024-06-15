import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Modal, Alert} from 'react-native';
import { Button } from 'react-native-elements';
import MapView, { Marker, Polyline, Callout } from 'react-native-maps';
import * as Location from "expo-location";
import * as TaskManager from 'expo-task-manager';
import { auth } from "../firebase-config.js";
import { getDatabase, ref, set, get, update, push, remove, onValue, off} from "firebase/database";
import Icon from 'react-native-vector-icons/FontAwesome';
import SlidingUpPanel from 'rn-sliding-up-panel';
import * as BackgroundFetch from 'expo-background-fetch';
import { startBackgroundLocationUpdates, stopBackgroundLocationUpdates } from "./BackgroundTasks.js";
import * as Notifications from "expo-notifications";

const VeziLinie = ({ route }) => {

  const [currentLocation, setCurrentLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTripHeadsigns, setSelectedTripHeadsigns] = useState([]);
  const [selectedTripIDs, setSelectedTripIDs] = useState([]);
  const [id_trip, setIDTrip] = useState('');
  const [id_headsign, setIDHeadsign] = useState('');
  const [stops, setStops] = useState([]);
  const [filteredStops, setFilteredStops] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [progress, setProgress] = useState(100);
  const [shapes, setShapes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [arrivalTimes, setArrivalTimes] = useState({});
  const [currentState, setCurrentState] = useState({
    currentHeadsignIndex: 0,
    currentTripID: 0 
  });
  const [showOverlay, setShowOverlay] = useState(false);
  const [showOverlayVehicul, setShowOverlayVehicul] = useState(false);
  const [modalStationId, setModalStationId] = useState(null);
  const [progressWidth, setProgressWidth] = useState('100%');
  const [progressWidthVehicul, setProgressWidthVehicul] = useState('100%');
  const [modalVisible, setModalVisible] = useState(false);
  const [stopModalVisible, setStopModalVisible] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [selectedStopId, setSelectedStopId] = useState(null);
  const [selectedVehicleIdForOverlay, setSelectedVehicleIdForOverlay] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [heading, setHeading] = useState(null);
  const [butonStopShare, setButonStopShare] = useState(false);
  const [locations, setLocations] = useState({});



  useEffect(() => {
    const duration = 10000; // (10 secunde)
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

    return () => clearInterval(interval); 
  }, []);

  useEffect(() => {
    const duration = 10000; // (10 secunde)
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(duration - elapsedTime, 0);
      const remainingProgress = (remainingTime / duration) * 100;
      setProgressWidthVehicul(remainingProgress);

      if (remainingTime === 0) {
        clearInterval(interval);
        setShowOverlayVehicul(false);
      }
    }, 100); // Update progress every 100 milliseconds

    return () => clearInterval(interval); 
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
      setSelectedTripHeadsigns(headsigns);
      //console.log(headsigns);

      const tripIDs = tripuri.map(trip => trip.trip_id);
      setSelectedTripIDs(tripIDs);
      setLoadingTrips(false); 
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

    return () => clearInterval(progressInterval); 
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
    setIDHeadsign(selectedTripHeadsigns[currentState.currentHeadsignIndex]);
    setProgress(100); // Reset progress bar
  }, [currentState.currentTripID, selectedTripIDs]);


    const isStopIDOnThisLine = (stopId) =>{

      return filteredStops.some(stop => String(stop.stop_id) === String(stopId));

    };

    const isVehicleIDOnThisLine = (vehicleId) =>{

      return vehicles.some(vehicul => String(vehicul.id) === String(vehicleId));

    };

  useEffect(() => {
    const checkThreeClicksForStations = async () => {
      const db = getDatabase(); 
      const stopsRef = ref(db, 'stops');
      const currentUser =  auth.currentUser.uid;
 
      try {
        const stopsSnapshot = await get(stopsRef);
        const stopData = stopsSnapshot.val();

        if (stopData) {
          let stationFound = false;

          Object.entries(stopData).forEach(([stopId, stopData]) => {
            if (stopData && stopData.pressedBy && stopData.pressedBy.length >= 3 && isStopIDOnThisLine(stopId)) {

             // console.log("Condition 1 satisfied for stopId:", stopId);
             const userInPressedBy = stopData.pressedBy.some(entry => entry.userId === currentUser);
             // Verificăm dacă utilizatorul curent nu este în pressedByNo
             const userInPressedByNo = stopData.pressedByNo && stopData.pressedByNo.some(entry => entry.userId === currentUser);
 
             if (!userInPressedBy && !userInPressedByNo) {
              if (!stationFound) {

              if (stopData.pressedByNo && (stopData.pressedByNo.length > (stopData.pressedBy.length / 2))) {
                  setShowOverlay(false);
                //  console.log("Condition 2 satisfied for stopId:", stopId);
                //  console.log("Setting showOverlay to false for stopId:", stopId);
              } else {
                  setShowOverlay(true);
                  setModalStationId(stopId); 
                 // console.log("Condition 3 satisfied for stopId:", stopId);
                 // console.log("Setting showOverlay to true and modalStationId to", stopId);
              }
                 stationFound = true; 
          }
        }
      }
          });
        }
      } catch (error) {
        console.error('Error checking clicks for stations:', error); 
      }
    };
    checkThreeClicksForStations();
  }, [filteredStops]);
 
  useEffect(() => {
    const checkThreeClicksForVehicles = async () => {
      const db = getDatabase(); 
      const vehicleRef = ref(db, 'vehicule');
      const currentUser =  auth.currentUser.uid;
 
      try {
        const vehicleSnapshot = await get(vehicleRef);
        const vehicleData = vehicleSnapshot.val();
      
        if (vehicleData) {
          let vehicleFound = false;

          Object.entries(vehicleData).forEach(([vehicleId, vehicleData]) => {
            if (vehicleData && vehicleData.pressedBy && vehicleData.pressedBy.length >= 3 && isVehicleIDOnThisLine(vehicleId)) 
            {
             // console.log("Condition 1 satisfied for stopId:", stopId);
             const userInPressedBy = vehicleData.pressedBy.some(entry => entry.userId === currentUser);
             // Verificăm dacă utilizatorul curent nu este în pressedByNo
             const userInPressedByNo = vehicleData.pressedByNo && vehicleData.pressedByNo.some(entry => entry.userId === currentUser);
 
             if (!userInPressedBy && !userInPressedByNo) {
              if (!vehicleFound) {

              if (vehicleData.pressedByNo && (vehicleData.pressedByNo.length > (vehicleData.pressedBy.length / 2))) {
                  setShowOverlayVehicul(false);
                //  console.log("Condition 2 satisfied for stopId:", stopId);
                //  console.log("Setting showOverlay to false for stopId:", stopId);
              } else {
                  setShowOverlayVehicul(true);
                  setSelectedVehicleIdForOverlay(vehicleId);
                 // console.log("Condition 3 satisfied for stopId:", stopId);
                 // console.log("Setting showOverlay to true and modalStationId to", stopId);
              }
                 vehicleFound = true; 
          }
        }
        }
          
          });
        }
      } catch (error) {
        console.error('Error checking clicks for vehicles:', error); 
      }
    };
    checkThreeClicksForVehicles();
  }, [vehicles]);
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

  
  if (timeInMinutes > 5) {
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

  
const handleBellPress = async (stopId, stopLat, stop_lon) => {
 // console.log("bell pressed");
  const userId = auth.currentUser.uid; // Get the current user's ID
  const db = getDatabase();
  const stopRef = ref(db, 'stops/' + stopId);
  const proximityThreshold = 2; // Example threshold in kilometers --- DE MODIFICAT PENTRU ACURATETE MAI MARE

  try {
    
    const stopSnapshot = await get(stopRef);
    let stopData = stopSnapshot.val();

    if (!stopData) {

      stopData = { 
        lastUpdate: null,
        pressedBy: [],
        pressedByNo: [],
        latitude: stopLat, 
        longitude: stop_lon, 
       };
    }

     const distance = haversine(currentLocation.latitude, currentLocation.longitude, stopLat, stop_lon);
     console.log("distance", distance);

    if (distance <= proximityThreshold) 
    {

        const currentTime = new Date().toISOString();
        console.log(`User ${userId} is in proximity of stop ${stopId}`);
        
        if (!stopData.pressedBy.some(entry => entry.userId === userId)) 
          {
              stopData.pressedBy.push({ userId, date: currentTime });
          }
        
        stopData.lastUpdate = currentTime;

        if (stopData.pressedBy.length === 3) 
          {
          await set(stopRef, stopData);
          console.log(`Stop ${stopId} saved to Firebase`);
      //    setShowOverlay(true);
        } 
            else 
            {
            await update(stopRef, stopData);
            console.log(`User ${userId} pressed the bell for stop ${stopId}`);
            alert(`Ai raportat control RATT pentru statia ${stopId}`);
            }
     }
      else 
      {
       alert("Nu esti suficient de aproape pentru a performa această acțiune.");
      }


  } catch (error) {
    console.error('Error handling bell press:', error);
  }
};

const handleOverlayButtonYes = async () => {

  console.log("Button 1 in modal pressed");

  const userId = auth.currentUser.uid; 

  const db = getDatabase();
  const stopRef = ref(db, `stops/${modalStationId}/`);
  const proximityThreshold = 2; 

  try {

    const stopSnapshot = await get(stopRef);
    const stopData = stopSnapshot.val();

    if (stopData) {
            
            const currentTime = new Date().toISOString();

           if (!stopData.pressedBy.some(entry => entry.userId === userId)) {
            stopData.pressedBy.push({ userId, date: currentTime });
          }

      const distance = haversine(currentLocation.latitude, currentLocation.longitude, stopData.latitude, stopData.longitude);
      console.log("Distance to stop:", distance);

      stopData.lastUpdate = currentTime;


      if (distance <= proximityThreshold) {

        await update(stopRef, stopData);
        console.log(`User ${userId} pressed the button at stop ${modalStationId}`);
        setShowOverlay(false);

      } else {
        // User is not in proximity, display a message or handle accordingly
        console.log("User is not in proximity to the stop.");
	 alert("Nu esti suficient de aproape pentru a raporta.");
      }
    } else {
      console.log("Stop data not found.");
    }

  } catch (error) {
    console.error('Error handling button press:', error);
  }
};

const handleOverlayButtonNo = async () => {

  console.log("Button 2 in modal pressed");
  const userId = auth.currentUser.uid; 

  const db = getDatabase();
  const stopRef = ref(db, `stops/${modalStationId}/`);
  const proximityThreshold = 2; 

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

      const distance = haversine(currentLocation.latitude, currentLocation.longitude, stopData.latitude, stopData.longitude);
      console.log("Distance to stop:", distance);

      stopData.lastUpdate = currentTime;

      if (distance <= proximityThreshold) {

        await update(stopRef, stopData);
        console.log(`User ${userId} pressed the button NO at stop ${modalStationId}`);
	alert(`Ai raportat control RATT pentru statia ${modalStationId}`);
        setShowOverlay(false);

      } else {
        console.log("User is not in proximity to the stop.");
	alert("Nu esti suficient de aproape pentru a raporta.");
      }
    
  } catch (error) {
    console.error('Error handling button press:', error);
  }
};

useEffect(() => {
  const deleteStopsIfNotUpdated = async () => {
    const db = getDatabase(); 
    const stopsRef = ref(db, 'stops');

    try {
      const stopsSnapshot = await get(stopsRef);
      const stopsData = stopsSnapshot.val();

      if (stopsData) {
        Object.entries(stopsData).forEach(([stopId, stopData]) => {
          if (stopData && stopData.lastUpdate) {
            const lastUpdateTimestamp = Date.parse(stopData.lastUpdate); // Convertim timpul în milisecunde
            const currentTimestamp = new Date().getTime();
            const twoMinutesInMillis = 2 * 60 * 1000; // 2 minute în milisecunde

            // Verifică dacă ultima actualizare a fost mai veche de 2 minute
            if (currentTimestamp - lastUpdateTimestamp > twoMinutesInMillis) {
              // Șterge stația din Firebase
              deleteStopFromFirebase(stopId);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error deleting stops:', error);
    }
  };

  const intervalId = setInterval(deleteStopsIfNotUpdated, 2 * 60 * 1000); // Verifică la fiecare 2 minute

  return () => clearInterval(intervalId);
}, []);

const deleteStopFromFirebase = async (stopId) => {
  const db = getDatabase();
  const stopRef = ref(db, 'stops/' + stopId);
  
  try {
    await set(stopRef, null);
    console.log(`Stop ${stopId} deleted from Firebase`);
  } catch (error) {
    console.error('Error deleting stop:', error);
  }
};


const handleMarkerPress = (vehicleId) => {
  //const selected = vehicles.find(vehicle => vehicle.id === vehicleId);
  setSelectedVehicleId(vehicleId);
 // setSelectedVehicle(selected);
 // console.log("vehicul selectat", selected);
  setModalVisible(true);
};

const handleStopMarkerPress = (stop_id) => {
  //const selected = vehicles.find(vehicle => vehicle.id === vehicleId);
  setSelectedStopId(stop_id);
 // setSelectedVehicle(selected);
 // console.log("vehicul selectat", selected);
  setStopModalVisible(true);
};

useEffect(() => {
  if (selectedVehicleId) {
    const selected = vehicles.find(vehicle => vehicle.id === selectedVehicleId);
    setSelectedVehicle(selected);
  }
 // console.log(selectedVehicle);
}, [selectedVehicleId, vehicles]);


const handleControlPressVehicul = async (vehicleId) => {
  // console.log("bell pressed");
   const userId = auth.currentUser.uid; // Get the current user's ID
   const db = getDatabase();
   const vehicleRef = ref(db, 'vehicule/' + vehicleId);
   const proximityThreshold = 2; // Example threshold in kilometers --- DE MODIFICAT PENTRU ACURATETE MAI MARE
 
   try {
     
     const vehicleSnapshot = await get(vehicleRef);
     let vehicleData = vehicleSnapshot.val();
 
     if (!vehicleData) {
 
      vehicleData = { 
         lastUpdate: null,
         pressedBy: [],
         pressedByNo: [],
         latitude: selectedVehicle.latitude, 
         longitude: selectedVehicle.longitude, 
         defectiune: []
        };
     }
 
      const distance = haversine(currentLocation.latitude, currentLocation.longitude, selectedVehicle.latitude, selectedVehicle.longitude);
      console.log("distance", distance);
 
     if (distance <= proximityThreshold) 
     {
 
         const currentTime = new Date().toISOString();
        // console.log(`User ${userId} is in proximity of stop ${stopId}`);
         
         if (!vehicleData.pressedBy.some(entry => entry.userId === userId)) 
           {
            vehicleData.pressedBy.push({ userId, date: currentTime });
           }
         
           vehicleData.lastUpdate = currentTime;
           vehicleData.latitude = selectedVehicle.latitude;
           vehicleData.longitude = selectedVehicle.longitude;
 
         if (vehicleData.pressedBy.length === 3) 
           {
           await set(vehicleRef, vehicleData);
           console.log(`Vehicle ${vehicleId} saved to Firebase`);
         //  setShowOverlayVehicul(true);
           setModalVisible(false);
         } 
             else 
             {
             await update(vehicleRef, vehicleData);
             console.log(`User ${userId} pressed the bell for vehicle ${vehicleId}`);
             alert("Ați raportat cu succes un control RATT. Mulțumim!");
             }
      
       }else 
       {
        alert("Nu esti suficient de aproape pentru a performa această acțiune.");
       } 
 
 
   } catch (error) {
     console.error('Error handling bell press for control:', error);
   }
 };
 
 const handleDefecțiunePressVehicul = async (vehicleId) => {
  // console.log("bell pressed");
   const userId = auth.currentUser.uid; // Get the current user's ID
   const db = getDatabase();
   const vehicleRef = ref(db, 'vehicule/' + vehicleId);
   const proximityThreshold = 2; // Example threshold in kilometers --- DE MODIFICAT PENTRU ACURATETE MAI MARE
 
   try {
     
     const vehicleSnapshot = await get(vehicleRef);
     let vehicleData = vehicleSnapshot.val();
 
     if (!vehicleData) {
 
      vehicleData = { 
         lastUpdate: null,
         pressedBy: [],
         latitude: selectedVehicle.latitude, 
         longitude: selectedVehicle.longitude, 
         defectiune: []
        };
     }
 
      const distance = haversine(currentLocation.latitude, currentLocation.longitude, selectedVehicle.latitude, selectedVehicle.longitude);
      console.log("distance", distance);
 
     if (distance <= proximityThreshold) 
     {
 
         const currentTime = new Date().toISOString();
        // console.log(`User ${userId} is in proximity of stop ${stopId}`);
         
         if (!vehicleData.defectiune.some(entry => entry.userId === userId)) 
           {
            vehicleData.defectiune.push({ userId, date: currentTime });
           }
         
           vehicleData.lastUpdate = currentTime;
           vehicleData.latitude = selectedVehicle.latitude;
           vehicleData.longitude = selectedVehicle.longitude;
 
         if (vehicleData.defectiune.length === 3) 
           {
           await set(vehicleRef, vehicleData);
           console.log(`Vehicle ${vehicleId} saved to Firebase`);
           //setShowOverlayVehicul(true);
           setModalVisible(false);
         } 
             else 
             {
             await update(vehicleRef, vehicleData);
             console.log(`User ${userId} pressed the bell for vehicle ${vehicleId}`);
             alert(`Ați raportat cu succes o defecțiune la vehiculul ${vehicleId} RATT. Mulțumim!`);
             }
      
       }else 
       {
        alert("Nu esti suficient de aproape pentru a performa această acțiune.");
       } 
 
 
   } catch (error) {
     console.error('Error handling bell press for defectiune:', error);
   }
 };

 const handleModalButtonYes = async () => {

  console.log("Button 1 in modal pressed");

  const userId = auth.currentUser.uid; 

  const db = getDatabase();
  const vehicleRef = ref(db, `vehicule/${selectedVehicleIdForOverlay}/`);
  const proximityThreshold = 2; 

  try {

    const vehicleSnapshot = await get(vehicleRef);
    const vehicleData = vehicleSnapshot.val();

    if (vehicleData) {
            
            const currentTime = new Date().toISOString();

           if (!vehicleData.pressedBy.some(entry => entry.userId === userId)) {
            vehicleData.pressedBy.push({ userId, date: currentTime });
          }

      const distance = haversine(currentLocation.latitude, currentLocation.longitude, selectedVehicle.latitude, selectedVehicle.longitude);
      console.log("Distance to stop:", distance);

      vehicleData.lastUpdate = currentTime;


      if (distance <= proximityThreshold) {

        await update(vehicleRef, vehicleData);
        console.log(`User ${userId} pressed the button at vehicle ${selectedVehicleIdForOverlay}`);
        setShowOverlayVehicul(false);
	alert(`Ați raportat cu succes un control RATT at vehicle ${selectedVehicleIdForOverlay}. Mulțumim!`);

      } else {
        // User is not in proximity, display a message or handle accordingly
        console.log("User is not in proximity to the vehicule.");
	alert("nu esti suficient de aproape pentru a raporta");
      }
    } else {
      console.log("Vehicle data not found.");
    }

  } catch (error) {
    console.error('Error handling button press:', error);
  }
};

const handleModalButtonNo = async () => {

  console.log("Button 2 in modal pressed");
  const userId = auth.currentUser.uid; 

  const db = getDatabase();
  const vehicleRef = ref(db, `vehicule/${selectedVehicleIdForOverlay}/`);
  const proximityThreshold = 2; 

  try{
  const vehicleSnapshot = await get(vehicleRef);
  let vehicleData = vehicleSnapshot.val();

  if (!vehicleData.pressedByNo) {
    vehicleData.pressedByNo = [];
  }

  const currentTime = new Date().toISOString();
  if (!vehicleData.pressedByNo.some(entry => entry.userId === userId)) {
    vehicleData.pressedByNo.push({ userId, date: currentTime });
  }

      const distance = haversine(currentLocation.latitude, currentLocation.longitude, selectedVehicle.latitude, selectedVehicle.longitude);
      console.log("Distance to stop:", distance);

      vehicleData.lastUpdate = currentTime;

      if (distance <= proximityThreshold) {

        await update(vehicleRef, vehicleData);
        console.log(`User ${userId} pressed the button NO at vehicle ${selectedVehicleIdForOverlay}`);
	 alert(`Ați raportat cu succes un control RATT at vehicle ${selectedVehicleIdForOverlay}. Mulțumim!`);
        setShowOverlayVehicul(false);
	
      } else {
        console.log("User is not in proximity to the vehicule.");
	alert("nu esti suficient de aproape pentru a raporta");
      }
    
  } catch (error) {
    console.error('Error handling button press:', error);
  }
};

useEffect(() => {
  const deleteStopsIfNotUpdated = async () => {
    const db = getDatabase(); 
    const vehicleRef = ref(db, 'vehicule');

    try {
      const vehicleSnapshot = await get(vehicleRef);
      const vehicleData = vehicleSnapshot.val();

      if (vehicleData) {
        Object.entries(vehicleData).forEach(([vehicleId, vehicleData]) => {
          if (vehicleData && vehicleData.lastUpdate) {
            const lastUpdateTimestamp = Date.parse(vehicleData.lastUpdate); // Convertim timpul în milisecunde
            const currentTimestamp = new Date().getTime();
            const twoMinutesInMillis = 2 * 60 * 1000; // 2 minute în milisecunde

            // Verifică dacă ultima actualizare a fost mai veche de 2 minute
            if (currentTimestamp - lastUpdateTimestamp > twoMinutesInMillis) {
              // Șterge stația din Firebase
              deleteVehicleFromFirebase(vehicleId);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error deleting vehicles:', error);
    }
  };

  const intervalId = setInterval(deleteStopsIfNotUpdated, 2 * 60 * 1000); // Verifică la fiecare 2 minute

  return () => clearInterval(intervalId);
}, []);

const deleteVehicleFromFirebase = async (vehicleId) => {
  const db = getDatabase();
  const vehicleRef = ref(db, 'vehicule/' + vehicleId);
  
  try {
    await set(vehicleRef, null);
    console.log(`Vehicle ${vehicleId} deleted from Firebase`);
  } catch (error) {
    console.error('Error deleting vehicule:', error);
  }
};



const handleShareLocation = (selectedStopId) => {
  Alert.alert(
    'Partajare Locație',
    'Doriți să partajați locația dvs. în timp real?',
    [
      {
        text: 'Nu',
        onPress: () => {setStopModalVisible(false)},
        style: 'cancel',
      },
      {
        text: 'Da',
        //onPress:() => {requestPermissions}
        onPress: async () => {
          setButonStopShare(true);
          await startBackgroundLocationUpdates();
        },
      },
    ],
    { cancelable: false }
  );
};

const handleStopShareLocation = async () => {
  await stopBackgroundLocationUpdates();
  const userId = auth.currentUser.uid;
  const db = getDatabase();
  const locationRef = ref(db, `locations/${userId}`);
  await set(locationRef, null);
  setButonStopShare(false);
};


useEffect(() => {
  const database = getDatabase();
  const locationsRef = ref(database, 'locations');

  // Ascultarea modificărilor în baza de date Firebase
  const handleData = snapshot => {
    if (snapshot.exists()) {
      setLocations(snapshot.val());
    }
  };

  // Activarea ascultătorului pentru modificări în locații
  const unsubscribe = onValue(locationsRef, handleData);

  // Dezactivarea ascultătorului când componenta este demontată
  return () => {
    off(locationsRef, 'value', handleData);
  };
}, []);

  return (
    <View style={styles.container}>
      {/*<Text style={styles.lineTitle}>{lineParams.line}</Text>*/}
      {loading ? <ActivityIndicator size="small" color="#0000ff" /> : 
      <TouchableOpacity       
            onPress={handlePress} >
            <View style={styles.stopContainer}>
              <View style={styles.stopItem}>
                <Text style={styles.stopName}>{id_headsign}</Text>
                <Text style={styles.arrivalTime}>{id_trip}</Text>
              </View> 
            </View>
            </TouchableOpacity>
}
            <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>

      {butonStopShare && (
                   <Button
                   title={"Nu mai trimite locația"}
                  onPress= {handleStopShareLocation}
                 />
      )}

   
     
      {showOverlay && (
<View style={styles.overlayContent}>
  <Text>Three users have pressed the button for station {modalStationId}!</Text>

  <Button
    onPress={handleOverlayButtonYes}
    title="Este tot acolo"
    color="#841584"
  />
  <Button
    onPress={handleOverlayButtonNo}
    title="Nu mai este"
    color="#33D7FF"
  />

<View style={styles.progressBarContainer}>
  <View style={[styles.progressBar1, { width: `${progressWidth}%` }]} />
  </View>

</View>

)}

{showOverlayVehicul && (
<View style={styles.overlayContent}>
  <Text>Three users have pressed the button for vehicle {selectedVehicleIdForOverlay}!</Text>

  <Button 
    onPress={handleModalButtonYes}
    title="Este tot acolo"
    color="#841584"
  />
  <Button
    onPress={handleModalButtonNo}
    title="Nu mai este"
    color="#33D7FF"
  />

<View style={styles.progressBarContainer}>
  <View style={[styles.progressBar1, { width: `${progressWidthVehicul}%` }]} />
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
            title="Aici ești tu"
          />
        )}
       {/* {Object.keys(userLocations).length > 0 && Object.keys(userLocations).map((userId) => (
            <Marker
              key={userId}
              coordinate={{
                latitude: userLocations[userId].latitude,
                longitude: userLocations[userId].longitude,
              }}
              title={`User: ${userId}`}
              //description={`Heading: ${userLocations[userId].heading}°`}
              pinColor="green"
            />
          ))}  */}


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
            onPress={() =>handleStopMarkerPress(stop.stop_id)}
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
             // title={`id:${vehicule.id}`}s
            //description={`viteza:${vehicule.speed} km/h`}
            pinColor="blue"
            onPress={() =>handleMarkerPress(vehicule.id)}
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

    {Object.keys(locations).map(key => (
          <Marker
            key={key}
            coordinate={{
              latitude: locations[key].latitude,
              longitude: locations[key].longitude,
            }}
            title={key}
            pinColor="green"
          />
        ))}

      </MapView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
            <View style={styles.centeredView}>
          <View style={styles.modalView}>
          <TouchableOpacity 
                  style={styles.favoriteButtonModal}
                  onPress={() => setModalVisible(false)}
                  >
                  <Image source={require('../assets/icons/close.png')} style={{ width: 30, height: 30}}/>
                  
            </TouchableOpacity>
            <Text style={styles.modalText}>Ce ai vrea să raportrezi despre vehiculul {selectedVehicleId} ?</Text>
            <View style={styles.buttonRow}>
            <View style={styles.buttonContainer}>
            <TouchableOpacity 
                  style={styles.favoriteButtonModal}
                  onPress={() => handleControlPressVehicul(selectedVehicleId) /*console.log('Action 1 clicked')*/}
                  >
                  <Image source={require('../assets/icons/collector.png')} style={styles.iconModal}/>
                  <Text style={styles.buttonText}>Control</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
            <TouchableOpacity 
                  style={styles.favoriteButtonModal}
                  onPress={() =>  handleDefecțiunePressVehicul(selectedVehicleId)}
                  >
                  <Image source={require('../assets/icons/defect.png')} style={{ width: 30, height: 30}}/>
                  <Text style={styles.buttonText}>Defecțiune</Text>
            </TouchableOpacity>
            </View>
            </View>
            </View>
            </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={stopModalVisible}
        onRequestClose={() => setStopModalVisible(false)}
      >
            <View style={styles.centeredView}>
          <View style={styles.modalView}>
          <TouchableOpacity 
                  style={styles.favoriteButtonModal}
                  onPress={() => setStopModalVisible(false)}
                  >
                  <Image source={require('../assets/icons/close.png')} style={{ width: 30, height: 30}}/>
                  
            </TouchableOpacity>
            <Text style={styles.modalText}>Ce ai vrea să raportrezi despre statia {selectedStopId} ?</Text>
            <View style={styles.buttonRow}>
            <View style={styles.buttonContainer}>
            <TouchableOpacity 
                  style={styles.favoriteButtonModal}
                  onPress={() =>  handleShareLocation(selectedStopId)}
                  >
                  <Image source={require('../assets/icons/share-location.png')} style={{ width: 30, height: 30}}/>
                  <Text style={styles.buttonText}>Mijloc lipsă</Text>
            </TouchableOpacity>
            </View>
            </View>
            </View>
            </View>
      </Modal>

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
  favoriteButtonModal: {
    alignItems: 'center',
    justifyContent: 'center',

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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonText: {
    textAlign: 'center',
    width: '100%',
    marginTop: 5,
    maxWidth: '100%', 
  },
  buttonContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  iconModal: {
    width: 30,
    height: 30,
    alignContent: 'center'
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
