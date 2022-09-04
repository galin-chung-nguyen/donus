import { DocumentData, DocumentReference } from "firebase/firestore";
import _ from "lodash";
import { DocumentAggregate, DocumentAggregateProps } from "src/app/aggregates/base.aggregate";
import { DateType } from "src/app/types/date.type";
import { MapType } from "src/app/types/map.type";
import { ReferenceString } from "src/app/types/ref-string.type";
import { ChatMemberRole } from "src/chat-room/aggregates/chat-room.aggregate";

export interface RoomMemberMetadata {
  friendRef?: DocumentReference; // in case this is a personal chat
  lastViewed?: DateType;
  role?: ChatMemberRole;
}

enum FriendRelationship {
  FRIEND = "FRIEND",
  CLOSE_FRIEND = "CLOSE_FRIEND",
  COUPLE = "COUPLE",
  FAMILY = "FAMILY",
  OTHER = "OTHER"
}

export interface FriendshipMetadata {
  personalChatRoomRef: DocumentReference;
  createdAt: DateType;
  relationship: FriendRelationship;
}

interface UserProps {
  avatarUrl?: string;
  name?: string;
  personalChatRooms?: MapType<ReferenceString, RoomMemberMetadata>; // room ref, friend ref
  groupChatRooms?: MapType<ReferenceString, RoomMemberMetadata>;
  friends?: MapType<ReferenceString, FriendshipMetadata>; // friend ref, personal chat room ref
}

class UserAggregate extends DocumentAggregate implements UserProps {
  avatarUrl?: string;
  name?: string;
  personalChatRooms?: MapType<ReferenceString, RoomMemberMetadata>;
  groupChatRooms?: MapType<ReferenceString, RoomMemberMetadata>;
  friends?: MapType<ReferenceString, FriendshipMetadata>; // friend ref, personal chat room ref

  constructor(props: UserProps & DocumentAggregateProps) {
    super(props.ref);

    this.avatarUrl = props.avatarUrl;
    this.name = props.name;
    this.personalChatRooms = props.personalChatRooms;
    this.groupChatRooms = props.groupChatRooms;
    this.friends = props.friends;
  }

  DataToEntity(data: DocumentData, ref: DocumentReference): UserEntity {
    const obj = new UserEntity({ ...data });
    if (ref) obj.ref = ref as DocumentReference;
    if (obj.personalChatRooms)
      obj.personalChatRooms = new MapType<ReferenceString, RoomMemberMetadata>(
        Object.entries(obj.personalChatRooms).map((room) => [
          room[0] as ReferenceString,
          room[1] as RoomMemberMetadata
        ])
      );
    if (obj.groupChatRooms)
      obj.groupChatRooms = new MapType<ReferenceString, RoomMemberMetadata>(
        Object.entries(obj.groupChatRooms).map((room) => [
          room[0] as ReferenceString,
          room[1] as RoomMemberMetadata
        ])
      );
    if (obj.friends)
      obj.friends = new MapType<ReferenceString, FriendshipMetadata>(Object.entries(obj.friends));
    return obj;
  }

  async get() {
    // get and sync
    const ref = super.get();
    Object.assign(this, this.DataToEntity((await ref)!.data()!, this.ref!));
    return ref;
  }

  createPropertiesIfNotExist() {
    if (!this.personalChatRooms) this.personalChatRooms = new MapType<string, RoomMemberMetadata>();
    if (!this.groupChatRooms) this.groupChatRooms = new MapType<string, RoomMemberMetadata>();
  }
}

export class UserEntity extends UserAggregate {}
