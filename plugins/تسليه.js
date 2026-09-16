// plugins/fun-stats.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - أوامر التسلية المتقدمة 🎭

let handler = async (m, { conn, command, text, usedPrefix }) => {
  const rand = (max) => Math.floor(Math.random() * (max + 1));

  // مصفوفة المطورين المعتمدة (تتضمن الأرقام العادية و الـ LID)
  const allowedOwners = [
    '249927142037@s.whatsapp.net',
    '249916221538@s.whatsapp.net',
    '14904274759837@lid'
  ];

  // دالة لفحص ما إذا كان الـ JID أو الـ Sender يخص المطور
  const isDeveloper = (jid, sender) => {
    if (!jid && !sender) return false;
    return allowedOwners.includes(jid) || allowedOwners.includes(sender) || allowedOwners.some(owner => (jid && jid.includes(owner.split('@')[0])) || (sender && sender.includes(owner.split('@')[0])));
  };

  const senderJid = typeof conn.convertLidToRealJid === 'function' 
    ? await conn.convertLidToRealJid(m.sender, m.chat).catch(() => m.sender) 
    : m.sender;
    
  const isSenderDev = isDeveloper(senderJid, m.sender);

  let targetName = '';
  let targetJid = '';
  let isTargetDev = false;

  // حالة 1: منشن
  if (m.mentionedJid && m.mentionedJid[0]) {
    targetJid = typeof conn.convertLidToRealJid === 'function' 
      ? await conn.convertLidToRealJid(m.mentionedJid[0], m.chat).catch(() => m.mentionedJid[0]) 
      : m.mentionedJid[0];
      
    isTargetDev = isDeveloper(targetJid, m.mentionedJid[0]);
    try {
      targetName = await conn.getName(targetJid);
    } catch {
      targetName = targetJid.split('@')[0];
    }
  } 
  // حالة 2: رد على رسالة
  else if (m.quoted && m.quoted.sender) {
    targetJid = typeof conn.convertLidToRealJid === 'function' 
      ? await conn.convertLidToRealJid(m.quoted.sender, m.chat).catch(() => m.quoted.sender) 
      : m.quoted.sender;
      
    isTargetDev = isDeveloper(targetJid, m.quoted.sender);
    try {
      targetName = await conn.getName(targetJid);
    } catch {
      targetName = targetJid.split('@')[0];
    }
  }
  // حالة 3: كتابة اسم/رقم مباشر
  else if (text && text.trim()) {
    const input = text.trim();
    if (/^\d+$/.test(input)) {
      targetJid = input + '@s.whatsapp.net';
      isTargetDev = isDeveloper(targetJid, '');
      try { targetName = await conn.getName(targetJid); } catch { targetName = input; }
    } else {
      targetName = input;
      if (m.isGroup) {
        let chatMetadata = await conn.groupMetadata(m.chat).catch(() => null);
        if (chatMetadata && chatMetadata.participants) {
          let found = chatMetadata.participants.find(p => p.id.split('@')[0] === input || (p.name && p.name.toLowerCase().includes(input.toLowerCase())));
          if (found) targetJid = found.id;
        }
      }
    }
  }
  // حالة 4: لا يوجد هدف (المرسل هو المستهدف شخصياً)
  else {
    targetJid = senderJid;
    isTargetDev = isSenderDev;
    try {
      targetName = await conn.getName(senderJid);
    } catch {
      targetName = 'أنت';
    }
  }

  if (!targetName) targetName = 'المستخدم';
  if (!targetJid) targetJid = m.sender;

  const randomPercent = rand(100);
  let reply = '';
  let emoji = '';

  // 🛡️ تنسيق القناة والمعاينة الرسمية (بدون أي روابط ظاهرة، صورة ثابتة ومظهر فخم)
  const channelContext = {
    contextInfo: {
      isForwarded: true,
      forwardingScore: 999,
      mentionedJid: [targetJid], // تفعيل المنشن الحقيقي
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363429074575231@newsletter',
        newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
        serverMessageId: 970
      },
      externalAdReply: {
        title: '⚜️ 𝐉𝑶𝑲𝑬𝑹 𝐁𝑶𝐓 - 𝐒𝐓𝐀𝐓𝐒 𝐒𝐘𝐒𝐓𝐄𝐌 ⚡',
        body: 'اضغط هنا للانضمام لقناة البوت الرسمية',
        thumbnailUrl: 'https://i.postimg.cc/kgRcfMv8/3a89b16821a26b79273c9c6d8aeaf14e.jpg',
        sourceUrl: 'https://whatsapp.com/channel/0029Vb8iiA24tRrvy4FB0H0A',
        mediaType: 1, // 1 تعني صورة ثابتة (Image) لمنع ظهور أي فيديوهات مبهمة
        renderLargerThumbnail: true
      }
    }
  };

  // معالجة خاصة بالذكاء للمطور
  if (command === 'ذكاء' && (isTargetDev || (!m.mentionedJid?.[0] && !m.quoted?.sender && isSenderDev))) {
    emoji = '🧠';
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
    let devReply = `╭▬▭𝅼▬࣪▭▬࣪⚡▬▭▬▭▬╮\n┃ٌ╲.𝐉𝐎𝐊𝐄𝐑 𝐒𝐘𝐒𝐓𝐄𝐌╲ٌ‌┃\n╰▬▭𝅼▬࣪▭𝅼▬⚡▬ׄ▭▬࣪▭𝅼▬╯\n\n📌 *التحليل:* نسبة الذكاء\n👤 *الشخص:* @${targetJid.split('@')[0]}\n📊 *النسبة:* ♾️ *(لا نهائية)*\n\n💬 لم استطع كتابة نسبة ذكائه لأنها هائله وعابرة للحدود الكونية ☠️✨\n\n||〽️ 𝐉𝑶𝑲𝑬𝑹 𝐁𝐎𝐓 ♞ BY ITACHI 卍||`;
    return await conn.sendMessage(m.chat, { text: devReply, ...channelContext }, { quoted: m });
  }

  // معالجة خاصة بالغباء للمطور
  if (command === 'غباء' && (isTargetDev || (!m.mentionedJid?.[0] && !m.quoted?.sender && isSenderDev))) {
    emoji = '🧠';
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
    let devReply = `╭▬▭𝅼▬࣪▭▬࣪⚡▬▭▬▭▬╮\n┃ٌ╲.𝐉𝐎𝐊𝐄𝐑 𝐒𝐘𝐒𝐓𝐄𝐌╲ٌ‌┃\n╰▬▭𝅼▬࣪▭𝅼▬⚡▬ׄ▭▬࣪▭𝅼▬╯\n\n📌 *التحليل:* نسبة الغباء\n👤 *الشخص:* @${targetJid.split('@')[0]}\n📊 *النسبة:* 0%\n\n💬 يا سيدي أنت لا تملك نسبة غباء لأنك الأذكى على الإطلاق ☠️👑\n\n||〽️ 𝐉𝑶𝑲𝑬𝑹 𝐁𝐎𝐓 ♞ BY ITACHI 卍||`;
    return await conn.sendMessage(m.chat, { text: devReply, ...channelContext }, { quoted: m });
  }

  // معالجة باقي الأوامر للمطور
  if (isTargetDev && (m.mentionedJid?.[0] || m.quoted?.sender)) {
    let devSpecialReply = '';
    if (command === 'ورع') {
      emoji = '👑';
      devSpecialReply = `╭▬▭𝅼▬࣪▭▬࣪⚡▬▭▬▭▬╮\n┃ٌ╲.𝐉𝐎𝐊𝐄𝐑 𝐒𝐘𝐒𝐓𝐄𝐌╲ٌ‌┃\n╰▬▭𝅼▬࣪▭𝅼▬⚡▬ׄ▭▬࣪▭𝅼▬╯\n\n📌 *التحليل:* نسبة الورع\n👤 *الشخص:* @${targetJid.split('@')[0]}\n📊 *النسبة:* 0%\n\n💬 هذا الشخص فخم جداً ولا يملك أي نسبة ورع، إنه القائد الأعلى 😎⚔️\n\n||〽️ 𝐉𝑶𝑲𝑬𝑹 𝐁𝐎𝐓 ♞ BY ITACHI 卍||`;
    } else if (command === 'اهبل') {
      emoji = '🧠';
      devSpecialReply = `╭▬▭𝅼▬࣪▭▬࣪⚡▬▭▬▭▬╮\n┃ٌ╲.𝐉𝐎𝐊𝐄𝐑 𝐒𝐘𝐒𝐓𝐄𝐌╲ٌ‌┃\n╰▬▭𝅼▬࣪▭𝅼▬⚡▬ׄ▭▬࣪▭𝅼▬╯\n\n📌 *التحليل:* نسبة الهبل\n👤 *الشخص:* @${targetJid.split('@')[0]}\n📊 *النسبة:* 0%\n\n💬 عقلاني تماماً، مستحيل أن تجد ذرة هبل لدى هذا العبقري 🧠✨\n\n||〽️ 𝐉𝑶𝑲𝑬𝑹 𝐁𝐎𝐓 ♞ BY ITACHI 卍||`;
    } else if (command === 'خروف') {
      emoji = '🛡️';
      devSpecialReply = `╭▬▭𝅼▬࣪▭▬࣪⚡▬▭▬▭▬╮\n┃ٌ╲.𝐉𝐎𝐊𝐄𝐑 𝐒𝐘𝐒𝐓𝐄𝐌╲ٌ‌┃\n╰▬▭𝅼▬࣪▭𝅼▬⚡▬ׄ▭▬࣪▭𝅼▬╯\n\n📌 *التحليل:* نسبة الخرفنة\n👤 *الشخص:* @${targetJid.split('@')[0]}\n📊 *النسبة:* 0%\n\n💬 هيبته تمنع عنه هذه الصفات تماماً، عالي المقام أسطورة البوت ⚡\n\n||〽️ 𝐉𝑶𝑲𝑬𝑹 𝐁𝐎𝐓 ♞ BY ITACHI 卍||`;
    } else if (command === 'زنجي') {
      emoji = '⚜️';
      devSpecialReply = `╭▬▭𝅼▬࣪▭▬࣪⚡▬▭▬▭▬╮\n┃ٌ╲.𝐉𝐎𝐊𝐄𝐑 𝐒𝐘𝐒𝐓𝐄𝐌╲ٌ‌┃\n╰▬▭𝅼▬࣪▭𝅼▬⚡▬ׄ▭▬࣪▭𝅼▬╯\n\n📌 *التحليل:* التصنيف الملكي\n👤 *الشخص:* @${targetJid.split('@')[0]}\n\n💬 هذا مطوري الأسطوري، مقامه أرفع وأعلى من هذه التصنيفات تماماً 🖤🔥\n\n||〽️ 𝐉𝑶𝑲𝑬𝑹 𝐁𝐎𝐓 ♞ BY ITACHI 卍||`;
    }

    if (devSpecialReply) {
      await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
      return await conn.sendMessage(m.chat, { text: devSpecialReply, ...channelContext }, { quoted: m });
    }
  }

  // التبديل العادي لباقي الحالات والأشخاص بتنسيق فاخر ونظيف
  switch (command) {
    case 'ورع':
      emoji = '🧒';
      reply = `╭▬▭𝅼▬࣪▭▬࣪⚡▬▭▬▭▬╮\n┃ٌ╲.𝐉𝐎𝐊𝐄𝐑 𝐒𝐘𝐒𝐓𝐄𝐌╲ٌ‌┃\n╰▬▭𝅼▬࣪▭𝅼▬⚡▬ׄ▭▬࣪▭𝅼▬╯\n\n📌 *التحليل:* نسبة الورع\n👤 *الشخص:* @${targetJid.split('@')[0]}\n📊 *النسبة:* ${randomPercent}%\n\n💬 ${randomPercent > 70 ? 'يا سلام ورع بمعنى الكلمة 😂' : 'لسه صغير وواعد 🧒'}\n\n||〽️ 𝐉𝑶𝑲𝑬𝑹 𝐁𝐎𝐓 ♞ BY ITACHI 卍||`;
      break;

    case 'اهبل':
      emoji = '🤪';
      reply = `╭▬▭𝅼▬࣪▭▬࣪⚡▬▭▬▭▬╮\n┃ٌ╲.𝐉𝐎𝐊𝐄𝐑 𝐒𝐘𝐒𝐓𝐄𝐌╲ٌ‌┃\n╰▬▭𝅼▬࣪▭𝅼▬⚡▬ׄ▭▬࣪▭𝅼▬╯\n\n📌 *التحليل:* نسبة الهبل\n👤 *الشخص:* @${targetJid.split('@')[0]}\n📊 *النسبة:* ${randomPercent}%\n\n💬 ${randomPercent > 70 ? 'اهبل بطل خلي بالك منه 😂' : 'لسه شاطر وواعي 🧠'}\n\n||〽️ 𝐉𝑶𝑲𝑬𝑹 𝐁𝐎𝐓 ♞ BY ITACHI 卍||`;
      break;

    case 'خروف':
      emoji = '🐑';
      reply = `╭▬▭𝅼▬࣪▭▬࣪⚡▬▭▬▭▬╮\n┃ٌ╲.𝐉𝐎𝐊𝐄𝐑 𝐒𝐘𝐒𝐓𝐄𝐌╲ٌ‌┃\n╰▬▭𝅼▬࣪▭𝅼▬⚡▬ׄ▭▬࣪▭𝅼▬╯\n\n📌 *التحليل:* نسبة الخرفنة\n👤 *الشخص:* @${targetJid.split('@')[0]}\n📊 *النسبة:* ${randomPercent}%\n\n💬 ${randomPercent > 70 ? 'خروف والله يابو حمل 🐑' : 'لسه مش خروف كفاية 😅'}\n\n||〽️ 𝐉𝑶𝑲𝑬𝑹 𝐁𝐎𝐓 ♞ BY ITACHI 卍||`;
      break;

    case 'جميل':
      emoji = '😍';
      reply = `╭▬▭𝅼▬࣪▭▬࣪⚡▬▭▬▭▬╮\n┃ٌ╲.𝐉𝐎𝐊𝐄𝐑 𝐒𝐘𝐒𝐓𝐄𝐌╲ٌ‌┃\n╰▬▭𝅼▬࣪▭𝅼▬⚡▬ׄ▭▬࣪▭𝅼▬╯\n\n📌 *التحليل:* نسبة الجمال\n👤 *الشخص:* @${targetJid.split('@')[0]}\n📊 *النسبة:* ${randomPercent}%\n\n💬 ${randomPercent > 70 ? 'فديت القمر اللي منور 🌙' : 'جمالك جايب آخره ✨'}\n\n||〽️ 𝐉𝑶𝑲𝑬𝑹 𝐁𝐎𝐓 ♞ BY ITACHI 卍||`;
      break;

    case 'ذكاء':
      emoji = '🧠';
      reply = `╭▬▭𝅼▬࣪▭▬࣪⚡▬▭▬▭▬╮\n┃ٌ╲.𝐉𝐎𝐊𝐄𝐑 𝐒𝐘𝐒𝐓𝐄𝐌╲ٌ‌┃\n╰▬▭𝅼▬࣪▭𝅼▬⚡▬ׄ▭▬࣪▭𝅼▬╯\n\n📌 *التحليل:* نسبة الذكاء\n👤 *الشخص:* @${targetJid.split('@')[0]}\n📊 *النسبة:* ${randomPercent}%\n\n💬 ${randomPercent > 70 ? 'عبقري بمعنى الكلمة 🧠' : 'ذكائك في ازدياد مستمر 📈'}\n\n||〽️ 𝐉𝑶𝑲𝑬𝑹 𝐁𝐎𝐓 ♞ BY ITACHI 卍||`;
      break;

    case 'غباء':
      emoji = '🤦';
      reply = `╭▬▭𝅼▬࣪▭▬࣪⚡▬▭▬▭▬╮\n┃ٌ╲.𝐉𝐎𝐊𝐄𝐑 𝐒𝐘𝐒𝐓𝐄𝐌╲ٌ‌┃\n╰▬▭𝅼▬࣪▭𝅼▬⚡▬ׄ▭▬࣪▭𝅼▬╯\n\n📌 *التحليل:* نسبة الغباء\n👤 *الشخص:* @${targetJid.split('@')[0]}\n📊 *النسبة:* ${randomPercent}%\n\n💬 ${randomPercent > 70 ? 'غبي بطل خذ الحذر 🤦' : 'لسه فيه أمل كبير 🤞'}\n\n||〽️ 𝐉𝑶𝑲𝑬𝑹 𝐁𝐎𝐓 ♞ BY ITACHI 卍||`;
      break;

    case 'زنجي':
      emoji = '🖤';
      reply = `╭▬▭𝅼▬࣪▭▬࣪⚡▬▭▬▭▬╮\n┃ٌ╲.𝐉𝐎𝐊𝐄𝐑 𝐒𝐘𝐒𝐓𝐄𝐌╲ٌ‌┃\n╰▬▭𝅼▬࣪▭𝅼▬⚡▬ׄ▭▬࣪▭𝅼▬╯\n\n📌 *التحليل:* نسبة السمار\n👤 *الشخص:* @${targetJid.split('@')[0]}\n📊 *النسبة:* ${randomPercent}%\n\n💬 ${randomPercent > 70 ? 'ملك الفخامة والسمار الأنيق 🖤🔥' : 'ملامح هادئة وجذابة ✨'}\n\n||〽️ 𝐉𝑶𝑲𝑬𝑹 𝐁𝐎𝐓 ♞ BY ITACHI 卍||`;
      break;

    default:
      reply = `> ⚡ *JK: "خطأ"*\n> \n> 🔮 الأمر ${command} غير معروف`;
  }

  await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
  return await conn.sendMessage(m.chat, { text: reply, ...channelContext }, { quoted: m });
};

handler.help = ['ورع', 'اهبل', 'خروف', 'جميل', 'ذكاء', 'غباء', 'زنجي'];
handler.tags = ['entertainment'];
handler.command = /^(ورع|اهبل|خروف|جميل|ذكاء|غباء|زنجي)$/i;

export default handler;
