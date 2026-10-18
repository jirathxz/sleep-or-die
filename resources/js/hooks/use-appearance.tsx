import { useSyncExternalStore } from 'react';

export type ResolvedAppearance = 'dark';
export type Appearance = 'dark' | 'light' | 'system';

export type UseAppearanceReturn = {
    readonly appearance: 'dark';
    readonly resolvedAppearance: 'dark';
    readonly updateAppearance: (mode?: Appearance) => void;
};

const listeners = new Set<() => void>();
const currentAppearance: 'dark' = 'dark';

const setCookie = (name: string, value: string, days = 365): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (): void => {
    if (typeof document === 'undefined') {
        return;
    }

    // Always enforce dark theme
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
};

const subscribe = (callback: () => void) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
};

const notify = (): void => listeners.forEach((listener) => listener());

export function initializeTheme(): void {
    if (typeof window === 'undefined') {
        return;
    }

    // Force client to pure dark theme
    localStorage.setItem('appearance', 'dark');
    setCookie('appearance', 'dark');
    applyTheme();
}

export function useAppearance(): UseAppearanceReturn {
    useSyncExternalStore(
        subscribe,
        () => currentAppearance,
        () => 'dark',
    );

    const updateAppearance = (_mode?: Appearance): void => {
        // Enforce dark theme exclusively
        localStorage.setItem('appearance', 'dark');
        setCookie('appearance', 'dark');
        applyTheme();
        notify();
    };

    return {
        appearance: 'dark',
        resolvedAppearance: 'dark',
        updateAppearance,
    } as const;
}
