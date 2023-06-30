// "use client";
import Button from "@mui/material/Button";
import firebase from "firebase/compat/app";
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup
} from "firebase/auth";
import { firebaseAuth } from "@/firebase/firebase-config";
import useLoadUserData from "@/app/hooks/LoadUserData";

const provider = new GoogleAuthProvider();

export default function Home() {
  const { firebaseUserDataLoaded } = useLoadUserData();

  const signIn = () => {
    setPersistence(firebaseAuth, browserLocalPersistence).then(() => {
      // Existing and future Auth states are now persisted in the current
      // session only. Closing the window would clear any existing state even
      // if a user forgets to sign out.
      // ...
      // New sign-in will be persisted with session persistence.
      return signInWithPopup(firebaseAuth, provider);
    });
  };
  return (
    <>
      {firebaseUserDataLoaded && (
        <div className="login">
          <div className="login__container">
            <img src="https://img.icons8.com/color/452/whatsapp--v1.png" />
            <div className="login__text">
              <h1>Sign in Donus</h1>
            </div>

            <Button type="submit" onClick={signIn}>
              Sign in with Google
            </Button>
          </div>
        </div>
      )}{" "}
    </>
  );
}
