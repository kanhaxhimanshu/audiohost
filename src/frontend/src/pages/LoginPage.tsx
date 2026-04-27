import { Button } from "@/components/ui/button";
import { Loader2, Music2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn, isLoginError, loginError } =
    useInternetIdentity();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      {/* Background mesh gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 20% 20%, oklch(0.78 0.18 195 / 0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 70% at 80% 80%, oklch(0.65 0.2 290 / 0.05) 0%, transparent 60%)
          `,
        }}
      />

      {/* Grid lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.94 0.006 240) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.94 0.006 240) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Main content */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex w-full max-w-sm flex-col items-center text-center"
        >
          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/30 bg-card glow-teal"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.17 0.01 240), oklch(0.22 0.02 195))",
                }}
              >
                <Music2 className="h-9 w-9 text-primary" />
              </div>
              {/* Decorative ring */}
              <div className="absolute -inset-2 rounded-3xl border border-primary/10" />
            </div>

            {/* Waveform decoration */}
            <div className="waveform-bars">
              <div className="waveform-bar" />
              <div className="waveform-bar" />
              <div className="waveform-bar" />
              <div className="waveform-bar" />
              <div className="waveform-bar" />
              <div className="waveform-bar" />
              <div className="waveform-bar" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="font-display text-5xl font-bold tracking-tight text-foreground text-glow">
              AudioHost
            </h1>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              Upload your audio files and get a direct link —
              <br className="hidden sm:block" /> ready to embed in any app.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-8 flex w-full flex-col gap-2"
          >
            {[
              { icon: "🎵", label: "All audio formats supported" },
              { icon: "🔗", label: "Unique direct link per file" },
              { icon: "🔒", label: "Your own account, private files" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 px-4 py-2.5 text-sm text-muted-foreground"
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Login Button */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 w-full"
          >
            <Button
              data-ocid="login.primary_button"
              className="w-full gap-2.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-teal h-12 text-base font-semibold font-display tracking-wide"
              onClick={login}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {isLoggingIn ? "Signing in…" : "Sign in with Internet Identity"}
            </Button>

            {isLoginError && (
              <p
                data-ocid="login.error_state"
                className="mt-3 text-sm text-destructive text-center"
              >
                {loginError?.message ?? "Login failed. Please try again."}
              </p>
            )}
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          Built with ♥ using caffeine.ai
        </a>
      </footer>
    </div>
  );
}
