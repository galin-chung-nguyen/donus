"use client";
import useLoadUserData from "@/app/hooks/LoadUserData";
import ChatScreen from "@/chat-room/components/ChatScreen";

export default function Logout() {
  const { firebaseUserDataLoaded } = useLoadUserData();

  return <>{firebaseUserDataLoaded && <ChatScreen />}</>;
}
