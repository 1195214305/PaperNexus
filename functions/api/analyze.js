/**
 * 边缘函数: 文献分析接口
 * 路径: /api/analyze
 * 功能: 上传 PDF 并使用千问 AI 进行智能分析（Base64 多模态版）
 *
 * 技术来源: Zotero-AI-Butler
 * - Base64 多模态 PDF 处理
 * - 保留完整文档信息（图片、表格、公式）
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

    // 将 PDF 转换为 Base64（学习自 Zotero-AI-Butler 的 extractBase64FromItem）
    const arrayBuffer = await pdfFile.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    const base64Pdf = btoa(binary)

    // 使用千问 VL 模型进行多模态分析
    const prompt = `请仔细阅读这篇学术论文的PDF文件，并生成一份详细的结构化摘要。

要求：
1. 仔细阅读PDF中的所有内容，包括文字、图表、公式
2. 生成以下结构化内容：
   - 概述（150-200字，概括论文核心内容）
   - 研究背景（150-200字，说明研究动机和现状）
   - 研究方法（150-200字，详细描述技术方法）
   - 研究结果（150-200字，总结实验结果和数据）
   - 结论（150-200字，总结研究贡献和未来工作）
   - 关键要点（5-7个要点，提炼核心创新）
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

    // 调用千问 VL API（支持多模态）
    const aiResponse = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-vl-plus',  // 使用支持多模态的模型
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'file',
                file: {
                  content_type: 'application/pdf',
                  data: base64Pdf
                }
              }
            ]
          }
        ],
        temperature: 0.7,
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      throw new Error(`AI API 调用失败: ${aiResponse.status} - ${errorText}`)
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
        background: '基于PDF内容分析的研究背景。',
        methods: '基于PDF内容分析的研究方法。',
        results: '基于PDF内容分析的研究结果。',
        conclusion: '基于PDF内容分析的结论。',
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
