import React, { useState, useEffect, useRef, ReactElement } from "react";

import { Avatar, IconButton } from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import MicIcon from "@mui/icons-material/Mic";
import ImageIcon from "@mui/icons-material/Image";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/reduxStore";
import { User } from "@/user/types/user-redux-state";
import firestoreDb from "../../firebase/firebase-config";
import { collection, runTransaction, serverTimestamp } from "firebase/firestore";
import { MapType, TSMapType } from "@/app/types/map.type";
import toast from "react-hot-toast";
import { UserEntity } from "@/user/aggregates/user.aggregate";
import { ChatMemberMetadata, ChatRoomEntity } from "../aggregates/chat-room.aggregate";
import { formatMessageTimeStamp } from "../utils/message-time.util";
import { ChatRoomWithFullData, MemberInRoom } from "../hooks/ChatScreen.hook";
import { MessageEntity, MessageType } from "../aggregates/message.aggregate";
import { ReferenceString } from "@/app/types/ref-string.type";
import { DateTypeToDate } from "@/app/utils/date.type";
import ChatSettings from "./ChatSettings";
import { useRouter } from "next/router";
// import ChatSettings from "./ChatSettings";

const MainChatHeader = ({ roomId, roomName, openChatSettings, setOpenChatSettings }: any) => {
  return (
    <div className="chat_header">
      <Avatar src={`https://avatars.dicebear.com/api/bottts/${roomId}.svg`} />
      <div className="chat_headerInfo">
        <h3>{roomName}</h3>
      </div>

      <div className="chat_headerRight">
        <IconButton>
          <SearchOutlined />
        </IconButton>

        <IconButton>
          <AttachFileIcon />
        </IconButton>
        <IconButton
          onClick={() => setOpenChatSettings(!openChatSettings)}
          className="chat_utils_btn"
        >
          <MoreVertIcon />
        </IconButton>
      </div>
    </div>
  );
};

const MainChatBody = ({
  messages,
  user,
  members,
  roomId
}: {
  messages: Array<MessageEntity>;
  user: any;
  roomId: ReferenceString;
  members: MapType<ReferenceString, MemberInRoom>;
}) => {
  const chatBodyRef = useRef<null | any>(null);

  useEffect(() => {
    if (
      messages &&
      messages.length > 0 &&
      chatBodyRef.current &&
      (!chatBodyRef.current.alreadyScrolled || chatBodyRef.current.alreadyScrolled !== roomId)
    ) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      chatBodyRef.current.alreadyScrolled = roomId;
    }
  }, [messages]);

  return (
    <div className="chat_body" ref={chatBodyRef}>
      {messages.map((message: MessageEntity) => {
        const msgId = message.sender?.id?.toString();
        switch (message.type) {
          case MessageType.TEXT_MESSAGE:
            return (
              <div
                key={message.id}
                className={"chat_message " + (msgId === user.uid && "chat_receiver")}
              >
                <p className="message_content">{message.content}</p>
                <div className="message_info">
                  <span className="message_name">
                    {msgId &&
                      members?.has(msgId) &&
                      (members?.get(msgId)![1] as ChatMemberMetadata)?.nickname}
                  </span>
                  <span className="message_timestamp">
                    {message?.createdAt &&
                      formatMessageTimeStamp(DateTypeToDate(message.createdAt))}
                  </span>
                </div>
              </div>
            );
            break;

          case MessageType.CREATE_CHAT: {
            const senderText = (
              <span className="message_name">
                {message!.sender!.id === user!.uid
                  ? "You"
                  : (members.getValue(message!.sender!.id)![1] as ChatMemberMetadata).nickname}
              </span>
            );

            return (
              <div className={"notification_message"} key={message.id}>
                <p className="message_content">
                  {senderText} has created new chat{" "}
                  <span className="message_name">{message.content}</span>
                </p>
                <div className="message_info">
                  <span className="message_timestamp">
                    {formatMessageTimeStamp(DateTypeToDate(message!.createdAt))}
                  </span>
                </div>
              </div>
            );
            break;
          }

          case MessageType.LEAVE_CHAT: {
            const senderText = (
              <span className="message_name">
                {message!.sender!.id === user!.uid
                  ? "You"
                  : (members.getValue(message!.sender!.id)![1] as ChatMemberMetadata).nickname}
              </span>
            );
            return (
              <div className={"notification_message"} key={message.id}>
                <p className="message_content">{senderText} leaved the chat</p>
                <div className="message_info">
                  <span className="message_timestamp">
                    {formatMessageTimeStamp(DateTypeToDate(message!.createdAt))}
                  </span>
                </div>
              </div>
            );
            break;
          }

          case MessageType.NEW_MEMBER: {
            const senderText = (
              <span className="message_name">
                {message!.sender!.id === user!.uid
                  ? "You"
                  : (members.getValue(message!.sender!.id)![1] as ChatMemberMetadata).nickname}
              </span>
            );
            return (
              <div className={"notification_message"} key={message.id}>
                <p className="message_content">{senderText} has joined the chat</p>
                <div className="message_info">
                  <span className="message_timestamp">
                    {formatMessageTimeStamp(DateTypeToDate(message!.createdAt))}
                  </span>
                </div>
              </div>
            );
            break;
          }

          case MessageType.REMOVE_MEMBER: {
            const senderText = (
              <span className="message_name">
                {message!.sender!.id === user!.uid
                  ? "You"
                  : (members.getValue(message!.sender!.id)![1] as ChatMemberMetadata).nickname}
              </span>
            );
            const receiverText: ReactElement | string =
              message!.receiver!.id === user!.uid ? (
                "you"
              ) : (
                <span className="message_name">
                  {(members.getValue(message!.receiver!.id)![1] as ChatMemberMetadata).nickname}
                </span>
              );
            return (
              <div className={"notification_message"} key={message.id}>
                <p className="message_content">
                  {message.sender!.id !== message.receiver!.id ? (
                    <>
                      {senderText} has removed {receiverText} from the chat
                    </>
                  ) : (
                    <>{senderText} has leaved the chat</>
                  )}
                </p>
                <div className="message_info">
                  <span className="message_timestamp">
                    {formatMessageTimeStamp(DateTypeToDate(message!.createdAt))}
                  </span>
                </div>
              </div>
            );
          }

          case MessageType.CHANGE_NICKNAME: {
            const senderText = (
              <span className="message_name">
                {message!.sender!.id === user!.uid
                  ? "You"
                  : (members.getValue(message!.sender!.id)![1] as ChatMemberMetadata).nickname}
              </span>
            );
            const receiverText: ReactElement | string =
              message!.receiver!.id === user!.uid ? (
                "your nickname"
              ) : (
                <>
                  nickname{" "}
                  <span className="message_name">
                    {message.sender!.id === message.receiver!.id
                      ? ""
                      : "of " + (members.getValue(message!.receiver!.id)![0] as UserEntity).name}
                  </span>
                </>
              );
            const nicknameText = <span className="message_name">{message.content}</span>;

            return (
              <div className={"notification_message"} key={message.id}>
                <p className="message_content">
                  {senderText} has changed {receiverText} to {nicknameText}
                </p>
                <div className="message_info">
                  <span className="message_timestamp">
                    {formatMessageTimeStamp(DateTypeToDate(message!.createdAt))}
                  </span>
                </div>
              </div>
            );
            break;
          }

          case MessageType.CHANGE_ROLE: {
            const senderText = (
              <span className="message_name">
                {message!.sender!.id === user!.uid
                  ? "You"
                  : (members.getValue(message!.sender!.id)![1] as ChatMemberMetadata).nickname}
              </span>
            );
            const receiverText: ReactElement | string =
              message!.receiver!.id === user!.uid ? (
                "your role"
              ) : (
                <>
                  role{" "}
                  <span className="message_name">
                    {message.sender!.id === message.receiver!.id
                      ? ""
                      : "of " + (members.getValue(message!.receiver!.id)![0] as UserEntity).name}
                  </span>
                </>
              );
            const newRole = <span className="message_name">{message.content}</span>;

            return (
              <div className={"notification_message"} key={message.id}>
                <p className="message_content">
                  {senderText} has changed {receiverText} to {newRole}
                </p>
                <div className="message_info">
                  <span className="message_timestamp">
                    {formatMessageTimeStamp(DateTypeToDate(message!.createdAt))}
                  </span>
                </div>
              </div>
            );
            break;
          }

          default:
            return (
              <div
                key={message.id}
                className={"chat_message " + (msgId === user.uid && "chat_receiver")}
              >
                <p className="message_content">{message.content}</p>
                <div className="message_info">
                  <span className="message_name">
                    {msgId &&
                      members?.has(msgId) &&
                      (members?.get(msgId)![1] as ChatMemberMetadata)?.nickname}
                  </span>
                  <span className="message_timestamp">
                    {message?.createdAt &&
                      formatMessageTimeStamp(DateTypeToDate(message.createdAt))}
                  </span>
                </div>
              </div>
            );
            break;
        }
      })}
    </div>
  );
};
function MainChat({ roomEntity }: { roomEntity: ChatRoomWithFullData | null }) {
  const roomId: string = useRouter().query.roomId as string;

  const [messageInput, setMessageInput] = useState("");
  const chatBodyRef: React.RefObject<HTMLHeadingElement> = useRef<HTMLHeadingElement>(null);
  const user: User | null = useSelector<RootState, User | null>((state) => state.userInfo.value);

  // chat settings
  const [openChatSettings, setOpenChatSettings] = React.useState(false);

  const sendMessage = async (e: any) => {
    e.preventDefault();
    const msg = messageInput.trim();
    if (msg == "") return;

    try {
      if (!user?.userRef) throw new Error("User not found");
      if (!roomEntity?.ref) throw new Error("Room not found");

      await runTransaction(firestoreDb, async (transaction) => {
        // create new message
        const newMessageEntity = new MessageEntity({
          sender: user?.userRef,
          receiver: roomEntity?.ref,
          room: roomEntity?.ref,
          content: msg,
          type: MessageType.TEXT_MESSAGE,
          createdAt: serverTimestamp()
        });

        await newMessageEntity.create(collection(firestoreDb, "messages"));
        await newMessageEntity.get();

        // update user data
        const userEntity = new UserEntity({ ref: user?.userRef });
        await userEntity.get();

        const newRoomEntity = new ChatRoomEntity({ ref: roomEntity?.ref });
        await newRoomEntity.get();

        newRoomEntity.newMessage(userEntity, newMessageEntity);

        await userEntity.save();
        await newRoomEntity.save();
      });
    } catch (err) {
      console.log(err);
      toast.error("Some errors occured when sending message!");
    }
    setMessageInput("");
  };

  useEffect(() => {
    console.log(roomEntity);
  }, [roomEntity]);

  return (
    <div className="chat_container">
      <div className="main_chat">
        <MainChatHeader
          roomId={roomId}
          roomName={roomEntity?.roomName}
          openChatSettings={openChatSettings}
          setOpenChatSettings={setOpenChatSettings}
        />
        <MainChatBody
          user={user}
          messages={roomEntity?.messages || []}
          members={roomEntity?.members || new MapType()}
          roomId={roomId}
        />
        <div className="chat_footer">
          <IconButton size="small">
            <AddReactionIcon />
          </IconButton>
          <IconButton size="small">
            <ImageIcon />
          </IconButton>
          <form onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Type your message here ..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>

          <IconButton size="small">
            <MicIcon />
          </IconButton>
        </div>
      </div>
      {openChatSettings && <ChatSettings user={user} roomEntity={roomEntity} />}
    </div>
  );
}

export default MainChat;
