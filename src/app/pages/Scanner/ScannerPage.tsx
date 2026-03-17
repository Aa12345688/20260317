import { useNavigate } from "react-router";
import { useIngredients } from "../../services/IngredientContext";
import { useCamera } from "../../hooks/useCamera";
import { CameraView } from "../../components/scanner/CameraView";
import { DetectionSummary } from "../../components/inventory_management/DetectionSummary";

/**
 * 首頁掃描區 (Scanner)
 * 利用 `useCamera` Hook 啟動裝置攝影機。畫面會顯示鏡頭即時影像與辨識框（交由 CameraView 處理）。
 * 在此頁面使用 YOLO 模型針對影像內容進行推論，實現自動添加食材至庫存中。
 */
export function ScannerPage() {
    const navigate = useNavigate();
    const { scannedItems } = useIngredients();
    const { videoRef } = useCamera();

    return (
        <div className="pb-28">
            <div className="flex flex-col items-center justify-center px-6 pt-6 pb-3">
                <CameraView videoRef={videoRef} />

                {/* 顯示掃描到的食材暫存清單 */}

                <p className="text-center text-gray-400 text-xs mt-8 px-10 leading-relaxed uppercase tracking-widest font-medium opacity-60">將鏡頭對準食材<br />AI 將自動辨識並同步庫存</p>
            </div>
        </div>
    );
}

export default ScannerPage;
