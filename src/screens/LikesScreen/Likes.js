import React, { useState, useEffect } from "react";
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
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { storage } from "../../../firebase";
import { auth, db } from "../../../firebase";
import { Card } from "react-native-elements";
import { Entypo } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import {
  doc,
  updateDoc,
  arrayUnion,
  setDoc,
  getDoc,
  arrayRemove,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getMetadata,
  listAll,
} from "firebase/storage";
import { Rating } from "react-native-ratings";

const Likes = () => {
  const navigation = useNavigation();
  const [items, setItems] = useState("");
  const [gallery, setGallery] = useState([]);
  const [names, setNames] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const isFocused = useIsFocused();
  const [showReportInput, setShowReportInput] = useState(false);
  const [reportInput, setReportInput] = useState("");
  const [selectedItemUid, setSelectedItemUid] = useState("");
  const [userName, setUserName] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [sellerRating, setSellerRating] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const getData = async () => {
      const docRef = doc(db, `users/${auth.currentUser.uid}`);
      const docSnap = await getDoc(docRef);
      setItems(docSnap.data().saved);
      setUserName(docSnap.data().full_name);
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
      const filteredNames = namesWithMetadata.filter((name) =>
        items.includes(name.item_uid)
      );
      const filteredUrls = urls.filter((url, index) =>
        items.includes(namesWithMetadata[index].item_uid)
      );

      setNames(filteredNames);
      setGallery(filteredUrls);
    };

    getGalleryImages().catch((error) => {
      console.error(error);
      Alert.alert("שגיאה", "שגיאה בטעינת התמונות");
    });
  }, [items]);

  const updateSearch = (search) => {
    setSearch(search);
  };

  // Filter gallery items based on the search query
  const filteredGallery = gallery.filter((image, index) =>
    names[index].item_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRatingSubmit = async () => {
    const docRef = doc(db, `items/${selectedItemUid}`);
    const docSnap = await getDoc(docRef);
    const ratingArray = docSnap.data().rating;
    ratingArray[sellerRating - 1] += 1;

    await updateDoc(docRef, {
      rating: ratingArray,
    });

    setShowRatingModal(false);
  };

  const handleReport = (itemUid) => {
    Alert.alert("אימות", "האם אתה בטוח שאתה מעוניין לדווח על המתכון?", [
      { text: "לא", style: "cancel" },
      {
        text: "כן",
        onPress: () => {
          setSelectedItemUid(itemUid);
          setShowReportInput(true);
        },
      },
    ]);
  };

  const handleRating = (itemUid) => {
    setSelectedItemUid(itemUid);
    setShowRatingModal(true);
  };

  const handleReportUser = async () => {
    const startIndex = selectedItemUid.indexOf(".") + 1; // Get the index after the first dot
    const endIndex = selectedItemUid.indexOf(".", startIndex); // Get the index of the second dot
    const substring = selectedItemUid.substring(startIndex, endIndex);
    const docRef = doc(db, `reports/${substring}`);
    await setDoc(
      docRef,
      {
        reports: arrayUnion(userName + ": " + reportInput),
        user_uid: substring,
      },
      { merge: true }
    );
    setReportInput("");
    setShowReportInput(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.appButtonContainer}>מתכונים שאהבתי</Text>

      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="חיפוש לפי שם מתכון"
        onChangeText={updateSearch}
        value={search}
      />

      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.gallery}>
          {/* Render filtered gallery */}
          {filteredGallery.map((image, index) => (
            <Card key={index} containerStyle={styles.card}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ItemDetails", {
                    Name: names[index].item_name,
                    Description: names[index].item_description,
                    Uri: image,
                    Uid: names[index].item_uid,
                    Email: names[index].email,
                    Phone: names[index].phone_number,
                  })
                }
              >
                <Image source={{ uri: image }} style={styles.image} />
              </TouchableOpacity>
              <Text style={styles.cardTitle}>{names[index].item_name}</Text>
              <View style={styles.cardContent}>
                <Text style={styles.itemDescription}>
                  {names[index].item_description}
                </Text>
                <TouchableOpacity
                  style={styles.reportButton}
                  onPress={() => handleReport(names[index].item_uid)}
                >
                  <Entypo name="flag" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => handleRating(names[index].item_uid)}
                >
                  <MaterialIcons name="star-rate" size={24} color="yellow" />
                </TouchableOpacity>
              </View>
            </Card>
          ))}
          {/* Display message when no items to show */}
          {filteredGallery.length === 0 && (
            <Text style={styles.noItemsText}>אין פריטים להצגה</Text>
          )}
        </View>
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

      {/* Report Modal */}
      <Modal visible={showReportInput} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>דווח</Text>
            <TextInput
              style={styles.reportInput}
              placeholder="הזן את התלונה"
              onChangeText={setReportInput}
              value={reportInput}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowReportInput(false)}
              >
                <Text style={styles.modalButtonText}>בטל</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleReportUser}
              >
                <Text style={styles.modalButtonText}>בצע</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Rating Modal */}
      <Modal visible={showRatingModal} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>דרג</Text>
            <Rating
              showRating
              onFinishRating={(rating) => setSellerRating(rating)}
              style={{ paddingVertical: 10 }}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleRatingSubmit}
            >
              <Text style={styles.modalButtonText}>שמור</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowRatingModal(false)}
            >
              <Text style={styles.modalButtonText}>בטל</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    marginBottom: 10,
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
  imageStyle: {
    width: 50,
    height: 50,
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
    height: 100,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  reportInput: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  modalButton: {
    padding: 10,
    marginHorizontal: 40,
    borderRadius: 5,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  reportButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
});

export default Likes;
