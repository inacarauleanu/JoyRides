import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { auth } from "../firebase-config.js";
import { getDatabase, ref, set, get, push } from "firebase/database";
import { firebase } from "../firebase-config.js";
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import Icon from 'react-native-vector-icons/FontAwesome'; // Use the appropriate icon library

const Rute = () => {
  const [busStops, setBusStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getDatabase();
        const response = await get(ref(db, '/busStops'));
        const data = response.val();
        if (data) {
          const busStopsArray = Object.values(data);
          setBusStops(busStopsArray);
        }
        // Fetch favorites
        const userId = auth.currentUser.uid;
        const favoritesRef = ref(db, `users/${userId}/favorite/updatedFavorites`);
        const favoritesSnapshot = await get(favoritesRef);
        const favoritesData = favoritesSnapshot.val();
        if (favoritesData) {
          setFavorites(Object.values(favoritesData));
        }
      } catch (error) {
        console.error('Error fetching data from Firebase:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleFavorite = (item) => {
    const isFavorite = favorites.some((favItem) => favItem.id === item.id);
    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter((favItem) => favItem.id !== item.id);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stații</Text>
      {busStops.length ? (
        <FlatList
          data={busStops}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleItemClick(item)} style={styles.itemContainer}>
              <View style={{ padding: 10 }}>
                <Text style={styles.name}>{`${item.name}`}</Text>
                <Text>{`În timpul săptămânii: ${item.hours.weekday.arrival}-${item.hours.weekday.departure}`}</Text>
                <Text>{`Weekend: ${item.hours.weekend.arrival}-${item.hours.weekend.departure}`}</Text>
                <Text>{`Coordonate: ${item.location.latitude}, ${item.location.longitude}`}</Text>
              </View>
              <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(item)}>
                <Icon name={favorites.some((favItem) => favItem.id === item.id) ? 'heart' : 'heart-o'} size={30} color={Colors.babyOrange} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <Text>Nicio stație nu a fost găsită</Text>
      )}
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
});

export default Rute;
