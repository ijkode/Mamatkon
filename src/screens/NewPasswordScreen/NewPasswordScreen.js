import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import React, { useState } from "react";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import SocialSignInButtons from "../../components/SocialSignInButtons";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";

const NewPasswordScreen = () => {
  const { control, handleSubmit } = useForm();
  const navigation = useNavigation();
  const onSubmitPressed = async (data) => {
    try {
      await Auth.forgotPasswordSubmit(data.username, data.code, data.password);
      navigation.navigate("SignIn");
    } catch (e) {
      Alert.alert("אופס", e.message);
    }
  };
  const onSignInPressed = () => {
    navigation.navigate("SignIn");
  };
  return (
    <ScrollView showVerticalScrollIndicator={false}>
      <View style={styles.root}>
        <Text style={styles.appButtonContainer}>איפוס סיסמא</Text>
        <View style={styles.inputContainer}>
          <CustomInput
            name="username"
            placeholder="שם משתמש"
            control={control}
            rules={{ required: "שם משתמש נדרש" }}
          />
          <CustomInput
            name="code"
            placeholder="קוד"
            control={control}
            rules={{ required: "קוד נדרש" }}
          />
          <CustomInput
            name="password"
            control={control}
            placeholder="סיסמא חדשה"
            rules={{
              required: "סיסמא נדרשת",
              minLength: {
                value: 8,
                message: "סיסמא חייבת להכיל 8 תווים",
              },
            }}
          />
        </View>
        <CustomButton text="Submit" onPress={handleSubmit(onSubmitPressed)} />
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
  text: {
    color: "gray",
    marginVertical: 10,
  },
  link: {
    color: "#FDB075",
  },
  inputContainer: {
    alignItems: "center", // Center the items horizontally
    marginBottom: 10, // Add some space between inputs
  },
});

export default NewPasswordScreen;
