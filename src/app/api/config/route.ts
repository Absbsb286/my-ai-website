import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  // Credentials are read from environment variables (server-side only)
  const emqxWsUrl = process.env.EMQX_WS_URL;
  const turnUsername = process.env.TURN_USERNAME;
  const turnCredential = process.env.TURN_CREDENTIAL;

  if (!emqxWsUrl || !turnUsername || !turnCredential) {
    return NextResponse.json(
      { error: 'Server configuration missing' },
      { status: 500 }
    );
  }

  // Return only safe config - credentials embedded in URL server-side
  const config = {
    appId: 'blobby-jelly-v1',
    relayUrls: [emqxWsUrl],
    rtcConfig: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        {
          urls: [
            'turn:turn.evan-brass.net:3478?transport=udp',
            'turn:turn.evan-brass.net:3478?transport=tcp'
          ],
          username: turnUsername,
          credential: turnCredential
        }
      ]
    }
  };

  return NextResponse.json(config, {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    }
  });
}