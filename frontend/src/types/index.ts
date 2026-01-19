// 文献类型定义
export interface Paper {
  id: string
  title: string
  authors: string[]
  abstract: string
  year: number
  source: string
  pdfUrl?: string
  uploadedAt: string
  status: 'pending' | 'analyzing' | 'completed' | 'failed'
  summary?: PaperSummary
  tags?: string[]
}

// 文献摘要
export interface PaperSummary {
  overview: string
  background: string
  methods: string
  results: string
  conclusion: string
  keyPoints: string[]
  generatedAt: string
  posterUrl?: string
  posterContent?: string
}

// 用户设置
export interface UserSettings {
  qwenApiKey: string
  qwenApiUrl: string
  autoAnalyze: boolean
  summaryDepth: 'quick' | 'standard' | 'deep'
}

// API 响应
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// 分析请求
export interface AnalyzeRequest {
  paperId: string
  pdfContent: string
  depth: 'quick' | 'standard' | 'deep'
}

// 追问对话
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface PaperChat {
  paperId: string
  messages: ChatMessage[]
}
