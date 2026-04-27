import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, Database, LogOut, Music2, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import AudioList from "../components/AudioList";
import AudioUploader from "../components/AudioUploader";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetMyAudioFiles } from "../hooks/useQueries";

const STORAGE_MAX_BYTES = 500 * 1024 * 1024; // 500 MB display cap

function formatStorageBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function DashboardPage() {
  const { identity, clear } = useInternetIdentity();
  const [showUpload, setShowUpload] = useState(true);
  const { data: audioFiles } = useGetMyAudioFiles();

  const principalShort = identity
    ? `${identity.getPrincipal().toString().slice(0, 10)}…`
    : "";

  const totalBytes =
    audioFiles && audioFiles.length > 0
      ? audioFiles.reduce((sum, f) => sum + Number(f.fileSize), 0)
      : 0;
  const storagePercent = Math.min((totalBytes / STORAGE_MAX_BYTES) * 100, 100);

  return (
    <div className="relative min-h-screen bg-background">
      {/* Subtle background mesh */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 10% 10%, oklch(0.78 0.18 195 / 0.04) 0%, transparent 50%),
            radial-gradient(ellipse 40% 60% at 90% 90%, oklch(0.65 0.2 290 / 0.03) 0%, transparent 50%)
          `,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Music2 className="h-4 w-4 text-primary" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              AudioHost
            </span>
          </div>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 h-8"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
                  <User className="h-3 w-3 text-primary" />
                </div>
                <span className="hidden font-mono text-xs sm:block">
                  {principalShort}
                </span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-card border-border"
            >
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground">Signed in as</p>
                <p className="mt-0.5 font-mono text-xs text-foreground truncate">
                  {identity?.getPrincipal().toString()}
                </p>
              </div>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                data-ocid="header.logout_button"
                onClick={clear}
                className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            My Audio Files
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload any audio file and instantly get a direct link.
          </p>
        </motion.div>

        {/* Upload section */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
          aria-labelledby="upload-heading"
        >
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Section header */}
            <button
              type="button"
              onClick={() => setShowUpload((v) => !v)}
              className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/20 transition-colors"
              aria-expanded={showUpload}
              aria-controls="upload-panel"
            >
              <div>
                <h2
                  id="upload-heading"
                  className="font-display text-base font-semibold text-foreground"
                >
                  Upload a file
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  All audio formats · Max. 50 MB recommended
                </p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  showUpload ? "rotate-180" : ""
                }`}
              />
            </button>

            {showUpload && (
              <div id="upload-panel">
                <Separator className="bg-border" />
                <div className="p-5">
                  <AudioUploader />
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* Storage usage panel */}
        {audioFiles && audioFiles.length > 0 && (
          <motion.div
            data-ocid="dashboard.storage_panel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mb-6 flex items-center gap-3 rounded-lg border border-border bg-card/50 px-4 py-2.5"
          >
            <Database className="h-3.5 w-3.5 shrink-0 text-primary/70" />
            <div className="flex flex-1 items-center gap-3 min-w-0">
              <span className="shrink-0 text-xs text-muted-foreground">
                <span className="font-mono font-medium text-foreground">
                  {formatStorageBytes(totalBytes)}
                </span>
                {" / unlimited"}
              </span>
              <div className="flex-1 min-w-0 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/70 transition-all duration-500"
                  style={{ width: `${storagePercent}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Files list */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          aria-labelledby="files-heading"
        >
          <div className="mb-4 flex items-center gap-3">
            <h2
              id="files-heading"
              className="font-display text-xl font-semibold text-foreground"
            >
              Uploaded Files
            </h2>
            {/* Decorative waveform */}
            <div className="waveform-bars waveform-static hidden sm:flex">
              <div className="waveform-bar" />
              <div className="waveform-bar" />
              <div className="waveform-bar" />
              <div className="waveform-bar" />
              <div className="waveform-bar" />
              <div className="waveform-bar" />
              <div className="waveform-bar" />
            </div>
          </div>
          <AudioList />
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border mt-16 py-6 text-center text-xs text-muted-foreground">
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
