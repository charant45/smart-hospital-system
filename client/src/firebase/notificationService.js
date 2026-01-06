import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore"
import { db } from "./db"

// Create notification
export const createNotification = async ({
  userId,
  message,
  appointmentId,
}) => {
  await addDoc(collection(db, "notifications"), {
    userId,
    message,
    appointmentId,
    read: false,
    createdAt: serverTimestamp(),
  })
}

// Listen to user notifications
export const listenToNotifications = (userId, callback) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId)
  )

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    callback(notifications)
  })
}

// Mark notification as read
export const markAsRead = async (id) => {
  await updateDoc(doc(db, "notifications", id), {
    read: true,
  })
}
