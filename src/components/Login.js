import '../assets/css/Login.scss';
import { useState, useEffect } from 'react';
import { Button } from "@material-ui/core";
import db, { auth, provider } from '../firebase/firebase-config';
import firebase from "firebase";

function Login() {

    const signIn = () => {
        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => {
                // Existing and future Auth states are now persisted in the current
                // session only. Closing the window would clear any existing state even
                // if a user forgets to sign out.
                // ...
                // New sign-in will be persisted with session persistence.
                return auth.signInWithPopup(provider);
            });
    }
    return (
        <div className="login">
            <div className="login__container">
                <img src="https://img.icons8.com/color/452/whatsapp--v1.png" />
                <div className="login__text">
                    <h1>Sign in Donus</h1>
                </div>

                <Button type="submit" onClick={signIn}>Sign in with Google</Button>
            </div>
        </div>
    )
}

export default Login;