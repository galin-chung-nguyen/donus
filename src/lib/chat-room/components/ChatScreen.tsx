import { doc, DocumentReference, DocumentSnapshot, getDoc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/reduxStore";
import firestoreDb from "@/firebase/firebase-config";
import { UserEntity } from "@/user/aggregates/user.aggregate";
import { User } from "@/user/types/user-redux-state";
import { ChatRoomEntity } from "../aggregates/chat-room.aggregate";
import useChatRoomData, { ChatRoomWithFullData } from "../hooks/ChatScreen.hook";
import MainChat from "./Mainchat";
import NavigationSidebar from "./NavigationSidebar";
import { useParams } from "next/navigation";

export default function ChatScreen() {
  const params = useParams();
  const roomId: string = params.roomId as string;
  const user: User | null = useSelector<RootState, User | null>((state) => state.userInfo.value);

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
