import { useState } from "react"
import { registerUser } from "../../firebase/authService"
import { saveUserRole } from "../../firebase/userService"

function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("patient")

  const handleRegister = async () => {
    try {
      const res = await registerUser(email, password)

      await saveUserRole(res.user.uid, {
        email,
        role,
        createdAt: Date.now(),
      })

      alert("Registered successfully")
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Register</h2>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="border p-2 w-full mb-2"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <select
        className="border p-2 w-full mb-4"
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="patient">Patient</option>
        <option value="doctor">Doctor</option>
        <option value="admin">Admin</option>
      </select>

      <button
        onClick={handleRegister}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Register
      </button>
    </div>
  )
}

export default Register
