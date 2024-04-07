/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";
import Navigation from "./src/navigation";
import { StatusBar } from "expo-status-bar";
import { Constants } from "expo-constants";

/* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
 * LTI update could not be added via codemod */
const App = () => {
  return (
    // Auth.signOut()
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" translucent={true} backgroundColor="#EDB1BC" />
      <Navigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F9FBFC",
  },
});

export default App;
