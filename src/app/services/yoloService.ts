/**
 * YOLO 辨識引擎服務 (YOLO Inference Service)
 * 
 * 負責 ONNX Runtime 初始化與模型載入。
 * 支援「全域預熱 (Pre-warming)」，讓應用程式啟動時即開始加載大體積權重。
 */

export class YOLOService {
    private session: any = null;
    private isInitializing: boolean = false;
    private isReady: boolean = false;

    // 類別名稱對照表
    public readonly CLASS_NAMES = [
        "apple", "banana", "cabbage", "meat", "orange",
        "rotten apple", "rotten banana", "rotten cabbage",
        "rotten meat", "rotten orange", "rotten spinach", "spinach"
    ];

    /**
     * 預熱模型：在 App 啟動時即刻觸發，不需等待用戶進入 CameraView
     */
    public async prewarm() {
        if (this.isInitializing || this.isReady) return;
        this.isInitializing = true;
        
        console.log("🧠 [YOLO] 核心啟動中 (背景預熱)...");
        try {
            const ort = (window as any).ort;
            if (!ort) {
                console.warn("⚠️ 找不到 ort 引擎，延後初始化");
                this.isInitializing = false;
                return;
            }

            const baseUrl = import.meta.env.BASE_URL || "/";
            ort.env.wasm.wasmPaths = `${baseUrl}wasm/`;
            ort.env.wasm.numThreads = 1;

            const modelUrl = `${baseUrl}best.onnx?v=1.0.1`;
            
            this.session = await ort.InferenceSession.create(modelUrl, {
                executionProviders: ["webgl", "wasm"],
                graphOptimizationLevel: "all"
            });

            this.isReady = true;
            this.isInitializing = false;
            console.log("✅ [YOLO] 核心準備就緒 (全域執行緒已掛載)");
        } catch (e) {
            console.error("❌ [YOLO] 預熱失敗:", e);
            this.isInitializing = false;
        }
    }

    public getSession() {
        return this.session;
    }

    public isLoaded() {
        return this.isReady;
    }
}

export const yoloService = new YOLOService();
