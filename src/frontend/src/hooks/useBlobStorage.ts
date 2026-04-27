import { HttpAgent } from "@icp-sdk/core/agent";
import { useCallback, useState } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

export type UploadProgress = number; // 0–100

export function useBlobUpload() {
  const [progress, setProgress] = useState<UploadProgress>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { identity } = useInternetIdentity();

  const upload = useCallback(
    async (file: File): Promise<string> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        const config = await loadConfig();

        const agent = await HttpAgent.create({
          host: config.backend_host,
          ...(identity ? { identity } : {}),
        });

        const storageClient = new StorageClient(
          config.bucket_name,
          config.storage_gateway_url,
          config.backend_canister_id,
          config.project_id,
          agent,
        );

        const fileBytes = new Uint8Array(await file.arrayBuffer());

        const { hash } = await storageClient.putFile(fileBytes, (pct) =>
          setProgress(pct),
        );

        const directUrl = await storageClient.getDirectURL(hash);
        setProgress(100);
        return directUrl;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Upload fehlgeschlagen";
        setError(message);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [identity],
  );

  const reset = useCallback(() => {
    setProgress(0);
    setIsUploading(false);
    setError(null);
  }, []);

  return { upload, progress, isUploading, error, reset };
}
