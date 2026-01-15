import { useEffect, useState } from "react"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "../../firebase/db"
import { useAuth } from "../../context/AuthContext"
import { listenToPatientAppointments } from "../../firebase/appointmentService"

function MedicalHistory() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [appointments, setAppointments] = useState([])
  const [bills, setBills] = useState([])
  const [discharges, setDischarges] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    totalBills: 0,
    totalAmount: 0,
    totalReports: 0,
  })

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false)
      return
    }

    let unsubscribeAppointments = () => {}

    const fetchAllData = async () => {
      setLoading(true)
      try {
        // Fetch appointments (real-time listener)
        unsubscribeAppointments = listenToPatientAppointments(user.uid, (data) => {
          setAppointments(data || [])
          
          // Recalculate stats when appointments update
          const completedApps = (data || []).filter((a) => a.status === "completed")
          setStats((prevStats) => ({
            ...prevStats,
            totalAppointments: (data || []).length,
            completedAppointments: completedApps.length,
          }))
        })

        // Fetch bills
        const billsQuery = query(
          collection(db, "bills"),
          where("patientId", "==", user.uid),
          orderBy("createdAt", "desc")
        )
        const billsSnapshot = await getDocs(billsQuery)
        const billsData = billsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setBills(billsData)

        // Fetch discharge summaries
        const dischargesQuery = query(
          collection(db, "discharges"),
          where("patientId", "==", user.uid),
          orderBy("createdAt", "desc")
        )
        const dischargesSnapshot = await getDocs(dischargesQuery)
        const dischargesData = dischargesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setDischarges(dischargesData)

        // Calculate stats
        const totalBillsAmount = billsData.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0)

        setStats((prevStats) => ({
          ...prevStats,
          totalBills: billsData.length,
          totalAmount: totalBillsAmount,
          totalReports: dischargesData.length,
        }))

        setLoading(false)
      } catch (error) {
        console.error("Error fetching medical history:", error)
        setLoading(false)
      }
    }

    fetchAllData()

    return () => {
      if (unsubscribeAppointments && typeof unsubscribeAppointments === 'function') {
        unsubscribeAppointments()
      }
    }
  }, [user])

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md w-full">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your medical history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Medical History
          </h1>
          <p className="text-gray-600 text-lg">Complete overview of your health records and medical information</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Total Appointments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAppointments}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedAppointments}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Total Bills</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalBills}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-yellow-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Total Spent</p>
                <p className="text-3xl font-bold text-yellow-600">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex flex-wrap">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-4 font-semibold text-sm transition-all duration-200 ${
                  activeTab === "overview"
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-b-2 border-green-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-green-600"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("appointments")}
                className={`px-6 py-4 font-semibold text-sm transition-all duration-200 ${
                  activeTab === "appointments"
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-b-2 border-green-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-green-600"
                }`}
              >
                Appointments ({appointments.length})
              </button>
              <button
                onClick={() => setActiveTab("bills")}
                className={`px-6 py-4 font-semibold text-sm transition-all duration-200 ${
                  activeTab === "bills"
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-b-2 border-green-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-green-600"
                }`}
              >
                Bills ({bills.length})
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-6 py-4 font-semibold text-sm transition-all duration-200 ${
                  activeTab === "reports"
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-b-2 border-green-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-green-600"
                }`}
              >
                Reports ({discharges.length})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Total Appointments</p>
                      <p className="text-2xl font-bold text-gray-800">{stats.totalAppointments}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Completed</p>
                      <p className="text-2xl font-bold text-green-600">{stats.completedAppointments}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Total Bills</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.totalBills}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Total Amount Spent</p>
                      <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.totalAmount)}</p>
                    </div>
                  </div>
                </div>

                {appointments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Appointments</h3>
                    <div className="space-y-3">
                      {appointments.slice(0, 5).map((appointment) => (
                        <div
                          key={appointment.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div>
                            <p className="font-semibold text-gray-800">{appointment.doctorName}</p>
                            <p className="text-sm text-gray-500">{formatDate(appointment.date)}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              appointment.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : appointment.status === "in-progress"
                                ? "bg-blue-100 text-blue-700"
                                : appointment.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {appointment.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "appointments" && (
              <div>
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg font-medium">No appointments found</p>
                    <p className="text-gray-400 text-sm mt-2">Your appointment history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                                {appointment.queueNumber}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-800">{appointment.doctorName}</h3>
                                <p className="text-sm text-gray-500">Appointment Date: {formatDate(appointment.date)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-4">
                              <span
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${
                                  appointment.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : appointment.status === "in-progress"
                                    ? "bg-blue-100 text-blue-700"
                                    : appointment.status === "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {appointment.status}
                              </span>
                              {appointment.createdAt && (
                                <span className="text-xs text-gray-500">
                                  Booked: {formatDate(appointment.createdAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "bills" && (
              <div>
                {bills.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg font-medium">No bills found</p>
                    <p className="text-gray-400 text-sm mt-2">Your billing history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bills.map((bill) => (
                      <div
                        key={bill.id}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-purple-50/30"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Bill #{bill.id.slice(0, 8)}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Consultation</p>
                                <p className="text-sm font-semibold text-gray-800">{formatCurrency(bill.consultationFee || 0)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Surgery</p>
                                <p className="text-sm font-semibold text-gray-800">{formatCurrency(bill.surgeryFee || 0)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Medicine</p>
                                <p className="text-sm font-semibold text-gray-800">{formatCurrency(bill.medicineFee || 0)}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Date</p>
                                <p className="text-sm font-medium text-gray-700">{formatDate(bill.createdAt)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                                <p className="text-xl font-bold text-purple-600">{formatCurrency(bill.totalAmount || 0)}</p>
                              </div>
                            </div>
                          </div>
                          {bill.pdfUrl && (
                            <a
                              href={bill.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center space-x-2 shadow-md hover:shadow-lg"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>Download</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "reports" && (
              <div>
                {discharges.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg font-medium">No reports found</p>
                    <p className="text-gray-400 text-sm mt-2">Your discharge summaries will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {discharges.map((report) => (
                      <div
                        key={report.id}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-green-50/30"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800 text-lg">Discharge Summary</h3>
                              <p className="text-sm text-gray-500 mt-1">
                                Generated: {formatDate(report.createdAt)}
                              </p>
                            </div>
                          </div>
                          {report.pdfUrl && (
                            <a
                              href={report.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2 shadow-md hover:shadow-lg"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>Download</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicalHistory

