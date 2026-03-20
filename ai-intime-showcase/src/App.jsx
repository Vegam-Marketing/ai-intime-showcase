import { useState, useRef, useCallback, useEffect } from "react";

const uid = () => Math.random().toString(36).slice(2, 9);

const C = {
  bg: "#060b16", card: "#111c30", border: "#1e3055",
  accent: "#e8601c", accentGlow: "rgba(232,96,28,0.35)",
  blue: "#3b82f6", blueSoft: "rgba(59,130,246,0.12)",
  teal: "#14b8a6", tealSoft: "rgba(20,184,166,0.12)",
  text: "#e2e8f0", muted: "#94a3b8", dim: "#475569", white: "#f8fafc",
};

const TOOL_COLORS = [
  { hex: "#3b82f6", r: 59, g: 130, b: 246, soft: "rgba(59,130,246,0.13)", border: "rgba(59,130,246,0.3)", glow: "rgba(59,130,246,0.5)" },
  { hex: "#a855f7", r: 168, g: 85, b: 247, soft: "rgba(168,85,247,0.13)", border: "rgba(168,85,247,0.3)", glow: "rgba(168,85,247,0.5)" },
  { hex: "#14b8a6", r: 20, g: 184, b: 166, soft: "rgba(20,184,166,0.13)", border: "rgba(20,184,166,0.3)", glow: "rgba(20,184,166,0.5)" },
  { hex: "#f59e0b", r: 245, g: 158, b: 11, soft: "rgba(245,158,11,0.13)", border: "rgba(245,158,11,0.3)", glow: "rgba(245,158,11,0.5)" },
  { hex: "#ec4899", r: 236, g: 72, b: 153, soft: "rgba(236,72,153,0.13)", border: "rgba(236,72,153,0.3)", glow: "rgba(236,72,153,0.5)" },
  { hex: "#06b6d4", r: 6, g: 182, b: 212, soft: "rgba(6,182,212,0.13)", border: "rgba(6,182,212,0.3)", glow: "rgba(6,182,212,0.5)" },
  { hex: "#84cc16", r: 132, g: 204, b: 22, soft: "rgba(132,204,22,0.13)", border: "rgba(132,204,22,0.3)", glow: "rgba(132,204,22,0.5)" },
  { hex: "#f97316", r: 249, g: 115, b: 22, soft: "rgba(249,115,22,0.13)", border: "rgba(249,115,22,0.3)", glow: "rgba(249,115,22,0.5)" },
];
const getToolColor = (i) => TOOL_COLORS[i % TOOL_COLORS.length];

const UC_COLORS = [
  { hex: "#ff6b6b", r: 255, g: 107, b: 107, soft: "rgba(255,107,107,0.12)", border: "rgba(255,107,107,0.3)", glow: "rgba(255,107,107,0.5)" },
  { hex: "#ffe066", r: 255, g: 224, b: 102, soft: "rgba(255,224,102,0.12)", border: "rgba(255,224,102,0.3)", glow: "rgba(255,224,102,0.5)" },
  { hex: "#ff922b", r: 255, g: 146, b: 43, soft: "rgba(255,146,43,0.12)", border: "rgba(255,146,43,0.3)", glow: "rgba(255,146,43,0.5)" },
  { hex: "#da77f2", r: 218, g: 119, b: 242, soft: "rgba(218,119,242,0.12)", border: "rgba(218,119,242,0.3)", glow: "rgba(218,119,242,0.5)" },
  { hex: "#ffa8a8", r: 255, g: 168, b: 168, soft: "rgba(255,168,168,0.12)", border: "rgba(255,168,168,0.3)", glow: "rgba(255,168,168,0.5)" },
  { hex: "#ffd43b", r: 255, g: 212, b: 59, soft: "rgba(255,212,59,0.12)", border: "rgba(255,212,59,0.3)", glow: "rgba(255,212,59,0.5)" },
];
const getUCColor = (i) => UC_COLORS[i % UC_COLORS.length];

/* ────── Editable Label ────── */
function Editable({ value, onChange, style = {} }) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  const commit = () => { setEditing(false); if (v.trim()) onChange(v.trim()); else setV(value); };
  if (editing) return (
    <input autoFocus value={v} onChange={e => setV(e.target.value)} onBlur={commit}
      onKeyDown={e => e.key === "Enter" && commit()} onClick={e => e.stopPropagation()}
      style={{ background: "rgba(255,255,255,0.07)", border: `1px solid ${C.accent}`, borderRadius: 4, color: C.white, padding: "2px 8px", outline: "none", fontFamily: "inherit", fontWeight: "inherit", fontSize: "inherit", width: "100%", boxSizing: "border-box", ...style }} />
  );
  return (
    <span onDoubleClick={e => { e.stopPropagation(); setEditing(true); }}
      style={{ cursor: "text", borderBottom: "1px dashed rgba(255,255,255,0.12)", userSelect: "none", ...style }}
      title="Double-click to rename">{value}</span>
  );
}

/* ────── Toggle ────── */
function Toggle({ on, onToggle, size = 28, color = C.accent, glow = C.accentGlow }) {
  const h = size * 0.6, dot = h - 4;
  return (
    <button onClick={e => { e.stopPropagation(); onToggle(); }}
      style={{ width: size, height: h, borderRadius: h, border: "none", background: on ? color : "#334155", position: "relative", cursor: "pointer", transition: "background 0.25s", flexShrink: 0, padding: 0 }}>
      <div style={{ width: dot, height: dot, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: on ? size - dot - 2 : 2, transition: "left 0.25s", boxShadow: on ? `0 0 6px ${glow}` : "none" }} />
    </button>
  );
}

/* ────── Color-aware Particle Canvas ────── */
function Particles({ paths, containerRef }) {
  const canvasRef = useRef();
  const particles = useRef([]);
  const anim = useRef();
  const pathsRef = useRef(paths);
  pathsRef.current = paths;

  useEffect(() => {
    const cvs = canvasRef.current, box = containerRef.current;
    if (!cvs || !box) return;
    const ctx = cvs.getContext("2d");
    const resize = () => {
      const r = box.getBoundingClientRect();
      cvs.width = r.width * 2; cvs.height = r.height * 2;
      cvs.style.width = r.width + "px"; cvs.style.height = r.height + "px";
      ctx.setTransform(2, 0, 0, 2, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const r = box.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
      pathsRef.current.forEach(p => {
        if (Math.random() < 0.04) {
          particles.current.push({
            x1: p.x1, y1: p.y1, x2: p.x2, y2: p.y2,
            rgb: p.rgb || { r: 255, g: 138, b: 76 },
            t: 0, speed: 0.003 + Math.random() * 0.004,
            sz: 1.5 + Math.random() * 2, op: 0.6 + Math.random() * 0.4,
          });
        }
      });
      particles.current = particles.current.filter(p => p.t <= 1);
      particles.current.forEach(p => {
        p.t += p.speed;
        const { x1, y1, x2, y2, rgb } = p;
        const isVert = Math.abs(x2 - x1) < Math.abs(y2 - y1);
        let x, y; const t = p.t, u = 1 - t;
        if (isVert) {
          const cy1i = y1 + (y2 - y1) * 0.3, cy2i = y1 + (y2 - y1) * 0.7;
          x = u*u*u*x1 + 3*u*u*t*x1 + 3*u*t*t*x2 + t*t*t*x2;
          y = u*u*u*y1 + 3*u*u*t*cy1i + 3*u*t*t*cy2i + t*t*t*y2;
        } else {
          const cx1i = x1 + (x2 - x1) * 0.3, cx2i = x1 + (x2 - x1) * 0.7;
          x = u*u*u*x1 + 3*u*u*t*cx1i + 3*u*t*t*cx2i + t*t*t*x2;
          y = u*u*u*y1 + 3*u*u*t*y1 + 3*u*t*t*y2 + t*t*t*y2;
        }
        const a = p.op * (t < 0.1 ? t / 0.1 : t > 0.85 ? (1 - t) / 0.15 : 1);
        // Outer halo
        ctx.beginPath(); ctx.arc(x, y, p.sz * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${a * 0.08})`; ctx.fill();
        // Mid glow
        ctx.beginPath(); ctx.arc(x, y, p.sz * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${a * 0.2})`; ctx.fill();
        // Bright core
        ctx.beginPath(); ctx.arc(x, y, p.sz, 0, Math.PI * 2);
        const br = Math.min(255, rgb.r + 90), bg = Math.min(255, rgb.g + 90), bb = Math.min(255, rgb.b + 90);
        ctx.fillStyle = `rgba(${br},${bg},${bb},${a})`;
        ctx.shadowColor = `rgba(${rgb.r},${rgb.g},${rgb.b},0.9)`;
        ctx.shadowBlur = 12; ctx.fill(); ctx.shadowBlur = 0;
      });
      anim.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(anim.current); window.removeEventListener("resize", resize); };
  }, [containerRef]);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 10 }} />;
}

/* ────── Color-aware SVG Curves ────── */
function Curves({ paths }) {
  return (
    <svg style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 4, overflow: "visible" }}>
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="3" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        {paths.map((p, i) => {
          const isV = Math.abs(p.x2 - p.x1) < Math.abs(p.y2 - p.y1);
          return (
            <linearGradient key={`g${i}`} id={`pg${i}`}
              x1={isV ? "0%" : "0%"} y1={isV ? "100%" : "0%"}
              x2={isV ? "0%" : "100%"} y2={isV ? "0%" : "0%"}>
              <stop offset="0%" stopColor={p.hex} stopOpacity="0.7" />
              <stop offset="50%" stopColor={C.accent} stopOpacity="0.35" />
              <stop offset="100%" stopColor={p.hex} stopOpacity="0.25" />
            </linearGradient>
          );
        })}
      </defs>
      {paths.map((p, i) => {
        const isV = Math.abs(p.x2 - p.x1) < Math.abs(p.y2 - p.y1);
        let d;
        if (isV) { const cy1 = p.y1 + (p.y2 - p.y1) * 0.3, cy2 = p.y1 + (p.y2 - p.y1) * 0.7; d = `M${p.x1},${p.y1} C${p.x1},${cy1} ${p.x2},${cy2} ${p.x2},${p.y2}`; }
        else { const cx1 = p.x1 + (p.x2 - p.x1) * 0.3, cx2 = p.x1 + (p.x2 - p.x1) * 0.7; d = `M${p.x1},${p.y1} C${cx1},${p.y1} ${cx2},${p.y2} ${p.x2},${p.y2}`; }
        return <path key={i} d={d} fill="none" stroke={`url(#pg${i})`} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.55" filter="url(#glow)" />;
      })}
    </svg>
  );
}

/* ────── Drag Hook ────── */
function useDrag(x, y, onPos) {
  const pos = useRef({ x, y }), dragging = useRef(false), off = useRef({ x: 0, y: 0 });
  useEffect(() => { pos.current = { x, y }; }, [x, y]);
  const onMouseDown = useCallback(e => {
    if (e.target.closest("input,button,[data-nodrag]")) return;
    e.preventDefault(); dragging.current = true;
    off.current = { x: e.clientX - pos.current.x, y: e.clientY - pos.current.y };
    const mv = e => { if (!dragging.current) return; const nx = e.clientX - off.current.x, ny = e.clientY - off.current.y; pos.current = { x: nx, y: ny }; onPos(nx, ny); };
    const up = () => { dragging.current = false; window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up);
  }, [onPos]);
  return onMouseDown;
}

/* ────── Team Card ────── */
function TeamCard({ team, onChange, onRemove }) {
  const ref = useRef();
  const move = useCallback((x, y) => { if (ref.current) { ref.current.style.left = x + "px"; ref.current.style.top = y + "px"; } onChange({ ...team, x, y }); }, [team, onChange]);
  const onMouseDown = useDrag(team.x, team.y, move);
  const addTool = () => onChange({ ...team, tools: [...team.tools, { id: uid(), name: "New Tool", on: false }] });
  const toggleTool = i => { const t = [...team.tools]; t[i] = { ...t[i], on: !t[i].on }; onChange({ ...team, tools: t }); };
  const renameTool = (i, n) => { const t = [...team.tools]; t[i] = { ...t[i], name: n }; onChange({ ...team, tools: t }); };
  const removeTool = i => onChange({ ...team, tools: team.tools.filter((_, j) => j !== i) });

  return (
    <div ref={ref} onMouseDown={onMouseDown}
      style={{ position: "absolute", left: team.x, top: team.y, width: 220, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, cursor: "grab", zIndex: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.3)", transition: "box-shadow 0.3s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 32px rgba(0,0,0,0.4), 0 0 0 1px ${C.border}`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)"}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.blue, boxShadow: `0 0 8px ${C.blue}` }} />
          <Editable value={team.name} onChange={n => onChange({ ...team, name: n })} style={{ fontSize: 13, fontWeight: 600, color: C.white }} />
        </div>
        <button onClick={e => { e.stopPropagation(); onRemove(); }} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {team.tools.map((tool, i) => {
          const tc = getToolColor(i);
          return (
            <div key={tool.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 6px", borderRadius: 6, background: tool.on ? tc.soft : "rgba(255,255,255,0.02)", border: `1px solid ${tool.on ? tc.border : "rgba(255,255,255,0.04)"}`, transition: "all 0.25s" }}>
              <Toggle on={tool.on} onToggle={() => toggleTool(i)} size={26} color={tc.hex} glow={tc.glow} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: tool.on ? tc.hex : C.dim, boxShadow: tool.on ? `0 0 6px ${tc.glow}` : "none", flexShrink: 0, transition: "all 0.25s" }} />
              <Editable value={tool.name} onChange={n => renameTool(i, n)} style={{ fontSize: 11.5, color: tool.on ? C.text : C.dim, flex: 1 }} />
              <button data-nodrag onClick={e => { e.stopPropagation(); removeTool(i); }} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 13, padding: "0 2px", opacity: 0.5, lineHeight: 1 }}>×</button>
            </div>
          );
        })}
      </div>
      <button data-nodrag onClick={e => { e.stopPropagation(); addTool(); }}
        style={{ marginTop: 8, width: "100%", padding: "5px 0", background: "rgba(255,255,255,0.03)", border: `1px dashed ${C.border}`, borderRadius: 6, color: C.muted, cursor: "pointer", fontSize: 11, fontFamily: "inherit" }}>+ Add Tool</button>
    </div>
  );
}

/* ────── Engine Block ────── */
function EngineBlock({ pos, onMove }) {
  const ref = useRef();
  const move = useCallback((x, y) => { if (ref.current) { ref.current.style.left = x + "px"; ref.current.style.top = y + "px"; } onMove(x, y); }, [onMove]);
  const onMouseDown = useDrag(pos.x, pos.y, move);
  const [pulse, setPulse] = useState(0);
  useEffect(() => { const iv = setInterval(() => setPulse(p => (p + 1) % 360), 30); return () => clearInterval(iv); }, []);

  return (
    <div ref={ref} onMouseDown={onMouseDown}
      style={{
        position: "absolute", left: pos.x, top: pos.y, width: 200, height: 200, borderRadius: 20, cursor: "grab", zIndex: 20,
        background: `radial-gradient(circle at 50% 50%, rgba(232,96,28,0.12) 0%, ${C.card} 70%)`,
        border: "2px solid rgba(232,96,28,0.3)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
        boxShadow: "0 0 60px rgba(232,96,28,0.12), 0 8px 32px rgba(0,0,0,0.4)",
      }}>
      <div style={{
        position: "absolute", inset: -8, borderRadius: 28, border: "2px solid transparent",
        backgroundImage: `conic-gradient(from ${pulse}deg, transparent 0%, ${C.accent} 15%, transparent 30%)`,
        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor", maskComposite: "exclude", padding: 2, opacity: 0.4,
      }} />
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}, #c44d10)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px ${C.accentGlow}` }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.white, letterSpacing: "0.04em" }}>AI Intime</div>
      <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>Secure Reasoning Engine</div>
    </div>
  );
}

/* ────── Use Case Card (colored) ────── */
function UseCaseCard({ uc, ucColor, onChange, onRemove }) {
  const ref = useRef();
  const move = useCallback((x, y) => { if (ref.current) { ref.current.style.left = x + "px"; ref.current.style.top = y + "px"; } onChange({ ...uc, x, y }); }, [uc, onChange]);
  const onMouseDown = useDrag(uc.x, uc.y, move);
  return (
    <div ref={ref} onMouseDown={onMouseDown}
      style={{
        position: "absolute", left: uc.x, top: uc.y, width: 190, padding: "12px 14px", cursor: "grab", zIndex: 20,
        background: C.card, border: `1px solid ${ucColor.border}`, borderRadius: 10,
        boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 14px ${ucColor.soft}`, transition: "box-shadow 0.3s",
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 28px rgba(0,0,0,0.4), 0 0 24px ${ucColor.soft}, 0 0 0 1px ${ucColor.border}`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = `0 4px 20px rgba(0,0,0,0.3), 0 0 14px ${ucColor.soft}`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: ucColor.hex, boxShadow: `0 0 8px ${ucColor.glow}`, flexShrink: 0 }} />
          <Editable value={uc.name} onChange={n => onChange({ ...uc, name: n })} style={{ fontSize: 12.5, fontWeight: 600, color: C.white }} />
        </div>
        <button onClick={e => { e.stopPropagation(); onRemove(); }} style={{ background: "none", border: "none", color: C.dim, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
      </div>
    </div>
  );
}

/* ════════════════════ MAIN APP ════════════════════ */
export default function AIIntimeShowcase() {
  const containerRef = useRef();
  const [teams, setTeams] = useState([
    { id: uid(), name: "Operations Team", x: 80, y: 500, tools: [{ id: uid(), name: "SAP", on: true }, { id: uid(), name: "MES", on: true }, { id: uid(), name: "Email", on: false }] },
    { id: uid(), name: "Quality Team", x: 340, y: 500, tools: [{ id: uid(), name: "LIMS", on: true }, { id: uid(), name: "PLM", on: true }, { id: uid(), name: "Docs", on: false }] },
  ]);
  const [engine, setEngine] = useState({ x: 220, y: 210 });
  const [useCases, setUseCases] = useState([
    { id: uid(), name: "Predictive Maintenance", x: 540, y: 180 },
    { id: uid(), name: "Quality Analytics", x: 540, y: 280 },
  ]);
  const [, forceRender] = useState(0);
  const tick = useCallback(() => forceRender(n => n + 1), []);

  /* Build color-coded paths */
  const engCx = engine.x + 100, engCy = engine.y + 100, engBottom = engine.y + 200, engRight = engine.x + 200;
  const paths = [];

  // Each active tool gets its own colored path from team → engine
  teams.forEach(team => {
    const cx = team.x + 110, top = team.y;
    const active = team.tools.map((tl, i) => ({ ...tl, idx: i })).filter(tl => tl.on);
    active.forEach((tool, ai) => {
      const tc = getToolColor(tool.idx);
      const spread = active.length > 1 ? (ai - (active.length - 1) / 2) * 18 : 0;
      paths.push({ x1: cx + spread, y1: top, x2: engCx + spread * 0.4, y2: engBottom, hex: tc.hex, rgb: { r: tc.r, g: tc.g, b: tc.b } });
    });
  });

  // Each use case gets its own colored path from engine → right
  useCases.forEach((uc, i) => {
    const col = getUCColor(i);
    paths.push({ x1: engRight, y1: engCy, x2: uc.x, y2: uc.y + 20, hex: col.hex, rgb: { r: col.r, g: col.g, b: col.b } });
  });

  const updateTeam = (idx, t) => { const n = [...teams]; n[idx] = t; setTeams(n); tick(); };
  const removeTeam = idx => { setTeams(teams.filter((_, i) => i !== idx)); };
  const addTeam = () => setTeams([...teams, { id: uid(), name: "New Team", x: 80 + teams.length * 260, y: 500, tools: [{ id: uid(), name: "Tool 1", on: true }] }]);
  const updateUC = (idx, u) => { const n = [...useCases]; n[idx] = u; setUseCases(n); tick(); };
  const removeUC = idx => setUseCases(useCases.filter((_, i) => i !== idx));
  const addUC = () => setUseCases([...useCases, { id: uid(), name: "New Use Case", x: 540, y: 180 + useCases.length * 100 }]);

  return (
    <div style={{ width: "100%", height: "100vh", background: C.bg, fontFamily: "'Instrument Sans', 'DM Sans', -apple-system, sans-serif", color: C.text, overflow: "hidden", position: "relative" }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      {/* BG grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(${C.border} 1px, transparent 1px)`, backgroundSize: "40px 40px", opacity: 0.3 }} />
      {/* Glow */}
      <div style={{ position: "absolute", left: engine.x - 80, top: engine.y - 80, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,96,28,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 1 }} />

      {/* Header */}
      <div style={{ position: "relative", zIndex: 30, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.white }}>AI Intime <span style={{ color: C.accent }}>Platform</span></div>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>Interactive Architecture — drag blocks · double-click to rename · toggle tools</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={addTeam} style={{ padding: "7px 14px", background: C.blueSoft, border: "1px solid rgba(59,130,246,0.25)", borderRadius: 8, color: C.blue, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>+ Add Team</button>
          <button onClick={addUC} style={{ padding: "7px 14px", background: C.tealSoft, border: "1px solid rgba(20,184,166,0.25)", borderRadius: 8, color: C.teal, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit" }}>+ Add Use Case</button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }}>
        <Curves paths={paths} />
        <Particles paths={paths} containerRef={containerRef} />

        {/* Legend */}
        <div style={{ position: "absolute", left: 24, bottom: 16, zIndex: 15, display: "flex", gap: 16 }}>
          {[{ c: C.blue, l: "Teams & Tools" }, { c: C.accent, l: "Reasoning Engine" }, { c: C.teal, l: "Use Cases" }].map(({ c, l }) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />
              <span style={{ fontSize: 10, color: C.dim, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</span>
            </div>
          ))}
        </div>

        {/* Flow labels */}
        <div style={{ position: "absolute", left: engine.x + 55, top: engine.y + 210, zIndex: 15, fontSize: 9, color: C.dim, textTransform: "uppercase", letterSpacing: "0.12em", pointerEvents: "none" }}>▲ Data Ingestion</div>
        <div style={{ position: "absolute", left: engine.x + 210, top: engine.y + 85, zIndex: 15, fontSize: 9, color: C.dim, textTransform: "uppercase", letterSpacing: "0.12em", pointerEvents: "none" }}>Intelligence ▶</div>

        <EngineBlock pos={engine} onMove={(x, y) => { setEngine({ x, y }); tick(); }} />
        {teams.map((t, i) => <TeamCard key={t.id} team={t} onChange={t => updateTeam(i, t)} onRemove={() => removeTeam(i)} />)}
        {useCases.map((uc, i) => <UseCaseCard key={uc.id} uc={uc} ucColor={getUCColor(i)} onChange={u => updateUC(i, u)} onRemove={() => removeUC(i)} />)}
      </div>
    </div>
  );
}
