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
import LiveQueue from "../pages/patient/LiveQueue"
import MyAppointments from "../pages/patient/MyAppointments"
import Notifications from "../components/Notifications" 
import BookAppointment from "../pages/patient/BookAppointment" 

// Guards
import ProtectedRoute from "./ProtectedRoute"
import RoleRoute from "./RoleRoute"

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
              <BookAppointment />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/patient/live-queue"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["patient"]}>
              <LiveQueue />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/my-appointments"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={["patient"]}>
              <MyAppointments />
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
              <DoctorQueue />
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
