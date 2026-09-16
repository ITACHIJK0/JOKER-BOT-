// plugins/بيانو.js
// 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - Ultimate Soldier Boy Instruments (Piano, Guitar, Drums, Violin, Sax, Flute) 🎹🎸

import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import { getPlayer, addXP, addMoney } from '../core/العاب.js'

const NOTE_FREQ = {
  'دو': 262, 'ري': 294, 'مي': 330, 'فا': 349,
  'سول': 392, 'لا': 440, 'سي': 494,
  'C': 262, 'D': 294, 'E': 330, 'F': 349, 'G': 392, 'A': 440, 'B': 494,
  'C#': 277, 'D#': 311, 'F#': 370, 'G#': 415, 'A#': 466,
  'دو#': 277, 'ري#': 311, 'فا#': 370, 'سول#': 415, 'لا#': 466
}

const LEVELS = {
  1: {
    name: 'مبتدئ',
    songs: {
      'تولد': 'دو دو سول سول لا لا سول | فا فا مي مي ري ري دو',
      'مريم': 'مي مي فا سول سول فا مي ري | دو دو ري مي مي ري ري',
      'سلم': 'دو ري مي فا سول لا سي دو'
    }
  },
  2: {
    name: 'متوسط',
    songs: {
      'جيمي': 'مي ري دو ري مي مي مي | ري ري ري مي سول سول',
      'فرحة': 'دو مي سول مي دو | ري فا لا فا ري | مي سول سي سول مي',
      'نغمة': 'دو ري مي دو | مي فا سول مي | سول لا سي سول | دو'
    }
  },
  3: {
    name: 'متقدم',
    songs: {
      'كلاسيك': 'دو مي سول دو | سي سول مي دو | فا لا دو فا | مي دو لا فا',
      'إيقاع': 'دو دو ري مي | مي ري دو سي | لا لا سي دو | دو'
    }
  }
}

const SONGBOOK = {
  'تولد': 'دو دو سول سول لا لا سول | فا فا مي مي ري ري دو',
  'هابي بيرثداي': 'دو دو سول سول لا لا سول | فا فا مي مي ري ري دو',
  'happy birthday': 'دو دو سول سول لا لا سول | فا فا مي مي ري ري دو',
  'مريم كان لديها حمل': 'مي مي فا سول سول فا مي ري | دو دو ري مي مي ري ري',
  'جيمي كريكت': 'مي ري دو ري مي مي مي | ري ري ري مي سول سول',
  'twinkle': 'دو دو سول سول لا لا سول | فا فا مي مي ري ري دو',
  'نجمة': 'دو دو سول سول لا لا سول | فا فا مي مي ري ري دو',
  'سلام': 'دو مي سول مي دو | ري فا لا فا ري',
  'نصر': 'دو ري مي فا | سول فا مي ري | دو',
  'حب': 'مي فا سول لا | سول فا مي ري | دو مي سول',
  'حزين': 'سي لا سول فا | مي ري دو | دو ري مي',
  'فرحة': 'دو مي سول دو | سي لا سول مي | دو'
}

const INSTRUMENTS = {
  بيانو: { title: 'JOKER BOT PIANO', emoji: '🎹', wave: 'triangle', color: '#22d3ee' },
  جيتار: { title: 'JOKER BOT GUITAR', emoji: '🎸', wave: 'sawtooth', color: '#f97316' },
  كمان: { title: 'JOKER BOT VIOLIN', emoji: '🎻', wave: 'sawtooth', color: '#a78bfa' },
  ساكس: { title: 'JOKER BOT SAX', emoji: '🎷', wave: 'square', color: '#eab308' },
  فلوت: { title: 'JOKER BOT FLUTE', emoji: '🎶', wave: 'sine', color: '#34d399' },
  طبل: { title: 'JOKER BOT DRUMS', emoji: '🥁', wave: 'drums', color: '#f43f5e' }
}

function findSong(q) {
  const key = Object.keys(SONGBOOK).find(k => k.includes(q) || q.includes(k))
  return key ? { title: key, notes: SONGBOOK[key] } : null
}

function cssBase(color) {
  return `*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;background:linear-gradient(165deg,#0a1628,#1a0f2e 45%,#0f172a);color:#e2e8f0;min-height:100vh;padding:10px;user-select:none}
.wrap{max-width:440px;margin:0 auto}
.top{text-align:center;margin-bottom:8px}
.top h1{font-size:16px;letter-spacing:1px}
.top .sub{font-size:11px;opacity:.8;margin-top:3px}
.card{background:rgba(15,23,42,.92);border:2px solid ${color};border-radius:16px;padding:12px 10px 14px;box-shadow:0 0 22px ${color}40}
.led{height:30px;border-radius:8px;background:#020617;border:1px solid #334155;display:flex;align-items:center;justify-content:center;margin-bottom:10px;font-family:ui-monospace,monospace;font-size:12px;color:${color};letter-spacing:1px}
.row{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:8px}
.btn{background:#0f172a;border:1px solid ${color};color:${color};border-radius:10px;padding:7px 10px;font-size:11px;cursor:pointer}
.btn:active{opacity:.75}
.lesson{background:#020617;border-radius:10px;padding:8px;font-size:12px;line-height:1.6;margin-top:8px;border:1px solid #334155;min-height:40px;text-align:center}
.hint{font-size:10px;opacity:.7;text-align:center;margin-top:6px}`
}

function buildPianoLikeHTML(inst, { mode = 'play', level = 1, lesson = '' } = {}) {
  const levelData = LEVELS[level] || LEVELS[1]
  const modeLabel = mode === 'learn' ? '📚 تعليمي' : mode === 'level' ? `🎯 مستوى ${level} (${levelData.name})` : 'عزف حر'
  const color = inst.color
  const wave = inst.wave
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<title>${inst.title}</title>
<style>
${cssBase(color)}
.keys{display:flex;justify-content:center;align-items:flex-end;height:155px;position:relative;gap:2px;margin-bottom:10px}
.key{position:relative;border-radius:0 0 7px 7px;cursor:pointer;display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px;font-weight:700;font-size:11px;transition:transform .05s}
.white{width:40px;height:145px;background:linear-gradient(#f8fafc,#cbd5e1);color:#0f172a;border:1px solid #94a3b8;box-shadow:0 3px 0 #64748b;z-index:1}
.white.active,.white:active{transform:translateY(3px);background:#e2e8f0}
.black{width:26px;height:90px;background:linear-gradient(#1e293b,#0f172a);color:#e2e8f0;border:1px solid #334155;margin:0 -14px;z-index:2;box-shadow:0 3px 0 #020617}
.black.active,.black:active{transform:translateY(2px);background:#334155}
</style></head><body>
<div class="wrap">
  <div class="top"><h1>${inst.emoji} ${inst.title}</h1><div class="sub">${modeLabel}</div></div>
  <div class="card">
    <div class="led" id="led">READY — اضغط مفتاح</div>
    <div class="keys" id="keys"></div>
    <div class="row">
      <button class="btn" id="octave">أوكتاف: 4</button>
      <button class="btn" id="playseq">▶ تشغيل</button>
      <button class="btn" id="clear">مسح</button>
      <button class="btn" id="demo">ديمو</button>
    </div>
    <div class="lesson" id="lesson">${lesson || 'اضغط المفاتيح للعزف'}</div>
    <div class="hint">دو ري مي فا سول لا سي</div>
  </div>
</div>
<script>
(function(){
  const WAVE='${wave}';
  const notes=[
    {n:'C',ar:'دو',f:261.63,black:false},{n:'C#',ar:'دو#',f:277.18,black:true},
    {n:'D',ar:'ري',f:293.66,black:false},{n:'D#',ar:'ري#',f:311.13,black:true},
    {n:'E',ar:'مي',f:329.63,black:false},{n:'F',ar:'فا',f:349.23,black:false},
    {n:'F#',ar:'فا#',f:369.99,black:true},{n:'G',ar:'سول',f:392.00,black:false},
    {n:'G#',ar:'سول#',f:415.30,black:true},{n:'A',ar:'لا',f:440.00,black:false},
    {n:'A#',ar:'لا#',f:466.16,black:true},{n:'B',ar:'سي',f:493.88,black:false}
  ];
  let octave=4, seq=[], ctx;
  const led=document.getElementById('led');
  const keysEl=document.getElementById('keys');
  function getCtx(){if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx}
  function play(freq,label){
    try{
      const c=getCtx();
      const o=c.createOscillator();
      const g=c.createGain();
      o.type=WAVE==='sawtooth'?'sawtooth':(WAVE==='square'?'square':(WAVE==='sine'?'sine':'triangle'));
      o.frequency.value=freq*Math.pow(2,octave-4);
      const now=c.currentTime;
      if(WAVE==='sawtooth'){
        g.gain.setValueAtTime(0.22,now);
        g.gain.exponentialRampToValueAtTime(0.001,now+0.9);
      } else if(WAVE==='square'){
        g.gain.setValueAtTime(0.12,now);
        g.gain.exponentialRampToValueAtTime(0.001,now+0.7);
      } else if(WAVE==='sine'){
        g.gain.setValueAtTime(0.001,now);
        g.gain.linearRampToValueAtTime(0.2,now+0.05);
        g.gain.exponentialRampToValueAtTime(0.001,now+0.8);
      } else {
        g.gain.setValueAtTime(0.28,now);
        g.gain.exponentialRampToValueAtTime(0.001,now+0.55);
      }
      o.connect(g);g.connect(c.destination);
      o.start();o.stop(now+1);
      led.textContent=label+' • '+Math.round(freq*Math.pow(2,octave-4))+' Hz';
    }catch(e){led.textContent=label}
  }
  notes.forEach(note=>{
    const d=document.createElement('div');
    d.className='key '+(note.black?'black':'white');
    d.textContent=note.ar;
    const press=()=>{d.classList.add('active');play(note.f,note.ar);seq.push(note.ar)};
    const up=()=>d.classList.remove('active');
    d.addEventListener('touchstart',e=>{e.preventDefault();press()},{passive:false});
    d.addEventListener('touchend',up);
    d.addEventListener('mousedown',press);
    d.addEventListener('mouseup',up);
    d.addEventListener('mouseleave',up);
    keysEl.appendChild(d);
  });
  document.getElementById('octave').onclick=e=>{octave=octave>=5?3:octave+1;e.target.textContent='أوكتاف: '+octave};
  document.getElementById('clear').onclick=()=>{seq=[];led.textContent='READY'};
  document.getElementById('playseq').onclick=async()=>{
    if(!seq.length){led.textContent='لا يوجد تسلسل';return}
    for(const ar of seq){const n=notes.find(x=>x.ar===ar);if(n){play(n.f,n.ar);await new Promise(r=>setTimeout(r,280))}}
  };
  document.getElementById('demo').onclick=async()=>{
    const melody=['دو','دو','سول','سول','لا','لا','سول','فا','فا','مي','مي','ري','ري','دو'];
    for(const ar of melody){const n=notes.find(x=>x.ar===ar);if(n){play(n.f,n.ar);await new Promise(r=>setTimeout(r,300))}}
  };
})();
</script></body></html>`
}

function buildDrumsHTML() {
  const color = INSTRUMENTS.طبل.color
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<title>Joker Bot Drums</title>
<style>
${cssBase(color)}
.pads{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:8px 0}
.pad{height:90px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;cursor:pointer;border:2px solid #334155;transition:transform .06s,box-shadow .06s}
.pad:active,.pad.active{transform:scale(.95);box-shadow:0 0 18px ${color}}
.kick{background:linear-gradient(145deg,#7f1d1d,#450a0a);color:#fecaca}
.snare{background:linear-gradient(145deg,#1e3a5f,#0f172a);color:#bae6fd}
.hihat{background:linear-gradient(145deg,#365314,#1a2e05);color:#d9f99d}
.crash{background:linear-gradient(145deg,#713f12,#422006);color:#fde68a}
.tom{background:linear-gradient(145deg,#4c1d95,#2e1065);color:#ddd6fe}
.clap{background:linear-gradient(145deg,#9a3412,#7c2d12);color:#fed7aa}
</style></head><body>
<div class="wrap">
  <div class="top"><h1>🥁 JOKER BOT DRUMS</h1><div class="sub">إيقاعات — اضغط البادات</div></div>
  <div class="card">
    <div class="led" id="led">READY — اختر صوت</div>
    <div class="pads">
      <div class="pad kick" data-s="kick">💥 Kick</div>
      <div class="pad snare" data-s="snare">🥁 Snare</div>
      <div class="pad hihat" data-s="hihat">🎩 Hi-Hat</div>
      <div class="pad crash" data-s="crash">🔥 Crash</div>
      <div class="pad tom" data-s="tom">🪘 Tom</div>
      <div class="pad clap" data-s="clap">👏 Clap</div>
    </div>
    <div class="row">
      <button class="btn" id="beat">▶ Beat</button>
      <button class="btn" id="clear">مسح</button>
    </div>
    <div class="lesson">Kick • Snare • Hi-Hat • Crash • Tom • Clap</div>
  </div>
</div>
<script>
(function(){
  let ctx, seq=[];
  const led=document.getElementById('led');
  function getCtx(){if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx}
  function noiseBuffer(c){
    const len=c.sampleRate*0.2; const buf=c.createBuffer(1,len,c.sampleRate);
    const d=buf.getChannelData(0); for(let i=0;i<len;i++) d[i]=Math.random()*2-1; return buf;
  }
  function play(type){
    const c=getCtx(); const now=c.currentTime;
    if(type==='kick'){
      const o=c.createOscillator(), g=c.createGain();
      o.frequency.setValueAtTime(150,now); o.frequency.exponentialRampToValueAtTime(40,now+0.15);
      g.gain.setValueAtTime(0.9,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.3);
      o.connect(g); g.connect(c.destination); o.start(now); o.stop(now+0.3);
      led.textContent='💥 KICK';
    } else if(type==='snare'||type==='clap'){
      const src=c.createBufferSource(); src.buffer=noiseBuffer(c);
      const g=c.createGain(); const f=c.createBiquadFilter(); f.type='highpass'; f.frequency.value=type==='clap'?1200:1000;
      g.gain.setValueAtTime(0.5,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.15);
      src.connect(f); f.connect(g); g.connect(c.destination); src.start(now);
      if(type==='snare'){ const o=c.createOscillator(), g2=c.createGain(); o.frequency.value=200;
        g2.gain.setValueAtTime(0.3,now); g2.gain.exponentialRampToValueAtTime(0.001,now+0.1);
        o.connect(g2); g2.connect(c.destination); o.start(now); o.stop(now+0.1); }
      led.textContent=type==='clap'?'👏 CLAP':'🥁 SNARE';
    } else if(type==='hihat'){
      const src=c.createBufferSource(); src.buffer=noiseBuffer(c);
      const g=c.createGain(); const f=c.createBiquadFilter(); f.type='highpass'; f.frequency.value=7000;
      g.gain.setValueAtTime(0.25,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.05);
      src.connect(f); f.connect(g); g.connect(c.destination); src.start(now);
      led.textContent='🎩 HI-HAT';
    } else if(type==='crash'){
      const src=c.createBufferSource(); src.buffer=noiseBuffer(c);
      const g=c.createGain(); const f=c.createBiquadFilter(); f.type='bandpass'; f.frequency.value=4000;
      g.gain.setValueAtTime(0.35,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.8);
      src.connect(f); f.connect(g); g.connect(c.destination); src.start(now);
      led.textContent='🔥 CRASH';
    } else if(type==='tom'){
      const o=c.createOscillator(), g=c.createGain();
      o.frequency.setValueAtTime(180,now); o.frequency.exponentialRampToValueAtTime(80,now+0.2);
      g.gain.setValueAtTime(0.6,now); g.gain.exponentialRampToValueAtTime(0.001,now+0.25);
      o.connect(g); g.connect(c.destination); o.start(now); o.stop(now+0.25);
      led.textContent='🪘 TOM';
    }
    seq.push(type);
  }
  document.querySelectorAll('.pad').forEach(p=>{
    const go=()=>{p.classList.add('active');play(p.dataset.s);setTimeout(()=>p.classList.remove('active'),80)};
    p.addEventListener('touchstart',e=>{e.preventDefault();go()},{passive:false});
    p.addEventListener('mousedown',go);
  });
  document.getElementById('clear').onclick=()=>{seq=[];led.textContent='READY'};
  document.getElementById('beat').onclick=async()=>{
    const pattern=['kick','hihat','snare','hihat','kick','hihat','snare','crash'];
    for(const s of pattern){play(s);await new Promise(r=>setTimeout(r,220))}
  };
})();
</script></body></html>`
}

function buildGuitarHTML() {
  const color = INSTRUMENTS.جيتار.color
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<title>Joker Bot Guitar</title>
<style>
${cssBase(color)}
.neck{background:linear-gradient(#78350f,#451a03);border-radius:12px;padding:12px 8px;margin:8px 0;border:2px solid #92400e}
.string{height:36px;margin:6px 0;border-radius:8px;background:linear-gradient(90deg,#fef3c7,#d97706);display:flex;align-items:center;justify-content:space-between;padding:0 12px;cursor:pointer;font-weight:700;color:#1c1917;box-shadow:0 2px 0 #78350f}
.string:active,.string.active{transform:scaleY(1.08);filter:brightness(1.15)}
</style></head><body>
<div class="wrap">
  <div class="top"><h1>🎸 JOKER BOT GUITAR</h1><div class="sub">6 أوتار — اضغط الوتر</div></div>
  <div class="card">
    <div class="led" id="led">READY — اختر وتر</div>
    <div class="neck" id="neck"></div>
    <div class="row">
      <button class="btn" id="chord">🎸 كورد C</button>
      <button class="btn" id="riff">▶ Riff</button>
    </div>
    <div class="lesson">E A D G B e — من الغليظ للحاد</div>
  </div>
</div>
<script>
(function(){
  const strings=[
    {name:'E',ar:'مي الغليظ',f:82.41},
    {name:'A',ar:'لا',f:110.00},
    {name:'D',ar:'ري',f:146.83},
    {name:'G',ar:'سول',f:196.00},
    {name:'B',ar:'سي',f:246.94},
    {name:'e',ar:'مي الحاد',f:329.63}
  ];
  let ctx; const led=document.getElementById('led'); const neck=document.getElementById('neck');
  function getCtx(){if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx}
  function play(f,label){
    const c=getCtx(); const now=c.currentTime;
    const o=c.createOscillator(); const g=c.createGain();
    o.type='sawtooth'; o.frequency.value=f;
    g.gain.setValueAtTime(0.2,now); g.gain.exponentialRampToValueAtTime(0.001,now+1.2);
    o.connect(g); g.connect(c.destination); o.start(now); o.stop(now+1.2);
    led.textContent='🎸 '+label+' • '+Math.round(f)+' Hz';
  }
  strings.forEach(s=>{
    const d=document.createElement('div'); d.className='string';
    d.innerHTML='<span>'+s.name+'</span><span>'+s.ar+'</span>';
    const go=()=>{d.classList.add('active');play(s.f,s.ar);setTimeout(()=>d.classList.remove('active'),120)};
    d.addEventListener('touchstart',e=>{e.preventDefault();go()},{passive:false});
    d.addEventListener('mousedown',go);
    neck.appendChild(d);
  });
  document.getElementById('chord').onclick=async()=>{
    for(const f of [130.81,164.81,196.00,261.63]){play(f,'C');await new Promise(r=>setTimeout(r,40))}
  };
  document.getElementById('riff').onclick=async()=>{
    const riff=[82.41,110,146.83,196,146.83,110,82.41];
    for(const f of riff){play(f,'riff');await new Promise(r=>setTimeout(r,200))}
  };
})();
</script></body></html>`
}

async function sendInstrument(conn, m, instrumentKey, opts = {}) {
  const inst = INSTRUMENTS[instrumentKey] || INSTRUMENTS.بيانو
  let html
  if (instrumentKey === 'طبل') html = buildDrumsHTML()
  else if (instrumentKey === 'جيتار') html = buildGuitarHTML()
  else html = buildPianoLikeHTML(inst, opts)

  const messageContent = {
    messageContextInfo: {
      deviceListMetadata: {},
      deviceListMetadataVersion: 2,
      botMetadata: {
        messageDisclaimerText: '',
        botResponseId: 'joker-bot-inst-v2',
        verificationMetadata: {
          proofs: [{
            version: 1,
            useCase: 1,
            signature: 'SlBLVEFLTi5NZXNzYWdlQnVpbGRlclY0LjctVmVyaWZpY2F0aW9uU2lnbmF0dXJlLk1ldGFkYXRhL0NDcm1FTEw=',
            certificateChain: ['SlBLVEFLTi5NZXNzYWdlQnVpbGRlclY0LjctQ2VydGlmaWNhdGVDaGFpbi5NZXRhZGF0YQ==']
          }]
        }
      }
    },
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          messageType: 2,
          submessages: [{ messageType: 2, messageText: `${inst.emoji} ${inst.title}` }],
          unifiedResponse: {
            data: Buffer.from(JSON.stringify({
              __typename: 'GenAIUnifiedResponse',
              response_id: 'joker-inst-' + Date.now(),
              sections: [{
                __typename: 'GenAIUnifiedResponseSection',
                view_model: {
                  __typename: 'GenAISingleLayoutViewModel',
                  primitive: {
                    __typename: 'GenAIaeacdsnwHtmlPrimitive',
                    payload: html,
                    trusted_sources: []
                  }
                }
              }]
            })).toString('base64')
          },
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' },
            forwardOrigin: 4
          }
        }
      }
    }
  }
  const msg = generateWAMessageFromContent(m.chat, messageContent, { userJid: conn.user.id })
  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

let handler = async (m, { conn, command, args, usedPrefix, text }) => {
  const cmd = String(command || '').toLowerCase()
  const q = (text || args.join(' ') || '').trim()

  try {
    getPlayer(m.sender)
    addXP(m.sender, 8)
    addMoney(m.sender, 12)
  } catch {}

  if (cmd === 'الات' || cmd === 'آلات' || cmd === 'instruments' || q === 'قائمة') {
    return m.reply(`🎵 *آلات 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ*

🎹 \`${usedPrefix}بيانو\` — بيانو كامل + تعليمي
🎸 \`${usedPrefix}جيتار\` — 6 أوتار + كوردات
🥁 \`${usedPrefix}طبل\` — بادز إيقاع (Kick/Snare/...)
🎻 \`${usedPrefix}كمان\` — صوت وتري
🎷 \`${usedPrefix}ساكس\` — ساكسفون
🎶 \`${usedPrefix}فلوت\` — فلوت ناعم

📚 تعليمي:
• ${usedPrefix}بيانو تعليمي
• ${usedPrefix}مستوى 1
• ${usedPrefix}لحن تولد
• ${usedPrefix}اعزف دو`)
  }

  if (cmd === 'اعزف' || cmd === 'نوتة') {
    const note = String(args[0] || '').trim()
    if (!note) return m.reply(`مثال: *${usedPrefix}اعزف دو*`)
    const freq = NOTE_FREQ[note] || NOTE_FREQ[note.toUpperCase()]
    if (!freq) return m.reply('نوتة غير معروفة: دو ري مي فا سول لا سي')
    return m.reply(`🎹 *${note}*\n📡 ${freq} Hz\n+8 XP`)
  }

  if (cmd === 'لحن' || cmd === 'تلحين' || cmd === 'نوتات') {
    if (!q) {
      return m.reply(`🎼 *تلحين*\n${usedPrefix}لحن تولد\n\nالمتاح:\n${Object.keys(SONGBOOK).slice(0, 10).map(s => '• ' + s).join('\n')}`)
    }
    const found = findSong(q.toLowerCase())
    if (!found) return m.reply(`❌ مفيش تلحين لـ "${q}"`)
    await m.reply(`🎼 *${found.title}*\n\`${found.notes}\``)
    return sendInstrument(conn, m, 'بيانو', { mode: 'learn', lesson: `${found.title} | ${found.notes}` })
  }

  if (cmd === 'مستوى' || (cmd === 'بيانو' && /^[123]$/.test(q))) {
    const lvl = parseInt(q) || 1
    const data = LEVELS[lvl]
    if (!data) return m.reply('المستويات: 1 | 2 | 3')
    const list = Object.entries(data.songs).map(([n, notes]) => `• *${n}*: ${notes}`).join('\n')
    await m.reply(`🎯 مستوى ${lvl} — ${data.name}\n\n${list}`)
    return sendInstrument(conn, m, 'بيانو', { mode: 'level', level: lvl, lesson: `مستوى ${lvl}` })
  }

  let instrument = 'بيانو'
  if (cmd === 'جيتار' || cmd === 'guitar') instrument = 'جيتار'
  else if (cmd === 'طبل' || cmd === 'طبول' || cmd === 'drums' || cmd === 'drum') instrument = 'طبل'
  else if (cmd === 'كمان' || cmd === 'violin') instrument = 'كمان'
  else if (cmd === 'ساكس' || cmd === 'ساكسفون' || cmd === 'sax') instrument = 'ساكس'
  else if (cmd === 'فلوت' || cmd === 'flute') instrument = 'فلوت'
  else if (q === 'تعليمي' || q === 'learn' || cmd === 'بيانو_تعليمي') {
    await m.reply(`📚 المود التعليمي\nدو ري مي فا سول لا سي`)
    return sendInstrument(conn, m, 'بيانو', { mode: 'learn', lesson: 'السلم الموسيقي: دو ري مي فا سول لا سي' })
  }

  return sendInstrument(conn, m, instrument, { mode: 'play' })
}

handler.help = ['بيانو', 'جيتار', 'طبل', 'كمان', 'ساكس', 'فلوت', 'الات', 'لحن', 'مستوى']
handler.tags = ['games']
handler.command = /^(بيانو|بيانو_تعليمي|جيتار|طبل|طبول|كمان|ساكس|ساكسفون|فلوت|الات|آلات|اعزف|نوتة|لحن|تلحين|نوتات|مستوى|piano|guitar|drums|drum|violin|sax|flute|instruments)$/i

export default handler
