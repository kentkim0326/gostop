import { useState, useEffect, useCallback } from "react";
import { CARDS, MONTH_KR, shuffle, calcScore, getBreakdown } from "./cards";
import { CardSVG } from "./CardSVG";
import "./App.css";

function useCardSize() {
  const [sizes, setSizes] = useState({ opp: 38, field: 44, hand: 50 });
  useEffect(() => {
    function calc() {
      const vw = Math.min(window.innerWidth, 480);
      setSizes({
        opp:   Math.floor((vw - 32) / 8.5),
        field: Math.floor((vw - 28) / 7),
        hand:  Math.floor((vw - 28) / 7.5),
        cap:   Math.floor((vw - 32) / 10),
      });
    }
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return sizes;
}

function dealGame() {
  const deck = shuffle(CARDS.map(c => ({ ...c })));
  const field = deck.splice(0, 6);
  const playerHand = deck.splice(0, 7);
  const aiHand = deck.splice(0, 7);
  return {
    deck, field,
    playerHand, aiHand,
    playerCap: [], aiCap: [],
    phase: "player_select", // player_select | player_draw | ai_turn | gostop | result
    goCount: 0,
    selected: null,
    drawn: null,
    lastWinner: null, // 'player' | 'ai' | null
  };
}

function matchCards(card, field, cap) {
  const same = field.filter(c => c.m === card.m);
  if (same.length === 0) {
    return { field: [...field, card], cap };
  }
  const take = same.length >= 2 ? same : [same[0]];
  return {
    field: field.filter(c => !take.find(t => t.id === c.id)),
    cap: [...cap, card, ...take],
  };
}

// AI 전략: 바닥과 매칭되는 패 우선, 없으면 피 버리기
function aiPickCard(hand, field) {
  const fieldMonths = new Set(field.map(c => c.m));
  // 광 매칭 우선
  const gwangMatch = hand.find(c => c.t === 'gwang' && fieldMonths.has(c.m));
  if (gwangMatch) return gwangMatch;
  // 매칭되는 패
  const match = hand.find(c => fieldMonths.has(c.m));
  if (match) return match;
  // 피 버리기
  const junk = hand.find(c => c.t === 'junk' || c.t === 'junk2');
  if (junk) return junk;
  return hand[0];
}

function CapturedSummary({ cap }) {
  const g = cap.filter(c => c.t === 'gwang').length;
  const a = cap.filter(c => c.t === 'animal').length;
  const r = cap.filter(c => c.t === 'ribbon').length;
  const p = cap.filter(c => c.t === 'junk' || c.t === 'junk2').reduce((s, c) => s + c.junkPts, 0);
  return (
    <div className="cap-badges">
      {g > 0 && <span className="badge badge-gwang">광 {g}</span>}
      {a > 0 && <span className="badge badge-animal">열 {a}</span>}
      {r > 0 && <span className="badge badge-ribbon">띠 {r}</span>}
      {p > 0 && <span className="badge badge-junk">피 {p}</span>}
      {g === 0 && a === 0 && r === 0 && p === 0 && <span style={{ color: '#555', fontSize: 11 }}>없음</span>}
    </div>
  );
}

export default function App() {
  const [G, setG] = useState(null);
  const [logs, setLogs] = useState([]);
  const sz = useCardSize();

  const addLog = useCallback((msg) => setLogs(l => [msg, ...l].slice(0, 5)), []);

  function startGame() {
    setG(dealGame());
    setLogs(["🎴 게임 시작! 패를 선택하세요"]);
  }

  // 플레이어 카드 선택
  function selectCard(card) {
    if (!G || G.phase !== 'player_select') return;
    setG(g => ({ ...g, selected: g.selected === card.id ? null : card.id }));
  }

  // 플레이어 패 내기
  function confirmPlay() {
    if (!G || G.selected === null) return;
    const card = G.playerHand.find(c => c.id === G.selected);
    if (!card) return;
    const newHand = G.playerHand.filter(c => c.id !== card.id);
    const same = G.field.filter(c => c.m === card.m);
    const { field, cap } = matchCards(card, G.field, G.playerCap);
    addLog(same.length === 0 ? `${MONTH_KR[card.m-1]} 버림` : same.length >= 2 ? `${MONTH_KR[card.m-1]} 3장 쓸기!` : `${MONTH_KR[card.m-1]} 매칭!`);
    setG(g => ({ ...g, playerHand: newHand, field, playerCap: cap, selected: null, phase: 'player_draw' }));
  }

  // 플레이어 드로우
  useEffect(() => {
    if (!G || G.phase !== 'player_draw') return;
    const timer = setTimeout(() => {
      if (G.deck.length === 0) { setG(g => ({ ...g, phase: 'result' })); return; }
      const drawn = G.deck[0];
      const newDeck = G.deck.slice(1);
      const same = G.field.filter(c => c.m === drawn.m);
      const { field, cap } = matchCards(drawn, G.field, G.playerCap);
      addLog(`뒤집기: ${MONTH_KR[drawn.m-1]}${same.length > 0 ? ' 매칭!' : ' → 바닥'}`);
      const sc = calcScore(cap);
      setG(g => ({
        ...g, deck: newDeck, field, playerCap: cap, drawn,
        phase: sc >= 3 ? 'gostop' : 'ai_turn',
      }));
    }, 500);
    return () => clearTimeout(timer);
  }, [G?.phase]);

  // 고/스톱
  function handleGoStop(choice) {
    if (choice === 'stop') { setG(g => ({ ...g, phase: 'result' })); return; }
    addLog(`고! (${G.goCount + 1}회)`);
    setG(g => ({ ...g, goCount: g.goCount + 1, phase: 'ai_turn' }));
  }

  // AI 턴
  useEffect(() => {
    if (!G || G.phase !== 'ai_turn') return;
    const timer = setTimeout(() => {
      if (G.aiHand.length === 0 || G.deck.length === 0) {
        setG(g => ({ ...g, phase: 'result' })); return;
      }

      // AI 패 내기
      const card = aiPickCard(G.aiHand, G.field);
      const newAiHand = G.aiHand.filter(c => c.id !== card.id);
      const same1 = G.field.filter(c => c.m === card.m);
      const r1 = matchCards(card, G.field, G.aiCap);
      addLog(`🤖 AI: ${MONTH_KR[card.m-1]} ${same1.length > 0 ? '매칭!' : '버림'}`);

      // AI 드로우
      const drawn = G.deck[0];
      const newDeck = G.deck.slice(1);
      const same2 = r1.field.filter(c => c.m === drawn.m);
      const r2 = matchCards(drawn, r1.field, r1.cap);

      // AI 점수 체크 - 3점 이상이면 랜덤으로 스톱/고
      const aiSc = calcScore(r2.cap);
      const aiStops = aiSc >= 3 && Math.random() < 0.55;

      if (aiStops) {
        addLog(`🤖 AI 스톱! (${aiSc}점)`);
        setG(g => ({
          ...g, aiHand: newAiHand, deck: newDeck,
          field: r2.field, aiCap: r2.cap, drawn,
          phase: 'result', lastWinner: 'ai',
        }));
      } else {
        setG(g => ({
          ...g, aiHand: newAiHand, deck: newDeck,
          field: r2.field, aiCap: r2.cap, drawn,
          phase: 'player_select',
        }));
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [G?.phase]);

  if (!G) return <HomeScreen onStart={startGame} />;
  if (G.phase === 'result') return <ResultScreen G={G} onRestart={startGame} onHome={() => setG(null)} />;

  const isSelect = G.phase === 'player_select';
  const isDraw = G.phase === 'player_draw';
  const isAI = G.phase === 'ai_turn';
  const isGostop = G.phase === 'gostop';
  const sc = calcScore(G.playerCap);
  const aiSc = calcScore(G.aiCap);

  return (
    <div className="game-wrap">

      {/* AI 손패 */}
      <div className="section opp-section">
        <div className="section-header">
          <span>🤖 AI 손패</span>
          <span>{G.aiHand.length}장{isAI ? ' ⏳' : ''}</span>
        </div>
        <div className="cards-row no-wrap">
          {G.aiHand.map(c => <CardSVG key={c.id} card={c} size={sz.opp} faceDown />)}
        </div>
      </div>

      {/* AI 획득패 */}
      <div className="section captured-section opp-captured">
        <div className="section-header">
          <span>📦 AI 획득</span>
          <span style={{ color: '#e08080' }}>{aiSc}점 · {G.aiCap.length}장</span>
        </div>
        <CapturedSummary cap={G.aiCap} />
        {G.aiCap.length > 0 && (
          <div className="cards-row no-wrap" style={{ marginTop: 4 }}>
            {G.aiCap.map(c => <CardSVG key={c.id} card={c} size={sz.cap} />)}
          </div>
        )}
      </div>

      {/* 공용 바닥 */}
      <div className="section field-section">
        <div className="section-header">
          <span>🎴 바닥 ({G.field.length}장)</span>
          <span style={{ color: '#888' }}>덱 {G.deck.length}장</span>
        </div>
        <div className="cards-row no-wrap">
          {G.field.map(c => <CardSVG key={c.id} card={c} size={sz.field} />)}
          {G.field.length === 0 && <span style={{ color: '#555', fontSize: 12 }}>비어있음</span>}
        </div>
        {G.drawn && <div className="drawn-info">↩ {MONTH_KR[G.drawn.m-1]} 뒤집음</div>}
        <div style={{ marginTop: 5 }}>
          {logs.slice(0, 2).map((l, i) => (
            <div key={i} className={`log-item ${i > 0 ? 'old' : ''}`}>{l}</div>
          ))}
        </div>
      </div>

      {/* 내 획득패 */}
      <div className="section captured-section my-captured">
        <div className="section-header" style={{ color: '#c9a84c' }}>
          <span>📦 내 획득</span>
          <span>{sc}점{G.goCount > 0 ? ` (고×${G.goCount})` : ''} · {G.playerCap.length}장</span>
        </div>
        <CapturedSummary cap={G.playerCap} />
        {G.playerCap.length > 0 && (
          <div className="cards-row no-wrap" style={{ marginTop: 4 }}>
            {G.playerCap.map(c => <CardSVG key={c.id} card={c} size={sz.cap} />)}
          </div>
        )}
      </div>

      {/* 고스톱 */}
      {isGostop && (
        <div className="gostop-box">
          <div className="gostop-title">🏆 {sc}점! {G.goCount > 0 ? `고 ${G.goCount}회 진행 중` : ''}</div>
          <div className="gostop-btns">
            <button className="btn-red" onClick={() => handleGoStop('go')}>고!</button>
            <button className="btn-gold" onClick={() => handleGoStop('stop')}>스톱!</button>
          </div>
        </div>
      )}

      {/* 내 손패 */}
      <div className="section my-section">
        <div className="section-header" style={{ color: '#c9a84c' }}>
          <span>😊 내 손패</span>
          <span>{G.playerHand.length}장</span>
        </div>
        <div className="cards-row no-wrap my-hand">
          {G.playerHand.map(c => (
            <CardSVG key={c.id} card={c} size={sz.hand}
              selected={G.selected === c.id}
              onClick={isSelect ? () => selectCard(c) : undefined}
            />
          ))}
        </div>
        {isSelect && (
          <button className="btn-gold full-width" onClick={confirmPlay} disabled={G.selected === null}
            style={{ opacity: G.selected === null ? 0.4 : 1, cursor: G.selected === null ? 'not-allowed' : 'pointer' }}>
            {G.selected !== null ? '✅ 이 패 내기' : '패를 선택하세요'}
          </button>
        )}
        {(isDraw || isAI) && (
          <div className="waiting">{isAI ? '🤖 AI 생각 중...' : '⏳ 뒤집는 중...'}</div>
        )}
      </div>

    </div>
  );
}

function HomeScreen({ onStart }) {
  const [showRules, setShowRules] = useState(false);
  return (
    <div className="screen center">
      <div style={{ fontSize: 64, marginBottom: 8 }}>🎴</div>
      <h1 className="title-gold">고 스 톱</h1>
      <p className="subtitle">1인 vs AI · SVG 화투</p>
      <button className="btn-gold" onClick={onStart}>게임 시작</button>
      <button className="btn-ghost" onClick={() => setShowRules(r => !r)} style={{ marginTop: 12 }}>
        {showRules ? '규칙 닫기 ▲' : '규칙 보기 ▼'}
      </button>
      {showRules && (
        <div className="rules-box">
          <b style={{ color: '#c9a84c' }}>점수 규칙</b><br />
          🥇 광 3장→3점 / 4장→4점 / 5장→15점<br />
          🐦 열 5장→1점 (이후 +1점)<br />
          🎀 홍단(1·2·7월) / 청단(4·5·6·9월) → 3점<br />
          🃏 피 10장→1점 (이후 +1점)<br />
          ⭐ 3점↑ → 고 or 스톱!<br />
          🔁 고 1회마다 ×0.5 배율
        </div>
      )}
    </div>
  );
}

function ResultScreen({ G, onRestart, onHome }) {
  const pSc = calcScore(G.playerCap);
  const aSc = calcScore(G.aiCap);
  const mult = G.goCount > 0 ? 1 + G.goCount * 0.5 : 1;
  const pFinal = Math.round(pSc * mult);
  const aFinal = Math.round(aSc * (G.lastWinner === 'ai' ? mult : 1));
  const win = pFinal > aFinal ? 'player' : aFinal > pFinal ? 'ai' : 'draw';

  return (
    <div className="screen center">
      <div style={{ fontSize: 52, marginBottom: 8 }}>
        {win === 'player' ? '🏆' : win === 'ai' ? '🤖' : '🤝'}
      </div>
      <h2 style={{ color: win === 'player' ? '#c9a84c' : win === 'ai' ? '#e08080' : '#aaa', fontSize: 24, marginBottom: 16 }}>
        {win === 'player' ? '내가 이겼다!' : win === 'ai' ? 'AI 승리!' : '무승부!'}
      </h2>
      {G.goCount > 0 && <p style={{ color: '#c9a84c', fontSize: 13, marginBottom: 8 }}>고 {G.goCount}회 (×{mult.toFixed(1)}배)</p>}
      <div className="result-row">
        <div className={`result-card ${win === 'player' ? 'winner' : ''}`}>
          <div className="result-name">😊 나</div>
          <div className="result-score" style={{ color: win === 'player' ? '#c9a84c' : 'white' }}>{pFinal}점</div>
          {getBreakdown(G.playerCap).map((b, j) => <div key={j} className="result-detail">{b}</div>)}
        </div>
        <div className={`result-card ${win === 'ai' ? 'winner' : ''}`}>
          <div className="result-name">🤖 AI</div>
          <div className="result-score" style={{ color: win === 'ai' ? '#e08080' : 'white' }}>{aFinal}점</div>
          {getBreakdown(G.aiCap).map((b, j) => <div key={j} className="result-detail">{b}</div>)}
        </div>
      </div>
      <button className="btn-gold" onClick={onRestart}>다시 하기</button>
      <button className="btn-ghost" onClick={onHome} style={{ marginTop: 10 }}>처음으로</button>
    </div>
  );
}
