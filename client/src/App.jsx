import Login from "./pages/auth/Login"
import { useAuth } from "./context/AuthContext"

import PatientDashboard from "./pages/dashboards/PatientDashboard"
import DoctorDashboard from "./pages/dashboards/DoctorDashboard"
import AdminDashboard from "./pages/dashboards/AdminDashboard"

function App() {
  const { user, role, loading } = useAuth()

  if (loading) {
    return <h1 className="text-center mt-10">Loading...</h1>
  }

  if (!user) {
    return <Login />
  }

  // Role-based rendering
  if (role === "patient") return <PatientDashboard />
  if (role === "doctor") return <DoctorDashboard />
  if (role === "admin") return <AdminDashboard />

  return <h1>Unauthorized</h1>
}

export default App
