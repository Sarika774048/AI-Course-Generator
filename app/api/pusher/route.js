import { NextResponse } from 'next/server';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  useTLS: true,
});

export async function POST(req) {
  try {
    const data = await req.json();
    const { message, sender, isFile, fileName } = data;

    // Trigger an event on the 'community-channel'
    await pusher.trigger('community-channel', 'new-message', {
      message,
      sender,
      isFile,
      fileName,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error sending message' }, { status: 500 });
  }
}