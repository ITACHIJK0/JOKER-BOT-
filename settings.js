// settings.js
// ✧ 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ - Configuration ✧                                     

import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'                                   

// حط lid بتاعك من امر lid
global.owner = ['14904274759837', '249916221538', '212408480080003']                      

// ========== المطورين ==========
global.mods = []
global.prems = []                                                      

// ========== إعدادات البوت ==========
global.baileys = '@whiskeysockets/baileys'
global.botName = '𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ'
global.botNameShort = '𝉉𝐊ᜰ'
global.watermark = '𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ'                                       

// ========== المكتبات العامة ==========
global.fetch = fetch
global.axios = axios
global.moment = moment
global.fs = fs                                                         

// ========== إعدادات البوت ==========
global.packname = '𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ'
global.author = '𝐈𝐭𝐚𝐜𝐡𝐢♞'

global.multiplier = 85                                                 

// اكتب رقمك هنا الي عايز تربط بي البوت من دون + او فواصل
global.botNumberCode = "212694571335"

// ========== القنوات ==========
global.ch = {                                                          
    ch1: '120363429074575231@newsletter',                              
    ch2: '120363429074575231@newsletter'                               
}                                                                      

// روابط السوشيال ميديا
global.yt = 'https://youtube.com/@youssf-f8i?si=WUZBmyryEpziKX'
global.ig = 'https://www.instagram.com/go24.q?igsh=MWdoYWtjZWQ=='
global.md = 'https://github.com/PROTOTYPPE-MD'
global.fb = 'https://www.facebook.com/grtotype'
global.tk = 'https://www.tiktok.com/@5trua5?_r=1&_t=ZS-97C5LgOJgX6'
global.paypal = 'https://paypal.me/Prototype'
global.soporteGB = 'https://whatsapp.com/channel/0029Vb8iiA24tRrvy4FB0H0A'

// صور المعاينة المصغرة الموحدة
global.dfailPool = [                                                   
    'https://i.postimg.cc/QM4HqfsB/709d2a215ad4bd49f895cec71e75cea8.jpg',
    'https://i.postimg.cc/5t0tj8vV/4bef05c19e42caec7cb9a22fbb2a74c3.jpg',
    'https://i.postimg.cc/4Nknw7Cz/9a46ea80051d1db74c2675c300a7014e.jpg',                                                              
    'https://i.postimg.cc/4ytysZcY/11cdb4188006b9117ea85c5cc5ab911f.jpg',                                                              
    'https://i.postimg.cc/5t0tj8vV/4bef05c19e42caec7cb9a22fbb2a74c3.jpg',                                                              
    'https://i.postimg.cc/4Nknw7Cz/9a46ea80051d1db74c2675c300a7014e.jpg',                                                              
    'https://i.postimg.cc/4ytysZcY/11cdb4188006b9117ea85c5cc5ab911f.jpg',                                                              
    'https://i.postimg.cc/QM4HqfsB/709d2a215ad4bd49f895cec71e75cea8.jpg',                                                              
    'https://i.postimg.cc/5t0tj8vV/4bef05c19e42caec7cb9a22fbb2a74c3.jpg'
]

// رسائل الحالة المبسطة
global.dfailMessages = {                                               
    rowner: '🚫 *هذا الأمر لمطوري إتاتشي فقط*',
    owner: '🚫 *هذا الأمر لمطوري إتاتشي فقط*',                         
    mods: '☠️ *هذا الأمر للمشرفين فقط*',
    premium: '⭐ *هذا الأمر للمشتركين فقط*',                           
    group: '👥 *هذا الأمر للجروبات فقط*',                              
    private: '📱 *هذا الأمر يعمل في الخاص فقط*',                       
    admin: '👑 *هذا الأمر للأدمنز فقط*',
    botAdmin: '🤖 *يجب أن أكون أدمن لتنفيذ هذا الأمر*',                
    unreg: '📝 *يرجى التسجيل لاستخدام البوت*',                         
    restrict: '⚠️ *هذا الأمر معطل حالياً*'
}

// إعدادات المعاينة البصرية الموحدة للقناة والزر
global.dfailTitle = '𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ'                                      
global.dfailDesc = 'اضغط للانضمام إلى القناة الرسمية'
global.dfailUrl = 'https://whatsapp.com/channel/0029Vb8iiA24tRrvy4FB0H0A'                                                                     

// مراقبة التحديثات للملف
let file = fileURLToPath(import.meta.url)
watchFile(file, () => {                                                
    unwatchFile(file)                                                  
    console.log(chalk.redBright("Update 'settings.js'"))
    import(`${file}?update=${Date.now()}`)                             
})
