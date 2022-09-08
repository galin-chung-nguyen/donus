import "src/chat-room/css/ChatSettings.scss";
import React, { useState, useEffect } from "react";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
// import Button from "@material-ui/core/Button";
import { Avatar, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import Button from "@mui/material/Button";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  TextField
} from "@material-ui/core";
import DoneIcon from "@material-ui/icons/Done";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import LinkIcon from "@material-ui/icons/Link";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import DeleteSweepIcon from "@material-ui/icons/DeleteSweep";
import AddIcon from "@material-ui/icons/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import firebase from "firebase/compat/app";
import { useSelector } from "react-redux";
import { ReduxState } from "src/app/types/reduxState";
import { User } from "src/user/types/user-redux-state";
import firestoreDb from "src/firebase/firebase-config";
import {
  collection,
  doc,
  updateDoc,
  addDoc,
  DocumentReference,
  serverTimestamp,
  runTransaction
} from "firebase/firestore";
import { MapType } from "src/app/types/map.type";
import { ReferenceString } from "src/app/types/ref-string.type";
import { RoomMemberMetadata, UserEntity } from "src/user/aggregates/user.aggregate";
import {
  ChatMemberMetadata,
  ChatMemberRole,
  ChatRoomEntity,
  ChatRoomType
} from "../aggregates/chat-room.aggregate";
import { ChatRoomWithFullData, MemberInRoom } from "../hooks/ChatScreen.hook";
import { MessageEntity, MessageType } from "../aggregates/message.aggregate";
import toast from "react-hot-toast";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    "& > *": {
      margin: theme.spacing(1)
    }
  },
  small: {
    width: theme.spacing(3),
    height: theme.spacing(3)
  },
  large: {
    width: theme.spacing(10),
    height: theme.spacing(10)
  }
}));

///////////////////////////////////////////////////////////////////////////////////////////////////
/// Dialogs ///

function ChangeChatMemberSettings({
  memData,
  user,
  roomEntity,
  // toggle,
  // open
  hideDialog
}: {
  memData: MemberInRoom | null;
  user: User | null;
  roomEntity: ChatRoomWithFullData | null;
  hideDialog: any;
  // open: any;
  // toggle: any;
}) {
  /////
  const getInitialNickname = (): string => {
    if (!memData || !memData[0] || !memData[1]) return "";
    let nickname = "";
    const userData = (memData as any)[0] as any;
    const chatMemData = (memData as any)[1] as any;

    if (chatMemData) nickname = chatMemData.nickname;
    else if (userData) nickname = userData.name;

    return nickname;
  };

  const [nickname, setNickname] = useState<string>(getInitialNickname());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
  };
  const handleSubmitNewNickname = async (e: any) => {
    if (nickname == getInitialNickname() || nickname.length <= 0) {
      hideDialog();
      return; // not changed
    }

    try {
      if (!user?.userRef) throw new Error("User not found");
      if (!roomEntity?.ref) throw new Error("Room not found");
      if (!memData || !memData[0] || !memData[1]) throw new Error("Member being edited not found");

      await runTransaction(firestoreDb, async (transaction) => {
        // create new message
        const newRoomEntity: ChatRoomEntity = new ChatRoomEntity({ ref: roomEntity.ref });
        await newRoomEntity.get();
        const editedMemEntity: UserEntity = memData[0] as UserEntity;
        await editedMemEntity.get();
        const userEntity = new UserEntity({ ref: user!.userRef });
        await userEntity.get();

        //////////////////////////////////////////////////////////////////////////////
        // create new message
        const newMessageEntity = new MessageEntity({
          sender: user!.userRef,
          receiver: editedMemEntity!.ref,
          room: newRoomEntity!.ref,
          content: nickname,
          type: MessageType.CHANGE_NICKNAME,
          createdAt: serverTimestamp()
        });

        await newMessageEntity.create(collection(firestoreDb, "messages"));
        await newMessageEntity.get();

        // change nickname action
        newRoomEntity.changeNickname(userEntity, editedMemEntity, newMessageEntity);

        await newRoomEntity.save();
        await userEntity.save();
        await editedMemEntity.save();
      });
      toast.success(
        (memData![0] as UserEntity).name + "'s nickname has been changed to '" + nickname + "'!"
      );
    } catch (err) {
      console.log(err);
      toast.error("Some errors occured when changing nickname!");
    }

    hideDialog();
    e.preventDefault();
  };

  // change member role control
  const getInitialRole = (): string => {
    if (!memData || !memData[0] || !memData[1]) return "";
    const chatMemData = (memData as any)[1] as ChatMemberMetadata;
    return chatMemData.role;
  };
  const [roleValue, setRoleValue] = React.useState(getInitialRole());

  useEffect(() => {
    setNickname(getInitialNickname());
    setRoleValue(getInitialRole());
  }, [memData]);

  const getCurrentUserRole = (userEntity: UserEntity | null): string => {
    if (!userEntity || !roomEntity) return "";
    if (roomEntity?.type === ChatRoomType.GROUP) {
      return userEntity.groupChatRooms!.getValue(roomEntity!.ref!.id.toString())!.role!;
    } else {
      return userEntity.personalChatRooms!.getValue(roomEntity!.ref!.id.toString())!.role!;
    }
  };

  useEffect(() => {
    setRoleValue(getInitialRole());
  }, [memData]);

  const handleRadioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      e.target.value === roleValue ||
      ![ChatMemberRole.ADMIN as string, ChatMemberRole.MEMBER as string].includes(e.target.value)
    ) {
      hideDialog();
      return;
    }

    try {
      if (!user?.userRef) throw new Error("User not found");
      if (!roomEntity?.ref) throw new Error("Room not found");
      if (!memData || !memData[0] || !memData[1]) throw new Error("Member being edited not found");

      await runTransaction(firestoreDb, async (transaction) => {
        // create new message
        const newRoomEntity: ChatRoomEntity = new ChatRoomEntity({ ref: roomEntity.ref });
        await newRoomEntity.get();
        const editedMemEntity: UserEntity = memData[0] as UserEntity;
        await editedMemEntity.get();
        const userEntity = new UserEntity({ ref: user!.userRef });
        await userEntity.get();

        if (getCurrentUserRole(userEntity) !== ChatMemberRole.ADMIN) {
          throw new Error("You are not allowed to change role!");
        }

        //////////////////////////////////////////////////////////////////////////////
        // create new message
        const newMessageEntity = new MessageEntity({
          sender: user!.userRef,
          receiver: editedMemEntity!.ref,
          room: newRoomEntity!.ref,
          content: e.target.value,
          type: MessageType.CHANGE_ROLE,
          createdAt: serverTimestamp()
        });

        await newMessageEntity.create(collection(firestoreDb, "messages"));
        await newMessageEntity.get();

        // change nickname action
        newRoomEntity.changeRole(userEntity, editedMemEntity, newMessageEntity);

        await newRoomEntity.save();
        await userEntity.save();
        await editedMemEntity.save();
      });
      toast.success(
        (memData![0] as UserEntity).name + "'s role has been changed to '" + e.target.value + "'!"
      );
    } catch (err: any) {
      console.log(err);
      console.log(err.message);
      toast.error("Some errors occured when changing member role: " + err.message);
    }

    setRoleValue(e.target.value);
    hideDialog();
  };

  const removeMember = async () => {
    try {
      if (!user?.userRef) throw new Error("User not found");
      if (!roomEntity?.ref) throw new Error("Room not found");
      if (!memData || !memData[0] || !memData[1]) throw new Error("Member being edited not found");

      await runTransaction(firestoreDb, async (transaction) => {
        // create new message
        const newRoomEntity: ChatRoomEntity = new ChatRoomEntity({ ref: roomEntity.ref });
        await newRoomEntity.get();
        const editedMemEntity: UserEntity = memData[0] as UserEntity;
        await editedMemEntity.get();
        const userEntity = new UserEntity({ ref: user!.userRef });
        await userEntity.get();

        if (getCurrentUserRole(userEntity) !== ChatMemberRole.ADMIN) {
          throw new Error("You are not allowed to remove user!");
        }

        //////////////////////////////////////////////////////////////////////////////
        // create new message
        const newMessageEntity = new MessageEntity({
          sender: user!.userRef,
          receiver: editedMemEntity!.ref,
          room: newRoomEntity!.ref,
          content: "REMOVE_MEMBER",
          type: MessageType.REMOVE_MEMBER,
          createdAt: serverTimestamp()
        });

        await newMessageEntity.create(collection(firestoreDb, "messages"));
        await newMessageEntity.get();

        // change nickname action
        newRoomEntity.removeMember(userEntity, editedMemEntity, newMessageEntity);

        await newRoomEntity.save();
        await userEntity.save();
        await editedMemEntity.save();
      });
      toast.success((memData![0] as UserEntity).name + "'s has been removed from the chat");
    } catch (err: any) {
      console.log(err);
      console.log(err.message);
      toast.error("Some errors occured when removing member: " + err.message);
    }

    hideDialog();
  };

  return (
    <Dialog
      onClose={() => hideDialog()}
      aria-labelledby="simple-dialog-title"
      open={memData !== null}
    >
      <div className="change_chat_member_settings_dialog">
        <DialogTitle className="edit_nickname_member_name">Update member info</DialogTitle>
        <List>
          <div className="mem_ava_name_container">
            <Avatar src={memData ? (memData![0] as UserEntity).avatarUrl : ""} />
            <div className="dialog_member_name">
              {memData ? (memData![0] as UserEntity).name : ""}
            </div>
          </div>
          <Typography className="dialog_title" variant="subtitle2" gutterBottom>
            Nickname
          </Typography>
          <div className="nickname_input" onSubmit={handleSubmitNewNickname}>
            <TextField
              id="outlined-required"
              variant="outlined"
              className="nickname_textbox"
              placeholder={memData ? (memData![0] as UserEntity).name : ""}
              value={nickname}
              onChange={handleInputChange}
              onKeyDown={(e: any) => {
                if (e.key == "Enter") handleSubmitNewNickname(e);
              }}
            />
            <IconButton onClick={handleSubmitNewNickname}>
              <DoneIcon />
            </IconButton>
          </div>

          <div className="change_member_role_container">
            <FormControl component="fieldset" className="change_member_role_form">
              <Typography className="dialog_title" variant="subtitle2" gutterBottom>
                Role
              </Typography>
              <RadioGroup
                aria-label="quiz"
                name="quiz"
                value={roleValue}
                onChange={handleRadioChange}
                className="role_choices_container"
              >
                {memData && user && (
                  <>
                    <FormControlLabel
                      value={ChatMemberRole.MEMBER}
                      control={<Radio />}
                      label="Member"
                      checked={roleValue === ChatMemberRole.MEMBER}
                      disabled={
                        getCurrentUserRole(user.userInfo as UserEntity) !== ChatMemberRole.ADMIN ||
                        ((memData![1] as ChatMemberMetadata).role === ChatMemberRole.ADMIN &&
                          user.uid !== (memData![0] as UserEntity).id)
                      }
                    />
                    <FormControlLabel
                      value={ChatMemberRole.ADMIN}
                      control={<Radio />}
                      label="Admin"
                      checked={roleValue == ChatMemberRole.ADMIN}
                      disabled={
                        getCurrentUserRole(user.userInfo as UserEntity) !== ChatMemberRole.ADMIN ||
                        ((memData![1] as ChatMemberMetadata).role === ChatMemberRole.ADMIN &&
                          user.uid !== (memData![0] as UserEntity).id)
                      }
                    />
                  </>
                )}
              </RadioGroup>
            </FormControl>
          </div>
          <div className="remove_chat_member_container">
            {memData && user && (
              <Button
                variant="outlined"
                color="secondary"
                // className={classes.button}
                startIcon={<DeleteSweepIcon />}
                onClick={removeMember}
                disabled={
                  getCurrentUserRole(user.userInfo as UserEntity) !== ChatMemberRole.ADMIN ||
                  ((memData![1] as ChatMemberMetadata).role === ChatMemberRole.ADMIN &&
                    user.uid !== (memData![0] as UserEntity).id)
                }
              >
                Remove this member
              </Button>
            )}
          </div>
        </List>
      </div>
    </Dialog>
  );
}

function ConfirmLeaveChatDialog({
  open,
  setOpen,
  user,
  roomEntity
}: {
  open: any;
  setOpen: any;
  user: User | null;
  roomEntity: ChatRoomWithFullData | null;
}) {
  const handleClose = async (leaveChat: any) => {
    setOpen(false);

    if (!leaveChat) return;

    try {
      if (!user?.userRef) throw new Error("User not found");
      if (!roomEntity?.ref) throw new Error("Room not found");

      await runTransaction(firestoreDb, async (transaction) => {
        // create new message
        const newRoomEntity: ChatRoomEntity = new ChatRoomEntity({ ref: roomEntity.ref });
        await newRoomEntity.get();
        const userEntity = new UserEntity({ ref: user!.userRef });
        await userEntity.get();

        // create new message
        const newMessageEntity = new MessageEntity({
          sender: user!.userRef,
          receiver: roomEntity!.ref,
          room: newRoomEntity!.ref,
          content: "LEAVE_CHAT",
          type: MessageType.LEAVE_CHAT,
          createdAt: serverTimestamp()
        });

        await newMessageEntity.create(collection(firestoreDb, "messages"));
        await newMessageEntity.get();

        // change nickname action
        newRoomEntity.userLeaveChat(userEntity, newMessageEntity);

        await newRoomEntity.save();
        await userEntity.save();
      });
      toast.success("Leave chat room '" + roomEntity.roomName + "' successfully!");
    } catch (err) {
      console.log(err);
      toast.error("Some errors occured while leaving chat!");
    }
  };

  return (
    <Dialog className="confirm_leave_chat_dialog" open={open} onClose={() => handleClose(false)}>
      <DialogTitle>
        Leaving chat #{roomEntity?.ref ? roomEntity?.ref.id.toString() : ""}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure that you want to leave{" "}
          <span className="dialogText_roomName">
            {roomEntity?.roomName ? roomEntity?.roomName : ""}
          </span>
          ?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose(false)}>Cancel</Button>
        <Button onClick={() => handleClose(true)}>Leave</Button>
      </DialogActions>
    </Dialog>
  );
}

function InviteFriendDiaglog({ roomId, roomName, open, setOpen }: any) {
  const inviteLink = window.location.origin + "/invite/" + roomId;

  return (
    <Dialog onClose={() => setOpen(false)} aria-labelledby="simple-dialog-title" open={open}>
      <div className="invite_friend_dialog">
        <DialogTitle>Invite friends to {roomName}</DialogTitle>
        <List>
          <Typography
            className="dialog_title"
            variant="subtitle2"
            gutterBottom
            style={{ padding: "0 20px" }}
          >
            Send this invite link to a friend
          </Typography>
          <ListItem autoFocus className="invite-link-wrapper">
            <a href={inviteLink} target="_blank" rel="noopener noreferrer">
              <ListItemText primary={inviteLink} className="invite-link" />
            </a>
            <IconButton
              className="copy-invite-link-btn"
              onClick={() => {
                navigator.clipboard.writeText(inviteLink);
                toast.success("Invitation link copied!");
              }}
            >
              <ContentCopyIcon />
            </IconButton>
          </ListItem>
        </List>
      </div>
    </Dialog>
  );
}

function ChatSettings({
  user,
  roomEntity
}: {
  user: User | null;
  roomEntity: ChatRoomWithFullData | null;
}) {
  const classes = useStyles();

  // chat members - change nickname section
  const [editedMember, setEditedMember] = useState<MemberInRoom | null>(null);

  // booleans to control dialogs visibility
  const [showChatMembersList, setShowChatMembersList] = useState(true);
  const [showConfirmLeaveChat, setShowConfirmLeaveChat] = useState(false);
  const [showInviteLink, setShowInviteLink] = useState(false);

  const [userObject, setUserObject] = useState<User | null>(user);

  useEffect(() => {
    (async () => {
      if (user && user.userRef && user.userInfo) {
        const newUserObject: User | null = Object.assign({}, user);
        await newUserObject.userInfo.get();
        setUserObject(newUserObject);
      }
    })();
  }, [user, roomEntity]);

  return (
    <div className="chat_setting">
      <ChangeChatMemberSettings
        memData={editedMember}
        user={userObject}
        roomEntity={roomEntity}
        hideDialog={() => setEditedMember(null)}
      />
      <ConfirmLeaveChatDialog
        open={showConfirmLeaveChat}
        setOpen={setShowConfirmLeaveChat}
        user={userObject}
        roomEntity={roomEntity}
      />
      <InviteFriendDiaglog
        open={showInviteLink}
        setOpen={setShowInviteLink}
        {...{ roomName: roomEntity?.roomName, roomId: roomEntity?.ref?.id.toString() }}
      />
      <div className="chat__header">
        <Avatar
          src={`https://avatars.dicebear.com/api/bottts/${roomEntity?.ref?.id.toString()}.svg`}
          className={classes.large}
        />
        <div className="chat__headerInfo">
          <h3>{roomEntity?.roomName}</h3>
        </div>
      </div>
      <div className="chat_settings_section list__chat__members">
        <div className="section_title_box">
          <h4 className="right_side_bar_section_title">Chat members</h4>
          {showChatMembersList ? (
            <IconButton onClick={() => setShowChatMembersList(false)}>
              <ExpandLessIcon />
            </IconButton>
          ) : (
            <IconButton onClick={() => setShowChatMembersList(true)}>
              <ExpandMoreIcon />
            </IconButton>
          )}
        </div>
        {showChatMembersList && (
          <div className="list_chat_member_container">
            {roomEntity?.members &&
              Array.from(roomEntity?.members.entries()).map(
                ([memRefString, [memEntity, memMetaData]]: [
                  memRefString: ReferenceString,
                  memData: MemberInRoom
                ]) => {
                  if (
                    ![ChatMemberRole.LEAVED, ChatMemberRole.REMOVED].includes(
                      (memMetaData as ChatMemberMetadata).role
                    )
                  ) {
                    return (
                      <div
                        key={(memEntity as UserEntity).ref?.id.toString()}
                        className="member__box"
                        onClick={() => {
                          setEditedMember([memEntity, memMetaData] as MemberInRoom);
                        }}
                      >
                        <Avatar src={(memEntity as UserEntity).avatarUrl} />
                        <div className="member__name">
                          <h3>{(memEntity as UserEntity).name}</h3>
                          <p>
                            {(memMetaData as ChatMemberMetadata).nickname
                              ? (memMetaData as ChatMemberMetadata).nickname
                              : (memEntity as UserEntity).name}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return <></>;
                }
              )}
          </div>
        )}
      </div>

      <div className="chat_settings_section invite_friend">
        <div className="section_title_box">
          <h4 className="right_side_bar_section_title">Invite link</h4>
          {
            <IconButton onClick={() => setShowInviteLink(true)}>
              <LinkIcon />
            </IconButton>
          }
        </div>
      </div>
      <div className="chat_settings_section leave_group">
        <div className="section_title_box">
          <h4 className="right_side_bar_section_title">Leave chat</h4>
          {
            <IconButton onClick={() => setShowConfirmLeaveChat(true)}>
              <ExitToAppIcon />
            </IconButton>
          }
        </div>
      </div>
    </div>
  );
}

export default ChatSettings;
