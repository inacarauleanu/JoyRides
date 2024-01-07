import * as SplashScreen from "expo-splash-screen";
import {useFonts} from "expo-font";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {NavigationContainer} from "@react-navigation/native";
import { useCallback } from "react";
import { auth } from "./firebase-config.js";
//screens
import Login from './screens/Login.js';
import Register from "./screens/Register.js";
import ForgotPassword from "./screens/ForgotPassword.js";
import Welcome from "./screens/Welcome.js";
import LandingPage from "./screens/LandingPage.js";
import RootNavigation from "./navigation/index.js";
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {

  const [fontsLoaded] = useFonts({
    regular: require("./assets/fonts/Montserrat-Regular.ttf"),
    bold: require("./assets/fonts/Montserrat-Bold.ttf"),
    medium: require("./assets/fonts/Montserrat-Medium.ttf"),
    thin: require("./assets/fonts/Montserrat-Thin.ttf")
  });

  const onLayoutRootView = useCallback(async ()=>{
    if(fontsLoaded){
      await SplashScreen.hideAsync()
    }
  },[fontsLoaded])

  if(!fontsLoaded){
    return null
  }
  
  return (
    <SafeAreaProvider onLayout = {onLayoutRootView}>
     <RootNavigation/>
    </SafeAreaProvider>
  );
}

