import { useEffect, useState } from "react"
import { listenToQueue, callNextPatient } from "../../firebase/appointmentService"
import { useAuth } from "../../context/AuthContext"

function DoctorQueue() {
  const { user } = useAuth()
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const doctorId = user?.uid
  const date = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (!doctorId) return
    const unsubscribe = listenToQueue(doctorId, date, setQueue)
    return () => unsubscribe()
  }, [doctorId, date])

  const handleCallNext = async () => {
    setLoading(true)
    setMessage("")
    try {
      await callNextPatient(doctorId, date)
      setMessage("Next patient called successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      setMessage("Failed to call next patient: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 mb-2">Doctor Queue</h1>
              <p className="text-gray-600">Manage your patient queue for today ({date})</p>
            </div>
            <button
              onClick={handleCallNext}
              disabled={loading || queue.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Calling...
                </span>
              ) : (
                "Call Next Patient"
              )}
            </button>
          </div>

          {message && (
            <div className={`mb-4 p-4 rounded-lg ${
              message.includes("Failed") 
                ? "bg-red-50 border border-red-200 text-red-600" 
                : "bg-green-50 border border-green-200 text-green-600"
            }`}>
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}

          {queue.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">👥</div>
              <p className="text-gray-500 text-lg">No patients in queue</p>
              <p className="text-gray-400 text-sm mt-2">Patients will appear here when they book appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((item, index) => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 flex items-center justify-between transition-all ${
                    index === 0
                      ? "bg-blue-50 border-blue-200 shadow-md"
                      : "bg-white border-gray-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}>
                      {item.queueNumber}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{item.patientEmail}</p>
                      <p className="text-sm text-gray-500">Status: {item.status}</p>
                    </div>
                  </div>
                  {index === 0 && (
                    <span className="px-4 py-1 bg-blue-600 text-white text-sm font-semibold rounded-full">
                      Next in Line
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  )
}

export default DoctorQueue
