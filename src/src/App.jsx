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
      { id: "meals",
