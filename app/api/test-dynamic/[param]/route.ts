import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { param: string } }) {
  return NextResponse.json({ success: true, param: params.param });
}