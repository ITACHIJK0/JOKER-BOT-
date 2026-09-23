/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪᴛ𝙰𝙲𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 」
「 لا تحذف الحقوق 🖤 」
*/

import fetch from 'node-fetch'
import { spawn } from 'child_process'
import { theme } from '../core/theme.js'

function toOpus(buffer) {
   return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
         '-i', 'pipe:0',
         '-vn',
         '-c:a', 'libopus',
         '-b:a', '128k',
         '-f', 'ogg',
         'pipe:1'
      ])

      let data = []

      ffmpeg.stdout.on('data', chunk => data.push(chunk))
      ffmpeg.stderr.on('data', () => {})
      ffmpeg.on('close', () => resolve(Buffer.concat(data)))
      ffmpeg.on('error', reject)
      
      ffmpeg.stdin.write(buffer)
      ffmpeg.stdin.end()
   })
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
   if (!text) {
      const errorContent = [
         { type: 'title', text: '🎙️ تـحـويـل الـنـص إلـى صـوت' },
         { type: 'divider' },
         { type: 'line', text: '❌ أضف النص الذي تريد من البوت نطقه بعد الأمر.' },
         { type: 'info', label: 'الاستخدام', value: `${usedPrefix}${command} مرحباً بك` }
      ]
      return conn.reply(m.chat, theme.build(errorContent), m)
   }

   try {
      await m.react('🎙️')

      const channelId = '120363429074575231@newsletter'
      const channelName = '𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸'
      const thumbnailUrl = 'https://file.garden/aauvg01sjleV_ic1/nier%20automata%20by%20GoddessMechanic.jpg'

      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ar&client=tw-ob`

      const res = await fetch(url, {
         headers: {
            'User-Agent': 'Mozilla/5.0'
         }
      })

      const arrayBuffer = await res.arrayBuffer()
      const buff = Buffer.from(arrayBuffer)
      const opus = await toOpus(buff)

      await conn.sendMessage(
         m.chat,
         {
            audio: opus,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true,
            contextInfo: {
               mentionedJid: [m.sender],
               isForwarded: true,
               forwardingScore: 9999,
               forwardedNewsletterMessageInfo: {
                  newsletterJid: channelId,
                  serverMessageId: 1,
                  newsletterName: channelName
               },
               externalAdReply: {
                  title: '⌁ 𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ⌁',
                  body: '𝙱𝚈 𝙸𝚃𝙰𝙲𝙷𝙸',
                  thumbnailUrl: thumbnailUrl,
                  mediaType: 1,
                  renderLargerThumbnail: true
               }
            }
         },
         { quoted: m }
      )

      await m.react('✅')

   } catch (e) {
      console.error('[Joker Speak Error]', e)
      await m.react('❌').catch(() => {})
      await conn.reply(m.chat, theme.error('حدث خطأ أثناء معالجة وتحويل النص إلى صوت.'), m)
   }
}

handler.help = ['انطق', 'speak']
handler.tags = ['ai', 'tools']
handler.command = /^anطق|انطق|speak$/i

export default handler
