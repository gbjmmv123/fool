export function readJsonStorage<T>(key: string): T | null {
  if (!import.meta.client) {
    return null
  }

  const value = localStorage.getItem(key)
  return value ? (JSON.parse(value) as T) : null
}
