import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { auth, db } from "../../../firebase";
import { doc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

const PostAssistsScreen = () => {
  const navigation = useNavigation();
  const { handleSubmit, control } = useForm();
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Oops", "הרשאות נדרשות להעלאת תמונה");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    } else {
      Alert.alert("Oops", "לא נבחרה תמונה");
    }
  };

  const uploadImage = async (uri) => {
    if (!uri) return null;

    const response = await fetch(uri);
    const blob = await response.blob();
    const storage = getStorage();
    const storageRef = ref(
      storage,
      `images/${auth.currentUser.uid}/${Date.now()}`
    );

    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Progress function
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          // Error function
          console.error("Upload failed:", error);
          reject(error);
        },
        () => {
          // Complete function
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("File available at", downloadURL);
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const onSubmit = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error("User not logged in.");
      return;
    }

    let uploadedImageUrl = null;
    if (image) {
      uploadedImageUrl = await uploadImage(image);
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
        imageUrl: uploadedImageUrl,
      });
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
        <TextInput
          style={[styles.input, { height: 120 }]}
          placeholder="תיאור"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={(text) => setDescription(text)}
        />
        {image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
          </View>
        )}
        <TouchableOpacity style={styles.buttonStyle} onPress={pickImage}>
          <Text style={styles.buttonText}>בחר תמונה</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonStyle, !image && styles.disabledButton]}
          onPress={handleSubmit(onSubmit)}
          disabled={!image}
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
    alignSelf: "center",
    backgroundColor: "#d27989",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  imageContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  image: {
    width: 200,
    height: 200,
  },
});

export default PostAssistsScreen;
