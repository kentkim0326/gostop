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
    o.start(c.currentTime); o.stop(c.currentTime + dur);
  } catch(e) {}
}

// 주파수 슬라이드 (포르타멘토)
function slide(f1, f2, dur, vol = 0.3, type = 'sine') {
  try {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = type;
    o.frequency.setValueAtTime(f1, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(f2, c.currentTime + dur);
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.start(c.currentTime); o.stop(c.currentTime + dur);
  } catch(e) {}
}

export const SFX = {
  // 카드 선택
  select: () => {
    beep(440, 0.06, 0.15, 'sine');
  },

  // 카드 내기 - 딱
  play: () => {
    beep(300, 0.08, 0.25, 'square');
    setTimeout(() => beep(200, 0.06, 0.15, 'square'), 60);
  },

  // 매칭 성공 - 밝고 경쾌하게
  match: () => {
    beep(523, 0.1, 0.3, 'sine');
    setTimeout(() => beep(659, 0.1, 0.3, 'sine'), 80);
    setTimeout(() => beep(784, 0.18, 0.35, 'sine'), 160);
  },

  // 3장 쓸기 - 신나는 팡파레
  sweep: () => {
    // 상승하는 아르페지오
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((f, i) => {
      setTimeout(() => beep(f, 0.15, 0.35, 'sine'), i * 70);
    });
    // 마지막에 쫙 퍼지는 화음
    setTimeout(() => {
      beep(1047, 0.4, 0.3, 'sine');
      beep(1319, 0.4, 0.25, 'sine');
      beep(1568, 0.4, 0.2, 'sine');
    }, 420);
  },

  // 광 획득 - 웅장하게
  gwang: () => {
    beep(220, 0.1, 0.2, 'sine');
    setTimeout(() => beep(330, 0.1, 0.3, 'sine'), 80);
    setTimeout(() => beep(440, 0.1, 0.35, 'sine'), 160);
    setTimeout(() => beep(660, 0.5, 0.4, 'sine'), 260);
    setTimeout(() => beep(880, 0.4, 0.3, 'sine'), 300);
  },

  // 뒤집기
  flip: () => {
    slide(350, 250, 0.12, 0.2, 'triangle');
  },

  // AI 턴
  aiPlay: () => {
    beep(220, 0.08, 0.12, 'sine');
  },

  // 버릴 때 - 실망스러운 소리 (하강)
  discard: () => {
    slide(400, 200, 0.25, 0.25, 'sawtooth');
    setTimeout(() => slide(300, 150, 0.2, 0.15, 'sawtooth'), 200);
  },

  // 상대가 내 패 가져갈 때 - 억울한 소리
  stolen: () => {
    beep(300, 0.08, 0.2, 'sawtooth');
    setTimeout(() => slide(280, 140, 0.35, 0.25, 'sawtooth'), 80);
  },

  // 고!
  go: () => {
    beep(880, 0.05, 0.35, 'sine');
    setTimeout(() => beep(1100, 0.15, 0.4, 'sine'), 60);
  },

  // 승리 - 신나는 팡파레
  win: () => {
    const melody = [523,659,784,659,784,1047];
    melody.forEach((f,i) => {
      setTimeout(() => beep(f, i===5?0.5:0.15, 0.35, 'sine'), i*110);
    });
  },

  // 패배 - 처량한 소리
  lose: () => {
    slide(440, 220, 0.3, 0.3, 'sawtooth');
    setTimeout(() => slide(330, 165, 0.4, 0.25, 'sawtooth'), 250);
    setTimeout(() => slide(220, 110, 0.5, 0.2, 'sawtooth'), 550);
  },

  // AI 스톱 (내가 질 때) - 충격
  aiStop: () => {
    beep(200, 0.05, 0.4, 'square');
    setTimeout(() => slide(400, 100, 0.5, 0.35, 'sawtooth'), 60);
  },
};
