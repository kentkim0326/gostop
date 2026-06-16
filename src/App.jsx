import { useState, useEffect, useCallback, useRef } from "react";
import { CARDS, MONTH_KR, shuffle, calcScore, getBreakdown } from "./cards";
import { CardSVG } from "./CardSVG";
import { SFX } from "./sound";
import { aiPickCard, aiDecideStop } from "./ai";
import "./App.css";

function useCardSize() {
  const [sizes, setSizes] = useState({ opp: 38, field: 44, hand: 50, cap: 32 });
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
    phase: "player_select",
    goCount: 0,
    selected: null,
    drawn: null,
    lastWinner: null,
    // 애니메이션용
    newCardIds: [],
  };
}

function matchCards(card, field, cap) {
  const same = field.filter(c => c.m === card.m);
  if (same.length === 0) return { field: [...field, card], cap, matched: [] };
  const take = same.length >= 2 ? same : [same[0]];
  return {
    field: field.filter(c => !take.find(t => t.id === c.id)),
    cap: [...cap, card, ...take],
    matched: [card, ...take],
  };
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
      {g===0&&a===0&&r===0&&p===0 && <span style={{color:'#555',fontSize:11}}>없음</span>}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState('home'); // home | difficulty | game | result
  const [difficulty, setDifficulty] = useState('normal');
  const [G, setG] = useState(null);
  const [logs, setLogs] = useState([]);
  const [animIds, setAnimIds] = useState(new Set()); // 방금 획득한 카드 id
  const sz = useCardSize();

  const addLog = useCallback((msg) => setLogs(l => [msg, ...l].slice(0, 5)), []);

  function flashCards(ids) {
    setAnimIds(new Set(ids));
    setTimeout(() => setAnimIds(new Set()), 600);
  }

  function startGame(diff) {
    setDifficulty(diff);
    setG(dealGame());
    setLogs(["🎴 게임 시작! 패를 선택하세요"]);
    setScreen('game');
  }

  function selectCard(card) {
    if (!G || G.phase !== 'player_select') return;
    SFX.select();
    setG(g => ({ ...g, selected: g.selected === card.id ? null : card.id }));
  }

  function confirmPlay() {
    if (!G || G.selected === null) return;
    const card = G.playerHand.find(c => c.id === G.selected);
    if (!card) return;
    const newHand = G.playerHand.filter(c => c.id !== card.id);
    const same = G.field.filter(c => c.m === card.m);
    const { field, cap, matched } = matchCards(card, G.field, G.playerCap);

    if (same.length === 0) {
      SFX.play();
      addLog(`${MONTH_KR[card.m-1]} 버림`);
    } else if (same.length >= 2) {
      SFX.sweep();
      addLog(`✨ ${MONTH_KR[card.m-1]} 3장 쓸기!`);
      flashCards(matched.map(c => c.id));
    } else {
      SFX.match();
      addLog(`${MONTH_KR[card.m-1]} 매칭!`);
      flashCards(matched.map(c => c.id));
    }

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
      const { field, cap, matched } = matchCards(drawn, G.field, G.playerCap);
      SFX.flip();

      if (same.length === 0) {
        addLog(`뒤집기: ${MONTH_KR[drawn.m-1]} → 바닥`);
      } else if (same.length >= 2) {
        SFX.sweep();
        addLog(`✨ 뒤집기: ${MONTH_KR[drawn.m-1]} 3장 쓸기!`);
        flashCards(matched.map(c => c.id));
      } else {
        SFX.match();
        addLog(`뒤집기: ${MONTH_KR[drawn.m-1]} 매칭!`);
        flashCards(matched.map(c => c.id));
      }

      const sc = calcScore(cap);
      setG(g => ({
        ...g, deck: newDeck, field, playerCap: cap, drawn,
        phase: sc >= 3 ? 'gostop' : 'ai_turn',
      }));
    }, 500);
    return () => clearTimeout(timer);
  }, [G?.phase]);

  function handleGoStop(choice) {
    if (choice === 'stop') {
      SFX.win();
      setG(g => ({ ...g, phase: 'result', lastWinner: 'player_stop' }));
      return;
    }
    SFX.go();
    addLog(`🔥 고! (${G.goCount + 1}회)`);
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
      const card = aiPickCard(G.aiHand, G.field, difficulty);
      const newAiHand = G.aiHand.filter(c => c.id !== card.id);
      const same1 = G.field.filter(c => c.m === card.m);
      const r1 = matchCards(card, G.field, G.aiCap);
      SFX.aiPlay();

      if (same1.length >= 2) {
        addLog(`🤖 AI: ${MONTH_KR[card.m-1]} 3장 쓸기!`);
        flashCards(r1.matched.map(c => c.id));
      } else if (same1.length === 1) {
        addLog(`🤖 AI: ${MONTH_KR[card.m-1]} 매칭!`);
      } else {
        addLog(`🤖 AI: ${MONTH_KR[card.m-1]} 버림`);
      }

      // AI 드로우
      const drawn = G.deck[0];
      const newDeck = G.deck.slice(1);
      const r2 = matchCards(drawn, r1.field, r1.cap);

      // AI 스톱 결정
      if (aiDecideStop(r2.cap, G.goCount, difficulty)) {
        SFX.lose();
        addLog(`🤖 AI 스톱! (${calcScore(r2.cap)}점)`);
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

  if (screen === 'home') return <HomeScreen onStart={() => setScreen('difficulty')} />;
  if (screen === 'difficulty') return <DifficultyScreen onSelect={startGame} onBack={() => setScreen('home')} />;
  if (!G || G.phase === 'result') {
    if (!G) return null;
    return <ResultScreen G={G} difficulty={difficulty}
      onRestart={() => startGame(difficulty)}
      onHome={() => setScreen('home')} />;
  }

  const isSelect = G.phase === 'player_select';
  const isDraw = G.phase === 'player_draw';
  const isAI = G.phase === 'ai_turn';
  const isGostop = G.phase === 'gostop';
  const sc = calcScore(G.playerCap);
  const aiSc = calcScore(G.aiCap);
  const diffLabel = { easy: '쉬움', normal: '보통', hard: '어려움' }[difficulty];

  return (
    <div className="game-wrap">

      {/* AI 손패 */}
      <div className="section opp-section">
        <div className="section-header">
          <span>🤖 AI {isAI ? <span className="thinking">생각 중...</span> : ''}</span>
          <span style={{color:'#888', fontSize:11}}>{diffLabel} · {G.aiHand.length}장</span>
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
            {G.aiCap.map(c => (
              <div key={c.id} className={animIds.has(c.id) ? 'card-flash' : ''}>
                <CardSVG card={c} size={sz.cap} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 바닥 */}
      <div className="section field-section">
        <div className="section-header">
          <span>🎴 바닥 ({G.field.length}장)</span>
          <span style={{ color: '#888' }}>덱 {G.deck.length}장</span>
        </div>
        <div className="cards-row no-wrap">
          {G.field.map(c => <CardSVG key={c.id} card={c} size={sz.field} />)}
          {G.field.length === 0 && <span style={{color:'#555',fontSize:12}}>비어있음</span>}
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
            {G.playerCap.map(c => (
              <div key={c.id} className={animIds.has(c.id) ? 'card-flash' : ''}>
                <CardSVG card={c} size={sz.cap} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 고스톱 */}
      {isGostop && (
        <div className="gostop-box">
          <div className="gostop-title">🏆 {sc}점 달성! {G.goCount > 0 ? `(고 ${G.goCount}회)` : ''}</div>
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
          <button className="btn-gold full-width" onClick={confirmPlay}
            disabled={G.selected === null}
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
  return (
    <div className="screen center">
      <div style={{ fontSize: 64, marginBottom: 8 }}>🎴</div>
      <h1 className="title-gold">고 스 톱</h1>
      <p className="subtitle">1인 vs AI · SVG 화투</p>
      <button className="btn-gold" onClick={onStart}>게임 시작</button>
    </div>
  );
}

function DifficultyScreen({ onSelect, onBack }) {
  const levels = [
    { id: 'easy',   label: '쉬움',   desc: 'AI가 멍청하게 플레이', emoji: '🐣' },
    { id: 'normal', label: '보통',   desc: '적당한 도전', emoji: '🦊' },
    { id: 'hard',   label: '어려움', desc: 'AI가 최적 플레이', emoji: '🐯' },
  ];
  return (
    <div className="screen center">
      <h2 style={{ color: '#c9a84c', marginBottom: 6 }}>난이도 선택</h2>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>얼마나 어렵게 할까요?</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 300 }}>
        {levels.map(l => (
          <button key={l.id} className="diff-btn" onClick={() => onSelect(l.id)}>
            <span className="diff-emoji">{l.emoji}</span>
            <div>
              <div className="diff-label">{l.label}</div>
              <div className="diff-desc">{l.desc}</div>
            </div>
          </button>
        ))}
      </div>
      <button className="btn-ghost" onClick={onBack} style={{ marginTop: 16 }}>← 뒤로</button>
    </div>
  );
}

function ResultScreen({ G, difficulty, onRestart, onHome }) {
  const pSc = calcScore(G.playerCap);
  const aSc = calcScore(G.aiCap);
  const mult = G.goCount > 0 ? 1 + G.goCount * 0.5 : 1;
  const pFinal = Math.round(pSc * mult);
  const aFinal = Math.round(aSc * (G.lastWinner === 'ai' ? mult : 1));
  const win = pFinal > aFinal ? 'player' : aFinal > pFinal ? 'ai' : 'draw';
  const diffLabel = { easy: '쉬움', normal: '보통', hard: '어려움' }[difficulty];

  return (
    <div className="screen center">
      <div style={{ fontSize: 52, marginBottom: 8 }}>
        {win === 'player' ? '🏆' : win === 'ai' ? '🤖' : '🤝'}
      </div>
      <h2 style={{ color: win === 'player' ? '#c9a84c' : win === 'ai' ? '#e08080' : '#aaa', fontSize: 24, marginBottom: 4 }}>
        {win === 'player' ? '내가 이겼다!' : win === 'ai' ? 'AI 승리!' : '무승부!'}
      </h2>
      <p style={{ color: '#666', fontSize: 12, marginBottom: 12 }}>난이도: {diffLabel}</p>
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
