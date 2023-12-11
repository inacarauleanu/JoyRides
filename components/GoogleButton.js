import React from 'react';
import { View, Text, StyleSheet, Touchable, TouchableOpacity, ActivityIndicator} from 'react-native'; 
import {Colors, Sizes, Fonts} from "../constants/styles.js"



const GoogleButton = (props) =>{
    const isLoading = props.isLoading | false
    return (
     <TouchableOpacity
     style={{
        ...styles.Googlebtn,
        ...props.style
     }}

     onPress = {props.onPress}
     >

        {
            isLoading && isLoading == true ? (
                <ActivityIndicator size="small" color={Colors.white}/>
            ) : (
                <Text style={{color: "#167EE6", fontFamily: "bold", fontSize: Sizes.otherText}}>{props.title}</Text>
            )
        }

     </TouchableOpacity>

     
    );
}

const styles = StyleSheet.create({
    Googlebtn:{
    paddingHorizontal: Sizes.padding,
    paddingVertical: Sizes.padding2,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    marginVertical: 12
    },

})
export default GoogleButton;