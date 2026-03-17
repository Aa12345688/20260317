import { motion } from "framer-motion";

/**
 * 食譜列表骨架屏 (RecipeSkeleton)
 * 用於 LLM 生成食譜或載入食譜列表時的佔位。
 */
export function RecipeSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden animate-pulse">
                    <div className="aspect-[4/3] bg-white/10" />
                    <div className="p-4 space-y-2">
                        <div className="h-4 bg-white/10 rounded-full w-3/4" />
                        <div className="h-2 bg-white/10 rounded-full w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * 庫存列表骨架屏 (InventorySkeleton)
 * 用於庫存資料載入時的佔位。
 */
export function InventorySkeleton() {
    return (
        <div className="space-y-2 px-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-lg bg-white/10 shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/10 rounded-full w-1/3" />
                        <div className="h-2 bg-white/10 rounded-full w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}
