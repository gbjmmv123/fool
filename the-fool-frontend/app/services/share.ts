export interface RenderShareCardRequest {
  themeColor: string
  backgroundDataUrl: string
  qrDataUrl: string
  joinedAtText: string
  deptTitleText: string
  qrLabelText: string
}

export interface RenderShareCardResponse {
  blob: Blob
  renderTimeMs: number
}

export async function renderShareCardImage(input: RenderShareCardRequest): Promise<RenderShareCardResponse> {
  const baseURL = useRuntimeConfig().public.apiBase
  const response = await fetch(`${baseURL}/api/share/render`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const errorMessage = await readShareRenderError(response)
    throw new Error(errorMessage)
  }

  const blob = await response.blob()
  return {
    blob,
    renderTimeMs: Number(response.headers.get('x-render-time-ms') ?? '0'),
  }
}

async function readShareRenderError(response: Response) {
  const fallbackMessage = `render_share_card_failed:${response.status}`
  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    const payload = await response.json().catch(() => null) as { message?: string } | null
    return payload?.message?.trim() || fallbackMessage
  }

  const text = await response.text().catch(() => '')
  return text.trim() || fallbackMessage
}
