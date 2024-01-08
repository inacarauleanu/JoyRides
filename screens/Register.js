import React, { useCallback, useReducer, useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import {Input} from 'react-native-elements';
import Button from '../components/Button.js';
import { validateInput } from '../utils/actions/formAction.js';
import { reducer } from '../utils/reducers/formReducers.js';
import GoogleButton from '../components/GoogleButton.js';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, GoogleAuthProvider, getAuth } from 'firebase/auth';
import { auth } from "../firebase-config.js";
import { getDatabase, ref, set } from "firebase/database";
import LandingPage from './LandingPage.js';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const Register = ({navigation}) =>{
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullname, setFullname] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('')
    const [validationMessage, setValidationMessage] = useState('')
    const [validationMessageGood, setValidationMessageGood] = useState('')
    const [ok, setOk] = useState(0);
    const [showPassword, setShowPassword] = useState(false); 
    const [showPassword1, setShowPassword1] = useState(false); 


    let validateAndSet = (value,setValue) => {
        setValue(value)
     }

     function checkPassword(firstpassword,secondpassword) {
        setValidationMessage('');
        setValidationMessageGood('');
        if(firstpassword !== secondpassword){
           // ok = 0;
          setValidationMessage('Parolele nu se potrivesc') 
        }
        else setValidationMessage('')
      }

      function writeUserData(userId, name, email) {
        const db = getDatabase();
        set(ref(db, 'users/' + userId), {
          username: name,
          email: email,
        });
      }
    
      async function createAccount() {
        setValidationMessage('');
         setOk(0);
        try {
            setValidationMessage('');
            if(email === '' || password === '' || fullname === '' || confirmPassword === '')
            setValidationMessage('Toate campurile trebuiesc completate')
        else
           { if(password !== confirmPassword){
              setValidationMessage('Parolele nu se potrivesc');
            }else{
          await createUserWithEmailAndPassword(auth, email, password);
          setOk(1);
          setValidationMessage('Utilizatorul a fost inregistrat cu succes');
          const userId = auth.currentUser.uid;
          writeUserData(userId,fullname, email);
          console.log("bagat");
          setConfirmPassword('');
          setEmail('');
          setFullname('');
          setPassword('');
          //navigation.navigate('LandingPage');
            }
        }
        } catch (error) {
            if(error.code === "auth/email-already-in-use") setValidationMessage("Acest e-mail este deja folosit");
            else setValidationMessage(error.message);
        }
      }

      async function signInWithGoogle() {
        setValidationMessage('');
         setOk(0);
        try {
            const provider = new GoogleAuthProvider()
            //provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
            setValidationMessage('');
          await signInWithPopup(auth, provider);
          const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // IdP data available using getAdditionalUserInfo(result)
          console.log("bagat prin google" + {user});

          //navigation.navigate('LandingPage');       
        
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
             // The email of the user's account used.
           // const email = error.customData.email;
             // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
        setValidationMessage(errorMessage);
        }
      }

    const toggleShowPassword = () => { 
        setShowPassword(!showPassword); 
    }; 

    const toggleShowPassword1 = () => { 
        setShowPassword1(!showPassword1); 
    }; 


    return (
     <SafeAreaView style={{flex:1, backgroundColor: "white" }} >
    <View style = {styles.header}>
        <Text style={styles.mainTitle}>Crează-ți un cont gratuit</Text>
    </View>

    <View style = {styles.footer} >
        <KeyboardAwareScrollView>
          {/* <Text style={styles.inputText}>Nume de utilizator...</Text>*/}  
            <TextInput style={styles.inputContainer} 
                id="fullName"
                value={fullname}
                placeholder="Nume de utilizator..."
               // onInputChanged={inputChangedHandler}
                onChangeText={(text) => setFullname(text)}
                placeholderTextColor={Colors.myLightGrey}
            />
            {/*<Text style={styles.inputText}>Adresa de e-mail...</Text>*/}
            <TextInput style={styles.inputContainer}
                id="email"
                value={email}
                placeholder="Adresa de e-mail..."
                onChangeText={(text) => setEmail(text)}
                placeholderTextColor={Colors.myLightGrey}
                keyboardType="email-address"
            />
            {/*<Text style={styles.inputText}>Parola...</Text>*/}
            <View style={styles.inputContainer}> 
            <TextInput style={styles.inputText}
               id="password"
               value={password}
                placeholder="Parola..."
                onChangeText={(value) => validateAndSet(value, setPassword)}
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
           <View style={styles.inputContainer}> 
            <TextInput style={styles.inputText}
                id="confirmPassword"
               value = {confirmPassword}
                placeholder="Confirmă parola..."
                onChangeText={(value) => validateAndSet(value,setConfirmPassword)}
                placeholderTextColor={Colors.myLightGrey}
                secureTextEntry = {!showPassword1} 
                autoCapitalize = "none"
                //onBlur={()=>checkPassword(password,confirmPassword)}
            />
            <MaterialCommunityIcons 
                    name={showPassword1 ? 'eye-off' : 'eye'} 
                    size={24} 
                    color="#aaa"
                    style={styles.icon} 
                    onPress={toggleShowPassword1} 
                />     
            </View>        
            
            <View style = {styles.helpingText}>
            <Text style={(ok === 0) ? styles.error:styles.good}>{validationMessage}</Text>
                    <Text style={styles.inputText}>Ai deja un cont? Apasă <Text onPress = {()=>navigation.navigate("Login")} style={styles.helpingTextBold}>aici.</Text></Text> 
                </View>
                

            <Button
                title="Autentificare"
                isLoading={isLoading}
                onPress = {createAccount}
            />

            <GoogleButton
                isLoading={isLoading}
                onPress = {signInWithGoogle}
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
    helpingText: {
        justifyContent: "flex-start",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingBottom: 4
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
        paddingLeft: 20,
        fontSize: 16, 
    },

})

export default Register;