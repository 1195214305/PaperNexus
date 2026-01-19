import { useState } from 'react'
import { Send, Trash2, Image as ImageIcon, Loader2, FileText } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { useStore } from '../store/useStore'
import { askPaperQuestion, generatePoster } from '../utils/api'

export default function PaperDetail() {
  const { papers, selectedPaperId, deletePaper, chats, addMessage, settings } = useStore()
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatingPoster, setGeneratingPoster] = useState(false)

  const paper = papers.find((p) => p.id === selectedPaperId)
  const chat = chats.find((c) => c.paperId === selectedPaperId)

  if (!paper) {
    return (
      <div className="flex items-center justify-center h-full text-stone-500">
        <div className="text-center">
          <FileText size={64} className="mx-auto mb-4 text-stone-300" />
          <p>请选择一篇文献</p>
        </div>
      </div>
    )
  }

  const handleAsk = async () => {
    if (!question.trim() || !settings.qwenApiKey) return

    const userQuestion = question.trim()
    setQuestion('')
    setLoading(true)

    addMessage(paper.id, { role: 'user', content: userQuestion })

    try {
      const result = await askPaperQuestion(paper.id, userQuestion, settings)

      if (result.success && result.data) {
        addMessage(paper.id, { role: 'assistant', content: result.data.answer })
      } else {
        addMessage(paper.id, {
          role: 'assistant',
          content: '抱歉，回答失败: ' + (result.error || '未知错误'),
        })
      }
    } catch (error) {
      addMessage(paper.id, {
        role: 'assistant',
        content: '抱歉，发生错误: ' + (error instanceof Error ? error.message : '未知错误'),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePoster = async () => {
    if (!paper.summary || !settings.qwenApiKey) return

    setGeneratingPoster(true)
    try {
      const result = await generatePoster(paper.id, paper.summary.overview, paper.title, settings)
      if (result.success && result.data) {
        // 更新paper的summary，添加posterUrl
        const { updatePaper } = useStore.getState()
        updatePaper(paper.id, {
          summary: {
            ...paper.summary,
            posterUrl: result.data.posterUrl,
          },
        })
        alert('海报生成成功！请向下滚动查看')
      } else {
        alert('生成失败: ' + (result.error || '未知错误'))
      }
    } catch (error) {
      alert('生成失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setGeneratingPoster(false)
    }
  }

  const handleDelete = () => {
    if (confirm('确定要删除这篇文献吗？')) {
      deletePaper(paper.id)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 头部 */}
      <div className="border-b border-stone-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="paper-title flex-1">{paper.title}</h2>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-stone-100 transition-colors text-stone-600"
            title="删除文献"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-stone-600 mb-4">
          <div>
            <span className="font-medium">作者：</span>
            {paper.authors.join(', ') || '未知'}
          </div>
          <div>
            <span className="font-medium">年份：</span>
            {paper.year}
          </div>
          <div>
            <span className="font-medium">来源：</span>
            {paper.source}
          </div>
        </div>

        {paper.tags && paper.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {paper.tags.map((tag, idx) => (
              <span key={idx} className="paper-badge bg-stone-100 text-stone-700">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto p-6">
        {paper.status === 'analyzing' && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 size={48} className="mx-auto mb-4 animate-spin text-stone-400" />
              <p className="text-stone-600">AI 正在分析文献...</p>
              <p className="text-sm text-stone-500 mt-2">这可能需要几分钟时间</p>
            </div>
          </div>
        )}

        {paper.status === 'failed' && (
          <div className="text-center py-12 text-red-600">
            <p>分析失败</p>
            <p className="text-sm mt-2">请重新上传或检查 API 配置</p>
          </div>
        )}

        {paper.status === 'completed' && paper.summary && (
          <div className="space-y-6">
            {/* 生成海报按钮 */}
            {!paper.summary.posterUrl && (
              <button
                onClick={handleGeneratePoster}
                disabled={generatingPoster}
                className="btn-secondary w-full flex items-center justify-center space-x-2"
              >
                {generatingPoster ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>生成中（约30秒）...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={18} />
                    <span>生成学术海报图片</span>
                  </>
                )}
              </button>
            )}

            {/* 学术海报图片 */}
            {paper.summary.posterUrl && (
              <div className="paper-card p-4 bg-stone-50">
                <h3 className="text-lg font-semibold text-stone-900 mb-4 flex items-center">
                  <ImageIcon size={20} className="mr-2" />
                  学术海报
                </h3>
                <img
                  src={paper.summary.posterUrl}
                  alt="学术海报"
                  className="w-full rounded shadow-lg"
                />
              </div>
            )}

            {/* AI 摘要 */}
            <div className="markdown-body">
              <h3>概述</h3>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {paper.summary.overview}
              </ReactMarkdown>

              <h3>研究背景</h3>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {paper.summary.background}
              </ReactMarkdown>

              <h3>研究方法</h3>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {paper.summary.methods}
              </ReactMarkdown>

              <h3>研究结果</h3>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {paper.summary.results}
              </ReactMarkdown>

              <h3>结论</h3>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {paper.summary.conclusion}
              </ReactMarkdown>

              <h3>关键要点</h3>
              <ul>
                {paper.summary.keyPoints.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>

            {/* 对话历史 */}
            {chat && chat.messages.length > 0 && (
              <div className="space-y-4 mt-8 pt-8 border-t border-stone-200">
                <h3 className="font-semibold text-stone-900">追问记录</h3>
                {chat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 ${
                      msg.role === 'user'
                        ? 'bg-stone-100 ml-8'
                        : 'bg-white border border-stone-200 mr-8'
                    }`}
                  >
                    <div className="text-xs text-stone-500 mb-2">
                      {msg.role === 'user' ? '你' : 'AI 助手'}
                    </div>
                    <div className="markdown-body">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 追问输入框 */}
      {paper.status === 'completed' && (
        <div className="border-t border-stone-200 p-4 bg-stone-50">
          <div className="flex space-x-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="对这篇文献有什么疑问？"
              disabled={loading}
              className="flex-1 px-4 py-2 border border-stone-300 focus:outline-none focus:border-stone-500 transition-colors"
            />
            <button
              onClick={handleAsk}
              disabled={loading || !question.trim()}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
