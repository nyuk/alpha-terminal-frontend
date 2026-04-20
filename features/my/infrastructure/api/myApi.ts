import { httpClient } from '@/infrastructure/http/httpClient'
import type { BriefingTimeSettings } from '@/features/my/domain/model/mySettings'
import { BRIEFING_DEFAULTS } from '@/features/my/domain/model/mySettings'

export async function updateUserEmail(email: string): Promise<void> {
    await httpClient.patch('/users/me/email', { email })
}

const BRIEFING_SETTINGS_KEY = 'alpha_briefing_settings'

export function getBriefingSettingsLocal(): BriefingTimeSettings {
    if (typeof window === 'undefined') return BRIEFING_DEFAULTS
    const raw = localStorage.getItem(BRIEFING_SETTINGS_KEY)
    if (!raw) return BRIEFING_DEFAULTS
    try {
        return JSON.parse(raw)
    } catch {
        return BRIEFING_DEFAULTS
    }
}

export function saveBriefingSettingsLocal(settings: BriefingTimeSettings): void {
    localStorage.setItem(BRIEFING_SETTINGS_KEY, JSON.stringify(settings))
}
