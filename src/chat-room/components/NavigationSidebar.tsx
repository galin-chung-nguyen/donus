import React, { useState, useEffect } from "react";
import "src/chat-room/css/NavigationSidebar.scss";
import { Avatar, IconButton } from "@material-ui/core";
import ChatIcon from "@material-ui/icons/Chat";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import SearchOutlined from "@material-ui/icons/SearchOutlined";
import AddIcon from "@mui/icons-material/Add";
import SidebarChat from "./SidebarChat";
import { Redirect } from "react-router-dom";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
// firebase
import firebase from "firebase/compat/app";
import { useSelector } from "react-redux";
import { ReduxState } from "src/app/types/reduxState";
import { User } from "src/user/types/user-redux-state";
import { addDoc, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import firestoreDb from "src/firebase/firebase-config";
import useNavigationSidebarHook, {
  RoomDataProps,
  useFetchAllRooms
} from "../hooks/NavigationSidebar.hook";
import CreateNewChatForm from "./CreateNewChat.Form";

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
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      handleToggleDialog("logout");
                    }}
                  >
                    Log out
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
      {openDialog["logout"] && <Redirect to="/logout" />}
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
