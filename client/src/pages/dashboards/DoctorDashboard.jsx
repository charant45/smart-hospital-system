import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import DashboardLayout from "../../layouts/DashboardLayout"
import { useAuth } from "../../context/AuthContext"
import { listenToQueue } from "../../firebase/appointmentService"

function DoctorDashboard() {
  const { user } = useAuth()
  const [todayQueue, setTodayQueue] = useState([])
  const [todayDate] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    if (!user?.uid) return
    const unsubscribe = listenToQueue(user.uid, todayDate, setTodayQueue)
    return () => unsubscribe()
  }, [user, todayDate])

  const waitingCount = todayQueue.filter(a => a.status === "waiting").length
  const inProgressCount = todayQueue.filter(a => a.status === "in-progress").length
  const completedCount = todayQueue.filter(a => a.status === "completed").length

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Doctor Dashboard</h1>
        <p className="text-gray-600 mb-6">Manage your patient queue and generate reports</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Today</p>
                <p className="text-2xl font-bold text-gray-800">{todayQueue.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Waiting</p>
                <p className="text-2xl font-bold text-yellow-600">{waitingCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/doctor/queue"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-200 hover:border-blue-500 group"
          >
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <span className="text-3xl">👥</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 mb-2">
                  Patient Queue
                </h3>
                <p className="text-gray-600 mb-4">
                  View and manage your patient queue. Call patients in order and track their status.
                </p>
                <div className="flex items-center space-x-2 text-blue-600 font-medium group-hover:text-blue-700">
                  <span>Manage Queue</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </Link>

          <Link
            to="/doctor/discharge-summary"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-200 hover:border-green-500 group"
          >
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
                <span className="text-3xl">📋</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-green-600 mb-2">
                  Discharge Summary
                </h3>
                <p className="text-gray-600 mb-4">
                  Generate discharge summaries for patients with diagnosis, treatment, and dates.
                </p>
                <div className="flex items-center space-x-2 text-green-600 font-medium group-hover:text-green-700">
                  <span>Create Summary</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Today's Appointments Preview */}
        {todayQueue.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Today's Appointments ({todayDate})</h2>
              <Link
                to="/doctor/queue"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-2">
              {todayQueue.slice(0, 5).map((appointment, index) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      appointment.status === "waiting"
                        ? "bg-yellow-100 text-yellow-800"
                        : appointment.status === "in-progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      {appointment.queueNumber}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{appointment.patientEmail}</p>
                      <p className="text-xs text-gray-500">Status: {appointment.status}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    appointment.status === "waiting"
                      ? "bg-yellow-100 text-yellow-800"
                      : appointment.status === "in-progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
              {todayQueue.length > 5 && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  +{todayQueue.length - 5} more appointments
                </p>
              )}
            </div>
          </div>
        )}

        {/* Dashboard Info */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-lg p-8 border border-blue-200 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Managing Queue</h3>
              <p className="text-sm text-gray-600">Click "Call Next Patient" to move patients from waiting to in-progress status. The system will automatically notify patients when it's their turn.</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Discharge Summaries</h3>
              <p className="text-sm text-gray-600">Create comprehensive discharge summaries with patient details, diagnosis, treatment plan, and admission/discharge dates. PDFs are automatically saved and shared with patients.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DoctorDashboard
