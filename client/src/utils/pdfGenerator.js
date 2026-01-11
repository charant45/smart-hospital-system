import jsPDF from "jspdf"

export const generateDischargePDF = ({
  patientName,
  doctorName,
  diagnosis,
  treatment,
  admissionDate,
  dischargeDate,
}) => {
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text("DISCHARGE SUMMARY", 20, 20)

  doc.setFontSize(12)
  doc.text(`Patient Name: ${patientName}`, 20, 40)
  doc.text(`Doctor: ${doctorName}`, 20, 50)
  doc.text(`Diagnosis: ${diagnosis}`, 20, 60)
  doc.text(`Treatment: ${treatment}`, 20, 70)
  doc.text(`Admission Date: ${admissionDate}`, 20, 80)
  doc.text(`Discharge Date: ${dischargeDate}`, 20, 90)

  return doc
}

export const generateBillPDF = ({
  patientName,
  consultationFee,
  surgeryFee,
  medicineFee,
}) => {
  const total =
    consultationFee + surgeryFee + medicineFee

  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text("FINAL BILL", 20, 20)

  doc.setFontSize(12)
  doc.text(`Patient Name: ${patientName}`, 20, 40)
  doc.text(`Consultation Fee: ₹${consultationFee}`, 20, 60)
  doc.text(`Surgery Fee: ₹${surgeryFee}`, 20, 70)
  doc.text(`Medicine Fee: ₹${medicineFee}`, 20, 80)
  doc.text(`Total Amount: ₹${total}`, 20, 100)

  return doc
}
