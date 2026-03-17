/**
 * LLM 食譜生成服務 (LLM Recipe Generation Service - Direct Gemini API)
 * 
 * 這個模組負責與 Google Gemini API 進行通訊，
 * 根據用戶提供的食材清單動態生成食譜建議。
 * 支援多模型輪詢與多金鑰自動切換。
 */

export interface LLMRecipeRequest {
    ingredients: string[]; // 用戶擁有的食材
    preferences?: string; // 用戶偏好 (可選)
}

export interface LLMRecipe {
    id: string;
    name: string;
    image: string;
    time: string;
    difficulty: "easy" | "medium" | "hard";
    category: "vegetable" | "fruit" | "meat" | "mixed";
    requiredIngredients: string[];
    description: string;
    matchScore: number;
    steps?: { title: string; description: string }[];
}

// 支援的模型列表，按優先順序排列 (優先使用最新且穩定的版本)
const GEMINI_MODELS = [
    "gemini-3.1-flash-lite", 
    "gemini-3-flash",
    "gemini-2.5-flash", 
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash", 
    "gemini-1.5-flash", 
    "gemini-1.5-pro"
];

class LLMService {
    private currentModelIndex = 0;
    private apiKeyIndex = 0;
    private preferredModel: string | null = null;

    // 記錄每個 key 的冷卻時間 (429 後暫停)
    private keyCooldowns: Record<string, number> = {};
    // 記錄模型是否失效 (404 後略過)
    private modelAvailability: Record<string, boolean> = {};

    private readonly MAX_RETRIES = 2;
    private readonly COOLDOWN_MS = 60000; // 延長冷卻時間至 60s

    setPreferredModel(model: string | null) {
        this.preferredModel = model;
        if (model) {
            const idx = GEMINI_MODELS.indexOf(model);
            if (idx !== -1) this.currentModelIndex = idx;
        }
    }

    getPreferredModel(): string | null {
        return this.preferredModel;
    }

    private getApiKeys(): string[] {
        const keys = import.meta.env.VITE_LLM_API_KEY || "";
        return keys.split(",").map((k: string) => k.trim()).filter((k: string) => k !== "");
    }

    private isKeyCoolingDown(key: string): boolean {
        const coolUntil = this.keyCooldowns[key];
        return coolUntil ? Date.now() < coolUntil : false;
    }

    private setKeyCooldown(key: string): void {
        this.keyCooldowns[key] = Date.now() + this.COOLDOWN_MS;
    }

    /**
     * 底層 API 調用邏輯 (Unified Fetch)
     */
    private async baseRequest(model: string, apiKey: string, body: any): Promise<any> {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (response.status === 404) {
                this.modelAvailability[model] = false; // 標記模型無效
                throw { status: 404, message: `Model ${model} not found` };
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw { 
                    status: response.status, 
                    message: errorData.error?.message || `API Error ${response.status}` 
                };
            }

            return await response.json();
        } catch (e: any) {
            if (!e.status) throw { status: 500, message: e.message || "Network Error" };
            throw e;
        }
    }

    /**
     * 核心排程器：處理轉向、冷卻與失敗重試
     */
    private async scheduledRequest(payloadBuilder: (model: string) => any): Promise<any> {
        const apiKeys = this.getApiKeys();
        if (apiKeys.length === 0) throw { status: 401, message: "No API Keys configured" };

        const testModels = this.preferredModel ? [this.preferredModel, ...GEMINI_MODELS.filter(m => m !== this.preferredModel)] : GEMINI_MODELS;

        for (const model of testModels) {
            if (this.modelAvailability[model] === false) continue; // 跳過已知無效模型

            for (let k = 0; k < apiKeys.length; k++) {
                const keyIdx = (this.apiKeyIndex + k) % apiKeys.length;
                const key = apiKeys[keyIdx];

                if (this.isKeyCoolingDown(key)) continue;

                for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
                    try {
                        console.log(`[LLM] 嘗試 ${model} | Key #${keyIdx + 1}`);
                        const result = await this.baseRequest(model, key, payloadBuilder(model));
                        
                        // 成功，鎖定當前索引以優化下次速度
                        this.apiKeyIndex = keyIdx;
                        return result;
                    } catch (error: any) {
                        console.warn(`[LLM] ${model} 失敗: ${error.message}`);
                        
                        if (error.status === 429) {
                            this.setKeyCooldown(key);
                            break; // 切換 Key
                        }
                        if (error.status === 404) break; // 切換模型
                        if (error.status === 400) break; // 參數錯誤，切換
                        
                        // 其他錯誤（500/網路）重試一次
                        if (attempt === this.MAX_RETRIES - 1) break;
                        await new Promise(r => setTimeout(r, 1000));
                    }
                }
            }
        }
        throw new Error("All nodes and models exhausted");
    }

    async generateRecipes(request: LLMRecipeRequest): Promise<LLMRecipe[]> {
        try {
            const data = await this.scheduledRequest((model) => ({
                contents: [{ parts: [{ text: this.getRecipePrompt(request) }] }],
                generationConfig: {
                    temperature: 0.3, // 降低隨機性，更符合家常與實用性
                    responseMimeType: "application/json"
                }
            }));

            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error("Empty AI response");

            const recipes = JSON.parse(text);
            return recipes.map((r: any) => ({
                id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                name: r.name || "AI 家常料理",
                image: this.getPlaceholderImage(r.category),
                time: r.time || "20 min",
                difficulty: r.difficulty || "easy",
                category: r.category || "mixed",
                // 確保一定是陣列，避免前端 map 崩潰
                requiredIngredients: this.normalizeArray(r.requiredIngredients || request.ingredients),
                description: r.description || "符合現有食材的實用食譜建議。",
                matchScore: r.matchScore || 90,
                steps: this.normalizeSteps(r.steps)
            }));
        } catch (e) {
            console.error("[LLM] 生成食譜最終失敗:", e);
            return this.getLocalFallback(request.ingredients);
        }
    }

    private getRecipePrompt(request: LLMRecipeRequest): string {
        let dietaryInfo = "";
        if (request.preferences) {
            try {
                const prefs = JSON.parse(request.preferences);
                const dietaryParts = [];
                if (prefs.vegetarian) dietaryParts.push("素食 (Vegetarian)");
                if (prefs.lowCalorie) dietaryParts.push("減脂/低卡 (Low Calorie / Diet)");
                if (prefs.allergies) dietaryParts.push(`過敏原禁忌：${prefs.allergies}`);
                
                if (dietaryParts.length > 0) {
                    dietaryInfo = `\n**用戶個人偏好設定**：\n${dietaryParts.map(p => `- ${p}`).join("\n")}\n請務必嚴格遵守上述偏好與過敏限制。`;
                }
            } catch (e) {
                console.warn("Failed to parse dietary preferences", e);
            }
        }

        return `你是一位擅長傳統家常菜的資深主廚。
請根據用戶擁有的食材：${request.ingredients.join(", ")}，生成 3 個 JSON 格式的食譜建議。${dietaryInfo}

規則：
1. **風格**：必須是「家常菜」(Home-style)，避免法式精緻料理或過於複雜的創意料理。
2. **食材限制**：盡可能只使用提供的食材。除了常見的基礎調味料（油、鹽、醬油、胡椒、糖、蒜、蔥）外，不可隨意添加其他需要額外購買的主菜或配料。
3. **替代方案**：如果必須使用到某些常用但用戶沒提到的食材（例如雞蛋、洋蔥），請在 description 中標註「建議替代方案」或「若無可省略」。
4. **輸出格式**：必須維持 JSON Array 格式。
格式：[{name, time, difficulty, category, requiredIngredients, description, steps:[{title, description}], matchScore}]`;
    }

    async detectIngredientsFromImage(base64Image: string): Promise<any[]> {
        const data = await this.scheduledRequest((model) => ({
            contents: [{
                parts: [
                    { text: "分析這張照片，列出所有食材及其狀態 (JSON: [{name, category, isSpoiled, confidence}])" },
                    { inline_data: { mime_type: "image/jpeg", data: base64Image } }
                ]
            }],
            generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
        }));

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Vision response empty");

        const results = JSON.parse(text);
        return results.map((r: any) => ({
            id: `ai-vision-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: r.name,
            quantity: 1,
            category: r.category || "其他",
            timestamp: Date.now(),
            confidence: r.confidence || 0.9,
            isSpoiled: r.isSpoiled || false,
            storageType: "fridge"
        }));
    }

    private getPlaceholderImage(category: string): string {
        const images: Record<string, string> = {
            vegetable: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800",
            meat: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800",
            mixed: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800",
            fruit: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?q=80&w=800"
        };
        return images[category] || images.mixed;
    }

    private getLocalFallback(ingredients: string[]): LLMRecipe[] {
        const templates = [
            { name: `${ingredients[0] || "綜合"}風味炒飯`, category: "mixed" as const },
            { name: `家常 ${ingredients[0] || "精選"} 濃湯`, category: "vegetable" as const },
            { name: `活力 ${ingredients[0] || "低碳"} 沙拉`, category: "mixed" as const }
        ];

        return templates.map((t, idx) => ({
            id: `local-${idx}-${Date.now()}`,
            name: t.name,
            image: this.getPlaceholderImage(t.category),
            time: "15 min",
            difficulty: "easy",
            category: t.category,
            requiredIngredients: ingredients,
            description: "本地端智慧匹配生成的食譜方案。",
            matchScore: 90,
            steps: [{ title: "準備", description: "清洗並準備所有食材。" }, { title: "烹飪", description: "依照個人喜好進行烹調。" }]
        }));
    }

    getMaskedApiKeys(): string[] {
        return this.getApiKeys().map(key => {
            if (key.length <= 8) return "****";
            return `${key.slice(0, 4)}...${key.slice(-4)}`;
        });
    }

    getKeyStatusList(): { masked: string; coolingDown: boolean; cooldownRemaining: number }[] {
        return this.getApiKeys().map(key => {
            const coolingDown = this.isKeyCoolingDown(key);
            const cooldownRemaining = coolingDown
                ? Math.ceil((this.keyCooldowns[key] - Date.now()) / 1000)
                : 0;
            const masked = key.length <= 8 ? "****" : `${key.slice(0, 4)}...${key.slice(-4)}`;
            return { masked, coolingDown, cooldownRemaining };
        });
    }

    async testConnection(): Promise<{ status: 'online' | 'offline' | 'no_key', model: string, keyCount: number }> {
        const keys = this.getApiKeys();
        if (keys.length === 0) return { status: 'no_key', model: GEMINI_MODELS[0], keyCount: 0 };

        try {
            await this.scheduledRequest(() => ({
                contents: [{ parts: [{ text: "ping" }] }],
                generationConfig: { maxOutputTokens: 1 }
            }));
            return { status: 'online', model: GEMINI_MODELS[0], keyCount: keys.length };
        } catch (e) {
            return { status: 'offline', model: GEMINI_MODELS[0], keyCount: keys.length };
        }
    }

    getAvailableModels() {
        return GEMINI_MODELS;
    }

    /**
     * 輔助方法：確保資料為陣列格式
     */
    private normalizeArray(data: any): string[] {
        if (Array.isArray(data)) return data.map(String);
        if (typeof data === 'string') return data.split(/[,，\s]+/).filter(Boolean);
        return [];
    }

    private normalizeSteps(steps: any): { title: string; description: string }[] {
        if (Array.isArray(steps)) {
            return steps.map(s => ({
                title: String(s.title || "步驟"),
                description: String(s.description || "")
            }));
        }
        if (typeof steps === 'string') {
            return steps.split('\n').filter(Boolean).map(line => ({
                title: "烹飪步驟",
                description: line.trim()
            }));
        }
        return [{ title: "準備", description: "依照直覺進行烹飪。" }];
    }
}

export const llmService = new LLMService();

