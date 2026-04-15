// Proactive insight engine — pure, rule-based (no AI calls).
// Extracted from App.jsx.

export function generateInsights(profile,todayLog,weekLogs){
  const ins=[];const w=parseFloat(profile.weight)||150;const wg=Math.round(w*0.5);
  if(todayLog.water<wg*0.5)ins.push({icon:"💧",title:"Drink more water",text:`${todayLog.water} oz — aim for ${wg} oz`,priority:"high"});
  else if(todayLog.water>=wg)ins.push({icon:"💧",title:"Hydration on point!",text:`Great job hitting ${todayLog.water} oz`,priority:"success"});
  const pg=profile.goals.includes("Build Muscle")?w*1.8:w*1.2;
  if(todayLog.protein>0&&todayLog.protein<pg*0.6)ins.push({icon:"🥩",title:"Increase protein",text:`${todayLog.protein}g — target ~${Math.round(pg)}g`,priority:"medium"});
  const as=weekLogs.reduce((s,l)=>s+l.sleep,0)/7;
  if(as>0&&as<7)ins.push({icon:"😴",title:"Sleep deficit",text:`7-day avg ${as.toFixed(1)}hrs. Need 7-9hrs.`,priority:"high"});
  if(ins.length===0)ins.push({icon:"✨",title:"Keep it up!",text:"Log meals, exercise, and water for insights.",priority:"low"});
  return ins;
}

export function generateTeamInsights(state) {
  const cards = [];
  const logs = state.logs || [];
  const profile = state.profile || {};
  const meds = state.medications || [];
  const labs = state.labResults || [];
  const symptoms = state.symptomSessions || [];
  const timeline = state.healthTimeline || [];
  const today_str = new Date().toISOString().slice(0, 10);
  const weight = parseFloat(profile.weight) || 150;

  // Helper: get last N days of logs
  const recentLogs = (n) => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - n);
    const cs = cutoff.toISOString().slice(0, 10);
    return logs.filter(l => l.date >= cs).sort((a, b) => a.date.localeCompare(b.date));
  };
  const last7 = recentLogs(7);
  const last14 = recentLogs(14);
  const prior7 = last14.filter(l => !last7.find(w => w.date === l.date));

  // Helper: day count since last occurrence
  const daysSince = (dateStr) => {
    if (!dateStr) return 999;
    return Math.floor((new Date() - new Date(dateStr)) / 86400000);
  };

  // ─── 🩺 DOCTOR ───
  // Flagged labs
  const allFlags = labs.flatMap(lr => (lr.results || []).filter(r => r.flag && r.flag !== "NORMAL").map(r => ({ ...r, date: lr.date })));
  const recentFlags = allFlags.filter(f => daysSince(f.date) <= 30);
  if (recentFlags.length >= 3) {
    cards.push({ pro: "doctor", icon: "🩺", title: "We should talk about your labs", text: `You've got ${recentFlags.length} flagged values in the last month. A few abnormals happen — but ${recentFlags.length} together is worth a closer look. I can walk you through what they mean together.`, action: "ask", priority: "high" });
  }

  // No labs in 90+ days
  const lastLabDate = labs.length > 0 ? labs.sort((a, b) => b.date.localeCompare(a.date))[0].date : null;
  if (lastLabDate && daysSince(lastLabDate) > 90) {
    cards.push({ pro: "doctor", icon: "🩺", title: "It's been a while since your last labs", text: `${daysSince(lastLabDate)} days since your last results. If you've had bloodwork done recently, upload it — I can spot trends your doctor might not have time to explain.`, action: "labs", priority: "medium" });
  }

  // Recurring symptoms in same area
  const recentSymptoms = symptoms.filter(s => daysSince(s.date) <= 60);
  const areaCount = {};
  recentSymptoms.forEach(s => { areaCount[s.area] = (areaCount[s.area] || 0) + 1; });
  const recurringArea = Object.entries(areaCount).find(([_, count]) => count >= 3);
  if (recurringArea) {
    cards.push({ pro: "doctor", icon: "🩺", title: `Your ${recurringArea[0].toLowerCase()} keeps coming up`, text: `${recurringArea[1]} symptom checks in that area over the last 2 months. That's a pattern worth investigating — not ignoring. Let's talk through what might be going on.`, action: "ask", priority: "high" });
  }

  // New medication started in last 7 days
  const newMeds = meds.filter(m => m.active !== false && m.addedAt && daysSince(m.addedAt.slice(0, 10)) <= 7);
  if (newMeds.length > 0) {
    cards.push({ pro: "doctor", icon: "🩺", title: `Checking in on ${newMeds[0].name}`, text: `You started this ${daysSince(newMeds[0].addedAt.slice(0, 10)) === 0 ? "today" : daysSince(newMeds[0].addedAt.slice(0, 10)) + " days ago"}. Any side effects? I can flag what to watch for and check interactions with your other meds.`, action: "ask", priority: "medium" });
  }

  // ─── 🍓 NUTRITIONIST ───
  const avgCal7 = last7.filter(l => l.calories > 0);
  const avgCal14prior = prior7.filter(l => l.calories > 0);
  const cal7 = avgCal7.length > 0 ? avgCal7.reduce((s, l) => s + l.calories, 0) / avgCal7.length : 0;
  const calPrior = avgCal14prior.length > 0 ? avgCal14prior.reduce((s, l) => s + l.calories, 0) / avgCal14prior.length : 0;

  // Calorie drop >30%
  if (calPrior > 0 && cal7 > 0 && cal7 < calPrior * 0.7) {
    const drop = Math.round((1 - cal7 / calPrior) * 100);
    cards.push({ pro: "nutritionist", icon: "🍓", title: "Your calories dropped off a cliff", text: `Down ${drop}% from last week — ${Math.round(calPrior)} to ${Math.round(cal7)}. Could be intentional, could be life getting in the way. Either way, let's make sure you're still fueling what your body needs.`, action: "nutritionist", priority: "high" });
  }

  // Protein consistently low
  const proteinTarget = profile.goals?.includes("Build Muscle") ? Math.round(weight * 0.82) : Math.round(weight * 0.55);
  const avgProtein7 = last7.filter(l => l.protein > 0);
  if (avgProtein7.length >= 3) {
    const avgP = avgProtein7.reduce((s, l) => s + l.protein, 0) / avgProtein7.length;
    if (avgP < proteinTarget * 0.6) {
      cards.push({ pro: "nutritionist", icon: "🍓", title: "Protein's running low", text: `You're averaging ${Math.round(avgP)}g — your target is closer to ${Math.round(proteinTarget)}g. That's a gap that'll show up in energy, recovery, and muscle. I've got easy fixes if you want them.`, action: "nutritionist", priority: "medium" });
    }
  }

  // Water trending down 4+ days
  const waterDays = last7.filter(l => l.water > 0);
  if (waterDays.length >= 4) {
    const waterTrend = waterDays.slice(-4);
    const declining = waterTrend.every((l, i) => i === 0 || l.water <= waterTrend[i - 1].water) && waterTrend[0].water > waterTrend[waterTrend.length - 1].water;
    if (declining) {
      cards.push({ pro: "nutritionist", icon: "🍓", title: "Your water intake is sliding", text: `Steady decline the last ${waterTrend.length} days — from ${waterTrend[0].water} oz down to ${waterTrend[waterTrend.length - 1].water} oz. Dehydration sneaks up on you. It messes with energy, focus, and even lab values.`, action: "nutritionist", priority: "medium" });
    }
  }

  // Great nutrition consistency
  if (avgCal7.length >= 6 && cal7 > 0) {
    const variance = avgCal7.reduce((s, l) => s + Math.abs(l.calories - cal7), 0) / avgCal7.length;
    if (variance < cal7 * 0.15) {
      cards.push({ pro: "nutritionist", icon: "🍓", title: "Your nutrition is dialed in", text: `6+ days logged, consistent calories, and you're actually hitting your targets. That's not luck — that's discipline. Keep this going and your body will show it.`, action: "nutritionist", priority: "positive" });
    }
  }

  // ─── 🏋️ TRAINER ───
  const exerciseDays7 = last7.filter(l => l.exercise && l.exercise.length > 0).length;
  const exerciseDaysPrior = prior7.filter(l => l.exercise && l.exercise.length > 0).length;

  // Exercise dropped off
  if (exerciseDaysPrior >= 3 && exerciseDays7 === 0 && last7.length >= 5) {
    cards.push({ pro: "trainer", icon: "🏋️", title: "Hey — haven't seen you move this week", text: `You were hitting ${exerciseDaysPrior} days last week. This week: zero. No guilt trip — life happens. But let's get at least one session in. Even 15 minutes counts. Want me to build you a quick one?`, action: "trainer", priority: "high" });
  }

  // Exercising on bad sleep
  const recentExerciseOnBadSleep = last7.filter(l => l.exercise?.length > 0 && l.sleep > 0 && l.sleep < 6);
  if (recentExerciseOnBadSleep.length >= 2) {
    cards.push({ pro: "trainer", icon: "🏋️", title: "You're training on fumes", text: `${recentExerciseOnBadSleep.length} workout days this week on under 6 hours of sleep. I respect the dedication, but your body recovers during sleep — not during reps. You're getting diminishing returns and increasing injury risk.`, action: "trainer", priority: "high" });
  }

  // Great exercise streak
  if (exerciseDays7 >= 5) {
    cards.push({ pro: "trainer", icon: "🏋️", title: "5+ days this week. Respect.", text: `${exerciseDays7} training days. That's the kind of consistency that compounds. Just make sure you're getting recovery too — your muscles grow on rest days, not workout days.`, action: "trainer", priority: "positive" });
  }

  // No variety in exercise
  if (exerciseDays7 >= 3) {
    const exTypes = {};
    last7.forEach(l => (l.exercise || []).forEach(e => { exTypes[e.type] = (exTypes[e.type] || 0) + 1; }));
    const types = Object.keys(exTypes);
    if (types.length === 1) {
      cards.push({ pro: "trainer", icon: "🏋️", title: `All ${types[0].toLowerCase()}, all the time`, text: `${exTypes[types[0]]} sessions of the same thing. I love the commitment, but your body adapts. Let's mix in something different — even once a week makes a difference for balanced fitness.`, action: "trainer", priority: "medium" });
    }
  }

  // Sedentary 7+ days (with active logging)
  if (exerciseDays7 === 0 && exerciseDaysPrior === 0 && last7.length >= 5) {
    cards.push({ pro: "trainer", icon: "🏋️", title: "Two weeks with no movement logged", text: `Not judging — just noticing. Even a 10-minute walk changes your day. I can build you something so easy it feels like cheating. Want to start small?`, action: "trainer", priority: "medium" });
  }

  // ─── 💜 THERAPIST ───
  const moodDays = last7.filter(l => l.mood >= 0);

  // Mood declining 3+ consecutive days
  if (moodDays.length >= 3) {
    const recent3 = moodDays.slice(-3);
    const declining = recent3.every((l, i) => i === 0 || l.mood <= recent3[i - 1].mood) && recent3[0].mood > recent3[recent3.length - 1].mood;
    if (declining && recent3[recent3.length - 1].mood <= 2) {
      cards.push({ pro: "therapist", icon: "💜", title: "I've noticed your mood dipping", text: `Three days trending down — ending at ${["terrible", "rough", "okay", "good", "great"][recent3[recent3.length - 1].mood]}. That's not a diagnosis, it's just a pattern worth paying attention to. Sometimes talking through it helps more than pushing through it.`, action: "therapist", priority: "high" });
    }
  }

  // Consistently low mood (avg ≤1.5 over 5+ days)
  if (moodDays.length >= 5) {
    const avgMood = moodDays.reduce((s, l) => s + l.mood, 0) / moodDays.length;
    if (avgMood <= 1.5) {
      cards.push({ pro: "therapist", icon: "💜", title: "You've been having a rough stretch", text: `Your mood has averaged ${["terrible", "poor"][Math.round(avgMood)]} over the past ${moodDays.length} days. That's hard, and it's okay to not be okay. I'm here if you want to talk through what's going on — no pressure.`, action: "therapist", priority: "high" });
    }
  }

  // Sleep + mood both declining
  const sleepDays = last7.filter(l => l.sleep > 0);
  if (moodDays.length >= 3 && sleepDays.length >= 3) {
    const avgMood = moodDays.reduce((s, l) => s + l.mood, 0) / moodDays.length;
    const avgSleep = sleepDays.reduce((s, l) => s + l.sleep, 0) / sleepDays.length;
    if (avgMood <= 2 && avgSleep < 6.5 && !cards.find(c => c.pro === "therapist")) {
      cards.push({ pro: "therapist", icon: "💜", title: "Sleep and mood — they're connected", text: `Low sleep (${avgSleep.toFixed(1)} hrs avg) and low mood tend to feed each other. It's not just about willpower — it's biochemistry. Let's talk about breaking the cycle from either end.`, action: "therapist", priority: "high" });
    }
  }

  // New diagnosis/event in timeline (last 14 days)
  const recentDiagnosis = timeline.filter(e => (e.type === "diagnosis" || e.type === "medication") && daysSince(e.date) <= 14);
  if (recentDiagnosis.length > 0 && !cards.find(c => c.pro === "therapist")) {
    const event = recentDiagnosis[recentDiagnosis.length - 1];
    cards.push({ pro: "therapist", icon: "💜", title: "Checking in after your recent news", text: `"${event.title}" showed up in your timeline ${daysSince(event.date)} days ago. New diagnoses and medication changes can stir up a lot — uncertainty, frustration, grief. That's all normal. I'm here if you want to process any of it.`, action: "therapist", priority: "medium" });
  }

  // Consistently good mood — celebrate
  if (moodDays.length >= 5) {
    const avgMood = moodDays.reduce((s, l) => s + l.mood, 0) / moodDays.length;
    if (avgMood >= 3.5) {
      cards.push({ pro: "therapist", icon: "💜", title: "You're in a good place right now", text: `Mood has been solid for ${moodDays.length} days. I just want to name that — it matters. Whatever you're doing is working. Let's bottle it.`, action: "therapist", priority: "positive" });
    }
  }

  // ─── CROSS-AGENT INSIGHTS ───
  // Low calories + low mood (nutritionist + therapist)
  if (cal7 > 0 && cal7 < weight * 9 && moodDays.length >= 3) {
    const avgMood = moodDays.reduce((s, l) => s + l.mood, 0) / moodDays.length;
    if (avgMood <= 2 && !cards.find(c => c.title.includes("calories"))) {
      cards.push({ pro: "nutritionist", icon: "🍓", title: "Underfueling might be affecting your mood", text: `${Math.round(cal7)} cal/day is low for your body, and your mood's been down too. That's not always a coincidence — your brain runs on glucose. Let's make sure you're eating enough to feel like yourself.`, action: "nutritionist", priority: "high", crossAgent: "therapist" });
    }
  }

  // Exercising a lot but not eating enough (trainer + nutritionist)
  if (exerciseDays7 >= 4 && cal7 > 0 && cal7 < weight * 11) {
    cards.push({ pro: "trainer", icon: "🏋️", title: "Training hard, eating light — careful", text: `${exerciseDays7} workout days but only ${Math.round(cal7)} cal/day. You're in a deficit that could cost you muscle and energy. Your nutritionist and I agree: fuel the work.`, action: "nutritionist", priority: "medium", crossAgent: "nutritionist" });
  }

  // Sort: high first, then medium, then positive
  const priorityOrder = { high: 0, medium: 1, positive: 2, low: 3 };
  cards.sort((a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3));

  return cards.slice(0, 5); // Max 5 cards on dashboard
}
