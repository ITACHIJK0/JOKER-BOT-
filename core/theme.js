// core/theme.js
// ✧ THE JOKER & ITACHI - Core Theme ✧

export const theme = {
  // الرموز الأساسية (Joker & Itachi Style)
  skull: '🃏',
  blood: '⚔️',
  virus: '🗡️',
  eye: '👁️',
  sword: '🥷',
  target: '✧',
  darkStar: '⭐',
  lightStar: '✨',                                                     
  
  // فواصل نظيفة وبسيطة داخل النص لعدم التشوش
  divider: '───────────────────',
  smallDivider: '───────────────',
  endDivider: '───────────────────',                                   
  
  // تنسيق النصوص بالثيم الجديد
  title: (text) => `🃏 *${text}*`,
  subtitle: (text) => `⚔️ *${text}*`,
  info: (text) => `📌 *${text}*`,
  warning: (text) => `⚠️ *${text}* ⚠️`,
  success: (text) => `✅ *${text}*`,
  error: (text) => `❌ *${text}*`,

  // بناء الرسائل العامة بالستايل الملكي الفخم الجديد
  build: (sections) => {
    let msg = `*꒷︶꒷꒦꒷ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯』 ꒷︶꒷꒦꒷*\n\n   ♡  ⦓ 🃏 𝒥𝒪𝒦𝐸𝑅 ○ 𝐵𝒪𝒯 ⦔ ♡\n\n*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n\n`
    for (const section of sections) {
      if (section.type === 'title') {
        msg += `┠ 🃏╎*${section.text}*\n`
      } else if (section.type === 'subtitle') {
        msg += `┠ ⚔️╎*${section.text}*\n`
      } else if (section.type === 'info') {
        msg += `┠ 🔸╎*${section.label}:* ${section.value}\n`
      } else if (section.type === 'line') {
        msg += `> ○ 🔹╎${section.text}\n`
      } else if (section.type === 'divider') {
        msg += `───────────────────\n`                     
      } else if (section.type === 'spacer') {
        msg += `\n`
      }
    }
    msg += `\n ♡ ألَا بِـذِڪْرِ اللَّهِ تَـطْـمَـئِـنُّ الْـقُـلُـوبُ\n\n*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞\n> ꒷︶ 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞`
    return msg
  },

  // رسالة الملف الشخصي بالستايل الملكي الفخم الجديد
  profile: (data) => {
    let msg = `*꒷︶꒷꒦꒷ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯』 ꒷︶꒷꒦꒷*\n\n   ♡  ⦓ 👤 𝒫𝑅𝒪𝔉𝐼𝐿𝐸 ○ 𝑀𝐸𝒩𝒰 ⦔ ♡\n\n*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n\n`
    for (const item of data) {
      if (item.type === 'header') {
        msg += `┠ 👑╎*${item.text}*\n`
      } else if (item.type === 'info') {
        msg += `┠ 🔸╎*${item.label}:* ${item.value}\n`
      } else if (item.type === 'line') {
        msg += `> ○ 🔹╎${item.text}\n`
      }
    }
    msg += `\n ♡ ألَا بِـذِڪْرِ اللَّهِ تَـطْـمَـئِـنُّ الْـقُـلُـوبُ\n\n*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞\n> ꒷︶ 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞`
    return msg
  }
}

export const formatWithTheme = (data) => {
  return theme.build(data)
}
