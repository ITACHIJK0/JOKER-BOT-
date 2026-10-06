/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾ْت ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪᴛ𝙰𝙲𝙷𝙸
| وحدة الفوازير الجماعية التفاعلية الذكية 🧩🔥 |
*/

import { generateWAMessageFromContent, proto } from "@whiskeysockets/baileys";

// معلومات القناة الرسمية
const channelJid = '120363429074575231@newsletter';
const channelName = '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ';

// قاعدة بيانات الفوازير الاحترافية والممتعة (مع كلمات مفتاحية للتقريب)
const fawazeerList = [
    { question: "ما هو الشيء الذي كلما أخذت منه كبر وتضخم؟", answer: "الحفرة", keywords: ["حفره", "بئر", "حفر"] },
    { question: "من هو الذى يرى عدوه وصديقه بعين واحدة؟", answer: "الأعور", keywords: ["اعور", "اعرج"] },
    { question: "ما هي القناة التي تجمع كل دول العالم بدون ماء؟", answer: "قناة التلفزيون", keywords: ["تلفزيون", "تلفاز", "مذياع"] },
    { question: "أين يوجد البحر الذي لا يوجد به قطرة ماء واحدة؟", answer: "على الخريطة", keywords: ["خريطه", "ورقه", "رسم"] },
    { question: "ما هو الشيء الذي يقرقش أسنانك ولكنه لا يأكلك؟", answer: "المشط", keywords: ["مشط", "مقص"] },
    { question: "ما هو الشيء الذي يمشي ويثبت ليس له أرجل؟", answer: "الساعة", keywords: ["ساعه", "عقارب"] },
    { question: "كم شهراً في السنة يحتوي على 28 يوم؟", answer: "جميع الشهور", keywords: ["كل الشهور", "الكل", "جميعها", "كلها"] },
    { question: "ما هو الشيء الذي إذا أزلنا حرفه طار؟", answer: "قطار", keywords: ["قطار", "قطاره"] },
    { question: "ابن أمك وأبيك، وليس بأخيك ولا أختك، فمن يكون؟", answer: "أنت", keywords: ["انت", "انا", "نفسي"] },
    { question: "ما هو الشيء الذي يتكلم جميع لغات العالم؟", answer: "صدى الصوت", keywords: ["صدى", "الصوت"] },
    { question: "ما هو البيت الذي ليس فيه أبواب ولا نوافذ؟", answer: "بيت الشعر", keywords: ["شعر", "خيمه", "بيوت الشعر"] },
    { question: "يولد كبيراً ويموت صغيراً، فما هو؟", answer: "الشمعة", keywords: ["شمعة", "شمع"] },
    { question: "ما هو الشّيء الّذي يَكتُب ولا يقرأ؟", answer: "القلم", keywords: ["قلم", "الحبر"] },
    { question: "ما هو الشيء الذي يحملك وتحمله في نفس الوقت؟", answer: "الحذاء", keywords: ["حذاء", "جزمه", "نعال"] },
    { question: "ما هو الشيء الذي إذا دخل الماء لا يبتل؟", answer: "الضوء", keywords: ["ضوء", "نور", "ظل"] },
    { question: "ما هو الشيء الذي كلما خطوت خطوة نقص شيئاً من طوله؟", answer: "العصا", keywords: ["عصا", "حبل", "شمعة"] },
    { question: "ما هو الشيء الذي لا يبتل حتى لو دخل وسط البحر؟", answer: "الظل", keywords: ["ظل", "خيال"] },
    { question: "ما هو الشيء الذي يرفع اثقال ولا يقدر يرفع مسمار؟", answer: "البحر", keywords: ["بحر", "محيط"] },
    { question: "من هو الشخص الذي يرى رفيقه أمامه طوال الوقت ولا يمكنه لمسه؟", answer: "المرايا", keywords: ["مرآة", "مرايا", "عكس"] },
    { question: "ما هو الشيء الذي يكسر نفسه بنفسه دون مساعدة؟", answer: "البيض", keywords: ["بيض", "بيضة"] }
];

// تخزين الفوازير النشطة لكل جروب (Global Chat Database)
if (!global.activeFawazeer) global.activeFawazeer = {};

let handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.isGroup) {
        return conn.reply(m.chat, `⚠️ أمر الفوازير مخصص للعمل داخل المجموعات فقط لتنافس الأعضاء!`, m);
    }

    // التحقق إذا كان هناك لغز نشط بالفعل في هذه المجموعة
    if (global.activeFawazeer[m.chat]) {
        let active = global.activeFawazeer[m.chat];
        return conn.reply(
            m.chat,
            `👑 *[ وحدة الفوازير الجماعية ]* 👑\n\n` +
            `⚠️ يوجد لغز نشط بالفعل في هذه المجموعة ولم يتم حله بعد!\n` +
            `🔮 *اللغز الحالي:* ${active.question}\n\n` +
            `💡 رد على رسالة اللغز بإجابتك الصحيحة واكسب الجائزة!\n\n` +
            `▪️ 👑 ${channelName}`,
            m
        );
    }

    const fzora = fawazeerList[Math.floor(Math.random() * fawazeerList.length)];
    const timestamp = Date.now();

    // إرسال رسالة اللغز وتخزين معرفها للجروب
    const menuText = 
        `👑 *[ تحدي الفوازير الجماعي السيبراني ]* 👑\n\n` +
        `🧩 *اللغز:* ${fzora.question}\n\n` +
        `⏰ *المهلة الزمنية:* دقيقة ونصف (90 ثانية)\n` +
        `💰 *الجائزة:* 150 نقطة تودع في بنك الفائز فوراً!\n\n` +
        `💡 *قم بالرد على هذه الرسالة بإجابتك الصحيحة!* (اللغز متاح للجميع 🎯)`;

    const interactiveMessage = {
        body: { text: menuText },
        footer: { text: `▪️ 👑 ${channelName}` },
        nativeFlowMessage: {
            buttons: [
                {
                    name: 'cta_url',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📢 تابع قناة النظام الرسمية',
                        url: `https://whatsapp.com/channel/${channelJid.replace('@newsletter', '')}`,
                        merchant_url: `https://whatsapp.com/channel/${channelJid.replace('@newsletter', '')}`
                    })
                },
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🧩 لغز آخر جديد ⚡',
                        id: `${usedPrefix + command}`
                    })
                }
            ],
            messageParamsJson: JSON.stringify({
                bottom_sheet: {
                    in_thread_buttons_limit: 3,
                    divider_indices: []
                }
            })
        }
    };

    const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.fromObject(interactiveMessage)
            }
        }
    }, { userJid: conn.user.jid, quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '🧩', key: m.key } });
    let sentMsg = await conn.relayMessage(m.chat, msg.message, { messageId: m.key.id });

    // تسجيل اللغز النشط للجروب برقم الـ messageId الحقيقي
    global.activeFawazeer[m.chat] = {
        messageId: m.key.id,
        question: fzora.question,
        answer: fzora.answer.toLowerCase().trim(),
        keywords: fzora.keywords || [],
        askedAt: timestamp
    };

    // مؤقت انتهاء المهلة (90 ثانية)
    setTimeout(async () => {
        try {
            if (global.activeFawazeer[m.chat] && global.activeFawazeer[m.chat].askedAt === timestamp) {
                const correctAnswer = global.activeFawazeer[m.chat].answer;
                delete global.activeFawazeer[m.chat];

                await conn.reply(
                    m.chat,
                    `👑 *[ انتهاء وقت الفزورة ]* 👑\n\n` +
                    `⏰ انتهى الوقت المخصص ولم يستطع أحد حل اللغز!\n` +
                    `🔮 *الإجابة الصحيحة كانت:* ${correctAnswer}\n\n` +
                    `▪️ 👑 ${channelName}`,
                    m
                );
            }
        } catch (err) {}
    }, 90000);
};

// معالج الإجابات التلقائي والتفاعل الذكي مع ردود الأصدقاء
handler.before = async (m, { conn }) => {
    if (!m.text || m.isCommand || !m.isGroup) return false;

    // التحقق إذا كان في هذه المجموعة لغز نشط
    let activeFzora = global.activeFawazeer[m.chat];
    if (!activeFzora) return false;

    // التحقق أن الشخص رد على رسالة اللغز نفسها (لضمان الدقة وتجنب تداخل الدردشة)
    let isQuotingFzora = m.quoted && m.quoted.id === activeFzora.messageId;
    if (!isQuotingFzora) return false;

    const userAnswer = m.text.toLowerCase().trim();
    const correctAnswer = activeFzora.answer;

    // تهيئة بيانات المستخدم في البنك والنقاط
    if (!global.db.data.users) global.db.data.users = {};
    if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = { points: 0, bank: 0 };
    }
    let userData = global.db.data.users[m.sender];
    if (typeof userData.bank !== 'number') userData.bank = 0;

    // 1. الإجابة الصحيحة تماماً
    if (userAnswer === correctAnswer || userAnswer.includes(correctAnswer)) {
        userData.bank += 150; // جائزة 150 نقطة
        delete global.activeFawazeer[m.chat]; // إنهاء اللغز بنجاح

        const wonText = 
            `👑 *[ إجابة صحيحة ومظفرة! ]* 👑\n\n` +
            `🎉 كفو والله يا @${m.sender.split('@')[0]}!\n` +
            `💰 *تم إيداع 150 نقطة بنجاح في بنكك الشخصي!*\n` +
            `🏦 *رصيدك البنكي الحالي:* ${userData.bank} نقطة\n\n` +
            `▪️ 👑 ${channelName}`;

        await conn.reply(m.chat, wonText, m, { mentions: [m.sender] });
        await conn.sendMessage(m.chat, { react: { text: '🎉', key: m.key } });
        return true;
    }

    // 2. الإجابة القريبة (عبر مطابقة الكلمات المفتاحية الذكية)
    let isClose = activeFzora.keywords.some(kw => userAnswer.includes(kw));
    if (isClose) {
        await conn.sendMessage(m.chat, { react: { text: '🔥', key: m.key } });
        await conn.reply(m.chat, `⚠️ إجابتك قريبة جداً يا @${m.sender.split('@')[0]}، حاول تاني لسا ما وصلت للإجابة الدقيقة! 🧠🔥`, m, { mentions: [m.sender] });
        return true;
    }

    // 3. الإجابة الخاطئة
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    await conn.reply(m.chat, `❌ إجابة خاطئة يا @${m.sender.split('@')[0]}، ركز وحاول مرة تانية قبل ما الوقت يخلص! ⏳`, m, { mentions: [m.sender] });
    return true;
};

handler.help = ['فزوره', 'فزورة', 'لغز', 'فوازير'];
handler.tags = ['fun', 'game'];
handler.command = /^(فزوره|فزورة|لغز|فوازير)$/i;

export default handler;
