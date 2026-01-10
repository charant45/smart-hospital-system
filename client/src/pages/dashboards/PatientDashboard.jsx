import DashboardLayout from "../../layouts/DashboardLayout"
import BookAppointment from "../patient/BookAppointment"
import LiveQueue from "../patient/LiveQueue"
import MyAppointments from "../patient/MyAppointments"
import Notifications from "../../components/Notifications"

function PatientDashboard() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-green-600 mb-4">
        Patient Dashboard
      </h1>

      <Notifications />
      <BookAppointment />
      <LiveQueue />
      <MyAppointments />
    </DashboardLayout>
  )
}

export default PatientDashboard
