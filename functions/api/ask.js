/**
 * 边缘函数: 追问接口
 * 路径: /api/ask
 * 功能: 基于文献内容回答用户问题
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
    const { paperId, question, apiKey, apiUrl } = await request.json()

    if (!paperId || !question || !apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少必要参数' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

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
            content: '你是一个专业的学术论文解读助手。请基于论文内容回答用户的问题，保持专业、准确、简洁。如果问题超出论文范围，请明确说明。',
          },
          {
            role: 'user',
            content: question,
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
    const answer = aiResult.choices[0].message.content

    return new Response(
      JSON.stringify({
        success: true,
        data: { answer },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('追问失败:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '追问失败',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}
