// AI 전략 - 난이도별
import { calcScore } from './cards';

// 쉬움: 랜덤 선택
function easyPick(hand, field) {
  const match = hand.filter(c => field.some(f => f.m === c.m));
  if (match.length > 0 && Math.random() < 0.5) return match[Math.floor(Math.random()*match.length)];
  return hand[Math.floor(Math.random()*hand.length)];
}

// 보통: 매칭 우선, 피 버리기
function normalPick(hand, field) {
  const fieldMonths = new Set(field.map(c => c.m));
  const match = hand.filter(c => fieldMonths.has(c.m));
  if (match.length > 0) return match[0];
  const junk = hand.find(c => c.t === 'junk' || c.t === 'junk2');
  return junk || hand[0];
}

// 어려움: 고가치 카드 매칭 우선, 상대 점수 견제
function hardPick(hand, field) {
  const fieldMonths = new Set(field.map(c => c.m));
  const matches = hand.filter(c => fieldMonths.has(c.m));

  if (matches.length > 0) {
    // 광 > 열 > 띠 > 피 순서로 우선
    const priority = { gwang: 4, animal: 3, ribbon: 2, junk: 1, junk2: 1 };
    matches.sort((a, b) => (priority[b.t]||0) - (priority[a.t]||0));
    return matches[0];
  }
  // 버릴 때: 피 우선, 없으면 낮은 가치
  const junk = hand.find(c => c.t === 'junk' || c.t === 'junk2');
  return junk || hand[0];
}

export function aiPickCard(hand, field, difficulty) {
  if (difficulty === 'easy') return easyPick(hand, field);
  if (difficulty === 'hard') return hardPick(hand, field);
  return normalPick(hand, field);
}

// AI 스톱 결정
export function aiDecideStop(cap, goCount, difficulty) {
  const sc = calcScore(cap);
  if (sc < 3) return false;
  if (difficulty === 'easy') return Math.random() < 0.35;   // 자주 안 멈춤
  if (difficulty === 'hard') return sc >= 5 && Math.random() < 0.75; // 높은 점수에서 멈춤
  return Math.random() < 0.55; // 보통
}
