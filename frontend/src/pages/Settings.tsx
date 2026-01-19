import { useState } from 'react'
import { Save, Key, Settings as SettingsIcon, ArrowLeft } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const { settings, updateSettings } = useStore()
  const navigate = useNavigate()
  const [formData, setFormData] = useState(settings)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    updateSettings(formData)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>返回</span>
          </button>
          <div className="flex items-center space-x-3">
            <SettingsIcon size={32} className="text-stone-900" />
            <div>
              <h1 className="text-3xl font-semibold text-stone-900">设置</h1>
              <p className="text-stone-600 mt-1">配置千问 API 和分析选项</p>
            </div>
          </div>
        </div>

        {/* 设置表单 */}
        <div className="glass-panel p-8 space-y-6">
          {/* API Key */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-stone-900 mb-2">
              <Key size={16} />
              <span>千问 API Key</span>
            </label>
            <input
              type="password"
              value={formData.qwenApiKey}
              onChange={(e) =>
                setFormData({ ...formData, qwenApiKey: e.target.value })
              }
              placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-stone-500 transition-colors font-mono text-sm"
            />
            <p className="text-xs text-stone-500 mt-2">
              在{' '}
              <a
                href="https://dashscope.aliyun.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-stone-700"
              >
                阿里云百炼平台
              </a>{' '}
              获取 API Key
            </p>
          </div>

          {/* API URL */}
          <div>
            <label className="block text-sm font-medium text-stone-900 mb-2">
              API 地址
            </label>
            <input
              type="text"
              value={formData.qwenApiUrl}
              onChange={(e) =>
                setFormData({ ...formData, qwenApiUrl: e.target.value })
              }
              placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1"
              className="w-full px-4 py-3 border border-stone-300 focus:outline-none focus:border-stone-500 transition-colors font-mono text-sm"
            />
            <p className="text-xs text-stone-500 mt-2">
              使用千问兼容 OpenAI 的 API 格式
            </p>
          </div>

          {/* 自动分析 */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.autoAnalyze}
                onChange={(e) =>
                  setFormData({ ...formData, autoAnalyze: e.target.checked })
                }
                className="w-5 h-5 border-stone-300 text-stone-900 focus:ring-stone-500"
              />
              <div>
                <div className="text-sm font-medium text-stone-900">
                  自动分析上传的文献
                </div>
                <div className="text-xs text-stone-500">
                  上传 PDF 后立即开始 AI 分析
                </div>
              </div>
            </label>
          </div>

          {/* 分析深度 */}
          <div>
            <label className="block text-sm font-medium text-stone-900 mb-3">
              分析深度
            </label>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="depth"
                  value="quick"
                  checked={formData.summaryDepth === 'quick'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      summaryDepth: e.target.value as any,
                    })
                  }
                  className="mt-1 w-4 h-4 border-stone-300 text-stone-900 focus:ring-stone-500"
                />
                <div>
                  <div className="text-sm font-medium text-stone-900">
                    快速分析
                  </div>
                  <div className="text-xs text-stone-500">
                    提取核心要点，适合快速浏览（约 1-2 分钟）
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="depth"
                  value="standard"
                  checked={formData.summaryDepth === 'standard'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      summaryDepth: e.target.value as any,
                    })
                  }
                  className="mt-1 w-4 h-4 border-stone-300 text-stone-900 focus:ring-stone-500"
                />
                <div>
                  <div className="text-sm font-medium text-stone-900">
                    标准分析（推荐）
                  </div>
                  <div className="text-xs text-stone-500">
                    全面分析背景、方法、结果和结论（约 3-5 分钟）
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="depth"
                  value="deep"
                  checked={formData.summaryDepth === 'deep'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      summaryDepth: e.target.value as any,
                    })
                  }
                  className="mt-1 w-4 h-4 border-stone-300 text-stone-900 focus:ring-stone-500"
                />
                <div>
                  <div className="text-sm font-medium text-stone-900">
                    深度分析
                  </div>
                  <div className="text-xs text-stone-500">
                    多轮深度解析，包含技术细节和创新点（约 5-10 分钟）
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* 保存按钮 */}
          <div className="pt-4 border-t border-stone-200">
            <button
              onClick={handleSave}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Save size={18} />
              <span>{saved ? '已保存' : '保存设置'}</span>
            </button>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 glass-panel p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">
            使用说明
          </h2>
          <div className="space-y-3 text-sm text-stone-700">
            <div>
              <strong>1. 获取 API Key：</strong>
              <p className="text-stone-600 mt-1">
                访问{' '}
                <a
                  href="https://dashscope.aliyun.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-stone-900"
                >
                  阿里云百炼平台
                </a>
                ，注册并创建 API Key
              </p>
            </div>
            <div>
              <strong>2. 上传文献：</strong>
              <p className="text-stone-600 mt-1">
                支持 PDF 格式的学术论文，AI 会自动提取文本并进行分析
              </p>
            </div>
            <div>
              <strong>3. 智能分析：</strong>
              <p className="text-stone-600 mt-1">
                AI 会生成结构化摘要，包括研究背景、方法、结果和结论
              </p>
            </div>
            <div>
              <strong>4. 追问对话：</strong>
              <p className="text-stone-600 mt-1">
                对文献有疑问？直接在详情页提问，AI 会基于论文内容回答
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
