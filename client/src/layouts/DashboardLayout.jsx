import Navbar from "../components/Navbar"

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100">
      <Navbar />
      <main className="p-4 md:p-6 lg:p-8">{children}</main>
    </div>
  )
}

export default DashboardLayout
