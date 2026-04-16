// Storage helpers — Supabase only (standalone localStorage mode removed).

export async function loadData() {
  return await window.healleoData.load();
}

export async function saveData(data) {
  await window.healleoData.save(data);
}
