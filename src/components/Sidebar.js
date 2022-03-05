import React, { useState, useEffect } from 'react';
import '../assets/css/Sidebar.scss';
import { Avatar, IconButton } from '@material-ui/core';
import ChatIcon from '@material-ui/icons/Chat';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SearchOutlined from '@material-ui/icons/SearchOutlined';
import AddIcon from '@mui/icons-material/Add';
import SideBarChat from './SidebarChat';
import { useParams, useLocation, Redirect } from 'react-router-dom';

import AttachFileIcon from '@material-ui/icons/AttachFile';
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
import Typography from '@material-ui/core/Typography';
import { blue } from '@material-ui/core/colors';

// firebase
import db from '../firebase/firebase-config';
import firebase from "firebase";
import { useSelector, useDispatch } from 'react-redux';
import { setRoomListAction } from '../redux/actions';

const currentRoomsData = {};


function InviteFriendDiaglog(props) {
    const mainChatInfo = useSelector(state => state.mainChat);

    console.info(mainChatInfo);

    const inviteLink = window.location.origin + "/invite/" + mainChatInfo.id;

    return (
        <Dialog className='invite_friend_dialog' onClose={() => props.handleToggleDialog(props.id, false)} aria-labelledby="simple-dialog-title" open={props.open}>
            <DialogTitle>Invite friends to {mainChatInfo.name}</DialogTitle>
            <List>
                <Typography className='dialog_title' variant="subtitle2" gutterBottom style={{ padding: "0 20px" }}>
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

function PreferencesMenu() {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);

    const handleToggle = () => {
        setOpen(true);
    };

    const handleClose = (event) => {
        setOpen(false);
    };

    const [openDialog, setOpenDialog] = useState({
        'logout': false,
        'invite-people': false
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
                                    <MenuItem onClick={() => { handleClose(); handleToggleDialog('invite-people'); }}>Invite people</MenuItem>
                                    <MenuItem onClick={() => { handleClose(); handleToggleDialog('logout'); }}>Log out</MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
            {openDialog['logout'] && <Redirect to = '/logout' />}
            <InviteFriendDiaglog id='invite-people' open={openDialog['invite-people']} handleToggleDialog={handleToggleDialog} />
        </>
    );
}

function Sidebar() {

    const user = useSelector(state => state.user);
    //const rooms = useSelector(state => state.roomList);
    //const dispatch = useDispatch();

    const [rooms, setRooms] = useState([]);
    const [roomData, setRoomData] = useState({});

    useEffect(() => {
        rooms.map(roomId => {
            let unsubscribe = db.collection("rooms").doc(roomId).onSnapshot(roomSnapshot => {
                // stop listing to changes of this room
                if (!rooms.includes(roomSnapshot.id)) {
                    delete currentRoomsData[roomId];
                    unsubscribe();
                } else {
                    currentRoomsData[roomId] = roomSnapshot.data();
                    setRoomData({...currentRoomsData});
                }
            })

            return false;
        });
    }, [rooms]);

    useEffect(async () => {

        user.userRef.onSnapshot(userSnapshot => {
            setRooms(userSnapshot.data().chat.map(x => x.id));
        });

        return
    }, []);

    const createChat = async () => {
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
                creater: user.userRef,
                name: roomName,
                dateCreated: firebase.firestore.FieldValue.serverTimestamp(),
                type: "group_chat"
            });

            // set current user as admin of the new room
            await newRoomRef.collection('members').add({
                memRef: user.userRef,
                role: "admin"
            });

            console.log(newRoomRef)

            // add this chat room into the chatroom list of current user
            await user.userRef.update({
                chat: firebase.firestore.FieldValue.arrayUnion(newRoomRef)
            });

            console.log('create new Room ', roomName, ' successfully!!!')
        }
    }

    useEffect(() => {
        console.log(roomData);
    },[roomData]);


    return (
        <div className="sidebar">
            <div className="sidebar__header">
                <div className="sidebar__headerLeft">
                    <Avatar src={user?.photoURL} />
                </div>
                <div className="sidebar__headerRight">
                    <IconButton onClick={createChat}>
                        <AddIcon />
                    </IconButton>

                    <IconButton>
                        <ChatIcon />
                    </IconButton>
                    <PreferencesMenu />
                </div>
            </div>
            <div className="sidebar__search">
                <div className="sidebar__searchContainer">
                    <SearchOutlined />
                    <input type="text" placeholder='Search Donus' />
                </div>
            </div>
            <div className="sidebar__chats">
                {rooms.map(roomId => (
                    <SideBarChat key={roomId} id={roomId} name={roomData[roomId] ? roomData[roomId].name : ""} />
                ))}
            </div>
        </div>
    )
}

export default Sidebar;