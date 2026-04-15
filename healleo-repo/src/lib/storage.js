// Storage helpers — routes to Supabase adapter or localStorage.

export const SUPABASE_MODE = !!(typeof window !== "undefined" && window.healleoAuth && window.healleoData && window.healleoAuth.isConfigured && window.healleoAuth.isConfigured());

export const ACCOUNTS_KEY = "healleo-accounts";
export const SESSION_KEY = "healleo-session";

export async function getAccounts() { try { const r = await window.storage.get(ACCOUNTS_KEY); return r ? JSON.parse(r.value) : {}; } catch { return {}; } }
export async function saveAccounts(accounts) { try { await window.storage.set(ACCOUNTS_KEY, JSON.stringify(accounts)); } catch {} }
export async function getSession() { try { const r = await window.storage.get(SESSION_KEY); return r ? JSON.parse(r.value) : null; } catch { return null; } }
export async function saveSession(session) { try { await window.storage.set(SESSION_KEY, JSON.stringify(session)); } catch {} }
export async function clearSession() { try { await window.storage.delete(SESSION_KEY); } catch {} }

// Per-user data key — mutable module state with setter/getter.
let currentUserKey = null;
export function setCurrentUserKey(k) { currentUserKey = k; }
export function getCurrentUserKey() { return currentUserKey; }
export function userDataKey(userId) { return `healleo-data-${userId}`; }

export async function loadData() {
  if (SUPABASE_MODE) {
    return await window.healleoData.load();
  }
  if (!currentUserKey) return null;
  try { const r = await window.storage.get(currentUserKey); return r ? JSON.parse(r.value) : null; } catch { return null; }
}

export async function saveData(data) {
  if (SUPABASE_MODE) {
    await window.healleoData.save(data);
    return;
  }
  if (!currentUserKey) return;
  try { await window.storage.set(currentUserKey, JSON.stringify(data)); } catch {}
}
