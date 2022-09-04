import { useParams } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import '../assets/css/InviteToRoom.scss';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import db from '../firebase/firebase-config';
import firebase from "firebase";

function InviteToRoom() {
    const { roomId } = useParams();
    const avaSeed = Math.random();
    const [roomInfo, setRoomInfo] = useState({});
    const user = useSelector(state => state.user);

    useEffect(() => {
        console.log(roomId);
        db.collection("rooms").doc(roomId).onSnapshot((snapshot) => {
            let roomInfo = snapshot.data();
            setRoomInfo(roomInfo);
        });
    }, [roomId]);

    console.log(roomInfo);

    console.log(user)

    const joinRoom = async () => {
        if (user && user.userRef && user.userInfo) {
            let joined = false;
            for (let i = 0; i < user.userInfo.chat.length; ++i) {
                if (user.userInfo.chat[i].id == roomId) {
                    joined = true;
                    break;
                }
            }
            if (!joined) {
                let roomRef = db.collection("rooms").doc(roomId);
                // now join the room
                roomRef.collection('members').doc(user.uid).set({
                    memRef: user.userRef,
                    role: "normal",
                    nickname: user.displayName
                });

                // add this chat room into the chatroom list of current user
                await user.userRef.update({
                    chat: firebase.firestore.FieldValue.arrayUnion(roomRef)
                });

                // add a new member message
                await roomRef.collection("messages").add({
                    message: "new-member",
                    sender: user.userRef,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    receiver: user.userRef,
                    type: "new-member"
                });
            } else {
                alert('you have joined this room already!')
            }

            window.location = "/rooms/" + roomId;
        } else {
            alert('You should sign in first!!!');
            window.location = "/";
        }
    }

    return (
        <>
            <div className="invite__container">
                <div className="invite__box">
                    <img className='invite__img' src={`https://avatars.dicebear.com/api/bottts/${avaSeed}.svg`} />
                    <div className="invite__text">
                        <p>Welcome to</p>
                        <h3>{roomInfo.name ? roomInfo.name : ""}</h3>
                    </div>

                    <Button type="submit" className="accept__invite__btn" onClick={joinRoom}>Accept invite</Button>
                </div>
            </div>
        </>
    )
}

export default InviteToRoom;