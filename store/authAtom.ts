import { atom } from 'jotai';

export type AuthState = 'AUTHENTICATED' | 'UNAUTHENTICATED';

export const authAtom = atom<AuthState>('UNAUTHENTICATED');

export const isAuthenticatedAtom = atom((get) => get(authAtom) === 'AUTHENTICATED');
