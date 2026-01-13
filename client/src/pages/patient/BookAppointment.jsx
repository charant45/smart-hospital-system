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
  const [loadingDoctors, setLoadingDoctors] = useState(true)
  const [error, setError] = useState("")
  const [loadError, setLoadError] = useState("")
  const [success, setSuccess] = useState("")

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true)
      setLoadError("")
      console.log("Fetching doctors...")
      const doctorsList = await getDoctors()
      console.log("Doctors fetched:", doctorsList)
      setDoctors(doctorsList)
      if (doctorsList.length === 0) {
        setLoadError("no-doctors") // Special flag for no doctors
      }
    } catch (err) {
      console.error("Error fetching doctors:", err)
      setLoadError(err.message || "Failed to load doctors. Please check your connection and try again.")
    } finally {
      setLoadingDoctors(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const handleBook = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    
    // Validation
    if (!user) {
      setError("You must be logged in to book an appointment. Please login again.")
      return
    }

    if (!selectedDoctor || !date) {
      setError("All fields are required")
      return
    }

    setLoading(true)

    try {
      const doctor = doctors.find((d) => d.id === selectedDoctor)
      
      if (!doctor) {
        setError("Selected doctor not found. Please select again.")
        setLoading(false)
        return
      }

      console.log("Booking appointment with:", {
        patientId: user.uid,
        patientEmail: user.email,
        doctorId: doctor.id,
        doctorName: doctor.name,
        date,
      })

      const result = await bookAppointment({
        patientId: user.uid,
        patientEmail: user.email,
        doctorId: doctor.id,
        doctorName: doctor.name || "Dr. Unknown",
        date,
      })

      console.log("Appointment booked successfully:", result.id)

      setSuccess("Appointment booked successfully! ✅")
      setSelectedDoctor("")
      setDate("")
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000)
    } catch (err) {
      console.error("Error booking appointment:", err)
      const errorMessage = err.message || err.code || "Failed to book appointment. Please try again."
      setError(`Error: ${errorMessage}. Please check your connection and try again.`)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center py-8">
            <p className="text-red-600 font-semibold">You must be logged in to book an appointment.</p>
            <p className="text-gray-600 mt-2">Please login and try again.</p>
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
            Book Appointment
          </h2>
          <p className="text-gray-600">Select a doctor and choose your preferred date</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center space-x-3 shadow-sm">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {loadError && loadError !== "no-doctors" && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 mb-1">Error Loading Doctors</p>
                <p className="text-sm text-red-600 mb-3">{loadError}</p>
                <button
                  onClick={fetchDoctors}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-xl flex items-center space-x-3 shadow-sm">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleBook} className="space-y-6">
          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Select Doctor <span className="text-red-500">*</span>
            </label>
            
            {loadingDoctors ? (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-green-200 border-t-green-600 mb-3"></div>
                <p className="mt-2 text-gray-600 font-medium">Loading doctors...</p>
              </div>
            ) : loadError === "no-doctors" || (doctors.length === 0 && !loadError) ? (
              <div className="text-center py-12 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-dashed border-yellow-300 rounded-xl">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-yellow-800 font-bold text-lg mb-2">No doctors available at the moment.</p>
                <p className="text-sm text-yellow-700 mb-1">Doctors need to register first before they appear here.</p>
                <p className="text-sm text-yellow-700 mb-4">Please check back later or contact admin.</p>
                <button
                  onClick={fetchDoctors}
                  className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
                >
                  Refresh
                </button>
              </div>
            ) : (
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white text-gray-800 font-medium shadow-sm hover:border-gray-300"
              >
                <option value="">Choose a doctor...</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name || "Dr. Unknown"} - {doctor.specialization || "General"}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Appointment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white text-gray-800 font-medium shadow-sm hover:border-gray-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !selectedDoctor || !date || doctors.length === 0}
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
