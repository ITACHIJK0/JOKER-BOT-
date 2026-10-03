// plugins/fun-stats.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - أوامر التسلية المتقدمة 🎭

import { theme } from '../core/theme.js';

let handler = async (m, { conn, command, text, usedPrefix }) => {
  const rand = (max) => Math.floor(Math.random() * (max + 1));

  // مصفوفة المطورين المعتمدة
  const allowedOwners = [
    '249927142037@s.whatsapp.net',
    '249916221538@s.whatsapp.net',
    '212408480080003@lid',
    '14904274759837@lid'
  ];

  const isDeveloper = (jid, sender) => {
    if (!jid && !sender) return false;
    return allowedOwners.includes(jid) || allowedOwners.includes(sender) || allowedOwners.some(owner => (jid && jid.includes(owner.split('@')[0])) || (sender && sender.includes(owner.split('@')[0])));
  };

  const senderJid = typeof conn.convertLidToRealJid === 'function' 
    ? await conn.convertLidToRealJid(m.sender, m.chat).catch(() => m.sender) 
    : m.sender;
    
  const isSenderDev = isDeveloper(senderJid, m.sender);

  let targetJid = '';
  let isTargetDev = false;

  // تحديد المستهدف (منشن، رد، أو الكاتب نفسه)
  if (m.mentionedJid && m.mentionedJid[0]) {
    targetJid = typeof conn.convertLidToRealJid === 'function' 
      ? await conn.convertLidToRealJid(m.mentionedJid[0], m.chat).catch(() => m.mentionedJid[0]) 
      : m.mentionedJid[0];
    isTargetDev = isDeveloper(targetJid, m.mentionedJid[0]);
  } else if (m.quoted && m.quoted.sender) {
    targetJid = typeof conn.convertLidToRealJid === 'function' 
      ? await conn.convertLidToRealJid(m.quoted.sender, m.chat).catch(() => m.quoted.sender) 
      : m.quoted.sender;
    isTargetDev = isDeveloper(targetJid, m.quoted.sender);
  } else {
    targetJid = senderJid;
    isTargetDev = isSenderDev;
  }

  if (!targetJid) targetJid = m.sender;

  const randomPercent = rand(100);
  let emoji = '📊';
  let statTitle = '';
  let comment = '';

  // عناوين وميمات الأوامر
  const statsInfo = {
    'ورع': { title: 'نسبة الورع', emoji: '🧒', high: 'يا سلام ورع بمعنى الكلمة 😂', low: 'لسه صغير وواعد 🧒' },
    'اهبل': { title: 'نسبة الهبل', emoji: '🤪', high: 'اهبل بطل خلي بالك منه 😂', low: 'لسه شاطر وواعي 🧠' },
    'خروف': { title: 'نسبة الخرفنة', emoji: '🐑', high: 'خروف والله يابو حمل 🐑', low: 'لسه مش خروف كفاية 😅' },
    'جميل': { title: 'نسبة الجمال', emoji: '😍', high: 'فديت القمر اللي منور 🌙', low: 'جمال هادئ وبسيط ✨' },
    'ذكاء': { title: 'نسبة الذكاء', emoji: '🧠', high: 'عبقري بمعنى الكلمة 🧠', low: 'ذكائك في ازدياد مستمر 📈' },
    'غباء': { title: 'نسبة الغباء', emoji: '🤦', high: 'غبي بطل خذ الحذر 🤦', low: 'لسه فيه أمل كبير 🤞' },
    'زنجي': { title: 'نسبة السمار', emoji: '🖤', high: 'ملك الفخامة والسمار الأنيق 🖤🔥', low: 'ملامح هادئة وجذابة ✨' }
  };

  const currentStat = statsInfo[command] || { title: command, emoji: '📊', high: 'ممتاز جداً 🌟', low: 'حالة عادية ⚡' };
  emoji = currentStat.emoji;
  statTitle = currentStat.title;

  // فحص المطور وحمايته الذكية حسب نوع الأمر وصيغة الخطاب
  if (isTargetDev) {
    let devMsgText = '';
    let isSelf = (targetJid === senderJid); // هل المطور هو من كتب الأمر بنفسه؟

    if (command === 'ذكاء') {
      if (isSelf) {
        devMsgText = '💬 لو حاسبنا نسبه ذكائك ي سيدي لما وسعت المساحه للكتابه 🫠🧠';
      } else {
        devMsgText = '💬 هذا الشخص نسبة ذكائه أكبر من أن تكتب بالأرقام لانه عبقري 🤯✨';
      }
    } 
    else if (command === 'جميل') {
      if (isSelf) {
        devMsgText = '💬 انت ي سيدي ليس لديك نسبه جمال لأن جمالك فاق كل النسب 🤭💫';
      } else {
        devMsgText = '💬 لا يوجد مقياس لجمال هذا الشخص لانه اجمل من القمر 🤧🙈';
      }
    } 
    else {
      // باقي الأوامر (غباء، اهبل، خروف، ورع، زنجي)
      let statNameClean = statTitle.replace('نسبة ', '');
      if (isSelf) {
        devMsgText = `💬 أنت يا سيدي ليس لديك نسبة ${statNameClean} لأنك لست كذلك أبداً 👑✨`;
      } else {
        devMsgText = `💬 هذا الشخص نسبة ${statNameClean}ه هي 0% لأنه ليس كذلك نهائياً 🫠🔥`;
      }
    }

    let devFinalMsg = theme.build([
      { type: 'title', text: `⚜️ تـحـلـيـل الـمـاسـتـر (${statTitle})` },
      { type: 'divider' },
      { type: 'info', label: '👤 الشخص', value: `@${targetJid.split('@')[0]}` },
      { type: 'info', label: '📊 النسبة', value: command === 'ذكاء' ? '♾️ (لا نهائية)' : '0%' },
      { type: 'line', text: devMsgText }
    ]);

    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
    return await conn.sendMessage(m.chat, { text: devFinalMsg, mentions: [targetJid] }, { quoted: m });
  }

  // التعليق العشوائي للمستخدمين العاديين
  comment = randomPercent > 70 ? currentStat.high : currentStat.low;

  let resultMsg = theme.build([
    { type: 'title', text: `📊 تـحـلـيـل ${statTitle}` },
    { type: 'divider' },
    { type: 'info', label: '👤 الشخص', value: `@${targetJid.split('@')[0]}` },
    { type: 'info', label: '📈 النسبة', value: `${randomPercent}%` },
    { type: 'line', text: `💬 ${comment}` }
  ]);

  await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
  return await conn.sendMessage(m.chat, { text: resultMsg, mentions: [targetJid] }, { quoted: m });
};

handler.help = ['ورع', 'اهبل', 'خروف', 'جميل', 'ذكاء', 'غباء', 'زنجي'];
handler.tags = ['entertainment'];
handler.command = /^(ورع|اهبل|خروف|جميل|ذكاء|غباء|زنجي)$/i;

export default handler;
