/**
 * 觸覺回饋服務 (Haptic Feedback Service)
 * 
 * 封裝 Web Vibration API，為精英級用戶體驗提供物理回饋。
 */
export const hapticService = {
    /**
     * 輕微震動：用於物體偵測成功、切換 Tab
     */
    light: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10);
        }
    },

    /**
     * 中等震動：用於確認行為、新增食材成功
     */
    medium: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(25);
        }
    },

    /**
     * 強烈震動/雙震：用於警告、過期提示、掃描失敗
     */
    impact: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([30, 50, 30]);
        }
    },

    /**
     * 食譜合成震動：特殊的呼吸感震動模式
     */
    synthesize: () => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([10, 30, 10, 50, 10]);
        }
    }
};
