// Web Audio API 효과음 (외부 파일 없이 생성)
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function beep(freq, dur, vol = 0.3, type = 'sine', decay = true) {
  try {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, c.currentTime);
    g.gain.setValueAtTime(vol, c.currentTime);
    if (decay) g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.start(c.currentTime);
    o.stop(c.currentTime + dur);
  } catch(e) {}
}

export const SFX = {
  // 카드 내기 - 딱 하는 소리
  play: () => {
    beep(300, 0.08, 0.25, 'square');
    setTimeout(() => beep(200, 0.06, 0.15, 'square'), 60);
  },
  // 매칭 성공 - 밝은 소리
  match: () => {
    beep(523, 0.1, 0.3, 'sine');
    setTimeout(() => beep(659, 0.1, 0.3, 'sine'), 80);
    setTimeout(() => beep(784, 0.15, 0.3, 'sine'), 160);
  },
  // 쓸기 - 더 화려한 소리
  sweep: () => {
    beep(400, 0.08, 0.3, 'sine');
    setTimeout(() => beep(600, 0.08, 0.3, 'sine'), 60);
    setTimeout(() => beep(800, 0.08, 0.3, 'sine'), 120);
    setTimeout(() => beep(1000, 0.2, 0.3, 'sine'), 180);
  },
  // 뒤집기 - 살짝 낮은 소리
  flip: () => {
    beep(250, 0.12, 0.2, 'triangle');
  },
  // AI 턴 - 부드러운 소리
  aiPlay: () => {
    beep(220, 0.08, 0.15, 'sine');
  },
  // 고! - 높고 짧게
  go: () => {
    beep(880, 0.05, 0.35, 'sine');
    setTimeout(() => beep(1100, 0.15, 0.35, 'sine'), 60);
  },
  // 스톱 / 승리
  win: () => {
    [0,100,200,350].forEach((t,i) => {
      setTimeout(() => beep([523,659,784,1047][i], 0.2, 0.3, 'sine'), t);
    });
  },
  // 패배
  lose: () => {
    beep(300, 0.15, 0.3, 'sawtooth');
    setTimeout(() => beep(220, 0.3, 0.3, 'sawtooth'), 150);
  },
  // 카드 선택
  select: () => {
    beep(440, 0.06, 0.15, 'sine');
  },
};
