import React, { useCallback, useReducer, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import Button from '../components/Button.js';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Notificari = ({navigation}) =>{

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

  const sendNotification = async () =>{
    console.log("send notification");

    //notification message
    const messsage = {
      to: expoPushToken,
      sound: "default",
      title: "prima mea notificare",
      body: "e si asta un inceput yay",

    }

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
      host: "exp.host",
      accept: "application/json",
      "accept-encoding": "gzip, deflate",
      "content-type": "application/json",
      },
      body: JSON.stringify(messsage),
    });
  };

  async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: 'o notificare scheduled',
        data: { data: 'goes here', test: { test1: 'more data' } },
      },
      trigger: { seconds: 10 },
    });
  }

    return (
        <View style={styles.container}>
          <Text style={styles.title}>Notificări</Text>
          <Button title='Send push notifictaions' onPress={sendNotification}></Button>
          <Button title='Schedule push notifictaions' onPress={schedulePushNotification}></Button>
          <Button
                style={styles.btn}
                title="Crează Notificare Nouă"
                onPress = {()=>navigation.navigate('AdaugaNotififcare')}
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
    
    
export default Notificari;