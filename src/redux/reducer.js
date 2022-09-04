import { combineReducers } from 'redux';
import { SET_USER, SET_ROOM_LIST, SET_MAIN_CHAT } from './const';

let setUserInfoReducer = (state = null,action) => {
    switch(action.type){
        case SET_USER : 
            return action.payload.newUserInfo;

        default : return state;
    }
}

let setRoomsReducer = (state = {}, action) => {
    switch(action.type){
        case SET_ROOM_LIST:
            return action.payload.newRoomList;

        default: return state;
    }
}

let setMainChatReducer = (state = {}, action) => {
    switch(action.type){
        case SET_MAIN_CHAT:
            return action.payload.newMainChatInfo;

        default: return state;
    }
}
let rootReducer = combineReducers({
    user : setUserInfoReducer,
    roomList : setRoomsReducer,
    mainChat : setMainChatReducer
});

export default rootReducer;