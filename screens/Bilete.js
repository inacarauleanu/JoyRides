import React, { useCallback, useReducer, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList } from 'react-native';
import Button from '../components/Button.js';
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import { getDatabase, ref, onValue, off } from "firebase/database";
import { auth } from "../firebase-config.js";
import CumparaBilet from './CumparaBilet.js';

const Bilete = ({navigation}) =>{
  const [loading, setLoading] = useState(true);
  const [bilete, setBilete] = useState([]);

  useEffect(() => {
    const userId = auth.currentUser.uid;
    const db = getDatabase();
    const userRef = ref(db, `users/${userId}/bilete`);

    const handleData = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const bilete = Object.values(data);
        setBilete(bilete);
      } else {
        // cazul in care nu exista niciun favorit
        setBilete([]);
      }
      setLoading(false);
      console.log(bilete);
    };

    const handleError = (error) => {
      console.error('Error fetching tickets from Firebase:', error);
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
      <Text style={styles.title}>Biletele tale</Text>
      {bilete.length ? ( 
        <FlatList
          data={bilete}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleItemClick(item)} style={styles.itemContainer}>
            <View style={{ padding: 10 }}>
              <Text style={styles.name}>{`${item.data_efectuare}`}</Text>
              <Text>{`Linie: ${item.linie}`}</Text>
              <Text>{`Mijloc de transport: ${item.mijloc_transport}`}</Text>
              <Text>{`Valabilitate: ${item.valabilitate}`}</Text>
              <Text>{`Total: ${item.total}`}</Text>
            </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.data_efectuare}
        />
      ) : (
        <Text>Niciun bilet achiziționat</Text>
      )}
      <Button
                style={styles.btn}
                title="Cumpara bilet nou"
                onPress = {()=>navigation.navigate('CumparaBilet')}
            />
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
      btn:{
        paddingHorizontal: Sizes.padding,
        paddingVertical: Sizes.padding2,
        borderWidth: 1,
        borderRadius: 50,
        borderColor: Colors.babyOrange,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.babyOrange,
        marginVertical: 12
        },
    });
    
export default Bilete;