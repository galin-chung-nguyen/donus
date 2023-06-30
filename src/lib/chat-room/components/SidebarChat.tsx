import { Avatar } from "@mui/material";

import db from "../../firebase/firebase-config";
import { collection, Firestore, onSnapshot } from "firebase/firestore";
import firestoreDb from "../../firebase/firebase-config";
import { RoomDataProps } from "../hooks/NavigationSidebar.hook";
import { redirect } from "next/navigation";
import Link from "next/link";
// import { useSelector } from "react-redux";

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
    <Link
      href={"/m/" + roomId}
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
    </Link>
  );
}

export default SidebarChat;
