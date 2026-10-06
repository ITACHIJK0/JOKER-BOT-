// plugins/q2-admin.js
// ✧ THE JOKER & ITACHI - Admin & Main Menu 👮‍♂️

import { existsSync } from 'fs'
import { join } from 'path'
import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'
import { performance } from 'perf_hooks'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    let old = performance.now()
    let neww = performance.now()
    let speed = (neww - old).toFixed(4)

    // التفاعل بإيموجي القسم الخاص بالأدمن
    await conn.sendMessage(m.chat, { react: { text: '👮‍♂️', key: m.key } });
    
    const imageUrl = 'https://i.postimg.cc/1z01xC8h/b3a66ff0ccb17d0d7f1178e553b81eed.jpg';
    const imageRes = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
    const media = await prepareWAMessageMedia({ image: imageBuffer }, { upload: conn.waUploadToServer });

    const user = await conn.getName(m.sender);

    let menuText = `*꒷︶꒷꒦꒷ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯』 ꒷︶꒷꒦꒷*

   ♡  ⦓ 👮‍♂️ 𝐴𝐷𝑀𝐼𝑁 ○ 𝑀𝐸𝑁𝑈 ⦔ ♡

*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*

┠ 👤╎الاسـم : ${user}
┠ 👮‍♂️╎قـسـم : التَّحَكُّم والأدْمِن
> ○ 📢╎${_p}منشن
> ○ 👥╎${_p}جروب
> ○ 🚫╎${_p}طرد
> ○ ⚠️╎${_p}انذار
> ○ ♻️╎${_p}الغاء_انذار
> ○ 📊╎${_p}انذارات
> ○ 🔗╎${_p}لينك
> ○ 🏅╎${_p}اعفاء
> ○ ⬆️╎${_p}ترقيه
> ○ 🟢╎${_p}المتصلين
> ○ 🔄╎${_p}تجديد
> ○ 👁️╎${_p}مخفي
> ○ 🗑️╎${_p}حذف
> ○ 🔇╎${_p}كتم
> ○ 🔊╎${_p}فك_الكتم
> ○ 📇╎${_p}مضاد_الجهات
> ○ 🔗╎${_p}مضاد_الروابط
> ○ 🔕╎${_p}مضاد_الشتايم

 ♡ ألَا بِـذِڪْرِ اللَّهِ تَـطْـمَـئِـنُّ الْـقُـلُـوبُ

*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*
        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞
> ꒷︶ 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞`;

    const channel = "https://whatsapp.com/channel/0029VbDHUIRGzzKUabkgin1z"
    const developerNumber = "249927142037"
    const developerContact = `https://wa.me/${developerNumber}`

    let sectionRows = [
      { "title": "🕌 قـسـم الـديـن والـقـرآن", "description": "🕌 عـرض اوامـر الـقـرآن والـأحـاديـث والـأذكـار (ق1)", "id": ".ق1" },
      { "title": "👮‍♂️ قـسـم الأدْمـن", "description": "🔱 عـرض اوامـر الادارة والـتـحـكـم فـي الـجـروب (ق2)", "id": ".ق2" },
      { "title": "🎨 قـسـم الاسـتـيـكـر", "description": "🎨 عـرض اوامـر صـنـع وتـصـمـيـم الـاسـتـيـكـرات (ق3)", "id": ".ق3" },
      { "title": "🎮 قـسـم الألـعـاب", "description": "🎮 عـرض اوامـر الـعـلـاب والـمـسـابـقـات والـتـسـلـيـه (ق4)", "id": ".ق4" },
      { "title": "📥 قـسـم الـتـحـمـيـل", "description": "📥 عـرض اوامـر تـحـمـيـل الـفـيـديـوهـات والـصـوتـيـات (ق5)", "id": ".ق5" },
      { "title": "🧰 قـسـم الأدوات", "description": "🧰 عـرض الادوات والـمـسـاعـدات الـذكـيـه لـلـبـوت (ق6)", "id": ".ق6" },
      { "title": "📚 قـسـم الـمـانـجـا", "description": "📚 عـرض اوامـر وبـحـث فـصـول الـمـانـجـا والـأنـيـمـي (ق7)", "id": ".ق7" },
      { "title": "🤖 الـذكـاء الاصـطـنـاعـي", "description": "🤖 عـرض اوامـر الـذكـاء الاصـطـنـاعـي والـمـحـادثـات (ق8)", "id": ".ق8" },
      { "title": "🎌 قـسـم الـنـقـابـات", "description": "🎌 عـرض اوامـر وانـظـمـة الـنـقـابـات والـعـشـائـر (ق9)", "id": ".ق9" },
      { "title": "🖼️️ قـسـم الـصـور", "description": "🖼️ عـرض اوامـر الـصـور والـخـلـفـيـات والـتـصـامـيـم (ق10)", "id": ".ق10" },
      { "title": "⛄ قـسـم الـتـسـلـيـة", "description": "🥳 عـرض اوامـر التــسلـيـه والتــرفيــه (ق11)", "id": ".ق11" },
      { "title": "🏦 قـسـم الـبـنـك والـقـلاع", "description": "💰 عـرض اوامـر الـبـنـك والـقـلاع والـرصـيـد (ق12)", "id": ".ق12" }
    ];

    const nativeFlowPayload = {
      body: {
        text: menuText,
        contextInfo: {
          mentionedJid: [m.sender]
        }
      },
      footer: { text: '> ꒷︶ 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞' },
      header: {
        hasMediaAttachment: true,
        subtitle: '👮‍♂️ قـسـم الأدْمـن والـتـحـكـم',
        imageMessage: media.imageMessage
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: "📂 عــرض الاقــســام الـرئـيـسـيـة",
              sections: [
                {
                  title: "اخــتــر الــقــســم الـمـطـلـوب",
                  rows: sectionRows
                }
              ]
            })
          },
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: "🤖 مـعـلـومـات المـطـور",
              id: ".المطور"
            })
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: "📢 الــقــنــاة الــرَّســمــيــة",
              url: channel
            })
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: "👑 تــواصــل مــع الــمــطــور",
              url: developerContact
            })
          }
        ],
        messageParamsJson: JSON.stringify({
          limited_time_offer: {
            text: "✰ 𝐉𝐎𝐊𝐄𝐑 亗 𝐁𝐎𝐓 ✰",
            url: developerContact,
            copy_code: `المطور: +${developerNumber}`,
            expiration_time: Date.now() + 86400000
          },
          bottom_sheet: {
            in_thread_buttons_limit: 1,
            divider_indices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 999],
            list_title: "🔱 إخـتـار مــن الاتـي 🔱",
            button_title: "▻ عــرض جــمــيــع الأقـسـام  ⚡"
          },
          tap_target_configuration: {
            description: "Powered by THE JOKER & ITACHI",
            canonical_url: developerContact,
            domain: "https://ryzobot.vercel.app",
            button_index: 0
          }
        })
      }
    };

    const interactiveMessage = proto.Message.InteractiveMessage.fromObject(nativeFlowPayload);
    const fkontak = await makeFkontak();
    const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, {
      userJid: conn.user.jid,
      quoted: fkontak
    });

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  } catch (e) {
    console.error('[Joker-Admin] Error:', e);
  }
}

async function makeFkontak() {
  try {
    const res = await fetch('https://i.postimg.cc/1z01xC8h/b3a66ff0ccb17d0d7f1178e553b81eed.jpg');
    const thumb2 = Buffer.from(await res.arrayBuffer());
    return {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'JOKER' },
      message: { locationMessage: { name: '> ꒷︶ 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞', jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    };
  } catch {
    return undefined;
  }
}

handler.help = ['ق2', 'الادمن', 'الادمنز'];
handler.tags = ['main'];
handler.command = /^(ق2|الادمن|الادمنز)$/i;

export default handler;
