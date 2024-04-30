import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import React, { useState } from "react";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import SocialSignInButtons from "../../components/SocialSignInButtons";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../firebase";
const ForgotPasswordScreen = () => {
  const { control, handleSubmit } = useForm();
  const navigation = useNavigation();
  const onSendPressed = async (data) => {
    sendPasswordResetEmail(auth, data.email)
      .then(() => {
        Alert.alert("Reset Password Email Sent!");
      })
      .then(() => {
        navigation.navigate("SignIn");
      })
      .catch((error) => {
        Alert.alert(error.message);
        // ..
      });
  };
  const onSignInPressed = () => {
    navigation.navigate("SignIn");
  };
  return (
    <ScrollView showVerticalScrollIndicator={false}>
      <View>
        <Text style={styles.appButtonContainer}>אפס סיסמא</Text>
        <View style={styles.inputContainer}>
          <CustomInput
            name="email"
            control={control}
            placeholder="אימייל"
            rules={{ required: "Email is required" }}
          />
        </View>
        <CustomButton text="שלח" onPress={handleSubmit(onSendPressed)} />
        <CustomButton
          text="חזרה להתחברות"
          onPress={onSignInPressed}
          type="TERTIARY"
        />
      </View>
    </ScrollView>
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
    borderRadius: 50, // Makes the container round
    overflow: "hidden", // Ensures the content stays within the rounded shape
  },
  inputContainer: {
    alignItems: "center", // Center the items horizontally
    marginBottom: 10, // Add some space between inputs
  },
});

export default ForgotPasswordScreen;
