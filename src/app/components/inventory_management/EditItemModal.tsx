import { useState } from "react";
import { X, Edit2, ChefHat, Snowflake, AlertTriangle } from "lucide-react";

/**
 * 食材編輯對話框 (EditItemModal)
 * 當使用者點擊「編輯」按鈕時會彈出這一個燈箱。
 * 允許修改食材的名稱、關聯分類、保存位置 (冷藏/冷凍) 以及它的存放有效期限。
 * 當有效期限設為0，會觸發動態的紅色過期警告 UI 讓用戶確認。
 */
export function EditItemModal({ item, onSave, onDismiss }: { item: any, onSave: (id: string, updates: any) => void, onDismiss: () => void }) {
    const [name, setName] = useState(item.name);
    const [category, setCategory] = useState(item.category || "其他");
    const [storageType, setStorageType] = useState(item.storageType || "fridge");
    const [expiryDays, setExpiryDays] = useState(item.expiryDays !== undefined ? item.expiryDays : 7);
    const [confirmingZero, setConfirmingZero] = useState(false);

    const handleConfirmSave = () => {
        if (expiryDays === 0 && !confirmingZero) {
            setConfirmingZero(true);
            return;
        }
        onSave(item.id, { name, category, storageType, expiryDays });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-xl flex items-center justify-center p-6">
            <div className="bg-card w-full max-w-sm rounded-[2.5rem] p-6 border border-white/10 shadow-2xl relative">
                <button onClick={onDismiss} className="absolute right-6 top-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white">
                    <X size={16} />
                </button>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    <Edit2 size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider mb-6">編輯食材資訊</h3>

                <div className="space-y-4 mb-8">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-widest">食材名稱</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-primary outline-none transition-colors" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-widest">分類標籤</label>
                        <div className="flex flex-wrap gap-2">
                            {["蔬菜", "水果", "肉類", "海鮮", "乳製品", "五穀", "其他"].map(c => (
                                <button key={c} onClick={() => setCategory(c)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase border transition-all ${category === c ? 'bg-primary text-background border-primary' : 'bg-white/5 text-gray-400 border-white/10'}`}>{c}</button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-widest">保存位置</label>
                            <div className="flex bg-background p-1 rounded-xl border border-white/10">
                                <button onClick={() => setStorageType('fridge')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1 ${storageType === 'fridge' ? 'bg-white/10 text-white' : 'text-gray-500'}`}><ChefHat size={12} />冷藏</button>
                                <button onClick={() => setStorageType('freezer')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1 ${storageType === 'freezer' ? 'bg-blue-500/20 text-blue-300' : 'text-gray-500'}`}><Snowflake size={12} />冷凍</button>
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-500 mb-2 block tracking-widest">保鮮期 (天)</label>
                            <input type="number" min="0" value={expiryDays} onChange={(e) => setExpiryDays(parseInt(e.target.value) || 0)} className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-primary outline-none transition-colors text-center" />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {confirmingZero && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-4 animate-in fade-in slide-in-from-bottom-2">
                            <h4 className="text-red-500 font-black text-xs uppercase tracking-widest mb-1 flex items-center gap-2">
                                <AlertTriangle size={14} />警告：直接標記過期
                            </h4>
                            <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                                您將保存期限設為 0 天，食材將立刻被歸類至「已過期」。若確定請再次點擊下方按鈕。
                            </p>
                        </div>
                    )}

                    <button onClick={handleConfirmSave} className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${confirmingZero ? 'bg-red-500 text-white' : 'bg-primary text-background'}`}>
                        {confirmingZero ? '確定標記為過期' : '更新資料 (Update)'}
                    </button>
                    {confirmingZero && (
                        <button onClick={() => setConfirmingZero(false)} className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest text-gray-400 hover:text-white bg-white/5 transition-all">
                            取消操作 (Cancel)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
