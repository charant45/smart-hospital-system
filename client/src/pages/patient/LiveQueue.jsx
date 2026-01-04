import { useEffect, useState } from "react"
import { listenToQueue } from "../../firebase/appointmentService"

function LiveQueue() {
  const [queue, setQueue] = useState([])

  // Temporary values (later dynamic)
  const doctorId = "doc_001"
  const date = new Date().toISOString().slice(0, 10)

  useEffect(() => {
    const unsubscribe = listenToQueue(doctorId, date, setQueue)
    return () => unsubscribe()
  }, [])

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold mb-3">Live Queue</h2>

      {queue.length === 0 ? (
        <p>No patients in queue</p>
      ) : (
        <ul className="space-y-2">
          {queue.map((item) => (
            <li
              key={item.id}
              className="border p-2 rounded flex justify-between"
            >
              <span>{item.patientEmail}</span>
              <span className="font-bold">
                Queue #{item.queueNumber}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default LiveQueue
