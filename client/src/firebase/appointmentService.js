import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  getDoc,
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
// Note: doctorName matching is case-insensitive and partial match
export const listenToPatientQueue = (
  patientId,
  doctorName,
  date,
  callback
) => {
  if (!patientId || !date) {
    console.warn("listenToPatientQueue: Missing patientId or date")
    callback([])
    return () => {}
  }

  try {
    // Fetch all appointments for patient on this date
    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", patientId),
      where("date", "==", date)
    )

    return onSnapshot(
      q,
      (snapshot) => {
        const lowerDoctorName = doctorName ? doctorName.trim().toLowerCase() : ""
        
        // Filter by doctor name (case-insensitive partial match) and sort by queue number
        const queue = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((appt) => {
            if (!lowerDoctorName) return true
            const apptDoctorName = (appt.doctorName || "").toLowerCase()
            return apptDoctorName.includes(lowerDoctorName) || lowerDoctorName.includes(apptDoctorName)
          })
          .sort((a, b) => (a.queueNumber || 0) - (b.queueNumber || 0))
        
        callback(queue)
      },
      (error) => {
        console.error("Error in listenToPatientQueue:", error)
        callback([])
      }
    )
  } catch (error) {
    console.error("Error setting up patient queue listener:", error)
    callback([])
    return () => {}
  }
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
  if (!appointmentId) {
    throw new Error("Appointment ID is required")
  }

  try {
    const appointmentRef = doc(db, "appointments", appointmentId)
    
    // Check if appointment exists and can be cancelled
    const appointmentDoc = await getDoc(appointmentRef)
    
    if (!appointmentDoc.exists()) {
      throw new Error("Appointment not found")
    }

    const appointmentData = appointmentDoc.data()
    
    // Only allow cancelling if status is waiting
    if (appointmentData.status !== "waiting") {
      throw new Error(`Cannot cancel appointment with status: ${appointmentData.status}. Only waiting appointments can be cancelled.`)
    }

    await updateDoc(appointmentRef, {
      status: "cancelled",
      cancelledAt: serverTimestamp(),
    })

    // Create notification for cancellation
    if (appointmentData.patientId) {
      await createNotification({
        userId: appointmentData.patientId,
        appointmentId: appointmentId,
        message: `Your appointment with ${appointmentData.doctorName} on ${appointmentData.date} has been cancelled.`,
      })
    }
  } catch (error) {
    console.error("Error cancelling appointment:", error)
    throw error
  }
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

// Listen to a doctor's appointments for a specific date (all statuses)
export const listenToDoctorAppointments = (doctorId, date, callback) => {
  if (!doctorId || !date) {
    console.warn("listenToDoctorAppointments: Missing doctorId or date")
    callback([])
    return () => {}
  }

  try {
    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", doctorId),
      where("date", "==", date),
      orderBy("queueNumber")
    )

    return onSnapshot(
      q,
      (snapshot) => {
        const appointments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        callback(appointments)
      },
      (error) => {
        console.error("Error in listenToDoctorAppointments:", error)
        // If it's an index error, still return empty array but log it
        if (error.code === "failed-precondition") {
          console.error("Firestore index required for appointments query")
        }
        callback([])
      }
    )
  } catch (error) {
    console.error("Error setting up doctor appointments listener:", error)
    callback([])
    return () => {}
  }
}