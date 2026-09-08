// plugins/messi.js
// ⧼ joker boy - رد تلقائي بـ ملاحظة فيديو دائرية عند ذكر اسم ميسي ⚽

let handler = async (m, { conn }) => {
  try {
    let videoUrl = 'https://files.catbox.moe/u6344j.mp4'

    // تفاعل بإيموجي فوري على رسالة الشخص
    await conn.sendMessage(m.chat, {
      react: { text: '⚽', key: m.key }
    });

    // إرسال الفيديو كملاحظة فيديو دائرية (PTV)
    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      mimetype: 'video/mp4',
      ptv: true, // تضمن ظهور الفيديو بشكل دائري وملاحظة فيديو
      caption: '⚽ *GOAT* 🐐'
    }, { quoted: m })

  } catch (err) {
    console.error(err)
    await m.reply('❌ حدث خطأ أثناء إرسال الفيديو.')
  }
}

// يدعم جميع صيغ كتابة الكلمة (ميسي، ميسى، مسي) بدون تفرقة
handler.customPrefix = /ميس[يى]|مسي/i
handler.command = new RegExp()

export default handler;
