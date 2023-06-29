import React, { useState, useEffect } from "react";
import "@/chat-room/css/NavigationSidebar.scss";
import { Avatar, IconButton } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import AddIcon from "@mui/icons-material/Add";
import SidebarChat from "./SidebarChat";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
// firebase
import firebase from "firebase/compat/app";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/reduxStore";
import { User } from "@/user/types/user-redux-state";
import { addDoc, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import firestoreDb from "@/firebase/firebase-config";
import useNavigationSidebarHook, {
  RoomDataProps,
  useFetchAllRooms
} from "../hooks/NavigationSidebar.hook";
import CreateNewChatForm from "./CreateNewChat.Form";
import Link from "next/link";

function PreferencesMenu() {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggle = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [openDialog, setOpenDialog] = useState({
    logout: false
  });

  const handleToggleDialog = (dialogId: string, newState = true) => {
    const newOpenDialog: any = { ...openDialog };
    newOpenDialog[dialogId] = newState;
    setOpenDialog(newOpenDialog);
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        aria-controls={open ? "chat-utils-btn" : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        className="chat_utils_btn"
      >
        <MoreVertIcon />
      </IconButton>
      <Popper
        className="chat_utils_menu"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        placement="bottom-end"
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === "bottom" ? "right top" : "right bottom"
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem={open} id="menu-list-grow">
                  <Link href="/logout">
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        handleToggleDialog("logout");
                      }}
                    >
                      Log out
                    </MenuItem>
                  </Link>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

function NavigationSidebar({ roomId, user }: any) {
  const [open, setOpen] = useState(false);
  const { onCreateNewChatSubmit } = useNavigationSidebarHook(user);
  const rooms = useFetchAllRooms(user);

  useEffect(() => {
    console.log("List all room data:");
    console.log(rooms);
  }, [rooms]);

  return (
    <div className="NavigationSidebar">
      <div className="NavigationSidebar_header">
        <div className="NavigationSidebar_headerLeft">
          <Avatar src={user?.photoURL} />
        </div>
        <div className="NavigationSidebar_headerRight">
          <IconButton onClick={() => setOpen(true)}>
            <AddIcon />
          </IconButton>

          <IconButton>
            <ChatIcon />
          </IconButton>
          <PreferencesMenu />
        </div>
      </div>
      <div className="NavigationSidebar_search">
        <div className="NavigationSidebar_searchContainer">
          <SearchOutlined />
          <input type="text" placeholder="Search Donus" />
        </div>
      </div>
      <div className="NavigationSidebar_chats">
        {rooms.map((room: RoomDataProps) => (
          <SidebarChat key={room.roomId} {...room} />
        ))}
      </div>
      <CreateNewChatForm open={open} setOpen={setOpen} onSubmit={onCreateNewChatSubmit} />
    </div>
  );
}

export default NavigationSidebar;
