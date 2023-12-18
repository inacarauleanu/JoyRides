import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Register from '../screens/Register';
import Login from '../screens/Login';
import ForgotPassword from '../screens/ForgotPassword';
import Welcome from '../screens/Welcome'

const Stack = createStackNavigator();

export default function AuthStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Welcome" component={Welcome} options = {{
              headerShown: false
            }}/>
        <Stack.Screen name="Register" component={Register} options = {{
              headerShown: false
            }} />
        <Stack.Screen name="Login" component={Login} options = {{
              headerShown: false
            }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} options = {{
              headerShown: false
            }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}