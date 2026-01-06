import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import {
  listenToPatientAppointments,
  cancelAppointment,
  rescheduleAppointment,
} from "../../firebase/appointmentService"

function MyAppointments() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [newDate, setNewDate] = useState("")

  useEffect(() => {
    const unsubscribe = listenToPatientAppointments(
      user.uid,
      setAppointments
    )
    return () => unsubscribe()
  }, [])

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-3">My Appointments</h2>

      {appointments.length === 0 ? (
        <p>No appointments</p>
      ) : (
        <ul className="space-y-3">
          {appointments.map((item) => (
            <li key={item.id} className="border p-3 rounded">
              <p><b>Doctor:</b> {item.doctorName}</p>
              <p><b>Date:</b> {item.date}</p>
              <p><b>Queue:</b> #{item.queueNumber}</p>
              <p><b>Status:</b> {item.status}</p>

              {item.status === "waiting" && (
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => cancelAppointment(item.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>

                  <input
                    type="date"
                    className="border p-1"
                    onChange={(e) => setNewDate(e.target.value)}
                  />

                  <button
                    onClick={() =>
                      rescheduleAppointment(item.id, newDate)
                    }
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Reschedule
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MyAppointments
