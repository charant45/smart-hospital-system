import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
  onSnapshot,
} from "firebase/firestore"
import { db } from "./db"

// Generate queue number
const getNextQueueNumber = async (doctorId, date) => {
  const q = query(
    collection(db, "appointments"),
    where("doctorId", "==", doctorId),
    where("date", "==", date),
    where("status", "==", "waiting")
  )

  const snapshot = await getDocs(q)
  return snapshot.size + 1
}

// Book appointment
export const bookAppointment = async ({
  patientId,
  patientEmail,
  doctorId,
  doctorName,
  date,
}) => {
  const queueNumber = await getNextQueueNumber(doctorId, date)

  return addDoc(collection(db, "appointments"), {
    patientId,
    patientEmail,
    doctorId,
    doctorName,
    date,
    queueNumber,
    status: "waiting",
    createdAt: serverTimestamp(),
  })
}

// Realtime queue listener
export const listenToQueue = (doctorId, date, callback) => {
  const q = query(
    collection(db, "appointments"),
    where("doctorId", "==", doctorId),
    where("date", "==", date),
    where("status", "==", "waiting"),
    orderBy("queueNumber")
  )

  return onSnapshot(q, (snapshot) => {
    const queue = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    callback(queue)
  })
}