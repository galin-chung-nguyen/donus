import { useState, useEffect } from 'react';
import '../assets/css/App.scss';
import Sidebar from '../components/Sidebar';
import MainChat from './Mainchat';
import InviteToRoom from './InviteToRoom';
import Login from './Login';
import Logout from './Logout';
import {
    BrowserRouter as Router,
    Route,
    Link,
    Switch,
    Redirect,
    useLocation
} from "react-router-dom";

// redux
import { setUserInfoAction } from '../redux/actions';
import { useSelector, useDispatch } from 'react-redux';

import db, { auth } from '../firebase/firebase-config';
import firebase from "firebase";

function App() {
    const user = useSelector(state => state.user);
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                console.log('ok logged in');
                console.log(user);

                const userRef = db.collection('users').doc(user.uid);

                // update info for this user in the database

                let userInfo = await userRef.get();

                if (userInfo.exists) {
                    await userRef.update({
                        name: user.displayName,
                        avatarUrl: user.photoURL
                    });
                } else {
                    await userRef.set({
                        name: user.displayName,
                        avatarUrl: user.photoURL,
                        chat: []
                    });
                }

                // update user info in the data layer
                dispatch(setUserInfoAction({
                    ...user,
                    userRef: userRef
                }));
            } else {
                console.log('not logged in yet');
                dispatch(setUserInfoAction(null));
            }
            setLoading(false);
        });
    }, []);

    return (
        <Router>
            <div className="App">
                <Switch>
                    <Route path="/invite/:roomId">
                        <InviteToRoom />
                    </Route>
                    {!loading && (user ?
                        <div className="app_body">
                            <Route path="/app">
                                App
                            </Route>
                            <Route path="/rooms/:roomId">
                                <Sidebar />
                                <MainChat />
                            </Route>
                            <Route exact path="/logout">
                                <Logout />
                            </Route>
                        </div>
                        :
                        <Route path="*">
                            <Login />
                        </Route>
                    )}
                </Switch>
            </div>
        </Router>
    );
}

export default App;
