'use client';

import { create } from 'zustand';
import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X as XIcon } from 'lucide-react';

// ============================================================
// 토스트 스토어
// ============================================================

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
}

interface ToastState {
    toasts: Toast[];
    addToast: (message: string, type?: Toast['type'], duration?: number) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    addToast: (message, type = 'success', duration = 3000) => {
        const id = Date.now().toString();
        set((state) => ({
            toasts: [...state.toasts, { id, message, type, duration }],
        }));
        // 자동으로 제거
        if (duration > 0) {
            setTimeout(() => {
                set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
            }, duration);
        }
    },
    removeToast: (id) => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    },
}));

// ============================================================
// 토스트 컨테이너 (layout에 한 번만 배치)
// ============================================================

const ICONS = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
};

const COLORS = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-[--color-surface] text-[--color-text-primary] border border-[--color-border]',
};

export function ToastContainer() {
    const toasts = useToastStore((s) => s.toasts);
    const removeToast = useToastStore((s) => s.removeToast);

    return (
        <div className="fixed bottom-20 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2 md:bottom-8">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    const [exiting, setExiting] = useState(false);
    const Icon = ICONS[toast.type];

    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const timer = setTimeout(() => setExiting(true), toast.duration - 300);
            return () => clearTimeout(timer);
        }
    }, [toast.duration]);

    return (
        <div
            className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-xl ${COLORS[toast.type]} ${exiting ? 'toast-exit' : 'toast-enter'}`}
            role="alert"
        >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            <span className="text-sm font-semibold">{toast.message}</span>
            <button onClick={onDismiss} className="ml-1 shrink-0 opacity-70 hover:opacity-100">
                <XIcon className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}
