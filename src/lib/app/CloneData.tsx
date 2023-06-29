import { doc, getDoc } from "firebase/firestore";
import { useEffect } from "react";
import firestoreDb from "@/firebase/firebase-config";

export default function CloneData() {
  useEffect(() => {
    (async () => {
      const data = await getDoc(doc(firestoreDb, "rooms", "tHRnJT0RCq2xko4boMrV"));
      console.log(data);
    })();

  }, []);
  return <></>;
}
