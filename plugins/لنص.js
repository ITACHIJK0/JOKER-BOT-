/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪᴛ𝙰𝙲𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 」
「 لا تحذف الحقوق 🖤 」
*/

import axios from 'axios'
import FormData from 'form-data'
import { theme } from '../core/theme.js'

const GLADIA_API_KEY = 'sk_gladia_9777ec61e97a4614b9d6f7a75ab5be0c'

const handler = async (m, { conn, usedPrefix, command }) => {
   const q = m.quoted ? m.quoted : m
   const mime = (q.msg || q).mimetype || ''

   if (!/audio/.test(mime)) {
      const errorContent = [
         { type: 'title', text: '🎙️ تـحـويـل الـصـوت إلـى نـص' },
         { type: 'divider' },
         { type: 'line', text: '❌ قم بالرد على مقطع صوتي أو ريكورد للتحويل.' },
         { type: 'info', label: 'الاستخدام', value: `الرد بـ ${usedPrefix}${command} على الصوت` }
      ]
      return conn.reply(m.chat, theme.build(errorContent), m)
   }

   await m.react('⏳')

   try {
      const audioBuffer = await q.download()
      if (!audioBuffer) throw new Error('فشل تحميل المقطع الصوتي.')

      const form = new FormData()
      form.append('audio', audioBuffer, {
         filename: 'audio.mp3',
         contentType: mime
      })

      const uploadRes = await axios.post('https://api.gladia.io/v2/upload', form, {
         headers: {
            ...form.getHeaders(),
            'x-gladia-key': GLADIA_API_KEY
         }
      })

      const audioUrl = uploadRes.data?.audio_url
      if (!audioUrl) throw new Error('لم يتم الاستجابة برابط الصوت من API Gladia.')

      const transcribeRes = await axios.post(
         'https://api.gladia.io/v2/transcription',
         {
            audio_url: audioUrl
         },
         {
            headers: {
               'Content-Type': 'application/json',
               'x-gladia-key': GLADIA_API_KEY
            }
         }
      )

      const resultUrl = transcribeRes.data?.result_url
      if (!resultUrl) throw new Error('فشل إنشاء مهمة تفريغ الصوت.')

      let transcriptText = ''
      let isCompleted = false
      let attempts = 0

      while (!isCompleted && attempts < 30) {
         await new Promise(resolve => setTimeout(resolve, 2000))
         attempts++

         const statusRes = await axios.get(resultUrl, {
            headers: { 'x-gladia-key': GLADIA_API_KEY }
         })

         const status = statusRes.data?.status
         if (status === 'done') {
            transcriptText = statusRes.data?.result?.transcription?.full_transcript || ''
            isCompleted = true
         } else if (status === 'error') {
            throw new Error('حدث خطأ في معالجة الصوت داخل السيرفر.')
         }
      }

      if (!transcriptText) throw new Error('لم يتم العثور على نص داخل المقطع الصوتي.')

      await m.react('✅')

      const successContent = [
         { type: 'title', text: '📝 الـنـص الـمـسـتـخـرج' },
         { type: 'divider' },
         { type: 'line', text: transcriptText }
      ]

      await conn.reply(m.chat, theme.build(successContent), m)

   } catch (e) {
      console.error('[Joker STT Error]', e)
      await m.react('❌').catch(() => {})

      const valError = e.response?.data?.validation_errors
      const errorMsg = valError ? JSON.stringify(valError) : (e.response?.data?.message || e.message)

      await conn.reply(m.chat, theme.error(`تعذر تفريغ الصوت.\n\n*الخطأ:* ${errorMsg}`), m)
   }
}

handler.help = ['لنص', 'stt']
handler.tags = ['tools']
handler.command = /^(لنص|لتكست|stt|transcribe)$/i

export default handler
