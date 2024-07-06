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
import { db } from "../../../firebase";

const AssistsScreen = () => {
  const navigation = useNavigation();
  const [assists, setAssists] = useState([]);

  useEffect(() => {
    const fetchAssists = async () => {
      try {
        const assistsSnapshot = await getDocs(collection(db, "assists"));
        const assistsData = assistsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAssists(assistsData);
      } catch (error) {
        console.error("Error fetching assists:", error);
      }
    };

    fetchAssists();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.appButtonContainer}>הצעות</Text>

        {/* Render Assists */}
        {assists.map((assist) => (
          <TouchableOpacity
            key={assist.id}
            style={styles.card}
            onPress={() => {
              // Navigate to assist details or perform any other action
            }}
          >
            <Text style={styles.cardTitle}>{assist.title}</Text>
            <Text style={styles.cardDescription}>{assist.description}</Text>
          </TouchableOpacity>
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
  backButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  buttonStyle: {
    alignItems: "center",
    backgroundColor: "#edb1bc",
    padding: 5,
    marginVertical: 10,
    width: 250,
    borderRadius: 8,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
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
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    margin: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 16,
    color: "gray",
  },
});

export default AssistsScreen;
