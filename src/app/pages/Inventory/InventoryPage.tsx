import { useNavigate } from "react-router";
import { useState, useRef } from "react";
import { ChevronLeft, Plus, ChefHat, Snowflake, Package, Loader2, Sparkles, Minus, Trash2, Clock, AlertTriangle, Edit2, X } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useIngredients } from "../../services/IngredientContext";
import { InventoryStats } from "../../components/inventory_management/InventoryStats";
import { AddEntryForm } from "../../components/inventory_management/AddEntryForm";
import { EditItemModal } from "../../components/inventory_management/EditItemModal";

import { InventorySkeleton } from "../../components/feedback/SkeletonScreens";

/**
 * 全庫存管理頁 (Inventory)
 * 提供完整的冰箱內容清單，支援：
 * 1. 關鍵字搜尋與語音搜尋功能 (`startVoiceInput`)
 * 2. 分類標籤篩選 (全部、蔬菜、肉類等)
 * 3. 儲存區域切換 (冷藏庫 / 冷凍庫)
 * 4. 食材的手動新增與現有項目的參數編輯操作。
 */
export function InventoryPage() {
    const navigate = useNavigate();
    // 從 Context 獲取全域狀態與操作方法
    const { scannedItems, addItem, updateQuantity, removeIngredient, selectedIds, toggleSelection, generateRecipe, updateItem, isLoading } = useIngredients();
    const [isGenerating, setIsGenerating] = useState(false);

    const [showForm, setShowForm] = useState(false); // 是否顯示手動輸入表單
    const [storageTab, setStorageTab] = useState<"fridge" | "freezer">("fridge"); // 切換 冷藏/冷凍 分頁
    const [categoryTab, setCategoryTab] = useState("全部"); // 新增：食材分類過濾狀態
    const [editingItem, setEditingItem] = useState<any>(null); // 當前正在編輯的食材對象

    const categories = ["全部", "蔬菜", "水果", "肉類", "海鮮", "乳製品", "五穀", "其他"];

    const filtered = scannedItems.filter(i => {
        const matchesStorage = (i.storageType || "fridge") === storageTab;
        const matchesCategory = categoryTab === "全部" || i.category === categoryTab;
        return matchesStorage && matchesCategory;
    });
    const expiredCount = scannedItems.filter(i => {
        const daysPassed = Math.floor((Date.now() - (i.timestamp || Date.now())) / (1000 * 60 * 60 * 24));
        const expiryDays = i.expiryDays !== undefined ? i.expiryDays : 7;
        const daysLeft = expiryDays - daysPassed;
        return daysLeft <= 0 || i.isSpoiled; // <=0 as expired
    }).length;

    const handleSaveEdit = (id: string, updates: any) => {
        // Force timestamp reset to recalculate days cleanly from "today" when edited
        updateItem(id, { ...updates, timestamp: Date.now() });
        setEditingItem(null);
    };

    const containerRef = useRef(null);
    const { scrollY } = useScroll({ target: containerRef });
    const y1 = useTransform(scrollY, [0, 500], [0, 100]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    return (
        <div ref={containerRef} className="pb-28 pt-6 relative overflow-hidden">
            {/* Parallax Background Elements */}
            <motion.div style={{ y: y1 }} className="absolute top-20 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <motion.div style={{ y: y2 }} className="absolute bottom-40 -right-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Minimal Floating Back Button */}
            <button onClick={() => navigate(-1)} aria-label="返回上一步" className="fixed top-4 left-4 z-[110] w-10 h-10 bg-[var(--header-bg)]/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"><ChevronLeft size={20} className="text-white" /></button>
            <div className="flex justify-end px-4 mb-2">
                <button onClick={() => setShowForm(!showForm)} aria-label="手動新增食材" className="p-2 bg-primary rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"><Plus size={20} className="text-background stroke-[3]" /></button>
            </div>

            <div className="sticky top-2 z-20 pb-2 px-4 py-2 space-y-3">
                <div className="flex bg-card/60 backdrop-blur-xl p-1 rounded-full border border-white/10 shadow-lg">
                    <button onClick={() => setStorageTab('fridge')} className={`flex-1 py-2.5 rounded-full text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${storageTab === 'fridge' ? 'bg-primary text-background' : 'text-gray-400'}`}><ChefHat size={16} />冷藏庫</button>
                    <button onClick={() => setStorageTab('freezer')} className={`flex-1 py-2.5 rounded-full text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${storageTab === 'freezer' ? 'bg-blue-400 text-background' : 'text-gray-400'}`}><Snowflake size={16} />冷凍庫</button>
                </div>

                {/* 新增：食材分類水平滾動過濾列 */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2">
                    {categories.map(c => (
                        <button
                            key={c}
                            onClick={() => setCategoryTab(c)}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${categoryTab === c
                                ? (storageTab === 'fridge' ? 'bg-primary border-primary text-background shadow-[0_0_15px_rgba(0,255,136,0.3)]' : 'bg-blue-400 border-blue-400 text-background shadow-[0_0_15px_rgba(96,165,250,0.3)]')
                                : 'bg-black/20 border-white/5 text-white/40 hover:border-white/20'
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-4 mb-1.5">
                <button
                    onClick={async () => {
                        setIsGenerating(true);
                        try {
                            await generateRecipe();
                            navigate("/recipes");
                        } catch (e: any) {
                            alert(e.message);
                        } finally {
                            setIsGenerating(false);
                        }
                    }}
                    disabled={isGenerating || selectedIds.length === 0}
                    className={`w-full ${storageTab === 'fridge' ? 'bg-primary' : 'bg-blue-400'} text-background py-3.5 rounded-full font-black text-xs uppercase tracking-widest shadow-[0_15px_30px_rgba(0,0,0,0.4)] flex items-center justify-center gap-2.5 disabled:opacity-50 transition-all hover:scale-[1.02] hover:translate-y-[-2px] active:scale-[0.98]`}
                >
                    {isGenerating ? <div className="absolute inset-0 bg-primary/10 animate-synthesis rounded-full blur-xl" /> : null}
                    {isGenerating ? <Loader2 size={18} className="animate-spin relative z-10" /> : <Sparkles size={18} className="relative z-10" />}
                    <span className="relative z-10">{isGenerating ? "正在為您量子合成食譜..." : "生成 AI 食譜方案"}</span>
                </button>
            </div>

            <InventoryStats freshItems={scannedItems.length - expiredCount} expiredItems={expiredCount} />

            {showForm && (<AddEntryForm onAdd={(item) => addItem(item, "manual")} onDismiss={() => setShowForm(false)} categories={["全部", "蔬菜", "水果", "肉類", "海鮮", "乳製品", "五穀", "其他"]} />)}

            <div className="px-4 py-3">
                <h3 className="font-black text-[10px] uppercase text-white/30 mb-3 px-1">存貨紀錄 ({filtered.length})</h3>
                {isLoading ? (
                    <InventorySkeleton />
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/5">
                        <Package size={48} className="mx-auto mb-4 text-white/10" />
                        <p className="text-[10px] font-bold text-gray-500">該庫存區域為空</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map(i => {
                            const daysPassed = Math.floor((Date.now() - (i.timestamp || Date.now())) / (1000 * 60 * 60 * 24));
                            const expiryDays = i.expiryDays !== undefined ? i.expiryDays : 7;
                            const daysLeft = expiryDays - daysPassed;
                            const isExpired = daysLeft <= 0;
                            const isWarning = !isExpired && daysLeft <= 2;

                            return (
                                <motion.div
                                    key={i.id}
                                    layout
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    whileHover={{
                                        scale: 1.02,
                                        rotateX: 2,
                                        rotateY: -2,
                                        translateZ: 20
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className={`bg-[var(--card)]/60 backdrop-blur-xl rounded-2xl p-3 border transition-all relative overflow-hidden group shadow-lg hover:shadow-2xl ${i.isSpoiled || isExpired ? 'border-red-500/50 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : isWarning ? 'border-amber-400/50 bg-amber-400/5 shadow-[0_0_20px_rgba(251,191,36,0.1)]' : 'border-white/10'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleSelection(i.id)}
                                            disabled={i.isSpoiled || isExpired}
                                            aria-label={`選取 ${i.name}`}
                                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${i.isSpoiled || isExpired ? 'opacity-20 cursor-not-allowed border-gray-600' : selectedIds.includes(i.id) ? (storageTab === 'fridge' ? 'bg-primary border-primary' : 'bg-blue-400 border-blue-400') : 'bg-transparent border-white/20'}`}
                                        >
                                            {selectedIds.includes(i.id) && !i.isSpoiled && !isExpired && <div className="w-3 h-3 bg-background rounded-sm" />}
                                            {(i.isSpoiled || isExpired) && <X size={12} className="text-red-500" />}
                                        </button>

                                        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0 relative">
                                            <Package size={18} className={i.isSpoiled || isExpired ? "text-red-500" : storageTab === 'fridge' ? "text-primary" : "text-blue-400"} />
                                            {(i.isSpoiled || isExpired) && <div className="absolute inset-0 bg-red-500/10 rounded-xl" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-black text-sm truncate uppercase ${i.isSpoiled || isExpired ? 'text-red-500/70 line-through' : 'text-white'}`}>{i.name}</h4>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${i.isSpoiled ? 'bg-red-500/10 text-red-500' : storageTab === 'fridge' ? 'bg-primary/10 text-primary' : 'bg-blue-400/10 text-blue-400'}`}>
                                                    {i.isSpoiled ? "品質異常" : (i.category || "其他")}
                                                </span>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${isExpired || i.isSpoiled ? 'bg-red-500 text-white' : isWarning ? 'bg-amber-400 text-background' : 'bg-white/5 text-gray-400'}`}>
                                                    <Clock size={8} />
                                                    {isExpired ? "已過期 (EXPIRED)" : i.isSpoiled ? "偵測毀損" : isWarning ? `即將到期 (${daysLeft}天)` : `保鮮 ${daysLeft} 天`}
                                                </span>
                                                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 bg-white/5 text-gray-400">
                                                    {new Date(i.timestamp || Date.now()).toLocaleString('zh-TW', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {(isExpired || i.isSpoiled) && <div className="text-[10px] font-black text-red-500 animate-pulse hidden sm:block">請移除食材</div>}
                                            {isWarning && <div className="text-[10px] font-black text-amber-400 animate-pulse hidden sm:block">儘速使用</div>}
                                            <button onClick={() => setEditingItem(i)} className="w-8 h-8 rounded-full bg-white/5 text-gray-400 flex items-center justify-center hover:text-white hover:bg-white/10 transition-colors">
                                                <Edit2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-1.5 border-t border-white/5 pt-1.5 mt-1.5">
                                        <div className="flex items-center bg-background/80 rounded-full p-0.5 border border-white/10">
                                            <button onClick={() => updateQuantity(i.id, -1)} className={`w-6 h-6 flex items-center justify-center text-gray-400 hover:${storageTab === 'fridge' ? 'text-primary' : 'text-blue-400'}`}><Minus size={10} strokeWidth={3} /></button>
                                            <span className="w-6 text-center font-black text-white text-[10px]">{i.quantity}</span>
                                            <button onClick={() => updateQuantity(i.id, 1)} className={`w-6 h-6 flex items-center justify-center text-gray-400 hover:${storageTab === 'fridge' ? 'text-primary' : 'text-blue-400'}`}><Plus size={10} strokeWidth={3} /></button>
                                        </div>
                                        <button onClick={() => removeIngredient(i.id)} className="w-7 h-7 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center transition-all hover:bg-red-500 hover:text-white"><Trash2 size={10} strokeWidth={3} /></button>
                                    </div>

                                    {isWarning && !isExpired && (
                                        <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
                                            <div className="absolute top-[-10px] right-[-10px] bg-amber-400 w-12 h-12 rotate-45 transform origin-bottom-left flex items-end justify-center pb-1">
                                                <AlertTriangle size={8} className="text-background -rotate-45" strokeWidth={3} />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {editingItem && (
                <EditItemModal
                    item={editingItem}
                    onSave={handleSaveEdit}
                    onDismiss={() => setEditingItem(null)}
                />
            )}
        </div>
    );
}

export default InventoryPage;
