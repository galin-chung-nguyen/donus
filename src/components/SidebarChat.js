import '../assets/css/SidebarChat.scss';
import { Avatar } from '@material-ui/core';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import db from '../firebase/firebase-config';
import firebase from "firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

import { useSelector } from 'react-redux';

function SidebarChat({ id, name, addNewChat }) {
    const [avaSeed, setAvaSeed] = useState(Math.random());
    const user = useSelector(state => state.user);

    const createChat = async() => {
        let roomName = prompt("Please enter name for the new chat");

        if (roomName) {
            // do something
            roomName = roomName.replace(/^\s+|\s+$/gm, '');

            if (roomName.length <= 0 || roomName.length > 100) {
                alert('Room name cannot be empty or too long!');
                return;
            }

            // create new room
            let newRoomRef = await db.collection("rooms").add({
                creater : user.userRef,
                name : roomName,
                dateCreated : firebase.firestore.FieldValue.serverTimestamp(),
                type : "group_chat"
            });

            // set current user as admin of the new room
            await newRoomRef.collection('members').add({
                memRef : user.userRef,
                role : "admin"
            });

            console.log(newRoomRef)
            
            // add this chat room into the chatroom list of current user
            await user.userRef.update({
                chat : firebase.firestore.FieldValue.arrayUnion(newRoomRef)
            });

            console.log('create new Room ',roomName,' successfully!!!')
        }
    }

    const [messages, setMessages] = useState("");

    useEffect(() => {
        if (id) {
            db.collection('rooms').doc(id).collection('messages')
                .orderBy('timestamp', 'desc')
                .onSnapshot((snapshot) => setMessages(snapshot.docs.map(doc => doc.data())));
        }
    }, [id]);

    return addNewChat ? (
        <div className="sidebarChat" onClick={createChat}>
            <h2>Add new chat</h2>
        </div>
    )
        : (
            <Link to={"/rooms/" + id}>
                <div className="sidebarChat">
                    <Avatar src={`https://avatars.dicebear.com/api/bottts/${avaSeed}.svg`} />
                    <div className="sidebarChat_info">
                        <h2>{name}</h2>
                        <p>{messages[0]?.message}</p>
                    </div>
                </div>
            </Link>
        )
}

export default SidebarChat;