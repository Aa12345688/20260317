import { useState } from "react";
import { X, Settings, Sparkles, Bell, Moon, AlertTriangle, Loader2, Package, ChefHat, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { llmService } from "../../services/llmService";
import { notificationService } from "../../services/notificationService";

/**
 * Settings Modal Component
 * A high-fidelity, unified modal for all configurations.
 */
export function SettingsModal({ type, onClose, settings, updateSettings, apiStatus }: {
    type: string,
    onClose: () => void,
    settings: any,
    updateSettings: (s: any) => void,
    apiStatus: any
}) {
    const [selectedModel, setSelectedModel] = useState<string | null>(() => llmService.getPreferredModel());
    const [pendingColor, setPendingColor] = useState(settings.themeColor || "var(--primary-default)");
    const [isApplying, setIsApplying] = useState(false);

    const renderContent = () => {
        switch (type) {
            case 'api':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between bg-black/40 p-5 rounded-3xl border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${apiStatus?.status === 'online' ? 'bg-primary shadow-primary/40' :
                                    apiStatus?.status === 'no_key' ? 'bg-amber-400 shadow-amber-400/40' :
                                        apiStatus ? 'bg-red-500 shadow-red-500/40' : 'bg-gray-500'
                                    }`} />
                                <div>
                                    <div className="text-xs font-black text-white uppercase">{apiStatus?.status === 'online' ? '服務連線中' : apiStatus?.status === 'no_key' ? '未偵測金鑰' : '節點離線'}</div>
                                    <div className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">系統已鎖定 {apiStatus?.keyCount || 0} 個神經節點</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <h4 className="text-[9px] font-black text-primary uppercase tracking-widest">金鑰管理</h4>
                                {settings.customApiKeys && <button onClick={() => updateSettings({ customApiKeys: "" })} className="text-[8px] font-black text-red-500/50 uppercase">清除</button>}
                            </div>
                            <input
                                type="password"
                                placeholder="貼上 API Key (多組請用逗號分隔)"
                                value={settings.customApiKeys || ""}
                                onChange={(e) => updateSettings({ customApiKeys: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono text-primary outline-none focus:border-primary/30 shadow-inner transition-all"
                            />
                        </div>

                        {/* Node Status Monitor */}
                        <div className="space-y-2 mt-4">
                            <h4 className="text-[7px] font-black text-white/20 uppercase tracking-widest px-1">即時節點監控 (Nodes Monitor)</h4>
                            <div className="grid grid-cols-1 gap-1.5">
                                {llmService.getKeyStatusList().length > 0 ? (
                                    llmService.getKeyStatusList().map((keyInfo, idx) => {
                                        const isActive = llmService.getActiveKeyInfo() === keyInfo.masked;
                                        return (
                                            <div key={idx} className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${keyInfo.coolingDown ? 'bg-red-500/10 border-red-500/20' : isActive ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_var(--primary-glow)]' : 'bg-black/20 border-white/5'}`}>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${keyInfo.coolingDown ? 'bg-amber-400 animate-pulse' : 'bg-primary'} ${isActive ? 'shadow-[0_0_8px_var(--primary)]' : ''}`} />
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-mono text-white/60">Node-{idx + 1}: {keyInfo.masked}</span>
                                                        {keyInfo.isCustom && <span className="text-[6px] font-black text-primary/60 uppercase tracking-tighter">使用者自定義金鑰</span>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isActive && !keyInfo.coolingDown && <div className="text-[7px] font-black text-primary bg-primary/20 px-1.5 py-0.5 rounded-sm uppercase tracking-widest animate-pulse">In Use</div>}
                                                    <div className={`text-[7px] font-black uppercase ${keyInfo.coolingDown ? 'text-amber-400' : 'text-primary opacity-40'}`}>
                                                        {keyInfo.coolingDown ? `Cooldown ${keyInfo.cooldownRemaining}s` : 'Verified'}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-[9px] font-bold text-red-500/40 uppercase tracking-widest p-3 bg-red-500/5 rounded-xl border border-red-500/10 text-center">未偵測到有效節點</div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-[9px] font-black text-white/30 uppercase tracking-widest px-1">優先神經模型</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {llmService.getAvailableModels().map((m, idx) => {
                                    const isRecommended = m.includes('3.1-flash-lite');
                                    const isNew = m.startsWith('gemini-3');
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                const next = selectedModel === m ? null : m;
                                                llmService.setPreferredModel(next);
                                                setSelectedModel(next);
                                            }}
                                            className={`relative px-3 py-3 rounded-2xl text-[8px] font-black uppercase tracking-tighter border transition-all flex flex-col items-center justify-center gap-1 ${selectedModel === m ? 'bg-primary border-primary text-[var(--background)] shadow-lg scale-105' : 'bg-black/40 border-white/5 text-white/40 hover:border-white/20'
                                                }`}
                                        >
                                            {isRecommended && (
                                                <span className="absolute -top-2 px-1.5 py-0.5 bg-amber-400 text-background rounded-full text-[6px] font-black animate-pulse shadow-sm">額度最優</span>
                                            )}
                                            {isNew && !isRecommended && (
                                                <span className="absolute -top-2 px-1.5 py-0.5 bg-purple-500 text-white rounded-full text-[6px] font-black shadow-sm">最新版本</span>
                                            )}
                                            <span className="z-10">{m.replace('gemini-', '').toUpperCase()}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            case 'dietary':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'vegetarian', label: "素食模式 (Vegetarian)", desc: "排除肉類與海鮮食譜", icon: Package },
                                { id: 'lowCalorie', label: "減脂/低卡 (Weight Loss)", desc: "推薦低油鹽高纖維方案", icon: ChefHat }
                            ].map(pref => (
                                <div key={pref.id} className="flex items-center justify-between bg-black/40 p-5 rounded-3xl border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20"><pref.icon size={20} className="text-primary" /></div>
                                        <div>
                                            <div className="text-[10px] font-black text-white uppercase">{pref.label}</div>
                                            <div className="text-[8px] text-gray-500 font-bold uppercase">{pref.desc}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => updateSettings({ dietary: { ...settings.dietary, [pref.id]: !settings.dietary[pref.id] } })}
                                        className={`w-12 h-6 rounded-full relative transition-all ${settings.dietary[pref.id] ? 'bg-primary' : 'bg-white/10'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.dietary[pref.id] ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[9px] font-black text-amber-400 uppercase tracking-widest px-1">過敏原與禁忌 (Allergies)</h4>
                            <input
                                type="text"
                                placeholder="例如：花生, 海鮮, 蠶豆..."
                                value={settings.dietary.allergies || ""}
                                onChange={(e) => updateSettings({ dietary: { ...settings.dietary, allergies: e.target.value } })}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white placeholder:text-white/10 outline-none focus:border-primary/30 font-bold transition-all"
                            />
                        </div>
                    </div>
                );
            case 'theme':
                return (
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h4 className="text-[9px] font-black text-rose-400 uppercase tracking-widest px-1">核心主題色 (Premium Elite Accents)</h4>
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { name: "Neural Mint", color: "#00ff88", desc: "Elite Hacker Green" },
                                    { name: "Arctic Blue", color: "#007aff", desc: "Digital Chill" },
                                    { name: "Ghost Purple", color: "#af52ff", desc: "Neural Drift" },
                                    { name: "Solar Orange", color: "#ff8800", desc: "Nuclear Energy" },
                                    { name: "Cyber Gold", color: "#d4af37", desc: "Elite Standard" },
                                    { name: "Crimson Node", color: "#ff4d4d", desc: "Emergency Mode" }
                                ].map(c => (
                                    <button
                                        key={c.color}
                                        onClick={() => setPendingColor(c.color)}
                                        className={`group relative aspect-square rounded-2xl border-2 transition-all flex items-center justify-center ${pendingColor === c.color ? 'border-white scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'border-white/5 hover:border-white/20'
                                            }`}
                                        style={{ backgroundColor: `${c.color}15` }}
                                    >
                                        <div
                                            className="w-6 h-6 rounded-full shadow-lg transition-transform group-hover:scale-110"
                                            style={{ backgroundColor: c.color }}
                                        />
                                        {pendingColor === c.color && (
                                            <motion.div
                                                layoutId="selected-theme"
                                                className="absolute -inset-1 rounded-[1.2rem] border-2 border-white/40 pointer-events-none"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-black/40 p-5 rounded-3xl border border-white/5">
                            <h4 className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-3">預覽效果</h4>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${pendingColor}20`, color: pendingColor }}>
                                    <Sparkles size={16} />
                                </div>
                                <div className="text-[10px] font-bold text-white/80">目前主題色：{pendingColor.toUpperCase()}</div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setIsApplying(true);
                                setTimeout(() => {
                                    updateSettings({ themeColor: pendingColor });
                                    setIsApplying(false);
                                }, 600);
                            }}
                            disabled={isApplying || pendingColor === settings.themeColor}
                            className={`w-full py-5 rounded-3xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl ${pendingColor === settings.themeColor
                                ? 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
                                : 'bg-primary text-[var(--background)] shadow-[0_0_30px_var(--primary-glow)] active:scale-95'
                                }`}
                            style={pendingColor !== settings.themeColor ? { backgroundColor: pendingColor } : {}}
                        >
                            {isApplying ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                            {isApplying ? '正在同步鏈結...' : (pendingColor === settings.themeColor ? '已套用此風格' : '套用視覺風格')}
                        </button>

                        <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed text-center px-4">
                            套用主題將會切換全系統配色、背景氛圍與亮點分布。
                        </div>
                    </div>
                );
            case 'display':
                return (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between bg-black/40 p-5 rounded-3xl border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20"><Sparkles size={20} className="text-blue-400" /></div>
                                <div>
                                    <div className="text-[10px] font-black text-white uppercase">螢幕尺寸自適應</div>
                                    <div className="text-[8px] text-gray-500 font-bold uppercase">自動偵測寬度進行縮放</div>
                                </div>
                            </div>
                            <button
                                onClick={() => updateSettings({ autoScale: !settings.autoScale })}
                                className={`w-12 h-6 rounded-full relative transition-all ${settings.autoScale ? 'bg-blue-400' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.autoScale ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>

                        {!settings.autoScale && (
                            <div className="space-y-6 px-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">手動縮放比例</span>
                                    <span className="text-xl font-black text-blue-400">{Math.round(settings.uiScale * 100)}%</span>
                                </div>
                                <input
                                    type="range" min="0.5" max="1.5" step="0.05"
                                    value={settings.uiScale}
                                    onChange={(e) => updateSettings({ uiScale: parseFloat(e.target.value) })}
                                    className="w-full h-2 bg-white/10 rounded-full appearance-none outline-none accent-blue-400"
                                />
                                <div className="flex justify-between text-[6px] font-black text-white/20 uppercase tracking-[0.2em]">
                                    <span>Compact (50%)</span>
                                    <span>Expansion (150%)</span>
                                </div>
                            </div>
                        )}

                        <button onClick={() => updateSettings({ uiScale: 1.0, autoScale: true })} className="w-full py-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase tracking-widest">還原出廠設定</button>
                    </div>
                );
            case 'system':
                return (
                    <div className="space-y-6">
                        {[
                            { id: 'notifications', label: "系統主動通知", desc: "食材效期預警提醒", icon: Bell, action: async () => { const g = await notificationService.requestPermission(); updateSettings({ notifications: !settings.notifications && g }); } },
                            { id: 'darkMode', label: "賽博深色模式", desc: "Cyberpunk Aesthetic", icon: Moon, action: () => updateSettings({ darkMode: !settings.darkMode }) },
                            { id: 'neuralOptimized', label: "神經性能優化", desc: "Neural Engine Boost", icon: Sparkles, action: () => updateSettings({ neuralOptimized: !settings.neuralOptimized }), color: 'bg-purple-500' }
                        ].map(sys => (
                            <div key={sys.id} className="flex items-center justify-between bg-black/40 p-5 rounded-3xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10"><sys.icon size={20} className="text-white/60" /></div>
                                    <div>
                                        <div className="text-[10px] font-black text-white uppercase">{sys.label}</div>
                                        <div className="text-[8px] text-gray-500 font-bold uppercase">{sys.desc}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={sys.action}
                                    className={`w-12 h-6 rounded-full relative transition-all ${settings[sys.id] ? (sys.color || 'bg-primary') : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings[sys.id] ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                        ))}

                        <div className="p-4 bg-amber-400/5 border border-amber-400/10 rounded-2xl">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle size={14} className="text-amber-400" />
                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">iOS 用戶提示</span>
                            </div>
                            <p className="text-[8px] text-gray-400 font-bold leading-relaxed uppercase">請透過「加入主畫面」方式開啟網頁，方可啟用主動通知功能。</p>
                        </div>

                        <button onClick={() => notificationService.send("驗證通知", "Neural Core 通道已串接成功。")} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-all">發送診斷訊號</button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-background/80 backdrop-blur-2xl flex items-end sm:items-center justify-center p-0 sm:p-6"
        >
            <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-card w-full max-w-lg rounded-t-[3rem] sm:rounded-[3.5rem] p-8 border-t sm:border border-white/10 shadow-[0_-20px_80px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                <div className="flex items-center justify-between mb-10 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-lg">
                            <Settings size={22} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-widest">
                                {type === 'api' ? '神經節點設定' : type === 'dietary' ? '個人飲食偏好' : type === 'display' ? '視覺介面縮放' : '核心系統設定'}
                            </h3>
                            <div className="text-[8px] font-bold text-primary uppercase tracking-widest opacity-60">Neural Matrix Configuration</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center text-gray-400 hover:text-white backdrop-blur-md border border-white/5 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto pr-2 custom-scrollbar relative z-10 pb-4">
                    {renderContent()}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 relative z-10 flex justify-center">
                    <button onClick={onClose} className="w-full py-4 rounded-2xl bg-primary text-[var(--background)] font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">
                        更新並關閉介面
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
