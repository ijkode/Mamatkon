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
} from "react-native";
import React, { useState, useEffect } from "react";
import { decode } from "base-64";
import CustomButton from "../../components/CustomButton";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { storage } from "../../../firebase";
import { auth, db } from "../../../firebase";
import { Card } from "react-native-elements";
import {
  doc,
  updateDoc,
  arrayUnion,
  setDoc,
  getDoc,
  arrayRemove,
} from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { EvilIcons } from "@expo/vector-icons";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  uploadString,
  uploadBytes,
  updateMetadata,
  connectStorageEmulator,
  listAll,
  getMetadata,
  deleteObject,
} from "firebase/storage";
import { useForm } from "react-hook-form";
import CustomInput from "../../components/CustomInput";
import { Feather } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

const History = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState("");
  const [gallery, setGallery] = useState([]);
  const [names, setNames] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    const getData = async () => {
      const docRef = doc(db, `users/${auth.currentUser.uid}`);
      const docSnap = await getDoc(docRef);
      setItems(docSnap.data().items);
    };

    getData();
  }, [isFocused]);

  useEffect(() => {
    const getGalleryImages = async () => {
      const storageRef = ref(storage, "/");
      const images = await listAll(storageRef);
      const urls = await Promise.all(
        images.items.map((imageRef) => getDownloadURL(imageRef))
      );
      const metadata = await Promise.all(
        images.items.map((imageRef) => getMetadata(imageRef))
      );
      const namesWithMetadata = await Promise.all(
        images.items.map(async (imageRef) => {
          const metadata = await getMetadata(imageRef);
          return metadata.customMetadata;
        })
      );
      setNames(namesWithMetadata);
      const filteredUrls = urls.filter((url, index) =>
        items.includes(namesWithMetadata[index].item_uid)
      );
      setGallery(filteredUrls);
    };

    getGalleryImages();
  }, [items]);

  const deleteItem = async (itemUid) => {
    Alert.alert(
      "אימות",
      "האם אתה בטוח שברצונך להעביר את המתכון לארכיון? מתכון זה ימחק לאלתר",
      [
        { text: "לא", style: "cancel" },
        { text: "כן", onPress: () => handleDeleteConfirm(itemUid) },
      ]
    );
  };

  const handleDeleteConfirm = async (itemUid) => {
    const itemRef = ref(storage, "/" + itemUid);

    try {
      // Move the file to the archive folder by updating metadata
      await updateMetadata(itemRef, {
        customMetadata: {
          archive: "true",
        },
      });

      Alert.alert("המתכון נמחק בהצלחה");

      // const userDocRef = doc(db, "users", auth.currentUser.uid);
      // await updateDoc(userDocRef, {
      //   items: arrayRemove(itemUid),
      // });
      setRefresh(!refresh);
    } catch (error) {
      // Handle error
      console.log(error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.appButtonContainer}>הסטוריית העלאות</Text>
      <ScrollView showVerticalScrollIndicator={false}>
        <View style={styles.gallery}>
          {gallery.map((image, index) => (
            <Card key={index} containerStyle={styles.card}>
              <Text style={styles.cardTitle}>{names[index].item_name}</Text>
              <Image source={{ uri: image }} style={styles.image} />
              <View style={styles.cardContent}>
                <Text style={styles.itemDescription}>
                  {names[index].item_description}
                </Text>
                <TouchableOpacity
                  onPress={() => deleteItem(names[index].item_uid)}
                >
                  <EvilIcons name="archive" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.backButtonStyle}
          onPress={() => navigation.navigate("Settings")}
        >
          <AntDesign name="arrowleft" size={24} color="gray" />
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
  button: {
    backgroundColor: "#62CDFF",
    padding: 15,
    gep: 15,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 30,
    borderRadius: 70,
    width: "40%",
    height: 60,
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
    backgroundColor: "#B2B2B2",
    borderColor: "white",
    marginTop: "2%",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 2,
    width: "100%",
    // borderRadius: 100,
    // borderBottomRightRadius: 6,
    fontSize: 12,
    color: "#fff",
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
  backButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: "10%",
    transform: [{ translateX: -25 }],
    zIndex: 999,
  },
  backButtonStyle: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    width: 50,
    height: 50,
    borderRadius: 25,
    elevation: 5,
    shadowColor: "black",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 0,
    },
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
    margin: 10,
  },
  itemDetails: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardContainer: {
    margin: 5,
    borderRadius: 10,
    shadowColor: "#171717",
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: "gray",
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 10,
  },
  headerContainer: {
    backgroundColor: "#FF597B",
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center", // Center the title vertically
  },
});

export default History;
