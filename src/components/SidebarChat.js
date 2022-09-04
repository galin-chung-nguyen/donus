import '../assets/css/SidebarChat.scss';
import { Avatar } from '@material-ui/core';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import db from '../firebase/firebase-config';
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

import { useSelector } from 'react-redux';

function SidebarChat({ id, name }) {
    const [avaSeed, setAvaSeed] = useState(Math.random());
    const user = useSelector(state => state.user);
    const [messages, setMessages] = useState("");

    useEffect(() => {
        if (id) {
            db.collection('rooms').doc(id).collection('messages')
                .orderBy('timestamp', 'desc')
                .onSnapshot((snapshot) => setMessages(snapshot.docs.map(doc => doc.data())));
        }
    }, [id]);

    useEffect(() => {
        console.info(id,' => ',messages);
    },[messages]);

    const cutShortMsg = (msg) => {
        if(!msg) return "";
        msg = msg.trim();
        if(msg.length > 50) msg = msg.slice(0,30) + "...";
        return msg;
    }

    return (
        <Link to={"/rooms/" + id}>
            <div className="sidebarChat">
                <Avatar src={`https://avatars.dicebear.com/api/bottts/${avaSeed}.svg`} />
                <div className="sidebarChat_info">
                    <h2>{name}</h2>
                    <p>{cutShortMsg(messages[0]?.message)}</p>
                </div>
            </div>
        </Link>
    )
}

export default SidebarChat;