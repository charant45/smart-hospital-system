import BookAppointment from "../patient/BookAppointment"
import LiveQueue from "../patient/LiveQueue"
import MyAppointments from "../patient/MyAppointments"
import Notifications from "../../components/Notifications"

function PatientDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-600 mb-4">
        Patient Dashboard
      </h1>

      <Notifications />
      <BookAppointment />
      <LiveQueue />
      <MyAppointments />
    </div>
  )
}

export default PatientDashboard
