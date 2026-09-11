// plugins/anti-link.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - Ultimate Cyber Anti-Link Engine 🔗🔥

let handler = async (m, { conn, text, isAdmin, isOwner, usedPrefix, command }) => {

  const channelContext = {
    contextInfo: {
      isForwarded: true,
      forwardingScore: 1,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363429074575231@newsletter',
        newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
        serverMessageId: 970
      }
    }
  };

  if (!m.isGroup) {
    return conn.reply(m.chat, `> 👑 *ITACHI & JOKER: "تنبيه"* \n> 🔮 هذا الأمر يعمل حصرياً داخل المجموعات السيبرانية!\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, m, channelContext);
  }

  if (!isAdmin && !isOwner) {
    return conn.reply(m.chat, `> 👑 *ITACHI & JOKER: "صلاحيات سيادية"* \n> 🔮 هذا الأمر مخصص للمشرفين والمطورين فقط!\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, m, channelContext);
  }

  // تهيئة قاعدة البيانات بلحظتها لضمان عدم حدوث أي خطأ undefined
  global.db.data = global.db.data || {};
  global.db.data.chats = global.db.data.chats || {};
  
  if (!global.db.data.chats[m.chat]) {
    global.db.data.chats[m.chat] = {
      antiLink: false,
      warnings: {}
    };
  }

  let chat = global.db.data.chats[m.chat];

  if (!text) {
    const currentStatus = chat.antiLink ? '🟢 مُفعل بنجاح' : '🔴 مُعطل حالياً';
    let statusText = `👑 *[ نظام حماية منع الروابط - ITACHI & JOKER ]* 👑\n\n`;
    statusText += `🔮 *الحالة السيادية:* ${currentStatus}\n`;
    statusText += `⚠️ *نظام العقوبات:* 3 تحذيرات ثم الطرد الفوري من المجموعة\n\n`;
    statusText += `📌 *طريقة الاستخدام:*\n`;
    statusText += `• \`${usedPrefix}${command} تفعيل\` (لتشغيل الدرع)\n`;
    statusText += `• \`${usedPrefix}${command} تعطيل\` (لإيقاف الدرع)\n\n`;
    statusText += `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;
    
    return conn.reply(m.chat, statusText, m, channelContext);
  }

  const query = text.trim().toLowerCase();

  if (query === "تفعيل" || query === "on" || query === "1") {
    chat.antiLink = true;
    return conn.reply(m.chat, `> ✅ *[ تم تفعيل درع منع الروابط بنجاح ]*\n> 🛡️ الروابط الآن محظورة تماماً على الأعضاء العاديين!\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, m, channelContext);
  }

  if (query === "تعطيل" || query === "off" || query === "0") {
    chat.antiLink = false;
    return conn.reply(m.chat, `> ❌ *[ تم تعطيل درع منع الروابط ]*\n> 🔓 أصبحت الروابط متاحة للجميع الآن.\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, m, channelContext);
  }

  return conn.reply(m.chat, `> 👑 *ITACHI & JOKER: "خطأ في المعاملة"* \n> 🔮 يجب استخدام الكود هكذا: \`${usedPrefix}${command} تفعيل\` أو \`تعطيل\`\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`, m, channelContext);
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔥 نظام الرصد الفائق والتطهير الفوري (Real-time Anti-Link Engine)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
handler.before = async function (m, { conn, isBotAdmin, isAdmin, isOwner }) {
  if (!m.isGroup) return;
  if (!m.text) return;
  if (m.fromMe) return;

  // فحص وإعداد قاعدة البيانات آمنة
  global.db.data = global.db.data || {};
  global.db.data.chats = global.db.data.chats || {};
  
  if (!global.db.data.chats[m.chat]) {
    global.db.data.chats[m.chat] = {
      antiLink: false,
      warnings: {}
    };
  }

  let chat = global.db.data.chats[m.chat];

  if (!chat.antiLink) return;
  if (!isBotAdmin) return;

  // تعبير منظم شامل لرصد روابط الواتساب، التليجرام، النطاقات والروابط العامة
  const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com|wa\.me|t\.me|telegram\.me|\.com|\.net|\.org|\.gg|\.io|\.me)/i;

  if (!linkRegex.test(m.text)) return;

  // استثناء المشرفين والمطورين مع رسالة ترحيبية راقية
  if (isAdmin || isOwner) {
    const adminNotice = `> 👑 *ITACHI & JOKER: "حالة استثنائية"* \n> 👤 أهلاً بك يا بطل، الروابط ممنوعة تماماً هنا، لكن لأنك مشرف سيادي أو مطور، مُرحباً برابطك 🙂✔️\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;
    await conn.sendMessage(m.chat, {
      text: adminNotice,
      contextInfo: {
        isForwarded: true,
        forwardingScore: 1,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363429074575231@newsletter',
          newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
          serverMessageId: 970
        }
      }
    }, { quoted: m });
    return;
  }

  // 1. التطبيق الفوري: حذف رسالة الرابط بسرعة البرق
  try {
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.sender
      }
    });
  } catch (err) {
    console.error('[ITACHI-ANTILINK-DELETE-ERROR] فشل حذف رسالة الرابط:', err);
  }

  // تهيئة عداد التحذيرات للعضو
  chat.warnings = chat.warnings || {};
  chat.warnings[m.sender] = (chat.warnings[m.sender] || 0) + 1;

  let currentWarnings = chat.warnings[m.sender];

  // 2. فحص العقوبة: الطرد إذا بلغ 3 تحذيرات
  if (currentWarnings >= 3) {
    try {
      delete chat.warnings[m.sender];
      await conn.groupParticipantsUpdate(m.chat, [m.sender], "remove");

      let banText = `> 🚫 *[ تم طرد العضو المخالف بنجاح ]*\n> 👤 الضحية: @${m.sender.split('@')[0]}\n> 🔮 *السبب:* تكرار إرسال الروابط وتخطى حد التحذيرات (3/3)\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;
      
      return await conn.sendMessage(m.chat, {
        text: banText,
        mentions: [m.sender],
        contextInfo: {
          isForwarded: true,
          forwardingScore: 1,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363429074575231@newsletter',
            newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
            serverMessageId: 970
          }
        }
      });
    } catch (err) {
      console.error('[ITACHI-ANTILINK-BAN-ERROR] فشل طرد العضو:', err);
      return await conn.sendMessage(m.chat, { text: '> 👑 *ITACHI & JOKER:* فشل طرد العضو، تأكد أن البوت يمتلك صلاحيات المشرف الكاملة!' });
    }
  }

  // 3. إرسال تحذير سيبراني صارم مع المنشن
  const remainingWarnings = 3 - currentWarnings;
  let warningText = `> ⚠️ *[ تحذير سيبراني صارم ]* ⚠️\n> \n> 👤 تم رصد رابط مخالف من قِبل: @${m.sender.split('@')[0]}\n> 🛑 *حالة الإنذار:* (${currentWarnings}/3)\n> ⏳ *التحذيرات المتبقية قبل الطرد:* ${remainingWarnings}\n> \n> *ملاحظة:* الروابط ممنوعة تماماً في هذه المجموعة، احذر التكرار!\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;

  return await conn.sendMessage(m.chat, {
    text: warningText,
    mentions: [m.sender],
    contextInfo: {
      isForwarded: true,
      forwardingScore: 1,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363429074575231@newsletter',
        newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
        serverMessageId: 970
      }
    }
  });
};

handler.help = ['منع_الروابط <تفعيل/تعطيل>'];
handler.tags = ['group', 'owner'];
handler.command = /^منع_الروابط$/i;
handler.group = true;
handler.botAdmin = true;

export default handler;
