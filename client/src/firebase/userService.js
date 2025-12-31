import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "./db"

// Save user role
export const saveUserRole = async (uid, data) => {
  await setDoc(doc(db, "users", uid), data)
}

// Get user role
export const getUserRole = async (uid) => {
  const snap = await getDoc(doc(db, "users", uid))
  return snap.exists() ? snap.data() : null
}
