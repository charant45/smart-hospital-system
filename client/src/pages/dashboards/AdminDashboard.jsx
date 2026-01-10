import DashboardLayout from "../../layouts/DashboardLayout"

function AdminDashboard() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-purple-600">
        Admin Dashboard
      </h1>
      <p>Manage doctors, slots, analytics.</p>
    </DashboardLayout>
  )
}

export default AdminDashboard
