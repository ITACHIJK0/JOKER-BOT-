/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪᴛᴀᴄʜᵢ

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 」
「 لا تحذف الحقوق 🖤 」
*/

import axios from 'axios';
import { theme } from '../core/theme.js';

const API_BASE = 'https://engez.a7a.online/api/v1';

async function generateVideo(prompt, aiSound = false) {
    try {
        const params = new URLSearchParams();
        params.append('prompt', prompt);
        if (aiSound) params.append('aiSound', 'true');

        const response = await axios.get(`${API_BASE}/ai/video-gen?${params.toString()}`, {
            timeout: 300000
        });
        if (!response.data?.success) throw new Error(response.data?.error || 'فشل توليد الفيديو');
        return response.data.response;
    } catch (error) {
        throw new Error(error.message || 'فشل الاتصال بـ API التوليد');
    }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        const helpText = theme.build([
            { type: 'title', text: 'توليد فيديو بالذكاء الاصطناعي' },
            { type: 'line', text: `طريقة الاستخدام: ${usedPrefix}${command} <وصف الفيديو>` },
            { type: 'line', text: `بدون صوت: ${usedPrefix}${command} -صوت <وصف الفيديو>` },
            { type: 'spacer' },
            { type: 'line', text: `مثال: ${usedPrefix}${command} قط يرقص` },
            { type: 'line', text: `مثال: ${usedPrefix}${command} -صوت رجل يركض` }
        ]);
        return conn.reply(m.chat, helpText, m);
    }

    await m.react('⏳');

    try {
        let prompt = text;
        let aiSound = true;

        if (prompt.includes('-صوت') || prompt.includes('-noaudio')) {
            aiSound = false;
            prompt = prompt.replace(/-صوت|-noaudio/g, '').trim();
        }

        const result = await generateVideo(prompt, aiSound);

        if (!result?.url) throw new Error('لم يتم العثور على رابط الفيديو');

        const interactivePayload = {
            response_id: `ai-video-${Date.now()}`,
            sections: [
                {
                    view_model: {
                        primitive: {
                            text: `🎬 **AI Video Generated**\n📝 **الوصف:** ${prompt}\n🔊 **الصوت:** ${aiSound ? 'مفعل' : 'معطل'}`,
                            __typename: "GenAIMarkdownTextUXPrimitive"
                        },
                        __typename: "GenAISingleLayoutViewModel"
                    }
                },
                {
                    view_model: {
                        primitive: {
                            media: {
                                url: result.url,
                                mime_type: "video/mp4",
                                duration: 10
                            },
                            imagine_type: "ANIMATE",
                            status: { status: "READY" },
                            __typename: "GenAIImaginePrimitive"
                        },
                        __typename: "GenAISingleLayoutViewModel"
                    }
                },
                {
                    view_model: {
                        primitives: [
                            { prompt_text: "⚡ITACHI", prompt_type: "SUGGESTED_PROMPT", __typename: "GenAIFollowUpSuggestionPillPrimitive" },
                            { prompt_text: "🎬 إعادة التوليد", prompt_type: "SUGGESTED_PROMPT", __typename: "GenAIFollowUpSuggestionPillPrimitive" },
                            { prompt_text: "👑 JOKER BOT", prompt_type: "SUGGESTED_PROMPT", __typename: "GenAIFollowUpSuggestionPillPrimitive" }
                        ],
                        __typename: "GenAIActionRowLayoutViewModel"
                    }
                },
                {
                    view_model: {
                        primitive: { text: "⚡ DEVELOPED BY ITACHI", __typename: "GenAIMetadataTextPrimitive" },
                        __typename: "GenAISingleLayoutViewModel"
                    }
                }
            ]
        };

        await conn.relayMessage(m.chat, {
            messageContextInfo: {
                threadId: [],
                deviceListMetadata: { senderKeyIndexes: [], recipientKeyIndexes: [] },
                deviceListMetadataVersion: 2,
                botMetadata: { messageDisclaimerText: "", richResponseSourcesMetadata: { sources: [] } }
            },
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        submessages: [
                            { messageType: 2, messageText: `Prompt: ${prompt}` },
                            { messageType: 2, messageText: `Audio: ${aiSound ? 'ON' : 'OFF'}` }
                        ],
                        messageType: 1,
                        unifiedResponse: {
                            data: Buffer.from(JSON.stringify(interactivePayload)).toString('base64')
                        },
                        contextInfo: {
                            mentionedJid: [],
                            groupMentions: [],
                            statusAttributions: [],
                            stanzaId: m.id,
                            participant: m.sender,
                            remoteJid: m.chat,
                            forwardingSlib: 1,
                            isForwarded: true,
                            forwardedAiBotMessageInfo: { botJid: "0@bot" },
                            forwardOrigin: 4
                        }
                    }
                }
            }
        }, {});

        await m.react('✅');

    } catch (error) {
        await m.react('❌');
        return conn.reply(m.chat, theme.error(`خطأ: ${error.message || 'فشل توليد الفيديو'}`), m);
    }
};

handler.command = ['فيديو-ذكاء', 'ai-video', 'فيديو-ai'];
handler.help = ['فيديو-ذكاء <وصف>'];
handler.tags = ['ai'];

export default handler;
