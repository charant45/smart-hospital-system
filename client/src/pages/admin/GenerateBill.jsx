import { generateBillPDF } from "../../utils/pdfGenerator"
import { uploadPDF } from "../../firebase/storageService"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "../../firebase/db"

function GenerateBill() {
  const handleGenerate = async () => {
    const pdf = generateBillPDF({
      patientName: "Patient A",
      consultationFee: 500,
      surgeryFee: 20000,
      medicineFee: 3000,
    })

    const blob = pdf.output("blob")

    const url = await uploadPDF(
      blob,
      `bills/bill_${Date.now()}.pdf`
    )

    await addDoc(collection(db, "bills"), {
      patientId: "PATIENT_ID",
      totalAmount: 23500,
      pdfUrl: url,
      createdAt: serverTimestamp(),
    })

    alert("Bill generated ✅")
  }

  return (
    <button
      onClick={handleGenerate}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      Generate Bill
    </button>
  )
}

export default GenerateBill
