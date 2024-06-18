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
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from "../firebase-config.js";
import LandingPage from './LandingPage.js';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

const Login = ({navigation}) =>{
    const [isLoading, setIsLoading] = useState(false);

    const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [validationMessage,setvalidationMessage] = useState('');
  const [ok, setOk] = useState(0);

// variabila de stare pentru parola
const [showPassword, setShowPassword] = useState(false); 

// functia pentru toggle
const toggleShowPassword = () => { 
    setShowPassword(!showPassword); 
}; 
  async function login() {
    setOk(0);
    if (email === '' || password === '') {
      setvalidationMessage('Niciun câmp nu poate fi lăsat gol');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth,email, password);
     setOk(1);
      setvalidationMessage('Utilizatorul a fost logat cu succes');
      console.log("logat");
          setEmail('');
          setPassword('');
         // navigation.navigate('LandingPage');
    } catch (error) {
        if(error.code === "auth/invalid-credential") setvalidationMessage("Datele introduse sunt invalide");
     else setvalidationMessage(error.message);
    }
  }

    return (
     <SafeAreaView style={{flex:1, backgroundColor: "white"}}>
    <View style = {styles.header}>
        <Text style={styles.mainTitle}>Introdu detaliile contului tău</Text>
    </View>

    <View style = {styles.footer}>
        <KeyboardAwareScrollView>
            <TextInput 
                style={styles.inputContainer}
                id="email"
                value={email}
                onChangeText={(text) => setEmail(text)}
                placeholder="Adresa de e-mail..."
                placeholderTextColor={Colors.myLightGrey}
                keyboardType="email-address"
            />
            {/*<Text style={styles.inputText}>Parola</Text>*/}
            <View style={styles.inputContainer}> 
            <TextInput 
                style={styles.inputText}
                id="password"
                placeholder="Parola..."
                value={password}
                onChangeText={(text) => setPassword(text)}
                placeholderTextColor={Colors.myLightGrey}
                secureTextEntry = {!showPassword} 
                autoCapitalize = "none"
            />
             <MaterialCommunityIcons 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={24} 
                    color="#aaa"
                    style={styles.icon} 
                    onPress={toggleShowPassword} 
                /> 
                </View>
           {/* <Text style={styles.inputText}>Confirmă Parola...</Text>*/}
            
            <View style = {styles.helpingText}>
            <Text style={(ok === 0) ? styles.error:styles.good}>{validationMessage}</Text>
                    <Text style={styles.inputText1}>Ai uitat parola? Apasă <Text onPress = {()=>navigation.navigate("ForgotPassword")} style={styles.helpingTextBold}>aici.</Text></Text> 
                </View>

            <Button
                title="Log In"
                isLoading={isLoading}
                onPress = {login}
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
    icon: { 
        marginLeft: 100,
        
    },
    inputText1: {
        ...Fonts.inputText,
        color: Colors.black,
        marginBottom:30,
        textAlign: "center",
        fontFamily:"regular"
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
        alignItems: 'center', 
        justifyContent: 'center', 
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
        paddingLeft: 20,
        fontSize: 16, 
        
    },

    
    mainTitle: {
        ...Fonts.pageTitles,
        color: Colors.black
    },
    inputText: {
        
       // ...Fonts.inputText,
       fontFamily: "regular",
        color: Colors.greyForText,
        flex: 1, 
        fontSize: 16, 
       
    },
    

})

export default Login;