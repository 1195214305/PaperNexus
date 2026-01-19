import { FileText, Calendar, Users, Loader2 } from 'lucide-react'
import type { Paper } from '../types'

interface PaperCardProps {
  paper: Paper
  onClick: () => void
  isSelected: boolean
}

export default function PaperCard({ paper, onClick, isSelected }: PaperCardProps) {
  return (
    <div
      onClick={onClick}
      className={`paper-card p-4 cursor-pointer ${
        isSelected ? 'border-stone-900 bg-stone-50' : ''
      }`}
    >
      {/* 状态指示器 */}
      {paper.status === 'analyzing' && (
        <div className="flex items-center space-x-2 mb-3 text-stone-600">
          <Loader2 size={14} className="animate-spin" />
          <span className="text-xs">AI 分析中...</span>
        </div>
      )}

      {/* 标题 */}
      <h3 className="font-semibold text-stone-900 mb-2 line-clamp-2">
        {paper.title}
      </h3>

      {/* 作者 */}
      <div className="flex items-center space-x-2 text-sm text-stone-600 mb-2">
        <Users size={14} />
        <span className="line-clamp-1">{paper.authors.join(', ')}</span>
      </div>

      {/* 元信息 */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center space-x-1">
          <Calendar size={12} />
          <span>{paper.year}</span>
        </div>
        <div className="flex items-center space-x-1">
          <FileText size={12} />
          <span>{paper.source}</span>
        </div>
      </div>

      {/* 摘要预览 */}
      {paper.summary && (
        <div className="mt-3 pt-3 border-t border-stone-200">
          <p className="text-xs text-stone-600 line-clamp-2">
            {paper.summary.overview}
          </p>
        </div>
      )}

      {/* 标签 */}
      {paper.tags && paper.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {paper.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="paper-badge bg-stone-100 text-stone-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
