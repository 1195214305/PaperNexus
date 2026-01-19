/**
 * 边缘函数: 学术海报生成接口
 * 路径: /api/poster
 * 功能: 基于论文摘要生成学术海报
 */

export default async function handler(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

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
    const { paperId, summary, apiKey } = await request.json()

    if (!paperId || !summary || !apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少必要参数' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 生成海报提示词
    const posterPrompt = `请为以下学术论文摘要设计一张简洁、专业的学术海报文字内容：

${summary}

要求：
1. 提取核心观点（3-5个要点）
2. 使用简洁的学术语言
3. 突出研究创新点
4. 适合在学术会议上展示

请以 Markdown 格式输出海报内容结构。`

    // 调用千问 API 生成海报内容
    const aiResponse = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [
          {
            role: 'user',
            content: posterPrompt,
          },
        ],
        temperature: 0.8,
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      throw new Error(`AI API 调用失败: ${errorText}`)
    }

    const aiResult = await aiResponse.json()
    const posterContent = aiResult.choices[0].message.content

    // 返回海报内容（实际项目中可以调用图像生成 API）
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          posterUrl: `data:text/plain;base64,${btoa(unescape(encodeURIComponent(posterContent)))}`,
          content: posterContent,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('生成海报失败:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '生成海报失败',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}
