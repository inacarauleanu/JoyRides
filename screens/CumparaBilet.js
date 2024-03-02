import React, { useCallback, useReducer, useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
//import Button from '../components/Button.js';
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import { ButtonGroup, Button, Image } from 'react-native-elements';
import { color, fonts } from '@rneui/base';
import { Dropdown } from 'react-native-element-dropdown';
import PlataCard from './PlataCard.js';
import PlataMesaj from './PlataMesaj.js';

const tramvaie = [
    { label: 'Tramvai 8', value: '1' },
    { label: 'Tramvai 9', value: '2' },
    { label: 'Tramvai 7', value: '3' },
    { label: 'Tramvai 4', value: '4' },
  ];

  const autobuze = [
    { label: 'E2', value: '1' },
    { label: 'E3', value: '2' },
    { label: 'E7', value: '3' },
  ];

  const troleibuze = [
    { label: 'M15', value: '1' },
    { label: 'M16', value: '2' },
  ];

  const data = [
    { label: 'Item 1', value: '1' },
    { label: 'Item 2', value: '2' },
    { label: 'Item 3', value: '3' },
    { label: 'Item 4', value: '4' },
    { label: 'Item 5', value: '5' },
    { label: 'Item 6', value: '6' },
    { label: 'Item 7', value: '7' },
    { label: 'Item 8', value: '8' },
  ];

const CumparaBilet = ({navigation}) =>{
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedIndexes, setSelectedIndexes] = useState(0);
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);


    return ( 
        <View style={styles.container}>

      <Text style={styles.title}>Configurează-ți biletul</Text>
      <View style={styles.pickCont}>
      <Text style={styles.semititle}>Valabilitatea biletului</Text>
      <ButtonGroup
      buttons={['60 de minute', '24 de ore']}
      selectedIndex={selectedIndex}
      onPress={(value) => {
        setSelectedIndex(value);
        
      }}
      containerStyle={styles.butonContainer}
      selectedButtonStyle = {styles.selectedButtonStyle}
      textStyle = {styles.textStyle}
      
    />

<Text style={styles.semititle}>Mijlocul de transport</Text>
      <ButtonGroup
      buttons={['Tramvai', 'Autobuz', 'Troleibuz']}
      selectedIndex={selectedIndexes}
      onPress={(value) => {
        setSelectedIndexes(value);
        
      }}
      containerStyle={styles.butonContainer}
      selectedButtonStyle = {styles.selectedButtonStyle}
      textStyle = {styles.textStyle}
      
    />

<Text style={styles.semititle}>Linia</Text>
<Dropdown
         style={[styles.dropdown, isFocus && { borderColor: Colors.babyOrange }]}
         placeholderStyle={styles.placeholderStyle}
         selectedTextStyle={styles.selectedTextStyle}
         inputSearchStyle={styles.inputSearchStyle}
         itemTextStyle = {styles.textStyle}
          data={selectedIndexes == 0 ? tramvaie : (selectedIndexes == 1 ? autobuze : troleibuze)}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Alege linia' : '...'}
          searchPlaceholder="Caută..."
          value={value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setValue(item.value);
            setIsFocus(false);
          }}
        />

      </View>
      <Button
                buttonStyle={styles.btn}
                title="Plata card   "
                onPress = {()=>navigation.navigate("PlataCard")}
                titleStyle = {styles.titlu}
                icon = {
                    <Image
                    source={require('../assets/icons/credit-card.png')}
                    style={{ width: 20, height: 20}}
                  />
                  
                }
                iconRight = 'true'
                
            
        />
         <Button
                buttonStyle={styles.btn1}
                title="Plata SMS   "
                onPress = {()=>navigation.navigate("PlataMesaj")}
                titleStyle = {styles.titlu}
                icon = {
                    <Image
                    source={require('../assets/icons/email.png')}
                    style={{ width: 20, height: 20}}
                  />
                  
                }
                iconRight = 'true'
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

        },
        pickCont: {
            flex: 1,
            padding: 20,
            backgroundColor: '#ffffff',
            marginTop: 10 
        },
        butonContainer: {
            borderRadius: 50,
            backgroundColor: Colors.myLightGrey,
            elevation: 3,
               },
        selectedButtonStyle:{
            backgroundColor: Colors.babyOrange
               },
        title: {
        marginTop: 20,
          ...Fonts.screenTitle,
          marginBottom: 10,
          textAlign: 'center'
        },
        titlu:{
            ...Fonts.screenTitle,
            color: Colors.white, fontSize: Sizes.buttonText
        },
        semititle: {
             marginTop: 20,
              marginBottom: 20,
                textAlign: 'left',
              ...Fonts.inputText,
            },
        textStyle:{
            ...Fonts.basicText,
            color: Colors.black
            },
        itemContainer: {
          backgroundColor: '#fff',
          borderRadius: 8,
          padding: 15,
          marginBottom: 15,
          elevation: 3,
        },
        dropdown: {
            height: 50,
            borderColor: 'gray',
            borderWidth: 0.5,
            borderRadius: 50,
            paddingHorizontal: 8,
            
          },
 
          placeholderStyle: {
         
            ...Fonts.basicText
          },
          selectedTextStyle: {
           
            ...Fonts.basicText
          },
          inputSearchStyle: {
            height: 40,
            ...Fonts.basicText
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
          btn1:{
            paddingHorizontal: Sizes.padding,
            paddingVertical: Sizes.padding2,
            borderWidth: 1,
            borderRadius: 50,
            borderColor: Colors.myLightGrey,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: Colors.black,
            marginVertical: 12
            },
      });
      
export default CumparaBilet;