import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { value: string } }) {
  return NextResponse.json({ success: true, value: params.value });
}