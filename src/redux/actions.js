import { SET_USER, SET_ROOM_LIST, SET_MAIN_CHAT } from './const';

let setUserInfo = (newUserInfo = null) => {
    return {
        type : SET_USER,
        payload : {
            newUserInfo : newUserInfo
        }
    }
}

let setRoomList = (newRoomList = {}) => {
    return {
        type : SET_ROOM_LIST,
        payload : {
            newRoomList : newRoomList
        }
    }
}

let setMainChat = (newMainChatInfo = {}) => {
    return {
        type : SET_MAIN_CHAT,
        payload: {
            newMainChatInfo : newMainChatInfo
        }
    }
}

export let setUserInfoAction = setUserInfo;
export let setRoomListAction = setRoomList;
export let setMainChatInfoAction = setMainChat;