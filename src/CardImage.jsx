import React from 'react';

// 정확한 스프라이트 좌표
const XS = [2, 128, 254, 374, 498, 622, 746, 870, 1000];
const YS = [2, 190, 374, 561, 749, 939, 1126];

// 카드 id 0~47 → [col, row]
const SPRITE_MAP = [
  [0,0],[1,0],[2,0],[3,0], // 1월: 광 띠 피 피
  [4,0],[5,0],[6,0],[7,0], // 2월: 열 띠 피 피
  [0,1],[1,1],[2,1],[3,1], // 3월: 광 띠 피 피
  [4,1],[5,1],[6,1],[7,1], // 4월: 열 띠 피 피
  [0,2],[1,2],[2,2],[3,2], // 5월: 열 띠 피 피
  [4,2],[5,2],[6,2],[7,2], // 6월: 열 띠 피 피
  [0,3],[1,3],[2,3],[3,3], // 7월: 열 띠 피 피
  [4,3],[5,3],[6,3],[7,3], // 8월: 광 열 피 피
  [0,4],[1,4],[2,4],[3,4], // 9월: 열 띠 피 피
  [4,4],[5,4],[6,4],[7,4], // 10월: 광 열 띠 피
  [0,5],[1,5],[2,5],[3,5], // 11월: 광 열 피 피
  [4,5],[5,5],[6,5],[7,5], // 12월: 광 열 띠 쌍피
];

export function CardSVG({ card, size = 56, selected = false, onClick, faceDown = false }) {
  const [col, row] = card ? (SPRITE_MAP[card.id] || [0,0]) : [0,0];

  const srcX = XS[col];
  const srcY = YS[row];
  const srcW = XS[col+1] - XS[col];
  const srcH = YS[row+1] - YS[row];

  const displayW = size;
  const displayH = Math.round(size * (srcH / srcW));
  const scaleX = displayW / srcW;
  const scaleY = displayH / srcH;

  if (faceDown) {
    return (
      <div onClick={onClick} style={{
        width: displayW, height: displayH,
        borderRadius: 6,
        background: '#1a1a1a',
        border: '2px solid #c9a84c',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 10px,rgba(201,168,76,0.08) 10px,rgba(201,168,76,0.08) 11px),repeating-linear-gradient(90deg,transparent,transparent 10px,rgba(201,168,76,0.08) 10px,rgba(201,168,76,0.08) 11px)',
        }}/>
        <span style={{ fontSize: displayW * 0.32, position: 'relative', zIndex: 1, color: '#c9a84c' }}>花</span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        width: displayW,
        height: displayH,
        backgroundImage: 'url(/cards.webp)',
        backgroundSize: `${1000 * scaleX}px ${1126 * scaleY}px`,
        backgroundPosition: `-${srcX * scaleX}px -${srcY * scaleY}px`,
        backgroundRepeat: 'no-repeat',
        borderRadius: 4,
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        transform: selected ? 'translateY(-10px)' : 'none',
        transition: 'transform 0.15s',
        filter: selected ? 'drop-shadow(0 0 8px #ffd700) brightness(1.1)' : 'none',
        outline: selected ? '2px solid #ffd700' : 'none',
        outlineOffset: '2px',
      }}
    />
  );
}