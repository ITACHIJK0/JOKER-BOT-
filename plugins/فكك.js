// plugins/game-fakk-kitaba.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - نظام ألعاب فكك وكتابة 🔤⚔️

import fs from 'fs'
import path from 'path'
import { theme } from '../core/theme.js'

let timeout = 60000
let poin = 50

function loadDatabase(chatId) {
  try {
    const safeChatId = chatId ? chatId.replace(/[^a-zA-Z0-9]/g, '_') : 'global'
    const dbPath = path.resolve(`database/groups/${safeChatId}/bank.json`)

    if (!fs.existsSync(dbPath)) {
      const dir = path.dirname(dbPath)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(dbPath, JSON.stringify({}, null, 2))
    }
    const data = fs.readFileSync(dbPath, 'utf-8')
    return JSON.parse(data)
  } catch (e) {
    console.error('[Game DB Error]', e)
    return {}
  }
}

function saveDatabase(chatId, data) {
  try {
    const safeChatId = chatId ? chatId.replace(/[^a-zA-Z0-9]/g, '_') : 'global'
    const dbPath = path.resolve(`database/groups/${safeChatId}/bank.json`)
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
  } catch (e) {
    console.error('[Game Save Error]', e)
  }
}

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    if (!m.isGroup) {
      return await conn.reply(m.chat, `⚠️ ألعاب التحدي مخصصة للعمل داخل المجموعات فقط!`, m)
    }

    conn.tekateki = conn.tekateki || {}
    let id = m.chat

    if (id in conn.tekateki) {
      return await conn.reply(m.chat, theme.build([
        { type: 'title', text: '⚠️️ تنبيه سيبراني' },
        { type: 'line', text: 'هناك مهمة قائمة بالفعل في المجموعة، انتظر انتهاء الجولة الحالية!' },
        { type: 'divider' },
        { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
      ]), m)
    }

    if (!fs.existsSync("./src/game/فكك.json")) {
      return await conn.reply(m.chat, `⚠️ ملف أسئلة الألعاب غير موجود في النظام!`, m)
    }

    let tekateki = JSON.parse(fs.readFileSync("./src/game/فكك.json"))
    let json = tekateki[Math.floor(Math.random() * tekateki.length)]
    let originalWord = json.response.trim()

    let questionText = ""
    let gameTitle = ""

    if (command === 'فكك') {
      gameTitle = "تحدي فك الكلمة"
      questionText = `الكلمة المراد تفكيكها: [ ${originalWord} ]\nالمطلوب: أرسل حروف الكلمة مفرقة (بالرد على الرسالة)!`
    } else if (command === 'كتابه' || command === 'كتابة') {
      gameTitle = "تحدي دمج وكتابة الكلمة"
      let spacedLetters = originalWord.split('').join('   ')
      questionText = `الحروف المبعثرة: [ ${spacedLetters} ]\nالمطلوب: اكتب الكلمة متصلة وصحيحة (بالرد على الرسالة)!`
    }

    let sent = await conn.reply(m.chat, theme.build([
      { type: 'title', text: `🔥 ${gameTitle} 🔥` },
      { type: 'spacer' },
      { type: 'line', text: questionText },
      { type: 'divider' },
      { type: 'info', label: 'الوقت المتاح', value: `${(timeout / 1000).toFixed(0)} ثانية` },
      { type: 'info', label: 'الجائزة', value: `${poin} نقطة وذهب` },
      { type: 'info', label: 'المتحدي', value: `@${m.sender.split("@")[0]}` },
      { type: 'divider' },
      { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
    ]), m)

    conn.tekateki[id] = [
      sent,
      json,
      poin,
      setTimeout(async () => {
        if (conn.tekateki[id]) {
          await conn.sendMessage(m.chat, {
            text: theme.build([
              { type: 'title', text: '⏰ انتهى وقت التحدي' },
              { type: 'line', text: 'لم يتم الإجابة في الوقت المحدد.' },
              { type: 'info', label: 'الإجابة الصحيحة', value: originalWord },
              { type: 'divider' },
              { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ])
          }, { quoted: sent })
          delete conn.tekateki[id]
        }
      }, timeout),
      command,
      sent.key.id // حفظ معرف رسالة السؤال لضمان التحقق من الرد (Reply)
    ]

    await m.react("✍️")

  } catch (e) {
    console.error('[Game Error]', e)
    await conn.reply(m.chat, `> 🃏 *ITACHI & JOKER: "خطأ"*\n> 🔮 حدث خطأ أثناء تشغيل اللعبة`, m)
  }
}

handler.before = async (m, { conn }) => {
  let id = m.chat
  if (!conn.tekateki || !conn.tekateki[id]) return false
  if (!m.text) return false

  let game = conn.tekateki[id]
  let sentMsgKey = game[5]

  // شرط إلزامي: يجب أن يكون العضو قد رد (Reply) على رسالة السؤال تماماً
  let isQuotedQuestion = m.quoted && m.quoted.id === sentMsgKey
  if (!isQuotedQuestion) return false

  let json = game[1]
  let poin = game[2]
  let gameType = game[4]

  let userAnswer = m.text.trim().toLowerCase()
  let correctAnswer = json.response.trim().toLowerCase()

  let isMatch = false
  if (gameType === 'فكك') {
    let userClean = userAnswer.replace(/\s+/g, '')
    let correctClean = correctAnswer.replace(/\s+/g, '')
    if (userClean === correctClean || userAnswer.includes(correctClean)) {
      isMatch = true
    }
  } else {
    let userClean = userAnswer.replace(/\s+/g, '')
    let correctClean = correctAnswer.replace(/\s+/g, '')
    if (userClean === correctClean) {
      isMatch = true
    }
  }

  if (isMatch) {
    let db = loadDatabase(m.chat)
    let isNewUser = false

    if (!db[m.sender]) {
      db[m.sender] = {
        name: m.pushName || m.sender.split('@')[0],
        title: 'مستخدم جديد',
        coins: 0,
        diamonds: 5,
        points: 0,
        wallet: 0,
        rankLevel: 1,
        lastDaily: 0,
        lastMissionDate: '',
        missionCompletedToday: false
      }
      isNewUser = true
    }

    db[m.sender].coins = (db[m.sender].coins || 0) + poin
    db[m.sender].points = (db[m.sender].points || 0) + poin
    saveDatabase(m.chat, db)

    let newUserNotice = isNewUser ? `\n⚠️ تنبيه بنكي: تم فتح حساب جديد لك باللقب (مستخدم جديد).\n` : ''

    await conn.reply(m.chat, theme.build([
      { type: 'title', text: '✅ إجابة صحيحة ومظفرة' },
      { type: 'line', text: 'أحسنت أيها المحارب العبقري!' },
      { type: 'divider' },
      { type: 'info', label: 'المتحدي الفائز', value: `@${m.sender.split("@")[0]}` },
      { type: 'info', label: 'المكافأة المضافة', value: `+${poin} نقطة وذهب` },
      { type: 'info', label: 'الإجابة الصحيحة', value: json.response },
      { type: 'info', label: 'رصيدك البنكي', value: `${db[m.sender].coins} ذهبة (${db[m.sender].points} نقطة)` },
      ...(newUserNotice ? [{ type: 'line', text: newUserNotice }] : []),
      { type: 'divider' },
      { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 𝜰' }
    ]), m)

    clearTimeout(game[3])
    delete conn.tekateki[id]
    return true
  }

  return false
}

handler.help = ["فكك", "كتابه", "كتابة"]
handler.tags = ["game"]
handler.command = /^(فكك|كتابه|كتابة)$/i
handler.group = true

export default handler
