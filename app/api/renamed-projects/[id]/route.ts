import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ success: true, message: 'Dynamic route is working', id: params.id });
}