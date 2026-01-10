import { useEffect, useState } from "react"
import { listenToQueue, callNextPatient } from "../../firebase/appointmentService"
import { useAuth } from "../../context/AuthContext"

function DoctorQueue() {
  const { user } = useAuth()
  const [queue, setQueue] = useState([])

  const doctorId = user.uid
  const date = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    if (!doctorId) return
    const unsubscribe = listenToQueue(doctorId, date, setQueue)
    return () => unsubscribe()
  }, [doctorId, date])

  const handleCallNext = async () => {
    await callNextPatient(doctorId, date)
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">
        Doctor Queue
      </h1>

      <button
        onClick={handleCallNext}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        Call Next Patient
      </button>

      {queue.map((item) => (
        <div key={item.id} className="border p-2 mb-2 rounded">
          {item.patientEmail} – #{item.queueNumber} ({item.status})
        </div>
      ))}
    </div>
  )
}

export default DoctorQueue
