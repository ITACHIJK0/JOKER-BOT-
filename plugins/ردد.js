// plugins/auto_reply.js
// ⧼ joker boy - ملف الردود التلقائية الشامل والمطور بالإيموجيات 🤖 ⧽

let handler = async (m, { conn }) => {
  try {
    let body = (m.text || '').trim();
    let replyText = '';

    // قائمة الردود مع الإيموجي المناسب لكل رد
    if (/^(مرحبا|مرجبا)$/i.test(body)) {
      replyText = '👋 يا مرحبتين';
    } else if (/^اهلا$/i.test(body)) {
      replyText = '✨ اهلين وسهلين';
    } else if (/^مساء الخير$/i.test(body)) {
      replyText = '🌙 مساء النور والسرور';
    } else if (/^مساء النور$/i.test(body)) {
      replyText = '🌆 مساء الخير';
    } else if (/^(السلام عليكم|السلام عليكم ورحمة الله وبركاته|سلام عليكم)$/i.test(body)) {
      replyText = '🤝 وعليكم السلام ورحمة الله وبركاته يا عبد الله';
    } else if (/^(سلام|باي|مع السلامه)$/i.test(body)) {
      replyText = '🚪 روح روح محد مهتم';
    } else if (/^انا رايح$/i.test(body)) {
      replyText = '🏃‍♂️ اقفل الباب ونت طالع';
    } else if (/^صباح النور$/i.test(body)) {
      replyText = '🌅 صباح الخير عليك';
    } else if (/^صباح الخير$/i.test(body)) {
      replyText = '☕ صباح النور والسرور';
    } else if (/^احا$/i.test(body)) {
      replyText = '🤭 احتين علي احتك';
    } else if (/^بص$/i.test(body)) {
      replyText = '👀 بص بعيد';
    } else if (/^منور$/i.test(body)) {
      replyText = '🥸 بنوري انا ي عواقيق';
    } else if (/^منوره$/i.test(body)) {
      replyText = '👑 المزه منوره بنوري برضو';
    } else if (/^بحبك$/i.test(body)) {
      replyText = '🥲 بس انا م بحبكش';
    } else if (/^نعم$/i.test(body)) {
      replyText = '🤨 حد ناداك ؟';
    } else if (/^اه$/i.test(body)) {
      replyText = '🤣 استرجل كدا وقول نعم';
    } else if (/^تست$/i.test(body)) {
      replyText = '👻 نعم انا موجود';
    } else if (/ميس[يى]|مسي/i.test(body)) {
      replyText = '🐐 دا عمك وعم العالم';
    } else if (/كرستيانو|رونالدو/i.test(body)) {
      replyText = '😂 مش بيعرف يعمل حاجه غير يبكي';
    } else if (/اتاتشي| /i.test(body)) {
      replyText = '😮 اوه مطوري مالو';
    } else if (/^(ه{2,}|خ{2,}|هههه+|هها+|ههه+)[هها]*$/i.test(body) || body === '😂' || body === '🤣') {
      replyText = '🫠 تدوم الضحكه الحلوه يعسل';
    } else if (/^الجوكر$/i.test(body)) {
      replyText = '🤖 يعم اكتب الامر متزهجنيش';
    } else if (/^(بوت غبي|بوت حمار|بوت عاق)$/i.test(body)) {
      replyText = '😭 عيب عليك تقلي كدا هكلم بابا اتاتشي يجلدك';
    } else if (body === '🙂') {
      replyText = '🙃 بص بعيد';
    }

    // إذا وُجد رد مناسب، يتم إرسال الرسالة مع الأزرار
    if (replyText) {
      await conn.sendMessage(m.chat, {
        text: replyText,
        contextInfo: {
          externalAdReply: {
            title: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
            body: 'اضغط للانضمام إلى القناة الرسمية',
            thumbnailUrl: 'https://files.catbox.moe/u6344j.mp4',
            sourceUrl: 'https://whatsapp.com/channel/0029اVbDHUIRGzzKUabkgin1z',
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });
    }

  } catch (err) {
    console.error(err);
  }
}

// يعمل بدون نقطة في بداية الكلام
handler.customPrefix = /./
handler.command = new RegExp()

export default handler;
