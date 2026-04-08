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
        console.log(body);

        await env.DB.prepare(
          "INSERT INTO messages (username, message) VALUES (?, ?)"
        )
          .bind(body.username, body.message)
          .run();

        return new Response(
          JSON.stringify({
            success: true,
            inserted: body
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
      const { results } = await env.DB.prepare(
        "SELECT * FROM messages ORDER BY id ASC"
      ).all();

      return new Response(
        JSON.stringify(results),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    return new Response("Not Found", {
      status: 404,
      headers: corsHeaders
    });
  }
};
