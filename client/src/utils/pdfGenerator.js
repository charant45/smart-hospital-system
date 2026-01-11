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
  const total = consultationFee + surgeryFee + medicineFee

  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setFont(undefined, "bold")
  doc.text("SMART HOSPITAL", 105, 20, { align: "center" })
  
  doc.setFontSize(16)
  doc.text("FINAL BILL", 105, 30, { align: "center" })

  // Line separator
  doc.setLineWidth(0.5)
  doc.line(20, 35, 190, 35)

  // Bill details
  doc.setFontSize(12)
  doc.setFont(undefined, "normal")
  
  let yPos = 50
  doc.text(`Bill Date: ${new Date().toLocaleDateString()}`, 20, yPos)
  yPos += 10
  doc.text(`Patient Name: ${patientName}`, 20, yPos)
  
  yPos += 20
  doc.setFont(undefined, "bold")
  doc.text("Fee Breakdown:", 20, yPos)
  
  yPos += 15
  doc.setFont(undefined, "normal")
  doc.text(`Consultation Fee:`, 20, yPos)
  doc.text(`₹${consultationFee.toFixed(2)}`, 170, yPos, { align: "right" })
  
  yPos += 10
  doc.text(`Surgery Fee:`, 20, yPos)
  doc.text(`₹${surgeryFee.toFixed(2)}`, 170, yPos, { align: "right" })
  
  yPos += 10
  doc.text(`Medicine Fee:`, 20, yPos)
  doc.text(`₹${medicineFee.toFixed(2)}`, 170, yPos, { align: "right" })
  
  yPos += 15
  doc.setLineWidth(0.5)
  doc.line(20, yPos, 190, yPos)
  
  yPos += 10
  doc.setFont(undefined, "bold")
  doc.setFontSize(14)
  doc.text(`Total Amount:`, 20, yPos)
  doc.text(`₹${total.toFixed(2)}`, 170, yPos, { align: "right" })

  // Footer
  yPos = 270
  doc.setFontSize(10)
  doc.setFont(undefined, "italic")
  doc.text("Thank you for choosing Smart Hospital", 105, yPos, { align: "center" })

  return doc
}
