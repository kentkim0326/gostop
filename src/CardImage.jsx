import React from 'react';

// 스프라이트 시트 정보
const SHEET_W = 1000;
const SHEET_H = 1126;
const COLS = 8;
const ROWS = 6;
const CARD_W = SHEET_W / COLS;   // 125px
const CARD_H = SHEET_H / ROWS;   // 187.67px

// 카드 id → 스프라이트 위치 매핑
// 이미지 순서: 행별로 좌→우
// 1행: 1월(광,띠,피,피) 2월(열,띠,피,피)
// 2행: 3월(광,띠,피,피) 4월(열,띠,피,피)
// 3행: 5월(열,띠,피,피) 6월(열,띠,피,피)
// 4행: 7월(열,띠,피,피) 8월(광,열,피,피)
// 5행: 9월(열,띠,피,피) 10월(광,열,띠,피)
// 6행: 11월(광,열,피,피) 12월(광,열,띠,쌍피)

// cards.js의 CARDS 배열 순서와 동일하게 매핑
// id 0~47 순서대로 스프라이트 [col, row]
const SPRITE_MAP = [
  // 1월: 광(0,0) 띠(1,0) 피(2,0) 피(3,0)
  [0,0],[1,0],[2,0],[3,0],
  // 2월: 열(4,0) 띠(5,0) 피(6,0) 피(7,0)
  [4,0],[5,0],[6,0],[7,0],
  // 3월: 광(0,1) 띠(1,1) 피(2,1) 피(3,1)
  [0,1],[1,1],[2,1],[3,1],
  // 4월: 열(4,1) 띠(5,1) 피(6,1) 피(7,1)
  [4,1],[5,1],[6,1],[7,1],
  // 5월: 열(0,2) 띠(1,2) 피(2,2) 피(3,2)
  [0,2],[1,2],[2,2],[3,2],
  // 6월: 열(4,2) 띠(5,2) 피(6,2) 피(7,2)
  [4,2],[5,2],[6,2],[7,2],
  // 7월: 열(0,3) 띠(1,3) 피(2,3) 피(3,3)
  [0,3],[1,3],[2,3],[3,3],
  // 8월: 광(4,3) 열(5,3) 피(6,3) 피(7,3)
  [4,3],[5,3],[6,3],[7,3],
  // 9월: 열(0,4) 띠(1,4) 피(2,4) 피(3,4)
  [0,4],[1,4],[2,4],[3,4],
  // 10월: 광(4,4) 열(5,4) 띠(6,4) 피(7,4)
  [4,4],[5,4],[6,4],[7,4],
  // 11월: 광(0,5) 열(1,5) 피(2,5) 피(3,5)
  [0,5],[1,5],[2,5],[3,5],
  // 12월: 광(4,5) 열(5,5) 띠(6,5) 쌍피(7,5)
  [4,5],[5,5],[6,5],[7,5],
];

export function CardSVG({ card, size = 56, selected = false, onClick, faceDown = false }) {
  const displayW = size;
  const displayH = Math.round(size * (CARD_H / CARD_W));
  const scale = displayW / CARD_W;

  if (faceDown) {
    return (
      <div onClick={onClick} style={{
        width: displayW, height: displayH,
        borderRadius: 6,
        background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
        border: '2px solid #c9a84c',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* 격자 패턴 */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(201,168,76,0.08) 10px, rgba(201,168,76,0.08) 11px), repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(201,168,76,0.08) 10px, rgba(201,168,76,0.08) 11px)',
        }}/>
        <span style={{ fontSize: displayW * 0.35, position: 'relative', zIndex: 1 }}>花</span>
      </div>
    );
  }

  const [col, row] = SPRITE_MAP[card.id] || [0, 0];
  const bgX = -(col * CARD_W * scale);
  const bgY = -(row * CARD_H * scale);
  const bgW = SHEET_W * scale;
  const bgH = SHEET_H * scale;

  return (
    <div
      onClick={onClick}
      style={{
        width: displayW,
        height: displayH,
        backgroundImage: 'url(/cards.webp)',
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundPosition: `${bgX}px ${bgY}px`,
        backgroundRepeat: 'no-repeat',
        borderRadius: 5,
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
