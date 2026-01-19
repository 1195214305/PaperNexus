import { useState, useRef } from 'react'
import { Upload, Search, Loader2, FileText } from 'lucide-react'
import { useStore } from '../store/useStore'
import { uploadAndAnalyzePaper } from '../utils/api'
import { extractTextFromPdf, truncateText } from '../utils/pdfExtractor'
import PaperCard from './PaperCard'

export default function PaperList() {
  const { papers, addPaper, updatePaper, selectedPaperId, setSelectedPaperId, settings } = useStore()
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!settings.qwenApiKey) {
      alert('请先在设置中配置千问 API Key')
      return
    }

    setUploading(true)

    // 创建临时文献记录
    const tempPaper = {
      id: Date.now().toString(),
      title: file.name.replace('.pdf', ''),
      authors: [],
      abstract: '',
      year: new Date().getFullYear(),
      source: '上传',
      uploadedAt: new Date().toISOString(),
      status: 'analyzing' as const,
    }

    addPaper(tempPaper)
    setSelectedPaperId(tempPaper.id)

    try {
      // 第一步：在前端提取PDF文本（避免边缘函数超时）
      const extractionResult = await extractTextFromPdf(file)

      // 截取文本前8000字符（避免API调用过大）
      const truncatedText = truncateText(extractionResult.text, 8000)

      // 第二步：将提取的文本发送到后端进行AI分析
      const result = await uploadAndAnalyzePaper(
        extractionResult.title || file.name.replace('.pdf', ''),
        truncatedText,
        extractionResult.pageCount,
        settings
      )

      if (result.success && result.data) {
        updatePaper(tempPaper.id, {
          ...result.data,
          status: 'completed',
        })
      } else {
        updatePaper(tempPaper.id, {
          status: 'failed',
        })
        alert('分析失败: ' + (result.error || '未知错误'))
      }
    } catch (error) {
      updatePaper(tempPaper.id, {
        status: 'failed',
      })
      alert('上传失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const filteredPapers = papers.filter((paper) =>
    paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    paper.authors.some((author) => author.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="flex flex-col h-full bg-stone-50">
      {/* 搜索和上传 */}
      <div className="p-4 bg-white border-b border-stone-200">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="搜索文献..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-stone-300 focus:outline-none focus:border-stone-500 transition-colors"
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {uploading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>上传中...</span>
            </>
          ) : (
            <>
              <Upload size={18} />
              <span>上传 PDF 文献</span>
            </>
          )}
        </button>
      </div>

      {/* 文献列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredPapers.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            <FileText size={48} className="mx-auto mb-4 text-stone-300" />
            <p>暂无文献</p>
            <p className="text-sm mt-2">上传 PDF 文献开始使用</p>
          </div>
        ) : (
          filteredPapers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              onClick={() => setSelectedPaperId(paper.id)}
              isSelected={selectedPaperId === paper.id}
            />
          ))
        )}
      </div>
    </div>
  )
}
