import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import {Colors, Sizes, Fonts} from "../constants/styles.js"

const Input = (props) =>{
    
    const onChangeText = (text) =>{
        props.onInputChanged(props.id, text)
    }
    return (
     <View style={styles.container}>
        <View style={[styles.inputContainer, {borderColor: "gray"}]}>
            <TextInput
                {...props}     
                style = {styles.input}
                onChangeText={onChangeText}
                placeholder={props.placeholder}  
                placeholderTextColor={props.placeholderTextColor}     
            />
        </View>
        {
            props.errorText && (
                <View style={styles.errorContainer}>
                    <Text style = {styles.errorText}>{props.errorText[0]}</Text>

                </View>
            )
        }
     </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%"
    },

    inputContainer: {
        width: "100%",
        backgroundColor: Colors.white,
        paddingHorizontal: Sizes.padding,
        paddingVertical: Sizes.padding2,
        borderRadius: 50,
        borderWidth: .7,
        marginVertical: 5,
        flexDirection: "row"
    },

    input: {
        color: Colors.greyForText,
        flex: 1,
        fontFamily: "regular",
        paddingTop: 0
    },

    errorContainer: {
        marginVertical: 4
    },

    errorText: {
        color: "red",
        fontSize: 12
    }

})
export default Input;