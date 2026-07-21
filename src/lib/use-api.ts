"use client"

import { useState, useEffect, useCallback } from "react"
import { auth } from "@/lib/firebase/auth"

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    headers["Authorization"] = `Bearer ${token}`
  }
  return headers
}

interface UseApiResult<T> {
  data: T[]
  loading: boolean
  error: string | null
  create: (item: Partial<T>) => Promise<T>
  update: (id: string, item: Partial<T>) => Promise<T>
  remove: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useApi<T extends { id?: string }>(resource: string): UseApiResult<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const headers = await getAuthHeaders()
      const res = await fetch(resource, { headers })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const json = await res.json()
      setData(Array.isArray(json) ? json : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar")
    } finally {
      setLoading(false)
    }
  }, [resource])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const create = useCallback(async (item: Partial<T>): Promise<T> => {
    const headers = await getAuthHeaders()
    const res = await fetch(resource, {
      method: "POST",
      headers,
      body: JSON.stringify(item),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Erro ao criar" }))
      throw new Error(err.error || "Erro ao criar")
    }
    const created = await res.json()
    setData((prev) => [...prev, created])
    return created
  }, [resource])

  const update = useCallback(async (id: string, item: Partial<T>): Promise<T> => {
    const headers = await getAuthHeaders()
    const res = await fetch(`${resource}/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(item),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Erro ao atualizar" }))
      throw new Error(err.error || "Erro ao atualizar")
    }
    const updated = await res.json()
    setData((prev) => prev.map((d) => (d.id === id ? updated : d)))
    return updated
  }, [resource])

  const remove = useCallback(async (id: string): Promise<void> => {
    const headers = await getAuthHeaders()
    const res = await fetch(`${resource}/${id}`, { method: "DELETE", headers })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Erro ao excluir" }))
      throw new Error(err.error || "Erro ao excluir")
    }
    setData((prev) => prev.filter((d) => d.id !== id))
  }, [resource])

  return { data, loading, error, create, update, remove, refresh: fetchAll }
}
