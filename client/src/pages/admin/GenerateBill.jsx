import { useState } from "react"
import { generateBillPDF } from "../../utils/pdfGenerator"
import { uploadPDF } from "../../firebase/storageService"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "../../firebase/db"

function GenerateBill() {
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    consultationFee: "",
    surgeryFee: "",
    medicineFee: "",
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
      const totalAmount = 
        parseFloat(formData.consultationFee || 0) +
        parseFloat(formData.surgeryFee || 0) +
        parseFloat(formData.medicineFee || 0)

      const pdf = generateBillPDF({
        patientName: formData.patientName,
        consultationFee: parseFloat(formData.consultationFee || 0),
        surgeryFee: parseFloat(formData.surgeryFee || 0),
        medicineFee: parseFloat(formData.medicineFee || 0),
      })

      const blob = pdf.output("blob")

      const url = await uploadPDF(
        blob,
        `bills/bill_${formData.patientId}_${Date.now()}.pdf`
      )

      await addDoc(collection(db, "bills"), {
        patientId: formData.patientId,
        totalAmount: totalAmount,
        pdfUrl: url,
        createdAt: serverTimestamp(),
      })

      setMessage("Bill generated successfully! ✅")
      setFormData({
        patientName: "",
        patientId: "",
        consultationFee: "",
        surgeryFee: "",
        medicineFee: "",
      })
      setTimeout(() => setMessage(""), 5000)
    } catch (error) {
      setMessage("Failed to generate bill: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = 
    parseFloat(formData.consultationFee || 0) +
    parseFloat(formData.surgeryFee || 0) +
    parseFloat(formData.medicineFee || 0)

  return (
    <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Generate Bill</h2>
          <p className="text-gray-600 mb-6">Create a bill for patient services</p>

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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="Enter patient ID"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Fee Details</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Consultation Fee (₹)
                </label>
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Surgery Fee (₹)
                </label>
                <input
                  type="number"
                  name="surgeryFee"
                  value={formData.surgeryFee}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Medicine Fee (₹)
                </label>
                <input
                  type="number"
                  name="medicineFee"
                  value={formData.medicineFee}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
                <span className="text-2xl font-bold text-purple-600">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
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
                "Generate Bill"
              )}
            </button>
          </form>
        </div>
      </div>
  )
}

export default GenerateBill
