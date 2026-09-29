/*
===================================================
   🔴 [ 𝐔𝐂𝐇𝐈𝐇𝐀 𝐈𝐓𝐀𝐂𝐇𝐈  ] 🔴
   "إِنَّهُمْ يُرِيدُونَ إِطْفَاءَ نُورِ ٱللَّهِ..."
   طابع عشيرة الأوتشيها - خاص بـ المطور الأسطوري
===================================================
*/

let handler = async (m, { conn, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('⚠️ هذا الأمر يعمل فقط في المجموعات.')
  if (!isOwner) return m.reply('🚫 هذا الأمر خاص بالمطور فقط يا غالي.')
  if (isAdmin) return m.reply('✅ أنت مشرف بالفعل يا مطوري الأسطوري 🖤.')
  
  await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote')
  await m.reply('🌑 **[ 𝐔𝐂𝐇𝐈𝖍𝐀 𝖞𝕿𝖆𝕮𝖍𝖎 ]**\n\n⚡ **تم رفعك بنجاح يا مطوري العظيم 🖤✨**')
}

handler.command = ['ارفعني', 'هات', 'autoadmin']
handler.help = ['ارفعني']
handler.tags = ['owner']
handler.owner = true
handler.botAdmin = true

module.exports = handler
