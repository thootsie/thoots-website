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
        // Use the competition matches endpoint filtered to Spurs
        // dateFrom ensures we get recent matches without scanning the full season
        const today = new Date();
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const dateFrom = threeMonthsAgo.toISOString().split('T')[0];

        const res = await fetch(
            `https://api.football-data.org/v4/teams/${SPURS_ID}/matches?status=FINISHED&dateFrom=${dateFrom}&limit=8`,
            { headers: { 'X-Auth-Token': API_KEY } }
        );

        if (!res.ok) {
            const body = await res.text();
            return new Response(JSON.stringify({ error: `Upstream API error: ${res.status}`, detail: body }), {
                status: res.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await res.json();

        // Filter to only PL matches on the client side
        data.matches = data.matches.filter(m => m.competition.code === 'PL');

        return new Response(JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=300'
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
