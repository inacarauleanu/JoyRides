import React, { useCallback, useReducer, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import Input from '../components/input.js';
import Button from '../components/Button.js';
import { validateInput } from '../utils/actions/formAction.js';
import { reducer } from '../utils/reducers/formReducers.js';
import GoogleButton from '../components/GoogleButton.js';
import Icon from 'react-native-vector-icons/FontAwesome';
import LandingPage from './LandingPage.js';
import { getAuth, signInAnonymously } from "firebase/auth";
import { auth } from '../firebase-config.js';



const Welcome = ({navigation}) =>{
    const [isLoading, setIsLoading] = useState(false);

    async function anonimLogin() {
    
        signInAnonymously(auth)
        .then(() => {
            // Signed in..
            console.log("logat anonim");
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage);
            // ...
        });
      }


    return (
     <SafeAreaView style={{flex:1, backgroundColor: "white"}}>
    <View style={styles.container}>
        <Text style={styles.appTitle}>JoyRide</Text>
    </View>

    <View >
        <KeyboardAwareScrollView>
          {/* <Text style={styles.inputText}>Nume de utilizator...</Text>*/}  
          <View style={styles.container}>
          <Image source = {require('../assets/icons/public-transport.png')}
             style = {styles.image}
          />
         </View>
         <View style = {styles.helpingText}>
                    <Text style={styles.inputText}>Transportul public pentru tot publicul </Text> 
                </View>

            <Button
                style={styles.btn}
                title="Autentificare"
                isLoading={isLoading}
                onPress = {()=>navigation.navigate("Register")}
            />

            <Button
                style={styles.btn1}
                title="Continuă ca anonim"
                isLoading={isLoading}
                onPress = {anonimLogin}
            />
           
        </KeyboardAwareScrollView>
        
    </View>
    
     </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 43
      },
      image: {
        width: 200,
        height: 200,
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
            backgroundColor: Colors.myLightGrey,
            marginVertical: 12
            },
        
    header: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 4
    },

    helpingText: {
        justifyContent: "flex-start",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 4,
        background: "white",
        marginBottom: 56
    },

    mainTitle: {
        ...Fonts.pageTitles,
        color: Colors.black
    },
    inputText: {
        ...Fonts.inputText,
        color: Colors.greyForText,
        marginVertical:4
    },
    appTitle:{
        ...Fonts.appTitle,
        color: "black"
    }
    

})

export default Welcome;