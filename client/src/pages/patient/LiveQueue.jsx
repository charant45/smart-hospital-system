import { useEffect, useState } from "react"
import { listenToQueue } from "../../firebase/appointmentService"
import { useAuth } from "../../context/AuthContext"

function LiveQueue() {
  const { user } = useAuth()
  const [queue, setQueue] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    if (!selectedDoctor || !date) return
    
    const unsubscribe = listenToQueue(selectedDoctor, date, setQueue)
    return () => unsubscribe()
  }, [selectedDoctor, date])

  // Get doctor ID from user's appointments (simplified - in real app, you'd fetch this)
  // For now, we'll need to select a doctor or get it from appointments
  const handleDoctorSelect = (e) => {
    setSelectedDoctor(e.target.value)
  }

  return (
    <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Live Queue</h2>
          <p className="text-gray-600 mb-6">View real-time queue status for your appointments</p>

          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Doctor ID
              </label>
              <input
                type="text"
                value={selectedDoctor}
                onChange={handleDoctorSelect}
                placeholder="Enter doctor ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {queue.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">No patients in queue</p>
              <p className="text-gray-400 text-sm mt-2">Select a doctor and date to view the queue</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((item, index) => (
                <div
                  key={item.id}
                  className={`border rounded-lg p-4 flex items-center justify-between transition-all ${
                    index === 0
                      ? "bg-green-50 border-green-200 shadow-md"
                      : "bg-white border-gray-200 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0
                        ? "bg-green-600 text-white"
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
                    <span className="px-3 py-1 bg-green-600 text-white text-sm font-semibold rounded-full">
                      Next
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

export default LiveQueue
