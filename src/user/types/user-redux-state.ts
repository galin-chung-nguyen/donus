import { DocumentReference } from "firebase/firestore";
import { UserEntity } from "../aggregates/user.aggregate";

export interface User {
  uid: string;
  userRef: DocumentReference;
  userInfo: UserEntity;
  displayName: string;
  photoURL: string;
  accessToken: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: any;
}
