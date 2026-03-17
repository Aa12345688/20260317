import { Outlet, useLocation, useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { useIngredients } from "../services/IngredientContext";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

/**
 * 主佈局組件 (Main Layout)
 * 這是整個應用的核心外框，所有分頁(Outlet)都會在這個佈局內被渲染。
 * 
 * 功能亮點：
 * 1. 控制全域主題：支援深色 (Dark) 與淺色 (Light) 主題切換 (雖然目前寫死深色賽博龐克為主)。
 * 2. 頁面轉場動畫：利用 `framer-motion` 在每次切換路徑 (Location.pathname) 時，產生平滑的左右滑動轉場過渡。
 * 4. 系統級通知顯示：內建模擬的 `Toast` 系統，負責監聽並彈出「APP內的高能警告通知」。
 */

function hexToRgbValues(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
        [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] :
        [0, 255, 136];
}

function hexToRgb(hex: string) {
    const [r, g, b] = hexToRgbValues(hex);
    return `${r}, ${g}, ${b}`;
}

/**
 * 根據主色自動生成氛圍 (Procedural Atmosphere)
 * bg: 原色深度降低到 5-8%
 * surface: 原色深度降低到 12-15%
 */
function generateAtmosphere(primaryHex: string) {
    const [r, g, b] = hexToRgbValues(primaryHex);

    // 計算亮度 (Luminance) 來決定是否使用淺色模式
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const isLight = luminance > 0.7;

    if (isLight) {
        return {
            bg: "#ffffff",
            surface: "#f8f8f8",
            header: "#f0f0f0",
            light: true
        };
    }

    // 深色模式：計算主色的超暗且略微去飽和版本 (Cyber-Elite Approach)
    const darken = (val: number, factor: number) => Math.floor(val * factor);

    return {
        // 背景更深更冷，減少亮度並保持低飽和度
        bg: `rgb(${darken(r, 0.04)}, ${darken(g, 0.04)}, ${darken(b, 0.05)})`,
        // 卡片背景稍微亮一點，具備層次感
        surface: `rgb(${darken(r, 0.12)}, ${darken(g, 0.12)}, ${darken(b, 0.14)})`,
        // 標頭背景最暗
        header: `rgb(${darken(r, 0.02)}, ${darken(g, 0.02)}, ${darken(b, 0.03)})`,
        light: false
    };
}

// 預設調色盤：精英級專業調校 (Elite Professional Tuning)
// 這裡使用了精心挑選的 Cyberpunk 配色方案，而非簡單的顏色暗化
const STATIC_PALETTES: Record<string, any> = {
    // Neural Mint: 經典駭客綠
    "#00ff88": { name: "Neural Mint", bg: "#020a06", surface: "#0a1f16", header: "#010503" },
    // Arctic Blue: 純淨冷酷的未來藍
    "#007aff": { name: "Arctic Blue", bg: "#010612", surface: "#081531", header: "#01030a" },
    // Solar Orange: 熾熱的能源核心
    "#ff8800": { name: "Solar Orange", bg: "#0a0602", surface: "#1a1006", header: "#050301" },
    // Ghost Purple: 虛擬現實般的迷幻紫
    "#af52ff": { name: "Ghost Purple", bg: "#07020a", surface: "#15081f", header: "#030105" },
    // Cyber Gold: 重裝精英的黃金配色
    "#d4af37": { name: "Cyber Gold", bg: "#070602", surface: "#151308", header: "#030201", light: false },
    // Crimson Overdrive: 充滿壓迫感的深紅
    "#ff0000": { name: "Crimson Overdrive", bg: "#0a0202", surface: "#1f0a0a", header: "#050101" }
};

export function MainLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { settings } = useIngredients();

    // --- UI Scaling / Auto-Adapt Logic ---
    const [calculatedScale, setCalculatedScale] = useState(settings.uiScale);

    useEffect(() => {
        if (!settings.autoScale) {
            setCalculatedScale(settings.uiScale);
            return;
        }

        const handleResize = () => {
            // 自動適應：以 430px 為標準寬度進行縮放
            const scale = Math.min(window.innerWidth / 430, 1.2); // 最高縮放至 1.2
            setCalculatedScale(scale);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [settings.autoScale, settings.uiScale]);

    // 定義可以讓使用者橫向滑動輪轉的主要功能分頁排序
    const tabs = ["/", "/inventory", "/recipes", "/saved", "/profile"];
    // 取得當下畫面處在哪一個分頁索引，用來計算左右切換的方向
    const currentIndex = tabs.findIndex(t => t === location.pathname || (t !== '/' && location.pathname.startsWith(t)));

    // 處理觸控滑動結束的核心邏輯
    const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
        const threshold = 100; // 滑動距離超過 100 像素才觸發切換
        if (info.offset.x > threshold && currentIndex > 0) {
            navigate(tabs[currentIndex - 1]); // 往左翻
        } else if (info.offset.x < -threshold && currentIndex < tabs.length - 1 && currentIndex !== -1) {
            navigate(tabs[currentIndex + 1]); // 往右翻
        }
    };

    const [toast, setToast] = useState<{ title: string, body: string } | null>(null);

    useEffect(() => {
        const handleNotification = (e: any) => {
            setToast({ title: e.detail.title, body: e.detail.body });
            // 5秒後自動關閉
            setTimeout(() => {
                setToast(null);
            }, 5000);
        };
        window.addEventListener('app-notification', handleNotification);
        return () => window.removeEventListener('app-notification', handleNotification);
    }, []);

    const isScaled = settings.autoScale || settings.uiScale !== 1.0;

    const activeColor = settings.themeColor || "#00ff88";
    const atmosphere = STATIC_PALETTES[activeColor] || generateAtmosphere(activeColor);

    return (
        <div className={`min-h-screen bg-black flex justify-center w-full overflow-hidden ${!settings.darkMode ? 'light-theme' : ''}`}>
            <div
                className="w-full max-w-[430px] min-h-screen relative flex flex-col shadow-2xl overflow-hidden filter-theme origin-top"
                style={{
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    transform: isScaled ? `scale(${calculatedScale})` : 'none',
                    height: isScaled ? `${100 / calculatedScale}vh` : '100vh',
                    width: isScaled ? `${430 * calculatedScale}px` : '100%',
                    marginBottom: isScaled ? `-${100 * (1 - calculatedScale)}%` : 0,
                    // Dynamic Theme Variables
                    '--primary': activeColor,
                    '--primary-rgb': hexToRgb(activeColor),
                    '--primary-glow': `${activeColor}40`,
                    '--background': atmosphere.bg,
                    '--card': atmosphere.surface,
                    '--header-bg': atmosphere.header,
                    '--foreground': atmosphere.light ? "#1a4d3d" : "#ffffff"
                } as any}
            >
                <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth" style={{ backgroundColor: 'var(--background)' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={handleDragEnd}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="touch-pan-y min-h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
                <BottomNav />

                {/* 網頁內建模擬通知系統，保證能看到 (Cyberpunk 風格) */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, y: -50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] z-[9999] pointer-events-none"
                        >
                            <div className="bg-card/90 backdrop-blur-xl border border-red-500/50 rounded-2xl p-4 shadow-[0_10px_40px_rgba(239,68,68,0.3)] flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 border border-red-500/50">
                                    <Bell size={18} className="text-red-500" />
                                </div>
                                <div>
                                    <h4 className="text-red-500 font-black text-[11px] tracking-widest uppercase mb-1 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">
                                        {toast.title}
                                    </h4>
                                    <p className="text-xs text-white font-bold leading-relaxed">
                                        {toast.body}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
