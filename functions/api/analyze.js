/**
 * 边缘函数: 文献分析接口
 * 路径: /api/analyze
 * 功能: 接收前端提取的PDF文本，进行AI分析
 *
 * 优化策略：前端使用PDF.js提取文本，后端只做AI分析，避免Base64转换超时
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
    const { title, text, pageCount, apiKey, apiUrl, depth } = await request.json()

    if (!title || !text || !apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少必要参数' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 构建AI分析提示词（精简快速版，避免边缘函数超时）
    const analysisPrompt = `分析以下论文内容，快速提取关键信息。

标题：${title}
内容：${text}

输出JSON格式（简洁版）：
{
  "authors": ["作者1", "作者2"],
  "abstract": "论文摘要（100字内）",
  "year": 2024,
  "overview": "研究概述：核心内容、创新点、意义（200字内）",
  "background": "研究背景：领域现状、存在问题、研究动机（150字内）",
  "methods": "研究方法：技术框架、核心算法、实验设计（150字内）",
  "results": "研究结果：主要发现、性能指标、对比分析（150字内）",
  "conclusion": "研究结论：主要贡献、局限性、未来工作（150字内）",
  "keyPoints": ["要点1（20字内）", "要点2", "要点3", "要点4", "要点5"]
}

要求：基于实际内容，简洁准确，输出有效JSON`

    // 调用千问API进行分析
    const response = await fetch(`${apiUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1'}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`AI分析失败: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    const aiResponse = result.choices[0].message.content

    // 解析AI返回的JSON
    let analysisData
    try {
      // 尝试提取JSON（AI可能返回带有markdown代码块的内容）
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('无法解析AI返回的JSON')
      }
    } catch (parseError) {
      console.error('JSON解析失败:', parseError)
      // 如果解析失败，返回基础信息
      analysisData = {
        authors: ['未能提取'],
        abstract: aiResponse.substring(0, 200),
        year: new Date().getFullYear(),
        overview: aiResponse,
        background: '请点击"生成学术概念图"按钮查看详细分析',
        methods: '请点击"生成学术概念图"按钮查看详细分析',
        results: '请点击"生成学术概念图"按钮查看详细分析',
        conclusion: '请点击"生成学术概念图"按钮查看详细分析',
        keyPoints: ['AI分析已完成', '点击生成学术概念图查看可视化内容']
      }
    }

    // 构建返回数据
    const paper = {
      id: Date.now().toString(),
      title: title,
      authors: analysisData.authors || ['未知'],
      abstract: analysisData.abstract || '',
      year: analysisData.year || new Date().getFullYear(),
      source: '上传',
      uploadedAt: new Date().toISOString(),
      status: 'completed',
      summary: {
        overview: analysisData.overview || '',
        background: analysisData.background || '',
        methods: analysisData.methods || '',
        results: analysisData.results || '',
        conclusion: analysisData.conclusion || '',
        keyPoints: analysisData.keyPoints || [],
        generatedAt: new Date().toISOString(),
      },
      tags: ['已分析', 'AI生成'],
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
