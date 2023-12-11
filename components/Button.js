import React from 'react';
import { View, Text, StyleSheet, Touchable, TouchableOpacity, ActivityIndicator} from 'react-native'; 
import {Colors, Sizes, Fonts} from "../constants/styles.js"



const Button = (props) =>{
    const isLoading = props.isLoading | false
    return (
     <TouchableOpacity
     style={{
        ...styles.btn,
        ...props.style
     }}

     onPress = {props.onPress}
     >

        {
            isLoading && isLoading == true ? (
                <ActivityIndicator size="small" color={Colors.white}/>
            ) : (
                <Text style={{color: Colors.white, fontFamily: "bold", fontSize: Sizes.buttonText}}>{props.title}</Text>
            )
        }

     </TouchableOpacity>

     
    );
}

const styles = StyleSheet.create({
    btn:{
    paddingHorizontal: Sizes.padding,
    paddingVertical: Sizes.padding2,
    borderWidth: 1,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.black,
    marginVertical: 12
    },

})
export default Button;