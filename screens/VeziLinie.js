import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator} from 'react-native';
import MapView, { Marker, Polyline, Callout, CalloutSubview } from 'react-native-maps';
import * as Location from "expo-location";
import { auth } from "../firebase-config.js";
import { getDatabase, ref, set } from "firebase/database";

const VeziLinie = ({ route }) => {
  // Extract stops data from route parameters

  const [currentLocation, setCurrentLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [goToRegion, setGoToRegion] = useState(null);
  const [id_ruta, setIDRuta] = useState('');
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
  const [arrivalTimes, setArrivalTimes] = useState({});


  useEffect(() => {
    const idRutaParam = route.params.route_id;
   // console.log("LINE PARAMS", idRutaParam);
    setIDRuta(idRutaParam);
  })

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

  
  const getTripTranzy = async (id_ruta) => {

    setLoading(true);
    const url = 'https://api.tranzy.ai/v1/opendata/trips';
    const options = {
      method: 'GET',
      headers: {'X-Agency-Id': '8', Accept: 'application/json', 'X-API-KEY': 'kqZQV3y8d87sUvqLC6AFnPud6Gr1SFw1Ktk5kjNW'}
    };
    
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      let tripuri = data.filter(obj => obj.route_id === id_ruta);

      //console.log("tripuri", tripuri);
      setTrips(tripuri);

      const headsigns = tripuri.map(trip => trip.trip_headsign);
      setSelectedTripHeadsign(headsigns);

      const tripIDs = tripuri.map(trip => trip.trip_id);
      setSelectedTripIDs(tripIDs);
      setLoading(false); // Stop loading'

    } catch (error) {
      setLoading(false); // Stop loading in case of error
      console.error(error);
    }

  };

  useEffect (() => {
      getTripTranzy(id_ruta)
  }, [id_ruta]);

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

     // console.log(stops);
      setStops(stops);
      setLoading(false);

    } catch (error) {
      setLoading(false);
      console.error(error);
    }

  };

  useEffect (() => {
      getStopsTranzy(id_trip)
  }, [id_trip]);

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

      //console.log(shapeuri);
      setShapes(shapeuri);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }

  };

  useEffect (() => {
      getShapesTranzy(id_trip)
  }, [id_trip]);

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

      //console.log("STOPS", filteredStops);
      setFilteredStops(filteredStops);
      setLoading(false);

    } catch (error) {
      setLoading(false);
      console.error(error);
    }

  };

  useEffect (() => {
      getStopsNames(stops)
  }, [stops]);

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

      console.log("vehicles", vehicule);
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
    setCurrentHeadsignIndex(prevIndex => (prevIndex + 1) % selectedTripHeadsign.length);
    setCurrentcurrentTripID(prevIndex => (prevIndex + 1) % selectedTripIDs.length);
  };

  useEffect (() => {
    setIDTrip(selectedTripIDs[currentTripID]);
    getVehicles(selectedTripIDs[currentTripID]);
    setProgress(100); // Reset progress bar
    //console.log("TRIP_ID", id_trip);
}, [currentTripID, selectedTripIDs]);

/*function anuntaControl(stopID, stops) {
  const db = getDatabase();

  set(ref(db, 'statii/' + stopID + '/'), {

        stops: stops
  });
}*/

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

useEffect(() => {
  if (vehicles.length > 0 && filteredStops.length > 0) {
    calculateArrivalTimes();
  }
}, [vehicles, filteredStops]);

const navigateToStation = (latitude, longitude) => {
  setInitialRegion({
    latitude,
    longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
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
              {/*<Text style={styles.calloutDescription}>Descriere sau alte informații</Text>*/}
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
      <View style={styles.flatcontainer}>
      {filteredStops.length > 0 && loading ? <ActivityIndicator size="small" color="#0000ff" /> : 
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
                {/*<TouchableOpacity 
                  style={styles.favoriteButton}
                  onPress={anuntaControl(item.stop_id, item)}
                  >
                  <Image source={require('../assets/icons/collector.png')} style={{ width: 20, height: 20}}/>
            </TouchableOpacity>*/}

              </View>
            </View>

            </TouchableOpacity>
          )}
        />
}
      </View>
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
  flatcontainer: {
    flex: 0.4,
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
  },
  stopName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  arrivalTime: {
    fontSize: 16,
  },
    progressBarContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginTop: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4caf50', // Green color
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
  },
  calloutDescription: {
    fontSize: 14,
    color: '#555',
  },
});

export default VeziLinie;
