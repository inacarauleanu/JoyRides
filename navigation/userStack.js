import React from 'react';
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
//const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


export default function UserStack() {
  return (
    <NavigationContainer>
      
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
            tabBarIcon: ({ color, size }) => (
              <Icon name="ios-heart" color={Colors.babyOrange} size={size} />
            )
          }}
        />
        <Tab.Screen
          name="Rute"
          component={Rute}
          options={{
            tabBarLabel: 'Rute',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="ios-settings" color={Colors.babyOrange} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="LandingPage"
          component={LandingPage}
          options={{
            tabBarLabel: 'Acasă',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="ios-home" color={Colors.babyOrange} size={size} />
            ),
          }}
        />
          <Tab.Screen
          name="Notificari"
          component={Notificari}
          options={{
            tabBarLabel: 'Notificari',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="ios-alarm" color={Colors.babyOrange} size={size} />
            ),
          }}
        />
          <Tab.Screen
          name="Favorite"
          component={Favorite}
          options={{
            tabBarLabel: 'Favorite',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="ios-star" color={Colors.babyOrange} size={size} />
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
              <Icon name="ios-body" color={Colors.babyOrange} size={size} />
            ),
          }}
        />
      </Tab.Navigator>

    </NavigationContainer>
  );
}