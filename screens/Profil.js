import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { auth } from '../firebase-config';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import { updateEmail, updatePassword, getAuth, signOut } from 'firebase/auth';
import { Colors, Sizes, Fonts } from '../constants/styles.js';
import { Button } from 'react-native-elements';

const Profil = () => {
  
  const { user } = useAuthentication();
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      await updateEmail(auth.currentUser, newEmail);
      Alert.alert('Success', 'Email address updated successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim()) {
      Alert.alert('Error', 'Please enter both current and new password');
      return;
    }

    try {
      await updatePassword(auth.currentUser, newPassword);
      Alert.alert('Success', 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil Utilizator</Text>
      <Text style={styles.label}>Email curent: {user?.email}</Text>
      <TextInput
        style={styles.input}
        placeholder="Introdu noul email"
        value={newEmail}
        onChangeText={setNewEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button
        buttonStyle={styles.btn}
        title="Schimbă Email"
        titleStyle={styles.titlu}
        onPress={handleChangeEmail}
      />
      <Text style={styles.label}>Schimbă Parola:</Text>
      <TextInput
        style={styles.input}
        placeholder="Parola curentă"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Parolă nouă"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <Button
        buttonStyle={styles.btn}
        title="Schimbă Parola"
        titleStyle={styles.titlu}
        onPress={handleChangePassword}
      />
      <Button
        buttonStyle={styles.btn1}
        title="Deconectare"
        titleStyle={styles.titlu}
        onPress={() => signOut(auth)}
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
    alignItems: 'center',
  },
  btn: {
    paddingHorizontal: Sizes.padding,
    paddingVertical: Sizes.padding2,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: Colors.babyOrange,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.babyOrange,
    marginVertical: 12,
  },
  btn1: {
    paddingHorizontal: Sizes.padding,
    paddingVertical: Sizes.padding2,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.black,
    marginVertical: 12,
  },
  title: {
    ...Fonts.screenTitle,
    marginBottom: 10,
  },
  label: {
    marginTop: 20,
    ...Fonts.inputText,
    marginBottom: 10,
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 50,
    backgroundColor: Colors.white,
    elevation: 3,
  },
  titlu: {
    ...Fonts.screenTitle,
    color: Colors.white,
    fontSize: Sizes.buttonText,
  },
});

export default Profil;
