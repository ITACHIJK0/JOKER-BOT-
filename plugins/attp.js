// plugins/attp.js
// ✧ THE JOKER & ITACHI - Animated Text Sticker 🎨

import { spawn } from 'child_process'
import { writeFileSync, unlinkSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import webp from 'node-webpmux'
import crypto from 'crypto'
import { theme } from '../core/theme.js'

function escapeText(s) {
    return s
        .replace(/\\/g, '\\\\')
        .replace(/:/g, '\\:')
        .replace(/'/g, "\\'")
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/%/g, '\\%')
        .replace(/,/g, '\\,')
}

function renderBlinkingVideo(text) {
    return new Promise((resolve, reject) => {
        const fontPath = process.platform === 'win32'
            ? 'C:/Windows/Fonts/arialbd.ttf'
            : '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

        // تنظيف وتقسيم النص لأسطر متعددة (تحت بعضها) لتجنب الخروج عن حدود الملصق
        const lines = text.split('\n').map(l => escapeText(l.trim())).filter(Boolean)
        const totalLines = lines.length || 1

        // تصغير حجم الخط تلقائياً كلما زادت عدد السطور أو الطول لضمان احتواء النص بالكامل
        const maxLen = Math.max(...lines.map(l => l.length), 1)
        let fontSize = 52
        if (maxLen > 10 || totalLines > 2) fontSize = 38
        if (maxLen > 18 || totalLines > 4) fontSize = 28

        const lineHeight = fontSize + 10
        const totalBlockHeight = totalLines * lineHeight
        const startY = `(h-${totalBlockHeight})/2`

        const cycle = 0.3
        const dur = 1.8

        // بناء مرشحات الفلتر لكل سطر ليظهر تحت الآخر مع تأثير التبديل اللوني
        let drawRedFilters = []
        let drawBlueFilters = []
        let drawGreenFilters = []

        lines.forEach((line, index) => {
            const currentY = `${startY}+(${index}*${lineHeight})`
            drawRedFilters.push(`drawtext=fontfile='${fontPath}':text='${line}':fontcolor=red:borderw=2:bordercolor=black@0.8:fontsize=${fontSize}:x=(w-text_w)/2:y=${currentY}:enable='lt(mod(t\\,${cycle})\\,0.1)'`)
            drawBlueFilters.push(`drawtext=fontfile='${fontPath}':text='${line}':fontcolor=blue:borderw=2:bordercolor=black@0.8:fontsize=${fontSize}:x=(w-text_w)/2:y=${currentY}:enable='between(mod(t\\,${cycle})\\,0.1\\,0.2)'`)
            drawGreenFilters.push(`drawtext=fontfile='${fontPath}':text='${line}':fontcolor=green:borderw=2:bordercolor=black@0.8:fontsize=${fontSize}:x=(w-text_w)/2:y=${currentY}:enable='gte(mod(t\\,${cycle})\\,0.2)'`)
        })

        const filter = [...drawRedFilters, ...drawBlueFilters, ...drawGreenFilters].join(',')

        const args = [
            '-y', '-f', 'lavfi',
            '-i', `color=c=black@0.0:s=512x512:d=${dur}:r=20`,
            '-vf', filter,
            '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart+frag_keyframe+empty_moov',
            '-t', String(dur), '-f', 'mp4', 'pipe:1'
        ]

        const ff = spawn('ffmpeg', args)
        const chunks = []
        const errors = []
        ff.stdout.on('data', d => chunks.push(d))
        ff.stderr.on('data', e => errors.push(e))
        ff.on('error', reject)
        ff.on('close', code => {
            if (code === 0) return resolve(Buffer.concat(chunks))
            reject(new Error(Buffer.concat(errors).toString() || `ffmpeg exited with code ${code}`))
        })
    })
}

async function mp4ToWebpSticker(mp4Buffer) {
    const tmpDir = join(process.cwd(), 'tmp')
    if (!existsSync(tmpDir)) {
        const { mkdirSync } = await import('fs')
        mkdirSync(tmpDir, { recursive: true })
    }

    const inputPath = join(tmpDir, `attp_${Date.now()}.mp4`)
    const outputPath = join(tmpDir, `attp_${Date.now()}.webp`)
    
    writeFileSync(inputPath, mp4Buffer)

    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)
    
    const ffmpegCmd = `ffmpeg -y -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=15" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 80 -compression_level 6 "${outputPath}"`
    await execAsync(ffmpegCmd)

    let webpBuffer = readFileSync(outputPath)
    
    // إضافة metadata الثيم الخاص بالبوت بشكل صحيح وآمن
    const img = new webp.Image()
    await img.load(webpBuffer)
    const json = {
        'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
        'sticker-pack-name': '🃏 𝐉𝐎𝐊𝐄𝐑 & 𝐈𝐓𝐀𝐂𝐇𝐈 ♞',
        'sticker-pack-publisher': '👑 𝐈𝐭𝐚𝐜𝐡𝐢',
        'emojis': ['🃏', '🔥']
    }
    const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
    const exif = Buffer.concat([exifAttr, jsonBuffer])
    exif.writeUIntLE(jsonBuffer.length, 14, 4)
    img.exif = exif

    const finalBuffer = await img.save(null)

    try { unlinkSync(inputPath) } catch {}
    try { unlinkSync(outputPath) } catch {}

    return finalBuffer
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '🎨 مـلـصـق نـصـي مـتـحـرك' },
                { type: 'divider' },
                { type: 'line', text: '🃏 *صمم ملصقاتك المتحركة الفخمة*' },
                { type: 'spacer' },
                { type: 'info', label: '⚡ الاستخدام', value: `${usedPrefix + command} <نص>` },
                { type: 'spacer' },
                { type: 'info', label: '📌 مثال', value: `${usedPrefix + command} الجوكر\nإيتاشي` }
            ])
        }, { quoted: m })
    }

    await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } })
    let statusMsg = await m.reply('🃏 *الجوكر وإيتاشي ينشئان الملصق...* ⏳')
    
    try {
        const mp4Buffer = await renderBlinkingVideo(text)
        const stickerBuffer = await mp4ToWebpSticker(mp4Buffer)

        try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}

        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
        console.error('[Joker-ATTp]', e)
        try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        m.reply(`❌ *الجوكر: "فشل إنشاء الملصق"*\n\n${e.message?.substring(0, 200)}`)
    }
}

handler.help = ['attp <نص>']
handler.tags = ['sticker']
handler.command = ['attp', 'نص_متحرك']

export default handler;
