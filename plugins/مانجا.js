// plugins/manhwa.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - نظام المانجا السيبراني 📚🔥

import axios from 'axios';
import cheerio from 'cheerio';
import baileys from '@whiskeysockets/baileys';
import JSZip from 'jszip';

const { prepareWAMessageMedia, generateWAMessageFromContent, proto } = baileys;

const DEFAULT_IMAGE = 'https://i.postimg.cc/W38s8NhV/f97a4627f09b6de650f2a1d1f4e9e461.jpg';
const CACHE_DURATION = 5 * 60 * 1000;
const MAX_IMAGES_PER_CHAPTER = 50;
const REQUEST_TIMEOUT = 30000;
const RETRY_COUNT = 3;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 Cache System
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const cache = new Map();

function getCached(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
}

function setCached(key, data) {
    cache.set(key, { data, timestamp: Date.now() });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔧 Utility Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function fetchWithRetry(url, retries = RETRY_COUNT) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(url, {
                timeout: REQUEST_TIMEOUT,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'ar,en;q=0.9',
                    'Referer': 'https://mangatuk.com/'
                }
            });
            return response;
        } catch (err) {
            if (i === retries - 1) throw err;
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
}

async function createImageMessage(conn, url) {
    if (!url || typeof url !== "string" || !url.startsWith("http")) return null;
    try {
        const media = await prepareWAMessageMedia({ image: { url } }, { upload: conn.waUploadToServer });
        return media.imageMessage || null;
    } catch {
        return null;
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌟 عرض أشهر المانجات في قائمة منسدلة (عبر الموقع مباشرة)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function showPopularManga(conn, m) {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }); } catch {}
    };
    await react('🔥');

    try {
        const { data } = await fetchWithRetry('https://mangatuk.com/catalog?sort=views');
        const $ = cheerio.load(data);
        const results = [];

        $('a[href*="/series/"]').each((i, el) => {
            const href = $(el).attr('href');
            const title = $(el).find('h3, .title, img').first().attr('alt') || $(el).text().trim();
            const img = $(el).find('img').attr('src');
            
            if (href && title && title.length > 2) {
                const match = href.match(/\/series\/([^\/]+)/);
                if (match && match[1]) {
                    const slug = match[1];
                    if (!results.find(r => r.slug === slug)) {
                        results.push({
                            slug,
                            title: title.split('\n')[0].trim(),
                            coverImage: img || DEFAULT_IMAGE
                        });
                    }
                }
            }
        });

        if (results.length === 0) {
            await react('❌');
            return m.reply(`> 👑 *ITACHI & JOKER: "لا توجد نتائج"*`);
        }

        const rows = results.slice(0, 15).map((manga) => ({
            title: `📚 ${manga.title.substring(0, 50)}`,
            description: `اضغط لعرض فصول المانجا`,
            id: `.فصول_توك ${manga.slug}`
        }));

        const interactiveMessage = proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
                text: `👑 *[ أشهر المانجات السيبرانية ]* 👑\n\n🔥 قائمة بأبرز المانجات المتوفرة على منصة مانجا توك.\n👇 اختر مانجا لعرض فصولها مباشرة:`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
                text: `👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`
            }),
            header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: [{
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                        title: '🔥 أشهر المانجات',
                        sections: [{ title: 'المانجا المتاحة', rows }]
                    })
                }]
            })
        });

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: { message: { interactiveMessage } }
        }, { quoted: m });

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        await react('✅');
    } catch (error) {
        console.error('[ITACHI-MANHWA] Popular error:', error);
        await react('❌');
        m.reply(`> 👑 *ITACHI & JOKER: "خطأ"* \n> 🔮 ${error.message}`);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 البحث (عبر الموقع مباشرة)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function searchManga(conn, m, query) {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }); } catch {}
    };
    await react('🔍');
    try {
        const searchUrl = `https://mangatuk.com/catalog?q=${encodeURIComponent(query)}`;
        const { data } = await fetchWithRetry(searchUrl);
        const $ = cheerio.load(data);

        const results = [];
        $('a[href*="/series/"]').each((i, el) => {
            const href = $(el).attr('href');
            const title = $(el).find('h3, .title').text().trim() || $(el).attr('title');
            const img = $(el).find('img').attr('src');
            
            if (href) {
                const match = href.match(/\/series\/([^\/]+)/);
                if (match && match[1]) {
                    const slug = match[1];
                    if (!results.find(r => r.slug === slug)) {
                        results.push({
                            slug,
                            title: title || slug.replace(/-/g, ' '),
                            coverImage: img || DEFAULT_IMAGE
                        });
                    }
                }
            }
        });

        if (results.length === 0) {
            await react('❌');
            return m.reply(`> 👑 *ITACHI & JOKER: "لا توجد نتائج"*\n> \n> 🔮 لا توجد نتائج لـ: ${query}`);
        }

        const cards = [];
        for (const manga of results.slice(0, 10)) {
            const imageMsg = await createImageMessage(conn, manga.coverImage);
            if (!imageMsg) continue;

            cards.push({
                body: proto.Message.InteractiveMessage.Body.fromObject({
                    text: `📚 *${manga.title.substring(0, 35)}*\n🔗 اضغط لعرض الفصول`
                }),
                header: proto.Message.InteractiveMessage.Header.fromObject({
                    hasMediaAttachment: true,
                    imageMessage: imageMsg
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                    buttons: [{
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📖 عرض الفصول',
                            id: `.فصول_توك ${manga.slug}`
                        })
                    }]
                })
            });
        }

        if (cards.length === 0) {
            await react('⚠️');
            return m.reply('> ⚠️ *ITACHI & JOKER: "خطأ"*\n> \n> 🔮 لم يتم العثور على صور مطابقة للبحث.');
        }

        const carouselMsg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: `🔍 *نتائج البحث عن:* ${query}\n📊 *العدد:* ${results.length} مانجا`
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ'
                        }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
                    })
                }
            }
        }, { quoted: m });

        await conn.relayMessage(m.chat, carouselMsg.message, { messageId: carouselMsg.key.id });
        await react('✅');
    } catch (error) {
        console.error('[ITACHI-MANHWA] Search error:', error);
        await react('❌');
        await m.reply(`> 👑 *ITACHI & JOKER: "خطأ في البحث"*\n> \n> 🔮 ${error.message}`);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📖 جلب الفصول وعرضها
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function getChaptersFromSite(slug) {
    const cacheKey = `chapters_${slug}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const url = `https://mangatuk.com/series/${slug}`;
    const { data } = await fetchWithRetry(url);
    const $ = cheerio.load(data);

    const chapters = [];
    $('a[href*="/series/"][href*="/"]').each((i, el) => {
        const href = $(el).attr('href');
        const match = href.match(/\/([^\/]+)$/);
        const title = $(el).find('.chapter-title, span').text().trim();
        const dateText = $(el).find('.chapter-date').text().trim();
        
        if (match && match[1] !== slug) {
            const chapterNum = match[1];
            if (!chapters.find(c => c.number === chapterNum)) {
                chapters.push({
                    number: chapterNum,
                    slug: chapterNum,
                    title: title || null,
                    url: `https://mangatuk.com${href}`,
                    date: dateText
                });
            }
        }
    });

    setCached(cacheKey, chapters);
    return chapters;
}

async function showChapters(conn, m, slug) {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }); } catch {}
    };

    await react('⏳');

    try {
        const url = `https://mangatuk.com/series/${slug}`;
        const { data } = await fetchWithRetry(url);
        const $ = cheerio.load(data);

        const title = $('h1').first().text().trim() || slug;
        const coverImg = $('img').first().attr('src') || DEFAULT_IMAGE;

        const chapters = await getChaptersFromSite(slug);

        if (chapters.length === 0) {
            await react('❌');
            return m.reply(`> 👑 *ITACHI & JOKER: "لا توجد فصول"*\n> \n> 🔮 تأكد من اسم المانجا أو الـ slug الصحيح.`);
        }

        const rows = chapters.slice(0, 30).map((ch) => ({
            title: `📖 الفصل ${ch.number}`,
            description: `اضغط لعرض الصور`,
            id: `.فصل_توك ${slug}/${ch.slug}`
        }));

        const imageMsg = await createImageMessage(conn, coverImg);
        const interactiveMessage = proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
                text: `👑 *[ ${title.substring(0, 40)} ]* 👑\n📖 *عدد الفصول:* ${chapters.length}\n👇 اختر الفصل من القائمة السيبرانية`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
                text: `👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`
            }),
            header: imageMsg ? proto.Message.InteractiveMessage.Header.create({
                hasMediaAttachment: true,
                imageMessage: imageMsg
            }) : proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: [{
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                        title: '📖 اختر الفصل',
                        sections: [{ title: 'الفصول المتاحة', rows }]
                    })
                }]
            })
        });

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: { message: { interactiveMessage } }
        }, { quoted: m });

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        await react('✅');
    } catch (error) {
        console.error('[ITACHI-MANHWA] Chapters error:', error);
        await react('❌');
        await m.reply(`> 👑 *ITACHI & JOKER: "خطأ في جلب الفصول"*\n> \n> 📌 تأكد من صحة الـ slug\n> مثال: solo-leveling-ragnarok`);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📸 عرض صفحات الفصل
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function getChapterImages(slug, chapterSlug) {
    const cacheKey = `chapter_${slug}_${chapterSlug}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const url = `https://mangatuk.com/series/${slug}/${chapterSlug}`;
    const { data } = await fetchWithRetry(url);
    const $ = cheerio.load(data);

    const images = new Set();
    $('img').each((i, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src');
        if (src && (src.includes('content.mangatuk.com') || src.includes('/WP-manga/')) && !src.includes('avatar') && !src.includes('cover')) {
            images.add(src);
        }
    });

    const imageList = Array.from(images);
    setCached(cacheKey, imageList);
    return imageList;
}

async function getChapterNavigation(slug, currentSlug) {
    let chapters = await getChaptersFromSite(slug);
    const currentIndex = chapters.findIndex(ch => ch.slug === currentSlug || ch.number === currentSlug);

    return {
        prev: currentIndex > 0 ? chapters[currentIndex - 1] : null,
        next: currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null,
        current: chapters[currentIndex],
        chapters
    };
}

async function showChapterPages(conn, m, slug, chapterSlug) {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }); } catch {}
    };

    const startTime = Date.now();
    await react('⏳');
    await m.reply('> 👑 *ITACHI & JOKER: "جاري تحميل الصور عبر النظام السيبراني..."*');

    try {
        const images = await getChapterImages(slug, chapterSlug);

        if (images.length === 0) {
            await react('❌');
            return m.reply(`> 👑 *ITACHI & JOKER: "لا توجد صور"*\n> \n> 🔮 لم يتم العثور على صور في الفصل ${chapterSlug}`);
        }

        let imagesToSend = images;
        if (images.length > MAX_IMAGES_PER_CHAPTER) {
            await m.reply(`> ⚠️ *ITACHI & JOKER: "فصل ضخم"*\n> \n> هذا الفصل كبير جداً (${images.length} صفحة)\n> سيتم إرسال أول ${MAX_IMAGES_PER_CHAPTER} صفحة فقط`);
            imagesToSend = images.slice(0, MAX_IMAGES_PER_CHAPTER);
        }

        await m.reply(`> 📸 *ITACHI & JOKER: "جاري إرسال ${imagesToSend.length} صفحة..."*`);

        for (let i = 0; i < imagesToSend.length; i++) {
            try {
                await conn.sendMessage(m.chat, {
                    image: { url: imagesToSend[i] },
                    caption: `👑 *الصفحة ${i+1} من ${imagesToSend.length}*\n📚 *الفصل ${chapterSlug}*`
                }, { quoted: m });
                if (i < imagesToSend.length - 1) await new Promise(r => setTimeout(r, 500));
            } catch (err) {
                console.error(`[ITACHI-MANHWA] Page ${i + 1} failed:`, err.message);
            }
        }

        const nav = await getChapterNavigation(slug, chapterSlug);
        let navText = `> ✅ *ITACHI & JOKER: "تم إرسال ${imagesToSend.length} صفحة بنجاح!"*\n> ⏱️ *الوقت المستغرق:* ${((Date.now() - startTime) / 1000).toFixed(1)} ثانية\n`;

        if (nav.prev) {
            navText += `> ⬅️ *الفصل السابق:* .فصل_توك ${slug}/${nav.prev.slug}\n`;
        }
        if (nav.next) {
            navText += `> ➡️ *الفصل التالي:* .فصل_توك ${slug}/${nav.next.slug}\n`;
        }

        await m.reply(navText);
        await react('✅');
    } catch (error) {
        console.error('[ITACHI-MANHWA] Chapter error:', error);
        await react('❌');
        await m.reply(`> 👑 *ITACHI & JOKER: "خطأ"*\n> \n> 🔮 ${error.message}`);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📦 تحميل الفصل كاملاً كملف ZIP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function downloadFullChapter(conn, m, slug, chapterSlug) {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }); } catch {}
    };

    await react('⏳');
    await m.reply('> 👑 *ITACHI & JOKER: "جاري تجهيز الأرشيف السيبراني (ZIP)..."*');

    try {
        const images = await getChapterImages(slug, chapterSlug);
        if (images.length === 0) {
            throw new Error('لم يتم العثور على صور');
        }

        const zip = new JSZip();
        for (let i = 0; i < images.length; i++) {
            try {
                const imgRes = await axios.get(images[i], {
                    responseType: 'arraybuffer',
                    timeout: 30000
                });
                zip.file(`page_${String(i + 1).padStart(3, '0')}.jpg`, imgRes.data);
            } catch (err) {
                console.error(`[ITACHI-MANHWA] Failed to download page ${i + 1}:`, err.message);
            }
        }

        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
        const fileName = `ITACHI_JOKER_${slug}_chapter_${chapterSlug}.zip`;
        const fileSizeMB = (zipBuffer.length / 1024 / 1024).toFixed(2);

        await conn.sendMessage(m.chat, {
            document: zipBuffer,
            mimetype: 'application/zip',
            fileName: fileName,
            caption: `👑 *[ أرشيف الفصل السيبراني ]* 👑\n\n📦 *الفصل:* ${chapterSlug}\n📄 *الصفحات:* ${images.length}\n📁 *الحجم:* ${fileSizeMB} MB\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`
        }, { quoted: m });

        await react('✅');
    } catch (err) {
        console.error('[ITACHI-MANHWA] Download error:', err);
        await react('❌');
        await m.reply(`> 👑 *ITACHI & JOKER: "فشل التحميل"*\n> \n> 🔮 ${err.message}`);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ℹ️ معلومات المانجا
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function mangaInfo(conn, m, slug) {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }); } catch {}
    };

    await react('ℹ️');

    try {
        const url = `https://mangatuk.com/series/${slug}`;
        const { data } = await fetchWithRetry(url);
        const $ = cheerio.load(data);

        const title = $('h1').first().text().trim() || slug;
        const coverImg = $('img').first().attr('src');
        const description = $('p').first().text().trim();
        const chapters = await getChaptersFromSite(slug);

        let infoText = `👑 *[ معلومات المانجا السيبرانية ]* 👑\n\n📚 *${title}*\n\n📝 *الوصف:* ${description.substring(0, 150)}...\n📖 *عدد الفصول:* ${chapters.length}\n\n▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;

        if (coverImg) {
            await conn.sendMessage(m.chat, {
                image: { url: coverImg },
                caption: infoText
            }, { quoted: m });
        } else {
            await m.reply(infoText);
        }

        await react('✅');
    } catch (error) {
        console.error('[ITACHI-MANHWA] Info error:', error);
        await react('❌');
        await m.reply(`> 👑 *ITACHI & JOKER: "خطأ"* \n> 📌 تأكد من صحة الـ slug`);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 الأمر الرئيسي
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
let handler = async (m, { conn, text, command, usedPrefix }) => {
    const react = async (e) => {
        try { await conn.sendMessage(m.chat, { react: { text: e, key: m.key } }); } catch {}
    };

    if (command === 'مانجا' || command === 'مانجا_توك') {
        if (!text) {
            return showPopularManga(conn, m);
        }
        return searchManga(conn, m, text);
    }

    if (command === 'مساعدة' || command === 'help') {
        await react('📚');
        return conn.sendMessage(m.chat, {
            image: { url: DEFAULT_IMAGE },
            caption: `👑 *[ أوامر المانجا السيبرانية - ITACHI & JOKER ]* 👑\n\n` +
                `🔍 *${usedPrefix}مانجا <الاسم> أو ${usedPrefix}مانجا_توك*\n▸ عرض أشهر المانجا أو البحث عن مانجا\n\n` +
                `📖 *${usedPrefix}فصول_توك <slug>*\n▸ عرض فصول المانجا\n\n` +
                `📸 *${usedPrefix}فصل_توك <slug/رقم>*\n▸ عرض صور الفصل\n\n` +
                `📦 *${usedPrefix}تحميل_فصل_توك <slug/رقم>*\n▸ تحميل الفصل كملف ZIP\n\n` +
                `ℹ️ *${usedPrefix}معلومات_توك <slug>*\n▸ معلومات المانجا\n\n` +
                `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`
        }, { quoted: m });
    }

    if (command === 'معلومات_توك' || command === 'info_tok') {
        if (!text) return m.reply(`> 👑 *ITACHI & JOKER: "تنبيه"* \n> ⚠️ *الاستخدام الصحيح:* \n> \`${usedPrefix}معلومات_توك <slug>\``);
        return mangaInfo(conn, m, text);
    }

    if (command === 'فصول_توك') {
        if (!text) return m.reply(`> 👑 *ITACHI & JOKER: "تنبيه"* \n> ⚠️ *الاستخدام الصحيح:* \n> \`${usedPrefix}فصول_توك <slug>\``);
        return showChapters(conn, m, text);
    }

    if (command === 'فصل_توك') {
        const parts = text.split('/');
        const slug = parts[0];
        const chapterNum = parts[1];
        if (!slug || !chapterNum) {
            return m.reply(`> 👑 *ITACHI & JOKER: "تنبيه"* \n> ⚠️ *الاستخدام الصحيح:* \n> \`${usedPrefix}فصل_توك <slug/رقم_الفصل>\``);
        }
        return showChapterPages(conn, m, slug, chapterNum);
    }

    if (command === 'تحميل_فصل_توك' || command === 'zip_tok') {
        const parts = text.split('/');
        const slug = parts[0];
        const chapterNum = parts[1];
        if (!slug || !chapterNum) {
            return m.reply(`> 👑 *ITACHI & JOKER: "تنبيه"* \n> ⚠️ *الاستخدام الصحيح:* \n> \`${usedPrefix}تحميل_فصل_توك <slug/رقم_الفصل>\``);
        }
        return downloadFullChapter(conn, m, slug, chapterNum);
    }
};

handler.command = ['مانجا', 'مانجا_توك', 'فصول_توك', 'فصل_توك', 'تحميل_فصل_توك', 'zip_tok', 'معلومات_توك', 'info_tok', 'مساعدة', 'help'];
handler.tags = ['manhwa'];
handler.help = ['مانجا <اسم>', 'فصول_توك <slug>', 'فصل_توك <slug/رقم>', 'تحميل_فصل_توك <slug/رقم>', 'معلومات_توك <slug>'];

export default handler;
