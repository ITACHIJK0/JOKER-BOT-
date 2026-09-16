// plugins/owner.js
// ✧ 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - المطور

import baileys from '@whiskeysockets/baileys';
const { prepareWAMessageMedia, generateWAMessageFromContent, proto } = baileys;

const MAIN_OWNER_URL = 'https://wa.me/249927142037';

const OWNER_INFO = `╭▬▭𝅼▬࣪▭▬࣪🧑‍💻▬▭▬▭▬╮
┃ٌ╲.𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫 𝐢𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧╲ٌ‌┃
╰▬▭𝅼▬࣪▭𝅼▬🧑‍💻▬ׄ▭▬࣪▭𝅼▬╯
┃ٌ╲ ‌╲ .𝙸𝚝𝚊𝚌𝚑𝐢♛╲'╲ .╲╲ .┃
┃👑 الاسم: 𝒜7𝑀𝐸𝒟 𝒜𝒩𝒲𝒜𝑅ヅ ┃
┃💻 اللقب: 𝒰𝒞𝐻𝐼𝐻𝒜 𝐼𝒯𝒜𝒞𝐻𝐼♞ ‌‌‌┃
┃🌍 الدولة: 𝒮𝒰𝒟𝒜𝒩 🇸🇩 ‌‌ ‌ ‌ ‌‌ ‌ ‌ ‌ ‌ ‌ ‌ ‌  ‌ ‌ ‌ ‌ ‌ ‌┃
┃📧 البريد: itachi588.com ‌‌ ‌‌ ‌‌ ‌‌ ‌ ‌ ‌‌ ‌ ‌ ‌‌ ‌ ‌ ‌ ‌ ‌  ‌ ‌ ‌ ‌ ‌ ‌┃
╰▬▭𝅼▬࣪▭𝅼▬ׄ🧑‍💻▬ׄ▭▬▭▬╯`;

let handler = async (m, { conn, command }) => {
  // تفاعل أسطوري مع الأمر
  await conn.sendMessage(m.chat, { react: { text: '⚡', key: m.key } });

  // تشغيل البصمة الصوتية أولاً
  try {
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: 'https://file.garden/aauvg01sjleV_ic1/pro.opus' },
        mimetype: 'audio/mp4',
        ptt: true
      },
      { quoted: m }
    );
    await new Promise(resolve => setTimeout(resolve, 1200));
  } catch (e) {}

  if (command === 'بوت') {
    return conn.sendMessage(m.chat, {
      text: `*أنا 𝐉𝐎𝐊𝐄𝐑… نادِني باسمي يا هذا ☠️*`
    }, { quoted: m });
  }

  // إرسال بطاقة المطور مع الأزرار الحديثة والصورة الجديدة بطريقة مضمونة 100%
  try {
    let mediaMessage = null;
    try {
      const media = await prepareWAMessageMedia({ 
        image: { url: 'https://i.postimg.cc/fyXh3L3S/ee9c85c558041cf7c12ca050b7e90e77.jpg' } 
      }, { upload: conn.waUploadToServer });
      mediaMessage = media.imageMessage;
    } catch (err) {
      console.log('[Owner-Image-Error]', err);
    }

    const fullCaption = OWNER_INFO + '\n\n💬 *للتواصل المباشر مع المطور عبر الزر أدناه*\n\n||〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ BY ITACHI 卍||';

    const interactiveMessage = proto.Message.InteractiveMessage.create({
      body: proto.Message.InteractiveMessage.Body.create({
        text: fullCaption
      }),
      footer: proto.Message.InteractiveMessage.Footer.create({
        text: 'JOBOER BOT POWERED BY ITACHI'
      }),
      header: proto.Message.InteractiveMessage.Header.create({
        hasMediaAttachment: mediaMessage ? true : false,
        imageMessage: mediaMessage || undefined
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
        buttons: [
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: '💬 تواصل مع المطور',
              url: MAIN_OWNER_URL,
              merchant_url: MAIN_OWNER_URL
            })
          }
        ]
      })
    });

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage
        }
      }
    }, { quoted: m });

    return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

  } catch (e) {
    console.error('[Owner-Card-Error]', e);
    // نظام احتياطي في حال عدم دعم النسخة للأزرار التفاعلية
    return conn.sendMessage(m.chat, {
      text: OWNER_INFO + `\n\n> للتواصل: ${MAIN_OWNER_URL}\n\n||〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ BY ITACHI 卍||`
    }, { quoted: m });
  }
}

handler.help = ['owner', 'creator', 'المطور', 'مطورك']
handler.tags = ['main']
handler.command = /^(owner|creator|المطورين|المطور|مطور|مطورك|مطوري|creador|مطورك)$/i

export default handler;
