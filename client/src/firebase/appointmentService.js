import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore"
import { db } from "./db"
import { createNotification } from "./notificationService"

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
  try {
    // Validate required fields
    if (!patientId || !patientEmail || !doctorId || !doctorName || !date) {
      throw new Error("Missing required fields for appointment booking")
    }

    console.log("Getting queue number for doctor:", doctorId, "date:", date)
    const queueNumber = await getNextQueueNumber(doctorId, date)
    console.log("Queue number:", queueNumber)

    const appointmentData = {
      patientId,
      patientEmail,
      doctorId,
      doctorName,
      date,
      queueNumber,
      status: "waiting",
      createdAt: serverTimestamp(),
    }

    console.log("Creating appointment with data:", appointmentData)
    const docRef = await addDoc(collection(db, "appointments"), appointmentData)
    console.log("Appointment created with ID:", docRef.id)
    
    return docRef
  } catch (error) {
    console.error("Error in bookAppointment:", error)
    throw error
  }
}

// Get a patient's appointments for a given date (optional doctorName filter, case-insensitive)
export const getPatientAppointmentsByDoctorAndDate = async (
  patientId,
  date,
  doctorName
) => {
  try {
    if (!patientId || !date) {
      throw new Error("Missing patientId or date")
    }

    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", patientId),
      where("date", "==", date)
    )

    const snapshot = await getDocs(q)
    const lowerDoctor = doctorName ? doctorName.trim().toLowerCase() : ""

    const results = snapshot.docs
      .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
      .filter((appt) =>
        lowerDoctor
          ? (appt.doctorName || "").toLowerCase().includes(lowerDoctor)
          : true
      )
      .sort((a, b) => (a.queueNumber || 0) - (b.queueNumber || 0))

    return results
  } catch (error) {
    console.error("Error fetching patient appointments:", error)
    throw error
  }
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

// Listen to a specific patient's queue with doctor and date filters
export const listenToPatientQueue = (
  patientId,
  doctorName,
  date,
  callback
) => {
  const q = query(
    collection(db, "appointments"),
    where("patientId", "==", patientId),
    where("doctorName", "==", doctorName),
    where("date", "==", date),
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
  // 1️ Complete current in-progress
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

  // 2️ Move next waiting → in-progress
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

    //  Notify patient
    await createNotification({
      userId: nextPatient.data().patientId,
      appointmentId: nextPatient.id,
      message: "Your turn! Please proceed to the doctor.",
    })
  }
}

// Cancel appointment
export const cancelAppointment = async (appointmentId) => {
  await updateDoc(doc(db, "appointments", appointmentId), {
    status: "cancelled",
  })
}

// Reschedule appointment (change date)
export const rescheduleAppointment = async (appointmentId, newDate) => {
  await updateDoc(doc(db, "appointments", appointmentId), {
    date: newDate,
    status: "waiting",
  })
}

// Permanently delete an appointment
export const deleteAppointment = async (appointmentId) => {
  await deleteDoc(doc(db, "appointments", appointmentId))
}

// Listen to patient appointments
export const listenToPatientAppointments = (patientId, callback) => {
  const q = query(
    collection(db, "appointments"),
    where("patientId", "==", patientId)
  )

  return onSnapshot(q, (snapshot) => {
    const appointments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    callback(appointments)
  })
}