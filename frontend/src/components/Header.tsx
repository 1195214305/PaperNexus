import { FileText, Settings, Menu, X } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function Header() {
  const { sidebarOpen, setSidebarOpen } = useStore()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-stone-100 transition-colors lg:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <FileText className="text-stone-900" size={28} />
            <div>
              <h1 className="text-xl font-semibold text-stone-900 tracking-tight">
                PaperNexus
              </h1>
              <p className="text-xs text-stone-500">科研文献智能助手</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <a
              href="/settings"
              className="p-2 hover:bg-stone-100 transition-colors"
              title="设置"
            >
              <Settings size={20} className="text-stone-600" />
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
