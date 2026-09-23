/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪᴛ𝙰𝙲𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 」
「 لا تحذف الحقوق 🖤 」
*/

import { exec } from 'child_process'
import fs from 'fs'
import util from 'util'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { theme } from '../core/theme.js'

const execAsync = util.promisify(exec)

const handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        const from = m.chat
        const opt = (args?.[0] || '').toLowerCase()

        const styles = {
            circle: 'قص دائري',
            crop: 'قص مركزي 512x512',
            bw: 'أبيض وأسود',
            invert: 'عكس الألوان',
            blur: 'تمويه',
            pixel: 'تكسّر البكسل',
            sepia: 'تأثير سيبيا',
            neon: 'حواف نيون'
        }

        const listContent = [
            { type: 'title', text: '🎨 أنماط الملصقات الاحترافية' },
            { type: 'divider' },
            ...Object.entries(styles).map(([key, value]) => ({
                type: 'line',
                text: `${usedPrefix + command} ${key} ── ${value}`
            })),
            { type: 'divider' },
            { type: 'info', label: 'للعرض السريع', value: `${usedPrefix + command} list` }
        ]

        if (opt === 'list') {
            return await conn.sendMessage(
                from,
                { text: theme.build(listContent) },
                { quoted: m }
            )
        }

        const ctx = m?.message?.extendedTextMessage?.contextInfo
        const quotedMsg = ctx?.quotedMessage?.message || ctx?.quotedMessage || null

        const imageMessage = m?.message?.imageMessage || quotedMsg?.imageMessage || null
        const videoMessage = m?.message?.videoMessage || quotedMsg?.videoMessage || null
        const isImage = Boolean(imageMessage)
        const isVideo = Boolean(videoMessage)

        if (!isImage && !isVideo) {
            const helpContent = [
                { type: 'title', text: '🖼️ صانع الملصقات - JOKER' },
                { type: 'divider' },
                { type: 'line', text: 'قم بالرد على صورة أو فيديو لتمرير السحر.' },
                { type: 'info', label: 'مثال', value: `${usedPrefix + command} circle` },
                { type: 'info', label: 'القائمة', value: `${usedPrefix + command} list` }
            ]
            return await conn.sendMessage(
                from,
                { text: theme.build(helpContent) },
                { quoted: m }
            )
        }

        if (opt && !styles[opt]) {
            return await conn.sendMessage(
                from,
                { text: theme.error(`النمط *${opt}* غير موجود.\n\nاستخدم ${usedPrefix + command} list لمعرفة الأنماط المتاحة.`) },
                { quoted: m }
            )
        }

        const msg = isImage ? imageMessage : videoMessage
        const dlType = isImage ? 'image' : 'video'

        const stream = await downloadContentFromMessage(msg, dlType)
        const chunks = []

        for await (const chunk of stream) {
            chunks.push(chunk)
        }

        const buffer = Buffer.concat(chunks)

        if (!buffer.length) {
            throw new Error('تعذر تحميل الوسائط.')
        }

        const tmpDir = './tmp'
        await fs.promises.mkdir(tmpDir, { recursive: true })

        const ts = Date.now()
        const input = `${tmpDir}/joker_${ts}.${isImage ? 'jpg' : 'mp4'}`
        const output = `${tmpDir}/joker_${ts}.webp`

        await fs.promises.writeFile(input, buffer)

        const style = opt || 'circle'

        const baseContain =
            'fps=15,' +
            'scale=512:512:force_original_aspect_ratio=decrease,' +
            'pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0'

        const baseCoverCrop =
            'fps=15,' +
            'scale=512:512:force_original_aspect_ratio=increase,' +
            'crop=512:512'

        const geqCircle =
            "geq=lum='p(X,Y)':a='if(lte(hypot(X-256,Y-256),256),255,0)'"

        const vf =
            style === 'circle'
                ? `${baseCoverCrop},format=rgba,${geqCircle}`
            : style === 'crop'
                ? baseCoverCrop
            : style === 'bw'
                ? `${baseContain},hue=s=0`
            : style === 'invert'
                ? `${baseContain},negate`
            : style === 'blur'
                ? `${baseContain},gblur=sigma=6`
            : style === 'pixel'
                ? `${baseContain},scale=128:128:flags=neighbor,scale=512:512:flags=neighbor`
            : style === 'sepia'
                ? `${baseContain},colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131`
            : style === 'neon'
                ? `${baseContain},edgedetect=low=0.08:high=0.2`
            : `${baseCoverCrop},format=rgba,${geqCircle}`

        const ffmpegCmd = isVideo
            ? `ffmpeg -y -i "${input}" -t 8 -an -vf "${vf}" -loop 0 -fps_mode passthrough "${output}"`
            : `ffmpeg -y -i "${input}" -an -vf "${vf}" -loop 0 -fps_mode passthrough "${output}"`

        await m.react('⏳')

        try {
            await execAsync(ffmpegCmd)

            const sticker = await fs.promises.readFile(output)

            if (!sticker.length) {
                throw new Error('ملف الملصق الناتج فارغ.')
            }

            await conn.sendMessage(from, { sticker }, { quoted: m })
            await m.react('✅')

        } catch (error) {
            await m.react('❌')

            const err = (
                error?.stderr ||
                error?.stdout ||
                error?.message ||
                String(error)
            ).toString()

            console.error('Joker Sticker Error:', err)

            await conn.sendMessage(
                from,
                { text: theme.error(`تعذر إنشاء الملصق.\n\n*النمط:* ${style}\n*الخطأ:* ${err.slice(0, 500)}`) },
                { quoted: m }
            )
        } finally {
            try {
                if (fs.existsSync(input)) await fs.promises.unlink(input)
                if (fs.existsSync(output)) await fs.promises.unlink(output)
            } catch {}
        }

    } catch (error) {
        console.error('Joker Sticker Handler Error:', error)
        await m.react('❌')
        return conn.reply(m.chat, theme.error(`تعذر إكمال العملية\n\n${error?.message || 'حدث خطأ غير معروف'}`), m)
    }
}

handler.help = ['ملصق [النمط]']
handler.tags = ['sticker']
handler.command = ['لملصق', 's', 'ملصق']

export default handler
