export async function apiRequest<T>(
  url: string,
  options?: Parameters<typeof $fetch<T>>[1],
  config?: { silent?: boolean },
) {
  const baseURL = useRuntimeConfig().public.apiBase
  try {
    return await $fetch<T>(url, {
      baseURL,
      ...options,
    })
  } catch (e) {
    if (!config?.silent) useDialog().openErrorModal()
    throw e
  }
}
