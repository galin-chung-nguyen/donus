import { Timestamp } from "firebase/firestore";
import { DateType } from "../types/date.type";

export function DateTypeToDate(t: any) {
  if (t instanceof Date) return t;
  return new Date(((t?.seconds || 0) + (t?.nanoseconds || 0) * 10 ** -9) * 1000);
}
