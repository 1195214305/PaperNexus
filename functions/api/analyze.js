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

    // 构建AI分析提示词（详细版）
    const analysisPrompt = `你是一位资深的学术论文分析专家。请仔细阅读以下学术论文内容，提供全面、深入的学术分析。

论文标题：${title}
页数：${pageCount}

论文内容：
${text}

请按以下格式输出详细的分析结果（使用JSON格式）：

{
  "authors": ["作者1", "作者2", "作者3"],
  "abstract": "论文核心摘要（150-200字，概括研究目的、方法、主要发现和意义）",
  "year": 2024,
  "overview": "## 研究概述\n\n本研究聚焦于...\n\n### 核心创新点\n1. **创新点1**：具体描述\n2. **创新点2**：具体描述\n3. **创新点3**：具体描述\n\n### 研究意义\n- 理论意义：...\n- 实践价值：...\n- 应用前景：...",

  "background": "## 研究背景\n\n### 领域现状\n当前在...领域，研究者们面临着...\n\n### 存在的问题\n1. **问题1**：具体描述现有方法的局限性\n2. **问题2**：具体描述技术瓶颈\n3. **问题3**：具体描述应用挑战\n\n### 研究动机\n为了解决上述问题，本研究提出...\n\n### 相关工作\n- 前人研究A：...\n- 前人研究B：...\n- 本研究的差异化：...",

  "methods": "## 研究方法\n\n### 技术框架\n本研究采用...技术框架，包括以下核心组件：\n\n### 核心算法\n1. **算法/方法1**：\n   - 原理：...\n   - 实现步骤：...\n   - 创新之处：...\n\n2. **算法/方法2**：\n   - 原理：...\n   - 实现步骤：...\n   - 创新之处：...\n\n### 实验设计\n- **数据集**：使用了...数据集，包含...样本\n- **评估指标**：采用...指标进行评估\n- **对比基线**：与...方法进行对比\n- **实验环境**：硬件配置、软件环境等",

  "results": "## 研究结果\n\n### 主要发现\n1. **发现1**：具体数据和现象描述\n2. **发现2**：具体数据和现象描述\n3. **发现3**：具体数据和现象描述\n\n### 性能指标\n- **指标1**：提升了X%，从Y提高到Z\n- **指标2**：降低了X%，从Y降低到Z\n- **指标3**：达到了X的水平\n\n### 对比分析\n与现有方法相比：\n- 相比方法A：优势在于...\n- 相比方法B：优势在于...\n\n### 消融实验\n- 移除组件A后：性能下降X%\n- 移除组件B后：性能下降Y%\n- 说明了...的重要性",

  "conclusion": "## 研究结论\n\n### 主要贡献\n1. **贡献1**：提出了...方法/模型/框架\n2. **贡献2**：实现了...性能提升\n3. **贡献3**：验证了...假设/理论\n\n### 局限性\n1. **局限1**：当前方法在...场景下存在...\n2. **局限2**：数据集规模/多样性方面...\n3. **局限3**：计算复杂度/资源消耗...\n\n### 未来工作\n1. **方向1**：扩展到...领域/场景\n2. **方向2**：优化...性能/效率\n3. **方向3**：结合...技术进行改进\n\n### 应用前景\n本研究成果可应用于...领域，具有...价值",

  "keyPoints": [
    "🎯 核心问题：本研究解决了...领域的...问题",
    "💡 创新方法：提出了...方法，实现了...功能",
    "📊 性能提升：相比现有方法，在...指标上提升了X%",
    "🔬 实验验证：在...数据集上进行了充分验证",
    "🚀 应用价值：可应用于...场景，具有...前景"
  ]
}

**重要要求**：
1. 必须基于实际论文内容进行分析，严禁编造信息
2. 每个部分都要详细展开，使用Markdown格式增强可读性
3. 数据、指标、方法名称必须来自原文
4. 如果论文中缺少某些信息，明确说明"论文中未提及"
5. 关键要点要简洁有力，突出核心价值
6. 输出必须是有效的JSON格式，注意转义特殊字符`

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
