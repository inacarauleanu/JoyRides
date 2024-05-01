import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getDatabase, ref, onValue, off } from "firebase/database";
import { auth } from "../firebase-config.js";
import { Colors, Sizes, Fonts } from "../constants/styles.js";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = auth.currentUser.uid;
    const db = getDatabase();
    const userRef = ref(db, `users/${userId}/favorite/updatedFavorites`);

    const handleData = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setFavorites(data);
      } else {
        // cazul in care nu exista niciun favorit
        setFavorites([]);
      }
      setLoading(false);
    };

    const handleError = (error) => {
      console.error('Error fetching favorites from Firebase:', error);
      setLoading(false);
    };

    // cauta schimbari in baza de date
    const unsubscribe = onValue(userRef, handleData, handleError);

    // goleste listenerul
    return () => off(userRef, 'value', handleData);
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorite</Text>
      {favorites.length ? (
        <FlatList
          data={favorites}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Text style={styles.name}>{`${item.line}`}</Text>
              <Text>Stops:</Text>
              {item.stops.map((stop, idx) => (
              <View key={idx}>
                <Text>{stop.stop_name}:<Text>{stop.arrival_time}</Text></Text>
                
              </View>
            ))}
            </View>
          )}
          keyExtractor={(item) => item.line}
        />
      ) : (
        <Text>Nicio stație favorită</Text>
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
    alignContent:"center",
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
});

export default Favorites;
