import React, { useCallback, useReducer, useState, useEffect } from 'react';
import {Alert} from 'react-native';
import { View, Text, StyleSheet, TextInput, Platform} from 'react-native';
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

const AdaugaNotififcare = ({navigation, route}) =>{

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedIndexes, setSelectedIndexes] = useState(0);
    const [value, setValue] = useState(null);
    const [valueStatie, setValueStatie] = useState(null);
    const [valueMinute, setValueMinute] = useState(null);
    const [isFocus, setIsFocus] = useState(false);
    const [isFocusStatie, setIsFocusStatie] = useState(false);
    const [isFocusMinute, setIsFocusMinute] = useState(false);
    const [trips, setTrips] = useState([]);
    const [selectedTripHeadsigns, setSelectedTripHeadsigns] = useState([]);
    const [selectedTripIDs, setSelectedTripIDs] = useState([]);
    const [id_trip, setIDTrip] = useState('');
    const [id_ruta, setIDRuta] = useState('');
    const [id_headsign, setIDHeadsign] = useState('');
    const [filteredStops, setFilteredStops] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [linie, setLinie] = useState(0);
    const [statie, setStatie] = useState(0);
    const [linieParametru, setLinieParam] = useState(null);
    const [statieNumeParametru, setStatieParam] = useState(null);
    const [mijlocParametru, setMijlocParam] = useState(null);
    const [trams, setTrams] = useState([]);
    const [stops, setStops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingTrips, setLoadingTrips] = useState(false);
    const [mijloc, setMijloc] = useState("trams");
    const [minute, setMinute] = useState('00');
    const [minuteParametru, setMinuteParametru] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [paramsSet, setParamsSet] = useState(false);
    const numbersArray = Array.from({ length: 60 }, (_, i) => ({ label: (i + 1).toString(), value: (i + 1).toString() }));

    const [expoPushToken, setExpoPushToken] = useState('');


    useEffect(() => {
      if (route.params) {
        const { linie, statie, minute, mijloc } = route.params;
    
        if (linie) {
          setLinieParam(linie);
        }
        if (statie) {
          setStatieParam(statie);
        }
        if (minute) {
          setMinuteParametru(minute);
        }
        if (mijloc) {
          setMijlocParam(mijloc);
        }

        setParamsSet(true); // Setăm că parametrii sunt setați

      }
    }, [route.params]);
    

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

  useEffect(()=>{
    if(mijloc)
      {setMijloc(mijloc);}
  })

  useEffect(()=>{
    tryAPITranzy(mijloc);
  }, [mijloc])

  useEffect(() => {
    if (linie) {
      setIdRuta(linie);
    }
  }, [linie]);
  
  useEffect(() => {
    if (id_trip) {
      getStopsTranzy(id_trip);
    }
  }, [id_trip]);
  
  useEffect(() => {
    if (stops.length > 0 && paramsSet) {
      getStopsNames(stops);
    }
  }, [stops, paramsSet]);

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

        
          console.log(rute);
          setRoutes(rute);


          //console.log(rute);
        } catch (error) {
          console.error(error);
        }

      };

      const setIdRuta = async (linie) =>{
        let rute = [];
        rute = routes.filter(ruta => ruta.route_short_name === linie);
        let id_ruta = rute[0].route_id;
        getTripTranzy(id_ruta);
      }

  // Fetch trip-uri atunci când routeId este setat

      const getTripTranzy = async (id_ruta) => {
        setLoadingTrips(true);
        const url = 'https://api.tranzy.ai/v1/opendata/trips';
        const options = {
          method: 'GET',
          headers: {
            'X-Agency-Id': '8',
            Accept: 'application/json',
            'X-API-KEY': 'kqZQV3y8d87sUvqLC6AFnPud6Gr1SFw1Ktk5kjNW'
          }
        };

        try {
          const response = await fetch(url, options);
          const data = await response.json();
          let tripuri = data.filter(obj => obj.route_id === id_ruta);

          console.log("tripuri", tripuri);
          setTrips(tripuri);
          if (tripuri.length > 0) {
            let id_trip = tripuri[0].trip_id;
            getStopsTranzy(id_trip);
          } else {
            setIDTrip(null);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoadingTrips(false);
        }
      };


  // Fetch stops atunci când idTrip este setat


  const getStopsTranzy = async (id_trip) => {
    setLoading(true);
    const url = 'https://api.tranzy.ai/v1/opendata/stop_times';
    const options = {
      method: 'GET',
      headers: {
        'X-Agency-Id': '8',
        Accept: 'application/json',
        'X-API-KEY': 'kqZQV3y8d87sUvqLC6AFnPud6Gr1SFw1Ktk5kjNW'
      }
    };

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      let stops = data.filter(obj => obj.trip_id === id_trip);

      console.log("STOPS", stops);
      setStops(stops);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

const getStopsNames = async (stops) => {

  setLoading(true);
  const url = 'https://api.tranzy.ai/v1/opendata/stops';
  const options = {
    method: 'GET',
    headers: {'X-Agency-Id': '8', Accept: 'application/json', 'X-API-KEY': 'kqZQV3y8d87sUvqLC6AFnPud6Gr1SFw1Ktk5kjNW'}
  };
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    //console.log("Toate stopurile", data);

    const stopIds = stops.map(stop => stop.stop_id);
    const filteredStops = data.filter(stop => stopIds.includes(stop.stop_id));

    filteredStops.sort((a, b) => {
      const stopA = stops.find(stop => stop.stop_id === a.stop_id);
      const stopB = stops.find(stop => stop.stop_id === b.stop_id);
      return stopA.stop_sequence - stopB.stop_sequence;
    });
 
    console.log("STOPS", filteredStops);
    setFilteredStops(filteredStops);
    setLoading(false);

  } catch (error) {
    setLoading(false);
    console.error(error);
  }

};

useEffect (() => {
  if(!paramsSet && linie)
  getStopsNames(stops)
}, [stops, paramsSet, linie]);

const dropdownData = routes.map(route => ({
  label: `${route.route_short_name}`,
  value: route.route_id,
}));

const dropdownDataStops = filteredStops.map(stop => ({
  label: `${stop.stop_name}`,
  value: stop.stop_id,
}));




          function writeUserNotificari(userId, linie, statie, timp) {
            const db = getDatabase();
        
            try{
            set(ref(db, 'users/' + userId + '/notificari/' + uuid.v4()), {
              linie: linie,
              statie: statie,
             // linie: linie,
              timp: timp
            });
          }    
        catch (error) {
          console.error('Eroare la salvarea in Firebase:', error); 
        }
      }

          async function schedulePushNotification(linie, statie, minute) {

            console.log("s-a trimis notificarea");
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Notificare Transport",
                body: `Linia ${linie} va ajunge în stația ${statie} în ${minute} minute.`,
                data: { data: 'goes here', test: { test1: 'more data' } },
              },
              trigger: { seconds: minute * 60 },
            });
          }

          async function schedulePushNotificationParam(linie, statie, minuteParametru, minute) {
            console.log("s-a trimis notificarea");
          
            let triggerSeconds;
            
            // Verificăm tipul și convertim minuteParametru la minute totale
           // Verificăm tipul și convertim minuteParametru la secunde totale
              if (typeof minuteParametru === 'string' && minuteParametru.includes(':')) {
                // Dacă este HH:MM, convertim în secunde
                const [hours, mins] = minuteParametru.split(':').map(Number);

                if (isNaN(hours) || isNaN(mins)) {
                  console.error("Invalid HH:MM format");
                  return;
                }
                console.log("MINUTE", mins);
                const currentMinutes = new Date().getMinutes();
                const totalSeconds = mins; // Transformăm ora și minutele în secunde
                const minuteInSeconds = minute; // Transformăm minutele în secunde
                triggerSeconds = (totalSeconds - currentMinutes - minuteInSeconds) * 60; // Calculăm când trebuie să fie notificarea
            
                console.log(`HH:MM converted to total seconds: ${totalSeconds}, trigger in ${triggerSeconds} seconds`);
            
            } else {
              // Dacă este deja în minute, păstrăm valoarea
              const totalMinutes = parseInt(minuteParametru, 10);
              triggerSeconds = (totalMinutes - minute) * 60; // Calculăm când trebuie să fie notificarea
            }

            console.log("TRIGGER SECONDS", triggerSeconds);
          
            await Notifications.scheduleNotificationAsync({
              content: {
                title: "Notificare Transport",
                body: `Linia ${linie} va ajunge în stația ${statie} în ${minute} minute.`,
                data: { data: 'goes here', test: { test1: 'more data' } },
              },
              trigger: { seconds: triggerSeconds },
            });
          }
        

          const handleNotificarePress = async () => {

            if (mijloc && linie && statie && minute) {
                schedulePushNotification(linie, statie, minute);
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

          const handleNotificareParamPress = async () => {

                schedulePushNotificationParam(linieParametru, statieNumeParametru, minuteParametru, minute);
                const userId = auth.currentUser.uid;
                writeUserNotificari(userId, linieParametru, statieNumeParametru, minute);
                Alert.alert('Notificare programată cu succes!', 'Vei fi redirecționat la Notificări',[
                  {
                    onPress: ()=>navigation.navigate("Notificari")
                  }
                ]);

          };
         // console.log(mijloc);
    return (
        <View style={styles.container}>
          <Text style={styles.title}>Adaugă Notificare</Text>
          <Text style={styles.semititle}>Mijlocul de transport</Text>
          {mijlocParametru!=null ?
          (
            <TextInput>{mijlocParametru}</TextInput>
          ) :
          (
          <View>
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
            </View>
          )
          }
            {linieParametru!=null ? (
              <View>
              <Text style={styles.semititle}>Linia</Text>
              <TextInput>
              {linieParametru}
        
            </TextInput>
            </View>
            ):
            (
              <View>
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
                setIdRuta(item.label);
            }}
            />
            </View>
          )
          }
          {statieNumeParametru!=null ?
          (
            <View>
              <Text style={styles.semititle}>Stație</Text>
              <TextInput>
              {statieNumeParametru}
            </TextInput>
              </View>
          ) : 
          (
            <View>
        <Text style={styles.semititle}>Stație</Text>
            <Dropdown
            style={[styles.dropdown, isFocusStatie && { borderColor: Colors.babyOrange }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            itemTextStyle = {styles.textStyle}
            data={dropdownDataStops}
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
          </View>
          )
        }
        {minuteParametru!=null ? 
        <View>
          <Text style={styles.semititle}>Timp estimat curent</Text>
        <TextInput>{minuteParametru}</TextInput>
        </View>
        : 
        (
          <View></View>
        )
        }
             <Text style={styles.semititle}>Minute până la notificare</Text>
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
                onPress = {paramsSet ? handleNotificareParamPress: handleNotificarePress}
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