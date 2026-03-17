import { useNavigate } from "react-router";
import { ArrowLeft, Menu, Sparkles } from "lucide-react";
import { ReactNode } from "react";

// --- PageHeader ---
interface PageHeaderProps {
    showBackButton?: boolean; // 決定是否要顯示左側的「返回上一頁」箭頭，否則顯示漢堡選單圖示
    title?: string; // 頁面置中顯示的標題名稱
    rightAction?: ReactNode; // 右側自訂的按鈕或內容 (例如: 新增按鈕、設定按鈕等)
}

/**
 * 共用組件: 頁面頂部導覽列 (PageHeader)
 * 負責渲染每一個分頁最上方的導航區塊，支援毛玻璃透視效果與 sticky 固定置頂。
 * 
 * 作用：
 * 1. 提供統一的設計風格 (賽博龐克字體、加上綠色小星星)。
 * 2. 右側可插入自訂動作 (通過 `rightAction` 傳入)。
 * 3. 處理「上一頁」的返回邏輯，或是顯示選單圖示。
 */
export function PageHeader({ showBackButton = false, title = "KITCHEN AI", rightAction }: PageHeaderProps) {
    const navigate = useNavigate();

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-[400px] pointer-events-none">
            <header className="flex items-center justify-between px-4 py-2 bg-[var(--header-bg)]/90 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_20px_40px_-5px_rgba(0,0,0,0.6)] pointer-events-auto">
                <div className="flex items-center gap-1.5">
                    {showBackButton && (
                        <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-white/5 rounded-full transition-colors">
                            <ArrowLeft size={18} />
                        </button>
                    )}
                </div>

                <h1 className="text-sm flex items-center gap-1.5 font-bold tracking-tight">
                    <Sparkles size={14} className="text-primary" />
                    {title.toUpperCase()}
                </h1>

                <div className="flex items-center gap-1.5">
                    {rightAction}
                </div>
            </header>
        </div>
    );
}

// --- ImageWithFallback ---
// (We will add more shared components here as we find them)
