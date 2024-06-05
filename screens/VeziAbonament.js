import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'react-native-elements';

const VeziAbonament = ({ route }) => {
  const nume = route.params.nume;
  const valabilitate = route.params.valabilitate;
  const imageUrl = route.params.imageUrl;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalii Abonament</Text>
      <Text style={styles.name}>{nume}</Text>
      <Text>{`Valabilitate: ${valabilitate}`}</Text>
      <Image source={{ uri: imageUrl }} style={{ width: 200, height: 200 }} />
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
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default VeziAbonament;
