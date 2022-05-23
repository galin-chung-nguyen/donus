import { useEffect } from 'react';
import firebase from "firebase";

function Logout() {

    useEffect(() => {
        firebase.auth().signOut().then(() => {
            // Sign-out successful.
            window.location = "/";
            console.log("Sign-out successful!");
        }).catch((error) => {
            console.log(error);
            // An error happened.
        });
    }, []);

    return (
        <>
            WTF
        </>
    )
}

export default Logout;