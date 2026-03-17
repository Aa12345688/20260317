import { Package, AlertTriangle, AlertCircle } from "lucide-react";

interface InventoryStatsProps {
    freshItems: number;
    expiredItems: number;
}

export function InventoryStats({ freshItems, expiredItems }: InventoryStatsProps) {
    return (
        <div className="grid grid-cols-2 gap-3 px-4 py-2">
            <div className="bg-[#1a4d3d]/50 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:translate-y-[-2px] transition-all">
                <div className="absolute top-2.5 right-2.5 w-1 h-1 rounded-full bg-[#00ff88] shadow-[0_0_12px_#00ff88] animate-pulse" />
                <div className="text-xl font-black text-[#00ff88] mb-0.5">{freshItems}</div>
                <div className="text-[7px] font-black text-white/40 uppercase tracking-widest">保鮮中 (FRESH)</div>
            </div>

            <div className={`backdrop-blur-xl border rounded-2xl p-3.5 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.5)] relative overflow-hidden group transition-all hover:translate-y-[-2px] ${expiredItems > 0 ? "bg-red-500/20 border-red-500/50 animate-pulse" : "bg-white/5 border-white/10 opacity-60"}`}>
                <div className={`text-xl font-black mb-0.5 ${expiredItems > 0 ? "text-red-500" : "text-white/40"}`}>{expiredItems}</div>
                <div className={`text-[7px] font-black uppercase tracking-widest ${expiredItems > 0 ? "text-red-500" : "text-white/40"}`}>已過期 (EXPIRED)</div>
            </div>
        </div>
    );
}
