export interface RenderBadgeRequest {
  name: string
  role: string
  idText: string
  themeColor: string
  avatarDataUrl: string
}

export interface RenderBadgeResponse {
  blob: Blob
  renderTimeMs: number
}

export async function renderBadgeImage(input: RenderBadgeRequest): Promise<RenderBadgeResponse> {
  const baseURL = useRuntimeConfig().public.apiBase
  const response = await fetch(`${baseURL}/api/badge/render`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    useDialog().openErrorModal()
    throw new Error(`render_badge_failed:${response.status}`)
  }

  const blob = await response.blob()
  return {
    blob,
    renderTimeMs: Number(response.headers.get('x-render-time-ms') ?? '0'),
  }
}
