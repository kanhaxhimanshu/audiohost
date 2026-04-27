import { Toaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="waveform-bars">
            <div className="waveform-bar" />
            <div className="waveform-bar" />
            <div className="waveform-bar" />
            <div className="waveform-bar" />
            <div className="waveform-bar" />
            <div className="waveform-bar" />
            <div className="waveform-bar" />
          </div>
          <p className="font-mono text-sm text-muted-foreground tracking-widest uppercase">
            Loading…
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? <DashboardPage /> : <LoginPage />}
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          classNames: {
            toast: "bg-card border-border text-foreground font-sans text-sm",
            title: "font-semibold",
            description: "text-muted-foreground",
          },
        }}
      />
    </>
  );
}
