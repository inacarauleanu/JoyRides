// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth} from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3LMjJnEN2iUejpL6JUTf-16Dbse6zbD8",
  authDomain: "joyride-de26f.firebaseapp.com",
  projectId: "joyride-de26f",
  storageBucket: "joyride-de26f.appspot.com",
  messagingSenderId: "634976697024",
  appId: "1:634976697024:web:d3502a789ab6fd80588b25"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth };