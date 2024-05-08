import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { ButtonGroup, Button, Image } from 'react-native-elements';
import { auth } from "../firebase-config.js";
import { getDatabase, ref, set, get, push } from "firebase/database";
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
      set(ref(db, 'trams/'), {
        transformedData
      });
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
        const response = await fetch('http://192.168.1.102:3001/scrape/trams');
        const data = await response.json();
        setBusStops(data);
        console.log('Scraping completed successfully for trams');
        //console.log(data);
        //setLineNames(extractLineNames(data));
      };
  
      // Initial scraping
      await fetchData();
  
      // Schedule scraping every 30 seconds
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
        const response = await fetch('http://192.168.1.102:3001/scrape/trols');
        const data = await response.json();
        setBusStops(data);
        console.log('Scraping completed successfully for trols');
        setLineNames(extractLineNames(data));
      };
  
      // Initial scraping
      await fetchData();
  
      // Schedule scraping every 30 seconds
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
        const response = await fetch('http://192.168.1.102:3001/scrape/buses');
        const data = await response.json();
        setBusStops(data);
        console.log('Scraping completed successfully for buses', data);
        setLineNames(extractLineNames(data));
      };
  
      // Initial scraping
      await fetchData();
  
      // Schedule scraping every 30 seconds
      const interval = setInterval(fetchData, 30000);
  
      // Return cleanup function to clear the interval on component unmount
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error scraping buses data:', error);
    }
  };

const extractLineNames = (data) => {
  let lineNames = [];

  Object.values(data).forEach((routes) => {
    routes.forEach((route) => {
      lineNames.push(route.line);
    });
  });

  return lineNames;
};

const tramLineNames = extractLineNames(scraped_data_trams);
const trolLineNames = extractLineNames(scraped_data_trols);
const busLineNames = extractLineNames(scraped_data_buses);

/*console.log("Tram line names:", tramLineNames);
console.log("Trol line names:", trolLineNames);
console.log("Bus line names:", busLineNames);*/


  const fetchData = async () => {
    try {
      setLoading(true);
      const db = getDatabase();
      let data;
      /*switch (selectedIndexes) {
        case 0:
          setLineNames(tramLineNames);
          scrapeTrams();
          const tramsResponse = await get(ref(db, '/trams'));
          data = tramsResponse.val();
          break;
        case 1:
          /*scrapeBuses();
          const busesResponse = await get(ref(db, '/buses'));
          data = busesResponse.val();
          setLineNames(busLineNames);
          break;
        case 2:
          /*scrapeTrols();
          const trolsResponse = await get(ref(db, '/trols'));
          data = trolsResponse.val();
          setLineNames(trolLineNames);
          break;
        default:
          data = {};
      }*/
      //setBusStops(data);
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
    const busStopValues = Object.values(busStops);
    const busWithLine = busStopValues.find((busArray) =>
      busArray.find((bus) => bus.line === line)
    );
  
    if (!busWithLine) {
      console.error(`No bus stop data found for line ${line}`);
      return;
    }
  
    const isFavorite = favorites.some((favItem) => favItem.line === line);
    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter((favItem) => favItem.line !== line);
      setFavorites(updatedFavorites);
      updateFavoritesInFirebase(updatedFavorites);
    } else {
      // Add to favorites
      const updatedFavorites = [...favorites, busWithLine.find((bus) => bus.line === line)];
      setFavorites(updatedFavorites);
      updateFavoritesInFirebase(updatedFavorites);
    }
  };

  const getLineByName = (lineName) => {

    for (const key in busStops) {
      if (Object.hasOwnProperty.call(busStops, key)) {
        const lines = busStops[key];
        const line = lines.find((bus) => bus.line === lineName);
        if (line) {
          return line;
         
        }
      }
    }
  
    return null;
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
      onPress={(index) => {
        switch (index) {
          case 0:
            scrapeTrams();
            setLineNames(tramLineNames);
            //writeToDatabaseTrams();
            break;
          case 1:
            scrapeBuses();
            setLineNames(busLineNames);
           // writeToDatabaseBuses();
            break;
          case 2:
            scrapeTrols();
            setLineNames(trolLineNames);
            //writeToDatabaseTrols();
            break;
          default:
            break;
        }
        setSelectedIndexes(index);
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
  data={lineNames}
  keyExtractor={(item, index) => index.toString()}
  renderItem={({ item }) => (
    <TouchableOpacity 
      onPress={() => {
       const lineDetails =  getLineByName(item); 
       setStops(lineDetails);
        //console.log(stops);
        console.log("ITEM", item);
        navigation.navigate("VeziLinie", 
        {  
          stops: lineDetails
        });
      }} 
      style={styles.itemContainer}>
      <Text style={styles.name}>{item}</Text>
      <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(item)}>
        <Icon name={favorites.some((favItem) => favItem.line === item) ? 'heart' : 'heart-o'} size={30} color={Colors.babyOrange} />
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
    padding: 15,
    marginBottom: 15,
    elevation: 3,
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
