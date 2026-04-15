// Crypto helpers for standalone-mode auth.

export async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(salt), iterations: 100000, hash: "SHA-256" }, keyMaterial, 256);
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, "0")).join("");
}
export function generateSalt() { return Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, "0")).join(""); }
export function generateToken() { return Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, "0")).join(""); }
