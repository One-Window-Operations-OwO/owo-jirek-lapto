import { useRef, useState, useMemo } from "react";
import { useDraggable } from "./hooks/useDraggable";

function LogCard({ log }: { log: any }) {
  const isPositive =
    log.status.toLowerCase().includes("setuju") ||
    log.status.toLowerCase().includes("terima");
  return (
    <div
      className={`border rounded p-2 ${isPositive
        ? "bg-green-900/20 border-green-900/50"
        : "bg-red-900/20 border-red-900/50"
        }`}
    >
      <div className="flex justify-between items-start mb-1">
        <span className="text-[10px] text-zinc-500 font-mono">{log.date}</span>
        <span
          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${isPositive
            ? "bg-green-900/50 text-green-400"
            : "bg-red-900/50 text-red-400"
            }`}
        >
          {log.status}
        </span>
      </div>
      {log.user && (
        <div className="text-xs font-semibold text-zinc-300 mb-0.5">
          {log.user}
        </div>
      )}
      <div className="text-xs text-zinc-400 italic">{log.note}</div>
    </div>
  );
}

function HistoryList({ logs }: { logs: any[] }) {
  const [showOldRejections, setShowOldRejections] = useState(false);

  const rejectionLogs = logs.filter(
    (l) =>
      !l.status.toLowerCase().includes("setuju") &&
      !l.status.toLowerCase().includes("terima")
  );
  const approvalLogs = logs.filter(
    (l) =>
      l.status.toLowerCase().includes("setuju") ||
      l.status.toLowerCase().includes("terima")
  );

  const lastRejection = rejectionLogs[rejectionLogs.length - 1];
  const olderRejections = rejectionLogs.slice(0, rejectionLogs.length - 1);

  // Cek apakah log terakhir dari keseluruhan adalah dari administrator
  const lastLog = logs[logs.length - 1];
  const isLastFromAdmin = lastLog && lastLog.user?.toLowerCase().includes("admin");
  const secondToLastLog = logs.length >= 2 ? logs[logs.length - 2] : null;

  return (
    <div className="space-y-2">
      {/* Jika log terakhir dari admin, tampilkan log sebelumnya sebagai konteks */}
      {isLastFromAdmin && secondToLastLog && (
        <div className="space-y-1">
          <div className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">
            Log Sebelumnya
          </div>
          <div className="border-l-2 border-yellow-700/50 pl-2 opacity-70">
            <LogCard log={secondToLastLog} />
          </div>
        </div>
      )}

      {/* Rejection logs */}
      {rejectionLogs.length > 0 && (
        <div className="space-y-2">
          {olderRejections.length > 0 && (
            <>
              <button
                onClick={() => setShowOldRejections((v) => !v)}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 w-full text-left"
              >
                {showOldRejections
                  ? "▲ Sembunyikan penolakan lama"
                  : `▼ Lihat ${olderRejections.length} penolakan lama`}
              </button>
              {showOldRejections && (
                <div className="space-y-2 border-l-2 border-red-900/40 pl-2">
                  {olderRejections.map((log, idx) => (
                    <LogCard key={idx} log={log} />
                  ))}
                </div>
              )}
            </>
          )}
          {/* Always show latest rejection */}
          <LogCard log={lastRejection} />
        </div>
      )}

      {/* Approval logs */}
      {approvalLogs.map((log, idx) => (
        <LogCard key={`a-${idx}`} log={log} />
      ))}
    </div>
  );
}

interface StickyInfoBoxProps {
  schoolData: Record<string, string>;
  itemData: Record<string, string>;
  history: any[];
  date?: string;
  setDate?: (date: string) => void;
  // Datadik Props
  kepsek: string | null;
  guruList: any[];
  isLoadingGuru: boolean;
  onRefetchDatadik: () => void;
  isDateEditable?: boolean;
}

export default function StickyInfoBox({
  schoolData,
  itemData,
  history,
  date,
  setDate,
  kepsek,
  guruList,
  isLoadingGuru,
  onRefetchDatadik,
  isDateEditable = false,
}: StickyInfoBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null!);
  const { position, handleMouseDown } = useDraggable<HTMLDivElement>(
    boxRef,
    "sticky-info-box",
  );

  // PTK Search State
  const [guruSearch, setGuruSearch] = useState("");
  const [showHistory, setShowHistory] = useState(true);


  const filteredGuru = useMemo(() => {
    const pattern = guruSearch.trim().toLowerCase();
    if (!pattern) return [];
    if (pattern.length <= 1) return [];
    return guruList
      .filter(
        (g) =>
          (g.nama || "").toLowerCase().includes(pattern) ||
          (g.jabatan || "").toLowerCase().includes(pattern)
      )
      .slice(0, 5);
  }, [guruList, guruSearch]);

  const renderGuruItem = (g: any, idx: number) => {
    return (
      <div
        key={idx}
        className="block text-[13px] leading-[1.5] px-3 py-2 text-zinc-300 border-b border-zinc-800 cursor-pointer bg-zinc-900 hover:bg-zinc-800 transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
      >
        <b className="text-zinc-200">{g.nama}</b>
        <br />
        <span className="text-zinc-500 text-[11px] font-medium">
          {g.jabatan}
        </span>
      </div>
    );
  };

  return (
    <div
      ref={boxRef}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        touchAction: "none",
        zIndex: 1000,
        width: "320px",
        borderRadius: "8px",
        fontFamily: "sans-serif",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        backgroundColor: "#18181b",
        border: "2px solid #3f3f46",
      }}
      className="text-zinc-100 flex flex-col max-h-[80vh]"
    >
      {/* Header */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 18px",
          cursor: "move",
          borderBottom: "1px solid #3f3f46",
          backgroundColor: "#27272a",
          borderTopLeftRadius: "6px",
          borderTopRightRadius: "6px",
          flexShrink: 0,
        }}
      >
        <span className="font-bold text-yellow-500 text-sm">
          {schoolData.nama_sekolah || "-"}
        </span>
      </div>

      {/* Content */}
      <div
        className="p-3 text-sm space-y-3 bg-zinc-900 text-white overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* School Info */}
        <div className="">
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              NPSN
            </div>
            <div className="text-lg font-mono text-yellow-500">
              {schoolData.npsn || "-"}
            </div>
          </div>
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Serial Number
          </div>
          <div className="text-lg font-mono text-yellow-500">
            {itemData.serial_number || "-"}
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Alamat
            </div>
            <div className="text-xs text-white truncate">
              {schoolData.alamat || "-"}
            </div>
          </div>
        </div>

        {/* --- PTK / GURU SECTION --- */}
        <hr className="border-zinc-700" />

        <div className="p-0">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-wide flex items-center gap-2">
              Kepala Sekolah :
              <button
                onClick={onRefetchDatadik}
                className="hover:text-white transition-colors"
                title="Refetch Datadik"
              >
                ↻
              </button>
            </div>
          </div>
          <div className="mb-3 text-[13px] font-semibold text-zinc-200 bg-sky-900/20 border border-sky-900/50 p-2 rounded block">
            {isLoadingGuru ? "Loading..." : kepsek || "-"}
          </div>

          <input
            className="w-full bg-zinc-900 border border-zinc-600 rounded px-2 py-1 mb-2 text-white focus:outline-none focus:border-yellow-500 text-[13px]"
            placeholder="Cari guru..."
            autoComplete="off"
            value={guruSearch}
            onChange={(e) => setGuruSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                // setGuruSearch(""); // Keep text as per request
                e.currentTarget.blur();
              }
              e.stopPropagation();
            }}
          />

          <div className="max-h-[120px] overflow-y-auto border border-zinc-700 bg-zinc-900 rounded p-1 custom-scrollbar">
            {filteredGuru.length > 0 ? (
              filteredGuru.map((g, idx) => renderGuruItem(g, idx))
            ) : (
              <div className="text-zinc-500 text-xs p-2 text-center">
                Ketikan nama untuk mencari...
              </div>
            )}
          </div>
        </div>
        {/* ------------------------- */}

        <hr className="border-zinc-700" />

        {/* Date Input */}
        {date !== undefined && setDate && (
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Tanggal Verifikasi
            </label>
            <input
              type="date"
              value={date}
              readOnly={!isDateEditable}
              onChange={(e) => setDate(e.target.value)}
              min="2025-12-01"
              max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`}
              onWheel={(e) => {
                e.stopPropagation();
                if (!date || !isDateEditable) return;
                e.preventDefault();
                const currentDate = new Date(date);
                const daysToAdd = e.deltaY > 0 ? -1 : 1;
                currentDate.setDate(currentDate.getDate() + daysToAdd);

                const minDate = new Date("2025-12-01");
                const maxDate = new Date();

                // Reset time components for accurate comparison
                maxDate.setHours(0, 0, 0, 0);
                minDate.setHours(0, 0, 0, 0);
                currentDate.setHours(0, 0, 0, 0);

                if (currentDate < minDate || currentDate > maxDate) return;
                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(
                  2,
                  "0",
                );
                const day = String(currentDate.getDate()).padStart(2, "0");
                setDate(`${year}-${month}-${day}`);
              }}
              className={`w-full bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-white focus:outline-none focus:border-yellow-500 text-sm ${!isDateEditable ? "opacity-50 cursor-not-allowed" : ""
                }`}
            />
            <p className="text-[10px] text-zinc-500 mt-1">
              * Pastikan tanggal sesuai dengan BAPP
            </p>
          </div>
        )}

        <hr className="border-zinc-700" />

        {/* History Info */}
        <div className="">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Riwayat Approval
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs text-zinc-500 hover:text-zinc-300 focus:outline-none"
            >
              {showHistory ? "Sembunyikan" : "Tampilkan"}
            </button>
          </div>

          {showHistory && (
            history && history.length > 0 ? (
              <HistoryList logs={history} />
            ) : (
              <div className="text-xs text-zinc-600 italic">
                Belum ada riwayat.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
