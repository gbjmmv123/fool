export function formatDateTime(value: string | number | Date) {
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}
