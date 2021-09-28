import '../assets/css/Mainchat.scss';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Avatar, IconButton } from '@material-ui/core';
import SearchOutlined from '@material-ui/icons/SearchOutlined';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import MicIcon from '@material-ui/icons/Mic';
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

function InviteFriendDiaglog(props) {
    const mainChatInfo = useSelector(state => state.mainChat);

    console.log(mainChatInfo);

    const inviteLink = window.location.origin + "/invite/" + mainChatInfo.id;

    return (
        <Dialog className = 'invite_friend_dialog' onClose={() => props.handleToggleDialog(props.id, false)} aria-labelledby="simple-dialog-title" open={props.open}>
            <DialogTitle>Invite friends to {mainChatInfo.name}</DialogTitle>
            <List>
                <Typography className = 'dialog_title' variant="subtitle2" gutterBottom style = {{padding: "0 20px"}}>
                    Send this invite link to a friend
                </Typography>
                <ListItem autoFocus>
                    <ListItemAvatar>
                        <Avatar>
                            <AddIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={inviteLink} />
                </ListItem>
            </List>
        </Dialog>
    )
}
function MoreVertMenu() {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);

    const handleToggle = () => {
        setOpen(true);
    };

    const handleClose = (event) => {
        setOpen(false);
    };

    const [openDialog, setOpenDialog] = useState({
        'notification-settings': false,
        'invite-people': false,
        'change-nickname': false,
        'members': false,
        'leave-chat': false
    });

    const handleToggleDialog = (dialogId, newState = true) => {
        let newOpenDialog = { ...openDialog };
        newOpenDialog[dialogId] = newState;
        setOpenDialog(newOpenDialog);
    }

    return (
        <>
            <IconButton ref={anchorRef}
                aria-controls={open ? "chat-utils-btn" : undefined}
                aria-haspopup="true"
                onClick={handleToggle}
                className="chat_utils_btn"
            >
                <MoreVertIcon />
            </IconButton>
            <Popper
                className="chat_utils_menu"
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                placement="bottom-end"
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === "bottom" ? "right top" : "right bottom"
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList autoFocusItem={open} id="menu-list-grow">
                                    <MenuItem onClick={() => { handleClose(); handleToggleDialog('notification-settings'); }}>Notification settings</MenuItem>
                                    <MenuItem onClick={() => { handleClose(); handleToggleDialog('change-nickname'); }}>Change nickname</MenuItem>
                                    <MenuItem onClick={() => { handleClose(); handleToggleDialog('members'); }}>Members</MenuItem>
                                    <MenuItem onClick={() => { handleClose(); handleToggleDialog('invite-people'); }}>Invite people</MenuItem>
                                    <MenuItem onClick={() => { handleClose(); handleToggleDialog('leave-chat'); }}>Leave chat</MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
            <InviteFriendDiaglog id='invite-people' open={openDialog['invite-people']} handleToggleDialog={handleToggleDialog} />
        </>
    );
}

function MainChat() {

    const [avaSeed, setAvaSeed] = useState(Math.random());
    const [msgInput, setMsgInput] = useState("");
    const { roomId } = useParams();
    const [roomName, setRoomName] = useState("");
    const [messages, setMessages] = useState([]);
    const [memInfoList, setMemInfoList] = useState({});
    const dispatch = useDispatch();

    const user = useSelector(state => state.user);

    useEffect(async () => {
        if (roomId) {

            let roomRef = db.collection("rooms").doc(roomId);

            if (!(await roomRef.get()).exists) return

            roomRef.onSnapshot((snapshot) => {
                setRoomName(snapshot.data().name);
                dispatch(setMainChatInfoAction({ ...snapshot.data(), id: snapshot.id }));
            });

            roomRef.collection("messages")
                .orderBy('timestamp', 'asc')
                .onSnapshot(snapshot => setMessages(snapshot.docs.map(doc => doc.data())));

            roomRef.collection("members")
                .onSnapshot((querySnapshot) => {
                    let listPromise = [];

                    querySnapshot.forEach((doc) => {
                        listPromise.push(doc.data().memRef.get());
                    });

                    Promise.all(listPromise).then((results) => results.map(doc => ({ ...doc.data(), id: doc.id })))
                        .then(results => {

                            let newMemInfoList = {};
                            for (let i = 0; i < results.length; ++i) {
                                newMemInfoList[results[i].id] = results[i];
                            }
                            setMemInfoList({ ...memInfoList, ...newMemInfoList });
                        });
                })
        }
        setAvaSeed(Math.random());
    }, [roomId]);

    const sendMessage = (e) => {
        console.log(msgInput)
        console.log(user.userRef)
        e.preventDefault();

        db.collection("rooms").doc(roomId).collection("messages").add({
            message: msgInput,
            sender: user.userRef,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        setMsgInput("");
    }

    return (
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
                    <MoreVertMenu />
                </div>
            </div>
            <div className="chat__body">
                {
                    messages.map(message => (
                        <p className={"chat__message " + (message.sender.id == user.uid && "chat__receiver")}>
                            <span className="chat__name">{memInfoList.hasOwnProperty(message.sender.id) ? memInfoList[message.sender.id].name : ""}</span>
                            {message.message}
                            <span className="chat__timestamp">{
                                new Date(message.timestamp?.toDate()).toString()
                            }</span>
                        </p>
                    ))
                }
            </div>
            <div className="chat__footer">
                <InsertEmoticonIcon />
                <form onSubmit={sendMessage}>
                    <input type="text" placeholder="Type your message here ..." value={msgInput} onChange={(e) => setMsgInput(e.target.value)} />
                    <button type="submit">Send</button>
                </form>
                <MicIcon />
            </div>
        </div>
    )
}

export default MainChat;