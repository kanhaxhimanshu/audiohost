import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Music2, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { AudioFile } from "../backend.d";
import { useGetMyAudioFiles } from "../hooks/useQueries";
import AudioCard from "./AudioCard";

type SortKey =
  | "date_desc"
  | "date_asc"
  | "name_asc"
  | "name_desc"
  | "size_desc"
  | "size_asc";

function AudioCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded-lg bg-muted/60" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3 bg-muted/60" />
          <Skeleton className="h-3 w-1/3 bg-muted/40" />
        </div>
      </div>
      <Skeleton className="h-9 w-full rounded-md bg-muted/40" />
      <div className="flex gap-2">
        <Skeleton className="h-8 flex-1 bg-muted/40" />
        <Skeleton className="h-8 w-16 bg-muted/40" />
      </div>
    </div>
  );
}

function sortFiles(files: AudioFile[], sortKey: SortKey): AudioFile[] {
  return [...files].sort((a, b) => {
    switch (sortKey) {
      case "date_desc":
        return Number(b.uploadDate) - Number(a.uploadDate);
      case "date_asc":
        return Number(a.uploadDate) - Number(b.uploadDate);
      case "name_asc":
        return a.name.localeCompare(b.name, "en");
      case "name_desc":
        return b.name.localeCompare(a.name, "en");
      case "size_desc":
        return Number(b.fileSize) - Number(a.fileSize);
      case "size_asc":
        return Number(a.fileSize) - Number(b.fileSize);
    }
  });
}

export default function AudioList() {
  const { data: files, isLoading, isError, error } = useGetMyAudioFiles();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date_desc");

  const processedFiles = useMemo(() => {
    if (!files) return [];
    const filtered = searchQuery.trim()
      ? files.filter((f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : files;
    return sortFiles(filtered, sortKey);
  }, [files, searchQuery, sortKey]);

  if (isLoading) {
    return (
      <div
        data-ocid="audiolist.loading_state"
        className="grid gap-4 sm:grid-cols-1 lg:grid-cols-1"
      >
        <AudioCardSkeleton key="sk1" />
        <AudioCardSkeleton key="sk2" />
        <AudioCardSkeleton key="sk3" />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-ocid="audiolist.error_state"
        className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center"
      >
        <p className="text-sm text-destructive font-medium">
          Failed to load files
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <motion.div
        data-ocid="audiolist.empty_state"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted/30">
          <Music2 className="h-8 w-8 text-muted-foreground/60" />
        </div>
        <h3 className="mt-4 font-display text-base font-semibold text-foreground">
          No files yet
        </h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground leading-relaxed">
          Upload your first audio file to get a direct link.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search + Sort controls */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            data-ocid="audiolist.search_input"
            type="search"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm bg-background/60 border-border focus-visible:ring-primary/30 placeholder:text-muted-foreground/60"
            aria-label="Search files"
          />
        </div>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger
            data-ocid="audiolist.sort_select"
            className="h-8 w-[160px] shrink-0 text-xs bg-background/60 border-border focus:ring-primary/30"
            aria-label="Choose sort order"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border text-sm">
            <SelectItem value="date_desc">Newest first</SelectItem>
            <SelectItem value="date_asc">Oldest first</SelectItem>
            <SelectItem value="name_asc">Name A–Z</SelectItem>
            <SelectItem value="name_desc">Name Z–A</SelectItem>
            <SelectItem value="size_desc">Largest first</SelectItem>
            <SelectItem value="size_asc">Smallest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* File count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {searchQuery.trim() ? (
            <>
              <span className="font-mono font-medium text-foreground">
                {processedFiles.length}
              </span>{" "}
              of{" "}
              <span className="font-mono font-medium text-foreground">
                {files.length}
              </span>{" "}
              {files.length === 1 ? "file" : "files"}
            </>
          ) : (
            <>
              <span className="font-mono font-medium text-foreground">
                {files.length}
              </span>{" "}
              {files.length === 1 ? "file" : "files"}
            </>
          )}
        </p>
      </div>

      {/* Empty search result */}
      {processedFiles.length === 0 && searchQuery.trim() ? (
        <motion.div
          data-ocid="audiolist.empty_state"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center"
        >
          <Search className="h-8 w-8 text-muted-foreground/40" />
          <p className="mt-3 text-sm font-medium text-foreground">
            No files found
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            No results for &ldquo;{searchQuery}&rdquo;
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {processedFiles.map((file, i) => (
              <AudioCard key={file.id} file={file} index={i} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
