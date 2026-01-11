import { useEffect, useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../../firebase/db"
import { useAuth } from "../../context/AuthContext"

function Reports() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])

  useEffect(() => {
    const fetchReports = async () => {
      const q = query(
        collection(db, "discharges"),
        where("patientId", "==", user.uid)
      )
      const snap = await getDocs(q)
      setReports(snap.docs.map(d => d.data()))
    }
    fetchReports()
  }, [])

  return (
    <div>
      <h2 className="font-bold mb-4">My Reports</h2>
      {reports.map((r, i) => (
        <a
          key={i}
          href={r.pdfUrl}
          target="_blank"
          className="block text-blue-600 underline"
        >
          Download Discharge Summary
        </a>
      ))}
    </div>
  )
}

export default Reports
