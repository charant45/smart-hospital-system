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
  const [rescheduleData, setRescheduleData] = useState({})
  const [loading, setLoading] = useState({})

  useEffect(() => {
    if (!user?.uid) return
    const unsubscribe = listenToPatientAppointments(user.uid, setAppointments)
    return () => unsubscribe()
  }, [user])

  const handleCancel = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return
    
    setLoading({ ...loading, [appointmentId]: true })
    try {
      await cancelAppointment(appointmentId)
    } catch (error) {
      alert("Failed to cancel appointment: " + error.message)
    } finally {
      setLoading({ ...loading, [appointmentId]: false })
    }
  }

  const handleReschedule = async (appointmentId) => {
    const newDate = rescheduleData[appointmentId]
    if (!newDate) {
      alert("Please select a new date")
      return
    }

    setLoading({ ...loading, [appointmentId]: true })
    try {
      await rescheduleAppointment(appointmentId, newDate)
      setRescheduleData({ ...rescheduleData, [appointmentId]: "" })
    } catch (error) {
      alert("Failed to reschedule appointment: " + error.message)
    } finally {
      setLoading({ ...loading, [appointmentId]: false })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">My Appointments</h2>
          <p className="text-gray-600 mb-6">Manage and track your appointments</p>

          {appointments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">No appointments found</p>
              <p className="text-gray-400 text-sm mt-2">Book your first appointment to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-800">{item.doctorName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-semibold">Date:</span> {item.date}
                        </div>
                        <div>
                          <span className="font-semibold">Queue Number:</span> #{item.queueNumber}
                        </div>
                      </div>
                    </div>
                  </div>

                  {item.status === "waiting" && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                      <button
                        onClick={() => handleCancel(item.id)}
                        disabled={loading[item.id]}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
                      >
                        Cancel Appointment
                      </button>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="date"
                          value={rescheduleData[item.id] || ""}
                          onChange={(e) =>
                            setRescheduleData({
                              ...rescheduleData,
                              [item.id]: e.target.value,
                            })
                          }
                          min={new Date().toISOString().split('T')[0]}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                        <button
                          onClick={() => handleReschedule(item.id)}
                          disabled={loading[item.id] || !rescheduleData[item.id]}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                        >
                          Reschedule
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  )
}

export default MyAppointments
