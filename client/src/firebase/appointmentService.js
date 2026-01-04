import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
  limit,
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

// Call next patient
export const callNextPatient = async (doctorId, date) => {
  // 1️⃣ Complete current in-progress
  const inProgressQuery = query(
    collection(db, "appointments"),
    where("doctorId", "==", doctorId),
    where("date", "==", date),
    where("status", "==", "in-progress")
  )

  const inProgressSnap = await getDocs(inProgressQuery)
  inProgressSnap.forEach(async (docSnap) => {
    await updateDoc(doc(db, "appointments", docSnap.id), {
      status: "completed",
    })
  })

  // 2️⃣ Move next waiting → in-progress
  const waitingQuery = query(
    collection(db, "appointments"),
    where("doctorId", "==", doctorId),
    where("date", "==", date),
    where("status", "==", "waiting"),
    orderBy("queueNumber"),
    limit(1)
  )

  const waitingSnap = await getDocs(waitingQuery)

  if (!waitingSnap.empty) {
    const nextPatient = waitingSnap.docs[0]
    await updateDoc(doc(db, "appointments", nextPatient.id), {
      status: "in-progress",
    })
  }
}