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
        fullName: isTestMode ? "John Doe" : "",
        email: isTestMode ? "example@gmail.com" : "",
        password: isTestMode ? "*******" : "",
        confirmPassword: isTestMode ? "*******" : "",

    },

    inputValidities:{
        fullName: false,
        email: false,
        password: false,
        confirmPassword: false
    },

    formIsValid: false
}



const Register = ({navigation}) =>{
    const [isLoading, setIsLoading] = useState(false);
    const [formState, dispatchFormState] = useReducer(reducer, initialState);

    const inputChangedHandler = useCallback((inputId, inputValue) =>{
        const result = validateInput(inputId, inputValue)
        dispatchFormState({inputId, validationResult: result, inputValue})
    }, [dispatchFormState])


    return (
     <SafeAreaView style={{flex:1 }}>
    <View style = {styles.header}>
        <Text style={styles.mainTitle}>Crează-ți un cont gratuit</Text>
    </View>

    <View style = {styles.footer}>
        <KeyboardAwareScrollView>
          {/* <Text style={styles.inputText}>Nume de utilizator...</Text>*/}  
            <Input 
                id="fullName"
                placeholder="John Doe"
                onInputChanged={inputChangedHandler}
                errorText={formState.inputValidities["fullName"]}
                placeholderTextColor={Colors.black}
            />
            {/*<Text style={styles.inputText}>Adresa de e-mail...</Text>*/}
            <Input 
                id="email"
                placeholder="example@gmail.com"
                onInputChanged={inputChangedHandler}
                errorText={formState.inputValidities["email"]}
                placeholderTextColor={Colors.black}
                keyboardType="email-address"
            />
            {/*<Text style={styles.inputText}>Parola...</Text>*/}
            <Input 
                id="password"
                placeholder="********"
                onInputChanged={inputChangedHandler}
                errorText={formState.inputValidities["password"]}
                placeholderTextColor={Colors.black}
                secureTextEntry = {true}
                autoCapitalize = "none"
            />
           {/* <Text style={styles.inputText}>Confirmă Parola...</Text>*/}
            <Input 
                id="confirmPassword"
                placeholder="********"
                onInputChanged={inputChangedHandler}
                errorText={formState.inputValidities["confirmPassword"]}
                placeholderTextColor={Colors.black}
                secureTextEntry = {true}
                autoCapitalize = "none"
            />

            <View style = {styles.helpingText}>
                    <Text style={styles.inputText}>Ai deja un cont? Apasă <Text onPress = {()=>navigation.navigate("Login")} style={styles.helpingTextBold}>aici.</Text></Text> 
                </View>

            <Button
                title="Autentificare"
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

    helpingText: {
        justifyContent: "flex-start",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingBottom: 4
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
        paddingVertical: 30

    },
    mainTitle: {
        ...Fonts.pageTitles,
        color: Colors.black
    },
    inputText: {
        ...Fonts.inputText,
        color: Colors.greyForText,
        marginVertical: 4
    },

})

export default Register;