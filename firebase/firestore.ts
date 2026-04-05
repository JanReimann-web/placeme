import { getFirestore } from "firebase/firestore";
import { getFirebaseApp } from "@/firebase/config";

export function getFirestoreDb() {
  return getFirestore(getFirebaseApp());
}
