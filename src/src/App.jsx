import { useState, useEffect, useRef } from "react";

const SUPABASE_URL  = "https://jfiucbuamfustnmtmvli.supabase.co";
const SUPABASE_KEY  = "sb_publishable_vAmYDZ8Zv2EwqOYCFMvR1g_ez6asWVf";
const USER_ID       = "primary_user";

const sb = {
  headers: {
    "Content-Type":  "application/json",
    "apikey":        SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Prefer":        "return=representation",
  },
  async load() {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/wellness_data?user_id=eq.${USER_ID}&limit=1`,
      { headers: this.headers }
    );
    if (!res.ok) throw new Error(`Supabase load failed: ${res.status}`);
    const rows = await res.json();
    return rows[0] || null;
  },
  async save(patch) {
    const body = { user_id: USER_ID, updated_at: new Date().toISOString(), ...patch };
    const res  = await fetch(
      `${SUPABASE_URL}/rest/v1/wellness_data`,
      {
        method:  "POST",
        headers: { ...this.headers, "Prefer": "resolution=merge-duplicates,return=minimal" },
        body:    JSON.stringify(body),
      }
    );
    if (!res.ok) throw new Error(`Supabase save failed: ${res.status}`);
  },
};

const P = {
  bg: "#1a1612", card: "#252018", cardAlt: "#2c2620",
  warm: "#e8d5b7", muted: "#7a6a58", subtle: "#4a3a2e",
  accent: "#c9855e", gold: "#d4a853", green: "#7a9e7e",
  blue: "#6b7fa8", purple: "#8a6ea8", red: "#b86060", text: "#ede0cc",
};

const T = {
  label:   { fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 500, color: P.text },
  labelSm: { fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 400, color: P.muted },
  heading: { fontFamily: "'Inter',sans-serif", fontSize: 22, fontWeight: 600, color: P.warm },
  micro:   { fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 400, color: P.muted },
  tag:     { fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 500, color: P.muted, letterSpacing: "0.04em" },
  xp:      { fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600 },
  quote:   { fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 17, color: P.muted, lineHeight: 1.65 },
  intent:  { fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 15, lineHeight: 1.6 },
};

const CATEGORIES = [
  {
    id: "sleep", label: "Sleep", icon: "🌙", color: "#6b7fa8",
    intention: "8–9 hours to heal, process and restore.",
    habits: [
      { id: "sleep_hours",  label: "8–9 hours of sleep",     emoji: "⏰", xp: 20, why: "Deep sleep heals your body, processes your experiences, and gives you the energy to live and thrive." },
      { id: "room_clean",   label: "Tidy the room",          emoji: "🧹", xp: 10, why: "Calm surroundings signal safety to your nervous system." },
      { id: "phone_away",   label: "Phone outside bedroom",  emoji: "📵", xp: 15, why: "Remove the pull of distraction before it tempts you." },
      { id: "reading",      label: "Read to unwind",         emoji: "📖", xp: 10, why: "Let stories carry you gently toward sleep." },
      { id: "sleep_mask",   label: "Sleep mask on",          emoji: "😴", xp: 5,  why: "Protect your rest from unwanted light." },
      { id: "charlie_bed",  label: "Charlie in her crate",   emoji: "🐶", xp: 5,  why: "Less stirring, deeper sleep for both of you." },
      { id: "charlie_out",  label: "Charlie out before bed", emoji: "🌿", xp: 5,  why: "Set her up to sleep through the night." },
    ],
  },
  {
    id: "mind", label: "Mind", icon: "🧘", color: "#8a6ea8",
    intention: "Stillness is where you meet yourself clearly.",
    habits: [
      { id: "meditation", label: "Meditate",         emoji: "🧘", xp: 20, why: "Peace and presence, free from noise and demand." },
      { id: "journal",    label: "Write in journal", emoji: "✍️", xp: 20, why: "Your thoughts deserve a place to land." },
      { id: "prayer",     label: "Daily prayer",     emoji: "🙏", xp: 15, why: "Bless those you love. Ask for courage and clarity." },
    ],
  },
  {
    id: "body", label: "Body", icon: "⚡", color: "#7a9e7e",
    intention: "A body in motion carries your spirit further.",
    habits: [
      { id: "meals",      label: "Eat 2–3 meals",      emoji: "🍽️", xp: 15, why: "Consistent energy keeps you on your path." },
      { id: "movement",   label: "Move your body",     emoji: "🏃", xp: 20, why: "A short workout beats a perfect one that never happens." },
      { id: "bouldering", label: "Bouldering session", emoji: "🧗", xp: 25, why: "Strength, play, and problem-solving as one." },
    ],
  },
  {
    id: "soul", label: "Soul", icon: "🌿", color: "#c9855e",
    intention: "Time for yourself is how you stay whole.",
    habits: [
      { id: "solo_time",         label: "Solo decompression",     emoji: "☕", xp: 15, why: "Sit with your own head and heart. No compromise." },
      { id: "charlie_adventure", label: "Adventure with Charlie", emoji: "🐾", xp: 20, why: "A new park, beach, or forest. Explore together." },
      { id: "cinema",            label: "Conscious movie time",   emoji: "🎬", xp: 20, why: "Decisively choose one film. Honour your love of story." },
    ],
  },
];

const ALL_HABITS = CATEGORIES.flatMap(c => c.habits);
const MAX_XP     = ALL_HABITS.reduce((s, h) => s + h.xp, 0);

const LEVELS = [
  { level: 1,  title: "Seedling",     xpRequired: 0,    icon: "🌱" },
  { level: 2,  title: "Wanderer",     xpRequired: 200,  icon: "🚶" },
  { level: 3,  title: "Seeker",       xpRequired: 500,  icon: "🔍" },
  { level: 4,  title: "Practitioner", xpRequired: 900,  icon: "📿" },
  { level: 5,  title: "Grounded",     xpRequired: 1400, icon: "🌳" },
  { level: 6,  title: "Devoted",      xpRequired: 2100, icon: "🕯️" },
  { level: 7,  title: "Flourishing",  xpRequired: 3000, icon: "🌸" },
  { level: 8,  title: "Luminous",     xpRequired: 4200, icon: "✨" },
  { level: 9,  title: "Sovereign",    xpRequired: 5800, icon: "👑" },
  { level: 10, title: "Awakened",     xpRequired: 8000, icon: "🌟" },
];

const BADGES = [
  { id: "first_perfect",   icon: "💎", label: "First perfect day",   desc: "Complete every habit in one day",      check: (h) => { const k = getTodayKey(); return ALL_HABITS.every(b => h[k]?.[b.id]); } },
  { id: "sleep_7",         icon: "🌙", label: "Sleep guardian",      desc: "7-day phone-away streak",              check: (h) => getStreak(h, "phone_away") >= 7 },
  { id: "mind_7",          icon: "🧘", label: "Still mind",          desc: "7-day meditation streak",              check: (h) => getStreak(h, "meditation") >= 7 },
  { id: "journal_7",       icon: "📖", label: "Inner voice",         desc: "7 days of journaling in a row",        check: (h) => getStreak(h, "journal") >= 7 },
  { id: "movement_7",      icon: "⚡", label: "Body in motion",      desc: "7-day movement streak",                check: (h) => getStreak(h, "movement") >= 7 },
  { id: "bouldering_5",    icon: "🧗", label: "Stone and skin",      desc: "5 bouldering sessions logged",         check: (h) => countTotal(h, "bouldering") >= 5 },
  { id: "perfect_week",    icon: "🏆", label: "Sacred week",         desc: "7 perfect days in a row",              check: (h) => getPerfectStreak(h) >= 7 },
  { id: "prayer_14",       icon: "🙏", label: "Daily devotion",      desc: "14 consecutive prayers",               check: (h) => getStreak(h, "prayer") >= 14 },
  { id: "charlie_4",       icon: "🐾", label: "Trail companions",    desc: "4 outdoor adventures with Charlie",    check: (h) => countTotal(h, "charlie_adventure") >= 4 },
  { id: "solo_10",         icon: "🌿", label: "Sovereign self",      desc: "10 solo decompression sessions",       check: (h) => countTotal(h, "solo_time") >= 10 },
  { id: "xp_1000",         icon: "🔥", label: "First thousand",      desc: "Earn 1,000 total XP",                  check: (h) => calcTotalXP(h) >= 1000 },
  { id: "level_5",         icon: "🌳", label: "Rooted",              desc: "Reach level 5: Grounded",              check: (h) => getLevelInfo(calcTotalXP(h)).current.level >= 5 },
];

const AFFIRMATIONS = [
  "Every small act of care is a vote for the life you're building.",
  "You don't need to be perfect today. You just need to show up.",
  "Rest is not a reward for hard work. It's part of the work.",
  "The life you want is built one intentional day at a time.",
  "Your habits are quiet prayers for your future self.",
  "Stillness is strength. Consistency is love.",
  "You are allowed to take care of yourself first.",
];

const getTodayKey = () => new Date().toISOString().split("T")[0];
const dateKey     = (d) => d.toISOString().split("T")[0];

const getStreak = (history, habitId) => {
  let s = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (history[dateKey(d)]?.[habitId]) s++; else break;
  }
  return s;
};

const countTotal = (history, habitId) =>
  Object.values(history).filter(d => d[habitId]).length;

const getPerfectStreak = (history) => {
  let s = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (ALL_HABITS.every(h => history[dateKey(d)]?.[h.id])) s++; else break;
  }
  return s;
};

const calcDayXP   = (day)     => ALL_HABITS.reduce((s, h) => s + (day?.[h.id] ? h.xp : 0), 0);
const calcTotalXP = (history) => Object.values(history).reduce((s, d) => s + calcDayXP(d), 0);

const getLevelInfo = (xp) => {
  let cur = LEVELS[0], nxt = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xpRequired) { cur = LEVELS[i]; nxt = LEVELS[i + 1] || null; }
  }
  const into = xp - cur.xpRequired, need = nxt ? nxt.xpRequired - cur.xpRequired : 1;
  return { current: cur, next: nxt, xpInto: into, xpNeed: need, pct: Math.min(100, Math.round((into / need) * 100)) };
};

const getWeek = (history, habitId) =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const k = dateKey(d);
    return { key: k, done: !!history[k]?.[habitId], day: d };
  });

const stressColor = (n) => n <= 3 ? P.green : n <= 6 ? P.gold : n <= 8 ? P.accent : P.red;
const stressLabel = (n) => n <= 2 ? "Very calm" : n <= 4 ? "At ease" : n <= 6 ? "Moderate" : n <= 8 ? "Elevated" : "High stress";
const dayName     = (key) => new Date(key + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long" });
const shortDay    = (key) => new Date(key + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short" });

function XPBurst({ xp, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 1100); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position:"fixed", top:"42%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none", zIndex:1000, animation:"xpPop 1.0s ease both", fontFamily:"'Inter',sans-serif", fontSize:38, fontWeight:700, color:P.gold, textShadow:"0 0 24px rgba(212,168,83,0.6)" }}>
      +{xp} xp
    </div>
  );
}

function BadgeToast({ badge, onDone }) {
  return (
    <div onAnimationEnd={onDone} style={{ position:"fixed", bottom:96, left:"50%", transform:"translateX(-50%)", zIndex:999, animation:"badgePop 3.0s ease both", background:"#2a2218", border:`1px solid ${P.gold}88`, borderRadius:16, padding:"16px 22px", display:"flex", alignItems:"center", gap:14, boxShadow:"0 12px 40px rgba(0,0,0,0.6)", minWidth:270 }}>
      <span style={{ fontSize:36 }}>{badge.icon}</span>
      <div>
        <p style={{ ...T.tag, color:P.gold, marginBottom:3 }}>Badge unlocked</p>
        <p style={{ ...T.label, fontWeight:600, color:P.warm }}>{badge.label}</p>
      </div>
    </div>
  );
}

function ProgressBar({ pct, color, height = 5 }) {
  return (
    <div style={{ height, background: P.subtle, borderRadius: height }}>
      <div style={{ height:"100%", width:`${pct}%`, borderRadius:height, background:color, transition:"width 0.8s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function HabitCard({ habit, done, color, onToggle, disabled }) {
  const [showWhy, setShowWhy] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <div style={{ borderRadius:14, background: done ? color+"1a" : P.card, border:`1.5px solid ${done ? color+"88" : P.subtle}`, marginBottom:10, overflow:"hidden", transform: pressed && !disabled ? "scale(0.98)" : "scale(1)", transition:"transform 0.12s ease", opacity: disabled && !done ? 0.6 : 1 }}>
      <div
        onPointerDown={() => !disabled && setPressed(true)}
        onPointerUp={() => { setPressed(false); if (!disabled) onToggle(); }}
        onPointerLeave={() => setPressed(false)}
        style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px", cursor: disabled ? "default" : "pointer", userSelect:"none" }}
      >
        <span style={{ fontSize:30, width:46, height:46, display:"flex", alignItems:"center", justifyContent:"center", background: done ? color+"2a" : "#1a1612", borderRadius:12, flexShrink:0, transition:"all 0.2s" }}>{habit.emoji}</span>
        <span style={{ ...T.label, flex:1, color: done ? P.muted : P.text, textDecoration: done ? "line-through" : "none", transition:"all 0.2s" }}>{habit.label}</span>
        <span style={{ ...T.xp, color: done ? P.green : P.gold, background: done ? P.green+"1a" : P.gold+"1a", padding:"3px 9px", borderRadius:20, marginRight:6, flexShrink:0 }}>{done ? "✓" : `+${habit.xp}`}</span>
        <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, background: done ? color : "transparent", border:`2px solid ${done ? color : P.subtle}`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:16, transition:"all 0.2s", boxShadow: done ? `0 0 10px ${color}44` : "none" }}>{done && "✓"}</div>
      </div>
      <div onClick={() => setShowWhy(w => !w)} style={{ padding:"7px 18px 7px 78px", cursor:"pointer", borderTop:`1px solid ${done ? color+"2a" : P.subtle}`, display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ ...T.tag, color: showWhy ? color : P.muted }}>Why this matters</span>
        <span style={{ color:P.muted, fontSize:10 }}>{showWhy ? "▲" : "▼"}</span>
      </div>
      {showWhy && <div style={{ padding:"0 18px 14px 78px" }}><p style={{ ...T.intent, color:P.muted }}>{habit.why}</p></div>}
    </div>
  );
}

function StressSlider({ value, onChange, disabled }) {
  const color = stressColor(value);
  return (
    <div style={{ opacity: disabled ? 0.6 : 1 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10 }}>
        <span style={{ fontFamily:"'Inter',sans-serif", fontSize:42, fontWeight:700, color, lineHeight:1 }}>{value}</span>
        <span style={{ ...T.label, color, background:color+"1a", padding:"4px 12px", borderRadius:20 }}>{stressLabel(value)}</span>
      </div>
      <div style={{ position:"relative", padding:"6px 0" }}>
        <div style={{ position:"absolute", top:"50%", left:0, right:0, height:6, background:P.subtle, borderRadius:3, transform:"translateY(-50%)" }}>
          <div style={{ height:"100%", width:`${((value-1)/9)*100}%`, borderRadius:3, background:`linear-gradient(90deg,${P.green},${P.gold},${P.accent},${P.red})`, transition:"width 0.15s" }} />
        </div>
        <input type="range" min="1" max="10" value={value} disabled={disabled} onChange={e => onChange(Number(e.target.value))} style={{ position:"relative", width:"100%", appearance:"none", background:"transparent", zIndex:2, height:28, cursor: disabled ? "default" : "pointer" }} />
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:2 }}>
        <span style={{ ...T.tag, color:P.green }}>1 — calm</span>
        <span style={{ ...T.tag, color:P.red }}>10 — stressed</span>
      </div>
    </div>
  );
}

function AIPanel({ title, prompt, buttonLabel, icon }) {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const run = async () => {
    setLoading(true); setResult("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{ role:"user", content:prompt }] }),
      });
      const data = await res.json();
      setResult(data.content?.map(b => b.text||"").join("") || "No response.");
    } catch { setResult("Something went wrong. Please try again."); }
    setLoading(false);
  };
  return (
    <div style={{ background:"#211c16", borderRadius:14, border:`1px solid ${P.gold}2a`, padding:20, marginBottom:14 }}>
      <p style={{ ...T.label, fontWeight:600, color:P.warm, marginBottom:14 }}>{icon} {title}</p>
      <button onClick={run} disabled={loading} style={{ width:"100%", padding:"13px 18px", background: loading ? P.card : `linear-gradient(135deg,#a86840,${P.gold})`, color: loading ? P.muted : "#1a1612", border:"none", borderRadius:10, fontFamily:"'Inter',sans-serif", fontSize:15, fontWeight:600, cursor: loading ? "not-allowed" : "pointer", transition:"all 0.2s" }}>
        {loading ? "Thinking…" : buttonLabel}
      </button>
      {result && (
        <div style={{ marginTop:14, padding:16, background:P.card, borderRadius:10, border:`1px solid ${P.subtle}` }}>
          <p style={{ ...T.label, color:P.text, lineHeight:1.75, whiteSpace:"pre-wrap" }}>{result}</p>
        </div>
      )}
    </div>
  );
}

function CalendarStrip({ selectedKey, onSelect, history, completedDays }) {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i));
    const k = dateKey(d);
    const xp = calcDayXP(history[k] || {});
    const pct = Math.round((xp / MAX_XP) * 100);
    const isToday    = k === getTodayKey();
    const isSelected = k === selectedKey;
    const isComplete = completedDays.has(k);
    return { d, k, pct, isToday, isSelected, isComplete, dayLetter: d.toLocaleDateString("en-GB", { weekday: "narrow" }), dayNum: d.getDate() };
  });
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, []);
  return (
    <div ref={scrollRef} style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4, scrollbarWidth:"none", msOverflowStyle:"none" }}>
      {days.map(({ k, pct, isToday, isSelected, isComplete, dayLetter, dayNum }) => (
        <button key={k} onClick={() => onSelect(k)} style={{ flexShrink:0, width:44, display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"8px 4px", borderRadius:12, background: isSelected ? P.accent+"22" : "transparent", border:`1.5px solid ${isSelected ? P.accent : isToday ? P.subtle+"aa" : "transparent"}`, cursor:"pointer", position:"relative" }}>
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:500, color: isSelected ? P.accent : isToday ? P.warm : P.muted }}>{dayLetter}</span>
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:15, fontWeight: isToday ? 700 : 500, color: isSelected ? P.accent : isToday ? P.warm : P.muted, lineHeight:1 }}>{dayNum}</span>
          <div style={{ width:28, height:4, background:P.subtle, borderRadius:2 }}>
            <div style={{ height:"100%", width:`${pct}%`, borderRadius:2, background: isComplete ? P.green : P.gold, transition:"width 0.4s" }} />
          </div>
          {isComplete && (
            <div style={{ position:"absolute", top:4, right:4, width:10, height:10, borderRadius:"50%", background:P.green, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"#fff", fontSize:7, lineHeight:1 }}>✓</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight:"100vh", background:P.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:18 }}>
      <span style={{ fontSize:48 }}>🌱</span>
      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:16, color:P.muted }}>Loading your data…</p>
    </div>
  );
}

function ErrorScreen({ message, onRetry }) {
  return (
    <div style={{ minHeight:"100vh", background:P.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:18, padding:24 }}>
      <span style={{ fontSize:48 }}>⚠️</span>
      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:18, fontWeight:600, color:P.warm, textAlign:"center" }}>Couldn't connect to Supabase</p>
      <p style={{ fontFamily:"'Inter',sans-serif", fontSize:14, color:P.muted, textAlign:"center", maxWidth:320, lineHeight:1.6 }}>{message}</p>
      <button onClick={onRetry} style={{ padding:"12px 28px", background:`linear-gradient(135deg,#a86840,${P.gold})`, color:"#1a1612", border:"none", borderRadius:10, fontFamily:"'Inter',sans-serif", fontSize:15, fontWeight:600, cursor:"pointer" }}>
        Retry
      </button>
    </div>
  );
}

export default function WellnessTracker() {
  const todayKey = getTodayKey();

  const [bootStatus, setBootStatus] = useState("loading");
  const [bootError,  setBootError]  = useState("");
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [history,      setHistory]      = useState({});
  const [activeTab,    setActiveTab]    = useState("today");
  const [activeCat,    setActiveCat]    = useState("sleep");
  const [xpBurst,      setXpBurst]      = useState(null);
  const [newBadge,     setNewBadge]     = useState(null);
  const [notes,        setNotes]        = useState({});
  const [noteInput,    setNoteInput]    = useState("");
  const [affirmation]                   = useState(() => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
  const prevBadgesRef                   = useRef(new Set());
  const [completedDays,    setCompletedDays]    = useState(new Set());
  const [reflections,      setReflections]      = useState({});
  const [reflectionInputs, setReflectionInputs] = useState({});
  const [missedOpen,       setMissedOpen]        = useState(false);
  const [stressLog,   setStressLog]   = useState({});
  const [stressLevel, setStressLevel] = useState(5);
  const [stressCause, setStressCause] = useState("");
  const [stressSaved, setStressSaved] = useState(false);

  const loadFromSupabase = async () => {
    setBootStatus("loading");
    setBootError("");
    try {
      const row = await sb.load();
      if (row) {
        const h  = row.history        || {};
        const n  = row.notes          || {};
        const cd = row.completed_days || [];
        const sl = row.stress_log     || {};
        const rf = row.reflections    || {};
        setHistory(h);
        setNotes(n);
        setNoteInput(n[todayKey] || "");
        setCompletedDays(new Set(cd));
        setStressLog(sl);
        setReflections(rf);
        prevBadgesRef.current = new Set(BADGES.filter(b => b.check(h)).map(b => b.id));
      }
      setBootStatus("ready");
    } catch (err) {
      setBootError(err.message || "Unknown error");
      setBootStatus("error");
    }
  };

  useEffect(() => { loadFromSupabase(); }, []);

  useEffect(() => {
    if (bootStatus !== "ready") return;
    setNoteInput(notes[selectedDate] || "");
    setMissedOpen(false);
    setStressLevel(5);
    setStressCause("");
  }, [selectedDate, bootStatus]);

  const persist = async (patch) => {
    try { await sb.save(patch); } catch (err) { console.warn("Supabase write failed:", err.message); }
  };

  const isSelectedToday = selectedDate === todayKey;
  const isDayCompleted  = completedDays.has(selectedDate);

  const toggleHabit = async (habitId) => {
    if (isDayCompleted) return;
    const habit    = ALL_HABITS.find(h => h.id === habitId);
    const dayData  = history[selectedDate] || {};
    const was      = !!dayData[habitId];
    const nextDay  = { ...dayData, [habitId]: !was };
    const nextHist = { ...history, [selectedDate]: nextDay };
    setHistory(nextHist);
    await persist({ history: nextHist });
    if (!was) {
      setXpBurst({ xp: habit.xp, k: Date.now() });
      const newly = BADGES.filter(b => b.check(nextHist) && !prevBadgesRef.current.has(b.id));
      if (newly.length) { setTimeout(() => { setNewBadge(newly[0]); newly.forEach(b => prevBadgesRef.current.add(b.id)); }, 800); }
    }
  };

  const completeDay = async () => {
    const next = new Set([...completedDays, selectedDate]);
    setCompletedDays(next);
    await persist({ completed_days: [...next] });
    const hasMisses = ALL_HABITS.some(h => !(history[selectedDate]||{})[h.id]);
    if (hasMisses) setTimeout(() => setMissedOpen(true), 400);
  };

  const saveNote = async () => {
    const next = { ...notes, [selectedDate]: noteInput };
    setNotes(next);
    await persist({ notes: next });
  };

  const logStress = async () => {
    const entry = { level: stressLevel, cause: stressCause.trim(), time: new Date().toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" }) };
    const next  = { ...stressLog, [selectedDate]: [...(stressLog[selectedDate]||[]), entry] };
    setStressLog(next); setStressSaved(true); setStressCause("");
    setTimeout(() => setStressSaved(false), 2200);
    await persist({ stress_log: next });
  };

  const saveReflection = async (habitId, text) => {
    const next = { ...reflections, [selectedDate]: { ...(reflections[selectedDate]||{}), [habitId]: text } };
    setReflections(next);
    await persist({ reflections: next });
  };

  const totalXP      = calcTotalXP(history);
  const levelInfo    = getLevelInfo(totalXP);
  const selectedDay  = history[selectedDate] || {};
  const selectedXP   = calcDayXP(selectedDay);
  const selectedPct  = Math.round((selectedXP / MAX_XP) * 100);
  const earnedBadges = new Set(BADGES.filter(b => b.check(history)).map(b => b.id));
  const currentCat   = CATEGORIES.find(c => c.id === activeCat);
  const selectedDateLabel = new Date(selectedDate + "T12:00:00").toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long" });
  const fullDayName  = dayName(selectedDate);

  const stressPrompt = (() => {
    const lines = [];
    Object.entries(stressLog).sort().slice(-60).forEach(([date, logs]) => {
      logs.forEach(l => lines.push(`${date} — ${l.level}/10${l.cause ? `: "${l.cause}"` : ""}`));
    });
    if (!lines.length) return null;
    return `You are a warm, insightful wellness coach. Here is a person's stress log:\n\n${lines.join("\n")}\n\nPlease:\n1. Identify recurring patterns or common causes of high or low stress\n2. Note any interesting correlations\n3. Offer 3 practical, compassionate suggestions for managing the most common stressors\n\nTone: warm, direct, encouraging. Use clear sections.`;
  })();

  const habitPrompt = (() => {
    const lines = [];
    Object.entries(reflections).sort().slice(-60).forEach(([date, dr]) => {
      Object.entries(dr).forEach(([habitId, reason]) => {
        if (reason?.trim()) {
          const h = ALL_HABITS.find(h => h.id === habitId);
          lines.push(`${date} — missed "${h?.label||habitId}": "${reason}"`);
        }
      });
    });
    if (!lines.length) return null;
    return `You are a warm, insightful wellness coach. Here are the reasons a person has given for missing their wellness habits:\n\n${lines.join("\n")}\n\nPlease:\n1. Identify the most common obstacles across habits\n2. Note which habits are missed most and why\n3. Offer 3 compassionate, practical strategies to overcome recurring barriers\n\nTone: warm, non-judgmental, encouraging. Use clear sections.`;
  })();

  const overallPrompt = (() => {
    const stressLines = Object.entries(stressLog).sort().slice(-60)
      .flatMap(([d, ls]) => ls.map(l => `${d} — ${l.level}/10${l.cause ? `: "${l.cause}"` : ""}`))
      .join("\n") || "No data";
    const habitLines = Object.entries(reflections).sort().slice(-60)
      .flatMap(([d, dr]) => Object.entries(dr).filter(([, r]) => r?.trim())
        .map(([id, r]) => { const h = ALL_HABITS.find(h => h.id === id); return `${d} — missed "${h?.label||id}": "${r}"`; }))
      .join("\n") || "No data";
    return `You are a warm, insightful wellness coach. Provide a holistic reflection based on this data:\n\nSTRESS LOG:\n${stressLines}\n\nMISSED HABIT REASONS:\n${habitLines}\n\nReflect on:\n1. How stress and missed habits may be connected\n2. The biggest opportunity for growth right now\n3. One simple next step for this week\n\nBe warm, specific, and encouraging.`;
  })();

  const overallStreak = (() => {
    let s = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = dateKey(d);
      if (Object.values(history[k]||{}).some(Boolean)) s++; else break;
    }
    return s;
  })();

  const todayLogs    = stressLog[selectedDate] || [];
  const latestStress = todayLogs[todayLogs.length - 1];

  const stress7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const k = dateKey(d);
    const logs = stressLog[k]||[];
    const avg  = logs.length ? Math.round(logs.reduce((s, l) => s + l.level, 0) / logs.length) : null;
    return { key:k, avg, day:d };
  });

  const missedHabits = isDayCompleted ? ALL_HABITS.filter(h => !selectedDay[h.id]) : [];
  const NAV = [["today","Today","📋"],["stress","Stress","🧠"],["insights","Insights","💡"],["journey","Journey","📈"],["badges","Badges","🏅"]];

  if (bootStatus === "loading") return <LoadingScreen />;
  if (bootStatus === "error")   return <ErrorScreen message={bootError} onRetry={loadFromSupabase} />;

  return (
    <div style={{ minHeight:"100vh", background:P.bg, color:P.text, paddingBottom:90 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cormorant+Garamond:ital@1&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        textarea { font-family:'Inter',sans-serif; resize:vertical; }
        textarea:focus { outline:none; border-color:#c9855e !important; }
        ::-webkit-scrollbar { width:4px; height:0px; }
        ::-webkit-scrollbar-thumb { background:#3a3028; border-radius:2px; }
        input[type=range] { -webkit-appearance:none; appearance:none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:26px; height:26px; border-radius:50%; background:#e8d5b7; border:2px solid #c9855e; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,0.35); }
        @keyframes fadeIn   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes xpPop    { 0%{opacity:0;transform:translate(-50%,-50%) scale(0.5)} 30%{opacity:1;transform:translate(-50%,-65%) scale(1.1)} 70%{opacity:1;transform:translate(-50%,-85%) scale(1)} 100%{opacity:0;transform:translate(-50%,-110%) scale(0.9)} }
        @keyframes badgePop { 0%{opacity:0;transform:translateX(-50%) translateY(16px)} 12%{opacity:1;transform:translateX(-50%) translateY(0)} 80%{opacity:1} 100%{opacity:0;transform:translateX(-50%) translateY(-6px)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation:fadeIn 0.28s ease both; }
        .slide-down { animation:slideDown 0.25s ease both; }
      `}</style>

      {xpBurst && <XPBurst key={xpBurst.k} xp={xpBurst.xp} onDone={() => setXpBurst(null)} />}
      {newBadge && <BadgeToast badge={newBadge} onDone={() => setNewBadge(null)} />}

      <div style={{ background:"linear-gradient(160deg,#231d14 0%,#1e1a12 100%)", padding:"24px 20px 18px", borderBottom:`1px solid ${P.subtle}` }}>
        <div style={{ maxWidth:540, margin:"0 auto" }}>
          <CalendarStrip selectedKey={selectedDate} onSelect={setSelectedDate} history={history} completedDays={completedDays} />
          <div style={{ marginTop:14, marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
              <div>
                <p style={{ ...T.micro, marginBottom:2 }}>{isSelectedToday ? "Today" : "Viewing past day"}</p>
                <h1 style={{ fontFamily:"'Inter',sans-serif", fontSize:26, fontWeight:700, color:P.warm, lineHeight:1.1 }}>
                  {selectedDateLabel}
                  {isDayCompleted && <span style={{ marginLeft:10, fontSize:13, fontWeight:500, color:P.green, background:P.green+"1a", padding:"2px 8px", borderRadius:6 }}>Completed ✓</span>}
                </h1>
              </div>
            </div>
            <p style={{ ...T.quote, marginBottom:14 }}>"{affirmation}"</p>
          </div>

          <div style={{ background:"#1e1912", borderRadius:14, border:`1px solid ${P.gold}2a`, padding:"12px 16px", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:28 }}>{levelInfo.current.icon}</span>
                <div>
                  <p style={{ ...T.micro, marginBottom:1 }}>Level {levelInfo.current.level}</p>
                  <p style={{ fontFamily:"'Inter',sans-serif", fontSize:18, fontWeight:700, color:P.gold, lineHeight:1 }}>{levelInfo.current.title}</p>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ ...T.micro, marginBottom:1 }}>Total XP</p>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:22, fontWeight:700, color:P.warm }}>{totalXP.toLocaleString()}</p>
              </div>
            </div>
            {levelInfo.next && (
              <>
                <ProgressBar pct={levelInfo.pct} color={P.gold} height={4} />
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                  <p style={{ ...T.micro }}>{levelInfo.xpInto} / {levelInfo.xpNeed} xp → {levelInfo.next.title}</p>
                  <p style={{ ...T.micro }}>{levelInfo.pct}%</p>
                </div>
              </>
            )}
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1, background:P.card, borderRadius:12, border:`1px solid ${P.subtle}`, padding:"10px 14px" }}>
              <p style={{ ...T.micro, marginBottom:3 }}>{isSelectedToday ? "Today" : shortDay(selectedDate)}</p>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:26, fontWeight:700, color:P.accent, lineHeight:1 }}>{selectedXP} <span style={{ fontSize:12, fontWeight:400, color:P.muted }}>xp</span></p>
              <div style={{ marginTop:7 }}><ProgressBar pct={selectedPct} color={P.accent} height={4} /></div>
            </div>
            <div style={{ background:P.card, borderRadius:12, border:`1px solid ${P.subtle}`, padding:"10px 14px", minWidth:78, textAlign:"center" }}>
              <p style={{ ...T.micro, marginBottom:2 }}>Streak</p>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:28, fontWeight:700, color: overallStreak >= 3 ? P.gold : P.muted, lineHeight:1 }}>{overallStreak}</p>
              <p style={{ fontSize:14, marginTop:2 }}>🔥</p>
            </div>
            <div style={{ background:P.card, borderRadius:12, border:`1px solid ${P.subtle}`, padding:"10px 14px", minWidth:78, textAlign:"center" }}>
              <p style={{ ...T.micro, marginBottom:2 }}>Stress</p>
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:28, fontWeight:700, color: latestStress ? stressColor(latestStress.level) : P.muted, lineHeight:1 }}>{latestStress ? latestStress.level : "–"}</p>
              <p style={{ fontSize:14, marginTop:2 }}>🧠</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:50, background:"#1c1812", borderTop:`1px solid ${P.subtle}`, display:"flex", justifyContent:"center" }}>
        <div style={{ display:"flex", maxWidth:540, width:"100%" }}>
          {NAV.map(([v, label, ico]) => (
            <button key={v} onClick={() => setActiveTab(v)} style={{ flex:1, padding:"11px 4px 13px", background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, borderTop: activeTab===v ? `2px solid ${P.accent}` : "2px solid transparent", transition:"all 0.14s" }}>
              <span style={{ fontSize:18 }}>{ico}</span>
              <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:500, color: activeTab===v ? P.accent : P.muted }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:540, margin:"0 auto", padding:"20px 16px 20px" }}>

        {activeTab === "today" && (
          <div className="fade-in">
            <div style={{ display:"flex", gap:7, marginBottom:20, overflowX:"auto", paddingBottom:4 }}>
              {CATEGORIES.map(cat => {
                const done  = cat.habits.filter(h => selectedDay[h.id]).length;
                const isAct = activeCat === cat.id;
                return (
                  <button key={cat.id} onClick={() => setActiveCat(cat.id)} style={{ flexShrink:0, padding:"8px 14px", borderRadius:50, border:`1.5px solid ${isAct ? cat.color : P.subtle}`, background: isAct ? cat.color+"1a" : "transparent", cursor:"pointer", display:"flex", alignItems:"center", gap:7, transition:"all 0.15s" }}>
                    <span style={{ fontSize:17 }}>{cat.icon}</span>
                    <span style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight: isAct ? 600 : 400, color: isAct ? P.warm : P.muted }}>{cat.label}</span>
                    <span style={{ fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:500, color: done === cat.habits.length ? cat.color : P.muted, background:P.bg, padding:"1px 6px", borderRadius:9 }}>{done}/{cat.habits.length}</span>
                  </button>
                );
              })}
            </div>

            {currentCat && (
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
                  <span style={{ fontSize:36 }}>{currentCat.icon}</span>
                  <div>
                    <h2 style={{ ...T.heading }}>{currentCat.label}</h2>
                    <p style={{ ...T.intent, color:currentCat.color }}>{currentCat.intention}</p>
                  </div>
                </div>
                <div style={{ marginBottom:16 }}>
                  <ProgressBar pct={Math.round((currentCat.habits.filter(h => selectedDay[h.id]).length / currentCat.habits.length)*100)} color={currentCat.color} height={4} />
                </div>
                {currentCat.habits.map(habit => (
                  <HabitCard key={habit.id} habit={habit} done={!!selectedDay[habit.id]} color={currentCat.color} onToggle={() => toggleHabit(habit.id)} disabled={isDayCompleted} />
                ))}
              </div>
            )}

            <div style={{ background:P.card, borderRadius:14, border:`1px solid ${P.subtle}`, padding:18, marginTop:16 }}>
              <p style={{ ...T.label, fontWeight:600, color:P.warm, marginBottom:3 }}>Reflection ✍️</p>
              <p style={{ ...T.intent, color:P.muted, marginBottom:10 }}>One thing to carry. One thing to release.</p>
              <textarea value={noteInput} onChange={e => setNoteInput(e.target.value)} disabled={isDayCompleted} rows={4} style={{ width:"100%", background:"#1a1612", border:`1.5px solid ${P.subtle}`, borderRadius:10, padding:"11px 13px", color:P.text, fontSize:15, lineHeight:1.65, opacity: isDayCompleted ? 0.6 : 1 }} placeholder="Write freely…" />
              {!isDayCompleted && (
                <button onClick={saveNote} style={{ marginTop:8, padding:"9px 20px", background: notes[selectedDate] === noteInput ? P.card : P.accent, color: notes[selectedDate] === noteInput ? P.muted : "#fff", border:"none", borderRadius:9, cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight:600, transition:"all 0.2s" }}>
                  {notes[selectedDate] === noteInput && notes[selectedDate] ? "Saved" : "Save reflection"}
                </button>
              )}
            </div>

            {!isDayCompleted && (
              <button onClick={completeDay} style={{ marginTop:16, width:"100%", padding:"16px", background:`linear-gradient(135deg,#a86840,${P.accent})`, color:"#fff", border:"none", borderRadius:14, cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:16, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:`0 4px 20px ${P.accent}33`, transition:"all 0.2s" }}>
                <span style={{ fontSize:20 }}>✅</span>
                {fullDayName} completed
              </button>
            )}

            {isDayCompleted && missedHabits.length > 0 && (
              <div style={{ marginTop:14 }}>
                <button onClick={() => setMissedOpen(o => !o)} style={{ width:"100%", padding:"14px 18px", background: missedOpen ? P.card : "#1e1612", border:`1.5px solid ${P.red}44`, borderRadius: missedOpen ? "14px 14px 0 0" : 14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", transition:"all 0.15s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:18 }}>🤔</span>
                    <span style={{ fontFamily:"'Inter',sans-serif", fontSize:15, fontWeight:600, color:P.warm }}>What got in the way?</span>
                    <span style={{ fontFamily:"'Inter',sans-serif", fontSize:12, color:P.muted, background:P.subtle, padding:"2px 8px", borderRadius:8 }}>{missedHabits.length} missed</span>
                  </div>
                  <span style={{ color:P.muted, fontSize:12 }}>{missedOpen ? "▲" : "▼"}</span>
                </button>
                {missedOpen && (
                  <div className="slide-down" style={{ background:P.card, borderRadius:"0 0 14px 14px", border:`1.5px solid ${P.red}44`, borderTop:"none", padding:"4px 16px 16px" }}>
                    <p style={{ ...T.intent, color:P.muted, marginBottom:14, marginTop:12 }}>No judgement — just notice. These notes build your insights over time.</p>
                    {missedHabits.map(habit => {
                      const saved    = reflections[selectedDate]?.[habit.id] || "";
                      const inputKey = `${selectedDate}_${habit.id}`;
                      const input    = reflectionInputs[inputKey] ?? saved;
                      const cat      = CATEGORIES.find(c => c.habits.find(h => h.id === habit.id));
                      return (
                        <div key={habit.id} style={{ marginBottom:12, background:"#1a1612", borderRadius:12, padding:14, border:`1px solid ${P.subtle}` }}>
                          <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:8 }}>
                            <span style={{ fontSize:18 }}>{habit.emoji}</span>
                            <span style={{ ...T.label, color:P.muted }}>{habit.label}</span>
                          </div>
                          <textarea value={input} onChange={e => setReflectionInputs(r => ({ ...r, [inputKey]: e.target.value }))} rows={2} style={{ width:"100%", background:P.card, border:`1.5px solid ${P.subtle}`, borderRadius:9, padding:"9px 11px", color:P.text, fontSize:14, lineHeight:1.6 }} placeholder="What got in the way?" />
                          <button onClick={() => saveReflection(habit.id, input)} style={{ marginTop:7, padding:"6px 14px", background: saved && saved===input ? P.subtle : cat?.color||P.accent, color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:500, transition:"all 0.2s" }}>
                            {saved && saved===input ? "Saved" : "Save"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {isDayCompleted && (
              <div style={{ marginTop:14, padding:"12px 16px", background:P.green+"0f", borderRadius:12, border:`1px solid ${P.green}33`, display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:18 }}>🔒</span>
                <p style={{ ...T.labelSm, color:P.green }}>This day is marked complete. Habits are locked.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "stress" && (
          <div className="fade-in">
            <h2 style={{ ...T.heading, marginBottom:4 }}>Stress check-in 🧠</h2>
            <p style={{ ...T.quote, marginBottom:18 }}>Honest data over time becomes your greatest insight.</p>
            <p style={{ ...T.micro, marginBottom:16, color:P.accent }}>Logging for: {selectedDateLabel}</p>
            <div style={{ background:P.card, borderRadius:14, border:`1px solid ${P.subtle}`, padding:20, marginBottom:16 }}>
              <p style={{ ...T.label, fontWeight:600, color:P.warm, marginBottom:14 }}>How were you feeling?</p>
              <StressSlider value={stressLevel} onChange={setStressLevel} disabled={false} />
              <p style={{ ...T.label, fontWeight:500, color:P.warm, marginTop:16, marginBottom:7 }}>What's contributing? <span style={{ fontWeight:400, color:P.muted }}>(optional)</span></p>
              <textarea value={stressCause} onChange={e => setStressCause(e.target.value)} rows={3} style={{ width:"100%", background:"#1a1612", border:`1.5px solid ${P.subtle}`, borderRadius:10, padding:"11px 13px", color:P.text, fontSize:15, lineHeight:1.65 }} placeholder="e.g. Poor sleep, deadline, felt isolated, great workout…" />
              <button onClick={logStress} style={{ marginTop:10, width:"100%", padding:"13px", background: stressSaved ? P.green : `linear-gradient(135deg,#a86840,${P.gold})`, color: stressSaved ? "#fff" : "#1a1612", border:"none", borderRadius:10, fontFamily:"'Inter',sans-serif", fontSize:15, fontWeight:600, cursor:"pointer", transition:"all 0.2s" }}>
                {stressSaved ? "Logged ✓" : "Log stress level"}
              </button>
            </div>
            {todayLogs.length > 0 && (
              <div style={{ background:P.card, borderRadius:14, border:`1px solid ${P.subtle}`, padding:18, marginBottom:16 }}>
                <p style={{ ...T.label, fontWeight:600, color:P.warm, marginBottom:12 }}>Entries for this day</p>
                {todayLogs.map((e, i) => (
                  <div key={i} style={{ padding:"11px 14px", background:"#1a1612", borderRadius:10, marginBottom:7, border:`1px solid ${stressColor(e.level)}2a` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: e.cause ? 5 : 0 }}>
                      <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                        <span style={{ fontFamily:"'Inter',sans-serif", fontSize:22, fontWeight:700, color:stressColor(e.level) }}>{e.level}</span>
                        <span style={{ ...T.label, color:stressColor(e.level) }}>{stressLabel(e.level)}</span>
                      </div>
                      <span style={{ ...T.micro }}>{e.time}</span>
                    </div>
                    {e.cause && <p style={{ ...T.labelSm, lineHeight:1.5 }}>"{e.cause}"</p>}
                  </div>
                ))}
              </div>
            )}
            <div style={{ background:P.card, borderRadius:14, border:`1px solid ${P.subtle}`, padding:18 }}>
              <p style={{ ...T.label, fontWeight:600, color:P.warm, marginBottom:14 }}>Last 7 days</p>
              <div style={{ display:"flex", alignItems:"flex-end", gap:7, height:80 }}>
                {stress7.map(({ key, avg, day }, i) => {
                  const isSel = key === selectedDate;
                  const h = avg ? Math.round((avg/10)*68) : 0;
                  return (
                    <div key={i} onClick={() => setSelectedDate(key)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:"pointer" }}>
                      {avg && <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:600, color:stressColor(avg) }}>{avg}</span>}
                      <div style={{ width:"100%", height:Math.max(h, avg ? 5 : 0), borderRadius:5, background: avg ? stressColor(avg) : "#252018", outline: isSel ? `2px solid ${P.accent}` : "none" }} />
                      <span style={{ fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:500, color: isSel ? P.accent : P.muted }}>{day.toLocaleDateString("en-GB",{weekday:"narrow"})}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "insights" && (
          <div className="fade-in">
            <h2 style={{ ...T.heading, marginBottom:4 }}>Insights 💡</h2>
            <p style={{ ...T.quote, marginBottom:22 }}>The more you log, the more clearly your patterns emerge.</p>
            {stressPrompt
              ? <AIPanel title="Stress patterns" icon="🧠" buttonLabel="Analyse my stress patterns" prompt={stressPrompt} />
              : <div style={{ background:P.card, borderRadius:14, border:`1px solid ${P.subtle}`, padding:18, marginBottom:14, opacity:0.55 }}>
                  <p style={{ ...T.label, fontWeight:600, color:P.warm, marginBottom:5 }}>🧠 Stress patterns</p>
                  <p style={{ ...T.labelSm, lineHeight:1.6 }}>Log stress entries with causes in the Stress tab to unlock AI analysis.</p>
                </div>
            }
            {habitPrompt
              ? <AIPanel title="Habit barriers" icon="🔍" buttonLabel="Find my recurring barriers" prompt={habitPrompt} />
              : <div style={{ background:P.card, borderRadius:14, border:`1px solid ${P.subtle}`, padding:18, marginBottom:14, opacity:0.55 }}>
                  <p style={{ ...T.label, fontWeight:600, color:P.warm, marginBottom:5 }}>🔍 Habit barriers</p>
                  <p style={{ ...T.labelSm, lineHeight:1.6 }}>Complete a day and note what got in the way — your reflections build here over time.</p>
                </div>
            }
            {(stressPrompt || habitPrompt) && (
              <AIPanel title="Overall reflection" icon="🌿" buttonLabel="Get a full wellness reflection" prompt={overallPrompt} />
            )}
          </div>
        )}

        {activeTab === "journey" && (
          <div className="fade-in">
            <h2 style={{ ...T.heading, marginBottom:4 }}>Journey 📈</h2>
            <p style={{ ...T.quote, marginBottom:20 }}>Each dot is a day you showed up. That's everything.</p>
            <div style={{ background:P.card, borderRadius:14, border:`1px solid ${P.subtle}`, padding:18, marginBottom:18 }}>
              <p style={{ ...T.label, fontWeight:600, color:P.warm, marginBottom:14 }}>XP this week</p>
              <div style={{ display:"flex", alignItems:"flex-end", gap:7, height:72 }}>
                {Array.from({length:7},(_,i) => {
                  const d = new Date(); d.setDate(d.getDate()-(6-i));
                  const k = dateKey(d);
                  const xp = calcDayXP(history[k]||{});
                  const bH = Math.max(5, Math.round((xp/MAX_XP)*60));
                  const isSel = k === selectedDate;
                  const isComplete = completedDays.has(k);
                  return (
                    <div key={i} onClick={() => setSelectedDate(k)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:"pointer" }}>
                      {xp > 0 && <span style={{ fontFamily:"'Inter',sans-serif", fontSize:9, fontWeight:600, color:P.gold }}>{xp}</span>}
                      <div style={{ width:"100%", height:bH, borderRadius:5, background: isSel ? P.accent : isComplete ? P.green : xp>0 ? "#4a3a2a" : "#252018", transition:"all 0.4s", outline: isSel ? `2px solid ${P.accent}` : "none" }} />
                      <span style={{ fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:500, color: isSel ? P.accent : P.muted }}>{d.toLocaleDateString("en-GB",{weekday:"narrow"})}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display:"flex", gap:12, marginTop:12, flexWrap:"wrap" }}>
                {[[P.green,"Completed"],[P.accent,"Selected"],["#4a3a2a","In progress"]].map(([c,l]) => (
                  <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:c }} />
                    <span style={{ ...T.micro }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            {CATEGORIES.map(cat => (
              <div key={cat.id} style={{ marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:10 }}>
                  <span style={{ fontSize:22 }}>{cat.icon}</span>
                  <span style={{ ...T.heading, fontSize:18 }}>{cat.label}</span>
                </div>
                {cat.habits.map(habit => {
                  const week   = getWeek(history, habit.id);
                  const streak = getStreak(history, habit.id);
                  const total  = countTotal(history, habit.id);
                  return (
                    <div key={habit.id} style={{ padding:"11px 14px", marginBottom:7, background:P.card, borderRadius:12, border:`1px solid ${P.subtle}`, display:"flex", alignItems:"center", gap:9 }}>
                      <span style={{ fontSize:19, width:26 }}>{habit.emoji}</span>
                      <span style={{ ...T.labelSm, flex:1 }}>{habit.label}</span>
                      <div style={{ display:"flex", gap:4 }}>
                        {week.map((d,i) => (
                          <div key={i} style={{ width:10, height:10, borderRadius:"50%", background: d.done ? cat.color : "#2a2420", border:`1.5px solid ${d.done ? cat.color : P.subtle}`, boxShadow: d.done ? `0 0 4px ${cat.color}55` : "none" }} />
                        ))}
                      </div>
                      <span style={{ ...T.micro, marginLeft:2 }}>{total}×</span>
                      {streak > 0 && <span style={{ fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:600, color:P.gold }}>{streak}🔥</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {activeTab === "badges" && (
          <div className="fade-in">
            <h2 style={{ ...T.heading, marginBottom:4 }}>Achievements 🏅</h2>
            <p style={{ ...T.labelSm, color:P.accent, marginBottom:20 }}>{earnedBadges.size} of {BADGES.length} unlocked</p>
            <div style={{ background:P.card, borderRadius:14, border:`1px solid ${P.subtle}`, padding:18, marginBottom:20 }}>
              <p style={{ ...T.label, fontWeight:600, color:P.warm, marginBottom:14 }}>Path of levels</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {LEVELS.map(lvl => {
                  const reached   = totalXP >= lvl.xpRequired;
                  const isCurrent = lvl.level === levelInfo.current.level;
                  return (
                    <div key={lvl.level} style={{ display:"flex", alignItems:"center", gap:12, opacity: reached ? 1 : 0.3, padding:"7px 10px", borderRadius:10, background: isCurrent ? "#241e12" : "transparent", border: isCurrent ? `1px solid ${P.gold}33` : "1px solid transparent" }}>
                      <span style={{ fontSize:18, filter: reached ? "none" : "grayscale(1)" }}>{lvl.icon}</span>
                      <span style={{ ...T.micro, width:16 }}>{lvl.level}</span>
                      <span style={{ fontFamily:"'Inter',sans-serif", fontSize:15, fontWeight: isCurrent ? 600 : 400, color: isCurrent ? P.gold : reached ? P.warm : P.muted, flex:1 }}>{lvl.title}{isCurrent ? " ← you" : ""}</span>
                      <span style={{ ...T.micro }}>{lvl.xpRequired.toLocaleString()} xp</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <p style={{ ...T.label, fontWeight:600, color:P.warm, marginBottom:12 }}>All badges</p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {BADGES.map(badge => {
                const earned = earnedBadges.has(badge.id);
                return (
                  <div key={badge.id} style={{ padding:"14px 16px", borderRadius:12, background: earned ? "#241e12" : P.card, border:`1px solid ${earned ? P.gold+"44" : P.subtle}`, display:"flex", alignItems:"center", gap:14, opacity: earned ? 1 : 0.4, transition:"all 0.2s" }}>
                    <span style={{ fontSize:28, filter: earned ? "none" : "grayscale(1)" }}>{badge.icon}</span>
                    <div style={{ flex:1 }}>
                      <p style={{ ...T.label, fontWeight:600, color: earned ? P.warm : P.muted, marginBottom:2 }}>{badge.label}</p>
                      <p style={{ ...T.labelSm, lineHeight:1.45 }}>{badge.desc}</p>
                    </div>
                    {earned && <span style={{ ...T.tag, color:P.gold, background:P.gold+"1a", padding:"3px 9px", borderRadius:8 }}>Earned</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
