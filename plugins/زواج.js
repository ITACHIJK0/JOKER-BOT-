// plugins/zawgny.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - نظام الزواج والطلاق الإمبراطوري الأسطوري 💍💔

import fetch from 'node-fetch';

let toM = a => '@' + a.split('@')[0];

const maleNames = [
    'atachi', 'itachi', 'joker', 'omar', 'yousef', 'marwan', 'mohamed', 'ahmed', 'ali', 'hassan',
    'hussein', 'ibrahim', 'mahmoud', 'khaled', 'amr', 'tarek', 'ziad', 'saif', 'abdallah', 'abdelrahman',
    'mostafa', 'hamza', 'bilal', 'osama', 'rami', 'faisal', 'sultan', 'fahd', 'nasser', 'john', 'david',
    'michael', 'alex', 'carlos', 'james', 'robert', 'william', 'richard', 'jose', 'thomas', 'charles',
    'ابراهيم', 'محمد', 'احمد', 'علي', 'حسين', 'حسن', 'يوسف', 'عمر', 'مروان', 'خالد', 'محمود', 'عبدالرحمن',
    'عبدالله', 'مصطفى', 'حمزة', 'بلال', 'اسامة', 'رامي', 'فيصل', 'سلطان', 'فهد', 'نايف', 'زياد', 'سيف',
    'تامر', 'باسم', 'سعيد', 'جمال', 'سامي', 'وائل', 'أسامة', 'معاذ', 'يزيد', 'الأتاتشي', 'الجوكر'
];

const femaleNames = [
    'sahar', 'samar', 'fatma', 'fatima', 'aisha', 'khadija', 'mariam', 'maryam', 'nour', 'reem',
    'jana', 'salma', 'hala', 'yasmin', 'yasemeen', 'rana', 'dina', 'aya', 'menna', 'nada', 'sara',
    'sarah', 'asmaa', 'hagar', 'habiba', 'farida', 'malak', 'hadeer', 'shorouk', 'latifa', 'zainab',
    'jessica', 'emily', 'hannah', 'elizabeth', 'anna', 'emma', 'olivia', 'sophia', 'mia',
    'فاطمة', 'عائشة', 'خديجة', 'مريم', 'نور', 'ريم', 'جنا', 'سلمى', 'هالة', 'ياسمين', 'رنا', 'دينا',
    'آية', 'منة', 'ندى', 'سارة', 'أسماء', 'هاجر', 'حبيبة', 'فريدة', 'ملك', 'هدير', 'شروق', 'لطيفة',
    'زينب', 'سحر', 'سمر', 'بتول', 'دعاء', 'روان', 'شهد', 'حلا', 'لين', 'آيلا', 'الجوهرة', 'ملكة'
];

function guessGender(name = '') {
    const cleanName = name.toLowerCase().replace(/[^a-z\u0600-\u06ff]/gi, ' ').trim();
    const words = cleanName.split(/\s+/);
    let maleScore = 0;
    let femaleScore = 0;

    for (let word of words) {
        if (maleNames.some(m => word.includes(m))) maleScore++;
        if (femaleNames.some(f => word.includes(f))) femaleScore++;
    }

    if (maleScore > femaleScore) return 'male';
    if (femaleScore > maleScore) return 'female';
    return Math.random() > 0.5 ? 'male' : 'female';
}

const DEVELOPER_LID = '212408480080003@lid';

let handler = async (m, { conn, text, usedPrefix, command, groupMetadata }) => {
    try {
        let ps = [];
        try {
            let metadata = groupMetadata || await conn.groupMetadata(m.chat);
            if (metadata && metadata.participants) {
                ps = metadata.participants.map(u => u.id || u.jid).filter(Boolean);
            }
        } catch (e) {
            console.error('Error fetching group metadata:', e);
        }

        if (!ps || ps.length === 0) {
            let groupChat = await conn.chats[m.chat];
            if (groupChat && groupChat.participants) {
                ps = groupChat.participants.map(u => u.id || u.jid).filter(Boolean);
            }
        }

        ps = ps.map(jid => {
            if (!jid) return '';
            if (typeof jid === 'string' && jid.includes('@')) return jid;
            let num = String(jid).replace(/[^0-9]/g, '');
            return num ? num + '@s.whatsapp.net' : '';
        }).filter(jid => jid && jid.includes('@'));

        ps = [...new Set(ps)];

        if (ps.length < 2) {
            return m.reply('*❄️ 𝐈𝐭𝐚𝐜𝐡𝐢: "المجموعة تحتاج إلى عضوين على الأقل لإتمام المراسم"*');
        }

        // استخراج المشنات أو الردود المرفقة بالرسالة
        let mentioned = m.mentionedJid || [];
        if (m.quoted && m.quoted.sender) {
            mentioned.push(m.quoted.sender);
        }
        mentioned = [...new Set(mentioned)];

        // فحص ما إذا كان المرسل أو الشخص المحدود هو المطور عبر الـ LID أو الرقم
        let senderLid = m.sender;
        let isDev = (senderLid === DEVELOPER_LID) || 
                    (global.owner && global.owner.some(o => (Array.isArray(o) ? o[0] : o) + '@s.whatsapp.net' === m.sender));

        // 💔 معالجة أمر الطلاق
        if (command === 'طلاق' || command === 'اتطلقوا' || command === 'اطلاق') {
            let target1, target2;
            if (mentioned.length >= 2) {
                target1 = mentioned[0];
                target2 = mentioned[1];
            } else if (mentioned.length === 1) {
                target1 = m.sender;
                target2 = mentioned[0];
            } else {
                target1 = ps[Math.floor(Math.random() * ps.length)];
                do {
                    target2 = ps[Math.floor(Math.random() * ps.length)];
                } while (target2 === target1 && ps.length > 1);
            }

            let imageUrl = 'https://i.postimg.cc/kG7t6RgX/274d9fa742b3a4e961e8a643217a4b06.jpg';
            let imageBuffer;
            try {
                const imageRes = await fetch(imageUrl);
                imageBuffer = Buffer.from(await imageRes.arrayBuffer());
            } catch {
                const fallbackRes = await fetch('https://i.postimg.cc/65BvqxY4/c8896314f29c6ae8d3c47a536f528116.jpg');
                imageBuffer = Buffer.from(await fallbackRes.arrayBuffer());
            }

            let captionText = `*꒷︶꒷꒦꒷ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯』 ꒷︶꒷꒦꒷*\n\n` +
                `   ♡ ⦓ 💔 محكمة البوت - طلاق رسمي ⦔ ♡\n\n` +
                `*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n\n` +
                `┠ 👤╎الطرف الأول : ${toM(target1)}\n` +
                `┠ 👤╎الطرف الثاني : ${toM(target2)}\n\n` +
                `> ⚖️╎بعد مداولة القضاة، تم الانفصال!\n` +
                `> 🚪╎كل واحد يروح في طريقه 💔\n\n` +
                `*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n` +
                `        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞\n` +
                `> ꒷︶ 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞`;

            await conn.sendMessage(m.chat, {
                image: imageBuffer,
                caption: captionText,
                mentions: [target1, target2]
            }, { quoted: m });

            return await conn.sendMessage(m.chat, { react: { text: '💔', key: m.key } });
        }

        // 💍 معالجة أمر .زوج
        if (command === 'زوج') {
            if (mentioned.length === 0) {
                return m.reply(`*⚠️ يرجى كتابة الأمر مع منشن لشخصين ترغب في زواجهما ببعض!*\n*مثال: .زوج @شخص1 @شخص2*`);
            }
        }

        let groom, bride;
        let isDeveloperWedding = false;

        if (command === 'زواج') {
            if (mentioned.length >= 2) {
                groom = mentioned[0];
                bride = mentioned[1];
            } else if (mentioned.length === 1) {
                groom = m.sender;
                bride = mentioned[0];
            } else {
                let males = [];
                let females = [];
                for (let jid of ps) {
                    let memberName = '';
                    try { memberName = await conn.getName(jid); } catch (e) {}
                    if (guessGender(memberName) === 'male') males.push(jid);
                    else females.push(jid);
                }

                if (males.length > 0 && females.length > 0) {
                    groom = males[Math.floor(Math.random() * males.length)];
                    do {
                        bride = females[Math.floor(Math.random() * females.length)];
                    } while (bride === groom && females.length > 1);
                } else {
                    groom = ps[Math.floor(Math.random() * ps.length)];
                    do {
                        bride = ps[Math.floor(Math.random() * ps.length)];
                    } while (bride === groom);
                }
            }
        } else if (command === 'زوجني' || command === 'تزوج') {
            groom = m.sender;
            if (mentioned.length >= 1) {
                bride = mentioned[0];
            } else {
                let candidatePool = ps.filter(jid => jid !== groom);
                let females = [];
                for (let jid of candidatePool) {
                    let memberName = '';
                    try { memberName = await conn.getName(jid); } catch (e) {}
                    if (guessGender(memberName) === 'female') females.push(jid);
                }
                if (females.length > 0) {
                    bride = females[Math.floor(Math.random() * females.length)];
                } else {
                    bride = candidatePool[Math.floor(Math.random() * candidatePool.length)];
                }
            }
        } else if (command === 'زوج') {
            if (mentioned.length >= 2) {
                groom = mentioned[0];
                bride = mentioned[1];
            } else if (mentioned.length === 1) {
                groom = m.sender;
                bride = mentioned[0];
            }
        }

        // تحقق مما إذا كان المطور أحد أطراف الزواج (سواء كاتب الأمر، منشن، أو اختيار عشوائي)
        if (groom === DEVELOPER_LID || bride === DEVELOPER_LID || isDev) {
            isDeveloperWedding = true;
            // المطور يجب أن يكون دائماً العريس
            if (groom !== DEVELOPER_LID && !isDev) {
                // إذا كان المطور هو العروس في الاختيار، نبدله ليكون العريس
                if (bride === DEVELOPER_LID) {
                    let temp = groom;
                    groom = bride;
                    bride = temp;
                } else if (isDev) {
                    groom = m.sender;
                }
            }
        }

        let imageUrl = isDeveloperWedding 
            ? 'https://i.postimg.cc/Gh513WL8/3f90afb733ab37952e1399d161adea1b.jpg' 
            : 'https://i.postimg.cc/PxhgFhyn/03e7fb26a83dfcab0f9e80de2c6861bc.jpg';

        let imageBuffer;
        try {
            const imageRes = await fetch(imageUrl);
            imageBuffer = Buffer.from(await imageRes.arrayBuffer());
        } catch {
            const fallbackRes = await fetch('https://i.postimg.cc/65BvqxY4/c8896314f29c6ae8d3c47a536f528116.jpg');
            imageBuffer = Buffer.from(await fallbackRes.arrayBuffer());
        }

        let captionText = '';
        if (isDeveloperWedding) {
            captionText = `*꒷︶꒷꒦꒷ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯』 ꒷︶꒷꒦꒷*\n\n` +
                `   ♡ ⦓ 👑 مراسم الزواج الملكي ⦔ ♡\n\n` +
                `*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n\n` +
                `┠ 👑╎العريس (المطور) : ${toM(groom)}\n` +
                `┠ 👩‍💼╎العروس المحظوظة : ${toM(bride)}\n\n` +
                `> 🍀╎أنتي محظوظة لأنك زوجته\n` +
                `> 🎉╎ألف مبروك لكم 🫠\n\n` +
                `*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n` +
                `        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞\n` +
                `> ꒷︶ 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞`;
        } else {
            captionText = `*꒷︶꒷꒦꒷ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯』 ꒷︶꒷꒦꒷*\n\n` +
                `   ♡ ⦓ 💍 إعـلان ارتـبـاط رسـمـي ⦔ ♡\n\n` +
                `*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n\n` +
                `┠ 👨‍💼╎العريس : ${toM(groom)}\n` +
                `┠ 👩‍💼╎العروس : ${toM(bride)}\n\n` +
                `> 🎉╎ألف مبروك للعرسان 🫠!\n` +
                `> ☘️╎نتمني لكم حياه زوجه سعيده🍯\n\n` +
                `*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n` +
                `        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞\n` +
                `> ꒷︶ 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭`;
        }

        await conn.sendMessage(m.chat, {
            image: imageBuffer,
            caption: captionText,
            mentions: [groom, bride]
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: isDeveloperWedding ? '👑' : '💍', key: m.key } });

    } catch (err) {
        console.error('[Itachi-Zawgny] error:', err);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await m.reply(`*❄️ 𝐈𝐭𝐚𝐜𝐡𝐢: فشلت مهمة الارتباط بسبب خطأ تقني.*`);
    }
};

handler.help = ['زوجني', 'زواج', 'زوج', 'طلاق'];
handler.tags = ['entertainment'];
handler.command = /^(زوجني|زواج|تزوج|زوج|طلاق|اتطلقوا|اطلاق)$/i;
handler.group = true;

export default handler;
