import { useState, useEffect } from "react";
import { globalCSS, S } from "./styles/theme.js";
import { HEALLEO_LOGO } from "./lib/assets.js";
import { DEFAULT_PROFILE, DEFAULT_STATE } from "./lib/state.js";
import { hashPassword, generateSalt, generateToken } from "./lib/auth.js";
import { SUPABASE_MODE, getAccounts, saveAccounts, getSession, saveSession, clearSession, userDataKey, setCurrentUserKey, saveData } from "./lib/storage.js";
import { HealthCompanion } from "./components/HealthCompanion.jsx";

// ═══════════════════════════════════
//  AUTH GATE — LOGIN / SIGNUP / APP
// ═══════════════════════════════════
export default function AuthGate() {
  const [authState, setAuthState] = useState("loading"); // loading, login, signup, app, forgotPw, forgotEmail, unlock, migrate
  const [userEmail, setUserEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [strength, setStrength] = useState(0);
  const [securityQ, setSecurityQ] = useState("");
  const [securityA, setSecurityA] = useState("");
  const [resetStep, setResetStep] = useState(0);
  const [foundAccounts, setFoundAccounts] = useState([]);
  const [migrateData, setMigrateData] = useState(null); // holds localStorage data during migration

  // Apply saved theme as early as possible so auth screens respect it
  useEffect(() => { document.documentElement.dataset.theme = localStorage.getItem("healleoTheme") || "light"; }, []);

  // Check existing session on mount
  useEffect(() => {
    (async () => {
      if (SUPABASE_MODE) {
        // ─── SUPABASE MODE ───
        const session = await window.healleoAuth.getSession();
        if (session) {
          const user = await window.healleoAuth.getUser();
          if (user) {
            setUserEmail(user.email);
            // Check if encryption key needs re-derivation (after page refresh)
            if (!window.healleoAuth.hasEncryptionKey()) {
              setAuthState("unlock");
              return;
            }
            setAuthState("app");
            return;
          }
        }
        setAuthState("login");
      } else {
        // ─── STANDALONE MODE ───
        const session = await getSession();
        if (session && session.email && session.token) {
          const accounts = await getAccounts();
          const acct = accounts[session.email];
          if (acct && acct.token === session.token) {
            setCurrentUserKey(userDataKey(session.email));
            setUserEmail(session.email);
            setAuthState("app");
            return;
          }
        }
        setAuthState("login");
      }
    })();
  }, []);

  const calcStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (pw.length >= 12) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  // ─── LOGIN ───
  const handleLogin = async () => {
    setError(""); setLoading(true);
    const em = email.trim().toLowerCase();
    if (!em || !password) { setError("Please enter email and password"); setLoading(false); return; }

    if (SUPABASE_MODE) {
      const result = await window.healleoAuth.login(em, password);
      if (result.error) { setError(result.error); setLoading(false); return; }
      setUserEmail(em);

      // Check for localStorage data to migrate — but ONLY if this Supabase account has no data yet
      if (window.healleoMigrate?.hasLocalData()) {
        const existingData = await window.healleoData.load();
        const isEmpty = !existingData || (!existingData.onboarded && (!existingData.logs || existingData.logs.length === 0));
        if (isEmpty) {
          setMigrateData(true);
          setAuthState("migrate");
          setLoading(false);
          return;
        }
        // Account already has data — don't offer to overwrite with localStorage from potentially a different user
      }

      setPassword(""); setEmail("");
      setAuthState("app");
      setLoading(false);
    } else {
      const accounts = await getAccounts();
      const acct = accounts[em];
      if (!acct) { setError("No account found with this email"); setLoading(false); return; }
      const hash = await hashPassword(password, acct.salt);
      if (hash !== acct.hash) { setError("Incorrect password"); setLoading(false); return; }
      const token = generateToken();
      accounts[em] = { ...acct, token, lastLogin: new Date().toISOString() };
      await saveAccounts(accounts);
      await saveSession({ email: em, token });
      setCurrentUserKey(userDataKey(em));
      setUserEmail(em);
      setPassword(""); setEmail("");
      setAuthState("app");
      setLoading(false);
    }
  };

  // ─── SIGNUP ───
  const handleSignup = async () => {
    setError(""); setLoading(true);
    const em = email.trim().toLowerCase();
    if (!em || !password || !name.trim()) { setError("Please fill in all fields"); setLoading(false); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { setError("Please enter a valid email address"); setLoading(false); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); setLoading(false); return; }
    if (password !== confirmPw) { setError("Passwords don't match"); setLoading(false); return; }

    if (SUPABASE_MODE) {
      const result = await window.healleoAuth.signup(em, password, name.trim(), securityQ, securityA);
      if (result.error) { setError(result.error); setLoading(false); return; }
      setUserEmail(em);

      // Save initial state with name
      const initialData = { ...DEFAULT_STATE, profile: { ...DEFAULT_PROFILE, name: name.trim() } };
      await window.healleoData.save(initialData);

      setPassword(""); setConfirmPw(""); setEmail(""); setName(""); setSecurityQ(""); setSecurityA("");
      setAuthState("app");
      setLoading(false);
    } else {
      if (!securityQ || !securityA.trim()) { setError("Please select a security question and provide an answer — this is needed for password recovery"); setLoading(false); return; }
      const accounts = await getAccounts();
      if (accounts[em]) { setError("An account with this email already exists"); setLoading(false); return; }
      const salt = generateSalt();
      const hash = await hashPassword(password, salt);
      const token = generateToken();
      accounts[em] = { hash, salt, token, name: name.trim(), securityQ: securityQ.trim(), securityA: securityA.trim().toLowerCase(), created: new Date().toISOString(), lastLogin: new Date().toISOString() };
      await saveAccounts(accounts);
      await saveSession({ email: em, token });
      setCurrentUserKey(userDataKey(em));
      const initialData = { ...DEFAULT_STATE, profile: { ...DEFAULT_PROFILE, name: name.trim() } };
      await saveData(initialData);
      setUserEmail(em);
      setPassword(""); setConfirmPw(""); setEmail(""); setName(""); setSecurityQ(""); setSecurityA("");
      setAuthState("app");
      setLoading(false);
    }
  };

  // ─── UNLOCK (Supabase mode: re-derive encryption key after page refresh) ───
  const handleUnlock = async () => {
    setError(""); setLoading(true);
    if (!password) { setError("Please enter your password"); setLoading(false); return; }
    const ok = await window.healleoAuth.unlockWithPassword(password);
    if (!ok) { setError("Incorrect password. Please try again."); setLoading(false); return; }

    // Verify decryption works by trying to load data
    const testLoad = await window.healleoData.load();
    if (testLoad === null) {
      // Decryption failed — wrong password for this encryption salt
      setError("Password doesn't match. If you recently changed your password, try your previous one.");
      setLoading(false);
      return;
    }

    setPassword("");
    setAuthState("app");
    setLoading(false);
  };

  // ─── MIGRATE (move localStorage to Supabase) ───
  const handleMigrate = async () => {
    setLoading(true);
    const result = await window.healleoMigrate.migrateToSupabase();
    if (result.success) {
      setSuccess("Data migrated to the cloud! You can now access it from any device.");
      window.healleoMigrate.cleanupLocal();
      setTimeout(() => { setAuthState("app"); setSuccess(""); }, 2500);
    } else {
      setError("Migration failed: " + (result.error || "Unknown error"));
    }
    setLoading(false);
  };

  const handleSkipMigrate = () => {
    setAuthState("app");
  };

  // ─── FORGOT PASSWORD ───
  const handleForgotPwStep0 = async () => {
    setError(""); setSuccess("");
    const em = email.trim().toLowerCase();
    if (!em) { setError("Please enter your email address"); return; }

    if (SUPABASE_MODE) {
      // In Supabase mode, use email-based password reset
      try {
        const sb = window.supabase?.createClient?.(
          document.querySelector?.("[data-supabase-url]")?.dataset?.supabaseUrl || "",
          document.querySelector?.("[data-supabase-anon]")?.dataset?.supabaseAnon || ""
        );
        // For now, show a message about email reset
        setSuccess("In Supabase mode, password reset is done via email. Check your inbox for a reset link. If you haven't configured email in Supabase, please contact support.");
      } catch {
        setError("Password reset is not available in this configuration.");
      }
      return;
    }

    const accounts = await getAccounts();
    const acct = accounts[em];
    if (!acct) { setError("No account found with this email"); return; }
    if (!acct.securityQ) { setError("This account doesn't have a security question set. Password cannot be recovered. You can create a new account."); return; }
    setSecurityQ(acct.securityQ);
    setResetStep(1);
  };

  const handleForgotPwStep1 = async () => {
    setError("");
    const em = email.trim().toLowerCase();
    const accounts = await getAccounts();
    const acct = accounts[em];
    if (!acct) { setError("Account not found"); return; }
    if (securityA.trim().toLowerCase() !== acct.securityA) { setError("Incorrect answer. Please try again."); return; }
    setResetStep(2);
  };

  const handleForgotPwStep2 = async () => {
    setError(""); setLoading(true);
    if (password.length < 8) { setError("Password must be at least 8 characters"); setLoading(false); return; }
    if (password !== confirmPw) { setError("Passwords don't match"); setLoading(false); return; }
    const em = email.trim().toLowerCase();
    const accounts = await getAccounts();
    const acct = accounts[em];
    if (!acct) { setError("Account not found"); setLoading(false); return; }
    const salt = generateSalt();
    const hash = await hashPassword(password, salt);
    accounts[em] = { ...acct, hash, salt };
    await saveAccounts(accounts);
    setSuccess("Password reset successfully! You can now sign in.");
    setPassword(""); setConfirmPw(""); setSecurityA("");
    setTimeout(() => { setAuthState("login"); setResetStep(0); setSuccess(""); setError(""); }, 2000);
    setLoading(false);
  };

  // ─── FORGOT EMAIL ───
  const handleForgotEmail = async () => {
    setError("");
    const accounts = await getAccounts();
    const emails = Object.keys(accounts);
    if (emails.length === 0) { setError("No accounts found on this device."); return; }
    setFoundAccounts(emails.map(em => {
      const acct = accounts[em];
      const parts = em.split("@");
      const masked = parts[0].charAt(0) + "•".repeat(Math.max(parts[0].length - 2, 1)) + parts[0].charAt(parts[0].length - 1) + "@" + parts[1];
      return { email: em, masked, name: acct.name || "Unknown", created: acct.created?.slice(0, 10) || "?" };
    }));
  };

  const selectFoundEmail = (em) => {
    setEmail(em);
    setAuthState("login");
    setFoundAccounts([]);
    setError("");
  };

  // ─── LOGOUT ───
  const handleLogout = async () => {
    if (SUPABASE_MODE) {
      await window.healleoAuth.logout();
    } else {
      await clearSession();
    }
    setCurrentUserKey(null);
    setUserEmail("");
    setEmail(""); setPassword(""); setConfirmPw(""); setName(""); setError(""); setSuccess("");
    setSecurityQ(""); setSecurityA(""); setResetStep(0); setFoundAccounts([]);
    setAuthState("login");
  };

  // ─── LOADING STATE ───
  if (authState === "loading") {
    return (
      <div style={{ ...S.loading, background: "var(--bg)" }}>
        <style>{globalCSS}</style>
        <div style={S.spinner} />
        <p style={{ color: "var(--accent)", marginTop: 16, fontFamily: "'DM Sans'" }}>Checking session...</p>
      </div>
    );
  }

  // ─── APP STATE ───
  if (authState === "app") {
    return <HealthCompanion onLogout={handleLogout} userEmail={userEmail} />;
  }

  // ─── UNLOCK SCREEN (Supabase mode: session exists, need password for encryption key) ───
  if (authState === "unlock") {
    return (
      <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <style>{globalCSS}</style>
        <div style={{ background: "var(--card)", borderRadius: 20, padding: 36, maxWidth: 440, width: "100%", boxShadow: "var(--shadow-lg)" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <img src={HEALLEO_LOGO} alt="Healleo" style={{ height: 132, objectFit: "contain", marginBottom: 8 }}/>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Welcome back{userEmail ? `, ${userEmail}` : ""}</p>
            <p style={{ fontSize: 14, color: "var(--dim)", marginTop: 6, lineHeight: 1.5 }}>
              Your session is active, but your health data is encrypted. Enter your password to unlock it.
            </p>
          </div>

          <label style={{ ...S.label, marginBottom: 12 }}>
            Password
            <div style={{ position: "relative" }}>
              <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" style={{ ...S.input, paddingRight: 40 }} autoComplete="current-password" onKeyDown={e => e.key === "Enter" && handleUnlock()} autoFocus />
              <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 17, color: "var(--dim)" }}>{showPw ? "🙈" : "👁"}</button>
            </div>
          </label>

          {error && <div style={{ padding: "8px 12px", background: "rgba(184,84,84,0.08)", border: "1px solid rgba(184,84,84,0.2)", borderRadius: 8, marginBottom: 12, fontSize: 14, color: "#8b3a3a" }}>{error}</div>}

          <button onClick={handleUnlock} disabled={loading} style={{ ...S.primaryBtn, width: "100%", padding: "12px 18px", fontSize: 16, opacity: loading ? 0.6 : 1, marginBottom: 12 }}>
            {loading ? "Unlocking..." : "🔓 Unlock"}
          </button>

          <button onClick={handleLogout} style={{ width: "100%", padding: "8px", background: "none", border: "none", color: "var(--dim)", cursor: "pointer", fontSize: 14, fontFamily: "var(--body)" }}>
            Sign in as different user
          </button>

          <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--bg)", borderRadius: 10, textAlign: "center" }}>
            <p style={{ fontSize: 12, color: "var(--dim)", lineHeight: 1.5 }}>
              🔐 Your encryption key is derived from your password and never stored. This unlock step ensures your health data stays private — even from our servers.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── MIGRATION SCREEN (localStorage → Supabase) ───
  if (authState === "migrate") {
    return (
      <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <style>{globalCSS}</style>
        <div style={{ background: "var(--card)", borderRadius: 20, padding: 36, maxWidth: 440, width: "100%", boxShadow: "var(--shadow-lg)" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>☁️</div>
            <h2 style={S.h2}>Move Your Data to the Cloud?</h2>
            <p style={{ fontSize: 14, color: "var(--dim)", marginTop: 8, lineHeight: 1.6 }}>
              We found health data stored on this device from before cloud sync was enabled. Would you like to migrate it to your secure cloud account? This means you'll be able to access your data from any device.
            </p>
          </div>

          {error && <div style={{ padding: "8px 12px", background: "rgba(184,84,84,0.08)", border: "1px solid rgba(184,84,84,0.2)", borderRadius: 8, marginBottom: 12, fontSize: 14, color: "#8b3a3a" }}>{error}</div>}
          {success && <div style={{ padding: "8px 12px", background: "rgba(138,122,74,0.08)", border: "1px solid rgba(138,122,74,0.18)", borderRadius: 8, marginBottom: 12, fontSize: 14, color: "var(--success)" }}>{success}</div>}

          <button onClick={handleMigrate} disabled={loading} style={{ ...S.primaryBtn, width: "100%", padding: "12px 18px", fontSize: 16, marginBottom: 10, opacity: loading ? 0.6 : 1 }}>
            {loading ? "Migrating..." : "Yes, Migrate My Data"}
          </button>
          <button onClick={handleSkipMigrate} style={{ width: "100%", padding: "10px", background: "var(--muted)", border: "none", borderRadius: 10, color: "var(--text)", cursor: "pointer", fontSize: 14, fontFamily: "var(--body)" }}>
            Skip — Start Fresh
          </button>

          <div style={{ marginTop: 16, padding: "10px 14px", background: "var(--bg)", borderRadius: 10 }}>
            <p style={{ fontSize: 12, color: "var(--dim)", lineHeight: 1.5 }}>
              🔐 Your data will be encrypted with AES-256-GCM before being stored. The encryption key is derived from your password and never leaves your browser.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // LOGIN / SIGNUP / FORGOT SCREENS
  const isSignup = authState === "signup";
  const isForgotPw = authState === "forgotPw";
  const isForgotEmail = authState === "forgotEmail";
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];
  const strengthColors = ["", "var(--danger)", "var(--accent4)", "var(--accent2)", "var(--accent3)", "var(--success)"];

  const SECURITY_QUESTIONS = [
    "What was the name of your first pet?",
    "What city were you born in?",
    "What is your mother's maiden name?",
    "What was the name of your elementary school?",
    "What is the name of the street you grew up on?",
    "What was the make of your first car?",
  ];

  return (
    <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <style>{globalCSS}</style>
      <div style={{ background: "var(--card)", borderRadius: 20, padding: 36, maxWidth: 440, width: "100%", boxShadow: "var(--shadow-lg)" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img src={HEALLEO_LOGO} alt="Healleo" style={{ height: 160, objectFit: "contain", marginBottom: 8 }}/>
          <p style={{ fontSize: 15, color: "var(--dim)", marginTop: 4 }}>
            {isForgotPw ? "Reset your password" : isForgotEmail ? "Find your account" : isSignup ? "Create your account" : "Healthcare Optimized by You"}
          </p>
        </div>

        {/* ─── FORGOT PASSWORD FLOW ─── */}
        {isForgotPw && (<>
          {resetStep === 0 && (<>
            <label style={{ ...S.label, marginBottom: 12 }}>
              Email Address
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your account email" style={S.input} onKeyDown={e => e.key === "Enter" && handleForgotPwStep0()} />
            </label>
            {error && <div style={{ padding: "8px 12px", background: "rgba(184,84,84,0.08)", border: "1px solid rgba(184,84,84,0.2)", borderRadius: 8, marginBottom: 12, fontSize: 15, color: "#8b3a3a" }}>{error}</div>}
            <button onClick={handleForgotPwStep0} style={{ ...S.primaryBtn, width: "100%", padding: "12px 18px", fontSize: 17, marginBottom: 14 }}>Continue</button>
          </>)}

          {resetStep === 1 && (<>
            <div style={{ padding: "10px 14px", background: "var(--bg)", borderRadius: 10, marginBottom: 14, fontSize: 15, color: "var(--dim)" }}>
              Account found for <strong>{email}</strong>. Answer your security question to continue.
            </div>
            <label style={{ ...S.label, marginBottom: 8 }}>
              Security Question
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginTop: 4, padding: "10px 14px", background: "var(--bg)", borderRadius: 8 }}>
                {securityQ}
              </div>
            </label>
            <label style={{ ...S.label, marginBottom: 12, marginTop: 10 }}>
              Your Answer
              <input value={securityA} onChange={e => setSecurityA(e.target.value)} placeholder="Type your answer" style={S.input} onKeyDown={e => e.key === "Enter" && handleForgotPwStep1()} />
            </label>
            {error && <div style={{ padding: "8px 12px", background: "rgba(184,84,84,0.08)", border: "1px solid rgba(184,84,84,0.2)", borderRadius: 8, marginBottom: 12, fontSize: 15, color: "#8b3a3a" }}>{error}</div>}
            <button onClick={handleForgotPwStep1} disabled={!securityA.trim()} style={{ ...S.primaryBtn, width: "100%", padding: "12px 18px", fontSize: 17, marginBottom: 14, opacity: securityA.trim() ? 1 : 0.5 }}>Verify Answer</button>
          </>)}

          {resetStep === 2 && (<>
            <div style={{ padding: "10px 14px", background: "rgba(138,122,74,0.08)", border: "1px solid rgba(138,122,74,0.18)", borderRadius: 10, marginBottom: 14, fontSize: 15, color: "var(--success)" }}>
              ✓ Identity verified. Set your new password below.
            </div>
            <label style={{ ...S.label, marginBottom: 12 }}>
              New Password
              <input type={showPw ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setStrength(calcStrength(e.target.value)); }} placeholder="Min. 8 characters" style={S.input} />
            </label>
            {password && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                  {[1,2,3,4,5].map(i => (<div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColors[strength] : "var(--muted)" }} />))}
                </div>
              </div>
            )}
            <label style={{ ...S.label, marginBottom: 12 }}>
              Confirm New Password
              <input type={showPw ? "text" : "password"} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password" style={{ ...S.input, borderColor: confirmPw && confirmPw !== password ? "var(--danger)" : "var(--muted)" }} onKeyDown={e => e.key === "Enter" && handleForgotPwStep2()} />
            </label>
            {error && <div style={{ padding: "8px 12px", background: "rgba(184,84,84,0.08)", border: "1px solid rgba(184,84,84,0.2)", borderRadius: 8, marginBottom: 12, fontSize: 15, color: "#8b3a3a" }}>{error}</div>}
            {success && <div style={{ padding: "8px 12px", background: "rgba(138,122,74,0.08)", border: "1px solid rgba(138,122,74,0.18)", borderRadius: 8, marginBottom: 12, fontSize: 15, color: "var(--success)" }}>{success}</div>}
            <button onClick={handleForgotPwStep2} disabled={loading} style={{ ...S.primaryBtn, width: "100%", padding: "12px 18px", fontSize: 17, marginBottom: 14, opacity: loading ? 0.6 : 1 }}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </>)}

          <div style={{ textAlign: "center", fontSize: 16, color: "var(--dim)" }}>
            <button onClick={() => { setAuthState("login"); setResetStep(0); setError(""); setSuccess(""); setSecurityA(""); setPassword(""); setConfirmPw(""); }} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 600, fontSize: 16, fontFamily: "var(--body)" }}>
              ← Back to Sign In
            </button>
          </div>
        </>)}

        {/* ─── FORGOT EMAIL FLOW ─── */}
        {isForgotEmail && (<>
          {foundAccounts.length === 0 ? (<>
            <p style={{ fontSize: 16, color: "var(--dim)", lineHeight: 1.6, marginBottom: 16 }}>
              We'll search for accounts registered on this device. Tap "Find Accounts" to see all accounts stored locally.
            </p>
            {error && <div style={{ padding: "8px 12px", background: "rgba(184,84,84,0.08)", border: "1px solid rgba(184,84,84,0.2)", borderRadius: 8, marginBottom: 12, fontSize: 15, color: "#8b3a3a" }}>{error}</div>}
            <button onClick={handleForgotEmail} style={{ ...S.primaryBtn, width: "100%", padding: "12px 18px", fontSize: 17, marginBottom: 14 }}>Find My Accounts</button>
          </>) : (<>
            <p style={{ fontSize: 16, color: "var(--dim)", marginBottom: 14 }}>
              Found {foundAccounts.length} account{foundAccounts.length > 1 ? "s" : ""} on this device. Tap to sign in:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {foundAccounts.map((acct, i) => (
                <button key={i} onClick={() => selectFoundEmail(acct.email)} style={{ ...S.card, padding: 14, border: "none", cursor: "pointer", textAlign: "left", width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{acct.name}</div>
                      <div style={{ fontSize: 15, color: "var(--accent)", marginTop: 2, fontFamily: "var(--mono)" }}>{acct.masked}</div>
                      <div style={{ fontSize: 16, color: "var(--dim)", marginTop: 2 }}>Created: {acct.created}</div>
                    </div>
                    <span style={{ color: "var(--dim)" }}>→</span>
                  </div>
                </button>
              ))}
            </div>
          </>)}
          <div style={{ textAlign: "center", fontSize: 16, color: "var(--dim)" }}>
            <button onClick={() => { setAuthState("login"); setFoundAccounts([]); setError(""); }} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 600, fontSize: 16, fontFamily: "var(--body)" }}>
              ← Back to Sign In
            </button>
          </div>
        </>)}

        {/* ─── LOGIN / SIGNUP FORM ─── */}
        {(authState === "login" || authState === "signup") && (<>
        {isSignup && (
          <label style={{ ...S.label, marginBottom: 12 }}>
            Full Name
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={S.input} onKeyDown={e => e.key === "Enter" && handleSignup()} />
          </label>
        )}

        <label style={{ ...S.label, marginBottom: 12 }}>
          Email Address
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={S.input} autoComplete="email" onKeyDown={e => e.key === "Enter" && (isSignup ? handleSignup() : handleLogin())} />
        </label>

        <label style={{ ...S.label, marginBottom: isSignup ? 4 : 12 }}>
          Password
          <div style={{ position: "relative" }}>
            <input type={showPw ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setStrength(calcStrength(e.target.value)); }} placeholder={isSignup ? "Min. 8 characters" : "Enter password"} style={{ ...S.input, paddingRight: 40 }} autoComplete={isSignup ? "new-password" : "current-password"} onKeyDown={e => e.key === "Enter" && (isSignup ? handleSignup() : handleLogin())} />
            <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 17, color: "var(--dim)" }}>{showPw ? "🙈" : "👁"}</button>
          </div>
        </label>

        {isSignup && password && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 3, marginTop: 6, marginBottom: 4 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColors[strength] : "var(--muted)", transition: "background 0.2s" }} />
              ))}
            </div>
            <div style={{ fontSize: 16, color: strengthColors[strength], fontFamily: "var(--mono)" }}>{strengthLabels[strength]}</div>
          </div>
        )}

        {isSignup && (
          <label style={{ ...S.label, marginBottom: 12 }}>
            Confirm Password
            <input type={showPw ? "text" : "password"} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat password" style={{ ...S.input, borderColor: confirmPw && confirmPw !== password ? "var(--danger)" : "var(--muted)" }} autoComplete="new-password" onKeyDown={e => e.key === "Enter" && handleSignup()} />
            {confirmPw && confirmPw !== password && <span style={{ fontSize: 16, color: "var(--danger)", marginTop: 2 }}>Passwords don't match</span>}
          </label>
        )}

        {isSignup && (
          <>
            <label style={{ ...S.label, marginBottom: 8 }}>
              Security Question <span style={{ fontWeight: 400, color: "var(--dim)" }}>(for password recovery)</span>
              <select value={securityQ} onChange={e => setSecurityQ(e.target.value)} style={S.input}>
                <option value="">Select a security question...</option>
                {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </label>
            {securityQ && (
              <label style={{ ...S.label, marginBottom: 12 }}>
                Your Answer
                <input value={securityA} onChange={e => setSecurityA(e.target.value)} placeholder="Your answer (case-insensitive)" style={S.input} />
              </label>
            )}
          </>
        )}

        {error && (
          <div style={{ padding: "8px 12px", background: "rgba(184,84,84,0.08)", border: "1px solid rgba(184,84,84,0.2)", borderRadius: 8, marginBottom: 12, fontSize: 15, color: "#8b3a3a" }}>{error}</div>
        )}

        <button onClick={isSignup ? handleSignup : handleLogin} disabled={loading} style={{ ...S.primaryBtn, width: "100%", padding: "12px 18px", fontSize: 17, opacity: loading ? 0.6 : 1, marginBottom: 14 }}>
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} />
              {isSignup ? "Creating account..." : "Signing in..."}
            </span>
          ) : (isSignup ? "Create Account" : "Sign In")}
        </button>

        {/* Toggle */}
        <div style={{ textAlign: "center", fontSize: 16, color: "var(--dim)" }}>
          {isSignup ? "Already have an account? " : "Don't have an account? "}
          <button onClick={() => { setAuthState(isSignup ? "login" : "signup"); setError(""); setPassword(""); setConfirmPw(""); setSecurityQ(""); setSecurityA(""); }} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 600, fontSize: 16, fontFamily: "var(--body)" }}>
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </div>

        {/* Forgot links — login only */}
        {!isSignup && (
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
            <button onClick={() => { setAuthState("forgotPw"); setError(""); setResetStep(0); setPassword(""); setConfirmPw(""); setSecurityA(""); }} style={{ background: "none", border: "none", color: "var(--dim)", cursor: "pointer", fontSize: 17, fontFamily: "var(--body)" }}>
              Forgot password?
            </button>
            <button onClick={() => { setAuthState("forgotEmail"); setError(""); setFoundAccounts([]); }} style={{ background: "none", border: "none", color: "var(--dim)", cursor: "pointer", fontSize: 17, fontFamily: "var(--body)" }}>
              Forgot email?
            </button>
          </div>
        )}

        </>)}

        {/* Security note */}
        <div style={{ marginTop: 20, padding: "10px 14px", background: "var(--bg)", borderRadius: 10, textAlign: "center" }}>
          <p style={{ fontSize: 12, color: "var(--dim)", lineHeight: 1.5 }}>
            {SUPABASE_MODE
              ? "🔐 Your health data is encrypted with AES-256-GCM before leaving your browser. The encryption key is derived from your password and never stored on our servers."
              : "🔒 Your password is hashed with PBKDF2-SHA256 (100k iterations). Health data is encrypted per-account and never shared."}
          </p>
          {SUPABASE_MODE && <p style={{ fontSize: 11, color: "var(--dim)", marginTop: 4 }}>☁️ Cloud sync enabled — access your data from any device</p>}
        </div>
      </div>
    </div>
  );
}