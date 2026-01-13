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
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!user?.uid) return
    const unsubscribe = listenToPatientAppointments(user.uid, setAppointments)
    return () => unsubscribe()
  }, [user])

  const handleCancel = async (appointmentId, doctorName, date) => {
    if (!window.confirm(`Are you sure you want to cancel your appointment with ${doctorName} on ${date}?`)) {
      return
    }
    
    setLoading({ ...loading, [appointmentId]: true })
    setError("")
    setSuccess("")
    
    try {
      await cancelAppointment(appointmentId)
      setSuccess(`Appointment with ${doctorName} has been cancelled successfully.`)
      setTimeout(() => setSuccess(""), 5000)
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      setError(error.message || "Failed to cancel appointment. Please try again.")
      setTimeout(() => setError(""), 5000)
    } finally {
      setLoading({ ...loading, [appointmentId]: false })
    }
  }

  const handleReschedule = async (appointmentId, doctorName) => {
    const newDate = rescheduleData[appointmentId]
    if (!newDate) {
      setError("Please select a new date")
      setTimeout(() => setError(""), 3000)
      return
    }

    setLoading({ ...loading, [appointmentId]: true })
    setError("")
    setSuccess("")
    
    try {
      await rescheduleAppointment(appointmentId, newDate)
      setSuccess(`Appointment with ${doctorName} has been rescheduled to ${newDate}.`)
      setRescheduleData({ ...rescheduleData, [appointmentId]: "" })
      setTimeout(() => setSuccess(""), 5000)
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
      setError(error.message || "Failed to reschedule appointment. Please try again.")
      setTimeout(() => setError(""), 5000)
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
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              My Appointments
            </h2>
            <p className="text-gray-600">Manage and track your appointments</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center space-x-3 shadow-sm">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-xl flex items-center space-x-3 shadow-sm">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-green-700">{success}</p>
            </div>
          )}

          {appointments.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-600 text-lg font-semibold mb-2">No appointments found</p>
              <p className="text-gray-500 text-sm">Book your first appointment to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((item) => (
                <div
                  key={item.id}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-white"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm ${
                          item.status === "waiting"
                            ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white"
                            : item.status === "in-progress"
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                            : item.status === "completed"
                            ? "bg-gradient-to-br from-green-500 to-green-600 text-white"
                            : "bg-gradient-to-br from-gray-400 to-gray-500 text-white"
                        }`}>
                          {item.queueNumber}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{item.doctorName}</h3>
                          <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mt-4">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span><span className="font-semibold">Date:</span> {item.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          <span><span className="font-semibold">Queue:</span> #{item.queueNumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {item.status === "waiting" && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      <button
                        onClick={() => handleCancel(item.id, item.doctorName, item.date)}
                        disabled={loading[item.id]}
                        className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                      >
                        {loading[item.id] ? (
                          <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Cancelling...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Cancel Appointment</span>
                          </>
                        )}
                      </button>
                      <div className="flex flex-col md:flex-row gap-3">
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
                          className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white shadow-sm hover:border-gray-300"
                        />
                        <button
                          onClick={() => handleReschedule(item.id, item.doctorName)}
                          disabled={loading[item.id] || !rescheduleData[item.id]}
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          {loading[item.id] ? "Rescheduling..." : "Reschedule"}
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
