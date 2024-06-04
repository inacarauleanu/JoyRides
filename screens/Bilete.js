import React, { useCallback, useReducer, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Button } from 'react-native';
//import Button from '../components/Button.js';
import {Image } from 'react-native-elements';
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import { getDatabase, ref, onValue, off, query, orderByChild, orderByValue, update } from "firebase/database";
import { auth } from "../firebase-config.js";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const Bilete = ({navigation}) =>{
  const [loading, setLoading] = useState(true);
  const [bilete, setBilete] = useState([]);

  useEffect(() => {
    const userId = auth.currentUser.uid;
    const db = getDatabase();
    const userRef = query(ref(db, `users/${userId}/bilete`), orderByChild('data_efectuare'));

    const handleData = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const bilete = Object.entries(data).map(([id, ticket]) => ({ id, ...ticket }));;
        
        setBilete(bilete); 

      } else { 
        setBilete([]); 
      }
      setLoading(false);
      //console.log(bilete);

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


  useEffect(() => {
    bilete.forEach(ticket => {
      const creationDate = new Date(ticket.data_efectuare);
     // console.log("creation date", creationDate);
      let validityMilliseconds;
      
      if (ticket.valabilitate === '"1h"') {
        validityMilliseconds = 60 * 60 * 1000; // 1 hour in milliseconds
      } else if (ticket.valabilitate === '"24h"') {
        validityMilliseconds = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      }
  
      const expiryDate = new Date(creationDate.getTime() + validityMilliseconds);
      //console.log("expiry date", expiryDate);

      const timer = setInterval(() => {
        const now = new Date();
        const difference = expiryDate - now;
  
        if (difference <= 0) {
          clearInterval(timer);
          updateTicketStatus(ticket.id); // Update status to "invalid" when expired
        }
      }, 1000);
  
      return () => clearInterval(timer);
    });
  }, [bilete]);

  const updateTicketStatus = (ticketId) => {
    const userId = auth.currentUser.uid;
    const db = getDatabase();
    update(ref(db, 'users/' + userId + '/bilete/' + ticketId), {

      status: "invalid"
  }); 
  };

  const [image, setImage] = useState(null);
  const [labels, setLabels] = useState(null);
  const [detectedText, setDetectedText] = useState(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async () => {
    try {
      if (!image) {
        alert('Please select an image first.');
        return;
      }

      // Replace 'YOUR_GOOGLE_CLOUD_VISION_API_KEY' with your actual API key
      const apiKey = 'AIzaSyC8EnWmZA0j1mtdwFnD4k23-WMq7-40yuI';
      const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

      // Read the image file from local URI and convert it to base64
      const base64ImageData = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const requestData = {
        requests: [
          {
            image: {
              content: base64ImageData,
            },
            features: [{ type: 'TEXT_DETECTION', maxResults: 5 }],
          },
        ],
      };

      const apiResponse = await axios.post(apiUrl, requestData);
      const textAnnotations = apiResponse.data.responses[0].textAnnotations;
      setDetectedText(textAnnotations);
      
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Error analyzing image. Please try again later.');
    }
  };

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
            <TouchableOpacity onPress={()=>navigation.navigate("VeziBilet",{
              valabilitate: `${item.valabilitate}`,
              data_efectuare: `${item.data_efectuare}`,
              ora_efectuare: `${item.ora_efectuare}`,
              linie: `${item.linie}`,
              total: `${item.total}`,
              id: `${item.id}`
            })}
              style={styles.itemContainer}>
            <View style={{ padding: 10 }}>
              {/*<Text style={styles.name}>{`${item.data_efectuare}`}</Text>*/}
              <Text style={styles.name}>{`${item.ora_efectuare}`}</Text>
              <Text>{`Linie: ${item.linie}`}</Text>
              <Text>{`Mijloc de transport: ${item.mijloc_transport}`}</Text>
              <Text>{`Valabilitate: ${item.valabilitate}`}</Text>
              <Text>{`Total: ${item.total}`}</Text>
              <Text>{`Status: ${item.status}`}</Text>
            </View>
            <TouchableOpacity style={styles.favoriteButton}>
              {
                (`${item.status}` === "valid") ?
                
                  <Image source={require('../assets/icons/check.png')} style={{ width: 20, height: 20}}/>

                  :

                  <Image source={require('../assets/icons/expired.png')} style={{ width: 20, height: 20}}/>

                
              }
           
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      ) : (
        <Text>Niciun bilet achiziționat</Text>
      )}
      <Button
                style={styles.btn}
                title="Cumpara bilet nou"
                onPress = {()=>navigation.navigate('CumparaBilet')}
            />
            <Button
                style={styles.btn}
                title="Adauga abonament"
                onPress = {pickImage}
            />      
              {image && <Image source={{ uri: image }} style={{ width: 200, height: 200}} />}
              <Button
                style={styles.btn}
                title="Analizeaza abonament"
                onPress = {analyzeImage}
            />     
        {detectedText && (
        <View style={styles.textContainer}>
          {detectedText.map((item, index) => (
            <Text key={index} style={styles.text}>
              {item.description}
            </Text>
          ))}
        </View>
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
      textContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
      },
      text: {
        fontSize: 16,
        marginVertical: 5,
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
        paddingRight: 60,
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
        favoriteButton: {
          position: 'absolute',
          top: 10,
          right: 10,
          padding: 10,
        },
    });
    
export default Bilete;