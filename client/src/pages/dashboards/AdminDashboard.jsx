import { Link } from "react-router-dom"
import DashboardLayout from "../../layouts/DashboardLayout"

function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-600 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-6">Manage hospital operations, doctors, and billing</p>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            to="/admin/generate-bill"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-gray-200 hover:border-purple-500 group"
          >
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                <span className="text-3xl">💰</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-purple-600 mb-2">Generate Bill</h3>
                <p className="text-gray-600 mb-4">Create bills for patients including consultation fees, surgery costs, and medicine charges. Generate PDF bills instantly.</p>
                <span className="text-purple-600 font-medium group-hover:text-purple-700">Generate Bill →</span>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-3xl">📊</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Analytics</h3>
                <p className="text-gray-600 mb-4">View hospital statistics, patient records, and doctor performance metrics.</p>
                <span className="text-gray-500 font-medium">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Info */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-8 border border-purple-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Billing Management</h3>
              <p className="text-sm text-gray-600">Generate and manage patient bills with detailed breakdowns of all charges including consultation, surgery, and medications.</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Doctor Management</h3>
              <p className="text-sm text-gray-600">Manage doctor profiles, specializations, and schedules. View doctor availability and patient loads.</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">System Analytics</h3>
              <p className="text-sm text-gray-600">Monitor hospital operations, appointment statistics, and generate reports for management decisions.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard
