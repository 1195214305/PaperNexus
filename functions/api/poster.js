/**
 * 边缘函数: 学术海报生成接口
 * 路径: /api/poster
 * 功能: 基于论文摘要生成学术海报图片（使用千问图像生成模型）
 *
 * 技术来源: 学习自 Zotero-AI-Butler 的图像生成功能
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
    const { paperId, summary, title, apiKey } = await request.json()

    if (!paperId || !summary || !apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少必要参数' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 生成学术海报的图像提示词（预设模板）
    const imagePrompt = `学术会议海报设计，主题：${title || '科研论文'}

海报要求：
- 简洁专业的学术风格
- 清晰的标题和核心观点
- 使用图表和数据可视化
- 蓝白配色，现代感设计
- 包含研究方法、结果、结论等关键部分
- 适合A1尺寸打印

海报内容摘要：${summary.substring(0, 200)}

风格：学术、专业、简洁、现代`

    // 调用千问图像生成 API (wanx-v1)
    const imageResponse = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-DashScope-Async': 'enable',  // 启用异步模式
      },
      body: JSON.stringify({
        model: 'wanx-v1',
        input: {
          prompt: imagePrompt,
        },
        parameters: {
          style: '<auto>',  // 自动风格
          size: '1024*1024',  // 图片尺寸
          n: 1,  // 生成1张图片
        },
      }),
    })

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text()
      throw new Error(`图像生成 API 调用失败: ${imageResponse.status} - ${errorText}`)
    }

    const imageResult = await imageResponse.json()

    // 检查是否是异步任务
    if (imageResult.output && imageResult.output.task_id) {
      // 异步任务，需要轮询获取结果
      const taskId = imageResult.output.task_id
      let attempts = 0
      const maxAttempts = 30  // 最多等待30秒

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000))  // 等待1秒

        const statusResponse = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        })

        if (!statusResponse.ok) {
          throw new Error('查询任务状态失败')
        }

        const statusResult = await statusResponse.json()

        if (statusResult.output && statusResult.output.task_status === 'SUCCEEDED') {
          // 任务成功，返回图片URL
          const imageUrl = statusResult.output.results[0].url

          return new Response(
            JSON.stringify({
              success: true,
              data: {
                posterUrl: imageUrl,
                taskId: taskId,
              },
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        } else if (statusResult.output && statusResult.output.task_status === 'FAILED') {
          throw new Error('图像生成失败')
        }

        attempts++
      }

      throw new Error('图像生成超时')
    } else if (imageResult.output && imageResult.output.results) {
      // 同步返回结果
      const imageUrl = imageResult.output.results[0].url

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            posterUrl: imageUrl,
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    } else {
      throw new Error('图像生成返回格式错误')
    }
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
