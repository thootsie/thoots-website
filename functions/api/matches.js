export async function onRequest(context) {
    const API_KEY = context.env.FOOTBALL_API_KEY;

    if (!API_KEY) {
        return new Response(JSON.stringify({ error: 'API key not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const SPURS_ID = 73;

    try {
        // Use competition matches endpoint with date range — faster than /teams endpoint
        const today = new Date();
        const sixWeeksAgo = new Date(today);
        sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);
        const dateFrom = sixWeeksAgo.toISOString().split('T')[0];
        const dateTo = today.toISOString().split('T')[0];

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(
            `https://api.football-data.org/v4/competitions/PL/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=FINISHED`,
            {
                headers: { 'X-Auth-Token': API_KEY },
                signal: controller.signal
            }
        );

        clearTimeout(timeout);

        if (!res.ok) {
            const body = await res.text();
            return new Response(JSON.stringify({ error: `Upstream API error: ${res.status}`, detail: body }), {
                status: res.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await res.json();

        // Filter to only Spurs matches and take the last 8
        data.matches = data.matches
            .filter(m => m.homeTeam.id === SPURS_ID || m.awayTeam.id === SPURS_ID)
            .slice(-8);

        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300'
            }
        });
    } catch (err) {
        if (err.name === 'AbortError') {
            return new Response(JSON.stringify({ error: 'Request to football API timed out' }), {
                status: 504,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
