import { Link } from "react-router-dom"
import DashboardLayout from "../../layouts/DashboardLayout"
import Notifications from "../../components/Notifications"

function PatientDashboard() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-green-600 mb-2">Patient Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome! Manage your appointments and health records</p>

        <Notifications />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            to="/patient/book-appointment"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200 hover:border-green-500 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-green-600">Book Appointment</h3>
                <p className="text-sm text-gray-500">Schedule with a doctor</p>
              </div>
            </div>
          </Link>

          <Link
            to="/patient/my-appointments"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200 hover:border-green-500 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-blue-600">My Appointments</h3>
                <p className="text-sm text-gray-500">View all appointments</p>
              </div>
            </div>
          </Link>

          <Link
            to="/patient/live-queue"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200 hover:border-green-500 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-600 transition-colors">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-yellow-600">Live Queue</h3>
                <p className="text-sm text-gray-500">Check queue status</p>
              </div>
            </div>
          </Link>

          <Link
            to="/patient/reports"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200 hover:border-green-500 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                <span className="text-2xl">📄</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 group-hover:text-purple-600">Reports</h3>
                <p className="text-sm text-gray-500">View medical reports</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Dashboard Info */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg p-8 border border-green-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">1. Book Appointment</h3>
              <p className="text-sm text-gray-600">Select a doctor and choose your preferred date and time for consultation.</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">2. Track Queue</h3>
              <p className="text-sm text-gray-600">Monitor your position in the queue and get notified when it's your turn.</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">3. View Reports</h3>
              <p className="text-sm text-gray-600">Access your medical reports and discharge summaries anytime.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default PatientDashboard
