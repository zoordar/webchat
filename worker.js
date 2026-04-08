/**
 * Cloudflare Worker Backend for Chatterbox AI
 * Handles Cloudflare D1 SQL operations and secure Gemini API translations.
 */

const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // IN PRODUCTION: Restrict to your Cloudflare Pages URL
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export default {
    async fetch(request, env, ctx) {
        // Handle CORS Preflight Requests
        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);

        try {
            // ROUTE 1: Load Messages from Cloudflare D1
            if (url.pathname === "/get-messages" && request.method === "GET") {
                const group = url.searchParams.get("group") || "friends";

                // Query D1
                const { results } = await env.DB.prepare(
                    "SELECT * FROM messages WHERE group_name = ? ORDER BY created_at ASC LIMIT 150"
                ).bind(group).all();

                return new Response(JSON.stringify(results), {
                    headers: { "Content-Type": "application/json", ...corsHeaders }
                });
            }

            // ROUTE 2: Insert Message into Cloudflare D1
            if (url.pathname === "/send-message" && request.method === "POST") {
                const data = await request.json();

                await env.DB.prepare(
                    `INSERT INTO messages (username, group_name, message, translated_message, language, tone)
                     VALUES (?, ?, ?, ?, ?, ?)`
                ).bind(
                    data.username || "Unknown",
                    data.group_name || "friends",
                    data.message || "",
                    data.translated_message || data.message, // Fallback if no translation
                    data.language || 'en',
                    data.tone || 'Casual Tone'
                ).run();

                return new Response(JSON.stringify({ success: true }), {
                    headers: { "Content-Type": "application/json", ...corsHeaders }
                });
            }

            // ROUTE 3: Secure Server-Side Gemini API Translation
            if (url.pathname === "/translate-message" && request.method === "POST") {
                const data = await request.json();
                const { message, targetLanguage, groupTone } = data;

                const prompt = `
                You are an AI assistant in a multilingual chat application. 
                Your task is to translate and carefully adjust the tone of the user's message.
                
                Target Language Code: ${targetLanguage}
                Tone Context: ${groupTone}
                
                Original Message: "${message}"
                
                CRITICAL RULE: Return ONLY the final translated string. Do not include any JSON formatting, markdown backticks, explanations, or quotes.`;

                const aiKey = env.GEMINI_API_KEY; // Pulled from Cloudflare Secrets

                if (!aiKey || aiKey.includes("REPLACE")) {
                    console.warn("Missing Gemini API Key. Returning original text.");
                    return new Response(JSON.stringify({ translated_message: message }), {
                        headers: { "Content-Type": "application/json", ...corsHeaders }
                    });
                }

                const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${aiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.3, maxOutputTokens: 256 }
                    })
                });

                if (!apiRes.ok) {
                    throw new Error(`Google API Failure: ${apiRes.status}`);
                }

                const geminiData = await apiRes.json();
                const translatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text.trim();

                return new Response(JSON.stringify({ translated_message: translatedText || message }), {
                    headers: { "Content-Type": "application/json", ...corsHeaders }
                });
            }

            return new Response("Not Found", { status: 404, headers: corsHeaders });

        } catch (error) {
            console.error("Worker Execution Error:", error);
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { "Content-Type": "application/json", ...corsHeaders }
            });
        }
    }
};
