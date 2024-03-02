import React, { useCallback, useReducer, useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import Button from '../components/Button.js';
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import CumparaBilet from './CumparaBilet.js';

const Bilete = ({navigation}) =>{
    return (
      <View style={styles.container}>
      <Text style={styles.title}>Biletele tale</Text>

      <Button
                style={styles.btn}
                title="Cumpara bilet nou"
                onPress = {()=>navigation.navigate('CumparaBilet')}
            />
      </View>
      );
    };

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
        marginTop: 35,
        alignContent: "center",
        alignItems: 'center'
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        alignItems: 'center'
      },
      itemContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
      },
      name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
      },
      favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
      },
      btn:{
        paddingHorizontal: Sizes.padding,
        paddingVertical: Sizes.padding2,
        borderWidth: 1,
        borderRadius: 50,
        borderColor: Colors.babyOrange,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.babyOrange,
        marginVertical: 12
        },
    });
    
export default Bilete;