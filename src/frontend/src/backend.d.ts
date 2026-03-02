import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface IDCard {
    id: string;
    cardType: IDType;
    timestamp: Time;
}
export type Time = bigint;
export interface OtherID {
    issueDate: string;
    dateOfBirth: string;
    expiryDate: string;
    fullName: string;
    idNumber: string;
    issuedBy: string;
    photo: ExternalBlob;
    idType: string;
}
export interface CollegeStudentID {
    branch: string;
    enrollmentNo: string;
    dateOfBirth: string;
    collegeName: string;
    fullName: string;
    academicYear: string;
    photo: ExternalBlob;
    course: string;
    validUntil: string;
}
export type IDType = {
    __kind__: "other";
    other: OtherID;
} | {
    __kind__: "collegeStudent";
    collegeStudent: CollegeStudentID;
};
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCollegeID(id: string, photo: ExternalBlob, fullName: string, dateOfBirth: string, enrollmentNo: string, course: string, branch: string, collegeName: string, academicYear: string, validUntil: string): Promise<void>;
    createOtherID(id: string, photo: ExternalBlob, fullName: string, idType: string, idNumber: string, dateOfBirth: string, issueDate: string, expiryDate: string, issuedBy: string): Promise<void>;
    deleteCard(id: string): Promise<void>;
    getAllCards(): Promise<Array<IDCard>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCard(id: string): Promise<IDCard>;
    getSortedCards(sortBy: string): Promise<Array<IDCard>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCard(id: string, card: IDCard): Promise<void>;
}
