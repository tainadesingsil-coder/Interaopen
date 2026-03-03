export async function onRequestPost({ request, env }) {
  try {
    const { messages } = await request.json().catch(() => ({ messages: [] }));
    const system = {
      role: "system",
      content:
        "Você é Bel, uma guia local de turismo de Belmonte (BA). Seja acolhedora, objetiva e prática. Sugira praias, cultura, gastronomia, hospedagem e comércio local. Use um tom tropical e amigável.",
    };

    const OPENAI_API_KEY = env.OPENAI_API_KEY || env.OPENAI_API_TOKEN || env.OPENAI_KEY;
    if (!OPENAI_API_KEY) {
      // Fallback de demonstração quando a chave não está configurada
      const lastUser = (messages || []).slice().reverse().find(m => m.role === 'user');
      const prompt = lastUser?.content || 'Olá Bel!';
      const demo = `Sugestão da Bel (demo): Para começar, visite o Centro Histórico e a Praia do Mogiquiçaba. Depois, prove moqueca local no jantar. Você disse: "${prompt}"`;
      return new Response(JSON.stringify({ reply: demo }), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }

    const body = {
      model: 'gpt-4o-mini',
      messages: [system, ...(messages || [])].slice(-24),
      temperature: 0.7,
    };
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      return new Response(JSON.stringify({ error: 'upstream_error', detail: txt }), { status: 500 });
    }
    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Sem resposta no momento.';
    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'internal_error', detail: String(e) }), { status: 500 });
  }
}

