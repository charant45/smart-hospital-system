import { useEffect, useState } from "react"
import { bookAppointment } from "../../firebase/appointmentService"
import { useAuth } from "../../context/AuthContext"
import { getDoctors } from "../../firebase/doctorService"

function BookAppointment() {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [date, setDate] = useState("")

  useEffect(() => {
    getDoctors().then(setDoctors)
  }, [])

  const handleBook = async () => {
    if (!selectedDoctor || !date) {
      alert("All fields required")
      return
    }

    const doctor = doctors.find((d) => d.id === selectedDoctor)

    await bookAppointment({
      patientId: user.uid,
      patientEmail: user.email,
      doctorId: doctor.id,
      doctorName: doctor.name,
      date,
    })

    alert("Appointment booked successfully")
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">Book Appointment</h2>

      <select
        className="border p-2 w-full mb-3"
        onChange={(e) => setSelectedDoctor(e.target.value)}
      >
        <option value="">Select Doctor</option>
        {doctors.map((doc) => (
          <option key={doc.id} value={doc.id}>
            {doc.name} ({doc.specialization})
          </option>
        ))}
      </select>

      <input
        type="date"
        className="border p-2 w-full mb-4"
        onChange={(e) => setDate(e.target.value)}
      />

      <button
        onClick={handleBook}
        className="bg-green-600 text-white w-full py-2 rounded"
      >
        Book Appointment
      </button>
    </div>
  )
}

export default BookAppointment
