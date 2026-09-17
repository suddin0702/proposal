/**
 * ===================================================================
 * ROMANTIC MARRIAGE PROPOSAL — CLEAN INTERACTIVE SCRIPT
 * ===================================================================
 */

// ==========================================
// 💖 1. PERSONALIZATION VARIABLES
// ==========================================
let herName = "My Love";
let myName = "Forever Yours";

// Check URL query parameters (e.g. ?her=Sneha&me=Rohit)
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("her")) {
  herName = urlParams.get("her").trim();
}
if (urlParams.get("me")) {
  myName = urlParams.get("me").trim();
}

// Check LocalStorage if user previously saved custom names
if (localStorage.getItem("proposal_herName")) {
  herName = localStorage.getItem("proposal_herName");
}
if (localStorage.getItem("proposal_myName")) {
  myName = localStorage.getItem("proposal_myName");
}

// Update all text references in DOM
function updateNameDisplays() {
  const herNameElements = [
    document.getElementById("display-her-name"),
    document.getElementById("display-her-name-modal"),
  ];
  herNameElements.forEach(el => {
    if (el) el.textContent = herName;
  });

  const myNameEl = document.getElementById("display-my-name");
  if (myNameEl) myNameEl.textContent = myName;

  document.title = `Will You Marry Me, ${herName}? ❤️💍`;
}

// ==========================================
// 🎵 2. WEB AUDIO API SOUND SYSTEM
// ==========================================
let audioCtx = null;
let soundEnabled = true;

function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playPopSound() {
  if (!soundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const now = audioCtx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  } catch (e) {}
}

function playChimeSound() {
  if (!soundEnabled || !audioCtx) return;
  try {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime + idx * 0.06;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    });
  } catch (e) {}
}

function playCelebrationFanfare() {
  if (!soundEnabled || !audioCtx) return;
  try {
    const melody = [
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.15 },
      { f: 1046.5, d: 0.35 },
      { f: 880.00, d: 0.18 },
      { f: 1046.5, d: 0.45 },
    ];

    let delay = 0;
    melody.forEach((note) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime + delay;

      osc.type = "sine";
      osc.frequency.setValueAtTime(note.f, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.d);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + note.d);
      delay += note.d * 0.85;
    });
  } catch (e) {}
}

// ==========================================
// 💫 3. STAGE MANAGEMENT & COUNTERS
// ==========================================
let noClicksPage1 = 0;
let noClicksPage2 = 0;
let noClicksPage3 = 0;

const playfulMessagesStage1 = [
  "Oops, you almost had it! 🙈",
  "Try clicking YES instead! 💕",
  "Ek baar aur soch lo... 🥺"
];

const playfulMessagesStage2 = [
  "Soch lo achhi tarah se! 🥺",
  "NO bolna is not allowed! 🙈❤️",
  "Look at that Sabse Bada YES! ✨"
];

const playfulMessagesStage3 = [
  "Pleaaaseee don't say no! 🥺",
  "Look at my sad eyes 😭",
  "I've already planned our wedding! 💒"
];

function showToast(msg) {
  const toast = document.getElementById("playful-toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1600);
}

function switchStage(fromId, toId) {
  const fromEl = document.getElementById(fromId);
  const toEl = document.getElementById(toId);
  if (!fromEl || !toEl) return;

  // Reset transforms on buttons
  document.querySelectorAll('.btn-no').forEach(btn => {
    btn.style.transform = 'translate(0px, 0px)';
  });

  fromEl.classList.remove("stage-active");
  fromEl.classList.add("stage-hidden");

  toEl.classList.remove("stage-hidden");
  toEl.classList.add("stage-active");

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 🏃 4. CONTROLLED NEARBY NO-BUTTON MOVEMENT
// ==========================================
const nearbyOffsets = [
  { x: -70, y: -18 },
  { x: 70, y: -15 },
  { x: -60, y: 18 },
  { x: 60, y: 18 },
  { x: -80, y: 0 },
  { x: 80, y: 0 },
  { x: 0, y: -20 },
  { x: 0, y: 20 }
];

let lastOffsetIndex = -1;

function moveNoButtonNearby(buttonEl) {
  if (!buttonEl) return;

  initAudio();
  playPopSound();

  let nextIndex;
  do {
    nextIndex = Math.floor(Math.random() * nearbyOffsets.length);
  } while (nextIndex === lastOffsetIndex && nearbyOffsets.length > 1);

  lastOffsetIndex = nextIndex;
  const offset = nearbyOffsets[nextIndex];

  const scaleFactor = window.innerWidth < 450 ? 0.7 : 1;
  const targetX = Math.round(offset.x * scaleFactor);
  const targetY = Math.round(offset.y * scaleFactor);

  buttonEl.style.transform = `translate(${targetX}px, ${targetY}px)`;
}

// Stage 1 NO Click
function handleStage1No(btn) {
  noClicksPage1++;

  if (noClicksPage1 < 3) {
    const msg = playfulMessagesStage1[noClicksPage1 - 1] || "Try again! 💖";
    showToast(msg);
    moveNoButtonNearby(btn);
  } else {
    showToast("Ese kese no?! 😭");
    setTimeout(() => {
      switchStage("stage-1", "stage-2");
    }, 250);
  }
}

// Stage 2 NO Click
function handleStage2No(btn) {
  noClicksPage2++;

  if (noClicksPage2 < 3) {
    const msg = playfulMessagesStage2[noClicksPage2 - 1] || "Mai nahi maanunga! 🥺";
    showToast(msg);
    moveNoButtonNearby(btn);
  } else {
    showToast("Pleaaaseee 🥺");
    setTimeout(() => {
      switchStage("stage-2", "stage-3");
    }, 250);
  }
}

// Stage 3 NO Click
function handleStage3No(btn) {
  noClicksPage3++;

  const msg = playfulMessagesStage3[noClicksPage3 % playfulMessagesStage3.length];
  showToast(msg);
  moveNoButtonNearby(btn);
}

// ==========================================
// 🎉 5. CELEBRATION & YES HANDLER
// ==========================================
function goToCelebration() {
  initAudio();
  playChimeSound();
  setTimeout(playCelebrationFanfare, 200);

  const activeStages = ["stage-1", "stage-2", "stage-3"];
  activeStages.forEach(stg => {
    const el = document.getElementById(stg);
    if (el) {
      el.classList.remove("stage-active");
      el.classList.add("stage-hidden");
    }
  });

  const celebEl = document.getElementById("stage-celebration");
  if (celebEl) {
    celebEl.classList.remove("stage-hidden");
    celebEl.classList.add("stage-active");
  }

  startConfettiBlast();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 🎊 6. CELEBRATION CONFETTI
// ==========================================
const confettiCanvas = document.getElementById("confetti-canvas");
let confCtx = confettiCanvas ? confettiCanvas.getContext("2d") : null;
let confettiParticles = [];
let confettiActive = false;

function resizeConfettiCanvas() {
  if (!confettiCanvas) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}

class ConfettiPiece {
  constructor() {
    this.x = Math.random() * window.innerWidth;
    this.y = -10;
    this.size = Math.random() * 7 + 4;
    this.speedY = Math.random() * 2.2 + 1.8;
    this.speedX = (Math.random() - 0.5) * 1.8;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 5;
    const colors = ["#ff4d6d", "#ff758f", "#ffccd5", "#ffb703", "#e63946"];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotationSpeed;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
    ctx.restore();
  }
}

function startConfettiBlast() {
  if (!confettiCanvas || !confCtx) return;
  resizeConfettiCanvas();
  window.addEventListener("resize", resizeConfettiCanvas);

  confettiActive = true;
  confettiParticles = [];

  for (let i = 0; i < 70; i++) {
    const p = new ConfettiPiece();
    p.y = Math.random() * (window.innerHeight * 0.6);
    confettiParticles.push(p);
  }

  let duration = 0;
  const timer = setInterval(() => {
    duration += 100;
    if (duration > 3500) {
      clearInterval(timer);
      confettiActive = false;
      return;
    }
    for (let i = 0; i < 2; i++) {
      confettiParticles.push(new ConfettiPiece());
    }
  }, 140);

  function confettiLoop() {
    if (confCtx) confCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.update();
      p.draw(confCtx);
      if (p.y > window.innerHeight + 20) {
        confettiParticles.splice(i, 1);
      }
    }
    if (confettiParticles.length > 0) {
      requestAnimationFrame(confettiLoop);
    }
  }
  confettiLoop();
}

// ==========================================
// 🛠️ 7. EVENT LISTENERS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  updateNameDisplays();

  // Initialize audio on first click or touch
  document.addEventListener("click", () => initAudio(), { once: true });
  document.addEventListener("touchstart", () => initAudio(), { once: true });

  // Sound Toggle
  const soundBtn = document.getElementById("sound-btn");
  const soundIcon = document.getElementById("sound-icon");
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      if (soundIcon) soundIcon.textContent = soundEnabled ? "🔊" : "🔇";
      const tooltip = soundBtn.querySelector(".btn-tooltip");
      if (tooltip) tooltip.textContent = soundEnabled ? "Sound On" : "Muted";
    });
  }

  // Name Customizer Modal
  const customizeBtn = document.getElementById("customize-btn");
  const modal = document.getElementById("customize-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const saveNamesBtn = document.getElementById("save-names-btn");
  const inputHerName = document.getElementById("input-her-name");
  const inputMyName = document.getElementById("input-my-name");

  if (customizeBtn && modal) {
    customizeBtn.addEventListener("click", () => {
      if (inputHerName) inputHerName.value = herName;
      if (inputMyName) inputMyName.value = myName;
      modal.classList.add("show");
    });
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener("click", () => {
      modal.classList.remove("show");
    });
  }

  if (saveNamesBtn && modal) {
    saveNamesBtn.addEventListener("click", () => {
      if (inputHerName && inputHerName.value.trim()) {
        herName = inputHerName.value.trim();
        localStorage.setItem("proposal_herName", herName);
      }
      if (inputMyName && inputMyName.value.trim()) {
        myName = inputMyName.value.trim();
        localStorage.setItem("proposal_myName", myName);
      }
      updateNameDisplays();
      modal.classList.remove("show");
      showToast("Names updated! ✨❤️");
    });
  }

  // --- STAGE 1 BUTTONS ---
  const s1Yes = document.getElementById("s1-yes-btn");
  const s1AbsYes = document.getElementById("s1-abs-yes-btn");
  const s1No = document.getElementById("s1-no-btn");

  if (s1Yes) s1Yes.addEventListener("click", goToCelebration);
  if (s1AbsYes) s1AbsYes.addEventListener("click", goToCelebration);
  if (s1No) s1No.addEventListener("click", () => handleStage1No(s1No));

  // --- STAGE 2 BUTTONS ---
  const s2Yes = document.getElementById("s2-yes-btn");
  const s2BigYes = document.getElementById("s2-big-yes-btn");
  const s2MegaYes = document.getElementById("s2-mega-yes-btn");
  const s2No = document.getElementById("s2-no-btn");

  if (s2Yes) s2Yes.addEventListener("click", goToCelebration);
  if (s2BigYes) s2BigYes.addEventListener("click", goToCelebration);
  if (s2MegaYes) s2MegaYes.addEventListener("click", goToCelebration);
  if (s2No) s2No.addEventListener("click", () => handleStage2No(s2No));

  // --- STAGE 3 BUTTONS ---
  const s3Yes = document.getElementById("s3-yes-btn");
  const s3BigYes = document.getElementById("s3-big-yes-btn");
  const s3ColossalYes = document.getElementById("s3-colossal-yes-btn");
  const s3No = document.getElementById("s3-no-btn");

  if (s3Yes) s3Yes.addEventListener("click", goToCelebration);
  if (s3BigYes) s3BigYes.addEventListener("click", goToCelebration);
  if (s3ColossalYes) s3ColossalYes.addEventListener("click", goToCelebration);
  if (s3No) s3No.addEventListener("click", () => handleStage3No(s3No));

  // --- CELEBRATION BUTTONS ---
  const oneMoreThingBtn = document.getElementById("one-more-thing-btn");
  const promiseLetter = document.getElementById("promise-letter");
  if (oneMoreThingBtn && promiseLetter) {
    oneMoreThingBtn.addEventListener("click", () => {
      initAudio();
      playChimeSound();
      promiseLetter.classList.toggle("hidden-slide");
    });
  }

  const loveYouBtn = document.getElementById("love-you-btn");
  const loveYouModal = document.getElementById("love-you-modal");
  const closeLoveModal = document.getElementById("close-love-modal");

  if (loveYouBtn && loveYouModal) {
    loveYouBtn.addEventListener("click", () => {
      initAudio();
      playChimeSound();
      loveYouModal.classList.remove("hidden-slide");
    });
  }

  if (closeLoveModal && loveYouModal) {
    closeLoveModal.addEventListener("click", () => {
      loveYouModal.classList.add("hidden-slide");
    });
  }

  // Replay Proposal Button
  const replayBtn = document.getElementById("replay-btn");
  if (replayBtn) {
    replayBtn.addEventListener("click", () => {
      noClicksPage1 = 0;
      noClicksPage2 = 0;
      noClicksPage3 = 0;
      if (promiseLetter) promiseLetter.classList.add("hidden-slide");
      if (loveYouModal) loveYouModal.classList.add("hidden-slide");
      switchStage("stage-celebration", "stage-1");
      showToast("Let's ask again! ❤️💍");
    });
  }
});
