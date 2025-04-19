import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI!

async function getDb() {
  const client = new MongoClient(uri)
  await client.connect()
  return client.db("saas-dashboard")
}

export async function GET() {
  const db = await getDb()
  const templates = await db.collection("templates").find().toArray()
  return NextResponse.json(templates)
}