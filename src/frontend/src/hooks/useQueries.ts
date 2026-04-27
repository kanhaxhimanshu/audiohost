import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AudioFile } from "../backend.d";
import { useActor } from "./useActor";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const queryKeys = {
  audioFiles: ["audioFiles"] as const,
};

// ─── Audio Files Query ────────────────────────────────────────────────────────

export function useGetMyAudioFiles() {
  const { actor, isFetching } = useActor();
  return useQuery<AudioFile[]>({
    queryKey: queryKeys.audioFiles,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyAudioFiles();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Upload Audio Mutation ────────────────────────────────────────────────────

export function useUploadAudio() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fileName,
      mimeType,
      exclusiveUrl,
      fileSize,
    }: {
      fileName: string;
      mimeType: string;
      exclusiveUrl: string;
      fileSize: bigint;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      const id = await actor.uploadAudio(
        fileName,
        mimeType,
        exclusiveUrl,
        fileSize,
      );
      return id;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.audioFiles });
    },
  });
}

// ─── Delete Audio Mutation ────────────────────────────────────────────────────

export function useDeleteAudio() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.deleteAudio(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.audioFiles });
    },
  });
}

// ─── Rename Audio Mutation ────────────────────────────────────────────────────

export function useRenameAudio() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, newName }: { id: string; newName: string }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.renameAudio(id, newName);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.audioFiles });
    },
  });
}
