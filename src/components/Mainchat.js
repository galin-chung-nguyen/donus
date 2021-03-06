import '../assets/css/Mainchat.scss';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, Redirect } from 'react-router-dom';

import { Avatar, IconButton } from '@material-ui/core';
import SearchOutlined from '@material-ui/icons/SearchOutlined';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import MicIcon from '@material-ui/icons/Mic';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";

import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import PersonIcon from '@material-ui/icons/Person';
import AddIcon from '@material-ui/icons/Add';
import Typography from '@material-ui/core/Typography';
import { blue } from '@material-ui/core/colors';

import db from '../firebase/firebase-config';
import firebase from "firebase";
import { useSelector, useDispatch } from 'react-redux';
import { setMainChatInfoAction } from '../redux/actions';
import ChatSettings from './ChatSettings';


function MainChat() {

    const [avaSeed, setAvaSeed] = useState(Math.random());
    const [msgInput, setMsgInput] = useState("");
    const { roomId } = useParams();
    const [roomName, setRoomName] = useState("");
    const [messages, setMessages] = useState([]);
    const chatBodyRef = useRef(null);
    const [memInfoList, setMemInfoList] = useState({});
    const dispatch = useDispatch();

    const [wrongRoomId, setWrongRoomId] = useState(false);

    const user = useSelector(state => state.user);

    // chat settings
    const [openChatSettings, setOpenChatSettings] = React.useState(true);

    console.log(user)
    console.log(messages)

    console.log('new room id')
    console.log(roomId)

    useEffect(async () => {
        if (roomId) {

            let roomOfUser = false;

            for (let i = 0; i < user.userInfo.chat.length; ++i) {
                if (user.userInfo.chat[i].id == roomId) {
                    roomOfUser = true;
                }
            }

            if (!roomOfUser) {
                return
            }

            let roomRef = db.collection("rooms").doc(roomId);

            if (!(await roomRef.get()).exists) {
                setWrongRoomId(true);
                return;
            }

            // update room information (name/id/ ...)
            roomRef.onSnapshot((snapshot) => {
                setRoomName(snapshot.data().name);
                dispatch(setMainChatInfoAction({ ...snapshot.data(), id: snapshot.id }));
            });

            // listen to message history snapshots
            roomRef.collection("messages")
                .orderBy('timestamp', 'asc')
                .onSnapshot(snapshot => setMessages(snapshot.docs.map(doc => doc.data())));

            // listen to member history snapshots
            roomRef.collection("members")
                // for each member list snapshot
                .onSnapshot((querySnapshot) => {
                    let listPromise = [];

                    // create a list of promises to fetch information of all members
                    let newMemInfoList = {};

                    querySnapshot.forEach((doc) => {
                        listPromise.push(doc.data().memRef.get());
                        newMemInfoList[doc.data().memRef.id] = {
                            role: doc.data().role,
                            nickname: doc.data().nickname,
                            inRoomId: doc.id,
                            memRef: doc.data().memRef
                        }
                    });
                    
                    console.log('shit new snap shot')
                    console.log(querySnapshot)

                    Promise.all(listPromise).then((results) => results.map(doc => ({ ...doc.data(), id: doc.id })))
                        .then(results => {
                            for (let i = 0; i < results.length; ++i) {
                                newMemInfoList[results[i].id] = { ...newMemInfoList[results[i].id], ...results[i] };
                            }

                            setMemInfoList({ ...newMemInfoList });
                        });
                })
        }
        setAvaSeed(Math.random());
    }, [roomId]);

    // useEffect(() => {
    //     console.info(messages);
    // }, [messages]);

    useEffect(() => {
        console.info(memInfoList);
    }, [memInfoList])

    const sendMessage = (e) => {
        e.preventDefault();
        let msg = msgInput.trim();
        if (msg == '') return;

        // alert('new message ');
        // alert(msg);
        db.collection("rooms").doc(roomId).collection("messages").add({
            message: msg,
            sender: user.userRef,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            receiver: "all",
            type: "text-message"
        });
        setMsgInput("");
    }

    useEffect(() => {
        if (chatBodyRef) {
            chatBodyRef.current.addEventListener('DOMNodeInserted', event => {
                const { currentTarget: target } = event;
                target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
            });
        }
    }, [])

    const formatMsgTimeStamp = (d) => {
        if (!(d instanceof Date)) return ""

        var hours = d.getHours();
        var minutes = d.getMinutes();
        var ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour "0" should be "12"
        minutes = minutes < 10 ? "0" + minutes : minutes;
        var strTime = hours + ":" + minutes + " " + ampm;
        return d.getDate() + " " + new Intl.DateTimeFormat('en', { month: 'short' }).format(d) + " " + d.getFullYear() + " " + strTime;
    }

    return (
        <>

            {wrongRoomId && user.userInfo.chat && user.userInfo.chat.length > 0 && <Redirect to={"/rooms/" + user.userInfo.chat[0].id} />}
            <div className="chat_container">
                <div className="main_chat">
                    <div className="chat__header">
                        <Avatar src={`https://avatars.dicebear.com/api/bottts/${avaSeed}.svg`} />
                        <div className="chat__headerInfo">
                            <h3>{roomName}</h3>
                            <p>Last seen at ...</p>
                        </div>

                        <div className="chat__headerRight">
                            <IconButton>
                                <SearchOutlined />
                            </IconButton>

                            <IconButton>
                                <AttachFileIcon />
                            </IconButton>
                            <IconButton
                                onClick={() => setOpenChatSettings(!openChatSettings)}
                                className="chat_utils_btn"
                            >
                                <MoreVertIcon />
                            </IconButton>
                        </div>
                    </div>
                    <div className="chat__body" ref={chatBodyRef}>
                        {
                            messages.map(message => {
                                if (message.type == "text-message")
                                    return (
                                        <div className={"chat__message " + (message.sender.id == user.uid && "chat__receiver")}>
                                            <p className="message__content">
                                                {message.message}
                                            </p>
                                            <div className="message__info">
                                                <span className="message__name">{memInfoList.hasOwnProperty(message.sender.id) ? memInfoList[message.sender.id].nickname : ""}</span>
                                                <span className="message__timestamp">{
                                                    formatMsgTimeStamp(message.timestamp?.toDate())
                                                }</span>
                                            </div>
                                        </div>
                                    )
                                else if (message.type == "change-nickname") {
                                    try {
                                        let sender = memInfoList.hasOwnProperty(message.sender.id) ? memInfoList[message.sender.id].name : ""
                                        let receiverText = (<>nickname <span className="message__name">{(message.sender.id == message.receiver.id ? "" : "of " + memInfoList.hasOwnProperty(message.sender.id) ? memInfoList[message.receiver.id].name : "")}</span></>)

                                        if (message.sender.id == user.uid) sender = "You"
                                        if (message.receiver.id == user.uid) receiverText = "your nickname"
                                        let senderText = (<span className="message__name">{sender}</span>)
                                        let nicknameText = (<span className="message__name">{message.message}</span>)

                                        return (
                                            <div className={"notification_message"}>
                                                <p className="message__content">
                                                    {senderText} has changed {receiverText} to {nicknameText}
                                                </p>
                                                <div className="message__info">
                                                    <span className="message__timestamp">{
                                                        formatMsgTimeStamp(message.timestamp?.toDate())
                                                    }</span>
                                                </div>
                                            </div>
                                        )
                                    } catch (err) {
                                        console.log(err);
                                    }
                                } else if (message.type == "remove-member") {
                                    try {
                                        let sender = memInfoList.hasOwnProperty(message.sender.id) ? memInfoList[message.sender.id].name : ""
                                        let receiver = memInfoList.hasOwnProperty(message.receiver.id) ? memInfoList[message.receiver.id].name : ""

                                        console.log(sender, ' ~ ', receiver);
                                        if (message.sender.id == user.uid) sender = "You"
                                        if (message.receiver.id == user.uid) receiver = "you"
                                        let senderText = (<span className="message__name">{sender}</span>)
                                        let receiverText = (<span className="message__name">{receiver}</span>)

                                        return (
                                            <div className={"notification_message"}>
                                                <p className="message__content">{
                                                    message.sender.id != message.receiver.id ? <>{senderText} has removed {receiverText} from the chat</>
                                                        : (<>{senderText} has leaved the chat</>)
                                                }
                                                </p>
                                                <div className="message__info">
                                                    <span className="message__timestamp">{
                                                        formatMsgTimeStamp(message.timestamp?.toDate())
                                                    }</span>
                                                </div>
                                            </div>
                                        )
                                    } catch (err) {
                                        console.log(err);
                                    }
                                } else if (message.type == "new-member") {
                                    try {
                                        let sender = memInfoList.hasOwnProperty(message.sender.id) ? memInfoList[message.sender.id].name : ""
                                        let receiver = memInfoList.hasOwnProperty(message.receiver.id) ? memInfoList[message.receiver.id].name : ""

                                        console.log(sender, ' ~ ', receiver);
                                        if (message.sender.id == user.uid) sender = "You"
                                        if (message.receiver.id == user.uid) receiver = "you"
                                        let senderText = (<span className="message__name">{sender}</span>)
                                        let receiverText = (<span className="message__name">{receiver}</span>)

                                        return (
                                            <div className="notification_message">
                                                <p className="message__content">{
                                                    message.sender.id != message.receiver.id ? <>{senderText} has added {receiverText} to the chat</>
                                                        : (<>{senderText} has joined the chat</>)
                                                }
                                                </p>
                                                <div className="message__info">
                                                    <span className="message__timestamp">{
                                                        formatMsgTimeStamp(message.timestamp?.toDate())
                                                    }</span>
                                                </div>
                                            </div>
                                        )
                                    } catch (err) {
                                        console.log(err);
                                    }
                                } else if (message.type == "role-change") {
                                    try {
                                        let sender = memInfoList.hasOwnProperty(message.sender.id) ? memInfoList[message.sender.id].name : ""
                                        let receiver = memInfoList.hasOwnProperty(message.receiver.id) ? memInfoList[message.receiver.id].name : ""

                                        console.log(sender, ' ~ ', receiver);
                                        if (message.sender.id == user.uid) sender = "You"
                                        if (message.receiver.id == user.uid) receiver = "you"
                                        let senderText = (<span className="message__name">{sender}</span>)
                                        let receiverText = (<span className="message__name">{receiver}</span>)

                                        return (
                                            <div className="notification_message">
                                                <p className="message__content">{
                                                    message.sender.id != message.receiver.id ? <>{senderText} has changed {receiverText}'s role to <b>{message.message}</b></>
                                                        : (<>{senderText} has changed your role to <b>{message.message}</b></>)
                                                }
                                                </p>
                                                <div className="message__info">
                                                    <span className="message__timestamp">{
                                                        formatMsgTimeStamp(message.timestamp?.toDate())
                                                    }</span>
                                                </div>
                                            </div>
                                        )
                                    } catch (err) {
                                        console.log(err);
                                    }
                                }
                            })
                        }
                    </div>
                    <div className="chat__footer">
                        <IconButton size="small">
                            <AddReactionIcon />
                        </IconButton>
                        <IconButton size="small">
                            <ImageIcon />
                        </IconButton>
                        <form onSubmit={sendMessage}>
                            <input type="text" placeholder="Type your message here ..." value={msgInput} onChange={(e) => setMsgInput(e.target.value)} />
                            <button type="submit">Send</button>
                        </form>

                        <IconButton size="small">
                            <MicIcon />
                        </IconButton>
                    </div>
                </div>
                {openChatSettings && <ChatSettings avaSeed={avaSeed} roomName={roomName} memInfoList={memInfoList} roomId={roomId} />}
            </div>

        </>
    )
}

export default MainChat;