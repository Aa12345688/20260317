import { useNavigate } from "react-router";
import { ChevronLeft, BookOpen, Trash2 } from "lucide-react";
import { useIngredients } from "../../services/IngredientContext";
import { NeuralAnalyticsDashboard } from "../../components/analytics/NeuralAnalyticsDashboard";
import { RecipeCard } from "../../components/recipes/RecipeCard";

/**
 * 系統數據中心 / 保存內容頁 (Saved / Data Statistics)
 * 本頁面整合了 NeuralAnalyticsDashboard 作為主要視覺呈現區塊。
 * 當未來有實作「我的最愛食譜」時，這頁面也會用來陳列使用者過去儲存的高品質 AI 生成食譜。
 */
export function SavedPage() {
    const nav = useNavigate();
    const { wasteHistory, scannedItems, savedRecipes, unsaveRecipe } = useIngredients();

    return (
        <div className="pb-28 pt-6 relative">
            <button onClick={() => nav(-1)} className="fixed top-4 left-4 z-[110] w-10 h-10 bg-[#0d231b]/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"><ChevronLeft size={20} className="text-white" /></button>
            <div className="px-6 mb-8 mt-2 text-left">
                <NeuralAnalyticsDashboard data={wasteHistory} scannedItems={scannedItems} />
            </div>

            {savedRecipes.length === 0 ? (
                <div className="px-4 flex flex-col items-center justify-center py-10 text-center bg-white/5 rounded-2xl border border-white/5 mx-4">
                    <div className="w-16 h-16 bg-primary/5 rounded-full border border-primary/10 flex items-center justify-center mb-4">
                        <BookOpen size={28} className="text-primary/20" />
                    </div>
                    <h2 className="text-[10px] font-black text-white/50 uppercase mb-4 tracking-widest">暫無儲存的食譜方案</h2>
                    <button onClick={() => nav("/")} className="bg-primary text-background px-8 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:scale-105 transition-all">
                        啟動掃描器去發掘
                    </button>
                </div>
            ) : (
                <div className="px-4 space-y-3">
                    <h3 className="text-[9px] font-black text-white/30 uppercase tracking-widest px-1">我的收藏食譜 ({savedRecipes.length})</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {savedRecipes.map((recipe) => (
                            <div key={recipe.id} className="relative group">
                                <RecipeCard
                                    recipe={recipe}
                                    onClick={() => nav(`/recipe/${recipe.id}`)}
                                    getCategoryLabel={(c) => c === "vegetable" ? "蔬菜" : c === "fruit" ? "水果" : c === "meat" ? "肉類" : "綜合"}
                                />
                                <button
                                    onClick={(e) => { e.stopPropagation(); unsaveRecipe(recipe.id); }}
                                    className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-red-500/20 text-red-500 border border-red-500/20 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SavedPage;
