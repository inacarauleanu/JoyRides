import React, { useCallback, useReducer, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
//import Button from '../components/Button.js';
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import { ButtonGroup, Button, Image } from 'react-native-elements';
import { Dropdown } from 'react-native-element-dropdown';
import * as SMS from 'expo-sms';
import { SafeAreaView } from 'react-native-safe-area-context';

const CumparaBilet = ({navigation}) =>{
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedIndexes, setSelectedIndexes] = useState(0);
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [linie, setLinie] = useState(0);
  const [mijloc, setMijloc] = useState("trams");
  const [routes, setRoutes] = useState([]);
  const [message, setMessage] = React.useState('');

  const tryAPITranzy = async (mijloc) => {

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

      //console.log(rute);
      setRoutes(rute);
     // console.log(rute);
    } catch (error) {
      console.error(error);
    }

  };

  const error = console.error;
console.error = function(...args) {
  if (/defaultProps/.test(args[0])) return;
  error(...args);
};


  useEffect (() => {
      tryAPITranzy(mijloc);

  }, [mijloc]);

  useEffect(() =>{
    setMessage(linie);
  }, [linie])

  const sendSMS = async () => {
    
    const mesaj = selectedIndex === 0 ? `B${message}` : `ZI`;

    const isAvailable = await SMS.isAvailableAsync();

    if (isAvailable) {
      const { result } = await SMS.sendSMSAsync(
        ['7442'],
       mesaj 
      );

    } else {
      Alert.alert('Funcția de trimitere SMS nu este disponibilă pe acest dispozitiv.');
    }
  };

  const dropdownData = routes.map(route => ({
    label: `${route.route_short_name}`,
    value: route.route_id,
  }));

    return ( 
      <SafeAreaView style={{flex:1, backgroundColor: "white" }} >
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
          data={dropdownData}
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
                onPress = {sendSMS}
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
        </SafeAreaView>
      );
    };


    const styles = StyleSheet.create({
        container: {
          flex: 1,
          padding: 20,
          backgroundColor: '#ffffff',


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