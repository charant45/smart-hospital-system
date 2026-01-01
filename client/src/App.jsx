import Login from "./pages/auth/Login"
import { useAuth } from "./context/AuthContext"

function App() {
  const { user, role, loading } = useAuth()

  if (loading) {
    return <h1 className="text-center mt-10">Loading...</h1>
  }

  if (!user) {
    return <Login />
  }

  return (
    <div className="text-center mt-10">
      <h1 className="text-2xl font-bold text-green-600">
        Logged in successfully ✅
      </h1>
      <p>User: {user.email}</p>
      <p>Role: {role}</p>
    </div>
  )
}

export default App
