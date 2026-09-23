/*
⌁ 𝙹𝙾𝙺𝙴𝚁-𝙱𝙾𝚃 ⌁
🛠️ نظام فحص وإدارة البلوجنات
*/

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const handler = async (m, { conn, usedPrefix, command }) => {
  const pluginDir = './plugins';
  
  if (!fs.existsSync(pluginDir)) {
    return m.reply('❌ مجلد البلوجنات (`plugins`) غير موجود!');
  }

  const files = fs.readdirSync(pluginDir).filter(file => file.endsWith('.js'));

  if (files.length === 0) {
    return m.reply('🌌 *[𝙹𝙾𝙺𝙴𝚁-𝙱𝙾𝚃]* لا توجد أي بلوجنات متاحة للفحص.');
  }

  await m.reply(`🃏 *[ 𝙹𝙾𝙺𝙴𝚁-𝙱𝙾𝚃 : فحص البلوجنات ]* \n\n🛰️ جاري فحص وتحميل (${files.length}) بلوجن...\n`);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    const fullPath = path.join(pluginDir, file);
    try {
      // استخدام معامل عشوائي أو مسار مطلق لتحديث الكاش الخاص بـ import لمنع استجابة الذاكرة المؤقتة القديمة
      const pluginUrl = `file://${path.resolve(fullPath)}?update=${Date.now()}`;
      const plugin = await import(pluginUrl);

      if (plugin?.default?.handler) {
        successCount++;
        console.log(chalk.green(`[✓] تم فحص وتشغيل البلوجن: ${file}`));
      } else {
        skippedCount++;
        console.log(chalk.yellow(`[!] تم تخطي البلوجن (لا يوجد handler): ${file}`));
      }
    } catch (e) {
      errorCount++;
      console.error(chalk.red(`[✗] خطأ في البلوجن ${file}:`), e.message);
    }
  }

  // رسالة التقرير النهائي بالثيم الجديد
  const reportText = `
🃏 *[ تقرير فحص جوكر-بوت ]* 🃏
━━━━━━━━━━━━━━━━━━━
🟢 *تم بنجاح:* ${successCount}
🟡 *تم تخطيها:* ${skippedCount}
🔴 *أخطاء:* ${errorCount}
📂 *الإجمالي الكلي:* ${files.length} بلوجن
━━━━━━━━━━━━━━━━━━━
⚡ *حالة النظام:* مستقر وجاهز للعمل!
  `.trim();

  await m.reply(reportText);
};

handler.help = ['افحصهم', 'checkplugins'];
handler.command = ['افحصهم', 'فحص'];
handler.tags = ['owner'];

export default handler;
