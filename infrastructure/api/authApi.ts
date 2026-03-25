import { httpClient } from "@/infrastructure/http/httpClient";

export interface MeResponse {
  /** true면 정식 세션 보유 (기존 회원), false면 temp_token (약관 동의 필요) */
  is_registered: boolean;
  email: string;
  nickname: string;
  account_id?: string;
}

export async function fetchMe(): Promise<MeResponse> {
  const res = await httpClient.get("/authentication/me");

  if (!res.ok) {
    throw new Error(`[authApi] /authentication/me 요청 실패: ${res.status}`);
  }

  return res.json() as Promise<MeResponse>;
}
