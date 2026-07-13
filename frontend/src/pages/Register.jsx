import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { RotatingBrand } from "../components/RotatingBrand";

export default function Register() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try { await register(name, email, password); navigate("/"); }
    catch (e2) { setErr(e2?.response?.data?.detail || "Could not create account."); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-5 py-20">
      <p className="label text-orient-deep">Join</p>
      <h1 className="mt-3 text-4xl tracking-tight sm:text-5xl">
        <RotatingBrand />
      </h1>
      <p className="mt-4 text-sm text-ink-soft">Integration space — for what comes after an experience. Never a source of access.</p>

      <div className="mt-8">
        <button onClick={googleLogin} data-testid="google-register-btn"
          className="flex w-full items-center justify-center gap-3 border border-line bg-white py-3 text-sm font-medium text-ink transition-colors hover:border-orient">
          <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.7 1.22 9.2 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Continue with Google
        </button>
      </div>
      <div className="my-6 flex items-center gap-4 text-ink-soft/60"><span className="h-px flex-1 bg-line" /><span className="label">or</span><span className="h-px flex-1 bg-line" /></div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="label text-ink-soft">Name</span>
          <input data-testid="register-name" required value={name} onChange={(e) => setName(e.target.value)}
            className="border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orient" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="label text-ink-soft">Email</span>
          <input data-testid="register-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-orient" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="label text-ink-soft">Password <span className="normal-case tracking-normal text-ink-soft/70">(8+ characters)</span></span>
          <div className="relative">
            <input data-testid="register-password" type={showPw ? "text" : "password"} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-line bg-white px-3.5 py-2.5 pr-10 text-sm outline-none focus:border-orient" />
            <button type="button" onClick={() => setShowPw((v) => !v)} data-testid="toggle-password"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink" aria-label={showPw ? "Hide password" : "Show password"}>
              {showPw ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
            </button>
          </div>
        </label>
        {err && <p className="text-sm text-clay" data-testid="register-error">{err}</p>}
        <button type="submit" disabled={busy} data-testid="register-submit"
          className="mt-1 bg-ink py-3 text-sm font-medium text-canvas transition-colors hover:bg-ink/90 disabled:opacity-60">
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        Already have an account? <Link to="/login" className="text-orient-deep underline underline-offset-4">Sign in</Link>
      </p>
    </div>
  );
}
