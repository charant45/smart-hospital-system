import { Link, useNavigate, useLocation } from "react-router-dom"
import { logoutUser } from "../firebase/authService"
import { useAuth } from "../context/AuthContext"

function Navbar() {
  const { role, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logoutUser()
    navigate("/login")
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={role === "patient" ? "/patient" : role === "doctor" ? "/doctor" : "/admin"} className="flex items-center">
            <h1 className="font-bold text-xl text-white hover:text-green-400 transition-colors">
              🏥 Smart Hospital
            </h1>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {role === "patient" && (
              <>
                <Link
                  to="/patient"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/patient")
                      ? "bg-green-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/patient/book-appointment"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/patient/book-appointment")
                      ? "bg-green-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  Book Appointment
                </Link>
                <Link
                  to="/patient/live-queue"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/patient/live-queue")
                      ? "bg-green-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  Live Queue
                </Link>
                <Link
                  to="/patient/my-appointments"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/patient/my-appointments")
                      ? "bg-green-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  My Appointments
                </Link>
                <Link
                  to="/patient/reports"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/patient/reports")
                      ? "bg-green-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  Reports
                </Link>
              </>
            )}

            {role === "doctor" && (
              <>
                <Link
                  to="/doctor"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/doctor")
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/doctor/queue"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/doctor/queue")
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  Queue
                </Link>
                <Link
                  to="/doctor/discharge-summary"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/doctor/discharge-summary")
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  Discharge Summary
                </Link>
              </>
            )}

            {role === "admin" && (
              <>
                <Link
                  to="/admin"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/admin")
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/generate-bill"
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/admin/generate-bill")
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  Generate Bill
                </Link>
              </>
            )}

            {/* User Info & Logout */}
            <div className="ml-4 flex items-center space-x-4 border-l border-gray-700 pl-4">
              {user && (
                <span className="text-sm text-gray-300">
                  {user.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
