import { getStorage } from "firebase/storage";
import { getFirebaseApp } from "@/firebase/config";

export function getFirebaseStorage() {
  return getStorage(getFirebaseApp());
}
