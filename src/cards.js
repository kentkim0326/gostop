export const MONTH_KR = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

const rawCards = [
  {m:1,t:"gwang"},{m:1,t:"ribbon"},{m:1,t:"junk"},{m:1,t:"junk"},
  {m:2,t:"animal"},{m:2,t:"ribbon"},{m:2,t:"junk"},{m:2,t:"junk"},
  {m:3,t:"gwang"},{m:3,t:"ribbon"},{m:3,t:"junk"},{m:3,t:"junk"},
  {m:4,t:"animal"},{m:4,t:"ribbon"},{m:4,t:"junk"},{m:4,t:"junk"},
  {m:5,t:"animal"},{m:5,t:"ribbon"},{m:5,t:"junk"},{m:5,t:"junk"},
  {m:6,t:"animal"},{m:6,t:"ribbon"},{m:6,t:"junk"},{m:6,t:"junk"},
  {m:7,t:"animal"},{m:7,t:"ribbon"},{m:7,t:"junk"},{m:7,t:"junk"},
  {m:8,t:"gwang"},{m:8,t:"animal"},{m:8,t:"junk"},{m:8,t:"junk"},
  {m:9,t:"animal"},{m:9,t:"ribbon"},{m:9,t:"junk"},{m:9,t:"junk"},
  {m:10,t:"gwang"},{m:10,t:"animal"},{m:10,t:"ribbon"},{m:10,t:"junk"},
  {m:11,t:"gwang"},{m:11,t:"animal"},{m:11,t:"junk"},{m:11,t:"junk"},
  {m:12,t:"gwang"},{m:12,t:"animal"},{m:12,t:"ribbon"},{m:12,t:"junk2"},
];

export const CARDS = rawCards.map((c, i) => ({
  ...c,
  id: i,
  junkPts: c.t === "junk" ? 1 : c.t === "junk2" ? 2 : 0,
}));

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function calcScore(cap) {
  let s = 0;
  const g = cap.filter(c => c.t === "gwang");
  const a = cap.filter(c => c.t === "animal");
  const r = cap.filter(c => c.t === "ribbon");
  const jp = cap.filter(c => c.t === "junk" || c.t === "junk2").reduce((x, c) => x + c.junkPts, 0);

  if (g.length === 5) s += 15;
  else if (g.length === 4) s += 4;
  else if (g.length === 3) s += g.find(c => c.m === 12) ? 2 : 3;

  if (a.length >= 5) s += (a.length - 4);

  const red = r.filter(c => [1, 2, 7].includes(c.m));
  const blue = r.filter(c => [4, 5, 6, 9].includes(c.m));
  if (red.length >= 3) s += 3;
  if (blue.length >= 3) s += 3;
  if (r.length >= 5) s += (r.length - 4);

  if (jp >= 10) s += (jp - 9);
  return s;
}

export function getBreakdown(cap) {
  const g = cap.filter(c => c.t === "gwang");
  const a = cap.filter(c => c.t === "animal");
  const r = cap.filter(c => c.t === "ribbon");
  const jp = cap.filter(c => c.t === "junk" || c.t === "junk2").reduce((x, c) => x + c.junkPts, 0);
  const items = [];
  if (g.length >= 3) {
    const v = g.length === 5 ? 15 : g.length === 4 ? 4 : (g.find(c => c.m === 12) ? 2 : 3);
    items.push(`광 ${g.length}장 → ${v}점`);
  }
  if (a.length >= 5) items.push(`열 ${a.length}장 → ${a.length - 4}점`);
  if (r.filter(c => [1,2,7].includes(c.m)).length >= 3) items.push("홍단 → 3점");
  if (r.filter(c => [4,5,6,9].includes(c.m)).length >= 3) items.push("청단 → 3점");
  if (r.length >= 5) items.push(`띠 ${r.length}장 → ${r.length - 4}점`);
  if (jp >= 10) items.push(`피 ${jp}장 → ${jp - 9}점`);
  return items;
}
