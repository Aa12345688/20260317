import { useNavigate, useParams } from "react-router";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, Clock, ChefHat, Users, Leaf, RefreshCw, Sparkles, BookOpen, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIngredients } from "../../services/IngredientContext";
import { llmService } from "../../services/llmService";
import { recipeDatabase } from "../../data/recipes";
import { RecipeHero } from "../../components/recipes/RecipeHero";
import { IngredientChecklist } from "../../components/recipes/IngredientChecklist";
import { CookingProtocol } from "../../components/recipes/CookingProtocol";

/**
 * 食譜細節與烹調引導頁 (RecipeDetail)
 * 當使用者從「AI 推薦」列表中點擊特定食譜時進入的畫面。
 * 支援功能：
 * 1. 食材勾選清單 (`IngredientChecklist`)
 * 2. 逐步文字料理步驟 (`CookingProtocol`)
 * 3. 系統通知「儲存食譜」到雲端的實作彈窗
 * 4. 如果食譜壞了或不滿意，可以點擊「重新分析」再次推論 LLM 提供新食譜。
 */
export function RecipeDetailPage() {
    const { id } = useParams();
    const nav = useNavigate();
    const { recommendedRecipes, scannedItems, setRecipes, saveRecipe, savedRecipes } = useIngredients();

    const [showSaveModal, setShowSaveModal] = useState(false);

    // 修正：使用 useMemo 確保即使推薦列表非同步更新，詳情頁也能抓到資料
    const recipe = useMemo(() => {
        return recommendedRecipes.find(r => r.id === id) ||
            recipeDatabase.find(r => r.id === id) ||
            savedRecipes.find(r => r.id === id) ||
            null;
    }, [id, recommendedRecipes, savedRecipes]);

    const fallbackRecipe = {
        id: "fallback",
        name: "AI 合成食譜",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
        time: "15 分鐘",
        difficulty: "簡單",
        category: "other",
        matchScore: 100,
        requiredIngredients: ["番茄", "菠菜"],
        optionalIngredients: [],
        description: "智慧生成食譜。",
        substitutionTip: "可以使用其他綠色蔬菜代替菠菜。",
        sustainabilityTip: "使用即將過期的番茄可以減少浪費。",
        steps: [{ title: "初始化", description: "準備食材。" }, { title: "執行", description: "標準烹飪。" }]
    } as any;

    const currentRecipe = recipe || fallbackRecipe;

    const [checked, setChecked] = useState<boolean[]>([]);

    // 初始化勾選狀態
    useEffect(() => {
        if (currentRecipe && currentRecipe.requiredIngredients) {
            setChecked(new Array(currentRecipe.requiredIngredients.length).fill(false));
        }
    }, [currentRecipe]);

    if (!recipe && !id) return null;

    return (
        <div className="pb-32 pt-0 relative">
            <button onClick={() => nav(-1)} className="fixed top-4 left-4 z-[110] w-10 h-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all text-white"><ChevronLeft size={20} /></button>
            <RecipeHero image={currentRecipe.image} name={currentRecipe.name} />
            <div className="px-6 py-6">
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {[{ icon: Clock, value: currentRecipe.time }, { icon: ChefHat, value: currentRecipe.difficulty }, { icon: Users, value: "2-3人份" }].map((s, i) => (
                        <div key={i} className="bg-white/5 rounded-2xl p-4 text-center">
                            <s.icon className="w-4 h-4 mx-auto mb-2 text-primary" />
                            <div className="text-xs font-black text-white">{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Neural Kitchen Elite: AI Insights */}
                {(currentRecipe.sustainabilityTip || currentRecipe.substitutionTip) && (
                    <div className="mb-8 space-y-3">
                        {currentRecipe.substitutionTip && (
                            <div className="bg-amber-400/10 border border-amber-400/20 rounded-2xl p-4 flex gap-3">
                                <RefreshCw size={16} className="text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">智慧食材替代建議</div>
                                    <p className="text-[11px] text-white/70 leading-relaxed font-bold">{currentRecipe.substitutionTip}</p>
                                </div>
                            </div>
                        )}
                        {currentRecipe.sustainabilityTip && (
                            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex gap-3">
                                <Leaf size={16} className="text-primary shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">零浪費智慧 (Zero Waste Tip)</div>
                                    <p className="text-[11px] text-white/70 leading-relaxed font-bold">{currentRecipe.sustainabilityTip}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <IngredientChecklist ingredients={currentRecipe.requiredIngredients} checkedItems={checked} onToggle={(i) => { const n = [...checked]; n[i] = !n[i]; setChecked(n); }} progress={Math.round((checked.filter(Boolean).length / (currentRecipe.requiredIngredients?.length || 1)) * 100)} />
                <CookingProtocol steps={currentRecipe.steps || [{ title: "初始化", description: "準備食材。" }, { title: "執行", description: "標準烹飪。" }]} />

                {/* 重新分析按鈕放置於最底部 */}
                <div className="mt-12 mb-8 px-2">
                    <button
                        onClick={async () => {
                            try {
                                const ingredientsToUse = scannedItems.map(i => i.name);
                                const res = await llmService.generateRecipes({ ingredients: ingredientsToUse });
                                setRecipes(res);
                                alert("AI 食譜已重新合成！");
                            } catch (e: any) {
                                alert("更新食譜失敗");
                            }
                        }}
                        className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-5 rounded-2xl text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:bg-primary/10 transition-all shadow-lg text-center"
                    >
                        <Sparkles size={18} />
                        重新分析並合成新方案
                    </button>
                </div>

                <button
                    onClick={() => {
                        saveRecipe(currentRecipe);
                        setShowSaveModal(true);
                    }}
                    className={`w-full py-5 rounded-2xl font-black text-sm uppercase shadow-lg flex items-center justify-center gap-3 mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all ${savedRecipes.find(r => r.id === currentRecipe.id) ? 'bg-white/10 text-white' : 'bg-primary text-background'}`}
                >
                    <BookOpen size={20} />
                    {savedRecipes.find(r => r.id === currentRecipe.id) ? '已儲存此食譜' : '儲存食譜'}
                </button>
            </div>

            <AnimatePresence>
                {showSaveModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-xl flex items-center justify-center p-6 pb-[15vh] sm:pb-6">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[var(--card)] w-full max-w-sm max-h-[75vh] flex flex-col rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">

                            <button onClick={() => setShowSaveModal(false)} className="absolute right-4 top-4 z-20 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-gray-300 hover:text-white backdrop-blur-md transition-colors">
                                <X size={16} />
                            </button>

                            <div className="p-6 pb-4 shrink-0 relative z-10 border-b border-white/5 bg-[var(--card)]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/10 shadow-lg">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white uppercase tracking-widest">食譜已儲存</h3>
                                        <div className="text-[10px] font-bold tracking-widest text-primary mt-0.5">已同步至雲端與暫存清單</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 overflow-y-auto w-full flex-1 relative z-10 space-y-4 bg-background/30">
                                <div>
                                    <h4 className="font-black text-xl text-white tracking-widest mb-2 leading-tight flex items-start gap-2">
                                        <ChefHat size={18} className="text-primary mt-1 shrink-0" />
                                        {currentRecipe.name}
                                    </h4>
                                    <div className="text-[11px] text-gray-400 font-bold leading-relaxed">{currentRecipe.description}</div>
                                </div>

                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 shadow-inner">
                                    <div className="text-[10px] text-primary mb-3 font-black uppercase tracking-widest flex items-center gap-2">
                                        <ChefHat size={12} />所需食材
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {currentRecipe.requiredIngredients?.map((ing: string, idx: number) => (
                                            <span key={idx} className="bg-black/30 border border-white/10 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold">
                                                {ing}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 shadow-inner">
                                    <div className="text-[10px] text-amber-400 mb-3 font-black uppercase tracking-widest flex items-center gap-2">
                                        <BookOpen size={12} />烹飪步驟
                                    </div>
                                    <div className="space-y-4">
                                        {currentRecipe.steps ? currentRecipe.steps.map((s: any, idx: number) => (
                                            <div key={idx} className="flex gap-3">
                                                <div className="w-6 h-6 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0 border border-amber-400/20">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <div className="text-white font-black text-[11px] tracking-wider mb-1 mt-0.5">{s.title}</div>
                                                    <div className="text-gray-400 text-[10px] leading-relaxed font-bold">{s.description}</div>
                                                </div>
                                            </div>
                                        )) : <div className="text-[10px] text-gray-500 font-bold tracking-widest">無詳細步驟</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 shrink-0 relative z-10 bg-[var(--card)] border-t border-white/5">
                                <button onClick={() => { setShowSaveModal(false); nav("/saved"); }} className="w-full bg-primary text-background py-4 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-[0.98] transition-all">
                                    前往數據統計查看
                                </button>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default RecipeDetailPage;
