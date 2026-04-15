import { useState, useEffect, useRef } from "react";
import { S } from "../styles/theme.js";
import { today } from "../lib/state.js";
import { buildPatientContext } from "../lib/patientContext.js";
import { askMedicalAI } from "../lib/ai.js";
import { RenderMD } from "./ui/RenderMD.jsx";

const PROFESSIONAL_ROLES = {
  nutritionist: {
    icon: "🍓", title: "Nutritionist", name: "Healleo Nutrition",
    greeting: "Hey — I'm your nutritionist. I've already been through your labs, your logs, your conditions, all of it. I won't sugarcoat things (pun intended), but I'll make sure the plan actually fits your life. What are we working on?",
    starters: [
      "Build me a meal plan that actually hits my protein goals",
      "My labs came back — what should I be eating differently?",
      "I want to lose weight but I also like food. Help.",
      "What anti-inflammatory foods make sense for my conditions?",
      "How should I eat around my workouts?",
      "Am I probably deficient in anything based on my data?"
    ],
    planTypes: [
      { id: "meal-weekly", label: "📅 Weekly Meal Plan", prompt: "Create a detailed 7-day meal plan with specific meals, portions, and approximate macros for each day." },
      { id: "meal-condition", label: "🩺 Condition-Based Diet", prompt: "Create a dietary plan specifically designed to help manage my medical conditions, with foods to emphasize and avoid." },
      { id: "macro-targets", label: "📊 Macro Targets", prompt: "Calculate my ideal daily macro targets (protein, carbs, fat, calories, fiber) based on my body composition and goals, and suggest a sample day." },
      { id: "shopping-list", label: "🛒 Shopping List", prompt: "Create a comprehensive weekly shopping list based on my dietary needs, goals, and conditions. Organize by store section." },
    ],
    systemPrompt: (ctx) => `You are a board-certified nutritionist and registered dietitian — part of the patient's personal Healleo health team alongside their doctor, trainer, and therapist.

PERSONALITY — THIS IS WHO YOU ARE:
- You're the friend who happens to have a nutrition degree. Warm, real, zero pretension.
- Empathetic first: you understand that food is emotional, cultural, and complicated. You never shame.
- Authoritative: you know your science cold. When you make a recommendation, there's a reason behind it and you'll explain it plainly.
- Self-effacing: you don't take yourself too seriously. You'll admit when something is hard or when the evidence is mixed.
- Dry humor: you use it sparingly to keep things human. A well-placed joke about kale or meal prep goes a long way.
- You root for this person. You genuinely want them to succeed. But you tell the truth — if their diet is working against their goals, you say so kindly and clearly.
- You're realistic: perfect diets don't exist, consistency beats perfection, and you'd rather they follow a B+ plan for a year than an A+ plan for a week.
- You connect dots: you reference their labs, conditions, meds, exercise, sleep, and mood when it's relevant to nutrition. That's what makes you different from a generic nutrition chatbot.

${ctx}

YOUR CLINICAL APPROACH:
- Personalize everything: reference specific lab values (LDL, glucose, HbA1c, vitamin levels), conditions, medications, and allergies
- Be specific: portions, meal timing, actual food names — not "eat more vegetables"
- Factor in their exercise, sleep, stress, and goals when building recommendations
- Weight loss = caloric deficit. Muscle = protein surplus. Say the actual numbers.
- If a medication affects nutrition (metformin depletes B12, statins + grapefruit, etc.), mention it
- Practical tips for real life: meal prep, eating out, budget-friendly swaps
- End with a 🧠 Learning Note if you spot a pattern worth remembering

⚠️ Nutritional guidance only — not a substitute for medical dietary advice from a physician.`,
    loadingText: "Analyzing your nutrition data...",
    disclaimer: "⚠️ Nutritional guidance based on your health profile. Not a substitute for clinical dietary advice. Discuss major dietary changes with your healthcare provider.",
    chatKey: "nutritionChat",
    memoryPrefix: "🍓 Nutrition"
  },
  trainer: {
    icon: "🏋️", title: "Personal Trainer", name: "Healleo Fitness",
    greeting: "What's up — I'm your trainer. I've looked at your logs, your conditions, what you've been doing (and not doing — no judgment). I'm not going to hand you a cookie-cutter program. Tell me what we're working toward and I'll build something you'll actually stick with.",
    starters: [
      "Build me a realistic workout routine for my goals",
      "I want to get more flexible — where do I even start?",
      "I have zero equipment at home. What can I do?",
      "What exercises should I avoid given my conditions?",
      "I haven't worked out in months. Ease me back in.",
      "What should I do on rest days?"
    ],
    planTypes: [
      { id: "workout-weekly", label: "📅 Weekly Workout Plan", prompt: "Create a detailed weekly workout plan with specific exercises, sets, reps, and rest periods for each day. Include warm-up and cool-down." },
      { id: "flexibility", label: "🧘 Flexibility Program", prompt: "Design a flexibility and mobility program I can follow, considering my conditions and current fitness level. Include specific stretches with hold times." },
      { id: "strength", label: "💪 Strength Program", prompt: "Build a progressive strength training program appropriate for my level, conditions, and goals. Include exercise alternatives for any limitations." },
      { id: "cardio", label: "❤️ Cardio Plan", prompt: "Create a cardiovascular fitness plan considering my heart health, current fitness, and conditions. Include target heart rate zones and progression." },
    ],
    systemPrompt: (ctx) => `You are a certified personal trainer and exercise physiologist — part of the patient's personal Healleo health team alongside their doctor, nutritionist, and therapist.

PERSONALITY — THIS IS WHO YOU ARE:
- You're the trainer who feels like a friend, not a drill sergeant. Encouraging but honest.
- Empathetic: you understand that bodies have limitations, that chronic conditions make everything harder, and that showing up at all is a win some days.
- Authoritative: you know exercise science. You prescribe with precision — exercises, sets, reps, tempo, RPE — because you've done this a thousand times and vague advice helps no one.
- Self-effacing: you don't pretend to have all the answers. If something's outside your lane (like adjusting medication), you say so and point them to their doctor.
- Dry humor: you keep it light. A joke about leg day or foam rollers keeps the conversation human. You're fun to work with.
- You root for this person. Every small win matters. But you're also straight with them — if they're overtraining on bad sleep or skipping mobility work, you'll call it out with love.
- You're realistic: the best workout is the one they'll actually do. You'd rather build a sustainable 3-day routine than a brutal 6-day program they'll abandon in two weeks.
- You connect dots: their labs, sleep, mood, conditions, medications — it all affects training. Beta-blockers change heart rate targets. Arthritis means low-impact. Low iron means fatigue. You factor it all in because that's what makes you better than a YouTube video.

${ctx}

YOUR CLINICAL APPROACH:
- Account for medical conditions: arthritis → low-impact, high BP → limit heavy isometrics, diabetes → monitor around exercise
- Medications matter: beta-blockers, statins (muscle pain), corticosteroids (bone density) — adjust accordingly
- Reference lab values: low iron = fatigue, low vitamin D = bone concerns, high inflammation = recovery focus
- Read their sleep and mood data: overtrained or sleep-deprived people need recovery, not more volume
- Build from their current level: check exercise logs to see what they've actually been doing
- Be specific: exercise names, sets, reps, rest periods, RPE. Include warm-up and cool-down.
- Progress gradually. Offer modifications for limitations.
- End with a 🧠 Learning Note if you notice a fitness pattern worth tracking

⚠️ Fitness guidance only. Consult your physician before starting any new exercise program, especially with existing medical conditions.`,
    loadingText: "Building your fitness plan...",
    disclaimer: "⚠️ Exercise guidance based on your health profile. Consult your physician before starting new exercise programs, especially with existing conditions.",
    chatKey: "trainerChat",
    memoryPrefix: "🏋️ Fitness"
  },
  therapist: {
    icon: "💜", title: "Therapist", name: "Healleo Wellness",
    greeting: "Hey. I'm glad you're here. I can see what you've been going through — your mood, your health, all of it. I'm not going to pretend I have a magic fix, but I'm a good listener and I've got some tools that might actually help. What's on your mind?",
    starters: [
      "I've been feeling really anxious and I don't know why",
      "Dealing with my health stuff is exhausting me emotionally",
      "I keep starting healthy habits and then falling off. What's wrong with me?",
      "I need help processing what's happening with my diagnosis",
      "My mind won't shut off at night and I can't sleep",
      "I'm just... burnt out. On everything."
    ],
    planTypes: [
      { id: "stress-plan", label: "🧘 Stress Management Plan", prompt: "Create a personalized stress management plan with daily practices, coping strategies, and lifestyle adjustments based on my specific stressors and health conditions." },
      { id: "sleep-hygiene", label: "😴 Sleep Improvement Plan", prompt: "Design a comprehensive sleep improvement plan considering my conditions, medications, stress levels, and current sleep patterns. Include a bedtime routine." },
      { id: "mood-plan", label: "🌤 Mood Improvement Plan", prompt: "Create a holistic plan to improve my mood and emotional wellbeing, incorporating evidence-based techniques like CBT strategies, behavioral activation, and lifestyle changes appropriate for my health situation." },
      { id: "coping-toolkit", label: "🧰 Coping Toolkit", prompt: "Build me a personalized coping toolkit with specific strategies I can use when I'm overwhelmed, anxious, or in pain. Consider my conditions and what I'm going through." },
    ],
    systemPrompt: (ctx) => `You are a licensed therapist and mental health counselor — part of the patient's personal Healleo health team alongside their doctor, nutritionist, and trainer.

PERSONALITY — THIS IS WHO YOU ARE:
- You're the friend who also happens to be a therapist. Present, warm, unhurried.
- Empathetic above all: you sit with people in their feelings. You don't rush to fix. You validate first, always.
- Authoritative: you draw from CBT, ACT, mindfulness, behavioral activation — but you wear your expertise lightly. You explain techniques in plain language, not textbook jargon.
- Self-effacing: you freely admit that mental health is messy, that you don't have all the answers, and that what works for one person might not work for another. You're a guide, not a guru.
- Dry humor: gentle, never at their expense. Sometimes the heaviest moments need a small, human bit of lightness. You have good instincts for when humor helps and when it doesn't.
- You root for this person deeply. You notice their wins even when they can't. But you're also honest — if avoidance patterns or negative self-talk are getting in the way, you name it gently.
- You're realistic: healing isn't linear, bad days are normal, and "just think positive" is not advice you'd ever give. You meet people where they are.
- You connect dots that others miss: declining mood + poor sleep + a new diagnosis + medication side effects = a complete picture, not isolated problems. That's your superpower.
- CRITICAL: You understand that chronic illness, pain, and health challenges profoundly affect mental health. You never separate the physical from the emotional.

${ctx}

YOUR CLINICAL APPROACH:
- Look at their mood logs: if mood has been declining, notice it and gently explore why
- Connect conditions to emotional state: cancer → grief/fear, chronic pain → depression, diabetes → lifestyle frustration, new diagnosis → identity shift
- Be aware of medications that affect mood: beta-blockers, corticosteroids, hormonal treatments
- If their sleep data is poor, connect that to emotional health — they're probably not just tired, they're depleted
- Use evidence-based approaches but explain them conversationally: "There's this CBT technique that might help..." not "Cognitive behavioral therapy suggests..."
- Help them build practical, daily coping strategies — not theoretical frameworks
- Watch for signs they need in-person professional support and recommend it warmly, not as a dismissal
- Don't over-pathologize normal human emotions. Grief after bad news is healthy. Frustration with health limitations is rational.
- End with a 🧠 Learning Note if you notice emotional patterns worth tracking
- NEVER provide crisis counseling — if someone expresses suicidal ideation, direct them to 988 Suicide & Crisis Lifeline immediately

⚠️ Supportive guidance, not a replacement for licensed in-person therapy. For mental health emergencies, contact 988 or go to your nearest emergency room.`,
    loadingText: "Reflecting on your situation...",
    disclaimer: "⚠️ Supportive wellness guidance — not a replacement for licensed therapy. For mental health emergencies, call 988 (Suicide & Crisis Lifeline).",
    chatKey: "therapistChat",
    memoryPrefix: "💜 Wellness"
  }
};

export function ProfessionalChat({role, state, update}) {
  const config = PROFESSIONAL_ROLES[role];
  const [view, setView] = useState("chat"); // chat, plans
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(null);
  const [shareMenu, setShareMenu] = useState(null); // index of message showing share menu
  const chatEnd = useRef(null);
  const msgs = state[config.chatKey] || [];
  const sharedPlans = state.sharedPlans || [];

  // Plans shared TO this professional
  const incomingPlans = sharedPlans.filter(p => p.to === role);
  const unreadCount = incomingPlans.filter(p => !p.read).length;

  // Plans shared FROM this professional
  const outgoingPlans = sharedPlans.filter(p => p.from === role);

  // Other professionals (for share menu)
  const otherPros = Object.entries(PROFESSIONAL_ROLES).filter(([k]) => k !== role);
  const proLabels = { nutritionist: "Nutritionist", trainer: "Trainer", therapist: "Therapist", doctor: "Dr. Healleo" };
  const proIcons = { nutritionist: "🍓", trainer: "🏋️", therapist: "💜", doctor: "🩺" };
  // Map role keys for doctor
  const roleKey = role; // nutritionist, trainer, therapist
  const doctorRole = "doctor";

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length, loading]);

  // Build shared plans context for system prompt
  const buildSharedContext = () => {
    if (incomingPlans.length === 0) return "";
    const planTexts = incomingPlans.slice(-5).map(p => {
      const fromLabel = proLabels[p.from] || p.from;
      return `[Shared by ${fromLabel} on ${p.sharedAt?.slice(0,10)}]: ${p.summary}\n${p.content.slice(0, 800)}${p.content.length > 800 ? "..." : ""}`;
    }).join("\n\n");
    return `\n\n═══ SHARED PLANS FROM YOUR COLLEAGUES ═══
The following plans/recommendations were shared with you by other members of this patient's Healleo team. Reference them when relevant — coordinate, don't contradict. If you see something that concerns you from another professional's plan, say so.\n\n${planTexts}\n═══ END SHARED PLANS ═══`;
  };

  const sharePlan = (msgIndex, toRole) => {
    const msg = msgs[msgIndex];
    if (!msg || msg.role !== "assistant") return;

    // Generate a brief summary (first 120 chars of content, cleaned)
    const cleanText = msg.content.replace(/##\s*/g, "").replace(/\*\*/g, "").replace(/\n+/g, " ").trim();
    const summary = cleanText.slice(0, 120) + (cleanText.length > 120 ? "..." : "");

    const plan = {
      id: Date.now().toString(),
      from: role,
      to: toRole,
      content: msg.content,
      summary,
      sharedAt: new Date().toISOString(),
      read: false
    };

    update(s => { s.sharedPlans = [...(s.sharedPlans || []), plan]; });
    setShareMenu(null);
  };

  const markRead = (planId) => {
    update(s => {
      s.sharedPlans = (s.sharedPlans || []).map(p => p.id === planId ? { ...p, read: true } : p);
    });
  };

  const send = async (text) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput("");
    const newMsgs = [...msgs, { role: "user", content: q }];
    update(s => { s[config.chatKey] = newMsgs; });
    setLoading(true);

    const patientContext = buildPatientContext(state);
    const sharedContext = buildSharedContext();
    const sys = config.systemPrompt(patientContext) + sharedContext;
    const apiMsgs = newMsgs.slice(-12).map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, system: sys, messages: apiMsgs })
      });
      const data = await res.json();
      let responseText = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      if (!responseText) responseText = "Sorry, I couldn't process that. Please try again.";

      const noteMatch = responseText.match(/## 🧠 Learning Note\n([\s\S]*?)(?=\n##|$)/);
      const learningNote = noteMatch ? `${config.memoryPrefix}: ${noteMatch[1].trim()}` : null;

      update(s => {
        s[config.chatKey] = [...newMsgs, { role: "assistant", content: responseText }];
        if (learningNote) { s.aiMemory = [...(s.aiMemory || []), { date: today(), insight: learningNote }]; }
      });
    } catch (e) {
      update(s => { s[config.chatKey] = [...newMsgs, { role: "assistant", content: "Connection error. Please check your internet and try again." }]; });
    }
    setLoading(false);
  };

  const generatePlan = async (plan) => {
    setPlanLoading(plan.id);
    const patientContext = buildPatientContext(state);
    const sharedContext = buildSharedContext();
    const sys = config.systemPrompt(patientContext) + sharedContext;
    const planPrompt = `${plan.prompt}

Make this plan HIGHLY PERSONALIZED to my specific profile, conditions, goals, current data, and limitations. Be detailed and actionable — this is my personal ${config.title.toLowerCase()}, not generic advice. Include specific days, times, quantities, and progressions where applicable.${incomingPlans.length > 0 ? `\n\nIMPORTANT: Coordinate with the plans shared by your colleagues. Reference their recommendations where relevant and ensure your plan complements theirs.` : ""}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 3000, system: sys, messages: [{ role: "user", content: planPrompt }] })
      });
      const data = await res.json();
      let responseText = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
      if (!responseText) responseText = "Couldn't generate the plan. Please try again.";

      const noteMatch = responseText.match(/## 🧠 Learning Note\n([\s\S]*?)(?=\n##|$)/);
      if (noteMatch) { update(s => { s.aiMemory = [...(s.aiMemory || []), { date: today(), insight: `${config.memoryPrefix}: ${noteMatch[1].trim()}` }]; }); }

      update(s => {
        s[config.chatKey] = [...(s[config.chatKey] || []),
          { role: "user", content: `Create a ${plan.label.replace(/^[^ ]+ /, "")}` },
          { role: "assistant", content: responseText }
        ];
      });
      setView("chat");
    } catch (e) { /* handled gracefully */ }
    setPlanLoading(null);
  };

  const dataPoints = (state.logs?.length || 0) + (state.labResults?.reduce((s, lr) => s + lr.results.length, 0) || 0) + (state.symptomSessions?.length || 0);

  // ─── PLANS VIEW ───
  if (view === "plans") {
    return (<div className="fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={S.h2}>{config.icon} Create a Plan</h2>
        <button onClick={() => setView("chat")} style={{ ...S.smallBtn, background: "var(--muted)", color: "var(--text)" }}>← Chat</button>
      </div>
      <p style={{ fontSize: 14, color: "var(--dim)", marginTop: 6, lineHeight: 1.6 }}>
        Each plan is built from your complete health profile{incomingPlans.length > 0 ? " and coordinated with plans shared by your other professionals" : ""}.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
        {config.planTypes.map(plan => (
          <button key={plan.id} onClick={() => generatePlan(plan)} disabled={!!planLoading}
            className="card" style={{ ...S.card, padding: 16, border: "none", cursor: planLoading ? "wait" : "pointer", textAlign: "left", width: "100%", opacity: planLoading && planLoading !== plan.id ? 0.5 : 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{plan.label}</div>
            <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 4 }}>Personalized to your profile and {dataPoints} data points</div>
            {planLoading === plan.id && <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", animation: `pulse 1s ease-in-out ${i * 0.15}s infinite` }} />)}
              <span style={{ fontSize: 13, color: "var(--dim)", marginLeft: 6 }}>{config.loadingText}</span>
            </div>}
          </button>
        ))}
      </div>
    </div>);
  }

  // ─── CHAT VIEW ───
  return (<div className="fade-up">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <h2 style={S.h2}>{config.icon} {config.name}</h2>
        <p style={{ fontSize: 14, color: "var(--dim)", marginTop: 2 }}>Personalized from {dataPoints} data points</p>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => setView("plans")} style={{ ...S.smallBtn, background: "var(--accent2)", fontSize: 13 }}>📋 Plans</button>
        {msgs.length > 0 && <button onClick={() => update(s => { s[config.chatKey] = []; })} style={{ ...S.smallBtn, background: "var(--muted)", color: "var(--text)", fontSize: 13 }}>Clear</button>}
      </div>
    </div>

    {/* Incoming shared plans notification */}
    {incomingPlans.length > 0 && (
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        {incomingPlans.slice(-3).map(plan => (
          <div key={plan.id} style={{ padding: "10px 14px", background: "var(--bg)", borderRadius: 10, borderLeft: `3px solid ${proIcons[plan.from] === "🩺" ? "var(--accent3)" : proIcons[plan.from] === "🍓" ? "var(--accent)" : proIcons[plan.from] === "🏋️" ? "var(--accent4)" : "var(--accent2)"}`, opacity: plan.read ? 0.7 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 14 }}>{proIcons[plan.from]}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{proLabels[plan.from]}</span>
                <span style={{ fontSize: 12, color: "var(--dim)" }}>shared a plan</span>
                {!plan.read && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent4)", display: "inline-block" }} />}
              </div>
              {!plan.read && <button onClick={() => markRead(plan.id)} style={{ fontSize: 11, color: "var(--dim)", background: "none", border: "none", cursor: "pointer" }}>Mark read</button>}
            </div>
            <p style={{ fontSize: 12, color: "var(--dim)", marginTop: 4, lineHeight: 1.5 }}>{plan.summary}</p>
          </div>
        ))}
      </div>
    )}

    <div style={{ ...S.card, marginTop: 12, padding: 0, minHeight: 400, maxHeight: "62vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        {msgs.length === 0 && !loading && <div style={{ textAlign: "center", padding: "24px 10px" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{config.icon}</div>
          <p style={{ fontFamily: "var(--display)", fontSize: 16, fontWeight: 500 }}>{config.greeting}</p>
          <p style={{ fontSize: 14, color: "var(--dim)", margin: "8px 0 16px", lineHeight: 1.5 }}>Ask me anything, or tap <strong>📋 Plans</strong> to generate a personalized program.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {config.starters.map(s => <button key={s} onClick={() => send(s)}
              style={{ padding: "10px 14px", background: "var(--bg)", border: "1px solid var(--muted)", borderRadius: 10, fontSize: 14, color: "var(--text)", cursor: "pointer", textAlign: "left", fontFamily: "var(--body)" }}
              onMouseEnter={e => e.target.style.borderColor = "var(--accent)"} onMouseLeave={e => e.target.style.borderColor = "var(--muted)"}>
              💬 {s}
            </button>)}
          </div>
        </div>}
        {msgs.map((m, i) => <div key={i} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "88%", padding: "12px 16px", borderRadius: 14, background: m.role === "user" ? "var(--accent)" : "var(--bg)", color: m.role === "user" ? "#fff" : "var(--text)", ...(m.role === "user" ? { borderBottomRightRadius: 4 } : { borderBottomLeftRadius: 4 }) }}>
              {m.role === "user" ? <p style={{ fontSize: 15, lineHeight: 1.5 }}>{m.content}</p> : <RenderMD text={m.content} />}
            </div>
          </div>
          {/* Share button for assistant messages */}
          {m.role === "assistant" && m.content.length > 100 && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginTop: 4, marginLeft: 4, position: "relative" }}>
              <button onClick={() => setShareMenu(shareMenu === i ? null : i)}
                style={{ fontSize: 12, color: "var(--dim)", background: "none", border: "none", cursor: "pointer", padding: "2px 6px", borderRadius: 4, display: "flex", alignItems: "center", gap: 4 }}
                onMouseEnter={e => e.target.style.color = "var(--accent)"} onMouseLeave={e => e.target.style.color = "var(--dim)"}>
                🔗 Share with team
                {sharedPlans.filter(p => p.from === role && p.content === m.content).length > 0 && <span style={{ fontSize: 10, color: "var(--success)" }}>✓ shared</span>}
              </button>
              {shareMenu === i && (
                <div style={{ position: "absolute", top: "100%", left: 0, background: "var(--card)", border: "1px solid var(--muted)", borderRadius: 8, boxShadow: "var(--shadow-lg)", zIndex: 50, minWidth: 180, marginTop: 2 }}>
                  <div style={{ padding: "6px 12px", fontSize: 11, color: "var(--dim)", borderBottom: "1px solid var(--muted)" }}>Share this response with:</div>
                  {otherPros.map(([proKey, proConfig]) => {
                    const alreadyShared = sharedPlans.some(p => p.from === role && p.to === proKey && p.content === m.content);
                    return <button key={proKey} onClick={() => !alreadyShared && sharePlan(i, proKey)} disabled={alreadyShared}
                      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "none", border: "none", borderBottom: "1px solid var(--muted)", cursor: alreadyShared ? "default" : "pointer", fontFamily: "var(--body)", fontSize: 13, color: alreadyShared ? "var(--dim)" : "var(--text)", opacity: alreadyShared ? 0.5 : 1 }}
                      onMouseEnter={e => { if (!alreadyShared) e.target.style.background = "var(--bg)"; }} onMouseLeave={e => e.target.style.background = "none"}>
                      <span>{proConfig.icon}</span>
                      <span>{proConfig.title}</span>
                      {alreadyShared && <span style={{ fontSize: 10, color: "var(--success)", marginLeft: "auto" }}>✓</span>}
                    </button>;
                  })}
                  {/* Also share with doctor */}
                  {role !== "doctor" && (() => {
                    const alreadyShared = sharedPlans.some(p => p.from === role && p.to === "doctor" && p.content === m.content);
                    return <button onClick={() => !alreadyShared && sharePlan(i, "doctor")} disabled={alreadyShared}
                      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px", background: "none", border: "none", cursor: alreadyShared ? "default" : "pointer", fontFamily: "var(--body)", fontSize: 13, color: alreadyShared ? "var(--dim)" : "var(--text)", opacity: alreadyShared ? 0.5 : 1 }}
                      onMouseEnter={e => { if (!alreadyShared) e.target.style.background = "var(--bg)"; }} onMouseLeave={e => e.target.style.background = "none"}>
                      <span>🩺</span><span>Dr. Healleo</span>
                      {alreadyShared && <span style={{ fontSize: 10, color: "var(--success)", marginLeft: "auto" }}>✓</span>}
                    </button>;
                  })()}
                  <button onClick={() => setShareMenu(null)} style={{ width: "100%", padding: "6px", background: "var(--bg)", border: "none", fontSize: 11, color: "var(--dim)", cursor: "pointer", borderRadius: "0 0 8px 8px" }}>Cancel</button>
                </div>
              )}
            </div>
          )}
        </div>)}
        {loading && <div style={{ padding: "12px 0" }}>
          <div style={{ display: "flex", gap: 4 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", animation: `pulse 1s ease-in-out ${i * 0.15}s infinite` }} />)}</div>
          <span style={{ fontSize: 14, color: "var(--dim)", marginTop: 4, display: "block" }}>{config.loadingText}</span>
        </div>}
        <div ref={chatEnd} />
      </div>
      <div style={{ padding: "10px 14px", borderTop: "1px solid var(--muted)", display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder={`Ask your ${config.title.toLowerCase()}...`} disabled={loading} style={{ ...S.input, flex: 1, border: "none", background: "transparent", padding: "8px 0" }} />
        <button onClick={() => send()} disabled={loading || !input.trim()} style={{ ...S.primaryBtn, padding: "8px 16px", fontSize: 15, opacity: loading || !input.trim() ? 0.5 : 1 }}>Send</button>
      </div>
    </div>
    <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(138,122,74,0.07)", borderRadius: 8 }}>
      <p style={{ fontSize: 13, color: "var(--dim)", lineHeight: 1.5 }}>{config.disclaimer}</p>
    </div>
  </div>);
}
