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

  const getRoleColor = () => {
    if (role === "patient") return "green"
    if (role === "doctor") return "blue"
    if (role === "admin") return "purple"
    return "gray"
  }

  const roleColor = getRoleColor()

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to={role === "patient" ? "/patient" : role === "doctor" ? "/doctor" : "/admin"} 
            className="flex items-center space-x-2 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Smart Hospital
              </h1>
              <p className="text-xs text-gray-500 -mt-1">{role ? role.charAt(0).toUpperCase() + role.slice(1) : ""}</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {role === "patient" && (
              <>
                <Link
                  to="/patient"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/patient")
                      ? `bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md`
                      : "text-gray-600 hover:bg-green-50 hover:text-green-600"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/patient/book-appointment"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/patient/book-appointment")
                      ? `bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md`
                      : "text-gray-600 hover:bg-green-50 hover:text-green-600"
                  }`}
                >
                  Book Appointment
                </Link>
                <Link
                  to="/patient/live-queue"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/patient/live-queue")
                      ? `bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md`
                      : "text-gray-600 hover:bg-green-50 hover:text-green-600"
                  }`}
                >
                  Live Queue
                </Link>
                <Link
                  to="/patient/my-appointments"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/patient/my-appointments")
                      ? `bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md`
                      : "text-gray-600 hover:bg-green-50 hover:text-green-600"
                  }`}
                >
                  My Appointments
                </Link>
                <Link
                  to="/patient/reports"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/patient/reports")
                      ? `bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md`
                      : "text-gray-600 hover:bg-green-50 hover:text-green-600"
                  }`}
                >
                  Reports
                </Link>
                <Link
                  to="/patient/medical-history"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/patient/medical-history")
                      ? `bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md`
                      : "text-gray-600 hover:bg-green-50 hover:text-green-600"
                  }`}
                >
                  Medical History
                </Link>
              </>
            )}

            {role === "doctor" && (
              <>
                <Link
                  to="/doctor"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/doctor")
                      ? `bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md`
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/doctor/queue"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/doctor/queue")
                      ? `bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md`
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  Queue
                </Link>
                <Link
                  to="/doctor/discharge-summary"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/doctor/discharge-summary")
                      ? `bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md`
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/admin")
                      ? `bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md`
                      : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/generate-bill"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/admin/generate-bill")
                      ? `bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md`
                      : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                  }`}
                >
                  Generate Bill
                </Link>
              </>
            )}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden sm:flex items-center space-x-3 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700 font-medium max-w-[150px] truncate">
                  {user.email}
                </span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
