import { useEffect, useState } from "react"
import { listenToQueue, callNextPatient } from "../../firebase/appointmentService"

function DoctorQueue() {
  const [queue, setQueue] = useState([])

  const doctorId = "doc_001"
  const date = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    const unsubscribe = listenToQueue(doctorId, date, setQueue)
    return () => unsubscribe()
  }, [])

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

      {queue.length === 0 ? (
        <p>No patients waiting</p>
      ) : (
        <ul className="space-y-2">
          {queue.map((item) => (
            <li
              key={item.id}
              className={`border p-2 rounded flex justify-between ${
                item.status === "in-progress"
                  ? "bg-yellow-100"
                  : ""
              }`}
            >
              <span>{item.patientEmail}</span>
              <span className="font-bold">
                #{item.queueNumber} ({item.status})
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default DoctorQueue
