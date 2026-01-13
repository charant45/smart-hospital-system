import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import DashboardLayout from "../../layouts/DashboardLayout"
import { useAuth } from "../../context/AuthContext"
import {
  callNextPatient,
  listenToDoctorAppointments,
} from "../../firebase/appointmentService"

function DoctorDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState("")
  const [todayDate] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      setError("User not authenticated")
      return
    }
    
    setLoading(true)
    setError("")
    let unsubscribe = () => {}
    
    try {
      unsubscribe = listenToDoctorAppointments(
        user.uid,
        todayDate,
        (data) => {
          console.log("Doctor appointments updated:", data)
          setAppointments(data || [])
          setLoading(false)
          setError("")
        }
      )
      
      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe()
        }
      }
    } catch (error) {
      console.error("Error setting up appointment listener:", error)
      setError(error.message || "Failed to load appointments")
      setLoading(false)
      return () => {}
    }
  }, [user, todayDate])

  const waitingQueue = useMemo(
    () => appointments.filter((a) => a.status === "waiting"),
    [appointments]
  )

  const inProgressPatient = useMemo(
    () => appointments.find((a) => a.status === "in-progress"),
    [appointments]
  )

  const completedCount = useMemo(
    () => appointments.filter((a) => a.status === "completed").length,
    [appointments]
  )

  const waitingCount = waitingQueue.length
  const inProgressCount = inProgressPatient ? 1 : 0

  const nextPatient = waitingQueue[0]

  const handleCallNext = useCallback(async () => {
    if (!user?.uid) return
    setActionLoading(true)
    setActionMessage("")
    try {
      await callNextPatient(user.uid, todayDate)
      setActionMessage("Next patient has been notified.")
    } catch (err) {
      setActionMessage(err.message || "Failed to call next patient.")
    } finally {
      setActionLoading(false)
      setTimeout(() => setActionMessage(""), 5000)
    }
  }, [todayDate, user?.uid])

  if (loading && appointments.length === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md w-full">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">Loading today's appointments...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  Doctor Dashboard
                </h1>
                <p className="text-gray-600 text-lg">Manage your patient queue and track appointments in real-time</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Today</p>
                  <p className="text-sm font-semibold text-gray-800">{new Date(todayDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-lg shadow-sm">
                <p className="text-sm text-amber-800">
                  {error}. Showing cached data. If this persists, please refresh the page.
                </p>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Total Today</p>
                  <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
                  <p className="text-xs text-gray-400 mt-1">Appointments</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-yellow-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Waiting</p>
                  <p className="text-3xl font-bold text-yellow-600">{waitingCount}</p>
                  <p className="text-xs text-gray-400 mt-1">In queue</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600">{inProgressCount}</p>
                  <p className="text-xs text-gray-400 mt-1">Active now</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{completedCount}</p>
                  <p className="text-xs text-gray-400 mt-1">Finished</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Control Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Next Patient Card */}
            <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl shadow-xl p-6 border border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">Next Patient</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Real-time updates
                  </p>
                </div>
              </div>

              {actionMessage && (
                <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium">
                  {actionMessage}
                </div>
              )}

              {nextPatient ? (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                        {nextPatient.queueNumber}
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-gray-800">{nextPatient.patientEmail}</p>
                        <p className="text-sm text-gray-500 mt-1">Queue #{nextPatient.queueNumber} • Waiting</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCallNext}
                    disabled={actionLoading}
                    className="w-full px-6 py-4 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-600 hover:from-blue-700 hover:via-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Calling Patient...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Call Next Patient
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 bg-white/60 rounded-xl border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-bold text-lg mb-1">No patients waiting</p>
                  <p className="text-sm text-gray-500">You're all caught up for now.</p>
                </div>
              )}
            </div>

            {/* Current Appointment Card */}
            <div className="bg-gradient-to-br from-white to-green-50/50 rounded-2xl shadow-xl p-6 border border-green-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Current Appointment</h3>
              {inProgressPatient ? (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                        {inProgressPatient.queueNumber}
                      </div>
                      <div className="flex-1">
                        <p className="text-lg font-bold text-gray-800">{inProgressPatient.patientEmail}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">In Progress</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-sm text-blue-800 flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Once completed, call next patient to notify them.</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white/60 rounded-xl border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-bold text-lg mb-1">No active appointment</p>
                  <p className="text-sm text-gray-500">Click "Call Next Patient" to begin.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link
              to="/doctor/queue"
              className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-300 hover:-translate-y-1"
            >
              <div className="flex items-start space-x-5">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 mb-2 transition-colors">
                    Patient Queue
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    View and manage your patient queue. Call patients in order and track their status in real-time.
                  </p>
                  <div className="flex items-center space-x-2 text-blue-600 font-semibold group-hover:text-blue-700">
                    <span>Manage Queue</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            <Link
              to="/doctor/discharge-summary"
              className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-300 hover:-translate-y-1"
            >
              <div className="flex items-start space-x-5">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-600 mb-2 transition-colors">
                    Discharge Summary
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Generate comprehensive discharge summaries with patient details, diagnosis, treatment plan, and dates.
                  </p>
                  <div className="flex items-center space-x-2 text-green-600 font-semibold group-hover:text-green-700">
                    <span>Create Summary</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Today's Appointments Preview */}
          {appointments.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Today's Appointments</h2>
                  <p className="text-sm text-gray-500 mt-1">{new Date(todayDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <Link
                  to="/doctor/queue"
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                >
                  View All
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="space-y-3">
                {appointments.slice(0, 5).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${
                        appointment.status === "waiting"
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-white"
                          : appointment.status === "in-progress"
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                          : "bg-gradient-to-br from-green-500 to-green-600 text-white"
                      }`}>
                        {appointment.queueNumber}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{appointment.patientEmail}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Queue #{appointment.queueNumber}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                      appointment.status === "waiting"
                        ? "bg-yellow-100 text-yellow-700"
                        : appointment.status === "in-progress"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
                {appointments.length > 5 && (
                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-500 font-medium">
                      +{appointments.length - 5} more appointment{appointments.length - 5 !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Guide */}
          <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 rounded-2xl shadow-xl p-8 border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Guide</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 text-lg">Managing Queue</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Click "Call Next Patient" to move patients from waiting to in-progress status. The system will automatically notify patients when it's their turn.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2 text-lg">Discharge Summaries</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">Create comprehensive discharge summaries with patient details, diagnosis, treatment plan, and admission/discharge dates. PDFs are automatically saved and shared with patients.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default DoctorDashboard
