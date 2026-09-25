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
    'https://file.garden/aauvg01sjleV_ic1/1199e9965d7836cf5f5ff6ab0463e451.jpg',
    'https://file.garden/aauvg01sjleV_ic1/7b0ed3c48e859d22e73b62093148b22b.jpg',
    'https://file.garden/aauvg01sjleV_ic1/6c936c420d5d23007ac874f498219280.jpg',                                                              
    'https://file.garden/aauvg01sjleV_ic1/9e5af83aa668643f0bbef190f4786686.jpg',                                                              
    'https://file.garden/aauvg01sjleV_ic1/9b893fe97b907333aa4e7e285e424768.jpg',                                                              
    'https://file.garden/aauvg01sjleV_ic1/180da285198e9226b2eb8adec0e670b1.jpg',                                                              
    'https://file.garden/aauvg01sjleV_ic1/0bc2d63e8467867b9a56a31ce1077b10.jpg',                                                              
    'https://file.garden/aauvg01sjleV_ic1/ecca80ffa8c0081f4f117a28f3c5b009.jpg',                                                              
    'https://file.garden/aauvg01sjleV_ic1/c5384b18150e07c58ca969282dafcfb2.jpg'
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
