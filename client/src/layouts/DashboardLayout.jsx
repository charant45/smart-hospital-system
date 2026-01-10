import Navbar from "../components/Navbar"

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="p-6">{children}</main>
    </div>
  )
}

export default DashboardLayout
