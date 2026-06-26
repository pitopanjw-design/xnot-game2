// ※ 이미지 에셋인 milky_way02.png는 픽셀 오류 방지를 위해 알파 채널이 포함된 투명 PNG-24 포맷으로 저장해 주세요.
// ===========================================================
//  🔊 Web Audio API 오디오 시스템
// ===========================================================
const SoundManager = {
    ctx: null, masterGain: null, isMuted: false, bgm: null, bgmGain: null,
    init() {
        if (this.ctx) return;
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AC();
            this.masterGain = this.ctx.createGain();
            this.masterGain.connect(this.ctx.destination);
            const saved = localStorage.getItem('xnot_mute');
            this.isMuted = saved === 'true';
            this.masterGain.gain.value = this.isMuted ? 0 : 0.6;

            this.bgm = new Audio('audio/bgm_lobby.mp3');
            this.bgm.loop = true;
            this.bgmGain = this.ctx.createGain();
            this.bgmGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
            const bgmSource = this.ctx.createMediaElementSource(this.bgm);
            bgmSource.connect(this.bgmGain);
            this.bgmGain.connect(this.masterGain);

            if (!this.isMuted) {
                this.bgm.play().catch(e => {});
            }

            this.updateMuteUI();
        } catch(e) {}
    },
    resume() {
        this.init();
        if (this.ctx && this.ctx.state==='suspended') this.ctx.resume();
        if (this.bgm && !this.isMuted && this.bgm.paused) {
            this.bgm.play().catch(e => {});
        }
    },
    setMute(v) {
        this.isMuted = v;
        localStorage.setItem('xnot_mute', v);
        if (this.masterGain && this.ctx) this.masterGain.gain.setValueAtTime(v?0:0.6, this.ctx.currentTime);
        if (this.bgm) {
            if (v) {
                this.bgm.pause();
            } else {
                this.bgm.play().catch(e => {});
            }
        }
        this.updateMuteUI();
    },
    updateMuteUI() { const b = document.getElementById('mute-btn'); if (b) b.innerText = this.isMuted ? '🔇' : '🔊'; },
    _play(freq, type, dur, vol=0.3, freqEnd=null) {
        if (this.isMuted || !this.ctx) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.connect(g); g.connect(this.masterGain);
        o.type = type;
        o.frequency.setValueAtTime(freq, this.ctx.currentTime);
        if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + dur);
        g.gain.setValueAtTime(vol, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
        o.start(); o.stop(this.ctx.currentTime + dur + 0.01);
    },
    playTick()    { this.resume(); this._play(800,'triangle',0.04,0.18,100); },
    playLaunch(s) { this.resume(); this._play(240+s*10,'triangle',0.28,0.4,55); },
    playBounce(p) {
        this.resume();
        const stone = selectedStone || { id: 1, rarity: 'Rare' };
        const stoneId = stone.id;

        if (stoneId === 0) {
            const freq = p ? 1100 : 900;
            const dur = p ? 0.08 : 0.05;
            this._play(freq, 'triangle', dur, p ? 0.25 : 0.15, p ? 800 : 700);
        } else if (stoneId === 1) {
            if (p) {
                [880,1320,1760].forEach((f,i)=>this._play(f,'sine',0.5,0.2/(i+1)));
            } else {
                this._play(140,'sine',0.13,0.35,400);
            }
        } else if (stoneId === 2) {
            const startFreq = p ? 200 : 160;
            const dur = p ? 0.15 : 0.11;
            const vol = p ? 0.45 : 0.35;
            this._play(startFreq, 'sawtooth', dur, vol, startFreq - 100);
            this._play(startFreq - 40, 'triangle', dur + 0.03, vol * 0.7, startFreq - 120);
        } else if (stoneId === 3) {
            const volMult = p ? 1.5 : 0.8;
            [880, 1320, 1760].forEach((f, i) => {
                this._play(f, 'sine', p ? 0.5 : 0.3, (0.2 / (i + 1)) * volMult);
            });
        }
    },
    playSink() { this.resume(); for(let i=0;i<3;i++) { const d=i*0.08; setTimeout(()=>this._play(180-i*35,'sine',0.14,0.25,40), d*1000); } },
    playUpgrade() { this.resume(); this._play(523,'sine',0.12,0.15); setTimeout(()=>this._play(659,'sine',0.18,0.15),100); },
    playFanfare() {
        this.resume();
        const notes=[261,329,392,523,659,784];
        notes.forEach((f,i)=>setTimeout(()=>this._play(f,'triangle',0.4,0.12),i*70));
    },
    pauseAll() {
        if (this.bgm) this.bgm.pause();
        if (this.ctx && this.ctx.state !== 'suspended') this.ctx.suspend();
    },
    resumeAll() {
        if (this.isMuted === true) return;
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        if (this.bgm && this.bgm.paused) this.bgm.play().catch(e => {});
    }
};

function toggleMute(e) { e?.preventDefault(); SoundManager.resume(); SoundManager.setMute(!SoundManager.isMuted); haptic('light'); }

// ===========================================================
//  🌐 다국어 사전 (i18n Localization)
// ===========================================================
const i18n = {
    ko: {
        introTitle:'XNOT 물수제비 채굴', introDesc:'XNOT 물수제비 채굴은 차세대 디지털 자산인 XNOT 코인을 강물 위 물수제비의 탄성을 이용해 채굴하는 하이퍼 캐주얼 광산 게임입니다. 돌을 튕겨 최적의 탄성을 얻고 SP를 채굴하세요!',
        introStartBtn:'게임 시작 ⛏️', introInfoBtn:'게임 소개 ℹ️', introInfoTitle:'게임 소개',
        lobbyTitle:'룰렛을 터치하여 돌을 뽑으세요', spinBtn:'룰렛 돌리기', shopBtn:'⚙️ 돌 능력 강화 상점',
        stoneReady:'돌 준비 완료!', launchBtn:'돌 던지기 (하트 1 소모)', wheelTouch:'돌 뽑기 터치!',
        stone0:'납작한 슬레이트', stone0Desc:'안정적인 각도, 평균 튕김 수 최고 (대박: 0.1%)',
        stone1:'거친 강가 조약돌', stone1Desc:'표준 성능의 무난한 기본 조약돌 (대박: 2%)',
        stone2:'고밀도 현무암', stone2Desc:'평균적으론 무겁지만 2.5% 확률로 관성 폭발 대박',
        stone3:'XNOT 황금 운석', stone3Desc:'50% 확률로 타 특성 복제, 1/200만 확률로 은하 활공',
        ready:'READY', prepareMsg:'돌을 잡고 위로 빠르게 던지세요!', swipeGuide:'▲ 위로 빠르게 쓸어올리세요! ▲',
        heartsLack:'하트 부족! 에너지를 충전하세요.', watchAd:'❤️ 유튜브 시청하고 하트 완충',
        adTitle:'유튜브 광고 시청 중...', adDesc:'하트를 충전하기 위해 대표님 채널 영상을 시청하고 있습니다.', adComplete:'시청 완료 시 하트 5개가 완충됩니다.',
        perfectTiming:'완벽한 타이밍과 각도!', goodTiming:'좋은 타이밍!', badTiming:'조금 어긋난 타이밍...',
        missMsg:'타이밍을 놓쳐 돌이 수면에 가라앉았습니다.', sinkMsg:'동력을 잃어 가라앉았습니다.',
        resTitle:'물수제비 결과', resStone:'🪨 선택한 돌', resBounces:'🎯 튕김 횟수', resPerfects:'⭐ Perfect 횟수', resEarned:'💎 획득 SP', resConfirm:'확인',
        perfect:'PERFECT', bouncesUnit:'회',
        lightningLaunch:'초광속 발사!', fastLaunch:'쾌속 발사!', normalLaunch:'일반 발사', speedText:'속도', upgradeSuccess:'속성 강화 성공!'
    },
    en: {
        introTitle:'XNOT Stone Skipper', introDesc:'XNOT Stone Skipper is a hyper-casual mining game where you mine XNOT Coin using the elasticity of skipping stones. Bounce stones to mine SP!',
        introStartBtn:'Start Game ⛏️', introInfoBtn:'Game Info ℹ️', introInfoTitle:'Game Info',
        lobbyTitle:'Touch the wheel to pick a stone', spinBtn:'SPIN WHEEL', shopBtn:'⚙️ Upgrade Properties',
        stoneReady:'STONE READY!', launchBtn:'LAUNCH STONE (Cost 1 ❤️)', wheelTouch:'Touch to Spin!',
        stone0:'Flat Slate', stone0Desc:'Highly stable angle, best average skips (Jackpot: 0.1%)',
        stone1:'Rough Pebble', stone1Desc:'Standard performance starter stone (Jackpot: 2%)',
        stone2:'Dense Basalt', stone2Desc:'Heavy avg, 2.5% chance of inertia explosion jackpot',
        stone3:'XNOT Gold Meteor', stone3Desc:'50% mimic chance, 1/2M galaxy glide lottery',
        ready:'READY', prepareMsg:'Grab the stone and swipe up fast!', swipeGuide:'▲ SWIPE UP FAST! ▲',
        heartsLack:'No hearts! Recharge energy.', watchAd:'❤️ Watch YouTube to Refill',
        adTitle:'Watching Ad...', adDesc:'Watching the channel video to recharge hearts.', adComplete:'5 hearts will be refilled.',
        perfectTiming:'Perfect timing and angle!', goodTiming:'Good timing!', badTiming:'Slightly off timing...',
        missMsg:'Missed timing, the stone sank.', sinkMsg:'Inertia lost, stone sank.',
        resTitle:'Skip Results', resStone:'🪨 Selected Stone', resBounces:'🎯 Bounces', resPerfects:'⭐ Perfects', resEarned:'💎 Earned SP', resConfirm:'Confirm',
        perfect:'PERFECT', bouncesUnit:'times',
        lightningLaunch:'Lightning Launch!', fastLaunch:'Fast Launch!', normalLaunch:'Normal Launch', speedText:'Speed', upgradeSuccess:'Upgrade Success!'
    }
};

let currentLang = 'en';
function initLang() {
    let lang = 'en';
    try { lang = (window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code || navigator.language || 'en').toLowerCase().split('-')[0]; } catch(e){}
    currentLang = i18n[lang] ? lang : 'en';
}
function t(k) { return (i18n[currentLang]?.[k]) || (i18n['en']?.[k]) || k; }
function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const k=el.getAttribute('data-i18n');
        if(t(k)!==k) el.innerText=t(k);
    });

    const introStart = document.getElementById('intro-start-btn');
    if (introStart) introStart.innerText = t('introStartBtn');
    const introInfo = document.getElementById('intro-info-btn');
    if (introInfo) introInfo.innerText = t('introInfoBtn');
    const shopBtn = document.getElementById('shop-btn');
    if (shopBtn) shopBtn.innerText = t('shopBtn');
    const mainBtn = document.getElementById('main-btn');
    if (mainBtn) mainBtn.innerText = t('spinBtn');
    const message = document.getElementById('message');
    if (message) message.innerText = t('prepareMsg');
    const scoreDisp = document.getElementById('score-display');
    if (scoreDisp) scoreDisp.innerText = t('ready');
    const swipeGuide = document.getElementById('swipe-guide');
    if (swipeGuide) swipeGuide.innerText = t('swipeGuide');
}

function haptic(type) {
    try {
        const h = window.Telegram?.WebApp?.HapticFeedback;
        if (!h) return;
        if (['light','medium','heavy'].includes(type)) h.impactOccurred(type);
        else if (['error','success'].includes(type)) h.notificationOccurred(type);
    } catch(e) {}
}

const STONES = [
    {
        id: 0, nameKey: 'stone0', name: '납작한 슬레이트', rarity: 'Ordinary', color: '#94a3b8',
        img: 'images/stone_slate.png', w: 150, h: 69, mult: 1.5,
        physics: { vzDecay:0.87, vyDecay:0.965, baseVz:1.0, friction:0.995, critChance:0.001, critMult:1.1 }
    },
    {
        id: 1, nameKey: 'stone1', name: '거친 강가 조약돌', rarity: 'Rare', color: '#38bdf8',
        img: 'images/stone_pebble.png', w: 85, h: 85, mult: 1.0,
        physics: { vzDecay:0.82, vyDecay:0.94, baseVz:1.5, friction:0.986, critChance:0.02, critMult:1.25 }
    },
    {
        id: 2, nameKey: 'stone2', name: '고밀도 현무암', rarity: 'Legendary', color: '#c084fc',
        img: 'images/stone_basalt.png', w: 95, h: 95, mult: 0.6,
        physics: {
            vzDecay:0.70, vyDecay:0.90, baseVz:0.8, friction:0.970, critChance:0.025,
            critPhysics: { vzDecay:0.90, vyDecay:0.98, baseVz:1.6, friction:0.998 }
        }
    },
    {
        id: 3, nameKey: 'stone3', name: 'XNOT 황금 운석', rarity: 'Mythic', color: '#ffd700',
        img: 'images/stone_gold.png', w: 90, h: 85, mult: 2.5,
        physics: {
            lottoChance: 1/2036265,
            lottoPhysics: { vzDecay:0.99, vyDecay:0.999, baseVz:2.5, friction:0.9999 }
        }
    }
];

let playerHearts = 5;
let playerSP = 0;
let upgrades = { weight:0, elasticity:0, spin:0 };
let gaugeSpeedMult = 2.0;
const UPGRADE_BASE_COST = 300, MAX_LV = 10;

let selectedStone = null;
let isSpinning = false;
let currentStatus = 'PRE_SPIN'; 
let isPlaying = false;
let isDead = false;

let bounceCount = 0, perfectCount = 0, hasTappedBounce = false, tapsInCurrentCycle = 0;
let launchAngle = 20;
let angleVal = 0.5, angleDir = 1;
let angleTimerId = null;
let animFrameId = null;

let stone = { x:0, y:0, z:0, vx:0, vy:0, vz:0, activePhys:null, isCrit:false, isLotto:false };
const GRAVITY = 0.16; // 포물선 궤적 확보를 위해 순정 0.16 복구
let swipeSpeed = 0;
let markerProgress = 0; 
let tapWindowStart = 0; 
let isWindowActive = false; 

let W = window.innerWidth, H = window.innerHeight;
let CX = W/2, HORIZON_Y = H * 0.42;   
let STONE_FIXED_X = CX;               
let STONE_FIXED_Y = H * 0.68;         

let isDragging = false, dragTouchId = null;
let startX = 0, startY = 0, startTime = 0;

const BG_FILES = [
    'images/foreground.png', 'images/midground.png', 'images/background.png',
    'images/foreground_lake.png', 'images/midground_lake.png', 'images/background_lake.png',
    'images/foreground_river.png', 'images/midground_river.png', 'images/background_river.png'
];
const bgImgCache = {};
BG_FILES.forEach(p => {
    const i = new Image(); i.src = p; bgImgCache[p] = i;
});
let currentBgPath = BG_FILES[0];
let currentTheme = 'lake';

const RARITY_BG = { Ordinary: new Image(), Rare: new Image(), Legendary: new Image(), Mythic: new Image() };
RARITY_BG.Ordinary.src  = 'images/background_ordinary.png';
RARITY_BG.Rare.src      = 'images/background_rare.png';
RARITY_BG.Legendary.src = 'images/background_legendary.png';
RARITY_BG.Mythic.src    = 'images/background_mythic.png';

let particles = [];
let wakes = [];
let rippleLayers = [];
for (let i=0; i<14; i++) rippleLayers.push({ z: i/14 });

const LAYERS = [
    { id:'sky',      parallax:0.0  }, { id:'far-isle', parallax:0.04 }, { id:'horizon',  parallax:0.10 },
    { id:'water-far',parallax:0.20 }, { id:'water-mid',parallax:0.42 }, { id:'water-near',parallax:0.78},
    { id:'shore',    parallax:1.4  }
];
let layerProgress = 0; 

const bgCanvas = document.getElementById('bg-canvas');
const bgCtx    = bgCanvas.getContext('2d');
const fxCanvas = document.getElementById('fx-canvas');
const fxCtx    = fxCanvas.getContext('2d');

function resizeCanvases() {
    W = window.innerWidth; H = window.innerHeight;
    bgCanvas.width = fxCanvas.width  = W;
    bgCanvas.height = fxCanvas.height = H;
    CX = W/2; HORIZON_Y = H*0.42;
    STONE_FIXED_X = CX; STONE_FIXED_Y = H*0.68;
}
window.addEventListener('resize', resizeCanvases);
resizeCanvases();

function saveData() {
    const d = { sp:playerSP, upgrades };
    localStorage.setItem('xnot_v4_save', JSON.stringify(d));
    try { window.Telegram?.WebApp?.CloudStorage?.setItem('stone_v4', JSON.stringify(d)); } catch(e){}
}
function loadData() {
    const raw = localStorage.getItem('xnot_v4_save');
    if (raw) {
        try {
            const p = JSON.parse(raw); playerSP = p.sp||0;
            if (p.upgrades) { upgrades.weight=p.upgrades.weight||0; upgrades.elasticity=p.upgrades.elasticity||0; upgrades.spin=p.upgrades.spin||0; }
        } catch(e){}
    }
    updateAssetUI();
    try {
        window.Telegram?.WebApp?.CloudStorage?.getItem('stone_v4', (err,val)=>{
            if (!err&&val) {
                const p=JSON.parse(val);
                if ((p.sp||0)>playerSP) { playerSP=p.sp; updateAssetUI(); saveData(); }
            }
        });
    } catch(e){}
}

function initTMA() {
    if (!window.Telegram?.WebApp) return;
    const tg = window.Telegram.WebApp; tg.ready(); tg.expand();
    try { tg.setHeaderColor('#050510'); tg.setBackgroundColor('#050510'); } catch(e){}
    const u = tg.initDataUnsafe?.user;
    if (u) {
        document.getElementById('user-name').innerText = u.first_name||u.username||'Guest';
        document.getElementById('user-card').style.display = 'flex';
    }
}

function updateAssetUI() {
    const hc = document.getElementById('hearts-count');
    const sc = document.getElementById('sp-count');
    if (hc) hc.innerText = playerHearts;
    if (sc) sc.innerText = playerSP.toLocaleString();
    
    const rt = document.getElementById('roulette-title');
    const mb = document.getElementById('main-btn');
    
    if (playerHearts <= 0 && currentStatus === 'PRE_SPIN') {
        if (rt) rt.innerText = t('heartsLack');
        if (mb) {
            mb.innerText = t('watchAd');
            mb.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
            mb.style.color = '#fff';
        }
    } else if (currentStatus === 'PRE_SPIN') {
        if (rt) rt.innerText = t('lobbyTitle');
        if (mb) {
            mb.innerText = t('spinBtn');
            mb.style.background = 'linear-gradient(135deg,var(--neon-lime),#a8ff00)';
            mb.style.color = 'var(--ink)';
        }
    }
}
function setAssetBarVisible(v) { document.getElementById('asset-bar').style.display = v?'flex':'none'; }

function triggerShake(strength='medium') {
    const el = document.getElementById('game-container');
    el.classList.remove('shaking'); void el.offsetWidth; el.classList.add('shaking');
    haptic(strength==='heavy'?'heavy':'medium');
    setTimeout(()=>el.classList.remove('shaking'), 480);
}

function spawnDramaticText(text, cls='neon-lime') {
    const d = document.createElement('div'); d.className = `dramatic-text ${cls}`; d.innerText = text;
    document.getElementById('game-container').appendChild(d);
    setTimeout(()=>d.remove(), 1900);
}

function changeRandomBg() {
    currentTheme = Math.random() < 0.5 ? 'lake' : 'river';
    currentBgPath = `images/foreground_${currentTheme}.png`;
    document.getElementById('game-container').style.background = `url('${currentBgPath}') no-repeat center/cover`;
}

function getCurrentRotation(el) {
    const tr = window.getComputedStyle(el).transform; if (tr==='none') return 0;
    const v = tr.split('(')[1].split(')')[0].split(',');
    let a = Math.round(Math.atan2(parseFloat(v[1]),parseFloat(v[0]))*(180/Math.PI));
    return a<0?a+360:a;
}

function triggerWheel(e) {
    e?.preventDefault(); SoundManager.resume();
    if (playerHearts<=0) { openYoutubeCharge(); return; }
    if (isSpinning || currentStatus!=='PRE_SPIN') return;
    isSpinning = true;

    const idx = Math.floor(Math.random()*STONES.length); const stone_def = STONES[idx];
    const offsets = [315, 225, 135, 45]; const offset = offsets[idx];
    const totalRot = 2160 + offset; 

    const wEl = document.getElementById('roulette-wheel');
    wEl.style.transition = 'transform 3.8s cubic-bezier(0.15, 0.85, 0.15, 1)';
    wEl.style.transform = `rotate(${totalRot}deg)`;

    let lastSector = 0;
    const tick = () => {
        if (!isSpinning) return;
        const cur = Math.floor(getCurrentRotation(wEl)/45);
        if (cur!==lastSector) { haptic('light'); SoundManager.playTick(); lastSector=cur; }
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    wEl.addEventListener('transitionend', ()=>{
        wEl.style.transition = 'none'; wEl.style.transform = `rotate(${offset}deg)`; 
        selectedStone = stone_def;
        document.getElementById('stone-desc-text').innerText = t(selectedStone.nameKey+'Desc');
        
        const rt = document.getElementById('roulette-title'); if (rt) rt.innerText = t('stoneReady');
        
        const sectors = wEl.querySelectorAll('.wheel-sector');
        sectors.forEach((sec, sIdx) => {
            if(sIdx === idx) sec.classList.add('highlight'); else sec.classList.remove('highlight');
        });

        const mb = document.getElementById('main-btn');
        if (mb) {
            mb.innerText = t('launchBtn'); mb.style.background = 'linear-gradient(135deg,var(--neon-lime),#a8ff00)'; mb.style.color = 'var(--ink)';
        }
        currentStatus = 'SPIN_DONE'; isSpinning = false; haptic('success');
    }, { once:true });
}

function handleMainBtn(e) {
    e?.preventDefault(); SoundManager.resume();
    if (playerHearts<=0 && currentStatus==='PRE_SPIN') { openYoutubeCharge(); return; }
    if (currentStatus==='PRE_SPIN') { triggerWheel(); return; }
    if (currentStatus==='SPIN_DONE') {
        playerHearts--; updateAssetUI(); playSeamlessTransition();
    }
}

function playSeamlessTransition() {
    const overlay = document.getElementById('transition-overlay');
    const img     = document.getElementById('transition-stone-img');
    const roulette = document.getElementById('roulette-screen');

    overlay.style.display = 'flex'; overlay.style.background = 'rgba(5,5,20,0)';
    img.style.backgroundImage = `url('${selectedStone.img}')`;
    img.style.width  = `${selectedStone.w}px`; img.style.height = `${selectedStone.h}px`;
    img.style.transform = 'scale(1)'; img.style.opacity = '1'; img.style.transition = 'none';

    requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
            img.style.transition = 'transform 0.55s cubic-bezier(0.2,0,0.8,1), opacity 0.55s ease';
            img.style.transform  = 'scale(8)'; img.style.opacity    = '0';
            overlay.style.transition = 'background 0.3s ease 0.2s'; overlay.style.background = 'rgba(5,5,20,0.95)';
            roulette.style.transition = 'opacity 0.35s ease 0.15s'; roulette.style.opacity = '0';
            setTimeout(()=>{
                roulette.style.display = 'none'; roulette.style.opacity = ''; roulette.style.transition = '';
                overlay.style.display = 'none'; overlay.style.background = ''; overlay.style.transition = '';
                img.style.transform = 'scale(1)'; img.style.opacity = '1'; img.style.transition = '';
                startGameplay();
            }, 580);
        });
    });
}

function startGameplay() {
    gaugeSpeedMult = 2.0; setStoneStyle();
    const stoneEl = document.getElementById('ingame-stone');
    stoneEl.style.display = 'block'; stoneEl.style.left = `${CX}px`; stoneEl.style.bottom = '80px'; stoneEl.style.top = 'auto';
    stoneEl.style.transform = 'translateX(-50%) scale(1)'; stoneEl.style.opacity = '1';

    document.getElementById('score-display').innerText = t('ready');
    document.getElementById('message').innerText       = t('prepareMsg');
    document.getElementById('swipe-guide').style.display = 'block';
    document.getElementById('angle-gauge-wrap').style.display = 'block';

    currentStatus = 'READY_TO_LAUNCH';
    updateGaugePerfectZone(); startAngleGauge(); bindLaunchEvents(); drawStaticBackground();
}

function setStoneStyle() {
    const el = document.getElementById('ingame-stone'); const s  = selectedStone;
    el.style.width  = `${s.w}px`; el.style.height = `${s.h}px`;
    el.style.backgroundImage = `url('${s.img}')`; el.style.backgroundSize = 'contain'; el.style.backgroundRepeat = 'no-repeat'; el.style.backgroundPosition = 'center';
    el.style.backgroundColor = 'transparent'; el.style.border = 'none'; el.style.boxShadow = 'none';
    el.style.filter = s.rarity==='Mythic'
        ? 'drop-shadow(0 0 22px rgba(255,215,0,0.85)) drop-shadow(0 8px 14px rgba(0,0,0,0.5))' : 'drop-shadow(0 6px 12px rgba(0,0,0,0.55))';
}

function getAngleZone(angleVal) {
    const perfSize = Math.min(0.10, 0.05 + ((upgrades.perfectZone || 0) * 0.005));
    const pMin = 0.5 - (perfSize / 2); const pMax = 0.5 + (perfSize / 2);

    if ((angleVal >= 0.00 && angleVal <= 0.01) || (angleVal >= 0.99 && angleVal <= 1.00)) return 'EASTEREG';
    if ((angleVal > 0.01 && angleVal <= 0.06) || (angleVal >= 0.94 && angleVal < 0.99)) return 'RED';
    if (angleVal >= pMin && angleVal <= pMax) return 'PERFECT';
    if ((angleVal >= pMin - 0.15 && angleVal < pMin) || (angleVal > pMax && angleVal <= pMax + 0.15)) return 'GREEN';
    return 'YELLOW';
}

// 5단 배칭 영역 무결성 디스플레이 가동
function updateGaugePerfectZone() {
    const perfSize = Math.min(0.10, 0.05 + ((upgrades.perfectZone || 0) * 0.005));
    const bg = document.getElementById('angle-gauge-bg'); if (!bg) return;

    let easterBot = document.getElementById('gz-easter-bot');
    if (!easterBot) {
        easterBot = document.createElement('div'); easterBot.className = 'gauge-zone'; easterBot.id = 'gz-easter-bot';
        easterBot.style.background = 'rgba(255, 215, 0, 0.7)'; easterBot.style.borderTop = '1px dashed var(--neon-gold)'; easterBot.style.borderBottom = '1px dashed var(--neon-gold)';
        bg.appendChild(easterBot);
    }
    let easterTop = document.getElementById('gz-easter-top');
    if (!easterTop) {
        easterTop = document.createElement('div'); easterTop.className = 'gauge-zone'; easterTop.id = 'gz-easter-top';
        easterTop.style.background = 'rgba(255, 215, 0, 0.7)'; easterTop.style.borderTop = '1px dashed var(--neon-gold)'; easterTop.style.borderBottom = '1px dashed var(--neon-gold)';
        bg.appendChild(easterTop);
    }

    const set = (id, bot, h) => {
        const el = document.getElementById(id); if (el) { el.style.bottom = `${bot}%`; el.style.height = `${h}%`; }
    };

    set('gz-easter-bot', 0, 1);
    set('gz-red-bot', 1, 5);
    set('gz-safe-bot', (0.5 - perfSize / 2 - 0.15) * 100, 15);
    set('gz-perfect', (0.5 - perfSize / 2) * 100, perfSize * 100);
    set('gz-safe-top', (0.5 + perfSize / 2) * 100, 15);
    set('gz-red-top', 94, 5);
    set('gz-easter-top', 99, 1);
}

function startAngleGauge() {
    angleVal=0.5; angleDir=1;
    const tick = () => {
        if (currentStatus!=='READY_TO_LAUNCH') return;
        angleVal += angleDir*0.010*gaugeSpeedMult;
        if (angleVal>=1) { angleVal=1; angleDir=-1; }
        else if (angleVal<=0) { 
            angleVal=0; angleDir=1; 
            gaugeSpeedMult = Math.min(3.0, parseFloat((gaugeSpeedMult + 0.2).toFixed(1)));
        }
        document.getElementById('gauge-bar').style.height = `${angleVal*100}%`;
        document.getElementById('gauge-marker').style.bottom = `${angleVal*100}%`;
        launchAngle = 5+angleVal*30;
        angleTimerId = requestAnimationFrame(tick);
    };
    angleTimerId = requestAnimationFrame(tick);
}

function bindLaunchEvents() {
    const el = document.getElementById('ingame-stone');
    el.addEventListener('mousedown', dragStart); el.addEventListener('touchstart', dragStart, {passive:false});
    window.addEventListener('mousemove', dragMove); window.addEventListener('touchmove', dragMove, {passive:false});
    window.addEventListener('mouseup', dragEnd); window.addEventListener('touchend', dragEnd);
}
function unbindLaunchEvents() {
    const el = document.getElementById('ingame-stone');
    el.removeEventListener('mousedown', dragStart); el.removeEventListener('touchstart', dragStart);
    window.removeEventListener('mousemove', dragMove); window.removeEventListener('touchmove', dragMove);
    window.removeEventListener('mouseup', dragEnd); window.removeEventListener('touchend', dragEnd);
}
function dragStart(e) {
    if (currentStatus!=='READY_TO_LAUNCH') return;
    SoundManager.resume(); isDragging = true;
    if (e.touches?.length>0) { dragTouchId=e.touches[0].identifier; startX=e.touches[0].clientX; startY=e.touches[0].clientY; }
    else { dragTouchId=null; startX=e.clientX; startY=e.clientY; }
    startTime = Date.now(); e.cancelable && e.preventDefault();
}
function dragMove(e) {
    if (!isDragging || currentStatus!=='READY_TO_LAUNCH') return;
    let cx, cy;
    if (e.touches) {
        let t=null; for(let i=0;i<e.touches.length;i++) { if(e.touches[i].identifier===dragTouchId){t=e.touches[i];break;} }
        if (!t) return; cx=t.clientX; cy=t.clientY;
    } else { cx=e.clientX; cy=e.clientY; }
    const dy=startY-cy, dx=cx-startX;
    const el=document.getElementById('ingame-stone');
    el.style.transform=`translate(calc(-50% + ${dx}px), ${-Math.max(0,dy)}px) scale(${dy>0?1.05:1})`;
    if (dy>=150) triggerLaunch(150, dx);
    e.cancelable && e.preventDefault();
}
function dragEnd(e) {
    if (!isDragging) return;
    if (e.changedTouches) {
        let ok=false; for(let i=0;i<e.changedTouches.length;i++){if(e.changedTouches[i].identifier===dragTouchId){ok=true;break;}} if(!ok)return;
    }
    isDragging=false;
    let cx,cy; if (e.changedTouches){cx=e.changedTouches[0].clientX;cy=e.changedTouches[0].clientY;} else{cx=e.clientX;cy=e.clientY;}
    const dy=startY-cy, dx=cx-startX;
    if (dy>15) triggerLaunch(dy,dx);
    else { const el=document.getElementById('ingame-stone'); el.style.transition='transform 0.3s'; el.style.transform='translateX(-50%) scale(1)'; setTimeout(()=>el.style.transition='',350); }
}

function triggerLaunch(dy, dx) {
    isDragging = false; unbindLaunchEvents(); cancelAnimationFrame(angleTimerId);
    document.getElementById('swipe-guide').style.display = 'none'; document.getElementById('angle-gauge-wrap').style.display = 'none';

    const dur = Math.max(1, Date.now()-startTime); const effDy = Math.min(dy, 150);
    swipeSpeed = Math.min((effDy/dur)*15, 38); const distFact = effDy/150;

    stone.x = 0; stone.y = 0; stone.z = 15;
    const rad = launchAngle*Math.PI/180;
    stone.vy = (swipeSpeed*Math.cos(rad))*distFact;
    stone.vz = (swipeSpeed*Math.sin(rad)*0.75)*distFact;
    stone.vx = ((dx/dur)*2)*distFact;

    let zone = getAngleZone(angleVal);
    if (gaugeSpeedMult >= 3.0 && zone === 'PERFECT') { zone = 'EASTEREG'; }

    let ap=null, isCrit=false, isLotto=false; const ss = selectedStone;
    if (ss.rarity==='Mythic') {
        if (window.forceLotto || Math.random()<ss.physics.lottoChance) { ap=JSON.parse(JSON.stringify(ss.physics.lottoPhysics)); isLotto=true; }
        else {
            const ref = Math.random()<0.5 ? STONES[0] : STONES[2];
            if (ref===STONES[2] && (window.forceCrit||Math.random()<ref.physics.critChance)) { ap=JSON.parse(JSON.stringify(ref.physics.critPhysics)); isCrit=true; }
            else { ap=JSON.parse(JSON.stringify(ref.physics)); if (window.forceCrit||Math.random()<(ap.critChance||0)) isCrit=true; }
        }
    } else if (ss.rarity==='Legendary') {
        if (window.forceCrit||Math.random()<ss.physics.critChance) { ap=JSON.parse(