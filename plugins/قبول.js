/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪᴛ𝙰𝙲𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝙅𝙊𝙺𝙴𝙍 𝘽𝙊𝙏 」
「 لا تحذف الحقوق 🖤 」
*/

import { theme } from '../core/theme.js'

const normalize = jid => {
    if (!jid) return ''
    return jid.toString()
        .replace(/:\d+@/, '@')
        .replace(/@s\.whatsapp\.net|@lid|@g\.us/g, '')
        .replace(/\D/g, '')
}

const isParticipantAdmin = (participant, jid) => {
    if (!participant || !jid) return false
    const target = normalize(jid)

    const ids = [
        participant.id,
        participant.jid,
        participant.lid,
        participant.phoneNumber
    ]

    return ids.some(id => normalize(id) === target) && (
        participant.admin === 'admin' ||
        participant.admin === 'superadmin'
    )
}

const sendThemedText = async (conn, m, titleText, descText) => {
    const content = [
        { type: 'title', text: titleText },
        { type: 'divider' },
        { type: 'line', text: descText }
    ]
    return conn.reply(m.chat, theme.build(content), m)
}

const handler = async (m, { conn, args, isOwner, isROwner }) => {
    if (!m.isGroup) {
        return sendThemedText(
            conn,
            m,
            '⚠️ خطأ في الاستخدام',
            'هذا الأمر يعمل داخل المجموعات فقط.'
        )
    }

    let metadata
    try {
        metadata = await conn.groupMetadata(m.chat)
    } catch {
        return sendThemedText(
            conn,
            m,
            '❌ خطأ تقني',
            'تعذر جلب بيانات المجموعة حالياً.'
        )
    }

    const participants = metadata?.participants || []

    const senderAdmin = participants.some(p =>
        isParticipantAdmin(p, m.sender) ||
        isParticipantAdmin(p, m.key?.participant)
    )

    const botJid = conn.user?.id || conn.user?.jid
    const botAdmin = participants.some(p =>
        isParticipantAdmin(p, botJid)
    )

    if (!senderAdmin && !isOwner && !isROwner) {
        return sendThemedText(
            conn,
            m,
            '⛔ صلاحيات مرفوضة',
            'هذا الأمر للمشرفين فقط. تأكد أنك مشرف في المجموعة.'
        )
    }

    if (!botAdmin) {
        return sendThemedText(
            conn,
            m,
            '⚠️ تنبيه للبوت',
            'لا أستطيع تنفيذ الأمر، يجب أن يكون البوت مشرفًا في هذه المجموعة.'
        )
    }

    let requests
    try {
        requests = await conn.groupRequestParticipantsList(m.chat)
    } catch (e) {
        console.error('NOX REQUEST LIST ERROR:', e)
        return sendThemedText(
            conn,
            m,
            '❌ خطأ في الجلب',
            'تعذر جلب طلبات الانضمام. قد تكون نسخة البايليس الحالية لا تدعم هذه العملية.'
        )
    }

    if (!Array.isArray(requests) || requests.length === 0) {
        return sendThemedText(
            conn,
            m,
            '📋 طلبات الانضمام',
            'لا توجد طلبات انضمام معلّقة حاليًا.\n\n✦ كل شيء هادئ.'
        )
    }

    const input = String(args[0] || '').toLowerCase().trim()
    let amount

    if (
        input === 'الكل' ||
        input === 'كل' ||
        input === 'all' ||
        input === '*'
    ) {
        amount = requests.length
    } else if (/^\d+$/.test(input)) {
        amount = Number(input)

        if (amount <= 0) {
            return sendThemedText(
                conn,
                m,
                '⚠️ خطأ في العدد',
                'العدد يجب أن يكون أكبر من صفر.\n\n📌 مثال:\n• قبول 5'
            )
        }
        amount = Math.min(amount, requests.length)
    } else {
        return sendThemedText(
            conn,
            m,
            '📋 لوحة قبول الطلبات',
            `عدد الطلبات المعلقة: *${requests.length}*\n\n` +
            `✦ طرق الاستخدام:\n` +
            `• قبول الكل\n` +
            `• قبول <عدد> (مثال: قبول 5)`
        )
    }

    const selected = requests
        .slice(0, amount)
        .map(user =>
            user.jid ||
            user.id ||
            user.phoneNumber ||
            user.lid
        )
        .filter(Boolean)

    if (!selected.length) {
        return sendThemedText(
            conn,
            m,
            '❌ خطأ',
            'لم أجد أعضاء صالحين لقبولهم.'
        )
    }

    let result
    try {
        result = await conn.groupRequestParticipantsUpdate(
            m.chat,
            selected,
            'approve'
        )
    } catch (e) {
        console.error('NOX APPROVE ERROR:', e)
        return sendThemedText(
            conn,
            m,
            '❌ فشل العملية',
            'فشل قبول الطلبات. تأكد أن البوت مشرف ولديه الصلاحيات اللازمة في المجموعة.'
        )
    }

    let approved = selected.length
    if (Array.isArray(result)) {
        const successful = result.filter(x =>
            String(x?.status) === '200' ||
            String(x?.status) === '201'
        )
        if (successful.length) {
            approved = successful.length
        }
    }

    const remaining = Math.max(
        requests.length - approved,
        0
    )

    const successContent = [
        { type: 'title', text: '✦ تم قبول الطلبات بنجاح' },
        { type: 'divider' },
        { type: 'line', text: `✓ الأعضاء المقبولون: *${approved} طلب*` },
        { type: 'line', text: `◌ الطلبات المتبقية: *${remaining} طلب*` },
        { type: 'divider' },
        { type: 'line', text: '⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁' }
    ]

    return conn.reply(m.chat, theme.build(successContent), m)
}

handler.help = ['قبول الكل', 'قبول <عدد>']
handler.tags = ['group']
handler.command = ['قبول']
handler.group = true

export default handler
