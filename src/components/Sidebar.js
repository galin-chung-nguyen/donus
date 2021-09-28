import { useState, useEffect } from 'react';
import '../assets/css/Sidebar.scss';
import { Avatar, IconButton } from '@material-ui/core';
import DonutLargeIcon from '@material-ui/icons/DonutLarge';
import ChatIcon from '@material-ui/icons/Chat';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SearchOutlined from '@material-ui/icons/SearchOutlined';
import AddIcon from '@mui/icons-material/Add';
import SideBarChat from './SidebarChat';

// firebase
import db from '../firebase/firebase-config';
import firebase from "firebase";
import { useSelector, useDispatch } from 'react-redux';
import { setRoomListAction } from '../redux/actions';

const currentRoomsData = {};

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
                    delete currentRoomsData[roomId];
                    unsubscribe();
                } else {
                    currentRoomsData[roomId] = roomSnapshot.data();
                    setRoomData({...currentRoomsData});
                }
            })

            return false;
        });
    }, [rooms]);

    useEffect(async () => {

        user.userRef.onSnapshot(userSnapshot => {
            setRooms(userSnapshot.data().chat.map(x => x.id));
        });

        return
    }, []);

    const createChat = async () => {
        let roomName = prompt("Please enter name for the new chat");

        if (roomName) {
            // do something
            roomName = roomName.replace(/^\s+|\s+$/gm, '');

            if (roomName.length <= 0 || roomName.length > 100) {
                alert('Room name cannot be empty or too long!');
                return;
            }

            // create new room
            let newRoomRef = await db.collection("rooms").add({
                creater: user.userRef,
                name: roomName,
                dateCreated: firebase.firestore.FieldValue.serverTimestamp(),
                type: "group_chat"
            });

            // set current user as admin of the new room
            await newRoomRef.collection('members').add({
                memRef: user.userRef,
                role: "admin"
            });

            console.log(newRoomRef)

            // add this chat room into the chatroom list of current user
            await user.userRef.update({
                chat: firebase.firestore.FieldValue.arrayUnion(newRoomRef)
            });

            console.log('create new Room ', roomName, ' successfully!!!')
        }
    }

    useEffect(() => {
        console.log(roomData);
    },[roomData]);


    return (
        <div className="sidebar">
            <div className="sidebar__header">
                <div className="sidebar__headerLeft">
                    <Avatar src={user?.photoURL} />
                </div>
                <div className="sidebar__headerRight">
                    <IconButton onClick={createChat}>
                        <AddIcon />
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
                    <input type="text" placeholder='Search Donus' />
                </div>
            </div>
            <div className="sidebar__chats">
                {rooms.map(roomId => (
                    <SideBarChat key={roomId} id={roomId} name={roomData[roomId] ? roomData[roomId].name : ""} />
                ))}
            </div>
        </div>
    )
}

export default Sidebar;