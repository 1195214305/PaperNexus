/**
 * 边缘函数: 任务状态查询接口
 * 路径: /api/task-status
 * 功能: 查询千问异步任务的状态
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
    const { taskId, apiKey } = await request.json()

    if (!taskId || !apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少必要参数' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 查询任务状态
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

    // 检查任务状态
    if (statusResult.output && statusResult.output.task_status === 'SUCCEEDED') {
      // 任务成功
      const imageUrl = statusResult.output.results[0].url
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            status: 'completed',
            posterUrl: imageUrl,
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    } else if (statusResult.output && statusResult.output.task_status === 'FAILED') {
      // 任务失败
      return new Response(
        JSON.stringify({
          success: false,
          error: '图像生成失败',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    } else {
      // 任务进行中
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            status: 'pending',
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (error) {
    console.error('查询任务状态失败:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || '查询任务状态失败',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}
