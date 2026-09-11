// plugins/owner.js
// ✧ 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ - المطور

const MAIN_OWNER_URL = 'https://wa.me/249916221538';

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

  if (command === 'بوت') {
    return conn.sendMessage(m.chat, {
      text: `*أنا 𝐉𝐎𝐊𝐄𝐑… نادِني باسمي يا هذا ☠️*`
    }, { quoted: m });
  }

  // إرسال بطاقة المطور مع الأزرار الحديثة والصورة الجديدة
  try {
    return conn.sendButton(m.chat, {
      imageUrl: 'https://i.postimg.cc/fyXh3L3S/ee9c85c558041cf7c12ca050b7e90e77.jpg',
      bodyText: OWNER_INFO + '\n\n💬 *للتواصل المباشر مع المطور عبر الزر أدناه*\n\n||〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ BY ITACHI 卍||',
      footerText: 'JOBOER BOT POWERED BY ITACHI',
      buttons: [
        { name: 'cta_url', params: { display_text: '💬 تواصل مع المطور', url: MAIN_OWNER_URL } }
      ],
      mentions: [m.sender],
      newsletter: { name: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚', jid: '120363410276242111@newsletter' },
      interactiveConfig: { buttons_limits: 1, list_title: '', button_title: '', canonical_url: MAIN_OWNER_URL }
    }, m);
  } catch {
    return conn.sendMessage(m.chat, {
      text: OWNER_INFO + `\n\n> للتواصل: ${MAIN_OWNER_URL}\n\n||〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ BY ITACHI 卍||`
    }, { quoted: m });
  }
}

handler.help = ['owner', 'creator', 'المطور', 'بوت']
handler.tags = ['main']
handler.command = /^(owner|creator|المطورين|المطور|مطور|مطورك|مطوري|creador|بوت)$/i

export default handler;
