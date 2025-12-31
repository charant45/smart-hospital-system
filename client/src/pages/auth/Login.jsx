import { useState } from "react"
import { loginUser } from "../../firebase/authService"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async () => {
    try {
      await loginUser(email, password)
      alert("Login successful")
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
