import {
  addDoc,
  collection,
  doc,
  DocumentReference,
  DocumentSnapshot,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { MapType } from "src/app/types/map.type";
import { ReduxState } from "src/app/types/reduxState";
import firestoreDb from "src/firebase/firebase-config";
import { UserEntity, RoomMemberMetadata } from "src/user/aggregates/user.aggregate";
import { User } from "src/user/types/user-redux-state";
import {
  ChatMemberMetadata,
  ChatMemberRole,
  ChatRoomEntity,
  ChatRoomType
} from "../aggregates/chat-room.aggregate";
import { MessageEntity, MessageType } from "../aggregates/message.aggregate";
import { ReferenceString } from "src/app/types/ref-string.type";

export interface LastMessageProps {
  content?: string;
  sender?: string;
  receiver?: string;
  createdAt?: Date;
}
export interface RoomDataProps {
  roomId: ReferenceString;
  roomRef?: DocumentReference;
  roomName?: string;
  type?: ChatRoomType;
  role?: ChatMemberRole;
  lastMessage?: LastMessageProps;
  lastViewed?: Date;
}
export default function useNavigationSidebarHook(user: User | null) {
  const onCreateNewChatSubmit = async ({
    roomName,
    roomType
  }: {
    roomName: string;
    roomType: "p" | "g";
  }) => {
    if (!user) {
      return;
    }

    roomName = roomName.replace(/^\s+|\s+$/gm, "");
    if (roomName.length <= 0 || roomName.length > 100 || !["p", "g"].includes(roomType)) {
      toast.error("Some errors occured when validating form!");
      return;
    }

    try {
      await runTransaction(firestoreDb, async (transaction) => {
        const roomMembers = new MapType<ReferenceString, ChatMemberMetadata>();
        roomMembers.setValue(user.uid, {
          dateJoined: serverTimestamp(),
          role: ChatMemberRole.ADMIN,
          nickname: user.displayName
        } as ChatMemberMetadata);

        // create new room
        const newRoomEntity: ChatRoomEntity = new ChatRoomEntity({
          members: roomMembers,
          // messages: new MapType<string, DocumentReference>(),
          roomName: roomName,
          creater: user.userRef,
          createdAt: serverTimestamp(),
          type: roomType === "p" ? ChatRoomType.PERSONAL : ChatRoomType.GROUP
          // lastMessage?: DocumentReference;
        });

        await newRoomEntity.create(collection(firestoreDb, "rooms"));

        if (!newRoomEntity.ref) {
          throw new Error("Some errors occured when creating new room!");
        }
        // create a new welcome message
        const newMessageEntity = new MessageEntity({
          sender: user.userRef,
          room: newRoomEntity.ref,
          content: newRoomEntity.roomName,
          type: MessageType.CREATE_CHAT,
          createdAt: serverTimestamp()
        });

        await newMessageEntity.create(collection(firestoreDb, "messages"));

        if (!newMessageEntity.ref) {
          throw new Error("Some errors occured when creating new room!");
        }

        newRoomEntity.messages = new MapType<string, DocumentReference>();
        newRoomEntity.messages.setValue("1", newMessageEntity.ref);

        await newRoomEntity.save(transaction);

        // update user info
        const newUserEntity = new UserEntity({ ref: user.userRef });
        await newUserEntity.get();

        if (newRoomEntity.type === ChatRoomType.PERSONAL) {
          newUserEntity.personalChatRooms =
            newUserEntity.personalChatRooms || new MapType<ReferenceString, RoomMemberMetadata>();
          newUserEntity.personalChatRooms.setValue(newRoomEntity.ref.id.toString(), {
            role: ChatMemberRole.ADMIN
          } as RoomMemberMetadata);
        } else {
          newUserEntity.groupChatRooms =
            newUserEntity.groupChatRooms || new MapType<ReferenceString, RoomMemberMetadata>();
          newUserEntity.groupChatRooms.setValue(newRoomEntity.ref.id.toString(), {
            role: ChatMemberRole.ADMIN
          } as RoomMemberMetadata);
        }

        await newUserEntity.save();
      });
      toast.success("Create new chat room successfully!");
    } catch (err) {
      console.log(err);
      toast.error("Some errors occured when creating new chat room!");
    }
  };

  return { onCreateNewChatSubmit };
}

export function useFetchAllRooms(user: User | null): Array<RoomDataProps> {
  const [rooms, setRooms] = useState<Array<RoomDataProps>>([]);

  useEffect(() => {
    if (!user || !user.userRef) return;
    const userSnapshotUnsub = onSnapshot(user.userRef, async (userSnapshot: DocumentSnapshot) => {
      if (userSnapshot.exists()) {
        const newUserEntity = new UserEntity({ ref: user.userRef });
        Object.assign(newUserEntity, userSnapshot.data());

        const roomData: Array<RoomDataProps> = [];
        if (newUserEntity.personalChatRooms) {
          for (const [roomRef, roomMemberData] of Object.entries(newUserEntity.personalChatRooms)) {
            roomData.push({
              roomRef: doc(firestoreDb, "rooms", roomRef),
              lastViewed: roomMemberData?.lastViewed,
              role: roomMemberData?.role,
              type: ChatRoomType.PERSONAL,
              roomId: roomRef
            } as RoomDataProps);
          }
        }

        if (newUserEntity.groupChatRooms) {
          for (const [roomRef, roomMemberData] of Object.entries(newUserEntity.groupChatRooms)) {
            roomData.push({
              roomRef: doc(firestoreDb, "rooms", roomRef),
              lastViewed: roomMemberData?.lastViewed,
              role: roomMemberData?.role,
              type: ChatRoomType.GROUP,
              roomId: roomRef
            } as RoomDataProps);
          }
        }

        for (let i = 0; i < roomData.length; ++i) {
          const currentRoom: RoomDataProps = roomData[i];
          const roomEntity: ChatRoomEntity = new ChatRoomEntity({ ref: currentRoom.roomRef });
          await roomEntity.get();

          currentRoom.roomName = roomEntity.roomName;

          if (roomEntity.lastMessage) {
            const msgEntity: MessageEntity = new MessageEntity({ ref: roomEntity.lastMessage });
            await msgEntity.get();

            currentRoom.lastMessage = {
              content: msgEntity.content,
              ...(msgEntity.sender && {
                sender: (await getDoc(msgEntity.sender))?.data()?.name
              }),
              ...(msgEntity.receiver &&
                msgEntity.receiver.id.toString() !== roomEntity.ref?.id.toString() && {
                receiver: (await getDoc(msgEntity.receiver))?.data()?.name
              }),
              createdAt: msgEntity.createdAt
            } as LastMessageProps;
          }
        }

        setRooms(roomData);
      }
    });

    return () => {
      userSnapshotUnsub();
    };
  }, [user]);

  return rooms;
}

// useEffect(() => {
//   rooms.map((roomId) => {
//     const unsubscribe = onSnapshot(doc(firestoreDb, "rooms", roomId), (roomSnapshot) => {
//       // stop listing to changes of this room
//       if (!rooms.includes(roomSnapshot.id)) {
//         delete currentRoomsData[roomId];
//         unsubscribe();
//       } else {
//         currentRoomsData[roomId] = roomSnapshot.data();
//         setRoomData({ ...currentRoomsData });
//       }
//     });

//     return false;
//   });
// }, [rooms]);
