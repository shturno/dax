import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { param: string } }) {
  return NextResponse.json({ success: true, message: 'Dynamic test route is working', param: params.param });
}