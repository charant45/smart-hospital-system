import { useEffect, useState } from "react"
import { useAuth } from "../../context/AuthContext"
import { listenToPatientQueue } from "../../firebase/appointmentService"

function LiveQueue() {
  const { user } = useAuth()
  const [queue, setQueue] = useState([])
  const [doctorName, setDoctorName] = useState("")
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [error, setError] = useState("")
  const [listening, setListening] = useState(false)

  useEffect(() => {
    if (!user?.uid || !doctorName.trim() || !date) {
      setQueue([])
      setListening(false)
      return
    }

    const unsubscribe = listenToPatientQueue(
      user.uid,
      doctorName.trim(),
      date,
      setQueue
    )
    setListening(true)

    return () => unsubscribe()
  }, [user, doctorName, date])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")
    if (!doctorName.trim() || !date) {
      setError("Please enter doctor name and date")
      return
    }
    // listening handled by useEffect
  }

  const getBadge = (status) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 mt-6">
        <p className="text-red-600 font-semibold">
          Please login to view your live queue.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 mt-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-3">Live Queue</h2>
      <p className="text-sm text-gray-600 mb-4">
        Enter your doctor name and appointment date to check if your appointment is in the queue.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Doctor Name (e.g., Dr. Kumar)"
          value={doctorName}
          onChange={(e) => setDoctorName(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
        />
        <button
          type="submit"
          className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
        >
          Check Queue
        </button>
      </form>

      {!listening && (
        <p className="text-gray-500 text-sm">
          Enter doctor name and date to view your appointment queue.
        </p>
      )}

      {listening && queue.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No appointments found for this doctor and date.</p>
        </div>
      )}

      {queue.length > 0 && (
        <div className="space-y-3">
          {queue.map((item, index) => (
            <div
              key={item.id}
              className={`border rounded-lg p-4 flex items-center justify-between ${
                index === 0 ? "bg-green-50 border-green-200" : "bg-white"
              }`}
            >
              <div>
                <p className="font-semibold text-gray-800">{item.doctorName}</p>
                <p className="text-sm text-gray-600">
                  Queue #{item.queueNumber} — Status:
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${getBadge(item.status)}`}>
                    {item.status}
                  </span>
                </p>
              </div>
              {index === 0 && (
                <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                  You are next
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LiveQueue
