import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import {
  listenToNotifications,
  markAsRead,
} from "../firebase/notificationService"

function Notifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!user) return
    const unsubscribe = listenToNotifications(
      user.uid,
      setNotifications
    )
    return () => unsubscribe()
  }, [user])

  return (
    <div className="border p-4 rounded mt-4">
      <h3 className="font-bold mb-2">Notifications</h3>

      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`p-2 rounded ${
                n.read ? "bg-gray-100" : "bg-yellow-100"
              }`}
            >
              <p>{n.message}</p>
              {!n.read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="text-sm text-blue-600"
                >
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Notifications
