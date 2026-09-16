// plugins/anime_smart.js
// ✧ THE JOKER & ITACHI - نظام تحميل الأنمي الذكي 🃏

import { generateWAMessageFromContent, prepareWAMessageMedia, proto } from '@whiskeysockets/baileys';
import { theme } from '../core/theme.js';
import fetch from 'node-fetch';
import cheerio from 'cheerio';

const BASE_URL = 'https://witanime.io';

// ═══════════════════════════════════════════════════════════════
// 🧠 محرك البحث المباشر في الموقع عبر Cheerio
// ═══════════════════════════════════════════════════════════════

async function searchAnimeSite(query) {
    try {
        let res = await fetch(`${BASE_URL}/?s=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        let html = await res.text();
        let $ = cheerio.load(html);
        let results = [];

        $('.anime-card, .col-lg-2, .smart-item').each((i, el) => {
            let title = $(el).find('.title a, h3 a').text().trim();
            let link = $(el).find('.title a, h3 a').attr('href');
            let poster = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');
            let rating = $(el).find('.rating, .rate').text().trim() || 'N/A';

            if (title && link) {
                results.push({
                    name: title,
                    id: link,
                    poster: poster || '',
                    rating: rating
                });
            }
        });

        return results;
    } catch (err) {
        console.error('[SEARCH ERROR]:', err);
        return [];
    }
}

async function getAnimeDetails(url) {
    try {
        let res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        let html = await res.text();
        let $ = cheerio.load(html);

        let name = $('h1.anime-title, h1').first().text().trim();
        let poster = $('.anime-poster img, .poster img').attr('src');
        let rating = $('.rate-value, .rating').text().trim() || 'غير متاح';
        let overview = $('.anime-story, .story').text().trim() || 'لا توجد نبذة مختصرة.';
        let genres = [];
        $('.anime-genres a, .genres a').each((i, el) => { genres.push($(el).text().trim()); });

        let episodes = [];
        // جلب الحلقات بالعكس لتكون المرتبة تنازلياً أو تصاعدياً حسب الترتيب الصحيح
        $('.episodes-list-content li a, .episod-list li a').each((i, el) => {
            let epTitle = $(el).text().trim();
            let epLink = $(el).attr('href');
            let epNumMatch = epTitle.match(/\d+/);
            let epNum = epNumMatch ? epNumMatch[0] : (i + 1);

            if (epLink) {
                episodes.push({
                    episode_number: epNum,
                    name: epTitle,
                    url: epLink
                });
            }
        });

        return { name, poster, rating, overview, genres, episodes: episodes.reverse() };
    } catch (err) {
        console.error('[DETAILS ERROR]:', err);
        return null;
    }
}

async function getEpisodeServers(episodeUrl) {
    try {
        let res = await fetch(episodeUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        let html = await res.text();
        let $ = cheerio.load(html);
        let servers = [];

        $('.ep-servers-list li, .servers-list ul li, .watch-servers ul li').each((i, el) => {
            let serverName = $(el).text().trim();
            let dataUrl = $(el).attr('data-url') || $(el).find('a').attr('href');
            if (dataUrl) {
                servers.push({ name: serverName, url: dataUrl });
            }
        });

        // إذا لم يتم العثور على سيرفرات بالطريقة التقليدية، نبحث عن روابط iframe داخل الصفحة
        if (servers.length === 0) {
            $('iframe').each((i, el) => {
                let src = $(el).attr('src') || $(el).attr('data-src');
                if (src) {
                    servers.push({ name: `سيرفر ${i + 1}`, url: src });
                }
            });
        }

        return servers;
    } catch (err) {
        console.error('[SERVERS ERROR]:', err);
        return [];
    }
}

// ═══════════════════════════════════════════════════════════════
// 🧠 استخراج الابط المباشر للفيديو من السيرفرات الشهيرة
// ═══════════════════════════════════════════════════════════════

async function extractDirectUrl(url) {
    if (!url) return null;
    if (url.match(/\.(mp4|mkv|avi|mov|webm)(\?|$)/i)) return url;

    try {
        let res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        let html = await res.text();

        // بحث عن روابط ملفات الفيديو مباشرة داخل الـ HTML أو سكربتات التشغيل
        let match = html.match(/https?:\/\/[^\s"']+\.(mp4|mkv|webm)[^\s"']*/i);
        if (match) return match[0];

        let $ = cheerio.load(html);
        let source = $('source').attr('src') || $('video').attr('src');
        if (source) return source;

        // فحص إضافي لوجود رابط إمبد أو توجيه
        let iframeSrc = $('iframe').attr('src');
        if (iframeSrc && !iframeSrc.includes(url)) {
            return await extractDirectUrl(iframeSrc);
        }

        return url; // في حال تعذر الاستخراج يتم إرجاع الرابط الأصلي للمعالجة
    } catch {
        return url;
    }
}

async function fetchWithRetry(url, options = {}, retries = 3, delay = 3000) {
    for (let i = 0; i < retries; i++) {
        try {
            let res = await fetch(url, options);
            if (res.ok) return res;
        } catch (err) {
            if (i === retries - 1) throw err;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error('فشل الاتصال بعد عدة محاولات.');
}

// ═══════════════════════════════════════════════════════════════
// 📥 دالة التحميل والإرسال الآمن للفيديو
// ═══════════════════════════════════════════════════════════════

async function downloadAndSend(m, conn, videoUrl, animeTitle, episodeTitle) {
    await m.react('⏳');

    try {
        let directUrl = await extractDirectUrl(videoUrl);
        if (!directUrl) throw new Error('تعذر استخراج رابط التحميل المباشر.');

        let res = await fetchWithRetry(directUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': BASE_URL,
                'Accept': '*/*'
            }
        }, 3, 4000);

        let buffer = await res.buffer();
        let sizeMB = (buffer.length / 1024 / 1024).toFixed(2);

        const videoCaption = theme.build([
            { type: 'title', text: `🃏 ${animeTitle}` },
            { type: 'subtitle', text: episodeTitle },
            { type: 'divider' },
            { type: 'info', label: '📁 حجم الملف', value: `${sizeMB} MB` },
            { type: 'success', text: '✅ تم التحميل والإرسال بنجاح' },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);

        await conn.sendMessage(m.chat, {
            video: buffer,
            caption: videoCaption,
            mimetype: 'video/mp4'
        }, {
            quoted: m,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 1,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363429074575231@newsletter',
                    newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
                    serverMessageId: 970
                }
            }
        });

        await m.react('✅');

    } catch (err) {
        console.error('[JOKER-ANIME-ERROR]:', err.message);
        await m.react('❌');
        
        const errorText = theme.build([
            { type: 'title', text: '❌ فـشـل الـتـحـمـيـل' },
            { type: 'divider' },
            { type: 'error', text: 'حدث خطأ أو أن حجم الفيديو كبير جداً. تم توفير الرابط المباشر أدناه:' },
            { type: 'info', label: '🔗 الرابط', value: videoUrl },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);

        await conn.sendMessage(m.chat, { text: errorText }, { quoted: m });
    }
}

// ═══════════════════════════════════════════════════════════════
// 🎬 الأمر الرئيسي
// ═══════════════════════════════════════════════════════════════

let handler = async (m, { conn, text, usedPrefix, command }) => {

    // 1. معالج التحميل المباشر للروابط
    if (text && text.startsWith('http')) {
        await m.react('⏳');
        try {
            await downloadAndSend(m, conn, text, 'تحميل مباشر', 'ملف الفيديو');
        } catch (err) {
            await m.react('❌');
            await conn.reply(m.chat, `❌ فشل التحميل: ${err.message}`, m);
        }
        return;
    }

    // 2. معالج اختيار السيرفر لتحميل الحلقة
    if (text && text.startsWith('srv_')) {
        let parts = text.split('_');
        let serverUrl = decodeURIComponent(parts[1]);
        let animeTitle = decodeURIComponent(parts[2]);
        let epName = decodeURIComponent(parts[3]);

        await downloadAndSend(m, conn, serverUrl, animeTitle, epName);
        return;
    }

    // 3. معالج اختيار الحلقة وعرض السيرفرات المتاحة
    if (text && text.startsWith('ep_')) {
        let parts = text.split('_');
        let epUrl = decodeURIComponent(parts[1]);
        let animeTitle = decodeURIComponent(parts[2]);
        let epNum = parts[3];

        await m.react('⏳');

        try {
            let servers = await getEpisodeServers(epUrl);
            if (!servers || servers.length === 0) {
                throw new Error('لا توجد سيرفرات تشغيل متاحة لهذه الحلقة حالياً.');
            }

            let rows = servers.slice(0, 15).map((srv, idx) => ({
                title: `⚡ سيرفر (${srv.name || idx + 1})`,
                description: `اضغط للتحميل والمشاهدة بجودة عالية`,
                id: `${usedPrefix}${command} srv_${encodeURIComponent(srv.url)}_${encodeURIComponent(animeTitle)}_${encodeURIComponent(`الحلقة ${epNum}`)}`
            }));

            let srvMenuText = theme.build([
                { type: 'title', text: `🃏 اختيار سيرفر التحميل` },
                { type: 'subtitle', text: `${animeTitle} - الحلقة ${epNum}` },
                { type: 'divider' },
                { type: 'info', label: '📋 الإرشاد', value: 'اختر أحد السيرفرات أدناه لجلب الفيديو سليماً' },
                { type: 'divider' },
                { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
            ]);

            const interactiveMessage = {
                body: { text: srvMenuText },
                footer: { text: '✧ 𝚰𝚻𝚫𝚂𝚮𝚰 ♞ 𝐔𝐂𝐇𝚰𝚮𝚫 ✧' },
                header: { hasMediaAttachment: false },
                nativeFlowMessage: {
                    buttons: [{
                        name: 'single_select',
                        buttonParamsJson: JSON.stringify({
                            title: "⚡ اختر السيرفر",
                            sections: [{ title: "اختر سيرفر التحميل المناسب", rows }]
                        })
                    }],
                    messageParamsJson: ""
                }
            };

            let msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: { message: { interactiveMessage } }
            }, { userJid: conn.user.jid, quoted: m });

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await m.react('✅');

        } catch (err) {
            await m.react('❌');
            await conn.reply(m.chat, `❌ خطأ في جلب السيرفرات: ${err.message}`, m);
        }
        return;
    }

    // 4. معالج اختيار الأنمي وعرض الحلقات
    if (text && text.startsWith('anime_')) {
        let parts = text.split('_');
        let animeUrl = decodeURIComponent(parts[1]);
        let animeTitle = decodeURIComponent(parts[2]);

        await m.react('⏳');

        try {
            let data = await getAnimeDetails(animeUrl);
            if (!data || !data.episodes || data.episodes.length === 0) {
                throw new Error('لا توجد حلقات مسجلة لهذا الأنمي.');
            }

            let imgMsg = null;
            if (data.poster) {
                try {
                    imgMsg = await prepareWAMessageMedia(
                        { image: { url: data.poster } },
                        { upload: conn.waUploadToServer }
                    );
                } catch (e) {}
            }

            let rows = data.episodes.slice(0, 25).map(ep => ({
                title: `🎬 الحلقة ${ep.episode_number}`,
                description: ep.name.substring(0, 40),
                id: `${usedPrefix}${command} ep_${encodeURIComponent(ep.url)}_${encodeURIComponent(animeTitle)}_${ep.episode_number}`
            }));

            let menuText = theme.build([
                { type: 'title', text: `🃏 ${data.name}` },
                { type: 'divider' },
                { type: 'info', label: '⭐ التقييم', value: data.rating },
                { type: 'info', label: '🎭 التصنيف', value: data.genres.join(", ") || "غير محدد" },
                { type: 'divider' },
                { type: 'line', text: (data.overview).slice(0, 180) + '...' },
                { type: 'divider' },
                { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
            ]);

            const interactiveMessage = {
                body: { text: menuText },
                footer: { text: '✧ 𝚰𝚻𝚫𝚂𝚮𝚰 ♞ 𝐔𝐂𝐇𝚰𝚮𝚫 ✧' },
                header: {
                    hasMediaAttachment: !!imgMsg?.imageMessage,
                    imageMessage: imgMsg?.imageMessage || null
                },
                nativeFlowMessage: {
                    buttons: [{
                        name: 'single_select',
                        buttonParamsJson: JSON.stringify({
                            title: "🎬 اختر الحلقة",
                            sections: [{ title: `📺 الحلقات المتوفرة (${data.episodes.length} حلقة)`, rows }]
                        })
                    }],
                    messageParamsJson: ""
                }
            };

            let msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: { message: { interactiveMessage } }
            }, { userJid: conn.user.jid, quoted: m });

            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            await m.react('✅');

        } catch (err) {
            await m.react('❌');
            await conn.reply(m.chat, `❌ خطأ في جلب بيانات الأنمي: ${err.message}`, m);
        }
        return;
    }

    // 5. واجهة البحث الأساسية
    if (!text) {
        let helpText = theme.build([
            { type: 'title', text: '🃏 نِـظـام تـحـمـيـل الـأنـمـي' },
            { type: 'subtitle', text: 'ابحث عن أي أنمي أو الصق رابط التحميل مباشرة' },
            { type: 'divider' },
            { type: 'info', label: '🔍 للبحث', value: `${usedPrefix}${command} <اسم الأنمي>` },
            { type: 'info', label: '📥 تحميل مباشر', value: `${usedPrefix}${command} <رابط الحلقة>` },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);
        return conn.reply(m.chat, helpText, m);
    }

    await m.react('⏳');

    try {
        let results = await searchAnimeSite(text);

        if (!results || results.length === 0) {
            await m.react('❌');
            let notFoundText = theme.build([
                { type: 'title', text: '🃏 لَم تـُعـثـر نـَتـيـجـة' },
                { type: 'divider' },
                { type: 'error', text: `لم يتم العثور على أي نتائج مطابقة لـ: "${text}"` },
                { type: 'divider' },
                { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
            ]);
            return conn.reply(m.chat, notFoundText, m);
        }

        let imgMsg = null;
        if (results[0]?.poster) {
            try {
                imgMsg = await prepareWAMessageMedia(
                    { image: { url: results[0].poster } },
                    { upload: conn.waUploadToServer }
                );
            } catch (e) {}
        }

        let rows = results.slice(0, 10).map(anime => ({
            title: anime.name.substring(0, 45),
            description: `⭐ التقييم: ${anime.rating}`,
            id: `${usedPrefix}${command} anime_${encodeURIComponent(anime.id)}_${encodeURIComponent(anime.name)}`
        }));

        let searchMenuText = theme.build([
            { type: 'title', text: '🃏 نِـتـائـج بـَحـث الـأنـمـي' },
            { type: 'divider' },
            { type: 'info', label: '🔍 البحث', value: text },
            { type: 'info', label: '📋 الإرشاد', value: 'اختر العمل المطلوب من القائمة أدناه' },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);

        const interactiveMessage = {
            body: { text: searchMenuText },
            footer: { text: '✧ 𝚰𝚻𝚫𝚂𝚮𝚰 ♞ 𝐔𝐂𝐇𝚰𝚮𝚫 ✧' },
            header: {
                hasMediaAttachment: !!imgMsg?.imageMessage,
                imageMessage: imgMsg?.imageMessage || null
            },
            nativeFlowMessage: {
                buttons: [{
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                        title: "🎬 اختر الأنمي",
                        sections: [{ title: "📺 نتائج البحث المتاحة", rows }]
                    })
                }],
                messageParamsJson: ""
            }
        };

        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: { message: { interactiveMessage } }
        }, { userJid: conn.user.jid, quoted: m });

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        await m.react('✅');

    } catch (err) {
        await m.react('❌');
        let searchErrText = theme.build([
            { type: 'title', text: '❌ خـطـأ في البحث' },
            { type: 'divider' },
            { type: 'error', text: err.message },
            { type: 'divider' },
            { type: 'line', text: '〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍' }
        ]);
        await conn.reply(m.chat, searchErrText, m);
    }
};

handler.help = ['انمي <اسم>'];
handler.tags = ['anime'];
handler.command = /^(انمي)$/i;

export default handler;
