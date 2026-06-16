import React from 'react';
import { MONTH_KR } from './cards';

const TYPE_COLOR = {
  gwang: "#c9a84c",
  animal: "#4a9a4a",
  ribbon: "#c94444",
  junk: "#888",
  junk2: "#888",
};

const TYPE_LABEL = { gwang: "광", animal: "열", ribbon: "띠", junk: "피", junk2: "피" };

function getArt(card, w, h) {
  const cx = w / 2, cy = h * 0.52, r = h * 0.16;
  const arts = {
    1:  () => ({ bg:"#e8f5e8", icon: card.t==="gwang" ? "🦅" : "🌲" }),
    2:  () => ({ bg:"#fff0f5", icon: card.t==="animal" ? "🐦" : "🌸" }),
    3:  () => ({ bg:"#fff0f5", icon: card.t==="gwang" ? "🌺" : "🌸" }),
    4:  () => ({ bg:"#f0fff0", icon: card.t==="animal" ? "🦜" : "🌿" }),
    5:  () => ({ bg:"#fff8e1", icon: card.t==="animal" ? "🌻" : "🌺" }),
    6:  () => ({ bg:"#fce4ec", icon: card.t==="animal" ? "🦋" : "🌹" }),
    7:  () => ({ bg:"#fff3e0", icon: card.t==="animal" ? "🐗" : "🌾" }),
    8:  () => ({ bg:"#e8eaf6", icon: card.t==="gwang" ? "🌕" : card.t==="animal" ? "🦢" : "⛰️" }),
    9:  () => ({ bg:"#fffde7", icon: card.t==="animal" ? "🍶" : "🌼" }),
    10: () => ({ bg:"#fff8e1", icon: card.t==="gwang" ? "🦌" : card.t==="animal" ? "🍁" : "🍂" }),
    11: () => ({ bg:"#e8eaf6", icon: card.t==="gwang" ? "🌙" : card.t==="animal" ? "🕊️" : "🌑" }),
    12: () => ({ bg:"#e3f2fd", icon: card.t==="gwang" ? "☂️" : card.t==="animal" ? "🐸" : card.t==="ribbon" ? "🎗️" : "🌧️" }),
  };
  const { bg, icon } = (arts[card.m] || arts[1])();
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill={bg} />
      <text x={cx} y={cy + r * 0.45} textAnchor="middle" fontSize={r * 1.5} fontFamily="serif">{icon}</text>
    </>
  );
}

export function CardSVG({ card, size = 56, selected = false, onClick, faceDown = false }) {
  const w = size, h = Math.round(size * 1.45);
  const bg = TYPE_COLOR[card?.t] || "#888";

  return (
    <svg
      width={w} height={h}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transform: selected ? 'translateY(-8px)' : 'none',
        transition: 'transform 0.15s',
        filter: selected ? 'drop-shadow(0 0 6px #c9a84c)' : 'none',
        flexShrink: 0,
      }}
    >
      {faceDown ? (
        <>
          <rect width={w} height={h} rx={6} fill="#1a5c1a" stroke="#2d8a2d" strokeWidth={1.5} />
          <rect x={3} y={3} width={w-6} height={h-6} rx={4} fill="none" stroke="#4aaa4a" strokeWidth={1} />
          <text x={w/2} y={h/2+6} textAnchor="middle" fontSize={w*0.4} fontFamily="serif">🎴</text>
        </>
      ) : (
        <>
          <rect width={w} height={h} rx={6} fill="#f5ead0" stroke="#bbb" strokeWidth={1.5} />
          {/* 상단 헤더 */}
          <rect x={0} y={0} width={w} height={h*0.25} rx={6} fill={bg} />
          <rect x={0} y={h*0.18} width={w} height={h*0.08} fill={bg} />
          <text x={w/2} y={h*0.17} textAnchor="middle" fill="white" fontSize={size*0.17} fontWeight="bold" fontFamily="sans-serif">
            {MONTH_KR[card.m-1]}
          </text>
          {/* 카드 아트 */}
          {getArt(card, w, h)}
          {/* 하단 타입 */}
          <rect x={2} y={h-h*0.23} width={w-4} height={h*0.21} rx={4} fill={`${bg}cc`} />
          <text x={w/2} y={h-h*0.07} textAnchor="middle" fill="white" fontSize={size*0.17} fontWeight="bold" fontFamily="sans-serif">
            {TYPE_LABEL[card.t]}
          </text>
        </>
      )}
    </svg>
  );
}
