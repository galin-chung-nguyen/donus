import '../assets/css/ChatSettings.scss';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, Redirect } from 'react-router-dom';

import { Avatar, IconButton } from '@material-ui/core';
import Paper from "@material-ui/core/Paper";
import Grid from '@material-ui/core/Grid';
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
import ButtonBase from '@material-ui/core/ButtonBase';
import TextField from '@material-ui/core/TextField';
import DoneIcon from '@material-ui/icons/Done';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

import db from '../firebase/firebase-config';
import firebase from "firebase";
import { useSelector, useDispatch } from 'react-redux';
import { setMainChatInfoAction } from '../redux/actions';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    small: {
        width: theme.spacing(3),
        height: theme.spacing(3),
    },
    large: {
        width: theme.spacing(10),
        height: theme.spacing(10),
    },
}));

function ChangeFriendNicknameDialog(props) {
    const mainChatInfo = useSelector(state => state.mainChat);
    const user = useSelector(state => state.user);

    console.info(mainChatInfo);
    console.log(props)

    const [open, setOpen] = useState(true);
    const [nickname, setNickname] = useState(props.nickname);

    const inviteLink = window.location.origin + "/invite/" + mainChatInfo.id;

    useEffect(() => {
        setNickname(props.nickname ? props.nickname : props.name);
    }, [props.id, props.nickname, props.name]);

    const handleInputChange = (e) => {
        setNickname(e.target.value);
    }
    console.log(props)
    const handleSubmit = async (e) => {
        if (nickname == props.nickname || nickname.length <= 0) {
            props.toggle(false);
            return; // not changed
        }
        let roomRef = db.collection("rooms").doc(props.roomId);

        // console.log(roomRef.id, ' ', props.inRoomId)
        // console.log((await roomRef.get()).data())
        // console.log((await roomRef.collection("members").doc(props.inRoomId).get()).data());


        roomRef.collection("members").doc(props.inRoomId).update({
            "nickname": nickname
        });
        roomRef.collection("messages").add({
            message: nickname,
            sender: user.userRef,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            receiver: props.memRef,
            type: "change-nickname"
        });

        props.toggle(false);
        e.preventDefault();
    }

    return (
        <Dialog onClose={() => { }} aria-labelledby="simple-dialog-title" open={props.open}>
            <div className='edit_nickname_dialog'>
                {/* <DialogTitle className='edit_nickname_member_name'>{}</DialogTitle> */}
                <List>
                    <div className="friend_avatar">
                        <Avatar src={props.avatarUrl} />
                    </div>
                    <Typography className='dialog_title' variant="subtitle2" gutterBottom>
                        Change nickname for <span className='dialog_title_member_name'>{props.name}</span>
                    </Typography>
                    <div className='nickname_input' onSubmit={handleSubmit}>
                        <TextField
                            id="outlined-required"
                            variant="outlined"
                            className='nickname_textbox'
                            placeholder={props.name}
                            value={nickname}
                            onChange={handleInputChange}
                            onKeyDown = {(e) => {
                                if(e.key == "Enter") handleSubmit(e)
                            }}
                        />
                        <IconButton onClick={handleSubmit}>
                            <DoneIcon />
                        </IconButton>
                    </div>
                </List>
            </div>
        </Dialog>
    )
}

function ChatSettings({ avaSeed, roomName, memInfoList, roomId }) {
    const classes = useStyles();

    // chat members - change nickname section
    const [openChangeNicknameDialog, setOpenChangeNicknameDialog] = useState(false);
    const [changeFriendNicknameData, setChangeFriendNicknameData] = useState({
        name: "",
        nickname: "",
        inRoomId: "",
        memRef: ""
    });

    console.log('shit nwe changeFriendNicknameData')
    console.log(changeFriendNicknameData)
    const [showChatMembers, setShowChatMembers] = useState(true);

    //
    console.log(memInfoList)

    return (
        <div className="chat_setting">
            <ChangeFriendNicknameDialog {...{
                ...changeFriendNicknameData,
                "roomId": roomId,
            }} open={openChangeNicknameDialog} toggle={setOpenChangeNicknameDialog}
            />
            <div className="chat__header">
                <Avatar src={`https://avatars.dicebear.com/api/bottts/${avaSeed}.svg`} className={classes.large} />
                <div className="chat__headerInfo">
                    <h3>{roomName}</h3>
                </div>
            </div>
            <div className="list__chat__members">
                <div className='section_title_box'>
                    <h4 className='right_side_bar_section_title'>Chat members</h4>
                        {
                            showChatMembers ? <IconButton onClick={() => setShowChatMembers(false)}><ExpandLessIcon /></IconButton>
                                : <IconButton onClick={() => setShowChatMembers(true)}><ExpandMoreIcon onClick={() => setShowChatMembers(true)} /></IconButton>
                        }
                </div>
                {
                    showChatMembers &&
                    <div className='list_chat_member_container'>

                        {Object.keys(memInfoList).map(userId => (
                            <div className="member__box" onClick={() => {
                                setChangeFriendNicknameData({...memInfoList[userId]});
                                setOpenChangeNicknameDialog(true);
                            }}>
                                <Avatar src={memInfoList[userId].avatarUrl} />
                                <div className="member__name">
                                    <h3>{memInfoList[userId].name}</h3>
                                    <p>{memInfoList[userId].nickname ? memInfoList[userId].nickname : memInfoList[userId].name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                }
            </div>
        </div>
    )
}

export default ChatSettings;