import { ClientSecretCredential } from '@azure/identity';

// Module-scope cache: persists across requests on the same warm serverless
// instance, avoiding a fresh Azure AD token request on every image load.
let cachedToken = null;
let cachedTokenExpiresOn = 0;

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiresOn - 60_000) {
    return cachedToken;
  }

  const credential = new ClientSecretCredential(
    process.env.AZURE_TENANT_ID,
    process.env.AZURE_CLIENT_ID,
    process.env.AZURE_CLIENT_SECRET
  );

  const token = await credential.getToken('https://graph.microsoft.com/.default');
  cachedToken = token.token;
  cachedTokenExpiresOn = token.expiresOnTimestamp;
  return cachedToken;
}

// GET /api/imagen/[id] — proxies a OneDrive item's large thumbnail through our
// own domain with a server-side-refreshed Graph token, so the browser never
// sees (or can outlive) a temporary Microsoft-issued URL.
export async function GET(request, { params }) {
  const { id } = params;

  if (!id) {
    return new Response('Missing image id', { status: 400 });
  }

  try {
    const userEmail = process.env.ONEDRIVE_USER_EMAIL;
    const accessToken = await getAccessToken();

    const response = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(userEmail)}/drive/items/${encodeURIComponent(id)}/thumbnails/0/large/content`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      return new Response('Image not found', { status: 404 });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error.message);
    return new Response('Error fetching image', { status: 500 });
  }
}
