'use client'

import { useState, useEffect, useRef } from 'react'
import { useAtom } from 'jotai'
import { articleModeAtom, type ArticleMode } from '@/features/dashboard/application/atoms/pipelineAtom'
import { getBriefingSettingsLocal, saveBriefingSettingsLocal, getArticleModeLocal, saveArticleModeLocal } from '@/features/my/infrastructure/api/myApi'
import type { BriefingTimeSettings } from '@/features/my/domain/model/mySettings'
import { BRIEFING_DEFAULTS } from '@/features/my/domain/model/mySettings'

export function useMySettings() {
    const [articleMode, setArticleMode] = useAtom(articleModeAtom)
    const [briefingSettings, setBriefingSettings] = useState<BriefingTimeSettings>(BRIEFING_DEFAULTS)
    const [saveMessage, setSaveMessage] = useState<string | null>(null)
    const saveMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        setBriefingSettings(getBriefingSettingsLocal())
        setArticleMode(getArticleModeLocal())
    }, [setArticleMode])

    useEffect(() => {
        return () => {
            if (saveMessageTimerRef.current) clearTimeout(saveMessageTimerRef.current)
        }
    }, [])

    const saveBriefingSettings = (settings: BriefingTimeSettings) => {
        saveBriefingSettingsLocal(settings)
        setBriefingSettings(settings)
        if (saveMessageTimerRef.current) clearTimeout(saveMessageTimerRef.current)
        setSaveMessage('저장되었습니다.')
        saveMessageTimerRef.current = setTimeout(() => setSaveMessage(null), 2000)
    }

    const updateArticleMode = (mode: ArticleMode) => {
        saveArticleModeLocal(mode)
        setArticleMode(mode)
    }

    return { articleMode, updateArticleMode, briefingSettings, saveBriefingSettings, saveMessage }
}
