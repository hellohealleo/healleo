// ═══════════════════════════════════════════════════════
// HEALLEO — SUPABASE STORAGE ADAPTER
// Drop-in replacement for window.storage + custom auth
// ═══════════════════════════════════════════════════════
//
// This file replaces the localStorage-based storage and
// PBKDF2 auth with:
//   1. Supabase Auth (JWT sessions, cross-device)
//   2. Supabase Database (persistent, RLS-protected)
//   3. Browser-side AES-256-GCM encryption (server-blind)
//
// SETUP:
//   1. Create a Supabase project at supabase.com
//   2. Run db/schema.sql in the SQL Editor
//   3. Set SUPABASE_URL and SUPABASE_ANON_KEY below
//   4. Include this file in your index.html before the app
//
// ═══════════════════════════════════════════════════════

// ─── CONFIGURATION (injected by Vite from .env.local / .env) ───
import { createClient as _createSupabaseClient } from "@supabase/supabase-js";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// If Supabase is not configured, skip all adapter setup.
// The app will fall back to standalone localStorage mode.
const _SUPABASE_CONFIGURED = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
if (!_SUPABASE_CONFIGURED) { console.log("Healleo: Supabase not configured — running in standalone mode"); }

// ─── Supabase Client (loaded from CDN in index.html) ───
let _supabase = null;
function getSupabase() {
  if (!_supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
    _supabase = _createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _supabase;
}

// ═══════════════════════════════════════════════════════
// ENCRYPTION — AES-256-GCM in the browser
// The encryption key is derived from the user's password
// using PBKDF2 (100K iterations). The server NEVER sees
// the key — only ciphertext is stored in Supabase.
// ═══════════════════════════════════════════════════════

const ENC_ALGO = "AES-GCM";
const KEY_LENGTH = 256;
const PBKDF2_ITERATIONS = 100000;

async function deriveEncryptionKey(password, salt, extractable = true) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: encoder.encode(salt), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: ENC_ALGO, length: KEY_LENGTH },
    extractable,
    ["encrypt", "decrypt"]
  );
}

async function wrapKeyForRecovery(encryptionKey, securityAnswer, salt) {
  const recoveryKey = await deriveEncryptionKey(securityAnswer.trim().toLowerCase(), salt + "-recovery");
  const rawKey = await crypto.subtle.exportKey("raw", encryptionKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wrapped = await crypto.subtle.encrypt({ name: ENC_ALGO, iv }, recoveryKey, rawKey);
  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, "0")).join("");
  const wrappedHex = Array.from(new Uint8Array(wrapped)).map(b => b.toString(16).padStart(2, "0")).join("");
  return ivHex + wrappedHex;
}

async function unwrapKeyFromRecovery(recoveryBlob, securityAnswer, salt) {
  try {
    const recoveryKey = await deriveEncryptionKey(securityAnswer.trim().toLowerCase(), salt + "-recovery");
    const ivHex = recoveryBlob.slice(0, 24);
    const wrappedHex = recoveryBlob.slice(24);
    const iv = new Uint8Array(ivHex.match(/.{2}/g).map(h => parseInt(h, 16)));
    const wrapped = new Uint8Array(wrappedHex.match(/.{2}/g).map(h => parseInt(h, 16)));
    const rawKey = await crypto.subtle.decrypt({ name: ENC_ALGO, iv }, recoveryKey, wrapped);
    return crypto.subtle.importKey("raw", rawKey, { name: ENC_ALGO, length: KEY_LENGTH }, true, ["encrypt", "decrypt"]);
  } catch {
    return null;
  }
}

async function encryptData(plaintext, key) {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: ENC_ALGO, iv },
    key,
    encoder.encode(plaintext)
  );
  // Pack: iv (24 hex) + ciphertext (hex)
  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, "0")).join("");
  const ctHex = Array.from(new Uint8Array(ciphertext)).map(b => b.toString(16).padStart(2, "0")).join("");
  return ivHex + ctHex;
}

async function decryptData(packed, key) {
  try {
    const ivHex = packed.slice(0, 24);
    const ctHex = packed.slice(24);
    const iv = new Uint8Array(ivHex.match(/.{2}/g).map(h => parseInt(h, 16)));
    const ct = new Uint8Array(ctHex.match(/.{2}/g).map(h => parseInt(h, 16)));
    const plaintext = await crypto.subtle.decrypt(
      { name: ENC_ALGO, iv },
      key,
      ct
    );
    return new TextDecoder().decode(plaintext);
  } catch (e) {
    console.error("Decryption failed:", e);
    return null;
  }
}

// ═══════════════════════════════════════════════════════
// HEALLEO AUTH — wraps Supabase Auth
// ═══════════════════════════════════════════════════════

let _encryptionKey = null; // Held in memory only, never stored

window.healleoAuth = {
  // Check if Supabase is actually configured with URL and key
  isConfigured() {
    return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
  },

  // Sign up with email/password
  async signup(email, password, name, securityQ, securityA) {
    const sb = getSupabase();
    if (!sb) return { error: "Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY." };

    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          security_question: securityQ || "",
          security_answer_hash: securityA ? await hashAnswer(securityA) : "",
          enc_salt: crypto.randomUUID(), // Unique salt for encryption key derivation
        }
      }
    });
    if (error) return { error: error.message };

    // Derive encryption key from password
    const salt = data.user.user_metadata.enc_salt;
    _encryptionKey = await deriveEncryptionKey(password, salt);

    // Store recovery key blob (enables password reset without old password)
    if (securityA) {
      const recoveryBlob = await wrapKeyForRecovery(_encryptionKey, securityA, salt);
      await sb.auth.updateUser({ data: { enc_key_recovery: recoveryBlob } });
    }

    // Create initial user_data row
    await sb.from("user_data").insert({
      user_id: data.user.id,
      data_key: "health-state",
      encrypted_data: await encryptData(JSON.stringify({}), _encryptionKey),
    });

    // Audit
    await sb.from("audit_log").insert({
      user_id: data.user.id, action: "signup", resource_type: "account"
    });

    return { user: data.user, session: data.session };
  },

  // Sign in
  async login(email, password) {
    const sb = getSupabase();
    if (!sb) return { error: "Supabase not configured" };

    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    // Derive encryption key
    const salt = data.user.user_metadata?.enc_salt;
    if (salt) {
      _encryptionKey = await deriveEncryptionKey(password, salt);
    }

    // Audit
    await sb.from("audit_log").insert({
      user_id: data.user.id, action: "login", resource_type: "session"
    });

    return { user: data.user, session: data.session };
  },

  // Sign out
  async logout() {
    const sb = getSupabase();
    _encryptionKey = null;
    if (sb) await sb.auth.signOut();
  },

  // Send password reset email
  async resetPassword(email) {
    const sb = getSupabase();
    if (!sb) return { error: "Supabase not configured" };
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) return { error: error.message };
    return { success: true };
  },

  // Listen for auth state changes (PASSWORD_RECOVERY, etc.)
  onAuthStateChange(callback) {
    const sb = getSupabase();
    if (!sb) return { data: { subscription: { unsubscribe() {} } } };
    return sb.auth.onAuthStateChange(callback);
  },

  // Reset password using security answer to recover encryption key
  async resetPasswordWithSecurityAnswer(securityAnswer, newPassword) {
    const sb = getSupabase();
    const user = await this.getUser();
    if (!sb || !user) return { error: "Not authenticated" };

    const salt = user.user_metadata.enc_salt;
    const recoveryBlob = user.user_metadata.enc_key_recovery;

    if (!recoveryBlob) {
      return { error: "No recovery key found for this account. This account was created before recovery was enabled. Contact support." };
    }

    // Unwrap the encryption key using the security answer
    const oldKey = await unwrapKeyFromRecovery(recoveryBlob, securityAnswer, salt);
    if (!oldKey) {
      return { error: "Incorrect security answer. Please try again." };
    }

    // Verify it can actually decrypt data
    const { data: rows } = await sb.from("user_data")
      .select("encrypted_data").eq("data_key", "health-state").single();
    if (rows?.encrypted_data) {
      const test = await decryptData(rows.encrypted_data, oldKey);
      if (test === null) return { error: "Recovery key mismatch. Contact support." };
    }

    // Re-encrypt all data with new password key
    const newSalt = crypto.randomUUID();
    const newKey = await deriveEncryptionKey(newPassword, newSalt);
    const { data: allData } = await sb.from("user_data").select("*").eq("user_id", user.id);
    for (const row of (allData || [])) {
      const plaintext = await decryptData(row.encrypted_data, oldKey);
      if (plaintext !== null) {
        const newCiphertext = await encryptData(plaintext, newKey);
        await sb.from("user_data").update({ encrypted_data: newCiphertext }).eq("id", row.id);
      }
    }

    // Store new recovery blob + update password + salt
    const newRecoveryBlob = await wrapKeyForRecovery(newKey, securityAnswer, newSalt);
    const { error } = await sb.auth.updateUser({
      password: newPassword,
      data: { enc_salt: newSalt, enc_key_recovery: newRecoveryBlob }
    });
    if (error) return { error: error.message };

    _encryptionKey = newKey;
    return { success: true };
  },

  // Get the security question for a user (for the reset flow UI)
  async getSecurityQuestion() {
    const user = await this.getUser();
    return user?.user_metadata?.security_question || null;
  },

  // Check if account has recovery enabled
  async hasRecoveryKey() {
    const user = await this.getUser();
    return !!user?.user_metadata?.enc_key_recovery;
  },

  // Create recovery key for existing accounts (one-time migration)
  async createRecoveryKey(password, securityQ, securityA) {
    const sb = getSupabase();
    const user = await this.getUser();
    if (!sb || !user) return { error: "Not authenticated" };

    const salt = user.user_metadata.enc_salt;
    if (!salt) return { error: "No encryption salt found" };

    // Derive key from current password (or use the one already in memory)
    const key = _encryptionKey || await deriveEncryptionKey(password, salt);
    const recoveryBlob = await wrapKeyForRecovery(key, securityA, salt);

    const { error } = await sb.auth.updateUser({
      data: {
        security_question: securityQ.trim(),
        security_answer_hash: await hashAnswer(securityA),
        enc_key_recovery: recoveryBlob,
      }
    });
    if (error) return { error: error.message };
    return { success: true };
  },

  // Get current session
  async getSession() {
    const sb = getSupabase();
    if (!sb) return null;
    const { data: { session } } = await sb.auth.getSession();
    return session;
  },

  // Get current user
  async getUser() {
    const sb = getSupabase();
    if (!sb) return null;
    const { data: { user } } = await sb.auth.getUser();
    return user;
  },

  // Check if encryption key is available
  hasEncryptionKey() {
    return !!_encryptionKey;
  },

  // Re-derive key (needed after page refresh if session exists)
  async unlockWithPassword(password) {
    const user = await this.getUser();
    if (!user) return false;
    const salt = user.user_metadata?.enc_salt;
    if (!salt) return false;
    _encryptionKey = await deriveEncryptionKey(password, salt);
    return true;
  },

  // Change password (re-encrypts data, refreshes recovery blob if security answer provided)
  async changePassword(oldPassword, newPassword, securityAnswer) {
    const sb = getSupabase();
    const user = await this.getUser();
    if (!sb || !user) return { error: "Not authenticated" };

    // Verify old password works by trying to derive and decrypt
    const salt = user.user_metadata.enc_salt;
    const oldKey = await deriveEncryptionKey(oldPassword, salt);

    // Load and verify decryption works with old key
    const { data: rows } = await sb.from("user_data")
      .select("encrypted_data").eq("data_key", "health-state").single();
    if (rows?.encrypted_data) {
      const test = await decryptData(rows.encrypted_data, oldKey);
      if (test === null) return { error: "Current password is incorrect" };
    }

    // Generate new salt
    const newSalt = crypto.randomUUID();
    const newKey = await deriveEncryptionKey(newPassword, newSalt);

    // Re-encrypt all data with new key
    const { data: allData } = await sb.from("user_data")
      .select("*").eq("user_id", user.id);

    for (const row of (allData || [])) {
      const plaintext = await decryptData(row.encrypted_data, oldKey);
      if (plaintext !== null) {
        const newCiphertext = await encryptData(plaintext, newKey);
        await sb.from("user_data")
          .update({ encrypted_data: newCiphertext })
          .eq("id", row.id);
      }
    }

    // Refresh recovery blob if security answer provided, otherwise invalidate
    const updateData = { enc_salt: newSalt };
    if (securityAnswer) {
      updateData.enc_key_recovery = await wrapKeyForRecovery(newKey, securityAnswer, newSalt);
    } else {
      updateData.enc_key_recovery = null;
    }

    const { error } = await sb.auth.updateUser({
      password: newPassword,
      data: updateData
    });
    if (error) return { error: error.message };

    _encryptionKey = newKey;
    return { success: true };
  },

  // Password reset via security question
  async verifySecurityAnswer(email, answer) {
    // This requires a server-side function in production.
    // For Phase 1, we store the hash in user_metadata (visible to the user).
    // In Phase 2, move to a server-side verification endpoint.
    return { error: "Password reset requires email verification in Supabase mode. Use the 'Forgot Password' email flow." };
  },
};

// Simple hash for security answer (not for encryption — just comparison)
async function hashAnswer(answer) {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(answer.trim().toLowerCase()));
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ═══════════════════════════════════════════════════════
// HEALLEO DATA — encrypted CRUD operations
// ═══════════════════════════════════════════════════════

window.healleoData = {
  // Load health state
  async load() {
    const sb = getSupabase();
    if (!sb || !_encryptionKey) return null;

    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;

    const { data, error } = await sb.from("user_data")
      .select("encrypted_data, version")
      .eq("user_id", user.id)
      .eq("data_key", "health-state")
      .single();

    if (error || !data) return null;

    const plaintext = await decryptData(data.encrypted_data, _encryptionKey);
    if (!plaintext) return null;

    try {
      return JSON.parse(plaintext);
    } catch {
      return null;
    }
  },

  // Save health state
  async save(state) {
    const sb = getSupabase();
    if (!sb || !_encryptionKey) return false;

    const { data: { user } } = await sb.auth.getUser();
    if (!user) return false;

    const encrypted = await encryptData(JSON.stringify(state), _encryptionKey);

    const { error } = await sb.from("user_data")
      .upsert({
        user_id: user.id,
        data_key: "health-state",
        encrypted_data: encrypted,
        version: 1,
      }, { onConflict: "user_id,data_key" });

    return !error;
  },

  // Delete all user data
  async deleteAll() {
    const sb = getSupabase();
    if (!sb) return false;

    const { data: { user } } = await sb.auth.getUser();
    if (!user) return false;

    await sb.from("user_data").delete().eq("user_id", user.id);
    await sb.from("audit_log").insert({
      user_id: user.id, action: "delete_all_data", resource_type: "health_data"
    });

    return true;
  },

  // Export all data (decrypted, for user download)
  async exportAll() {
    const state = await this.load();
    if (!state) return null;

    return {
      exported_at: new Date().toISOString(),
      format: "healleo-export-v1",
      data: state,
    };
  },
};

// ═══════════════════════════════════════════════════════
// MIGRATION — move localStorage data to Supabase
// Call this after first Supabase login if localStorage has data
// ═══════════════════════════════════════════════════════

window.healleoMigrate = {
  // Check if there's localStorage data to migrate
  hasLocalData() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("healleo-data-")) return true;
    }
    return false;
  },

  // Migrate localStorage to Supabase (only if Supabase account is empty)
  async migrateToSupabase() {
    if (!_encryptionKey) return { error: "Not authenticated" };

    // Safety check: don't overwrite existing Supabase data
    const existing = await window.healleoData.load();
    if (existing && existing.onboarded) {
      return { error: "Account already has data. Migration skipped to prevent overwrite." };
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("healleo-data-")) {
        try {
          const rawData = localStorage.getItem(key);
          const parsed = JSON.parse(rawData);
          if (parsed && typeof parsed === "object") {
            const saved = await window.healleoData.save(parsed);
            if (saved) {
              console.log("Migrated localStorage data to Supabase");
              // Don't delete localStorage yet — keep as backup until confirmed
              return { success: true, data: parsed };
            }
          }
        } catch (e) {
          console.error("Migration error:", e);
        }
      }
    }
    return { error: "No data found to migrate" };
  },

  // After confirming migration worked, clean up localStorage
  cleanupLocal() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("healleo-")) keysToRemove.push(key);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    console.log(`Cleaned up ${keysToRemove.length} localStorage keys`);
  }
};

console.log("Healleo Supabase adapter loaded", SUPABASE_URL ? "✓ configured" : "✗ needs SUPABASE_URL");

// If Supabase is not configured, remove the adapter objects so the app falls back to standalone mode
if (!_SUPABASE_CONFIGURED) {
  delete window.healleoAuth;
  delete window.healleoData;
  delete window.healleoMigrate;
}
