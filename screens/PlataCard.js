import React, { useState, useEffect } from 'react';
import {Alert} from 'react-native';
import { ButtonGroup, Image, Button } from 'react-native-elements';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import {Colors, Sizes, Fonts} from "../constants/styles.js"
import { StripeProvider, CardField, useStrip, useConfirmPayment } from '@stripe/stripe-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import { auth } from "../firebase-config.js";
import { getDatabase, ref, set } from "firebase/database";
import uuid from 'react-native-uuid';

const PlataCard = ({navigation, route}) => {
  //const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState();
  const { confirmPayment, loading } = useConfirmPayment();
  const total = route.params.amount;
  const valabilitate = route.params.valabilitate;
  const mijloc_transport = route.params.mijloc_transport;
  const linie = route.params.linie;

  console.log("valabilitate", valabilitate);
  console.log("linie", linie);

  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    var date = new Date().getDate(); //Current Date
    var month = new Date().getMonth() + 1; //Current Month
    var year = new Date().getFullYear(); //Current Year
    var hours = new Date().getHours(); //Current Hours
    var min = new Date().getMinutes(); //Current Minutes
    var sec = new Date().getSeconds(); //Current Seconds
    setCurrentDate(
      date + '/' + month + '/' + year + ' ' + hours + ':' + min + ':' + sec
    );

    setCurrentTime(
      hours + ':' + min + ':' + sec
    );
  }, []);

  function writeUserBilete(userId, valabilitate, mijloc_transport, linie, total,  ora_efectuare) {
    const db = getDatabase();

    set(ref(db, 'users/' + userId + '/bilete/' + uuid.v4()), {
      valabilitate: valabilitate,
      mijloc_transport: mijloc_transport,
      linie: linie,
      total: total/100,
      data_efectuare: new Date().toISOString(),
      ora_efectuare: ora_efectuare,
      status: "valid"
    });
  }
  
  const handlePayment = async () => {

    console.log("total:", JSON.stringify(total));
    console.log("valabilitate:", JSON.stringify(valabilitate));
    console.log("mijloc_transport:", JSON.stringify(mijloc_transport));
    console.log("linie:", JSON.stringify(linie));

    const response = await fetch(`http://192.168.1.102:3000/payments/intents`, { //DE SCHIMBAT LA TIMISOARA
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify({
        currency: 'usd',
        amount: total,
        
      }),
    });
    const {clientSecret} = await response.json();
    console.log(clientSecret);
    return clientSecret;
  };

 // const {confirmPayment, loading} = useConfirmPayment();
  const handlePayPress = async () => {
      // Gather the customer's billing information (for example, email)
      const billingDetails = {
        email: "mariaina3510@gmail.com",
      };
      // Fetch the intent client secret from the backend
      const clientSecret = await handlePayment();
      console.log(clientSecret);
      // Confirm the payment with the card details
      const {paymentIntent, error} = await confirmPayment(clientSecret, {
        paymentMethodType:'Card',
        paymentMethodData: {
                     cardDetails
        },
        
      });
      if (error) {
        console.log('Payment confirmation error', error);
        Alert.alert('Eroare la procesarea plății', 'Încearcă din nou');
      } else if (paymentIntent) {
        console.log('Success from promise', paymentIntent);
        const userId = auth.currentUser.uid;
        writeUserBilete(userId, JSON.stringify(valabilitate), JSON.stringify(mijloc_transport), JSON.stringify(linie), JSON.stringify(total), currentTime);
        Alert.alert('Plată efectuată cu succes', 'Tranzacția a fost efectuată cu succes!',[
          {
            onPress: ()=>navigation.navigate("Bilete")
          }
        ]);
      }
    };



  return (
    <StripeProvider
    publishableKey="pk_test_51OpvfCKcaXlZmQKjHf3lm34rDl7qShBV66QCIQ40dWW2Xik0ad3OFg2kpdkbEZ2t0q0IYprvkDALp4KmeKh3myhl00D38yCiu2"
    >
      <SafeAreaView style={{flex:1, backgroundColor: "white"}}>
    <View style = {styles.header}>
        <Text style={styles.mainTitle}>Introdu detaliile cardului tău</Text>
    </View>
    <View style = {styles.footer}>
    <KeyboardAwareScrollView>
          {/* <Text style={styles.inputText}>Nume de utilizator...</Text>*/}  
            
            <Text style={styles.inputText1}>Dacă tranzacția va reuși, vei fi redirecționat la pagina de Bilete</Text>
      <CardField
        postalCodeEnabled={false}
        placeholders={{
          number: '4242 4242 4242 4242',
        }}
        cardStyle={{
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
        }}
        style={{
          width: '100%',
          height: 50,
          marginVertical: 30,
        }}
        onCardChange={(cardDetails) => {
          console.log('cardDetails', cardDetails);
        }}
        onFocus={(focusedField) => {
          console.log('focusField', focusedField);
          setCardDetails(cardDetails);
        }}
      />
       <Button
                buttonStyle={styles.btn}
                title="Plătește acum      "
                onPress={handlePayPress}
                disabled={loading} 
                titleStyle = {styles.titlu}
                icon = {
                    <Image
                    source={require('../assets/icons/credit-card.png')}
                    style={{ width: 20, height: 20}}
                  />
                  
                }
                iconRight = 'true'
                
            
        />
      </KeyboardAwareScrollView>
    </View>
    </SafeAreaView>
    </StripeProvider>
  );
};

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
  error: {
      marginTop: 10,
      color: 'red',
    },
    good: {
      marginTop: 10,
      color: 'green',
    },
  footer: {
      flex: 3,
      backgroundColor: Colors.babyOrange,
      borderTopLeftRadius: 50,
      borderTopRightRadius: 50,
      //borderBottomLeftRadius: 50,
      //borderBottomRightRadius: 50,
      paddingHorizontal: 22,
      paddingVertical: 30,
      //borderBottomLeftRadius: 50,
      //borderBottomRightRadius: 50
  },

  inputContainer: {
      width: "100%",
      backgroundColor: Colors.white,
      paddingHorizontal: Sizes.padding,
      paddingVertical: Sizes.padding2,
      borderRadius: 50,
      borderWidth: .7,
      marginVertical: 5,
      flexDirection: "row",
      color: Colors.greyForText,
      borderColor: "white",
      shadowColor: "#000",
      shadowOffset: {
          width: 0,
          height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      flex: 1,
      fontFamily: "regular",
      paddingLeft: 20
  },
  titlu:{
    ...Fonts.screenTitle,
    color: Colors.white, fontSize: Sizes.buttonText
},
  mainTitle: {
      ...Fonts.pageTitles,
      color: Colors.black
  },
  inputText1: {
      ...Fonts.inputText,
      color: Colors.greyForText,
      marginTop: 44,
      marginBottom: 44,
      textAlign: "center"
  },
  btn:{
    paddingHorizontal: Sizes.padding,
    paddingVertical: Sizes.padding2,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: Colors.babyOrange,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.black,
    marginVertical: 12
    },

  

})

export default PlataCard;
