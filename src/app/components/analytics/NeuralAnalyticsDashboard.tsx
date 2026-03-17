import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, Package, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ScannedItem, WasteRecord } from "../../services/IngredientContext";

/**
 * 數據分析面板 (AnalyticsDashboard)
 * 應用程式最核心的數據視覺化區域，展示兩個維度：
 * 1. 歷史 (History): 將使用者過去 30 天內丟棄/浪費的食材量，以圖表型態渲染。
 * 2. 預測 (Predict): 基於所有食材的保存期限進行推測，以比例條與高危險清單的形式，警告用戶哪些食材即將浪費。
 */
export function NeuralAnalyticsDashboard({ data, scannedItems }: { data: WasteRecord[], scannedItems: ScannedItem[] }) {
    const [tab, setTab] = useState<"history" | "predict">("history");
    const [chartPage, setChartPage] = useState(0); // 0 = 當週, 1 = 前一週...
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // 透過日期字串即時查找最新的記錄，避免資料更新時選取到舊物件
    const selectedRecord = useMemo(() => {
        return data.find(d => d.date === selectedDate) || null;
    }, [data, selectedDate]);

    // 確保 data 始終是陣列
    const chartData = Array.isArray(data) ? data : [];

    // 每頁顯示 7 天
    const PAGE_SIZE = 7;
    const endIdx = chartData.length - (chartPage * PAGE_SIZE);
    const startIdx = Math.max(0, endIdx - PAGE_SIZE);
    const visibleData = chartData.slice(Math.max(0, startIdx), Math.max(0, endIdx));

    // 計算預測浪費 (未來 3 天內過期的)
    const expiringSoon = scannedItems.filter(i => {
        const daysPassed = Math.floor((Date.now() - (i.timestamp || Date.now())) / (1000 * 60 * 60 * 24));
        const daysLeft = (i.expiryDays !== undefined ? i.expiryDays : 7) - daysPassed;
        return daysLeft >= 0 && daysLeft <= 3 && !i.isSpoiled;
    });

    const totalWaste = chartData.reduce((s, d) => s + (Number(d.amount) || 0), 0);
    const sustainabilityIndex = Math.max(0, 100 - (totalWaste * 2));
    const maxVal = Math.max(...chartData.map(d => Number(d.amount) || 0), 2);
    const chartHeight = 80;

    // 開發者日誌：協助追蹤數據流
    useEffect(() => {
        if (chartData.length > 0) {
            const today = new Date();
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const todayRecord = chartData.find(d => d.date === dateStr);
            console.log(`📊 [Analytics] Context State Updated -> Today (${dateStr}) Waste:`, todayRecord?.amount || 0);
            console.log("📊 [Analytics] Full Waste History:", chartData);
        }
    }, [chartData]);

    return (
        <div className="bg-[var(--header-bg)]/60 backdrop-blur-xl rounded-[2rem] p-5 border border-white/10 mb-6 relative overflow-hidden group shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]">
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />

            <div className="flex items-center justify-between mb-6 relative z-20">
                <div>
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">食材損耗分析 (Waste Analytics)</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <div className="text-xl font-black text-white tracking-tighter">{sustainabilityIndex}%</div>
                            <div className="text-[7px] font-bold text-gray-500 uppercase tracking-widest">利用效率</div>
                        </div>
                        {expiringSoon.length > 0 && (
                            <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl px-2.5 py-1.5 flex flex-col">
                                <div className="text-[9px] font-black text-amber-400 tracking-tighter">儲蓄潛力 ${expiringSoon.length * 50}</div>
                                <div className="text-[6px] font-bold text-amber-400/60 uppercase">若及時料理</div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex bg-background p-1 rounded-xl border border-white/10">
                    <button onClick={() => setTab("history")} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${tab === "history" ? "bg-primary text-[var(--background)]" : "text-gray-500"}`}>歷史</button>
                    <button onClick={() => setTab("predict")} className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${tab === "predict" ? "bg-amber-400 text-background" : "text-gray-500"}`}>預測</button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {tab === "history" ? (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative w-full"
                    >
                        {/* 分頁控制器 */}
                        <div className="flex items-center justify-between mb-2 px-1">
                            <button
                                onClick={() => setChartPage(p => p + 1)}
                                disabled={startIdx === 0}
                                className={`p-1.5 rounded-full border border-white/10 transition-all ${startIdx === 0 ? 'opacity-20 grayscale' : 'bg-white/5 hover:bg-white/10 active:scale-90'}`}
                            >
                                <ChevronLeft size={16} className="text-white" />
                            </button>
                            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">
                                {visibleData.length > 0 ? `${visibleData[0].date} ~ ${visibleData[visibleData.length - 1].date}` : "無數據"}
                            </span>
                            <button
                                onClick={() => setChartPage(p => p - 1)}
                                disabled={chartPage === 0}
                                className={`p-1.5 rounded-full border border-white/10 transition-all ${chartPage === 0 ? 'opacity-20 grayscale' : 'bg-white/5 hover:bg-white/10 active:scale-90'}`}
                            >
                                <ChevronRight size={16} className="text-white" />
                            </button>
                        </div>

                        <div className="h-[120px] w-full flex items-end justify-between px-2 pt-6 pb-2 relative">
                            {visibleData.length > 0 ? visibleData.map((d, i) => {
                                const height = (Number(d.amount) / maxVal) * chartHeight;
                                return (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedDate(d.amount > 0 ? d.date : null)}
                                        className={`flex-1 flex flex-col items-center gap-2 group/bar relative cursor-pointer transition-transform ${selectedDate === d.date ? 'scale-110' : 'hover:scale-105'}`}
                                    >
                                        <div className="absolute top-0 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 -translate-y-4 group-hover/bar:-translate-y-2 flex flex-col items-center z-30">
                                            <span className="bg-primary text-[var(--background)] text-[8px] font-black px-2 py-1 rounded-lg tracking-widest shadow-[0_0_15px_var(--primary-glow)] whitespace-nowrap">
                                                浪費 {d.amount}
                                            </span>
                                            <div className="w-1.5 h-1.5 bg-primary rotate-45 -mt-1" />
                                        </div>
                                        <div className="relative w-full flex items-end justify-center">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: Math.max(2, height) }}
                                                className={`w-4 sm:w-6 rounded-t-full transition-all duration-500 ${selectedDate === d.date ? 'bg-white brightness-150' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'}`}
                                            />
                                        </div>
                                        <span className={`text-[7px] font-black transition-colors ${selectedDate === d.date ? 'text-white underline' : 'text-gray-500 group-hover/bar:text-white'}`}>
                                            {(() => {
                                                const parts = d.date.split("-");
                                                return `${Number(parts[1])}/${Number(parts[2])}`;
                                            })()}
                                        </span>
                                    </div>
                                );
                            }) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">無可顯示之數據</div>
                                </div>
                            )}
                            <div className="absolute bottom-4 left-0 w-full h-[1px] bg-white/5 -z-10" />
                            <div className="absolute top-2 left-0 text-[7px] font-black text-gray-500/50 uppercase tracking-widest">週損耗趨勢報表</div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="predict"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="py-2"
                    >
                        {(() => {
                            const total = scannedItems.length;
                            if (total === 0) {
                                return (
                                    <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                        <Package size={24} className="text-white/20 mb-3" />
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">請先新增食材以啟用預測</p>
                                    </div>
                                );
                            }

                            const riskItems = scannedItems.filter(i => {
                                const daysPassed = Math.floor((Date.now() - (i.timestamp || Date.now())) / (1000 * 60 * 60 * 24));
                                const daysLeft = (i.expiryDays !== undefined ? i.expiryDays : 7) - daysPassed;
                                return daysLeft > 0 && daysLeft <= 2 && !i.isSpoiled; // Exclude already expired (0)
                            });
                            const warningItems = scannedItems.filter(i => {
                                const daysPassed = Math.floor((Date.now() - (i.timestamp || Date.now())) / (1000 * 60 * 60 * 24));
                                const daysLeft = (i.expiryDays !== undefined ? i.expiryDays : 7) - daysPassed;
                                return daysLeft > 2 && daysLeft <= 5 && !i.isSpoiled;
                            });
                            const safeItems = scannedItems.filter(i => {
                                const daysPassed = Math.floor((Date.now() - (i.timestamp || Date.now())) / (1000 * 60 * 60 * 24));
                                const daysLeft = (i.expiryDays !== undefined ? i.expiryDays : 7) - daysPassed;
                                return daysLeft > 5 && !i.isSpoiled;
                            });

                            const getWidth = (val: number) => `${Math.max((val / total) * 100, 0)}%`;

                            const renderAllRiskItems = () => {
                                if (riskItems.length === 0 && warningItems.length === 0) return null;

                                return (
                                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2 relative z-10">
                                        <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2">優先處理建議 (近迫排序)</div>
                                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                            {[...riskItems, ...warningItems]
                                                .sort((a, b) => {
                                                    const getA = (a.expiryDays !== undefined ? a.expiryDays : 7) - Math.floor((Date.now() - (a.timestamp || Date.now())) / (1000 * 60 * 60 * 24));
                                                    const getB = (b.expiryDays !== undefined ? b.expiryDays : 7) - Math.floor((Date.now() - (b.timestamp || Date.now())) / (1000 * 60 * 60 * 24));
                                                    return getA - getB;
                                                })
                                                .map(i => {
                                                    const daysLeft = (i.expiryDays !== undefined ? i.expiryDays : 7) - Math.floor((Date.now() - (i.timestamp || Date.now())) / (1000 * 60 * 60 * 24));
                                                    const isRisk = daysLeft <= 2;
                                                    return (
                                                        <div key={i.id} className={`flex-shrink-0 whitespace-nowrap px-3 py-2 rounded-xl flex items-center gap-2 border ${isRisk ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-400/10 border-amber-400/20'}`}>
                                                            <span className="text-[10px] font-black uppercase text-white">{i.name}</span>
                                                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${isRisk ? 'bg-red-500/20 text-red-500' : 'bg-amber-400/20 text-amber-400'}`}>
                                                                剩餘 {daysLeft} 天
                                                            </span>
                                                        </div>
                                                    );
                                                })
                                            }
                                        </div>
                                    </div>
                                );
                            };

                            return (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mt-2 mb-2">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">全庫存壽命分佈預測</span>
                                        <span className="text-[8px] font-bold text-gray-500 uppercase">{total} ITEMS</span>
                                    </div>

                                    {/* 視覺化分佈進度條 */}
                                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden flex shadow-inner mb-4">
                                        {riskItems.length > 0 && <div style={{ width: getWidth(riskItems.length) }} className="bg-red-500 transition-all duration-1000 animate-pulse border-r border-background" />}
                                        {warningItems.length > 0 && <div style={{ width: getWidth(warningItems.length) }} className="bg-amber-400 transition-all duration-1000 border-r border-background" />}
                                        {safeItems.length > 0 && <div style={{ width: getWidth(safeItems.length) }} className="bg-primary transition-all duration-1000 border-r border-[var(--background)]" />}
                                        {(total - riskItems.length - warningItems.length - safeItems.length > 0) && <div style={{ width: getWidth(total - riskItems.length - warningItems.length - safeItems.length) }} className="bg-gray-600 transition-all duration-1000" />}
                                    </div>

                                    {/* 指標與建議 */}
                                    <div className="grid grid-cols-3 gap-2 relative z-10">
                                        <div className="bg-white/5 rounded-xl p-3 border text-left border-red-500/20 relative">
                                            <div className="text-[8px] font-black text-gray-500 uppercase mb-1">1-2 天 (高風險)</div>
                                            <div className="text-lg font-black text-red-500">{riskItems.length}</div>
                                            <div className="text-[7px] text-gray-400 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">{riskItems.length > 0 ? "建議立即合成" : "無近迫風險"}</div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-3 border text-left border-amber-400/20 relative">
                                            <div className="text-[8px] font-black text-gray-500 uppercase mb-1">3-5 天 (需注意)</div>
                                            <div className="text-lg font-black text-amber-400">{warningItems.length}</div>
                                            <div className="text-[7px] text-gray-400 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">{warningItems.length > 0 ? "準備排入計畫" : "暫無疑慮"}</div>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-3 border text-left border-primary/20 relative">
                                            <div className="text-[8px] font-black text-gray-500 uppercase mb-1">&gt; 5 天 (安全)</div>
                                            <div className="text-lg font-black text-primary">{safeItems.length}</div>
                                            <div className="text-[7px] text-gray-400 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">庫存穩定</div>
                                        </div>
                                    </div>

                                    {/* 展開顯示細節 */}
                                    {renderAllRiskItems()}
                                </div>
                            );
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 歷史細節顯示區 */}
            <AnimatePresence>
                {tab === "history" && selectedRecord && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 pt-4 border-t border-white/5 bg-black/20 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-[8px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                    <Clock size={10} /> {selectedDate} 浪費清單
                                </div>
                                <button onClick={() => setSelectedDate(null)} className="text-[8px] font-black text-gray-500 uppercase">返回</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {selectedRecord.items?.map((item: string, idx: number) => (
                                    <div key={idx} className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-white uppercase">{item}</span>
                                    </div>
                                )) || <div className="text-[9px] text-gray-500 font-bold uppercase py-2">無具體品項記錄</div>}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 底部摘要 */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="text-center border-r border-white/10 pr-4">
                        <div className="text-[10px] font-black text-white">{totalWaste}</div>
                        <div className="text-[6px] font-bold text-gray-500 uppercase">累積損耗</div>
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-primary">{sustainabilityIndex}%</div>
                        <div className="text-[6px] font-bold text-gray-500 uppercase">環保等級 (Eco)</div>
                    </div>
                </div>
                <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Neural Link: Active</div>
            </div>
        </div>
    );
}
