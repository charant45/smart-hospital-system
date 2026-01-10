import DashboardLayout from "../../layouts/DashboardLayout"
import DoctorQueue from "../doctor/DoctorQueue"

function DoctorDashboard() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-blue-600 mb-4">
        Doctor Dashboard
      </h1>

      <DoctorQueue />
    </DashboardLayout>
  )
}

export default DoctorDashboard
