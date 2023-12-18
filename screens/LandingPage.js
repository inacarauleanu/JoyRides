import React from 'react';
import {Text, View, Button} from 'react-native';
import { auth } from '../firebase-config';
import { getAuth, signOut } from 'firebase/auth';
import { useAuthentication } from '../utils/hooks/useAuthentication';

const LandingPage = (navigation) => {
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
export default LandingPage;