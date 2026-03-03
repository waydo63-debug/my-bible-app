import { create } from 'zustand';

// ============================================================
// 다크 모드 상태 관리
// ============================================================

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
    theme: Theme;
    isDark: boolean;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
    initialize: () => void;
}

function getSystemDark(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(isDark: boolean) {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', isDark);
}

export const useThemeStore = create<ThemeState>((set, get) => ({
    theme: 'system',
    isDark: false,

    initialize: () => {
        if (typeof window === 'undefined') return;

        const stored = localStorage.getItem('way-bible-theme') as Theme | null;
        const theme = stored || 'system';
        const isDark = theme === 'dark' || (theme === 'system' && getSystemDark());

        applyTheme(isDark);
        set({ theme, isDark });

        // 시스템 설정 변경 감지
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            const { theme } = get();
            if (theme === 'system') {
                applyTheme(e.matches);
                set({ isDark: e.matches });
            }
        });
    },

    setTheme: (theme) => {
        const isDark = theme === 'dark' || (theme === 'system' && getSystemDark());
        localStorage.setItem('way-bible-theme', theme);
        applyTheme(isDark);
        set({ theme, isDark });
    },

    toggleTheme: () => {
        const { isDark } = get();
        const newTheme: Theme = isDark ? 'light' : 'dark';
        get().setTheme(newTheme);
    },
}));
