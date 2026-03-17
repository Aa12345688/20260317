import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { ChevronLeft, Sparkles, ChefHat } from "lucide-react";
import { useIngredients } from "../../services/IngredientContext";
import { llmService } from "../../services/llmService";
import { getRecommendedRecipes } from "../../data/recipes";
import { RecipeCard } from "../../components/recipes/RecipeCard";
import { IngredientCloud } from "../../components/recipes/IngredientCloud";

import { RecipeSkeleton } from "../../components/feedback/SkeletonScreens";

/**
 * AI 食譜生成頁 (Recipes)
 * 負責觸發大語言模型 (LLM) 呼叫，為用戶提供最佳的「清空方案」。
 * 從上下文中取得所有庫存食材，並透過 `llmService` 產生符合現有材料的創意食譜。
 */
export function RecipesPage() {
    const navigate = useNavigate();
    const { scannedItems, recommendedRecipes, setRecipes } = useIngredients();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (scannedItems.length > 0 && recommendedRecipes.length === 0) {
            const fetchRecipes = async () => {
                setIsLoading(true);
                try {
                    const res = await llmService.generateRecipes({ ingredients: scannedItems.map(i => i.name) });
                    setRecipes(res);
                } catch (error) {
                    setRecipes(getRecommendedRecipes(scannedItems)); // Local fallback
                } finally { setIsLoading(false); }
            };
            fetchRecipes();
        } else { setIsLoading(false); }
    }, [scannedItems, recommendedRecipes, setRecipes]);

    return (
        <div className="pb-28 pt-6 relative">
            {/* Minimal Floating Back Button */}
            <button onClick={() => navigate(-1)} className="fixed top-4 left-4 z-[110] w-10 h-10 bg-card/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"><ChevronLeft size={20} className="text-white" /></button>
            <div className="px-6 py-4">
                <div className="mb-6">
                    <IngredientCloud items={scannedItems} onAddMore={() => navigate("/inventory")} />
                </div>
                {isLoading ? (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Neural Synthesis In Progress...</span>
                        </div>
                        <RecipeSkeleton />
                    </div>
                ) : recommendedRecipes.length > 0 ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            {recommendedRecipes.map((r) => (
                                <RecipeCard key={r.id} recipe={r} onClick={() => navigate(`/recipe/${r.id}`)} getCategoryLabel={(c) => c === "vegetable" ? "蔬菜" : c === "fruit" ? "水果" : c === "meat" ? "肉類" : "綜合"} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 px-6 bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/5"><div className="w-16 h-16 mx-auto mb-4 bg-primary/5 rounded-full flex items-center justify-center"><ChefHat size={32} className="text-primary/20" /></div><h4 className="text-white font-black text-xs uppercase mb-2">未發現相容方案</h4><button onClick={() => navigate("/")} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-background rounded-2xl font-black uppercase text-[9px]">返回掃描</button></div>
                )}
            </div>
        </div>
    );
}

export default RecipesPage;
