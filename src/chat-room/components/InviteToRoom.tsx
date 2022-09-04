import { useParams } from "react-router-dom";
import "src/chat-room/css/InviteToRoom.scss";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import db from "src/firebase/firebase-config";
import firebase from "firebase/compat/app";
import { ReduxState } from "src/app/types/reduxState";
import { User } from "src/user/types/user-redux-state";
import { Button } from "@mui/material";
import {
  collection,
  doc,
  updateDoc,
  addDoc,
  DocumentReference,
  onSnapshot,
  setDoc,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import firestoreDb from "src/firebase/firebase-config";
import useChatRoomData from "../hooks/ChatScreen.hook";
import useChatRoomEntity from "../hooks/InviteToRoom.hook";
import { ChatRoomEntity } from "../aggregates/chat-room.aggregate";
import { UserEntity } from "src/user/aggregates/user.aggregate";
import { MessageEntity, MessageType } from "../aggregates/message.aggregate";
import toast from "react-hot-toast";

type UrlParam = {
  roomId: string;
};

function InviteToRoom() {
  const { roomId } = useParams<UrlParam>();
  const user: User | null = useSelector<ReduxState, User | null>((state) => state.user);

  const { roomEntity }: { roomEntity: ChatRoomEntity | null } = useChatRoomEntity(roomId);
  const joinRoom = async () => {
    try {
      if (!user?.userRef) throw new Error("Please sign in first");
      if (!roomEntity?.ref) throw new Error("Room not found");

      await runTransaction(firestoreDb, async (transaction) => {
        // create new message
        const newRoomEntity: ChatRoomEntity = new ChatRoomEntity({ ref: roomEntity.ref });
        await newRoomEntity.get();
        const userEntity = new UserEntity({ ref: user!.userRef });
        await userEntity.get();

        //////////////////////////////////////////////////////////////////////////////
        // create new message
        const newMessageEntity = new MessageEntity({
          sender: user!.userRef,
          receiver: newRoomEntity.ref,
          room: newRoomEntity!.ref,
          content: "NEW_MEMBER",
          type: MessageType.NEW_MEMBER,
          createdAt: serverTimestamp()
        });

        await newMessageEntity.create(collection(firestoreDb, "messages"));
        await newMessageEntity.get();

        // change nickname action
        newRoomEntity.joinRoom(userEntity, newMessageEntity);

        await newRoomEntity.save();
        await userEntity.save();
      });
      toast.success("You have joined the room '" + roomEntity.roomName + "'");
      window.location.href = "/m/" + roomId;
    } catch (err: any) {
      console.log(err);
      console.log(err.message);
      toast.error("Some errors occured when joining this room: " + err.message);
    }
  };

  return (
    <>
      <div className="invite__container">
        <div className="invite__box">
          <img
            className="invite__img"
            src={`https://avatars.dicebear.com/api/bottts/${roomId}.svg`}
          />
          <div className="invite__text">
            <p>
              Welcome to <h3 style={{ display: "inline-block" }}>{roomEntity?.roomName}</h3>
            </p>
          </div>

          <Button type="submit" className="accept__invite__btn" onClick={joinRoom}>
            Accept invite
          </Button>
        </div>
      </div>
    </>
  );
}

export default InviteToRoom;
