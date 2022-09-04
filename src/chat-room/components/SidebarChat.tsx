import "src/chat-room/css/SidebarChat.scss";
import { Avatar } from "@material-ui/core";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import db from "../../firebase/firebase-config";
import { collection, Firestore, onSnapshot } from "firebase/firestore";
import firestoreDb from "../../firebase/firebase-config";
import { RoomDataProps } from "../hooks/NavigationSidebar.hook";

// import { useSelector } from "react-redux";
// import { ReduxState, User } from "../types/reduxState";

function SidebarChat({ roomId, roomName, lastMessage, lastViewed, type, role }: RoomDataProps) {
  // const [messages, setMessages] = useState<Array<any>>([]);

  // useEffect(() => {
  //   if (roomId) {
  //     onSnapshot(collection(firestoreDb, "rooms", roomId, "messages"), (snapshot) =>
  //       // .orderBy("timestamp", "desc")
  //       setMessages(snapshot?.docs?.map((doc: any) => doc.data()))
  //     );
  //   }
  // }, [roomId]);

  const cutShortMsg = (msg: any) => {
    if (!msg) return "";
    msg = msg.trim();
    if (msg.length > 50) msg = msg.slice(0, 30) + "...";
    return msg;
  };

  return (
    <Link to={"/m/" + roomId}>
      <div
        className={
          "sidebarChat" +
          (lastViewed && lastMessage?.createdAt && lastViewed < lastMessage?.createdAt
            ? " unseen"
            : "")
        }
      >
        <Avatar src={`https://avatars.dicebear.com/api/bottts/${roomId}.svg`} />
        <div className="sidebarChat_info">
          <h2>{roomName}</h2>
          <p>{lastMessage && cutShortMsg(lastMessage.content)}</p>
        </div>
      </div>
    </Link>
  );
}

export default SidebarChat;
