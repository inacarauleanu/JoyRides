import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { ButtonGroup, Button, Image } from 'react-native-elements';
import { auth } from "../firebase-config.js";
import { getDatabase, ref, set, get, push, update } from "firebase/database";
import { firebase } from "../firebase-config.js";
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import Icon from 'react-native-vector-icons/FontAwesome'; 
import scraped_data_trams from "../server/scraped_data_trams.json"
import scraped_data_trols from "../server/scraped_data_trols.json"
import scraped_data_buses from "../server/scraped_data_buses.json"
import { Line } from 'react-native-svg';

const Rute = ({navigation}) => {
  const [busStops, setBusStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [selectedIndexes, setSelectedIndexes] = useState(0);
  const [lineNames, setLineNames] = useState([]);
  const [stops, setStops] = useState([]);
  const [mijloc, setMijloc] = useState(0);
  const [routes, setRoutes] = useState([]);


  const tryAPITranzy = async (mijloc) => {

    const url = 'https://api.tranzy.ai/v1/opendata/routes';
    const options = {
      method: 'GET',
      headers: {'X-Agency-Id': '8', Accept: 'application/json', 'X-API-KEY': 'kqZQV3y8d87sUvqLC6AFnPud6Gr1SFw1Ktk5kjNW'}
    };
    
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      let rute = [];
      if (mijloc == "trams") { rute = data.filter(obj => obj.route_type === 0);}
      if(mijloc == "trols") { rute = data.filter(obj => obj.route_type === 11); }
      if(mijloc == "buses") { rute = data.filter(obj => obj.route_type === 3); }

      console.log(rute);
      setRoutes(rute);
     // console.log(data);
    } catch (error) {
      console.error(error);
    }

  };

  useEffect (() => {
      tryAPITranzy(mijloc)
  }, [mijloc]);

  const transformKeys = (data) => {
    const transformedData = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const transformedKey = key.replace(/[.#$/\[\]]/g, '_'); 
        transformedData[transformedKey] = data[key];
      }
    }
    return transformedData;
  };


  const writeToDatabaseTrams = async () => {
    try {
      const db = getDatabase();
      const transformedData = transformKeys(scraped_data_trams)
      await set(ref(db, 'trams/'), {
        transformedData
      });
      console.log("s-a scris pentru trams");
    } catch (error) {
      console.error('Error writing to Firebase Realtime Database:', error);
    }
  };

  
  const writeToDatabaseTrols = async () => {
    try {
      const db = getDatabase();
      const transformedData = transformKeys(scraped_data_trols)
      set(ref(db, 'trols/'), {
        transformedData
      });
      console.log("s-a scris pentru trols");
    } catch (error) {
      console.error('Error writing to Firebase Realtime Database:', error);
    }
  };

  
  const writeToDatabaseBuses = async () => {
    try {
      const db = getDatabase();
      const transformedData = transformKeys(scraped_data_buses)
      set(ref(db, 'buses/'), {
        transformedData
      });
      console.log("s-a scris pentru buses");
    } catch (error) {
      console.error('Error writing to Firebase Realtime Database:', error);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  const scrapeTrams = async () => {
    try {
      const fetchData = async () => {
        const response = await fetch('http://192.168.100.20:3001/scrape/trams');
        const data = await response.json();
        //await writeToDatabaseTrams();
        setBusStops(data);
        console.log('Scraping completed successfully for trams');
        await writeToDatabaseTrams();
        //console.log(data);
        //setLineNames(extractLineNames(data));
      };
  
      // Initial scraping
      await fetchData();
      //await writeToDatabaseTrams();
      // Schedule scraping every 60 seconds
      const interval = setInterval(fetchData, 30000);
  
      // Return cleanup function to clear the interval on component unmount
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error scraping trams data:', error);
    }
  };

  const scrapeTrols = async () => {
    try {
      const fetchData = async () => {
        const response = await fetch('http://192.168.100.20:3001/scrape/trols');
        const data = await response.json();
        //writeToDatabaseTrols();
        setBusStops(data);
        console.log('Scraping completed successfully for trols');
        setLineNames(extractLineNames(data));
        writeToDatabaseTrols();
      };
  
      // Initial scraping
      await fetchData();
  
      // Schedule scraping every 60 seconds
      const interval = setInterval(fetchData, 30000);
  
      // Return cleanup function to clear the interval on component unmount
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error scraping trols data:', error);
    }
  };

  const scrapeBuses = async () => {
    try {
      const fetchData = async () => {
        const response = await fetch('http://192.168.100.20:3001/scrape/buses');
        const data = await response.json();
        //writeToDatabaseBuses();
        setBusStops(data);
        console.log('Scraping completed successfully for buses', data);
        setLineNames(extractLineNames(data));
        writeToDatabaseBuses();
      };
  
      // Initial scraping
      await fetchData();
  
      // Schedule scraping every 60 seconds
      const interval = setInterval(fetchData, 30000);
  
      // Return cleanup function to clear the interval on component unmount
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error scraping buses data:', error);
    }
  };


  const fetchData = async () => {
    try {
      setLoading(true);
      const db = getDatabase();
      setLoading(false);
              // Fetch favorites
              const userId = auth.currentUser.uid;
              const favoritesRef = ref(db, `users/${userId}/favorite/updatedFavorites`);
              const favoritesSnapshot = await get(favoritesRef);
              const favoritesData = favoritesSnapshot.val();
              if (favoritesData) {
                setFavorites(Object.values(favoritesData));
              }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const toggleFavorite = (line) => {
    const busWithLine = routes.find((route) => route.route_id === line.route_id);
  
    if (!busWithLine) {
      console.error(`No route found for route_id ${line.route_id}`);
      return;
    }
  
    const isFavorite = favorites.some((favItem) => favItem.route_id === line.route_id);
    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter((favItem) => favItem.route_id !== line.route_id);
      setFavorites(updatedFavorites);
      updateFavoritesInFirebase(updatedFavorites);
    } else {
      // Add to favorites
      const updatedFavorites = [...favorites, busWithLine];
      setFavorites(updatedFavorites);
      updateFavoritesInFirebase(updatedFavorites);
    }
  };
  
  
  const updateFavoritesInFirebase = (updatedFavorites) => {
    const userId = auth.currentUser.uid;
    const db = getDatabase();
    set(ref(db, `users/${userId}/favorite/updatedFavorites`), updatedFavorites);
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rute</Text>
      <ButtonGroup
      buttons={['Tramvaie', 'Autobuze', 'Troleibuze']}
      selectedIndex={selectedIndexes}
      onPress={(value) => {
        setSelectedIndexes(value);
        value == 0 ? setMijloc("trams") : (value == 1 ? setMijloc("buses") : setMijloc("trols"));
      }}
      containerStyle={styles.butonContainer}
      selectedButtonStyle = {styles.selectedButtonStyle}
      textStyle = {styles.textStyle}
      
    />
 <View>
 {/*<FlatList
  data={Object.entries(busStops)}
  keyExtractor={(item) => item[0]}
  renderItem={({ item }) => (
    <View>
      <Text>{item[0]}</Text>
      {Array.isArray(item[1]) ? (
        item[1].map((bus, index) => (
          <View key={index} >
          <TouchableOpacity onPress={() => handleItemClick(bus)} style={styles.itemContainer}>
          <View>
            <Text style={styles.name}>{bus.line}</Text>
            <Text>Stops:</Text>
            {bus.stops.map((stop, idx) => (
              <View key={idx}>
                <Text>Stop Name: {stop.stop_name}</Text>
                <Text>Arrival Time: {stop.arrival_time}</Text>
              </View>
            ))}
                <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(bus)}>
                <Icon name={favorites.some((favItem) => favItem.line === bus.line) ? 'heart' : 'heart-o'} size={30} color={Colors.babyOrange} />
              </TouchableOpacity>
          </View>
      
          </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text>Error: Data for route {item[0]} is not an array</Text>
      )}
      
    </View>

    
  )}
/>*/}

<FlatList
  data={routes}
  keyExtractor={(item) => item.route_id}
  renderItem={({ item }) => (
    <TouchableOpacity 
      onPress={() => {
       //const lineDetails =  getLineByName(item); 
       //setStops(lineDetails);
        //console.log(stops);
        //console.log("ITEM", item);
        navigation.navigate("VeziLinie", 
        {  
          //stops: lineDetails
          route_id: item.route_id
        });
      }} 
      style={styles.itemContainer}>
      <Text style={styles.name}>{item.route_short_name}</Text>
      <Text style={styles.longName}>{item.route_long_name}</Text>
      <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(item)}>
        <Icon name={favorites.some((favItem) => favItem.route_id === item.route_id) ? 'heart' : 'heart-o'} size={30} color={Colors.babyOrange} />
      </TouchableOpacity>
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
    alignContent: "center",
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    alignItems: 'center'
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 3,
    elevation: 3,
  },
  longName: {
    fontSize: 16,
    color: 'gray', // Adjust color as needed
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
  },
  butonContainer: {
    borderRadius: 50,
    backgroundColor: Colors.myLightGrey,
    elevation: 3,
       },
selectedButtonStyle:{
    backgroundColor: Colors.babyOrange
       },
       textStyle:{
        ...Fonts.basicText,
        color: Colors.black
        },

});

export default Rute;