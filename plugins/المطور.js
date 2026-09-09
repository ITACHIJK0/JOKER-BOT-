// plugins/owner.js
// ✧ 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ - المطور

import { theme } from '../core/theme.js'

let handler = async (m, { conn }) => {
  // تفاعل أسطوري مع الأمر
  await conn.sendMessage(m.chat, { react: { text: '⚡', key: m.key } })

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

  // بناء محتوى الاستمارة الأنيق مع إخفاء التوقيع الأخير بالسبويلر
  let content = [
    { type: 'title', text: '⚡ بطاقة المطور الرسمي ⚡' },
    { type: 'divider' },
    { type: 'info', label: '👑 الاسم', value: '𝒜7𝑀𝐸𝒟 𝒜𝒩𝒲𝒜𝑅ヅ' },
    { type: 'info', label: '💻 اللقب', value: '𝒰𝒞𝐻𝐼𝐻𝒜 𝐼𝒯𝒜𝒞𝐻𝐼♞' },
    { type: 'info', label: '🌍 الدولة', value: '𝒮𝒰𝒟𝒜𝒩 🇸🇩' },
    { type: 'info', label: '📧 البريد', value: 'itachi588.com' },
    { type: 'divider' },
    { type: 'line', text: '💬 *للتواصل المباشر مع المطور عبر الزر أدناه*' },
    { type: 'divider' },
    // التوقيع الأخير مخفي تماماً داخل كود السپويلر (|| ... ||)
    { type: 'line', text: '||〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍||' }
  ];

  let teks = theme.build(content);

  // إرسال الاستمارة مرفقة بصورة مع زر تفاعلي ينقلك لرابط التواصل مباشرة
  await conn.sendMessage(m.chat, {
    image: { url: 'https://files.catbox.moe/u6344j.mp4' }, // يمكنك تغيير رابط الصورة هنا
    caption: teks,
    footer: 'JOBOER BOT POWERED BY ITACHI',
    buttons: [
      {
        buttonId: '.owner',
        buttonText: { displayText: '💬 تواصل مع المطور' },
        type: 1
      }
    ],
    headerType: 4,
    contextInfo: {
      externalAdReply: {
        title: 'جوكر بوت ➢ 𝑃𝑂𝑾𝐸𝑅 𝑃𝑌 𝐼𝐓𝐴𝐂𝐇𝐼 ღ',
        body: '𝚃𝙷𝙴 𝙹𝙾𝙺𝙴𝚁 𝙱𝐎𝚃',
        thumbnailUrl: 'https://files.catbox.moe/q06roe.jpg',
        sourceUrl: 'https://wa.me/249916221538',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m });
}

handler.help = ['owner', 'creator']
handler.tags = ['main']
handler.command = /^(owner|creator|المطورين|المطور|مطور|مطورك|مطوري|creador)$/i

export default handler;
