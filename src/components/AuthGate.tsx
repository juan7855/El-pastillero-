import React from "react";
import { useAuth } from "../lib/auth";
import { MascotHead } from "./Mascot";

const Frame: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative grid h-[100dvh] w-full place-items-center overflow-hidden bg-[#060607] px-4">
    <div className="vignette" />
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(60% 45% at 50% 40%, rgb(var(--accent) / .10), transparent 70%), radial-gradient(40% 30% at 12% 8%, rgba(255,255,255,.06), transparent 70%)",
      }}
    />
    <div className="relative z-10 w-full max-w-[26rem]">{children}</div>
    <div className="pointer-events-none absolute inset-0 z-20">
      <div className="scanlines" />
      <div className="grain" />
    </div>
  </div>
);

const Heading: React.FC<{ sub: string }> = ({ sub }) => (
  <div className="text-center">
    <MascotHead idSuffix="auth" className="mx-auto h-20 w-20" />
    <h1 className="chrome-text mt-4 font-display text-2xl uppercase leading-none tracking-tight sm:text-3xl">
      y2k street hub
    </h1>
    <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.36em] text-white/35">{sub}</p>
  </div>
);

/** Pantalla de ayuda cuando faltan las variables de entorno de Supabase. */
export const SetupNeeded: React.FC = () => (
  <Frame>
    <Heading sub="falta configuración" />
    <div className="chrome-frame mt-6 p-5 text-sm leading-relaxed text-white/70">
      <p>
        No encuentro las credenciales de Supabase. Definí estas dos variables y volvé a construir la
        app:
      </p>
      <pre className="y2k-scroll mt-3 overflow-x-auto rounded-xl bg-black/60 p-3 text-[11px] text-[rgb(var(--accent))]">
        VITE_SUPABASE_URL{"\n"}VITE_SUPABASE_ANON_KEY
      </pre>
      <p className="mt-3 text-xs text-white/45">
        En local van en <code className="text-white/70">.env.local</code>. En Vercel, en Settings &gt;
        Environment Variables (y después redeploy).
      </p>
    </div>
  </Frame>
);

const Booting: React.FC = () => (
  <Frame>
    <Heading sub="restaurando sesión" />
  </Frame>
);

type Mode = "signin" | "signup";

const LoginScreen: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = React.useState<Mode>("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setNotice(null);

    if (password.length < 6) {
      setError("La contraseña necesita al menos 6 caracteres.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
      } else {
        const { needsConfirmation } = await signUp(email.trim(), password);
        if (needsConfirmation) {
          setNotice("Cuenta creada. Revisá tu mail para confirmarla y después entrá.");
          setMode("signin");
          setPassword("");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo salió mal. Probá de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  const swap = () => {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    setError(null);
    setNotice(null);
  };

  return (
    <Frame>
      <Heading sub={mode === "signin" ? "acceso de operador" : "alta de operador"} />

      <form onSubmit={submit} className="chrome-frame mt-6 p-5">
        <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">
          email
        </label>
        <input
          className="y2k-input mt-2"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="operador@mail.com"
        />

        <label className="mt-4 block text-[9px] font-bold uppercase tracking-[0.3em] text-white/40">
          contraseña
        </label>
        <input
          className="y2k-input mt-2"
          type="password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="mínimo 6 caracteres"
        />

        {error && (
          <p className="mt-4 rounded-xl bg-[#ff3e48]/12 px-3 py-2 text-xs text-[#ff8a90]">{error}</p>
        )}
        {notice && (
          <p className="mt-4 rounded-xl bg-[rgb(var(--accent))]/12 px-3 py-2 text-xs text-[rgb(var(--accent))]">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="y2k-btn mt-5 w-full py-3 text-xs disabled:opacity-50"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,.5), 0 0 0 1px rgb(var(--accent) / .5), 0 0 22px rgb(var(--accent) / .28)" }}
        >
          {busy ? "conectando…" : mode === "signin" ? "entrar" : "crear cuenta"}
        </button>

        <button
          type="button"
          onClick={swap}
          className="mt-4 w-full text-[10px] font-bold uppercase tracking-[0.24em] text-white/40 transition-colors hover:text-[rgb(var(--accent))]"
        >
          {mode === "signin" ? "no tengo cuenta · registrarme" : "ya tengo cuenta · entrar"}
        </button>
      </form>

      <p className="mt-4 text-center text-[9px] uppercase tracking-[0.28em] text-white/25">
        tus datos quedan atados a tu cuenta
      </p>
    </Frame>
  );
};

/** Deja pasar a la app solo con sesión activa. */
export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth();
  if (loading) return <Booting />;
  if (!session) return <LoginScreen />;
  return <>{children}</>;
};
