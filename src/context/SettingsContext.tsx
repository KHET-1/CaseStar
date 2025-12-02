'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, defaultSettings } from '@/config/settings';

interface SettingsContextType {
    settings: AppSettings;
    updateSettings: (newSettings: Partial<AppSettings>) => void;
    updateTimelineSettings: (settings: Partial<AppSettings['timeline']>) => void;
    resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    // Load from localStorage using lazy initialization (no setState in useEffect)
    const [settings, setSettings] = useState<AppSettings>(() => {
        if (typeof window === 'undefined') return defaultSettings;
        
        const saved = localStorage.getItem('casestar_settings');
        if (saved) {
            try {
                return { ...defaultSettings, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Failed to parse settings', e);
                return defaultSettings;
            }
        }
        return defaultSettings;
    });

    // Save to localStorage whenever settings change
    useEffect(() => {
        localStorage.setItem('casestar_settings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (newSettings: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const updateTimelineSettings = (timelineSettings: Partial<AppSettings['timeline']>) => {
        setSettings(prev => ({
            ...prev,
            timeline: { ...prev.timeline, ...timelineSettings }
        }));
    };

    const resetSettings = () => {
        setSettings(defaultSettings);
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, updateTimelineSettings, resetSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
