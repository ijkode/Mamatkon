// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { collection, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth/react-native";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPburF426SXI8-elR5BKwwGXAsEFu8P0E",
  authDomain: "mamatkon-d086d.firebaseapp.com",
  projectId: "mamatkon-d086d",
  storageBucket: "mamatkon-d086d.appspot.com",
  messagingSenderId: "612106828052",
  appId: "1:612106828052:web:bc6e28dd729db57561aa01",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const storage = getStorage(app);
const db = getFirestore(app);
export { app, auth, storage, db };
