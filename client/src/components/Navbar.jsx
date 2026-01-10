import { Link, useNavigate } from "react-router-dom"
import { logoutUser } from "../firebase/authService"
import { useAuth } from "../context/AuthContext"

function Navbar() {
  const { role } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logoutUser()
    navigate("/login")
  }

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
      <h1 className="font-bold text-lg">Smart Hospital</h1>

      <div className="flex items-center space-x-4">
        {role === "patient" && (
          <>
            <Link to="/patient">Dashboard</Link>
          </>
        )}

        {role === "doctor" && (
          <>
            <Link to="/doctor">Dashboard</Link>
            <Link to="/doctor/queue">Queue</Link>
          </>
        )}

        {role === "admin" && (
          <>
            <Link to="/admin">Dashboard</Link>
          </>
        )}

        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar
