import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ success: true, id: params.id });
}