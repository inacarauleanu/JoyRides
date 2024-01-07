import React from 'react';
import{StyleSheet, Text, View, Dimensions, TouchableOpacity} from 'react-native';
import {Colors, Sizes, Fonts} from "../constants/styles.js"

const WIDTH = Dimensions.get('window').width;

const DestinationButton = (props) =>{
    return(
        <TouchableOpacity onPress = {()=>{}}
        style = {styles.container}>
            <View style = {styles.leftCol}>
                <Text style = {{fontSize: 8}}>{'\u25A0'}</Text>
            </View>
            <View style = {styles.centerCol}>
            <Text style = {{fontFamily: "thin", fontSize:21, color: Colors.greyForText}}>Încotro?</Text>
            </View>
            <View style = {styles.rightCol}></View>
        </TouchableOpacity>

    )
}
const styles = StyleSheet.create(
    {
        container:{
            zIndex:9,
            position: 'absolute',
            flexDirection: 'row',
            width: (WIDTH-40),
            height:60,
            top:110,
            left:20,
            borderRadius: 2,
            backgroundColor: 'white',
            alignItems: 'center',
            shadowColor: '#0000000',
            elevation: 7,
            shadowRadius: 1.0,

        },
        leftCol: {
            flex: 1,
            alignItems: 'center'
        },
        centerCol:{
            flex:4,
        },
        rightCol:{
            flex:1,
            borderLeftWidth:1,
            borderColor: '#ededed',
        }
    }
)
export default DestinationButton;