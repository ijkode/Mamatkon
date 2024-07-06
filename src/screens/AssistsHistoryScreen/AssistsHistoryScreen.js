import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  getDocs,
  where,
  query,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../firebase"; // Import Firebase db instance
import { auth } from "../../../firebase"; // Import Firebase auth instance

const AssistsHistoryScreen = () => {
  const navigation = useNavigation();
  const [assists, setAssists] = useState([]);
  const currentUserUid = auth.currentUser.uid; // Get current user's UID

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const assistRef = collection(db, "assists");
        const q = query(assistRef, where("createdBy", "==", currentUserUid));
        const snapshot = await getDocs(q);
        const fetchedAssists = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));
        setAssists(fetchedAssists);
        console.log(fetchedAssists);
      } catch (error) {
        console.log("שגיאה באחזור דוחות", error);
      }
    };

    fetchReports();
  }, [currentUserUid]);

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

  const handleShowButtonClick = async (assistId, currentShowValue) => {
    try {
      const assistDocRef = doc(db, "assists", assistId);
      const newShowValue = currentShowValue === 1 ? 0 : 1; // Toggle show value
      await updateDoc(assistDocRef, {
        show: newShowValue,
      });
      // Refresh the assists list after updating
      const updatedAssists = assists.map((assist) =>
        assist.id === assistId
          ? {
              ...assist,
              data: { ...assist.data, show: newShowValue },
            }
          : assist
      );
      setAssists(updatedAssists);
      console.log("Document updated successfully!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.appButtonContainer}>הסטורית הצעות</Text>
        {assists.map((assist) => (
          <View key={assist.id} style={styles.assistContainer}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  handleShowButtonClick(assist.id, assist.data.show)
                }
              >
                <Text style={styles.showButton}>
                  {assist.data.show === 1 ? "חדש הצעה" : "בטל הצעה"}
                </Text>
              </TouchableOpacity>
              <Text style={styles.title}>{assist.data.title}</Text>
            </View>
            <Text style={styles.description}>{assist.data.description}</Text>
            <Text style={styles.date}>
              תאריך: {formatDate(assist.data.createdAt)}
            </Text>
          </View>
        ))}
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
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  phone: {
    fontSize: 14,
    color: "gray",
  },
  date: {
    fontSize: 12,
    color: "gray",
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
  showButton: {
    color: "blue",
    fontWeight: "bold",
  },
});

export default AssistsHistoryScreen;
