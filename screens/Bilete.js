import React, { useCallback, useReducer, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
//import Button from '../components/Button.js';
import {Image, ButtonGroup, Button } from 'react-native-elements';
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import { getDatabase, ref, onValue, off, query, orderByChild, orderByValue, update, set } from "firebase/database";
import { auth } from "../firebase-config.js";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { getStorage, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { ref as sRef } from 'firebase/storage';
import uuid from 'react-native-uuid';

const Bilete = ({navigation}) =>{

  const [identifierText, setIdentifierText] = useState(null);
  const [selectedIndexes, setSelectedIndexes] = useState(0);
  const [showBilete, setShowBilete] = useState(true);
  
  const [image, setImage] = useState(null);
  const [labels, setLabels] = useState(null);
  const [detectedText, setDetectedText] = useState(null);
  const [detectedValabilitate, setDetectedValabilitate] = useState(null);
  const [detectedAbonament, setDetectedAbonament] = useState(null);
  const [subscriptions, setSubscriptions] = useState(null);

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

    const unsubscribe = onValue(userRef, handleData, handleError);

    return () => off(userRef, 'value', handleData);
    
  }, []);

  useEffect(() => {
    const userId = auth.currentUser.uid;
    const db = getDatabase();
    const userRef = query(ref(db, `users/${userId}/abonamente`));
  
    const handleData = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const abonamente = Object.entries(data).map(([id, subscription]) => ({ id, ...subscription }));
        setSubscriptions(abonamente);
      } else {
        setSubscriptions([]);
      }
      setLoading(false);
    };
  
    const handleError = (error) => {
      console.error('Error fetching subscriptions from Firebase:', error);
      setLoading(false);
    };
  
    const unsubscribe = onValue(userRef, handleData, handleError);
  
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

  const selectSource = () => {
    Alert.alert(
      'Selectează sursa imaginii',
      'Vrei să alegi o imagine din galerie sau să faci o poză cu camera?',
      [
        { text: 'Galerie', onPress: () => pickImage('gallery') },
        { text: 'Camera', onPress: () => pickImage('camera') },
      ]
    );
  };

  const pickImage = async (source) => {
   let result;
    if (source === 'gallery') {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }
    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      analyzeImage(result.assets[0].uri);
    }
  };

  const getBlobFromUri = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
  
    return blob;
  };
  
  const apiKey = 'AIzaSyC8EnWmZA0j1mtdwFnD4k23-WMq7-40yuI';

  const analyzeImage = async (image) => {
    try {
      if (!image) {
        alert('Please select an image first.');
        return;
      }
      const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

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

      if (textAnnotations) {
        const identifier = extractIdentifierFromText(textAnnotations);
        const valabilitate = extractValidityFromText(textAnnotations);
        const abonament = extractSubscriptionTypeFromText(textAnnotations);
        console.log("IDENTIFIER", identifier);
        if (identifier !== 'IDENTIFICATOR BON: Not found') {
          setIdentifierText(identifier);
          setDetectedValabilitate(valabilitate);
          setDetectedAbonament(abonament);
          uploadImage(image, identifier, valabilitate, abonament); // Încarcăm imaginea doar dacă s-a găsit un identificator valid
        } else {
          alert('Nu s-a găsit identificatorul și numărul bonului în imagine.');
        }
      } else {
        alert('Nu s-a detectat text în imagine.');
      }
      
    } catch (error) {
      console.error('Error analyzing image:', error);
      alert('Error analyzing image. Please try again later.');
    }
  };


  const uploadImage = async (uri, identifier, valabilitate, abonament) => {
    const userId = auth.currentUser.uid;
    const storage = getStorage();
    const blob = await getBlobFromUri(uri);

    const storageReference = sRef(storage, 'images/' + userId + '/' + new Date().toISOString());
    const uploadTask = uploadBytesResumable(storageReference, blob);
    
    uploadTask.on(
      'state_changed', 
      (snapshot) => {
        console.log(snapshot.state);
      }, 
      (error) => {
        console.error('Upload failed:', error);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log('Download URL: ', downloadURL);
        saveImageUrlToDatabase(downloadURL, identifier, valabilitate, abonament);
      }
    );
  };

  const saveImageUrlToDatabase = async (downloadURL, identrifierText, valabilitate, abonament) => {
    const userId = auth.currentUser.uid;
    const db = getDatabase();
    const newImageRef = ref(db, `users/${userId}/abonamente/${identrifierText}`);
    await set(newImageRef, {
      imageUrl: downloadURL,
      uploadedAt: new Date().toISOString(),
      valabilitate: valabilitate,
      nume: abonament
    });
  };

  const extractIdentifierFromText = (textAnnotations) => {
    const fullText = textAnnotations.map(annotation => annotation.description).join(" ");
    const identifierRegex = /IDENTIFICATOR BON:\s*((?:\d+\s*-\s*)+\d+)/;
    const match = fullText.match(identifierRegex);
  
    if (match) {
      console.log(`IDENTIFICATOR BON: ${match[1]}`);
      return `${match[1]}`;
   
    } else {
      return 'IDENTIFICATOR BON: Not found';
    }
  };

  const extractValidityFromText = (textAnnotations) => {
    const fullText = textAnnotations.map(annotation => annotation.description).join(" ");
    const validityRegex = /VALABILITATE:\s*((?:\d{2}\.\d{2}\.\d{4})\s*-\s*(?:\d{2}\.\d{2}\.\d{4}))/;
    const match = fullText.match(validityRegex);
  
    if (match) {
      console.log(`VALABILITATE: ${match[1]}`);
      return `${match[1]}`;
    } else {
      return 'VALABILITATE: Not found';
    }
  };

  const extractSubscriptionTypeFromText = (textAnnotations) => {
    const fullText = textAnnotations.map(annotation => annotation.description).join(" ");
    const subscriptionRegex = /ABONAMENT(.+)/;
    const match = fullText.match(subscriptionRegex);
  
    if (match) {
      console.log(`ABONAMENT: ${match[1].trim()}`);
      return `ABONAMENT ${match[1].trim()}`;
    } else {
      return 'ABONAMENT: Not found';
    }
  };

  
  if (loading) {
    return <ActivityIndicator size="large" color={Colors.babyOrange}/> ;
  }

  

    return (
      <View style={styles.container}>
      <Text style={styles.title}>{selectedIndexes == 0 ? 'Biletele tale' : 'Abonamentele tale' }</Text>
      <ButtonGroup
      buttons={['Bilete', 'Abonamente']}
      selectedIndex={selectedIndexes}
      onPress={(value) => {
        setSelectedIndexes(value);
        setShowBilete(value === 0);
       // value == 0 ? setMijloc("trams") : (value == 1 ? setMijloc("buses") : setMijloc("trols"));
      }}
      containerStyle={styles.butonContainer}
      selectedButtonStyle = {styles.selectedButtonStyle}
      textStyle = {styles.textStyle}
      
    />
    
 {showBilete ? (
  
        // Afișăm biletele dacă este selectat butonul "Bilete"
        bilete.length ? (
          <View>
            
                    <Button
          buttonStyle={styles.btn}
          title="Cumpara bilet nou"
          titleStyle = {styles.titlu}
          onPress = {()=>navigation.navigate('CumparaBilet')}
       />
          <FlatList
            data={bilete}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("VeziBilet", {
                    valabilitate: `${item.valabilitate}`,
                    data_efectuare: `${item.data_efectuare}`,
                    ora_efectuare: `${item.ora_efectuare}`,
                    linie: `${item.linie}`,
                    total: `${item.total}`,
                    id: `${item.id}`,
                  })
                }
                style={styles.itemContainer}
              >
                <View style={{ padding: 10 }}>
                  <Text style={styles.name}>{`${item.ora_efectuare}`}</Text>
                  <Text>{`Linie: ${item.linie}`}</Text>
                  <Text>{`Mijloc de transport: ${item.mijloc_transport}`}</Text>
                  <Text>{`Valabilitate: ${item.valabilitate}`}</Text>
                  <Text>{`Total: ${item.total}`}</Text>
                  <Text>{`Status: ${item.status}`}</Text>
                </View>
                <TouchableOpacity style={styles.favoriteButton}>
                  {`${item.status}` === "valid" ? (
                    <Image
                      source={require("../assets/icons/check.png")}
                      style={{ width: 20, height: 20 }}
                    />
                  ) : (
                    <Image
                      source={require("../assets/icons/expired.png")}
                      style={{ width: 20, height: 20 }}
                    />
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
          />

          </View>
        ) : (
          <View>
          <Text>Niciun bilet achiziționat</Text>
          <Button
          buttonStyle={styles.btn}
          title="Cumpara bilet nou"
          titleStyle = {styles.titlu}
          onPress = {()=>navigation.navigate('CumparaBilet')}
       />
       </View>
        )
      ) : (
        // Afișăm abonamentele dacă este selectat butonul "Abonamente"
        <View>
          {/* Afișează abonamentele din firebase */}
          {/* Butonul de adăugare a abonamentului */}
          <Button
            buttonStyle={styles.btn}
            title="Adauga abonament"
            titleStyle={styles.titlu}
            onPress={selectSource}
          />
          <FlatList
      data={subscriptions}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate("VeziAbonament", {
            valabilitate: item.valabilitate,
            nume: item.nume,
            imageUrl: item.imageUrl,
            id: item.id
          })}
          style={styles.itemContainer}
        >
          <View style={{ padding: 10 }}>
            <Text style={styles.name}>{item.nume}</Text>
            <Text>{`Valabilitate: ${item.valabilitate}`}</Text>
          </View>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id}
    />
          {/* Afișează imaginea selectată pentru adăugarea abonamentului */}
         {/* {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
          {detectedText && (
            <View style={styles.textContainer}>
              {detectedText.map((item, index) => (
                <Text key={index} style={styles.text}>
                  {item.description}
                </Text>
              ))}
            </View>
          )}*/}
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
      titlu:{
        ...Fonts.screenTitle,
        color: Colors.white, fontSize: 18
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
    
export default Bilete;