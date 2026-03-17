/// <reference types="vite/client" />
import { RefObject, useState, useEffect, useRef } from "react";
import { Camera, Loader2, RefreshCw, Sparkles, Brain } from "lucide-react";
import { useIngredients } from "../../services/IngredientContext";
import { llmService } from "../../services/llmService";
import { DetectionSummary } from "../inventory_management/DetectionSummary";
import { notificationService } from "../../services/notificationService";

// 使用 global 宣告來告訴 TypeScript 我們的 ort 在 window 上
declare global {
    interface Window {
        ort: any;
    }
}

interface CameraViewProps {
    videoRef: RefObject<HTMLVideoElement | null>;
}

/**
 * 攝影機掃描視圖 (CameraView - ONNX 離線版)
 */
export function CameraView({ videoRef }: CameraViewProps) {
    const { addItem, tempDetections, clearTempDetections, settings } = useIngredients();
    const [isScanning, setIsScanning] = useState(false);
    const [scanMode, setScanMode] = useState<"local" | "cloud">("local");
    const [currentBoxes, setCurrentBoxes] = useState<any[]>([]);
    const [modelLoaded, setModelLoaded] = useState(false);
    const sessionRef = useRef<any>(null);

    // 類別名稱對照表 (由您的新版 YOLO 權重決定)
    const CLASS_NAMES = [
        "apple", "banana", "cabbage", "meat", "orange",
        "rotten apple", "rotten banana", "rotten cabbage",
        "rotten meat", "rotten orange", "rotten spinach", "spinach"
    ];

    // 初始化：加載 ONNX 模型
    useEffect(() => {
        async function initModel() {
            try {
                // 從 window 取得全域的 ort 引擎
                const ort = window.ort;
                if (!ort) {
                    console.error("❌ 找不到 AI 引擎元件，請確認 index.html 是否正確引入 ort.min.js");
                    return;
                }

                // 設定 ONNX Runtime WASM 零件經由本地伺服器讀取 (PWA 離線支援關鍵)
                // 這裡的路徑必須對應 public/wasm 資料夾
                const baseUrl = import.meta.env.BASE_URL || "/";
                const wasmPath = `${baseUrl}wasm/`;

                ort.env.wasm.wasmPaths = wasmPath;
                ort.env.wasm.numThreads = 1;
                ort.env.wasm.proxy = false;

                // 從環境取得基礎路徑，並加入 Version Hash 避免瀏覽器快取舊權重
                const modelUrl = `${baseUrl}best.onnx?v=1.0.0`;

                // 載入模型 (優先嘗試 WebGL GPU 加速)
                const session = await ort.InferenceSession.create(modelUrl, {
                    executionProviders: ["webgl", "wasm"],
                    graphOptimizationLevel: "all"
                });

                sessionRef.current = session;
                setModelLoaded(true);
                console.log("✅ AI 大腦載入成功 (離線部署模式)！");
            } catch (e) {
                console.error("❌ 模型載入失敗，具體錯誤內容:", e);
                if (e instanceof Error) {
                    console.error("錯誤訊息:", e.message);
                }
            }
        }

        // 偵測網路狀態並自動切換模式
        const handleOffline = () => {
            if (scanMode === "cloud") {
                setScanMode("local");
                notificationService.send("離線模式已啟動", "偵測到離線狀態，已自動切換至本地 YOLO 辨識模式。");
            }
        };
        window.addEventListener('offline', handleOffline);

        initModel();
        return () => window.removeEventListener('offline', handleOffline);
    }, [scanMode]);

    const handleScan = async () => {
        if (scanMode === "local") {
            await handleLocalScan();
        } else {
            await handleGeminiScan();
        }
    };

    const handleLocalScan = async () => {
        if (!videoRef.current || !sessionRef.current) return;
        setIsScanning(true);
        setCurrentBoxes([]);
        clearTempDetections();

        try {
            // ... (existing YOLO logic)
            const canvas = document.createElement("canvas");
            canvas.width = 640;
            canvas.height = 640;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.drawImage(videoRef.current, 0, 0, 640, 640);

            const imgData = ctx.getImageData(0, 0, 640, 640);
            const input = new Float32Array(3 * 640 * 640);
            for (let i = 0; i < 640 * 640; i++) {
                input[i] = imgData.data[i * 4] / 255.0;
                input[i + 640 * 640] = imgData.data[i * 4 + 1] / 255.0;
                input[i + 2 * 640 * 640] = imgData.data[i * 4 + 2] / 255.0;
            }
            const tensor = new window.ort.Tensor("float32", input, [1, 3, 640, 640]);

            const feeds = { [sessionRef.current.inputNames[0]]: tensor };
            const results = await sessionRef.current.run(feeds);
            const outputView = results[sessionRef.current.outputNames[0]];
            const output = outputView.data as Float32Array;
            const dims = outputView.dims;

            const detections: any[] = [];
            const CONF_THRESHOLD = settings.confidenceThreshold;

            const isTransposed = dims[1] > dims[2];
            const numAnchors = isTransposed ? dims[1] : dims[2];
            const numChannels = isTransposed ? dims[2] : dims[1];

            for (let i = 0; i < numAnchors; i++) {
                let maxConf = 0;
                let classId = -1;

                for (let c = 0; c < CLASS_NAMES.length; c++) {
                    const idx = isTransposed ? i * numChannels + (c + 4) : (c + 4) * numAnchors + i;
                    const conf = output[idx];
                    if (conf > maxConf) {
                        maxConf = conf;
                        classId = c;
                    }
                }

                if (maxConf > CONF_THRESHOLD) {
                    const cx = output[isTransposed ? i * numChannels : i];
                    const cy = output[isTransposed ? i * numChannels + 1 : numAnchors + i];
                    const w = output[isTransposed ? i * numChannels + 2 : numAnchors * 2 + i];
                    const h = output[isTransposed ? i * numChannels + 3 : numAnchors * 3 + i];

                    detections.push({
                        name: CLASS_NAMES[classId],
                        confidence: maxConf,
                        box: [(cx - w / 2) / 640, (cy - h / 2) / 640, (cx + w / 2) / 640, (cy + h / 2) / 640],
                        isSpoiled: CLASS_NAMES[classId].toLowerCase().includes("rotten"),
                        category: CLASS_NAMES[classId].includes("apple") || CLASS_NAMES[classId].includes("orange") || CLASS_NAMES[classId].includes("banana") ? "水果" : (CLASS_NAMES[classId].includes("cabbage") || CLASS_NAMES[classId].includes("spinach") ? "蔬菜" : (CLASS_NAMES[classId].includes("meat") ? "肉類" : "其他"))
                    });
                }
            }

            const nmsDetections: any[] = [];
            const sortedDetections = detections.sort((a, b) => b.confidence - a.confidence);
            for (const det of sortedDetections) {
                let keep = true;
                for (const kept of nmsDetections) {
                    const interX1 = Math.max(det.box[0], kept.box[0]);
                    const interY1 = Math.max(det.box[1], kept.box[1]);
                    const interX2 = Math.min(det.box[2], kept.box[2]);
                    const interY2 = Math.min(det.box[3], kept.box[3]);
                    const interArea = Math.max(0, interX2 - interX1) * Math.max(0, interY2 - interY1);
                    const areaA = (det.box[2] - det.box[0]) * (det.box[3] - det.box[1]);
                    const areaB = (kept.box[2] - kept.box[0]) * (kept.box[3] - kept.box[1]);
                    const iou = interArea / (areaA + areaB - interArea);
                    if (iou > 0.5) { keep = false; break; }
                }
                if (keep) {
                    nmsDetections.push(det);
                    if (nmsDetections.length >= 10) break;
                }
            }

            if (nmsDetections.length === 0) {
                notificationService.send("掃描完成", "未偵測到任何食材，請靠近一點或調整角度重試。");
            } else {
                setCurrentBoxes(nmsDetections);
                nmsDetections.forEach(det => addItem(det));
            }
        } catch (error) {
            console.warn("Local Scan Error:", error);
        } finally {
            setIsScanning(false);
        }
    };

    const handleGeminiScan = async () => {
        if (!videoRef.current) return;
        setIsScanning(true);
        setCurrentBoxes([]);
        clearTempDetections();

        try {
            // 擷取目前畫面
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.drawImage(videoRef.current, 0, 0);

            // 轉為 Base64 (JPEG)
            const base64Image = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];

            // 呼叫 Gemini Vision
            const results = await llmService.detectIngredientsFromImage(base64Image);

            if (results.length === 0) {
                notificationService.send("掃描完成", "Gemini 未能在畫面中辨識出顯著食材。");
            } else {
                results.forEach(item => addItem(item, "ai"));
                notificationService.send("掃描完成", `Gemini 成功辨識 ${results.length} 項食材`);
            }
        } catch (error: any) {
            console.error("Gemini Scan Error:", error);
            notificationService.send("掃描失敗", error.message || "無法連線至 Gemini Vision");
        } finally {
            setIsScanning(false);
        }
    };

    const handleClear = () => {
        clearTempDetections();
        setCurrentBoxes([]);
    };

    return (
        <div className="flex flex-col items-center w-full max-w-sm">
            <div className="relative w-full">
                {/* 掃描模式切換器 */}
                <div className="flex bg-[#0f2e24]/60 backdrop-blur-xl rounded-2xl p-1 mb-4 border border-[#00ff88]/20 self-center w-fit mx-auto">
                    <button
                        onClick={() => setScanMode("local")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${scanMode === "local" ? 'bg-[#00ff88] text-[#0f2e24] shadow-[0_0_15px_rgba(0,255,136,0.3)]' : 'text-[#00ff88]/60 hover:text-[#00ff88]'}`}
                    >
                        <Brain size={14} />
                        YOLO 本地辨識
                    </button>
                    <button
                        onClick={() => setScanMode("cloud")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${scanMode === "cloud" ? 'bg-[#00ff88] text-[#0f2e24] shadow-[0_0_15px_rgba(0,255,136,0.3)]' : 'text-[#00ff88]/60 hover:text-[#00ff88]'}`}
                    >
                        <Sparkles size={14} />
                        Gemini 雲端辨識
                    </button>
                </div>

                {/* AI Status Badge */}
                <div className={`absolute top-16 left-1/2 transform -translate-x-1/2 z-20 bg-[#0f2e24]/80 backdrop-blur-md border ${!navigator.onLine && scanMode === "cloud" ? 'border-red-500' : !modelLoaded && scanMode === "local" ? 'border-red-400' : isScanning ? 'border-amber-400' : 'border-[#00ff88]'} rounded-full px-4 py-1.5 flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-colors duration-500`}>
                    <div className={`w-2 h-2 rounded-full ${!navigator.onLine && scanMode === "cloud" ? 'bg-red-500 animate-pulse' : !modelLoaded && scanMode === "local" ? 'bg-red-400' : isScanning ? 'bg-amber-400 animate-pulse' : 'bg-[#00ff88]'} shadow-[0_0_8px_currentColor]`} />
                    <span className={`text-[10px] font-black tracking-widest ${!navigator.onLine && scanMode === "cloud" ? 'text-red-500' : !modelLoaded && scanMode === "local" ? 'text-red-400' : isScanning ? 'text-amber-400' : 'text-[#00ff88]'} uppercase`}>
                        {!navigator.onLine && scanMode === "cloud" ? "偵測到離線：無法使用雲端 AI" : scanMode === "cloud" ? (isScanning ? "Cloud AI 串接中..." : "Gemini 視覺系統已就緒") : (!modelLoaded ? "系統核心啟動中..." : isScanning ? "正在為您辨識..." : "掃描系統已就緒")}
                    </span>
                </div>

                {/* Camera View */}
                <div className="relative aspect-[3/4] bg-[#1a4d3d] rounded-[2.5rem] overflow-hidden border-4 border-[#1a4d3d] shadow-2xl">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Bounding Box Overlay */}
                    <div className="absolute inset-0 z-10 pointer-events-none">
                        {currentBoxes.map((boxData, idx) => boxData.box && (
                            <div
                                key={`box-${idx}`}
                                className="absolute"
                                style={{
                                    left: `${boxData.box[0] * 100}%`,
                                    top: `${boxData.box[1] * 100}%`,
                                    width: `${(boxData.box[2] - boxData.box[0]) * 100}%`,
                                    height: `${(boxData.box[3] - boxData.box[1]) * 100}%`,
                                    borderColor: boxData.isSpoiled ? '#ff4d4d' : '#00ff88',
                                    borderWidth: '2px',
                                    borderStyle: 'solid',
                                    borderRadius: '8px'
                                }}
                            >
                                <div className={`absolute -top-6 left-0 px-2 py-0.5 rounded-t-md text-[8px] font-black uppercase whitespace-nowrap ${boxData.isSpoiled ? 'bg-red-500 text-white' : 'bg-[#00ff88] text-[#0f2e24]'}`}>
                                    {boxData.isSpoiled ? 'BAD' : 'GOOD'} | {boxData.name} | {Math.round((boxData.confidence || 0) * 100)}%
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-b from-[#0f2e24]/40 to-transparent pointer-events-none" />

                    {isScanning && (
                        <div className="absolute inset-0 bg-[#00ff88]/5 flex flex-col items-center justify-center">
                            <div className="w-full h-[2px] bg-amber-400 shadow-[0_0_15px_#fbbf24] absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
                        </div>
                    )}
                </div>
            </div>

            {tempDetections.length > 0 && (
                <div className="w-full flex justify-end px-2 mb-2 mt-4">
                    <button
                        onClick={handleClear}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all text-[10px] font-black tracking-widest uppercase"
                    >
                        <RefreshCw size={12} />
                        重新整理畫面
                    </button>
                </div>
            )}

            <DetectionSummary readOnly={true} />

            <div className="w-full mt-8 space-y-3 px-2">
                <button
                    onClick={handleScan}
                    disabled={isScanning || (scanMode === "local" && !modelLoaded)}
                    className="w-full bg-[#00ff88] text-[#0f2e24] py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-[#00dd77] transition-all active:scale-[0.98] shadow-[0_8px_20px_rgba(0,255,136,0.3)] disabled:opacity-50"
                >
                    {isScanning ? <Loader2 size={24} className="animate-spin" /> : scanMode === "cloud" ? <Sparkles size={24} strokeWidth={3} /> : <Camera size={24} strokeWidth={3} />}
                    {isScanning ? "正在為您分析清單..." : scanMode === "cloud" ? "使用 Gemini 深度辨識" : "開始掃描並識別"}
                </button>
            </div>
        </div>
    );
}
