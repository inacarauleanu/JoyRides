import React, { useState } from 'react';
import { View, Button, Alert, Text } from 'react-native';
import { StripeProvider, CardField, useStrip, useConfirmPayment } from '@stripe/stripe-react-native';

const PlataCard = () => {
  //const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState();
  const { confirmPayment, loading } = useConfirmPayment();

  const handlePayment = async () => {
    const response = await fetch(`http://192.168.100.20:3000/payments/intents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currency: 'usd',
        amount:1234,
        payment_method_type: ["Card"] //by default
      }),
    });
    const {clientSecret} = await response.json();
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
      // Confirm the payment with the card details
      const {paymentIntent, error} = await confirmPayment(clientSecret, {
        paymentMethodType:'Card',
        paymentMethodData: {
                     cardDetails
        },
        
      });
      if (error) {
        console.log('Payment confirmation error', error);
      } else if (paymentIntent) {
        console.log('Success from promise', paymentIntent);
      }
    };



  return (
    <StripeProvider
    publishableKey="pk_test_51OpvfCKcaXlZmQKjHf3lm34rDl7qShBV66QCIQ40dWW2Xik0ad3OFg2kpdkbEZ2t0q0IYprvkDALp4KmeKh3myhl00D38yCiu2"
    >
  
    <View>
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
      <Button title="Pay Now" onPress={handlePayPress} disabled={loading} />
    </View>
    </StripeProvider>
  );
};

export default PlataCard;
