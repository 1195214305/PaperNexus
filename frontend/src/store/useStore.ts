import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Paper, UserSettings, PaperChat } from '../types'

interface AppState {
  // 文献列表
  papers: Paper[]
  addPaper: (paper: Paper) => void
  updatePaper: (id: string, updates: Partial<Paper>) => void
  deletePaper: (id: string) => void

  // 用户设置
  settings: UserSettings
  updateSettings: (settings: Partial<UserSettings>) => void

  // 对话历史
  chats: PaperChat[]
  addMessage: (paperId: string, message: { role: 'user' | 'assistant'; content: string }) => void
  clearChat: (paperId: string) => void

  // UI 状态
  selectedPaperId: string | null
  setSelectedPaperId: (id: string | null) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // 文献管理
      papers: [],
      addPaper: (paper) =>
        set((state) => ({
          papers: [paper, ...state.papers],
        })),
      updatePaper: (id, updates) =>
        set((state) => ({
          papers: state.papers.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      deletePaper: (id) =>
        set((state) => ({
          papers: state.papers.filter((p) => p.id !== id),
          selectedPaperId: state.selectedPaperId === id ? null : state.selectedPaperId,
        })),

      // 设置
      settings: {
        qwenApiKey: '',
        qwenApiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        autoAnalyze: true,
        summaryDepth: 'standard',
      },
      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),

      // 对话
      chats: [],
      addMessage: (paperId, message) =>
        set((state) => {
          const existingChat = state.chats.find((c) => c.paperId === paperId)
          const newMessage = {
            id: Date.now().toString(),
            ...message,
            timestamp: new Date().toISOString(),
          }

          if (existingChat) {
            return {
              chats: state.chats.map((c) =>
                c.paperId === paperId
                  ? { ...c, messages: [...c.messages, newMessage] }
                  : c
              ),
            }
          } else {
            return {
              chats: [...state.chats, { paperId, messages: [newMessage] }],
            }
          }
        }),
      clearChat: (paperId) =>
        set((state) => ({
          chats: state.chats.filter((c) => c.paperId !== paperId),
        })),

      // UI
      selectedPaperId: null,
      setSelectedPaperId: (id) => set({ selectedPaperId: id }),
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: 'papernexus-storage',
    }
  )
)
