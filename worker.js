
export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        };

        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: corsHeaders
            });
        }

        // SEND MESSAGE
        if (
            url.pathname === "/send-message" &&
            request.method === "POST"
        ) {
            try {
                const body = await request.json();

                console.log("BODY RECEIVED:", body);

                await env.DB.prepare(
                    `INSERT INTO messages 
           (username, message, group_name) 
           VALUES (?, ?, ?)`
                )
                    .bind(
                        body.username,
                        body.message,
                        body.group_name
                    )
                    .run();

                return new Response(
                    JSON.stringify({
                        success: true,
                        saved: body
                    }),
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*"
                        }
                    }
                );
            } catch (error) {
                return new Response(
                    JSON.stringify({
                        error: error.message
                    }),
                    { status: 500 }
                );
            }
        }

        // GET MESSAGES
        if (
            url.pathname === "/get-messages" &&
            request.method === "GET"
        ) {
            try {
                const group = url.searchParams.get("group");

                console.log("Fetching group:", group);

                const { results } = await env.DB.prepare(
                    "SELECT id, username, message, group_name FROM messages WHERE group_name = ? ORDER BY id ASC"
                )
                    .bind(group)
                    .all();

                return new Response(JSON.stringify(results), {
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                });
            } catch (error) {
                return new Response(
                    JSON.stringify({ error: error.message }),
                    { status: 500 }
                );
            }
        }

        if (url.pathname === "/translate-message" && request.method === "POST") {
            const body = await request.json();

            try {
                const res = await fetch(
                    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${body.targetLanguage}&dt=t&q=${encodeURIComponent(body.text)}`
                );

                const data = await res.json();

                const translated = data[0][0][0];

                return new Response(
                    JSON.stringify({
                        translatedText: translated
                    }),
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*"
                        }
                    }
                );

            } catch (error) {
                return new Response(
                    JSON.stringify({
                        translatedText: "Translation unavailable"
                    }),
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Access-Control-Allow-Origin": "*"
                        }
                    }
                );
            }
        }

        if (url.pathname === "/convert" && request.method === "POST") {
            const { text, tone } = await request.json();

            const prompt = `Convert this into ${tone} tone: ${text}`;

            const response = await fetch(
                "https://api-inference.huggingface.co/models/google/flan-t5-base",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${env.HF_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ inputs: prompt }),
                }
            );

            const data = await response.json();

            return new Response(JSON.stringify(data), {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
            });
        }

        return new Response("Not Found", {
            status: 404,
            headers: corsHeaders
        });
    }
};
