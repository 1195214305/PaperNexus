/**
 * 边缘函数: 文献分析接口
 * 路径: /api/analyze
 * 功能: 上传 PDF 并返回基础信息（不进行AI分析，避免超时）
 *
 * 优化策略：完全移除AI分析，直接返回基础信息，避免边缘函数超时
 */

export default async function handler(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  // 处理 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: '仅支持 POST 请求' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const formData = await request.formData()
    const pdfFile = formData.get('pdf')
    const apiKey = formData.get('apiKey')

    if (!pdfFile || !apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少必要参数' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 提取文件名作为标题
    const fileName = pdfFile.name.replace('.pdf', '').replace('.PDF', '')

    // 直接返回基础信息，不进行AI分析（避免超时）
    const paper = {
      id: Date.now().toString(),
      title: fileName,
      authors: ['待补充'],
      abstract: '请点击"生成学术概念图"按钮，AI将为您生成详细的论文分析和可视化概念图。',
      year: new Date().getFullYear(),
      source: '上传',
      uploadedAt: new Date().toISOString(),
      status: 'completed',
      summary: {
        overview: '📄 PDF文件已成功上传！\n\n为了避免边缘函数超时，我们采用了优化策略：\n\n1. 文件上传后立即返回基础信息\n2. 点击"生成学术概念图"按钮，AI将进行两阶段分析：\n   - 阶段1：提取论文视觉信息（核心隐喻、关键物体、流程动作）\n   - 阶段2：生成16:9学术概念图（包含研究问题、方法、流程、结果、价值）\n\n这样可以确保快速响应，同时提供高质量的学术概念图。',
        background: '点击"生成学术概念图"按钮，AI将为您分析研究背景。',
        methods: '点击"生成学术概念图"按钮，AI将为您分析研究方法。',
        results: '点击"生成学术概念图"按钮，AI将为您分析研究结果。',
        conclusion: '点击"生成学术概念图"按钮，AI将为您分析研究结论。',
        keyPoints: [
          '✅ PDF文件已成功上传',
          '🎨 点击"生成学术概念图"按钮开始AI分析',
          '📊 AI将生成包含研究问题、方法、流程、结果的可视化概念图',
          '⏱️ 生成过程约需30-60秒，请耐心等待',
          '🖼️ 最终将生成16:9的学术演示幻灯片插图'
        ],
        generatedAt: new Date().toISOString(),
      },
      tags: ['已上传', '待分析'],
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: paper,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('上传失败:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '上传失败',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}
