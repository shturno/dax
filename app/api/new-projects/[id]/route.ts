import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ success: true, message: 'New dynamic route is working', id: params.id });
}