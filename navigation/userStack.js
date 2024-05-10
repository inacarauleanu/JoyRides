import React from 'react';
import { Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Bilete from '../screens/Bilete';
import Rute from '../screens/Rute';
import Notificari from '../screens/Notificari';
import Favorite from '../screens/Favorite';
import LandingPage from '../screens/LandingPage';
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import Icon from 'react-native-vector-icons/Ionicons';
import Profil from '../screens/Profil.js';
import { color } from 'react-native-elements/dist/helpers/index.js';
import CumparaBilet from '../screens/CumparaBilet.js';
import PlataCard from '../screens/PlataCard.js';
import PlataMesaj from '../screens/PlataMesaj.js';
import VeziBilet from '../screens/VeziBilet.js';
import VeziLinie from '../screens/VeziLinie.js';
import AdaugaNotififcare from '../screens/AdaugaNotificare.js';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


function MainStack(){
  return (
    <Tab.Navigator
        initialRouteName="LandingPage"
        screenOptions={{
          activeTintColor: Colors.babyOrange,
          inactiveTintColor: Colors.myLightGrey,
        }}
      >
         
        <Tab.Screen
          name="Bilete"
          component={Bilete}
          options={{
            tabBarLabel: 'Bilete',
            headerShown: false,
            tabBarActiveTintColor: Colors.greyForText,
            tabBarActiveBackgroundColor: Colors.babyOrange,
            tabBarIcon: ({ color, size }) => (
              <Image
              source={require('../assets/icons/ticket.png')}
              style={{ width: size, height: size}}
            />
            
            ),
            
          }}
        />
        <Tab.Screen
          name="Rute"
          component={Rute}
          options={{
            tabBarLabel: 'Rute',
            headerShown: false,
            tabBarActiveTintColor: Colors.greyForText,
            tabBarActiveBackgroundColor: Colors.babyOrange,
            tabBarIcon: ({ color, size }) => (
              <Image
              source={require('../assets/icons/rute.png')}
              style={{ width: size, height: size}}
            />
            
            ),
          }}
        />
        <Tab.Screen
          name="LandingPage"
          component={LandingPage}
          options={{
            tabBarLabel: 'Acasă',
            headerShown: false,
            tabBarActiveTintColor: Colors.greyForText,
            tabBarActiveBackgroundColor: Colors.babyOrange,
            tabBarIcon: ({ color, size }) => (
              <Image
              source={require('../assets/icons/home.png')}
              style={{ width: size, height: size}}
            />
            
            ),
          }}
        />
          <Tab.Screen
          name="Notificari"
          component={Notificari}
          options={{
            tabBarLabel: 'Notificari',
            headerShown: false,
            tabBarActiveTintColor: Colors.greyForText,
            tabBarActiveBackgroundColor: Colors.babyOrange,
            tabBarIcon: ({ color, size }) => (
              <Image
              source={require('../assets/icons/notification.png')}
              style={{ width: size, height: size}}
            />
            
            ),
          }}
        />
          <Tab.Screen
          name="Favorite"
          component={Favorite}
          options={{
            tabBarLabel: 'Favorite',
            headerShown: false,
            tabBarActiveTintColor: Colors.greyForText,
            tabBarActiveBackgroundColor: Colors.babyOrange,
            tabBarIcon: ({ color, size }) => (
              <Image
              source={require('../assets/icons/favorite.png')}
              style={{ width: size, height: size}}
            />
            
            ),
          }}
        />
        <Tab.Screen
          name="Profil"
          component={Profil}
          options={{
            tabBarLabel: 'Profil',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
             // <Icon name="ios-heart" color={Colors.babyOrange} size={size} />
             <Image
              source={require('../assets/icons/resume.png')}
              style={{ width: size, height: size}}
            />
            ),
          }}
        />
      </Tab.Navigator>
  )
}

export default function UserStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
      <Stack.Screen name="MainStack" component={MainStack} options={{ headerShown: false }} />
        <Stack.Screen name="CumparaBilet" component={CumparaBilet} options={{ headerShown: false }} />
        <Stack.Screen name="PlataCard" component={PlataCard} options={{ headerShown: false }} />
        <Stack.Screen name="PlataMesaj" component={PlataMesaj} options={{ headerShown: false }} />
        <Stack.Screen name="VeziBilet" component={VeziBilet} options={{ headerShown: false }} />
        <Stack.Screen name="VeziLinie" component={VeziLinie} options={{ headerShown: false }} />
        <Stack.Screen name="AdaugaNotififcare" component={AdaugaNotififcare} options={{ headerShown: false }} />
      </Stack.Navigator>
      
      
    </NavigationContainer>
  );
}