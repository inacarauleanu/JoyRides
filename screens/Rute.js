import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView} from 'react-native';
import { ButtonGroup, Button, Image } from 'react-native-elements';
import { auth } from "../firebase-config.js";
import { getDatabase, ref, set, get, push, update } from "firebase/database";
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import Icon from 'react-native-vector-icons/FontAwesome'; 

const Rute = ({navigation}) => {

  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [selectedIndexes, setSelectedIndexes] = useState(0);
  const [mijloc, setMijloc] = useState("trams");
  const [routes, setRoutes] = useState([]);


  const tryAPITranzy = async (mijloc) => {

    setLoading(true);
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

      setRoutes(rute);
     setLoading(false); 

    } catch (error) {
      setLoading(false);
      console.error(error);
    }

  };

  useEffect (() => {
      tryAPITranzy(mijloc)
  }, [mijloc]);


  useEffect(() => {
    fetchData();
  }, []);

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
  const error = console.error;
  console.error = function(...args) {
    if (/defaultProps/.test(args[0])) return;
    error(...args);
  };
  
  const toggleFavorite = (line) => {
    const busWithLine = routes.find((route) => route.route_id === line.route_id);
  
    if (!busWithLine) {
      console.error(`No route found for route_id ${line.route_id}`);
      return;
    }
  
    const isFavorite = favorites.some((favItem) => favItem.route_id === line.route_id);
    if (isFavorite) {

      const updatedFavorites = favorites.filter((favItem) => favItem.route_id !== line.route_id);
      setFavorites(updatedFavorites);
      updateFavoritesInFirebase(updatedFavorites);
    } else {

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
 
 <View style={[styles.containerList, styles.horizontal]}>
 {loading ? <ActivityIndicator size="large" color={Colors.babyOrange}/> : 

  <FlatList
  data={routes}
  keyExtractor={(item) => item.route_id}
  renderItem={({ item }) => (
    <TouchableOpacity 
      onPress={() => {

        navigation.navigate("VeziLinie", 
        {  

          route_id: item.route_id,
          linie: item.route_short_name
        });
      }} 
      style={styles.itemContainer}>
      <Text style={styles.name}>{item.route_short_name}</Text>
      <Text style={styles.longName}>{item.route_long_name}</Text>
      <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(item)}>
        <Icon name={favorites.some((favItem) => 
          favItem.route_id === item.route_id) ? 'heart' : 'heart-o'} 
          size={30} color={Colors.babyOrange} />
      </TouchableOpacity>
    </TouchableOpacity>
  )}
/>
}
</View>
</View>
  </View>

  );
};
const styles = StyleSheet.create({
  containerList: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
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