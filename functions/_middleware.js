export async function onRequest(context) {
  // Only gate preview/dev deployments — skip auth in production
  const url = new URL(context.request.url);
  const isProduction = url.hostname === context.env.PRODUCTION_HOSTNAME;

  if (isProduction) {
    return context.next();
  }

  const DEV_PASSWORD = context.env.DEV_PASSWORD;

  // If no password is configured, allow access (fail open for safety)
  if (!DEV_PASSWORD) {
    return context.next();
  }

  // Check for existing auth cookie
  const cookie = context.request.headers.get('Cookie') || '';
  if (cookie.includes('dev_auth=granted')) {
    return context.next();
  }

  // Check for basic auth header
  const auth = context.request.headers.get('Authorization');
  if (auth) {
    const [scheme, encoded] = auth.split(' ');
    if (scheme === 'Basic') {
      const decoded = atob(encoded);
      const [, password] = decoded.split(':');

      if (password === DEV_PASSWORD) {
        const response = await context.next();
        // Set cookie so the browser doesn't re-prompt on every request
        const newResponse = new Response(response.body, response);
        newResponse.headers.append(
          'Set-Cookie',
          'dev_auth=granted; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400'
        );
        return newResponse;
      }
    }
  }

  // No valid auth — prompt for credentials
  return new Response('Authentication required for dev site', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Dev Site"',
    },
  });
}
