import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from "expo-location";

const VeziLinie = ({ route }) => {
  // Extract stops data from route parameters

  const [currentLocation, setCurrentLocation] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const [id_ruta, setIDRuta] = useState('');
  const [trips, setTrips] = useState([]);
  const [selectedTripHeadsign, setSelectedTripHeadsign] = useState([]);
  const [currentHeadsignIndex, setCurrentHeadsignIndex] = useState(0);
  const [selectedTripIDs, setSelectedTripIDs] = useState([]);
  const [currentTripID, setCurrentcurrentTripID] = useState(0);
  const [id_trip, setIDTrip] = useState('');
  const [stops, setStops] = useState([]);
  const [filteredStops, setFilteredStops] = useState([]);

  useEffect(() => {
    const idRutaParam = route.params.route_id;
    console.log("LINE PARAMS", idRutaParam);
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

    const url = 'https://api.tranzy.ai/v1/opendata/trips';
    const options = {
      method: 'GET',
      headers: {'X-Agency-Id': '8', Accept: 'application/json', 'X-API-KEY': 'kqZQV3y8d87sUvqLC6AFnPud6Gr1SFw1Ktk5kjNW'}
    };
    
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      let tripuri = data.filter(obj => obj.route_id === id_ruta); 

      console.log(tripuri);
      setTrips(tripuri);

      const headsigns = tripuri.map(trip => trip.trip_headsign);
      setSelectedTripHeadsign(headsigns);

      const tripIDs = tripuri.map(trip => trip.trip_id);
      setSelectedTripIDs(tripIDs);

    } catch (error) {
      console.error(error);
    }

  };

  useEffect (() => {
      getTripTranzy(id_ruta)
  }, [id_ruta]);

  const getStopsTranzy = async (id_trip) => {

    const url = 'https://api.tranzy.ai/v1/opendata/stop_times';
    const options = {
      method: 'GET',
      headers: {'X-Agency-Id': '8', Accept: 'application/json', 'X-API-KEY': 'kqZQV3y8d87sUvqLC6AFnPud6Gr1SFw1Ktk5kjNW'}
    };
    
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      let stops = data.filter(obj => obj.trip_id === id_trip); 

      console.log(stops);
      setStops(stops);

    } catch (error) {
      console.error(error);
    }

  };

  useEffect (() => {
      getStopsTranzy(id_trip)
  }, [id_trip]);

  const getStopsNames = async (stops) => {

    const url = 'https://api.tranzy.ai/v1/opendata/stops';
    const options = {
      method: 'GET',
      headers: {'X-Agency-Id': '8', Accept: 'application/json', 'X-API-KEY': 'kqZQV3y8d87sUvqLC6AFnPud6Gr1SFw1Ktk5kjNW'}
    };
    
    try {
      const response = await fetch(url, options);
      const data = await response.json();

      const stopIds = stops.map(stop => stop.stop_id);
      const filteredStops = data.filter(stop => stopIds.includes(stop.stop_id));

      console.log("STOPS", filteredStops);
      setFilteredStops(filteredStops);

    } catch (error) {
      console.error(error);
    }

  };

  useEffect (() => {
      getStopsNames(stops)
  }, [stops]);

  const handlePress = () => {
    setCurrentHeadsignIndex(prevIndex => (prevIndex + 1) % selectedTripHeadsign.length);
    setCurrentcurrentTripID(prevIndex => (prevIndex + 1) % selectedTripIDs.length);

  };

  useEffect (() => {
    setIDTrip(selectedTripIDs[currentTripID]);
    console.log("TRIP_ID", id_trip);
}, [currentTripID, selectedTripIDs]);

  return (
    <View style={styles.container}>
      {/*<Text style={styles.lineTitle}>{lineParams.line}</Text>*/}
      <TouchableOpacity       
            onPress={handlePress} >
            <View style={styles.stopContainer}>
              <View style={styles.stopItem}>
                <Text style={styles.stopName}>{selectedTripHeadsign[currentHeadsignIndex]}</Text>
                <Text style={styles.arrivalTime}>{selectedTripIDs[currentTripID]}</Text>
              </View>
            </View>
            </TouchableOpacity>
      <MapView
        initialRegion={initialRegion}
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

    {filteredStops.map(stop => (
          <Marker
            key={stop.stop_id}
            coordinate={{
              latitude: stop.stop_lat,
              longitude: stop.stop_lon,
            }}
            title={stop.stop_name}
          />
        ))}
      </MapView>
      <View style={styles.flatcontainer}>
        <FlatList
          data={filteredStops}
          keyExtractor={(item) => item.stop_id}
          renderItem={({ item }) => (
            <TouchableOpacity       
            onPress={() => {

             }} >
            <View style={styles.stopContainer}>
              <View style={styles.stopItem}>
                <Text style={styles.stopName}>{item.stop_name}</Text>
              </View>
            </View>
            </TouchableOpacity>
          )}
        />
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
});

export default VeziLinie;
