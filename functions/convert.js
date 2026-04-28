export async function onRequestPost(context) {
    try {
        const { text, tone } = await context.request.json();

        const prompt = `Rewrite this in ${tone} tone: ${text}`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${context.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "user", content: prompt }
                ],
            }),
        });

        const data = await response.json();

        console.log("FULL GROQ RESPONSE:", data);

        if (!response.ok) {
            return new Response(JSON.stringify({ error: data.error?.message || "API failed" }), {
                status: 500,
            });
        }

        const result = data.choices?.[0]?.message?.content;

        if (!result) {
            return new Response(JSON.stringify({ error: "No result from API" }), {
                status: 500,
            });
        }

        return new Response(JSON.stringify({ result }), {
            headers: { "Content-Type": "application/json" },
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
        });
    }
}
