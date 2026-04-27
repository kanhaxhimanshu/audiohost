import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Check,
  CheckCheck,
  Copy,
  ExternalLink,
  FileAudio,
  HardDrive,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { AudioFile } from "../backend.d";
import { useDeleteAudio, useRenameAudio } from "../hooks/useQueries";

interface AudioCardProps {
  file: AudioFile;
  index: number;
}

function formatBytes(bytes: bigint): string {
  const n = Number(bytes);
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(nanos: bigint): string {
  const ms = Number(nanos / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFormatLabel(mimeType: string): string {
  const map: Record<string, string> = {
    "audio/mpeg": "MP3",
    "audio/ogg": "OGG",
    "audio/wav": "WAV",
    "audio/x-wav": "WAV",
    "audio/wave": "WAV",
    "audio/flac": "FLAC",
    "audio/x-flac": "FLAC",
    "audio/aac": "AAC",
    "audio/mp4": "M4A",
    "audio/x-m4a": "M4A",
    "audio/webm": "WEBM",
    "audio/opus": "OPUS",
    "audio/x-ms-wma": "WMA",
    "audio/aiff": "AIFF",
    "audio/x-aiff": "AIFF",
  };
  return map[mimeType] ?? mimeType.split("/")[1]?.toUpperCase() ?? "AUDIO";
}

export default function AudioCard({ file, index }: AudioCardProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(file.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const deleteAudio = useDeleteAudio();
  const renameAudio = useRenameAudio();

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(file.blob);
      setCopied(true);
      toast.success("Link copied!", {
        description: file.name,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed", {
        description: "Please copy the link manually.",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAudio.mutateAsync(file.id);
      toast.success("File deleted", { description: file.name });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      toast.error("Error deleting file", { description: msg });
    }
  };

  const handleStartEdit = () => {
    setEditName(file.name);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditName(file.name);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    const trimmed = editName.trim();
    if (!trimmed) {
      toast.error("Name cannot be empty");
      return;
    }
    if (trimmed === file.name) {
      setIsEditing(false);
      return;
    }
    try {
      await renameAudio.mutateAsync({ id: file.id, newName: trimmed });
      toast.success("File renamed", {
        description: `"${file.name}" → "${trimmed}"`,
      });
      setIsEditing(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Rename failed";
      toast.error("Error renaming file", { description: msg });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const ocidIndex = index + 1;

  return (
    <motion.article
      data-ocid={`audiolist.item.${ocidIndex}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 transition-all duration-200 hover:shadow-glow-teal"
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* File icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40 group-hover:border-primary/30 transition-colors">
            <FileAudio className="h-5 w-5 text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            {/* Filename — normal view or edit mode */}
            {isEditing ? (
              <div className="flex items-center gap-1.5">
                <Input
                  ref={inputRef}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-7 font-display font-semibold text-sm bg-background/60 border-primary/40 focus-visible:ring-primary/30 px-2 py-1"
                  aria-label="Edit file name"
                  disabled={renameAudio.isPending}
                />
                <Button
                  data-ocid={`audiolist.save_button.${ocidIndex}`}
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-primary hover:bg-primary/10"
                  onClick={() => void handleSaveEdit()}
                  disabled={renameAudio.isPending}
                  aria-label="Save rename"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  data-ocid={`audiolist.cancel_button.${ocidIndex}`}
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  onClick={handleCancelEdit}
                  disabled={renameAudio.isPending}
                  aria-label="Cancel rename"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0">
                <h3
                  className="truncate font-display font-semibold text-foreground text-sm leading-tight"
                  title={file.name}
                >
                  {file.name}
                </h3>
                <Button
                  data-ocid={`audiolist.edit_button.${ocidIndex}`}
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground/50 hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-all"
                  onClick={handleStartEdit}
                  aria-label={`Rename ${file.name}`}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
            )}

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <Badge
                variant="outline"
                className="h-5 border-primary/30 bg-primary/10 text-primary px-2 font-mono text-[10px] tracking-wider"
              >
                {getFormatLabel(file.mimeType)}
              </Badge>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                <HardDrive className="h-3 w-3" />
                {formatBytes(file.fileSize)}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(file.uploadDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Delete button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              data-ocid={`audiolist.delete_button.${ocidIndex}`}
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              disabled={deleteAudio.isPending}
              aria-label={`Delete ${file.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            data-ocid="audiolist.dialog"
            className="bg-card border-border"
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-foreground">
                Delete file?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                <span className="font-medium text-foreground">
                  &ldquo;{file.name}&rdquo;
                </span>{" "}
                will be permanently deleted. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                data-ocid="audiolist.cancel_button"
                className="border-border hover:bg-muted"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                data-ocid="audiolist.confirm_button"
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Audio player */}
      <div className="px-4 pb-3">
        {/* biome-ignore lint/a11y/useMediaCaption: audio files uploaded by user, captions not applicable */}
        <audio
          controls
          preload="metadata"
          className="w-full"
          aria-label={`Play audio: ${file.name}`}
        >
          <source src={file.blob} type={file.mimeType} />
          Your browser does not support the audio element.
        </audio>
      </div>

      {/* Link section */}
      <div className="border-t border-border/60 bg-muted/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="flex-1 min-w-0 rounded-md border border-border/60 bg-background/60 px-3 py-1.5"
            title={file.blob}
          >
            <p className="truncate font-mono text-xs text-muted-foreground">
              {file.blob}
            </p>
          </div>

          <Button
            data-ocid={`audiolist.copy_button.${ocidIndex}`}
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className={cn(
              "shrink-0 gap-1.5 border-border text-xs font-medium transition-all",
              copied
                ? "border-primary/50 bg-primary/10 text-primary"
                : "hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
            )}
            aria-label={`Copy link for ${file.name}`}
          >
            {copied ? (
              <>
                <CheckCheck className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Link
              </>
            )}
          </Button>

          <a
            href={file.blob}
            target="_blank"
            rel="noopener noreferrer"
            title="Open link"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
            aria-label={`Open ${file.name} directly`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
