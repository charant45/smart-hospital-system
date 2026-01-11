import { Routes, Route, Navigate } from "react-router-dom"

// Auth
import Login from "../pages/auth/Login"
import Register from "../pages/auth/Register"

// Dashboards
import PatientDashboard from "../pages/dashboards/PatientDashboard"
import DoctorDashboard from "../pages/dashboards/DoctorDashboard"
import AdminDashboard from "../pages/dashboards/AdminDashboard"

// Features
import DoctorQueue from "../pages/doctor/DoctorQueue"
import DischargeSummary from "../pages/doctor/DischargeSummary"
import LiveQueue from "../pages/patient/LiveQueue"
import MyAppointments from "../pages/patient/MyAppointments"
import Reports from "../pages/patient/Reports"
import Notifications from "../components/Notifications" 
import BookAppointment from "../pages/patient/BookAppointment"
import GenerateBill from "../pages/admin/GenerateBill" 

// Guards
import ProtectedRoute from "./ProtectedRoute"
import RoleRoute from "./RoleRoute"
import DashboardLayout from "../layouts/DashboardLayout"

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Patient Routes */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["patient"]}>
              <PatientDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/book-appointment"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["patient"]}>
              <DashboardLayout>
                <BookAppointment />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/patient/live-queue"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["patient"]}>
              <DashboardLayout>
                <LiveQueue />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/my-appointments"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["patient"]}>
              <DashboardLayout>
                <MyAppointments />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/reports"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["patient"]}>
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Doctor Routes */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/queue"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["doctor"]}>
              <DashboardLayout>
                <DoctorQueue />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/discharge-summary"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["doctor"]}>
              <DashboardLayout>
                <DischargeSummary />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/generate-bill"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <DashboardLayout>
                <GenerateBill />
              </DashboardLayout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Unauthorized */}
      <Route
        path="/unauthorized"
        element={<h1 className="text-center mt-10">Unauthorized Access</h1>}
      />

      {/* Default */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default AppRoutes
