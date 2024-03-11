import React, { useCallback, useReducer, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button } from 'react-native';
import {Image } from 'react-native-elements';
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import { getDatabase, ref, onValue, off, query, orderByChild, orderByValue,set, update } from "firebase/database";
import { auth } from "../firebase-config.js";

const VeziBilet = ({navigation, route}) =>{

    const valabilitate = route.params.valabilitate;
    const data_efectuare = new Date(route.params.data_efectuare);
    const ora_efectuare = route.params.ora_efectuare;
    const id = route.params.id;
    const linie = route.params.linie;
    const total = route.params.total;

    /*console.log("valabilitate", valabilitate);
    console.log("data_efectuare", data_efectuare);
    console.log("ora_efectuare", ora_efectuare);
    console.log("id", id);*/

    const [remainingTime, setRemainingTime] = useState(null);
    const [ore, setOre] = useState(null);
    const [minute, setMinute] = useState(null);
    const [secunde, setSecunde] = useState(null);


    useEffect(() => {
        const creationDate = new Date(data_efectuare);
    
        let validityMilliseconds;
        if (valabilitate === '"1h"') {
          validityMilliseconds = 60 * 60 * 1000; // 1 hour in milliseconds
        } else if (valabilitate === '"24h"') {
          validityMilliseconds = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        }
    
        const expiryDate = new Date(creationDate.getTime() + validityMilliseconds);
    
        const timer = setInterval(() => {
          const now = new Date();
          const difference = expiryDate - now;
    
          if (difference <= 0) {
            clearInterval(timer);
            setRemainingTime('Expirat');

                
          } else {
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            setRemainingTime(`${hours}:${minutes}:${seconds}`);
            setOre(hours);
            setMinute(minutes);
            setSecunde(seconds);
          }
        }, 1000);
    
        return () => clearInterval(timer);
      }, []);

      return (
        <View style={styles.container}>
        {remainingTime === 'Expirat' ? (
            <Text style={styles.titleExpirat}>Expirat</Text>
        ) : (
            <View>
                <Text style={styles.title}>Timp rămas</Text>
                <View style={styles.timer}>
                    <View style={[styles.timeUnit, styles.hourUnit]}>
                        <Text>{ore}</Text>
                      
                    </View>
                    <Text style={styles.timeSeparator}>:</Text>
                    <View style={[styles.timeUnit, styles.minuteUnit]}>
                        <Text>{minute}</Text>
                        
                    </View>
                    <Text style={styles.timeSeparator}>:</Text>
                    <View style={[styles.timeUnit, styles.secondUnit]}>
                        <Text>{secunde}</Text>
                    </View>
                </View>
            </View>
        )}
    </View>
      );
    };

  
const styles = StyleSheet.create({ 
    container: { 
        flex: 1, 
        padding: 20, 
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: "#ffffff", 
    }, 
    title: { 
        fontSize: 30, 
        fontWeight: "bold", 
        paddingVertical: 20, 
        color: "green", 
        alignItems: "center", 
    }, 
    titleExpirat: { 
        fontSize: 30, 
        fontWeight: "bold", 
        paddingVertical: 20, 
        color: Colors.myRed, 
        alignItems: "center", 
    }, 
    subtitle: { 
        marginBottom: 20, 
        fontSize: 18, 
    }, 
    timer: { 
        flexDirection: "row", 
        alignItems: "center", 
        alignContent: "center"
    }, 
    timeUnit: { 
        fontSize: 24, 
        fontWeight: "bold", 
        paddingHorizontal: 20, 
        paddingVertical: 20, 
        alignItems: "center"
    }, 
    yearUnit: { 
        backgroundColor: "red", 
        borderRadius: 15, 
        color: "white", 
    }, 
    dayUnit: { 
        backgroundColor: "#3498db", 
        borderRadius: 15, 
        color: "white", 
    }, 
    hourUnit: { 
        backgroundColor: "#27ae60", 
        borderRadius: 15, 
        color: "white", 
        alignItems: "center"
    }, 
    minuteUnit: { 
        backgroundColor: "#f39c12", 
        borderRadius: 15, 
        color: "white", 
        alignItems: "center"
    }, 
    secondUnit: { 
        backgroundColor: "#9b59b6", 
        borderRadius: 15, 
        color: "white", 
        alignItems: "center"
    }, 
    timeSeparator: { 
        fontSize: 24, 
        fontWeight: "bold", 
        marginHorizontal: 5, 
    }, 
    timetitle: { 
        fontSize: 17, 
        padding: 10, 
        paddingRight: 19, 
        fontWeight: "bold", 
    }, 
}); 
    
export default VeziBilet;