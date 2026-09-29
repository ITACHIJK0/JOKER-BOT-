/*
===================================================
   🔴 [ 𝐔𝐂𝐇𝐈𝐇𝐀 𝐈Ｔ𝐀𝙲𝙷𝙸  ] 🔴
   "إِنَّهُمْ يُرِيدُونَ إِطْفَاءَ نُورِ ٱللَّهِ..."
   طابع عشيرة الأوتشيها - خاص بـ المطور الأسطوري
===================================================
*/

let handler = async (m, { conn, isAdmin, isOwner }) => {
  if (!m.isGroup) {
    return m.reply('⚠️ هذا الأمر يعمل فقط في المجموعات.')
  }
  
  if (!isOwner) {
    return m.reply('🚯🙂 هذا الأمر خاص بالمطور فقط يا ايها العبد.')
  }
  
  if (isAdmin) {
    return m.reply('✅ أنت مشرف بالفعل يا مطوري الأسطوري 🖤.')
  }
  
  try {
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote')
    await m.reply('🌑 **[ 𝐔𝐂𝐇𝐈𝖍𝐀 𝖞𝕿𝖆𝕮𝖍𝖎 ]**\n\n⚡ **تم رفعك بنجاح يا مطوري 🖤✨**')
  } catch (e) {
    console.error(e)
    m.reply('❌ حدث خطأ أثناء محاولة رفعك مشرفاً، تأكد أن البوت مشرف ولديه الصلاحيات الكافية.')
  }
}

handler.help = ['ارفعني']
handler.tags = ['owner']
handler.command = ['ارفعني', 'هات', 'autoadmin']

export default handler
