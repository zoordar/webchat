/* 
 * ========================================================
 * CONFIG: Set your Cloudflare Worker URL here once deployed.
 * ========================================================
 */
export const API_BASE_URL = "http://127.0.0.1:8787"; // Change to your active Worker Route later

/**
 * Uses Cloudflare Worker to process the Gemini AI translation
 */
export async function translateWithGemini(text, targetLanguage, groupTone, onProgress = null) {
    if (onProgress) onProgress(true);

    try {
        const response = await fetch(`${API_BASE_URL}/translate-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: text,
                targetLanguage: targetLanguage,
                groupTone: groupTone
            })
        });

        if (!response.ok) {
            throw new Error(`Worker API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (onProgress) onProgress(false);
        return data.translated_message || text;

    } catch (error) {
        console.error("Translation error via Worker:", error);
        if (onProgress) onProgress(false);
        return `[AI Error] ${text}`;
    }
}
