import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { key: string } }) {
  return NextResponse.json({ success: true, key: params.key });
}