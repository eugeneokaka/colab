// // app/api/stream/token/route.ts
import { NextResponse } from 'next/server';
import { StreamVideoServerClient } from '@stream-io/video-node';

const apiKey = process.env.STREAM_API_KEY!;
const apiSecret = process.env.STREAM_API_SECRET!;

const serverClient = new StreamVideoServerClient({ apiKey, secret: apiSecret });

export async function GET(req: Request) {
  const userId = 'get_this_from_supabase_auth'; // Auth middleware or query param
  const token = serverClient.createToken(userId);
  return NextResponse.json({ token });
}
