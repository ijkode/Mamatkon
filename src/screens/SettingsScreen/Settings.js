import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  Image,
  TextInput,
  ScrollView,
  Linking,
} from "react-native";
import { getAuth, signOut } from "firebase/auth";
import React, { useState, useEffect } from "react";
import { decode } from "base-64";
import CustomButton from "../../components/CustomButton";
import { useNavigation } from "@react-navigation/native";
import { storage } from "../../../firebase";
import { auth, db } from "../../../firebase";
import { doc, updateDoc, arrayUnion, setDoc, getDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import Logo from "../../../assets/images/Logo2.png";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  uploadString,
  uploadBytes,
  updateMetadata,
  connectStorageEmulator,
} from "firebase/storage";
import { useForm } from "react-hook-form";
import CustomInput from "../../components/CustomInput";
import { Feather } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
const Settings = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // Add isAdmin state
  const Email = "Mamatkonhelpcenter@gmail.com";
  const handleHistoryPress = () => {
    navigation.navigate("History");
  };

  const handleAssistsHistoryPress = () => {
    navigation.navigate("AssistsHistory");
  };

  const handleReportsPress = () => {
    navigation.navigate("Reports");
  };
  const signOutUser = async () => {
    try {
      await signOut(auth).then(() => {
        navigation.navigate("SignIn");
      });
    } catch (error) {
      console.warn(error.message);
    }
  };
  useEffect(() => {
    const getData = async () => {
      const docRef = doc(db, `users/${auth.currentUser.uid}`);
      const docSnap = await getDoc(docRef);
      setName(docSnap.data().full_name);
      setIsAdmin(docSnap.data().admin === 1); // Set isAdmin based on admin parameter
    };
    getData();
  }, []);
  const handleImprove = () => {
    Linking.openURL(`mailto:${Email}`);
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Text style={styles.appButtonContainer}>הגדרות</Text>
        <Text style={styles.appButtonContainer1}>שלום {name}</Text>
        <View style={{ alignItems: "center", width: "100%" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={handleHistoryPress}
            >
              <FontAwesome5 name="history" size={24} color="black" />
              <Text>הסטורית העלאות</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleAssistsHistoryPress}
            >
              <MaterialIcons name="location-history" size={24} color="black" />
              <Text>הסטורית הצעות</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            {isAdmin ? (
              <TouchableOpacity
                style={styles.button}
                onPress={handleReportsPress}
              >
                <FontAwesome name="file-text-o" size={24} color="black" />
                <Text>ניהול דוחות</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("ForgotPasswordScreen")}
            >
              <MaterialCommunityIcons
                name="lock-reset"
                size={24}
                color="black"
              />
              <Text>איפוס סיסמא</Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <TouchableOpacity style={styles.button} onPress={handleImprove}>
              <Feather name="target" size={24} color="black" />
              <Text>עזור לנו להשתפר!</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={signOutUser}>
              <AntDesign name="logout" size={24} color="black" />
              <Text>התנתק</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={{ alignItems: "center", marginTop: 10 }}>
        <Image source={Logo} style={styles.smallLogo} resizeMode="contain" />
      </View>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.backButtonStyle}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.backTextStyle}>חזרה לדף הבית</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  backButtonContainer: {
    alignItems: "center", // Center the button horizontally
    justifyContent: "center", // Center the button vertically
    marginTop: 20, // Add margin to separate the button from the rest of the content
  },
  backButtonStyle: {
    alignItems: "center",
    color: "gray",
    padding: 5,
    width: 250,
  },
  smallLogo: {
    width: 500, // Adjust the width as needed
    height: 200, // Adjust the height as needed
    marginBottom: 10, // Add margin bottom to separate from the buttons
  },
  button: {
    backgroundColor: "white",
    padding: 15,
    gap: 2,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 20,
    borderRadius: 20,
    width: "45%",
    height: 100,
    elevation: 5,
    shadowColor: "black",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
  titleText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 20,
  },
  textStyle: {
    padding: 10,
    color: "white",
    textAlign: "center",
  },
  backTextStyle: {
    padding: 10,
    color: "gray",
    textAlign: "center",
  },
  textStyleDisabled: {
    padding: 10,
    color: "black",
    textAlign: "center",
  },
  appButtonContainer: {
    backgroundColor: "#edb1bc",
    paddingHorizontal: 20,
    paddingTop: 20, // Decreased the top padding to lower the height
    paddingBottom: 10, // Decreased the bottom padding to lower the height
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center the title horizontally
    borderBottomWidth: 1,
    borderBottomColor: "#B2B2B2",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 5,
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    textAlign: "center", // Center the title vertically
    borderRadius: 50, // Makes the container round
    overflow: "hidden", // Ensures the content stays within the rounded shape
  },
  appButtonContainer1: {
    // elevation: 8,
    marginTop: "2%",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 2,
    width: "100%",
    // borderRadius: 100,
    // borderBottomRightRadius: 6,
    fontSize: 18,
    color: "black",
    fontWeight: "bold",
    alignSelf: "center",
    textAlign: "center",
  },
  buttonStyle: {
    alignItems: "center",
    backgroundColor: "#FF597B",
    padding: 5,
    marginVertical: 10,
    width: 250,
    borderRadius: 8,
  },
  backButtonStyle: {
    alignItems: "center",
    color: "gray",
    padding: 5,
    marginVertical: 10,
    width: 250,
    // borderRadius: 8,
  },
  imageStyle: {
    width: 200,
    height: 200,
    margin: 5,
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: "#B2B2B2",
    color: "black",
    borderRadius: 8,
  },
  gallery: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 15,
  },
  image: {
    width: 300,
    height: 300,
    margin: 5,
  },
});

export default Settings;
