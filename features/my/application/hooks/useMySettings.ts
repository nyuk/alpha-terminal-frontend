'use client'

import { useState, useEffect } from 'react'
import { useAtom } from 'jotai'
import { articleModeAtom, type ArticleMode } from '@/features/dashboard/application/atoms/pipelineAtom'
import { getBriefingSettingsLocal, saveBriefingSettingsLocal } from '@/features/my/infrastructure/api/myApi'
import type { BriefingTimeSettings } from '@/features/my/domain/model/mySettings'
import { BRIEFING_DEFAULTS } from '@/features/my/domain/model/mySettings'

export function useMySettings() {
    const [articleMode, setArticleMode] = useAtom(articleModeAtom)
    const [briefingSettings, setBriefingSettings] = useState<BriefingTimeSettings>(BRIEFING_DEFAULTS)
    const [saveMessage, setSaveMessage] = useState<string | null>(null)

    useEffect(() => {
        setBriefingSettings(getBriefingSettingsLocal())
    }, [])

    const saveBriefingSettings = (settings: BriefingTimeSettings) => {
        saveBriefingSettingsLocal(settings)
        setBriefingSettings(settings)
        setSaveMessage('저장되었습니다.')
        setTimeout(() => setSaveMessage(null), 2000)
    }

    const updateArticleMode = (mode: ArticleMode) => {
        setArticleMode(mode)
    }

    return { articleMode, updateArticleMode, briefingSettings, saveBriefingSettings, saveMessage }
}
