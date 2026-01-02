import Login from "./pages/auth/Login"
import { useAuth } from "./context/AuthContext"

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
  if (role === "admin") return <AdminDashboard />

  return <h1>Unauthorized</h1>
}

export default App
