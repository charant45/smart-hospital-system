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
      // Validation
      if (!formData.patientName.trim()) {
        setMessage("Please enter patient name")
        setLoading(false)
        return
      }

      if (!formData.patientId.trim()) {
        setMessage("Please enter patient ID")
        setLoading(false)
        return
      }

      const consultationFee = parseFloat(formData.consultationFee || 0)
      const surgeryFee = parseFloat(formData.surgeryFee || 0)
      const medicineFee = parseFloat(formData.medicineFee || 0)
      const totalAmount = consultationFee + surgeryFee + medicineFee

      if (totalAmount <= 0) {
        setMessage("Please enter at least one fee amount")
        setLoading(false)
        return
      }

      // Generate PDF
      const pdf = generateBillPDF({
        patientName: formData.patientName,
        consultationFee: consultationFee,
        surgeryFee: surgeryFee,
        medicineFee: medicineFee,
      })

      // Create blob and download PDF
      const blob = pdf.output("blob")
      const fileName = `bill_${formData.patientId}_${Date.now()}.pdf`
      
      // Download PDF immediately
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Upload to Firebase Storage and save to Firestore (non-blocking)
      try {
        const storageUrl = await uploadPDF(blob, `bills/${fileName}`)

        await addDoc(collection(db, "bills"), {
          patientName: formData.patientName,
          patientId: formData.patientId,
          consultationFee: consultationFee,
          surgeryFee: surgeryFee,
          medicineFee: medicineFee,
          totalAmount: totalAmount,
          pdfUrl: storageUrl,
          createdAt: serverTimestamp(),
        })
      } catch (storageError) {
        console.warn("Failed to upload to storage, but PDF was downloaded:", storageError)
        // Still save to Firestore without URL if storage fails
        try {
          await addDoc(collection(db, "bills"), {
            patientName: formData.patientName,
            patientId: formData.patientId,
            consultationFee: consultationFee,
            surgeryFee: surgeryFee,
            medicineFee: medicineFee,
            totalAmount: totalAmount,
            pdfUrl: null,
            createdAt: serverTimestamp(),
            note: "PDF downloaded but storage upload failed"
          })
        } catch (dbError) {
          console.error("Failed to save to database:", dbError)
        }
      }

      setMessage("Bill generated and downloaded successfully! ✅")
      setFormData({
        patientName: "",
        patientId: "",
        consultationFee: "",
        surgeryFee: "",
        medicineFee: "",
      })
      setTimeout(() => setMessage(""), 5000)
    } catch (error) {
      console.error("Error generating bill:", error)
      setMessage("Failed to generate bill: " + (error.message || "Unknown error occurred"))
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = 
    parseFloat(formData.consultationFee || 0) +
    parseFloat(formData.surgeryFee || 0) +
    parseFloat(formData.medicineFee || 0)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Generate Bill</h2>
          <p className="text-gray-600">Create and download bills for patient services</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
            message.includes("Failed") 
              ? "bg-red-50 border border-red-200 text-red-600" 
              : "bg-green-50 border border-green-200 text-green-600"
          }`}>
            {message.includes("Failed") ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <p className="text-sm font-medium flex-1">{message}</p>
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Patient Information Section */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">👤</span>
              Patient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Patient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white"
                  placeholder="Enter patient name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Patient ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white"
                  placeholder="Enter patient ID"
                />
              </div>
            </div>
          </div>

          {/* Fee Details Section */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">💰</span>
              Fee Details
            </h3>
            <div className="space-y-4">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Consultation Fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Surgery Fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="surgeryFee"
                    value={formData.surgeryFee}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Medicine Fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="medicineFee"
                    value={formData.medicineFee}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Total Amount Display */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-lg font-semibold text-gray-700">Total Amount</span>
                <p className="text-sm text-gray-500 mt-1">All fees included</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-purple-600">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Generate & Download Bill</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default GenerateBill
