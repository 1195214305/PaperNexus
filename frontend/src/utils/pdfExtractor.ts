/**
 * PDF文本提取工具
 * 使用 PDF.js 在前端提取PDF文本内容，避免边缘函数超时
 */

import * as pdfjsLib from 'pdfjs-dist'

// 配置 PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export interface PdfExtractionResult {
  text: string
  pageCount: number
  title?: string
}

/**
 * 从PDF文件中提取文本内容
 * @param file PDF文件对象
 * @returns 提取的文本内容和元数据
 */
export async function extractTextFromPdf(file: File): Promise<PdfExtractionResult> {
  try {
    // 将文件转换为 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // 加载PDF文档
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    const pageCount = pdf.numPages
    let fullText = ''

    // 提取每一页的文本
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()

      // 拼接文本项
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')

      fullText += pageText + '\n\n'
    }

    // 获取PDF元数据
    const metadata = await pdf.getMetadata()
    const title = (metadata.info as any)?.Title || file.name.replace('.pdf', '')

    return {
      text: fullText.trim(),
      pageCount,
      title,
    }
  } catch (error) {
    console.error('PDF文本提取失败:', error)
    throw new Error('PDF文本提取失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}

/**
 * 截取文本前N个字符（用于摘要生成）
 * @param text 完整文本
 * @param maxLength 最大长度
 * @returns 截取后的文本
 */
export function truncateText(text: string, maxLength: number = 8000): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}
