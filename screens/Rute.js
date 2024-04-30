import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { ButtonGroup, Button, Image } from 'react-native-elements';
import { auth } from "../firebase-config.js";
import { getDatabase, ref, set, get, push } from "firebase/database";
import { firebase } from "../firebase-config.js";
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import Icon from 'react-native-vector-icons/FontAwesome'; // Use the appropriate icon library
import scraped_data_trams from "../server/scraped_data_trams.json"
import scraped_data_trols from "../server/scraped_data_trols.json"
import scraped_data_buses from "../server/scraped_data_buses.json"

const Rute = () => {
  const [busStops, setBusStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [selectedIndexes, setSelectedIndexes] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const db = getDatabase();
      let data;
      switch (selectedIndexes) {
        case 0:
          const tramsResponse = await get(ref(db, '/trams'));
          data = tramsResponse.val();
          break;
        case 1:
          const busesResponse = await get(ref(db, '/buses'));
          data = busesResponse.val();
          break;
        case 2:
          const trolsResponse = await get(ref(db, '/trols'));
          data = trolsResponse.val();
          break;
        default:
          data = {};
      }
      setBusStops(data);
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





  const toggleFavorite = (item) => {
    const isFavorite = favorites.some((favItem) => favItem.line === item.line);
    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter((favItem) => favItem.line !== item.line);
      setFavorites(updatedFavorites);
      updateFavoritesInFirebase(updatedFavorites);
    } else {
      // Add to favorites
      const updatedFavorites = [...favorites, item];
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

  const scrapeTrams = async () => {
    try {
      const response = await fetch('http://192.168.1.101:3001/scrape/trams');
      const data = await response.json();
      console.log('Scraping completed successfully for trams', JSON.stringify(data));
      // Handle scraped data as needed
    } catch (error) {
      console.error('Error scraping trams data:', error);
      // Handle error
    }
  };
  
  // Function to trigger scraping for trols
  const scrapeTrols = async () => {
    try {
      const response = await fetch('http://192.168.1.101:3001/scrape/trols');
      const data = await response.json();
      console.log('Scraping completed successfully for trols', JSON.stringify(data));
      // Handle scraped data as needed
    } catch (error) {
      console.error('Error scraping trols data:', error);
      // Handle error
    }
  };

  const scrapeBuses = async () => {
    try {
      const response = await fetch('http://192.168.1.101:3001/scrape/buses');
      const data = await response.json();
      console.log('Scraping completed successfully for buses', JSON.stringify(data));
      // Handle scraped data as needed
    } catch (error) {
      console.error('Error scraping buses data:', error);
      // Handle error
    }
  };

  const transformKeys = (data) => {
    const transformedData = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const transformedKey = key.replace(/[.#$/\[\]]/g, '_'); // Replace invalid characters with underscores
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
            writeToDatabaseTrams();
            break;
          case 1:
            scrapeBuses();
            writeToDatabaseBuses();
            break;
          case 2:
            scrapeTrols();
            writeToDatabaseTrols();
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
<FlatList
  data={Object.entries(busStops.transformedData)}
  keyExtractor={(item) => item[0]} // Use route key as the key extractor
  renderItem={({ item }) => (
    <View>
      {/*<Text>{item[0]}</Text> */}
      {Array.isArray(item[1]) ? (
        item[1].map((bus, index) => (
          <View key={index} >
          <TouchableOpacity onPress={() => handleItemClick(bus)} style={styles.itemContainer}>
          <View>
            <Text style={styles.name}>{bus.line}</Text>
            <Text>Stops:</Text>
            {bus.stops.map((stop, idx) => (
              <View key={idx}>
                {/*<Text>Stop Name: {stop.stop_name}</Text>
                <Text>Arrival Time: {stop.arrival_time}</Text>*/}
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
