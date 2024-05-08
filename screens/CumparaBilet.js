import React, { useCallback, useReducer, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
//import Button from '../components/Button.js';
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import { ButtonGroup, Button, Image } from 'react-native-elements';
import { color, fonts } from '@rneui/base';
import { Dropdown } from 'react-native-element-dropdown';
import PlataCard from './PlataCard.js';
import PlataMesaj from './PlataMesaj.js';
import { getDatabase, ref, onValue, off, query, orderByChild, orderByValue, update, equalTo } from "firebase/database";
import { auth } from "../firebase-config.js";

const CumparaBilet = ({navigation}) =>{
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedIndexes, setSelectedIndexes] = useState(0);
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [linie, setLinie] = useState(0);
  const [trams, setTrams] = useState([]);
  const [stops, setStops] = useState([]);
  const [mijloc, setMijloc] = useState(0);

  useEffect(() => {

    const db = getDatabase();
    const tramsRef = ref(db, `${mijloc}/transformedData`);
    const queryRef = query(tramsRef);
  
    try {
      const snapshot = onValue(queryRef, (snapshot) => {
        const lineNames = [];
        let index = 1; // Starting index
        snapshot.forEach((childSnapshot) => {
          childSnapshot.forEach((grandChildSnapshot) => {
            const line = grandChildSnapshot.val().line;
           // const value = lineNames.line + 1; // Generating value based on array length
            if (!lineNames.includes(line)) {
              lineNames.push({ label: line, value: index.toString() });
              index++;
            }
          });
        });
  
        //console.log('Line names extracted:', lineNames);
        setTrams(lineNames);
        return lineNames;
      });
  
      return snapshot;
    } catch (error) {
      console.error('Error extracting line names:', error);
      return [];
    }
  
}, [mijloc]);


const extractStopsForLine = async (line, mijloc) => {
    const db = getDatabase();
    const tramsRef = ref(db, `${mijloc}/transformedData`);
    const queryRef = query(tramsRef);
  
    try {
      let stops = [];
      
       onValue(queryRef, (snapshot) => {
        let index = 0;
        snapshot.forEach((childSnapshot) => {
          childSnapshot.forEach((grandChildSnapshot) => {
            const data = grandChildSnapshot.val();
            if (data.line === line) {
                const stopsData = data.stops.map(stop => ({ label: stop.stop_name, value: (index++).toString()}));
              stops = [...stops, ...stopsData];
            }
          });
        });
      });
  
    //  console.log('Stops for line', line, ':', stops);
      return stops;
    } catch (error) {
      console.error('Error extracting stops for line', line, ':', error);
      return [];
    }
  }
  
          // Update stops when the line is changed
          useEffect(() => {
            if (linie !== 0) {
              extractStopsForLine(linie, mijloc).then((stops) => {
                // Do something with the extracted stops
                //console.log('Stops for line', linie, ':', stops);
                setStops(stops);
              });
            }
          }, [linie, mijloc]);


    return ( 
        <View style={styles.container}>

      <Text style={styles.title}>Configurează-ți biletul</Text>
      <View style={styles.pickCont}>
      <Text style={styles.semititle}>Valabilitatea biletului</Text>
      <ButtonGroup
      buttons={['60 de minute', '24 de ore']}
      selectedIndex={selectedIndex}
      onPress={(value) => {
        setSelectedIndex(value);
      }}
      containerStyle={styles.butonContainer}
      selectedButtonStyle = {styles.selectedButtonStyle}
      textStyle = {styles.textStyle}
      
    />

<Text style={styles.semititle}>Mijlocul de transport</Text>
      <ButtonGroup
      buttons={['Tramvai', 'Autobuz', 'Troleibuz']}
      selectedIndex={selectedIndexes}
      onPress={(value) => {
        setSelectedIndexes(value);
        value == 0 ? setMijloc("trams") : (value == 1 ? setMijloc("buses") : setMijloc("trols"));
        
      }}
      containerStyle={styles.butonContainer}
      selectedButtonStyle = {styles.selectedButtonStyle}
      textStyle = {styles.textStyle}
      
    />

<Text style={styles.semititle}>Linia</Text>
<Dropdown
         style={[styles.dropdown, isFocus && { borderColor: Colors.babyOrange }]}
         placeholderStyle={styles.placeholderStyle}
         selectedTextStyle={styles.selectedTextStyle}
         inputSearchStyle={styles.inputSearchStyle}
         itemTextStyle = {styles.textStyle}
          data={trams}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Alege linia' : '...'}
          searchPlaceholder="Caută..."
          value={value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setValue(item.value);
            setLinie(item.label);
            setIsFocus(false);
          }}
        />
<Text style={styles.semititle}>Total de plată: <Text style={styles.total}>{selectedIndex == 0 ? '4 lei' : '15 lei'}</Text> </Text>
      </View>
      <Button
                buttonStyle={styles.btn}
                title="Plata card   "
                onPress = {()=>{
                  if(linie != 0){
                  navigation.navigate("PlataCard",{
                  amount: selectedIndex == 0 ? 400 : 1500,
                  valabilitate: selectedIndex == 0 ? '1h' : '24h',
                  mijloc_transport: selectedIndexes == 0 ? 'tramvai' : (selectedIndexes == 1 ? 'autobuz' : 'troleibuz'),
                  linie: linie 
                })}else  Alert.alert('Alege linia pe care urmează să călătorești!');
              }
            }
                titleStyle = {styles.titlu}
                icon = {
                    <Image
                    source={require('../assets/icons/credit-card.png')}
                    style={{ width: 20, height: 20}}
                  />
                  
                }
                iconRight = 'true'
                
            
        />
         <Button
                buttonStyle={styles.btn1}
                title="Plata SMS   "
                onPress = {()=>navigation.navigate("PlataMesaj")}
                titleStyle = {styles.titlu}
                icon = {
                    <Image
                    source={require('../assets/icons/email.png')}
                    style={{ width: 20, height: 20}}
                  />
                  
                }
                iconRight = 'true'
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

        },
        pickCont: {
            flex: 1,
            padding: 20,
            backgroundColor: '#ffffff',
            marginTop: 10 
        },
        butonContainer: {
            borderRadius: 50,
            backgroundColor: Colors.myLightGrey,
            elevation: 3,
               },
        selectedButtonStyle:{
            backgroundColor: Colors.babyOrange
               },
        title: {
        marginTop: 20,
          ...Fonts.screenTitle,
          marginBottom: 10,
          textAlign: 'center'
        },
        titlu:{
            ...Fonts.screenTitle,
            color: Colors.white, fontSize: Sizes.buttonText
        },
        semititle: {
             marginTop: 20,
              marginBottom: 20,
                textAlign: 'left',
              ...Fonts.inputText,
            },
        total: {
              marginTop: 20,
               marginBottom: 20,
                 textAlign: 'left',
               ...Fonts.inputText,
               color: Colors.myRed
             },
        textStyle:{
            ...Fonts.basicText,
            color: Colors.black
            },
        itemContainer: {
          backgroundColor: '#fff',
          borderRadius: 8,
          padding: 15,
          marginBottom: 15,
          elevation: 3,
        },
        dropdown: {
            height: 50,
            borderColor: 'gray',
            borderWidth: 0.5,
            borderRadius: 50,
            paddingHorizontal: 8,
            
          },
 
          placeholderStyle: {
         
            ...Fonts.basicText
          },
          selectedTextStyle: {
           
            ...Fonts.basicText
          },
          inputSearchStyle: {
            height: 40,
            ...Fonts.basicText
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
          btn1:{
            paddingHorizontal: Sizes.padding,
            paddingVertical: Sizes.padding2,
            borderWidth: 1,
            borderRadius: 50,
            borderColor: Colors.myLightGrey,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: Colors.black,
            marginVertical: 12
            },
      });
      
export default CumparaBilet;