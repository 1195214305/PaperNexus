/**
 * 边缘函数: 文献分析接口
 * 路径: /api/analyze
 * 功能: 上传 PDF 并使用千问 AI 进行智能分析（演示版）
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
    const apiUrl = formData.get('apiUrl') || 'https://dashscope.aliyuncs.com/compatible-mode/v1'

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

    // 调用千问API生成摘要（简化版，避免PDF解析）
    const prompt = `请为名为"${fileName}"的学术论文生成一份结构化摘要。

要求：
1. 根据标题推测论文的研究方向和内容
2. 生成以下结构化内容：
   - 概述（100-150字）
   - 研究背景（100-150字）
   - 研究方法（100-150字）
   - 研究结果（100-150字）
   - 结论（100-150字）
   - 关键要点（5个要点）
   - 标签（3-5个关键词）

请以JSON格式返回，格式如下：
{
  "overview": "概述内容",
  "background": "研究背景",
  "methods": "研究方法",
  "results": "研究结果",
  "conclusion": "结论",
  "keyPoints": ["要点1", "要点2", "要点3", "要点4", "要点5"],
  "tags": ["标签1", "标签2", "标签3"]
}`

    const aiResponse = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    })

    if (!aiResponse.ok) {
      throw new Error(`AI API 调用失败: ${aiResponse.status}`)
    }

    const aiResult = await aiResponse.json()
    const content = aiResult.choices[0].message.content

    // 解析JSON响应
    let summary
    try {
      // 尝试提取JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        summary = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('无法解析AI响应')
      }
    } catch (e) {
      // 如果解析失败，使用默认结构
      summary = {
        overview: content.substring(0, 200),
        background: '基于标题推测的研究背景。',
        methods: '基于标题推测的研究方法。',
        results: '基于标题推测的研究结果。',
        conclusion: '基于标题推测的结论。',
        keyPoints: ['关键要点1', '关键要点2', '关键要点3'],
        tags: ['AI生成', '文献分析'],
      }
    }

    const paper = {
      id: Date.now().toString(),
      title: fileName,
      authors: ['待补充'],
      abstract: summary.overview || '暂无摘要',
      year: new Date().getFullYear(),
      source: '上传',
      uploadedAt: new Date().toISOString(),
      status: 'completed',
      summary: {
        overview: summary.overview || '暂无概述',
        background: summary.background || '暂无研究背景',
        methods: summary.methods || '暂无研究方法',
        results: summary.results || '暂无研究结果',
        conclusion: summary.conclusion || '暂无结论',
        keyPoints: summary.keyPoints || ['暂无关键要点'],
        generatedAt: new Date().toISOString(),
      },
      tags: summary.tags || ['未分类'],
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
    console.error('分析失败:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '分析失败',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}
