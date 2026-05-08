export async function onRequest(context) {
    const API_KEY = context.env.FOOTBALL_API_KEY;

    if (!API_KEY) {
        return new Response(JSON.stringify({ error: 'API key not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const res = await fetch('https://api.football-data.org/v4/competitions/PL/standings', {
            headers: { 'X-Auth-Token': API_KEY }
        });

        if (!res.ok) {
            return new Response(JSON.stringify({ error: `Upstream API error: ${res.status}` }), {
                status: res.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await res.json();

        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
