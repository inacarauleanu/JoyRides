import React, { useCallback, useReducer, useState } from 'react';
import { View, Text, StyleSheet, TextInput , Button} from 'react-native';
import { auth } from '../firebase-config';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { getAuth, signOut } from 'firebase/auth';

const Profil = () =>{
    const { user } = useAuthentication();
    return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
           <Text>Hello, {user?.email}!</Text>
       <Button title="Sign Out" style={{marginTop:10}} onPress={() => signOut(auth)} />
        </View>
      );
    };
    
export default Profil;