import { Link } from "react-router-dom"
import DashboardLayout from "../../layouts/DashboardLayout"

function DoctorDashboard() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">Doctor Dashboard</h1>
        <p className="text-gray-600 mb-6">Manage your patient queue and generate reports</p>

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
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 mb-2">Patient Queue</h3>
                <p className="text-gray-600 mb-4">View and manage your patient queue. Call patients in order and track their status.</p>
                <span className="text-blue-600 font-medium group-hover:text-blue-700">Manage Queue →</span>
              </div>
            </div>
          </Link>

          <Link
            to="/doctor/discharge-summary"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-200 hover:border-blue-500 group"
          >
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
                <span className="text-3xl">📋</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-green-600 mb-2">Discharge Summary</h3>
                <p className="text-gray-600 mb-4">Generate discharge summaries for patients with diagnosis, treatment, and dates.</p>
                <span className="text-green-600 font-medium group-hover:text-green-700">Create Summary →</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Dashboard Stats/Info */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl shadow-lg p-8 border border-blue-200">
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
