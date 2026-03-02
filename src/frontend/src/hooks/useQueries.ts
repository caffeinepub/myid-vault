import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExternalBlob } from "../backend";
import type { IDCard } from "../backend.d.ts";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// ─── User Profile (local storage per principal) ───────────────────

export interface UserProfile {
  name: string;
}

function profileKey(principal: string) {
  return `myid-vault-profile:${principal}`;
}

function loadProfile(principal: string): UserProfile | null {
  try {
    const raw = localStorage.getItem(profileKey(principal));
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

function saveProfileToStorage(principal: string, profile: UserProfile): void {
  localStorage.setItem(profileKey(principal), JSON.stringify(profile));
}

export function useGetCallerUserProfile() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString() ?? null;

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile", principal],
    queryFn: () => {
      if (!principal) return null;
      return loadProfile(principal);
    },
    enabled: !!principal,
    staleTime: Number.POSITIVE_INFINITY,
  });

  return {
    ...query,
    isLoading: !principal || query.isLoading,
    isFetched: !!principal && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      const principal = identity?.getPrincipal().toString();
      if (!principal) throw new Error("Not authenticated");
      saveProfileToStorage(principal, profile);
      return profile;
    },
    onSuccess: (_data, _vars) => {
      const principal = identity?.getPrincipal().toString();
      queryClient.invalidateQueries({
        queryKey: ["currentUserProfile", principal],
      });
    },
  });
}

export function useGetAllCards() {
  const { actor, isFetching } = useActor();
  return useQuery<IDCard[]>({
    queryKey: ["cards"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCards();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCard(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<IDCard>({
    queryKey: ["card", id],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getCard(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateCollegeID() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      photo: ExternalBlob;
      fullName: string;
      dateOfBirth: string;
      enrollmentNo: string;
      course: string;
      branch: string;
      collegeName: string;
      academicYear: string;
      validUntil: string;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.createCollegeID(
        params.id,
        params.photo,
        params.fullName,
        params.dateOfBirth,
        params.enrollmentNo,
        params.course,
        params.branch,
        params.collegeName,
        params.academicYear,
        params.validUntil,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });
}

export function useCreateOtherID() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      photo: ExternalBlob;
      fullName: string;
      idType: string;
      idNumber: string;
      dateOfBirth: string;
      issueDate: string;
      expiryDate: string;
      issuedBy: string;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.createOtherID(
        params.id,
        params.photo,
        params.fullName,
        params.idType,
        params.idNumber,
        params.dateOfBirth,
        params.issueDate,
        params.expiryDate,
        params.issuedBy,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });
}

export function useDeleteCard() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      await actor.deleteCard(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });
}

export function useUpdateCard() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; card: IDCard }) => {
      if (!actor) throw new Error("No actor");
      await actor.updateCard(params.id, params.card);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["card", variables.id] });
    },
  });
}
