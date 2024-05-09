import React, { useCallback, useReducer, useState, useEffect } from 'react';
import {Alert} from 'react-native';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import { Dropdown } from 'react-native-element-dropdown';
import { ButtonGroup, Button, Image } from 'react-native-elements';
import { getDatabase, ref, onValue, off, query, orderByChild, orderByValue, update, equalTo, set } from "firebase/database";
import { auth } from "../firebase-config.js";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import uuid from 'react-native-uuid';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

const AdaugaNotififcare = ({navigation}) =>{

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedIndexes, setSelectedIndexes] = useState(0);
    const [value, setValue] = useState(null);
    const [valueStatie, setValueStatie] = useState(null);
    const [valueMinute, setValueMinute] = useState(null);
    const [isFocus, setIsFocus] = useState(false);
    const [isFocusStatie, setIsFocusStatie] = useState(false);
    const [isFocusMinute, setIsFocusMinute] = useState(false);
    const [linie, setLinie] = useState(0);
    const [statie, setStatie] = useState(0);
    const [trams, setTrams] = useState([]);
    const [stops, setStops] = useState([]);
    const [mijloc, setMijloc] = useState(0);
    const [minute, setMinute] = useState('00');
    const numbersArray = Array.from({ length: 60 }, (_, i) => ({ label: (i + 1).toString(), value: (i + 1).toString() }));

    const [expoPushToken, setExpoPushToken] = useState('');

  useEffect (() => {
    console.log("Registering for push notifications");
    registerForPushNotificationsAsync().then(
      (token) =>{
        console.log(token)
        token && setExpoPushToken(token)
      } ,
    ).catch(err => console.log(err));
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;
  
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      // Learn more about projectId:
      // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
      // EAS projectId is used here.
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ??
          Constants?.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(token);
      } catch (e) {
        token = `${e}`;
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    return token;
  }

  async function schedulePushNotification(/*statie, linie*/) {
    console.log("s-a trimis notificarea");
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: 'o notificare scheduled pentru un user',
        /*body: {
          statie: `${statie}`,
          linie: `${linie}`,
        },*/
        data: { data: 'goes here', test: { test1: 'more data' } },
      },
      trigger: { seconds: minute * 60 },
    });
  }

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

          useEffect(() => {
            if (linie !== 0) {
              extractStopsForLine(linie, mijloc).then((stops) => {
                //console.log('Stops for line', linie, ':', stops);
                setStops(stops);
              });
            }
          }, [linie, mijloc]);


          function writeUserNotificari(userId, linie, statie, timp) {
            const db = getDatabase();
        
            try{
            set(ref(db, 'users/' + userId + '/notificari/' + uuid.v4()), {
              linie: linie,
              statie: statie,
              linie: linie,
              timp: timp
            });
          }    
        catch (error) {
          console.error('Eroare la salvarea in Firebase:', error); 
        }
      }

          const handleNotificarePress = async () => {

            if (mijloc && linie && statie && minute) {
                schedulePushNotification(/*statie, linie*/);
                const userId = auth.currentUser.uid;
                writeUserNotificari(userId, linie, statie, minute);
                Alert.alert('Notificare programată cu succes!', 'Vei fi redirecționat la Notificări',[
                  {
                    onPress: ()=>navigation.navigate("Notificari")
                  }
                ]);
            } else {

              Alert.alert('Completează toate câmpurile!');
            }
          };
         // console.log(mijloc);
    return (
        <View style={styles.container}>
          <Text style={styles.title}>Adaugă Notificare</Text>
          <Text style={styles.semititle}>Mijlocul de transport</Text>
            <ButtonGroup
            buttons={['Tramvai', 'Autobuz', 'Troleibuz']}
            selectedIndex={selectedIndexes}
            onPress={(value) => {
                setSelectedIndexes(value);
                //console.log("VALUE", value);
               // console.log("SELECTED INDEXES", selectedIndexes);
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
        <Text style={styles.semititle}>Stație</Text>
            <Dropdown
            style={[styles.dropdown, isFocusStatie && { borderColor: Colors.babyOrange }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            itemTextStyle = {styles.textStyle}
            data={stops}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocusStatie ? 'Alege stația' : '...'}
            searchPlaceholder="Caută..."
            value={valueStatie}
            onFocus={() => setIsFocusStatie(true)}
            onBlur={() => setIsFocusStatie(false)}
            onChange={item => {
                setValueStatie(item.value);
                setStatie(item.label);
                setIsFocusStatie(false);
            }}
            />
             <Text style={styles.semititle}>Time</Text>
             <Dropdown
            style={[styles.dropdown, isFocusMinute && { borderColor: Colors.babyOrange }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            itemTextStyle = {styles.textStyle}
            data={numbersArray}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={!isFocusMinute ? 'Minute' : '...'}
            searchPlaceholder="Caută..."
            value={valueMinute}
            onFocus={() => setIsFocusMinute(true)}
            onBlur={() => setIsFocusMinute(false)}
            onChange={item => {
                setValueMinute(item.value);
                setMinute(item.label);
                setIsFocusMinute(false);
            }}
            />
                  <Button
                buttonStyle={styles.btn}
                title="Salvează notificare  "
                onPress = {handleNotificarePress}
                titleStyle = {styles.titlu}
                icon = {
                    <Image
                    source={require('../assets/icons/notification.png')}
                    style={{ width: 30, height: 30}}
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
          marginVertical: 62
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
    
export default AdaugaNotififcare;