import { useState } from "react"
import { generateDischargePDF } from "../../utils/pdfGenerator"
import { uploadPDF } from "../../firebase/storageService"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "../../firebase/db"
import { useAuth } from "../../context/AuthContext"

function DischargeSummary() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    diagnosis: "",
    treatment: "",
    admissionDate: "",
    dischargeDate: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      const pdf = generateDischargePDF({
        patientName: formData.patientName,
        doctorName: user?.email || "Dr. Kumar",
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        admissionDate: formData.admissionDate,
        dischargeDate: formData.dischargeDate,
      })

      const blob = pdf.output("blob")

      const url = await uploadPDF(
        blob,
        `discharges/${formData.patientId}_${Date.now()}.pdf`
      )

      await addDoc(collection(db, "discharges"), {
        patientId: formData.patientId,
        doctorId: user?.uid,
        pdfUrl: url,
        createdAt: serverTimestamp(),
      })

      setMessage("Discharge summary generated successfully! ✅")
      setFormData({
        patientName: "",
        patientId: "",
        diagnosis: "",
        treatment: "",
        admissionDate: "",
        dischargeDate: "",
      })
      setTimeout(() => setMessage(""), 5000)
    } catch (error) {
      setMessage("Failed to generate discharge summary: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Generate Discharge Summary</h2>
          <p className="text-gray-600 mb-6">Create a discharge summary for your patient</p>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes("Failed") 
                ? "bg-red-50 border border-red-200 text-red-600" 
                : "bg-green-50 border border-green-200 text-green-600"
            }`}>
              <p className="text-sm font-medium">{message}</p>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Patient Name
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter patient name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Patient ID
                </label>
                <input
                  type="text"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Enter patient ID"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Diagnosis
              </label>
              <input
                type="text"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter diagnosis"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Treatment
              </label>
              <textarea
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Enter treatment details"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admission Date
                </label>
                <input
                  type="date"
                  name="admissionDate"
                  value={formData.admissionDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discharge Date
                </label>
                <input
                  type="date"
                  name="dischargeDate"
                  value={formData.dischargeDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                "Generate Discharge Summary"
              )}
            </button>
          </form>
        </div>
      </div>
  )
}

export default DischargeSummary
