"use client"

import { useState, useEffect } from "react"
import { auth, onAuthChange } from "@/lib/auth/client"
import type { User } from "firebase/auth"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return { user, loading }
}
