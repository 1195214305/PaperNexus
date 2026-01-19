import { useStore } from '../store/useStore'
import Header from '../components/Header'
import PaperList from '../components/PaperList'
import PaperDetail from '../components/PaperDetail'

export default function Home() {
  const { sidebarOpen } = useStore()

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {/* 侧边栏 - 文献列表 */}
        <aside
          className={`${
            sidebarOpen ? 'w-80' : 'w-0'
          } transition-all duration-300 border-r border-stone-200 overflow-hidden lg:w-80`}
        >
          <PaperList />
        </aside>

        {/* 主内容区 - 文献详情 */}
        <main className="flex-1 overflow-hidden">
          <PaperDetail />
        </main>
      </div>
    </div>
  )
}
