import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { listenToPatientQueue } from "../../firebase/appointmentService"

function LiveQueue() {
  const { user } = useAuth()
  const [queue, setQueue] = useState([])
  const [doctorName, setDoctorName] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)

  useEffect(() => {
    if (!user?.uid) {
      setQueue([])
      setListening(false)
      return
    }

    // Only listen if doctor name is provided
    if (!doctorName.trim() || !date) {
      setQueue([])
      setListening(false)
      return
    }

    setLoading(true)
    setError("")

    try {
      const unsubscribe = listenToPatientQueue(
        user.uid,
        doctorName.trim(),
        date,
        (data) => {
          setQueue(data || [])
          setLoading(false)
          setListening(true)
          setError("")
        }
      )

      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe()
        }
      }
    } catch (err) {
      console.error("Error setting up queue listener:", err)
      setError(err.message || "Failed to load queue. Please try again.")
      setLoading(false)
      setListening(false)
      return () => {}
    }
  }, [user, doctorName, date])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")
    if (!doctorName.trim() || !date) {
      setError("Please enter doctor name and date")
      return
    }
    // Listening handled by useEffect
  }

  const getBadge = (status) => {
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

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-600 font-semibold text-lg">Please login to view your live queue.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Live Queue
            </h2>
            <p className="text-gray-600">
              Enter your doctor name and appointment date to check your position in the queue.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center space-x-3 shadow-sm">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Doctor Name
              </label>
              <input
                type="text"
                placeholder="e.g., Dr. Kumar"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white shadow-sm hover:border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Appointment Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white shadow-sm hover:border-gray-300"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading || !doctorName.trim() || !date}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  "Check Queue"
                )}
              </button>
            </div>
          </form>

          {!listening && !loading && (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">Enter doctor name and date to view your appointment queue.</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-green-200 border-t-green-600 mb-3"></div>
              <p className="text-gray-600 font-medium">Loading queue...</p>
            </div>
          )}

          {listening && !loading && queue.length === 0 && (
            <div className="text-center py-12 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl border-2 border-dashed border-yellow-300">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-yellow-800 font-bold text-lg mb-2">No appointments found</p>
              <p className="text-sm text-yellow-700">No appointments found for this doctor and date. Please check your details.</p>
            </div>
          )}

          {queue.length > 0 && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 mb-4">
                <p className="text-sm font-semibold text-green-800">
                  Found {queue.length} appointment{queue.length !== 1 ? 's' : ''} for {doctorName} on {new Date(date).toLocaleDateString()}
                </p>
              </div>
              {queue.map((item, index) => {
                const isNext = item.status === "waiting" && index === 0
                return (
                  <div
                    key={item.id}
                    className={`border-2 rounded-xl p-6 flex items-center justify-between transition-all duration-200 ${
                      isNext
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-lg"
                        : item.status === "in-progress"
                        ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300 shadow-md"
                        : "bg-white border-gray-200 hover:shadow-md"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
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
                          <p className="font-bold text-gray-800 text-lg">{item.doctorName}</p>
                          <p className="text-sm text-gray-600">Date: {item.date}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${getBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    {isNext && (
                      <div className="ml-4">
                        <span className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-bold rounded-full shadow-md flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>You are next!</span>
                        </span>
                      </div>
                    )}
                    {item.status === "in-progress" && (
                      <div className="ml-4">
                        <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-full shadow-md flex items-center space-x-2">
                          <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>In Progress</span>
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
  )
}

export default LiveQueue
