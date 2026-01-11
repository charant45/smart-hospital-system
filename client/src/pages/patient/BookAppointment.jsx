import { useEffect, useState } from "react"
import { bookAppointment } from "../../firebase/appointmentService"
import { useAuth } from "../../context/AuthContext"
import { getDoctors } from "../../firebase/doctorService"

function BookAppointment() {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [date, setDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    getDoctors().then(setDoctors)
  }, [])

  const handleBook = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    
    if (!selectedDoctor || !date) {
      setError("All fields are required")
      return
    }

    setLoading(true)

    try {
      const doctor = doctors.find((d) => d.id === selectedDoctor)

      await bookAppointment({
        patientId: user.uid,
        patientEmail: user.email,
        doctorId: doctor.id,
        doctorName: doctor.name,
        date,
      })

      setSuccess("Appointment booked successfully!")
      setSelectedDoctor("")
      setDate("")
    } catch (err) {
      setError(err.message || "Failed to book appointment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Book Appointment</h2>
          <p className="text-gray-600 mb-6">Select a doctor and choose your preferred date</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <form onSubmit={handleBook} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Doctor
              </label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition bg-white"
              >
                <option value="">Choose a doctor...</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} - {doc.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Appointment Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Booking...
                </span>
              ) : (
                "Book Appointment"
              )}
            </button>
          </form>
        </div>
      </div>
  )
}

export default BookAppointment
