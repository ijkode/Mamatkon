import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase"; // Import Firebase db instance
import Icon from "react-native-vector-icons/FontAwesome"; // Assuming you use FontAwesome for icons

const AssistsScreen = () => {
  const navigation = useNavigation();
  const [assists, setAssists] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const assistRef = collection(db, "assists");
        const querySnapshot = await getDocs(
          query(collection(db, "assists"), where("show", "==", 0))
        );
        const fetchedAssists = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));
        setAssists(fetchedAssists);
      } catch (error) {
        console.log("שגיאה באחזור דוחות", error);
      }
    };

    fetchReports();
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
      timeZone: "Asia/Jerusalem", // Optional: Set the time zone if needed
      locale: "he-IL", // Specify Hebrew locale
    };
    return date.toLocaleDateString("he-IL", options);
  };

  const handlePhonePress = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.appButtonContainer}>הצעות</Text>
        {assists.map((assist) => (
          <View key={assist.id} style={styles.assistContainer}>
            <View style={styles.phoneIconContainer}>
              <TouchableOpacity
                style={styles.phoneIcon}
                onPress={() => handlePhonePress(assist.data.phone)}
              >
                <Icon name="phone" size={20} color="gray" />
              </TouchableOpacity>
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{assist.data.title}</Text>
              <Text style={styles.description}>{assist.data.description}</Text>
              <Text style={styles.date}>
                תאריך: {formatDate(assist.data.createdAt)}
              </Text>
            </View>
            {assist.data.imageUrl && (
              <Image
                source={{ uri: assist.data.imageUrl }}
                style={styles.assistImage}
              />
            )}
          </View>
        ))}
      </ScrollView>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buttonStyle}
          onPress={() => navigation.navigate("PostAssists")}
        >
          <Text style={styles.textStyle}>פרסם הצעה חדשה</Text>
        </TouchableOpacity>
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
  assistContainer: {
    padding: 20,
    margin: 10,
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
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
  phoneIconContainer: {
    width: 40, // Adjust as needed
  },
  phoneIcon: {
    marginRight: 10,
  },
  contentContainer: {
    flex: 1,
    marginRight: 10, // Add margin to create space for the image
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
    color: "#666",
  },
  phone: {
    fontSize: 14,
    color: "gray",
  },
  date: {
    fontSize: 12,
    color: "gray",
  },
  buttonStyle: {
    alignItems: "center",
    backgroundColor: "#edb1bc",
    padding: 10,
    marginVertical: 10,
    width: 250,
    borderRadius: 8,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
  },
  backTextStyle: {
    color: "gray",
    fontWeight: "bold",
  },
  assistImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
});

export default AssistsScreen;
