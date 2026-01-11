import { useEffect, useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../../firebase/db"
import { useAuth } from "../../context/AuthContext"

function Reports() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return
    
    const fetchReports = async () => {
      try {
        const q = query(
          collection(db, "discharges"),
          where("patientId", "==", user.uid)
        )
        const snap = await getDocs(q)
        setReports(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      } catch (error) {
        console.error("Error fetching reports:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [user])

  return (
    <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">My Reports</h2>
          <p className="text-gray-600 mb-6">Access your medical reports and discharge summaries</p>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-500">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-500 text-lg">No reports available</p>
              <p className="text-gray-400 text-sm mt-2">Your discharge summaries will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report, index) => (
                <div
                  key={report.id || index}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📋</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          Discharge Summary
                        </h3>
                        <p className="text-sm text-gray-500">
                          {report.createdAt?.toDate?.().toLocaleDateString() || "Report"}
                        </p>
                      </div>
                    </div>
                    <a
                      href={report.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
                    >
                      <span>Download</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  )
}

export default Reports
