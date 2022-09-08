import {
  doc,
  DocumentData,
  DocumentReference,
  FieldValue,
  serverTimestamp
} from "firebase/firestore";
import { DocumentAggregate, DocumentAggregateProps } from "src/app/aggregates/base.aggregate";
import { DateType } from "src/app/types/date.type";
import { MapType } from "src/app/types/map.type";
import { ReferenceString } from "src/app/types/ref-string.type";
import firestoreDb from "src/firebase/firebase-config";
import { RoomMemberMetadata, UserEntity } from "src/user/aggregates/user.aggregate";
import { MessageEntity, MessageType } from "./message.aggregate";

export enum ChatRoomType {
  PERSONAL = "PERSONAL",
  GROUP = "GROUP"
}

export enum ChatMemberRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  MODERATOR = "MODERATOR",
  LEAVED = "LEAVED",
  REMOVED = "REMOVED"
}

export interface ChatMemberMetadata {
  dateJoined: DateType;
  role: ChatMemberRole;
  nickname: string;
}

export interface ChatRoomProps {
  members?: MapType<ReferenceString, ChatMemberMetadata>;
  messages?: MapType<string, DocumentReference>; // message order, message reference
  roomName?: string;
  creater?: DocumentReference;
  createdAt?: DateType;
  type?: ChatRoomType;
  lastMessage?: DocumentReference;
}

class ChatRoomAggregate extends DocumentAggregate implements ChatRoomProps {
  members?: MapType<ReferenceString, ChatMemberMetadata>;
  messages?: MapType<string, DocumentReference>; // message order, message reference
  roomName?: string;
  creater?: DocumentReference;
  createdAt?: DateType;
  type?: ChatRoomType;
  lastMessage?: DocumentReference;

  constructor(props: ChatRoomProps & DocumentAggregateProps) {
    super(props.ref);

    this.members = props.members;
    this.messages = props.messages;
    this.roomName = props.roomName;
    this.creater = props.creater;
    this.createdAt = props.createdAt;
    this.type = props.type;
    this.lastMessage = props.lastMessage;
  }

  DataToEntity(data: DocumentData, ref: DocumentReference): ChatRoomEntity {
    const obj = new ChatRoomEntity({ ...data });
    if (ref) obj.ref = ref as DocumentReference;
    if (obj.members)
      obj.members = new MapType<ReferenceString, ChatMemberMetadata>(
        Object.entries(obj.members).map((member) => [
          member[0] as ReferenceString,
          member[1] as ChatMemberMetadata
        ])
      );
    if (obj.messages)
      obj.messages = new MapType<string, DocumentReference>(
        Object.entries(obj.messages).map((message) => [
          message[0] as string,
          message[1] as DocumentReference
        ])
      );
    obj.roomName = obj.roomName as string;
    obj.creater = obj.creater as DocumentReference;
    if (obj.createdAt) obj.createdAt = obj.createdAt as DateType;
    if (obj.type) obj.type = obj.type as ChatRoomType;
    if (obj.lastMessage) obj.lastMessage = obj.lastMessage as DocumentReference;
    return obj;
  }

  async get() {
    // get and sync
    const ref = super.get();
    Object.assign(this, this.DataToEntity((await ref)!.data()!, this.ref!));
    return ref;
  }

  createPropertiesIfNotExist() {
    if (!this.members) this.members = new MapType<ReferenceString, ChatMemberMetadata>();
    if (!this.messages) this.messages = new MapType<string, DocumentReference>();
  }

  // @sender, @receiver and @message must be created in the firestore db first
  newMessage(sender: UserEntity, message: MessageEntity) {
    this.createPropertiesIfNotExist();
    sender.createPropertiesIfNotExist();

    // update last viewd for sender
    if (!this.members) this.members = new MapType<string, ChatMemberMetadata>();
    if (!sender.groupChatRooms) sender.groupChatRooms = new MapType<string, RoomMemberMetadata>();

    if (message.type === MessageType.LEAVE_CHAT) {
      if (this.type === ChatRoomType.PERSONAL) {
        sender.personalChatRooms!.removeValue(this.id);
      } else {
        sender.groupChatRooms!.removeValue(this.id);
      }
    } else {
      if (this.type === ChatRoomType.PERSONAL) {
        sender.personalChatRooms!.setValue(this.id, {
          lastViewed: serverTimestamp(),
          ...sender.personalChatRooms!.getValue(this.id)
        } as RoomMemberMetadata);
      } else {
        sender.groupChatRooms!.setValue(this.id, {
          lastViewed: serverTimestamp(),
          ...sender.groupChatRooms!.getValue(this.id)
        } as RoomMemberMetadata);
      }
    }

    // add the message to the current room
    this.messages!.setValue((this.messages!.size + 1).toString(), message.ref!);

    // update last message for the current room
    this.lastMessage = message.ref!;
  }

  changeNickname(sender: UserEntity, receiver: UserEntity, message: MessageEntity) {
    this.createPropertiesIfNotExist();
    sender.createPropertiesIfNotExist();
    receiver.createPropertiesIfNotExist();

    this.members!.setValue(receiver.id, {
      ...this.members!.getValue(receiver.id),
      nickname: message.content
    } as ChatMemberMetadata);

    this.newMessage(sender, message);
  }

  changeRole(sender: UserEntity, receiver: UserEntity, message: MessageEntity) {
    this.createPropertiesIfNotExist();
    sender.createPropertiesIfNotExist();
    receiver.createPropertiesIfNotExist();

    this.members!.setValue(receiver.id, {
      ...this.members!.getValue(receiver.id),
      role: message.content
    } as ChatMemberMetadata);

    if (this.type === ChatRoomType.GROUP) {
      receiver.groupChatRooms!.setValue(this.id, {
        ...receiver.groupChatRooms!.getValue(this.id),
        role: message.content
      } as RoomMemberMetadata);
    } else {
      receiver.personalChatRooms!.setValue(this.id, {
        ...receiver.personalChatRooms!.getValue(this.id),
        role: message.content
      } as RoomMemberMetadata);
    }

    this.newMessage(sender, message);
  }

  userLeaveChat(sender: UserEntity, message: MessageEntity) {
    this.createPropertiesIfNotExist();
    sender.createPropertiesIfNotExist();

    if (
      !this.members?.hasValue(sender.id) ||
      (!sender.groupChatRooms?.hasValue(this.id) && !sender.personalChatRooms?.hasValue(this.id))
    ) {
      throw new Error("User #" + sender.id + " has not joined the chat yet");
    }

    this.members!.setValue(sender.id, {
      ...this.members!.getValue(sender.id),
      role: ChatMemberRole.LEAVED
    } as ChatMemberMetadata);

    if (this.type === ChatRoomType.GROUP) {
      sender.groupChatRooms?.removeValue(this.id);
    } else {
      sender.personalChatRooms?.removeValue(this.id);
    }

    this.newMessage(sender, message);
  }

  removeMember(sender: UserEntity, receiver: UserEntity, message: MessageEntity) {
    this.createPropertiesIfNotExist();
    sender.createPropertiesIfNotExist();
    receiver.createPropertiesIfNotExist();

    if (
      !this.members?.hasValue(receiver.id) ||
      (!receiver.groupChatRooms?.hasValue(this.id) &&
        !receiver.personalChatRooms?.hasValue(this.id))
    ) {
      throw new Error("User #" + receiver.id + " has not joined the chat yet");
    }

    this.members!.setValue(receiver.id, {
      ...this.members!.getValue(receiver.id),
      role: ChatMemberRole.REMOVED
    } as ChatMemberMetadata);

    if (this.type === ChatRoomType.GROUP) {
      receiver.groupChatRooms?.removeValue(this.id);
    } else {
      receiver.personalChatRooms?.removeValue(this.id);
    }

    this.newMessage(sender, message);
  }

  joinRoom(sender: UserEntity, message: MessageEntity) {
    this.createPropertiesIfNotExist();
    sender.createPropertiesIfNotExist();

    if (
      this.members?.hasValue(sender.id) &&
      ![ChatMemberRole.LEAVED, ChatMemberRole.REMOVED].includes(
        this.members.getValue(sender.id)!.role!
      )
    ) {
      throw new Error("You have already joined this chat room");
    }

    if (this.type === ChatRoomType.GROUP) {
      sender.groupChatRooms!.setValue(this.id, {
        role: ChatMemberRole.MEMBER
      } as RoomMemberMetadata);
    } else {
      if (
        this.members &&
        this.members.size >= 2 &&
        (!this.members.hasValue(sender.id) ||
          ![ChatMemberRole.LEAVED, ChatMemberRole.REMOVED].includes(
            this.members.getValue(sender.id)!.role!
          ))
      ) {
        throw new Error("This room is already full");
      }
      if (!this.members || this.members.size <= 0) {
        throw new Error("There is no one in this room");
      }
      sender.personalChatRooms!.setValue(this.id, {
        friendRef: doc(firestoreDb, "users", Array.from(this.members!.entries())![0]![0]),
        role: ChatMemberRole.ADMIN
      } as RoomMemberMetadata);
    }

    this.members?.setValue(sender.id, {
      dateJoined: serverTimestamp(),
      role: this.type === ChatRoomType.GROUP ? ChatMemberRole.MEMBER : ChatMemberRole.ADMIN,
      nickname: sender.name
    } as ChatMemberMetadata);

    this.newMessage(sender, message);
  }
}

export class ChatRoomEntity extends ChatRoomAggregate {}
