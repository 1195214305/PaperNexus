import type { ApiResponse, AnalyzeRequest, Paper } from '../types'

const API_BASE = '/api'

// 上传并分析文献
export async function uploadAndAnalyzePaper(
  file: File,
  settings: { qwenApiKey: string; qwenApiUrl: string; summaryDepth: string }
): Promise<ApiResponse<Paper>> {
  try {
    const formData = new FormData()
    formData.append('pdf', file)
    formData.append('apiKey', settings.qwenApiKey)
    formData.append('apiUrl', settings.qwenApiUrl)
    formData.append('depth', settings.summaryDepth)

    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('上传分析失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '上传失败',
    }
  }
}

// 追问文献
export async function askPaperQuestion(
  paperId: string,
  question: string,
  settings: { qwenApiKey: string; qwenApiUrl: string }
): Promise<ApiResponse<{ answer: string }>> {
  try {
    const response = await fetch(`${API_BASE}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paperId,
        question,
        apiKey: settings.qwenApiKey,
        apiUrl: settings.qwenApiUrl,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('提问失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '提问失败',
    }
  }
}

// 生成学术海报
export async function generatePoster(
  paperId: string,
  summary: string,
  settings: { qwenApiKey: string }
): Promise<ApiResponse<{ posterUrl: string }>> {
  try {
    const response = await fetch(`${API_BASE}/poster`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paperId,
        summary,
        apiKey: settings.qwenApiKey,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('生成海报失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '生成海报失败',
    }
  }
}

// 健康检查
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`)
    return response.ok
  } catch {
    return false
  }
}
