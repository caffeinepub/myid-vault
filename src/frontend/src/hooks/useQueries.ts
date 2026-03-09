import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import { useActor } from "./useActor";
import type { LocalIDCard } from "./useLocalIDStore";

// ─── Photo conversion helpers ────────────────────────────────────────────────

function base64ToExternalBlob(base64: string): ExternalBlob {
  if (!base64) return ExternalBlob.fromBytes(new Uint8Array(0));
  try {
    const b64 = base64.includes(",") ? base64.split(",")[1] : base64;
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return ExternalBlob.fromBytes(bytes);
  } catch {
    return ExternalBlob.fromBytes(new Uint8Array(0));
  }
}

function externalBlobToUrl(blob: ExternalBlob): string {
  try {
    return blob.getDirectURL() || "";
  } catch {
    return "";
  }
}

// ─── Map backend IDCard → LocalIDCard ────────────────────────────────────────

function mapBackendCard(card: import("../backend.d.ts").IDCard): LocalIDCard {
  const timestamp =
    typeof card.timestamp === "bigint"
      ? Number(card.timestamp / 1_000_000n)
      : Date.now();

  if (card.cardType.__kind__ === "collegeStudent") {
    const c = card.cardType.collegeStudent;
    return {
      id: card.id,
      timestamp,
      cardType: {
        __kind__: "collegeStudent",
        collegeStudent: {
          photo: externalBlobToUrl(c.photo),
          fullName: c.fullName,
          dateOfBirth: c.dateOfBirth,
          enrollmentNo: c.enrollmentNo,
          course: c.course,
          branch: c.branch,
          collegeName: c.collegeName,
          academicYear: c.academicYear,
          validUntil: c.validUntil,
        },
      },
    };
  }
  const o = card.cardType.other;
  return {
    id: card.id,
    timestamp,
    cardType: {
      __kind__: "other",
      other: {
        photo: externalBlobToUrl(o.photo),
        fullName: o.fullName,
        idType: o.idType,
        idNumber: o.idNumber,
        dateOfBirth: o.dateOfBirth,
        issueDate: o.issueDate,
        expiryDate: o.expiryDate,
        issuedBy: o.issuedBy,
      },
    },
  };
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useGetAllCards() {
  const { actor, isFetching } = useActor();
  return useQuery<LocalIDCard[]>({
    queryKey: ["cards"],
    queryFn: async () => {
      if (!actor) return [];
      const cards = await actor.getAllCards();
      return cards
        .map(mapBackendCard)
        .sort((a, b) => b.timestamp - a.timestamp);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCard(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<LocalIDCard | undefined>({
    queryKey: ["card", id],
    queryFn: async () => {
      if (!actor) return undefined;
      try {
        const card = await actor.getCard(id);
        return mapBackendCard(card);
      } catch {
        return undefined;
      }
    },
    enabled: !!id && !!actor && !isFetching,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateCollegeID() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      photo: string;
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
        base64ToExternalBlob(params.photo),
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
      photo: string;
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
        base64ToExternalBlob(params.photo),
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
      if (!actor) throw new Error("Not authenticated");
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
    mutationFn: async (params: { id: string; card: LocalIDCard }) => {
      if (!actor) throw new Error("Not authenticated");
      // Build the IDCard object from LocalIDCard
      const { card } = params;
      let backendCard: import("../backend.d.ts").IDCard;
      if (card.cardType.__kind__ === "collegeStudent") {
        const c = card.cardType.collegeStudent;
        backendCard = {
          id: card.id,
          timestamp: BigInt(card.timestamp) * 1_000_000n,
          cardType: {
            __kind__: "collegeStudent",
            collegeStudent: {
              photo: base64ToExternalBlob(c.photo),
              fullName: c.fullName,
              dateOfBirth: c.dateOfBirth,
              enrollmentNo: c.enrollmentNo,
              course: c.course,
              branch: c.branch,
              collegeName: c.collegeName,
              academicYear: c.academicYear,
              validUntil: c.validUntil,
            },
          },
        };
      } else {
        const o = card.cardType.other;
        backendCard = {
          id: card.id,
          timestamp: BigInt(card.timestamp) * 1_000_000n,
          cardType: {
            __kind__: "other",
            other: {
              photo: base64ToExternalBlob(o.photo),
              fullName: o.fullName,
              idType: o.idType,
              idNumber: o.idNumber,
              dateOfBirth: o.dateOfBirth,
              issueDate: o.issueDate,
              expiryDate: o.expiryDate,
              issuedBy: o.issuedBy,
            },
          },
        };
      }
      await actor.updateCard(params.id, backendCard);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["card", variables.id] });
    },
  });
}
