import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { decode } from "base-64";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../../components/CustomButton";
import { useNavigation } from "@react-navigation/native";
import { storage } from "../../../firebase";
import { auth, db } from "../../../firebase";
import { doc, updateDoc, arrayUnion, setDoc, getDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import DropDownPicker from "react-native-dropdown-picker";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  uploadString,
  uploadBytes,
  updateMetadata,
} from "firebase/storage";
import { useForm } from "react-hook-form";
import CustomInput from "../../components/CustomInput";
import { Feather } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
const PostScreen = () => {
  const [filePath, setFilePath] = useState({});
  const [uid, setUid] = useState({});
  const [isImageSelected, setIsImageSelected] = useState(false);
  const navigation = useNavigation();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [itemName, setItemName] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const { control, handleSubmit } = useForm();
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [subcategoryOpen, setSubcategoryOpen] = useState(false);
  const [showSubcategory, setShowSubcategory] = useState(false);
  const [intArray, setIntArray] = useState([0, 0, 0, 0, 0]);
  const [value, setValue] = useState(null);
  const [ingredients, setIngredients] = useState([{ name: "" }]);
  const [items, setItems] = useState([
    {
      label: "ראשונות",
      value: "ראשונות",
      subcategories: [
        { label: "סלטים", value: "סלטים" },
        { label: "מרקים", value: "מרקים" },
        { label: "תבשילים", value: "תבשילים" },
      ],
    },
    {
      label: "עיקריות",
      value: "עיקריות",
      subcategories: [
        { label: "בשריות", value: "בשריות" },
        { label: "דגים", value: "דגים" },
        { label: "עוף", value: "עוף" },
        { label: "פיצות ופסטות", value: "פיצות ופסטות" },
      ],
    },
    {
      label: "קינוחים",
      value: "קינוחים",
      subcategories: [
        { label: "עוגות", value: "עוגות" },
        { label: "שייקים", value: "שייקים" },
        { label: "קינוחים חמים", value: "קינוחים חמים" },
        { label: "ממתקים וסוכריות", value: "ממתקים וסוכריות" },
        { label: "מאפים", value: "מאפים" },
      ],
    },
    {
      label: "פרווה",
      value: "פרווה",
      subcategories: [
        { label: "ראשונות", value: "ראשונות" },
        { label: "עיקריות", value: "עיקריות" },
      ],
    },
  ]);
  const removeIngredientInput = (indexToRemove) => {
    setIngredients((prevIngredients) =>
      prevIngredients.filter((_, index) => index !== indexToRemove)
    );
  };
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Oops", "הרשאות נדרשות להעלאת תמונה");
      return;
    }
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // console.warn(result["assets"]);

    if (!result.canceled) {
      setImage(result["assets"][0]["uri"]);
      setIsImageSelected(true);
    }
    try {
      await setUid(auth["currentUser"]["uid"]);
      // console.warn(uid);
    } catch (e) {
      Alert.alert("Oops", e.message);
    }

    // console.warn(result["assets"]);
  };
  const addIngredientInput = () => {
    setIngredients([...ingredients, { name: "" }]);
  };
  const uploadPhoto = async (data) => {
    const { itemName, ingredients } = data;
    setLoading(true);
    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);
    const name =
      data.itemName + "." + uid + "." + today.toISOString().slice(0, 16);

    try {
      const response = await fetch(image);
      const blob = await response.blob();

      const storageRef = ref(storage, name);
      await uploadBytes(storageRef, blob);

      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();
      const cleanedIngredients = ingredients
        .filter((ingredient) => ingredient.name !== undefined)
        .map((ingredient) => ingredient.name);
      const itemRef = ref(storage, name);
      const metadata = {
        customMetadata: {
          archive: "false",
          item_name: data.itemName,
          item_description: data.itemDescription,
          item_uid: name,
          category: selectedCategory,
          subcategory: selectedSubcategory,
          phone_number: userData.phone_number,
          email: userData.email,
        },
      };
      await updateMetadata(itemRef, metadata);

      const imageRef = doc(db, `users/${auth.currentUser.uid}`);
      await updateDoc(imageRef, { items: arrayUnion(name) }, { merge: true });

      await setDoc(doc(db, "items", name), {
        item_name: data.itemName,
        item_description: data.itemDescription,
        rating: intArray,
        ingredients: cleanedIngredients,
      });

      Alert.alert("עלה בהצלחה!");
      navigation.navigate("Home");
    } catch (e) {
      Alert.alert("Oops", e.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text style={styles.appButtonContainer}>פרסום מתכון</Text>
      <CustomInput
        name="itemName"
        placeholder="שם מתכון"
        control={control}
        rules={{
          required: "Item Name is required",
        }}
      />
      <CustomInput
        name="itemDescription"
        placeholder="תאור מתכון"
        control={control}
        rules={{
          required: "Item Description is required",
        }}
      />
      <Text style={{ textAlign: "center", fontSize: 18, marginVertical: 10 }}>
        מרכיבים
      </Text>
      <View>
        {ingredients.map((ingredient, index) => (
          <View
            key={index}
            style={{ flexDirection: "column", alignItems: "center" }}
          >
            <CustomInput
              name={`ingredients[${index}].name`}
              placeholder={`הזן מרכיב`}
              control={control}
              defaultValue={ingredient.name}
            />
            {index === ingredients.length - 1 && (
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity onPress={addIngredientInput}>
                  <Ionicons name="add-circle-outline" size={24} color="black" />
                </TouchableOpacity>
                {index !== 0 && (
                  <TouchableOpacity
                    onPress={() => removeIngredientInput(index)}
                  >
                    <FontAwesome name="remove" size={24} color="black" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row" }}>
        <View style={styles.dropDownContainer}>
          <DropDownPicker
            open={categoryOpen}
            value={selectedCategory}
            items={items}
            setOpen={setCategoryOpen}
            setValue={setSelectedCategory}
            setItems={setItems}
            placeholder="בחר קטגוריה"
            onChangeValue={(value) => {
              setSelectedCategory(value);
              setSelectedSubcategory("");
              setShowSubcategory(true);
            }}
            containerStyle={styles.dropDownStyle}
            style={styles.dropDownStyle}
            labelStyle={styles.dropDownLabelStyle}
            dropDownStyle={styles.dropDownStyle}
            selectedItemStyle={styles.dropDownSelectedItemStyle}
            itemStyle={styles.dropDownItemStyle}
          />
        </View>
        {showSubcategory && (
          <View style={styles.dropDownContainer}>
            <DropDownPicker
              open={subcategoryOpen}
              value={selectedSubcategory}
              items={
                items.find((item) => item.value === selectedCategory)
                  ?.subcategories || []
              }
              placeholder="בחר תת קטגוריה"
              setOpen={setSubcategoryOpen}
              setValue={setSelectedSubcategory}
              setItems={setItems}
              containerStyle={styles.dropDownStyle}
              style={styles.dropDownStyle}
              labelStyle={styles.dropDownLabelStyle}
              dropDownStyle={styles.dropDownStyle}
              selectedItemStyle={styles.dropDownSelectedItemStyle}
              itemStyle={styles.dropDownItemStyle}
            />
          </View>
        )}
      </View>
      <View style={styles.container}>
        {/* {image ? (
          <Image source={{ uri: image }} style={styles.imageStyle} />
        ) : (
          <Image source={{ uri: image }} style={styles.imagePlaceholder} />
        )} */}
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buttonStyle}
          onPress={pickImage}
        >
          <Text style={styles.textStyle}>בחר תמונה</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.5}
          disabled={!isImageSelected}
          style={[
            styles.buttonStyle,
            isImageSelected ? null : styles.buttonDisabled,
          ]}
          onPress={handleSubmit(uploadPhoto)}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather name="upload" size={24} color="#393E46" />
            <Text
              style={[
                styles.textStyle,
                isImageSelected ? null : styles.textStyleDisabled,
              ]}
              text={loading ? "אנא המתן..." : "העלה"}
            >
              {loading ? "אנא המתן..." : "העלה"}
            </Text>
          </View>
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

export default PostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  titleText: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 20,
    zIndex: 9999,
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
    backgroundColor: "#EDB1BC",
    zIndex: 9999,
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
    fontSize: 24,
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
    backgroundColor: "#d27989",
    padding: 5,
    marginVertical: 10,
    width: 250,
    borderRadius: 8,
  },
  backButtonStyle: {
    alignItems: "center",
    color: "gray",
    padding: 5,
    marginVertical: 10,
    width: 250,
    // borderRadius: 8,
  },
  imageStyle: {
    width: 250,
    height: 300,
    margin: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: "#EDB1BC",
    color: "black",
    borderRadius: 8,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  categoryText: {
    marginRight: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  pickerStyle: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    color: "#000",
    marginBottom: 10,
  },
  headerContainer: {
    backgroundColor: "#EDB1BC",
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
  inputStyle: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  imagePlaceholder: {
    width: 250,
    height: 300,
    backgroundColor: "#eaeaea",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  dropDownContainer: {
    flex: 1,
    marginHorizontal: 2,
  },
  dropDownStyle: {
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    zIndex: 9999,
  },
  dropDownLabelStyle: {
    fontSize: 16,
    textAlign: "left",
    color: "#333",
  },
  dropDownSelectedItemStyle: {
    backgroundColor: "#e6e6e6",
  },
  dropDownItemStyle: {
    justifyContent: "flex-start",
  },
});
