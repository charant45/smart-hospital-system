import BookAppointment from "../patient/BookAppointment"
import LiveQueue from "../patient/LiveQueue"

function PatientDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-600 mb-4">
        Patient Dashboard
      </h1>

      <BookAppointment />
      <LiveQueue />
    </div>
  )
}

export default PatientDashboard
