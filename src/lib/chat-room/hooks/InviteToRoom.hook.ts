import { doc, DocumentReference, DocumentSnapshot, getDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import firestoreDb from "@/firebase/firebase-config";
import { User } from "@/user/types/user-redux-state";
import { ChatRoomEntity } from "../aggregates/chat-room.aggregate";

export default function useChatRoomEntity(roomId: string) {
  const [roomEntity, setRoomEntity] = useState<ChatRoomEntity | null>(null);

  useEffect(() => {
    // get room entity
    if (!roomId) {
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
      const roomRef: DocumentReference = doc(firestoreDb, "rooms", roomId);
      const newRoomEntity = new ChatRoomEntity({ ref: roomRef });

      if (!(await getDoc(roomRef)).exists()) {
        throw new Error("Room Id is not valid");
      }

      await newRoomEntity.get();

      setRoomEntity(newRoomEntity);

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
              setRoomEntity(newRoomEntity);
            }
          }
        );
      }
    })().catch((err) => {
      setRoomEntity(null);
      toast.error(err?.message ? err.message : err);
    });

    return unsub;
  }, [roomId]);

  return { roomEntity };
}
