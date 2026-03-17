import { llmService } from '../src/app/services/llmService';

async function debugVision() {
    console.log("=== Gemini Vision 診斷啟動 ===");
    
    // 1x1 像素的透明 JPEG Base64 (用於測試)
    const dummyBase64 = "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqGhcSlhYWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/9o-ADAMBAAIRAxEAPwD5/oooor//2Q==";

    try {
        console.log("正在發送測試請求至 Gemini...");
        const results = await llmService.detectIngredientsFromImage(dummyBase64);
        console.log("成功！解析結果：", results);
    } catch (e: any) {
        console.error("失敗！錯誤詳情：");
        console.error("Status:", e.status);
        console.error("Message:", e.message);
    }
}

// 由於 llmService 是由 IngredientProvider 初始化環境變數，這裡需要模擬環境
// 注意：此腳本僅供結構參考，實際會在瀏覽器環境執行
