// ===========================================================
//  🔊 Web Audio API 오디오 시스템
// ===========================================================
const SoundManager = {
    ctx: null, masterGain: null, isMuted: false,
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
            this.updateMuteUI();
        } catch(e) {}
    },
    resume() { this.init(); if (this.ctx && this.ctx.state==='suspended') this.ctx.resume(); },
    setMute(v) {
        this.isMuted = v;
        localStorage.setItem('xnot_mute', v);
        if (this.masterGain && this.ctx) this.masterGain.gain.setValueAtTime(v?0:0.6, this.ctx.currentTime);
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
        if (p) { [880,1320,1760].forEach((f,i)=>this._play(f,'sine',0.5,0.2/(i+1))); }
        else    { this._play(140,'sine',0.13,0.35,400); }
    },
    playSink() { this.resume(); for(let i=0;i<3;i++) { const d=i*0.08; setTimeout(()=>this._play(180-i*35,'sine',0.14,0.25,40),d*1000); } },
    playUpgrade() { this.resume(); this._play(523,'sine',0.12,0.15); setTimeout(()=>this._play(659,'sine',0.18,0.15),100); },
    playFanfare() {
        this.resume();
        const notes=[261,329,392,523,659,784];
        notes.forEach((f,i)=>setTimeout(()=>this._play(f,'triangle',0.4,0.12),i*70));
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
function applyI18n() { document.querySelectorAll('[data-i18n]').forEach(el => { const k=el.getAttribute('data-i18n'); if(t(k)!==k) el.innerText=t(k); }); }

// ===========================================================
//  📳 텔레그램 햅틱 진동 피드백
// ===========================================================
function haptic(type) {
    try {
        const h = window.Telegram?.WebApp?.HapticFeedback;
        if (!h) return;
        if (['light','medium','heavy'].includes(type)) h.impactOccurred(type);
        else if (['error','success'].includes(type)) h.notificationOccurred(type);
    } catch(e) {}
}

// ===========================================================
//  🪨 돌 고유 데이터 구조 명세
// ===========================================================
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

// ===========================================================
//  📊 게임 구동 전역 상태 엔진 변수
// ===========================================================
let playerHearts = 5;
let playerSP = 0;
let upgrades = { weight:0, elasticity:0, spin:0 };
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

// 실시간 3축 물리학 벡터
let stone = { x:0, y:0, z:0, vx:0, vy:0, vz:0, activePhys:null, isCrit:false, isLotto:false };
const GRAVITY = 0.16;
let swipeSpeed = 0;

// 화면 포지션 기준점
let W = window.innerWidth, H = window.innerHeight;
let CX = W/2, HORIZON_Y = H * 0.42;   
let STONE_FIXED_X = CX;               
let STONE_FIXED_Y = H * 0.68;         

// 입력 핸들러 제어 변수
let isDragging = false, dragTouchId = null;
let startX = 0, startY = 0, startTime = 0;

// 동적 수면 백드롭 이미지 프리 캐싱 레이어
const BG_FILES = [
    'images/milky_way01.png',
    'images/milky_way02.png',
    'images/milky_way03.png'
];
const bgImgCache = {};
BG_FILES.forEach(p => {
    const i = new Image();
    i.src = p;
    bgImgCache[p] = i;
});
let currentBgPath = BG_FILES[0];

const RARITY_BG = { Ordinary: new Image(), Rare: new Image(), Legendary: new Image(), Mythic: new Image() };
RARITY_BG.Ordinary.src  = 'images/background_ordinary.png';
RARITY_BG.Rare.src      = 'images/background_rare.png';
RARITY_BG.Legendary.src = 'images/background_legendary.png';
RARITY_BG.Mythic.src    = 'images/background_mythic.png';

// 엔티티 오브젝트 풀
let particles = [];
let wakes = [];
let rippleLayers = [];
for (let i=0; i<14; i++) rippleLayers.push({ z: i/14 });

const LAYERS = [
    { id:'sky',      parallax:0.0  },
    { id:'far-isle', parallax:0.04 },
    { id:'horizon',  parallax:0.10 },
    { id:'water-far',parallax:0.20 },
    { id:'water-mid',parallax:0.42 },
    { id:'water-near',parallax:0.78},
    { id:'shore',    parallax:1.4  }
];
let layerProgress = 0; 

// ===========================================================
//  🖼️ 디스플레이 렌더러 파이프라인 컨텍스트 초기화
// ===========================================================
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

// ===========================================================
//  💾 데이터 입출력 (Local & Cloud Storage)
// ===========================================================
function saveData() {
    const d = { sp:playerSP, upgrades };
    localStorage.setItem('xnot_v4_save', JSON.stringify(d));
    try { window.Telegram?.WebApp?.CloudStorage?.setItem('stone_v4', JSON.stringify(d)); } catch(e){}
}
function loadData() {
    const raw = localStorage.getItem('xnot_v4_save');
    if (raw) {
        try {
            const p = JSON.parse(raw);
            playerSP = p.sp||0;
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

// ===========================================================
//  📱 텔레그램 SDK 초기화 샌드박스
// ===========================================================
function initTMA() {
    if (!window.Telegram?.WebApp) return;
    const tg = window.Telegram.WebApp;
    tg.ready(); tg.expand();
    try { tg.setHeaderColor('#050510'); tg.setBackgroundColor('#050510'); } catch(e){}
    const u = tg.initDataUnsafe?.user;
    if (u) {
        document.getElementById('user-name').innerText = u.first_name||u.username||'Guest';
        document.getElementById('user-card').style.display = 'flex';
    }
}

// ===========================================================
//  🎨 인터페이스 헬퍼 메소드
// ===========================================================
function updateAssetUI() {
    const hc = document.getElementById('hearts-count');
    const sc = document.getElementById('sp-count');
    if (hc) hc.innerText = playerHearts;
    if (sc) sc.innerText = playerSP.toLocaleString();
    
    const rt = document.getElementById('roulette-title');
    const mb = document.getElementById('main-btn'); // 💡 명확한 로컬 변수 확보
    
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
    el.classList.remove('shaking');
    void el.offsetWidth;
    el.classList.add('shaking');
    haptic(strength==='heavy'?'heavy':'medium');
    setTimeout(()=>el.classList.remove('shaking'), 480);
}

function spawnDramaticText(text, cls='neon-lime') {
    const d = document.createElement('div');
    d.className = `dramatic-text ${cls}`;
    d.innerText = text;
    document.getElementById('game-container').appendChild(d);
    setTimeout(()=>d.remove(), 1900);
}

function changeRandomBg() {
    currentBgPath = BG_FILES[Math.floor(Math.random()*BG_FILES.length)];
    document.getElementById('game-container').style.background = `url('${currentBgPath}') no-repeat center/cover`;
}

// ===========================================================
//  🎰 룰렛 물리 정지 가챠 머신 로직
// ===========================================================
function getCurrentRotation(el) {
    const tr = window.getComputedStyle(el).transform;
    if (tr==='none') return 0;
    const v = tr.split('(')[1].split(')')[0].split(',');
    let a = Math.round(Math.atan2(parseFloat(v[1]),parseFloat(v[0]))*(180/Math.PI));
    return a<0?a+360:a;
}

function triggerWheel(e) {
    e?.preventDefault();
    SoundManager.resume();
    if (playerHearts<=0) { openYoutubeCharge(); return; }
    if (isSpinning || currentStatus!=='PRE_SPIN') return;
    isSpinning = true;

    const idx = Math.floor(Math.random()*STONES.length);
    const stone_def = STONES[idx];
    
    // 1. 네 가지 돌(0:슬레이트, 1:조약돌, 2:현무암, 3:황금운석)이 
    //    12시 바늘 밑으로 오기 위해 필요한 정확한 룰렛판 회전 오프셋 각도 재매핑
    const offsets = [315, 225, 135, 45]; 
    const offset = offsets[idx];

    // 6바퀴(2160도)를 돌고 목표 대각선 각도만큼 더 진진하여 바늘 밑에 안착
    const totalRot = 2160 + offset; 

    const wEl = document.getElementById('roulette-wheel');
    wEl.style.transition = 'transform 3.8s cubic-bezier(0.15, 0.85, 0.15, 1)';
    wEl.style.transform = `rotate(${totalRot}deg)`;

    // 가챠 바퀴 회전 틱 사운드 피드백
    let lastSector = 0;
    const tick = () => {
        if (!isSpinning) return;
        const cur = Math.floor(getCurrentRotation(wEl)/45);
        if (cur!==lastSector) { haptic('light'); SoundManager.playTick(); lastSector=cur; }
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    wEl.addEventListener('transitionend', ()=>{
        wEl.style.transition = 'none';
        // 애니메이션 종료 후 해당 대각선 정중앙 각도로 깔끔하게 고정 보정
        wEl.style.transform = `rotate(${offset}deg)`; 

        selectedStone = stone_def;
        document.getElementById('stone-desc-text').innerText = t(selectedStone.nameKey+'Desc');
        
        // index.html 에러 방지 예외 처리
        const rt = document.getElementById('roulette-title');
        if (rt) rt.innerText = t('stoneReady');
        
        // 정확한 대각선 구역에 불빛(하이라이트) 켜기
        const sectors = wEl.querySelectorAll('.wheel-sector');
        sectors.forEach((sec, sIdx) => {
            if(sIdx === idx) sec.classList.add('highlight');
            else sec.classList.remove('highlight');
        });

        // 버튼 정상 활성화 및 스위칭
        const mb = document.getElementById('main-btn');
        if (mb) {
            mb.innerText = t('launchBtn');
            mb.style.background = 'linear-gradient(135deg,var(--neon-lime),#a8ff00)';
            mb.style.color = 'var(--ink)';
        }

        currentStatus = 'SPIN_DONE';
        isSpinning = false;
        haptic('success');
    }, { once:true });
}

function handleMainBtn(e) {
    e?.preventDefault();
    SoundManager.resume();
    if (playerHearts<=0 && currentStatus==='PRE_SPIN') { openYoutubeCharge(); return; }
    if (currentStatus==='PRE_SPIN') { triggerWheel(); return; }
    if (currentStatus==='SPIN_DONE') {
        playerHearts--;
        updateAssetUI();
        playSeamlessTransition();
    }
}

// ===========================================================
//  🎬 심리스 프레임 스케일 트랜지션
// ===========================================================
function playSeamlessTransition() {
    const overlay = document.getElementById('transition-overlay');
    const img     = document.getElementById('transition-stone-img');
    const roulette = document.getElementById('roulette-screen');

    overlay.style.display = 'flex';
    overlay.style.background = 'rgba(5,5,20,0)';

    img.style.backgroundImage = `url('${selectedStone.img}')`;
    img.style.width  = `${selectedStone.w}px`;
    img.style.height = `${selectedStone.h}px`;
    img.style.transform = 'scale(1)';
    img.style.opacity = '1';
    img.style.transition = 'none';

    requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
            img.style.transition = 'transform 0.55s cubic-bezier(0.2,0,0.8,1), opacity 0.55s ease';
            img.style.transform  = 'scale(8)';
            img.style.opacity    = '0';

            overlay.style.transition = 'background 0.3s ease 0.2s';
            overlay.style.background = 'rgba(5,5,20,0.95)';

            roulette.style.transition = 'opacity 0.35s ease 0.15s';
            roulette.style.opacity = '0';

            setTimeout(()=>{
                roulette.style.display = 'none'; roulette.style.opacity = ''; roulette.style.transition = '';
                overlay.style.display = 'none'; overlay.style.background = ''; overlay.style.transition = '';
                img.style.transform = 'scale(1)'; img.style.opacity = '1'; img.style.transition = '';
                startGameplay();
            }, 580);
        });
    });
}

// ===========================================================
//  🕹️ 인게임 진입 및 조작 인터페이스 활성화
// ===========================================================
function startGameplay() {
    setStoneStyle();
    const stoneEl = document.getElementById('ingame-stone');
    stoneEl.style.display = 'block'; stoneEl.style.left = `${CX}px`;
    stoneEl.style.bottom = '80px'; stoneEl.style.top = 'auto';
    stoneEl.style.transform = 'translateX(-50%) scale(1)'; stoneEl.style.opacity = '1';

    document.getElementById('score-display').innerText = t('ready');
    document.getElementById('message').innerText       = t('prepareMsg');
    document.getElementById('swipe-guide').style.display = 'block';
    document.getElementById('angle-gauge-wrap').style.display = 'block';

    currentStatus = 'READY_TO_LAUNCH';
    updateGaugePerfectZone();
    startAngleGauge();
    bindLaunchEvents();
    drawStaticBackground();
}

function setStoneStyle() {
    const el = document.getElementById('ingame-stone');
    const s  = selectedStone;
    el.style.width  = `${s.w}px`; el.style.height = `${s.h}px`;
    el.style.backgroundImage    = `url('${s.img}')`;
    el.style.backgroundSize     = 'contain'; el.style.backgroundRepeat = 'no-repeat'; el.style.backgroundPosition = 'center';
    el.style.backgroundColor    = 'transparent'; el.style.border = 'none'; el.style.boxShadow = 'none';
    
    el.style.filter = s.rarity==='Mythic'
        ? 'drop-shadow(0 0 22px rgba(255,215,0,0.85)) drop-shadow(0 8px 14px rgba(0,0,0,0.5))'
        : 'drop-shadow(0 6px 12px rgba(0,0,0,0.55))';
}

// ===========================================================
//  📐 삼각함수 보정 각도 피치 게이지
// ===========================================================
function getAngleZone(angle) {
    const sr = (2+upgrades.spin*0.8)*(2/3);
    const remH = 15-sr; const safeR = remH*0.6, redR = remH*0.4;
    if (angle>=20-sr && angle<=20+sr) return 'PERFECT';
    if ((angle>=5+redR && angle<20-sr)||(angle>20+sr && angle<=20+sr+safeR)) return 'SAFETY';
    return 'RED';
}

function updateGaugePerfectZone() {
    const sr = (2+upgrades.spin*0.8)*(2/3);
    const remH=15-sr, safeR=remH*0.6, redR=remH*0.4;
    const set=(id,bot,h)=>{ const el=document.getElementById(id); el.style.bottom=`${bot}%`; el.style.height=`${h}%`; };
    set('gz-red-bot',  ((5-5)/30)*100, (redR/30)*100);
    set('gz-safe-bot', ((5+redR-5)/30)*100, (safeR/30)*100);
    const pBot=((20-sr-5)/30)*100, pH=((sr*2)/30)*100;
    const pEl=document.getElementById('gz-perfect');
    pEl.style.bottom=`${pBot}%`; pEl.style.height=`${pH}%`;
    set('gz-safe-top', ((20+sr-5)/30)*100, (safeR/30)*100);
    set('gz-red-top',  ((20+sr+safeR-5)/30)*100, (redR/30)*100);
}

function startAngleGauge() {
    angleVal=0.5; angleDir=1;
    const tick = () => {
        if (currentStatus!=='READY_TO_LAUNCH') return;
        angleVal += angleDir*0.010;
        if (angleVal>=1) { angleVal=1; angleDir=-1; }
        else if (angleVal<=0) { angleVal=0; angleDir=1; }
        document.getElementById('gauge-bar').style.height = `${angleVal*100}%`;
        document.getElementById('gauge-marker').style.bottom = `${angleVal*100}%`;
        launchAngle = 5+angleVal*30;
        angleTimerId = requestAnimationFrame(tick);
    };
    angleTimerId = requestAnimationFrame(tick);
}

// ===========================================================
//  🤚 고속 스와이프 투척 메커니즘
// ===========================================================
function bindLaunchEvents() {
    const el = document.getElementById('ingame-stone');
    el.addEventListener('mousedown', dragStart);
    el.addEventListener('touchstart', dragStart, {passive:false});
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('touchmove', dragMove, {passive:false});
    window.addEventListener('mouseup', dragEnd);
    window.addEventListener('touchend', dragEnd);
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
    startTime = Date.now();
    e.cancelable && e.preventDefault();
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

// ===========================================================
//  🚀 동적 물리학 탄성 계수 대입 발사
// ===========================================================
function triggerLaunch(dy, dx) {
    isDragging = false; unbindLaunchEvents(); cancelAnimationFrame(angleTimerId);
    document.getElementById('swipe-guide').style.display = 'none';
    document.getElementById('angle-gauge-wrap').style.display = 'none';

    const dur = Math.max(1, Date.now()-startTime); const effDy = Math.min(dy, 150);
    swipeSpeed = Math.min((effDy/dur)*15, 38); const distFact = effDy/150;

    stone.x = 0; stone.y = 0; stone.z = 15;
    const rad = launchAngle*Math.PI/180;
    stone.vy = (swipeSpeed*Math.cos(rad))*distFact;
    stone.vz = (swipeSpeed*Math.sin(rad)*0.75)*distFact;
    stone.vx = ((dx/dur)*2)*distFact;

    let ap=null, isCrit=false, isLotto=false; const ss = selectedStone;
    if (ss.rarity==='Mythic') {
        if (window.forceLotto || Math.random()<ss.physics.lottoChance) { ap=JSON.parse(JSON.stringify(ss.physics.lottoPhysics)); isLotto=true; }
        else {
            const ref = Math.random()<0.5 ? STONES[0] : STONES[2];
            if (ref===STONES[2] && (window.forceCrit||Math.random()<ref.physics.critChance)) { ap=JSON.parse(JSON.stringify(ref.physics.critPhysics)); isCrit=true; }
            else { ap=JSON.parse(JSON.stringify(ref.physics)); if (window.forceCrit||Math.random()<(ap.critChance||0)) isCrit=true; }
        }
    } else if (ss.rarity==='Legendary') {
        if (window.forceCrit||Math.random()<ss.physics.critChance) { ap=JSON.parse(JSON.stringify(ss.physics.critPhysics)); isCrit=true; }
        else { ap=JSON.parse(JSON.stringify(ss.physics)); }
    } else {
        ap=JSON.parse(JSON.stringify(ss.physics)); if (window.forceCrit||Math.random()<(ap.critChance||0)) isCrit=true;
    }

    const sf = swipeSpeed/20; if (ap) ap.friction = Math.min(0.9994, (ap.friction||0.978) + sf*0.0006);

    stone.activePhys = ap; stone.isCrit = isCrit; stone.isLotto = isLotto;
    bounceCount = 0; perfectCount = 0; isDead = false; hasTappedBounce = false; tapsInCurrentCycle = 0;
    particles = []; wakes = []; for (let i=0;i<14;i++) rippleLayers[i].z = i/14; layerProgress = 0;

    currentStatus = 'FLYING'; isPlaying = true;
    document.getElementById('score-display').innerText = 'BOUNCE: 0';

    SoundManager.playLaunch(swipeSpeed);
    if (swipeSpeed>=30) {
        document.getElementById('message').innerText = `⚡ ${t('lightningLaunch')} ⚡`;
        spawnDramaticText(t('lightningLaunch'), 'neon-gold'); triggerShake('heavy');
    } else if (swipeSpeed>=20) {
        document.getElementById('message').innerText = `🔥 ${t('fastLaunch')} 🔥`;
        spawnDramaticText(t('fastLaunch'), 'neon-lime'); triggerShake('medium');
    } else {
        document.getElementById('message').innerText = t('normalLaunch'); haptic('medium');
    }

    document.getElementById('game-container').addEventListener('mousedown', registerBounceTap);
    document.getElementById('game-container').addEventListener('touchstart', registerBounceTap, {passive:true});

    runGameLoop();
}

function runGameLoop() {
    if (!isPlaying) return;
    updatePhysics(); draw7LayerBG(); drawFxCanvas();
    animFrameId = requestAnimationFrame(runGameLoop);
}

// ===========================================================
//  ⚙️ 고정식 2.5D 스크롤 물리 계산 파이프라인
// ===========================================================
function updatePhysics() {
    if (isDead) {
        stone.vz -= GRAVITY*0.5; stone.z += stone.vz;
        if (stone.z < -50) { endGame(); return; }
        applyStonePos(); return;
    }

    rippleLayers.forEach(l => { l.z += stone.vy*0.0007; if (l.z>=1.0) l.z -= 1.0; });

    for (let i=wakes.length-1;i>=0;i--) {
        const w=wakes[i]; w.xL+=w.vxL; w.xR+=w.vxR; w.y+=w.vy; w.vy*=0.94; w.alpha-=0.022;
        if (w.alpha<=0) wakes.splice(i,1);
    }

    layerProgress += stone.vy * 0.00008;
    stone.y += stone.vy; stone.z += stone.vz; stone.vz -= GRAVITY;

    const wm = 1+(upgrades.weight*0.0008); const sfm = 1+(swipeSpeed*0.0001);
    const fr = stone.activePhys ? stone.activePhys.friction : 0.978;
    const baseFr = Math.min(0.9998, fr*wm*sfm);
    const k = 0.04;
    const effectiveFriction = 0.985 + (baseFr - 0.985) * Math.exp(-k * stone.vy);
    stone.vy *= effectiveFriction;
    stone.vx *= Math.min(0.999, 0.99*wm);

    // 방치형 자동 바운스: 유저가 탭하지 않은 상태에서 수면에 닿으면 GOOD 판정으로 자동 바운스
    if (stone.vz < 0 && stone.z <= 0 && !hasTappedBounce && !isDead) {
        hasTappedBounce = true;
        processBounce('GOOD', true);
    }

    // 미입력/패널티 침수 처리: 탭 기회를 소진했거나 연타로 인해 가라앉는 경우
    if (stone.vz < 0 && stone.z < -6 && !isDead) {
        triggerWaterMiss();
    }

    if (stone.vy<0.8 && !isDead) { triggerWaterSink(); }
    if (currentStatus==='FLYING' && !isDead) { createTrailParticle(STONE_FIXED_X, STONE_FIXED_Y); }

    applyStonePos();
}

function applyStonePos() {
    const el = document.getElementById('ingame-stone');
    const bounceOff = isDead ? stone.z*2 : stone.z * 1.8;
    const x = STONE_FIXED_X; const y = STONE_FIXED_Y - bounceOff;

    el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.bottom = 'auto';

    const rot = stone.y * 2.8;
    if (isDead) {
        const op = Math.max(0, 1+stone.z/50);
        el.style.transform = `translate(-50%,-50%) scale(0.9) rotate(${rot}deg)`; el.style.opacity = op;
    } else {
        el.style.transform = `translate(-50%,-50%) scale(1) rotate(${rot}deg)`; el.style.opacity = '1';
    }
}

// ===========================================================
//  🎯 실시간 타이밍 탭 판정 레이어
// ===========================================================
function registerBounceTap(e) {
    if (currentStatus !== 'FLYING' || isDead) return;

    // 돌이 상승 중일 때 탭하면 연타/스팸으로 간주하여 패널티를 부여하고 이번 주기의 탭 기회를 박탈
    if (stone.vz >= 0) {
        hasTappedBounce = true; // 플래그를 강제로 true로 묶어 연타 차단
        stone.vy *= 0.40;       // 전진 속도(vy)를 0.40배 이하로 꺾음
        stone.vz *= 0.40;
        spawnDramaticText('연타 패널티! 밸런스 붕괴', 'neon-red');
        haptic('error');
        return;
    }

    // 이미 이번 낙하 주기에서 탭을 한 상태에서 또 탭한 경우 (연타 패널티)
    if (hasTappedBounce) {
        stone.vy *= 0.40;       // 전진 속도(vy)를 0.40배 이하로 꺾음
        stone.vz *= 0.40;
        spawnDramaticText('연타 패널티! 밸런스 붕괴', 'neon-red');
        haptic('error');
        return;
    }

    hasTappedBounce = true;
    tapsInCurrentCycle = 1;

    const targetRingScale = 1.0 + stone.z / 30;

    let rating = 'BAD';
    if (targetRingScale >= 0.85 && targetRingScale <= 1.15) {
        rating = 'PERFECT';
    } else {
        rating = 'BAD'; // 15% 오차범위 밖일 때 터치하면 패널티(BAD) 작동
    }

    processBounce(rating, false);
}

function processBounce(rating, isAuto = false) {
    bounceCount++; const ex = STONE_FIXED_X, ey = STONE_FIXED_Y;

    if (!isAuto) {
        spawnRatingText(ex, ey, rating);
    }
    spawnRipple(ex, ey);

    const em = Math.pow(1.08, upgrades.elasticity);
    const sp = stone.activePhys || selectedStone.physics; const rarity = selectedStone.rarity;

    if (rarity==='Mythic') triggerShake('heavy');
    else if (rarity==='Legendary') triggerShake('medium');
    else if (rarity==='Rare') triggerShake('light');

    let pCount = rarity==='Mythic'?120 : rarity==='Legendary'?60 : rarity==='Rare'?35 : 22;
    let baseVz=0, multEff=1;

    if (rating==='PERFECT') {
        perfectCount++; baseVz = (sp.baseVz||1.5) + (selectedStone.mult*0.4); multEff = 1.06;
        stone.vy = stone.vy * 1.35 + (upgrades.weight * 1.5);
        const earned = Math.round(100*selectedStone.mult*2.5);
        if (!isAuto) {
            document.getElementById('message').innerText = `${t('perfectTiming')} (+${earned} SP)`;
        }
        playerSP += earned; createParticles(ex,ey,true,false,Math.round(pCount*1.5));
        haptic('heavy'); SoundManager.playBounce(true);
        if (perfectCount===1 && !isAuto) { spawnDramaticText(t('perfect')+' BOUNCE!','neon-lime'); triggerShake('medium'); }
        if (rarity==='Mythic') spawnGodSplash(ex,ey);
    } else if (rating==='GOOD') {
        baseVz = (sp.baseVz||1.5)*0.8 + selectedStone.mult*0.2; multEff = 0.98;
        stone.vy = stone.vy * 1.15 + (upgrades.weight * 0.5);
        const earned = Math.round(100*selectedStone.mult*1.2);
        if (!isAuto) {
            document.getElementById('message').innerText = `${t('goodTiming')} (+${earned} SP)`;
        }
        playerSP += earned; createParticles(ex,ey,false,false,pCount);
        haptic('medium'); SoundManager.playBounce(false);
        if (rarity==='Mythic') spawnGodSplash(ex,ey);
    } else {
        baseVz = (sp.baseVz||1.5)*0.22; multEff = 0.40;
        const earned = Math.round(100*selectedStone.mult*0.4);
        if (!isAuto) {
            document.getElementById('message').innerText = t('badTiming');
        }
        playerSP += earned; createParticles(ex,ey,false,false,4,true);
        haptic('light'); SoundManager.playBounce(false);
    }

    triggerWake(ex, ey, 1.0);
    const spEl = document.getElementById('sp-count'); spEl.style.transform='scale(1.3)'; spEl.style.color='var(--neon-gold)';
    setTimeout(()=>{ spEl.style.transform=''; spEl.style.color=''; }, 220);

    const bdec = Math.pow(sp.vzDecay||0.83, bounceCount-1); const sbns = 1+(swipeSpeed/30);
    const zone = getAngleZone(launchAngle); let zM=1, zvB=0;
    if (zone==='PERFECT') { zM=1.25; zvB=0.2; } else if (zone==='SAFETY') { zM=1.08; zvB=0.05; }

    stone.z=0.1; stone.vz = (baseVz+zvB)*em*sbns*bdec;
    const vdec = Math.pow(sp.vyDecay||0.92, bounceCount-1);
    if (rating === 'BAD') {
        stone.vy *= 0.40;
    } else {
        const nvy = stone.vy * multEff * (1+(swipeSpeed*0.004)) * zM * vdec;
        stone.vy = Math.min(nvy, stone.vy*Math.max(0.96,multEff*zM)*vdec);
    }
    stone.vx *= 0.9;

    hasTappedBounce = false;
    tapsInCurrentCycle = 0;
    document.getElementById('score-display').innerText = `BOUNCE: ${bounceCount}`;
    updateAssetUI(); saveData(); spawnBounceMarker(ex, ey, bounceCount);
}

function triggerWaterMiss() {
    isDead=true; stone.vz=-3; const ex=STONE_FIXED_X, ey=STONE_FIXED_Y;
    spawnRatingText(ex,ey,'MISS'); spawnRipple(ex,ey); createParticles(ex,ey,false,true,22);
    document.getElementById('message').innerText = t('missMsg'); haptic('error'); SoundManager.playSink();
}
function triggerWaterSink() {
    if (isDead) return;
    isDead=true; stone.vz=-1.5; const ex=STONE_FIXED_X, ey=STONE_FIXED_Y;
    spawnRipple(ex,ey); createParticles(ex,ey,false,true,14);
    document.getElementById('message').innerText = t('sinkMsg'); haptic('error'); SoundManager.playSink();
}

function triggerWake(x,y,scale) { wakes.push({ x,y,vxL:-W*0.015*scale,vxR:W*0.015*scale, vy:H*0.022*scale,width:9*scale,alpha:1,xL:x,xR:x }); }

// ===========================================================
//  🖼️ [Gem 직접 코딩] 정통 3단 레이어 중첩 패럴랙스 엔진 (원상 복구 완료)
// ===========================================================
function drawStaticBackground() {
    bgCtx.clearRect(0, 0, W, H);
    const img1 = bgImgCache['images/milky_way01.png'];
    const img2 = bgImgCache['images/milky_way02.png'];
    const img3 = bgImgCache['images/milky_way03.png'];

    // 로비 대기 화면: 각 레이어를 지정된 물리 영역에 알맞은 비율로 배치하여 중첩 렌더링
    if (img1 && img1.complete) {
        bgCtx.drawImage(img1, 0, 0, W, HORIZON_Y);
    }
    if (img2 && img2.complete) {
        bgCtx.drawImage(img2, 0, 0, W, HORIZON_Y);
    }
    if (img3 && img3.complete) {
        bgCtx.drawImage(img3, 0, HORIZON_Y, W, H - HORIZON_Y);
    }
}

function draw7LayerBG() {
    bgCtx.clearRect(0, 0, W, H);
    const vp = { x: W / 2, y: HORIZON_Y };
    const rarity = selectedStone?.rarity || 'Ordinary';

    const img1 = bgImgCache['images/milky_way01.png'];
    const img2 = bgImgCache['images/milky_way02.png'];
    const img3 = bgImgCache['images/milky_way03.png'];

    // 🌌 Layer 1: 은하수 하늘 -> 화면 상단 구역(0, 0, W, HORIZON_Y)에 고정
    if (img1 && img1.complete) {
        bgCtx.drawImage(img1, 0, 0, W, HORIZON_Y);
    }

    // ⛰️ Layer 2: 먼 산/섬 -> 화면 상단 구역(0, 0, W, HORIZON_Y) 내부에서 느리게 루프 스크롤 (배율 0.05)
    if (img2 && img2.complete) {
        bgCtx.save();
        bgCtx.beginPath();
        bgCtx.rect(0, 0, W, HORIZON_Y);
        bgCtx.clip();

        let y2 = (stone.y * 0.05) % HORIZON_Y;
        if (y2 < 0) y2 += HORIZON_Y;

        bgCtx.drawImage(img2, 0, y2, W, HORIZON_Y);
        bgCtx.drawImage(img2, 0, y2 - HORIZON_Y, W, HORIZON_Y);
        bgCtx.restore();
    }

    // 🌊 Layer 3: 강물 표면 -> 오직 지평선 아래 수면 범위(waterH = H - HORIZON_Y) 내부에서만 초고속 루프 스크롤 (배율 1.0)
    // 💡 투명 마스크가 상단 레이어를 지우지 않도록 목적지 좌표의 높이와 범위를 지평선 아래로 물리 격리
    const waterH = H - HORIZON_Y;
    if (img3 && img3.complete && waterH > 0) {
        let y3 = (stone.y * 1.0) % waterH;
        if (y3 < 0) y3 += waterH;

        bgCtx.drawImage(img3, 0, HORIZON_Y + y3, W, waterH);
        bgCtx.drawImage(img3, 0, HORIZON_Y + y3 - waterH, W, waterH);
    }

    // 수면 물결선 (rippleLayers) 렌더링 -> 고정 수면 위치(HORIZON_Y) 기준으로 원근 투영 유지
    rippleLayers.forEach(l => {
        const rz = l.z; 
        const lineY = HORIZON_Y + (H - HORIZON_Y) * Math.pow(rz, 2.2); 
        const hw = W * 0.5 * Math.pow(rz, 1.4);
        let lAlpha = rz * 0.18; 
        if (rarity === 'Rare') lAlpha = rz * 0.25; 
        else if (rarity === 'Legendary') lAlpha = rz * 0.28; 
        else if (rarity === 'Mythic') lAlpha = rz * 0.35;

        bgCtx.beginPath(); 
        bgCtx.moveTo(vp.x - hw, lineY); 
        bgCtx.lineTo(vp.x + hw, lineY);
        
        let sc = 'rgba(255,255,255,' + lAlpha + ')';
        if (rarity === 'Rare') sc = `rgba(0,240,255,${lAlpha})`; 
        else if (rarity === 'Legendary') sc = `rgba(192,132,252,${lAlpha})`; 
        else if (rarity === 'Mythic') sc = `rgba(255,215,0,${lAlpha})`;
        
        bgCtx.strokeStyle = sc; 
        bgCtx.lineWidth = 0.5 + rz * 2.2; 
        bgCtx.stroke();
    });

    // 수동 수면 웨이크 (wakes) 렌더링
    wakes.forEach(w => {
        bgCtx.save(); 
        bgCtx.beginPath(); 
        bgCtx.moveTo(w.x, w.y); 
        bgCtx.lineTo(w.xL, w.y + (w.y - HORIZON_Y) * 0.2);
        bgCtx.moveTo(w.x, w.y); 
        bgCtx.lineTo(w.xR, w.y + (w.y - HORIZON_Y) * 0.2);
        bgCtx.strokeStyle = `rgba(255,255,255,${w.alpha * 0.8})`; 
        bgCtx.lineWidth = w.width * w.alpha; 
        bgCtx.lineCap = 'round'; 
        bgCtx.stroke(); 
        bgCtx.restore();
    });
}

// ===========================================================
//  ✨ 카툰 속도선 & 이펙트 파티클 렌더링 엔진
// ===========================================================
function drawFxCanvas() {
    fxCtx.clearRect(0,0,W,H);

    if (currentStatus==='FLYING' && !isDead) {
        const speed = stone.vy;
        if (speed > 3) {
            const lineCount = Math.min(72, Math.floor((speed - 3) * 3.5));
            const alpha = Math.max(0, Math.min(0.8, (speed - 3) / 20));
            fxCtx.save(); fxCtx.globalAlpha = alpha;
            for (let i=0; i<lineCount; i++) {
                const angle = (i/lineCount)*Math.PI*2 + (stone.y*0.05);
                const startR = W*0.42 + Math.random()*W*0.10; const endR = W*0.55 + Math.random()*W*0.25;
                const ex1 = CX + Math.cos(angle)*startR; const ey1 = HORIZON_Y + Math.sin(angle)*startR*0.45;
                const ex2 = CX + Math.cos(angle)*endR; const ey2 = HORIZON_Y + Math.sin(angle)*endR*0.45;

                const rarity = selectedStone?.rarity||'Ordinary'; let lc = 'rgba(255,255,255,0.8)';
                if (rarity==='Mythic') lc='rgba(255,215,0,0.9)'; else if (rarity==='Legendary') lc='rgba(192,132,252,0.85)'; else if (rarity==='Rare') lc='rgba(0,240,255,0.85)';

                fxCtx.beginPath(); fxCtx.moveTo(ex1,ey1); fxCtx.lineTo(ex2,ey2); fxCtx.strokeStyle=lc;
                fxCtx.lineWidth = (Math.random()*2+0.5) * Math.max(0.5, Math.min(3.0, (speed - 3) / 10));
                fxCtx.shadowBlur=3; fxCtx.shadowColor='#000'; fxCtx.stroke();
            }
            fxCtx.restore();
        }
    }

    for (let i=particles.length-1;i>=0;i--) { const p=particles[i]; p.update(); p.draw(fxCtx); if (p.alpha<=0) particles.splice(i,1); }

    if (currentStatus==='FLYING' && !isDead) {
        const s = selectedStone || STONES[0];
        const rxRef = s.w / 2;
        const ryRef = (s.w / 2) * 0.4;

        fxCtx.save();
        // 1. 기준 타겟 원 그리기 (돌 아래 수면 고정 좌표)
        fxCtx.beginPath();
        fxCtx.ellipse(STONE_FIXED_X, STONE_FIXED_Y, rxRef, ryRef, 0, 0, Math.PI * 2);
        fxCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        fxCtx.lineWidth = 2;
        fxCtx.stroke();
        fxCtx.restore();

        // 2. 돌이 낙하할 때 외부에서 이 과녁을 향해 수축하는 동적 타이밍 원 그리기
        if (stone.vz < 0) {
            const scale = 1.0 + stone.z / 30;
            const rxTiming = rxRef * scale;
            const ryTiming = ryRef * scale;

            fxCtx.save();
            fxCtx.beginPath();
            fxCtx.ellipse(STONE_FIXED_X, STONE_FIXED_Y, rxTiming, ryTiming, 0, 0, Math.PI * 2);

            if (scale >= 0.85 && scale <= 1.15) { // PERFECT 오차 15% 내외
                const isBlink = Math.floor(Date.now() / 80) % 2 === 0;
                fxCtx.strokeStyle = isBlink ? 'var(--neon-lime)' : 'rgba(217, 255, 0, 0.2)';
                fxCtx.lineWidth = 3.5;
                fxCtx.shadowBlur = 12;
                fxCtx.shadowColor = 'var(--neon-lime)';
            } else {
                fxCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
                fxCtx.lineWidth = 1.5;
                fxCtx.shadowBlur = 0;
                fxCtx.setLineDash([4, 4]);
            }

            fxCtx.stroke();
            fxCtx.restore();
        }
    }
}

// ===========================================================
//  ⚙️ 이펙트 서브 모듈 오브젝트 풀 인스턴스 클래스들
// ===========================================================
class TrailParticle {
    constructor(x,y) {
        this.x=x+(Math.random()-0.5)*22; this.y=y+8; this.vx=(Math.random()-0.5)*2.2; this.vy=-Math.random()*2.8-1.8; this.r=Math.random()*4+3; this.alpha=0.82; this.decay=Math.random()*0.042+0.025;
        const rarity=selectedStone?.rarity||'Ordinary';
        if (rarity==='Mythic') this.color=Math.random()>0.4?'#ffd700':'#f97316';
        else if (rarity==='Legendary') this.color=Math.random()>0.5?'#c084fc':'#e9d5ff';
        else if (rarity==='Rare') this.color=Math.random()>0.5?'#00f0ff':'#ffffff';
        else this.color='rgba(255,255,255,0.42)';
        this.rarity=rarity;
    }
    update() { this.x+=this.vx; this.y+=this.vy; this.r=Math.max(0.2,this.r*0.93); this.alpha-=this.decay; this.x+=(CX-this.x)*0.018; }
    draw(ctx) {
        ctx.save(); ctx.globalAlpha=Math.max(0,this.alpha); ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle=this.color;
        ctx.shadowBlur=this.rarity==='Mythic'?10:5; ctx.shadowColor=this.color; ctx.fill();
        if (this.r>1.5) { ctx.strokeStyle='rgba(0,0,0,0.6)'; ctx.lineWidth=1; ctx.stroke(); }
        ctx.restore();
    }
}

class ShockwaveRing {
    constructor(x,y,isPerfect) { this.x=x; this.y=y; this.radius=6; this.maxR=isPerfect?90:48; this.grow=isPerfect?5:2.8; this.alpha=1; this.decay=isPerfect?0.022:0.042; this.color=isPerfect?'rgba(217,255,0,0.9)':'rgba(255,255,255,0.7)'; }
    update() { this.radius+=this.grow; this.alpha-=this.decay; }
    draw(ctx) {
        ctx.save(); ctx.globalAlpha=Math.max(0,this.alpha); ctx.beginPath(); ctx.ellipse(this.x,this.y,this.radius,this.radius*0.44,0,0,Math.PI*2);
        ctx.strokeStyle=this.color; ctx.lineWidth=3.5; ctx.shadowBlur=14; ctx.shadowColor=this.color; ctx.stroke();
        ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=1.5; ctx.stroke(); ctx.restore();
    }
}

class SplashParticle {
    constructor(x,y,isPerfect,isSink) {
        this.x=x; this.y=y; const rarity=selectedStone?.rarity||'Ordinary'; let sm=1;
        if (rarity==='Mythic') sm=1.7; else if (rarity==='Legendary') sm=1.35; else if (rarity==='Rare') sm=1.15;
        const angle=Math.random()*Math.PI-Math.PI; const spd=(Math.random()*(isPerfect?11:7)+(isPerfect?3:1))*sm;
        this.vx=Math.cos(angle)*spd*0.7; this.vy=Math.sin(angle)*spd-(isSink?4.5:2.5); this.r=(Math.random()*(isPerfect?6:3)+2.2)*(rarity==='Mythic'?1.4:1); this.grav=rarity==='Mythic'?0.26:0.34; this.alpha=1; this.decay=(Math.random()*0.025+0.014)*(rarity==='Mythic'?0.72:1);
        if (rarity==='Mythic') { const rn=Math.random(); this.color=rn>0.65?'#ffd700':rn>0.4?'#d9ff00':rn>0.2?'#f97316':'#ffffff'; }
        else if (rarity==='Legendary') { this.color=Math.random()>0.5?'#c084fc':'#ffd700'; }
        else if (rarity==='Rare') { this.color=Math.random()>0.5?'#00f0ff':'#ffffff'; }
        else { this.color=isPerfect?(Math.random()>0.4?'#ffd700':'#d9ff00'):'#ffffff'; }
        this.rarity=rarity;
    }
    update() { this.x+=this.vx; this.y+=this.vy; this.vy+=this.grav; this.alpha-=this.decay; }
    draw(ctx) {
        ctx.save(); ctx.globalAlpha=Math.max(0,this.alpha); ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle=this.color;
        ctx.shadowBlur=this.rarity==='Mythic'?14:7; ctx.shadowColor=this.color; ctx.fill(); ctx.strokeStyle='rgba(0,0,0,0.45)'; ctx.lineWidth=1; ctx.stroke();
        ctx.restore();
    }
}

class GodSplashParticle {
    constructor(x,y) {
        this.x=x; this.y=y; const angle=Math.random()*Math.PI*2; const spd=Math.random()*22+8;
        this.vx=Math.cos(angle)*spd; this.vy=Math.sin(angle)*spd-(Math.random()*12+6); this.r=Math.random()*9+4; this.alpha=1; this.decay=Math.random()*0.014+0.007; this.grav=0.22;
        const rn=Math.random(); this.color=rn>0.6?'#ffd700':rn>0.35?'#ff8c00':rn>0.15?'#d9ff00':'#ffffff';
    }
    update() { this.x+=this.vx; this.y+=this.vy; this.vy+=this.grav; this.vx*=0.98; this.alpha-=this.decay; }
    draw(ctx) {
        ctx.save(); ctx.globalAlpha=Math.max(0,this.alpha); ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle=this.color;
        ctx.shadowBlur=20; ctx.shadowColor='#ffd700'; ctx.fill(); ctx.strokeStyle='rgba(0,0,0,0.5)'; ctx.lineWidth=1.5; ctx.stroke();
        ctx.restore();
    }
}

function spawnGodSplash(x,y) {
    const count = 200; for (let i=0;i<count;i++) { const p=new GodSplashParticle(x,y); p.vx = (Math.random()-0.5)*W*0.06; p.vy = -Math.random()*H*0.025 - 5; particles.push(p); }
    const flash=document.createElement('div'); flash.style.cssText='position:absolute;inset:0;background:rgba(255,215,0,0.35);z-index:250;pointer-events:none;animation:fade-flash 0.4s ease forwards;'; document.getElementById('game-container').appendChild(flash);
    const style=document.createElement('style'); style.textContent='@keyframes fade-flash{from{opacity:1}to{opacity:0}}'; document.head.appendChild(style);
    setTimeout(()=>{ flash.remove(); style.remove(); }, 420);
}

function createParticles(x,y,isPerfect,isSink,count,isBad=false) { if (!isSink && !isBad) particles.push(new ShockwaveRing(x,y,isPerfect)); const n=count>0?count:(isPerfect?38:(isSink?24:16)); for(let i=0;i<n;i++) particles.push(new SplashParticle(x,y,isPerfect,isSink,isBad)); }
function createTrailParticle(x,y) { const cnt = selectedStone?.rarity==='Mythic'?5:(stone.isCrit?3:1); for(let i=0;i<cnt;i++) particles.push(new TrailParticle(x,y)); }

// ===========================================================
//  🎯 DOM 애니메이션 오버레이 이펙트
// ===========================================================
function spawnRipple(x,y) { const r=document.createElement('div'); r.className='ripple'; r.style.left=`${x}px`; r.style.top=`${y}px`; document.getElementById('game-container').appendChild(r); setTimeout(()=>r.remove(),850); }
function spawnRatingText(x,y,rating) { const d=document.createElement('div'); d.className=`effect-text ${rating.toLowerCase()}`; d.style.left=`${x}px`; d.style.top=`${y-45}px`; const map={PERFECT:'PERFECT!',GOOD:'GOOD!',BAD:'BAD',MISS:'MISS'}; d.innerText=map[rating]||rating; document.getElementById('game-container').appendChild(d); setTimeout(()=>d.remove(),920); }
function spawnBounceMarker(x,y,count) {
    const d=document.createElement('div'); d.style.cssText=`position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%);background:rgba(0,0,0,0.75);color:#d9ff00;border:1.5px solid #d9ff00;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:900;z-index:18;pointer-events:none;text-shadow:-1px -1px 0 #000;animation:point-fade 1.5s ease-out forwards;`; d.innerText=`${count}◆`; document.getElementById('game-container').appendChild(d);
    const s=document.createElement('style'); s.textContent='@keyframes point-fade{0%{opacity:1;transform:translate(-50%,-50%) scale(1)}80%{opacity:0.7}100%{opacity:0;transform:translate(-50%,-60%) scale(0.8)}}'; document.head.appendChild(s);
    setTimeout(()=>{ d.remove(); s.remove(); },1500);
}

// ===========================================================
//  🏁 채굴 결과 정산 및 게임 루프 종료
// ===========================================================
function endGame() {
    isPlaying=false; cancelAnimationFrame(animFrameId);
    document.getElementById('game-container').removeEventListener('mousedown',registerBounceTap); document.getElementById('game-container').removeEventListener('touchstart',registerBounceTap);
    document.getElementById('ingame-stone').style.display='none'; fxCtx.clearRect(0,0,W,H);

    const earnedSP = Math.round(((bounceCount*100)+(perfectCount*150))*selectedStone.mult);
    document.getElementById('res-stone-name').innerText = t(selectedStone.nameKey); document.getElementById('res-stone-name').style.color = selectedStone.color;
    document.getElementById('res-bounce-count').innerText = `${bounceCount} ${t('bouncesUnit')}`; document.getElementById('res-perfect-count').innerText = `${perfectCount} ${t('bouncesUnit')}`;
    document.getElementById('res-earned-sp').innerText = `+${earnedSP.toLocaleString()} SP`;

    playerSP += earnedSP; saveData(); updateAssetUI(); haptic('success'); SoundManager.playFanfare();
    setAssetBarVisible(false); document.getElementById('result-modal').style.display='flex';
}

function closeResultModal() {
    document.getElementById('result-modal').style.display='none'; 
    
    // 💡 1. 상태 머신을 확실하게 PRE_SPIN(뽑기 전)으로 먼저 돌려놓습니다.
    currentStatus='PRE_SPIN'; 
    
    const rs=document.getElementById('roulette-screen'); 
    if (rs) {
        rs.style.display='flex'; 
        rs.style.opacity='1';
    }
    
    const rt = document.getElementById('roulette-title');
    if (rt) rt.innerText=t('lobbyTitle'); 
    
    const wc = document.getElementById('wheel-cap-text');
    if (wc) {
        wc.innerText=t('wheelTouch'); 
        wc.style.color='#fff';
    }
    
    const sd = document.getElementById('stone-desc-text');
    if (sd) sd.innerText='';

    // 💡 2. 버튼 엘리먼트를 확실하게 취득하여 가챠 버튼으로 강제 강제 리셋합니다.
    const mb = document.getElementById('main-btn');
    if (mb) {
        mb.innerText = t('spinBtn'); 
        mb.style.background = 'linear-gradient(135deg, var(--neon-lime) 0%, #a8ff00 100%)'; 
        mb.style.color = 'var(--ink)';
    }
    
    setAssetBarVisible(true); 
    updateAssetUI(); 
    changeRandomBg(); 
    drawStaticBackground();
}

// ===========================================================
//  📺 유튜브 보상형 에너지 완충 엔진
// ===========================================================
function openYoutubeCharge() {
    document.getElementById('youtube-modal').style.display='flex'; let sec=5; document.getElementById('video-timer').innerText=sec;
    const iv=setInterval(()=>{
        sec--; document.getElementById('video-timer').innerText=sec;
        if (sec<=0) { clearInterval(iv); playerHearts=5; document.getElementById('youtube-modal').style.display='none'; currentStatus='PRE_SPIN'; updateAssetUI(); haptic('success'); }
    },1000);
}

// ===========================================================
//  🛒 돌 스펙 강화 상점 코어 비즈니스 로직
// ===========================================================
function getUpgradeCost(t) { return Math.floor(UPGRADE_BASE_COST*Math.pow(1.65,upgrades[t])); }
function openShop() { if (isSpinning||currentStatus!=='PRE_SPIN') return; SoundManager.resume(); setAssetBarVisible(false); document.getElementById('shop-modal').style.display='flex'; updateShopUI(); haptic('light'); }
function closeShop() { SoundManager.resume(); document.getElementById('shop-modal').style.display='none'; setAssetBarVisible(true); haptic('light'); }

function updateShopUI() {
    document.getElementById('shop-sp-count').innerText=playerSP.toLocaleString();
    ['weight','elasticity','spin'].forEach(type=>{
        const lv=upgrades[type]; const btn=document.getElementById(`btn-${type}`); document.getElementById(`lv-${type}`).innerText=lv;
        if (lv>=MAX_LV) { document.getElementById(`next-lv-${type}`).innerText='Max'; document.getElementById(`cost-${type}`).innerText='MAX'; btn.disabled=true; } 
        else { document.getElementById(`next-lv-${type}`).innerText=lv+1; const cost=getUpgradeCost(type); document.getElementById(`cost-${type}`).innerText=cost.toLocaleString(); btn.disabled=playerSP<cost; }
        
        if (type==='weight') document.getElementById('val-weight').innerText=(lv*0.08).toFixed(1);
        else if (type==='elasticity') document.getElementById('val-elasticity').innerText=Math.round((Math.pow(1.08,lv)-1)*100);
        else if (type==='spin') document.getElementById('val-spin').innerText=Math.round(lv*12.8);
    });
}

function buyUpgrade(type) {
    if (upgrades[type]>=MAX_LV) return; const cost=getUpgradeCost(type); if (playerSP<cost) return;
    playerSP-=cost; upgrades[type]++; saveData(); updateAssetUI(); updateShopUI(); haptic('success'); SoundManager.playUpgrade();
    document.getElementById('message').innerText=`${t('upgradeSuccess')} (Lv.${upgrades[type]})`;
}

// ===========================================================
//  🚪 인트로 및 디버그 매개변수 초기화 진입점
// ===========================================================
function openInfoModal(e) { e?.preventDefault(); SoundManager.resume(); haptic('light'); document.getElementById('intro-info-modal').style.display='flex'; }
function closeInfoModal(e) { e?.preventDefault(); haptic('light'); document.getElementById('intro-info-modal').style.display='none'; }
function closeIntroScreen(e) { e?.preventDefault(); SoundManager.resume(); haptic('success'); const el=document.getElementById('intro-screen'); el.style.opacity='0'; setTimeout(()=>{ el.style.display='none'; setAssetBarVisible(true); },500); }

function initDebugParams() { try { const p=new URLSearchParams(window.location.search); window.debug=p.get('debug')==='true'; window.forceCrit=p.get('forceCrit')==='true'; window.forceLotto=p.get('forceLotto')==='true'; } catch(e){} }

initDebugParams(); initTMA(); initLang(); loadData(); applyI18n(); changeRandomBg(); drawStaticBackground();