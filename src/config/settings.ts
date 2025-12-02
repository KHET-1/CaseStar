export interface AppSettings {
    timeline: {
        cardWidth: string;
        animationSpeed: number;
        showConfidence: boolean;
    };
    ui: {
        showParticles: boolean;
        themeColor: string;
    };
}

export const defaultSettings: AppSettings = {
    timeline: {
        cardWidth: '380px',
        animationSpeed: 1.0,
        showConfidence: true,
    },
    ui: {
        showParticles: true,
        themeColor: 'purple',
    },
};
