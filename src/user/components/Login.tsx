import "src/user/css/Login.scss";
import { Button } from "@material-ui/core";
import firebase from "firebase/compat/app";
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup
} from "firebase/auth";
import { firebaseAuth } from "src/firebase/firebase-config";

const provider = new GoogleAuthProvider();

function Login() {
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
  );
}

export default Login;
