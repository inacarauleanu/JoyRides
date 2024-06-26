import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getDatabase, ref, onValue, off } from "firebase/database";
import { auth } from "../firebase-config.js";
import { Colors, Sizes, Fonts } from "../constants/styles.js";
import { SafeAreaView } from 'react-native-safe-area-context';

const Favorites = ({navigation}) => {
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
    return <ActivityIndicator size="large" color={Colors.babyOrange}/>;
  }

  return (
    <SafeAreaView style={{flex:1, backgroundColor: "white" }} >
    <View style={styles.container}>
      <Text style={styles.title}>Favorite</Text>
      
      {favorites.length ? (
        <FlatList
        
          data={favorites}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              {loading ? <ActivityIndicator size="large" color={Colors.babyOrange}/> : 
              <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("VeziLinie", 
                      {  
                        route_id: item.route_id
                      });
                    }} >
              <Text style={styles.name}>{`${item.route_short_name}`}</Text>
              <Text style={styles.name}>{`${item.route_long_name}`}</Text>
              </TouchableOpacity>}
            </View>
          )}
          keyExtractor={(item) => item.route_id}
        />
      ) : (
        <Text>Nicio stație favorită</Text>
      )}
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
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
