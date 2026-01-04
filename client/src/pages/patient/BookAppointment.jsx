import { useState } from "react"
import { bookAppointment } from "../../firebase/appointmentService"
import { useAuth } from "../../context/AuthContext"

function BookAppointment() {
  const { user } = useAuth()
  const [doctorId, setDoctorId] = useState("")
  const [doctorName, setDoctorName] = useState("")
  const [date, setDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage("")

    try {
      await bookAppointment({
        patientId: user.uid,
        patientEmail: user.email,
        doctorId,
        doctorName,
        date,
      })
      setMessage("Appointment booked successfully!")
      setDoctorId("")
      setDoctorName("")
      setDate("")
    } catch (error) {
      setMessage("Error booking appointment: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-green-600 mb-4">
        Book Appointment
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Doctor ID</label>
          <input
            type="text"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Doctor Name</label>
          <input
            type="text"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Booking..." : "Book Appointment"}
        </button>

        {message && (
          <p className={`mt-2 ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}

export default BookAppointment
