import React, { useCallback, useReducer, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { Image, Button } from 'react-native-elements';
import { Dropdown } from 'react-native-element-dropdown';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import {Colors, Sizes, Fonts} from "../constants/styles.js"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const VeziAbonament = ({ route }) => {
  const nume = route.params.nume;
  const valabilitate = route.params.valabilitate;
  const imageUrl = route.params.imageUrl;
  const [daysBeforeExpiry, setDaysBeforeExpiry] = useState(1); // Starea pentru zilele înainte de expirare, inițial 1 zi
  const numbersArray = Array.from({ length: 30 }, (_, i) => ({ label: (i + 1).toString(), value: (i + 1).toString() }));
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
  const scheduleNotificationForSubscriptionExpiry = (daysBeforeExpiry) => {
    const [startDate, endDate] = valabilitate.split(' - ');
  
    // Parsăm datele în obiecte Date
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
  
    // Calculăm data pentru notificare cu zilele înainte de expirare
    const notificationDate = new Date(endDateObj.getTime() - daysBeforeExpiry * 24 * 60 * 60 * 1000);
    
    alert("Notificare programată cu succes!");
    // Programăm notificarea
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'Expirare abonament',
        body: `Abonamentul expiră în ${daysBeforeExpiry} zile, la data: ${endDate}`,
      },
      trigger: {
        date: notificationDate, // Momentul la care va fi afișată notificarea
      },
    });
  };
 // console.log(mijloc);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalii Abonament</Text>
      <Text style={styles.name}>{nume}</Text>
      <Text>{`Valabilitate: ${valabilitate}`}</Text>
      <Image source={{ uri: imageUrl }} style={{ width: 200, height: 200 }} />

      <Text style={styles.subtitle}>Selectează zile înainte de expirare pentru notificare:</Text>
      <Dropdown
        style={styles.dropdown}
        data={numbersArray}
        labelField="label"
        valueField="value"
        placeholder="Alege zile"
        value={daysBeforeExpiry.toString()}
        onChange={(item) => setDaysBeforeExpiry(parseInt(item.value))}
      />

      <Button
        buttonStyle={styles.btn}
        title="Programează Notificare"
        titleStyle = {styles.titlu}
        onPress={scheduleNotificationForSubscriptionExpiry}
        icon={<Image source={require('../assets/icons/notification.png')} style={{ width: 20, height: 20 }} />}
        iconRight={true}
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
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titlu:{
    ...Fonts.screenTitle,
    color: Colors.white, fontSize: Sizes.buttonText
},
  dropdown: {
    width: 150,
    marginBottom: 20,
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
});

export default VeziAbonament;
