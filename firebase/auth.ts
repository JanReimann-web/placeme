import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { getFirebaseApp } from "@/firebase/config";

let googleProvider: GoogleAuthProvider | null = null;

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getGoogleProvider() {
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: "select_account" });
  }

  return googleProvider;
}
