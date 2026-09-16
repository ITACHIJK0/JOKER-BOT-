// plugins/مارد.js
// 🧞 المارد = تخمين الشخصية بأزرار (أكيناتور)

import { addXP, addMoney } from '../core/العاب.js'
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

const sessions = new Map()

const ANSWER_MAP = {
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4,
  'نعم': 0, 'ايوه': 0, 'أيوه': 0, 'yes': 0, 'y': 0,
  'لا': 1, 'لأ': 1, 'no': 1, 'n': 1,
  'مش_عارف': 2, 'مش عارف': 2, 'معرفش': 2, 'لا اعلم': 2, 'idk': 2, 'dk': 2,
  'ممكن': 3, 'احتمال': 3, 'probably': 3, 'p': 3,
  'مستبعد': 4, 'غالبا لا': 4, 'probably not': 4, 'pn': 4
}

async function createAki() {
  try {
    const mod = await import('silent-akinator-pro')
    const Akinator = mod.default || mod.Akinator || mod
    const aki = new Akinator({ region: 'ar', childMode: false })
    await aki.start()
    return { type: 'silent', aki }
  } catch (e1) {
    try {
      const mod = await import('aki-api')
      const Aki = mod.Aki || mod.default?.Aki
      const aki = new Aki({ region: 'ar', childMode: false })
      await aki.start()
      return { type: 'aki-api', aki }
    } catch (e2) {
      throw new Error(`مارد API مش متاح: ${e1?.message || e1}`)
    }
  }
}

function progressOf(session) {
  const a = session.aki
  if (session.type === 'silent') return Math.round(Number(a.progress || a.currentStep || 0))
  return Math.round(Number(a.progress || 0))
}

function questionOf(session) {
  return session.aki.question || session.aki.currentQuestion || '...'
}

async function stepAnswer(session, answerIndex) {
  if (session.type === 'silent') await session.aki.answer(answerIndex)
  else await session.aki.step(answerIndex)
}

async function stepBack(session) {
  if (session.type === 'silent') {
    if (typeof session.aki.back === 'function') await session.aki.back()
    else throw new Error('رجوع غير مدعوم')
  } else await session.aki.back()
}

function guessData(session) {
  const a = session.aki
  if (session.type === 'silent') {
    return {
      name: a.guess?.name || a.name || a.answers?.[0]?.name,
      desc: a.guess?.description || a.description || '',
      img: a.guess?.absolute_picture_path || a.guess?.photo || a.photo || null
    }
  }
  return {
    name: a.answers?.[0]?.name || a.guess?.name,
    desc: a.answers?.[0]?.description || '',
    img: a.answers?.[0]?.absolute_picture_path || null
  }
}

function won(session) {
  const a = session.aki
  if (typeof a.win === 'boolean') return a.win
  if (a.guessed != null) return !!a.guessed
  return Number(a.progress || 0) >= 85 && (a.answers?.length > 0 || a.guess)
}

async function sendQuestionButtons(conn, m, session, prefix = '.') {
  const body = `🧞 *المارد - تخمين الشخصية*

📊 التقدم: *${progressOf(session)}%*

❓ *${questionOf(session)}*

اضغط زر الإجابة:`

  const nativeFlowPayload = {
    body: { text: body },
    footer: { text: '🃏 جوكر • المطور: إيتاشي' },
    nativeFlowMessage: {
      buttons: [
        {
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '📝 اختر إجابة',
            sections: [{
              title: 'الإجابات',
              rows: [
                { title: '✅ نعم', description: 'الإجابة: نعم', id: `${prefix}مارد نعم` },
                { title: '❌ لا', description: 'الإجابة: لا', id: `${prefix}مارد لا` },
                { title: '🤔 مش عارف', description: 'مش متأكد', id: `${prefix}مارد مش_عارف` },
                { title: '✨ ممكن', description: 'احتمال نعم', id: `${prefix}مارد ممكن` },
                { title: '🚫 مستبعد', description: 'احتمال لا', id: `${prefix}مارد مستبعد` }
              ]
            }]
          })
        },
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({ display_text: '✅ نعم', id: `${prefix}مارد نعم` })
        },
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({ display_text: '❌ لا', id: `${prefix}مارد لا` })
        },
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({ display_text: '↩️ رجوع', id: `${prefix}مارد رجوع` })
        },
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({ display_text: '🛑 وقف', id: `${prefix}مارد وقف` })
        }
      ]
    },
    header: {
      hasMediaAttachment: false,
      title: '🧞 المارد',
      subtitle: 'تخمين الشخصية'
    }
  }

  try {
    const interactiveMessage = proto.Message.InteractiveMessage.fromObject(nativeFlowPayload)
    const msg = generateWAMessageFromContent(
      m.chat,
      { interactiveMessage },
      { userJid: conn.user?.jid || conn.user?.id, quoted: m }
    )
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  } catch (e) {
    // fallback نصي لو الأزرار فشلت
    console.error('[مارد buttons]', e?.message || e)
    await m.reply(`${body}

الإجابات:
*نعم* / *لا* / *مش عارف* / *ممكن* / *مستبعد*
*رجوع* | *وقف*`)
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const key = `${m.chat}:${m.sender}`
  const arg = (text || '').trim()
  const low = arg.toLowerCase().replace(/\s+/g, '_')

  // وقف
  if (/^(وقف|الغاء|إلغاء|stop|end)$/i.test(low)) {
    sessions.delete(key)
    return m.reply('🧞 تم إيقاف لعبة المارد.')
  }

  // رجوع
  if (/^(رجوع|back|previous)$/i.test(low)) {
    const session = sessions.get(key)
    if (!session) return m.reply(`مفيش لعبة شغالة.\nابدأ: ${usedPrefix}مارد`)
    try {
      await stepBack(session)
      return sendQuestionButtons(conn, m, session, usedPrefix)
    } catch {
      return m.reply('❌ مش قادر أرجع للسؤال السابق')
    }
  }

  // إجابة
  if (sessions.has(key) && arg) {
    const session = sessions.get(key)
    let idx = ANSWER_MAP[low] ?? ANSWER_MAP[arg]
    if (idx === undefined && /^\d$/.test(arg)) idx = parseInt(arg, 10)
    if (idx === undefined || idx < 0 || idx > 4) {
      return sendQuestionButtons(conn, m, session, usedPrefix)
    }

    try {
      await stepAnswer(session, idx)

      if (won(session) || progressOf(session) >= 90) {
        try { if (typeof session.aki.win === 'function') await session.aki.win() } catch {}
        const g = guessData(session)
        sessions.delete(key)

        const xp = 40
        const money = 35
        await addXP(m.sender, xp, conn, m)
        addMoney(m.sender, money)

        const caption = `🧞 *أنا عرفت الشخصية!*

👤 *${g.name || '???'}*
${g.desc ? `📝 ${g.desc}\n` : ''}
🎁 +${xp} XP | +${money} 💰

لعبة جديدة: ${usedPrefix}مارد`

        // زر إعادة اللعب
        try {
          const nativeFlowPayload = {
            body: { text: caption },
            footer: { text: '🃏 جوكر • المطور: إيتاشي' },
            nativeFlowMessage: {
              buttons: [
                {
                  name: 'quick_reply',
                  buttonParamsJson: JSON.stringify({ display_text: '🔁 لعبة جديدة', id: `${usedPrefix}مارد` })
                }
              ]
            },
            header: { hasMediaAttachment: false, title: '🧞 تم التخمين!', subtitle: g.name || '' }
          }
          if (g.img) {
            try {
              await conn.sendMessage(m.chat, { image: { url: g.img }, caption }, { quoted: m })
            } catch {
              await m.reply(caption)
            }
          } else {
            const interactiveMessage = proto.Message.InteractiveMessage.fromObject(nativeFlowPayload)
            const msg = generateWAMessageFromContent(
              m.chat,
              { interactiveMessage },
              { userJid: conn.user?.jid || conn.user?.id, quoted: m }
            )
            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
          }
          return
        } catch {
          if (g.img) {
            try {
              await conn.sendMessage(m.chat, { image: { url: g.img }, caption }, { quoted: m })
              return
            } catch {}
          }
          return m.reply(caption)
        }
      }

      return sendQuestionButtons(conn, m, session, usedPrefix)
    } catch (e) {
      sessions.delete(key)
      return m.reply(`❌ حصل خطأ: ${e.message || e}\nابدأ من جديد: ${usedPrefix}مارد`)
    }
  }

  // لعبة شغالة من غير نص
  if (sessions.has(key) && !arg) {
    return sendQuestionButtons(conn, m, sessions.get(key), usedPrefix)
  }

  // بدء
  await m.reply('🧞 المارد بيحضّر الأسئلة... فكر في شخصية!')
  try {
    const session = await createAki()
    sessions.set(key, session)
    return sendQuestionButtons(conn, m, session, usedPrefix)
  } catch (e) {
    return m.reply(`❌ المارد مش قادر يتصل الآن.
${e.message || e}

بعد الرفع نفذ: npm install`)
  }
}

handler.help = ['مارد']
handler.tags = ['games']
handler.command = /^(مارد|اكيناتور|akinator|aki)$/i

export default handler
