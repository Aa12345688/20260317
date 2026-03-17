import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { Sparkles, ChefHat, Palette, Settings, Bell, User, HelpCircle, LogOut, ChevronRight, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIngredients } from "../../services/IngredientContext";
import { llmService } from "../../services/llmService";
import { SettingsModal } from "../../components/profile/SettingsModal";

/**
 * 個人設定頁 (Profile)
 * 提供使用者客製化自己的系統設定，目前實作了：
 * 1. 系統通知開關 (連動 Notification API 提出系統授權申請)
 * 2. 系統外觀深色模式切換 (Dark Mode toggle - 但整個系統目前強制採用暗色賽博龐克為主)
 */
export function ProfilePage() {
    const { settings, updateSettings, clearAll } = useIngredients();
    const nav = useNavigate();
    const [apiStatus, setApiStatus] = useState<{ status: 'online' | 'offline' | 'no_key', model: string, keyCount: number } | null>(null);
    const [activeModal, setActiveModal] = useState<string | null>(null);

    useEffect(() => {
        const check = async () => {
            const status = await llmService.testConnection();
            setApiStatus(status);
        };
        check();
    }, []);

    const settingsGrid = [
        { id: 'api', label: "神經節點", desc: "API & Model", icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10" },
        { id: 'dietary', label: "飲食偏好", desc: "Preferences", icon: ChefHat, color: "text-primary", bg: "bg-primary/10" },
        { id: 'theme', label: "視覺風格", desc: "Premium Theme", icon: Palette, color: "text-rose-400", bg: "bg-rose-500/10" },
        { id: 'display', label: "介面縮放", desc: "UI Scaling", icon: Settings, color: "text-blue-400", bg: "bg-blue-500/10" },
        { id: 'system', label: "系統設定", desc: "System", icon: Bell, color: "text-amber-400", bg: "bg-amber-500/10" },
    ];

    return (
        <div className="pb-28 px-6 pt-6 relative min-h-screen">
            <h2 className="text-center text-[8px] font-black text-white/10 uppercase tracking-[0.4em] mb-6">Neural Core Interface</h2>

            <div className="flex flex-col items-center mb-8">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 rounded-[2rem] bg-card border-4 border-primary/20 flex items-center justify-center shadow-[0_20px_50px_rgba(0,255,136,0.15)] mb-4 relative group"
                >
                    <div className="absolute inset-0 bg-primary/5 rounded-[2rem] animate-pulse group-hover:bg-primary/10 transition-all" />
                    <User size={40} className="text-primary relative z-10" strokeWidth={1} />
                </motion.div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-1.5">管理中心</h2>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">已認證：首席美食品味家</span>
                </div>
            </div>

            {/* Compact Grid of Settings Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                {settingsGrid.map((item) => (
                    <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveModal(item.id)}
                        className="p-5 rounded-3xl bg-[#0d231b]/60 backdrop-blur-xl border border-white/5 flex flex-col items-start gap-4 text-left shadow-xl group transition-all"
                    >
                        <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all`}>
                            <item.icon size={24} className={item.color} />
                        </div>
                        <div>
                            <div className="text-xs font-black text-white uppercase tracking-wider">{item.label}</div>
                            <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{item.desc}</div>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Quick Analytics Link */}
            <button
                onClick={() => nav("/saved")}
                className="w-full flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all mb-4 group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center border border-amber-400/20"><HelpCircle size={24} className="text-amber-400" /></div>
                    <div>
                        <div className="text-xs font-black text-white uppercase tracking-wider">耗損數據分析</div>
                        <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Neural Consumption Dashboard</div>
                    </div>
                </div>
                <ChevronRight size={20} className="text-gray-600 group-hover:text-white transition-all" />
            </button>

            {/* Danger Zone */}
            <button
                onClick={() => {
                    if (window.confirm("確定要清空所有存儲的食材數據嗎？")) {
                        clearAll();
                        alert("數據已重置。");
                    }
                }}
                className="w-full flex items-center gap-4 p-5 bg-red-500/5 rounded-3xl border border-red-500/10 hover:bg-red-500/10 transition-all"
            >
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20"><LogOut size={22} className="text-red-500" /></div>
                <div>
                    <div className="text-xs font-black text-red-500 uppercase tracking-wider">清空所有資料</div>
                    <div className="text-[8px] font-bold text-gray-900/40 uppercase tracking-widest mt-0.5">Danger: Local Storage Clear</div>
                </div>
            </button>

            <AnimatePresence>
                {activeModal && (
                    <SettingsModal
                        type={activeModal}
                        onClose={() => setActiveModal(null)}
                        settings={settings}
                        updateSettings={updateSettings}
                        apiStatus={apiStatus}
                    />
                )}
            </AnimatePresence>

            <div className="text-center mt-12 opacity-20">
                <div className="text-[8px] font-black text-white uppercase tracking-[0.5em]">KITCHEN AI v1.5 / ELITE CORE</div>
            </div>
        </div>
    );
}

export default ProfilePage;
