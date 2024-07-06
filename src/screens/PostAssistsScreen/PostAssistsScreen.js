import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { auth, db } from "../../../firebase";
import { doc, updateDoc, arrayUnion, setDoc, getDoc } from "firebase/firestore";
import CustomButton from "../../components/CustomButton";

const PostAssistsScreen = () => {
  const navigation = useNavigation();
  const { handleSubmit, control } = useForm();
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  const onSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error("User not logged in.");
      return;
    }

    try {
      const timeElapsed = Date.now();
      const today = new Date(timeElapsed);
      const name =
        title + "." + user.uid + "." + today.toISOString().slice(0, 16);
      const imageRef = doc(db, `users/${auth.currentUser.uid}`);
      await updateDoc(imageRef, { assists: arrayUnion(name) }, { merge: true });
      await setDoc(doc(db, "assists", name), {
        title,
        description,
        phone,
        createdBy: user.uid,
        createdAt: new Date(),
        show: 0,
      });
      // Optionally, you can navigate back to home or perform any other action upon successful submission
      navigation.navigate("Home");
    } catch (error) {
      console.error("Error adding assist:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.appButtonContainer}>פרסם הצעה חדשה</Text>

        {/* Title Input */}
        <TextInput
          style={styles.input}
          placeholder="כותרת"
          value={title}
          onChangeText={(text) => setTitle(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="טלפון"
          value={phone}
          onChangeText={(text) => setPhone(text)}
        />
        {/* Description Input */}
        <TextInput
          style={[styles.input, { height: 120 }]}
          placeholder="תיאור"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={(text) => setDescription(text)}
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.buttonStyle}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>שלח</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.backButtonStyle}
          onPress={() => navigation.navigate("Assists")}
        >
          <Text style={styles.backTextStyle}>חזרה להצעות</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  appButtonContainer: {
    backgroundColor: "#edb1bc",
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
    borderRadius: 50,
    overflow: "hidden",
  },
  backButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  backButtonStyle: {
    alignItems: "center",
    color: "gray",
    padding: 5,
    marginVertical: 10,
    width: 250,
  },
  backTextStyle: {
    padding: 10,
    color: "gray",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  buttonStyle: {
    alignSelf: "center", // Align the button itself to the center
    backgroundColor: "#d27989",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default PostAssistsScreen;
