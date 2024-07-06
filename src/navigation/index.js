import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native"; // Import AsyncStorage
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import ConfirmEmailScreen from "../screens/ConfirmEmailScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import NewPasswordScreen from "../screens/NewPasswordScreen";
import HomeScreen from "../screens/HomeScreen";
import PostScreen from "../screens/PostScreen";
import ItemDetails from "../screens/ItemDetails";
import Settings from "../screens/SettingsScreen";
import History from "../screens/HistoryScreen";
import Likes from "../screens/LikesScreen";
import Reports from "../screens/ReportsScreen";
import Assists from "../screens/AssistsScreen";
import AssistsHistory from "../screens/AssistsHistoryScreen";
import PostAssists from "../screens/PostAssistsScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
const Stack = createNativeStackNavigator();

const Navigation = () => {
  const [user, setUser] = useState(false); // Initialize state to null

  const checkUser = async () => {
    try {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in
          setUser(true); // Set state to true
          AsyncStorage.setItem("userSignedIn", "true"); // Save value to AsyncStorage
        } else {
          // User is signed out
          setUser(false); // Set state to false
          AsyncStorage.setItem("userSignedIn", "false"); // Save value to AsyncStorage
        }
      });
    } catch (e) {
      setUser(false); // Set state to false on error
      AsyncStorage.setItem("userSignedIn", "false"); // Save value to AsyncStorage
    }
  };

  useEffect(() => {
    const getUserSignedIn = async () => {
      const value = await AsyncStorage.getItem("userSignedIn"); // Retrieve value from AsyncStorage
      setUser(value === "true"); // Set state based on retrieved value
    };

    getUserSignedIn();
  }, []);

  useEffect(() => {
    const listener = (data) => {
      if (data.payload.event === "signIn" || data.payload.event === "signOut") {
        checkUser();
      }
    };

    // Hub.listen('auth', listener);
    // return () => Hub.remove('auth', listener);
  }, []);

  if (user === null) {
    // Show loading indicator if user state is null
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  } else if (user) {
    // Show home screen if user is signed in
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } else {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen
            name="ConfirmEmailScreen"
            component={ConfirmEmailScreen}
          />
          <Stack.Screen
            name="ForgotPasswordScreen"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="PostScreen" component={PostScreen} />
          <Stack.Screen name="ItemDetails" component={ItemDetails} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="History" component={History} />
          <Stack.Screen name="Likes" component={Likes} />
          <Stack.Screen name="Reports" component={Reports} />
          <Stack.Screen name="Assists" component={Assists} />
          <Stack.Screen name="PostAssists" component={PostAssists} />
          <Stack.Screen name="AssistsHistory" component={AssistsHistory} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
};

export default Navigation;
