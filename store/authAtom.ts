import { atom } from "jotai";
import { authStateAtom } from "@/features/auth/application/atoms/authAtom";

export type AuthState = "LOADING" | "UNAUTHENTICATED" | "AUTHENTICATED" | "PENDING_TERMS";

export const authAtom = atom<AuthState>((get) => get(authStateAtom).status);

export const isAuthenticatedAtom = atom((get) => get(authAtom) === "AUTHENTICATED");
