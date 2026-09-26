/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪ𝚃𝙰𝙲𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭s 𝐛𝐲 𝙅𝙾𝙆𝙴𝙍 𝘽𝙾𝙏 」
「 لا تحذف الحقوق 🖤 」
*/

import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys'
import { theme } from '../core/theme.js'

const API_BASE = 'https://engez.a7a.online/api/v1/reading/sunovels'
const FALLBACK_IMAGE = 'https://files.catbox.moe/z5zh28.jpg'

global.sunovelsSessions = global.sunovelsSessions || {}

const getSession = (sender) => {
  if (!global.sunovelsSessions[sender]) {
    global.sunovelsSessions[sender] = {
      results: [],
      novel: null,
      totalPages: 0,
      page: 1,
      chapters: []
    }
  }
  return global.sunovelsSessions[sender]
}

const apiGet = async (params) => {
  const url = `${API_BASE}?${new URLSearchParams(params).toString()}`
  const { data } = await axios.get(url, { timeout: 30000 })
  return data
}

const searchNovels = async (q) => {
  try {
    const res = await apiGet({ action: 'search', q })
    if (res?.success && Array.isArray(res?.response)) {
      return res.response
    }
    return []
  } catch (error) {
    throw new Error(`فشل البحث: ${error.message}`)
  }
}

const getChaptersPage = async (url, page) => {
  try {
    const res = await apiGet({ action: 'chapters', url, page: String(page) })
    if (res?.success && res?.response) {
      return {
        chapters: Array.isArray(res.response.chapters) ? res.response.chapters : [],
        totalPages: res.response.totalPages || 0
      }
    }
    return { chapters: [], totalPages: 0 }
  } catch (error) {
    throw new Error(`فشل جلب الفصول: ${error.message}`)
  }
}

const getContent = async (url) => {
  try {
    const res = await apiGet({ action: 'content', url })
    if (res?.success && res?.response) {
      return res.response
    }
    return null
  } catch (error) {
    throw new Error(`فشل جلب المحتوى: ${error.message}`)
  }
}

const makeInteractiveList = async (conn, m, title, body, footer, imageUrl, sections) => {
  try {
    const mediaMessage = await prepareWAMessageMedia(
      { image: { url: imageUrl } },
      { upload: conn.waUploadToServer }
    )

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              body: { text: body },
              footer: { text: footer },
              header: {
                hasMediaAttachment: true,
                imageMessage: mediaMessage.imageMessage
              },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                      title,
                      sections
                    })
                  }
                ]
              }
            }
          }
        }
      },
      { userJid: conn.user.jid, quoted: m }
    )
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    return true
  } catch (error) {
    return false
  }
}

const sendThemedText = async (conn, m, titleText, descText) => {
  const content = [
    { type: 'title', text: titleText },
    { type: 'divider' },
    { type: 'line', text: descText }
  ]
  return conn.reply(m.chat, theme.build(content), m)
}

const buildNovelSections = (results, usedPrefix) => {
  return [
    {
      title: 'نتائج البحث',
      highlight_label: 'اختر رواية',
      rows: results.slice(0, 10).map((item, index) => ({
        header: `📖 ${item.title}`.slice(0, 60),
        title: `اختيار رقم ${index + 1}`,
        description: item.author ? `✍️ ${item.author}`.slice(0, 72) : 'رواية متميزة',
        id: `${usedPrefix}رواية-اختيار ${index + 1}`
      }))
    }
  ]
}

const buildPageSections = (totalPages, usedPrefix) => {
  const sections = []
  const step = 10
  const pages = Math.min(totalPages, 47)

  for (let start = 1; start <= pages; start += step) {
    const end = Math.min(start + step - 1, pages)
    const rows = []

    for (let p = start; p <= end; p++) {
      rows.push({
        header: `📄 صفحة رقم ${p}`,
        title: `الصفحة ${p}`,
        description: `عرض الفصول من ${p}`,
        id: `${usedPrefix}رواية-صفحة ${p}`
      })
    }

    sections.push({
      title: `الصفحات ${start}-${end}`,
      highlight_label: 'اختر صفحة',
      rows
    })
  }

  return sections
}

const buildChapterSections = (chapters, usedPrefix) => {
  const sections = []
  const step = 10

  for (let start = 0; start < chapters.length; start += step) {
    const end = Math.min(start + step, chapters.length)
    const rows = []

    for (let i = start; i < end; i++) {
      const ch = chapters[i]
      const chapterNum = i + 1
      let cleanTitle = ch?.title ? String(ch.title).replace(/[^\w\s\u0600-\u06FF]/gi, '') : `فصل ${chapterNum}`
      if (cleanTitle.length > 35) cleanTitle = cleanTitle.slice(0, 35) + '...'

      rows.push({
        header: `📖 ${cleanTitle}`,
        title: `تحميل الفصل ${chapterNum}`,
        description: `اضغط لتحميل ملف TXT`,
        id: `${usedPrefix}رواية-فصل ${chapterNum}`
      })
    }

    sections.push({
      title: `الفصول ${start + 1}-${end}`,
      highlight_label: 'تحميل الفصول',
      rows
    })
  }

  return sections
}

const handler = async (m, { conn, text, command, usedPrefix }) => {
  const session = getSession(m.sender)

  try {
    if (/^(رواية|روايه|anovel)$/i.test(command)) {
      if (!text) {
        return await sendThemedText(
          conn,
          m,
          '📚 قـسـم الـروايـات',
          `اكتب اسم الرواية بجانب الأمر.\nمثال: ${usedPrefix}رواية القس المجنون`
        )
      }

      await m.react('⏳')
      const results = await searchNovels(text)
      
      if (!results.length) {
        await m.react('❌')
        return await sendThemedText(conn, m, '❌ خطأ في البحث', `لم أجد أي روايات مطابقة لـ: ${text}`)
      }

      session.results = results
      session.novel = null
      session.totalPages = 0
      session.page = 1
      session.chapters = []

      const firstImage = results[0]?.img || FALLBACK_IMAGE
      const body = `📚 نتائج البحث عن: ${text}\n\nاختر رواية من الأزرار أدناه.`
      
      const ok = await makeInteractiveList(
        conn, m, 'نتائج البحث', body, 'JOKER & ITACHI', firstImage, buildNovelSections(results, usedPrefix)
      )

      if (!ok) {
        let fallback = `📚 نتائج البحث عن: ${text}\n\n`
        results.slice(0, 10).forEach((r, i) => {
          fallback += `${i + 1}. ${r.title}\n`
        })
        fallback += `\nاستخدم: ${usedPrefix}رواية-اختيار <رقم>`
        await sendThemedText(conn, m, '📚 نتائج البحث', fallback)
      }

      await m.react('✅')
      return
    }

    if (/^(رواية-اختيار|روايه-اختيار)$/i.test(command)) {
      const idx = parseInt(text)
      if (!idx || idx < 1 || idx > session.results.length) {
        return await sendThemedText(conn, m, '❌ خطأ', `اكتب رقماً صحيحاً من 1 إلى ${session.results.length}`)
      }

      const novel = session.results[idx - 1]
      if (!novel?.url) {
        return await sendThemedText(conn, m, '❌ خطأ', 'تعذر تحديد الرواية المطلوبة.')
      }

      await m.react('⏳')
      const firstPage = await getChaptersPage(novel.url, 0)

      session.novel = novel
      session.totalPages = Number(firstPage.totalPages || 1)
      session.page = 1
      session.chapters = Array.isArray(firstPage.chapters) ? firstPage.chapters : []

      const image = novel.img || FALLBACK_IMAGE
      const body = `📖 ${novel.title}\n\nاختر صفحة الفصول من الأزرار.`
      
      const ok = await makeInteractiveList(
        conn, m, 'صفحات الفصول', body, 'اختر الصفحة المطلوبة', image, buildPageSections(session.totalPages, usedPrefix)
      )

      if (!ok) {
        let fallback = `📖 ${novel.title}\nعدد صفحات الفصول: ${session.totalPages}\n\n`
        for (let i = 1; i <= Math.min(session.totalPages, 47); i++) {
          fallback += `${i}. ${usedPrefix}رواية-صفحة ${i}\n`
        }
        await sendThemedText(conn, m, '📖 صفحات الفصول', fallback)
      }

      await m.react('✅')
      return
    }

    if (/^(رواية-صفحة|روايه-صفحة)$/i.test(command)) {
      if (!session.novel) {
        return await sendThemedText(conn, m, '❌ تنبيه', `اختر رواية أولاً باستخدام: ${usedPrefix}رواية-اختيار <رقم>`)
      }

      const pageNumber = parseInt(text)
      const maxPages = Math.min(session.totalPages, 47)
      if (!pageNumber || pageNumber < 1 || pageNumber > maxPages) {
        return await sendThemedText(conn, m, '❌ خطأ', `رقم الصفحة غير صحيح (مسموح من 1 إلى ${maxPages})`)
      }

      await m.react('⏳')
      const pageData = await getChaptersPage(session.novel.url, pageNumber - 1)
      const chapters = Array.isArray(pageData.chapters) ? pageData.chapters : []

      if (!chapters.length) {
        await m.react('❌')
        return await sendThemedText(conn, m, '❌ تنبيه', 'لا توجد فصول مسجلة في هذه الصفحة.')
      }

      session.page = pageNumber
      session.chapters = chapters

      const image = session.novel.img || FALLBACK_IMAGE
      const body = `📖 ${session.novel.title}\n📄 الصفحة ${pageNumber} / ${session.totalPages}\n\nاختر الفصل المطلوب:`

      const ok = await makeInteractiveList(
        conn, m, 'الفصول', body, 'اختيار الفصل', image, buildChapterSections(chapters, usedPrefix)
      )

      if (!ok) {
        let fallback = `📖 ${session.novel.title}\n📄 الصفحة ${pageNumber}\n\n`
        chapters.slice(0, 50).forEach((ch, i) => {
          fallback += `${i + 1}. ${ch.title}\n`
        })
        await sendThemedText(conn, m, '📖 قائمة الفصول', fallback)
      }

      await m.react('✅')
      return
    }

    if (/^(رواية-فصل|روايه-فصل)$/i.test(command)) {
      if (!session.novel) {
        return await sendThemedText(conn, m, '❌ تنبيه', `اختر رواية أولاً باستخدام: ${usedPrefix}رواية-اختيار <رقم>`)
      }

      const num = parseInt(text)
      if (!num || num < 1 || num > session.chapters.length) {
        return await sendThemedText(conn, m, '❌ خطأ', `رقم الفصل غير صحيح (مسموح من 1 إلى ${session.chapters.length})`)
      }

      const chapter = session.chapters[num - 1]
      if (!chapter?.url) {
        return await sendThemedText(conn, m, '❌ خطأ', 'لم أستطع العثور على رابط هذا الفصل.')
      }

      await m.react('⏳')
      const content = await getContent(chapter.url)
      
      if (!content || !content.text) {
        await m.react('❌')
        return await sendThemedText(conn, m, '❌ خطأ', 'تعذر جلب نص الفصل أو أن المحتوى فارغ.')
      }

      const safeNovelTitle = (content.novelTitle || session.novel.title || 'novel').replace(/[\/\\:*?"<>|]/g, '_').trim()
      const safeChapterTitle = (content.chapterTitle || chapter.title || `chapter_${num}`).replace(/[\/\\:*?"<>|]/g, '_').trim()
      const fileName = `${safeNovelTitle} - ${safeChapterTitle}.txt`

      const filePath = path.join('./tmp', `${Date.now()}_chapter.txt`)
      if (!fs.existsSync('./tmp')) fs.writeFileSync('./tmp/.gitkeep', '')

      // ترتيب تنسيق محتوى الملف النصي بشكل احترافي
      const fileContent = `=====================================\n📚 ${safeNovelTitle}\n📌 ${safeChapterTitle}\n=====================================\n\n${content.text}\n\n-------------------------------------\n✨ 𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 - 𝚂𝚄𝙽𝙾𝚅𝙴𝙻𝚂 📖`
      
      fs.writeFileSync(filePath, fileContent, 'utf8')

      await conn.sendMessage(
        m.chat,
        {
          document: fs.readFileSync(filePath),
          mimetype: 'text/plain',
          fileName: fileName,
          caption: `✨ ━━━〔 *تم جلب الفصل بنجاح* 📖 〕━━━ ✨\n\n📚 ┊ *الرواية:* ${safeNovelTitle}\n📌 ┊ *الفصل:* ${safeChapterTitle}\n\n⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁`
        },
        { quoted: m }
      )

      try { fs.unlinkSync(filePath) } catch {}
      await m.react('✅')
      return
    }

  } catch (error) {
    console.error('❌ Novel Handler Error:', error)
    await m.react('❌').catch(() => {})
    await sendThemedText(conn, m, '❌ عذراً حدث خطأ', error.message || 'خطأ غير معروف أثناء معالجة الطلب.')
  }
}

handler.help = ['رواية <اسم>']
handler.tags = ['internet']
handler.command = [
  'رواية', 'روايه', 'anovel',
  'رواية-اختيار', 'روايه-اختيار',
  'رواية-صفحة', 'روايه-صفحة',
  'رواية-فصل', 'روايه-فصل'
]

export default handler
