import React, { useCallback, useReducer, useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import Input from '../components/input.js';
import Button from '../components/Button.js';
import { validateInput } from '../utils/actions/formAction.js';
import { reducer } from '../utils/reducers/formReducers.js';
import GoogleButton from '../components/GoogleButton.js';
import Icon from 'react-native-vector-icons/FontAwesome';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../firebase-config.js';
import Login from './Login.js';

const ForgotPassword = ({navigation}) =>{
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [validationMessage, setValidationMessage] = useState('')
    const [ok, setOk] = useState(0);

    async function resetPassword() {
        try{
        setOk(0);
         await sendPasswordResetEmail(auth, email);
          // Password reset email sent!
            setValidationMessage('Mail-ul a fost trimis cu succes!');
            setOk(1);
            console.log("mail resetare parola trimis");
            navigation.navigate('Login');
    }   catch(error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            setValidationMessage(errorMessage);
            console.log(errorMessage);
            
        };
      }

    return (
     <SafeAreaView style={{flex:1, backgroundColor: "white"}}>
    <View style = {styles.header}>
        <Text style={styles.mainTitle}>Ai uitat parola? Nicio problemă</Text>
    </View>

    <View style = {styles.footer}>
        <KeyboardAwareScrollView>
          {/* <Text style={styles.inputText}>Nume de utilizator...</Text>*/}  
            
            <Text style={styles.inputText1}>Dacă adresa de e-mail există în baza de date, vei primi un e-mail prin care vei confirma noua parolă</Text>
            
            <TextInput 
                style={styles.inputContainer}
                id="email"
                value = {email}
                placeholder="Adresa de e-mail..."
                onChangeText={(text) => setEmail(text)}
                placeholderTextColor={Colors.myLightGrey}
                keyboardType="email-address"
            />
            
          <View style = {styles.helpingText}>
            <Text style={(ok === 0) ? styles.error:styles.good}>{validationMessage}</Text>
                </View>

            <Button
                title="Trimite"
                isLoading={isLoading}
                onPress = {resetPassword}
            />
           
        </KeyboardAwareScrollView>
        
    </View>
    
     </SafeAreaView>
    );
}

const styles = StyleSheet.create({
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
        background: "white"
    },
    helpingTextBold: {
        fontFamily: "bold",
        justifyContent: "flex-start",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 4
    },
    error: {
        marginTop: 10,
        color: 'red',
      },
      good: {
        marginTop: 10,
        color: 'green',
      },
    footer: {
        flex: 3,
        backgroundColor: Colors.babyOrange,
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
        //borderBottomLeftRadius: 50,
        //borderBottomRightRadius: 50,
        paddingHorizontal: 22,
        paddingVertical: 30,
        //borderBottomLeftRadius: 50,
        //borderBottomRightRadius: 50
        
        
    },

    inputContainer: {
        width: "100%",
        backgroundColor: Colors.white,
        paddingHorizontal: Sizes.padding,
        paddingVertical: Sizes.padding2,
        borderRadius: 50,
        borderWidth: .7,
        marginVertical: 5,
        flexDirection: "row",
        color: Colors.greyForText,
        borderColor: "white",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        flex: 1,
        fontFamily: "regular",
        paddingLeft: 20
    },
    mainTitle: {
        ...Fonts.pageTitles,
        color: Colors.black
    },
    inputText1: {
        ...Fonts.inputText,
        color: Colors.greyForText,
        marginTop: 44,
        marginBottom: 44,
        textAlign: "center"
    },
  
    

})

export default ForgotPassword;