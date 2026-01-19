/**
 * ESA Pages 边缘函数统一入口
 * 根据请求路径分发到对应的处理函数
 */

import analyzeHandler from './api/analyze.js'
import askHandler from './api/ask.js'
import posterHandler from './api/poster.js'
import taskStatusHandler from './api/task-status.js'
import healthHandler from './api/health.js'

async function fetch(request) {
  const url = new URL(request.url)
  const path = url.pathname

  // API 路由分发
  if (path === '/api/analyze') {
    return analyzeHandler(request)
  }

  if (path === '/api/ask') {
    return askHandler(request)
  }

  if (path === '/api/poster') {
    return posterHandler(request)
  }

  if (path === '/api/task-status') {
    return taskStatusHandler(request)
  }

  if (path === '/api/health') {
    return healthHandler(request)
  }

  // 非 API 请求，返回 404 让 ESA 处理静态资源
  return new Response(null, { status: 404 })
}

export default { fetch }
