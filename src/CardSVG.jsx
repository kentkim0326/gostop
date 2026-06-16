import React from 'react';

// 전통 화투 스타일 SVG 카드
// 검은 배경, 월별 식물/동물 문양, 광=금테두리, 띠=빨간띠, 피=검은패

function Pine(w, h) {
  // 1월 솔 - 소나무
  const cx = w/2, cy = h*0.5;
  return `
    <line x1="${cx}" y1="${cy-h*0.22}" x2="${cx}" y2="${cy+h*0.18}" stroke="#2d6a2d" stroke-width="${w*0.06}"/>
    <line x1="${cx-w*0.18}" y1="${cy-h*0.05}" x2="${cx}" y2="${cy-h*0.12}" stroke="#2d6a2d" stroke-width="${w*0.04}"/>
    <line x1="${cx+w*0.18}" y1="${cy-h*0.05}" x2="${cx}" y2="${cy-h*0.12}" stroke="#2d6a2d" stroke-width="${w*0.04}"/>
    <line x1="${cx-w*0.14}" y1="${cy+h*0.04}" x2="${cx}" y2="${cy-h*0.02}" stroke="#2d6a2d" stroke-width="${w*0.04}"/>
    <line x1="${cx+w*0.14}" y1="${cy+h*0.04}" x2="${cx}" y2="${cy-h*0.02}" stroke="#2d6a2d" stroke-width="${w*0.04}"/>
    <ellipse cx="${cx-w*0.2}" cy="${cy-h*0.06}" rx="${w*0.1}" ry="${h*0.07}" fill="#1a5c1a"/>
    <ellipse cx="${cx+w*0.2}" cy="${cy-h*0.06}" rx="${w*0.1}" ry="${h*0.07}" fill="#1a5c1a"/>
    <ellipse cx="${cx}" cy="${cy-h*0.17}" rx="${w*0.1}" ry="${h*0.08}" fill="#1a5c1a"/>
    <ellipse cx="${cx-w*0.12}" cy="${cy+h*0.03}" rx="${w*0.09}" ry="${h*0.06}" fill="#1a5c1a"/>
    <ellipse cx="${cx+w*0.12}" cy="${cy+h*0.03}" rx="${w*0.09}" ry="${h*0.06}" fill="#1a5c1a"/>
  `;
}

function Plum(w, h) {
  // 2월 매화
  const cx = w/2, cy = h*0.5;
  const petals = [0,72,144,216,288].map(a => {
    const rad = a * Math.PI/180;
    const px = cx + Math.cos(rad)*w*0.14;
    const py = cy + Math.sin(rad)*h*0.12;
    return `<ellipse cx="${px}" cy="${py}" rx="${w*0.1}" ry="${h*0.08}" fill="#e84393" opacity="0.9" transform="rotate(${a},${px},${py})"/>`;
  }).join('');
  return `
    <line x1="${cx}" y1="${cy+h*0.25}" x2="${cx+w*0.08}" y2="${cy+h*0.05}" stroke="#8B4513" stroke-width="${w*0.05}"/>
    <line x1="${cx+w*0.08}" y1="${cy+h*0.05}" x2="${cx-w*0.05}" y2="${cy-h*0.1}" stroke="#8B4513" stroke-width="${w*0.04}"/>
    ${petals}
    <circle cx="${cx}" cy="${cy}" r="${w*0.06}" fill="#ffdd00"/>
  `;
}

function Cherry(w, h) {
  // 3월 벚꽃
  const cx = w/2, cy = h*0.48;
  const flowers = [
    [cx, cy-h*0.12], [cx-w*0.2, cy], [cx+w*0.2, cy], [cx-w*0.1, cy+h*0.12], [cx+w*0.1, cy+h*0.12]
  ].map(([fx,fy]) => {
    const p = [0,72,144,216,288].map(a => {
      const r = a*Math.PI/180;
      return `<ellipse cx="${fx+Math.cos(r)*w*0.07}" cy="${fy+Math.sin(r)*h*0.06}" rx="${w*0.055}" ry="${h*0.045}" fill="#ffb7c5" transform="rotate(${a},${fx+Math.cos(r)*w*0.07},${fy+Math.sin(r)*h*0.06})"/>`;
    }).join('');
    return p + `<circle cx="${fx}" cy="${fy}" r="${w*0.03}" fill="#ffdd00"/>`;
  }).join('');
  return `
    <line x1="${cx}" y1="${cy+h*0.3}" x2="${cx}" y2="${cy+h*0.05}" stroke="#8B4513" stroke-width="${w*0.06}"/>
    <line x1="${cx}" y1="${cy+h*0.05}" x2="${cx-w*0.22}" y2="${cy+h*0.02}" stroke="#8B4513" stroke-width="${w*0.04}"/>
    <line x1="${cx}" y1="${cy+h*0.05}" x2="${cx+w*0.22}" y2="${cy+h*0.02}" stroke="#8B4513" stroke-width="${w*0.04}"/>
    ${flowers}
  `;
}

function Wisteria(w, h) {
  // 4월 등나무
  const cx = w/2, cy = h*0.45;
  let clusters = '';
  for(let i=0;i<4;i++) {
    const x = cx + (i-1.5)*w*0.12;
    for(let j=0;j<5;j++) {
      clusters += `<ellipse cx="${x+(j%2)*w*0.05}" cy="${cy+j*h*0.05-h*0.05}" rx="${w*0.06}" ry="${h*0.04}" fill="#9370DB" opacity="0.85"/>`;
    }
  }
  return `
    <path d="M${cx-w*0.3},${cy-h*0.2} Q${cx},${cy-h*0.28} ${cx+w*0.3},${cy-h*0.2}" stroke="#2d6a2d" stroke-width="${w*0.04}" fill="none"/>
    ${clusters}
  `;
}

function Iris(w, h) {
  // 5월 난초
  const cx = w/2, cy = h*0.5;
  return `
    <path d="M${cx},${cy+h*0.22} C${cx-w*0.15},${cy+h*0.1} ${cx-w*0.2},${cy-h*0.05} ${cx-w*0.05},${cy-h*0.2}" stroke="#4CAF50" stroke-width="${w*0.04}" fill="none"/>
    <path d="M${cx},${cy+h*0.22} C${cx+w*0.15},${cy+h*0.1} ${cx+w*0.2},${cy-h*0.05} ${cx+w*0.05},${cy-h*0.2}" stroke="#4CAF50" stroke-width="${w*0.04}" fill="none"/>
    <path d="M${cx},${cy+h*0.22} C${cx},${cy+h*0.05} ${cx},${cy-h*0.1} ${cx},${cy-h*0.22}" stroke="#4CAF50" stroke-width="${w*0.04}" fill="none"/>
    <ellipse cx="${cx-w*0.12}" cy="${cy-h*0.18}" rx="${w*0.1}" ry="${h*0.07}" fill="#9c27b0" transform="rotate(-30,${cx-w*0.12},${cy-h*0.18})"/>
    <ellipse cx="${cx+w*0.12}" cy="${cy-h*0.18}" rx="${w*0.1}" ry="${h*0.07}" fill="#9c27b0" transform="rotate(30,${cx+w*0.12},${cy-h*0.18})"/>
    <ellipse cx="${cx}" cy="${cy-h*0.24}" rx="${w*0.08}" ry="${h*0.06}" fill="#ce93d8"/>
  `;
}

function Peony(w, h) {
  // 6월 모란
  const cx = w/2, cy = h*0.5;
  const petals = [0,45,90,135,180,225,270,315].map(a => {
    const r = a*Math.PI/180;
    return `<ellipse cx="${cx+Math.cos(r)*w*0.13}" cy="${cy+Math.sin(r)*h*0.11}" rx="${w*0.11}" ry="${h*0.09}" fill="#e91e8c" opacity="0.8" transform="rotate(${a},${cx+Math.cos(r)*w*0.13},${cy+Math.sin(r)*h*0.11})"/>`;
  }).join('');
  return `
    <line x1="${cx}" y1="${cy+h*0.28}" x2="${cx}" y2="${cy+h*0.1}" stroke="#2d6a2d" stroke-width="${w*0.05}"/>
    <ellipse cx="${cx-w*0.2}" cy="${cy+h*0.08}" rx="${w*0.12}" ry="${h*0.07}" fill="#4CAF50"/>
    <ellipse cx="${cx+w*0.2}" cy="${cy+h*0.08}" rx="${w*0.12}" ry="${h*0.07}" fill="#4CAF50"/>
    ${petals}
    <circle cx="${cx}" cy="${cy}" r="${w*0.07}" fill="#ffdd00"/>
  `;
}

function Clover(w, h) {
  // 7월 싸리
  const cx = w/2, cy = h*0.48;
  let leaves = '';
  for(let i=0;i<6;i++) {
    const x = cx + (i%3-1)*w*0.15;
    const y = cy + Math.floor(i/3)*h*0.18 - h*0.1;
    leaves += `<ellipse cx="${x}" cy="${y}" rx="${w*0.08}" ry="${h*0.06}" fill="#c0392b" opacity="0.8"/>`;
    leaves += `<ellipse cx="${x+w*0.1}" cy="${y+h*0.03}" rx="${w*0.07}" ry="${h*0.05}" fill="#e74c3c" opacity="0.7"/>`;
  }
  return `
    <line x1="${cx-w*0.1}" y1="${cy+h*0.28}" x2="${cx-w*0.1}" y2="${cy-h*0.15}" stroke="#8B4513" stroke-width="${w*0.04}"/>
    <line x1="${cx+w*0.1}" y1="${cy+h*0.28}" x2="${cx+w*0.1}" y2="${cy-h*0.15}" stroke="#8B4513" stroke-width="${w*0.04}"/>
    ${leaves}
  `;
}

function Mountain(w, h) {
  // 8월 공산
  const cx = w/2, cy = h*0.5;
  return `
    <polygon points="${cx},${cy-h*0.22} ${cx-w*0.28},${cy+h*0.18} ${cx+w*0.28},${cy+h*0.18}" fill="#1a3a5c" stroke="#2a5a8c" stroke-width="1"/>
    <polygon points="${cx-w*0.1},${cy-h*0.05} ${cx-w*0.32},${cy+h*0.18} ${cx+w*0.12},${cy+h*0.18}" fill="#0d2137"/>
    <circle cx="${cx+w*0.15}" cy="${cy-h*0.15}" r="${w*0.12}" fill="#f5c518" opacity="0.95"/>
    <circle cx="${cx+w*0.15}" cy="${cy-h*0.15}" r="${w*0.09}" fill="#ffd700"/>
  `;
}

function Chrysanthemum(w, h) {
  // 9월 국화
  const cx = w/2, cy = h*0.48;
  const petals = Array.from({length:12},(_,i) => {
    const a = i*30*Math.PI/180;
    return `<ellipse cx="${cx+Math.cos(a)*w*0.14}" cy="${cy+Math.sin(a)*h*0.12}" rx="${w*0.07}" ry="${h*0.1}" fill="#f5c518" opacity="0.9" transform="rotate(${i*30},${cx+Math.cos(a)*w*0.14},${cy+Math.sin(a)*h*0.12})"/>`;
  }).join('');
  return `
    <line x1="${cx}" y1="${cy+h*0.28}" x2="${cx}" y2="${cy+h*0.08}" stroke="#2d6a2d" stroke-width="${w*0.04}"/>
    <ellipse cx="${cx-w*0.18}" cy="${cy+h*0.1}" rx="${w*0.1}" ry="${h*0.06}" fill="#4CAF50"/>
    <ellipse cx="${cx+w*0.18}" cy="${cy+h*0.1}" rx="${w*0.1}" ry="${h*0.06}" fill="#4CAF50"/>
    ${petals}
    <circle cx="${cx}" cy="${cy}" r="${w*0.06}" fill="#ff6b00"/>
  `;
}

function Maple(w, h) {
  // 10월 단풍
  const cx = w/2, cy = h*0.48;
  const leaf = (x,y,rot,c) => `<g transform="rotate(${rot},${x},${y})">
    <path d="M${x},${y-h*0.1} L${x-w*0.08},${y} L${x-w*0.05},${y+h*0.08} L${x},${y+h*0.04} L${x+w*0.05},${y+h*0.08} L${x+w*0.08},${y} Z" fill="${c}" opacity="0.9"/>
  </g>`;
  return `
    <line x1="${cx}" y1="${cy+h*0.28}" x2="${cx}" y2="${cy+h*0.05}" stroke="#8B4513" stroke-width="${w*0.05}"/>
    <line x1="${cx}" y1="${cy+h*0.05}" x2="${cx-w*0.2}" y2="${cy-h*0.05}" stroke="#8B4513" stroke-width="${w*0.035}"/>
    <line x1="${cx}" y1="${cy+h*0.05}" x2="${cx+w*0.2}" y2="${cy-h*0.05}" stroke="#8B4513" stroke-width="${w*0.035}"/>
    ${leaf(cx, cy-h*0.12, 0, '#e74c3c')}
    ${leaf(cx-w*0.2, cy-h*0.06, -20, '#e67e22')}
    ${leaf(cx+w*0.2, cy-h*0.06, 20, '#c0392b')}
    ${leaf(cx-w*0.1, cy+h*0.02, -10, '#e74c3c')}
    ${leaf(cx+w*0.1, cy+h*0.02, 10, '#e67e22')}
  `;
}

function Paulownia(w, h) {
  // 11월 오동
  const cx = w/2, cy = h*0.48;
  return `
    <line x1="${cx}" y1="${cy+h*0.28}" x2="${cx}" y2="${cy+h*0.05}" stroke="#8B4513" stroke-width="${w*0.06}"/>
    <line x1="${cx}" y1="${cy+h*0.1}" x2="${cx-w*0.22}" y2="${cy-h*0.02}" stroke="#8B4513" stroke-width="${w*0.04}"/>
    <line x1="${cx}" y1="${cy+h*0.1}" x2="${cx+w*0.22}" y2="${cy-h*0.02}" stroke="#8B4513" stroke-width="${w*0.04}"/>
    <ellipse cx="${cx-w*0.22}" cy="${cy-h*0.07}" rx="${w*0.1}" ry="${h*0.14}" fill="#9c27b0" opacity="0.8"/>
    <ellipse cx="${cx}" cy="${cy-h*0.14}" rx="${w*0.1}" ry="${h*0.14}" fill="#7b1fa2" opacity="0.9"/>
    <ellipse cx="${cx+w*0.22}" cy="${cy-h*0.07}" rx="${w*0.1}" ry="${h*0.14}" fill="#9c27b0" opacity="0.8"/>
    <ellipse cx="${cx-w*0.18}" cy="${cy+h*0.08}" rx="${w*0.14}" ry="${h*0.08}" fill="#4CAF50"/>
    <ellipse cx="${cx+w*0.18}" cy="${cy+h*0.08}" rx="${w*0.14}" ry="${h*0.08}" fill="#4CAF50"/>
  `;
}

function Rain(w, h) {
  // 12월 비
  const cx = w/2, cy = h*0.48;
  let drops = '';
  for(let i=0;i<12;i++) {
    const x = (w*0.15) + (i%4)*w*0.19;
    const y = (h*0.28) + Math.floor(i/4)*h*0.12;
    drops += `<line x1="${x}" y1="${y}" x2="${x-w*0.03}" y2="${y+h*0.07}" stroke="#5b9bd5" stroke-width="${w*0.025}" stroke-linecap="round"/>`;
  }
  return `
    <rect x="${w*0.1}" y="${h*0.22}" width="${w*0.8}" height="${h*0.06}" rx="${h*0.02}" fill="#555"/>
    ${drops}
  `;
}

const MONTH_ART = [Pine,Plum,Cherry,Wisteria,Iris,Peony,Clover,Mountain,Chrysanthemum,Maple,Paulownia,Rain];

// 동물/특수 오버레이
function getAnimalOverlay(card, w, h) {
  const cx = w/2, cy = h*0.5;
  if(card.t !== 'animal' && card.t !== 'gwang') return '';
  const overlays = {
    1:  `<text x="${cx}" y="${cy-h*0.05}" text-anchor="middle" font-size="${w*0.28}" font-family="serif">🦅</text>`, // 학
    2:  `<text x="${cx}" y="${cy+h*0.08}" text-anchor="middle" font-size="${w*0.25}" font-family="serif">🐦</text>`,
    3:  '', // 벚꽃광은 아트만
    4:  `<text x="${cx}" y="${cy+h*0.08}" text-anchor="middle" font-size="${w*0.25}" font-family="serif">🦜</text>`,
    5:  `<text x="${cx}" y="${cy+h*0.08}" text-anchor="middle" font-size="${w*0.25}" font-family="serif">🌉</text>`,
    6:  `<text x="${cx}" y="${cy+h*0.08}" text-anchor="middle" font-size="${w*0.25}" font-family="serif">🦋</text>`,
    7:  `<text x="${cx}" y="${cy+h*0.08}" text-anchor="middle" font-size="${w*0.25}" font-family="serif">🐗</text>`,
    8:  `<text x="${cx}" y="${cy+h*0.1}" text-anchor="middle" font-size="${w*0.22}" font-family="serif">🦢</text>`,
    9:  `<text x="${cx}" y="${cy+h*0.1}" text-anchor="middle" font-size="${w*0.22}" font-family="serif">🍶</text>`,
    10: `<text x="${cx}" y="${cy+h*0.1}" text-anchor="middle" font-size="${w*0.22}" font-family="serif">🍁</text>`,
    11: `<text x="${cx}" y="${cy+h*0.1}" text-anchor="middle" font-size="${w*0.22}" font-family="serif">🕊️</text>`,
    12: `<text x="${cx}" y="${cy+h*0.1}" text-anchor="middle" font-size="${w*0.22}" font-family="serif">🐸</text>`,
  };
  return overlays[card.m] || '';
}

// 띠 오버레이
function getRibbonOverlay(card, w, h) {
  if(card.t !== 'ribbon') return '';
  const isRed = [1,2,7].includes(card.m);
  const color = isRed ? '#cc0000' : '#1565c0';
  return `
    <rect x="${w*0.08}" y="${h*0.55}" width="${w*0.84}" height="${h*0.12}" rx="${h*0.02}" fill="${color}" opacity="0.92"/>
    <text x="${w/2}" y="${h*0.645}" text-anchor="middle" fill="white" font-size="${w*0.14}" font-weight="bold" font-family="serif">${isRed?'홍단':'청단'}</text>
  `;
}

// 광 오버레이
function getGwangOverlay(card, w, h) {
  if(card.t !== 'gwang') return '';
  return `
    <rect x="${w*0.05}" y="${h*0.03}" width="${w*0.9}" height="${h*0.94}" rx="4" fill="none" stroke="#ffd700" stroke-width="${w*0.06}" opacity="0.6"/>
    <text x="${w/2}" y="${h*0.12}" text-anchor="middle" fill="#ffd700" font-size="${w*0.18}" font-weight="bold" font-family="serif">光</text>
  `;
}

// 피 무늬 (단순 배경 점)
function getJunkOverlay(card, w, h) {
  if(card.t !== 'junk' && card.t !== 'junk2') return '';
  if(card.t === 'junk2') {
    return `<text x="${w/2}" y="${h*0.7}" text-anchor="middle" fill="#aaa" font-size="${w*0.13}" font-family="serif">쌍피</text>`;
  }
  return '';
}

export function CardSVG({ card, size = 56, selected = false, onClick, faceDown = false }) {
  const w = size, h = Math.round(size * 1.5);

  if(faceDown) {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink:0, cursor: onClick?'pointer':'default' }} onClick={onClick}>
        <rect width={w} height={h} rx={5} fill="#1a1a1a" stroke="#c9a84c" strokeWidth={2}/>
        <rect x={3} y={3} width={w-6} height={h-6} rx={3} fill="none" stroke="#8B6914" strokeWidth={1}/>
        {/* 뒷면 격자 무늬 */}
        {Array.from({length:5},(_,i)=>
          `<line x1="${w*0.1+i*w*0.18}" y1="${h*0.05}" x2="${w*0.1+i*w*0.18}" y2="${h*0.95}" stroke="#333" stroke-width="0.8"/>`
        ).join('')}
        {Array.from({length:7},(_,i)=>
          `<line x1="${w*0.05}" y1="${h*0.08+i*h*0.13}" x2="${w*0.95}" y2="${h*0.08+i*h*0.13}" stroke="#333" stroke-width="0.8"/>`
        ).join('')}
        <text x={w/2} y={h/2+5} textAnchor="middle" fontSize={w*0.35} fontFamily="serif" fill="#c9a84c">花</text>
      </svg>
    );
  }

  const art = MONTH_ART[card.m-1];
  const artSvg = art ? art(w, h) : '';
  const animalOverlay = getAnimalOverlay(card, w, h);
  const ribbonOverlay = getRibbonOverlay(card, w, h);
  const gwangOverlay = getGwangOverlay(card, w, h);
  const junkOverlay = getJunkOverlay(card, w, h);

  // 카드 배경색: 월별 색조
  const bgColors = [
    '#0d1f0d','#1a0d1a','#1a0d1a','#0d1a0d','#0d1a0d','#1a0a12',
    '#1a0d0d','#0a0d1f','#1a1a0d','#1a0d0d','#100d1a','#0d0d1f'
  ];
  const cardBg = bgColors[card.m-1] || '#111';

  return (
    <svg
      width={w} height={h}
      viewBox={`0 0 ${w} ${h}`}
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transform: selected ? 'translateY(-10px)' : 'none',
        transition: 'transform 0.15s',
        filter: selected ? 'drop-shadow(0 0 8px #ffd700)' : 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
        flexShrink: 0,
      }}
    >
      {/* 카드 본체 */}
      <rect width={w} height={h} rx={5} fill={cardBg} stroke="#555" strokeWidth={1}/>
      {/* 이너 테두리 */}
      <rect x={2} y={2} width={w-4} height={h-4} rx={3} fill="none" stroke="#333" strokeWidth={0.5}/>

      {/* 아트 */}
      <g dangerouslySetInnerHTML={{__html: artSvg + animalOverlay + ribbonOverlay + gwangOverlay + junkOverlay}}/>

      {/* 월 표시 - 좌상단 */}
      <rect x={1} y={1} width={w*0.38} height={h*0.14} rx={3} fill="rgba(0,0,0,0.7)"/>
      <text x={w*0.19} y={h*0.105} textAnchor="middle" fill="#e0c060" fontSize={w*0.15} fontWeight="bold" fontFamily="serif">
        {card.m}月
      </text>
    </svg>
  );
}
