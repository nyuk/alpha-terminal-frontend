export interface BriefingTimeSettings {
    korea_time: number
    us_time: number
}

// 한국 증시 09:00 KST 시작 기준 1시간 전
// 미국 NYSE 09:30 EST = 23:30 KST 기준 1시간 전 (DST 적용 시 22:30 KST)
export const BRIEFING_DEFAULTS: BriefingTimeSettings = {
    korea_time: 8,
    us_time: 22,
}
