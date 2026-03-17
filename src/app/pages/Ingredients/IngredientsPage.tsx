import { useNavigate } from "react-router";
import { ChevronLeft, Trash2, Plus } from "lucide-react";
import { useIngredients } from "../../services/IngredientContext";
import { DetectionRow } from "../../components/inventory_management/DetectionRow";

/**
 * 單一/近期掃描食材結果頁 (Ingredients)
 * 專門顯示系統剛剛辨識到或短期內加入的食材。
 * 可快速增減數量、刪除掃描出錯的項目，或是全部清除。
 */
export function IngredientsPage() {
    const navigate = useNavigate();
    const { scannedItems, updateQuantity, removeItem, clearAll } = useIngredients();
    return (
        <div className="pb-32 pt-6 relative">
            {/* Minimal Floating Back Button */}
            <button onClick={() => navigate(-1)} className="fixed top-4 left-4 z-[110] w-10 h-10 bg-card/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"><ChevronLeft size={20} className="text-white" /></button>
            <div className="px-6 py-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] px-1 flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-primary" />掃描紀錄</h2>
                    <button onClick={clearAll} className="p-2 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-xl border border-red-500/10 text-red-500 transition-all"><Trash2 size={16} /></button>
                </div>
                {scannedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center bg-white/5 rounded-[3.5rem] border border-white/5">
                        <div className="relative mb-8 group"><div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl" /><div className="relative w-24 h-24 bg-card/50 rounded-[2rem] border border-white/10 flex items-center justify-center shadow-2xl"><Plus size={40} className="text-primary/20" /></div></div>
                        <h3 className="text-sm font-black text-white/30 uppercase tracking-widest mb-4">目前無數據暫存</h3>
                        <button onClick={() => navigate("/")} className="flex items-center gap-3 bg-primary text-background px-8 py-4 rounded-2xl font-black uppercase text-[10px] shadow-xl">啟動感測器</button>
                    </div>
                ) : (
                    <div className="space-y-3">{scannedItems.slice(0, 10).map((item) => (<DetectionRow key={item.id} item={item} onUpdate={updateQuantity} onRemove={removeItem} />))}</div>
                )}
            </div>
        </div>
    );
}

export default IngredientsPage;
