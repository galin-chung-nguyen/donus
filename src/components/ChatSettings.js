import '../assets/css/ChatSettings.scss';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, Redirect } from 'react-router-dom';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import { Avatar, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import {
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Typography, TextField

} from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import LinkIcon from '@material-ui/icons/Link';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import AddIcon from '@material-ui/icons/Add';
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

///////////////////////////////////////////////////////////////////////////////////////////////////
/// Dialogs ///
function ChangeChatMemberSettings(props) {
    /////
    const mainChatInfo = useSelector(state => state.mainChat);
    const user = useSelector(state => state.user);

    console.info(mainChatInfo);

    const [nickname, setNickname] = useState(props.memData.nickname);

    const inviteLink = window.location.origin + "/invite/" + mainChatInfo.id;

    useEffect(() => {
        setNickname(props.memData.nickname ? props.memData.nickname : props.memData.name);
    }, [props.id, props.memData.nickname, props.memData.name]);

    const handleInputChange = (e) => {
        setNickname(e.target.value);
    }
    console.log(props)
    const handleSubmit = async (e) => {
        if (nickname == props.memData.nickname || nickname.length <= 0) {
            props.toggle(false);
            return; // not changed
        }
        let roomRef = db.collection("rooms").doc(props.roomId);

        // console.log(roomRef.id, ' ', props.inRoomId)
        // console.log((await roomRef.get()).data())
        // console.log((await roomRef.collection("members").doc(props.inRoomId).get()).data());


        roomRef.collection("members").doc(props.memData.inRoomId).update({
            "nickname": nickname
        });
        roomRef.collection("messages").add({
            message: nickname,
            sender: props.curUserData.memRef,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            receiver: props.memData.memRef,
            type: "change-nickname"
        });

        props.toggle(false);
        e.preventDefault();
    }

    // change member role control
    const [roleValue, setRoleValue] = React.useState('');

    useEffect(() => {
        setRoleValue(props.memData.role);
    }, [props.memData]);

    const handleRadioChange = (e) => {
        if (e.target.value == roleValue || (!["normal", "admin"].includes(e.target.value))) {
            props.toggle(false);
            return;
        }

        let roomRef = db.collection('rooms').doc(props.roomId);
        roomRef.collection('members').doc(props.memData.inRoomId).update({
            "role": e.target.value
        });

        roomRef.collection('messages').add({
            message: e.target.value,
            sender: props.curUserData.memRef,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            receiver: props.memData.memRef,
            type: "role-change"
        });

        setRoleValue(e.target.value);
        props.toggle(false);
    };

    const removeMember = () => {
        alert('about to remove ', props.memData.inRoomId)
        let roomRef = db.collection("rooms").doc(props.roomId);

        roomRef.collection("members").doc(props.memData.inRoomId).update({
            role: "removed"
        });

        props.memData.memRef.update({
            chat: props.memData.chat.filter(x => x.id != props.roomId)
        });

        roomRef.collection("messages").add({
            message: "remove-member",
            sender: props.curUserData.memRef,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            receiver: props.memData.memRef,
            type: "remove-member"
        });

        props.toggle(false);
    }

    return (
        <Dialog onClose={() => props.toggle(false)} aria-labelledby="simple-dialog-title" open={props.open}>
            <div className='change_chat_member_settings_dialog'>
                {/* <DialogTitle className='edit_nickname_member_name'>{}</DialogTitle> */}
                <List>
                    <div className="mem_ava_name_container">
                        <Avatar src={props.memData.avatarUrl} />
                        <div className='dialog_member_name'>{props.memData.name}</div>
                    </div>
                    <Typography className='dialog_title' variant="subtitle2" gutterBottom>
                        Nickname
                    </Typography>
                    <div className='nickname_input' onSubmit={handleSubmit}>
                        <TextField
                            id="outlined-required"
                            variant="outlined"
                            className='nickname_textbox'
                            placeholder={props.memData.name}
                            value={nickname}
                            onChange={handleInputChange}
                            onKeyDown={(e) => {
                                if (e.key == "Enter") handleSubmit(e)
                            }}
                        />
                        <IconButton onClick={handleSubmit}>
                            <DoneIcon />
                        </IconButton>
                    </div>

                    <div className='change_member_role_container'>
                        <FormControl component="fieldset" className="change_member_role_form">
                            <Typography className='dialog_title' variant="subtitle2" gutterBottom>
                                Role
                            </Typography>
                            <RadioGroup aria-label="quiz" name="quiz" value={roleValue} onChange={handleRadioChange} className='role_choices_container'>
                                {props.curUserData && props.memData && <>
                                    <FormControlLabel value="normal" control={<Radio />} label="Normal" checked={roleValue == "normal"} disabled={props.curUserData.role != "admin" || (props.memData.role == "admin" && props.memData.id != props.curUserData.id)} />
                                    <FormControlLabel value="admin" control={<Radio />} label="Admin" checked={roleValue == "admin"} disabled={props.curUserData.role != "admin" || (props.memData.role == "admin" && props.memData.id != props.curUserData.id)} />
                                </>}
                            </RadioGroup>
                        </FormControl>
                    </div>
                    <div className="remove_chat_member_container">
                        {props.curUserData && props.memData && <Button
                            variant="outlined"
                            color="secondary"
                            // className={classes.button}
                            startIcon={<DeleteSweepIcon />}
                            onClick={removeMember}
                            disabled={props.curUserData.role != "admin" || (props.memData.role == "admin" && props.memData.id != props.curUserData.id)}
                        >
                            Remove this member
                        </Button>}
                    </div>
                </List>
            </div>
        </Dialog>
    )
}

function ConfirmLeaveChatDialog(props) {
    const user = useSelector(state => state.user);

    // console.log(db.collection("rooms").doc(props.roomId))
    // console.log(user.userInfo.chat[1].id == props.roomId)

    const handleClose = (leaveChat) => {
        props.setOpen(false);

        if (!leaveChat) return;

        try {
            let inRoomId = props.memInfoList[user.uid].inRoomId;

            let roomRef = db.collection("rooms").doc(props.roomId);
            roomRef.collection("members").doc(inRoomId).update({
                role: "leaved" // # or banned
            });

            user.userRef.update({
                chat: user.userInfo.chat.filter(x => x.id != props.roomId)
            });

            roomRef.collection("messages").add({
                message: "remove-member",
                sender: user.userRef,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                receiver: user.userRef,
                type: "remove-member"
            });
        } catch (err) {
            console.log('new error while leaving chat ');
            console.log(err);
        }
    }

    return (
        <Dialog className="confirm_leave_chat_dialog" open={props.open} onClose={() => handleClose(false)}>
            <DialogTitle>Leaving chat #{props.roomId ? props.roomId : ""}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure that you want to leave <span className="dialogText_roomName">{props.roomName ? props.roomName : ""}</span>?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleClose(false)}>Cancel</Button>
                <Button onClick={() => handleClose(true)}>Leave</Button>
            </DialogActions>
        </Dialog>
    )
}

function InviteFriendDiaglog(props) {

    const inviteLink = window.location.origin + "/invite/" + props.roomId;

    return (
        <Dialog className='invite_friend_dialog' onClose={() => props.setOpen(false)} aria-labelledby="simple-dialog-title" open={props.open}>
            <DialogTitle>Invite friends to {props.roomName}</DialogTitle>
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

function ChatSettings({ avaSeed, roomName, memInfoList, roomId }) {
    const user = useSelector(state => state.user);
    const classes = useStyles();

    // chat members - change nickname section
    const [openChangeNicknameDialog, setOpenChangeNicknameDialog] = useState(false);
    const [chatMemberData, setchatMemberData] = useState({
        name: "",
        nickname: "",
        inRoomId: "",
        memRef: "",
        role: ""
    });

    // booleans to control dialogs visibility
    const [showChatMembers, setShowChatMembers] = useState(true);
    const [showConfirmLeaveChat, setShowConfirmLeaveChat] = useState(false);
    const [showInviteLink, setShowInviteLink] = useState(false);
    //
    console.log(roomId, ' ', roomName)
    console.log(memInfoList)

    return (
        <div className="chat_setting">
            <ChangeChatMemberSettings memData={chatMemberData} curUserData={memInfoList[user.uid]} roomId={roomId} open={openChangeNicknameDialog} toggle={setOpenChangeNicknameDialog}
            />
            <ConfirmLeaveChatDialog open={showConfirmLeaveChat} setOpen={setShowConfirmLeaveChat} {...{ "roomId": roomId, "roomName": roomName, "memInfoList": memInfoList }} />
            <InviteFriendDiaglog open={showInviteLink} setOpen={setShowInviteLink} {... { "roomName": roomName, "roomId": roomId }} />
            <div className="chat__header">
                <Avatar src={`https://avatars.dicebear.com/api/bottts/${avaSeed}.svg`} className={classes.large} />
                <div className="chat__headerInfo">
                    <h3>{roomName}</h3>
                </div>
            </div>
            <div className="chat_settings_section list__chat__members">
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
                            memInfoList[userId].role != 'leaved' && memInfoList[userId].role != 'removed' &&
                            <div className="member__box" onClick={() => {
                                setchatMemberData({ ...memInfoList[userId] });
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

            <div className="chat_settings_section invite_friend">
                <div className='section_title_box'>
                    <h4 className='right_side_bar_section_title'>Invite link</h4>
                    {
                        <IconButton onClick={() => setShowInviteLink(true)}><LinkIcon /></IconButton>
                    }
                </div>
            </div>
            <div className="chat_settings_section leave_group">
                <div className='section_title_box'>
                    <h4 className='right_side_bar_section_title'>Leave chat</h4>
                    {
                        <IconButton onClick={() => setShowConfirmLeaveChat(true)}><ExitToAppIcon /></IconButton>
                    }
                </div>
            </div>
        </div>
    )
}

export default ChatSettings;