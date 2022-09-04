import { doc, DocumentReference, DocumentSnapshot, getDoc, onSnapshot } from "firebase/firestore";
import _, { Omit } from "lodash";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { MapType } from "src/app/types/map.type";
import { ReduxState } from "src/app/types/reduxState";
import { ReferenceString } from "src/app/types/ref-string.type";
import { DateTypeToDate } from "src/app/utils/date.type";
import firestoreDb from "src/firebase/firebase-config";
import { UserEntity } from "src/user/aggregates/user.aggregate";
import { User } from "src/user/types/user-redux-state";
import { ChatMemberMetadata, ChatRoomEntity } from "../aggregates/chat-room.aggregate";
import { MessageEntity } from "../aggregates/message.aggregate";

export type MemberInRoom = Array<UserEntity | ChatMemberMetadata>;
export interface ChatRoomWithFullData
  extends Omit<ChatRoomEntity, "messages" | "members" | "creater"> {
  messages?: Array<MessageEntity>;
  members?: MapType<ReferenceString, MemberInRoom>;
  creater?: UserEntity;
}

export default function useChatRoomData(user: User | null, roomId: string) {
  const [roomEntity, setRoomEntity] = useState<ChatRoomWithFullData | null>(null);

  const fetchRoomFullData = async (roomEntity: ChatRoomEntity): Promise<ChatRoomWithFullData> => {
    const result: ChatRoomWithFullData = _.omit(roomEntity, ["messages", "members", "creater"]);
    result.messages = new Array<MessageEntity>();
    result.members = new MapType<ReferenceString, MemberInRoom>();

    // fetch all messages
    if (roomEntity.messages) {
      for (const [msgRefString, msgRef] of Object.entries(roomEntity.messages)) {
        const curMessageEntity: MessageEntity = new MessageEntity({ ref: msgRef });
        await curMessageEntity.get();
        result.messages.push(curMessageEntity);
      }
      result.messages.sort((message1: MessageEntity, message2: MessageEntity) => {
        return (
          DateTypeToDate(message1.createdAt).getTime() -
          DateTypeToDate(message2.createdAt).getTime()
        );
      });
    }

    // fetch all members
    if (roomEntity.members) {
      for (const [memRefString, memMetadata] of Object.entries(roomEntity.members)) {
        const curMemEntity: UserEntity = new UserEntity({
          ref: doc(firestoreDb, "users", memRefString)
        });
        await curMemEntity.get();
        result.members.setValue(memRefString, [curMemEntity, memMetadata]);
      }
    }
    // fetch creater
    result.creater = new UserEntity({ ref: roomEntity.creater });
    await result.creater.get();

    return result as ChatRoomWithFullData;
  };
  useEffect(() => {
    // get room entity
    console.log(roomId);

    if (!user || !roomId) {
      setRoomEntity(null);
      return;
    }

    let roomSnapshotUnsub = () => {
      /*unsubscribed*/
    };

    const unsub = () => {
      roomSnapshotUnsub();
    };

    (async () => {
      const userEntity = new UserEntity({ ref: user.userRef });
      await userEntity.get();

      if (
        !userEntity?.personalChatRooms?.hasValue(roomId) &&
        !userEntity?.groupChatRooms?.hasValue(roomId)
      ) {
        throw new Error("Room Id is not valid ");
      }

      const roomRef: DocumentReference = doc(firestoreDb, "rooms", roomId);
      const newRoomEntity = new ChatRoomEntity({ ref: roomRef });

      if (!(await getDoc(roomRef)).exists()) {
        throw new Error("Room Id is not valid");
      }

      await newRoomEntity.get();

      setRoomEntity(await fetchRoomFullData(newRoomEntity));

      if (newRoomEntity.ref) {
        roomSnapshotUnsub = onSnapshot(
          newRoomEntity.ref,
          async (roomDataSnapshot: DocumentSnapshot) => {
            if (!roomDataSnapshot.exists()) {
              // setRoomEntity(null);
            } else {
              const newRoomEntitySnapshot: ChatRoomEntity = new ChatRoomEntity({
                ref: newRoomEntity.ref
              });
              Object.assign(newRoomEntitySnapshot, roomDataSnapshot.data());
              setRoomEntity(await fetchRoomFullData(newRoomEntitySnapshot));
            }
          }
        );
      }
    })().catch((err) => {
      setRoomEntity(null);
      toast.error(err?.message ? err.message : err);
    });

    return unsub;
  }, [roomId, user]);

  return { roomEntity };
}
