export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/generate' && request.method === 'POST') {
      try {
        const input = await request.json();
        const apiKey = env.GROQ_API_KEY;

        if (!apiKey) {
          return new Response(JSON.stringify({ error: "Brak klucza API" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }

        const groqPayload = {
          model: input.model || 'llama-3.3-70b-versatile',
          messages: input.messages,
          max_tokens: input.max_tokens || 800,
          temperature: input.temperature ?? 0.75,
        };

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(groqPayload)
        });

        if (!response.ok) {
          const errText = await response.text();
          return new Response(JSON.stringify({ error: `Groq API error: ${response.status}`, detail: errText }), {
            status: response.status,
            headers: { "Content-Type": "application/json" }
          });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" }
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    return env.ASSETS.fetch(request);
  }
};
