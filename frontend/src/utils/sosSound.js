let audioContext = null;
let masterGain = null;
let isPlaying = false;
let schedulerTimer = null;

function getCtx() {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.6;
    masterGain.connect(audioContext.destination);
  }
  return audioContext;
}

function playWail(ctx, startTime) {
  // Main siren oscillator — high powered
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  osc3.connect(gainNode);
  gainNode.connect(masterGain);

  // Wail UP — 440Hz to 960Hz
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(440, startTime);
  osc1.frequency.linearRampToValueAtTime(960, startTime + 0.6);

  // Harmony layer
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(220, startTime);
  osc2.frequency.linearRampToValueAtTime(480, startTime + 0.6);

  // Sub bass punch
  osc3.type = 'sine';
  osc3.frequency.setValueAtTime(110, startTime);
  osc3.frequency.linearRampToValueAtTime(240, startTime + 0.6);

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
  gainNode.gain.setValueAtTime(0.5, startTime + 0.55);
  gainNode.gain.linearRampToValueAtTime(0, startTime + 0.6);

  osc1.start(startTime); osc1.stop(startTime + 0.6);
  osc2.start(startTime); osc2.stop(startTime + 0.6);
  osc3.start(startTime); osc3.stop(startTime + 0.6);
}

function playWailDown(ctx, startTime) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(masterGain);

  // Wail DOWN — 960Hz to 440Hz
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(960, startTime);
  osc1.frequency.linearRampToValueAtTime(440, startTime + 0.6);

  osc2.type = 'square';
  osc2.frequency.setValueAtTime(480, startTime);
  osc2.frequency.linearRampToValueAtTime(220, startTime + 0.6);

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
  gainNode.gain.setValueAtTime(0.5, startTime + 0.55);
  gainNode.gain.linearRampToValueAtTime(0, startTime + 0.6);

  osc1.start(startTime); osc1.stop(startTime + 0.6);
  osc2.start(startTime); osc2.stop(startTime + 0.6);
}

function playBeepAlert(ctx, startTime) {
  // Sharp attention beeps between wails
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(masterGain);

    osc.type = 'square';
    osc.frequency.value = 1200;

    const t = startTime + i * 0.12;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.02);
    gain.gain.setValueAtTime(0.4, t + 0.07);
    gain.gain.linearRampToValueAtTime(0, t + 0.1);

    osc.start(t);
    osc.stop(t + 0.1);
  }
}

function scheduleSiren() {
  if (!isPlaying) return;

  const ctx = getCtx();
  const now = ctx.currentTime;

  // Pattern: WAIL UP → WAIL DOWN → BEEPS → repeat
  playWail(ctx, now);           // 0.0 - 0.6s
  playWailDown(ctx, now + 0.6); // 0.6 - 1.2s
  playWail(ctx, now + 1.2);     // 1.2 - 1.8s
  playWailDown(ctx, now + 1.8); // 1.8 - 2.4s
  playBeepAlert(ctx, now + 2.4); // 2.4 - 2.76s
  playBeepAlert(ctx, now + 2.8); // 2.8 - 3.16s

  // Next cycle after 3.4 seconds
  schedulerTimer = setTimeout(scheduleSiren, 3400);
}

export function startSosSound() {
  if (isPlaying) return;
  isPlaying = true;

  // Resume context if suspended (browser autoplay policy)
  const ctx = getCtx();
  if (ctx.state === 'suspended') {
    ctx.resume().then(() => scheduleSiren());
  } else {
    scheduleSiren();
  }
}

export function stopSosSound() {
  isPlaying = false;

  if (schedulerTimer) {
    clearTimeout(schedulerTimer);
    schedulerTimer = null;
  }

  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
    audioContext = null;
    masterGain = null;
  }
}