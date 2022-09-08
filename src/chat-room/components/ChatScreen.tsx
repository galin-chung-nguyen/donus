import { doc, DocumentReference, DocumentSnapshot, getDoc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { ReduxState } from "src/app/types/reduxState";
import firestoreDb from "src/firebase/firebase-config";
import { UserEntity } from "src/user/aggregates/user.aggregate";
import { User } from "src/user/types/user-redux-state";
import { ChatRoomEntity } from "../aggregates/chat-room.aggregate";
import useChatRoomData, { ChatRoomWithFullData } from "../hooks/ChatScreen.hook";
import MainChat from "./Mainchat";
import NavigationSidebar from "./NavigationSidebar";

export default function ChatScreen() {
  const { roomId } = useParams<{ roomId: string }>();
  const user: User | null = useSelector<ReduxState, User | null>((state) => state.user);

  const dispatch = useDispatch();
  const [openChatSettings, setOpenChatSettings] = React.useState(false);

  const { roomEntity }: { roomEntity: ChatRoomWithFullData | null } = useChatRoomData(user, roomId);

  // hooks

  useEffect(() => {
    // toast.success(
    //   (t) => (
    //     <span>
    //       Custom and <b>bold</b>
    //       <button onClick={() => toast.dismiss(t.id)}>Dismiss</button>
    //     </span>
    //   ),
    //   {
    //     duration: 6000
    //   }
    // );
    toast.success("🦄 Welcome to Donus!", {
      duration: 6000
    });
  }, []);

  return (
    <div className="app_body">
      <NavigationSidebar roomId={roomId} user={user} />
      <MainChat roomEntity={roomEntity} />
    </div>
  );
}
