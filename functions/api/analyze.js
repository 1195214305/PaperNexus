/**
 * 边缘函数: 文献分析接口
 * 路径: /api/analyze
 * 功能: 上传 PDF 并使用千问 AI 进行智能分析
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
    const apiUrl = formData.get('apiUrl')
    const depth = formData.get('depth') || 'standard'

    if (!pdfFile || !apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少必要参数' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 读取 PDF 内容
    const pdfBuffer = await pdfFile.arrayBuffer()
    const pdfBase64 = arrayBufferToBase64(pdfBuffer)

    // 构建分析提示词
    const systemPrompt = getAnalysisPrompt(depth)

    // 调用千问 API
    const aiResponse = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请分析这篇学术论文，按照要求的格式输出结构化摘要。',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${pdfBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.7,
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      throw new Error(`AI API 调用失败: ${errorText}`)
    }

    const aiResult = await aiResponse.json()
    const analysisText = aiResult.choices[0].message.content

    // 解析 AI 返回的结构化内容
    const paper = parseAnalysisResult(analysisText, pdfFile.name)

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

// 辅助函数：ArrayBuffer 转 Base64
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// 获取分析提示词
function getAnalysisPrompt(depth) {
  const basePrompt = `你是一个专业的学术论文分析助手。请仔细阅读这篇论文，并按照以下格式输出结构化摘要：

## 标题
[论文标题]

## 作者
[作者列表，用逗号分隔]

## 年份
[发表年份]

## 概述
[200-300字的论文概述，包括研究主题和核心贡献]

## 研究背景
[研究背景和动机，为什么要做这个研究]

## 研究方法
[使用的研究方法、技术路线、实验设计等]

## 研究结果
[主要实验结果和发现]

## 结论
[研究结论和未来展望]

## 关键要点
- [要点1]
- [要点2]
- [要点3]
- [要点4]
- [要点5]

## 标签
[3-5个关键词标签，用逗号分隔]`

  if (depth === 'deep') {
    return basePrompt + `

请进行深度分析，包括：
- 详细的技术细节和创新点
- 与相关工作的对比
- 方法的优缺点分析
- 实验设计的合理性评估`
  }

  if (depth === 'quick') {
    return basePrompt + `

请进行快速分析，重点提取核心要点，保持简洁。`
  }

  return basePrompt
}

// 解析 AI 返回结果
function parseAnalysisResult(text, filename) {
  const lines = text.split('\n')
  const paper = {
    id: Date.now().toString(),
    title: filename.replace('.pdf', ''),
    authors: [],
    abstract: '',
    year: new Date().getFullYear(),
    source: '上传',
    uploadedAt: new Date().toISOString(),
    status: 'completed',
    summary: {
      overview: '',
      background: '',
      methods: '',
      results: '',
      conclusion: '',
      keyPoints: [],
      generatedAt: new Date().toISOString(),
    },
    tags: [],
  }

  let currentSection = ''
  let content = []

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('## 标题')) {
      currentSection = 'title'
      continue
    } else if (trimmed.startsWith('## 作者')) {
      if (content.length > 0 && currentSection === 'title') {
        paper.title = content.join(' ').trim()
        content = []
      }
      currentSection = 'authors'
      continue
    } else if (trimmed.startsWith('## 年份')) {
      if (content.length > 0 && currentSection === 'authors') {
        paper.authors = content.join(' ').split(',').map(a => a.trim())
        content = []
      }
      currentSection = 'year'
      continue
    } else if (trimmed.startsWith('## 概述')) {
      if (content.length > 0 && currentSection === 'year') {
        const yearMatch = content.join(' ').match(/\d{4}/)
        if (yearMatch) paper.year = parseInt(yearMatch[0])
        content = []
      }
      currentSection = 'overview'
      continue
    } else if (trimmed.startsWith('## 研究背景')) {
      if (content.length > 0) {
        paper.summary.overview = content.join('\n').trim()
        content = []
      }
      currentSection = 'background'
      continue
    } else if (trimmed.startsWith('## 研究方法')) {
      if (content.length > 0) {
        paper.summary.background = content.join('\n').trim()
        content = []
      }
      currentSection = 'methods'
      continue
    } else if (trimmed.startsWith('## 研究结果')) {
      if (content.length > 0) {
        paper.summary.methods = content.join('\n').trim()
        content = []
      }
      currentSection = 'results'
      continue
    } else if (trimmed.startsWith('## 结论')) {
      if (content.length > 0) {
        paper.summary.results = content.join('\n').trim()
        content = []
      }
      currentSection = 'conclusion'
      continue
    } else if (trimmed.startsWith('## 关键要点')) {
      if (content.length > 0) {
        paper.summary.conclusion = content.join('\n').trim()
        content = []
      }
      currentSection = 'keyPoints'
      continue
    } else if (trimmed.startsWith('## 标签')) {
      currentSection = 'tags'
      continue
    }

    if (trimmed && !trimmed.startsWith('##')) {
      if (currentSection === 'keyPoints' && trimmed.startsWith('-')) {
        paper.summary.keyPoints.push(trimmed.substring(1).trim())
      } else if (currentSection === 'tags') {
        paper.tags = trimmed.split(',').map(t => t.trim())
      } else {
        content.push(trimmed)
      }
    }
  }

  // 处理最后一个 section
  if (content.length > 0 && currentSection === 'conclusion') {
    paper.summary.conclusion = content.join('\n').trim()
  }

  return paper
}
