import { Dimensions } from "react-native";
const {width, height} = Dimensions.get("window");

 //colors
 export const Colors ={
    white: "#ffffff", //white
    babyOrange: "#FFC66C", //orange
    black: "#000000", //black
    myLightGrey: "#D9D9D9",  //grey
    myRed: "#E53535",
    greyForText: "#1E1E1E"

 };

 export const Sizes = {
    mainTitle: 36,
    pageTitles: 20,
    buttonText: 21,
    otherText: 15,
    radius: 50,
    padding: 8,
    padding2: 16,

    width,
    height

 }

 export const Fonts = {
    mainTitle: {fontFamily: "bold", fontSize: Sizes.mainTitle, lineHeight: 55},

    pageTitles: {fontFamily: "regular", fontSize: Sizes.pageTitles, lineHeight: 136},
    inputText: {fontFamily: "medium", fontSize: Sizes.otherText, lineHeight: 36},


 }

const appTheme = {Colors, Sizes, Fonts}

export default appTheme