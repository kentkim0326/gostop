import React from 'react';

// 정밀 스프라이트 좌표 - 각 카드별 개별 크기
const XS = [2, 128, 254, 374, 498, 622, 746, 870, 1000];
const YS = [2, 190, 374, 561, 749, 939, 1126];
const IMG_W = 1000;
const IMG_H = 1126;

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
  if (faceDown) {
    const dh = Math.round(size * 1.5);
    return (
      <div onClick={onClick} style={{
        width: size, height: dh,
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
        <span style={{ fontSize: size * 0.32, position: 'relative', zIndex: 1, color: '#c9a84c' }}>花</span>
      </div>
    );
  }

  const [col, row] = SPRITE_MAP[card?.id] ?? [0, 0];

  // 이 카드의 실제 픽셀 좌표와 크기
  const srcX = XS[col];
  const srcY = YS[row];
  const srcW = XS[col + 1] - XS[col];  // 카드별 실제 너비
  const srcH = YS[row + 1] - YS[row];  // 카드별 실제 높이

  // 표시 크기 - 원본 비율 유지
  const displayW = size;
  const displayH = Math.round(size * srcH / srcW);

  // 스케일: 이 카드의 실제 크기 → 표시 크기
  const scale = displayW / srcW;

  // backgroundSize: 전체 이미지를 스케일에 맞게
  const bgW = Math.round(IMG_W * scale);
  const bgH = Math.round(IMG_H * scale);

  // backgroundPosition: 이 카드의 시작점을 화면 (0,0)으로
  const bgX = -Math.round(srcX * scale);
  const bgY = -Math.round(srcY * scale);

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