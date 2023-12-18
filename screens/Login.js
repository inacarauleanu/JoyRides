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

const auth = getAuth();

const isTestMode = true;

const initialState = {
    inputValues:{
        email: isTestMode ? "example@gmail.com" : "",
        password: isTestMode ? "*******" : ""
    },

    inputValidities:{
        email: false,
        password: false
    },

    formIsValid: false
}



const Login = ({navigation}) =>{
    const [isLoading, setIsLoading] = useState(false);
    const [formState, dispatchFormState] = useReducer(reducer, initialState);

    const inputChangedHandler = useCallback((inputId, inputValue) =>{
        const result = validateInput(inputId, inputValue)
        dispatchFormState({inputId, validationResult: result, inputValue})
    }, [dispatchFormState])

    const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [validationMessage,setvalidationMessage] = useState('');
  
  async function login() {
    ok = 0;
    if (email === '' || password === '') {
      setvalidationMessage('required filled missing')
      return;
    }

    try {
      await signInWithEmailAndPassword(auth,email, password);
      ok = 1;
      setvalidationMessage('Utilizatorul a fost logat cu succes');
      console.log("logat");
          setEmail('');
          setPassword('');
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
          {/* <Text style={styles.inputText}>Nume de utilizator...</Text>*/}  
            
            {/*<Text style={styles.inputText}>Adresa de e-mail</Text>*/}
            <Text style={styles.inputText1}>Dacă adresa de e-mail există în baza de date, vei primi un e-mail prin care vei confirma noua parolă</Text>

            <TextInput 
                style={styles.inputContainer}
                id="email"
                value={email}
                onChangeText={(text) => setEmail(text)}
                placeholder="Adresa de e-mail..."
                onInputChanged={inputChangedHandler}
                errorText={formState.inputValidities["email"]}
                placeholderTextColor={Colors.myLightGrey}
                keyboardType="email-address"
            />
            {/*<Text style={styles.inputText}>Parola</Text>*/}
            <TextInput 
                style={styles.inputContainer}
                id="password"
                placeholder="Parola..."
                value={password}
                onChangeText={(text) => setPassword(text)}
                onInputChanged={inputChangedHandler}
                errorText={formState.inputValidities["password"]}
                placeholderTextColor={Colors.myLightGrey}
                secureTextEntry = {true}
                autoCapitalize = "none"
            />
           {/* <Text style={styles.inputText}>Confirmă Parola...</Text>*/}
            
            <View style = {styles.helpingText}>
            <Text style={(ok == 0) ? styles.error:styles.good}>{validationMessage}</Text>
                    <Text style={styles.inputText}>Ai uitat parola? Apasă <Text onPress = {()=>navigation.navigate("ForgotPassword")} style={styles.helpingTextBold}>aici.</Text></Text> 
                </View>

            <Button
                title="Log In"
                isLoading={isLoading}
                onPress = {login}
            />

            <GoogleButton
                isLoading={isLoading}
                onPress = {()=>navigation.navigate("Login")}
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

    inputText1: {
        ...Fonts.inputText,
        color: Colors.babyOrange,
        marginBottom:10,
        textAlign: "center"
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
    inputText: {
        ...Fonts.inputText,
        color: Colors.greyForText,
        marginTop: 36,
        marginBottom: 36
    },
    

})

export default Login;