import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const RATE_LIMIT = {
  window: 60, // 1 minuto
  maxRequests: 60, // 60 requisições por minuto
}

export async function rateLimit(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1'
  const key = `rate-limit:${ip}`
  
  try {
    const current = await redis.incr(key)
    
    if (current === 1) {
      await redis.expire(key, RATE_LIMIT.window)
    }
    
    if (current > RATE_LIMIT.maxRequests) {
      return NextResponse.json(
        { error: 'Limite de requisições excedido' },
        { status: 429 }
      )
    }
    
    return NextResponse.next()
  } catch (error) {
    console.error('Erro no rate limiting:', error)
    return NextResponse.next()
  }
} 