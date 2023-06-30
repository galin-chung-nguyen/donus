import "./globals.css";
import "@/chat-room/css/ChatSettings.scss";
import "@/chat-room/css/InviteToRoom.scss";
import "@/chat-room/css/Mainchat.scss";
import "@/chat-room/css/NavigationSidebar.scss";
import "@/chat-room/css/SidebarChat.scss";
import "@/app/App.scss";
import "@/user/css/Login.scss";
import Providers from "@/app/redux/provider";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Providers>
        <Component {...pageProps} />
      </Providers>
    </>
  );
}
