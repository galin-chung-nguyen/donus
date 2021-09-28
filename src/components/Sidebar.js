import { useState, useEffect } from 'react';
import '../assets/css/Sidebar.scss';
import { Avatar, IconButton } from '@material-ui/core';
import DonutLargeIcon from '@material-ui/icons/DonutLarge';
import ChatIcon from '@material-ui/icons/Chat';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SearchOutlined from '@material-ui/icons/SearchOutlined';
import SideBarChat from './SidebarChat';

// firebase
import db from '../firebase/firebase-config';
import { useSelector, useDispatch } from 'react-redux';
import { setRoomListAction } from '../redux/actions';

function Sidebar() {

    const user = useSelector(state => state.user);
    //const rooms = useSelector(state => state.roomList);
    //const dispatch = useDispatch();

    const [rooms, setRooms] = useState([]);
    const [roomData, setRoomData] = useState({});

    useEffect(() => {
        rooms.map(roomId => {
            let unsubscribe = db.collection("rooms").doc(roomId).onSnapshot(roomSnapshot => {
                // stop listing to changes of this room
                if (!rooms.includes(roomSnapshot.id)) {
                    unsubscribe();
                } else {
                    let newRoomData = { ... roomData };
                    newRoomData[roomId] = roomSnapshot.data();
                    setRoomData(newRoomData);
                }
            }) 

            return false;
        });
    },[rooms]);

    useEffect(async () => {
        
        user.userRef.onSnapshot(userSnapshot => {
            setRooms(userSnapshot.data().chat.map(x => x.id));
        });

        return
    }, []);

    return (
        <div className="sidebar">
            <div className="sidebar__header">
                <div className="sidebar__headerLeft">
                    <Avatar src={user?.photoURL} />
                </div>
                <div className="sidebar__headerRight">
                    <IconButton>
                        <DonutLargeIcon />
                    </IconButton>

                    <IconButton>
                        <ChatIcon />
                    </IconButton>
                    <IconButton>
                        <MoreVertIcon />
                    </IconButton>
                </div>
            </div>
            <div className="sidebar__search">
                <div className="sidebar__searchContainer">
                    <SearchOutlined />
                    <input type="text" placeholder='Search or start new chat' />
                </div>
            </div>
            <div className="sidebar__chats">
                <SideBarChat addNewChat={true} />
                {rooms.map(roomId => (
                    <SideBarChat key={roomId} id={roomId} name={roomData[roomId] ? roomData[roomId].name : ""} />
                ))}
            </div>
        </div>
    )
}

export default Sidebar;