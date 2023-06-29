// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
"use client";
import { useState, useEffect } from "react";
// redux
import { useDispatch } from "react-redux";
import firestoreDb, { firebaseAuth } from "@/firebase/firebase-config";
import { setUserInfoAction } from "@/user/redux/actions";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, doc, DocumentReference, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { FriendshipMetadata, UserEntity } from "@/user/aggregates/user.aggregate";
import { MapType } from "@/app/types/map.type";
import { ReferenceString } from "@/app/types/ref-string.type";
import { ChatMemberMetadata } from "@/chat-room/aggregates/chat-room.aggregate";
import { setUserInfo } from "@/user/redux/reducer";

export default function useLoadUserData() {
  const [user, loading, err] = useAuthState(firebaseAuth);
  const [firebaseUserDataLoaded, setFirebaseUserDataLoaded] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (loading) return;
    (async () => {
      if (user) {
        const userRef = doc(firestoreDb, "users", user.uid);

        // sync user's info into cloud store
        const userInfo = await getDoc(userRef);
        const userEntity = new UserEntity({
          name: user.displayName as string,
          avatarUrl: user.photoURL as string,
          ref: userRef
        });

        if (!userInfo.exists()) {
          userEntity.personalChatRooms = new MapType<ReferenceString, ChatMemberMetadata>();
          userEntity.groupChatRooms = new MapType<ReferenceString, ChatMemberMetadata>();
          userEntity.friends = new MapType<ReferenceString, FriendshipMetadata>();
          await userEntity.create(collection(firestoreDb, "users"));
        } else {
          await userEntity.save();
        }

        await userEntity.get();

        // update user info into redux
        dispatch(
          setUserInfo({
            newUserInfo: {
              ...user,
              userRef: userRef,
              userInfo: userEntity
            } as User
          })
        );
      } else {
        dispatch(
          setUserInfoAction({
            newUserInfo: null
          })
        );
      }

      setFirebaseUserDataLoaded(true);
    })();
  }, [user, loading]);

  return { firebaseUserDataLoaded };
}
