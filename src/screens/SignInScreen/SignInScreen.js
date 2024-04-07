import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import React, { useState } from "react";
import Logo from "../../../assets/images/Logo2.png";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import SocialSignInButtons from "../../components/SocialSignInButtons";
import { useNavigation } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import {
  doc,
  getDocs,
  collection,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../../firebase";

const SignInScreen = () => {
  const { height } = useWindowDimensions();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSignInPressed = async (data) => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const user = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      // navigation.navigate('Home');
      checkVerification();
    } catch (e) {
      Alert.alert("Oops", e.message);
    }
    setLoading(false);
    // navigation.navigate('Home');
    // navigation.navigate('Home');
  };
  const checkVerification = async () => {
    if (auth.currentUser.emailVerified === false) {
      Alert.alert("אנא אמת את כתובת המייל שלך");
    } else {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.ban === 1) {
          Alert.alert("You are banned. Please contact support.");
        } else {
          navigation.navigate("Home");
        }
      } else {
        Alert.alert("User document does not exist");
      }
    }
  };
  const onForgotPasswordPressed = () => {
    navigation.navigate("ForgotPasswordScreen");
  };
  const onSignUpPressed = () => {
    navigation.navigate("SignUp");
  };

  return (
    <ScrollView showVerticalScrollIndicator={false}>
      <View style={styles.root}>
        <Image
          source={Logo}
          style={[styles.logo, { height: height * 0.3 }]}
          resizeMode="contain"
        />
        <CustomInput
          name="email"
          placeholder="אימייל"
          control={control}
          rules={{ required: "נדרש להזין אימייל" }}
        />
        <CustomInput
          name="password"
          placeholder="סיסמא"
          secureTextEntry
          control={control}
          rules={{
            required: "Password is requierd",
            minLength: {
              value: 8,
              message: "סיסמא חייבת להכיל 8 תווים",
            },
          }}
        />

        <CustomButton
          text={loading ? "טוען ..." : "הכנס/י"}
          onPress={handleSubmit(onSignInPressed)}
        />
        <CustomButton
          text="שכחתי סיסמא"
          onPress={onForgotPasswordPressed}
          type="TERTIARY"
        />
        {/* <SocialSignInButtons /> */}
        <View style={styles.bottomContainer}>
          <CustomButton
            text="עדיין לא נרשמת? להרשמה לחץ כאן"
            onPress={onSignUpPressed}
            type="TERTIARY"
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    justifyContent: "flex-end",
  },
  logo: {
    width: "60%",
    maxWidth: 300,
    maxHeight: 200,
  },
  bottomContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
});

export default SignInScreen;
