import React, { useCallback, useReducer, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import Input from '../components/input.js';
import Button from '../components/Button.js';
import { validateInput } from '../utils/actions/formAction.js';
import { reducer } from '../utils/reducers/formReducers.js';
import GoogleButton from '../components/GoogleButton.js';
import Icon from 'react-native-vector-icons/FontAwesome';


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

            <Input 
                style={styles.input}
                id="email"
                placeholder="example@gmail.com"
                onInputChanged={inputChangedHandler}
                errorText={formState.inputValidities["email"]}
                placeholderTextColor={Colors.black}
                keyboardType="email-address"
            />
            {/*<Text style={styles.inputText}>Parola</Text>*/}
            <Input 
                style={styles.input}
                id="password"
                placeholder="********"
                onInputChanged={inputChangedHandler}
                errorText={formState.inputValidities["password"]}
                placeholderTextColor={Colors.black}
                secureTextEntry = {true}
                autoCapitalize = "none"
            />
           {/* <Text style={styles.inputText}>Confirmă Parola...</Text>*/}
            
            <View style = {styles.helpingText}>
                    <Text style={styles.inputText}>Ai uitat parola? Apasă <Text onPress = {()=>navigation.navigate("ForgotPassword")} style={styles.helpingTextBold}>aici.</Text></Text> 
                </View>

            <Button
                title="Log In"
                isLoading={isLoading}
                onPress = {()=>navigation.navigate("LandingPage")}
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