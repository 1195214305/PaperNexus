/**
 * 边缘函数: 学术概念图生成接口（一图读懂论文）
 * 路径: /api/poster
 * 功能: 两阶段生成学术概念图
 *   阶段1: 提取论文视觉信息（核心隐喻、关键物体、流程动作）
 *   阶段2: 生成16:9学术概念图（包含研究问题、方法、流程、结果、价值）
 *
 * 技术来源: 学习自 Zotero-AI-Butler 的一图总结功能
 * 优化策略：立即返回任务ID，让前端轮询状态，避免边缘函数超时
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
    const { paperId, summary, title, apiKey, apiUrl } = await request.json()

    if (!paperId || !summary || !apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少必要参数' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // ========== 阶段1: 提取视觉信息 ==========
    const visualExtractionPrompt = `请阅读我提供的论文摘要，提取用于生成"学术概念图"的关键视觉信息。

请确保描述具体、形象，适合画面呈现。
请输出如下内容（只输出内容，不要废话）：

Visual_Summary:
1. **Core_Metaphor** (核心隐喻): [用一个具体的物体或场景来比喻这篇论文的核心，例如：一座连接两端的桥梁、一个多层金字塔、一个过滤漏斗等]
2. **Key_Objects** (关键物体): [列出画面中必须出现的3-4个具体元素，如：服务器图标、大脑切片图、DNA螺旋、代码片段]
3. **Process_Flow** (流程动作): [描述元素之间的动态关系，如：数据流从左向右汇聚、层级自下而上构建、两个模块相互循环]
4. **Highlights** (高亮重点): [论文最大的创新点，需要用高亮颜色或放大显示的简短关键词，不超过5个字]
5. **Short_Title** (精简标题): [适合放在图片正中央的超短标题，不超过10个字符]

---
论文标题：${title}

论文摘要：
${summary}`

    // 调用千问API提取视觉信息
    const visualResponse = await fetch(`${apiUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1'}/chat/completions`, {
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
            content: visualExtractionPrompt
          }
        ],
        temperature: 0.7,
      }),
    })

    if (!visualResponse.ok) {
      const errorText = await visualResponse.text()
      throw new Error(`视觉信息提取失败: ${visualResponse.status} - ${errorText}`)
    }

    const visualResult = await visualResponse.json()
    const visualSummary = visualResult.choices[0].message.content

    // ========== 阶段2: 生成学术概念图 ==========
    const imagePrompt = `根据"${visualSummary}"，生成一张学术论文概念图，清晰展示以下内容：

**必须包含的内容：**
- 研究问题：论文要解决的核心问题
- 创新方法：论文提出的主要方法或技术
- 工作流程：从输入到输出的处理流程（用流程图或示意图）
- 关键结果：主要实验发现或性能提升（用数据可视化）
- 应用价值：该研究的实际意义

**论文标题：** ${title}

**设计要求 (STRICTLY FOLLOW):**
1. **艺术风格 (Style):**
   - Modern Minimalist Tech Infographic (现代极简科技信息图)
   - Flat vector illustration with subtle isometric elements (带有微妙等距元素的扁平矢量插画)
   - High-quality corporate Memphis design style (高质量企业级孟菲斯设计风格)
   - Clean lines, geometric shapes (线条干净，几何形状)

2. **构图 (Composition):**
   - **Layout:** Left-to-Right Process Flow or Central composition (从左到右的流程或居中构图)
   - **Background:** Clean, solid off-white or very light grey background (#F5F5F7). No clutter. (干净的米白或浅灰背景，无杂乱)
   - **Structure:** Organize elements logically like a presentation slide or academic poster
   - **Aspect Ratio:** 16:9 (适合演示幻灯片)

3. **配色方案 (Color Palette):**
   - Primary: Deep Academic Blue (#1E3A8A) & Slate Grey (#475569)
   - Accent: Vibrant Orange (#F97316) or Teal (#14B8A6) for highlights
   - High contrast, professional color grading (高对比度，专业调色)

4. **文字渲染 (Text Rendering):**
   - Use bold, sans-serif font (使用粗体无衬线字体)
   - Language: 中文
   - Ensure the title "${title}" is prominent at the top
   - Include key terms and data labels

5. **内容可视化要求：**
   - 用图标和符号表示概念（不要纯文字堆砌）
   - 用箭头和连线表示流程关系
   - 用图表（柱状图、折线图、饼图）展示数据
   - 用颜色高亮关键创新点

6. **负面提示 (Negative Prompt - Avoid these):**
   - No photorealism (不要照片写实风格)
   - No messy sketches (不要草图)
   - No blurry text (不要模糊文字)
   - No chaotic background (不要混乱背景)
   - No pure text slides (不要纯文字幻灯片)

**生成指令:**
融合上述视觉隐喻和关键物体，生成一张宽度为 16:9 的学术演示幻灯片插图。图片应看起来像发布在 Behance 上的顶级科技设计作品，清晰展示论文的研究问题、方法、流程、结果和价值。`

    // 调用千问图像生成 API (wanx-v1) - 异步模式
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
          style: '<auto>',
          size: '1024*1024',
          n: 1,
        },
      }),
    })

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text()
      throw new Error(`图像生成 API 调用失败: ${imageResponse.status} - ${errorText}`)
    }

    const imageResult = await imageResponse.json()

    // 立即返回任务ID，让前端轮询
    if (imageResult.output && imageResult.output.task_id) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            taskId: imageResult.output.task_id,
            status: 'pending',
          },
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    } else if (imageResult.output && imageResult.output.results) {
      // 同步返回结果（极少情况）
      const imageUrl = imageResult.output.results[0].url
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            posterUrl: imageUrl,
            status: 'completed',
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
