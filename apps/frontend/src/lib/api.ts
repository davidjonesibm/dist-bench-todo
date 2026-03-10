const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function getToken(): string | null {
  // Read from localStorage directly to avoid circular dependency with auth store
  try {
    const raw = localStorage.getItem('pocketbase_auth')
    if (raw) {
      const parsed = JSON.parse(raw)
      return parsed?.token ?? null
    }
  } catch {
    // ignore
  }
  return null
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (res.status === 204) return undefined as T

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `HTTP ${res.status}`)
  }

  return data as T
}
