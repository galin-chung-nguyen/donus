// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

import { useState, useEffect } from "react";
import "src/app/App.scss";
import Login from "src/user/components/Login";
import Logout from "src/user/components/Logout";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
// redux
import { useDispatch } from "react-redux";
import firestoreDb, { firebaseAuth } from "src/firebase/firebase-config";
import { setUserInfoAction } from "src/user/redux/actions";
import InviteToRoom from "src/chat-room/components/InviteToRoom";
import { useAuthState } from "react-firebase-hooks/auth";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import { collection, doc, DocumentReference, getDoc, setDoc, updateDoc } from "firebase/firestore";
import ChatScreen from "src/chat-room/components/ChatScreen";
import { FriendshipMetadata, UserEntity } from "src/user/aggregates/user.aggregate";
import { MapType } from "./types/map.type";
import { ReferenceString } from "./types/ref-string.type";
import { Toaster } from "react-hot-toast";
import { ChatMemberMetadata } from "src/chat-room/aggregates/chat-room.aggregate";

function App() {
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
          setUserInfoAction({
            ...user,
            userRef: userRef,
            userInfo: userEntity
          })
        );
      } else {
        dispatch(setUserInfoAction(null));
      }

      setFirebaseUserDataLoaded(true);
    })();
  }, [user, loading]);

  return (
    <Router>
      <div className="App">
        <Switch>
          {firebaseUserDataLoaded && (
            <>
              <PrivateRoute path="/invite/:roomId" component={InviteToRoom} exact />
              <PrivateRoute exact path="/" component={ChatScreen} />
              <PrivateRoute exact path="/m/:roomId" component={ChatScreen} />
              <PrivateRoute exact path="/logout" component={Logout} />
              <PublicRoute restricted path="/sign-in" component={Login} />
            </>
          )}
        </Switch>
        <Toaster position="bottom-left" reverseOrder={false} />
      </div>
    </Router>
  );
}

export default App;
