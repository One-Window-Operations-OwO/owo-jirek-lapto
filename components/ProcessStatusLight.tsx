import React, { useState, useRef, useEffect } from "react";

type ProcessStatus = "idle" | "processing" | "success" | "error";
type FailedStage = "none" | "submit" | "save-approval";

interface QueueItem {
    npsn: string;
    sn: string;
}

interface ProcessStatusLightProps {
    status: ProcessStatus;
    failedStage: FailedStage;
    onRetry: () => void;
    errorMessage?: string;
    queue?: QueueItem[];
}

const VISIBLE_MAX = 3;

export default function ProcessStatusLight({
    status,
    failedStage,
    onRetry,
    errorMessage,
    queue = [],
}: ProcessStatusLightProps) {
    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const activeItem = queue[0] ?? null;
    const waitingItems = queue.slice(1);
    const visibleQueue = expanded ? queue : queue.slice(0, VISIBLE_MAX);
    const hiddenCount = queue.length - VISIBLE_MAX;

    return (
        <div className="relative" ref={ref}>
            {/* Main Status Bar */}
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-4 py-2 rounded-full shadow border border-zinc-200 dark:border-zinc-700">
                {/* Dot indicator */}
                <div className="relative flex h-3 w-3 shrink-0">
                    {status === "processing" && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    )}
                    <span
                        className={`relative inline-flex rounded-full h-3 w-3 ${status === "success"
                                ? "bg-green-500"
                                : status === "processing"
                                    ? "bg-yellow-500"
                                    : status === "error"
                                        ? "bg-red-500"
                                        : "bg-zinc-400"
                            }`}
                    />
                </div>

                {/* Label */}
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    {status === "success"
                        ? "Berhasil Disimpan"
                        : status === "processing"
                            ? "Sedang Memproses..."
                            : status === "error"
                                ? "Terjadi Kesalahan"
                                : "Siap"}
                </span>

                {/* Error retry */}
                {status === "error" && (
                    <div className="flex items-center gap-2 border-l border-zinc-300 dark:border-zinc-600 pl-2">
                        <span className="text-xs text-red-500 max-w-[130px] truncate" title={errorMessage}>
                            {failedStage === "submit" ? "Submit Data" : "Save Approval"}
                        </span>
                        <button
                            onClick={onRetry}
                            className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-bold"
                        >
                            ↻ Retry
                        </button>
                    </div>
                )}

                {/* Three-dot menu button — visible when there are items in queue */}
                {queue.length > 0 && (
                    <button
                        onClick={() => setOpen(v => !v)}
                        title="Lihat antrian proses"
                        className={`ml-auto flex items-center justify-center w-6 h-6 rounded-full transition-colors text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 ${open ? "bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200" : ""}`}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="5" cy="12" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="19" cy="12" r="2" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Dropdown Queue Panel */}
            {open && queue.length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    {/* Header */}
                    <div className="px-3 pt-2.5 pb-1.5 border-b border-zinc-100 dark:border-zinc-700 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Antrian Proses</span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">{queue.length} item</span>
                    </div>

                    {/* Queue Items */}
                    <div className="p-2 space-y-1">
                        {visibleQueue.map((item, idx) => (
                            <div
                                key={`${item.npsn}-${idx}`}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${idx === 0
                                        ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50"
                                        : "bg-zinc-50 dark:bg-zinc-700/50 border border-zinc-100 dark:border-zinc-700"
                                    }`}
                            >
                                {/* Status dot */}
                                {idx === 0 ? (
                                    <span className="relative flex h-2 w-2 shrink-0">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
                                    </span>
                                ) : (
                                    <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-500 shrink-0" />
                                )}

                                {/* NPSN */}
                                <span className={`font-mono font-bold shrink-0 ${idx === 0 ? "text-yellow-700 dark:text-yellow-300" : "text-zinc-600 dark:text-zinc-300"}`}>
                                    {item.npsn}
                                </span>

                                {/* Label */}
                                <span className={`ml-auto text-[10px] font-medium shrink-0 ${idx === 0 ? "text-yellow-600 dark:text-yellow-400" : "text-zinc-400 dark:text-zinc-500"}`}>
                                    {idx === 0 ? "Diproses" : `Antri #${idx}`}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Expand / Collapse */}
                    {queue.length > VISIBLE_MAX && (
                        <button
                            onClick={() => setExpanded(v => !v)}
                            className="w-full px-3 py-1.5 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors border-t border-zinc-100 dark:border-zinc-700 text-center"
                        >
                            {expanded ? "▲ Tampilkan lebih sedikit" : `▼ Lihat ${hiddenCount} lainnya`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
