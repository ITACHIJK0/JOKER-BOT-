// plugins/menu-admin.js                                        // ✧ THE JOKER & ITACHI - Admin & Main Menu 👮‍♂️

import { existsSync } from 'fs'
import { join } from 'path'
import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'
import { performance } from 'perf_hooks'
import fetch from 'node-fetch'
import { theme } from '../core/theme.js';

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    let old = performance.now()
    let neww = performance.now()
    let speed = (neww - old).toFixed(4)

    // التفاعل بإيموجي القسم الخاص بالأدمن
    await conn.sendMessage(m.chat, { react: { text: '👮‍♂️', key: m.key } });
    const imageUrl = 'https://i.postimg.cc/C1kkvHGS/9b456155cd35f9bdfcbca58b397edb75.jpg';
    const imageRes = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
    const media = await prepareWAMessageMedia({ image: imageBuffer }, { upload: conn.waUploadToServer });

    let menuText = `🃏 القائمة الرئيسية
❖ ── ✦ ── [ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
 ┠ 👤 ╎ الاسـم: @${m.sender.split('@')[0]}
 ┠ 👮‍♂️ ╎ قــسم الــتـحـكـم والأدْمــن
 ┠ ${_p}منشن
 ┠ ${_p}جروب
 ┠ ${_p}طرد
 ┠ ${_p}انذار
 ┠ ${_p}الغاء_انذار
 ┠ ${_p}انذارات
 ┠ ${_p}لينك
 ┠ ${_p}اعفاء
 ┠ ${_p}ترقيه
 ┠ ${_p}المتصلين
 ┠ ${_p}تجديد
 ┠ ${_p}مخفي
 ┠ ${_p}حذف
 ┠ ${_p}كتم
 ┠ ${_p}فك_الكتم
 ┠ ${_p}مضاد_الجهات
 ┠ ${_p}مضاد_الروابط
 ┠ ${_p}مضاد_الشتايم
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞
> 亗 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞`;

    const channel = "https://whatsapp.com/channel/0029Vb8iiA24tRrvy4FB0H0A"
    const developerNumber = "249916221538"
    const developerContact = `https://wa.me/${developerNumber}`

    let sectionRows = [
      { "title": "👮‍♂️ قـسـم الأدْمـن", "description": "🔱 عـرض اوامـر الادارة والـتـحـكـم فـي الـجـروب 🔱", "id": ".ق1" },
      { "title": "🎨 قـسـم الاسـتـيـكـر", "description": "🎨 عـرض اوامـر صـنـع وتـصـمـيـم الـاسـتـيـكـرات 🎨", "id": ".ق2" },
      { "title": "🎮 قـسـم الألـعـاب", "description": "🎮 عـرض اوامـر الـعـلـاب والـمـسـابـقـات والـتـسـلـيـه 🎮", "id": ".ق3" },
      { "title": "📥 قـسـم الـتـحـمـيـل", "description": "📥 عـرض اوامـر تـحـمـيـل الـفـيـديـوهـات والـصـوتـيـات 📥", "id": ".ق4" },
      { "title": "🧰 قـسـم الأدوات", "description": "🧰 عـرض الادوات والـمـسـاعـدات الـذكـيـه لـلـبـوت 🧰", "id": ".ق5" },
      { "title": "📚 قـسـم الـمـانـجـا", "description": "📚 عـرض اوامـر وبـحـث فـصـول الـمـانـجـا والـأنـيـمـي 📚", "id": ".ق6" },
      { "title": "🤖 الـذكـاء الاصـطـنـاعـي", "description": "🤖 عـرض اوامـر الـذكـاء الاصـطـنـاعـي والـمـحـادثـات 🤖", "id": ".ق7" },
      { "title": "🎌 قـسـم الـنـقـابـات", "description": "🎌 عـرض اوامـر وانـظـمـة الـنـقـابـات والـعـشـائـر 🎌", "id": ".ق8" },
      { "title": "🖼️ قـسـم الـصـور", "description": "🖼️ عـرض اوامـر الـصـور والـخـلـفـيـات والـتـصـامـيـم 🖼️", "id": ".ق9" },
      { "title": "⛄ قـسـم الـتـسـلـيـة", "description": "🥳 عـرض اوامـر التــسلـيـه والتــرفيــه 🥳", "id": ".ق10" },
      { "title": "👑 قـسـم الـمـطـور", "description": "👑 عـرض اوامـر والـصـلاحـيـات الخاصه بـالـمـطـور 👑", "id": ".ق11" },
      { "title": "🏦 قـسـم الـبـنـك والـقـلاع", "description": "💰 عـرض اوامـر الـبـنـك والـقـلاع والـرصـيـد (ق12) 💰", "id": ".ق12" }
    ];

    const nativeFlowPayload = {
      body: {
        text: menuText,
        contextInfo: {
          mentionedJid: [m.sender]
        }
      },
      footer: { text: '> 亗 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞' },
      header: {
        hasMediaAttachment: true,
        subtitle: '👮‍♂️ لـوحـة تـحـكـم الأدْمـن',
        imageMessage: media.imageMessage
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: "🔱 إخـتـار مــن الاتـي 🔱",
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
              display_text: "🤖 تــنــصــيــب الــبــوت",
              id: ".تنصيب"
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
              display_text: "👑 تــواصــل مــع الــمــطـور",
              url: developerContact
            })
          }
        ],
        messageParamsJson: JSON.stringify({
          limited_time_offer: {
            text: `⚡ ${speed}ms`,
            url: developerContact,
            copy_code: `المطور: +${developerNumber}`,
            expiration_time: Date.now() + 86400000
          },
          bottom_sheet: {
            in_thread_buttons_limit: 1,
            divider_indices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 999],
            list_title: "🔱 إخـتـار مــن الاتـي 🔱",
            button_title: "▻ عــرض جــمــيــع الأقــســام  ⚡"
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
    console.error('[Joker-Menu]', e);
    await conn.sendMessage(m.chat, {
      text: theme.build([
        { type: 'title', text: '🃏 الـجـوكـر: "خطأ"' },
        { type: 'warning', text: 'حدث خطأ أثناء تحميل لوحة الأدمن' }
      ])
    }, { quoted: m });
  }
}

async function makeFkontak() {
  try {
    const res = await fetch('https://i.postimg.cc/C1kkvHGS/9b456155cd35f9bdfcbca58b397edb75.jpg');
    const thumb2 = Buffer.from(await res.arrayBuffer());
    return {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'JOKER' },
      message: { locationMessage: { name: '> 亗 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞', jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    };
  } catch {
    return undefined;
  }
}

handler.help = ['ق1', 'adminmenu'];
handler.tags = ['main'];
handler.command = /^(ق1|adminmenu)$/i;

export default handler;
