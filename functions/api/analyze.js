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

    // 构建AI分析提示词
    const analysisPrompt = `请分析以下学术论文的内容，提供详细的学术摘要。

论文标题：${title}
页数：${pageCount}

论文内容：
${text}

请按以下格式输出分析结果（使用JSON格式）：
{
  "authors": ["作者1", "作者2"],
  "abstract": "论文摘要（200字以内）",
  "year": 2024,
  "overview": "研究概述（详细描述研究的核心内容、创新点和意义）",
  "background": "研究背景（描述研究领域现状、存在的问题和研究动机）",
  "methods": "研究方法（详细描述使用的技术、算法、实验设计等）",
  "results": "研究结果（描述主要发现、实验数据、性能指标等）",
  "conclusion": "研究结论（总结研究贡献、局限性和未来工作）",
  "keyPoints": ["关键要点1", "关键要点2", "关键要点3", "关键要点4", "关键要点5"]
}

注意：
1. 请基于实际论文内容进行分析，不要编造信息
2. 如果无法提取某些信息，请如实说明
3. 关键要点应该是论文中最重要的发现或贡献
4. 输出必须是有效的JSON格式`

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
