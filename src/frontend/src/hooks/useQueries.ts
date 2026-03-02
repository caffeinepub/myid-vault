import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LocalIDCard } from "./useLocalIDStore";
import { useLocalIDStore } from "./useLocalIDStore";

export function useGetAllCards() {
  const store = useLocalIDStore();
  return useQuery<LocalIDCard[]>({
    queryKey: ["cards", store.username],
    queryFn: () => store.getAllCards(),
  });
}

export function useGetCard(id: string) {
  const store = useLocalIDStore();
  return useQuery<LocalIDCard | undefined>({
    queryKey: ["card", store.username, id],
    queryFn: () => store.getCard(id),
    enabled: !!id,
  });
}

export function useCreateCollegeID() {
  const store = useLocalIDStore();
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
      const card: LocalIDCard = {
        id: params.id,
        timestamp: Date.now(),
        cardType: {
          __kind__: "collegeStudent",
          collegeStudent: {
            photo: params.photo,
            fullName: params.fullName,
            dateOfBirth: params.dateOfBirth,
            enrollmentNo: params.enrollmentNo,
            course: params.course,
            branch: params.branch,
            collegeName: params.collegeName,
            academicYear: params.academicYear,
            validUntil: params.validUntil,
          },
        },
      };
      store.saveCard(card);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });
}

export function useCreateOtherID() {
  const store = useLocalIDStore();
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
      const card: LocalIDCard = {
        id: params.id,
        timestamp: Date.now(),
        cardType: {
          __kind__: "other",
          other: {
            photo: params.photo,
            fullName: params.fullName,
            idType: params.idType,
            idNumber: params.idNumber,
            dateOfBirth: params.dateOfBirth,
            issueDate: params.issueDate,
            expiryDate: params.expiryDate,
            issuedBy: params.issuedBy,
          },
        },
      };
      store.saveCard(card);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });
}

export function useDeleteCard() {
  const store = useLocalIDStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      store.deleteCard(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });
}

export function useUpdateCard() {
  const store = useLocalIDStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; card: LocalIDCard }) => {
      store.updateCard(params.id, params.card);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cards"] });
      queryClient.invalidateQueries({ queryKey: ["card"] });
      queryClient.invalidateQueries({
        queryKey: ["card", variables.id],
      });
    },
  });
}
