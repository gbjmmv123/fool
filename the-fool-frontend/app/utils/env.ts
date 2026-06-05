export function isWechat(): boolean {
  if (!import.meta.client) return false
  return /MicroMessenger/i.test(window.navigator.userAgent)
}
