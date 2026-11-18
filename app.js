(() => {
  'use strict';

  /* ==========================================================================
     CONSTANTS & CREDENTIALS
     ========================================================================== */
  const CREDENTIALS = Object.freeze({
    ADMIN: '88889999',
    USER: '2026'
  });

  const STORAGE_KEYS = Object.freeze({
    DATA: 'lucky_wheel_2026_data_v1',
    SESSION_ROLE: 'lucky_wheel_2026_session_role'
  });

  const EMOJI_PRESETS = ['🎁', '📱', '💰', '🏆', '💎', '🧧', '🎟️', '☕', '🏍️', '📺', '🎧', '🍀', '🎉', '😢'];
  const COLOR_PRESETS = [
    '#e63946', '#f77f00', '#f5b82e', '#2a9d8f',
    '#219ebc', '#3a86ff', '#7209b7', '#d62828',
    '#fb5607', '#06d6a0', '#8338ec', '#457b9d'
  ];

  const DEFAULT_DATA = {
    settings: {
      title: 'កម្មវិធីបង្វិលកងចាប់រង្វាន់ 2026',
      subtitle: 'សូមសំណាងល្អទាំងអស់គ្នា!',
      spinDurationSec: 5.5,
      showPlayerInput: true,
      showPrizeShowcase: true,
      nextSpinOverrideId: '' // '' = automatic weighted random
    },
    prizes: [
      {
        id: 'p1',
        name: 'ទូរស័ព្ទ iPhone 16',
        emoji: '📱',
        color: '#e63946',
        weight: 2,
        stock: 1,
        unlimited: false,
        isWin: true,
        active: true,
        description: 'រង្វាន់ធំប្រចាំកម្មវិធី!'
      },
      {
        id: 'p2',
        name: 'ទឹកប្រាក់ 100$',
        emoji: '💰',
        color: '#f5b82e',
        weight: 5,
        stock: 3,
        unlimited: false,
        isWin: true,
        active: true,
        description: 'អបអរសាទរ! អ្នកទទួលបានទឹកប្រាក់ 100$'
      },
      {
        id: 'p3',
        name: 'អាំងប៉ាវ 20$',
        emoji: '🧧',
        color: '#d62828',
        weight: 12,
        stock: 10,
        unlimited: false,
        isWin: true,
        active: true,
        description: 'ទទួលបានអាំងប៉ាវនាំសំណាង 20$'
      },
      {
        id: 'p4',
        name: 'បញ្ចុះតម្លៃ 30%',
        emoji: '🎟️',
        color: '#2a9d8f',
        weight: 22,
        stock: 0,
        unlimited: true,
        isWin: true,
        active: true,
        description: 'ប្រើប្រាស់ប័ណ្ណបញ្ចុះតម្លៃ 30% សម្រាប់ការទិញលើកក្រោយ'
      },
      {
        id: 'p5',
        name: 'កាហ្វេ ១ កែវ',
        emoji: '☕',
        color: '#3a86ff',
        weight: 24,
        stock: 20,
        unlimited: false,
        isWin: true,
        active: true,
        description: 'រីករាយជាមួយកាហ្វេដ៏ឈ្ងុយឆ្ងាញ់!'
      },
      {
        id: 'p6',
        name: 'កាដូអនុស្សាវរីយ៍',
        emoji: '🎁',
        color: '#8338ec',
        weight: 15,
        stock: 15,
        unlimited: false,
        isWin: true,
        active: true,
        description: 'សូមទាក់ទងក្រុមការងារដើម្បីទទួលកាដូ'
      },
      {
        id: 'p7',
        name: 'សំណាងលើកក្រោយ',
        emoji: '🍀',
        color: '#33415c',
        weight: 20,
        stock: 0,
        unlimited: true,
        isWin: false,
        active: true,
        description: 'កុំអស់សង្ឃឹម! សូមសាកល្បងម្តងទៀតនៅលើកក្រោយ'
      }
    ],
    history: []
  };

  /* ==========================================================================
     APPLICATION STATE
     ========================================================================== */
  let state = {
    role: null, // null | 'admin' | 'user'
    activeView: 'wheel', // 'wheel' | 'admin'
    adminTab: 'prizes', // 'prizes' | 'settings' | 'history'
    editingPrizeId: null,
    soundEnabled: true,
    isSpinning: false,
    currentRotation: 0,
    bulbPhase: 0,
    data: loadData()
  };

  /* ==========================================================================
     DOM REFERENCES
     ========================================================================== */
  const el = {
    loginScreen: document.getElementById('loginScreen'),
    loginAppTitle: document.getElementById('loginAppTitle'),
    loginForm: document.getElementById('loginForm'),
    passwordInput: document.getElementById('passwordInput'),
    togglePasswordBtn: document.getElementById('togglePasswordBtn'),
    loginError: document.getElementById('loginError'),

    appShell: document.getElementById('appShell'),
    headerTitle: document.getElementById('headerTitle'),
    headerSubtitle: document.getElementById('headerSubtitle'),
    adminNavMount: document.getElementById('adminNavMount'),
    roleBadge: document.getElementById('roleBadge'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    logoutBtn: document.getElementById('logoutBtn'),

    wheelView: document.getElementById('wheelView'),
    adminViewMount: document.getElementById('adminViewMount'),

    playerInputWrap: document.getElementById('playerInputWrap'),
    playerNameInput: document.getElementById('playerNameInput'),
    wheelCanvas: document.getElementById('wheelCanvas'),
    wheelPointer: document.getElementById('wheelPointer'),
    centerSpinBtn: document.getElementById('centerSpinBtn'),
    mainSpinBtn: document.getElementById('mainSpinBtn'),
    mainSpinBtnText: document.getElementById('mainSpinBtnText'),
    spinStatusNote: document.getElementById('spinStatusNote'),

    prizeShowcasePanel: document.getElementById('prizeShowcasePanel'),
    showcaseCount: document.getElementById('showcaseCount'),
    showcaseList: document.getElementById('showcaseList'),

    resultModal: document.getElementById('resultModal'),
    resultEmoji: document.getElementById('resultEmoji'),
    resultBadge: document.getElementById('resultBadge'),
    resultTitle: document.getElementById('resultTitle'),
    resultPlayer: document.getElementById('resultPlayer'),
    resultDesc: document.getElementById('resultDesc'),
    closeResultBtn: document.getElementById('closeResultBtn'),

    confettiCanvas: document.getElementById('confettiCanvas'),
    toastContainer: document.getElementById('toastContainer')
  };

  /* ==========================================================================
     STORAGE HELPERS
     ========================================================================== */
  function cloneDefaultData() {
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DATA);
      if (!raw) return cloneDefaultData();
      const parsed = JSON.parse(raw);
      return {
        settings: Object.assign({}, DEFAULT_DATA.settings, parsed.settings || {}),
        prizes: Array.isArray(parsed.prizes) ? parsed.prizes : cloneDefaultData().prizes,
        history: Array.isArray(parsed.history) ? parsed.history : []
      };
    } catch {
      return cloneDefaultData();
    }
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(state.data));
    } catch (err) {
      console.error('Failed to save data:', err);
    }
  }

  function generateId(prefix = 'id') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ==========================================================================
     WEB AUDIO SYNTHESIZER (NO EXTERNAL FILES NEEDED)
     ========================================================================== */
  let audioCtx = null;

  function ensureAudioContext() {
    if (!state.soundEnabled) return null;
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playTickSound() {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(920, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.038);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Ignore audio errors
    }
  }

  function playWinSound(isWin) {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const notes = isWin
        ? [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6 fanfare
        : [392.0, 349.23, 311.13]; // gentle descending try-again

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = isWin ? 'sine' : 'triangle';
        const start = now + idx * (isWin ? 0.11 : 0.14);
        const dur = idx === notes.length - 1 ? 0.55 : 0.18;

        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur + 0.02);
      });
    } catch {
      // Ignore audio errors
    }
  }

  /* ==========================================================================
     CONFETTI ENGINE
     ========================================================================== */
  let confettiParticles = [];
  let confettiRaf = null;

  function launchConfetti() {
    const canvas = el.confettiCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#f5b82e', '#ffe680', '#e63946', '#2ec4b6', '#3a86ff', '#ff70a6', '#ffffff'];
    confettiParticles = [];
    for (let i = 0; i < 140; i++) {
      confettiParticles.push({
        x: canvas.width * (0.2 + Math.random() * 0.6),
        y: canvas.height * 0.35 + (Math.random() - 0.5) * 80,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 14 - 4,
        size: 6 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.32 + Math.random() * 0.14,
        alpha: 1
      });
    }

    if (confettiRaf) cancelAnimationFrame(confettiRaf);

    function frame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = 0;
      for (const p of confettiParticles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.99;
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height * 0.85) p.alpha -= 0.025;

        if (p.alpha > 0 && p.y < canvas.height + 30) {
          alive++;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size * 0.35, p.size, p.size * 0.7);
          ctx.restore();
        }
      }
      if (alive > 0) {
        confettiRaf = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confettiRaf = null;
      }
    }
    confettiRaf = requestAnimationFrame(frame);
  }

  /* ==========================================================================
     TOAST NOTIFICATIONS
     ========================================================================== */
  function showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast${isError ? ' error' : ''}`;
    toast.textContent = message;
    el.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      setTimeout(() => toast.remove(), 260);
    }, 2800);
  }

  /* ==========================================================================
     AUTH & STRICT ROLE ISOLATION
     ========================================================================== */
  function handleLoginSubmit(event) {
    event.preventDefault();
    const entered = el.passwordInput.value.trim();

    if (entered === CREDENTIALS.ADMIN) {
      loginAs('admin');
    } else if (entered === CREDENTIALS.USER) {
      loginAs('user');
    } else {
      el.loginError.textContent = 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវ! សូមព្យាយាមម្តងទៀត។';
      el.loginError.classList.remove('hidden');
      const card = el.loginScreen.querySelector('.login-card');
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
      el.passwordInput.select();
    }
  }

  function loginAs(role) {
    state.role = role;
    state.activeView = 'wheel';
    state.editingPrizeId = null;

    try {
      sessionStorage.setItem(STORAGE_KEYS.SESSION_ROLE, role);
    } catch {
      // Ignore storage restriction
    }

    el.passwordInput.value = '';
    el.loginError.classList.add('hidden');
    el.loginScreen.classList.add('hidden');
    el.appShell.classList.remove('hidden');

    applyRoleUI();
    renderAll();
    showToast(role === 'admin' ? 'ចូលប្រើប្រាស់ក្នុងនាម Admin ជោគជ័យ!' : 'ស្វាគមន៍មកកាន់កម្មវិធីបង្វិលកងចាប់រង្វាន់!');
  }

  function logout() {
    if (state.isSpinning) {
      showToast('សូមរង់ចាំកងបង្វិលឈប់សិន!', true);
      return;
    }

    state.role = null;
    state.activeView = 'wheel';
    state.editingPrizeId = null;

    try {
      sessionStorage.removeItem(STORAGE_KEYS.SESSION_ROLE);
    } catch {
      // Ignore
    }

    // Completely purge any Admin DOM nodes upon logout
    el.adminNavMount.innerHTML = '';
    el.adminViewMount.innerHTML = '';
    el.adminViewMount.classList.add('hidden');

    el.resultModal.classList.add('hidden');
    el.appShell.classList.add('hidden');
    el.loginScreen.classList.remove('hidden');
    el.passwordInput.value = '';
    el.passwordInput.type = 'password';
    el.togglePasswordBtn.textContent = '👁️';
    setTimeout(() => el.passwordInput.focus(), 50);
  }

  function applyRoleUI() {
    if (state.role === 'admin') {
      el.roleBadge.textContent = '👑 Admin';
      el.roleBadge.className = 'role-badge admin';

      // Mount Admin navigation tabs ONLY for Admin
      el.adminNavMount.innerHTML = `
        <button type="button" class="nav-tab-btn ${state.activeView === 'wheel' ? 'active' : ''}" data-view="wheel">
          🎡 កងបង្វិល
        </button>
        <button type="button" class="nav-tab-btn ${state.activeView === 'admin' ? 'active' : ''}" data-view="admin">
          ⚙️ ផ្ទាំង Admin
        </button>
      `;

      el.adminNavMount.querySelectorAll('.nav-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchMainView(btn.dataset.view));
      });
    } else {
      // STRICT USER MODE: Zero Admin controls, zero Admin DOM
      el.roleBadge.textContent = '👤 អ្នកប្រើប្រាស់';
      el.roleBadge.className = 'role-badge user';
      el.adminNavMount.innerHTML = '';
      el.adminViewMount.innerHTML = '';
      el.adminViewMount.classList.add('hidden');
      state.activeView = 'wheel';
    }
  }

  function switchMainView(view) {
    // Hard guard: non-admin can NEVER open admin view
    if (view === 'admin' && state.role !== 'admin') {
      state.activeView = 'wheel';
      return;
    }

    if (state.isSpinning) {
      showToast('កងកំពុងបង្វិល សូមរង់ចាំមួយភ្លែត!', true);
      return;
    }

    state.activeView = view;

    el.adminNavMount.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    if (view === 'admin' && state.role === 'admin') {
      el.wheelView.classList.add('hidden');
      el.adminViewMount.classList.remove('hidden');
      renderAdminPanel();
    } else {
      el.adminViewMount.classList.add('hidden');
      el.wheelView.classList.remove('hidden');
      drawWheel();
      renderShowcase();
    }
  }

  /* ==========================================================================
     PRIZE & PROBABILITY HELPERS
     ========================================================================== */
  function getActiveWheelPrizes() {
    return state.data.prizes.filter(p => p.active);
  }

  function isPrizeAvailable(prize) {
    return prize.active && (prize.unlimited || Number(prize.stock) > 0) && Number(prize.weight) > 0;
  }

  function getEligiblePrizes() {
    return state.data.prizes.filter(isPrizeAvailable);
  }

  function getTotalEligibleWeight() {
    return getEligiblePrizes().reduce((sum, p) => sum + Number(p.weight || 0), 0);
  }

  function pickWeightedWinner(wheelSlices) {
    // Check if Admin configured a one-time Next Spin Override
    const overrideId = state.data.settings.nextSpinOverrideId;
    if (overrideId) {
      const idx = wheelSlices.findIndex(p => p.id === overrideId && isPrizeAvailable(p));
      if (idx !== -1) {
        // Auto-clear override after consuming so next spin returns to auto
        state.data.settings.nextSpinOverrideId = '';
        saveData();
        return idx;
      }
    }

    const candidates = wheelSlices
      .map((prize, index) => ({ prize, index }))
      .filter(item => isPrizeAvailable(item.prize));

    if (candidates.length === 0) return -1;

    const totalWeight = candidates.reduce((sum, item) => sum + Number(item.prize.weight), 0);
    let rand = Math.random() * totalWeight;

    for (const item of candidates) {
      rand -= Number(item.prize.weight);
      if (rand <= 0) return item.index;
    }
    return candidates[candidates.length - 1].index;
  }

  /* ==========================================================================
     HIGH-DPI CANVAS WHEEL RENDERING
     ========================================================================== */
  function drawWheel() {
    const canvas = el.wheelCanvas;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displaySize = 520;

    if (canvas.width !== displaySize * dpr || canvas.height !== displaySize * dpr) {
      canvas.width = displaySize * dpr;
      canvas.height = displaySize * dpr;
    }

    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displaySize, displaySize);

    const cx = displaySize / 2;
    const cy = displaySize / 2;
    const outerRimRadius = displaySize / 2 - 8;
    const wheelRadius = outerRimRadius - 22;

    // 1. Outer Metallic Gold Rim
    const rimGrad = ctx.createLinearGradient(0, 0, displaySize, displaySize);
    rimGrad.addColorStop(0, '#fff2b2');
    rimGrad.addColorStop(0.35, '#f5b82e');
    rimGrad.addColorStop(0.7, '#b57008');
    rimGrad.addColorStop(1, '#ffe48c');

    ctx.beginPath();
    ctx.arc(cx, cy, outerRimRadius, 0, Math.PI * 2);
    ctx.fillStyle = rimGrad;
    ctx.fill();

    // Inner dark bezel ring
    ctx.beginPath();
    ctx.arc(cx, cy, wheelRadius + 5, 0, Math.PI * 2);
    ctx.fillStyle = '#181326';
    ctx.fill();

    // 2. Chase LED Bulbs on the outer rim
    const bulbCount = 24;
    const bulbRingRadius = outerRimRadius - 11;
    for (let i = 0; i < bulbCount; i++) {
      const angle = (i / bulbCount) * Math.PI * 2;
      const bx = cx + Math.cos(angle) * bulbRingRadius;
      const by = cy + Math.sin(angle) * bulbRingRadius;
      const isLit = (i + state.bulbPhase) % 2 === 0;

      ctx.beginPath();
      ctx.arc(bx, by, isLit ? 4.8 : 3.6, 0, Math.PI * 2);
      ctx.fillStyle = isLit ? '#fffbe0' : '#734b09';
      if (isLit) {
        ctx.shadowColor = '#ffe680';
        ctx.shadowBlur = 10;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // 3. Draw Slices
    const slices = getActiveWheelPrizes();
    if (slices.length === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, wheelRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#1d274a';
      ctx.fill();
      ctx.fillStyle = '#9fb0d0';
      ctx.font = '600 18px "Kantumruy Pro", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('មិនទាន់មានរង្វាន់នៅលើកងទេ', cx, cy);
      ctx.restore();
      return;
    }

    const sliceAngle = (Math.PI * 2) / slices.length;

    slices.forEach((prize, i) => {
      const startAngle = state.currentRotation + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const midAngle = startAngle + sliceAngle / 2;
      const available = isPrizeAvailable(prize);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, wheelRadius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = prize.color || COLOR_PRESETS[i % COLOR_PRESETS.length];
      ctx.fill();

      // Subtle radial sheen overlay for depth
      const sheen = ctx.createRadialGradient(cx, cy, 35, cx, cy, wheelRadius);
      sheen.addColorStop(0, 'rgba(255, 255, 255, 0.14)');
      sheen.addColorStop(0.65, 'rgba(255, 255, 255, 0)');
      sheen.addColorStop(1, 'rgba(0, 0, 0, 0.24)');
      ctx.fillStyle = sheen;
      ctx.fill();

      // Dim slice if out of stock
      if (!available) {
        ctx.fillStyle = 'rgba(10, 14, 30, 0.58)';
        ctx.fill();
      }

      // Crisp golden divider border
      ctx.strokeStyle = 'rgba(255, 245, 200, 0.55)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label & Emoji along slice radius
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(midAngle);

      const fontSize = slices.length > 10 ? 12 : slices.length > 7 ? 14 : 15;
      ctx.font = `700 ${fontSize}px "Kantumruy Pro", "Leelawadee UI", sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Emoji near rim
      ctx.font = `${slices.length > 10 ? 18 : 22}px sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(prize.emoji || '🎁', wheelRadius - 14, 0);

      // Prize Name
      ctx.font = `700 ${fontSize}px "Kantumruy Pro", "Leelawadee UI", sans-serif`;
      ctx.fillStyle = available ? '#ffffff' : 'rgba(255,255,255,0.55)';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = 4;

      const maxLabelWidth = wheelRadius - 94;
      const displayName = truncateCanvasText(ctx, prize.name, maxLabelWidth);
      ctx.fillText(displayName, wheelRadius - 44, 0);

      ctx.restore();
    });

    // 4. Pegs on slice boundaries
    slices.forEach((_, i) => {
      const angle = state.currentRotation + i * sliceAngle;
      const px = cx + Math.cos(angle) * (wheelRadius - 4);
      const py = cy + Math.sin(angle) * (wheelRadius - 4);

      ctx.beginPath();
      ctx.arc(px, py, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = '#fff5c8';
      ctx.strokeStyle = '#9a6006';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
    });

    // 5. Center Hub Backing Ring
    ctx.beginPath();
    ctx.arc(cx, cy, 48, 0, Math.PI * 2);
    ctx.fillStyle = '#181326';
    ctx.fill();
    ctx.strokeStyle = '#f5b82e';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }

  function truncateCanvasText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) {
      t = t.slice(0, -1);
    }
    return t + '…';
  }

  // Gentle bulb animation loop
  setInterval(() => {
    if (!state.role || state.activeView !== 'wheel') return;
    state.bulbPhase = (state.bulbPhase + 1) % 2;
    if (!state.isSpinning) {
      drawWheel();
    }
  }, 550);

  /* ==========================================================================
     SPIN PHYSICS & EXECUTION
     ========================================================================== */
  function startSpin() {
    if (state.isSpinning) return;

    const slices = getActiveWheelPrizes();
    if (slices.length < 2) {
      showToast('ត្រូវការរង្វាន់យ៉ាងតិច ២ នៅលើកងដើម្បីបង្វិល!', true);
      return;
    }

    const winnerIndex = pickWeightedWinner(slices);
    if (winnerIndex === -1) {
      showToast('រង្វាន់ទាំងអស់បានអស់ស្តុកហើយ! សូមទាក់ទង Admin។', true);
      return;
    }

    ensureAudioContext();
    state.isSpinning = true;
    updateSpinButtons();

    const winningPrize = slices[winnerIndex];
    const sliceAngle = (Math.PI * 2) / slices.length;

    // Pick a natural landing spot safely inside the winning slice (16%..84%)
    const targetSliceAngle = (winnerIndex + 0.16 + Math.random() * 0.68) * sliceAngle;
    const desiredMod = (((-Math.PI / 2 - targetSliceAngle) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const currentMod = ((state.currentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    let delta = desiredMod - currentMod;
    if (delta <= 0) delta += Math.PI * 2;

    const extraSpins = 6 + Math.floor(Math.random() * 3); // 6 to 8 full spins
    const startRotation = state.currentRotation;
    const totalDelta = extraSpins * Math.PI * 2 + delta;
    const durationMs = Math.max(3000, Math.min(10000, Number(state.data.settings.spinDurationSec || 5.5) * 1000));
    const startTime = performance.now();

    let lastTickSlice = -1;
    let tickTimeout = null;
    let bulbTickCounter = 0;

    function animate(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / durationMs, 1);

      // Quintic ease-out for super natural deceleration
      const eased = 1 - Math.pow(1 - t, 4.3);
      state.currentRotation = startRotation + totalDelta * eased;

      // Pointer tick detection
      const pointerAngleOnWheel = (((-Math.PI / 2 - state.currentRotation) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const currentSlice = Math.floor(pointerAngleOnWheel / sliceAngle) % slices.length;

      if (currentSlice !== lastTickSlice) {
        lastTickSlice = currentSlice;
        playTickSound();
        el.wheelPointer.classList.add('tick');
        clearTimeout(tickTimeout);
        tickTimeout = setTimeout(() => el.wheelPointer.classList.remove('tick'), 75);

        bulbTickCounter++;
        if (bulbTickCounter % 2 === 0) {
          state.bulbPhase = (state.bulbPhase + 1) % 2;
        }
      }

      drawWheel();

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        state.currentRotation = startRotation + totalDelta;
        drawWheel();
        finishSpin(winningPrize);
      }
    }

    requestAnimationFrame(animate);
  }

  function finishSpin(prize) {
    state.isSpinning = false;

    // Deduct stock if finite
    const storedPrize = state.data.prizes.find(p => p.id === prize.id);
    if (storedPrize && !storedPrize.unlimited && Number(storedPrize.stock) > 0) {
      storedPrize.stock = Math.max(0, Number(storedPrize.stock) - 1);
    }

    const playerName = state.data.settings.showPlayerInput
      ? el.playerNameInput.value.trim()
      : '';

    // Record spin history
    state.data.history.unshift({
      id: generateId('spin'),
      timestamp: new Date().toISOString(),
      playerName: playerName || 'ភ្ញៀវទូទៅ',
      prizeId: prize.id,
      prizeName: prize.name,
      prizeEmoji: prize.emoji || '🎁',
      isWin: Boolean(prize.isWin),
      role: state.role
    });

    // Keep up to 500 history records
    if (state.data.history.length > 500) {
      state.data.history = state.data.history.slice(0, 500);
    }

    saveData();
    updateSpinButtons();
    drawWheel();
    renderShowcase();

    // Show Winner Modal & Audio + Confetti
    playWinSound(Boolean(prize.isWin));
    if (prize.isWin) {
      launchConfetti();
    }

    el.resultEmoji.textContent = prize.emoji || (prize.isWin ? '🎉' : '🍀');
    el.resultBadge.textContent = prize.isWin ? '🎉 សូមអបអរសាទរ!' : '🍀 សំណាងលើកក្រោយ!';
    el.resultTitle.textContent = prize.name;

    if (playerName) {
      el.resultPlayer.textContent = `👤 អ្នកឈ្នះ៖ ${playerName}`;
      el.resultPlayer.classList.remove('hidden');
    } else {
      el.resultPlayer.classList.add('hidden');
    }

    el.resultDesc.textContent = prize.description || (prize.isWin ? 'អ្នកបានឈ្នះរង្វាន់ដ៏អស្ចារ្យនេះ!' : 'សូមសាកល្បងម្តងទៀត!');
    el.resultModal.classList.remove('hidden');

    if (state.data.settings.showPlayerInput) {
      el.playerNameInput.value = '';
    }
  }

  function updateSpinButtons() {
    const eligible = getEligiblePrizes();
    const slices = getActiveWheelPrizes();
    const canSpin = !state.isSpinning && slices.length >= 2 && eligible.length > 0;

    el.mainSpinBtn.disabled = !canSpin;
    el.centerSpinBtn.disabled = !canSpin;

    if (state.isSpinning) {
      el.mainSpinBtnText.textContent = 'កំពុងបង្វិល...';
      el.spinStatusNote.textContent = 'សូមរង់ចាំលទ្ធផលដ៏រំភើប!';
    } else if (slices.length < 2) {
      el.mainSpinBtnText.textContent = 'បង្វិលកងចាប់រង្វាន់';
      el.spinStatusNote.textContent = 'ត្រូវការរង្វាន់យ៉ាងតិច ២ នៅលើកង។';
    } else if (eligible.length === 0) {
      el.mainSpinBtnText.textContent = 'អស់រង្វាន់ហើយ';
      el.spinStatusNote.textContent = 'រង្វាន់ទាំងអស់បានអស់ស្តុកហើយ។';
    } else {
      el.mainSpinBtnText.textContent = 'បង្វិលកងចាប់រង្វាន់';
      el.spinStatusNote.textContent = `មានរង្វាន់សកម្មចំនួន ${eligible.length} ប្រភេទកំពុងរង់ចាំអ្នក!`;
    }
  }

  /* ==========================================================================
     RENDER WHEEL SCREEN & SHOWCASE
     ========================================================================== */
  function renderHeaderAndSettings() {
    const s = state.data.settings;
    el.headerTitle.textContent = s.title || 'កម្មវិធីបង្វិលកងចាប់រង្វាន់';
    el.headerSubtitle.textContent = s.subtitle || '';
    el.loginAppTitle.textContent = s.title || 'បង្វិលកងចាប់រង្វាន់';
    document.title = s.title || 'កម្មវិធីបង្វិលកងចាប់រង្វាន់';

    el.playerInputWrap.classList.toggle('hidden', !s.showPlayerInput);

    const wheelLayout = el.wheelView.querySelector('.wheel-layout');
    if (s.showPrizeShowcase) {
      el.prizeShowcasePanel.classList.remove('hidden');
      wheelLayout.classList.remove('single-column');
    } else {
      el.prizeShowcasePanel.classList.add('hidden');
      wheelLayout.classList.add('single-column');
    }
  }

  function renderShowcase() {
    const slices = getActiveWheelPrizes();
    el.showcaseCount.textContent = `${slices.length} រង្វាន់`;

    if (slices.length === 0) {
      el.showcaseList.innerHTML = `<div class="empty-state">មិនទាន់មានរង្វាន់ទេ</div>`;
      return;
    }

    el.showcaseList.innerHTML = slices.map(prize => {
      const available = isPrizeAvailable(prize);
      const stockText = prize.unlimited
        ? '∞ គ្មានកំណត់'
        : Number(prize.stock) > 0
          ? `នៅសល់ ${prize.stock}`
          : 'អស់ស្តុក';

      return `
        <div class="showcase-item ${available ? '' : 'out-of-stock'}">
          <div class="showcase-swatch" style="background: ${escapeHtml(prize.color)}">
            ${escapeHtml(prize.emoji || '🎁')}
          </div>
          <div class="showcase-meta">
            <div class="showcase-name">${escapeHtml(prize.name)}</div>
            <div class="showcase-sub">${escapeHtml(prize.description || (prize.isWin ? 'រង្វាន់ពិសេស' : 'សាកល្បងម្តងទៀត'))}</div>
          </div>
          <span class="stock-tag ${available ? 'available' : 'empty'}">${stockText}</span>
        </div>
      `;
    }).join('');
  }

  function renderAll() {
    renderHeaderAndSettings();
    updateSpinButtons();
    drawWheel();
    renderShowcase();
    if (state.role === 'admin' && state.activeView === 'admin') {
      renderAdminPanel();
    }
  }

  /* ==========================================================================
     ADMIN PANEL (STRICTLY MOUNTED ONLY WHEN state.role === 'admin')
     ========================================================================== */
  function renderAdminPanel() {
    if (state.role !== 'admin') {
      el.adminViewMount.innerHTML = '';
      return;
    }

    const totalSpins = state.data.history.length;
    const totalWins = state.data.history.filter(h => h.isWin).length;
    const activeCount = state.data.prizes.filter(p => p.active).length;
    const finiteStockSum = state.data.prizes
      .filter(p => p.active && !p.unlimited)
      .reduce((s, p) => s + Number(p.stock || 0), 0);
    const hasUnlimited = state.data.prizes.some(p => p.active && p.unlimited);

    el.adminViewMount.innerHTML = `
      <div class="admin-wrapper">
        <!-- Summary Stats -->
        <div class="admin-stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🎡</div>
            <div>
              <div class="stat-value">${totalSpins}</div>
              <div class="stat-label">ចំនួនដងបង្វិលសរុប</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🏆</div>
            <div>
              <div class="stat-value">${totalWins}</div>
              <div class="stat-label">ចំនួនអ្នកឈ្នះរង្វាន់</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🎁</div>
            <div>
              <div class="stat-value">${activeCount} / ${state.data.prizes.length}</div>
              <div class="stat-label">រង្វាន់កំពុងដាក់លើកង</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div>
              <div class="stat-value">${finiteStockSum}${hasUnlimited ? ' + ∞' : ''}</div>
              <div class="stat-label">ស្តុករង្វាន់នៅសល់</div>
            </div>
          </div>
        </div>

        <!-- Admin Sub-Tabs -->
        <div class="admin-subtabs">
          <button type="button" class="admin-subtab-btn ${state.adminTab === 'prizes' ? 'active' : ''}" data-admintab="prizes">
            🎁 គ្រប់គ្រងរង្វាន់ (${state.data.prizes.length})
          </button>
          <button type="button" class="admin-subtab-btn ${state.adminTab === 'settings' ? 'active' : ''}" data-admintab="settings">
            ⚙️ ការកំណត់កម្មវិធី
          </button>
          <button type="button" class="admin-subtab-btn ${state.adminTab === 'history' ? 'active' : ''}" data-admintab="history">
            📜 ប្រវត្តិចាប់រង្វាន់ (${totalSpins})
          </button>
        </div>

        <!-- Tab Content Mount -->
        <div id="adminTabBody"></div>
      </div>
    `;

    el.adminViewMount.querySelectorAll('.admin-subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.adminTab = btn.dataset.admintab;
        renderAdminPanel();
      });
    });

    const body = document.getElementById('adminTabBody');
    if (state.adminTab === 'prizes') {
      renderAdminPrizesTab(body);
    } else if (state.adminTab === 'settings') {
      renderAdminSettingsTab(body);
    } else {
      renderAdminHistoryTab(body);
    }
  }

  /* ---------- ADMIN TAB 1: PRIZES CRUD ---------- */
  function renderAdminPrizesTab(container) {
    if (state.role !== 'admin') return;

    const editingPrize = state.editingPrizeId
      ? state.data.prizes.find(p => p.id === state.editingPrizeId)
      : null;

    const totalWeight = getTotalEligibleWeight();

    const defaultColor = editingPrize
      ? editingPrize.color
      : COLOR_PRESETS[state.data.prizes.length % COLOR_PRESETS.length];

    container.innerHTML = `
      <div class="admin-card">
        <div class="admin-card-header">
          <h2 class="admin-card-title">🎁 កំណត់បញ្ជីរង្វាន់ និងអត្រាឈ្នះ</h2>
          <div class="admin-card-actions">
            <button type="button" id="resetDefaultPrizesBtn" class="btn btn-secondary btn-sm">
              ↺ កំណត់រង្វាន់គំរូឡើងវិញ
            </button>
          </div>
        </div>

        <!-- Add / Edit Prize Form -->
        <form id="prizeForm" class="prize-form-box">
          <div class="prize-form-title">
            ${editingPrize ? `✏️ កែសម្រួលរង្វាន់៖ ${escapeHtml(editingPrize.name)}` : '➕ បន្ថែមរង្វាន់ថ្មី'}
          </div>

          <div class="form-grid">
            <div class="col-4">
              <label class="input-label" for="prizeName">ឈ្មោះរង្វាន់ *</label>
              <input type="text" id="prizeName" class="form-input" required maxlength="60"
                placeholder="ឧ. ទូរស័ព្ទ iPhone 16..."
                value="${editingPrize ? escapeHtml(editingPrize.name) : ''}" />
            </div>

            <div class="col-4">
              <label class="input-label" for="prizeDesc">ការពិពណ៌នាខ្លី (បង្ហាញពេលឈ្នះ)</label>
              <input type="text" id="prizeDesc" class="form-input" maxlength="120"
                placeholder="ឧ. អបអរសាទរ! ទាក់ទងបុគ្គលិក..."
                value="${editingPrize ? escapeHtml(editingPrize.description || '') : ''}" />
            </div>

            <div class="col-2">
              <label class="input-label" for="prizeWeight">ទម្ងន់ / អត្រាឈ្នះ *</label>
              <input type="number" id="prizeWeight" class="form-input" min="0" max="10000" step="1" required
                value="${editingPrize ? editingPrize.weight : 10}" />
            </div>

            <div class="col-2">
              <label class="input-label" for="prizeStock">ចំនួនស្តុក</label>
              <input type="number" id="prizeStock" class="form-input" min="0" max="999999" step="1"
                value="${editingPrize ? editingPrize.stock : 10}"
                ${editingPrize && editingPrize.unlimited ? 'disabled' : ''} />
            </div>

            <div class="col-6">
              <label class="input-label" for="prizeEmoji">និមិត្តសញ្ញា (Emoji)</label>
              <input type="text" id="prizeEmoji" class="form-input" maxlength="4"
                value="${editingPrize ? escapeHtml(editingPrize.emoji || '🎁') : '🎁'}" />
              <div class="emoji-picker-row">
                ${EMOJI_PRESETS.map(em => `<button type="button" class="emoji-chip" data-emoji="${em}">${em}</button>`).join('')}
              </div>
            </div>

            <div class="col-6">
              <label class="input-label" for="prizeColor">ពណ៌ចំណិតលើកង</label>
              <div class="color-row">
                <input type="color" id="prizeColor" class="color-input" value="${escapeHtml(defaultColor)}" />
                <div class="color-swatches">
                  ${COLOR_PRESETS.map(c => `<button type="button" class="color-dot" data-color="${c}" style="background:${c}" title="${c}"></button>`).join('')}
                </div>
              </div>
              <div style="display:flex; gap:18px; flex-wrap:wrap; margin-top:6px;">
                <label class="checkbox-row">
                  <input type="checkbox" id="prizeUnlimited" ${editingPrize && editingPrize.unlimited ? 'checked' : ''} />
                  <span>ស្តុកគ្មានកំណត់ (∞)</span>
                </label>
                <label class="checkbox-row">
                  <input type="checkbox" id="prizeIsWin" ${editingPrize ? (editingPrize.isWin ? 'checked' : '') : 'checked'} />
                  <span>ជារង្វាន់ឈ្នះពិត (មានកាំជ្រួច)</span>
                </label>
                <label class="checkbox-row">
                  <input type="checkbox" id="prizeActive" ${editingPrize ? (editingPrize.active ? 'checked' : '') : 'checked'} />
                  <span>បង្ហាញលើកង</span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-gold">
              ${editingPrize ? '💾 រក្សាទុកការកែប្រែ' : '➕ បន្ថែមរង្វាន់'}
            </button>
            ${editingPrize ? '<button type="button" id="cancelEditBtn" class="btn btn-secondary">បោះបង់</button>' : ''}
          </div>
        </form>

        <!-- Prizes Table -->
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>រង្វាន់</th>
                <th>ទម្ងន់</th>
                <th>ភាគរយឈ្នះពិត</th>
                <th>ស្តុកនៅសល់</th>
                <th>ស្ថានភាព</th>
                <th>សកម្មភាព</th>
              </tr>
            </thead>
            <tbody>
              ${state.data.prizes.length === 0 ? `
                <tr><td colspan="7" class="empty-state">មិនទាន់មានរង្វាន់ទេ សូមបន្ថែមរង្វាន់ខាងលើ។</td></tr>
              ` : state.data.prizes.map((p, idx) => {
                const avail = isPrizeAvailable(p);
                const pct = avail && totalWeight > 0 ? ((Number(p.weight) / totalWeight) * 100) : 0;
                const stockDisp = p.unlimited ? '∞ គ្មានកំណត់' : `${p.stock}`;
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>
                      <div class="table-prize-cell">
                        <span class="table-color-badge" style="background:${escapeHtml(p.color)}">${escapeHtml(p.emoji || '🎁')}</span>
                        <div>
                          <div style="font-weight:700; color:#fff;">${escapeHtml(p.name)}</div>
                          <div style="font-size:0.78rem; color:var(--text-muted);">
                            ${p.isWin ? '🏆 រង្វាន់ឈ្នះ' : '🍀 មិនមានរង្វាន់'}${p.description ? ' • ' + escapeHtml(p.description) : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td><strong>${p.weight}</strong></td>
                    <td>
                      <div class="prob-bar-wrap">
                        <div class="prob-text">${pct.toFixed(1)}%</div>
                        <div class="prob-track"><div class="prob-fill" style="width:${Math.min(100, pct)}%"></div></div>
                      </div>
                    </td>
                    <td>
                      <span class="stock-tag ${avail ? 'available' : 'empty'}">${stockDisp}</span>
                    </td>
                    <td>
                      <span class="status-pill ${p.active ? 'on' : 'off'}">
                        ${p.active ? '● បើក' : '○ បិទ'}
                      </span>
                    </td>
                    <td>
                      <div class="row-actions">
                        <button type="button" class="btn btn-secondary btn-xs" data-action="toggle" data-id="${escapeHtml(p.id)}" title="បើក/បិទ">
                          ${p.active ? '👁️' : '🚫'}
                        </button>
                        <button type="button" class="btn btn-primary btn-xs" data-action="edit" data-id="${escapeHtml(p.id)}">
                          កែ
                        </button>
                        <button type="button" class="btn btn-danger btn-xs" data-action="delete" data-id="${escapeHtml(p.id)}">
                          លុប
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Bind form helpers
    const emojiInput = document.getElementById('prizeEmoji');
    const colorInput = document.getElementById('prizeColor');
    const unlimitedChk = document.getElementById('prizeUnlimited');
    const stockInput = document.getElementById('prizeStock');

    container.querySelectorAll('.emoji-chip').forEach(btn => {
      btn.addEventListener('click', () => { emojiInput.value = btn.dataset.emoji; });
    });

    container.querySelectorAll('.color-dot').forEach(btn => {
      btn.addEventListener('click', () => { colorInput.value = btn.dataset.color; });
    });

    unlimitedChk.addEventListener('change', () => {
      stockInput.disabled = unlimitedChk.checked;
    });

    const cancelEditBtn = document.getElementById('cancelEditBtn');
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', () => {
        state.editingPrizeId = null;
        renderAdminPanel();
      });
    }

    document.getElementById('prizeForm').addEventListener('submit', e => {
      e.preventDefault();
      if (state.role !== 'admin') return;

      const name = document.getElementById('prizeName').value.trim();
      if (!name) return;

      const payload = {
        name,
        description: document.getElementById('prizeDesc').value.trim(),
        weight: Math.max(0, Number(document.getElementById('prizeWeight').value || 0)),
        stock: Math.max(0, Number(document.getElementById('prizeStock').value || 0)),
        unlimited: unlimitedChk.checked,
        emoji: emojiInput.value.trim() || '🎁',
        color: colorInput.value || '#f5b82e',
        isWin: document.getElementById('prizeIsWin').checked,
        active: document.getElementById('prizeActive').checked
      };

      if (state.editingPrizeId) {
        const idx = state.data.prizes.findIndex(p => p.id === state.editingPrizeId);
        if (idx !== -1) {
          state.data.prizes[idx] = { ...state.data.prizes[idx], ...payload };
          showToast('បានរក្សាទុកការកែប្រែរង្វាន់!');
        }
        state.editingPrizeId = null;
      } else {
        state.data.prizes.push({ id: generateId('prize'), ...payload });
        showToast('បានបន្ថែមរង្វាន់ថ្មីជោគជ័យ!');
      }

      saveData();
      renderAll();
    });

    document.getElementById('resetDefaultPrizesBtn').addEventListener('click', () => {
      if (state.role !== 'admin') return;
      if (!confirm('តើអ្នកពិតជាចង់កំណត់បញ្ជីរង្វាន់ត្រឡប់ទៅរង្វាន់គំរូដើមវិញមែនទេ?')) return;
      state.data.prizes = cloneDefaultData().prizes;
      state.data.settings.nextSpinOverrideId = '';
      state.editingPrizeId = null;
      saveData();
      renderAll();
      showToast('បានកំណត់រង្វាន់គំរូឡើងវិញ!');
    });

    // Row actions
    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.role !== 'admin') return;
        const id = btn.dataset.id;
        const action = btn.dataset.action;

        if (action === 'edit') {
          state.editingPrizeId = id;
          renderAdminPanel();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (action === 'toggle') {
          const prize = state.data.prizes.find(p => p.id === id);
          if (prize) {
            prize.active = !prize.active;
            saveData();
            renderAll();
          }
        } else if (action === 'delete') {
          const prize = state.data.prizes.find(p => p.id === id);
          if (!prize) return;
          if (!confirm(`តើអ្នកពិតជាចង់លុបរង្វាន់ "${prize.name}" មែនទេ?`)) return;
          state.data.prizes = state.data.prizes.filter(p => p.id !== id);
          if (state.editingPrizeId === id) state.editingPrizeId = null;
          if (state.data.settings.nextSpinOverrideId === id) state.data.settings.nextSpinOverrideId = '';
          saveData();
          renderAll();
          showToast('បានលុបរង្វាន់រួចរាល់!');
        }
      });
    });
  }

  /* ---------- ADMIN TAB 2: GENERAL SETTINGS ---------- */
  function renderAdminSettingsTab(container) {
    if (state.role !== 'admin') return;

    const s = state.data.settings;
    const eligiblePrizes = getEligiblePrizes();

    container.innerHTML = `
      <div class="admin-card">
        <div class="admin-card-header">
          <h2 class="admin-card-title">⚙️ ការកំណត់ទូទៅរបស់កម្មវិធី</h2>
        </div>

        <form id="settingsForm" class="settings-grid">
          <div class="setting-group">
            <div class="setting-group-title">🎨 ព័ត៌មានកម្មវិធី</div>

            <div>
              <label class="input-label" for="setTitle">ចំណងជើងកម្មវិធី</label>
              <input type="text" id="setTitle" class="form-input" maxlength="80" value="${escapeHtml(s.title)}" required />
            </div>

            <div>
              <label class="input-label" for="setSubtitle">ចំណងជើងរង</label>
              <input type="text" id="setSubtitle" class="form-input" maxlength="100" value="${escapeHtml(s.subtitle)}" />
            </div>

            <div>
              <label class="input-label" for="setDuration">រយៈពេលបង្វិលកង (វិនាទី៖ 3 - 9)</label>
              <input type="number" id="setDuration" class="form-input" min="3" max="9" step="0.5" value="${s.spinDurationSec}" />
            </div>
          </div>

          <div class="setting-group">
            <div class="setting-group-title">🎛️ ជម្រើសបង្ហាញ និងការគ្រប់គ្រង</div>

            <label class="checkbox-row">
              <input type="checkbox" id="setShowPlayer" ${s.showPlayerInput ? 'checked' : ''} />
              <span>បង្ហាញប្រអប់បញ្ចូលឈ្មោះអ្នកចូលរួមមុនពេលបង្វិល</span>
            </label>

            <label class="checkbox-row">
              <input type="checkbox" id="setShowShowcase" ${s.showPrizeShowcase ? 'checked' : ''} />
              <span>បង្ហាញផ្ទាំងបញ្ជីរង្វាន់នៅចំហៀងកងបង្វិល</span>
            </label>

            <div style="margin-top:6px;">
              <label class="input-label" for="setNextOverride">🎯 កំណត់រង្វាន់សម្រាប់ជុំបន្ទាប់ (ជម្រើសពិសេស Admin)</label>
              <select id="setNextOverride" class="form-select">
                <option value="">🎲 ស្វ័យប្រវត្តិ (តាមអត្រាឈ្នះដែលបានកំណត់)</option>
                ${eligiblePrizes.map(p => `
                  <option value="${escapeHtml(p.id)}" ${s.nextSpinOverrideId === p.id ? 'selected' : ''}>
                    ${escapeHtml(p.emoji || '🎁')} ${escapeHtml(p.name)}
                  </option>
                `).join('')}
              </select>
              <p class="setting-help" style="margin-top:6px;">
                បើអ្នកជ្រើសរើសរង្វាន់ជាក់លាក់ កងនឹងឈប់ចំរង្វាន់នោះនៅជុំបង្វិលបន្ទាប់ ១ ដង រួចត្រឡប់ទៅស្វ័យប្រវត្តិវិញ។
              </p>
            </div>
          </div>

          <div class="col-12" style="grid-column: 1 / -1; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <button type="submit" class="btn btn-gold">💾 រក្សាទុកការកំណត់</button>
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <button type="button" id="exportConfigBtn" class="btn btn-secondary btn-sm">📤 នាំចេញទិន្នន័យ (JSON)</button>
              <label class="btn btn-secondary btn-sm" style="cursor:pointer;">
                📥 នាំចូលទិន្នន័យ (JSON)
                <input type="file" id="importConfigInput" accept=".json,application/json" style="display:none;" />
              </label>
            </div>
          </div>
        </form>
      </div>
    `;

    document.getElementById('settingsForm').addEventListener('submit', e => {
      e.preventDefault();
      if (state.role !== 'admin') return;

      state.data.settings.title = document.getElementById('setTitle').value.trim() || DEFAULT_DATA.settings.title;
      state.data.settings.subtitle = document.getElementById('setSubtitle').value.trim();
      state.data.settings.spinDurationSec = Math.max(3, Math.min(9, Number(document.getElementById('setDuration').value || 5.5)));
      state.data.settings.showPlayerInput = document.getElementById('setShowPlayer').checked;
      state.data.settings.showPrizeShowcase = document.getElementById('setShowShowcase').checked;
      state.data.settings.nextSpinOverrideId = document.getElementById('setNextOverride').value;

      saveData();
      renderAll();
      showToast('បានរក្សាទុកការកំណត់ជោគជ័យ!');
    });

    document.getElementById('exportConfigBtn').addEventListener('click', () => {
      if (state.role !== 'admin') return;
      const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: 'application/json' });
      downloadBlob(blob, `lucky-wheel-backup-${formatDateSlug()}.json`);
      showToast('បាននាំចេញឯកសារបម្រុងទុក JSON!');
    });

    document.getElementById('importConfigInput').addEventListener('change', e => {
      if (state.role !== 'admin') return;
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const imported = JSON.parse(reader.result);
          if (!Array.isArray(imported.prizes)) throw new Error('Invalid format');
          state.data = {
            settings: Object.assign({}, DEFAULT_DATA.settings, imported.settings || {}),
            prizes: imported.prizes,
            history: Array.isArray(imported.history) ? imported.history : []
          };
          saveData();
          renderAll();
          showToast('បាននាំចូលទិន្នន័យជោគជ័យ!');
        } catch {
          showToast('ឯកសារ JSON មិនត្រឹមត្រូវ!', true);
        }
      };
      reader.readAsText(file);
    });
  }

  /* ---------- ADMIN TAB 3: HISTORY & EXPORT ---------- */
  function renderAdminHistoryTab(container) {
    if (state.role !== 'admin') return;

    const history = state.data.history;

    container.innerHTML = `
      <div class="admin-card">
        <div class="admin-card-header">
          <h2 class="admin-card-title">📜 ប្រវត្តិការបង្វិលកងចាប់រង្វាន់</h2>
          <div class="admin-card-actions">
            <button type="button" id="exportCsvBtn" class="btn btn-primary btn-sm" ${history.length === 0 ? 'disabled' : ''}>
              📊 នាំចេញ Excel (CSV)
            </button>
            <button type="button" id="clearHistoryBtn" class="btn btn-outline-danger btn-sm" ${history.length === 0 ? 'disabled' : ''}>
              🗑️ លុបប្រវត្តិទាំងអស់
            </button>
          </div>
        </div>

        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>កាលបរិច្ឆេទ និងម៉ោង</th>
                <th>ឈ្មោះអ្នកចូលរួម</th>
                <th>លទ្ធផលរង្វាន់</th>
                <th>ប្រភេទ</th>
              </tr>
            </thead>
            <tbody>
              ${history.length === 0 ? `
                <tr><td colspan="5" class="empty-state">មិនទាន់មានប្រវត្តិការបង្វិលនៅឡើយទេ។</td></tr>
              ` : history.map((h, i) => `
                <tr>
                  <td>${history.length - i}</td>
                  <td>${formatTimestamp(h.timestamp)}</td>
                  <td><strong>${escapeHtml(h.playerName || 'ភ្ញៀវទូទៅ')}</strong></td>
                  <td>${escapeHtml(h.prizeEmoji || '🎁')} ${escapeHtml(h.prizeName)}</td>
                  <td>
                    <span class="status-pill ${h.isWin ? 'on' : 'off'}">
                      ${h.isWin ? '🏆 ឈ្នះរង្វាន់' : '🍀 សំណាងលើកក្រោយ'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    const exportBtn = document.getElementById('exportCsvBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (state.role !== 'admin') return;
        const rows = [
          ['ល.រ', 'កាលបរិច្ឆេទ', 'ឈ្មោះអ្នកចូលរួម', 'រង្វាន់', 'ស្ថានភាព']
        ];
        history.forEach((h, i) => {
          rows.push([
            history.length - i,
            formatTimestamp(h.timestamp),
            h.playerName || 'ភ្ញៀវទូទៅ',
            h.prizeName,
            h.isWin ? 'ឈ្នះរង្វាន់' : 'សំណាងលើកក្រោយ'
          ]);
        });
        const csvContent = '\uFEFF' + rows
          .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
          .join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        downloadBlob(blob, `lucky-wheel-history-${formatDateSlug()}.csv`);
        showToast('បាននាំចេញឯកសារ CSV ជោគជ័យ!');
      });
    }

    const clearBtn = document.getElementById('clearHistoryBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (state.role !== 'admin') return;
        if (!confirm('តើអ្នកពិតជាចង់លុបប្រវត្តិការបង្វិលទាំងអស់មែនទេ?')) return;
        state.data.history = [];
        saveData();
        renderAdminPanel();
        showToast('បានលុបប្រវត្តិទាំងអស់រួចរាល់!');
      });
    }
  }

  /* ==========================================================================
     UTILITIES
     ========================================================================== */
  function formatTimestamp(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString('km-KH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return iso;
    }
  }

  function formatDateSlug() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      a.remove();
      URL.revokeObjectURL(url);
    }, 100);
  }

  /* ==========================================================================
     EVENT BINDINGS & BOOTSTRAP
     ========================================================================== */
  function init() {
    renderHeaderAndSettings();

    el.loginForm.addEventListener('submit', handleLoginSubmit);

    el.togglePasswordBtn.addEventListener('click', () => {
      const isHidden = el.passwordInput.type === 'password';
      el.passwordInput.type = isHidden ? 'text' : 'password';
      el.togglePasswordBtn.textContent = isHidden ? '🙈' : '👁️';
      el.passwordInput.focus();
    });

    el.soundToggleBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      el.soundToggleBtn.textContent = state.soundEnabled ? '🔊' : '🔇';
      showToast(state.soundEnabled ? 'បានបើកសំឡេង 🔊' : 'បានបិទសំឡេង 🔇');
    });

    el.logoutBtn.addEventListener('click', logout);
    el.centerSpinBtn.addEventListener('click', startSpin);
    el.mainSpinBtn.addEventListener('click', startSpin);

    el.closeResultBtn.addEventListener('click', () => {
      el.resultModal.classList.add('hidden');
    });

    el.resultModal.addEventListener('click', e => {
      if (e.target === el.resultModal) {
        el.resultModal.classList.add('hidden');
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !el.resultModal.classList.contains('hidden')) {
        el.resultModal.classList.add('hidden');
      }
    });

    window.addEventListener('resize', () => {
      if (state.role && state.activeView === 'wheel') {
        drawWheel();
      }
    });

    // Restore session within the same browser tab if already signed in
    try {
      const savedRole = sessionStorage.getItem(STORAGE_KEYS.SESSION_ROLE);
      if (savedRole === 'admin' || savedRole === 'user') {
        loginAs(savedRole);
        return;
      }
    } catch {
      // Ignore
    }

    // Otherwise stay on Login Screen
    el.loginScreen.classList.remove('hidden');
    el.appShell.classList.add('hidden');
  }

  init();
})();
