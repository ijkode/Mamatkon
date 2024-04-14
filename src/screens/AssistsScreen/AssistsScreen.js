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
  Modal,
} from "react-native";
import React, { useState } from "react";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import SocialSignInButtons from "../../components/SocialSignInButtons";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { useRoute } from "@react-navigation/native";
import { auth } from "../../../firebase";
const AssistsScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.appButtonContainer}>הצעות</Text>
        {/* Your other content here */}
      </ScrollView>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.backButtonStyle}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.backTextStyle}>חזרה לדף הבית</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#051C60",
    margin: 10,
  },
  text: {
    color: "gray",
    marginVertical: 10,
  },
  link: {
    color: "#FDB075",
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
  },
  backButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0, // Center horizontally
    alignItems: "center", // Center horizontally
    zIndex: 999,
  },
  backButtonStyle: {
    alignItems: "center",
    color: "gray",
    padding: 5,
    marginVertical: 10,
    width: 250, // Set a width to limit the button's width
    // borderRadius: 8, // You can remove this if you don't need borderRadius
  },
  backTextStyle: {
    padding: 10,
    color: "gray",
    textAlign: "center",
  },
});

export default AssistsScreen;
