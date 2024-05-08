import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from "expo-location";

const VeziLinie = ({ route }) => {
  // Extract stops data from route parameters
  const lineParams = route.params.stops;
  console.log("LINE PARAMS",lineParams);
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

  return (
    <View style={styles.container}>
      <Text style={styles.lineTitle}>{lineParams.line}</Text>
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
      </MapView>
      <View style={styles.flatcontainer}>
        <FlatList
          data={lineParams.stops}
          renderItem={({ item }) => (
            <View style={styles.stopContainer}>
              <View style={styles.stopItem}>
                <Text style={styles.stopName}>{item.stop_name}</Text>
                <Text style={styles.arrivalTime}>{item.arrival_time}</Text>
              </View>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
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
