import { generateDischargePDF } from "../../utils/pdfGenerator"
import { uploadPDF } from "../../firebase/storageService"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "../../firebase/db"

function DischargeSummary() {
  const handleGenerate = async () => {
    const pdf = generateDischargePDF({
      patientName: "Patient A",
      doctorName: "Dr. Kumar",
      diagnosis: "Appendicitis",
      treatment: "Surgery",
      admissionDate: "2025-01-01",
      dischargeDate: "2025-01-05",
    })

    const blob = pdf.output("blob")

    const url = await uploadPDF(
      blob,
      `discharges/patientA_${Date.now()}.pdf`
    )

    await addDoc(collection(db, "discharges"), {
      patientId: "PATIENT_ID",
      doctorId: "DOCTOR_ID",
      pdfUrl: url,
      createdAt: serverTimestamp(),
    })

    alert("Discharge summary generated ✅")
  }

  return (
    <button
      onClick={handleGenerate}
      className="bg-green-600 text-white px-4 py-2 rounded"
    >
      Generate Discharge Summary
    </button>
  )
}

export default DischargeSummary
