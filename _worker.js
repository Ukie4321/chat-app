export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Endpoint untuk Mengambil Pesan (GET)
    if (url.pathname === '/api/messages' && request.method === 'GET') {
      try {
        const { results } = await env.DB.prepare(
          "SELECT * FROM messages ORDER BY created_at ASC LIMIT 100"
        ).all();
        
        return new Response(JSON.stringify(results || []), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // 2. Endpoint untuk Mengirim Pesan (POST)
    if (url.pathname === '/api/messages' && request.method === 'POST') {
      try {
        const body = await request.json();
        const id = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        await env.DB.prepare(
          "INSERT INTO messages (id, sender_id, content, media_url, created_at) VALUES (?, ?, ?, ?, ?)"
        ).bind(
          id, 
          body.sender_id, 
          body.content, 
          body.media_url || null,
          createdAt
        ).run();

        return new Response(JSON.stringify({ success: true, id }), {
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // Melayani file statis (index.html) untuk request biasa
    return env.ASSETS.fetch(request);
  }
};
