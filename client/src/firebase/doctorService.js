import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore"
import { db } from "./db"

// Fetch all doctors
export const getDoctors = async () => {
  const q = query(
    collection(db, "users"),
    where("role", "==", "doctor")
  )

  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}
