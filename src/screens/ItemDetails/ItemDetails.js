import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card } from "react-native-elements";
import { auth, db } from "../../../firebase";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { MaterialIcons } from "@expo/vector-icons";

const ItemDetails = ({ route }) => {
  const navigation = useNavigation();
  const { Name, Description, Uri, Uid } = route.params;
  const [ingredients, setIngredients] = useState([]);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.saved && userData.saved.includes(Uid)) {
            setLiked(true); // Set liked to true if Uid is in saved list
          }
        } else {
          console.log("User document not found");
        }

        const itemDoc = await getDoc(doc(db, "items", Uid));
        if (itemDoc.exists()) {
          const itemData = itemDoc.data();
          if (itemData.hasOwnProperty("ingredients")) {
            setIngredients(itemData.ingredients);
          }
        } else {
          console.log("Item not found in database");
        }
      } catch (error) {
        console.error("Error fetching item details:", error);
      }
    };

    fetchItemDetails();

    return () => {
      // Cleanup code (if any)
    };
  }, [Uid]);

  const handleLike = async () => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      if (liked) {
        await updateDoc(userRef, {
          saved: arrayRemove(Uid),
        });
        setLiked(false);
        console.log("Item removed from saved successfully!");
      } else {
        await updateDoc(userRef, {
          saved: arrayUnion(Uid),
        });
        setLiked(true);
        console.log("Item saved successfully!");
      }
    } catch (error) {
      console.error("Error saving/removing item:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.appButtonContainer}>{Name}</Text>
      <View style={styles.gallery}>
        <Card containerStyle={styles.cardContainer}>
          <Card.Image source={{ uri: Uri }} style={styles.image} />
          <Text style={styles.itemName}>{Name}</Text>
          <Text style={styles.cardDescription}>{Description}</Text>
          <TouchableOpacity
            onPress={handleLike}
            style={styles.likeButton}
            activeOpacity={0.6}
          >
            <MaterialIcons
              name={liked ? "favorite" : "favorite-border"}
              size={30}
              color={liked ? "red" : "black"}
            />
          </TouchableOpacity>
        </Card>
        <FlatList
          data={ingredients}
          renderItem={({ item }) => (
            <View style={styles.ingredientWrapper}>
              <Text style={styles.ingredientText}>
                {"\u2022"} {item.trim().replace(/\s+/g, " ")}
              </Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          style={styles.ingredientsContainer}
        />
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
  ingredientsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  ingredientWrapper: {
    marginBottom: 5, // Adjust as needed
  },
  ingredientText: {
    fontSize: 16,
    lineHeight: 20, // Adjust as needed
    color: "black",
  },
  button: {
    backgroundColor: "white",
    padding: 15,
    gap: 15,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
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
    marginVertical: 5,
    width: "100%",
    position: "absolute",
    bottom: 0,
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
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start", // Align the gallery at the top
    backgroundColor: "white",
  },
  cardContainer: {
    width: "90%",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  itemName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  cardDescription: {
    fontSize: 16,
    marginTop: 10,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "50%",
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: "#cfc5ae",
    padding: 15,
    borderRadius: 8,
    elevation: 5,
    shadowColor: "black",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 0,
    },
  },
  additionalButton: {
    backgroundColor: "white",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 60,
    borderRadius: 8,
    width: "40%",
    height: 40,
    elevation: 5,
    shadowColor: "black",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    gallery: {
      flex: 1,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start", // Align the gallery at the top
      backgroundColor: "white",
    },
    likeButton: {
      position: "absolute",
      bottom: 10,
      right: 10,
      padding: 10,
    },
  },
});

export default ItemDetails;
