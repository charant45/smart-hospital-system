import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
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
