import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob, type IDCard } from "../backend";
import { incrementIdCount } from "../lib/storage";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

const EMPTY_PHOTO = ExternalBlob.fromURL(
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
);

export function useGetAllCards() {
  const { actor, isFetching } = useActor();
  return useQuery<IDCard[]>({
    queryKey: ["cards"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCards();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useGetCard(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<IDCard | null>({
    queryKey: ["card", id],
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getCard(id);
    },
    enabled: !!actor && !isFetching && !!id,
    staleTime: 60_000,
  });
}

export function useGetProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.saveCallerUserProfile({ name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useCreateCollegeID() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
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
      if (!actor) throw new Error("Not authenticated");
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
      const principal = identity?.getPrincipal().toText();
      if (principal) incrementIdCount(principal, 1);
    },
  });
}

export function useCreateOtherID() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
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
      if (!actor) throw new Error("Not authenticated");
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
      const principal = identity?.getPrincipal().toText();
      if (principal) incrementIdCount(principal, 1);
    },
  });
}

export function useDeleteCard() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.deleteCard(id);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.removeQueries({ queryKey: ["card", id] });
      const principal = identity?.getPrincipal().toText();
      if (principal) incrementIdCount(principal, -1);
    },
  });
}

export function useUpdateCard() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; card: IDCard }) => {
      if (!actor) throw new Error("Not authenticated");
      await actor.updateCard(params.id, params.card);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["card", variables.id] });
    },
  });
}

export { EMPTY_PHOTO };
