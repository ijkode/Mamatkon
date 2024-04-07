import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { doc, getDocs, collection, updateDoc } from "firebase/firestore";
import { storage } from "../../../firebase";
import { auth } from "../../../firebase";
import { db } from "../../../firebase";
import { Card } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";

const Reports = () => {
  const navigation = useNavigation();
  const [reports, setReports] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportsRef = collection(db, "reports");
        const snapshot = await getDocs(reportsRef);
        const fetchedReports = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));
        setReports(fetchedReports);
      } catch (error) {
        console.log("שגיאה באחזור דוחות", error);
      }
    };

    fetchReports();
  }, []);

  const renderReportCard = ({ item }) => {
    const { user_uid, reports, item_uid } = item.data;

    if (Array.isArray(reports) && reports.length === 0) {
      return null;
    }

    const handleAction = async (itemUid) => {
      if (item_uid) {
        // Handle delete
        Alert.alert("אימות", "האם אתה בטוח שברצונך למחוק את המתכון?", [
          { text: "לא", style: "cancel" },
          {
            text: "כן",
            onPress: async () => {
              // Perform delete operation
              const itemRef = doc(db, `items/${itemUid}`);
              await deleteDoc(itemRef).then(() => {
                Alert.alert("מתכון נמחק בהצלחה");
              });
            },
          },
        ]);
      } else {
        // Handle ban
        Alert.alert("אימות", "האם אתה בטוח שברצונך לחסום משתמש זה?", [
          { text: "לא", style: "cancel" },
          {
            text: "כן",
            onPress: async () => {
              const imageRef = doc(db, `users/${itemUid}`);
              await updateDoc(imageRef, { ban: 1 }, { merge: true }).then(
                () => {
                  Alert.alert("משתמש נחסם");
                }
              );
            },
          },
        ]);
      }
    };

    const cardTitle = item_uid ? item_uid : user_uid;
    const buttonLabel = item_uid ? "Delete" : "Ban";
    const buttonIcon = item_uid ? "trash" : "ban";

    return (
      <Card containerStyle={styles.cardContainer}>
        <View style={styles.itemDetails}>
          <Text style={styles.cardTitle}>{cardTitle}</Text>
        </View>
        {reports.map((report, index) => (
          <Text key={index} style={styles.cardDescription}>
            {report}
          </Text>
        ))}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleAction(item.id)}
        >
          <FontAwesome name={buttonIcon} size={24} color="black" />
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.appButtonContainer}>דוחות</Text>
      {reports !== null ? (
        <FlatList
          data={reports}
          renderItem={renderReportCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.cardListContainer}
        />
      ) : (
        <Text>טוען...</Text>
      )}
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.backButtonStyle}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.backTextStyle}>בחזרה לדף הבית</Text>
      </TouchableOpacity>
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
    textAlign: "center", // Center the title vertically
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
  backButtonStyle: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    // borderRadius: 8,
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
  deleteButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
});

export default Reports;
