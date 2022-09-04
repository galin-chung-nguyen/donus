import { DocumentData, DocumentReference, FieldValue } from "firebase/firestore";
import { DocumentAggregate, DocumentAggregateProps } from "src/app/aggregates/base.aggregate";
import { DateType } from "src/app/types/date.type";

export enum MessageType {
  NEW_MEMBER = "NEW_MEMBER",
  REMOVE_MEMBER = "REMOVE_MEMBER",
  CHANGE_ROLE = "CHANGE_ROLE",
  TEXT_MESSAGE = "TEXT_MESSAGE",
  CREATE_CHAT = "CREATE_CHAT",
  CHANGE_NICKNAME = "CHANGE_NICKNAME",
  LEAVE_CHAT = "LEAVE_CHAT"
}

interface MessageProps {
  sender?: DocumentReference;
  receiver?: DocumentReference; // = group or a specific member
  room?: DocumentReference; // chat room reference
  content?: string;
  type?: MessageType;
  createdAt?: DateType;
}

class MessageAggregate extends DocumentAggregate implements MessageProps {
  sender?: DocumentReference;
  receiver?: DocumentReference; // = group or a specific member
  room?: DocumentReference; // chat room reference
  content?: string;
  type?: MessageType;
  createdAt?: DateType;

  constructor(props: MessageProps & DocumentAggregateProps) {
    super(props.ref);

    this.sender = props.sender;
    this.receiver = props.receiver;
    this.room = props.room;
    this.content = props.content;
    this.type = props.type;
    this.createdAt = props.createdAt;
  }

  DataToEntity(data: DocumentData, ref: DocumentReference): MessageEntity {
    const obj = new MessageEntity({ ...data });
    if (ref) obj.ref = ref as DocumentReference;
    if (obj.sender) obj.sender = obj.sender as DocumentReference;
    if (obj.receiver) obj.receiver = obj.receiver as DocumentReference;
    if (obj.room) obj.room = obj.room as DocumentReference;
    if (obj.content) obj.content = obj.content as string;
    if (obj.type) obj.type = obj.type as MessageType;
    if (obj.createdAt) obj.createdAt = obj.createdAt as DateType;
    return obj;
  }

  async get() {
    // get and sync
    const ref = super.get();
    Object.assign(this, this.DataToEntity((await ref)!.data()!, this.ref!));
    return ref;
  }
}

export class MessageEntity extends MessageAggregate {}
