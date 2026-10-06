/*
⌁ 𝙹𝙾𝙺𝙴𝚁-𝙱𝙾𝚃 ⌁
📜 القسم الإسلامي الشامل (قرآن - آيات - تفسير - أحاديث - أذكار - أدعية)
*/

import { generateWAMessageFromContent, prepareWAMessageMedia, proto } from '@whiskeysockets/baileys'

const UA = 'Mozilla/5.0 (Linux; Android 14; 22120RN86G Build/UP1A.231005.007) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.7778.215 Mobile Safari/537.36'
const BRAND = '🃏 𝙹𝙾𝙺𝙴𝚁-𝙱𝙾𝚃 • القسم الإسلامي الشامل 🕌'
const THUMB_READERS = 'https://i.postimg.cc/BjtDq829/upload-1780907260054.jpg'
const THUMB_SURAHS  = 'https://i.postimg.cc/v1z0pxsK/upload-1780907104073.jpg'

if (!global.quranSessions) global.quranSessions = {}

const DEC = { top: '※⋅ ━━ ╼╃⊰🃏⊱╄╾ ━━ ⋅※', icon: '📖 ' }
const box = (lines) => `${DEC.top}\n${lines.map(l => `${DEC.icon}${l}`).join('\n')}\n${DEC.top}`

const SURAHS = [
  'الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال','التوبة','يونس',
  'هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه',
  'الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص','العنكبوت','الروم',
  'لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر',
  'فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح','الحجرات','ق',
  'الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر','الممتحنة',
  'الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم','الحاقة','المعارج',
  'نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ','النازعات','عبس',
  'التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر','البلد',
  'الشمس','الليل','الضحى','الشرح','التين','العلق','القدر','البينة','الزلزلة','العاديات',
  'القارعة','التكاثر','العصر','الهمزة','الفيل','قريش','الماعون','الكوثر','الكافرون','النصر',
  'المسد','الإخلاص','الفلق','الناس'
]

const READERS_RAW = [
  { name: 'ماهر المعيقلي (المجوّد)', server: 'https://server12.mp3quran.net/maher/Almusshaf-Al-Mojawwad/', surahCount: 114 },
  { name: 'عبدالرحمن السديس', server: 'https://server7.mp3quran.net/sudais/', surahCount: 114 },
  { name: 'مشاري العفاسي', server: 'https://server8.mp3quran.net/afasy/', surahCount: 114 },
  { name: 'إسلام صبحي (عالي الجودة)', server: 'https://server11.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem/', surahCount: 114 },
  { name: 'عبدالباسط عبدالصمد', server: 'https://server7.mp3quran.net/basit/Almusshaf-Al-Mojawwad/', surahCount: 114 },
  { name: 'محمود خليل الحصري', server: 'https://server13.mp3quran.net/husr/Rewayat-Qalon-A-n-Nafi/', surahCount: 114 },
  { name: 'فارس عباد', server: 'https://server6.mp3quran.net/faris/', surahCount: 114 },
  { name: 'سعد الغامدي', server: 'https://server7.mp3quran.net/s_gham/Rewayat-Hafs-A-n-Assem/', surahCount: 114 },
  { name: 'أحمد العجمي', server: 'https://server10.mp3quran.net/ajm/Rewayat-Hafs-A-n-Assem/', surahCount: 114 },
  { name: 'ياسر الدوسري', server: 'https://server11.mp3quran.net/yasser/', surahCount: 114 },
  { name: 'ناصر القطامي', server: 'https://server6.mp3quran.net/qtm/', surahCount: 114 },
  { name: 'إدريس أبكر', server: 'https://server6.mp3quran.net/abkr/', surahCount: 114 }
]

const seen = new Set()
const READERS = READERS_RAW.filter(r => { if (seen.has(r.name)) return false; seen.add(r.name); return true }).sort((a, b) => a.name.localeCompare(b.name, 'ar'))

function getSurahNumber(name) {
  const clean = s => s.replace(/^(سورة\s+|ال)/, '').trim()
  const n = clean(name)
  const idx = SURAHS.findIndex(s => s === name || clean(s) === n || s.includes(n) || n.includes(clean(s)))
  return idx >= 0 ? idx + 1 : null
}

function mp3Url(server, num) {
  return `${server}${String(num).padStart(3, '0')}.mp3`
}

async function downloadMp3(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, 'Referer': 'https://www.mp3quran.net/', 'Accept': '*/*', 'Accept-Encoding': 'identity' }
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

function chunkArray(arr, size) {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}

const HADITHS = [
  { text: "عن أم المؤمنين عائشة رضي الله عنها قالت: قال رسول الله صلى الله عليه وسلم: «من أحدث في أمرنا هذا ما ليس منه فهو رد» (متفق عليه).", source: "صحيح البخاري ومسلم" },
  { text: "عن عمر بن الخطاب رضي الله عنه قال: سمعت رسول الله صلى الله عليه وسلم يقول: «إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى» (متفق عليه).", source: "صحيح البخاري ومسلم" },
  { text: "عن أبي هريرة رضي الله عنه أن رسول الله صلى الله عليه وسلم قال: «كلمتان حبيبتان إلى الرحمن، خفيفستان على اللسان، ثقيلتان في الميزان: سبحان الله وبحمده، سبحان الله العظيم» (رواه البخاري ومسلم).", source: "صحيح البخاري ومسلم" },
  { text: "عن أبي هريرة رضي الله عنه قال: قال رسول الله صلى الله عليه وسلم: «من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت» (رواه البخاري ومسلم).", source: "صحيح البخاري ومسلم" },
  { text: "عن عبدالله بن مسعود رضي الله عنه قال: سألت النبي صلى الله عليه وسلم: أي العمل أحب إلى الله؟ قال: «الصلاة على وقتها» قلت: ثم أي؟ قال: «بر الوالدين» (رواه البخاري ومسلم).", source: "صحيح البخاري ومسلم" }
];

const ADHKAR = [
  "«سبحان الله وبحمده، سبحان الله العظيم» (تعدل في الميزان أثقل الكلام، وتغفر الذنوب ولو كانت مثل زبد البحر).",
  "«لا إله إلا الله وحدَهُ لا شريكَ له، له الملكُ وله الحمدُ وهو على كل شيء قدير» (من قالها مائة مرة في يوم كانت له عدل عشر رقاب...).",
  "«سُبْحَانَ اللهِ، وَالحَمْدُ لِلَّهِ، وَلاَ إِلَهَ إِلاَّ اللهُ، وَاللَّهُ أَكْبَرُ» (أحب الكلام إلى الله تعالى).",
  "«أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه» (تغفر الذنوب وإن كان زاحفاً من الزحف).",
  "«اللهم صل وسلم على نبينا محمد» (من صلى علي صلاة صلى الله عليه بها عشراً)."
];

// قائمة الأدعية العشوائية المتنوعة والمستجابة
const DUAS = [
  "«رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِمَنْ دَخَلَ بَيْتِيَ مُؤْمِناً وَلِلْمُؤْمِنِينَ وَالمُؤْمِنَاتِ»",
  "«رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي»",
  "«اللهم إني أسئلك العفو والعافية في الدنيا والآخرة، اللهم إني أسألك العفو والعافية في ديني ودنياي وأهلي ومالي»",
  "«رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ»",
  "«اللهم إني أعوذ بك من العجز والكسل والجبن والبخل والهرم وعذاب القبر»",
  "«يَا مُقَلِّبَ القُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ»",
  "«اللهم اكفني بحلالك عن حرامك، وأغنني بفضلك عمن سواك»",
  "«رَبَّنَا لا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الوهاب»"
];

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const react = async (emoji) => {
    try { await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } }) } catch {}
  }

  const query = (text || '').trim()
  const cmd = command.toLowerCase()

  try {
    // 1. أمر الآيات (.ايه) مع التفسير المباشر
    if (cmd === 'ايه' || cmd === 'آية') {
      await react("📖")
      const randomAyahNum = Math.floor(Math.random() * 6236) + 1;
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${randomAyahNum}/editions/quran-uthmani,ar.jalalayn`);
      const data = await res.json();
      if (!data || !data.data) throw new Error("فشل جلب الآية");
      
      const ayahUthmani = data.data[0];
      const ayahTafseer = data.data[1];
      
      const msgText = `🃏 *[ 𝙹𝙾𝙺𝙴𝚁-𝙱𝙾𝚃 : آية وتفسير ]* 🃏\n\n` +
                      `✨ *الآية الكريمة:*\n${ayahUthmani.text}\n\n` +
                      `📖 *السورة:* سورة ${ayahUthmani.surah.name} (آية رقم: ${ayahUthmani.numberInSurah})\n` +
                      `🕋 *الجزء:* ${ayahUthmani.juz} | *الصفحة:* ${ayahUthmani.page}\n\n` +
                      `💡 *التفسير الميسر / الجلالين:*\n${ayahTafseer.text}\n\n` +
                      `> _ألا بذكر الله تطمئن القلوب_`;
      return m.reply(msgText);
    }

    // 2. أمر التفسير المخصص (.تفسير)
    if (cmd === 'تفسير') {
      if (!query) {
        return m.reply(box([
          'يرجى كتابة رقم السورة ورقم الآية أو البحث.',
          `مثال: \`${usedPrefix}تفسير 2 255\` (آية الكرسي)`
        ]));
      }

      await react("🔍")
      const parts = query.split(/[\s-]+/).map(s => parseInt(s.trim()));
      
      let apiUrl = '';
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        // البحث برقم السورة ورقم الآية
        apiUrl = `https://api.alquran.cloud/v1/ayah/${parts[0]}:${parts[1]}/editions/quran-uthmani,ar.jalalayn`;
      } else {
        // عشوائي أو نصي
        apiUrl = `https://api.alquran.cloud/v1/ayah/2:255/editions/quran-uthmani,ar.jalalayn`;
      }

      const res = await fetch(apiUrl);
      const data = await res.json();
      if (!data || !data.data) throw new Error("تعذر جلب التفسير، تأكد من أرقام السورة والآية.");

      const ayahUthmani = data.data[0];
      const ayahTafseer = data.data[1];

      const msgText = `🃏 *[ 𝙹𝙾𝙺𝙴𝚁-𝙱𝙾𝚃 : تفسير القرآن الكريم ]* 🃏\n\n` +
                      `📌 *الآية:* ${ayahUthmani.text} [${ayahUthmani.surah.name}: ${ayahUthmani.numberInSurah}]\n\n` +
                      `📖 *التفسير الصحيح المعتمد:*\n${ayahTafseer.text}\n\n` +
                      `> 🖤 _حقوق النشر محفوظة لجوكر-بوت_`;
      return m.reply(msgText);
    }

    // 3. أمر الدعاء المستجاب (.دعاء)
    if (cmd === 'دعاء') {
      await react("🤲")
      const randomDua = DUAS[Math.floor(Math.random() * DUAS.length)];
      const msgText = `🃏 *[ 𝙹𝙾𝙺𝙴𝚁-𝙱𝙾𝚃 : دعاء مبارك ]* 🃏\n\n` +
                      `🤲 ${randomDua}\n\n` +
                      `> _اللهم استجب لنا ولكل من قال آمين 🤍_`;
      return m.reply(msgText);
    }

    // 4. أمر الأحاديث (.حديث)
    if (cmd === 'حديث') {
      await react("📜")
      const randomHadith = HADITHS[Math.floor(Math.random() * HADITHS.length)];
      
      const msgText = `🃏 *[ 𝙹𝙾𝙺𝙴𝚁-𝙱𝙾𝚃 : حديث شريف ]* 🃏\n\n` +
                      `⚡ *الحديث:* ${randomHadith.text}\n` +
                      `📚 *المصدر:* ${randomHadith.source}\n\n` +
                      `> _صلّوا على الحبيب المصطفى ﷺ_`;
      return m.reply(msgText);
    }

    // 5. أمر الأذكار (.ذكر)
    if (cmd === 'ذكر' || cmd === 'اذكار') {
      await react("📿")
      const randomAdhkr = ADHKAR[Math.floor(Math.random() * ADHKAR.length)];
      const msgText = `🃏 *[ 𝙹𝙾𝙺𝙴𝚁-𝙱𝙾𝚃 : ذكر مبارك ]* 🃏\n\n` +
                      `🌿 ${randomAdhkr}\n\n` +
                      `> _داوم عليها ليزداد قلبك طمأنينة._`;
      return m.reply(msgText);
    }

    // 6. تشغيل وتنزيل سور القرآن الكريم (.قرآن)
    if (query.includes('|') || query.includes('-')) {
      const parts = query.split(/[|-]/).map(s => s.trim())
      const reader = READERS.find(r => r.name.includes(parts[0]) || parts[0].includes(r.name))
      const surahNum = getSurahNumber(parts[1])

      if (!reader || !surahNum) {
        await react("⚠️")
        return m.reply(box(['لم يتم العثور على القارئ أو السورة المطلوبة.', 'تأكد من الأسماء وحاول مجدداً.']))
      }

      await react("⏳")
      const url = mp3Url(reader.server, surahNum)
      const buffer = await downloadMp3(url)

      await conn.sendMessage(m.chat, {
        audio: buffer,
        mimetype: 'audio/mp4',
        ptt: false,
        fileName: `${SURAHS[surahNum - 1]} - ${reader.name}.mp3`
      }, { quoted: m })

      await react("✅")
      return
    }

    // القائمة التفاعلية لاختيار القراء والسور
    await react("🕌")
    const readerChunks = chunkArray(READERS, 20)
    const sections = readerChunks.map((chunk, i) => ({
      title: `قائمة القراء - الجزء (${i + 1}/${readerChunks.length})`,
      rows: chunk.map(r => ({
        header: r.name,
        title: `مكتبة الصوتيات الكاملة`,
        id: `${usedPrefix + command} ${r.name}`
      }))
    }))

    if (query) {
      const matchedReader = READERS.find(r => r.name.toLowerCase().includes(query.toLowerCase()))
      if (matchedReader) {
        global.quranSessions[m.sender] = { step: 'SELECT_SURAH', reader: matchedReader }

        const surahRows = SURAHS.slice(0, matchedReader.surahCount).map((s, idx) => ({
          header: `سورة ${s}`,
          title: `رقم السورة: ${idx + 1}`,
          id: `${usedPrefix + command} ${matchedReader.name} | ${s}`
        }))

        const surahChunks = chunkArray(surahRows, 20)
        const surahSections = surahChunks.map((chunk, i) => ({
          title: `اختر السورة (${i + 1}/${surahChunks.length})`,
          rows: chunk
        }))

        const media = await prepareWAMessageMedia({ image: { url: THUMB_SURAHS } }, { upload: conn.waUploadToServer })
        const msg = generateWAMessageFromContent(m.chat, {
          viewOnceMessage: {
            message: {
              interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                header: proto.Message.InteractiveMessage.Header.create({ title: `القارئ: ${matchedReader.name}`, hasMediaAttachment: true, imageMessage: media.imageMessage }),
                body: proto.Message.InteractiveMessage.Body.create({ text: `اختر السورة المطلوبة من القائمة أدناه بجودة عالية جداً:` }),
                footer: proto.Message.InteractiveMessage.Footer.create({ text: BRAND }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                  buttons: [{ name: 'single_select', buttonParamsJson: JSON.stringify({ title: 'قائمة السور', sections: surahSections }) }]
                })
              })
            }
          }
        }, { quoted: m })
        return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
      }
    }

    const media = await prepareWAMessageMedia({ image: { url: THUMB_READERS } }, { upload: conn.waUploadToServer })
    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            header: proto.Message.InteractiveMessage.Header.create({ title: 'القرآن الكريم 🕌', hasMediaAttachment: true, imageMessage: media.imageMessage }),
            body: proto.Message.InteractiveMessage.Body.create({ text: `مرحباً بك في القسم الإسلامي بـ جوكر-بوت.\nاختر القارئ المطلوب للاستماع بأعلى جودة صوتية متاح:` }),
            footer: proto.Message.InteractiveMessage.Footer.create({ text: BRAND }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [{ name: 'single_select', buttonParamsJson: JSON.stringify({ title: 'اختر القارئ', sections }) }]
            })
          })
        }
      }
    }, { quoted: m })
    return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (err) {
    await react("❌")
    return m.reply(box(['حدث خطأ أثناء تنفيذ الطلب.', `السبب: ${(err?.message || err).slice(0, 100)}`]))
  }
}

handler.help = ['قرآن', 'قران', 'ايه', 'تفسير', 'دعاء', 'حديث', 'ذكر']
handler.tags = ['islamic']
handler.command = /^(قرآن|قران|quran|ايه|آية|تفسير|دعاء|حديث|ذكر|اذكار)$/i

export default handler
