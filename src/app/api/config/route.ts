import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  // Credentials are read from environment variables (server-side only).
  // TURN bersifat opsional: tanpa TURN, STUN masih bisa dipakai untuk jaringan
  // yang tidak terlalu ketat. Jangan gagalkan seluruh config hanya karena TURN
  // belum diisi — itu membuat client jatuh ke broker publik tanpa TURN.
  const emqxWsUrl = process.env.EMQX_WS_URL;
  const turnUsername = process.env.TURN_USERNAME;
  const turnCredential = process.env.TURN_CREDENTIAL;

  if (!emqxWsUrl) {
    return NextResponse.json(
      { error: 'EMQX_WS_URL is not configured' },
      { status: 500 }
    );
  }

  const iceServers: Array<Record<string, unknown>> = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ];

  if (turnUsername && turnCredential) {
    iceServers.push({
      urls: [
        'turn:turn.evan-brass.net:3478?transport=udp',
        'turn:turn.evan-brass.net:3478?transport=tcp'
      ],
      username: turnUsername,
      credential: turnCredential
    });
  }

  // Return only safe config - credentials embedded in URL server-side
  const config = {
    appId: 'blobby-jelly-v1',
    relayUrls: [emqxWsUrl],
    rtcConfig: { iceServers }
  };

  return NextResponse.json(config, {
    headers: {
      // Lebih pendek dari sebelumnya supaya perubahan kredensial cepat terpakai.
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
    }
  });
}