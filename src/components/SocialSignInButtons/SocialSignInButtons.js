import {View, Text} from 'react-native';
import React from 'react';
import CustomButton from '../CustomButton';
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
} from 'firebase/auth';
const SocialSignInButtons = () => {
  const provider = new GoogleAuthProvider();
  const onSignInGoogle = () => {
    const auth = getAuth();
    console.warn(auth);
    signInWithRedirect(auth, provider)
      .then(result => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // ...
      })
      .catch(error => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.warn(e.message);
        // ...
      });
  };
  const onSignInFacebook = () => {
    console.warn('SignInGoogle');
  };
  const onSignInApple = () => {
    console.warn('SignInApple');
  };
  return (
    <>
      {/* <CustomButton
        text="Sign In With Facebook"
        onPress={onSignInFacebook}
        bgColor="#E7EAF4"
        fgColor="#4765A9"
      /> */}
      <CustomButton
        text="Sign In With Google"
        onPress={onSignInGoogle}
        bgColor="#FAE9EA"
        fgColor="#DD4D44"
      />
      {/* <CustomButton
        text="Sign In With Apple"
        onPress={onSignInApple}
        bgColor="#e3e3e3"
        fgColor="#363636"
      /> */}
    </>
  );
};

export default SocialSignInButtons;
