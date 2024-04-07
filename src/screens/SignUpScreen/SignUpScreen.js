import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { useForm } from "react-hook-form";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../../firebase";
import { doc, setDoc } from "firebase/firestore";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import SocialSignInButtons from "../../components/SocialSignInButtons";
import { useNavigation } from "@react-navigation/native";

const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const PHONE_NUMBER_REGEX = /^05[0-9]-\d{7}$/;

const SignUpScreen = () => {
  const { control, handleSubmit, watch } = useForm();
  const pwd = watch("password");
  const navigation = useNavigation();

  const onRegisterPressed = async (data) => {
    const { username, password, email, name } = data;
    try {
      const user = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      ).then(async () => {
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          email: data.email,
          phone_number: data.phone,
          full_name: data.name,
        });
      });
      navigation.navigate("ConfirmEmailScreen");
    } catch (e) {
      Alert.alert("Oops", e.message);
    }
  };

  const onSignInPressed = () => {
    navigation.navigate("SignIn");
  };

  const onTermsOfUsePressed = () => {
    const url = "to do";
    Linking.openURL(url);
  };

  const onPrivacyPolicyPressed = () => {
    const url = "to do";
    Linking.openURL(url);
  };

  return (
    <ScrollView showVerticalScrollIndicator={false}>
      <Text style={styles.appButtonContainer}>Create a user</Text>
      <CustomInput
        name="email"
        placeholder="אימייל"
        control={control}
        rules={{
          pattern: {
            value: EMAIL_REGEX,
            message: "אימייל לא חוקי",
          },
        }}
        style={styles.input}
      />

      <CustomInput
        name="name"
        placeholder="שם מלא"
        control={control}
        rules={{
          required: "Full Name is required",
          minLength: {
            value: 5,
            message: "שם מלא חייב להכיל שם פרטי ושם משפחה",
          },
        }}
        style={styles.input}
      />

      <CustomInput
        name="phone"
        placeholder="מספר טלפון"
        control={control}
        rules={{
          required: "חובה להזין מספר טלפון",
          pattern: {
            value: PHONE_NUMBER_REGEX,
            message: "יש להזין מספר טלפון, xxx-xxxxxxx",
          },
        }}
        style={styles.input}
      />

      <CustomInput
        name="password"
        placeholder="סיסמא"
        control={control}
        secureTextEntry
        rules={{
          required: "סיסמא נדרשת",
          minLength: {
            value: 8,
            message:
              "הסיסמא חייבת להכיל לפחות אות גדולה אחת, אות קטנה ואורך של 8 תווים",
          },
          pattern: {
            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
            message:
              "הסיסמא חייבת להכיל לפחות אות גדולה אחת, אות קטנה ואורך של 8 תווים",
          },
        }}
        style={styles.input}
      />

      <CustomInput
        name="password-repeat"
        placeholder="חזור על הסיסמא שנית"
        control={control}
        secureTextEntry
        rules={{
          validate: (value) => value === pwd || "סיסמא לא תואמת",
        }}
        style={styles.input}
      />
      <CustomButton text="Register" onPress={handleSubmit(onRegisterPressed)} />
      <Text style={styles.text}>
        בהרשמה הנך מסכים ל{" "}
        <Text style={styles.link} onPress={onTermsOfUsePressed}>
          מדיניות שימוש
        </Text>{" "}
        ול
        <Text style={styles.link} onPress={onPrivacyPolicyPressed}>
          {" "}
          מדיניות הפרטיות
        </Text>
      </Text>
      <CustomButton
        text="כבר נרשמת? לחץ להתחברות"
        onPress={onSignInPressed}
        type="TERTIARY"
      />
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
    color: "#EDB1BC",
    margin: 10,
  },
  text: {
    color: "gray",
    marginVertical: 10,
    textAlign: "center",
  },
  link: {
    color: "#FDB075",
  },
  appButtonContainer: {
    backgroundColor: "#EDB1BC",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    textAlign: "center",
  },
  input: {
    width: "80%", // Adjust the width as needed
    alignSelf: "center",
    marginBottom: 10, // Add some space between inputs
  },
});

export default SignUpScreen;
