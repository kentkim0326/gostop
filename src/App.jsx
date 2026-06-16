import { useState, useEffect, useCallback } from "react";
import { CARDS, MONTH_KR, shuffle, calcScore, getBreakdown } from "./cards";
import { CardSVG } from "./CardSVG";
import "./App.css";

const NAMES = ["플레이어 1", "플레이어 2"];

function deal() {
  const deck = shuffle(CARDS.map(c => ({ ...c })));
  const field = deck.splice(0, 6);
  const hands = [deck.splice(0, 7), deck.splice(0, 7)];
  return { deck, field, hands, captured: [[], []], phase: "p0_select", cur: 0, goCount: [0, 0], selected: null, drawn: null };
}

function matchCards(card, field, captured, cur) {
  const same = field.filter(c => c.m === card.m);
  if (same.length === 0) {
    return { field: [...field, card], captured };
  } else {
    const take = same.length >= 2 ? same : [same[0]];
    return {
      field: field.filter(c => !take.find(t => t.id === c.id)),
      captured: [...captured, card, ...take],
    };
  }
}

export default function App() {
  const [G, setG] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((msg) => setLogs(l => [msg, ...l].slice(0, 6)), []);

  function startGame() {
    setG(deal());
    setLogs(["🎴 게임 시작! 플레이어 1 차례"]);
  }

  function selectCard(card) {
    if (!G || G.phase !== `p${G.cur}_select`) return;
    setG(g => ({ ...g, selected: g.selected === card.id ? null : card.id }));
  }

  function confirmPlay() {
    if (!G || G.selected === null) return;
    const cur = G.cur;
    const card = G.hands[cur].find(c => c.id === G.selected);
    if (!card) return;
    const newHand = G.hands[cur].filter(c => c.id !== card.id);
    const { field, captured } = matchCards(card, G.field, G.captured[cur], cur);
    const same = G.field.filter(c => c.m === card.m);
    addLog(same.length === 0 ? `${MONTH_KR[card.m-1]} 버림` : same.length >= 2 ? `${MONTH_KR[card.m-1]} 3장 쓸기!` : `${MONTH_KR[card.m-1]} 매칭!`);
    const newHands = G.hands.map((h, i) => i === cur ? newHand : h);
    const newCaptured = G.captured.map((c, i) => i === cur ? captured : c);
    setG(g => ({ ...g, hands: newHands, field, captured: newCaptured, selected: null, phase: `p${cur}_draw` }));
  }

  // 드로우 처리
  useEffect(() => {
    if (!G || !G.phase.endsWith("_draw")) return;
    const cur = G.cur;
    const timer = setTimeout(() => {
      if (G.deck.length === 0) { setG(g => ({ ...g, phase: "result" })); return; }
      const drawn = G.deck[0];
      const newDeck = G.deck.slice(1);
      const { field, captured } = matchCards(drawn, G.field, G.captured[cur], cur);
      const same = G.field.filter(c => c.m === drawn.m);
      addLog(`뒤집기: ${MONTH_KR[drawn.m-1]}${same.length > 0 ? " 매칭!" : " → 바닥"}`);
      const newCaptured = G.captured.map((c, i) => i === cur ? captured : c);
      const sc = calcScore(newCaptured[cur]);
      setG(g => ({
        ...g, deck: newDeck, field, captured: newCaptured, drawn,
        phase: sc >= 3 ? `p${cur}_gostop` : "pass_screen",
      }));
    }, 500);
    return () => clearTimeout(timer);
  }, [G?.phase]);

  function handleGoStop(choice) {
    const cur = G.cur;
    if (choice === "stop") { setG(g => ({ ...g, phase: "result" })); return; }
    addLog(`${NAMES[cur]} 고! (${G.goCount[cur] + 1}회)`);
    setG(g => ({
      ...g,
      goCount: g.goCount.map((v, i) => i === cur ? v + 1 : v),
      phase: "pass_screen",
    }));
  }

  function passTurn() {
    setG(g => {
      const next = 1 - g.cur;
      return { ...g, cur: next, drawn: null, selected: null, phase: `p${next}_select` };
    });
  }

  if (!G) return <HomeScreen onStart={startGame} />;
  if (G.phase === "result") return <ResultScreen G={G} onRestart={startGame} onHome={() => setG(null)} />;
  if (G.phase === "pass_screen") return <PassScreen G={G} onPass={passTurn} />;
  return <GameScreen G={G} logs={logs} onSelectCard={selectCard} onConfirmPlay={confirmPlay} onGoStop={handleGoStop} />;
}

function HomeScreen({ onStart }) {
  const [showRules, setShowRules] = useState(false);
  return (
    <div className="screen center">
      <div style={{ fontSize: 64, marginBottom: 8 }}>🎴</div>
      <h1 className="title-gold">고 스 톱</h1>
      <p className="subtitle">2인 패스앤플레이 · SVG 화투</p>
      <button className="btn-gold" onClick={onStart}>게임 시작</button>
      <button className="btn-ghost" onClick={() => setShowRules(r => !r)} style={{ marginTop: 12 }}>
        {showRules ? "규칙 닫기 ▲" : "규칙 보기 ▼"}
      </button>
      {showRules && (
        <div className="rules-box">
          <b style={{ color: "#c9a84c" }}>점수 규칙</b><br />
          🥇 광 3장→3점 / 4장→4점 / 5장→15점<br />
          🐦 열 5장→1점 (이후 1장당 +1점)<br />
          🎀 홍단(1·2·7월) / 청단(4·5·6·9월) 각 3장→3점<br />
          🃏 피 10장→1점 (이후 +1점)<br />
          ⭐ 3점 이상 → 고 or 스톱!<br />
          🔁 고 1회마다 ×0.5 배율 추가
        </div>
      )}
    </div>
  );
}

function PassScreen({ G, onPass }) {
  const next = G.cur;
  return (
    <div className="screen center">
      <div className="pass-box">
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔄</div>
        <h2 style={{ color: "#c9a84c", marginBottom: 8 }}>{NAMES[next]} 차례</h2>
        <p style={{ color: "#aaa", fontSize: 13, marginBottom: 20 }}>폰을 전달하세요</p>
        <button className="btn-gold" onClick={onPass}>준비됐어요 ▶</button>
      </div>
    </div>
  );
}

function GameScreen({ G, logs, onSelectCard, onConfirmPlay, onGoStop }) {
  const cur = G.cur;
  const opp = 1 - cur;
  const isSelect = G.phase === `p${cur}_select`;
  const isDraw = G.phase === `p${cur}_draw`;
  const isGostop = G.phase === `p${cur}_gostop`;
  const sc = calcScore(G.captured[cur]);
  const oppSc = calcScore(G.captured[opp]);
  const myCap = G.captured[cur];
  const oppCap = G.captured[opp];

  return (
    <div className="game-wrap">
      {/* 상대 */}
      <div className="section opp-section">
        <div className="section-header">
          <span>👤 {NAMES[opp]}</span>
          <span>{oppSc}점 | {oppCap.length}장</span>
        </div>
        <div className="cards-row">
          {G.hands[opp].map(c => <CardSVG key={c.id} card={c} size={40} faceDown />)}
        </div>
        <div className="cap-summary">
          광{oppCap.filter(c=>c.t==='gwang').length} 열{oppCap.filter(c=>c.t==='animal').length} 띠{oppCap.filter(c=>c.t==='ribbon').length} 피{oppCap.filter(c=>c.t==='junk'||c.t==='junk2').reduce((s,c)=>s+c.junkPts,0)}
        </div>
      </div>

      {/* 바닥 */}
      <div className="section">
        <div className="section-header">
          <span>🎴 바닥 ({G.field.length}장)</span>
          <span>덱 {G.deck.length}장</span>
        </div>
        <div className="cards-row">
          {G.field.map(c => <CardSVG key={c.id} card={c} size={44} />)}
        </div>
        {G.drawn && <div className="drawn-info">뒤집은 패: {MONTH_KR[G.drawn.m-1]}</div>}
      </div>

      {/* 로그 */}
      <div className="log-box">
        {logs.slice(0, 3).map((l, i) => (
          <div key={i} className={`log-item ${i > 0 ? "old" : ""}`}>{l}</div>
        ))}
      </div>

      {/* 고스톱 */}
      {isGostop && (
        <div className="gostop-box">
          <div className="gostop-title">🏆 {sc}점 달성! {G.goCount[cur] > 0 ? `(고 ${G.goCount[cur]}회 진행 중)` : ""}</div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn-red" onClick={() => onGoStop("go")}>고!</button>
            <button className="btn-gold" onClick={() => onGoStop("stop")}>스톱!</button>
          </div>
        </div>
      )}

      {/* 현재 플레이어 */}
      <div className="section my-section">
        <div className="section-header" style={{ color: "#c9a84c" }}>
          <span>😊 {NAMES[cur]}</span>
          <span>{sc}점{G.goCount[cur] > 0 ? ` (고×${G.goCount[cur]})` : ""}</span>
        </div>
        <div className="cap-summary">
          광{myCap.filter(c=>c.t==='gwang').length} 열{myCap.filter(c=>c.t==='animal').length} 띠{myCap.filter(c=>c.t==='ribbon').length} 피{myCap.filter(c=>c.t==='junk'||c.t==='junk2').reduce((s,c)=>s+c.junkPts,0)}
        </div>
        <div className="cards-row my-hand">
          {G.hands[cur].map(c => (
            <CardSVG key={c.id} card={c} size={50}
              selected={G.selected === c.id}
              onClick={isSelect ? () => onSelectCard(c) : undefined}
            />
          ))}
        </div>
        {isSelect && (
          <button className="btn-gold full-width" onClick={onConfirmPlay} disabled={G.selected === null}
            style={{ opacity: G.selected === null ? 0.4 : 1, cursor: G.selected === null ? "not-allowed" : "pointer" }}>
            {G.selected !== null ? "✅ 이 패 내기" : "패를 선택하세요"}
          </button>
        )}
        {isDraw && <div className="waiting">⏳ 뒤집는 중...</div>}
      </div>
    </div>
  );
}

function ResultScreen({ G, onRestart, onHome }) {
  const s = [calcScore(G.captured[0]), calcScore(G.captured[1])];
  const m = G.goCount.map(g => g > 0 ? 1 + g * 0.5 : 1);
  const f = s.map((sc, i) => Math.round(sc * m[i]));
  const win = f[0] > f[1] ? 0 : f[1] > f[0] ? 1 : -1;
  return (
    <div className="screen center">
      <div style={{ fontSize: 52, marginBottom: 8 }}>{win === -1 ? "🤝" : "🏆"}</div>
      <h2 style={{ color: "#c9a84c", fontSize: 24, marginBottom: 16 }}>
        {win === -1 ? "무승부!" : `${NAMES[win]} 승리!`}
      </h2>
      <div className="result-row">
        {[0, 1].map(i => (
          <div key={i} className={`result-card ${win === i ? "winner" : ""}`}>
            <div className="result-name">{NAMES[i]}</div>
            <div className="result-score" style={{ color: win === i ? "#c9a84c" : "white" }}>{f[i]}점</div>
            {getBreakdown(G.captured[i]).map((b, j) => <div key={j} className="result-detail">{b}</div>)}
            {G.goCount[i] > 0 && <div className="result-go">고 {G.goCount[i]}회 ×{m[i].toFixed(1)}</div>}
          </div>
        ))}
      </div>
      <button className="btn-gold" onClick={onRestart}>다시 하기</button>
      <button className="btn-ghost" onClick={onHome} style={{ marginTop: 10 }}>처음으로</button>
    </div>
  );
}
