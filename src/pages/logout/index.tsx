"use client";
import { useEffect } from "react";
import firebase from "firebase/compat/app";
import { signOut } from "firebase/auth";
import { firebaseAuth } from "@/firebase/firebase-config";

export default function Logout() {
  useEffect(() => {
    signOut(firebaseAuth)
      .then(() => {
        // Sign-out successful.
        console.log("Sign-out successful!");
        window.location.assign("/");
      })
      .catch((error) => {
        console.log(error);
        // An error happened.
      });
  }, []);

  return <></>;
}
