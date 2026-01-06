import { useState } from "react"
import { loginUser } from "../../firebase/authService"
import { getUserRole } from "../../firebase/userService"
import { useNavigate } from "react-router-dom"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      // 1️⃣ Login user
      const res = await loginUser(email, password)

      // 2️⃣ Get role from Firestore
      const userData = await getUserRole(res.user.uid)

      // 3️⃣ Redirect based on role
      if (userData.role === "patient") navigate("/patient")
      else if (userData.role === "doctor") navigate("/doctor")
      else if (userData.role === "admin") navigate("/admin")
      else navigate("/unauthorized")

    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="border p-6 rounded w-96">
        <h2 className="text-xl font-bold mb-4">Login</h2>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="border p-2 w-full mb-4"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-green-600 text-white w-full py-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  )
}

export default Login
