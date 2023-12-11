import React from 'react';
import { View, Text, StyleSheet, Touchable, TouchableOpacity, ActivityIndicator} from 'react-native'; 
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome from 'react-native-vector-icons/FontAwesome';



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
           
                <Text style={{color: "#167EE6", fontFamily: "bold", fontSize: 18, lineHeight: 35}}>{props.title}{/*<FontAwesome name='google' size={25} color='#fbbc05'/>*/}Autentificare folosind
                <Text style={{color: "#4285f4"}}> G</Text>
                <Text style={{color: "#ea4335"}}>o</Text>
                <Text style={{color: "#fbbc05"}}>o</Text>
                <Text style={{color: "#4285f4"}}>g</Text>
                <Text style={{color: "#34a853"}}>l</Text>
                <Text style={{color: "#ea4335"}}>e</Text>
                </Text>
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