import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, FileAudio, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useBlobUpload } from "../hooks/useBlobStorage";
import { useUploadAudio } from "../hooks/useQueries";

const ACCEPTED_TYPES = [
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/flac",
  "audio/x-flac",
  "audio/aac",
  "audio/mp4",
  "audio/x-m4a",
  "audio/webm",
  "audio/opus",
  "audio/x-ms-wma",
  "audio/aiff",
  "audio/x-aiff",
  "video/mpeg",
];
const ACCEPTED_EXT = [
  ".mp3",
  ".ogg",
  ".wav",
  ".flac",
  ".aac",
  ".m4a",
  ".webm",
  ".opus",
  ".wma",
  ".aiff",
  ".aif",
  ".mpg",
  ".mpeg",
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AudioUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [typeError, setTypeError] = useState<string | null>(null);
  const [uploadDone, setUploadDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    upload,
    progress,
    isUploading,
    error: blobError,
    reset: resetBlob,
  } = useBlobUpload();
  const uploadAudio = useUploadAudio();

  const validateFile = useCallback((file: File): boolean => {
    const isValidType =
      ACCEPTED_TYPES.includes(file.type) ||
      ACCEPTED_EXT.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!isValidType) {
      setTypeError(
        `Unsupported format: "${file.type || file.name}". Please upload an audio file (MP3, OGG, WAV, FLAC, AAC, M4A, etc.).`,
      );
      return false;
    }
    setTypeError(null);
    return true;
  }, []);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!validateFile(file)) return;
      setSelectedFile(file);
      setUploadDone(false);
      resetBlob();
    },
    [validateFile, resetBlob],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const exclusiveUrl = await upload(selectedFile);
      await uploadAudio.mutateAsync({
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        exclusiveUrl,
        fileSize: BigInt(selectedFile.size),
      });
      setUploadDone(true);
      setSelectedFile(null);
      toast.success("File uploaded successfully!", {
        description: selectedFile.name,
      });
      setTimeout(() => {
        setUploadDone(false);
        resetBlob();
      }, 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error("Upload failed", { description: msg });
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setTypeError(null);
    setUploadDone(false);
    resetBlob();
  };

  const isDisabled = isUploading || uploadAudio.isPending;

  return (
    <div className="w-full">
      {/* Drop zone — using a label wrapping file input for semantic correctness */}
      <label
        data-ocid="upload.dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-4",
          "rounded-xl border-2 border-dashed transition-all duration-200",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
          isDragging
            ? "border-primary bg-primary/5 glow-teal"
            : selectedFile
              ? "border-primary/40 bg-primary/5"
              : "border-border bg-card hover:border-primary/40 hover:bg-primary/[0.03]",
          isDisabled && "pointer-events-none opacity-60",
        )}
        aria-label="Upload audio file — all formats supported"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXT.join(",")}
          className="sr-only"
          onChange={handleInputChange}
          disabled={isDisabled}
        />

        <AnimatePresence mode="wait">
          {uploadDone ? (
            <motion.div
              key="done"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <p className="text-sm font-medium text-primary">
                Upload complete
              </p>
            </motion.div>
          ) : selectedFile ? (
            <motion.div
              key="file-selected"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 px-4 text-center"
            >
              <FileAudio className="h-8 w-8 text-primary" />
              <p className="max-w-xs truncate text-sm font-medium text-foreground">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(selectedFile.size)} ·{" "}
                {selectedFile.name.split(".").pop()?.toUpperCase() ?? "AUDIO"}
              </p>
              {!isDisabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleClearFile();
                  }}
                  className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Remove file selection"
                >
                  <X className="h-3 w-3" />
                  Remove
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 px-4 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-muted/40">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drop a file here or click to browse
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  MP3, OGG, WAV, FLAC, AAC, M4A and more (max. 50 MB
                  recommended)
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </label>

      {/* Type error */}
      <AnimatePresence>
        {typeError && (
          <motion.div
            data-ocid="upload.error_state"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{typeError}</span>
          </motion.div>
        )}
        {blobError && !typeError && (
          <motion.div
            data-ocid="upload.error_state"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{blobError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <AnimatePresence>
        {isDisabled && (
          <motion.div
            data-ocid="upload.loading_state"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-mono">
                {uploadAudio.isPending
                  ? "Registering file…"
                  : `Uploading… ${Math.round(progress)}%`}
              </span>
              <span className="text-xs font-mono text-primary">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress
              value={uploadAudio.isPending ? 100 : progress}
              className="h-1.5 bg-muted"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload button */}
      <AnimatePresence>
        {selectedFile && !isDisabled && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="mt-4"
          >
            <Button
              data-ocid="upload.upload_button"
              onClick={handleUpload}
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-teal-sm h-11 font-semibold font-display tracking-wide"
            >
              <Upload className="h-4 w-4" />
              Upload now
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
